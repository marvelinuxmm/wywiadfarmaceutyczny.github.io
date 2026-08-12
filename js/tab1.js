/* Zakładka 1: Profil pacjenta i choroby współistniejące. */
(function () {
  const h = UI.h;
  const G = typeof window !== 'undefined' ? window : globalThis;

  /* Kategorie (sekcja 2) — nazwy identyczne z grupami sekcji 3 */
  const CHOROBY = [
    ['sercowo', 'Układ sercowo-naczyniowy'],
    ['metaboliczne', 'Choroby metaboliczne'],
    ['nerki_watroba', 'Nerki i wątroba'],
    ['przewodpokarmowy', 'Przewód pokarmowy'],
    ['oddechowe', 'Układ oddechowy'],
    ['neurologia', 'Neurologia'],
    ['psychiczne', 'Zdrowie psychiczne'],
    ['kostno', 'Układ kostno-stawowy'],
    ['inne', 'Inne']
  ];

  let root = null;
  let manualOpen = false;

  function radio(name, value, label, dataState) {
    return h('label', { class: 'radio' }, [
      h('input', { type: 'radio', name: name, value: value, 'data-state': dataState || name }),
      h('span', { text: label })
    ]);
  }

  /* Wiersz pytania kontrolnego (przeniesione z zakładki 2) */
  function pytanieRow(p) {
    return h('div', { class: 'pytanie-row', 'data-q': p.id }, [
      h('span', { class: 'pytanie-tekst', text: (p.alarm ? '⚠ ' : '') + p.tekst }),
      h('div', { class: 'radio-group' }, [
        radio('q.' + p.id, 'tak', 'Tak', 'odpowiedzi.' + p.id),
        radio('q.' + p.id, 'nie', 'Nie', 'odpowiedzi.' + p.id),
        radio('q.' + p.id, 'nw', 'Nie wiem', 'odpowiedzi.' + p.id)
      ]),
    ]);
  }

  /* Pytania kontrolne przypisane do grup (klucz grupy → klucz sekcji pytań) */
  const PYTANIA_GRUP = {
    sercowo: 'sercowo',
    oddechowe: 'oddechowe',
    przewodpokarmowy: 'przewodpokarmowy',
    nerki_watroba: 'watroba'
  };

  function pytaniaGrupy(kategoria) {
    const sek = PYTANIA_GRUP[kategoria];
    if (!sek) return [];
    const wynik = [];
    (G.PYTANIA || []).forEach(function (s) {
      if (s.choroba === sek) s.pytania.forEach(function (p) { wynik.push(p); });
    });
    return wynik;
  }

  function build() {
    /* --- 1. Dane podstawowe --- */
    const sekDane = h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '1' }), 'Dane podstawowe']),
      h('div', { class: 'grid' }, [
        h('div', { class: 'field' }, [
          h('label', { class: 'ctl' }, ['Wiek', h('span', { class: 'req', text: ' *' })]),
          h('input', { type: 'number', id: 'f-wiek', min: '18', max: '120', step: '1', 'data-state': 'wiek' }),
          h('div', { class: 'hint', text: 'Zakres 18–120 lat' }),
          h('div', { class: 'hint err', id: 'wiek-hint' })
        ]),
        h('div', { class: 'field' }, [
          h('label', { class: 'ctl' }, ['Płeć biologiczna', h('span', { class: 'req', text: ' *' })]),
          h('div', { class: 'radio-group' }, [radio('plec', 'k', 'Kobieta'), radio('plec', 'm', 'Mężczyzna')])
        ]),
        h('div', { class: 'field' }, [
          h('label', { class: 'ctl' }, ['Masa ciała (kg)']),
          h('input', { type: 'number', id: 'f-masa', min: '30', max: '250', step: '0.1', 'data-state': 'masa' }),
          h('div', { class: 'hint', text: 'Zakres 30–250 kg. Wymagana do wyliczenia CrCL (Cockcroft-Gault).' }),
          h('div', { class: 'hint err', id: 'masa-hint' })
        ]),
        h('div', { class: 'field' }, [
          h('label', { class: 'ctl' }, ['Wzrost (cm)']),
          h('input', { type: 'number', id: 'f-wzrost', min: '130', max: '230', step: '1', 'data-state': 'wzrost' }),
          h('div', { class: 'hint', text: 'Zakres 130–230 cm. Wymagany do BMI i BSA.' }),
          h('div', { class: 'hint err', id: 'wzrost-hint' })
        ])
      ]),
      h('div', { class: 'results antropometria', id: 'bmi-bsa-results', style: { display: 'none' } }, [
        h('h3', { text: 'Parametry antropometryczne' }),
        h('div', { class: 'res-row' }, [
          h('span', { text: 'BMI' }),
          h('div', { class: 'res-valbox' }, [
            h('div', { class: 'res-val', id: 'bmi-val', text: '—' }),
            h('div', { class: 'res-band', id: 'bmi-band' })
          ])
        ]),
        h('div', { class: 'res-row' }, [
          h('span', { text: 'BSA (Mosteller)' }),
          h('div', { class: 'res-valbox' }, [h('div', { class: 'res-val', id: 'bsa-val', text: '—' })])
        ]),
        h('div', { class: 'res-row', id: 'ibw-row', style: { display: 'none' } }, [
          h('span', { text: 'Masa idealna (IBW, Devine)' }),
          h('div', { class: 'res-valbox' }, [h('div', { class: 'res-val', id: 'ibw-val', text: '—' })])
        ])
      ]),
      h('div', { class: 'field', id: 'sek-ciaza' }, [
        h('label', { class: 'ctl' }, ['Ciąża / karmienie piersią', h('span', { class: 'req', text: ' *' })]),
        h('div', { class: 'radio-group' }, [
          radio('ciaza', 'tak', 'Tak'),
          radio('ciaza', 'nie', 'Nie'),
          radio('ciaza', 'nda', 'Nie dotyczy'),
          radio('ciaza', 'nw', 'Nie wiem')
        ])
      ])
    ]);

    /* --- 2. Choroby współistniejące (kategorie) --- */
    const sekChoroby = h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '2' }), 'Choroby współistniejące']),
      h('div', { class: 'checkbox-grid' }, CHOROBY.map(function (c) {
        return h('label', { class: 'checkbox' }, [
          h('input', { type: 'checkbox', 'data-state': 'choroby.' + c[0] }),
          h('span', { text: c[1] })
        ]);
      }))
    ]);

    /* --- 3. Szczegółowe choroby współistniejące + pytania kontrolne --- */
    const alarmPytania = [];
    (G.PYTANIA || []).forEach(function (s) {
      if (s.choroba === '__alarmowe__') s.pytania.forEach(function (p) { alarmPytania.push(p); });
    });
    const sekSzczegolowe = h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '3' }), 'Szczegółowe choroby współistniejące i pytania uzupełniające']),
      h('p', { class: 'hint', id: 'szczegolowe-hint', text: 'Zaznacz kategorię w sekcji 2, aby rozwinąć jej listę i pytania uzupełniające. Pozycje już zaznaczone na liście nie są pytane ponownie.' }),
      (G.CHOROBY_SZCZEGOLOWE || []).map(function (g) {
        const dzieci = g.items.map(function (it) {
          return h('label', { class: 'checkbox' }, [
            h('input', {
              type: 'checkbox',
              'data-state': 'chorobySzczegolowe.' + it.id,
              'data-kategoria': it.kategoria || g.kategoria
            }),
            h('span', { text: it.label })
          ]);
        });
        /* Pole „Inne” dla każdej grupy */
        dzieci.push(h('div', { class: 'inne-row' }, [
          h('label', { text: 'Inne:' }),
          h('input', { type: 'text', placeholder: 'Wpisz inne choroby z tej grupy…', 'data-state': 'inneChoroby.' + g.kategoria })
        ]));
        /* Zdrowie psychiczne — aktywność kliniczna */
        if (g.kategoria === 'psychiczne') {
          dzieci.push(h('div', { class: 'grupa-psych-aktyw' }, [
            h('div', { class: 'field' }, [
              h('label', { class: 'ctl' }, ['Czy problem jest aktualnie aktywny klinicznie?']),
              h('div', { class: 'radio-group' }, [
                radio('psychAktywny', 'tak', 'Tak'),
                radio('psychAktywny', 'nie', 'Nie'),
                radio('psychAktywny', 'nw', 'Nie wiem')
              ])
            ])
          ]));
        }
        /* Pytania kontrolne danej grupy (z dawnej sekcji 2.2 zakładki 2) */
        const qs = pytaniaGrupy(g.kategoria);
        if (qs.length) {
          dzieci.push(h('div', { class: 'grupa-pytania' }, [
            h('h5', { text: 'Pytania uzupełniające' }),
            qs.map(pytanieRow)
          ]));
        }
        return h('div', { class: 'grupa-chorob', 'data-grupa': g.kategoria }, [
          h('h4', {}, [g.system, h('span', { class: 'grupa-liczba', 'data-liczba': g.system })]),
          h('div', { class: 'checkbox-grid' }, dzieci)
        ]);
      }),
      /* Objawy alarmowe — zawsze widoczne */
      h('div', { class: 'grupa-chorob grupa-alarmowa' }, [
        h('h4', { text: 'Objawy alarmowe — sprawdź zawsze' }),
        h('p', { class: 'hint', text: 'Odpowiedź „tak” przy objawie ⚠ uruchamia poziom „Wymaga reakcji” w podsumowaniu ryzyka (zakładka 2).' }),
        h('div', {}, alarmPytania.map(pytanieRow))
      ])
    ]);

    /* --- 4. Panel nerkowy --- */
    const sekNerki = h('section', { class: 'card' }, [
      h('h2', {}, [
        h('span', { class: 'num', text: '4' }),
        'Panel nerkowy',
        h('button', { class: 'btn', type: 'button', id: 'btn-nerki' })
      ]),
      h('div', { id: 'panel-nerkowy-body' }, [
        h('div', { class: 'grid' }, [
          h('div', { class: 'field' }, [
            h('label', { class: 'ctl' }, ['Kreatynina w surowicy', h('span', { class: 'req', id: 'kreatynina-req', text: ' *' })]),
            h('input', { type: 'number', id: 'f-kreatynina', min: '0.1', max: '20', step: '0.01', 'data-state': 'kreatynina' }),
            h('div', { class: 'radio-group', style: { marginTop: '8px' } }, [
              radio('jednostkaKreatyniny', 'mgdl', 'mg/dL'),
              radio('jednostkaKreatyniny', 'umol', 'µmol/L')
            ]),
            h('div', { class: 'hint', id: 'kreatynina-conv' }),
            h('div', { class: 'hint err', id: 'kreatynina-hint' })
          ]),
          h('div', { class: 'field' }, [
            h('label', { class: 'ctl' }, ['Data oznaczenia kreatyniny']),
            h('input', { type: 'date', id: 'f-data', 'data-state': 'dataKreatyniny' }),
            h('div', { class: 'hint', text: 'Wynik starszy niż 6 miesięcy → flaga nieaktualności.' })
          ])
        ]),
        h('div', { class: 'field' }, [
          h('label', { class: 'ctl' }, ['Albuminuria']),
          h('div', { class: 'radio-group' }, [
            radio('albuminuria', 'brak', 'Brak danych'),
            radio('albuminuria', 'a1', 'Prawidłowa / A1'),
            radio('albuminuria', 'a2', 'Umiarkowanie zwiększona / A2'),
            radio('albuminuria', 'a3', 'Znacznie zwiększona / A3'),
            radio('albuminuria', 'liczba', 'Wartość liczbowa dostępna')
          ])
        ]),
        h('div', { class: 'field', id: 'uacr-row' }, [
          h('label', { class: 'ctl' }, ['UACR']),
          h('div', { class: 'grid' }, [
            h('input', { type: 'number', id: 'f-uacr', min: '0.1', step: '0.1', 'data-state': 'uacr' }),
            h('select', { 'data-state': 'uacrJednostka' }, [
              h('option', { value: 'mgg', text: 'mg/g' }),
              h('option', { value: 'mgmmol', text: 'mg/mmol' })
            ])
          ])
        ]),
        h('div', { class: 'results' }, [
          h('h3', { text: 'Wyniki automatyczne' }),
          h('div', { class: 'res-row' }, [
            h('span', { text: 'eGFR (CKD-EPI 2021)' }),
            h('div', { class: 'res-valbox' }, [
              h('div', { class: 'res-val', id: 'egfr-val', text: '—' }),
              h('div', { class: 'res-band', id: 'egfr-band' })
            ])
          ]),
          h('div', { class: 'res-row' }, [
            h('span', { text: 'CrCL (Cockcroft-Gault)' }),
            h('div', { class: 'res-valbox' }, [
              h('div', { class: 'res-val', id: 'crcl-val', text: '—' }),
              h('div', { class: 'res-band', id: 'crcl-band' })
            ])
          ]),
          h('div', { class: 'hint', id: 'crcl-weight' }),
          h('div', { class: 'hint', id: 'renal-hint' })
        ])
      ])
    ]);

    /* --- 5. Epikryza farmaceutyczna --- */
    const sekEpikryza = h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '5' }), 'Epikryza farmaceutyczna']),
      h('div', { class: 'field' }, [
        h('label', { class: 'ctl' }, ['Inne istotne choroby, okoliczności kliniczne i komentarz farmaceuty']),
        h('textarea', {
          rows: '5',
          placeholder: 'Wpisz inne istotne informacje kliniczne, które mogą mieć znaczenie dla oceny bólu i farmakoterapii, np. cukrzyca, choroby neurologiczne, choroby autoimmunologiczne, choroby układu ruchu, przebyty udar, osteoporoza, fibromialgia, problemy z adherencją, ograniczenia funkcjonalne, opieka specjalistyczna.',
          'data-state': 'epikryza'
        })
      ])
    ]);

    return [sekDane, sekChoroby, sekSzczegolowe, sekNerki, sekEpikryza];
  }

  function handleInput(e) {
    const t = e.target;
    const key = t.getAttribute('data-state');
    if (!key) return;
    if (t.type === 'checkbox') {
      /* Czytaj raz — apply() może w trakcie zsynchronizować checkbox ze stanu */
      const checked = t.checked;
      /* Kategoria „Nerki i wątroba” — ustawia oba wewnętrzne klucze */
      if (key === 'choroby.nerki_watroba') {
        G.State.set('choroby.watroba', checked);
        G.State.set('choroby.pchn', checked);
      } else {
        G.State.set(key, checked);
      }
      if (checked) {
        /* pozycja szczegółowa → aktywacja kategorii (sekcja 2) */
        const kat = t.getAttribute('data-kategoria');
        if (kat === 'nerki_watroba') {
          G.State.set('choroby.watroba', true);
          G.State.set('choroby.pchn', true);
        } else if (kat) {
          G.State.set('choroby.' + kat, true);
        }
      }
    } else {
      G.State.set(key, t.value);
    }
  }

  function handleClick(e) {
    const b = e.target.closest ? e.target.closest('#btn-nerki') : null;
    if (b) {
      manualOpen = !manualOpen;
      apply();
    }
  }

  function init(container) {
    root = container;
    const cards = build();
    cards.forEach(function (c) { root.appendChild(c); });
    root.removeEventListener('input', handleInput);
    root.removeEventListener('change', handleInput);
    root.removeEventListener('click', handleClick);
    root.addEventListener('input', handleInput);
    root.addEventListener('change', handleInput);
    root.addEventListener('click', handleClick);
  }

  function fmt(v, d) {
    return v.toFixed(d).replace('.', ',');
  }

  function apply() {
    if (!root) return;
    const q = function (sel) { return root.querySelector(sel); };
    if (!q('#f-wiek')) return; // aktywna jest inna zakładka

    const s = G.State.get();
    const Calc = G.Calc;

    /* Kategoria „Nerki i wątroba” = watroba || pchn (klucz wyświetlany) */
    s.choroby.nerki_watroba = !!(s.choroby.watroba || s.choroby.pchn);

    /* Synchronizacja wartości pól */
    root.querySelectorAll('[data-state]').forEach(function (inp) {
      const v = G.State.getPath(inp.getAttribute('data-state'));
      if (inp.type === 'checkbox') inp.checked = !!v;
      else if (inp.type === 'radio') inp.checked = (inp.value === v);
      else inp.value = (v == null) ? '' : v;
    });

    const age = Calc.parseNum(s.wiek);
    const masa = Calc.parseNum(s.masa);
    const wzrost = Calc.parseNum(s.wzrost);
    const scr = Calc.toMgdl(s.kreatynina, s.jednostkaKreatyniny);
    const ageOk = age !== null && age >= 18 && age <= 120;
    const masaOk = masa !== null && masa >= 30 && masa <= 250;
    const wzrostOk = wzrost !== null && wzrost >= 130 && wzrost <= 230;
    const ibwValue = s.plec && wzrostOk ? Calc.idealBodyWeight(s.plec, wzrost) : null;

    /* Widoczność sekcji warunkowych */
    q('#sek-ciaza').style.display = (s.plec === 'k') ? '' : 'none';
    /* Grupy szczegółowe — widoczne tylko po zaznaczeniu kategorii + liczniki */
    let widoczneGrupy = 0;
    (G.CHOROBY_SZCZEGOLOWE || []).forEach(function (g) {
      const el = root.querySelector('[data-grupa="' + g.kategoria + '"]');
      if (!el) return;
      const widoczna = !!s.choroby[g.kategoria];
      el.style.display = widoczna ? '' : 'none';
      if (widoczna) widoczneGrupy++;
      const liczba = el.querySelector('[data-liczba]');
      if (liczba) {
        const n = g.items.filter(function (it) { return !!s.chorobySzczegolowe[it.id]; }).length;
        liczba.textContent = n ? ' — zaznaczono ' + n : '';
      }
    });
    q('#szczegolowe-hint').style.display = widoczneGrupy ? 'none' : '';


    const pchn = s.choroby.pchn;
    const open = pchn || manualOpen;
    q('#panel-nerkowy-body').style.display = open ? '' : 'none';
    const btn = q('#btn-nerki');
    btn.style.display = pchn ? 'none' : '';
    btn.textContent = manualOpen ? 'Zwiń panel nerkowy' : 'Rozwiń panel nerkowy (opcjonalnie)';
    q('#uacr-row').style.display = (s.albuminuria === 'liczba') ? '' : 'none';
    q('#kreatynina-req').style.display = pchn ? '' : 'none';

    /* Walidacja zakresów */
    q('#wiek-hint').textContent = (age !== null && (age < 18 || age > 120)) ? 'Poza zakresem 18–120 lat.' : '';
    q('#masa-hint').textContent = (masa !== null && (masa < 30 || masa > 250)) ? 'Poza zakresem 30–250 kg.' : '';
    q('#wzrost-hint').textContent = (wzrost !== null && !wzrostOk) ? 'Poza zakresem 130–230 cm.' : '';

    /* BMI i BSA Mostellera */
    const bmiValue = masaOk && wzrostOk ? Calc.bmi(masa, wzrost) : null;
    const bsaValue = masaOk && wzrostOk ? Calc.bsaMosteller(masa, wzrost) : null;
    const antropometria = q('#bmi-bsa-results');
    antropometria.style.display = (bmiValue !== null && bsaValue !== null) ? '' : 'none';
    if (bmiValue !== null && bsaValue !== null) {
      q('#bmi-val').textContent = fmt(bmiValue, 1) + ' kg/m²';
      q('#bmi-band').textContent = Calc.bmiBand(bmiValue).label;
      q('#bsa-val').textContent = fmt(bsaValue, 2) + ' m²';
    }
    q('#ibw-row').style.display = ibwValue !== null ? '' : 'none';
    if (ibwValue !== null) q('#ibw-val').textContent = fmt(ibwValue, 1) + ' kg';

    /* Konwersja jednostek kreatyniny */
    const conv = q('#kreatynina-conv');
    const scv = Calc.parseNum(s.kreatynina);
    q('#kreatynina-hint').textContent = (scv !== null && (scv <= 0 || scv > 20)) ? 'Sprawdź wartość kreatyniny.' : '';
    if (scv !== null) {
      if (s.jednostkaKreatyniny === 'umol') conv.textContent = '≈ ' + fmt(scr, 2) + ' mg/dL';
      else conv.textContent = '≈ ' + fmt(scv * 88.4, 0) + ' µmol/L';
    } else {
      conv.textContent = '';
    }

    /* Wyniki automatyczne */
    const egfr = (scr !== null && s.plec && ageOk) ? Calc.ckdEpi(scr, age, s.plec) : null;
    if (egfr !== null && isFinite(egfr)) {
      q('#egfr-val').textContent = Math.round(egfr) + ' ml/min/1,73 m²';
      q('#egfr-band').textContent = Calc.egfrBand(egfr).label;
    } else {
      q('#egfr-val').textContent = '—';
      q('#egfr-band').textContent = '';
    }

    const selectedWeight = masaOk && s.plec ? Calc.crclWeight(s.plec, masa, wzrostOk ? wzrost : null) : null;
    const crcl = (scr !== null && s.plec && ageOk && selectedWeight) ? Calc.cockcroftGault(scr, age, selectedWeight.weight, s.plec) : null;
    if (crcl !== null && isFinite(crcl)) {
      q('#crcl-val').textContent = Math.round(crcl) + ' ml/min';
      q('#crcl-band').textContent = Calc.crclBand(crcl).label;
      q('#crcl-weight').textContent = 'Masa użyta do CrCL: ' + selectedWeight.mode + ' (' + fmt(selectedWeight.weight, 1) + ' kg)' +
        (selectedWeight.ideal === null ? ' — podaj wzrost, aby wyliczyć IBW/ABW.' : '.');
    } else {
      q('#crcl-val').textContent = '—';
      q('#crcl-band').textContent = '';
      q('#crcl-weight').textContent = '';
    }

    const missing = [];
    if (!ageOk) missing.push('wiek');
    if (!s.plec) missing.push('płeć');
    if (!masaOk) missing.push('masę ciała');
    if (scr === null) missing.push('kreatyninę');
    q('#renal-hint').textContent = missing.length
      ? 'Wprowadź: ' + missing.join(', ') + ' — aby wyliczyć eGFR i CrCL.'
      : '';
  }

  G.Tab1 = { init: init, apply: apply };
})();
