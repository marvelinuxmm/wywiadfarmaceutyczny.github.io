/* Zakładka 6: Ból głowy — triage i wstępna klasyfikacja. */
(function () {
  const h = UI.h;
  const G = typeof window !== 'undefined' ? window : globalThis;

  const ALARMOWE = G.OPCJE.bgAlarmowe;
  const LOKALIZACJE = G.OPCJE.bgLokalizacje;
  const CHARAKTER_B = G.OPCJE.bgCharakter;
  const AKTYWNOSC = G.OPCJE.bgAktywnosc;
  const CZAS_TRWANIA = G.OPCJE.bgCzasTrwania;
  const OBJAWY = G.OPCJE.bgObjawy;
  const WYZWALACZE = G.OPCJE.bgWyzwalacze;
  const ULGA = G.OPCJE.bgUlga;
  const MOH_OCENA = G.OPCJE.bgMohOcena;
  const INTERPRETACJE = G.OPCJE.bgInterpretacjaOpcje;
  const EDUKACJA = G.OPCJE.bgEdukacja;

  let root = null;

  const radio = UI.radio;
  const checkboxState = UI.checkbox;
  const nrsField = UI.nrsField;

  function dniField(dataState, label, id, placeholder) {
    return h('div', { class: 'field' }, [
      h('label', { class: 'ctl' }, [label]),
      h('input', { type: 'number', id: id, min: '0', max: '31', step: '1', placeholder: placeholder || '', 'data-state': dataState }),
      h('div', { class: 'hint', text: 'dni/miesiąc' })
    ]);
  }

  function buildAlarmowe() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '6.1' }), 'Objawy alarmowe']),
      h('p', { class: 'hint', text: 'Jeśli zaznaczono cokolwiek poza „brak powyższych” — pacjent wymaga konsultacji lekarskiej.' }),
      h('div', { class: 'checkbox-grid' }, ALARMOWE.map(function (a) {
        return checkboxState('bolGlowy.alarmowe', a[0], a[1]);
      })),
      h('div', { class: 'komunikat komunikat-alert', id: 'bg-alarm-alert', style: { display: 'none' } })
    ]);
  }

  function buildCharakter() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '6.2' }), 'Charakter bólu głowy']),
      h('div', { class: 'field' }, [
        h('label', { class: 'ctl' }, ['Lokalizacja bólu']),
        h('div', { class: 'checkbox-grid' }, LOKALIZACJE.map(function (l) {
          return checkboxState('bolGlowy.lokalizacja', l[0], l[1]);
        }))
      ]),
      h('div', { class: 'field', style: { marginTop: '12px' } }, [
        h('label', { class: 'ctl' }, ['Charakter bólu']),
        h('div', { class: 'checkbox-grid' }, CHARAKTER_B.map(function (c) {
          return checkboxState('bolGlowy.charakterB', c[0], c[1]);
        }))
      ]),
      h('div', { class: 'grid', style: { marginTop: '12px' } }, [
        nrsField('bolGlowy.nrs', 'Nasilenie (NRS)', 'bg-nrs'),
        h('div', { class: 'field' }, [
          h('label', { class: 'ctl' }, ['Czy zwykła aktywność fizyczna nasila ból?']),
          h('div', { class: 'radio-group' }, AKTYWNOSC.map(function (a) {
            return radio('bg.aktywnosc', a[0], a[1], 'bolGlowy.aktywnoscNasila');
          }))
        ])
      ])
    ]);
  }

  function buildCzas() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '6.3' }), 'Czas trwania i częstość']),
      h('div', { class: 'field' }, [
        h('label', { class: 'ctl' }, ['Jak długo trwa obecny epizod bólu?']),
        h('div', { class: 'radio-group' }, CZAS_TRWANIA.map(function (c) {
          return radio('bg.czas', c[0], c[1], 'bolGlowy.czasTrwania');
        }))
      ]),
      h('div', { class: 'grid' }, [
        dniField('bolGlowy.dniWMiesiacu', 'Liczba dni z bólem głowy w miesiącu', 'bg-dni'),
        h('div', { class: 'field' }, [
          h('label', { class: 'ctl' }, ['Od jakiego czasu występują takie bóle?']),
          h('div', { class: 'row-inline' }, [
            h('input', { type: 'number', id: 'bg-odkiedy', min: '0', max: '999', step: '1', 'data-state': 'bolGlowy.odKiedyIle' }),
            h('select', { 'data-state': 'bolGlowy.odKiedyJednostka' }, [
              h('option', { value: 'miesiace', text: 'miesięcy' }),
              h('option', { value: 'lata', text: 'lat' })
            ])
          ])
        ])
      ])
    ]);
  }

  function buildObjawy() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '6.4' }), 'Objawy towarzyszące']),
      h('div', { class: 'checkbox-grid' }, OBJAWY.map(function (o) {
        return checkboxState('bolGlowy.objawy', o[0], o[1]);
      })),
      h('div', { class: 'hint', style: { marginTop: '10px' }, text: 'Napięciowy ból głowy: zwykle bez nudności i wymiotów, najwyżej światłowstręt lub fonofobia pojedynczo. Migrena: jednostronny pulsujący ból nasilany ruchem z nudnościami/wymiotami/światłowstrętem/fonofobią lub aurą. Klaster: silny jednostronny ból oka/skroni z objawami autonomicznymi. Ból zatokowy: ból okolicy zatok z katarem lub gorączką.' })
    ]);
  }

  function buildCzynniki() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '6.5' }), 'Czynniki wyzwalające i łagodzące']),
      h('div', { class: 'field' }, [
        h('label', { class: 'ctl' }, ['Co może wywoływać lub nasilać ból?']),
        h('div', { class: 'checkbox-grid' }, WYZWALACZE.map(function (w) {
          return checkboxState('bolGlowy.wyzwalacze', w[0], w[1]);
        }))
      ]),
      h('div', { class: 'field', style: { marginTop: '12px' } }, [
        h('label', { class: 'ctl' }, ['Co przynosi ulgę?']),
        h('div', { class: 'checkbox-grid' }, ULGA.map(function (u) {
          return checkboxState('bolGlowy.ulga', u[0], u[1]);
        }))
      ])
    ]);
  }

  function buildMoh() {
    const kategorie = [
      ['paracetamolNlpzAsa', 'Paracetamol / NLPZ / ASA'],
      ['zlozone', 'Leki złożone, np. z kodeiną lub kofeiną'],
      ['tryptany', 'Tryptany'],
      ['opioidyKodeina', 'Opioidy / kodeina']
    ];
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '6.6' }), 'Leki stosowane doraźnie i ryzyko MOH']),
      h('div', { class: 'grid' }, kategorie.map(function (k) {
        return h('div', { class: 'field' }, [
          h('label', { class: 'ctl' }, [k[1]]),
          h('input', { type: 'number', min: '0', max: '31', step: '1', placeholder: 'dni/miesiąc', 'data-state': 'bolGlowy.mohDni.' + k[0] }),
          h('input', { type: 'text', placeholder: 'Leki z listy (można edytować)…', 'data-state': 'bolGlowy.mohLeki.' + k[0], style: { marginTop: '6px' } })
        ]);
      })),
      h('div', { class: 'field', style: { marginTop: '12px' } }, [
        h('label', { class: 'ctl' }, ['Podejrzenie nadużywania leków']),
        h('div', { class: 'radio-group radio-col' }, MOH_OCENA.map(function (m) {
          return radio('bg.moh', m[0], m[1], 'bolGlowy.mohOcena');
        }))
      ]),
      h('div', { class: 'komunikat komunikat-sugestia', id: 'bg-moh-sugestia' }),
      h('div', { class: 'hint', style: { marginTop: '8px' }, text: 'Progi MOH (przez >3 mies.): paracetamol/NLPZ/ASA ≥15 dni/mies.; tryptany, opioidy, leki złożone ≥10 dni/mies.' })
    ]);
  }

  function buildInterpretacja() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '6.7' }), 'Wstępna interpretacja']),
      h('div', { class: 'field' }, [
        h('label', { class: 'ctl' }, ['Obraz najbardziej zgodny z:']),
        h('div', { class: 'radio-group radio-col' }, INTERPRETACJE.map(function (i) {
          return radio('bg.interp', i[0], i[1], 'bolGlowy.interpretacja');
        }))
      ]),
      h('div', { class: 'komunikat komunikat-sugestia', id: 'bg-interp-sugestia' }),
      h('div', { class: 'komunikat komunikat-ok', id: 'bg-interp-unlock', style: { display: 'none' } }),
      h('div', { class: 'results', id: 'bg-tth-kryteria', style: { display: 'none' } }, [
        h('h3', { text: 'Kryteria wspierające napięciowy ból głowy' }),
        h('ul', { class: 'kryteria-list', id: 'bg-tth-list' })
      ])
    ]);
  }

  function buildEdukacja() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '6.8' }), 'Edukacja pacjenta']),
      h('div', { class: 'field' }, [
        h('label', { class: 'ctl' }, ['Omówiono:']),
        h('div', { class: 'checkbox-grid' }, EDUKACJA.map(function (e) {
          return checkboxState('bolGlowy.edukacja', e[0], e[1]);
        }))
      ])
    ]);
  }

  function buildEpikryza() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '6.9' }), 'Epikryza zakładki „Ból głowy”']),
      h('div', { class: 'field' }, [
        h('label', { class: 'ctl' }, ['Komentarz farmaceuty']),
        h('textarea', {
          rows: '5',
          placeholder: 'Podsumuj: lokalizację, charakter, czas trwania, częstość bólu, NRS, objawy towarzyszące, obecność lub brak czerwonych flag, leki stosowane doraźnie, liczbę dni stosowania leków w miesiącu, podejrzenie TTH/migreny/MOH oraz decyzję o dalszym module lub skierowaniu.',
          'data-state': 'bolGlowy.epikryza'
        })
      ])
    ]);
  }

  function build() {
    return [buildAlarmowe(), buildCharakter(), buildCzas(), buildObjawy(), buildCzynniki(),
      buildMoh(), buildInterpretacja(), buildEdukacja(), buildEpikryza()];
  }

  function init(container) {
    root = container;
    const cards = build();
    cards.forEach(function (c) { root.appendChild(c); });
    root.removeEventListener('input', UI.handleStateInput);
    root.removeEventListener('change', UI.handleStateInput);
    root.addEventListener('input', UI.handleStateInput);
    root.addEventListener('change', UI.handleStateInput);
  }

  function apply() {
    if (!root) return;
    const q = function (sel) { return root.querySelector(sel); };
    if (!q('#bg-nrs')) return;

    const s = G.State.get();
    const B = G.BolGlowy;

    /* Synchronizacja wartości pól */
    UI.sync(root);

    /* Czerwone flagi → alert */
    const bg = s.bolGlowy;
    const alert = q('#bg-alarm-alert');
    if (B.anyTrueExceptBrak(bg.alarmowe)) {
      alert.style.display = '';
      alert.textContent = 'Objaw alarmowy. Pacjent wymaga konsultacji lekarskiej lub pilnej oceny zgodnie z lokalną procedurą.';
    } else {
      alert.style.display = 'none';
    }

    /* MOH — auto-sugestia */
    const moh = B.sugerujMOH(Object.assign({ dniBoluGlowy: bg.dniWMiesiacu }, bg.mohDni || {}));
    q('#bg-moh-sugestia').textContent = 'Propozycja aplikacji: ' +
      (MOH_OCENA.find(function (x) { return x[0] === moh.opcja; }) || ['', '—'])[1] +
      '. (' + moh.powody.join('; ') + ')';
    root.querySelectorAll('[name="bg.moh"]').forEach(function (inp) {
      inp.parentElement.classList.toggle('sugerowane', inp.value === moh.opcja);
    });

    /* Wstępna interpretacja — auto-sugestia */
    const interp = B.sugerujInterpretacje(bg);
    q('#bg-interp-sugestia').textContent = interp.opcja
      ? 'Propozycja aplikacji: ' + (INTERPRETACJE.find(function (x) { return x[0] === interp.opcja; }) || ['', '—'])[1] +
        '. (' + interp.powody.join('; ') + ')'
      : 'Uzupełnij dane, aby wyświetlić propozycję.';
    root.querySelectorAll('[name="bg.interp"]').forEach(function (inp) {
      inp.parentElement.classList.toggle('sugerowane', inp.value === interp.opcja);
    });

    /* Wybór „Migreną” → odblokowanie zakładki 7 */
    const unlock = q('#bg-interp-unlock');
    if (bg.interpretacja === 'migrena') {
      unlock.style.display = '';
      unlock.textContent = 'Wybrano „Migreną” — zakładka „Moduł migrenowy” została odblokowana.';
    } else {
      unlock.style.display = 'none';
    }

    /* Kryteria TTH */
    const kryteria = B.kryteriaTTH(bg);
    const lista = q('#bg-tth-list');
    lista.innerHTML = '';
    kryteria.forEach(function (k) {
      lista.appendChild(h('li', { class: k.met ? 'kryterium met' : 'kryterium nie' }, [
        (k.met ? '✓ ' : '✗ ') + k.label
      ]));
    });
    const metLiczba = kryteria.slice(0, 4).filter(function (k) { return k.met; }).length;
    const dodatkowe = kryteria.slice(4);
    q('#bg-tth-kryteria').style.display =
      (metLiczba >= 2 || kryteria.some(function (k) { return k.met; })) ? '' : 'none';
    q('#bg-tth-list').appendChild(h('li', { class: dodatkowe.every(function (k) { return k.met; }) ? 'kryterium met' : 'kryterium nie' }, [
      'Podejrzenie TTH: ' + (metLiczba >= 2 && dodatkowe.every(function (k) { return k.met; })
        ? 'kryteria spełnione (≥2 z 4 + warunki dodatkowe)'
        : 'kryteria niespełnione — rozważ inną diagnozę różnicową')
    ]));
  }

  G.Tab6 = { init: init, apply: apply };
})();
