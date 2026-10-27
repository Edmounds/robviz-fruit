"""Private-network and settings-file protocol checks. No ROS or hardware."""
import tempfile
import http.client
import socket
import threading
import unittest
from pathlib import Path

from robviz_web_server.project_settings import allowed_request, load_project_settings, private_address
from robviz_web_server.web_server_node import create_server


class ProjectSettingsProtocolTest(unittest.TestCase):
    def test_ipv6_file_service_protocol(self):
        with tempfile.TemporaryDirectory() as directory:
            try:
                with socket.socket(socket.AF_INET6) as probe:
                    probe.bind(("::1", 0))
            except OSError as error:
                self.skipTest(f"IPv6 loopback unavailable: {error}")
            server = create_server("::1", 0, directory)
            thread = threading.Thread(target=server.serve_forever, daemon=True)
            thread.start()
            connection = http.client.HTTPConnection("::1", server.server_port, timeout=3)
            try:
                connection.request("GET", "/api/image-settings")
                response = connection.getresponse()
                self.assertEqual(response.status, 200)
                response.read()
            finally:
                connection.close()
                server.shutdown()
                server.server_close()
                thread.join(timeout=3)

    def test_private_peers_and_origins(self):
        for address in ("192.168.1.2", "127.0.0.2", "::ffff:10.0.0.1", "fd00::1", "fe90::1"):
            self.assertTrue(private_address(address), address)
        for address in ("8.8.8.8", "192.0.2.1", "198.18.0.1", "2001:4860::1"):
            self.assertFalse(private_address(address), address)
        self.assertTrue(allowed_request("192.168.1.5", "192.168.1.2:8787", "http://192.168.1.2:5173", True, (5173,)))
        self.assertFalse(allowed_request("8.8.8.8", "192.168.1.2:8787", "http://192.168.1.2:5173", True, (5173,)))
        self.assertFalse(allowed_request("192.168.1.5", "192.168.1.2:8787", "http://192.168.1.3:5173", True, (5173,)))
        self.assertFalse(allowed_request("192.168.1.5", "192.168.1.2:8787", None, False))

    def test_paths_are_relative_to_the_settings_file(self):
        source = Path(__file__).resolve().parents[3] / "setting.yaml"
        with tempfile.TemporaryDirectory() as directory:
            config = Path(directory) / "setting.yaml"
            config.write_text(source.read_text())
            settings = load_project_settings(config)
            self.assertEqual(settings["services"]["video"]["capture_output_dir"], str(Path(directory) / "data/captures"))
            config.write_text("version: 1\nversion: 1\n")
            with self.assertRaises(ValueError):
                load_project_settings(config)


if __name__ == "__main__":
    unittest.main()
