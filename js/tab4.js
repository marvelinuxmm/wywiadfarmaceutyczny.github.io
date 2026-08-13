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
      })
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
        h('label', { class: 'ctl' }, ['Przebieg bólu']),
        h('div', { class: 'radio-group' }, PRZEBIEG.map(function (p) {
          return radio('ob.przebieg', p[0], p[1], 'ocenaBolu.przebieg');
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
