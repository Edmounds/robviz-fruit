import { Button as e, Field as t, ImageViewer as n, Notice as r, NumberInput as i, TextInput as a, Toolbar as o, validateInputs as s } from "@robviz/core";
import { useCallback as c, useEffect as l, useRef as u, useState as d } from "react";
import { jsx as f, jsxs as p } from "react/jsx-runtime";
//#region plugins/image/settingsApi.ts
async function m(e, t = "GET", n) {
	let r = await fetch(e, {
		method: t,
		signal: AbortSignal.timeout(1e4),
		headers: n ? { "Content-Type": "application/json" } : {},
		body: n ? JSON.stringify(n) : void 0
	}), i = await r.json();
	if (!r.ok) throw Error(i.error || `HTTP ${r.status}`);
	return i;
}
function h() {
	return m("/api/image-settings");
}
function g(e) {
	return m("/api/image-settings", "PUT", e);
}
function _(e) {
	return m("/api/image-settings/defaults", "POST", e);
}
//#endregion
//#region plugins/image/ImageSettings.tsx
function v({ ctx: n }) {
	let m = n.locale === "en", v = n.pluginStates.image, y = typeof v?.reloadService == "string" ? v.reloadService : "/robviz/reload_image_settings", [b, x] = d(), [S, C] = d(!1), [w, T] = d(""), [E, D] = d(), [O, k] = d(""), [A, j] = d([]), M = n.mediaUrl || n.getServiceUrl("video"), N = u(null);
	l(() => {
		let e = !1;
		return h().then((t) => {
			e || x(t.settings);
		}).catch((t) => {
			e || T(String(t));
		}), () => {
			e = !0;
		};
	}, []), l(() => {
		let e;
		try {
			let t = new URL(M);
			t.protocol = ["https:", "wss:"].includes(t.protocol) ? "wss:" : "ws:", (!t.pathname || t.pathname === "/") && (t.pathname = "/ws"), e = new WebSocket(t);
		} catch {
			k(m ? "Video gateway unavailable" : "视频网关不可用");
			return;
		}
		e.onopen = () => e.send(JSON.stringify({ type: "getMeta" })), e.onmessage = (e) => {
			try {
				let t = JSON.parse(e.data);
				t.type === "meta" && t.encoder && typeof t.encoder.actual == "string" && (D(t.encoder), k(""), j(Object.entries(t.streams || {}).flatMap(([e, t]) => {
					let n = t;
					return typeof n?.encoder?.actual == "string" ? [{
						topic: e,
						actual: n.encoder.actual,
						fallbackReason: n.encoder.fallbackReason || ""
					}] : [];
				})));
			} catch {
				k(m ? "Invalid gateway status" : "网关状态无效");
			}
		}, e.onerror = () => k(m ? "Video gateway unavailable" : "视频网关不可用");
		let t = setInterval(() => {
			e.readyState === WebSocket.OPEN && e.send(JSON.stringify({ type: "getMeta" }));
		}, 3e3);
		return () => {
			clearInterval(t), e.onmessage = e.onerror = null, e.close();
		};
	}, [M, m]);
	let P = c(async (e) => {
		if (!(!b || S || !s(N.current))) {
			C(!0), T("");
			try {
				if (!/^\/(?:[A-Za-z_][A-Za-z0-9_]*)(?:\/[A-Za-z_][A-Za-z0-9_]*)*$/.test(y)) throw Error("Invalid ROS service name");
				if (n.connectionState !== "open") throw Error(m ? "Connect to ROS before applying settings" : "应用配置前请先连接 ROS");
				let t = await (e ? _(b) : g(b));
				x(t.settings);
				let r = await n.bridge.callService(y, {});
				if (r.success !== !0) throw Error(r.message || "ROS reload failed");
				let i = JSON.parse(r.message || "{}");
				if (i.version !== t.version || i.session !== t.settings.session) throw Error("ROS reload confirmed an unexpected version/session");
				T(m ? "Applied and confirmed" : "已生效并确认版本");
			} catch (e) {
				T(e instanceof Error ? e.message : String(e));
			} finally {
				C(!1);
			}
		}
	}, [
		b,
		S,
		y,
		n,
		m
	]), F = (e, t, n) => {
		x((r) => r && {
			...r,
			[e]: {
				...r[e],
				[t]: n
			}
		});
	};
	return /* @__PURE__ */ p("div", {
		ref: N,
		children: [
			/* @__PURE__ */ p("section", {
				className: "settings-section",
				children: [
					/* @__PURE__ */ f("h2", { children: m ? "Video encoder" : "视频编码器" }),
					/* @__PURE__ */ f("p", { children: m ? "Choose Automatic, Intel VA-API or software x264 in General → Project runtime settings." : "在“通用 → 项目运行设置”中选择自动、Intel VA-API 或软件 x264。" }),
					E && /* @__PURE__ */ p("p", { children: [
						m ? "Startup probe" : "启动探测",
						": ",
						E.preference,
						" → ",
						E.actual,
						" · ",
						E.hardware ? m ? "Hardware encoding" : "硬件编码" : m ? "CPU software encoding" : "CPU 软件编码"
					] }),
					E?.fallbackReason && /* @__PURE__ */ f(r, { children: E.fallbackReason }),
					A.map((e) => /* @__PURE__ */ p("p", { children: [
						e.topic,
						": ",
						e.actual,
						e.fallbackReason ? ` · ${e.fallbackReason}` : ""
					] }, e.topic)),
					O && /* @__PURE__ */ f(r, { children: O })
				]
			}),
			/* @__PURE__ */ f("p", { children: m ? "Settings require a confirmed ROS reload. Missing backends do not affect the host." : "配置只有在 ROS 重载并确认版本后才算生效。缺少后端不影响宿主。" }),
			/* @__PURE__ */ f(t, {
				label: m ? "ROS reload service" : "ROS 重载服务",
				children: /* @__PURE__ */ f(a, {
					value: y,
					onChange: (e) => n.onPluginStateChange("image", {
						...v,
						reloadService: e.target.value
					})
				})
			}),
			b && ["rgb", "depth"].map((e) => /* @__PURE__ */ p("section", {
				className: "settings-section",
				children: [
					/* @__PURE__ */ f("h2", { children: e === "rgb" ? "RGB" : "Native Depth" }),
					/* @__PURE__ */ f("p", { children: "WebRTC (H.264)" }),
					/* @__PURE__ */ f(t, {
						label: m ? "Bandwidth budget (Mbps)" : "带宽预算 (Mbps)",
						children: /* @__PURE__ */ f(i, {
							min: .1,
							max: 1e3,
							step: "any",
							value: b[e].bandwidth_mbps,
							onValueChange: (t) => {
								t !== void 0 && F(e, "bandwidth_mbps", t);
							}
						})
					}),
					/* @__PURE__ */ f(t, {
						label: m ? "Max frame rate" : "帧率上限",
						children: /* @__PURE__ */ f(i, {
							min: 1,
							max: 60,
							step: 1,
							value: b[e].max_fps,
							onValueChange: (t) => {
								t !== void 0 && F(e, "max_fps", t);
							}
						})
					}),
					/* @__PURE__ */ f(t, {
						label: m ? "Target bitrate (Mbps)" : "目标码率 (Mbps)",
						children: /* @__PURE__ */ f(i, {
							min: .1,
							max: b[e].bandwidth_mbps,
							step: .1,
							value: b[e].target_bitrate_mbps,
							onValueChange: (t) => {
								t !== void 0 && F(e, "target_bitrate_mbps", t);
							}
						})
					})
				]
			}, e)),
			/* @__PURE__ */ p(o, { children: [
				/* @__PURE__ */ f(e, {
					disabled: !b || S,
					onClick: () => void P(!1),
					children: m ? "Apply" : "应用"
				}),
				/* @__PURE__ */ f(e, {
					disabled: !b || S,
					onClick: () => void P(!0),
					children: m ? "Save as default" : "保存为默认"
				}),
				b && /* @__PURE__ */ p("span", { children: [
					"v",
					b.version,
					" · ",
					n.connectionState
				] })
			] }),
			w && /* @__PURE__ */ f(r, { children: w })
		]
	});
}
//#endregion
//#region plugins/image/index.tsx
function y({ ctx: e, state: t, onStateChange: r, onClose: i }) {
	let a = t;
	return /* @__PURE__ */ f(n, {
		embedded: !0,
		active: e.active,
		bridge: e.bridge,
		topics: e.topics,
		initialTopic: a?.topic,
		initialPreferRaw: a?.preferRaw ?? !0,
		initialUseWebRtc: a?.useWebRtc !== !1,
		mediaUrl: e.mediaUrl || e.getServiceUrl("video"),
		onTopicChange: (e, t, n) => r({
			topic: e,
			preferRaw: t,
			useWebRtc: n
		}),
		onClose: i
	});
}
var b = {
	id: "image",
	name: "图像 (Image)",
	settings: [{
		id: "images",
		title: (e) => e.locale === "en" ? "Image settings" : "图像设置",
		component: v
	}],
	panels: [{
		kind: "image",
		title: (e) => e.locale === "en" ? "Image" : "图像面板",
		component: y
	}],
	services: [{
		id: "video",
		label: "WebRTC 视频网关",
		defaultPort: 8787,
		protocol: "ws",
		description: "实时视频流 (H.264) 与相机数据流"
	}]
};
//#endregion
export { y as ImagePanelPlugin, b as default };
