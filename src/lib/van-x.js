{
	let e,
		t,
		r,
		{ fromEntries: o, entries: l, keys: n, hasOwn: f, getPrototypeOf: a, create: i, assign: y } = Object,
		{ get: c, set: s, deleteProperty: m, ownKeys: d } = Reflect,
		{ state: u, derive: b, add: w } = van,
		g = 1e3,
		A = Symbol(),
		S = Symbol(),
		_ = Symbol(),
		p = Symbol(),
		P = Symbol(),
		v = Symbol(),
		h = (e) => ((e[S] = 1), e),
		F = (e) => e instanceof Object && !(e instanceof Function) && !e[v],
		O = (e) => {
			if (e?.[S]) {
				let t = u()
				return (
					b(() => {
						let r = e()
						F(t.rawVal) && F(r) ? H(t.rawVal, r) : (t.val = j(r))
					}),
					t
				)
			}
			return u(j(e))
		},
		x = (e) => {
			let t = Array.isArray(e) ? [] : { __proto__: a(e) }
			for (let [r, o] of l(e)) t[r] = O(o)
			return (t[_] = []), (t[p] = u(1)), t
		},
		D = {
			get: (e, t, r) => (t === A ? e : f(e, t) ? (Array.isArray(e) && 'length' === t ? (e[p].val, e.length) : e[t].val) : c(e, t, r)),
			set: (e, o, l, n) =>
				f(e, o) ? (Array.isArray(e) && 'length' === o ? (l !== e.length && ++e[p].val, (e.length = l), 1) : ((e[o].val = j(l)), 1)) : o in e ? s(e, o, l, n) : s(e, o, O(l)) && (++e[p].val, R(e).forEach(T.bind(t, n, o, e[o], r)), 1),
			deleteProperty: (e, t) => (m(e, t) && q(e, t), ++e[p].val),
			ownKeys: (e) => (e[p].val, d(e))
		},
		j = (e) => (!F(e) || e[A] ? e : new Proxy(x(e), D)),
		K = (e) => ((e[v] = 1), e),
		N = (e) => e[A],
		k = a(u()),
		C = (e) => new Proxy(e, { get: (e, t, r) => (a(e[t] ?? 0) === k ? { val: E(e[t].rawVal) } : c(e, t, r)) }),
		E = (e) => (e?.[A] ? new Proxy(C(e[A]), D) : e),
		R = (e) => (e[_] = e[_].filter((e) => e.t.isConnected)),
		T = (e, t, r, o, { t: l, f: f }) => {
			let a = Array.isArray(e),
				i = a ? Number(t) : t
			w(l, () => (l[P][t] = f(r, () => delete e[t], i))), a && !o && i !== e.length - 1 && l.insertBefore(l.lastChild, l[P][n(e).find((e) => Number(e) > i)])
		},
		q = (e, t) => {
			for (let r of R(e)) {
				let e = r.t[P]
				e[t]?.remove(), delete e[t]
			}
		},
		z = (r) => (e ?? (setTimeout(() => (e.forEach(R), (e = t)), g), (e = new Set()))).add(r),
		B = (e, t, r) => {
			let o = { t: e instanceof Function ? e() : e, f: r },
				n = t[A]
			;(o.t[P] = {}), n[_].push(o), z(n)
			for (let [e, r] of l(n)) T(t, e, r, 1, o)
			return o.t
		},
		G = (e, t) => {
			for (let [r, o] of l(t)) {
				let t = e[r]
				F(t) && F(o) ? G(t, o) : (e[r] = o)
			}
			for (let r in e) f(t, r) || delete e[r]
			let r = n(t),
				o = Array.isArray(e)
			if (o || n(e).some((e, t) => e !== r[t])) {
				let l = e[A]
				if (o) e.length = t.length
				else {
					++l[p].val
					let e = { ...l }
					for (let e of r) delete l[e]
					for (let t of r) l[t] = e[t]
				}
				for (let { t: e } of R(l)) {
					let { firstChild: t, [P]: o } = e
					for (let l of r) t === o[l] ? (t = t.nextSibling) : e.insertBefore(o[l], t)
				}
			}
			return e
		},
		H = (e, n) => {
			r = 1
			try {
				return G(e, n instanceof Function ? (Array.isArray(e) ? n(e.filter((e) => 1)) : o(n(l(e)))) : n)
			} finally {
				r = t
			}
		},
		I = (e) => (Array.isArray(e) ? e.filter((e) => 1).map(I) : F(e) ? y(i(a(e)), o(l(e).map(([e, t]) => [e, I(t)]))) : e)
	window.vanX = { calc: h, reactive: j, noreactive: K, stateFields: N, raw: E, list: B, replace: H, compact: I }
}
