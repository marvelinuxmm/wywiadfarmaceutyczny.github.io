/* Zakładka 2: Farmakoterapia — lista leków, pytania aktywowane, podsumowanie ryzyka,
   status farmakoterapii, epikryza. */
(function () {
  const h = UI.h;
  const G = typeof window !== 'undefined' ? window : globalThis;

  const TRYB = [['', '—']].concat(G.OPCJE.tryb);

  let root = null;

  const td = function (c) { return h('td', {}, c); };
  const th = function (t) { return h('th', { text: t }); };

  /* ---------- 2.1 Lista leków ---------- */

  function buildLeki() {
    const datalist = h('datalist', { id: 'datalist-leki' },
      G.BAZA_LEKOW.map(function (l) { return h('option', { value: l.nazwa }); })
    );
    const table = h('table', { class: 'tabela' }, [
      h('thead', {}, [h('tr', {}, [
        th('Nazwa handlowa, moc, postać'),
        th('Schemat dawkowania (Doraźnie / Przewlekle), np. 1-0-0'),
        th('Wskazanie do stosowania'),
        th('Komentarze')
      ])]),
      h('tbody', { id: 'tbody-leki' })
    ]);
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '2.1' }), 'Lista wszystkich leków pacjenta (Rx/OTC/suplementy)']),
      datalist,
      table,
      h('div', { class: 'row-inline', style: { marginTop: '10px', gap: '10px', flexWrap: 'wrap' } }, [
        h('button', { class: 'btn', type: 'button', id: 'btn-dodaj-lek', text: '+ Dodaj lek' }),
        h('span', { class: 'hint', text: 'Nazwa z podpowiedziami z bazy — grupy substancji (NLPZ, opioid…) wykrywane automatycznie lub wybierane ręcznie.' })
      ])
    ]);
  }

  function chip(g, i) {
    return h('span', { class: 'chip' }, [
      G.GRUPA_LABEL[g] || g,
      h('button', { type: 'button', 'data-lDelGroup': i + ':' + g, text: '×' })
    ]);
  }

  function buildRow(r, i) {
    const grpBox = h('span', { 'data-lAddBox': i }, [addSelect(i, r)]);
    return h('tr', {}, [
      td([
        h('input', { type: 'text', placeholder: 'Nazwa handlowa', list: 'datalist-leki', 'data-lRow': i, 'data-lField': 'nazwa' }),
        h('div', { class: 'row-inline' }, [
          h('input', { type: 'text', placeholder: 'moc, np. 200 mg', 'data-lRow': i, 'data-lField': 'moc' }),
          h('input', { type: 'text', placeholder: 'postać, np. tabl.', 'data-lRow': i, 'data-lField': 'postac' })
        ])
      ]),
      td([
        h('select', { 'data-lRow': i, 'data-lField': 'tryb' },
          TRYB.map(function (o) { return h('option', { value: o[0], text: o[1] }); })),
        h('input', { type: 'text', placeholder: 'np. 1-0-0', 'data-lRow': i, 'data-lField': 'schemat' })
      ]),
      td([h('input', { type: 'text', placeholder: 'Wskazanie', 'data-lRow': i, 'data-lField': 'wskazanie' })]),
      td([
        h('input', { type: 'text', placeholder: 'Komentarz', 'data-lRow': i, 'data-lField': 'komentarze' }),
        h('div', { class: 'chips', 'data-chips': i }),
        h('div', { class: 'row-inline' }, [
          grpBox,
          h('button', { class: 'btn btn-mini btn-danger', type: 'button', 'data-lRemove': i, text: 'Usuń' })
        ])
      ])
    ]);
  }

  function addSelect(i, r) {
    const grupy = (r && r.grupy) || [];
    const options = [h('option', { value: '', text: '+ grupa…' })];
    G.GRUPA_IDS.forEach(function (g) {
      if (grupy.indexOf(g) === -1) options.push(h('option', { value: g, text: G.GRUPA_LABEL[g] }));
    });
    return h('select', { class: 'sel-grupa', 'data-lAddGroup': i }, options);
  }

  function renderRows() {
    const tb = root.querySelector('#tbody-leki');
    tb.innerHTML = '';
    const s = G.State.get();
    if (!s.leki.length) {
      tb.appendChild(h('tr', { class: 'pusty-wiersz' }, [
        h('td', { colspan: '4', class: 'hint', text: 'Brak dodanych leków — kliknij „Dodaj lek”.' })
      ]));
      return;
    }
    s.leki.forEach(function (r, i) { tb.appendChild(buildRow(r, i)); });
  }

  function syncRows() {
    const s = G.State.get();
    const rows = root.querySelectorAll('#tbody-leki tr');
    for (let i = 0; i < s.leki.length; i++) {
      const tr = rows[i];
      if (!tr) continue;
      const row = s.leki[i];
      tr.querySelectorAll('[data-lField]').forEach(function (inp) {
        const f = inp.getAttribute('data-lField');
        inp.value = (row[f] == null) ? '' : row[f];
      });
      const chipsEl = tr.querySelector('[data-chips]');
      chipsEl.innerHTML = '';
      (row.grupy || []).forEach(function (g) { chipsEl.appendChild(chip(g, i)); });
      const box = tr.querySelector('[data-lAddBox]');
      box.innerHTML = '';
      box.appendChild(addSelect(i, row));
    }
  }

  /* ---------- 2.2 Podsumowanie ryzyka ---------- */

  function buildRyzyko() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '2.2' }), 'Podsumowanie ryzyka']),
      h('p', { class: 'hint', text: 'Uwagi generowane na podstawie listy leków i profilu pacjenta (zakładka 1).' }),
      h('div', { id: 'box-ryzyko' })
    ]);
  }

  function renderRyzyko() {
    const box = root.querySelector('#box-ryzyko');
    const rz = G.Ryzyko.compute(G.State.get());
    box.innerHTML = '';
    if (!rz.info.length && !rz.uwaga.length && !rz.reakcja.length) {
      box.appendChild(h('div', { class: 'ryzyko-box ryzyko-ok', text: 'Brak zidentyfikowanego ryzyka na tym etapie.' }));
      return;
    }
    const add = function (cls, tytul, items) {
      if (items.length) {
        box.appendChild(h('div', { class: 'ryzyko-box ' + cls }, [
          h('h4', { text: tytul }),
          h('ul', {}, items.map(function (t) { return h('li', { text: t }); }))
        ]));
      }
    };
    add('ryzyko-reakcja', 'Wymaga reakcji', rz.reakcja);
    add('ryzyko-uwaga', 'Uwaga farmaceutyczna', rz.uwaga);
    add('ryzyko-info', 'Informacja', rz.info);
  }

  /* ---------- 2.3 Epikryza ---------- */

  function buildEpikryza() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '2.3' }), 'Epikryza farmakoterapii']),
      h('div', { class: 'field' }, [
        h('label', { class: 'ctl' }, ['Komentarz farmaceuty']),
        h('textarea', { rows: '5', placeholder: 'Krótka ocena bezpieczeństwa i skuteczności farmakoterapii, ustalenia z pacjentem, zalecenia.', 'data-state': 'epikryzaFarmakoterapii' })
      ])
    ]);
  }

  /* ---------- Zdarzenia ---------- */

  function handleInput(e) {
    const t = e.target;
    const key = t.getAttribute && t.getAttribute('data-state');
    if (key) {
      G.State.set(key, t.type === 'checkbox' ? t.checked : t.value);
      return;
    }
    const i = t.getAttribute && t.getAttribute('data-lRow');
    if (i == null) return;
    const f = t.getAttribute('data-lField');
    if (!f) return;
    if (f === 'nazwa') {
      G.State.set('leki.' + i + '.nazwa', t.value);
      const g = G.Leki.znajdzGrupy(t.value);
      if (g.length) G.State.set('leki.' + i + '.grupy', g);
    } else {
      G.State.set('leki.' + i + '.' + f, t.value);
    }
  }

  function handleChange(e) {
    const t = e.target;
    const key = t.getAttribute && t.getAttribute('data-state');
    if (key) {
      G.State.set(key, t.type === 'checkbox' ? t.checked : t.value);
      return;
    }
    const i = t.getAttribute && t.getAttribute('data-lRow');
    if (i != null) {
      handleInput(e);
      return;
    }
    const addI = t.getAttribute && t.getAttribute('data-lAddGroup');
    if (addI != null && t.value) {
      const s = G.State.get();
      const row = s.leki[addI];
      if (row) {
        row.grupy = row.grupy || [];
        if (row.grupy.indexOf(t.value) === -1) row.grupy.push(t.value);
        G.State.notify();
      }
    }
  }

  function handleClick(e) {
    const t = e.target;
    if (t.closest && t.closest('#btn-dodaj-lek')) {
      const s = G.State.get();
      let maxId = 0;
      s.leki.forEach(function (r) { if (typeof r.id === 'number' && r.id > maxId) maxId = r.id; });
      s.leki.push({ id: maxId + 1, nazwa: '', moc: '', postac: '', tryb: '', schemat: '', wskazanie: '', komentarze: '', grupy: [] });
      G.State.notify();
      return;
    }
    const rem = t.getAttribute && t.getAttribute('data-lRemove');
    if (rem != null) {
      const s = G.State.get();
      s.leki.splice(parseInt(rem, 10), 1);
      G.State.notify();
      return;
    }
    const del = t.getAttribute && t.getAttribute('data-lDelGroup');
    if (del != null) {
      const parts = del.split(':');
      const i = parseInt(parts[0], 10);
      const g = parts[1];
      const s = G.State.get();
      const row = s.leki[i];
      if (row && row.grupy) {
        row.grupy = row.grupy.filter(function (x) { return x !== g; });
        G.State.notify();
      }
    }
  }

  /* ---------- Init / apply ---------- */

  function init(container) {
    root = container;
    const cards = [buildLeki(), buildRyzyko(), buildEpikryza()];
    cards.forEach(function (c) { root.appendChild(c); });
    root.removeEventListener('input', handleInput);
    root.removeEventListener('change', handleChange);
    root.removeEventListener('click', handleClick);
    root.addEventListener('input', handleInput);
    root.addEventListener('change', handleChange);
    root.addEventListener('click', handleClick);
  }

  function apply() {
    if (!root) return;
    const q = function (sel) { return root.querySelector(sel); };
    if (!q('#btn-dodaj-lek')) return; // aktywna jest inna zakładka

    const s = G.State.get();

    /* Synchronizacja wartości pól ze stanu (radio/checkbox/textarea) */
    UI.sync(root);

    /* Tabela leków — przebudowa tylko, gdy struktura nie zgadza się ze stanem
       (pusty stan = wiersz „Brak dodanych leków”; po przebudowie wiersze są
       puste, więc uzupełnij je ze stanu) */
    const tb = q('#tbody-leki');
    const maPusty = !!tb.querySelector('.pusty-wiersz');
    const strukturaOk = s.leki.length === 0
      ? (tb.children.length === 1 && maPusty)
      : (tb.children.length === s.leki.length && !maPusty);
    if (!strukturaOk) {
      renderRows();
      syncRows();
    } else {
      syncRows();
    }

    /* Podsumowanie ryzyka */
    renderRyzyko();
  }

  G.Tab2 = { init: init, apply: apply };
})();
