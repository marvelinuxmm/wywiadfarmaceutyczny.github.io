/* Zakładka 6: Moduł migrenowy. */
(function () {
  const h = UI.h;
  const G = typeof window !== 'undefined' ? window : globalThis;

  const ROZPOZNANA = [['lekarz', 'Tak, przez lekarza'], ['pacjent', 'Tak, według pacjenta'], ['nie', 'Nie'], ['nw', 'Nie wiem']];
  const CZAS_TRWANIA = [['<4', '<4 godziny'], ['4-72', '4–72 godziny'], ['>72', '>72 godziny'], ['trudno', 'Trudno określić']];
  const OBJAWY_M = [
    ['nudnosci', 'Nudności'], ['wymioty', 'Wymioty'], ['swiatlowstret', 'Światłowstręt'],
    ['fonofobia', 'Fonofobia'], ['zapachy', 'Nadwrażliwość na zapachy'], ['zawroty', 'Zawroty głowy'],
    ['pozycja', 'Potrzeba położenia się / ograniczenia aktywności'], ['brak', 'Brak objawów towarzyszących']
  ];
  const PRODROM = [
    ['ziewanie', 'Ziewanie'], ['nastroj', 'Zmiana nastroju'], ['sennosc', 'Senność'],
    ['glod', 'Głód / zachcianki'], ['kark', 'Sztywność karku'], ['koncentracja', 'Trudności z koncentracją'],
    ['rozpoznaje', 'Pacjent rozpoznaje prodrom'], ['brak', 'Brak / nie wiem']
  ];
  const AURA = [
    ['nie', 'Nie'], ['wzrokowa', 'Tak, wzrokowa'], ['czuciowa', 'Tak, czuciowa'],
    ['mowy', 'Tak, zaburzenia mowy'], ['inna', 'Tak, inna'], ['nw', 'Nie wiem']
  ];
  const AURA_CZAS = [['<5', '<5 minut'], ['5-60', '5–60 minut'], ['>60', '>60 minut'], ['trudno', 'Trudno określić']];
  const AURA_OSTROZNOSC = [
    ['oslabienie', 'Osłabienie kończyny / niedowład'], ['podwojne', 'Podwójne widzenie'],
    ['rownowaga', 'Zaburzenia równowagi'], ['swiadomosc', 'Zaburzenia świadomości'],
    ['jedno-oko', 'Objawy tylko w jednym oku'], ['dluga', 'Aura trwa >60 minut'],
    ['nowa', 'Aura nowa lub istotnie inna niż zwykle'], ['brak', 'Brak powyższych']
  ];
  const CZ_FLAGI = [
    ['piorunujacy', 'Nagły, piorunujący ból głowy'], ['po-50', 'Nowy ból głowy po 50. roku życia'],
    ['goraczka', 'Ból głowy z gorączką, sztywnością karku lub wysypką'], ['deficyt', 'Nowy deficyt neurologiczny'],
    ['swiadomosc', 'Zaburzenia świadomości lub splątanie'], ['uraz', 'Ból po urazie głowy'],
    ['kaszlel', 'Ból nasilany kaszlem, parciem, wysiłkiem lub zmianą pozycji'],
    ['wzorzec', 'Istotna zmiana dotychczasowego wzorca bólu'],
    ['immunosupresja', 'Nowy ból głowy u pacjenta z immunosupresją'],
    ['nowotwor', 'Nowy ból głowy u pacjenta z chorobą nowotworową w wywiadzie'], ['brak', 'Brak powyższych']
  ];
  const WPLYW_M = [
    ['praca', 'Pracę / naukę'], ['dom', 'Obowiązki domowe'], ['fizyczna', 'Aktywność fizyczną'],
    ['rodzina', 'Życie rodzinne / społeczne'], ['sen', 'Sen'], ['nastroj', 'Nastrój'], ['brak', 'Brak istotnego wpływu']
  ];
  const WCZESNIE = [
    ['wczesnie', 'Tak, gdy ból jest jeszcze łagodny'], ['pozno', 'Tak, ale dopiero przy umiarkowanym/silnym bólu'],
    ['za-pozno', 'Zwykle za późno'], ['nw', 'Nie wiem']
  ];
  const SKUTECZNOSC = [
    ['wolnosc', 'Tak — wolność od bólu po 2 h'], ['poprawa', 'Częściowa poprawa'],
    ['brak', 'Brak odpowiedzi'], ['nw', 'Nie wiem']
  ];
  const NAWROT = [['nie', 'Nie'], ['sporadycznie', 'Tak, sporadycznie'], ['czesto', 'Tak, często'], ['nw', 'Nie wiem']];
  const WYMIOTY = [['nie', 'Nie'], ['tak', 'Tak'], ['nw', 'Nie wiem']];
  const MOH_STATUS = [
    ['niskie', 'Niskie ryzyko'], ['mozliwe', 'Możliwe ryzyko'],
    ['wysokie', 'Wysokie ryzyko'], ['wymaga-oceny', 'Wymaga oceny lekarskiej']
  ];
  const PROF_KR = [
    ['4-dni', '≥4 dni z bólem głowy w miesiącu'],
    ['wplyw', 'Istotny wpływ migreny na życie / pracę / funkcjonowanie'],
    ['nieskuteczne', 'Leczenie doraźne jest nieskuteczne mimo prawidłowego stosowania'],
    ['czeste-dorzane', 'Częste stosowanie leków doraźnych'],
    ['aura', 'Migrena z aurą o dużym nasileniu lub przedłużona aura'],
    ['przewlekla', 'Przewlekła migrena'], ['brak', 'Brak wskazań na tym etapie']
  ];
  const PROF_STOS = [['nie', 'Nie'], ['tak', 'Tak'], ['nw', 'Nie wiem']];
  const PROF_EFFEKT = [
    ['tak', 'Tak, wyraźnie'], ['czesciowo', 'Częściowo'], ['nie', 'Nie'],
    ['za-wczesnie', 'Za wcześnie na ocenę'], ['nw', 'Nie wiem']
  ];
  const EDUKACJA = [
    ['wczesnie', 'Przyjmowanie leku doraźnego wcześnie w fazie bólu'],
    ['aura-tryptan', 'Nieprzyjmowanie tryptanu wyłącznie w fazie aury, jeśli ból jeszcze się nie rozpoczął'],
    ['limit-dni', 'Ograniczanie liczby dni stosowania leków doraźnych'],
    ['moh', 'Ryzyko bólu głowy z nadużywania leków'],
    ['dzienniczek', 'Prowadzenie dzienniczka bólu głowy'],
    ['alarm', 'Rozpoznawanie objawów alarmowych'],
    ['pomoc', 'Kiedy szukać pomocy lekarskiej'],
    ['profilaktyka', 'Potrzebę konsultacji w sprawie profilaktyki']
  ];
  const DALSZY_KROK = [
    ['edukacja', 'Edukacja i kontynuacja obserwacji'],
    ['optymalizacja', 'Optymalizacja stosowania leczenia doraźnego'],
    ['bezpieczenstwo', 'Ocena bezpieczeństwa leków doraźnych'],
    ['ograniczenie', 'Ograniczenie nadużywania leków doraźnych'],
    ['profilaktyka', 'Rozważenie konsultacji lekarskiej w sprawie profilaktyki'],
    ['pilna', 'Pilna konsultacja z powodu czerwonych flag'],
    ['ogolny', 'Przejście do modułu ogólnego bólu przewlekłego'],
    ['inne', 'Inne']
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

  function buildSek1() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '7.1' }), 'Charakterystyka bólu głowy']),
      h('div', { class: 'field' }, [
        h('label', { class: 'ctl' }, ['Czy pacjent ma rozpoznaną migrenę?']),
        h('div', { class: 'radio-group' }, ROZPOZNANA.map(function (r) {
          return radio('mg.rozp', r[0], r[1], 'migrena.rozpoznana');
        }))
      ]),
      h('div', { class: 'grid' }, [
        dniField('migrena.dniBoluGlowy', 'Liczba dni z bólem głowy w miesiącu', 'mg-dni-bg'),
        dniField('migrena.dniMigrenowe', 'Liczba dni z bólem migrenowym w miesiącu', 'mg-dni-m'),
        dniField('migrena.dniDorzane', 'Liczba dni z leczeniem doraźnym bólu głowy w miesiącu', 'mg-dni-d')
      ]),
      h('div', { class: 'field', style: { marginTop: '12px' } }, [
        h('label', { class: 'ctl' }, ['Typowy czas trwania napadu']),
        h('div', { class: 'radio-group' }, CZAS_TRWANIA.map(function (c) {
          return radio('mg.czas', c[0], c[1], 'migrena.czasTrwania');
        })),
        h('div', { class: 'hint', text: 'Napad >72 godziny może odpowiadać stanowi migrenowemu (status migrainosus) — unikać opioidów.' })
      ])
    ]);
  }

  function buildSek2() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '7.2' }), 'Objawy migrenowe i prodrom']),
      h('div', { class: 'field' }, [
        h('label', { class: 'ctl' }, ['Objawy towarzyszące']),
        h('div', { class: 'checkbox-grid' }, OBJAWY_M.map(function (o) {
          return checkboxState('migrena.objawy', o[0], o[1]);
        }))
      ]),
      h('div', { class: 'field', style: { marginTop: '12px' } }, [
        h('label', { class: 'ctl' }, ['Objawy poprzedzające napad (prodrom)']),
        h('div', { class: 'checkbox-grid' }, PRODROM.map(function (p) {
          return checkboxState('migrena.prodrom', p[0], p[1]);
        })),
        h('div', { class: 'hint', text: 'Edukacyjnie: leczenie doraźne przyjmuj wcześnie, gdy ból jest jeszcze łagodny; w migrenie z aurą po rozpoczęciu fazy bólu głowy.' })
      ])
    ]);
  }

  function buildSek3() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '7.3' }), 'Aura i objawy nietypowe']),
      h('div', { class: 'field' }, [
        h('label', { class: 'ctl' }, ['Czy przed bólem lub w czasie bólu występuje aura?']),
        h('div', { class: 'radio-group' }, AURA.map(function (a) {
          return radio('mg.aura', a[0], a[1], 'migrena.aura');
        }))
      ]),
      h('div', { class: 'field', id: 'mg-aura-szczegoly', style: { display: 'none' } }, [
        h('label', { class: 'ctl' }, ['Czas trwania aury']),
        h('div', { class: 'radio-group' }, AURA_CZAS.map(function (c) {
          return radio('mg.aurac', c[0], c[1], 'migrena.auraCzas');
        })),
        h('div', { class: 'checkbox-grid', style: { marginTop: '10px' } }, AURA_OSTROZNOSC.map(function (o) {
          return checkboxState('migrena.auraOstroznosc', o[0], o[1]);
        }))
      ]),
      h('div', { class: 'komunikat komunikat-alert', id: 'mg-aura-alert', style: { display: 'none' } })
    ]);
  }

  function buildSek4() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '7.4' }), 'Czerwone flagi bólu głowy']),
      h('div', { class: 'field' }, [
        h('label', { class: 'ctl' }, ['Czy występuje którykolwiek objaw alarmowy?']),
        h('div', { class: 'checkbox-grid' }, CZ_FLAGI.map(function (f) {
          return checkboxState('migrena.czFlagi', f[0], f[1]);
        }))
      ]),
      h('div', { class: 'komunikat komunikat-alert', id: 'mg-czf-alert', style: { display: 'none' } })
    ]);
  }

  function buildSek5() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '7.5' }), 'Wpływ migreny na funkcjonowanie']),
      h('div', { class: 'field' }, [
        h('label', { class: 'ctl' }, ['Czy migrena istotnie wpływa na:']),
        h('div', { class: 'checkbox-grid' }, WPLYW_M.map(function (w) {
          return checkboxState('migrena.wplyw', w[0], w[1]);
        }))
      ]),
      h('div', { class: 'field', style: { marginTop: '12px' } }, [
        h('label', { class: 'ctl' }, ['Liczba dni ograniczonej aktywności w miesiącu']),
        h('input', { type: 'number', id: 'mg-dni-aktyw', min: '0', max: '31', step: '1', 'data-state': 'migrena.dniOgraniczonejAktywnosci' }),
        h('div', { class: 'hint', text: 'Wskazania do profilaktyki uwzględniają nie tylko liczbę dni bólu, ale też wpływ na życie osobiste, społeczne i zawodowe.' })
      ])
    ]);
  }

  function buildSek6() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '7.6' }), 'Leczenie doraźne napadu migreny']),
      h('div', { class: 'field' }, [
        h('label', { class: 'ctl' }, ['Leki stosowane doraźnie w bólu głowy (z zakładki „Farmakoterapia”)']),
        h('div', { id: 'mg-leki-dorzane' })
      ]),
      h('div', { class: 'field', style: { marginTop: '12px' } }, [
        h('label', { class: 'ctl' }, ['Czy pacjent przyjmuje lek doraźny wcześnie w napadzie?']),
        h('div', { class: 'radio-group' }, WCZESNIE.map(function (w) {
          return radio('mg.wczesnie', w[0], w[1], 'migrena.wczesnieLek');
        }))
      ]),
      h('div', { class: 'field', style: { marginTop: '12px' } }, [
        h('label', { class: 'ctl' }, ['Skuteczność leczenia doraźnego (wolność od bólu po 2 godzinach)']),
        h('div', { class: 'radio-group' }, SKUTECZNOSC.map(function (s) {
          return radio('mg.skut', s[0], s[1], 'migrena.skutecznosc2h');
        }))
      ]),
      h('div', { class: 'field', style: { marginTop: '12px' } }, [
        h('label', { class: 'ctl' }, ['Czy ból wraca w ciągu 24–48 godzin po początkowej poprawie?']),
        h('div', { class: 'radio-group' }, NAWROT.map(function (n) {
          return radio('mg.nawrot', n[0], n[1], 'migrena.nawrot');
        }))
      ]),
      h('div', { class: 'field', style: { marginTop: '12px' } }, [
        h('label', { class: 'ctl' }, ['Czy w napadzie występują wczesne wymioty utrudniające przyjęcie leku doustnego?']),
        h('div', { class: 'radio-group' }, WYMIOTY.map(function (w) {
          return radio('mg.wymioty', w[0], w[1], 'migrena.wymioty');
        }))
      ]),
      h('div', { class: 'komunikat komunikat-sugestia', id: 'mg-wymioty-sugestia', style: { display: 'none' } })
    ]);
  }

  function buildSek7() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '7.7' }), 'Ryzyko bólu głowy z nadużywania leków (MOH)']),
      h('div', { class: 'grid' }, [
        dniField('migrena.mohDni.paracetamolNlpz', 'Paracetamol / NLPZ', 'mg-moh-an'),
        dniField('migrena.mohDni.tryptany', 'Tryptany', 'mg-moh-tz'),
        dniField('migrena.mohDni.zlozone', 'Leki złożone', 'mg-moh-zl'),
        dniField('migrena.mohDni.opioidy', 'Opioidy', 'mg-moh-op'),
        dniField('migrena.mohDni.inne', 'Inne', 'mg-moh-in')
      ]),
      h('div', { class: 'field', style: { marginTop: '12px' } }, [
        h('label', { class: 'ctl' }, ['Status ryzyka MOH']),
        h('div', { class: 'radio-group' }, MOH_STATUS.map(function (m) {
          return radio('mg.moh', m[0], m[1], 'migrena.mohStatus');
        }))
      ]),
      h('div', { class: 'komunikat komunikat-sugestia', id: 'mg-moh-sugestia' }),
      h('div', { class: 'hint', style: { marginTop: '8px' }, text: 'Progi: możliwe ryzyko — tryptany/leki złożone/opioidy ≥8 dni/mies. lub analgetyki/NLPZ ≥10 dni/mies.; wysokie ryzyko — ≥10 (analgetyki ≥15) dni/mies. lub ból głowy ≥15 dni/mies. przez >3 mies.' })
    ]);
  }

  function buildSek8() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '7.8' }), 'Profilaktyka migreny']),
      h('div', { class: 'field' }, [
        h('label', { class: 'ctl' }, ['Kryteria przesiewowe do rozważenia profilaktyki']),
        h('div', { class: 'checkbox-grid' }, PROF_KR.map(function (p) {
          return checkboxState('migrena.profilaktykaKryteria', p[0], p[1]);
        }))
      ]),
      h('div', { class: 'field', style: { marginTop: '12px' } }, [
        h('label', { class: 'ctl' }, ['Czy pacjent już stosuje leczenie profilaktyczne migreny?']),
        h('div', { class: 'radio-group' }, PROF_STOS.map(function (p) {
          return radio('mg.profst', p[0], p[1], 'migrena.profilaktykaStosowana');
        }))
      ]),
      h('div', { class: 'field', id: 'mg-prof-szczegoly', style: { display: 'none', marginTop: '12px' } }, [
        h('label', { class: 'ctl' }, ['Szczegóły profilaktyki (wpisz lek z listy zakładki „Farmakoterapia”)']),
        h('div', { class: 'grid' }, [
          h('div', { class: 'field' }, [
            h('label', { class: 'ctl' }, ['Lek profilaktyczny']),
            h('input', { type: 'text', 'data-state': 'migrena.profilaktykaSzczegoly.lek' })
          ]),
          h('div', { class: 'field' }, [
            h('label', { class: 'ctl' }, ['Dawka']),
            h('input', { type: 'text', 'data-state': 'migrena.profilaktykaSzczegoly.dawka' })
          ]),
          h('div', { class: 'field' }, [
            h('label', { class: 'ctl' }, ['Od kiedy']),
            h('input', { type: 'text', placeholder: 'np. od 3 miesięcy', 'data-state': 'migrena.profilaktykaSzczegoly.odkiedy' })
          ]),
          h('div', { class: 'field' }, [
            h('label', { class: 'ctl' }, ['Czy stosowany regularnie?']),
            h('div', { class: 'radio-group' }, [['tak', 'Tak'], ['nie', 'Nie'], ['nw', 'Nie wiem']].map(function (r) {
              return radio('mg.profreg', r[0], r[1], 'migrena.profilaktykaSzczegoly.regularnie');
            }))
          ])
        ]),
        h('div', { class: 'field', style: { marginTop: '12px' } }, [
          h('label', { class: 'ctl' }, ['Czy profilaktyka zmniejszyła liczbę dni migrenowych?']),
          h('div', { class: 'radio-group' }, PROF_EFFEKT.map(function (p) {
            return radio('mg.profeff', p[0], p[1], 'migrena.profilaktykaEfekt');
          })),
          h('div', { class: 'hint', text: 'Skuteczność doustnej profilaktyki ocenia się po ok. 3 miesiącach; za skuteczność uznaje się m.in. zmniejszenie miesięcznych dni migrenowych o ≥50%.' })
        ])
      ])
    ]);
  }

  function buildSek9() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '7.9' }), 'Elementy edukacji pacjenta']),
      h('div', { class: 'field' }, [
        h('label', { class: 'ctl' }, ['Omówiono z pacjentem:']),
        h('div', { class: 'checkbox-grid' }, EDUKACJA.map(function (e) {
          return checkboxState('migrena.edukacja', e[0], e[1]);
        }))
      ])
    ]);
  }

  function buildSek10() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '7.10' }), 'Podsumowanie farmaceutyczne']),
      h('div', { class: 'field' }, [
        h('label', { class: 'ctl' }, ['Klasyfikacja robocza']),
        h('input', { type: 'text', id: 'mg-klasyfikacja', placeholder: 'Auto-sugestia pojawi się po podaniu dni bólu głowy i dni migrenowych…', 'data-state': 'migrena.klasyfikacja' }),
        h('div', { class: 'hint', id: 'mg-klasyfikacja-opis' })
      ]),
      h('div', { class: 'field', style: { marginTop: '12px' } }, [
        h('label', { class: 'ctl' }, ['Rekomendowany dalszy krok']),
        h('div', { class: 'radio-group radio-col' }, DALSZY_KROK.map(function (d) {
          return radio('mg.krok', d[0], d[1], 'migrena.dalszyKrok');
        }))
      ]),
      h('div', { class: 'field', style: { marginTop: '12px' } }, [
        h('label', { class: 'ctl' }, ['Epikryza modułu migrenowego']),
        h('textarea', {
          rows: '5',
          placeholder: 'Podsumuj: częstość dni bólu głowy i dni migrenowych, cechy migrenowe, obecność/charakter aury, leczenie doraźne, skuteczność po 2 godzinach, nawroty, liczba dni stosowania leków doraźnych, ryzyko MOH, wskazania do profilaktyki oraz ewentualne objawy alarmowe.',
          'data-state': 'migrena.epikryza'
        })
      ])
    ]);
  }

  function build() {
    return [buildSek1(), buildSek2(), buildSek3(), buildSek4(), buildSek5(),
      buildSek6(), buildSek7(), buildSek8(), buildSek9(), buildSek10()];
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
    root.querySelector('#mg-leki-dorzane').appendChild(buildLekSelect());
    root.removeEventListener('input', handleInput);
    root.removeEventListener('change', handleInput);
    root.addEventListener('input', handleInput);
    root.addEventListener('change', handleInput);
  }

  function buildLekSelect() {
    const s = G.State.get();
    const leki = s.leki || [];
    if (!leki.length) return h('p', { class: 'hint', text: 'Brak leków — uzupełnij listę w zakładce „Farmakoterapia”.' });
    return h('div', { class: 'checkbox-grid' }, leki.map(function (l) {
      const etykieta = (l.nazwa || '(bez nazwy)') + (l.moc ? ' ' + l.moc : '');
      return h('label', { class: 'checkbox' }, [
        h('input', { type: 'checkbox', 'data-cel': 'migrena.lekiDorzane', 'data-id': l.id }),
        h('span', { text: etykieta })
      ]);
    }));
  }

  function anyTrueExceptBrak(obj) {
    return Object.keys(obj || {}).some(function (k) { return k !== 'brak' && obj[k]; });
  }

  function apply() {
    if (!root) return;
    const q = function (sel) { return root.querySelector(sel); };
    if (!q('#mg-dni-bg')) return;

    const s = G.State.get();
    const K = G.Kontrola;

    /* Synchronizacja wartości pól */
    root.querySelectorAll('[data-state]').forEach(function (inp) {
      const v = G.State.getPath(inp.getAttribute('data-state'));
      if (inp.type === 'checkbox') inp.checked = !!v;
      else if (inp.type === 'radio') inp.checked = (inp.value === v);
      else inp.value = (v == null) ? '' : v;
    });

    /* Wybór leków doraźnych */
    root.querySelectorAll('[data-cel="migrena.lekiDorzane"]').forEach(function (inp) {
      inp.checked = s.migrena.lekiDorzane.indexOf(parseInt(inp.getAttribute('data-id'), 10)) !== -1;
    });

    /* Aura — szczegóły + alert */
    const aura = s.migrena.aura;
    q('#mg-aura-szczegoly').style.display = (aura && aura !== 'nie' && aura !== 'nw') ? '' : 'none';
    const auraAlert = q('#mg-aura-alert');
    if (anyTrueExceptBrak(s.migrena.auraOstroznosc)) {
      auraAlert.style.display = '';
      auraAlert.textContent = 'Nietypowa aura lub objawy neurologiczne. Rozważ pilną konsultację lekarską zgodnie z lokalną procedurą.';
    } else {
      auraAlert.style.display = 'none';
    }

    /* Czerwone flagi — alert */
    const czfAlert = q('#mg-czf-alert');
    if (anyTrueExceptBrak(s.migrena.czFlagi)) {
      czfAlert.style.display = '';
      czfAlert.textContent = 'Objaw alarmowy bólu głowy. Moduł migrenowy nie powinien zastępować pilnej oceny lekarskiej.';
    } else {
      czfAlert.style.display = 'none';
    }

    /* Wymioty → sugestia postaci niedoustnej */
    const wym = q('#mg-wymioty-sugestia');
    if (s.migrena.wymioty === 'tak') {
      wym.style.display = '';
      wym.textContent = 'Warto omówić z lekarzem postać niedoustną (iniekcja, aerozol donosowy, czopek) lub lek przeciwwymiotny.';
    } else {
      wym.style.display = 'none';
    }

    /* MOH — auto-sugestia */
    const moh = K.sugerujMOH(Object.assign({ dniBoluGlowy: s.migrena.dniBoluGlowy }, s.migrena.mohDni || {}));
    q('#mg-moh-sugestia').textContent = 'Propozycja aplikacji: ' +
      (MOH_STATUS.find(function (x) { return x[0] === moh.status; }) || ['', '—'])[1] +
      '. (' + moh.powody.join('; ') + ')';
    root.querySelectorAll('[name="mg.moh"]').forEach(function (inp) {
      inp.parentElement.classList.toggle('sugerowane', inp.value === moh.status);
    });

    /* Profilaktyka szczegóły */
    q('#mg-prof-szczegoly').style.display = (s.migrena.profilaktykaStosowana === 'tak') ? '' : 'none';

    /* Klasyfikacja robocza — auto-sugestia (nadpisywana, dopóki użytkownik nie wpisze własnej) */
    const AUTO_LABELE = ['Migrena epizodyczna', 'Migrena wysokoczęsta', 'Migrena przewlekła'];
    const kl = K.sugerujKlasyfikacja(s.migrena.dniBoluGlowy, s.migrena.dniMigrenowe);
    q('#mg-klasyfikacja-opis').textContent = kl.opis;
    if (kl.label && s.migrena.klasyfikacja !== kl.label &&
        (s.migrena.klasyfikacja === '' || AUTO_LABELE.indexOf(s.migrena.klasyfikacja) !== -1)) {
      G.State.set('migrena.klasyfikacja', kl.label);
    }
  }

  G.Tab7 = { init: init, apply: apply };
})();
