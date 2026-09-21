/* Zakładka 8: PC-MAI — matryca adekwatności leków przeciwbólowych.
   Wiersze = leki pacjenta zakwalifikowane do klas przeciwbólowych (auto) + dodane ręcznie.
   Kolumny = 10 kryteriów MAI (wg GlobalRPH, max 18 pkt/lek) + suma. */
(function () {
  const h = UI.h;
  const G = typeof window !== 'undefined' ? window : globalThis;

  let root = null;

  function pcmai() { return G.State.get().pcmai; }

  function rows() {
    const s = G.State.get();
    return G.Pcmai.wybierzWiersze(s.leki, s.pcmai.dodatkowe);
  }

  function strukturaKlucz(lista) {
    return lista.map(function (w) { return w.id; }).join(',');
  }

  /* ---------- 8.1 Dane i opis ---------- */
  function buildDane() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '8.1' }), 'PC-MAI — ocena adekwatności farmakoterapii']),
      h('p', { class: 'hint', text: 'Medication Appropriateness Index (MAI, Hanlon/Samsa): 10 kryteriów, maks. 18 pkt na lek. Wartości kolumn: „Tak”/„Nie” (odpowiedź właściwa = 0 pkt). Lista leków i klasy są autouzupełniane z zakładki „Farmakoterapia”; sugestie odpowiedzi pochodzą z pozostałych zakładek.' }),
      h('div', { class: 'field' }, [
        h('label', { class: 'ctl' }, ['Data oceny PC-MAI']),
        h('input', { type: 'date', id: 'pc-data', 'data-state': 'pcmai.data' })
      ])
    ]);
  }

  /* ---------- 8.2 Matryca ---------- */
  function buildMatrix() {
    const thead = h('tr', {}, [
      h('th', { class: 'pc-lek', text: 'Lek' })
    ].concat(G.Pcmai.KRYTERIA.map(function (k) {
      return h('th', { class: 'pc-kryt', title: k.pytanie + ' (waga ' + k.waga + ' pkt; właściwa odpowiedź: ' + (k.wlasciwa === 'tak' ? 'Tak' : 'Nie') + ')' }, [
        h('span', { text: k.label }),
        h('span', { class: 'pc-waga', text: k.waga })
      ]);
    })).concat([
      h('th', { class: 'pc-suma', text: 'Suma' })
    ]));

    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '8.2' }), 'Matryca MAI']),
      h('div', { class: 'row-inline', style: { gap: '10px', flexWrap: 'wrap', marginBottom: '10px' } }, [
        h('button', { class: 'btn', type: 'button', id: 'btn-pc-autouzupelnij', text: 'Autouzupełnij sugestie' }),
        h('button', { class: 'btn', type: 'button', id: 'btn-pc-komentarze', text: 'Pokaż / ukryj komentarze' }),
        h('select', { id: 'pc-dodaj-sel' })
      ]),
      h('div', { class: 'tabela-scroll' }, [
        h('table', { class: 'tabela tabela-pcmai', id: 'pc-matrix' }, [
          h('thead', {}, [thead]),
          h('tbody', { id: 'pc-tbody' })
        ])
      ]),
      h('div', { class: 'hint', style: { marginTop: '8px' }, text: 'Wiersze z lekami przeciwbólowymi są dodawane automatycznie na podstawie grup/ATC z listy leków. Z listy po prawej możesz dodać pozostałe leki pacjenta. Kliknij „Autouzupełnij sugestie”, aby wypełnić puste komórki propozycjami aplikacji.' })
    ]);
  }

  function buildCell(lekId, k) {
    return h('td', { class: 'pc-cel', 'data-pc-cel': lekId + ':' + k.id }, [
      h('select', {
        'data-pc-lek': lekId,
        'data-pc-kryt': k.id,
        title: k.pytanie
      }, [
        h('option', { value: '', text: '—' }),
        h('option', { value: 'tak', text: 'Tak' }),
        h('option', { value: 'nie', text: 'Nie' })
      ]),
      h('div', { class: 'pc-kom-wrap' }, [
        h('input', {
          type: 'text',
          class: 'pc-kom',
          placeholder: 'komentarz',
          'data-pc-kom-lek': lekId,
          'data-pc-kom-kryt': k.id
        })
      ])
    ]);
  }

  function buildRow(w) {
    const klasy = w.klasy.map(function (k) { return G.Pcmai.KLASA_LABEL[k] || k; }).join(', ');
    const cells = G.Pcmai.KRYTERIA.map(function (k) { return buildCell(w.id, k); });
    const akcje = [];
    if (w.reczny) {
      akcje.push(h('button', { class: 'btn btn-mini btn-danger', type: 'button', 'data-pc-remove': w.id, title: 'Usuń lek z matrycy', text: '×' }));
    }
    return h('tr', { 'data-pc-row': w.id }, [
      h('td', { class: 'pc-lek' }, [
        h('div', { class: 'pc-lek-name', text: w.nazwa }),
        h('div', { class: 'pc-lek-klasa', text: klasy || 'dodany ręcznie' }),
        akcje.length ? h('div', { class: 'pc-lek-akcje' }, akcje) : null
      ])
    ].concat(cells).concat([
      h('td', { class: 'pc-suma', 'data-pc-suma': w.id, text: '—' })
    ]));
  }

  function renderMatrix(lista) {
    const tb = root.querySelector('#pc-tbody');
    if (!tb) return;
    tb.innerHTML = '';
    if (!lista.length) {
      tb.appendChild(h('tr', { class: 'pusty-wiersz' }, [
        h('td', { colspan: String(G.Pcmai.KRYTERIA.length + 2), class: 'hint', text: 'Brak leków w matrycy — dodaj leki w zakładce „Farmakoterapia” lub z listy powyżej.' })
      ]));
    } else {
      lista.forEach(function (w) { tb.appendChild(buildRow(w)); });
    }
    const tabela = root.querySelector('#pc-matrix');
    if (tabela) tabela.setAttribute('data-pc-struktura', strukturaKlucz(lista));
    renderDodajSelect(lista);
  }

  function renderDodajSelect(lista) {
    const sel = root.querySelector('#pc-dodaj-sel');
    if (!sel) return;
    sel.innerHTML = '';
    const s = G.State.get();
    const wMatrycy = {};
    lista.forEach(function (w) { wMatrycy[w.id] = true; });
    const opcje = (s.leki || []).filter(function (l) {
      return l && String(l.nazwa || '').trim() && !wMatrycy[l.id];
    });
    if (!opcje.length) {
      sel.appendChild(h('option', { value: '', text: '— brak pozostałych leków —' }));
      sel.disabled = true;
      return;
    }
    sel.disabled = false;
    sel.appendChild(h('option', { value: '', text: '+ Dodaj pozostały lek…' }));
    opcje.forEach(function (l) {
      sel.appendChild(h('option', { value: String(l.id), text: G.Pcmai.etykieta(l) }));
    });
  }

  function syncMatrix(lista) {
    const p = pcmai();
    lista.forEach(function (w) {
      const odp = (p.odpowiedzi || {})[w.id] || {};
      const kom = (p.komentarze || {})[w.id] || {};
      const sug = G.Pcmai.sugeruj(G.State.get(), w.lek);
      G.Pcmai.KRYTERIA.forEach(function (k) {
        const sel = root.querySelector('select[data-pc-lek="' + w.id + '"][data-pc-kryt="' + k.id + '"]');
        if (sel) {
          const v = odp[k.id] || '';
          if (sel.value !== v) sel.value = v;
          const s = sug[k.id];
          sel.classList.toggle('sugerowane', !!s && s.wartosc === v);
          if (s) sel.title = k.pytanie + '\nSugestia aplikacji: ' + (s.wartosc === 'tak' ? 'Tak' : 'Nie') + ' (' + s.zrodlo + ')';
          else sel.title = k.pytanie;
        }
        const inp = root.querySelector('input[data-pc-kom-lek="' + w.id + '"][data-pc-kom-kryt="' + k.id + '"]');
        if (inp) {
          const v = kom[k.id] || '';
          if (inp.value !== v) inp.value = v;
        }
      });
      updateRowSum(w.id);
    });
  }

  function updateRowSum(lekId) {
    const cel = root.querySelector('[data-pc-suma="' + lekId + '"]');
    if (!cel) return;
    const p = pcmai();
    const wynik = G.Pcmai.policz((p.odpowiedzi || {})[lekId] || {});
    cel.textContent = wynik.suma + '/' + wynik.max;
    const band = G.Pcmai.band(wynik.suma);
    cel.className = 'pc-suma pc-suma-' + band.sev;
    cel.title = 'Oceniono ' + wynik.ocenione + '/' + wynik.liczba + ' kryteriów. ' + band.label;
  }

  /* ---------- 8.3 Wynik zbiorczy ---------- */
  function buildWynik() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '8.3' }), 'Wynik PC-MAI']),
      h('div', { class: 'results', id: 'pc-wynik' })
    ]);
  }

  function renderWynik(lista) {
    const box = root.querySelector('#pc-wynik');
    if (!box) return;
    const p = pcmai();
    box.innerHTML = '';
    if (!lista.length) {
      box.appendChild(h('p', { class: 'hint', text: 'Brak danych do podsumowania.' }));
      return;
    }
    let suma = 0;
    let max = 0;
    let nieprawidlowe = 0;
    let wysokie = 0;
    const opis = [];
    lista.forEach(function (w) {
      const wynik = G.Pcmai.policz((p.odpowiedzi || {})[w.id] || {});
      suma += wynik.suma;
      max += wynik.max;
      nieprawidlowe += wynik.nieprawidlowe;
      if (wynik.suma >= 6) wysokie++;
      opis.push(w.nazwa + ': ' + wynik.suma + '/' + wynik.max);
    });
    box.appendChild(h('div', { class: 'res-row' }, [
      h('span', { text: 'Suma PC-MAI (wszystkie leki)' }),
      h('div', { class: 'res-valbox' }, [
        h('div', { class: 'res-val', text: suma + ' / ' + max + ' pkt' }),
        h('div', { class: 'res-band', text: 'nieprawidłowe odpowiedzi: ' + nieprawidlowe })
      ])
    ]));
    box.appendChild(h('div', { class: 'hint', text: opis.join(' • ') }));
    if (wysokie) {
      box.appendChild(h('div', { class: 'komunikat komunikat-alert', style: { marginTop: '10px' }, text: 'Co najmniej jeden lek osiągnął wysoką nieodpowiedniość (MAI ≥6) — wymaga reakcji farmaceuty lub lekarza.' }));
    }
  }

  /* ---------- 8.4 Epikryza ---------- */
  function buildEpikryza() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '8.4' }), 'Epikryza PC-MAI']),
      h('div', { class: 'field' }, [
        h('label', { class: 'ctl' }, ['Komentarz farmaceuty']),
        h('textarea', {
          rows: '5',
          placeholder: 'Podsumuj adekwatność poszczególnych leków przeciwbólowych: wskazanie, skuteczność, dawkowanie, interakcje, duplikację i czas terapii oraz zalecane działania.',
          'data-state': 'pcmai.epikryza'
        })
      ])
    ]);
  }

  function build() {
    return [buildDane(), buildMatrix(), buildWynik(), buildEpikryza()];
  }

  /* ---------- Autouzupełnianie ---------- */
  function autouzupelnij(lista, force) {
    const s = G.State.get();
    let zmieniono = false;
    lista.forEach(function (w) {
      const sug = G.Pcmai.sugeruj(s, w.lek);
      const odp = s.pcmai.odpowiedzi[w.id] = s.pcmai.odpowiedzi[w.id] || {};
      const auto = s.pcmai.auto[w.id] = s.pcmai.auto[w.id] || {};
      G.Pcmai.KRYTERIA.forEach(function (k) {
        const sg = sug[k.id];
        if (!sg || (sg.wartosc !== 'tak' && sg.wartosc !== 'nie')) return;
        const cur = odp[k.id];
        const puste = (cur === '' || cur === null || cur === undefined);
        if (puste && (force || !auto[k.id])) {
          odp[k.id] = sg.wartosc;
          auto[k.id] = true;
          zmieniono = true;
        }
      });
    });
    if (zmieniono) G.State.notify();
  }

  /* ---------- Zdarzenia ---------- */
  function handleInput(e) {
    const t = e.target;
    const key = t.getAttribute && t.getAttribute('data-state');
    if (key) { UI.handleStateInput(e); return; }
    const lekId = t.getAttribute && t.getAttribute('data-pc-lek');
    if (lekId != null) {
      const p = pcmai();
      p.odpowiedzi[lekId] = p.odpowiedzi[lekId] || {};
      p.odpowiedzi[lekId][t.getAttribute('data-pc-kryt')] = t.value;
      G.State.notify();
      return;
    }
    const komLek = t.getAttribute && t.getAttribute('data-pc-kom-lek');
    if (komLek != null) {
      const p = pcmai();
      p.komentarze[komLek] = p.komentarze[komLek] || {};
      p.komentarze[komLek][t.getAttribute('data-pc-kom-kryt')] = t.value;
      G.State.notify();
    }
  }

  function handleChange(e) {
    const t = e.target;
    if (t.id === 'pc-dodaj-sel') {
      if (!t.value) return;
      const p = pcmai();
      const id = parseInt(t.value, 10);
      if (isFinite(id) && p.dodatkowe.indexOf(id) === -1) {
        p.dodatkowe.push(id);
        G.State.notify();
      }
      return;
    }
    handleInput(e);
  }

  function handleClick(e) {
    const t = e.target;
    if (t.closest && t.closest('#btn-pc-autouzupelnij')) {
      autouzupelnij(rows(), true);
      return;
    }
    if (t.closest && t.closest('#btn-pc-komentarze')) {
      const tabela = root.querySelector('#pc-matrix');
      if (tabela) tabela.classList.toggle('komentarze');
      return;
    }
    const rm = t.getAttribute && t.getAttribute('data-pc-remove');
    if (rm != null) {
      const id = parseInt(rm, 10);
      const p = pcmai();
      p.dodatkowe = p.dodatkowe.filter(function (x) { return x !== id; });
      delete p.odpowiedzi[id];
      delete p.komentarze[id];
      delete p.auto[id];
      G.State.notify();
    }
  }

  /* ---------- Init / apply ---------- */
  function init(container) {
    root = container;
    const cards = build();
    cards.forEach(function (c) { root.appendChild(c); });
    root.removeEventListener('input', handleInput);
    root.removeEventListener('change', handleChange);
    root.removeEventListener('click', handleClick);
    root.addEventListener('input', handleInput);
    root.addEventListener('change', handleChange);
    root.addEventListener('click', handleClick);
    const tabela = root.querySelector('#pc-matrix');
    if (tabela) tabela.classList.remove('komentarze');
  }

  function apply() {
    if (!root) return;
    if (!root.querySelector('#pc-matrix')) return;

    const s = G.State.get();

    /* Domyślnie data bieżąca */
    if (!s.pcmai.data) s.pcmai.data = new Date().toISOString().slice(0, 10);

    UI.sync(root);

    const lista = G.Pcmai.wybierzWiersze(s.leki, s.pcmai.dodatkowe);

    /* Ciche autouzupełnianie pustych komórek (raz na komórkę) */
    autouzupelnij(lista, false);

    const tabela = root.querySelector('#pc-matrix');
    const klucz = strukturaKlucz(lista);
    if (!tabela || tabela.getAttribute('data-pc-struktura') !== klucz) {
      renderMatrix(lista);
    } else {
      renderDodajSelect(lista);
    }
    syncMatrix(lista);
    renderWynik(lista);
  }

  G.Tab8 = { init: init, apply: apply };
})();
