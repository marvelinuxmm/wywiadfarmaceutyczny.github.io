/* Podsumowanie ryzyka farmakoterapii — logika czysta, testowalna w Node.
   Wejście: stan aplikacji (choroby, leki, odpowiedzi). Wyjście: { info, uwaga, reakcja } — listy komunikatów. */
(function () {
  const G = typeof window !== 'undefined' ? window : globalThis;

  const BOLOWE = ['NLPZ', 'opioid', 'gabapentynoid', 'paracetamol', 'benzodiazepina', 'z-lek'];

  function effGroups(row) {
    const set = {};
    (row.grupy || []).forEach(function (g) { if (g) set[g] = true; });
    G.Leki.znajdzGrupy(row.nazwa).forEach(function (g) { set[g] = true; });
    return Object.keys(set);
  }

  function compute(s) {
    const items = { info: [], uwaga: [], reakcja: [] };
    const ch = s.choroby || {};
    const leki = Array.isArray(s.leki) ? s.leki : [];
    const eff = leki
      .map(function (r) { return { nazwa: String(r.nazwa || '').trim(), grupy: effGroups(r) }; })
      .filter(function (d) { return d.nazwa !== ''; });

    const ma = function (g) {
      return eff.filter(function (d) { return d.grupy.indexOf(g) !== -1; }).map(function (d) { return d.nazwa; });
    };

    /* Poziom 1 — informacja */
    const bolowe = eff.filter(function (d) {
      return d.grupy.some(function (g) { return BOLOWE.indexOf(g) !== -1; });
    });
    if (bolowe.length > 1) {
      items.info.push('Pacjent stosuje kilka leków istotnych dla leczenia bólu (' + bolowe.length +
        ' pozycje na liście). Rozważ ocenę łącznej ekspozycji.');
    }

    /* Poziom 2 — uwaga farmaceutyczna */
    const nlpz = ma('NLPZ');
    if (nlpz.length && (ch.przewodpokarmowy || ch.pchn || ch.sercowo)) {
      items.uwaga.push('Pacjent stosuje NLPZ (' + nlpz.join(', ') +
        ') i ma zaznaczoną chorobę przewodu pokarmowego / PChN / chorobę sercowo-naczyniową. Zweryfikuj bezpieczeństwo stosowania.');
    }
    const opio = ma('opioid');
    if (opio.length && ch.oddechowe) {
      items.uwaga.push('Pacjent stosuje opioid (' + opio.join(', ') +
        ') przy chorobie układu oddechowego — ryzyko depresji oddechowej i sedacji.');
    }
    const gab = ma('gabapentynoid');
    if (gab.length && ch.oddechowe) {
      items.uwaga.push('Pacjent stosuje gabapentynoid (' + gab.join(', ') +
        ') przy chorobie układu oddechowego — ryzyko sedacji.');
    }
    const sed = eff.filter(function (d) {
      return d.grupy.some(function (g) { return g === 'benzodiazepina' || g === 'z-lek'; });
    }).map(function (d) { return d.nazwa; });
    if (sed.length && ch.oddechowe) {
      items.uwaga.push('Pacjent stosuje leki sedujące (' + sed.join(', ') +
        ') przy chorobie układu oddechowego — ryzyko nasilonej sedacji.');
    }
    const para = ma('paracetamol');
    if (para.length && ch.watroba) {
      items.uwaga.push('Pacjent stosuje paracetamol (' + para.join(', ') +
        ') przy chorobie wątroby. Sprawdź całkowitą dawkę dobową (także z preparatów złożonych).');
    }

    /* Poziom 3 — wymaga reakcji */
    const od = s.odpowiedzi || {};
    const alarmy = Object.keys(od).filter(function (id) {
      return od[id] === 'tak' && G.Pytania.isAlarm(id);
    });
    if (alarmy.length) {
      const teksty = alarmy.map(function (id) {
        let t = G.Pytania.byId[id].tekst;
        t = t.replace(/^\s*Czy\s+(występuje|występują|występowały)\s+/i, '');
        t = t.replace(/\?\s*$/, '');
        return t.charAt(0).toUpperCase() + t.slice(1);
      });
      items.reakcja.push('Pacjent zgłasza: ' + teksty.join('; ') + '. Rozważ pilną konsultację zgodnie z procedurą.');
    }

    return items;
  }

  G.Ryzyko = { compute: compute };
})();
