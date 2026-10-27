import { createContext as e, createElement as t, forwardRef as n, useCallback as r, useContext as i, useEffect as a, useRef as o, useState as s } from "react";
import { Button as c, Select as l, TextInput as u, Toolbar as d } from "@robviz/core";
import { jsx as f, jsxs as p } from "react/jsx-runtime";
//#region node_modules/lucide-react/dist/esm/shared/src/utils/mergeClasses.mjs
var m = (...e) => e.filter((e, t, n) => !!e && e.trim() !== "" && n.indexOf(e) === t).join(" ").trim(), h = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), g = (e) => e.replace(/^([A-Z])|[\s-_]+(\w)/g, (e, t, n) => n ? n.toUpperCase() : t.toLowerCase()), _ = (e) => {
	let t = g(e);
	return t.charAt(0).toUpperCase() + t.slice(1);
}, v = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2,
	strokeLinecap: "round",
	strokeLinejoin: "round"
}, y = (e) => {
	for (let t in e) if (t.startsWith("aria-") || t === "role" || t === "title") return !0;
	return !1;
}, b = e({}), x = () => i(b), S = n(({ color: e, size: n, strokeWidth: r, absoluteStrokeWidth: i, className: a = "", children: o, iconNode: s, ...c }, l) => {
	let { size: u = 24, strokeWidth: d = 2, absoluteStrokeWidth: f = !1, color: p = "currentColor", className: h = "" } = x() ?? {}, g = i ?? f ? Number(r ?? d) * 24 / Number(n ?? u) : r ?? d;
	return t("svg", {
		ref: l,
		...v,
		width: n ?? u ?? v.width,
		height: n ?? u ?? v.height,
		stroke: e ?? p,
		strokeWidth: g,
		className: m("lucide", h, a),
		...!o && !y(c) && { "aria-hidden": "true" },
		...c
	}, [...s.map(([e, n]) => t(e, n)), ...Array.isArray(o) ? o : [o]]);
}), C = (e, r) => {
	let i = n(({ className: n, ...i }, a) => t(S, {
		ref: a,
		iconNode: r,
		className: m(`lucide-${h(_(e))}`, `lucide-${e}`, n),
		...i
	}));
	return i.displayName = _(e), i;
}, w = C("eye-off", [
	["path", {
		d: "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",
		key: "ct8e1f"
	}],
	["path", {
		d: "M14.084 14.158a3 3 0 0 1-4.242-4.242",
		key: "151rxh"
	}],
	["path", {
		d: "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",
		key: "13bj9a"
	}],
	["path", {
		d: "m2 2 20 20",
		key: "1ooewy"
	}]
]), T = C("eye", [["path", {
	d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",
	key: "1nclc0"
}], ["circle", {
	cx: "12",
	cy: "12",
	r: "3",
	key: "1v7zrd"
}]]), E = C("pause", [["rect", {
	x: "14",
	y: "3",
	width: "5",
	height: "18",
	rx: "1",
	key: "kaeet6"
}], ["rect", {
	x: "5",
	y: "3",
	width: "5",
	height: "18",
	rx: "1",
	key: "1wsw3u"
}]]), D = C("play", [["path", {
	d: "M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z",
	key: "10ikf1"
}]]), O = C("rotate-ccw", [["path", {
	d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",
	key: "1357e3"
}], ["path", {
	d: "M3 3v5h5",
	key: "1xhq8a"
}]]), k = C("trash-2", [
	["path", {
		d: "M10 11v6",
		key: "nco0om"
	}],
	["path", {
		d: "M14 11v6",
		key: "outv1u"
	}],
	["path", {
		d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",
		key: "miytrc"
	}],
	["path", {
		d: "M3 6h18",
		key: "d0wm0j"
	}],
	["path", {
		d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
		key: "e791ji"
	}]
]), ee = !0, te = "uplot", ne = "u-hz", re = "u-vt", ie = "u-title", ae = "u-wrap", oe = "u-under", se = "u-over", ce = "u-axis", le = "u-off", ue = "u-select", de = "u-cursor-x", fe = "u-cursor-y", pe = "u-cursor-pt", me = "u-legend", he = "u-live", ge = "u-inline", _e = "u-series", ve = "u-marker", ye = "u-label", be = "u-value", xe = "width", Se = "height", Ce = "top", we = "bottom", Te = "left", Ee = "right", A = "#000", De = "#0000", Oe = "mousemove", ke = "mousedown", Ae = "mouseup", je = "mouseenter", Me = "mouseleave", Ne = "dblclick", Pe = "resize", Fe = "scroll", Ie = "change", Le = "dppxchange", Re = "--", ze = typeof window < "u", Be = ze ? document : null, Ve = ze ? window : null, He = ze ? navigator : null, j, Ue;
function M() {
	let e = devicePixelRatio;
	j != e && (j = e, Ue && tt(Ie, Ue, M), Ue = matchMedia(`(min-resolution: ${j - .001}dppx) and (max-resolution: ${j + .001}dppx)`), et(Ie, Ue, M), Ve.dispatchEvent(new CustomEvent(Le)));
}
function We(e, t) {
	if (t != null) {
		let n = e.classList;
		!n.contains(t) && n.add(t);
	}
}
function Ge(e, t) {
	let n = e.classList;
	n.contains(t) && n.remove(t);
}
function N(e, t, n) {
	e.style[t] = n + "px";
}
function Ke(e, t, n, r) {
	let i = Be.createElement(e);
	return t != null && We(i, t), n?.insertBefore(i, r), i;
}
function qe(e, t) {
	return Ke("div", e, t);
}
var P = /* @__PURE__ */ new WeakMap();
function Je(e, t, n, r, i) {
	let a = "translate(" + t + "px," + n + "px)";
	a != P.get(e) && (e.style.transform = a, P.set(e, a), t < 0 || n < 0 || t > r || n > i ? We(e, le) : Ge(e, le));
}
var Ye = /* @__PURE__ */ new WeakMap();
function Xe(e, t, n) {
	let r = t + n;
	r != Ye.get(e) && (Ye.set(e, r), e.style.background = t, e.style.borderColor = n);
}
var Ze = /* @__PURE__ */ new WeakMap();
function Qe(e, t, n, r) {
	let i = t + "" + n;
	i != Ze.get(e) && (Ze.set(e, i), e.style.height = n + "px", e.style.width = t + "px", e.style.marginLeft = r ? -t / 2 + "px" : 0, e.style.marginTop = r ? -n / 2 + "px" : 0);
}
var F = { passive: !0 }, $e = {
	...F,
	capture: !0
};
function et(e, t, n, r) {
	t.addEventListener(e, n, r ? $e : F);
}
function tt(e, t, n, r) {
	t.removeEventListener(e, n, F);
}
ze && M();
function nt(e, t, n, r) {
	let i;
	n ||= 0, r ||= t.length - 1;
	let a = r <= 2147483647;
	for (; r - n > 1;) i = a ? n + r >> 1 : St((n + r) / 2), t[i] < e ? n = i : r = i;
	return e - t[n] <= t[r] - e ? n : r;
}
function rt(e) {
	return (t, n, r) => {
		let i = -1, a = -1;
		for (let a = n; a <= r; a++) if (e(t[a])) {
			i = a;
			break;
		}
		for (let i = r; i >= n; i--) if (e(t[i])) {
			a = i;
			break;
		}
		return [i, a];
	};
}
var it = (e) => e != null, at = (e) => e != null && e > 0, ot = rt(it), st = rt(at);
function ct(e, t, n, r = 0, i = !1) {
	let a = i ? st : ot, o = i ? at : it;
	[t, n] = a(e, t, n);
	let s = e[t], c = e[t];
	if (t > -1) {
		if (r == 1) s = e[t], c = e[n];
		else if (r == -1) s = e[n], c = e[t];
		else for (let r = t; r <= n; r++) {
			let t = e[r];
			o(t) && (t < s ? s = t : t > c && (c = t));
		}
	}
	return [s ?? R, c ?? -R];
}
function lt(e, t, n, r) {
	let i = Ot(e), a = Ot(t);
	e == t && (i == -1 ? (e *= n, t /= n) : (e /= n, t *= n));
	let o = n == 10 ? kt : At, s = i == 1 ? St : wt, c = a == 1 ? wt : St, l = s(o(L(e))), u = c(o(L(t))), d = Dt(n, l), f = Dt(n, u);
	return n == 10 && (l < 0 && (d = U(d, -l)), u < 0 && (f = U(f, -u))), r || n == 2 ? (e = d * i, t = f * a) : (e = Ut(e, d), t = Ht(t, f)), [e, t];
}
function ut(e, t, n, r) {
	let i = lt(e, t, n, r);
	return e == 0 && (i[0] = 0), t == 0 && (i[1] = 0), i;
}
var dt = .1, ft = {
	mode: 3,
	pad: dt
}, pt = {
	pad: 0,
	soft: null,
	mode: 0
}, mt = {
	min: pt,
	max: pt
};
function ht(e, t, n, r) {
	return en(n) ? _t(e, t, n) : (pt.pad = n, pt.soft = r ? 0 : null, pt.mode = r ? 3 : 0, _t(e, t, mt));
}
function I(e, t) {
	return e ?? t;
}
function gt(e, t, n) {
	for (t = I(t, 0), n = I(n, e.length - 1); t <= n;) {
		if (e[t] != null) return !0;
		t++;
	}
	return !1;
}
function _t(e, t, n) {
	let r = n.min, i = n.max, a = I(r.pad, 0), o = I(i.pad, 0), s = I(r.hard, -R), c = I(i.hard, R), l = I(r.soft, R), u = I(i.soft, -R), d = I(r.mode, 0), f = I(i.mode, 0), p = t - e, m = kt(p), h = Et(L(e), L(t)), g = L(kt(h) - m);
	(p < 1e-24 || g > 10) && (p = 0, (e == 0 || t == 0) && (p = 1e-24, d == 2 && l != R && (a = 0), f == 2 && u != -R && (o = 0)));
	let _ = p || h || 1e3, v = Dt(10, St(kt(_))), y = U(Ut(e - _ * (p == 0 ? e == 0 ? .1 : 1 : a), v / 10), 24), b = e >= l && (d == 1 || d == 3 && y <= l || d == 2 && y >= l) ? l : R, x = Et(s, y < b && e >= b ? b : Tt(b, y)), S = U(Ht(t + _ * (p == 0 ? t == 0 ? .1 : 1 : o), v / 10), 24), C = t <= u && (f == 1 || f == 3 && S >= u || f == 2 && S <= u) ? u : -R, w = Tt(c, S > C && t <= C ? C : Et(C, S));
	return x == w && x == 0 && (w = 100), [x, w];
}
var vt = new Intl.NumberFormat(ze ? He.language : "en-US"), yt = (e) => vt.format(e), bt = Math, xt = bt.PI, L = bt.abs, St = bt.floor, Ct = bt.round, wt = bt.ceil, Tt = bt.min, Et = bt.max, Dt = bt.pow, Ot = bt.sign, kt = bt.log10, At = bt.log2, jt = (e, t = 1) => bt.sinh(e) * t, Mt = (e, t = 1) => bt.asinh(e / t), R = Infinity;
function Nt(e) {
	return (kt((e ^ e >> 31) - (e >> 31)) | 0) + 1;
}
function Pt(e, t, n) {
	return Tt(Et(e, t), n);
}
function Ft(e) {
	return typeof e == "function";
}
function z(e) {
	return Ft(e) ? e : () => e;
}
var It = () => {}, B = (e) => e, Lt = (e, t) => t, Rt = (e) => null, zt = (e) => !0, Bt = (e, t) => e == t, V = /\.\d*?(?=9{6,}|0{6,})/gm, H = (e) => {
	if (Zt(e) || Wt.has(e)) return e;
	let t = `${e}`, n = t.match(V);
	if (n == null) return e;
	let r = n[0].length - 1;
	if (t.indexOf("e-") != -1) {
		let [e, n] = t.split("e");
		return +`${H(e)}e${n}`;
	}
	return U(e, r);
};
function Vt(e, t) {
	return H(U(H(e / t)) * t);
}
function Ht(e, t) {
	return H(wt(H(e / t)) * t);
}
function Ut(e, t) {
	return H(St(H(e / t)) * t);
}
function U(e, t = 0) {
	if (Zt(e)) return e;
	let n = 10 ** t;
	return Ct(e * n * (1 + 2 ** -52)) / n;
}
var Wt = /* @__PURE__ */ new Map();
function Gt(e) {
	return (("" + e).split(".")[1] || "").length;
}
function Kt(e, t, n, r) {
	let i = [], a = r.map(Gt);
	for (let o = t; o < n; o++) {
		let t = L(o), n = U(Dt(e, o), t);
		for (let s = 0; s < r.length; s++) {
			let c = e == 10 ? +`${r[s]}e${o}` : r[s] * n, l = (o >= 0 ? 0 : t) + (o >= a[s] ? 0 : a[s]), u = e == 10 ? c : U(c, l);
			i.push(u), Wt.set(u, l);
		}
	}
	return i;
}
var qt = {}, Jt = [], Yt = [null, null], Xt = Array.isArray, Zt = Number.isInteger, Qt = (e) => e === void 0;
function $t(e) {
	return typeof e == "string";
}
function en(e) {
	let t = !1;
	if (e != null) {
		let n = e.constructor;
		t = n == null || n == Object;
	}
	return t;
}
function tn(e) {
	return typeof e == "object" && !!e;
}
var nn = Object.getPrototypeOf(Uint8Array), rn = "__proto__";
function an(e, t = en) {
	let n;
	if (Xt(e)) {
		let r = e.find((e) => e != null);
		if (Xt(r) || t(r)) {
			n = Array(e.length);
			for (let r = 0; r < e.length; r++) n[r] = an(e[r], t);
		} else n = e.slice();
	} else if (e instanceof nn) n = e.slice();
	else if (t(e)) {
		n = {};
		for (let r in e) r != rn && (n[r] = an(e[r], t));
	} else n = e;
	return n;
}
function W(e) {
	let t = arguments;
	for (let n = 1; n < t.length; n++) {
		let r = t[n];
		for (let t in r) t != rn && (en(e[t]) ? W(e[t], an(r[t])) : e[t] = an(r[t]));
	}
	return e;
}
var on = 0, sn = 1, cn = 2;
function ln(e, t, n) {
	for (let r = 0, i, a = -1; r < t.length; r++) {
		let o = t[r];
		if (o > a) {
			for (i = o - 1; i >= 0 && e[i] == null;) e[i--] = null;
			for (i = o + 1; i < n && e[i] == null;) e[a = i++] = null;
		}
	}
}
function un(e, t) {
	if (pn(e)) {
		let t = e[0].slice();
		for (let n = 1; n < e.length; n++) t.push(...e[n].slice(1));
		return mn(t[0]) || (t = fn(t)), t;
	}
	let n = /* @__PURE__ */ new Set();
	for (let t = 0; t < e.length; t++) {
		let r = e[t][0], i = r.length;
		for (let e = 0; e < i; e++) n.add(r[e]);
	}
	let r = [Array.from(n).sort((e, t) => e - t)], i = r[0].length, a = /* @__PURE__ */ new Map();
	for (let e = 0; e < i; e++) a.set(r[0][e], e);
	for (let n = 0; n < e.length; n++) {
		let o = e[n], s = o[0];
		for (let e = 1; e < o.length; e++) {
			let c = o[e], l = Array(i).fill(void 0), u = t ? t[n][e] : sn, d = [];
			for (let e = 0; e < c.length; e++) {
				let t = c[e], n = a.get(s[e]);
				t === null ? u != on && (l[n] = t, u == cn && d.push(n)) : l[n] = t;
			}
			ln(l, d, i), r.push(l);
		}
	}
	return r;
}
var dn = typeof queueMicrotask > "u" ? (e) => Promise.resolve().then(e) : queueMicrotask;
function fn(e) {
	let t = e[0], n = t.length, r = Array(n);
	for (let e = 0; e < r.length; e++) r[e] = e;
	r.sort((e, n) => t[e] - t[n]);
	let i = [];
	for (let t = 0; t < e.length; t++) {
		let a = e[t], o = Array(n);
		for (let e = 0; e < n; e++) o[e] = a[r[e]];
		i.push(o);
	}
	return i;
}
function pn(e) {
	let t = e[0][0], n = t.length;
	for (let r = 1; r < e.length; r++) {
		let i = e[r][0];
		if (i.length != n) return !1;
		if (i != t) {
			for (let e = 0; e < n; e++) if (i[e] != t[e]) return !1;
		}
	}
	return !0;
}
function mn(e, t = 100) {
	let n = e.length;
	if (n <= 1) return !0;
	let r = 0, i = n - 1;
	for (; r <= i && e[r] == null;) r++;
	for (; i >= r && e[i] == null;) i--;
	if (i <= r) return !0;
	let a = Et(1, St((i - r + 1) / t));
	for (let t = e[r], n = r + a; n <= i; n += a) {
		let r = e[n];
		if (r != null) {
			if (r <= t) return !1;
			t = r;
		}
	}
	return !0;
}
var hn = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December"
], gn = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday"
];
function _n(e) {
	return e.slice(0, 3);
}
var vn = gn.map(_n), yn = {
	MMMM: hn,
	MMM: hn.map(_n),
	WWWW: gn,
	WWW: vn
};
function bn(e) {
	return (e < 10 ? "0" : "") + e;
}
function xn(e) {
	return (e < 10 ? "00" : e < 100 ? "0" : "") + e;
}
var Sn = {
	YYYY: (e) => e.getFullYear(),
	YY: (e) => (e.getFullYear() + "").slice(2),
	MMMM: (e, t) => t.MMMM[e.getMonth()],
	MMM: (e, t) => t.MMM[e.getMonth()],
	MM: (e) => bn(e.getMonth() + 1),
	M: (e) => e.getMonth() + 1,
	DD: (e) => bn(e.getDate()),
	D: (e) => e.getDate(),
	WWWW: (e, t) => t.WWWW[e.getDay()],
	WWW: (e, t) => t.WWW[e.getDay()],
	HH: (e) => bn(e.getHours()),
	H: (e) => e.getHours(),
	h: (e) => {
		let t = e.getHours();
		return t == 0 ? 12 : t > 12 ? t - 12 : t;
	},
	AA: (e) => e.getHours() >= 12 ? "PM" : "AM",
	aa: (e) => e.getHours() >= 12 ? "pm" : "am",
	a: (e) => e.getHours() >= 12 ? "p" : "a",
	mm: (e) => bn(e.getMinutes()),
	m: (e) => e.getMinutes(),
	ss: (e) => bn(e.getSeconds()),
	s: (e) => e.getSeconds(),
	fff: (e) => xn(e.getMilliseconds())
};
function Cn(e, t) {
	t ||= yn;
	let n = [], r = /\{([a-z]+)\}|[^{]+/gi, i;
	for (; i = r.exec(e);) n.push(i[0][0] == "{" ? Sn[i[1]] : i[0]);
	return (e) => {
		let r = "";
		for (let i = 0; i < n.length; i++) r += typeof n[i] == "string" ? n[i] : n[i](e, t);
		return r;
	};
}
var wn = new Intl.DateTimeFormat().resolvedOptions().timeZone;
function Tn(e, t) {
	let n;
	return t == "UTC" || t == "Etc/UTC" ? n = /* @__PURE__ */ new Date(+e + e.getTimezoneOffset() * 6e4) : t == wn ? n = e : (n = new Date(e.toLocaleString("en-US", { timeZone: t })), n.setMilliseconds(e.getMilliseconds())), n;
}
var En = (e) => e % 1 == 0, Dn = [
	1,
	2,
	2.5,
	5
], On = Kt(10, -32, 0, Dn), kn = Kt(10, 0, 32, Dn), An = kn.filter(En), jn = On.concat(kn), Mn = "{YYYY}", Nn = "\n{YYYY}", Pn = "{M}/{D}", Fn = "\n{M}/{D}", In = "\n{M}/{D}/{YY}", Ln = "{h}:{mm}{aa}", Rn = "\n{h}:{mm}{aa}", zn = ":{ss}", G = null;
function Bn(e) {
	let t = e * 1e3, n = t * 60, r = n * 60, i = r * 24, a = i * 30, o = i * 365, s = (e == 1 ? Kt(10, 0, 3, Dn).filter(En) : Kt(10, -3, 0, Dn)).concat([
		t,
		t * 5,
		t * 10,
		t * 15,
		t * 30,
		n,
		n * 5,
		n * 10,
		n * 15,
		n * 30,
		r,
		r * 2,
		r * 3,
		r * 4,
		r * 6,
		r * 8,
		r * 12,
		i,
		i * 2,
		i * 3,
		i * 4,
		i * 5,
		i * 6,
		i * 7,
		i * 8,
		i * 9,
		i * 10,
		i * 15,
		a,
		a * 2,
		a * 3,
		a * 4,
		a * 6,
		o,
		o * 2,
		o * 5,
		o * 10,
		o * 25,
		o * 50,
		o * 100
	]), c = [
		[
			o,
			Mn,
			G,
			G,
			G,
			G,
			G,
			G,
			1
		],
		[
			i * 28,
			"{MMM}",
			Nn,
			G,
			G,
			G,
			G,
			G,
			1
		],
		[
			i,
			Pn,
			Nn,
			G,
			G,
			G,
			G,
			G,
			1
		],
		[
			r,
			"{h}{aa}",
			In,
			G,
			Fn,
			G,
			G,
			G,
			1
		],
		[
			n,
			Ln,
			In,
			G,
			Fn,
			G,
			G,
			G,
			1
		],
		[
			t,
			zn,
			"\n{M}/{D}/{YY} {h}:{mm}{aa}",
			G,
			"\n{M}/{D} {h}:{mm}{aa}",
			G,
			Rn,
			G,
			1
		],
		[
			e,
			":{ss}.{fff}",
			"\n{M}/{D}/{YY} {h}:{mm}{aa}",
			G,
			"\n{M}/{D} {h}:{mm}{aa}",
			G,
			Rn,
			G,
			1
		]
	];
	function l(t) {
		return (s, c, l, u, d, f) => {
			let p = [], m = d >= o, h = d >= a && d < o, g = t(l), _ = U(g * e, 3), v = K(g.getFullYear(), m ? 0 : g.getMonth(), h || m ? 1 : g.getDate()), y = U(v * e, 3);
			if (h || m) {
				let n = h ? d / a : 0, r = m ? d / o : 0, i = _ == y ? _ : U(K(v.getFullYear() + r, v.getMonth() + n, 1) * e, 3), s = new Date(Ct(i / e)), c = s.getFullYear(), l = s.getMonth();
				for (let a = 0; i <= u; a++) {
					let o = K(c + r * a, l + n * a, 1), s = o - t(U(o * e, 3));
					i = U((+o + s) * e, 3), i <= u && p.push(i);
				}
			} else {
				let a = d >= i ? i : d, o = y + (St(l) - St(_)) + Ht(_ - y, a);
				p.push(o);
				let m = t(o), h = m.getHours() + m.getMinutes() / n + m.getSeconds() / r, g = d / r, v = f / s.axes[c]._space;
				for (; o = U(o + d, e == 1 ? 0 : 3), !(o > u);) if (g > 1) {
					let e = St(U(h + g, 6)) % 24, n = t(o).getHours() - e;
					n > 1 && (n = -1), o -= n * r, h = (h + g) % 24;
					let i = p[p.length - 1];
					U((o - i) / d, 3) * v >= .7 && p.push(o);
				} else p.push(o);
			}
			return p;
		};
	}
	return [
		s,
		c,
		l
	];
}
var [Vn, Hn, Un] = Bn(1), [Wn, Gn, Kn] = Bn(.001);
Kt(2, -53, 53, [1]);
function qn(e, t) {
	return e.map((e) => e.map((n, r) => r == 0 || r == 8 || n == null ? n : t(r == 1 || e[8] == 0 ? n : e[1] + n)));
}
function Jn(e, t) {
	return (n, r, i, a, o) => {
		let s = t.find((e) => o >= e[0]) || t[t.length - 1], c, l, u, d, f, p;
		return r.map((t) => {
			let n = e(t), r = n.getFullYear(), i = n.getMonth(), a = n.getDate(), o = n.getHours(), m = n.getMinutes(), h = n.getSeconds(), g = r != c && s[2] || i != l && s[3] || a != u && s[4] || o != d && s[5] || m != f && s[6] || h != p && s[7] || s[1];
			return c = r, l = i, u = a, d = o, f = m, p = h, g(n);
		});
	};
}
function Yn(e, t) {
	let n = Cn(t);
	return (t, r, i, a, o) => r.map((t) => n(e(t)));
}
function K(e, t, n) {
	return new Date(e, t, n);
}
function Xn(e, t) {
	return t(e);
}
var Zn = "{YYYY}-{MM}-{DD} {h}:{mm}{aa}";
function Qn(e, t) {
	return (n, r, i, a) => a == null ? Re : t(e(r));
}
function $n(e, t) {
	let n = e.series[t];
	return n.width ? n.stroke(e, t) : n.points.width ? n.points.stroke(e, t) : null;
}
function er(e, t) {
	return e.series[t].fill(e, t);
}
var tr = {
	show: !0,
	live: !0,
	isolate: !1,
	mount: It,
	markers: {
		show: !0,
		width: 2,
		stroke: $n,
		fill: er,
		dash: "solid"
	},
	idx: null,
	idxs: null,
	values: []
};
function nr(e, t) {
	let n = e.cursor.points, r = qe(), i = n.size(e, t);
	N(r, xe, i), N(r, Se, i);
	let a = i / -2;
	N(r, "marginLeft", a), N(r, "marginTop", a);
	let o = n.width(e, t, i);
	return o && N(r, "borderWidth", o), r;
}
function rr(e, t) {
	let n = e.series[t].points;
	return n._fill || n._stroke;
}
function ir(e, t) {
	let n = e.series[t].points;
	return n._stroke || n._fill;
}
function ar(e, t) {
	return e.series[t].points.size;
}
var or = [0, 0];
function sr(e, t, n) {
	return or[0] = t, or[1] = n, or;
}
function cr(e, t, n, r = !0) {
	return (e) => {
		e.button == 0 && (!r || e.target == t) && n(e);
	};
}
function lr(e, t, n, r = !0) {
	return (e) => {
		(!r || e.target == t) && n(e);
	};
}
var ur = {
	show: !0,
	x: !0,
	y: !0,
	lock: !1,
	move: sr,
	points: {
		one: !1,
		show: nr,
		size: ar,
		width: 0,
		stroke: ir,
		fill: rr
	},
	bind: {
		mousedown: cr,
		mouseup: cr,
		click: cr,
		dblclick: cr,
		mousemove: lr,
		mouseleave: lr,
		mouseenter: lr
	},
	drag: {
		setScale: !0,
		x: !0,
		y: !1,
		dist: 0,
		uni: null,
		click: (e, t) => {
			t.stopPropagation(), t.stopImmediatePropagation();
		},
		_x: !1,
		_y: !1
	},
	focus: {
		dist: (e, t, n, r, i) => r - i,
		prox: -1,
		bias: 0
	},
	hover: {
		skip: [void 0],
		prox: null,
		bias: 0
	},
	left: -10,
	top: -10,
	idx: null,
	dataIdx: null,
	idxs: null,
	event: null
}, dr = {
	show: !0,
	stroke: "rgba(0,0,0,0.07)",
	width: 2
}, fr = W({}, dr, { filter: Lt }), pr = W({}, fr, { size: 10 }), mr = W({}, dr, { show: !1 }), hr = "12px system-ui, -apple-system, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"Noto Sans\", sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\"", gr = "bold 12px system-ui, -apple-system, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"Noto Sans\", sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\"", _r = 1.5, vr = {
	show: !0,
	scale: "x",
	stroke: A,
	space: 50,
	gap: 5,
	alignTo: 1,
	size: 50,
	labelGap: 0,
	labelSize: 30,
	labelFont: gr,
	side: 2,
	grid: fr,
	ticks: pr,
	border: mr,
	font: hr,
	lineGap: _r,
	rotate: 0
}, yr = "Value", br = "Time", xr = {
	show: !0,
	scale: "x",
	auto: !1,
	sorted: 1,
	min: R,
	max: -Infinity,
	idxs: []
};
function Sr(e, t, n, r, i) {
	return t.map((e) => e == null ? "" : yt(e));
}
function Cr(e, t, n, r, i, a, o) {
	let s = [], c = Wt.get(i) || 0;
	n = o ? n : U(Ht(n, i), c);
	for (let e = n; e <= r; e = U(e + i, c)) s.push(Object.is(e, -0) ? 0 : e);
	return s;
}
function wr(e, t, n, r, i, a, o) {
	let s = [], c = e.scales[e.axes[t].scale].log;
	i = Dt(c, St((c == 10 ? kt : At)(n))), c == 10 && (i = jn[nt(i, jn)]);
	let l = n, u = i * c;
	c == 10 && (u = jn[nt(u, jn)]);
	do
		s.push(l), l += i, c == 10 && !Wt.has(l) && (l = U(l, Wt.get(i))), l >= u && (i = l, u = i * c, c == 10 && (u = jn[nt(u, jn)]));
	while (l <= r);
	return s;
}
function Tr(e, t, n, r, i, a, o) {
	let s = e.scales[e.axes[t].scale].asinh, c = r > s ? wr(e, t, Et(s, n), r, i) : [s], l = r >= 0 && n <= 0 ? [0] : [];
	return (n < -s ? wr(e, t, Et(s, -r), -n, i) : [s]).reverse().map((e) => -e).concat(l, c);
}
var Er = /./, Dr = /[12357]/, Or = /[125]/, kr = /1/, Ar = (e, t, n, r) => e.map((e, i) => t == 4 && e == 0 || i % r == 0 && n.test(e.toExponential()[+(e < 0)]) ? e : null);
function jr(e, t, n, r, i) {
	let a = e.axes[n], o = a.scale, s = e.scales[o], c = e.valToPos, l = a._space, u = c(10, o), d = c(9, o) - u >= l ? Er : c(7, o) - u >= l ? Dr : c(5, o) - u >= l ? Or : kr;
	if (d == kr) {
		let e = L(c(1, o) - u);
		if (e < l) return Ar(t.slice().reverse(), s.distr, d, wt(l / e)).reverse();
	}
	return Ar(t, s.distr, d, 1);
}
function Mr(e, t, n, r, i) {
	let a = e.axes[n], o = a.scale, s = a._space, c = e.valToPos, l = L(c(1, o) - c(2, o));
	return l < s ? Ar(t.slice().reverse(), 3, Er, wt(s / l)).reverse() : t;
}
function Nr(e, t, n, r) {
	return r == null ? Re : t == null ? "" : yt(t);
}
var Pr = {
	show: !0,
	scale: "y",
	stroke: A,
	space: 30,
	gap: 5,
	alignTo: 1,
	size: 50,
	labelGap: 0,
	labelSize: 30,
	labelFont: gr,
	side: 3,
	grid: fr,
	ticks: pr,
	border: mr,
	font: hr,
	lineGap: _r,
	rotate: 0
};
function Fr(e, t) {
	return U((3 + (e || 1) * 2) * t, 3);
}
function Ir(e, t) {
	let { scale: n, idxs: r } = e.series[0], i = e._data[0], a = e.valToPos(i[r[0]], n, !0), o = L(e.valToPos(i[r[1]], n, !0) - a) / (e.series[t].points.space * j);
	return r[1] - r[0] <= o;
}
var Lr = {
	scale: null,
	auto: !0,
	sorted: 0,
	min: R,
	max: -Infinity
}, Rr = (e, t, n, r, i) => i, zr = {
	show: !0,
	auto: !0,
	sorted: 0,
	gaps: Rr,
	alpha: 1,
	facets: [W({}, Lr, { scale: "x" }), W({}, Lr, { scale: "y" })]
}, Br = {
	scale: "y",
	auto: !0,
	sorted: 0,
	show: !0,
	spanGaps: !1,
	gaps: Rr,
	alpha: 1,
	points: {
		show: Ir,
		filter: null
	},
	values: null,
	min: R,
	max: -Infinity,
	idxs: [],
	path: null,
	clip: null
};
function Vr(e, t, n, r, i) {
	return n / 10;
}
var Hr = {
	time: ee,
	auto: !0,
	distr: 1,
	log: 10,
	asinh: 1,
	min: null,
	max: null,
	dir: 1,
	ori: 0
}, Ur = W({}, Hr, {
	time: !1,
	ori: 1
}), Wr = {};
function Gr(e, t) {
	let n = Wr[e];
	return n || (n = {
		key: e,
		plots: [],
		sub(e) {
			n.plots.push(e);
		},
		unsub(e) {
			n.plots = n.plots.filter((t) => t != e);
		},
		pub(e, t, r, i, a, o, s) {
			for (let c = 0; c < n.plots.length; c++) n.plots[c] != t && n.plots[c].pub(e, t, r, i, a, o, s);
		}
	}, e != null && (Wr[e] = n)), n;
}
var Kr = 1, qr = 2;
function Jr(e, t, n) {
	let r = e.mode, i = e.series[t], a = r == 2 ? e._data[t] : e._data, o = e.scales, s = e.bbox, c = a[0], l = r == 2 ? a[1] : a[t], u = r == 2 ? o[i.facets[0].scale] : o[e.series[0].scale], d = r == 2 ? o[i.facets[1].scale] : o[i.scale], f = s.left, p = s.top, m = s.width, h = s.height, g = e.valToPosH, _ = e.valToPosV;
	return u.ori == 0 ? n(i, c, l, u, d, g, _, f, p, m, h, ri, ai, si, li, di) : n(i, c, l, u, d, _, g, p, f, h, m, ii, oi, ci, ui, fi);
}
function Yr(e, t) {
	let n = 0, r = 0, i = I(e.bands, Jt);
	for (let e = 0; e < i.length; e++) {
		let a = i[e];
		a.series[0] == t ? n = a.dir : a.series[1] == t && (a.dir == 1 ? r |= 1 : r |= 2);
	}
	return [n, r == 1 ? -1 : r == 2 ? 1 : r == 3 ? 2 : 0];
}
function Xr(e, t, n, r, i) {
	let a = e.mode, o = e.series[t], s = a == 2 ? o.facets[1].scale : o.scale, c = e.scales[s];
	return i == -1 ? c.min : i == 1 ? c.max : c.distr == 3 ? c.dir == 1 ? c.min : c.max : 0;
}
function Zr(e, t, n, r, i, a) {
	return Jr(e, t, (e, t, o, s, c, l, u, d, f, p, m) => {
		let h = e.pxRound, g = s.dir * (s.ori == 0 ? 1 : -1), _ = s.ori == 0 ? ai : oi, v, y;
		g == 1 ? (v = n, y = r) : (v = r, y = n);
		let b = h(l(t[v], s, p, d)), x = h(u(o[v], c, m, f)), S = h(l(t[y], s, p, d)), C = h(u(a == 1 ? c.max : c.min, c, m, f)), w = new Path2D(i);
		return _(w, S, C), _(w, b, C), _(w, b, x), w;
	});
}
function Qr(e, t, n, r, i, a) {
	let o = null;
	if (e.length > 0) {
		o = new Path2D();
		let s = t == 0 ? si : ci, c = n;
		for (let t = 0; t < e.length; t++) {
			let n = e[t];
			if (n[1] > n[0]) {
				let e = n[0] - c;
				e > 0 && s(o, c, r, e, r + a), c = n[1];
			}
		}
		let l = n + i - c;
		l > 0 && s(o, c, r - 5, l, r + a + 10);
	}
	return o;
}
function $r(e, t, n) {
	let r = e[e.length - 1];
	r && r[0] == t ? r[1] = n : e.push([t, n]);
}
function ei(e, t, n, r, i, a, o) {
	let s = [], c = e.length;
	for (let l = i == 1 ? n : r; l >= n && l <= r; l += i) if (t[l] === null) {
		let u = l, d = l;
		if (i == 1) for (; ++l <= r && t[l] === null;) d = l;
		else for (; --l >= n && t[l] === null;) d = l;
		let f = a(e[u]), p = d == u ? f : a(e[d]), m = u - i;
		f = o <= 0 && m >= 0 && m < c ? a(e[m]) : f;
		let h = d + i;
		p = o >= 0 && h >= 0 && h < c ? a(e[h]) : p, p >= f && s.push([f, p]);
	}
	return s;
}
function ti(e) {
	return e == 0 ? B : e == 1 ? Ct : (t) => Vt(t, e);
}
function ni(e) {
	let t = e == 0 ? ri : ii, n = e == 0 ? (e, t, n, r, i, a) => {
		e.arcTo(t, n, r, i, a);
	} : (e, t, n, r, i, a) => {
		e.arcTo(n, t, i, r, a);
	}, r = e == 0 ? (e, t, n, r, i) => {
		e.rect(t, n, r, i);
	} : (e, t, n, r, i) => {
		e.rect(n, t, i, r);
	};
	return (e, i, a, o, s, c = 0, l = 0) => {
		c == 0 && l == 0 ? r(e, i, a, o, s) : (c = Tt(c, o / 2, s / 2), l = Tt(l, o / 2, s / 2), t(e, i + c, a), n(e, i + o, a, i + o, a + s, c), n(e, i + o, a + s, i, a + s, l), n(e, i, a + s, i, a, l), n(e, i, a, i + o, a, c), e.closePath());
	};
}
var ri = (e, t, n) => {
	e.moveTo(t, n);
}, ii = (e, t, n) => {
	e.moveTo(n, t);
}, ai = (e, t, n) => {
	e.lineTo(t, n);
}, oi = (e, t, n) => {
	e.lineTo(n, t);
}, si = ni(0), ci = ni(1), li = (e, t, n, r, i, a) => {
	e.arc(t, n, r, i, a);
}, ui = (e, t, n, r, i, a) => {
	e.arc(n, t, r, i, a);
}, di = (e, t, n, r, i, a, o) => {
	e.bezierCurveTo(t, n, r, i, a, o);
}, fi = (e, t, n, r, i, a, o) => {
	e.bezierCurveTo(n, t, i, r, o, a);
};
function pi(e) {
	return (e, t, n, r, i) => Jr(e, t, (t, a, o, s, c, l, u, d, f, p, m) => {
		let { pxRound: h, points: g } = t, _, v;
		s.ori == 0 ? (_ = ri, v = li) : (_ = ii, v = ui);
		let y = U(g.width * j, 3), b = (g.size - g.width) / 2 * j, x = U(b * 2, 3), S = new Path2D(), C = new Path2D(), { left: w, top: T, width: E, height: D } = e.bbox;
		si(C, w - x, T - x, E + x * 2, D + x * 2);
		let O = (e) => {
			if (o[e] != null) {
				let t = h(l(a[e], s, p, d)), n = h(u(o[e], c, m, f));
				_(S, t + b, n), v(S, t, n, b, 0, xt * 2);
			}
		};
		if (i) i.forEach(O);
		else for (let e = n; e <= r; e++) O(e);
		return {
			stroke: y > 0 ? S : null,
			fill: S,
			clip: C,
			flags: 3
		};
	});
}
function mi(e) {
	return (t, n, r, i, a, o) => {
		r != i && (a != r && o != r && e(t, n, r), a != i && o != i && e(t, n, i), e(t, n, o));
	};
}
var hi = mi(ai), gi = mi(oi);
function _i(e) {
	let t = I(e?.alignGaps, 0);
	return (e, n, r, i) => Jr(e, n, (a, o, s, c, l, u, d, f, p, m, h) => {
		[r, i] = ot(s, r, i);
		let g = a.pxRound, _ = (e) => g(u(e, c, m, f)), v = (e) => g(d(e, l, h, p)), y, b;
		c.ori == 0 ? (y = ai, b = hi) : (y = oi, b = gi);
		let x = c.dir * (c.ori == 0 ? 1 : -1), S = {
			stroke: new Path2D(),
			fill: null,
			clip: null,
			band: null,
			gaps: null,
			flags: Kr
		}, C = S.stroke, w = !1;
		if (i - r >= m * 4) {
			let t = (t) => e.posToVal(t, c.key, !0), n = null, a = null, l, u, d, f = _(o[x == 1 ? r : i]), p = _(o[r]), m = _(o[i]), h = t(x == 1 ? p + 1 : m - 1);
			for (let e = x == 1 ? r : i; e >= r && e <= i; e += x) {
				let r = o[e], i = (x == 1 ? r < h : r > h) ? f : _(r), c = s[e];
				i == f ? c == null ? c === null && (w = !0) : (u = c, n == null ? (y(C, i, v(u)), l = n = a = u) : u < n ? n = u : u > a && (a = u)) : (n != null && b(C, f, v(n), v(a), v(l), v(u)), c == null ? (n = a = null, c === null && (w = !0)) : (u = c, y(C, i, v(u)), n = a = l = u), f = i, h = t(f + x));
			}
			n != null && n != a && d != f && b(C, f, v(n), v(a), v(l), v(u));
		} else for (let e = x == 1 ? r : i; e >= r && e <= i; e += x) {
			let t = s[e];
			t === null ? w = !0 : t != null && y(C, _(o[e]), v(t));
		}
		let [T, E] = Yr(e, n);
		if (a.fill != null || T != 0) {
			let t = S.fill = new Path2D(C), s = v(a.fillTo(e, n, a.min, a.max, T)), c = _(o[r]), l = _(o[i]);
			x == -1 && ([l, c] = [c, l]), y(t, l, s), y(t, c, s);
		}
		if (!a.spanGaps) {
			let l = [];
			w && l.push(...ei(o, s, r, i, x, _, t)), S.gaps = l = a.gaps(e, n, r, i, l), S.clip = Qr(l, c.ori, f, p, m, h);
		}
		return E != 0 && (S.band = E == 2 ? [Zr(e, n, r, i, C, -1), Zr(e, n, r, i, C, 1)] : Zr(e, n, r, i, C, E)), S;
	});
}
function vi(e) {
	let t = I(e.align, 1), n = I(e.ascDesc, !1), r = I(e.alignGaps, 0), i = I(e.extend, !1);
	return (e, a, o, s) => Jr(e, a, (c, l, u, d, f, p, m, h, g, _, v) => {
		[o, s] = ot(u, o, s);
		let y = c.pxRound, { left: b, width: x } = e.bbox, S = (e) => y(p(e, d, _, h)), C = (e) => y(m(e, f, v, g)), w = d.ori == 0 ? ai : oi, T = {
			stroke: new Path2D(),
			fill: null,
			clip: null,
			band: null,
			gaps: null,
			flags: Kr
		}, E = T.stroke, D = d.dir * (d.ori == 0 ? 1 : -1), O = C(u[D == 1 ? o : s]), k = S(l[D == 1 ? o : s]), ee = k, te = k;
		i && t == -1 && (te = b, w(E, te, O)), w(E, k, O);
		for (let e = D == 1 ? o : s; e >= o && e <= s; e += D) {
			let n = u[e];
			if (n == null) continue;
			let r = S(l[e]), i = C(n);
			t == 1 ? w(E, r, O) : w(E, ee, i), w(E, r, i), O = i, ee = r;
		}
		let ne = ee;
		i && t == 1 && (ne = b + x, w(E, ne, O));
		let [re, ie] = Yr(e, a);
		if (c.fill != null || re != 0) {
			let t = T.fill = new Path2D(E), n = C(c.fillTo(e, a, c.min, c.max, re));
			w(t, ne, n), w(t, te, n);
		}
		if (!c.spanGaps) {
			let i = [];
			i.push(...ei(l, u, o, s, D, S, r));
			let f = c.width * j / 2, p = n || t == 1 ? f : -f, m = n || t == -1 ? -f : f;
			i.forEach((e) => {
				e[0] += p, e[1] += m;
			}), T.gaps = i = c.gaps(e, a, o, s, i), T.clip = Qr(i, d.ori, h, g, _, v);
		}
		return ie != 0 && (T.band = ie == 2 ? [Zr(e, a, o, s, E, -1), Zr(e, a, o, s, E, 1)] : Zr(e, a, o, s, E, ie)), T;
	});
}
function yi(e, t, n, r, i, a, o = R) {
	if (e.length > 1) {
		let s = null;
		for (let c = 0, l = Infinity; c < e.length; c++) if (t[c] !== void 0) {
			if (s != null) {
				let t = L(e[c] - e[s]);
				t < l && (l = t, o = L(n(e[c], r, i, a) - n(e[s], r, i, a)));
			}
			s = c;
		}
	}
	return o;
}
function bi(e) {
	e ||= qt;
	let t = I(e.size, [
		.6,
		R,
		1
	]), n = e.align || 0, r = e.gap || 0, i = e.radius;
	i = i == null ? [0, 0] : typeof i == "number" ? [i, 0] : i;
	let a = z(i), o = 1 - t[0], s = I(t[1], R), c = I(t[2], 1), l = I(e.disp, qt), u = I(e.each, (e) => {}), { fill: d, stroke: f } = l;
	return (e, t, i, p) => Jr(e, t, (m, h, g, _, v, y, b, x, S, C, w) => {
		let T = m.pxRound, E = n, D = r * j, O = s * j, k = c * j, ee, te;
		_.ori == 0 ? [ee, te] = a(e, t) : [te, ee] = a(e, t);
		let ne = _.dir * (_.ori == 0 ? 1 : -1), re = _.ori == 0 ? si : ci, ie = _.ori == 0 ? u : (e, t, n, r, i, a, o) => {
			u(e, t, n, i, r, o, a);
		}, ae = I(e.bands, Jt).find((e) => e.series[0] == t), oe = ae == null ? 0 : ae.dir, se = m.fillTo(e, t, m.min, m.max, oe), ce = T(b(se, v, w, S)), le, ue, de, fe = C, pe = T(m.width * j), me = !1, he = null, ge = null, _e = null, ve = null;
		d != null && (pe == 0 || f != null) && (me = !0, he = d.values(e, t, i, p), ge = /* @__PURE__ */ new Map(), new Set(he).forEach((e) => {
			e != null && ge.set(e, new Path2D());
		}), pe > 0 && (_e = f.values(e, t, i, p), ve = /* @__PURE__ */ new Map(), new Set(_e).forEach((e) => {
			e != null && ve.set(e, new Path2D());
		})));
		let { x0: ye, size: be } = l;
		if (ye != null && be != null) {
			E = 1, h = ye.values(e, t, i, p), ye.unit == 2 && (h = h.map((t) => e.posToVal(x + t * C, _.key, !0)));
			let n = be.values(e, t, i, p);
			ue = be.unit == 2 ? n[0] * C : y(n[0], _, C, x) - y(0, _, C, x), fe = yi(h, g, y, _, C, x, fe), de = fe - ue + D;
		} else fe = yi(h, g, y, _, C, x, fe), de = fe * o + D, ue = fe - de;
		de < 1 && (de = 0), pe >= ue / 2 && (pe = 0), de < 5 && (T = B);
		let xe = de > 0, Se = fe - de - (xe ? pe : 0);
		ue = T(Pt(Se, k, O)), le = (E == 0 ? ue / 2 : E == ne ? 0 : ue) - E * ne * ((E == 0 ? D / 2 : 0) + (xe ? pe / 2 : 0));
		let Ce = {
			stroke: null,
			fill: null,
			clip: null,
			band: null,
			gaps: null,
			flags: 0
		}, we = me ? null : new Path2D(), Te = null;
		if (ae != null) Te = e.data[ae.series[1]];
		else {
			let { y0: n, y1: r } = l;
			n != null && r != null && (g = r.values(e, t, i, p), Te = n.values(e, t, i, p));
		}
		let Ee = ee * ue, A = te * ue;
		for (let n = ne == 1 ? i : p; n >= i && n <= p; n += ne) {
			let r = g[n];
			if (r == null) continue;
			if (Te != null) {
				let e = Te[n] ?? 0;
				if (r - e == 0) continue;
				ce = b(e, v, w, S);
			}
			let i = y(_.distr != 2 || l != null ? h[n] : n, _, C, x), a = b(I(r, se), v, w, S), o = T(i - le), s = T(Et(a, ce)), c = T(Tt(a, ce)), u = s - c;
			if (r != null) {
				let i = r < 0 ? A : Ee, a = r < 0 ? Ee : A;
				me ? (pe > 0 && _e[n] != null && re(ve.get(_e[n]), o, c + St(pe / 2), ue, Et(0, u - pe), i, a), he[n] != null && re(ge.get(he[n]), o, c + St(pe / 2), ue, Et(0, u - pe), i, a)) : re(we, o, c + St(pe / 2), ue, Et(0, u - pe), i, a), ie(e, t, n, o - pe / 2, c, ue + pe, u);
			}
		}
		return pe > 0 ? Ce.stroke = me ? ve : we : me || (Ce._fill = m.width == 0 ? m._fill : m._stroke ?? m._fill, Ce.width = 0), Ce.fill = me ? ge : we, Ce;
	});
}
function xi(e, t) {
	let n = I(t?.alignGaps, 0);
	return (t, r, i, a) => Jr(t, r, (o, s, c, l, u, d, f, p, m, h, g) => {
		[i, a] = ot(c, i, a);
		let _ = o.pxRound, v = (e) => _(d(e, l, h, p)), y = (e) => _(f(e, u, g, m)), b, x, S;
		l.ori == 0 ? (b = ri, S = ai, x = di) : (b = ii, S = oi, x = fi);
		let C = l.dir * (l.ori == 0 ? 1 : -1), w = v(s[C == 1 ? i : a]), T = w, E = [], D = [];
		for (let e = C == 1 ? i : a; e >= i && e <= a; e += C) if (c[e] != null) {
			let t = s[e], n = v(t);
			E.push(T = n), D.push(y(c[e]));
		}
		let O = {
			stroke: e(E, D, b, S, x, _),
			fill: null,
			clip: null,
			band: null,
			gaps: null,
			flags: Kr
		}, k = O.stroke, [ee, te] = Yr(t, r);
		if (o.fill != null || ee != 0) {
			let e = O.fill = new Path2D(k), n = y(o.fillTo(t, r, o.min, o.max, ee));
			S(e, T, n), S(e, w, n);
		}
		if (!o.spanGaps) {
			let e = [];
			e.push(...ei(s, c, i, a, C, v, n)), O.gaps = e = o.gaps(t, r, i, a, e), O.clip = Qr(e, l.ori, p, m, h, g);
		}
		return te != 0 && (O.band = te == 2 ? [Zr(t, r, i, a, k, -1), Zr(t, r, i, a, k, 1)] : Zr(t, r, i, a, k, te)), O;
	});
}
function Si(e) {
	return xi(Ci, e);
}
function Ci(e, t, n, r, i, a) {
	let o = e.length;
	if (o < 2) return null;
	let s = new Path2D();
	if (n(s, e[0], t[0]), o == 2) r(s, e[1], t[1]);
	else {
		let n = Array(o), r = Array(o - 1), a = Array(o - 1), c = Array(o - 1);
		for (let n = 0; n < o - 1; n++) a[n] = t[n + 1] - t[n], c[n] = e[n + 1] - e[n], r[n] = a[n] / c[n];
		n[0] = r[0];
		for (let e = 1; e < o - 1; e++) r[e] === 0 || r[e - 1] === 0 || r[e - 1] > 0 != r[e] > 0 ? n[e] = 0 : (n[e] = 3 * (c[e - 1] + c[e]) / ((2 * c[e] + c[e - 1]) / r[e - 1] + (c[e] + 2 * c[e - 1]) / r[e]), isFinite(n[e]) || (n[e] = 0));
		n[o - 1] = r[o - 2];
		for (let r = 0; r < o - 1; r++) i(s, e[r] + c[r] / 3, t[r] + n[r] * c[r] / 3, e[r + 1] - c[r] / 3, t[r + 1] - n[r + 1] * c[r] / 3, e[r + 1], t[r + 1]);
	}
	return s;
}
var wi = /* @__PURE__ */ new Set();
function q() {
	for (let e of wi) e.syncRect(!0);
}
ze && (et(Pe, Ve, q), et(Fe, Ve, q, !0), et(Le, Ve, () => {
	J.pxRatio = j;
}));
var Ti = _i(), Ei = pi();
function Di(e, t, n, r) {
	return (r ? [e[0], e[1]].concat(e.slice(2)) : [e[0]].concat(e.slice(1))).map((e, r) => ki(e, r, t, n));
}
function Oi(e, t) {
	return e.map((e, n) => n == 0 ? {} : W({}, t, e));
}
function ki(e, t, n, r) {
	return W({}, t == 0 ? n : r, e);
}
function Ai(e, t, n) {
	return t == null ? Yt : [t, n];
}
var ji = Ai;
function Mi(e, t, n) {
	return t == null ? Yt : ht(t, n, dt, !0);
}
function Ni(e, t, n, r) {
	return t == null ? Yt : lt(t, n, e.scales[r].log, !1);
}
var Pi = Ni;
function Fi(e, t, n, r) {
	return t == null ? Yt : ut(t, n, e.scales[r].log, !1);
}
var Ii = Fi;
function Li(e, t, n, r, i) {
	let a = Et(Nt(e), Nt(t)), o = t - e, s = nt(i / r * o, n);
	do {
		let e = n[s], t = r * e / o;
		if (t >= i && a + (e < 5 ? Wt.get(e) : 0) <= 17) return [e, t];
	} while (++s < n.length);
	return [0, 0];
}
function Ri(e) {
	let t, n;
	return e = e.replace(/(\d+)px/, (e, r) => (t = Ct((n = +r) * j)) + "px"), [
		e,
		t,
		n
	];
}
function zi(e) {
	e.show && [e.font, e.labelFont].forEach((e) => {
		let t = U(e[2] * j, 1);
		e[0] = e[0].replace(/[0-9.]+px/, t + "px"), e[1] = t;
	});
}
function J(e, t, n) {
	let r = { mode: I(e.mode, 1) }, i = r.mode;
	function a(e, t, n, r) {
		let i = t.valToPct(e);
		return r + n * (t.dir == -1 ? 1 - i : i);
	}
	function o(e, t, n, r) {
		let i = t.valToPct(e);
		return r + n * (t.dir == -1 ? i : 1 - i);
	}
	function s(e, t, n, r) {
		return t.ori == 0 ? a(e, t, n, r) : o(e, t, n, r);
	}
	r.valToPosH = a, r.valToPosV = o;
	let c = !1;
	r.status = 0;
	let l = r.root = qe(te);
	if (e.id != null && (l.id = e.id), We(l, e.class), e.title) {
		let t = qe(ie, l);
		t.textContent = e.title;
	}
	let u = Ke("canvas"), d = r.ctx = u.getContext("2d"), f = qe(ae, l);
	et("click", f, (e) => {
		e.target === m && (q != bi || J != xi) && Y.click(r, e);
	}, !0);
	let p = r.under = qe(oe, f);
	f.appendChild(u);
	let m = r.over = qe(se, f);
	e = an(e);
	let h = +I(e.pxAlign, 1), g = ti(h);
	(e.plugins || []).forEach((t) => {
		t.opts && (e = t.opts(r, e) || e);
	});
	let _ = e.ms || .001, v = r.series = i == 1 ? Di(e.series || [], xr, Br, !1) : Oi(e.series || [null], zr), y = r.axes = Di(e.axes || [], vr, Pr, !0), b = r.scales = {}, x = r.bands = e.bands || [];
	x.forEach((e) => {
		e.fill = z(e.fill || null), e.dir = I(e.dir, -1);
	});
	let S = i == 2 ? v[1].facets[0].scale : v[0].scale, C = {
		axes: ii,
		series: Lr
	}, w = (e.drawOrder || ["axes", "series"]).map((e) => C[e]);
	function T(e) {
		let t = e.distr == 3 ? (t) => kt(t > 0 ? t : e.clamp(r, t, e.min, e.max, e.key)) : e.distr == 4 ? (t) => Mt(t, e.asinh) : e.distr == 100 ? (t) => e.fwd(t) : (e) => e;
		return (n) => {
			let r = t(n), { _min: i, _max: a } = e, o = a - i;
			return (r - i) / o;
		};
	}
	function E(t) {
		let n = b[t];
		if (n == null) {
			let r = (e.scales || qt)[t] || qt;
			if (r.from != null) {
				E(r.from);
				let e = W({}, b[r.from], r, { key: t });
				e.valToPct = T(e), b[t] = e;
			} else {
				n = b[t] = W({}, t == S ? Hr : Ur, r), n.key = t;
				let e = n.time, a = n.range, o = Xt(a);
				if ((t != S || i == 2 && !e) && (o && (a[0] == null || a[1] == null) && (a = {
					min: a[0] == null ? ft : {
						mode: 1,
						hard: a[0],
						soft: a[0]
					},
					max: a[1] == null ? ft : {
						mode: 1,
						hard: a[1],
						soft: a[1]
					}
				}, o = !1), !o && en(a))) {
					let e = a;
					a = (t, n, r) => n == null ? Yt : ht(n, r, e);
				}
				n.range = z(a || (e ? ji : t == S ? n.distr == 3 ? Pi : n.distr == 4 ? Ii : Ai : n.distr == 3 ? Ni : n.distr == 4 ? Fi : Mi)), n.auto = z(!o && n.auto), n.clamp = z(n.clamp || Vr), n._min = n._max = null, n.valToPct = T(n);
			}
		}
	}
	E("x"), E("y"), i == 1 && v.forEach((e) => {
		E(e.scale);
	}), y.forEach((e) => {
		E(e.scale);
	});
	for (let t in e.scales) E(t);
	let D = b[S], O = D.distr, k, ee;
	D.ori == 0 ? (We(l, ne), k = a, ee = o) : (We(l, re), k = o, ee = a);
	let A = {};
	for (let e in b) {
		let t = b[e];
		(t.min != null || t.max != null) && (A[e] = {
			min: t.min,
			max: t.max
		}, t.min = t.max = null);
	}
	let Pe = e.tzDate || ((e) => new Date(Ct(e / _))), Fe = e.fmtDate || Cn, Ie = _ == 1 ? Un(Pe) : Kn(Pe), ze = Jn(Pe, qn(_ == 1 ? Hn : Gn, Fe)), He = Qn(Pe, Xn(Zn, Fe)), Ue = [], M = r.legend = W({}, tr, e.legend), P = r.cursor = W({}, ur, { drag: { y: i == 2 } }, e.cursor), Ye = M.show, Ze = P.show, F = M.markers;
	M.idxs = Ue, F.width = z(F.width), F.dash = z(F.dash), F.stroke = z(F.stroke), F.fill = z(F.fill);
	let $e, rt, it, at = [], ot = [], st, pt = !1, mt = {};
	if (M.live) {
		let e = v[1] ? v[1].values : null;
		pt = e != null, st = pt ? e(r, 1, 0) : { _: 0 };
		for (let e in st) mt[e] = Re;
	}
	if (Ye) {
		if ($e = Ke("table", me, l), it = Ke("tbody", null, $e), M.mount(r, $e), pt) {
			rt = Ke("thead", null, $e, it);
			let e = Ke("tr", null, rt);
			for (var _t in Ke("th", null, e), st) Ke("th", ye, e).textContent = _t;
		} else We($e, ge), M.live && We($e, he);
	}
	let vt = { show: !0 }, yt = { show: !1 };
	function bt(e, t) {
		if (t == 0 && (pt || !M.live || i == 2)) return Yt;
		let n = [], a = Ke("tr", _e, it, it.childNodes[t]);
		We(a, e.class), e.show || We(a, le);
		let o = Ke("th", null, a);
		if (F.show) {
			let e = qe(ve, o);
			if (t > 0) {
				let n = F.width(r, t);
				n && (e.style.border = n + "px " + F.dash(r, t) + " " + F.stroke(r, t)), e.style.background = F.fill(r, t);
			}
		}
		let s = qe(ye, o);
		for (var c in e.label instanceof HTMLElement ? s.appendChild(e.label) : s.textContent = e.label, t > 0 && (F.show || (s.style.color = e.width > 0 ? F.stroke(r, t) : F.fill(r, t)), Ot("click", o, (t) => {
			if (P._lock) return;
			Sn(t);
			let n = v.indexOf(e);
			if ((t.ctrlKey || t.metaKey) != M.isolate) {
				let e = v.some((e, t) => t > 0 && t != n && e.show);
				v.forEach((t, r) => {
					r > 0 && Gi(r, e ? r == n ? vt : yt : vt, !0, $.setSeries);
				});
			} else Gi(n, { show: !e.show }, !0, $.setSeries);
		}, !1), En && Ot(je, o, (t) => {
			P._lock || (Sn(t), Gi(v.indexOf(e), $i, !0, $.setSeries));
		}, !1)), st) {
			let e = Ke("td", be, a);
			e.textContent = "--", n.push(e);
		}
		return [a, n];
	}
	let St = /* @__PURE__ */ new Map();
	function Ot(e, t, n, i = !0) {
		let a = St.get(t) || {}, o = P.bind[e](r, t, n, i);
		o && (et(e, t, a[e] = o), St.set(t, a));
	}
	function At(e, t, n) {
		let r = St.get(t) || {};
		for (let n in r) (e == null || n == e) && (tt(n, t, r[n]), delete r[n]);
		e ?? St.delete(t);
	}
	let Nt = 0, It = 0, B = 0, V = 0, H = 0, Ht = 0, Ut = H, Kt = Ht, Zt = B, nn = V, rn = 0, on = 0, sn = 0, cn = 0;
	r.bbox = {};
	let ln = !1, un = !1, fn = !1, pn = !1, mn = !1, hn = !1;
	function gn(e, t, n) {
		(n || e != r.width || t != r.height) && _n(e, t), ai(!1), fn = !0, un = !0, ui();
	}
	function _n(e, t) {
		r.width = Nt = B = e, r.height = It = V = t, H = Ht = 0, bn(), xn();
		let n = r.bbox;
		rn = n.left = Vt(H * j, .5), on = n.top = Vt(Ht * j, .5), sn = n.width = Vt(B * j, .5), cn = n.height = Vt(V * j, .5);
	}
	function vn() {
		let e = !1, t = 0;
		for (; !e;) {
			t++;
			let n = ni(t), i = ri(t);
			e = t == 3 || n && i, e || (_n(r.width, r.height), un = !0);
		}
	}
	function yn({ width: e, height: t }) {
		gn(e, t);
	}
	r.setSize = yn;
	function bn() {
		let e = !1, t = !1, n = !1, r = !1;
		y.forEach((i, a) => {
			if (i.show && i._show) {
				let { side: a, _size: o } = i, s = a % 2, c = o + (i.label == null ? 0 : i.labelSize);
				c > 0 && (s ? (B -= c, a == 3 ? (H += c, r = !0) : n = !0) : (V -= c, a == 0 ? (Ht += c, e = !0) : t = !0));
			}
		}), Ln[0] = e, Ln[1] = n, Ln[2] = t, Ln[3] = r, B -= Bn[1] + Bn[3], H += Bn[3], V -= Bn[2] + Bn[0], Ht += Bn[0];
	}
	function xn() {
		let e = H + B, t = Ht + V, n = H, r = Ht;
		function i(i, a) {
			switch (i) {
				case 1: return e += a, e - a;
				case 2: return t += a, t - a;
				case 3: return n -= a, n + a;
				case 0: return r -= a, r + a;
			}
		}
		y.forEach((e, t) => {
			if (e.show && e._show) {
				let t = e.side;
				e._pos = i(t, e._size), e.label != null && (e._lpos = i(t, e.labelSize));
			}
		});
	}
	if (P.dataIdx == null) {
		let e = P.hover, n = e.skip = new Set(e.skip ?? []);
		n.add(void 0);
		let r = e.prox = z(e.prox), i = e.bias ??= 0;
		P.dataIdx = (e, a, o, s) => {
			if (a == 0) return o;
			let c = o, l = r(e, a, o, s) ?? R, u = l >= 0 && l < R, d = D.ori == 0 ? B : V, f = P.left, p = t[0], m = t[a];
			if (n.has(m[o])) {
				c = null;
				let e = null, t = null, r;
				if (i == 0 || i == -1) for (r = o; e == null && r-- > 0;) n.has(m[r]) || (e = r);
				if (i == 0 || i == 1) for (r = o; t == null && r++ < m.length;) n.has(m[r]) || (t = r);
				if (e != null || t != null) {
					if (u) {
						let n = e == null ? -Infinity : k(p[e], D, d, 0), r = t == null ? Infinity : k(p[t], D, d, 0), i = f - n, a = r - f;
						i <= a ? i <= l && (c = e) : a <= l && (c = t);
					} else c = t == null ? e : e == null ? t : o - e <= t - o ? e : t;
				}
			} else u && L(f - k(p[o], D, d, 0)) > l && (c = null);
			return c;
		};
	}
	let Sn = (e) => {
		P.event = e;
	};
	P.idxs = Ue, P._lock = !1;
	let wn = P.points;
	wn.show = z(wn.show), wn.size = z(wn.size), wn.stroke = z(wn.stroke), wn.width = z(wn.width), wn.fill = z(wn.fill);
	let Tn = r.focus = W({}, e.focus || { alpha: .3 }, P.focus), En = Tn.prox >= 0, Dn = En && wn.one, On = [], kn = [], Mn = [];
	function Nn(e, t) {
		let n = wn.show(r, t);
		if (n instanceof HTMLElement) return We(n, pe), We(n, e.class), Je(n, -10, -10, B, V), m.insertBefore(n, On[t]), n;
	}
	function Pn(e, t) {
		if (i == 1 || t > 0) {
			let t = i == 1 && b[e.scale].time, n = e.value;
			e.value = t ? $t(n) ? Qn(Pe, Xn(n, Fe)) : n || He : n || Nr, e.label = e.label || (t ? br : yr);
		}
		if (Dn || t > 0) {
			e.width = e.width == null ? 1 : e.width, e.paths = e.paths || Ti || Rt, e.fillTo = z(e.fillTo || Xr), e.pxAlign = +I(e.pxAlign, h), e.pxRound = ti(e.pxAlign), e.stroke = z(e.stroke || null), e.fill = z(e.fill || null), e._stroke = e._fill = e._paths = e._focus = null;
			let t = Fr(Et(1, e.width), 1), n = e.points = W({}, {
				size: t,
				width: Et(1, t * .2),
				stroke: e.stroke,
				space: t * 2,
				paths: Ei,
				_stroke: null,
				_fill: null
			}, e.points);
			n.show = z(n.show), n.filter = z(n.filter), n.fill = z(n.fill), n.stroke = z(n.stroke), n.paths = z(n.paths), n.pxAlign = e.pxAlign;
		}
		if (Ye) {
			let n = bt(e, t);
			at.splice(t, 0, n[0]), ot.splice(t, 0, n[1]), M.values.push(null);
		}
		if (Ze) {
			Ue.splice(t, 0, null);
			let n = null;
			Dn ? t == 0 && (n = Nn(e, t)) : t > 0 && (n = Nn(e, t)), On.splice(t, 0, n), kn.splice(t, 0, 0), Mn.splice(t, 0, 0);
		}
		Oa("addSeries", t);
	}
	function Fn(e, t) {
		t ??= v.length, e = i == 1 ? ki(e, t, xr, Br) : ki(e, t, {}, zr), v.splice(t, 0, e), Pn(v[t], t);
	}
	r.addSeries = Fn;
	function In(e) {
		if (v.splice(e, 1), Ye) {
			M.values.splice(e, 1), ot.splice(e, 1);
			let t = at.splice(e, 1)[0];
			At(null, t.firstChild), t.remove();
		}
		Ze && (Ue.splice(e, 1), On.splice(e, 1)[0].remove(), kn.splice(e, 1), Mn.splice(e, 1)), Oa("delSeries", e);
	}
	r.delSeries = In;
	let Ln = [
		!1,
		!1,
		!1,
		!1
	];
	function Rn(e, t) {
		if (e._show = e.show, e.show) {
			let n = e.side % 2, i = b[e.scale];
			i ??= (e.scale = n ? v[1].scale : S, b[e.scale]);
			let a = i.time;
			e.size = z(e.size), e.space = z(e.space), e.rotate = z(e.rotate), Xt(e.incrs) && e.incrs.forEach((e) => {
				!Wt.has(e) && Wt.set(e, Gt(e));
			}), e.incrs = z(e.incrs || (i.distr == 2 ? An : a ? _ == 1 ? Vn : Wn : jn)), e.splits = z(e.splits || (a && i.distr == 1 ? Ie : i.distr == 3 ? wr : i.distr == 4 ? Tr : Cr)), e.stroke = z(e.stroke), e.grid.stroke = z(e.grid.stroke), e.ticks.stroke = z(e.ticks.stroke), e.border.stroke = z(e.border.stroke);
			let o = e.values;
			e.values = Xt(o) && !Xt(o[0]) ? z(o) : a ? Xt(o) ? Jn(Pe, qn(o, Fe)) : $t(o) ? Yn(Pe, o) : o || ze : o || Sr, e.filter = z(e.filter || (i.distr >= 3 && i.log == 10 ? jr : i.distr == 3 && i.log == 2 ? Mr : Lt)), e.font = Ri(e.font), e.labelFont = Ri(e.labelFont), e._size = e.size(r, null, t, 0), e._space = e._rotate = e._incrs = e._found = e._splits = e._values = null, e._size > 0 && (Ln[t] = !0, e._el = qe(ce, f));
		}
	}
	function zn(e, t, n, r) {
		let [i, a, o, s] = n, c = t % 2, l = 0;
		return c == 0 && (s || a) && (l = t == 0 && !i || t == 2 && !o ? Ct(vr.size / 3) : 0), c == 1 && (i || o) && (l = t == 1 && !a || t == 3 && !s ? Ct(Pr.size / 2) : 0), l;
	}
	let G = r.padding = (e.padding || [
		zn,
		zn,
		zn,
		zn
	]).map((e) => z(I(e, zn))), Bn = r._padding = G.map((e, t) => e(r, t, Ln, 0)), K, $n = null, er = null, nr = i == 1 ? v[0].idxs : null, rr = null, ir = !1;
	function ar(e, n) {
		if (t = e ?? [], r.data = r._data = t, i == 2) {
			K = 0;
			for (let e = 1; e < v.length; e++) K += t[e][0].length;
		} else {
			t.length == 0 && (r.data = r._data = t = [[]]), rr = t[0], K = rr.length;
			let e = t;
			if (O == 2) {
				e = t.slice();
				let n = e[0] = Array(K);
				for (let e = 0; e < K; e++) n[e] = e;
			}
			r._data = t = e;
		}
		if (ai(!0), Oa("setData"), O == 2 && (fn = !0), n !== !1) {
			let e = D;
			e.auto(r, ir) ? or() : Wi(S, e.min, e.max), pn ||= P.left >= 0, hn = !0, ui();
		}
	}
	r.setData = ar;
	function or() {
		ir = !0;
		let e, n;
		i == 1 && (K > 0 ? ($n = nr[0] = 0, er = nr[1] = K - 1, e = t[0][$n], n = t[0][er], O == 2 ? (e = $n, n = er) : e == n && (O == 3 ? [e, n] = lt(e, e, D.log, !1) : O == 4 ? [e, n] = ut(e, e, D.log, !1) : D.time ? n = e + Ct(86400 / _) : [e, n] = ht(e, n, dt, !0))) : ($n = nr[0] = e = null, er = nr[1] = n = null)), Wi(S, e, n);
	}
	let sr, cr, lr, dr, fr, pr, mr, hr, gr, _r;
	function Er(e, t, n, r, i, a) {
		e ??= De, n ??= Jt, r ??= "butt", i ??= De, a ??= "round", e != sr && (d.strokeStyle = sr = e), i != cr && (d.fillStyle = cr = i), t != lr && (d.lineWidth = lr = t), a != fr && (d.lineJoin = fr = a), r != pr && (d.lineCap = pr = r), n != dr && d.setLineDash(dr = n);
	}
	function Dr(e, t, n, r) {
		t != cr && (d.fillStyle = cr = t), e != mr && (d.font = mr = e), n != hr && (d.textAlign = hr = n), r != gr && (d.textBaseline = gr = r);
	}
	function Or(e, t, n, i, a = 0) {
		if (i.length > 0 && e.auto(r, ir) && (t == null || t.min == null)) {
			let t = I($n, 0), r = I(er, i.length - 1), o = n.min == null ? ct(i, t, r, a, e.distr == 3) : [n.min, n.max];
			e.min = Tt(e.min, n.min = o[0]), e.max = Et(e.max, n.max = o[1]);
		}
	}
	let kr = {
		min: null,
		max: null
	};
	function Ar() {
		for (let e in b) {
			let t = b[e];
			A[e] == null && (t.min == null || A[S] != null && t.auto(r, ir)) && (A[e] = kr);
		}
		for (let e in b) {
			let t = b[e];
			A[e] == null && t.from != null && A[t.from] != null && (A[e] = kr);
		}
		A[S] != null && ai(!0);
		let e = {};
		for (let t in A) {
			let n = A[t];
			if (n != null) {
				let a = e[t] = an(b[t], tn);
				if (n.min != null) W(a, n);
				else if (t != S || i == 2) {
					if (K == 0 && a.from == null) {
						let e = a.range(r, null, null, t);
						a.min = e[0], a.max = e[1];
					} else a.min = R, a.max = -Infinity;
				}
			}
		}
		if (K > 0) {
			v.forEach((n, a) => {
				if (i == 1) {
					let i = n.scale, o = A[i];
					if (o == null) return;
					let s = e[i];
					if (a == 0) {
						let e = s.range(r, s.min, s.max, i);
						s.min = e[0], s.max = e[1], $n = nt(s.min, t[0]), er = nt(s.max, t[0]), er - $n > 1 && (t[0][$n] < s.min && $n++, t[0][er] > s.max && er--), n.min = rr[$n], n.max = rr[er];
					} else n.show && n.auto && Or(s, o, n, t[a], n.sorted);
					n.idxs[0] = $n, n.idxs[1] = er;
				} else if (a > 0 && n.show && n.auto) {
					let [r, i] = n.facets, o = r.scale, s = i.scale, [c, l] = t[a], u = e[o], d = e[s];
					u != null && Or(u, A[o], r, c, r.sorted), d != null && Or(d, A[s], i, l, i.sorted), n.min = i.min, n.max = i.max;
				}
			});
			for (let t in e) {
				let n = e[t], i = A[t];
				if (n.from == null && (i == null || i.min == null)) {
					let e = n.range(r, n.min == R ? null : n.min, n.max == -Infinity ? null : n.max, t);
					n.min = e[0], n.max = e[1];
				}
			}
		}
		for (let t in e) {
			let n = e[t];
			if (n.from != null) {
				let i = e[n.from];
				if (i.min == null) n.min = n.max = null;
				else {
					let e = n.range(r, i.min, i.max, t);
					n.min = e[0], n.max = e[1];
				}
			}
		}
		let n = {}, a = !1;
		for (let t in e) {
			let r = e[t], i = b[t];
			if (i.min != r.min || i.max != r.max) {
				i.min = r.min, i.max = r.max;
				let e = i.distr;
				i._min = e == 3 ? kt(i.min) : e == 4 ? Mt(i.min, i.asinh) : e == 100 ? i.fwd(i.min) : i.min, i._max = e == 3 ? kt(i.max) : e == 4 ? Mt(i.max, i.asinh) : e == 100 ? i.fwd(i.max) : i.max, n[t] = a = !0;
			}
		}
		if (a) {
			v.forEach((e, t) => {
				i == 2 ? t > 0 && n.y && (e._paths = null) : n[e.scale] && (e._paths = null);
			});
			for (let e in n) fn = !0, Oa("setScale", e);
			Ze && P.left >= 0 && (pn = hn = !0);
		}
		for (let e in A) A[e] = null;
	}
	function Ir(e) {
		let t = Pt($n - 1, 0, K - 1), n = Pt(er + 1, 0, K - 1);
		for (; e[t] == null && t > 0;) t--;
		for (; e[n] == null && n < K - 1;) n++;
		return [t, n];
	}
	function Lr() {
		if (K > 0) {
			let e = v.some((e) => e._focus) && _r != Tn.alpha;
			e && (d.globalAlpha = _r = Tn.alpha), v.forEach((e, n) => {
				if (n > 0 && e.show && (Rr(n, !1), Rr(n, !0), e._paths == null)) {
					let a = _r;
					_r != e.alpha && (d.globalAlpha = _r = e.alpha);
					let o = i == 2 ? [0, t[n][0].length - 1] : Ir(t[n]);
					e._paths = e.paths(r, n, o[0], o[1]), _r != a && (d.globalAlpha = _r = a);
				}
			}), v.forEach((e, t) => {
				if (t > 0 && e.show) {
					let n = _r;
					_r != e.alpha && (d.globalAlpha = _r = e.alpha), e._paths != null && Wr(t, !1);
					{
						let n = e._paths == null ? null : e._paths.gaps, i = e.points.show(r, t, $n, er, n), a = e.points.filter(r, t, i, n);
						(i || a) && (e.points._paths = e.points.paths(r, t, $n, er, a), Wr(t, !0));
					}
					_r != n && (d.globalAlpha = _r = n), Oa("drawSeries", t);
				}
			}), e && (d.globalAlpha = _r = 1);
		}
	}
	function Rr(e, t) {
		let n = t ? v[e].points : v[e];
		n._stroke = n.stroke(r, e), n._fill = n.fill(r, e);
	}
	function Wr(e, t) {
		let n = t ? v[e].points : v[e], { stroke: r, fill: i, clip: a, flags: o, _stroke: s = n._stroke, _fill: c = n._fill, _width: l = n.width } = n._paths;
		l = U(l * j, 3);
		let u = null, f = l % 2 / 2;
		t && c == null && (c = l > 0 ? "#fff" : s);
		let p = n.pxAlign == 1 && f > 0;
		if (p && d.translate(f, f), !t) {
			let e = rn - l / 2, t = on - l / 2, n = sn + l, r = cn + l;
			u = new Path2D(), u.rect(e, t, n, r);
		}
		t ? Yr(s, l, n.dash, n.cap, c, r, i, o, a) : Jr(e, s, l, n.dash, n.cap, c, r, i, o, u, a), p && d.translate(-f, -f);
	}
	function Jr(e, n, i, a, o, s, c, l, u, d, f) {
		let p = !1;
		u != 0 && x.forEach((m, h) => {
			if (m.series[0] == e) {
				let e = v[m.series[1]], g = t[m.series[1]], _ = (e._paths || qt).band;
				Xt(_) && (_ = m.dir == 1 ? _[0] : _[1]);
				let y, b = null;
				e.show && _ && gt(g, $n, er) ? (b = m.fill(r, h) || s, y = e._paths.clip) : _ = null, Yr(n, i, a, o, b, c, l, u, d, f, y, _), p = !0;
			}
		}), p || Yr(n, i, a, o, s, c, l, u, d, f);
	}
	function Yr(e, t, n, r, i, a, o, s, c, l, u, f) {
		Er(e, t, n, r, i), (c || l || f) && (d.save(), c && d.clip(c), l && d.clip(l)), f ? (s & 3) == 3 ? (d.clip(f), u && d.clip(u), Qr(i, o), Zr(e, a, t)) : s & qr ? (Qr(i, o), d.clip(f), Zr(e, a, t)) : s & Kr && (d.save(), d.clip(f), u && d.clip(u), Qr(i, o), d.restore(), Zr(e, a, t)) : (Qr(i, o), Zr(e, a, t)), (c || l || f) && d.restore();
	}
	function Zr(e, t, n) {
		n > 0 && (t instanceof Map ? t.forEach((e, t) => {
			d.strokeStyle = sr = t, d.stroke(e);
		}) : t != null && e && d.stroke(t));
	}
	function Qr(e, t) {
		t instanceof Map ? t.forEach((e, t) => {
			d.fillStyle = cr = t, d.fill(e);
		}) : t != null && e && d.fill(t);
	}
	function $r(e, t, n, i) {
		let a = y[e], o;
		if (i <= 0) o = [0, 0];
		else {
			let s = a._space = a.space(r, e, t, n, i);
			o = Li(t, n, a._incrs = a.incrs(r, e, t, n, i, s), i, s);
		}
		return a._found = o;
	}
	function ei(e, t, n, r, i, a, o, s, c, l) {
		let u = o % 2 / 2;
		h == 1 && d.translate(u, u), Er(s, o, c, l, s), d.beginPath();
		let f, p, m, g, _ = i + (r == 0 || r == 3 ? -a : a);
		n == 0 ? (p = i, g = _) : (f = i, m = _);
		for (let r = 0; r < e.length; r++) t[r] != null && (n == 0 ? f = m = e[r] : p = g = e[r], d.moveTo(f, p), d.lineTo(m, g));
		d.stroke(), h == 1 && d.translate(-u, -u);
	}
	function ni(e) {
		let t = !0;
		return y.forEach((n, i) => {
			if (!n.show) return;
			let a = b[n.scale];
			if (a.min == null) {
				n._show && (t = !1, n._show = !1, ai(!1));
				return;
			}
			n._show || (t = !1, n._show = !0, ai(!1));
			let o = n.side, s = o % 2, { min: c, max: l } = a, [u, d] = $r(i, c, l, s == 0 ? B : V);
			if (d == 0) return;
			let f = a.distr == 2, p = n._splits = n.splits(r, i, c, l, u, d, f), m = a.distr == 2 ? p.map((e) => rr[e]) : p, h = a.distr == 2 ? rr[p[1]] - rr[p[0]] : u, g = n._values = n.values(r, n.filter(r, m, i, d, h), i, d, h);
			n._rotate = o == 2 ? n.rotate(r, g, i, d) : 0;
			let _ = n._size;
			n._size = wt(n.size(r, g, i, e)), _ != null && n._size != _ && (t = !1);
		}), t;
	}
	function ri(e) {
		let t = !0;
		return G.forEach((n, i) => {
			let a = n(r, i, Ln, e);
			a != Bn[i] && (t = !1), Bn[i] = a;
		}), t;
	}
	function ii() {
		for (let e = 0; e < y.length; e++) {
			let t = y[e];
			if (!t.show || !t._show) continue;
			let n = t.side, i = n % 2, a, o, c = t.stroke(r, e), l = n == 0 || n == 3 ? -1 : 1, [u, f] = t._found;
			if (t.label != null) {
				let s = t.labelGap * l, p = Ct((t._lpos + s) * j);
				Dr(t.labelFont[0], c, "center", n == 2 ? Ce : we), d.save(), i == 1 ? (a = o = 0, d.translate(p, Ct(on + cn / 2)), d.rotate((n == 3 ? -xt : xt) / 2)) : (a = Ct(rn + sn / 2), o = p);
				let m = Ft(t.label) ? t.label(r, e, u, f) : t.label;
				d.fillText(m, a, o), d.restore();
			}
			if (f == 0) continue;
			let p = b[t.scale], m = i == 0 ? sn : cn, h = i == 0 ? rn : on, _ = t._splits, v = p.distr == 2 ? _.map((e) => rr[e]) : _, x = p.distr == 2 ? rr[_[1]] - rr[_[0]] : u, S = t.ticks, C = t.border, w = S.show ? S.size : 0, T = Ct(w * j), E = Ct((t.alignTo == 2 ? t._size - w - t.gap : t.gap) * j), D = t._rotate * -xt / 180, O = g(t._pos * j), k = O + (T + E) * l;
			o = i == 0 ? k : 0, a = i == 1 ? k : 0;
			let ee = t.font[0];
			Dr(ee, c, t.align == 1 ? Te : t.align == 2 ? Ee : D > 0 ? Te : D < 0 ? Ee : i == 0 ? "center" : n == 3 ? Ee : Te, D || i == 1 ? "middle" : n == 2 ? Ce : we);
			let te = t.font[1] * t.lineGap, ne = _.map((e) => g(s(e, p, m, h))), re = t._values;
			for (let e = 0; e < re.length; e++) {
				let t = re[e];
				if (t != null) {
					i == 0 ? a = ne[e] : o = ne[e], t = "" + t;
					let n = t.indexOf("\n") == -1 ? [t] : t.split(/\n/gm);
					for (let e = 0; e < n.length; e++) {
						let t = n[e];
						D ? (d.save(), d.translate(a, o + e * te), d.rotate(D), d.fillText(t, 0, 0), d.restore()) : d.fillText(t, a, o + e * te);
					}
				}
			}
			S.show && ei(ne, S.filter(r, v, e, f, x), i, n, O, T, U(S.width * j, 3), S.stroke(r, e), S.dash, S.cap);
			let ie = t.grid;
			ie.show && ei(ne, ie.filter(r, v, e, f, x), i, i == 0 ? 2 : 1, i == 0 ? on : rn, i == 0 ? cn : sn, U(ie.width * j, 3), ie.stroke(r, e), ie.dash, ie.cap), C.show && ei([O], [1], +(i == 0), i == 0 ? 1 : 2, i == 1 ? on : rn, i == 1 ? cn : sn, U(C.width * j, 3), C.stroke(r, e), C.dash, C.cap);
		}
		Oa("drawAxes");
	}
	function ai(e) {
		v.forEach((t, n) => {
			n > 0 && (t._paths = null, e && (i == 1 ? (t.min = null, t.max = null) : t.facets.forEach((e) => {
				e.min = null, e.max = null;
			})));
		});
	}
	let oi = !1, si = !1, ci = [];
	function li() {
		si = !1;
		for (let e = 0; e < ci.length; e++) Oa(...ci[e]);
		ci.length = 0;
	}
	function ui() {
		oi ||= (dn(fi), !0);
	}
	function di(e, t = !1) {
		oi = !0, si = t, e(r), fi(), t && ci.length > 0 && queueMicrotask(li);
	}
	r.batch = di;
	function fi() {
		if (ln &&= (Ar(), !1), fn &&= (vn(), !1), un) {
			if (N(p, Te, H), N(p, Ce, Ht), N(p, xe, B), N(p, Se, V), N(m, Te, H), N(m, Ce, Ht), N(m, xe, B), N(m, Se, V), N(f, xe, Nt), N(f, Se, It), u.width = Ct(Nt * j), u.height = Ct(It * j), y.forEach(({ _el: e, _show: t, _size: n, _pos: r, side: i }) => {
				if (e != null) {
					if (t) {
						let t = i === 3 || i === 0 ? n : 0, a = i % 2 == 1;
						N(e, a ? "left" : "top", r - t), N(e, a ? "width" : "height", n), N(e, a ? "top" : "left", a ? Ht : H), N(e, a ? "height" : "width", a ? V : B), Ge(e, le);
					} else We(e, le);
				}
			}), sr = cr = lr = fr = pr = mr = hr = gr = dr = null, _r = 1, fa(!0), H != Ut || Ht != Kt || B != Zt || V != nn) {
				ai(!1);
				let e = B / Zt, t = V / nn;
				if (Ze && !pn && P.left >= 0) {
					P.left *= e, P.top *= t, gi && Je(gi, Ct(P.left), 0, B, V), _i && Je(_i, 0, Ct(P.top), B, V);
					for (let n = 0; n < On.length; n++) {
						let r = On[n];
						r != null && (kn[n] *= e, Mn[n] *= t, Je(r, wt(kn[n]), wt(Mn[n]), B, V));
					}
				}
				if (Q.show && !mn && Q.left >= 0 && Q.width > 0) {
					Q.left *= e, Q.width *= e, Q.top *= t, Q.height *= t;
					for (let e in ha) N(Vi, e, Q[e]);
				}
				Ut = H, Kt = Ht, Zt = B, nn = V;
			}
			Oa("setSize"), un = !1;
		}
		Nt > 0 && It > 0 && (d.clearRect(0, 0, u.width, u.height), Oa("drawClear"), w.forEach((e) => e()), Oa("draw")), Q.show && mn && (Hi(Q), mn = !1), Ze && pn && (ua(null, !0, !1), pn = !1), M.show && M.live && hn && (ca(), hn = !1), c || (c = !0, r.status = 1, Oa("ready")), ir = !1, oi = !1;
	}
	r.redraw = (e, t) => {
		fn = t || !1, e === !1 ? ui() : Wi(S, D.min, D.max);
	};
	function pi(e, n) {
		let i = b[e];
		if (i.from == null) {
			if (K == 0) {
				let t = i.range(r, n.min, n.max, e);
				n.min = t[0], n.max = t[1];
			}
			if (n.min > n.max) {
				let e = n.min;
				n.min = n.max, n.max = e;
			}
			if (K > 1 && n.min != null && n.max != null && n.max - n.min < 1e-16) return;
			e == S && i.distr == 2 && K > 0 && (n.min = nt(n.min, t[0]), n.max = nt(n.max, t[0]), n.min == n.max && n.max++), A[e] = n, ln = !0, ui();
		}
	}
	r.setScale = pi;
	let mi, hi, gi, _i, vi, yi, bi, xi, Si, Ci, q, J, Bi = !1, Y = P.drag, X = Y.x, Z = Y.y;
	Ze && (P.x && (mi = qe(de, m)), P.y && (hi = qe(fe, m)), D.ori == 0 ? (gi = mi, _i = hi) : (gi = hi, _i = mi), q = P.left, J = P.top);
	let Q = r.select = W({
		show: !0,
		over: !0,
		left: 0,
		width: 0,
		top: 0,
		height: 0
	}, e.select), Vi = Q.show ? qe(ue, Q.over ? m : p) : null;
	function Hi(e, t) {
		if (Q.show) {
			for (let t in e) Q[t] = e[t], t in ha && N(Vi, t, e[t]);
			t !== !1 && Oa("setSelect");
		}
	}
	r.setSelect = Hi;
	function Ui(e) {
		if (v[e].show) Ye && Ge(at[e], le);
		else if (Ye && We(at[e], le), Ze) {
			let t = Dn ? On[0] : On[e];
			t != null && Je(t, -10, -10, B, V);
		}
	}
	function Wi(e, t, n) {
		pi(e, {
			min: t,
			max: n
		});
	}
	function Gi(e, t, n, a) {
		t.focus != null && ea(e), t.show != null && v.forEach((n, r) => {
			r > 0 && (e == r || e == null) && (n.show = t.show, Ui(r), i == 2 ? (Wi(n.facets[0].scale, null, null), Wi(n.facets[1].scale, null, null)) : Wi(n.scale, null, null), ui());
		}), n !== !1 && Oa("setSeries", e, t), a && Ma("setSeries", r, e, t);
	}
	r.setSeries = Gi;
	function Ki(e, t) {
		W(x[e], t);
	}
	function qi(e, t) {
		e.fill = z(e.fill || null), e.dir = I(e.dir, -1), t ??= x.length, x.splice(t, 0, e);
	}
	function Ji(e) {
		e == null ? x.length = 0 : x.splice(e, 1);
	}
	r.addBand = qi, r.setBand = Ki, r.delBand = Ji;
	function Yi(e, t) {
		v[e].alpha = t, Ze && On[e] != null && (On[e].style.opacity = t), Ye && at[e] && (at[e].style.opacity = t);
	}
	let Xi, Zi, Qi, $i = { focus: !0 };
	function ea(e) {
		if (e != Qi) {
			let t = e == null, n = Tn.alpha != 1;
			v.forEach((r, a) => {
				if (i == 1 || a > 0) {
					let i = t || a == 0 || a == e;
					r._focus = t ? null : i, n && Yi(a, i ? 1 : Tn.alpha);
				}
			}), Qi = e, n && ui();
		}
	}
	Ye && En && Ot(Me, $e, (e) => {
		P._lock || (Sn(e), Qi != null && Gi(null, $i, !0, $.setSeries));
	});
	function ta(e, t, n) {
		let r = b[t];
		n && (e = e / j - (r.ori == 1 ? Ht : H));
		let i = B;
		r.ori == 1 && (i = V, e = i - e), r.dir == -1 && (e = i - e);
		let a = r._min, o = r._max, s = e / i, c = a + (o - a) * s, l = r.distr;
		return l == 3 ? Dt(10, c) : l == 4 ? jt(c, r.asinh) : l == 100 ? r.bwd(c) : c;
	}
	function na(e, n) {
		return nt(ta(e, S, n), t[0], $n, er);
	}
	r.valToIdx = (e) => nt(e, t[0]), r.posToIdx = na, r.posToVal = ta, r.valToPos = (e, t, n) => b[t].ori == 0 ? a(e, b[t], n ? sn : B, n ? rn : 0) : o(e, b[t], n ? cn : V, n ? on : 0), r.setCursor = (e, t, n) => {
		q = e.left, J = e.top, ua(null, t, n);
	};
	function ra(e, t) {
		N(Vi, Te, Q.left = e), N(Vi, xe, Q.width = t);
	}
	function ia(e, t) {
		N(Vi, Ce, Q.top = e), N(Vi, Se, Q.height = t);
	}
	let aa = D.ori == 0 ? ra : ia, oa = D.ori == 1 ? ra : ia;
	function sa() {
		if (Ye && M.live) for (let e = +(i == 2); e < v.length; e++) {
			if (e == 0 && pt) continue;
			let t = M.values[e], n = 0;
			for (let r in t) ot[e][n++].firstChild.nodeValue = t[r];
		}
	}
	function ca(e, t) {
		if (e != null && (e.idxs ? e.idxs.forEach((e, t) => {
			Ue[t] = e;
		}) : Qt(e.idx) || Ue.fill(e.idx), M.idx = Ue[0]), Ye && M.live) {
			for (let e = 0; e < v.length; e++) (e > 0 || i == 1 && !pt) && la(e, Ue[e]);
			sa();
		}
		hn = !1, t !== !1 && Oa("setLegend");
	}
	r.setLegend = ca;
	function la(e, n) {
		let i = v[e], a = e == 0 && O == 2 ? rr : t[e], o;
		pt ? o = i.values(r, e, n) ?? mt : (o = i.value(r, n == null ? null : a[n], e, n), o = o == null ? mt : { _: o }), M.values[e] = o;
	}
	function ua(e, n, a) {
		Si = q, Ci = J, [q, J] = P.move(r, q, J), P.left = q, P.top = J, Ze && (gi && Je(gi, Ct(q), 0, B, V), _i && Je(_i, 0, Ct(J), B, V));
		let o, s = $n > er;
		Xi = R, Zi = null;
		let c = D.ori == 0 ? B : V, l = D.ori == 1 ? B : V;
		if (q < 0 || K == 0 || s) {
			o = P.idx = null;
			for (let e = 0; e < v.length; e++) {
				let t = On[e];
				t != null && Je(t, -10, -10, B, V);
			}
			En && Gi(null, $i, !0, e == null && $.setSeries), M.live && (Ue.fill(o), hn = !0);
		} else {
			let e, n, a;
			i == 1 && (e = D.ori == 0 ? q : J, n = ta(e, S), o = P.idx = nt(n, t[0], $n, er), a = k(t[0][o], D, c, 0));
			let s = -10, u = -10, d = 0, f = 0, p = !0, m = "", h = "";
			for (let e = +(i == 2); e < v.length; e++) {
				let g = v[e], _ = Ue[e], y = _ == null ? null : i == 1 ? t[e][_] : t[e][1][_], x = P.dataIdx(r, e, o, n), S = x == null ? null : i == 1 ? t[e][x] : t[e][1][x];
				if (hn = hn || S != y || x != _, Ue[e] = x, e > 0 && g.show) {
					let n = x == null ? -10 : x == o ? a : k(i == 1 ? t[0][x] : t[e][0][x], D, c, 0), _ = S == null ? -10 : ee(S, i == 1 ? b[g.scale] : b[g.facets[1].scale], l, 0);
					if (En && S != null) {
						let t = D.ori == 1 ? q : J, n = L(Tn.dist(r, e, x, _, t));
						if (n < Xi) {
							let r = Tn.bias;
							if (r != 0) {
								let i = ta(t, g.scale), a = S >= 0 ? 1 : -1, o = i >= 0 ? 1 : -1;
								o == a && (o == 1 ? r == 1 ? S >= i : S <= i : r == 1 ? S <= i : S >= i) && (Xi = n, Zi = e);
							} else Xi = n, Zi = e;
						}
					}
					if (hn || Dn) {
						let t, i;
						D.ori == 0 ? (t = n, i = _) : (t = _, i = n);
						let a, o, c, l, g, v, y = !0, b = wn.bbox;
						if (b != null) {
							y = !1;
							let t = b(r, e);
							c = t.left, l = t.top, a = t.width, o = t.height;
						} else c = t, l = i, a = o = wn.size(r, e);
						if (v = wn.fill(r, e), g = wn.stroke(r, e), Dn) e == Zi && Xi <= Tn.prox && (s = c, u = l, d = a, f = o, p = y, m = v, h = g);
						else {
							let t = On[e];
							t != null && (kn[e] = c, Mn[e] = l, Qe(t, a, o, y), Xe(t, v, g), Je(t, wt(c), wt(l), B, V));
						}
					}
				}
			}
			if (Dn) {
				let e = Tn.prox;
				if (hn || (Qi == null ? Xi <= e : Xi > e || Zi != Qi)) {
					let e = On[0];
					e != null && (kn[0] = s, Mn[0] = u, Qe(e, d, f, p), Xe(e, m, h), Je(e, wt(s), wt(u), B, V));
				}
			}
		}
		if (Q.show && Bi) {
			if (e != null) {
				let [t, n] = $.scales, [r, i] = $.match, [a, o] = e.cursor.sync.scales, s = e.cursor.drag;
				if (X = s._x, Z = s._y, X || Z) {
					let { left: s, top: u, width: d, height: f } = e.select, p = e.scales[a].ori, m = e.posToVal, h, g, _, v, y, x = t != null && r(t, a), S = n != null && i(n, o);
					x && X ? (p == 0 ? (h = s, g = d) : (h = u, g = f), _ = b[t], v = k(m(h, a), _, c, 0), y = k(m(h + g, a), _, c, 0), aa(Tt(v, y), L(y - v))) : aa(0, c), S && Z ? (p == 1 ? (h = s, g = d) : (h = u, g = f), _ = b[n], v = ee(m(h, o), _, l, 0), y = ee(m(h + g, o), _, l, 0), oa(Tt(v, y), L(y - v))) : oa(0, l);
				} else ga();
			} else {
				let e = L(Si - vi), t = L(Ci - yi);
				if (D.ori == 1) {
					let n = e;
					e = t, t = n;
				}
				X = Y.x && e >= Y.dist, Z = Y.y && t >= Y.dist;
				let n = Y.uni;
				n == null ? Y.x && Y.y && (X || Z) && (X = Z = !0) : X && Z && (X = e >= n, Z = t >= n, !X && !Z && (t > e ? Z = !0 : X = !0));
				let r, i;
				X && (D.ori == 0 ? (r = bi, i = q) : (r = xi, i = J), aa(Tt(r, i), L(i - r)), Z || oa(0, l)), Z && (D.ori == 1 ? (r = bi, i = q) : (r = xi, i = J), oa(Tt(r, i), L(i - r)), X || aa(0, c)), !X && !Z && (aa(0, 0), oa(0, 0));
			}
		}
		if (Y._x = X, Y._y = Z, e == null) {
			if (a) {
				if (Aa != null) {
					let [e, t] = $.scales;
					$.values[0] = e == null ? null : ta(D.ori == 0 ? q : J, e), $.values[1] = t == null ? null : ta(D.ori == 1 ? q : J, t);
				}
				Ma(Oe, r, q, J, B, V, o);
			}
			if (En) {
				let e = a && $.setSeries, t = Tn.prox;
				Qi == null ? Xi <= t && Gi(Zi, $i, !0, e) : Xi > t ? Gi(null, $i, !0, e) : Zi != Qi && Gi(Zi, $i, !0, e);
			}
		}
		hn && (M.idx = o, ca()), n !== !1 && Oa("setCursor");
	}
	let da = null;
	Object.defineProperty(r, "rect", { get() {
		return da ?? fa(!1), da;
	} });
	function fa(e = !1) {
		e ? da = null : (da = m.getBoundingClientRect(), Oa("syncRect", da));
	}
	function pa(e, t, n, r, i, a, o) {
		P._lock || Bi && e != null && e.movementX == 0 && e.movementY == 0 || (ma(e, t, n, r, i, a, o, !1, e != null), e == null ? ua(t, !0, !1) : ua(null, !0, !0));
	}
	function ma(e, t, n, i, a, o, c, l, u) {
		if (da ?? fa(!1), Sn(e), e != null) n = e.clientX - da.left, i = e.clientY - da.top;
		else {
			if (n < 0 || i < 0) {
				q = -10, J = -10;
				return;
			}
			let [e, r] = $.scales, c = t.cursor.sync, [l, u] = c.values, [d, f] = c.scales, [p, m] = $.match, h = t.axes[0].side % 2 == 1, g = D.ori == 0 ? B : V, _ = D.ori == 1 ? B : V, v = h ? o : a, y = h ? a : o, x = h ? i : n, S = h ? n : i;
			if (n = d == null ? x / v * g : p(e, d) ? s(l, b[e], g, 0) : -10, i = f == null ? S / y * _ : m(r, f) ? s(u, b[r], _, 0) : -10, D.ori == 1) {
				let e = n;
				n = i, i = e;
			}
		}
		u && (t == null || t.cursor.event.type == Oe) && ((n <= 1 || n >= B - 1) && (n = Vt(n, B)), (i <= 1 || i >= V - 1) && (i = Vt(i, V))), l ? (vi = n, yi = i, [bi, xi] = P.move(r, n, i)) : (q = n, J = i);
	}
	let ha = {
		width: 0,
		height: 0,
		left: 0,
		top: 0
	};
	function ga() {
		Hi(ha, !1);
	}
	let _a, va, ya, ba;
	function xa(e, t, n, i, a, o, s) {
		Bi = !0, X = Z = Y._x = Y._y = !1, ma(e, t, n, i, a, o, s, !0, !1), e != null && (Ot(Ae, Be, Sa, !1), Ma(ke, r, bi, xi, B, V, null));
		let { left: c, top: l, width: u, height: d } = Q;
		_a = c, va = l, ya = u, ba = d;
	}
	function Sa(e, t, n, i, a, o, s) {
		Bi = Y._x = Y._y = !1, ma(e, t, n, i, a, o, s, !1, !0);
		let { left: c, top: l, width: u, height: d } = Q, f = u > 0 || d > 0, p = _a != c || va != l || ya != u || ba != d;
		if (f && p && Hi(Q), Y.setScale && f && p) {
			let e = c, t = u, n = l, r = d;
			if (D.ori == 1 && (e = l, t = d, n = c, r = u), X && Wi(S, ta(e, S), ta(e + t, S)), Z) for (let e in b) {
				let t = b[e];
				e != S && t.from == null && t.min != R && Wi(e, ta(n + r, e), ta(n, e));
			}
			ga();
		} else P.lock && (P._lock = !P._lock, ua(t, !0, e != null));
		e != null && (At(Ae, Be), Ma(Ae, r, q, J, B, V, null));
	}
	function Ca(e, t, n, r, i, a, o) {
		if (P._lock) return;
		Sn(e);
		let s = Bi;
		if (Bi) {
			let e = !0, t = !0, n, r;
			D.ori == 0 ? (n = X, r = Z) : (n = Z, r = X), n && r && (e = q <= 10 || q >= B - 10, t = J <= 10 || J >= V - 10), n && e && (q = q < bi ? 0 : B), r && t && (J = J < xi ? 0 : V), ua(null, !0, !0), Bi = !1;
		}
		q = -10, J = -10, Ue.fill(null), ua(null, !0, !0), s && (Bi = s);
	}
	function wa(e, t, n, i, a, o, s) {
		P._lock || (Sn(e), or(), ga(), e != null && Ma(Ne, r, q, J, B, V, null));
	}
	function Ta() {
		y.forEach(zi), gn(r.width, r.height, !0);
	}
	et(Le, Ve, Ta);
	let Ea = {};
	Ea.mousedown = xa, Ea.mousemove = pa, Ea.mouseup = Sa, Ea.dblclick = wa, Ea.setSeries = (e, t, n, i) => {
		let a = $.match[2];
		n = a(r, t, n), n != -1 && Gi(n, i, !0, !1);
	}, Ze && (Ot(ke, m, xa), Ot(Oe, m, pa), Ot(je, m, (e) => {
		Sn(e), fa(!1);
	}), Ot(Me, m, Ca), Ot(Ne, m, wa), wi.add(r), r.syncRect = fa);
	let Da = r.hooks = e.hooks || {};
	function Oa(e, t, n) {
		si ? ci.push([
			e,
			t,
			n
		]) : e in Da && Da[e].forEach((e) => {
			e.call(null, r, t, n);
		});
	}
	(e.plugins || []).forEach((e) => {
		for (let t in e.hooks) Da[t] = (Da[t] || []).concat(e.hooks[t]);
	});
	let ka = (e, t, n) => n, $ = W({
		key: null,
		setSeries: !1,
		filters: {
			pub: zt,
			sub: zt
		},
		scales: [S, v[1] ? v[1].scale : null],
		match: [
			Bt,
			Bt,
			ka
		],
		values: [null, null]
	}, P.sync);
	$.match.length == 2 && $.match.push(ka), P.sync = $;
	let Aa = $.key, ja = Gr(Aa);
	function Ma(e, t, n, r, i, a, o) {
		$.filters.pub(e, t, n, r, i, a, o) && ja.pub(e, t, n, r, i, a, o);
	}
	ja.sub(r);
	function Na(e, t, n, r, i, a, o) {
		$.filters.sub(e, t, n, r, i, a, o) && Ea[e](null, t, n, r, i, a, o);
	}
	r.pub = Na;
	function Pa() {
		ja.unsub(r), wi.delete(r), St.clear(), tt(Le, Ve, Ta), l.remove(), $e?.remove(), Oa("destroy");
	}
	r.destroy = Pa;
	function Fa() {
		Oa("init", e, t), ar(t || e.data, !1), A[S] ? pi(S, A[S]) : or(), mn = Q.show && (Q.width > 0 || Q.height > 0), pn = hn = !0, gn(e.width, e.height);
	}
	return v.forEach(Pn), y.forEach(Rn), n ? n instanceof HTMLElement ? (n.appendChild(l), Fa()) : n(r, Fa) : Fa(), r;
}
J.assign = W, J.fmtNum = yt, J.rangeNum = ht, J.rangeLog = lt, J.rangeAsinh = ut, J.orient = Jr, J.pxRatio = j, J.join = un, J.fmtDate = Cn, J.tzDate = Tn, J.sync = Gr;
{
	J.addGap = $r, J.clipGaps = Qr;
	let e = J.paths = { points: pi };
	e.linear = _i, e.stepped = vi, e.bars = bi, e.spline = Si;
}
//#endregion
//#region plugins/plot/plotMath.ts
function Bi(e, t) {
	return Math.max(0, (e - t) / 1e3);
}
function Y(e, t) {
	return `${e}\0${t}`;
}
function X(e, t = .05) {
	let n = Infinity, r = -Infinity;
	for (let t of e) for (let e of t) Number.isFinite(e) && (n = Math.min(n, e), r = Math.max(r, e));
	if (!Number.isFinite(n) || !Number.isFinite(r)) return [-1, 1];
	let i = r - n, a = i > 0 ? i * t : Math.max(Math.abs(n) * t, .001);
	return [n - a, r + a];
}
function Z(e, t, n, r = 1, i = 300) {
	let [a, o] = e, s = Math.max(.1, o - a), c = Math.max(r, Math.min(i, s * n)), l = s > 0 ? (t - a) / s : .5, u = Math.max(0, t - c * Math.max(0, Math.min(1, l)));
	return [u, u + c];
}
function Q(e, t, n = 0) {
	let r = e[1] - e[0], i = Math.max(n, e[0] + t);
	return [i, i + r];
}
function Vi(e, t, n = .05) {
	let [r, i] = t, a = [];
	for (let t of e) {
		if (t.visible === !1) continue;
		let e = [];
		for (let n = 0; n < t.ts.length; n++) {
			let a = t.ts[n];
			a >= r && a <= i && e.push(t.vs[n]);
		}
		e.length > 0 && a.push(e);
	}
	return X(a, n);
}
//#endregion
//#region plugins/plot/index.tsx
var Hi = 60, Ui = 3e3, Wi = [
	"#4ea1ff",
	"#ffb347",
	"#5ad469",
	"#ff6b81",
	"#c792ea",
	"#6be7dd"
];
function Gi(e, t) {
	let n = e;
	for (let e of t.split(".")) {
		if (typeof n != "object" || !n) return;
		n = n[e];
	}
	return n;
}
var Ki = {
	"nav_msgs/msg/Odometry": [
		"twist.twist.linear.x",
		"twist.twist.angular.z",
		"pose.pose.position.x",
		"pose.pose.position.y"
	],
	"std_msgs/msg/Float32": ["data"],
	"sensor_msgs/msg/JointState": ["position.0", "position.1"]
}, qi = {
	"zh-CN": {
		chooseTopic: "选择话题...",
		fieldPath: "字段路径，如 twist.linear.x",
		add: "添加",
		resume: "继续实时",
		pause: "暂停",
		reset: "复位视角",
		clearAll: "清空",
		invalidField: "无效数值",
		waitingData: "等待数据...",
		hide: "隐藏",
		show: "显示",
		remove: "删除"
	},
	en: {
		chooseTopic: "Choose topic...",
		fieldPath: "Field path, e.g. twist.linear.x",
		add: "Add",
		resume: "Resume",
		pause: "Pause",
		reset: "Reset view",
		clearAll: "Clear all",
		invalidField: "Invalid number",
		waitingData: "Waiting for data...",
		hide: "Hide",
		show: "Show",
		remove: "Remove"
	}
};
function Ji({ ctx: e, state: t, onStateChange: n }) {
	let { bridge: i, topics: m, theme: h = "dark", locale: g = "zh-CN" } = e, _ = g === "en", v = (e) => _ ? qi.en[e] : qi["zh-CN"][e], y = o(null), b = o(null), x = o(null), S = o([]), C = o(/* @__PURE__ */ new Map()), ee = o(performance.now()), te = o(!1), ne = o(h), re = o(n), ie = o(1), ae = o(null);
	ne.current = h, re.current = n;
	let [oe, se] = s([]), [ce, le] = s(""), [ue, de] = s(""), [fe, pe] = s(!1), [me, he] = s(!1), [, ge] = s(0), _e = r((e) => {
		S.current = e, se(e);
	}, []), ve = r((e) => {
		if (C.current.has(e)) return;
		let t = i.subscribe(e, (t) => {
			if (t.kind !== "raw") return;
			let n = Bi(performance.now(), ee.current);
			for (let r of S.current) {
				if (r.topic !== e) continue;
				let i = Gi(t.message, r.field);
				if (typeof i != "number" && typeof i != "bigint") {
					r.status = "invalid";
					continue;
				}
				let a = Number(i);
				if (!Number.isFinite(a)) {
					r.status = "invalid";
					continue;
				}
				r.status = "ok", r.latest = a, r.ts.push(n), r.vs.push(a);
				let o = n - Hi;
				for (; r.ts.length > Ui || (r.ts[0] ?? n) < o;) r.ts.shift(), r.vs.shift();
			}
		});
		C.current.set(e, t);
	}, [i]), ye = r(() => {
		x.current?.destroy(), x.current = null;
		let e = y.current, t = S.current;
		if (!e || t.length === 0) return;
		let n = ne.current === "dark", r = {
			stroke: n ? "rgba(245,245,245,0.74)" : "rgba(10,10,10,0.74)",
			grid: {
				stroke: n ? "rgba(245,245,245,0.14)" : "rgba(10,10,10,0.14)",
				width: 1
			},
			ticks: {
				stroke: n ? "rgba(245,245,245,0.36)" : "rgba(10,10,10,0.36)",
				width: 1
			},
			font: "11px system-ui, -apple-system, sans-serif"
		};
		x.current = new J({
			width: e.clientWidth,
			height: Math.max(100, e.clientHeight - 4),
			series: [{}, ...t.map((e) => ({
				label: `${e.topic}.${e.field}`,
				stroke: e.color,
				show: e.visible,
				width: 2,
				points: { show: !1 }
			}))],
			axes: [r, { ...r }],
			legend: { show: !0 },
			cursor: { drag: {
				x: !1,
				y: !1
			} },
			scales: {
				x: {
					time: !1,
					auto: !1
				},
				y: { auto: !1 }
			}
		}, [[], ...t.map(() => [])], e);
	}, []), be = r((e) => {
		let t = e.topic.trim(), n = e.field.trim();
		if (!t || !n || S.current.some((e) => Y(e.topic, e.field) === Y(t, n))) return !1;
		let r = ie.current++, i = [...S.current, {
			id: r,
			topic: t,
			field: n,
			color: Wi[(r - 1) % Wi.length],
			visible: e.visible ?? !0,
			ts: [],
			vs: [],
			status: "waiting"
		}];
		return _e(i), ve(t), queueMicrotask(ye), !0;
	}, [
		_e,
		ve,
		ye
	]);
	a(() => {
		let e = t;
		for (let t of e?.series ?? []) be(t);
	}, []), a(() => {
		re.current?.({ series: oe.map(({ topic: e, field: t, visible: n }) => ({
			topic: e,
			field: t,
			...n ? {} : { visible: n }
		})) });
	}, [oe]), a(() => {
		let e = setInterval(() => {
			if (te.current) return;
			let e = x.current, t = S.current;
			if (!e || t.length === 0) return;
			let n = J.join(t.map((e) => [e.ts, e.vs]));
			e.setData(n);
			let r = t.reduce((e, t) => Math.max(e, t.ts.at(-1) ?? 0), 0);
			if (ae.current !== null) {
				let [n, r] = ae.current;
				e.setScale("x", {
					min: n,
					max: r
				});
				let [i, a] = Vi(t, ae.current);
				e.setScale("y", {
					min: i,
					max: a
				});
			} else {
				e.setScale("x", {
					min: Math.max(0, r - Hi),
					max: Math.max(Hi, r)
				});
				let [n, i] = X(t.filter((e) => e.visible).map((e) => e.vs.filter((t, n) => (e.ts[n] ?? 0) >= r - Hi)));
				e.setScale("y", {
					min: n,
					max: i
				});
			}
			ge((e) => e + 1);
		}, 100);
		return () => clearInterval(e);
	}, []);
	let xe = r(() => {
		ae.current = null, he(!1);
		let e = x.current, t = S.current;
		if (e && t.length > 0) {
			let n = t.reduce((e, t) => Math.max(e, t.ts.at(-1) ?? 0), 0);
			e.setScale("x", {
				min: Math.max(0, n - Hi),
				max: Math.max(Hi, n)
			});
		}
	}, []);
	a(() => {
		let e = y.current;
		if (!e) return;
		let t = (e) => {
			e.preventDefault(), e.stopPropagation();
			let t = x.current;
			if (!t) return;
			let n = t.over.getBoundingClientRect(), r = e.clientX - n.left, i = t.posToVal(r, "x");
			if (!Number.isFinite(i)) return;
			let a = t.scales.x, o = a.min ?? 0, s = a.max ?? Hi, c = ae.current ?? [o, s];
			if (e.ctrlKey) {
				let n = Z(c, i, Math.exp(-e.deltaY * .01));
				ae.current = n, he(!0), t.setScale("x", {
					min: n[0],
					max: n[1]
				});
			} else if (e.deltaMode === 0 && Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
				let r = (c[1] - c[0]) / Math.max(10, n.width), i = Q(c, e.deltaX * r);
				ae.current = i, he(!0), t.setScale("x", {
					min: i[0],
					max: i[1]
				});
			} else {
				let n = Z(c, i, e.deltaY < 0 ? .85 : 1 / .85);
				ae.current = n, he(!0), t.setScale("x", {
					min: n[0],
					max: n[1]
				});
			}
		};
		return e.addEventListener("wheel", t, { passive: !1 }), () => e.removeEventListener("wheel", t);
	}, []), a(() => {
		let e = y.current;
		if (!e) return;
		let t = new ResizeObserver(() => {
			x.current?.setSize({
				width: e.clientWidth,
				height: Math.max(100, e.clientHeight - 4)
			});
		});
		return t.observe(e), () => t.disconnect();
	}, []), a(() => {
		ye();
	}, [h, ye]), a(() => {
		let e = C.current;
		return () => {
			for (let t of e.values()) t();
			e.clear(), x.current?.destroy();
		};
	}, []);
	let Se = r((e) => {
		let t = S.current.find((t) => t.id === e);
		if (!t) return;
		let n = S.current.filter((t) => t.id !== e);
		_e(n), n.some((e) => e.topic === t.topic) || (C.current.get(t.topic)?.(), C.current.delete(t.topic)), queueMicrotask(ye);
	}, [_e, ye]), Ce = r(() => {
		for (let e of C.current.values()) e();
		C.current.clear(), _e([]), x.current?.destroy(), x.current = null;
	}, [_e]), we = r((e) => {
		_e(S.current.map((t) => t.id === e ? {
			...t,
			visible: !t.visible
		} : t)), queueMicrotask(ye);
	}, [_e, ye]), Te = m.filter((e) => !["sensor_msgs/msg/Image", "sensor_msgs/msg/CompressedImage"].includes(e.schemaName)), Ee = Ki[m.find((e) => e.topic === ce)?.schemaName ?? ""] ?? [], A = oe.some((e) => Y(e.topic, e.field) === Y(ce, ue.trim()));
	return /* @__PURE__ */ p("div", {
		className: "plot-panel",
		children: [/* @__PURE__ */ p(d, {
			className: "plot-toolbar",
			children: [
				/* @__PURE__ */ p(l, {
					"aria-label": v("chooseTopic"),
					value: ce,
					onChange: (e) => le(e.target.value),
					children: [/* @__PURE__ */ f("option", {
						value: "",
						children: v("chooseTopic")
					}), Te.map((e) => /* @__PURE__ */ f("option", {
						value: e.topic,
						children: e.topic
					}, e.topic))]
				}),
				/* @__PURE__ */ f(u, {
					ref: b,
					required: !0,
					className: "field-input",
					placeholder: v("fieldPath"),
					value: ue,
					onChange: (e) => de(e.target.value),
					onKeyDown: (e) => {
						e.key === "Enter" && be({
							topic: ce,
							field: ue
						}) && de("");
					},
					list: "plot-field-hints"
				}),
				/* @__PURE__ */ f("datalist", {
					id: "plot-field-hints",
					children: Ee.map((e) => /* @__PURE__ */ f("option", { value: e }, e))
				}),
				/* @__PURE__ */ f(c, {
					onClick: () => {
						b.current?.checkValidity() && be({
							topic: ce,
							field: ue
						}) && de("");
					},
					disabled: !ce || A,
					children: v("add")
				}),
				/* @__PURE__ */ f(c, {
					className: "icon-action",
					onClick: () => {
						te.current = !te.current, pe(te.current);
					},
					title: v(fe ? "resume" : "pause"),
					"aria-label": v(fe ? "resume" : "pause"),
					children: f(fe ? D : E, { size: 14 })
				}),
				me && /* @__PURE__ */ f(c, {
					className: "icon-action",
					onClick: xe,
					title: v("reset"),
					"aria-label": v("reset"),
					children: /* @__PURE__ */ f(O, { size: 14 })
				}),
				oe.length > 0 && /* @__PURE__ */ f(c, {
					className: "icon-action",
					onClick: Ce,
					title: v("clearAll"),
					"aria-label": v("clearAll"),
					children: /* @__PURE__ */ f(k, { size: 14 })
				})
			]
		}), /* @__PURE__ */ p("div", {
			className: "plot-content",
			children: [oe.length > 0 && /* @__PURE__ */ f("div", {
				className: "series-list",
				children: oe.map((e) => /* @__PURE__ */ p("div", {
					className: `series-row ${e.visible ? "" : "muted"}`,
					children: [
						/* @__PURE__ */ f("i", { style: { background: e.color } }),
						/* @__PURE__ */ p("span", {
							className: "series-name",
							children: [
								e.topic,
								".",
								e.field
							]
						}),
						/* @__PURE__ */ f("span", {
							className: `series-value ${e.status}`,
							children: e.status === "ok" ? e.latest?.toPrecision(6) : e.status === "invalid" ? v("invalidField") : v("waitingData")
						}),
						/* @__PURE__ */ f(c, {
							onClick: () => we(e.id),
							title: e.visible ? v("hide") : v("show"),
							"aria-label": e.visible ? v("hide") : v("show"),
							children: e.visible ? /* @__PURE__ */ f(T, { size: 12 }) : /* @__PURE__ */ f(w, { size: 12 })
						}),
						/* @__PURE__ */ f(c, {
							onClick: () => Se(e.id),
							title: v("remove"),
							"aria-label": v("remove"),
							children: /* @__PURE__ */ f(k, { size: 12 })
						})
					]
				}, e.id))
			}), /* @__PURE__ */ f("div", {
				ref: y,
				className: "plot-body"
			})]
		})]
	});
}
var Yi = {
	id: "plot",
	name: "曲线 (Plot)",
	panels: [{
		kind: "plot",
		title: (e) => e.locale === "en" ? "Plot" : "曲线面板",
		component: Ji
	}]
};
//#endregion
export { Ji as PlotPanel, Yi as default };
