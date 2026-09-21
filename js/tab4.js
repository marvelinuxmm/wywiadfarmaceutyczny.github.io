/* Zakładka 4: Ocena bólu. */
(function () {
  const h = UI.h;
  const G = typeof window !== 'undefined' ? window : globalThis;

  const SKALE = G.OPCJE.skalaOcena;
  const WPLYW_FIELDS = G.OPCJE.wplywPytania;
  const WPLYW_OPCJE = G.OPCJE.wplyw;
  const LOKALIZACJE = G.OPCJE.obLokalizacje;
  const CHARAKTER = G.OPCJE.obCharakter;
  const PRZEBIEG = G.OPCJE.obPrzebieg;
  const ZMNIEJSZA = G.OPCJE.zmniejsza;

  let root = null;

  const radio = UI.radio;
  const checkboxState = UI.checkbox;
  const nrsField = UI.nrsField;

  function buildDane() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '4.1' }), 'Data oceny']),
      h('div', { class: 'field' }, [
        h('label', { class: 'ctl' }, ['Data oceny bólu']),
        h('input', { type: 'date', id: 'ob-data', 'data-state': 'ocenaBolu.data' })
      ])
    ]);
  }

  function buildSkala() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '4.2' }), 'Skala oceny bólu']),
      h('div', { class: 'field' }, [
        h('label', { class: 'ctl' }, ['Użyta skala oceny bólu']),
        h('div', { class: 'radio-group' }, SKALE.map(function (s) {
          return radio('ob.skala', s[0], s[1], 'ocenaBolu.skala');
        }))
      ])
    ]);
  }

  function buildNatezenie() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '4.3' }), 'Natężenie bólu']),
      h('div', { class: 'grid' }, [
        nrsField('ocenaBolu.nrsAktualne', 'Aktualne natężenie bólu', 'ob-nrs-akt', '0–10 (0 = brak bólu, 10 = najsilniejszy ból)'),
        nrsField('ocenaBolu.nrsSrednie', 'Średnie natężenie bólu w ostatnim tygodniu', 'ob-nrs-sr', '0–10 (0 = brak bólu, 10 = najsilniejszy ból)')
      ])
    ]);
  }

  function buildWplyw() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '4.4' }), 'Wpływ bólu na jakość życia']),
      WPLYW_FIELDS.map(function (f) {
        return h('div', { class: 'field' }, [
          h('label', { class: 'ctl' }, [f[1]]),
          h('div', { class: 'radio-group' }, WPLYW_OPCJE.map(function (o) {
            return radio('ob.wplyw.' + f[0], o[0], o[1], 'ocenaBolu.wplyw.' + f[0]);
          }))
        ]);
      }),
      buildHalt()
    ]);
  }

  function buildHalt() {
    const pytania = G.Halt.PYTANIA;
    return h('div', { class: 'halt-box', id: 'ob-halt', style: { display: 'none' } }, [
      h('h3', { text: 'HALT-90 — wpływ bólu głowy na funkcjonowanie' }),
      h('p', { class: 'hint', text: 'Pytania dotyczą ostatnich 3 miesięcy (Headache-Attributed Lost Time – 90 days; na podstawie pierwszych pięciu pytań MIDAS).' }),
      pytania.map(function (p) {
        return h('div', { class: 'field' }, [
          h('label', { class: 'ctl' }, [p[1]]),
          h('input', { type: 'number', id: 'halt-' + p[0], min: '0', max: '90', step: '1', placeholder: 'liczba dni', 'data-state': 'ocenaBolu.halt.' + p[0] })
        ]);
      }),
      h('div', { class: 'results' }, [
        h('div', { class: 'res-row' }, [
          h('span', { text: 'Wynik HALT-90 (suma dni)' }),
          h('div', { class: 'res-valbox' }, [
            h('div', { class: 'res-val', id: 'halt-total', text: '—' }),
            h('div', { class: 'res-band', id: 'halt-grade' })
          ])
        ])
      ]),
      h('div', { class: 'hint', style: { marginTop: '8px' }, text: 'Stopień: I (0–5), II (6–10), III (11–20), IV (>20). Stopień III lub IV wskazuje na dużą potrzebę opieki medycznej.' })
    ]);
  }

  function buildLokalizacja() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '4.5' }), 'Lokalizacja bólu']),
      h('div', { class: 'checkbox-grid' }, LOKALIZACJE.map(function (l) {
        return checkboxState('ocenaBolu.lokalizacja', l[0], l[1]);
      })),
      h('div', { class: 'field', style: { marginTop: '12px' } }, [
        h('label', { class: 'ctl' }, ['Opis lokalizacji bólu']),
        h('input', { type: 'text', placeholder: 'Opis lokalizacji bólu…', 'data-state': 'ocenaBolu.lokalizacjaOpis' })
      ])
    ]);
  }

  function buildCharakter() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '4.6' }), 'Charakter bólu']),
      h('div', { class: 'checkbox-grid' }, CHARAKTER.map(function (c) {
        return checkboxState('ocenaBolu.charakter', c[0], c[1]);
      })),
      h('div', { class: 'field', style: { marginTop: '12px' } }, [
        h('label', { class: 'ctl' }, ['Przebieg bólu (można zaznaczyć kilka)']),
        h('div', { class: 'checkbox-grid' }, PRZEBIEG.map(function (p) {
          return checkboxState('ocenaBolu.przebieg', p[0], p[1]);
        }))
      ])
    ]);
  }

  function buildLeczenie() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '4.7' }), 'Dotychczasowe leczenie bólu']),
      h('div', { class: 'field' }, [
        h('label', { class: 'ctl' }, ['Leki stosowane z powodu bólu (z zakładki „Farmakoterapia”)']),
        h('div', { id: 'ob-leki-na-bol' })
      ]),
      h('div', { class: 'field', style: { marginTop: '12px' } }, [
        h('label', { class: 'ctl' }, ['Czy dotychczasowe leczenie zmniejsza ból?']),
        h('div', { class: 'radio-group' }, ZMNIEJSZA.map(function (z) {
          return radio('ob.zmniejsza', z[0], z[1], 'ocenaBolu.leczenieZmniejsza');
        }))
      ])
    ]);
  }

  function buildPriorytety() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '4.8' }), 'Priorytety pacjenta']),
      h('div', { class: 'field' }, [
        h('label', { class: 'ctl' }, ['Priorytety pacjenta']),
        h('textarea', {
          rows: '5',
          placeholder: 'Zapisz priorytety pacjenta dotyczące leczenia bólu…',
          'data-state': 'ocenaBolu.priorytety'
        })
      ])
    ]);
  }

  function buildEpikryza() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '4.9' }), 'Epikryza oceny bólu']),
      h('div', { class: 'field' }, [
        h('label', { class: 'ctl' }, ['Komentarz farmaceuty']),
        h('textarea', {
          rows: '5',
          placeholder: 'Krótka ocena natężenia bólu, wpływu na funkcjonowanie, dotychczasowego leczenia i dalszych ustaleń z pacjentem.',
          'data-state': 'ocenaBolu.epikryza'
        })
      ])
    ]);
  }

  function build() {
    return [buildDane(), buildSkala(), buildNatezenie(), buildWplyw(), buildLokalizacja(),
      buildCharakter(), buildLeczenie(), buildPriorytety(), buildEpikryza()];
  }

  function handleInput(e) {
    const t = e.target;
    const key = t.getAttribute && t.getAttribute('data-state');
    if (key) {
      G.State.set(key, t.type === 'checkbox' ? t.checked : t.value);
      return;
    }
    const cel = t.getAttribute && t.getAttribute('data-cel');
    if (cel) {
      const s = G.State.get();
      const arr = G.State.getPath(cel);
      if (Array.isArray(arr)) {
        const id = parseInt(t.getAttribute('data-id'), 10);
        const idx = arr.indexOf(id);
        if (t.checked && idx === -1) arr.push(id);
        if (!t.checked && idx !== -1) arr.splice(idx, 1);
        G.State.notify();
      }
    }
  }

  function init(container) {
    root = container;
    const cards = build();
    cards.forEach(function (c) { root.appendChild(c); });
    root.querySelector('#ob-leki-na-bol').appendChild(buildLekSelect());
    root.removeEventListener('input', handleInput);
    root.removeEventListener('change', handleInput);
    root.addEventListener('input', handleInput);
    root.addEventListener('change', handleInput);
  }

  function apply() {
    if (!root) return;
    const q = function (sel) { return root.querySelector(sel); };
    if (!q('#ob-data')) return;

    const s = G.State.get();

    /* Domyślnie: data bieżąca */
    if (!s.ocenaBolu.data) {
      s.ocenaBolu.data = new Date().toISOString().slice(0, 10);
    }

    /* Synchronizacja wartości pól */
    UI.sync(root);

    /* HALT-90 — pokaż, gdy 4.4 „codzienne funkcjonowanie” = umiarkowanie/znacznie */
    const halt = q('#ob-halt');
    const funkcjonowanie = s.ocenaBolu.wplyw.funkcjonowanie;
    const pokazHalt = funkcjonowanie === 'umiarkowanie' || funkcjonowanie === 'znacznie';
    halt.style.display = pokazHalt ? '' : 'none';

    const total = G.Halt.total(s.ocenaBolu.halt);
    const g = G.Halt.grade(total);
    q('#halt-total').textContent = total !== null ? total + ' dni' : '—';
    q('#halt-grade').textContent = g ? 'Stopień ' + g.stopien + ' — ' + g.label : '';

    /* Wybór leków na ból */
    const cel = 'ocenaBolu.lekiNaBol';
    root.querySelectorAll('[data-cel="' + cel + '"]').forEach(function (inp) {
      inp.checked = s.ocenaBolu.lekiNaBol.indexOf(parseInt(inp.getAttribute('data-id'), 10)) !== -1;
    });
  }

  function buildLekSelect() {
    const s = G.State.get();
    const leki = s.leki || [];
    if (!leki.length) return h('p', { class: 'hint', text: 'Brak leków — uzupełnij listę w zakładce „Farmakoterapia”.' });
    return h('div', { class: 'checkbox-grid' }, leki.map(function (l) {
      const etykieta = (l.nazwa || '(bez nazwy)') + (l.moc ? ' ' + l.moc : '');
      return h('label', { class: 'checkbox' }, [
        h('input', { type: 'checkbox', 'data-cel': 'ocenaBolu.lekiNaBol', 'data-id': l.id }),
        h('span', { text: etykieta })
      ]);
    }));
  }

  G.Tab4 = { init: init, apply: apply };
})();
