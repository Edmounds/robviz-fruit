"""Project settings and the shared private-network request boundary."""

import ipaddress
import os
from pathlib import Path
from urllib.parse import urlparse

import yaml


class SettingsLoader(yaml.SafeLoader):
    def compose_node(self, parent, index):
        if self.check_event(yaml.AliasEvent):
            raise ValueError("Settings aliases are not allowed")
        return super().compose_node(parent, index)

    def construct_mapping(self, node, deep=False):
        result = {}
        for key, value in node.value:
            name = self.construct_object(key, deep=deep)
            if not isinstance(name, str) or name in result:
                raise ValueError("Settings keys must be unique strings")
            result[name] = self.construct_object(value, deep=deep)
        return result


def private_address(value):
    try:
        ip = ipaddress.ip_address(value.strip("[]").split("%")[0])
        ip = getattr(ip, "ipv4_mapped", None) or ip
        if ip.is_loopback or ip.is_link_local:
            return True
        networks = ("10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16") if ip.version == 4 else ("fc00::/7",)
        return any(ip in ipaddress.ip_network(network) for network in networks)
    except ValueError:
        return False


def loopback_address(value):
    try:
        ip = ipaddress.ip_address(value.strip("[]"))
        return (getattr(ip, "ipv4_mapped", None) or ip).is_loopback
    except ValueError:
        return False


def allowed_request(peer, host, origin, allow_lan, page_ports=(), allowed_hosts=(), allowed_origins=()):
    if not loopback_address(peer) and not (allow_lan and private_address(peer)):
        return False
    try:
        target = urlparse(f"http://{host}")
        if target.netloc != host or target.path:
            return False
        hostname = target.hostname or ""
        if target.username or target.password or not (hostname == "localhost" or private_address(hostname) or hostname.endswith(".local") or host in allowed_hosts or hostname in allowed_hosts):
            return False
        if not origin:
            return True
        parsed = urlparse(origin)
        if parsed.username or parsed.password or parsed.scheme not in ("http", "https") or origin != f"{parsed.scheme}://{parsed.netloc}":
            return False
        return (parsed.netloc == host or origin in allowed_origins or
                (parsed.hostname == hostname and (parsed.port or (443 if parsed.scheme == "https" else 80)) in page_ports))
    except ValueError:
        return False


def load_project_settings(file=None):
    path = Path(file or os.environ.get("ROBVIZ_SETTINGS_FILE") or Path(__file__).resolve().parents[3] / "setting.yaml").absolute()
    if path.is_symlink() or not path.is_file() or path.stat().st_size > 65536:
        raise ValueError("Set ROBVIZ_SETTINGS_FILE to a regular setting.yaml file (at most 64 KiB)")
    value = yaml.load(path.read_text(), Loader=SettingsLoader)
    if not isinstance(value, dict) or type(value.get("version")) is not int or value["version"] != 1:
        raise ValueError("Invalid project settings version")
    for section in ("network", "web", "plugins", "services"):
        if not isinstance(value.get(section), dict):
            raise ValueError(f"Missing settings section: {section}")

    def overrides(mapping, prefix="ROBVIZ"):
        for key, item in mapping.items():
            name = f"{prefix}_{key.upper()}"
            if isinstance(item, list):
                if name in os.environ:
                    import json
                    mapping[key] = json.loads(os.environ[name])
            elif isinstance(item, dict):
                overrides(item, name)
            elif name in os.environ:
                raw = os.environ[name]
                if isinstance(item, bool):
                    if raw not in ("true", "false", "0", "1"):
                        raise ValueError(f"Invalid {name}")
                    mapping[key] = raw in ("true", "1")
                elif isinstance(item, (int, float)):
                    mapping[key] = float(raw) if isinstance(item, float) else int(raw)
                else:
                    mapping[key] = raw
    overrides(value)
    for key in ("host", "port"):
        if f"ROBVIZ_{key.upper()}" in os.environ:
            raw = os.environ[f"ROBVIZ_{key.upper()}"]
            value["web"][key] = int(raw) if key == "port" else raw
    if "ROBVIZ_ALLOW_LAN" in os.environ:
        raw = os.environ["ROBVIZ_ALLOW_LAN"]
        if raw not in ("true", "false", "0", "1"):
            raise ValueError("Invalid ROBVIZ_ALLOW_LAN")
        value["network"]["allow_lan"] = raw in ("true", "1")
    if type(value["network"].get("allow_lan")) is not bool:
        raise ValueError("network.allow_lan must be boolean")
    for key in ("allowed_hosts", "allowed_origins"):
        items = value["network"].get(key)
        if not isinstance(items, list) or len(items) > 64 or any(not isinstance(item, str) or not item or "*" in item for item in items):
            raise ValueError(f"Invalid network.{key}")
    for name in ("files", "video", "terminal"):
        config = value["services"].get(name)
        if not isinstance(config, dict) or type(config.get("port")) is not int or not 1 <= config["port"] <= 65535:
            raise ValueError(f"Invalid {name} port")
        if not isinstance(config.get("host"), str) or type(config.get("enabled")) is not bool:
            raise ValueError(f"Invalid {name} settings")
    for section, key in (("files", "allow_lan_writes"), ("video", "allow_lan_capture"),
                         ("video", "prefer_hardware"), ("terminal", "allow_lan")):
        if type(value["services"][section].get(key)) is not bool:
            raise ValueError(f"{section}.{key} must be boolean")
    for key in ("port", "preview_port"):
        if type(value["web"].get(key)) is not int or not 1 <= value["web"][key] <= 65535:
            raise ValueError(f"Invalid web.{key}")
    video = value["services"]["video"]
    for key in ("min_bitrate_kbps", "start_bitrate_kbps", "max_bitrate_kbps", "default_target_fps"):
        if type(video.get(key)) not in (int, float) or not 0 < video[key] <= (60 if key == "default_target_fps" else 1000000):
            raise ValueError(f"Invalid video.{key}")
        if key != "default_target_fps" and type(video[key]) is not int:
            raise ValueError(f"video.{key} must be an integer")
    if not video["min_bitrate_kbps"] <= video["start_bitrate_kbps"] <= video["max_bitrate_kbps"]:
        raise ValueError("Require min <= start <= max bitrate")
    for section, key in (("files", "data_dir"), ("video", "capture_output_dir")):
        item = value["services"][section].get(key)
        if not isinstance(item, str) or not item or any(ord(c) < 32 for c in item):
            raise ValueError(f"Invalid {section}.{key}")
        value["services"][section][key] = os.path.abspath(path.parent / item)
    return value
