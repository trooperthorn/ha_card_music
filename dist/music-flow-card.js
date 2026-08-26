//#region node_modules/@lit/reactive-element/css-tag.js
var e = globalThis, t = e.ShadowRoot && (e.ShadyCSS === void 0 || e.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, n = Symbol(), r = /* @__PURE__ */ new WeakMap(), i = class {
	constructor(e, t, r) {
		if (this._$cssResult$ = !0, r !== n) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
		this.cssText = e, this.t = t;
	}
	get styleSheet() {
		let e = this.o, n = this.t;
		if (t && e === void 0) {
			let t = n !== void 0 && n.length === 1;
			t && (e = r.get(n)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), t && r.set(n, e));
		}
		return e;
	}
	toString() {
		return this.cssText;
	}
}, a = (e) => new i(typeof e == "string" ? e : e + "", void 0, n), o = (e, ...t) => new i(e.length === 1 ? e[0] : t.reduce((t, n, r) => t + ((e) => {
	if (!0 === e._$cssResult$) return e.cssText;
	if (typeof e == "number") return e;
	throw Error("Value passed to 'css' function must be a 'css' function result: " + e + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
})(n) + e[r + 1], e[0]), e, n), s = (n, r) => {
	if (t) n.adoptedStyleSheets = r.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
	else for (let t of r) {
		let r = document.createElement("style"), i = e.litNonce;
		i !== void 0 && r.setAttribute("nonce", i), r.textContent = t.cssText, n.appendChild(r);
	}
}, c = t ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((e) => {
	let t = "";
	for (let n of e.cssRules) t += n.cssText;
	return a(t);
})(e) : e, { is: l, defineProperty: u, getOwnPropertyDescriptor: d, getOwnPropertyNames: ee, getOwnPropertySymbols: te, getPrototypeOf: ne } = Object, f = globalThis, re = f.trustedTypes, ie = re ? re.emptyScript : "", ae = f.reactiveElementPolyfillSupport, p = (e, t) => e, m = {
	toAttribute(e, t) {
		switch (t) {
			case Boolean:
				e = e ? ie : null;
				break;
			case Object:
			case Array: e = e == null ? e : JSON.stringify(e);
		}
		return e;
	},
	fromAttribute(e, t) {
		let n = e;
		switch (t) {
			case Boolean:
				n = e !== null;
				break;
			case Number:
				n = e === null ? null : Number(e);
				break;
			case Object:
			case Array: try {
				n = JSON.parse(e);
			} catch {
				n = null;
			}
		}
		return n;
	}
}, h = (e, t) => !l(e, t), oe = {
	attribute: !0,
	type: String,
	converter: m,
	reflect: !1,
	useDefault: !1,
	hasChanged: h
};
Symbol.metadata ??= Symbol("metadata"), f.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var g = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = oe) {
		if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
			let n = Symbol(), r = this.getPropertyDescriptor(e, n, t);
			r !== void 0 && u(this.prototype, e, r);
		}
	}
	static getPropertyDescriptor(e, t, n) {
		let { get: r, set: i } = d(this.prototype, e) ?? {
			get() {
				return this[t];
			},
			set(e) {
				this[t] = e;
			}
		};
		return {
			get: r,
			set(t) {
				let a = r?.call(this);
				i?.call(this, t), this.requestUpdate(e, a, n);
			},
			configurable: !0,
			enumerable: !0
		};
	}
	static getPropertyOptions(e) {
		return this.elementProperties.get(e) ?? oe;
	}
	static _$Ei() {
		if (this.hasOwnProperty(p("elementProperties"))) return;
		let e = ne(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(p("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(p("properties"))) {
			let e = this.properties, t = [...ee(e), ...te(e)];
			for (let n of t) this.createProperty(n, e[n]);
		}
		let e = this[Symbol.metadata];
		if (e !== null) {
			let t = litPropertyMetadata.get(e);
			if (t !== void 0) for (let [e, n] of t) this.elementProperties.set(e, n);
		}
		this._$Eh = /* @__PURE__ */ new Map();
		for (let [e, t] of this.elementProperties) {
			let n = this._$Eu(e, t);
			n !== void 0 && this._$Eh.set(n, e);
		}
		this.elementStyles = this.finalizeStyles(this.styles);
	}
	static finalizeStyles(e) {
		let t = [];
		if (Array.isArray(e)) {
			let n = new Set(e.flat(1 / 0).reverse());
			for (let e of n) t.unshift(c(e));
		} else e !== void 0 && t.push(c(e));
		return t;
	}
	static _$Eu(e, t) {
		let n = t.attribute;
		return !1 === n ? void 0 : typeof n == "string" ? n : typeof e == "string" ? e.toLowerCase() : void 0;
	}
	constructor() {
		super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
	}
	_$Ev() {
		this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
	}
	addController(e) {
		(this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
	}
	removeController(e) {
		this._$EO?.delete(e);
	}
	_$E_() {
		let e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
		for (let n of t.keys()) this.hasOwnProperty(n) && (e.set(n, this[n]), delete this[n]);
		e.size > 0 && (this._$Ep = e);
	}
	createRenderRoot() {
		let e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
		return s(e, this.constructor.elementStyles), e;
	}
	connectedCallback() {
		this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
	}
	enableUpdating(e) {}
	disconnectedCallback() {
		this._$EO?.forEach((e) => e.hostDisconnected?.());
	}
	attributeChangedCallback(e, t, n) {
		this._$AK(e, n);
	}
	_$ET(e, t) {
		let n = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, n);
		if (r !== void 0 && !0 === n.reflect) {
			let i = (n.converter?.toAttribute === void 0 ? m : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? m : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? h)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
			this.C(e, t, n);
		}
		!1 === this.isUpdatePending && (this._$ES = this._$EP());
	}
	C(e, t, { useDefault: n, reflect: r, wrapped: i }, a) {
		n && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, a ?? t ?? this[e]), !0 !== i || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || n || (t = void 0), this._$AL.set(e, t)), !0 === r && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
	}
	async _$EP() {
		this.isUpdatePending = !0;
		try {
			await this._$ES;
		} catch (e) {
			Promise.reject(e);
		}
		let e = this.scheduleUpdate();
		return e != null && await e, !this.isUpdatePending;
	}
	scheduleUpdate() {
		return this.performUpdate();
	}
	performUpdate() {
		if (!this.isUpdatePending) return;
		if (!this.hasUpdated) {
			if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
				for (let [e, t] of this._$Ep) this[e] = t;
				this._$Ep = void 0;
			}
			let e = this.constructor.elementProperties;
			if (e.size > 0) for (let [t, n] of e) {
				let { wrapped: e } = n, r = this[t];
				!0 !== e || this._$AL.has(t) || r === void 0 || this.C(t, void 0, n, r);
			}
		}
		let e = !1, t = this._$AL;
		try {
			e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach((e) => e.hostUpdate?.()), this.update(t)) : this._$EM();
		} catch (t) {
			throw e = !1, this._$EM(), t;
		}
		e && this._$AE(t);
	}
	willUpdate(e) {}
	_$AE(e) {
		this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
	}
	_$EM() {
		this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
	}
	get updateComplete() {
		return this.getUpdateComplete();
	}
	getUpdateComplete() {
		return this._$ES;
	}
	shouldUpdate(e) {
		return !0;
	}
	update(e) {
		this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
	}
	updated(e) {}
	firstUpdated(e) {}
};
g.elementStyles = [], g.shadowRootOptions = { mode: "open" }, g[p("elementProperties")] = /* @__PURE__ */ new Map(), g[p("finalized")] = /* @__PURE__ */ new Map(), ae?.({ ReactiveElement: g }), (f.reactiveElementVersions ??= []).push("2.1.2");
//#endregion
//#region node_modules/lit-html/lit-html.js
var _ = globalThis, se = (e) => e, v = _.trustedTypes, ce = v ? v.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, le = "$lit$", y = `lit$${Math.random().toFixed(9).slice(2)}$`, ue = "?" + y, de = `<${ue}>`, b = document, x = () => b.createComment(""), S = (e) => e === null || typeof e != "object" && typeof e != "function", C = Array.isArray, fe = (e) => C(e) || typeof e?.[Symbol.iterator] == "function", w = "[ 	\n\f\r]", T = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, pe = /-->/g, me = />/g, E = RegExp(`>|${w}(?:([^\\s"'>=/]+)(${w}*=${w}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), he = /'/g, ge = /"/g, _e = /^(?:script|style|textarea|title)$/i, ve = (e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}), D = ve(1), ye = ve(2), O = Symbol.for("lit-noChange"), k = Symbol.for("lit-nothing"), be = /* @__PURE__ */ new WeakMap(), A = b.createTreeWalker(b, 129);
function xe(e, t) {
	if (!C(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return ce === void 0 ? t : ce.createHTML(t);
}
var Se = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = T;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === T ? c[1] === "!--" ? o = pe : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = E) : (_e.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = E) : o = me : o === E ? c[0] === ">" ? (o = i ?? T, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? E : c[3] === "\"" ? ge : he) : o === ge || o === he ? o = E : o === pe || o === me ? o = T : (o = E, i = void 0);
		let d = o === E && e[t + 1].startsWith("/>") ? " " : "";
		a += o === T ? n + de : l >= 0 ? (r.push(s), n.slice(0, l) + le + n.slice(l) + y + d) : n + y + (l === -2 ? t : d);
	}
	return [xe(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, j = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = Se(t, n);
		if (this.el = e.createElement(l, r), A.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = A.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(le)) {
					let t = u[o++], n = i.getAttribute(e).split(y), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? we : r[1] === "?" ? Te : r[1] === "@" ? Ee : P
					}), i.removeAttribute(e);
				} else e.startsWith(y) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (_e.test(i.tagName)) {
					let e = i.textContent.split(y), t = e.length - 1;
					if (t > 0) {
						i.textContent = v ? v.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], x()), A.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], x());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === ue) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(y, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += y.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = b.createElement("template");
		return n.innerHTML = e, n;
	}
};
function M(e, t, n = e, r) {
	if (t === O) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = S(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = M(e, i._$AS(e, t.values), i, r)), t;
}
var Ce = class {
	constructor(e, t) {
		this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
	}
	get parentNode() {
		return this._$AM.parentNode;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	u(e) {
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? b).importNode(t, !0);
		A.currentNode = r;
		let i = A.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new N(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new De(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = A.nextNode(), a++);
		}
		return A.currentNode = b, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, N = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = k, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
	}
	get parentNode() {
		let e = this._$AA.parentNode, t = this._$AM;
		return t !== void 0 && e?.nodeType === 11 && (e = t.parentNode), e;
	}
	get startNode() {
		return this._$AA;
	}
	get endNode() {
		return this._$AB;
	}
	_$AI(e, t = this) {
		e = M(this, e, t), S(e) ? e === k || e == null || e === "" ? (this._$AH !== k && this._$AR(), this._$AH = k) : e !== this._$AH && e !== O && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? fe(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== k && S(this._$AH) ? this._$AA.nextSibling.data = e : this.T(b.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = j.createElement(xe(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new Ce(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = be.get(e.strings);
		return t === void 0 && be.set(e.strings, t = new j(e)), t;
	}
	k(t) {
		C(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(x()), this.O(x()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = se(e).nextSibling;
			se(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, P = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = k, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = k;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = M(this, e, t, 0), a = !S(e) || e !== this._$AH && e !== O, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = M(this, r[n + o], t, o), s === O && (s = this._$AH[o]), a ||= !S(s) || s !== this._$AH[o], s === k ? e = k : e !== k && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === k ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, we = class extends P {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === k ? void 0 : e;
	}
}, Te = class extends P {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== k);
	}
}, Ee = class extends P {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = M(this, e, t, 0) ?? k) === O) return;
		let n = this._$AH, r = e === k && n !== k || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== k && (n === k || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, De = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		M(this, e);
	}
}, Oe = _.litHtmlPolyfillSupport;
Oe?.(j, N), (_.litHtmlVersions ??= []).push("3.3.3");
var ke = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new N(t.insertBefore(x(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, F = globalThis, I = class extends g {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = ke(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return O;
	}
};
I._$litElement$ = !0, I.finalized = !0, F.litElementHydrateSupport?.({ LitElement: I });
var Ae = F.litElementPolyfillSupport;
Ae?.({ LitElement: I }), (F.litElementVersions ??= []).push("4.2.2");
//#endregion
//#region node_modules/@lit/reactive-element/decorators/property.js
var je = {
	attribute: !0,
	type: String,
	converter: m,
	reflect: !1,
	hasChanged: h
}, Me = (e = je, t, n) => {
	let { kind: r, metadata: i } = n, a = globalThis.litPropertyMetadata.get(i);
	if (a === void 0 && globalThis.litPropertyMetadata.set(i, a = /* @__PURE__ */ new Map()), r === "setter" && ((e = Object.create(e)).wrapped = !0), a.set(n.name, e), r === "accessor") {
		let { name: r } = n;
		return {
			set(n) {
				let i = t.get.call(this);
				t.set.call(this, n), this.requestUpdate(r, i, e, !0, n);
			},
			init(t) {
				return t !== void 0 && this.C(r, void 0, e, t), t;
			}
		};
	}
	if (r === "setter") {
		let { name: r } = n;
		return function(n) {
			let i = this[r];
			t.call(this, n), this.requestUpdate(r, i, e, !0, n);
		};
	}
	throw Error("Unsupported decorator location: " + r);
};
function L(e) {
	return (t, n) => typeof n == "object" ? Me(e, t, n) : ((e, t, n) => {
		let r = t.hasOwnProperty(n);
		return t.constructor.createProperty(n, e), r ? Object.getOwnPropertyDescriptor(t, n) : void 0;
	})(e, t, n);
}
//#endregion
//#region node_modules/@lit/reactive-element/decorators/state.js
function R(e) {
	return L({
		...e,
		state: !0,
		attribute: !1
	});
}
var Ne = {
	input_link: "#2dd4cf",
	channel_link: "#d946ef",
	output_link: "#10b981"
}, Pe = {
	inputs: "Inputs",
	channels: "Channels",
	mixes: "Mixes",
	outputs: "Outputs"
}, Fe = /* @__PURE__ */ new Set([
	"off",
	"standby",
	"unavailable",
	"unknown"
]), Ie = /* @__PURE__ */ new Set(["unavailable", "unknown"]);
function Le(e, t) {
	return `${e}:${t}`;
}
function Re(e) {
	return `out:${e}`;
}
function ze(e) {
	return e !== void 0 && !Fe.has(e.state);
}
function Be(e) {
	return e !== void 0 && !Ie.has(e.state);
}
function Ve(e, t, n) {
	if (e.feed_source) return e.feed_source;
	let r = t.feed_aliases ?? [], i = n?.attributes.source_list;
	if (Array.isArray(i)) {
		let e = r.find((e) => i.includes(e));
		if (e) return e;
	}
	return r[0];
}
function He(e, t, n) {
	let r = n?.attributes.source;
	return typeof r != "string" || r === "" || r === "Unknown" ? !1 : e.feed_source ? r === e.feed_source : (t.feed_aliases ?? []).includes(r);
}
function z(e, t, n) {
	return e ?? t?.attributes.friendly_name ?? n;
}
function B(e, t, n, r, i) {
	return {
		id: Le(e, t),
		kind: e,
		entity: t,
		name: r,
		icon: i,
		subtitle: "",
		found: n !== void 0,
		available: Be(n),
		inPath: !1,
		partial: !1,
		offPath: !1,
		pending: !1,
		muted: n?.attributes.is_volume_muted === !0
	};
}
function Ue(e) {
	let t = e?.attributes.volume_level;
	return typeof t == "number" ? Math.round(t * 100) : void 0;
}
function We(e, t) {
	let n = e.states[t.input.entity], r = B("input", t.input.entity, n, z(t.input.name, n, "Music Assistant"), t.input.icon ?? "mdi:music-box-multiple");
	if (!r.found) r.subtitle = "Entity not found";
	else if (!r.available) r.subtitle = "Unavailable";
	else if (n && n.state === "playing") {
		let e = n.attributes.media_title, t = n.attributes.media_artist;
		r.subtitle = typeof e == "string" ? t ? `${e} · ${t}` : e : "Playing", r.inPath = !0, r.artwork = typeof n.attributes.entity_picture == "string" ? n.attributes.entity_picture : void 0;
	} else n && n.state === "paused" ? (r.subtitle = "Paused", r.inPath = !0) : r.subtitle = "Nothing playing · tap to browse";
	return r;
}
function Ge(e, t) {
	let n = e.states[t.channel.entity], r = B("channel", t.channel.entity, n, z(t.channel.name, n, "Chromecast"), t.channel.icon ?? "mdi:cast-audio");
	if (!r.found) r.subtitle = "Entity not found";
	else if (!r.available) r.subtitle = "Unavailable";
	else if (n && (n.state === "playing" || n.state === "paused")) {
		r.inPath = !0;
		let e = Ue(n), t = n.attributes.app_name, i = [];
		typeof t == "string" && t.length > 0 && i.push(t), e !== void 0 && i.push(`Vol ${e}%`), r.subtitle = i.join(" · ") || "Streaming";
	} else r.subtitle = "No signal";
	return r;
}
function Ke(e, t, n, r) {
	let i = n.overlay(r.entity, e.states[r.entity]), a = B("zone", r.entity, i, z(r.name, i, r.entity), r.icon ?? "mdi:speaker");
	a.pending = n.has(r.entity);
	let o = ze(i), s = He(r, t, i);
	if (a.inPath = o && s, a.offPath = o && !s, !a.found) a.subtitle = "Entity not found";
	else if (!a.available) a.subtitle = "Unavailable";
	else if (a.inPath) {
		let e = Ue(i);
		a.subtitle = e === void 0 ? "On" : `Vol ${e}%`;
	} else if (a.offPath) {
		let e = i?.attributes.source;
		a.subtitle = typeof e == "string" && e !== "" ? `Source: ${e}` : "Source: unknown";
	} else a.subtitle = "Off";
	return a;
}
function qe(e, t, n, r, i) {
	let a = e.states[r.entity], o = B("group", r.entity, a, z(r.name, a, r.entity), r.icon ?? "mdi:speaker-multiple");
	o.pending = n.has(r.entity);
	let s = (Array.isArray(a?.attributes.entity_id) ? a.attributes.entity_id : []).map((e) => i.get(e)).filter((e) => e !== void 0), c = s.filter((e) => e.inPath).length;
	return o.memberTotal = s.length, o.memberActive = c, o.members = s.map((e) => e.id), o.inPath = s.length > 0 && c === s.length, o.partial = c > 0 && c < s.length, o.subtitle = o.found ? s.length === 0 ? "No configured member zones" : o.inPath ? `All ${s.length} zones on` : o.partial ? `${c} of ${s.length} zones on` : "Off" : "Entity not found", o;
}
function Je(e, t, n, r) {
	let i = n.overlay(r.entity, e.states[r.entity]), a = B("master", r.entity, i, z(r.name, i, r.entity), r.icon ?? "mdi:speaker-multiple");
	a.pending = n.has(r.entity);
	let o = ze(i), s = He(r, t, i);
	if (a.inPath = o && s, a.offPath = o && !s, !a.found) a.subtitle = "Entity not found";
	else if (!a.available) a.subtitle = "Unavailable";
	else if (a.inPath) a.subtitle = "Takeover active · all unit zones";
	else if (a.offPath) {
		let e = i?.attributes.source;
		a.subtitle = typeof e == "string" && e !== "" ? `Source: ${e}` : "Source: unknown";
	} else a.subtitle = "Takeover · enables whole unit";
	return a;
}
function Ye(e, t, n, r) {
	let i = t.overlay(n.entity, e.states[n.entity]), a = typeof i?.attributes.volume_level == "number" ? i.attributes.volume_level : 0, o = typeof i?.attributes.supported_features == "number" ? i.attributes.supported_features : 0, s = n.volume?.display ?? "percent", c = "";
	if (s === "raw" && n.volume?.max) c = `${Math.round(a * n.volume.max)}/${n.volume.max}`;
	else if (s === "db") {
		let t = n.volume?.entity ? e.states[n.volume.entity] : void 0;
		if (t && !Ie.has(t.state)) {
			let e = t.attributes.unit_of_measurement ?? "dB";
			c = `${t.state} ${e}`;
		}
	}
	return {
		id: Re(n.entity),
		zoneId: r.id,
		entity: n.entity,
		name: r.name,
		icon: r.icon,
		volumeLevel: a,
		readout: c,
		muted: i?.attributes.is_volume_muted === !0,
		pending: t.has(n.entity),
		hasVolume: !!(o & 4),
		hasMute: !!(o & 8)
	};
}
function Xe(e, t, n) {
	let r = We(e, t), i = Ge(e, t), a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
	for (let r of t.zones) a.set(r.entity, Ke(e, t, n, r)), o.set(r.entity, r);
	let s = [...a.values()];
	for (let r of t.groups ?? []) s.push(qe(e, t, n, r, a));
	for (let r of t.masters ?? []) s.push(Je(e, t, n, r));
	let c = [];
	for (let [t, r] of a) if (r.inPath) {
		let i = o.get(t);
		i && c.push(Ye(e, n, i, r));
	}
	let l = [], u = r.inPath && i.inPath;
	l.push({
		fromId: r.id,
		toId: i.id,
		kind: "input",
		active: u,
		muted: !1
	});
	for (let e of s) l.push({
		fromId: i.id,
		toId: e.id,
		kind: "channel",
		active: (e.inPath || e.partial) && i.inPath,
		muted: e.kind === "zone" && e.inPath && e.muted
	});
	for (let e of c) l.push({
		fromId: e.zoneId,
		toId: e.id,
		kind: "output",
		active: !0,
		muted: e.muted
	});
	return {
		input: r,
		channel: i,
		mixes: s,
		outputs: c,
		links: l
	};
}
function Ze(e, t) {
	if (t === null) return null;
	let n = /* @__PURE__ */ new Set(), r = [e.input.id, e.channel.id], i = (t) => {
		n.add(t);
		for (let r of e.outputs) r.zoneId === t && n.add(r.id);
	};
	if (t === e.input.id || t === e.channel.id) {
		r.forEach((e) => n.add(e));
		for (let t of e.mixes) (t.inPath || t.partial) && i(t.id);
		return n;
	}
	let a = e.outputs.find((e) => e.id === t);
	if (a) return r.forEach((e) => n.add(e)), n.add(a.zoneId), n.add(a.id), n;
	let o = e.mixes.find((e) => e.id === t);
	if (o) {
		if (r.forEach((e) => n.add(e)), o.kind === "group") {
			n.add(o.id);
			for (let e of o.members ?? []) i(e);
		} else i(o.id);
		return n;
	}
	return null;
}
//#endregion
//#region src/actions.ts
var Qe = 300;
function $e(e) {
	return new Promise((t) => setTimeout(t, e));
}
async function V(e, t, n, r, i) {
	let a = Ve(n, r, e.states[n.entity]);
	t.set(n.entity, a ? {
		state: "on",
		source: a
	} : { state: "on" }, i, Date.now()), await e.callService("media_player", "turn_on", { entity_id: n.entity }), a && (await $e(Qe), await e.callService("media_player", "select_source", {
		entity_id: n.entity,
		source: a
	}));
}
async function et(e, t, n, r) {
	t.set(n, { state: "off" }, r, Date.now()), await e.callService("media_player", "turn_off", { entity_id: n });
}
async function tt(e, t, n, r, i, a) {
	i.inPath ? await et(e, t, r.entity, a) : await V(e, t, r, n, a);
}
async function nt(e, t, n, r, i, a, o) {
	let s = e.states[r], c = Array.isArray(s?.attributes.entity_id) ? s.attributes.entity_id : [];
	if (i.inPath) {
		t.set(r, { state: "off" }, o, Date.now());
		for (let e of c) a.has(e) && t.set(e, { state: "off" }, o, Date.now());
		await e.callService("media_player", "turn_off", { entity_id: r });
		return;
	}
	let l = n.zones.filter((e) => {
		if (!c.includes(e.entity)) return !1;
		let t = a.get(e.entity);
		return t === void 0 || !t.inPath;
	});
	t.set(r, { state: "on" }, o, Date.now());
	for (let r of l) await V(e, t, r, n, o);
}
async function rt(e, t, n, r, i, a) {
	i.inPath ? await et(e, t, r.entity, a) : await V(e, t, r, n, a);
}
async function it(e, t, n, r, i) {
	let a = Math.min(1, Math.max(0, r));
	t.set(n, { volume_level: a }, i, Date.now()), await e.callService("media_player", "volume_set", {
		entity_id: n,
		volume_level: a
	});
}
async function at(e, t, n, r, i) {
	t.set(n, { is_volume_muted: !r }, i, Date.now()), await e.callService("media_player", "volume_mute", {
		entity_id: n,
		is_volume_muted: !r
	});
}
async function ot(e, t, n, r) {
	await e.callService("media_player", "play_media", {
		entity_id: t,
		media_content_id: n,
		media_content_type: r
	});
}
//#endregion
//#region src/config.ts
var st = /* @__PURE__ */ new Set([
	"type",
	"title",
	"input",
	"channel",
	"feed_aliases",
	"zones",
	"groups",
	"masters",
	"columns",
	"colors",
	"optimistic_ttl",
	"view_layout",
	"layout_options",
	"grid_options",
	"visibility"
]), ct = /* @__PURE__ */ new Set([
	"percent",
	"db",
	"raw"
]);
function H(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function U(e) {
	return typeof e == "string" && e.trim().length > 0;
}
function W(e, t, n, r) {
	if (!U(e)) {
		r.push(`${n}: required and must be a ${t} entity id`);
		return;
	}
	e.startsWith(`${t}.`) || r.push(`${n}: "${e}" must be in the ${t} domain`);
}
function G(e, t, n) {
	e.name !== void 0 && !U(e.name) && n.push(`${t}.name: must be a non-empty string`), e.icon !== void 0 && !U(e.icon) && n.push(`${t}.icon: must be a non-empty string`);
}
function lt(e, t, n) {
	if (e === void 0) return;
	if (!H(e)) {
		n.push(`${t}: must be a mapping with display/entity/max`);
		return;
	}
	let r = e.display ?? "percent";
	return (typeof r != "string" || !ct.has(r)) && n.push(`${t}.display: must be one of percent, db, raw`), r === "db" && e.entity !== void 0 && W(e.entity, "number", `${t}.entity`, n), r === "raw" && (typeof e.max != "number" || e.max <= 0) && n.push(`${t}.max: display "raw" requires a positive max (38 for Monoprice)`), e;
}
function ut(e) {
	let t = [];
	if (!H(e)) return { errors: ["configuration must be a YAML mapping"] };
	for (let n of Object.keys(e)) st.has(n) || t.push(`unknown option "${n}" (typo?)`);
	e.title !== void 0 && !U(e.title) && t.push("title: must be a non-empty string"), H(e.input) ? (W(e.input.entity, "media_player", "input.entity", t), G(e.input, "input", t)) : t.push("input: required, with input.entity set to the Music Assistant player"), H(e.channel) ? (W(e.channel.entity, "media_player", "channel.entity", t), G(e.channel, "channel", t)) : t.push("channel: required, with channel.entity set to the Chromecast player");
	let n;
	e.feed_aliases !== void 0 && (!Array.isArray(e.feed_aliases) || e.feed_aliases.length === 0 || !e.feed_aliases.every(U) ? t.push("feed_aliases: must be a non-empty list of source names") : n = e.feed_aliases.map((e) => e.trim()));
	let r = [];
	if (!Array.isArray(e.zones) || e.zones.length === 0) t.push("zones: required, at least one zone");
	else {
		e.zones.forEach((e, i) => {
			let a = `zones[${i}]`;
			if (!H(e)) {
				t.push(`${a}: must be a mapping`);
				return;
			}
			W(e.entity, "media_player", `${a}.entity`, t), G(e, a, t), e.feed_source !== void 0 && !U(e.feed_source) && t.push(`${a}.feed_source: must be a non-empty source name`), e.feed_source === void 0 && n === void 0 && t.push(`${a}: needs feed_source, or set top-level feed_aliases covering this device`), lt(e.volume, `${a}.volume`, t), r.push(e);
		});
		let i = /* @__PURE__ */ new Set();
		for (let e of r) typeof e.entity == "string" && (i.has(e.entity) && t.push(`zones: duplicate entity "${e.entity}"`), i.add(e.entity));
	}
	let i = [];
	e.groups !== void 0 && (Array.isArray(e.groups) ? e.groups.forEach((e, n) => {
		let r = `groups[${n}]`;
		if (!H(e)) {
			t.push(`${r}: must be a mapping`);
			return;
		}
		W(e.entity, "media_player", `${r}.entity`, t), G(e, r, t), i.push(e);
	}) : t.push("groups: must be a list"));
	let a = [];
	return e.masters !== void 0 && (Array.isArray(e.masters) ? e.masters.forEach((e, r) => {
		let i = `masters[${r}]`;
		if (!H(e)) {
			t.push(`${i}: must be a mapping`);
			return;
		}
		W(e.entity, "media_player", `${i}.entity`, t), G(e, i, t), e.feed_source !== void 0 && !U(e.feed_source) && t.push(`${i}.feed_source: must be a non-empty source name`), e.feed_source === void 0 && n === void 0 && t.push(`${i}: needs feed_source, or set top-level feed_aliases covering this device`), a.push(e);
	}) : t.push("masters: must be a list")), e.columns !== void 0 && !H(e.columns) && t.push("columns: must be a mapping of inputs/channels/mixes/outputs labels"), e.colors !== void 0 && !H(e.colors) && t.push("colors: must be a mapping of input_link/channel_link/output_link"), e.optimistic_ttl !== void 0 && (typeof e.optimistic_ttl != "number" || e.optimistic_ttl < 0) && t.push("optimistic_ttl: must be a non-negative number of milliseconds"), t.length > 0 ? { errors: t } : {
		config: {
			...e,
			feed_aliases: n,
			zones: r,
			groups: i.length > 0 ? i : void 0,
			masters: a.length > 0 ? a : void 0,
			optimistic_ttl: e.optimistic_ttl ?? 8e3
		},
		errors: []
	};
}
function dt(e) {
	let t = [e.input.entity, e.channel.entity];
	for (let n of e.zones) t.push(n.entity), n.volume?.entity && t.push(n.volume.entity);
	for (let n of e.groups ?? []) t.push(n.entity);
	for (let n of e.masters ?? []) t.push(n.entity);
	return t;
}
//#endregion
//#region src/model/optimistic.ts
var ft = .03;
function pt(e, t) {
	if (e.state !== void 0) {
		if (e.state === "on") {
			if ([
				"off",
				"standby",
				"unavailable",
				"unknown"
			].includes(t.state)) return !1;
		} else if (t.state !== e.state) return !1;
	}
	if (e.source !== void 0 && t.attributes.source !== e.source) return !1;
	if (e.volume_level !== void 0) {
		let n = t.attributes.volume_level;
		if (typeof n != "number" || Math.abs(n - e.volume_level) > ft) return !1;
	}
	return e.is_volume_muted === void 0 || t.attributes.is_volume_muted === e.is_volume_muted;
}
var mt = class {
	constructor() {
		this.entries = /* @__PURE__ */ new Map();
	}
	set(e, t, n, r) {
		let i = this.entries.get(e);
		this.entries.set(e, {
			expect: {
				...i?.expect,
				...t
			},
			setAt: r,
			ttl: n
		});
	}
	reconcile(e, t) {
		for (let [n, r] of this.entries) {
			let i = e.states[n];
			(i && pt(r.expect, i) || t - r.setAt > r.ttl) && this.entries.delete(n);
		}
	}
	has(e) {
		return this.entries.has(e);
	}
	isEmpty() {
		return this.entries.size === 0;
	}
	overlay(e, t) {
		let n = this.entries.get(e);
		if (!n || !t) return t;
		let r = n.expect;
		return {
			...t,
			state: r.state ?? t.state,
			attributes: {
				...t.attributes,
				...r.source === void 0 ? {} : { source: r.source },
				...r.volume_level === void 0 ? {} : { volume_level: r.volume_level },
				...r.is_volume_muted === void 0 ? {} : { is_volume_muted: r.is_volume_muted }
			}
		};
	}
	clear() {
		this.entries.clear();
	}
};
//#endregion
//#region src/ha-helpers.ts
function ht(e, t, n, r) {
	let i = {
		type: "media_player/browse_media",
		entity_id: t
	};
	return n !== void 0 && (i.media_content_id = n), r !== void 0 && (i.media_content_type = r), e.callWS(i);
}
function gt(e, t) {
	e.dispatchEvent(new CustomEvent("hass-more-info", {
		detail: { entityId: t },
		bubbles: !0,
		composed: !0
	}));
}
function _t(e, t) {
	let n;
	return (...r) => {
		n !== void 0 && clearTimeout(n), n = setTimeout(() => {
			n = void 0, e(...r);
		}, t);
	};
}
var vt = 500, K = 10;
function yt(e, t, n) {
	let r, i = !1, a = 0, o = 0, s = () => {
		r !== void 0 && (clearTimeout(r), r = void 0);
	};
	e.addEventListener("pointerdown", (e) => {
		i = !1, a = e.clientX, o = e.clientY, n && (s(), r = setTimeout(() => {
			i = !0, n();
		}, vt));
	}), e.addEventListener("pointermove", (e) => {
		(Math.abs(e.clientX - a) > K || Math.abs(e.clientY - o) > K) && s();
	}), e.addEventListener("pointerup", s), e.addEventListener("pointerleave", s), e.addEventListener("pointercancel", s), e.addEventListener("click", (e) => {
		if (i) {
			e.stopPropagation(), e.preventDefault(), i = !1;
			return;
		}
		t();
	});
}
//#endregion
//#region src/styles.ts
var q = o`
  :host {
    --mfc-bg: var(--ha-card-background, var(--card-background-color, #1c1c1e));
    --mfc-node-bg: var(--mfc-node-background, rgba(127, 127, 127, 0.14));
    --mfc-node-bg-active: var(--mfc-node-background-active, rgba(127, 127, 127, 0.24));
    --mfc-text: var(--primary-text-color, #e7e7ea);
    --mfc-text-dim: var(--secondary-text-color, #9a9aa0);
    --mfc-radius: 12px;
    --mfc-idle-link: var(--divider-color, rgba(127, 127, 127, 0.35));
    --mfc-dim-opacity: 0.32;
    --mfc-warn: var(--warning-color, #f59e0b);
    --mfc-error: var(--error-color, #ef4444);
  }
`, bt = o`
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: 8px;
    background: var(--mfc-node-bg);
    color: var(--mfc-text-dim);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    user-select: none;
  }
`;
//#endregion
//#region src/view/legend.ts
function xt(e) {
	let t = {
		...Ne,
		...e
	}, n = (e, t, n = !1) => D`
    <span class="legend-item">
      <svg width="26" height="8" aria-hidden="true">
        <line
          x1="1"
          y1="4"
          x2="25"
          y2="4"
          stroke=${t}
          stroke-width="3"
          stroke-linecap="round"
          stroke-dasharray=${n ? "4 4" : ""}
        ></line>
      </svg>
      ${e}
    </span>
  `;
	return D`
    <div class="legend">
      ${n("Source to stream", t.input_link)}
      ${n("Stream to zone", t.channel_link)}
      ${n("Zone to output", t.output_link)}
      ${n("Muted", "var(--mfc-text-dim)", !0)}
      ${n("Not in path", "var(--mfc-idle-link)")}
    </div>
  `;
}
//#endregion
//#region \0@oxc-project+runtime@0.147.0/helpers/esm/decorate.js
function J(e, t, n, r) {
	var i = arguments.length, a = i < 3 ? t : r === null ? r = Object.getOwnPropertyDescriptor(t, n) : r, o;
	if (typeof Reflect == "object" && typeof Reflect.decorate == "function") a = Reflect.decorate(e, t, n, r);
	else for (var s = e.length - 1; s >= 0; s--) (o = e[s]) && (a = (i < 3 ? o(a) : i > 3 ? o(t, n, a) : o(t, n)) || a);
	return i > 3 && a && Object.defineProperty(t, n, a), a;
}
//#endregion
//#region src/view/browse-panel.ts
var St, Y = class extends I {
	constructor(...e) {
		super(...e), this.entity = "", this.stack = [], this.loading = !1, this.error = null;
	}
	connectedCallback() {
		super.connectedCallback(), this.open();
	}
	async open() {
		this.stack = [], await this.load(void 0);
	}
	async load(e) {
		this.loading = !0, this.error = null;
		try {
			let t = await ht(this.hass, this.entity, e?.media_content_id, e?.media_content_type);
			this.stack = [...this.stack, {
				title: t.title || e?.title || "Media",
				item: t,
				children: t.children ?? []
			}];
		} catch (e) {
			this.error = e instanceof Error ? e.message : String(e);
		} finally {
			this.loading = !1;
		}
	}
	back() {
		this.stack.length > 1 ? this.stack = this.stack.slice(0, -1) : this.close();
	}
	close() {
		this.dispatchEvent(new CustomEvent("browse-close", {
			bubbles: !0,
			composed: !0
		}));
	}
	pick(e) {
		if (e.can_expand) {
			this.load(e);
			return;
		}
		e.can_play && this.dispatchEvent(new CustomEvent("browse-play", {
			detail: {
				contentId: e.media_content_id,
				contentType: e.media_content_type
			},
			bubbles: !0,
			composed: !0
		}));
	}
	render() {
		let e = this.stack[this.stack.length - 1];
		return D`
      <div class="panel" @click=${(e) => e.stopPropagation()}>
        <div class="head">
          <button title="Back" @click=${() => this.back()}>
            <ha-icon icon="mdi:arrow-left"></ha-icon>
          </button>
          <span class="title">${e?.title ?? "Browse media"}</span>
          <button title="Close" @click=${() => this.close()}>
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </div>
        <div class="list">
          ${this.error ? D`<div class="status error">Browse failed: ${this.error}</div>` : k}
          ${this.loading ? D`<div class="status">Loading…</div>` : k}
          ${!this.loading && !this.error && e ? e.children.length === 0 ? D`<div class="status">Nothing here</div>` : e.children.map((e) => D`
                    <button class="item" @click=${() => this.pick(e)}>
                      <span class="thumb">
                        ${e.thumbnail ? D`<img src=${e.thumbnail} alt="" />` : D`<ha-icon
                              icon=${e.can_expand ? "mdi:folder-music" : "mdi:music-note"}
                            ></ha-icon>`}
                      </span>
                      <span class="label">${e.title}</span>
                      <ha-icon
                        icon=${e.can_expand ? "mdi:chevron-right" : "mdi:play-circle-outline"}
                      ></ha-icon>
                    </button>
                  `) : k}
        </div>
      </div>
    `;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.addEventListener("click", () => this.close()), e;
	}
};
St = Y, St.styles = [q, o`
      :host {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.55);
        border-radius: var(--ha-card-border-radius, 12px);
        z-index: 5;
      }
      .panel {
        display: flex;
        flex-direction: column;
        width: min(440px, 92%);
        max-height: 88%;
        border-radius: var(--mfc-radius);
        background: var(--mfc-bg);
        color: var(--mfc-text);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
        overflow: hidden;
      }
      .head {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        border-bottom: 1px solid var(--mfc-idle-link);
      }
      .head button {
        border: none;
        background: none;
        color: var(--mfc-text);
        cursor: pointer;
        display: flex;
        padding: 4px;
      }
      .head .title {
        flex: 1;
        min-width: 0;
        font-size: 14px;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .list {
        overflow-y: auto;
        padding: 6px;
      }
      .item {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        border: none;
        background: none;
        color: var(--mfc-text);
        padding: 8px;
        border-radius: 8px;
        cursor: pointer;
        text-align: left;
        font: inherit;
      }
      .item:hover {
        background: var(--mfc-node-bg);
      }
      .thumb {
        flex: none;
        width: 40px;
        height: 40px;
        border-radius: 6px;
        background: var(--mfc-node-bg);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      .thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .item .label {
        flex: 1;
        min-width: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 13px;
      }
      .item ha-icon {
        color: var(--mfc-text-dim);
      }
      .status {
        padding: 20px;
        text-align: center;
        color: var(--mfc-text-dim);
        font-size: 13px;
      }
      .status.error {
        color: var(--mfc-error);
      }
    `], J([L({ attribute: !1 })], Y.prototype, "hass", void 0), J([L()], Y.prototype, "entity", void 0), J([R()], Y.prototype, "stack", void 0), J([R()], Y.prototype, "loading", void 0), J([R()], Y.prototype, "error", void 0), customElements.define("mfc-browse", Y);
//#endregion
//#region src/view/links-overlay.ts
function Ct(e, t) {
	let n = {
		...Ne,
		...t
	};
	switch (e.kind) {
		case "input": return n.input_link;
		case "channel": return n.channel_link;
		case "output": return n.output_link;
	}
}
function wt(e, t, n) {
	let { x1: r, y1: i, x2: a, y2: o } = e, s = Math.max(24, (a - r) / 2), c = `M ${r} ${i} C ${r + s} ${i}, ${a - s} ${o}, ${a} ${o}`, l = t === "path", u = l ? Ct(e.link, n) : "var(--mfc-idle-link)";
	return ye`
    <g opacity=${t === "faded" ? .35 : 1}>
      <path
        d=${c}
        fill="none"
        stroke=${u}
        stroke-width=${l ? 3 : 1.25}
        stroke-linecap="round"
        stroke-dasharray=${(e.link.muted && l ? "6 6" : void 0) ?? ""}
      ></path>
      ${l ? ye`
            <circle cx=${r} cy=${i} r="4" fill=${u}></circle>
            <circle cx=${a} cy=${o} r="4" fill=${u}></circle>
          ` : ""}
    </g>
  `;
}
//#endregion
//#region src/view/node-card.ts
var Tt, X = class extends I {
	constructor(...e) {
		super(...e), this.dimmed = !1, this.selected = !1;
	}
	firstUpdated() {
		yt(this, () => {
			if (!this.node.found || !this.node.available) {
				this.node.found && this.emit("node-more-info");
				return;
			}
			this.emit("node-tap");
		}, () => this.emit("node-more-info"));
	}
	updated() {
		this.toggleAttribute("data-dimmed", this.dimmed), this.toggleAttribute("data-selected", this.selected);
	}
	emit(e) {
		this.dispatchEvent(new CustomEvent(e, {
			detail: { id: this.node.id },
			bubbles: !0,
			composed: !0
		}));
	}
	render() {
		let e = this.node;
		return D`
      <div class=${[
			"tile",
			e.inPath ? "in-path" : "",
			e.offPath ? "off-path" : "",
			e.available ? "" : "unavailable",
			e.kind === "master" ? "takeover" : ""
		].filter(Boolean).join(" ")}>
        <div class="iconbox">
          ${e.artwork ? D`<img src=${e.artwork} alt="" />` : D`<ha-icon .icon=${e.icon}></ha-icon>`}
        </div>
        <div class="text">
          <div class="title">${e.name}</div>
          <div class="subtitle">${e.subtitle}</div>
        </div>
        ${e.found ? k : D`<span class="badge warn" title="Entity not found">!</span>`}
        ${e.kind === "group" && e.memberTotal ? D`<span class="badge">${e.memberActive}/${e.memberTotal}</span>` : k}
        ${e.pending ? D`<span class="pending" title="Waiting for the device to confirm"></span>` : k}
      </div>
    `;
	}
};
Tt = X, Tt.styles = [q, o`
      :host {
        display: block;
      }
      .tile {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-radius: var(--mfc-radius);
        background: var(--mfc-node-bg);
        color: var(--mfc-text);
        cursor: pointer;
        transition:
          opacity 0.2s ease,
          background 0.2s ease,
          box-shadow 0.2s ease;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
        border: 1px solid transparent;
      }
      .tile:hover {
        background: var(--mfc-node-bg-active);
      }
      :host([data-dimmed]) .tile {
        opacity: var(--mfc-dim-opacity);
      }
      :host([data-selected]) .tile {
        border-color: var(--mfc-text-dim);
      }
      .tile.in-path {
        background: var(--mfc-node-bg-active);
      }
      .tile.off-path {
        opacity: 0.65;
      }
      .tile.unavailable {
        cursor: default;
        opacity: 0.45;
      }
      .tile.takeover {
        border-style: dashed;
        border-color: var(--mfc-text-dim);
      }
      .iconbox {
        position: relative;
        flex: none;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 9px;
        background: rgba(127, 127, 127, 0.16);
        overflow: hidden;
      }
      .iconbox img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .iconbox ha-icon {
        color: var(--mfc-text-dim);
      }
      .tile.in-path .iconbox ha-icon {
        color: var(--mfc-text);
      }
      .text {
        min-width: 0;
        flex: 1;
      }
      .title {
        font-size: 13px;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .subtitle {
        font-size: 11.5px;
        color: var(--mfc-text-dim);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .badge {
        flex: none;
        font-size: 10px;
        font-weight: 700;
        padding: 2px 7px;
        border-radius: 999px;
        background: rgba(127, 127, 127, 0.2);
        color: var(--mfc-text-dim);
      }
      .badge.warn {
        color: var(--mfc-warn);
      }
      .pending {
        flex: none;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid var(--mfc-text-dim);
        border-top-color: transparent;
        animation: spin 0.9s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `], J([L({ attribute: !1 })], X.prototype, "node", void 0), J([L({ type: Boolean })], X.prototype, "dimmed", void 0), J([L({ type: Boolean })], X.prototype, "selected", void 0), customElements.define("mfc-node", X);
//#endregion
//#region src/view/output-row.ts
var Et, Z = class extends I {
	constructor(...e) {
		super(...e), this.dimmed = !1, this.selected = !1;
	}
	updated() {
		this.toggleAttribute("data-dimmed", this.dimmed), this.toggleAttribute("data-selected", this.selected);
	}
	emit(e, t) {
		this.dispatchEvent(new CustomEvent(e, {
			detail: t,
			bubbles: !0,
			composed: !0
		}));
	}
	onSlider(e) {
		let t = Number(e.target.value);
		this.emit("output-volume", {
			entity: this.row.entity,
			level: t / 100
		});
	}
	render() {
		let e = this.row, t = Math.round(e.volumeLevel * 100);
		return D`
      <div class="row">
        <div
          class="top"
          @click=${() => this.emit("output-select", { id: e.id })}
          @contextmenu=${(t) => {
			t.preventDefault(), this.emit("output-more-info", { entity: e.entity });
		}}
        >
          <ha-icon .icon=${e.icon}></ha-icon>
          <span class="name">${e.name}</span>
          ${e.pending ? D`<span class="pending"></span>` : k}
          <span class="readout">
            ${e.muted ? "Muted" : `Vol ${t}%`}${e.readout && !e.muted ? ` · ${e.readout}` : ""}
          </span>
        </div>
        <div class="controls">
          ${e.hasVolume ? D`<input
                type="range"
                min="0"
                max="100"
                step="1"
                .value=${String(t)}
                @input=${this.onSlider}
                aria-label="Volume for ${e.name}"
              />` : D`<span class="readout">Volume not controllable right now</span>`}
          ${e.hasMute ? D`<button
                class="mute ${e.muted ? "muted" : ""}"
                title=${e.muted ? "Unmute" : "Mute"}
                @click=${() => this.emit("output-mute", {
			entity: e.entity,
			muted: e.muted
		})}
              >
                <ha-icon
                  .icon=${e.muted ? "mdi:volume-off" : "mdi:volume-high"}
                ></ha-icon>
              </button>` : k}
        </div>
      </div>
    `;
	}
};
Et = Z, Et.styles = [q, o`
      :host {
        display: block;
      }
      .row {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 10px 12px;
        border-radius: var(--mfc-radius);
        background: var(--mfc-node-bg-active);
        color: var(--mfc-text);
        transition: opacity 0.2s ease;
        border: 1px solid transparent;
      }
      :host([data-dimmed]) .row {
        opacity: var(--mfc-dim-opacity);
      }
      :host([data-selected]) .row {
        border-color: var(--mfc-text-dim);
      }
      .top {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        user-select: none;
      }
      .top ha-icon {
        color: var(--mfc-text-dim);
        --mdc-icon-size: 18px;
      }
      .name {
        flex: 1;
        min-width: 0;
        font-size: 13px;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .readout {
        font-size: 11px;
        color: var(--mfc-text-dim);
        white-space: nowrap;
      }
      .pending {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        border: 2px solid var(--mfc-text-dim);
        border-top-color: transparent;
        animation: spin 0.9s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
      .controls {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      input[type="range"] {
        flex: 1;
        min-width: 0;
        accent-color: var(--mfc-output-accent, #10b981);
        cursor: pointer;
      }
      button.mute {
        flex: none;
        border: none;
        background: none;
        color: var(--mfc-text-dim);
        cursor: pointer;
        padding: 2px;
        display: flex;
      }
      button.mute.muted {
        color: var(--mfc-warn);
      }
    `], J([L({ attribute: !1 })], Z.prototype, "row", void 0), J([L({ type: Boolean })], Z.prototype, "dimmed", void 0), J([L({ type: Boolean })], Z.prototype, "selected", void 0), customElements.define("mfc-output", Z);
//#endregion
//#region src/view/graph-view.ts
var Dt, Q = class extends I {
	constructor(...e) {
		super(...e), this.closure = null, this.selection = null, this.anchors = null, this.measureQueued = !1;
	}
	connectedCallback() {
		super.connectedCallback(), this.resizeObserver = new ResizeObserver(() => this.queueMeasure()), document.fonts?.ready?.then(() => this.queueMeasure());
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.resizeObserver?.disconnect();
	}
	firstUpdated() {
		let e = this.renderRoot.querySelector(".wrap");
		e && this.resizeObserver && this.resizeObserver.observe(e);
	}
	updated() {
		this.queueMeasure();
	}
	queueMeasure() {
		this.measureQueued || (this.measureQueued = !0, requestAnimationFrame(() => {
			this.measureQueued = !1, this.measure();
		}));
	}
	measure() {
		let e = this.renderRoot.querySelector(".wrap");
		if (!e) return;
		let t = e.getBoundingClientRect(), n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map();
		for (let e of this.renderRoot.querySelectorAll("[data-node-id]")) {
			let i = e.dataset.nodeId;
			if (!i) continue;
			let a = e.getBoundingClientRect(), o = a.top + a.height / 2 - t.top;
			n.set(i, [a.right - t.left, o]), r.set(i, [a.left - t.left, o]);
		}
		let i = {
			right: n,
			left: r,
			width: t.width,
			height: t.height
		};
		this.anchorsEqual(this.anchors, i) || (this.anchors = i);
	}
	anchorsEqual(e, t) {
		if (!e || e.width !== t.width || e.height !== t.height || e.right.size !== t.right.size || e.left.size !== t.left.size) return !1;
		for (let [n, [r, i]] of t.right) {
			let t = e.right.get(n);
			if (!t || Math.abs(t[0] - r) > .5 || Math.abs(t[1] - i) > .5) return !1;
		}
		for (let [n, [r, i]] of t.left) {
			let t = e.left.get(n);
			if (!t || Math.abs(t[0] - r) > .5 || Math.abs(t[1] - i) > .5) return !1;
		}
		return !0;
	}
	measuredLinks() {
		let e = this.anchors;
		if (!e) return [];
		let t = [];
		for (let n of this.model.links) {
			let r = e.right.get(n.fromId), i = e.left.get(n.toId);
			r && i && t.push({
				link: n,
				x1: r[0],
				y1: r[1],
				x2: i[0],
				y2: i[1]
			});
		}
		return t;
	}
	emphasis(e) {
		return this.closure ? this.closure.has(e.link.fromId) && this.closure.has(e.link.toId) ? "path" : "faded" : e.link.active ? "path" : "idle";
	}
	dimmed(e) {
		return this.closure !== null && !this.closure.has(e);
	}
	render() {
		let e = {
			...Pe,
			...this.columns
		}, t = this.model;
		return D`
      <div class="wrap">
        <svg class="links" aria-hidden="true">
          ${this.measuredLinks().map((e) => wt(e, this.emphasis(e), this.colors))}
        </svg>
        <div class="grid">
          <div class="col">
            <div class="col-header"><span class="pill">${e.inputs}</span></div>
            <mfc-node
              data-node-id=${t.input.id}
              .node=${t.input}
              .dimmed=${this.dimmed(t.input.id)}
              .selected=${this.selection === t.input.id}
            ></mfc-node>
          </div>
          <div class="col">
            <div class="col-header"><span class="pill">${e.channels}</span></div>
            <mfc-node
              data-node-id=${t.channel.id}
              .node=${t.channel}
              .dimmed=${this.dimmed(t.channel.id)}
              .selected=${this.selection === t.channel.id}
            ></mfc-node>
          </div>
          <div class="col">
            <div class="col-header"><span class="pill">${e.mixes}</span></div>
            ${t.mixes.map((e) => D`
                <mfc-node
                  data-node-id=${e.id}
                  .node=${e}
                  .dimmed=${this.dimmed(e.id)}
                  .selected=${this.selection === e.id}
                ></mfc-node>
              `)}
          </div>
          <div class="col">
            <div class="col-header"><span class="pill">${e.outputs}</span></div>
            ${t.outputs.length === 0 ? D`<div class="empty">No active outputs</div>` : t.outputs.map((e) => D`
                    <mfc-output
                      data-node-id=${e.id}
                      .row=${e}
                      .dimmed=${this.dimmed(e.id)}
                      .selected=${this.selection === e.id}
                    ></mfc-output>
                  `)}
            ${k}
          </div>
        </div>
      </div>
    `;
	}
};
Dt = Q, Dt.styles = [
	q,
	bt,
	o`
      :host {
        display: block;
      }
      .wrap {
        position: relative;
      }
      .grid {
        position: relative;
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px 56px;
        z-index: 1;
      }
      .col {
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-width: 0;
      }
      .col-header {
        display: flex;
        justify-content: center;
        margin-bottom: 2px;
      }
      .empty {
        font-size: 11.5px;
        color: var(--mfc-text-dim);
        text-align: center;
        padding: 10px 4px;
      }
      svg.links {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
      }
      @media (max-width: 640px) {
        .grid {
          gap: 12px 28px;
        }
      }
    `
], J([L({ attribute: !1 })], Q.prototype, "model", void 0), J([L({ attribute: !1 })], Q.prototype, "closure", void 0), J([L({ attribute: !1 })], Q.prototype, "colors", void 0), J([L({ attribute: !1 })], Q.prototype, "columns", void 0), J([L({ attribute: !1 })], Q.prototype, "selection", void 0), J([R()], Q.prototype, "anchors", void 0), customElements.define("mfc-graph", Q);
//#endregion
//#region src/music-flow-card.ts
var Ot, $ = class extends I {
	constructor(...e) {
		super(...e), this.selection = null, this.browsing = !1, this.pending = new mt(), this.watched = [], this.debouncedVolume = _t((e, t) => {
			this._hass && this.config && it(this._hass, this.pending, e, t, this.ttl());
		}, 250), this.onKeyDown = (e) => {
			e.key === "Escape" && (this.selection = null, this.browsing = !1);
		};
	}
	setConfig(e) {
		let t = ut(e);
		if (!t.config) throw Error(`music-flow-card configuration problems:\n- ${t.errors.join("\n- ")}`);
		this.config = t.config, this.watched = dt(t.config), this.pending.clear(), this.selection = null, this.refresh();
	}
	set hass(e) {
		let t = this._hass;
		this._hass = e, this.config && (this.pending.reconcile(e, Date.now()), (t === void 0 || this.watched.some((n) => t.states[n] !== e.states[n])) && this.refresh());
	}
	getCardSize() {
		return 6;
	}
	getGridOptions() {
		return {
			columns: 12,
			min_columns: 6
		};
	}
	static getStubConfig() {
		return {
			input: { entity: "media_player.music_assistant_player" },
			channel: { entity: "media_player.chromecast_audio" },
			feed_aliases: ["Chromecast"],
			zones: [{ entity: "media_player.living_room" }]
		};
	}
	ttl() {
		return this.config?.optimistic_ttl ?? 8e3;
	}
	refresh() {
		this._hass && this.config && (this.model = Xe(this._hass, this.config, this.pending)), this.schedulePendingSweep();
	}
	schedulePendingSweep() {
		this.pendingSweep !== void 0 && (clearTimeout(this.pendingSweep), this.pendingSweep = void 0), !this.pending.isEmpty() && (this.pendingSweep = setTimeout(() => {
			this.pendingSweep = void 0, this._hass && (this.pending.reconcile(this._hass, Date.now()), this.refresh());
		}, this.ttl() + 250));
	}
	connectedCallback() {
		super.connectedCallback(), this.addEventListener("keydown", this.onKeyDown);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.removeEventListener("keydown", this.onKeyDown);
	}
	firstUpdated(e) {
		this.setAttribute("tabindex", "-1");
	}
	zoneNodesByEntity() {
		let e = /* @__PURE__ */ new Map();
		for (let t of this.model?.mixes ?? []) t.kind === "zone" && e.set(t.entity, t);
		return e;
	}
	onNodeTap(e) {
		let t = this._hass, n = this.config, r = this.model;
		if (!t || !n || !r) return;
		if (e === r.input.id) {
			this.selection = e, this.browsing = !0;
			return;
		}
		if (e === r.channel.id) {
			this.selection = this.selection === e ? null : e;
			return;
		}
		let i = r.mixes.find((t) => t.id === e);
		if (!i) return;
		this.selection = e;
		let a = this.ttl();
		if (i.kind === "zone") {
			let e = n.zones.find((e) => e.entity === i.entity);
			e && tt(t, this.pending, n, e, i, a).then(() => this.refresh());
		} else if (i.kind === "group") nt(t, this.pending, n, i.entity, i, this.zoneNodesByEntity(), a).then(() => this.refresh());
		else if (i.kind === "master") {
			let e = (n.masters ?? []).find((e) => e.entity === i.entity);
			e && rt(t, this.pending, n, e, i, a).then(() => this.refresh());
		}
		this.refresh();
	}
	onOutputSelect(e) {
		this.selection = this.selection === e ? null : e;
	}
	render() {
		let e = this.model, t = this.config;
		if (!e || !t || !this._hass) return D`<div class="card">Waiting for Home Assistant state…</div>`;
		let n = Ze(e, this.selection);
		return D`
      <div
        class="card"
        @node-tap=${(e) => this.onNodeTap(e.detail.id)}
        @node-more-info=${(e) => {
			let t = e.detail.id.split(":").slice(1).join(":");
			gt(this, t);
		}}
        @output-select=${(e) => this.onOutputSelect(e.detail.id)}
        @output-more-info=${(e) => gt(this, e.detail.entity)}
        @output-volume=${(e) => {
			this.debouncedVolume(e.detail.entity, e.detail.level);
		}}
        @output-mute=${(e) => {
			this._hass && (at(this._hass, this.pending, e.detail.entity, e.detail.muted, this.ttl()).then(() => this.refresh()), this.refresh());
		}}
        @browse-close=${() => {
			this.browsing = !1;
		}}
        @browse-play=${(e) => {
			this.browsing = !1, this._hass && this.config && ot(this._hass, this.config.input.entity, e.detail.contentId, e.detail.contentType);
		}}
      >
        <div class="header">
          <span class="title">${t.title ?? ""}</span>
          ${this.selection === null ? k : D`
                <button
                  class="clear"
                  @click=${() => {
			this.selection = null;
		}}
                >
                  <ha-icon icon="mdi:close"></ha-icon>
                  Clear selection
                </button>
              `}
        </div>
        <mfc-graph
          .model=${e}
          .closure=${n}
          .colors=${t.colors}
          .columns=${t.columns}
          .selection=${this.selection}
        ></mfc-graph>
        ${xt(t.colors)}
        ${this.browsing ? D`
              <mfc-browse
                .hass=${this._hass}
                .entity=${t.input.entity}
              ></mfc-browse>
            ` : k}
      </div>
    `;
	}
};
Ot = $, Ot.styles = [
	q,
	bt,
	o`
      :host {
        display: block;
      }
      ha-card,
      .card {
        position: relative;
        display: block;
        background: var(--mfc-bg);
        border-radius: var(--ha-card-border-radius, 12px);
        padding: 16px;
        color: var(--mfc-text);
      }
      .header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 14px;
      }
      .header .title {
        flex: 1;
        font-size: 16px;
        font-weight: 600;
      }
      button.clear {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border: 1px solid var(--mfc-idle-link);
        border-radius: 8px;
        background: var(--mfc-node-bg);
        color: var(--mfc-text);
        font-size: 12px;
        padding: 4px 10px;
        cursor: pointer;
      }
      .legend {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 16px;
        margin-top: 16px;
        font-size: 11px;
        color: var(--mfc-text-dim);
      }
      .legend-item {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
    `
], J([L({ attribute: !1 })], $.prototype, "config", void 0), J([R()], $.prototype, "selection", void 0), J([R()], $.prototype, "browsing", void 0), J([R()], $.prototype, "model", void 0), customElements.define("music-flow-card", $), window.customCards = window.customCards ?? [], window.customCards.push({
	type: "music-flow-card",
	name: "Music Flow Card",
	description: "Audio Flow style routing: Music Assistant source, Chromecast stream, Yamaha and Monoprice zones, active outputs with volume.",
	documentationURL: "https://github.com/trooperthorn/ha_card_music"
}), console.info("%c MUSIC-FLOW-CARD %c v2026.08.26.2 ", "background: #444; color: #fff; border-radius: 3px 0 0 3px; padding: 2px 0;", "background: #10b981; color: #fff; border-radius: 0 3px 3px 0; padding: 2px 0;");
//#endregion
export { $ as MusicFlowCard, Le as nodeId };
