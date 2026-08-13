/* Zakładka 4: Ocena bólu. */
(function () {
  const h = UI.h;
  const G = typeof window !== 'undefined' ? window : globalThis;

  const SKALE = [['nrs', 'NRS 0-10'], ['vas', 'VAS'], ['vrs', 'VRS'], ['fps', 'FPS'], ['inna', 'Inna']];
  const WPLYW_FIELDS = [
    ['nastroj', 'Czy ból wpływa na nastrój?'],
    ['sen', 'Czy ból wpływa na sen?'],
    ['funkcjonowanie', 'Czy ból wpływa na codzienne funkcjonowanie?'],
    ['praca', 'Czy ból wpływa na pracę zawodową?']
  ];
  const WPLYW_OPCJE = [['nie', 'Nie'], ['umiarkowanie', 'Umiarkowanie'], ['znacznie', 'Znacznie']];
  const LOKALIZACJE = [
    ['glowa', 'Głowa'], ['twarz', 'Twarz / okolica szczękowo-twarzowa'], ['szyja', 'Szyja'],
    ['bark', 'Bark / kończyna górna'], ['kr_szyjny', 'Kręgosłup szyjny'], ['kr_piersiowy', 'Kręgosłup piersiowy'],
    ['kr_ledzwiowy', 'Kręgosłup lędźwiowo-krzyżowy'], ['klatka', 'Klatka piersiowa'], ['brzuch', 'Brzuch'],
    ['miednica', 'Miednica'], ['biodro', 'Biodro / kończyna dolna'], ['stopy', 'Stopy'],
    ['wielomiejscowy', 'Ból wielomiejscowy'], ['inne', 'Inne']
  ];
  const CHARAKTER = [
    ['tepy', 'Tępy'], ['ostry', 'Ostry'], ['piekacy', 'Piekący / palący'], ['klujacy', 'Kłujący'],
    ['razenie', 'Jak rażenie prądem'], ['pulsujacy', 'Pulsujący'], ['uciskajacy', 'Uciskający'],
    ['rozpierajacy', 'Rozpierający'], ['dretwienie', 'Drętwienie / mrowienie'], ['inny', 'Inny']
  ];
  const PRZEBIEG = [
    ['staly', 'Stały'], ['nawracajacy', 'Nawracający'], ['napadowy', 'Napadowy'], ['zmienny', 'Zmienny w ciągu dnia']
  ];
  const ZMNIEJSZA = [
    ['tak', 'Tak, wyraźnie'], ['czesciowo', 'Częściowo'], ['nie', 'Nie'],
    ['trudno', 'Trudno powiedzieć'], ['brak-leczenia', 'Pacjent nie stosuje leczenia przeciwbólowego']
  ];
  const INTERPRETACJA = [
    ['lagodny', 'Ból łagodny / mały wpływ na funkcjonowanie'],
    ['umiarkowany', 'Ból umiarkowany lub istotny wpływ na funkcjonowanie'],
    ['silny', 'Ból silny lub znaczny wpływ na funkcjonowanie'],
    ['poglebic', 'Obraz wymaga pogłębienia w module szczegółowym'],
    ['konsultacja', 'Rozważyć konsultację lekarską / poradnię leczenia bólu']
  ];

  let root = null;

  function radio(name, value, label, dataState) {
    return h('label', { class: 'radio' }, [
      h('input', { type: 'radio', name: name, value: value, 'data-state': dataState || name }),
      h('span', { text: label })
    ]);
  }

  function checkboxState(path, id, label) {
    return h('label', { class: 'checkbox' }, [
      h('input', { type: 'checkbox', 'data-state': path + '.' + id }),
      h('span', { text: label })
    ]);
  }

  function nrsField(dataState, label, id) {
    return h('div', { class: 'field' }, [
      h('label', { class: 'ctl' }, [label]),
      h('input', { type: 'number', id: id, min: '0', max: '10', step: '1', 'data-state': dataState }),
      h('div', { class: 'hint', text: '0–10 (0 = brak bólu, 10 = najsilniejszy ból)' })
    ]);
  }

  function buildDane() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '4.1' }), 'Dane oceny']),
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
        nrsField('ocenaBolu.nrsAktualne', 'Aktualne natężenie bólu', 'ob-nrs-akt'),
        nrsField('ocenaBolu.nrsSrednie', 'Średnie natężenie bólu w ostatnim tygodniu', 'ob-nrs-sr')
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

  function buildOcena() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '4.8' }), 'Krótka ocena farmaceutyczna']),
      h('div', { class: 'field' }, [
        h('label', { class: 'ctl' }, ['Wstępna interpretacja']),
        h('div', { class: 'radio-group radio-col' }, INTERPRETACJA.map(function (i) {
          return radio('ob.interpretacja', i[0], i[1], 'ocenaBolu.interpretacja');
        }))
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
      buildCharakter(), buildLeczenie(), buildOcena(), buildEpikryza()];
  }

  function handleInput(e) {
    const t = e.target;
    const key = t.getAttribute && t.getAttribute('data-state');
    if (key) {
      G.State.set(key, t.type === 'checkbox' ? t.checked : t.value);
      /* Zaznaczenie „Głowa” (4.5) → przeniesienie charakteru bólu do 6.2 */
      if (key === 'ocenaBolu.lokalizacja.glowa' && t.checked) {
        const s = G.State.get();
        const map = G.BolGlowy.przeniesCharakter(s.ocenaBolu.charakter);
        Object.keys(map).forEach(function (k) {
          if (!s.bolGlowy.charakterB[k]) G.State.set('bolGlowy.charakterB.' + k, true);
        });
      }
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
    root.querySelectorAll('[data-state]').forEach(function (inp) {
      const v = G.State.getPath(inp.getAttribute('data-state'));
      if (inp.type === 'checkbox') inp.checked = !!v;
      else if (inp.type === 'radio') inp.checked = (inp.value === v);
      else inp.value = (v == null) ? '' : v;
    });

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
