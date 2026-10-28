"""Native gateway protocol check using a synthetic intra-process camera graph."""
import asyncio
import json
import os
from pathlib import Path
import signal
import socket
import subprocess
import tempfile
import time
import unittest

import aiohttp
import cv2
import rclpy
from std_srvs.srv import Trigger
from robviz_web_server.image_settings import ImageSettingsStore


class TestCaptureProtocol(unittest.IsolatedAsyncioTestCase):
    async def test_native_capture_settings_and_network_boundary(self):
        executable = os.environ.get("ROBVIZ_SYNTHETIC_CAMERA")
        if not executable:
            self.fail("Build with BUILD_TESTING=ON and set ROBVIZ_SYNTHETIC_CAMERA to synthetic_camera_graph")
        rclpy.init()
        node = rclpy.create_node("robviz_protocol_test")
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            store = ImageSettingsStore(root / "image-settings.json")
            settings = store.snapshot()
            settings["rgb"]["max_fps"] = 30
            settings, _ = store.update(settings, True)
            with socket.socket() as probe:
                probe.bind(("127.0.0.1", 0))
                port = probe.getsockname()[1]
            origin = f"http://127.0.0.1:{port}"
            output = (root / "gateway.log").open("w+")
            process = subprocess.Popen([
                executable, "--ros-args", "-p", "host:=127.0.0.1", "-p", f"port:={port}",
                "-p", f"encoder:={os.environ.get('ROBVIZ_TEST_ENCODER', 'auto')}", "-p", "capture_topic:=/robviz_test/color",
                "-p", f"capture_output_dir:={root / 'captures'}",
                "-p", f"settings_file:={root / 'image-settings.json'}",
            ], stdout=output, stderr=subprocess.STDOUT)
            try:
                async with aiohttp.ClientSession() as client:
                    deadline = time.monotonic() + 10
                    while True:
                        if process.poll() is not None:
                            output.seek(0)
                            self.fail(output.read())
                        try:
                            async with client.get(origin, timeout=aiohttp.ClientTimeout(total=1)) as response:
                                self.assertEqual(response.status, 200)
                                encoder = (await response.json())["encoder"]
                                self.assertTrue(encoder["actual"])
                                if os.environ.get("ROBVIZ_EXPECT_ENCODER"):
                                    self.assertEqual(encoder["actual"], os.environ["ROBVIZ_EXPECT_ENCODER"])
                                print("Native encoder probe:", json.dumps(encoder))
                                break
                        except aiohttp.ClientConnectionError:
                            if time.monotonic() >= deadline:
                                raise
                            await asyncio.sleep(.1)
                    for invalid in ("https://untrusted.example", origin + "/path", origin + "/", "null"):
                        with self.assertRaises(aiohttp.WSServerHandshakeError):
                            await client.ws_connect(origin + "/ws", headers={"Origin": invalid})
                    async with client.get(origin, headers={"Host": "evil.example"}) as response:
                        self.assertEqual(response.status, 403)
                    async with client.ws_connect(origin + "/ws", headers={"Origin": origin}) as ws:
                        async def command(value):
                            await ws.send_json(value)
                            return await ws.receive_json(timeout=5)
                        meta = await command({"type": "getMeta"})
                        self.assertIn("/robviz_test/color", meta["streams"])
                        self.assertIn("/robviz_test/depth", meta["streams"])
                        for attempt in range(40):
                            info = await command({"type": "getCaptureInfo", "requestId": str(attempt)})
                            if info.get("hasFrame"):
                                break
                            await asyncio.sleep(.05)
                        self.assertTrue(info.get("hasFrame"), info)
                        result = await command({"type": "captureFrame", "requestId": "save"})
                        self.assertTrue(result["success"], result)
                        pixels = cv2.imread(result["filePath"])
                        self.assertEqual(pixels.shape, (720, 1280, 3))
                        self.assertTrue((pixels[:, :, 2] == 255).all())
                        self.assertEqual(Path(result["filePath"]).read_bytes()[:8], b"\x89PNG\r\n\x1a\n")
                        bad = await command({"type": "setCaptureTopic", "requestId": "bad", "topic": "/absent"})
                        self.assertFalse(bad["success"])
                        await command({"type": "setCaptureTopic", "requestId": "depth", "topic": "/robviz_test/depth"})
                        depth = await command({"type": "captureFrame", "requestId": "depth-save"})
                        self.assertFalse(depth["success"])
                        await ws.send_json({"type": "unwatchCapture"})
                    # Capture write must require Origin even when a loopback client may read metadata.
                    async with client.ws_connect(origin + "/ws") as ws:
                        await ws.send_json({"type": "captureFrame", "requestId": "no-origin"})
                        self.assertFalse((await ws.receive_json(timeout=5))["success"])
                    reload = node.create_client(Trigger, "/robviz/reload_image_settings")
                    self.assertTrue(reload.wait_for_service(timeout_sec=3))
                    updated, _ = store.update(store.snapshot(), True)
                    future = reload.call_async(Trigger.Request())
                    rclpy.spin_until_future_complete(node, future, timeout_sec=5)
                    self.assertTrue(future.done())
                    self.assertTrue(future.result().success, future.result().message)
                    self.assertEqual(json.loads(future.result().message), {"version": updated["version"], "session": updated["session"]})
                    # Browser check decodes real WebRTC frames, pauses this synthetic source, then resumes it.
                    if os.environ.get("ROBVIZ_PLAYWRIGHT_MODULE"):
                        env = {**os.environ, "ROBVIZ_TEST_URL": origin, "ROBVIZ_GRAPH_PID": str(process.pid),
                               "ROBVIZ_CLOCK_TICKS": str(os.sysconf("SC_CLK_TCK"))}
                        browser = await asyncio.create_subprocess_exec("node", str(Path(__file__).with_name("browser_stream.mjs")), env=env)
                        self.assertEqual(await browser.wait(), 0)
            finally:
                process.send_signal(signal.SIGINT)
                try:
                    process.wait(timeout=8)
                except subprocess.TimeoutExpired:
                    process.kill()
                    process.wait()
                output.seek(0)
                logs = output.read()
                print(logs)
                output.close()
                node.destroy_node()
                rclpy.shutdown()
                self.assertEqual(process.returncode, 0, logs)
                self.assertNotIn("CRITICAL", logs)
                self.assertNotIn("GLib-GObject-WARNING", logs)


if __name__ == "__main__":
    unittest.main()
