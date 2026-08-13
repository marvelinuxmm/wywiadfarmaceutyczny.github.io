/* Centralne etykiety opcji — zbudowane z G.OPCJE (js/data/opcje.js), używane przez raport
   (zakładka 8). Dzięki jednemu źródłu teksty w UI i w raporcie nie mogą się rozjechać. */
(function () {
  const G = typeof window !== 'undefined' ? window : globalThis;

  G.E = {
    label: function (domain, id) {
      const m = G.OPCJE[domain];
      if (!m) return (id == null ? '' : String(id));
      const f = m.find(function (x) { return x[0] === id; });
      return f ? f[1] : (id == null ? '' : String(id));
    },
    lista: function (domain, obj) {
      const out = [];
      (G.OPCJE[domain] || []).forEach(function (x) {
        if (obj && obj[x[0]]) out.push(x[1]);
      });
      return out;
    },
    skroty: function (domain, obj) {
      return G.E.lista(domain, obj).join(', ');
    }
  };
})();
