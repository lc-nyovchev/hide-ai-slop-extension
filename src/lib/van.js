{
	let e, t, r, o, n, l, s, i, f, h, w, a, d, u, _, c, S, g, y, b, m, v, j, x, O
	;(s = Object.getPrototypeOf),
		(f = {}),
		(h = s((i = { isConnected: 1 }))),
		(w = s(s)),
		(a = (e, t, r, o) => (e ?? (setTimeout(r, o), new Set())).add(t)),
		(d = (e, t, o) => {
			let n = r
			r = t
			try {
				return e(o)
			} catch (e) {
				return console.error(e), o
			} finally {
				r = n
			}
		}),
		(u = (e) => e.filter((e) => e.t?.isConnected)),
		(_ = (e) =>
			(n = a(
				n,
				e,
				() => {
					for (let e of n) (e.o = u(e.o)), (e.l = u(e.l))
					n = l
				},
				1e3
			))),
		(c = {
			get val() {
				return r?.i?.add(this), this.rawVal
			},
			get oldVal() {
				return r?.i?.add(this), this.h
			},
			set val(o) {
				r?.u?.add(this), o !== this.rawVal && ((this.rawVal = o), this.o.length + this.l.length ? (t?.add(this), (e = a(e, this, x))) : (this.h = o))
			}
		}),
		(S = (e) => ({ __proto__: c, rawVal: e, h: e, o: [], l: [] })),
		(g = (e, t) => {
			let r = { i: new Set(), u: new Set() },
				n = { f: e },
				l = o
			o = []
			let s = d(e, r, t)
			s = (s ?? document).nodeType ? s : new Text(s)
			for (let e of r.i) r.u.has(e) || (_(e), e.o.push(n))
			for (let e of o) e.t = s
			return (o = l), (n.t = s)
		}),
		(y = (e, t = S(), r) => {
			let n = { i: new Set(), u: new Set() },
				l = { f: e, s: t }
			;(l.t = r ?? o?.push(l) ?? i), (t.val = d(e, n, t.rawVal))
			for (let e of n.i) n.u.has(e) || (_(e), e.l.push(l))
			return t
		}),
		(b = (e, ...t) => {
			for (let r of t.flat(1 / 0)) {
				let t = s(r ?? 0),
					o = t === c ? g(() => r.val) : t === w ? g(r) : r
				o != l && e.append(o)
			}
			return e
		}),
		(m = (e, t, ...r) => {
			let [{ is: o, ...n }, ...i] = s(r[0] ?? 0) === h ? r : [{}, ...r],
				a = e ? document.createElementNS(e, t, { is: o }) : document.createElement(t, { is: o })
			for (let [e, r] of Object.entries(n)) {
				let o = (t) => (t ? Object.getOwnPropertyDescriptor(t, e) ?? o(s(t)) : l),
					n = t + ',' + e,
					i = (f[n] ??= o(s(a))?.set ?? 0),
					h = e.startsWith('on')
						? (t, r) => {
								let o = e.slice(2)
								a.removeEventListener(o, r), a.addEventListener(o, t)
						  }
						: i
						? i.bind(a)
						: a.setAttribute.bind(a, e),
					d = s(r ?? 0)
				e.startsWith('on') || (d === w && ((r = y(r)), (d = c))), d === c ? g(() => (h(r.val, r.h), a)) : h(r)
			}
			return b(a, i)
		}),
		(v = (e) => ({ get: (t, r) => m.bind(l, e, r) })),
		(j = (e, t) => (t ? t !== e && e.replaceWith(t) : e.remove())),
		(x = () => {
			let r = 0,
				o = [...e].filter((e) => e.rawVal !== e.h)
			do {
				t = new Set()
				for (let e of new Set(o.flatMap((e) => (e.l = u(e.l))))) y(e.f, e.s, e.t), (e.t = l)
			} while (++r < 100 && (o = [...t]).length)
			let n = [...e].filter((e) => e.rawVal !== e.h)
			e = l
			for (let e of new Set(n.flatMap((e) => (e.o = u(e.o))))) j(e.t, g(e.f, e.t)), (e.t = l)
			for (let e of n) e.h = e.rawVal
		}),
		(O = { tags: new Proxy((e) => new Proxy(m, v(e)), v()), hydrate: (e, t) => j(e, g(t, e)), add: b, state: S, derive: y }),
		(window.van = O)
}
