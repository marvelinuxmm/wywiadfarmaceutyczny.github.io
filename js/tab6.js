/* Zakładka 6: Ból głowy — triage i wstępna klasyfikacja. */
(function () {
  const h = UI.h;
  const G = typeof window !== 'undefined' ? window : globalThis;

  const ALARMOWE = [
    ['nagly', 'Nagły, pierwszy w życiu bardzo silny ból głowy'],
    ['narastajacy', 'Ból szybko narastający lub „rozsadzający”'],
    ['po-50', 'Nowy ból głowy po 50. roku życia'],
    ['uraz', 'Ból głowy po urazie'],
    ['goraczka', 'Gorączka, sztywność karku, wysypka'],
    ['neurologiczne', 'Zaburzenia widzenia, mowy, chodu lub świadomości'],
    ['ogniskowe', 'Ogniskowe objawy neurologiczne'],
    ['oko', 'Silny ból oka z zaczerwienieniem / łzawieniem'],
    ['pozycyjny', 'Ból głowy nasilany kaszlem, kichaniem, wysiłkiem lub zmianą pozycji'],
    ['wzorzec', 'Ból „inny niż zwykle” lub zmiana dotychczasowego wzorca bólu'],
    ['cisnienie', 'Ciśnienie tętnicze >180/110 mmHg'],
    ['ciaza-polog', 'Ciąża lub połóg'],
    ['brak', 'Brak powyższych']
  ];
  const LOKALIZACJE = [
    ['obustronny', 'Obustronny'], ['jednostronny', 'Jednostronny'], ['czolo-skronie', 'Czoło / skronie'],
    ['potylica-kark', 'Potylica / kark'], ['zatoki', 'Okolica zatok / twarz'], ['okolica-oka', 'Okolica oka'],
    ['cala-glowa', 'Cała głowa'], ['inna', 'Inna']
  ];
  const CHARAKTER_B = [
    ['uciskowy', 'Uciskowy / opasujący'], ['tepy', 'Tępy'], ['rozpierajacy', 'Rozpierający'],
    ['pulsujacy', 'Pulsujący'], ['przeszywajacy', 'Przeszywający / świdrujący'], ['piekacy', 'Piekący'], ['inny', 'Inny']
  ];
  const AKTYWNOSC = [['nie', 'Nie'], ['tak', 'Tak'], ['nw', 'Nie wiem']];
  const CZAS_TRWANIA = [
    ['<4h', '<4 godziny'], ['4-72h', '4–72 godziny'],
    ['>72h', '>72 godziny'], ['trudno', 'Trudno określić']
  ];
  const OBJAWY = [
    ['brak', 'Brak objawów towarzyszących'], ['swiatlowstret', 'Światłowstręt'], ['dzwieki', 'Nadwrażliwość na dźwięki'],
    ['nudnosci', 'Nudności'], ['wymioty', 'Wymioty'], ['aura', 'Aura / zaburzenia widzenia przed bólem'],
    ['lzawienie', 'Łzawienie / zaczerwienienie oka'], ['katar', 'Katar / zatkanie nosa'], ['goraczka', 'Gorączka'],
    ['zawroty', 'Zawroty głowy'], ['inne', 'Inne']
  ];
  const WYZWALACZE = [
    ['stres', 'Stres'], ['brak-snu', 'Brak snu'], ['zmeczenie', 'Zmęczenie'], ['glod', 'Głód / pomijanie posiłków'],
    ['odwodnienie', 'Odwodnienie'], ['komputer', 'Praca przy komputerze / wzrok'], ['napiecie-karku', 'Napięcie karku / zła postawa'],
    ['alkohol', 'Alkohol'], ['zapachy', 'Zapachy / światło / hałas'], ['miesiaczka', 'Miesiączka / hormony'],
    ['nw', 'Nie wiem'], ['inne', 'Inne']
  ];
  const ULGA = [
    ['odpoczynek', 'Odpoczynek'], ['sen', 'Sen'], ['nawodnienie', 'Nawodnienie / posiłek'],
    ['masaz', 'Masaż / rozluźnienie karku'], ['lek', 'Lek przeciwbólowy'], ['ciemne', 'Ciemne i ciche pomieszczenie'],
    ['nic', 'Nic nie pomaga'], ['inne', 'Inne']
  ];
  const MOH_OCENA = [
    ['brak', 'Brak cech nadużywania'],
    ['mozliwe', 'Możliwe nadużywanie leków doraźnych'],
    ['wysokie', 'Wysokie ryzyko MOH'],
    ['wymaga-oceny', 'Wymaga pogłębionej oceny / kontaktu z lekarzem']
  ];
  const INTERPRETACJE = [
    ['tth', 'Napięciowym bólem głowy'],
    ['migrena', 'Migreną'],
    ['moh', 'Możliwym bólem głowy z nadużywania leków'],
    ['zatokowy', 'Możliwym bólem zatokowym'],
    ['klaster', 'Możliwym klasterowym bólem głowy'],
    ['wtorny', 'Bólem wtórnym wymagającym konsultacji'],
    ['trudno', 'Nie można ocenić']
  ];
  const EDUKACJA = [
    ['alarm', 'Rozpoznawanie objawów alarmowych'],
    ['bezpieczne', 'Bezpieczne stosowanie leków przeciwbólowych'],
    ['limit', 'Ograniczenie leków doraźnych, aby zmniejszyć ryzyko MOH'],
    ['nawodnienie', 'Nawodnienie i regularne posiłki'],
    ['sen', 'Sen i higiena snu'],
    ['stres', 'Stres i techniki relaksacyjne'],
    ['komputer', 'Przerwy w pracy przy komputerze / ergonomia'],
    ['kark', 'Napięcie karku, postawa i aktywność fizyczna'],
    ['dzienniczek', 'Prowadzenie dzienniczka bólu głowy']
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
        h('div', { class: 'field' }, [
          h('label', { class: 'ctl' }, ['Nasilenie (NRS)']),
          h('input', { type: 'number', id: 'bg-nrs', min: '0', max: '10', step: '1', 'data-state': 'bolGlowy.nrs' }),
          h('div', { class: 'hint', text: '0–10' })
        ]),
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

  function handleInput(e) {
    const t = e.target;
    const key = t.getAttribute && t.getAttribute('data-state');
    if (key) {
      G.State.set(key, t.type === 'checkbox' ? t.checked : t.value);
    }
  }

  function init(container) {
    root = container;
    const cards = build();
    cards.forEach(function (c) { root.appendChild(c); });
    root.removeEventListener('input', handleInput);
    root.removeEventListener('change', handleInput);
    root.addEventListener('input', handleInput);
    root.addEventListener('change', handleInput);
  }

  function apply() {
    if (!root) return;
    const q = function (sel) { return root.querySelector(sel); };
    if (!q('#bg-nrs')) return;

    const s = G.State.get();
    const B = G.BolGlowy;

    /* Synchronizacja wartości pól */
    root.querySelectorAll('[data-state]').forEach(function (inp) {
      const v = G.State.getPath(inp.getAttribute('data-state'));
      if (inp.type === 'checkbox') inp.checked = !!v;
      else if (inp.type === 'radio') inp.checked = (inp.value === v);
      else inp.value = (v == null) ? '' : v;
    });

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
