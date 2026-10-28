"""Load/unload the installed component with an active synthetic Image subscription."""
import asyncio
from pathlib import Path
import signal
import socket
import subprocess
import tempfile
import unittest

import aiohttp
import rclpy
from rclpy.parameter import Parameter
from rclpy.qos import qos_profile_sensor_data
from composition_interfaces.srv import LoadNode, UnloadNode
from sensor_msgs.msg import Image


class TestComponentLifecycle(unittest.IsolatedAsyncioTestCase):
    async def test_load_unload_releases_port_and_subscriptions(self):
        rclpy.init()
        node = rclpy.create_node("robviz_component_test")
        publisher = node.create_publisher(Image, "/robviz_test/lifecycle", qos_profile_sensor_data)
        prefix = subprocess.check_output(["ros2", "pkg", "prefix", "rclcpp_components"], text=True).strip()
        with tempfile.TemporaryDirectory() as temporary:
            with (Path(temporary) / "container.log").open("w+") as output:
                container = subprocess.Popen([
                    str(Path(prefix) / "lib/rclcpp_components/component_container_mt"),
                    "--ros-args", "-r", "__node:=robviz_test_container",
                ], stdout=output, stderr=subprocess.STDOUT)
                try:
                    load = node.create_client(LoadNode, "/robviz_test_container/_container/load_node")
                    unload = node.create_client(UnloadNode, "/robviz_test_container/_container/unload_node")
                    self.assertTrue(load.wait_for_service(timeout_sec=5))
                    async with aiohttp.ClientSession() as client:
                        for cycle in range(3):
                            with socket.socket() as probe:
                                probe.bind(("127.0.0.1", 0)); port = probe.getsockname()[1]
                            request = LoadNode.Request()
                            request.package_name = "robviz_video_gateway"
                            request.plugin_name = "robviz_video_gateway::VideoGateway"
                            request.node_name = f"robviz_test_video_{cycle}"
                            request.parameters = [Parameter(name, value=value).to_parameter_msg() for name, value in (
                                ("host", "127.0.0.1"), ("port", port), ("encoder", "x264"))]
                            request.extra_arguments = [Parameter("use_intra_process_comms", value=True).to_parameter_msg()]
                            future = load.call_async(request)
                            rclpy.spin_until_future_complete(node, future, timeout_sec=5)
                            self.assertTrue(future.done())
                            result = future.result()
                            self.assertTrue(result.success, result.error_message)
                            url = f"http://127.0.0.1:{port}"
                            async with client.ws_connect(url + "/ws", headers={"Origin": url}) as ws:
                                await ws.send_json({"type": "watch", "topic": "/robviz_test/lifecycle"})
                                image = Image(width=64, height=64, step=192, encoding="rgb8", data=bytes([255, 0, 0]) * 4096)
                                for _ in range(15):
                                    publisher.publish(image)
                                    rclpy.spin_once(node, timeout_sec=0)
                                    await asyncio.sleep(.03)
                                future = unload.call_async(UnloadNode.Request(unique_id=result.unique_id))
                                rclpy.spin_until_future_complete(node, future, timeout_sec=5)
                                self.assertTrue(future.done())
                                self.assertTrue(future.result().success, future.result().error_message)
                            with socket.socket() as probe:
                                probe.bind(("127.0.0.1", port))
                        self.assertIsNone(container.poll())
                finally:
                    container.send_signal(signal.SIGINT)
                    try:
                        container.wait(timeout=5)
                    except subprocess.TimeoutExpired:
                        container.kill(); container.wait()
                    output.seek(0); logs = output.read(); print(logs)
                    node.destroy_node(); rclpy.shutdown()
                    self.assertEqual(container.returncode, 0, logs)
                    self.assertNotIn("CRITICAL", logs)


if __name__ == "__main__":
    unittest.main()
