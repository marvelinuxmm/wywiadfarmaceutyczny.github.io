/* Zakładka 8: Podsumowanie i raport — widok pełny / skrócony, druk, epikryza końcowa. */
(function () {
  const h = UI.h;
  const G = typeof window !== 'undefined' ? window : globalThis;

  const KATEGORIA_LABEL = {};
  (G.CHOROBY_SZCZEGOLOWE || []).forEach(function (g) {
    KATEGORIA_LABEL[g.kategoria] = g.system;
    g.items.forEach(function (it) { KATEGORIA_LABEL['it.' + it.id] = it.label; });
  });

  let root = null;
  let widok = 'pelny'; // 'pelny' | 'skrocony' — tylko w pamięci UI

  function str(v) {
    return (v === '' || v === null || v === undefined) ? '—' : String(v);
  }
  function label(domain, id) { return G.E.label(domain, id); }
  function skroty(domain, obj) { return G.E.skroty(domain, obj); }
  function ok(masa, wzrost) {
    return masa !== null && masa >= 30 && masa <= 250 && wzrost !== null && wzrost >= 130 && wzrost <= 230;
  }
  function lekNazwa(leki, id) {
    const l = (leki || []).find(function (x) { return x.id === id; });
    return l ? (l.nazwa || '(bez nazwy)') + (l.moc ? ' ' + l.moc : '') : null;
  }
  function lekNazwy(leki, ids) {
    const out = [];
    (ids || []).forEach(function (id) {
      const n = lekNazwa(leki, id);
      if (n) out.push(n);
    });
    return out.length ? out.join(', ') : '—';
  }
  function hasAny(obj) {
    if (!obj || typeof obj !== 'object') return false;
    return Object.keys(obj).some(function (k) {
      const v = obj[k];
      if (typeof v === 'boolean') return v;
      if (typeof v === 'string') return v !== '';
      if (Array.isArray(v)) return v.length > 0;
      return hasAny(v);
    });
  }

  /* ---- Wiersze raportu ---- */
  function sekcja(tytul, rows, extra) {
    const rowEls = (rows || []).map(function (r) {
      return h('tr', {}, [
        h('td', { class: 'r-key', text: r[0] }),
        h('td', { text: r[1] })
      ]);
    });
    const out = [h('h3', { text: tytul })];
    if (rowEls.length) out.push(h('table', { class: 'raport-table' }, rowEls));
    if (extra) out.push(extra);
    return h('div', { class: 'raport-sekcja' }, out);
  }

  function flagaLista(flags) {
    if (!flags.length) return h('p', { class: 'hint', text: 'Brak aktywnych flag.' });
    return h('div', {}, flags.map(function (f) {
      return h('div', { class: 'flag flag-' + f.sev, style: { marginTop: '6px' } }, [
        h('div', { class: 'flag-title', text: f.title }),
        f.text ? h('div', { class: 'flag-text', text: f.text }) : null
      ]);
    }));
  }

  function epikryzaBlock(tekst, placeholder) {
    return h('div', { class: 'r-epikryza' }, [
      h('strong', { text: 'Epikryza: ' }),
      str(tekst)
    ]);
  }

  function priorytetyBlock(tekst) {
    return h('div', { class: 'r-epikryza' }, [
      h('strong', { text: 'Priorytety pacjenta: ' }),
      str(tekst)
    ]);
  }

  /* ---- Widok pełny ---- */
  function renderPelny(s) {
    const Calc = G.Calc;
    const masa = Calc.parseNum(s.masa);
    const wzrost = Calc.parseNum(s.wzrost);
    const wazne = ok(masa, wzrost);
    const bmi = wazne ? Calc.bmi(masa, wzrost) : null;
    const bsa = wazne ? Calc.bsaMosteller(masa, wzrost) : null;
    const ibw = s.plec && wzrost !== null && wzrost >= 130 && wzrost <= 230 ? Calc.idealBodyWeight(s.plec, wzrost) : null;
    const scr = Calc.toMgdl(s.kreatynina, s.jednostkaKreatyniny);
    const age = Calc.ageFromBirthDate(s.dataUrodzenia);
    const ageOk = age !== null && age >= 18 && age <= 120;

    const out = [];

    /* 1. Dane pacjenta */
    const daneRows = [
      ['Data urodzenia', s.dataUrodzenia ? s.dataUrodzenia + (age !== null ? ' (' + age + ' lat)' : '') : '—'],
      ['Płeć biologiczna', label('plec', s.plec)],
      ['Masa ciała', str(s.masa) + ' kg'],
      ['Wzrost', str(s.wzrost) + ' cm'],
      ['Ciśnienie tętnicze', (s.cisnienieSkurczowe || s.cisnienieRozkurczowe)
        ? str(s.cisnienieSkurczowe) + ' / ' + str(s.cisnienieRozkurczowe) + ' mmHg'
        : '—'],
      ['BMI', bmi !== null ? bmi.toFixed(1).replace('.', ',') + ' kg/m²' + ' (' + Calc.bmiBand(bmi).label + ')' : '—'],
      ['BSA (Mosteller)', bsa !== null ? bsa.toFixed(2).replace('.', ',') + ' m²' : '—'],
      ['Masa idealna (IBW, Devine)', ibw !== null ? ibw.toFixed(1).replace('.', ',') + ' kg' : '—'],
      ['Ciąża / karmienie piersią', s.plec === 'k' ? label('ciaza', s.ciaza) : '—']
    ];
    out.push(sekcja('1. Dane pacjenta', daneRows));

    /* 2. Choroby współistniejące */
    const chRows = [];
    const kat = [];
    Object.keys(s.choroby || {}).forEach(function (k) {
      if (s.choroby[k] && KATEGORIA_LABEL[k]) kat.push(KATEGORIA_LABEL[k]);
    });
    chRows.push(['Kategorie', kat.length ? kat.join(', ') : '—']);
    const szczeg = [];
    Object.keys(s.chorobySzczegolowe || {}).forEach(function (id) {
      if (s.chorobySzczegolowe[id] && KATEGORIA_LABEL['it.' + id]) szczeg.push(KATEGORIA_LABEL['it.' + id]);
    });
    chRows.push(['Szczegółowe choroby', szczeg.length ? szczeg.join(', ') : '—']);
    const inne = Object.keys(s.inneChoroby || {}).filter(function (k) { return s.inneChoroby[k]; });
    chRows.push(['Inne (opisy)', inne.length ? inne.map(function (k) {
      return (KATEGORIA_LABEL[k] || k) + ': ' + s.inneChoroby[k];
    }).join('; ') : '—']);
    const psychAktywny = s.psychAktywny === 'tak' ? 'Tak' : s.psychAktywny === 'nie' ? 'Nie' : s.psychAktywny === 'nw' ? 'Nie wiem' : '—';
    chRows.push(['Zdrowie psychiczne — aktywność', s.choroby.psychiczne ? psychAktywny : '—']);

    /* 3. Funkcja nerek */
    const egfr = (scr !== null && s.plec && ageOk) ? Calc.ckdEpi(scr, age, s.plec) : null;
    const wybMasa = masa !== null && s.plec ? Calc.crclWeight(s.plec, masa, wzrost !== null && wzrost >= 130 && wzrost <= 230 ? wzrost : null) : null;
    const crcl = (scr !== null && s.plec && ageOk && wybMasa) ? Calc.cockcroftGault(scr, age, wybMasa.weight, s.plec) : null;
    const egfrOdindeks = (egfr !== null && bsa !== null) ? Calc.egfrOdindeksowany(egfr, bsa) : null;
    const crclNiekor = (scr !== null && s.plec && ageOk && masa !== null) ? Calc.cockcroftGault(scr, age, masa, s.plec) : null;
    const nerkowe = [
      ['Kreatynina', scr !== null ? scr.toFixed(2).replace('.', ',') + ' mg/dL' + ' (' + s.dataKreatyniny + ')' : '—'],
      ['Albuminuria', label('albuminuria', s.albuminuria) + (s.albuminuria === 'liczba' && s.uacr ? ' (UACR ' + s.uacr + ' ' + label('uacrJednostka', s.uacrJednostka) + ')' : '')],
      ['eGFR (CKD-EPI 2021)', egfr !== null ? Math.round(egfr) + ' ml/min/1,73 m² — ' + Calc.egfrBand(egfr).label : '—'],
      ['eGFR odindeksowany (BSA)', egfrOdindeks !== null ? Math.round(egfrOdindeks) + ' ml/min' : '—'],
      ['CrCL skorygowany (Cockcroft-Gault)', crcl !== null ? Math.round(crcl) + ' ml/min (masa ' + wybMasa.mode + ' ' + wybMasa.weight.toFixed(1).replace('.', ',') + ' kg) — ' + Calc.crclBand(crcl).label : '—'],
      ['CrCL (masa rzeczywista)', crclNiekor !== null ? Math.round(crclNiekor) + ' ml/min — ' + Calc.crclBand(crclNiekor).label : '—']
    ];
    out.push(sekcja('2. Choroby współistniejące', chRows));
    out.push(sekcja('3. Funkcja nerek', nerkowe));

    /* 4. Farmakoterapia */
    const ryzyko = G.Ryzyko.compute(s);
    const lekiRows = (s.leki || []).map(function (l) {
      return ['<b>' + (l.nazwa || '(bez nazwy)') + '</b>' + (l.moc ? ' ' + l.moc : '') + (l.postac ? ' ' + l.postac : ''),
        label('tryb', l.tryb) + (l.schemat ? ' (' + l.schemat + ')' : '') + (l.wskazanie ? ' — ' + l.wskazanie : '') +
        (l.atc ? ' [ATC: ' + l.atc + ']' : '') +
        (l.grupy && l.grupy.length ? ' [grupy: ' + l.grupy.map(function (g2) { return (G.GRUPA_LABEL && G.GRUPA_LABEL[g2]) || g2; }).join(', ') + ']' : '')];
    });
    const farmExtra = h('div', {}, [
      h('div', { class: 'r-podsekcja', text: 'Podsumowanie ryzyka:' }),
      ryzyko.reakcja.length ? h('div', { class: 'flag flag-alert', style: { marginTop: '6px' } }, [
        h('div', { class: 'flag-title', text: 'Wymaga reakcji' }),
        h('div', { class: 'flag-text', text: ryzyko.reakcja.join('; ') })
      ]) : null,
      ryzyko.uwaga.length ? h('div', { class: 'flag flag-warn', style: { marginTop: '6px' } }, [
        h('div', { class: 'flag-title', text: 'Uwaga farmaceutyczna' }),
        h('div', { class: 'flag-text', text: ryzyko.uwaga.join('; ') })
      ]) : null,
      ryzyko.info.length ? h('div', { class: 'flag flag-info', style: { marginTop: '6px' } }, [
        h('div', { class: 'flag-title', text: 'Informacja' }),
        h('div', { class: 'flag-text', text: ryzyko.info.join('; ') })
      ]) : null,
      epikryzaBlock(s.epikryzaFarmakoterapii, '')
    ]);
    out.push(sekcja('4. Farmakoterapia', lekiRows, farmExtra));

    /* 5. Przestrzeganie zaleceń (MARS-5) */
    const mars = G.Mars5.score(s.mars5);
    out.push(sekcja('5. Przestrzeganie zaleceń (MARS-5)', [
      ['Wynik MARS-5', mars ? mars.sum + ' / 25 (średnia ' + mars.mean.toFixed(1).replace('.', ',') + ' / 5)' : '—'],
      ['Interpretacja', mars ? mars.interp.label : '—'],
      ['Z czym są problemy', str(s.marsProblemy)],
      ['Jak pomóc pacjentowi', str(s.pomocAdherence)]
    ]));

    /* 6. Ocena bólu */
    const ob = s.ocenaBolu || {};
    const obRows = [
      ['Data oceny', str(ob.data)],
      ['Skala', label('skalaOcena', ob.skala)],
      ['NRS aktualne / średnie', (ob.nrsAktualne !== '' ? ob.nrsAktualne : '—') + ' / ' + (ob.nrsSrednie !== '' ? ob.nrsSrednie : '—')],
      ['Wpływ: nastrój / sen / funkcjonowanie / praca',
        label('wplyw', (ob.wplyw || {}).nastroj) + ' / ' + label('wplyw', (ob.wplyw || {}).sen) + ' / ' + label('wplyw', (ob.wplyw || {}).funkcjonowanie) + ' / ' + label('wplyw', (ob.wplyw || {}).praca)],
      ['Lokalizacja', skroty('obLokalizacje', ob.lokalizacja) + (ob.lokalizacjaOpis ? ' (' + ob.lokalizacjaOpis + ')' : '')],
      ['Charakter', skroty('obCharakter', ob.charakter)],
      ['Przebieg', label('obPrzebieg', ob.przebieg)],
      ['Leki stosowane z powodu bólu', lekNazwy(s.leki, ob.lekiNaBol)],
      ['Czy leczenie zmniejsza ból', label('zmniejsza', ob.leczenieZmniejsza)]
    ];
    out.push(sekcja('6. Ocena bólu', obRows, h('div', {}, [
      priorytetyBlock(ob.priorytety),
      epikryzaBlock(ob.epikryza, '')
    ])));

    /* 7. Kontrola bólu */
    const kb = s.kontrolaBolu || {};
    const kbRows = [
      ['Data kontroli', str(kb.data)],
      ['Poprzednia ocena', ob.data || ob.nrsAktualne !== '' || ob.nrsSrednie !== ''
        ? 'Data: ' + (ob.data || '—') + ', skala: ' + label('skalaOcena', ob.skala) + ', NRS aktualne ' + (ob.nrsAktualne || '—') + ', średnie ' + (ob.nrsSrednie || '—') : '—'],
      ['Skala użyta w kontroli', label('skalaTryb', kb.skalaTryb) + (kb.skalaTryb === 'inna' && kb.skalaUzasadnienie ? ' (' + kb.skalaUzasadnienie + ')' : '')],
      ['NRS: aktualne / średnie / spoczynek / ruch',
        (kb.nrsAktualne || '—') + ' / ' + (kb.nrsSrednie || '—') + ' / ' + (kb.nrsSpoczynek || '—') + ' / ' + (kb.nrsRuch || '—')],
      ['Ulga po leczeniu', label('ulga', kb.ulga)],
      ['Satysfakcja', label('satysfakcja', kb.satysfakcja)],
      ['Kontrola między dawkami', label('miedzy', kb.miedzyDawkami) + (kb.miedzyDawkami === 'nie' && kb.miedzyDawkamiOpis ? ' — ' + kb.miedzyDawkamiOpis : '')],
      ['Działania niepożądane', kb.dzialaniaNiepozadane === 'tak' ? skroty('dnLista', kb.dnLista) + ' (korygowane: ' + label('dnKorygowane', kb.dnKorygowane) + ')' : label('dnOdp', kb.dzialaniaNiepozadane)],
      ['Zmiana stosowania leków', label('zmiana', kb.stosowanieZmiana) + (kb.stosowanieZmiana === 'tak' && kb.stosowanieZmianaOpis ? ' — ' + kb.stosowanieZmianaOpis : '')],
      ['Status kontroli bólu', label('statusKontroli', kb.statusKontroli)],
      ['Dalsze postępowanie', str(kb.dalszePostepowanie)]
    ];
    out.push(sekcja('7. Kontrola bólu', kbRows, epikryzaBlock(kb.epikryza, '')));

    /* 8. Ból głowy */
    const bg = s.bolGlowy || {};
    const bgRows = [
      ['Objawy alarmowe', G.BolGlowy && G.BolGlowy.anyTrueExceptBrak(bg.alarmowe) ? skroty('bgAlarmowe', bg.alarmowe) : 'brak'],
      ['Lokalizacja', skroty('bgLokalizacje', bg.lokalizacja)],
      ['Charakter', skroty('bgCharakter', bg.charakterB)],
      ['Nasilenie (NRS)', bg.nrs !== '' ? bg.nrs + '/10' : '—'],
      ['Aktywność fizyczna nasila ból', label('bgAktywnosc', bg.aktywnoscNasila)],
      ['Czas trwania epizodu', label('bgCzasTrwania', bg.czasTrwania)],
      ['Częstość', bg.dniWMiesiacu !== '' ? bg.dniWMiesiacu + ' dni/mies.' : '—'],
      ['Od jakiego czasu', bg.odKiedyIle !== '' ? bg.odKiedyIle + ' ' + (bg.odKiedyJednostka === 'lata' ? 'lat' : 'mies.') : '—'],
      ['Objawy towarzyszące', skroty('bgObjawy', bg.objawy)],
      ['Wyzwalacze', skroty('bgWyzwalacze', bg.wyzwalacze)],
      ['Co przynosi ulgę', skroty('bgUlga', bg.ulga)],
      ['Dni stosowania leków: analgetyki / złożone / tryptany / opioidy',
        ((bg.mohDni || {}).paracetamolNlpzAsa || '—') + ' / ' + ((bg.mohDni || {}).zlozone || '—') + ' / ' + ((bg.mohDni || {}).tryptany || '—') + ' / ' + ((bg.mohDni || {}).opioidyKodeina || '—')],
      ['Leki wg kategorii MOH (z listy)',
        ['paracetamolNlpzAsa', 'zlozone', 'tryptany', 'opioidyKodeina']
          .filter(function (k) { return (bg.mohLeki || {})[k]; })
          .map(function (k) { return (bg.mohLeki || {})[k]; })
          .join(' | ') || '—'],
      ['Podejrzenie nadużywania leków', label('bgMohOcena', bg.mohOcena)],
      ['Interpretacja', label('bgInterpretacja', bg.interpretacja)],
      ['Edukacja', skroty('bgEdukacja', bg.edukacja)]
    ];
    out.push(sekcja('8. Ból głowy', bgRows, epikryzaBlock(bg.epikryza, '')));

    /* 9. Migrena (tylko gdy wypełniona) */
    const mg = s.migrena || {};
    if (hasAny(mg)) {
      const mgRows = [
        ['Rozpoznanie', label('mgRozpoznana', mg.rozpoznana)],
        ['Aura', (skroty('mgAura', mg.aura) || '—') +
          (Object.keys(mg.aura || {}).some(function (k) { return k !== 'nw' && mg.aura[k]; })
            ? ' (' + label('mgAuraCzas', mg.auraCzas) + ')' : '')],
        ['Aura — objawy wymagające ostrożności', skroty('mgAuraOst', mg.auraOstroznosc)],
        ['Leki doraźne', lekNazwy(s.leki, mg.lekiDorzane)],
        ['Wczesne przyjęcie leku', label('mgWczesnie', mg.wczesnieLek)],
        ['Skuteczność po 2 h', label('mgSkutecznosc', mg.skutecznosc2h)],
        ['Nawrót w 24–48 h', label('mgNawrot', mg.nawrot)],
        ['Wczesne wymioty', label('mgWymioty', mg.wymioty)],
        ['Profilaktyka — kryteria', skroty('mgProfKryteria', mg.profilaktykaKryteria)],
        ['Profilaktyka stosowana', label('mgProfStos', mg.profilaktykaStosowana) + (mg.profilaktykaStosowana === 'tak'
          ? ' — lek: ' + ((mg.profilaktykaSzczegoly || {}).lek || '—') + ', dawka: ' + ((mg.profilaktykaSzczegoly || {}).dawka || '—') + ', od: ' + ((mg.profilaktykaSzczegoly || {}).odkiedy || '—') + ', regularnie: ' + ((mg.profilaktykaSzczegoly || {}).regularnie === 'tak' ? 'tak' : (mg.profilaktykaSzczegoly || {}).regularnie === 'nie' ? 'nie' : '—') : '')],
        ['Efekt profilaktyki', label('mgProfEfekt', mg.profilaktykaEfekt)],
        ['Klasyfikacja robocza', str(mg.klasyfikacja)],
        ['Rekomendowany dalszy krok', label('mgKrok', mg.dalszyKrok)]
      ];
      out.push(sekcja('9. Moduł migrenowy', mgRows, epikryzaBlock(mg.epikryza, '')));
    }

    /* 10. Globalne flagi */
    out.push(sekcja('10. Alerty i flagi', [], flagaLista(G.Flags.compute(s))));

    return out;
  }

  /* ---- Widok skrócony ---- */
  function renderSkrocony(s) {
    const Calc = G.Calc;
    const out = [];
    const flagi = G.Flags.compute(s).filter(function (f) { return f.sev !== 'info'; });

    const mars = G.Mars5.score(s.mars5);
    const ryzyko = G.Ryzyko.compute(s);

    const wiersze = [];
    const wiekP = Calc.ageFromBirthDate(s.dataUrodzenia);
    wiersze.push(['Pacjent', (s.dataUrodzenia ? (wiekP !== null ? wiekP + ' lat, ' : s.dataUrodzenia + ', ') : '') + label('plec', s.plec) + (s.masa ? ', ' + s.masa + ' kg' : '') + (s.wzrost ? ', ' + s.wzrost + ' cm' : '')]);
    wiersze.push(['MARS-5', mars ? mars.sum + ' / 25 — ' + mars.interp.label : '—']);
    if (s.marsProblemy) wiersze.push(['MARS-5 — z czym są problemy', s.marsProblemy]);
    if (ryzyko.reakcja.length) wiersze.push(['Ryzyko farmakoterapii — wymaga reakcji', ryzyko.reakcja.join('; ')]);
    if (ryzyko.uwaga.length) wiersze.push(['Ryzyko farmakoterapii — uwagi', ryzyko.uwaga.join('; ')]);
    const ob = s.ocenaBolu || {};
    const kb = s.kontrolaBolu || {};
    if (kb.statusKontroli) wiersze.push(['Kontrola bólu — status', label('statusKontroli', kb.statusKontroli)]);
    if (kb.dalszePostepowanie) wiersze.push(['Kontrola bólu — dalsze postępowanie', kb.dalszePostepowanie]);
    const bg = s.bolGlowy || {};
    if (bg.interpretacja) wiersze.push(['Ból głowy — interpretacja', label('bgInterpretacja', bg.interpretacja)]);
    if (bg.mohOcena) wiersze.push(['Ból głowy — ryzyko MOH', label('bgMohOcena', bg.mohOcena)]);
    const mg = s.migrena || {};
    if (hasAny(mg)) {
      if (mg.klasyfikacja) wiersze.push(['Migrena — klasyfikacja', mg.klasyfikacja]);
      if (mg.dalszyKrok) wiersze.push(['Migrena — dalszy krok', label('mgKrok', mg.dalszyKrok)]);
    }
    out.push(sekcja('Podsumowanie', wiersze, flagaLista(flagi)));

    /* Epikryzy */
    const ep = [];
    if (s.epikryzaFarmakoterapii) ep.push(['Farmakoterapia', s.epikryzaFarmakoterapii]);
    if (ob.epikryza) ep.push(['Ocena bólu', ob.epikryza]);
    if (kb.epikryza) ep.push(['Kontrola bólu', kb.epikryza]);
    if (bg.epikryza) ep.push(['Ból głowy', bg.epikryza]);
    if (mg.epikryza && hasAny(mg)) ep.push(['Migrena', mg.epikryza]);
    if (ep.length) {
      out.push(h('div', { class: 'raport-sekcja' }, [
        h('h3', { text: 'Epikryzy modułów' }),
        ep.map(function (r) { return epikryzaBlock(r[1], r[0]); })
      ]));
    }

    return out;
  }

  /* ---- Build / apply ---- */
  function build() {
    return [
      h('div', { class: 'raport-toolbar' }, [
        h('button', { class: 'btn', type: 'button', id: 'btn-raport-pelny', text: 'Pełny raport' }),
        h('button', { class: 'btn', type: 'button', id: 'btn-raport-skrocony', text: 'Skrócony raport' }),
        h('button', { class: 'btn btn-primary', type: 'button', id: 'btn-drukuj', text: 'Drukuj / zapisz PDF' }),
        h('span', { class: 'raport-sep' }),
        h('button', { class: 'btn btn-primary', type: 'button', id: 'btn-eksport', text: 'Eksport JSON' })
      ]),
      h('div', { id: 'raport-widok' }),
      h('div', { class: 'card', style: { marginTop: '16px' } }, [
        h('h2', {}, [h('span', { class: 'num', text: '8' }), 'Epikryza końcowa']),
        h('div', { class: 'field' }, [
          h('label', { class: 'ctl' }, ['Wnioski końcowe i zalecenia']),
          h('textarea', {
            rows: '5',
            placeholder: 'Podsumuj najważniejsze ustalenia, ryzyka, zalecenia dla pacjenta i dalsze postępowanie.',
            'data-state': 'epikryzaKoncowa'
          })
        ])
      ])
    ];
  }

  function handleClick(e) {
    const t = e.target;
    if (t.closest && t.closest('#btn-drukuj')) {
      window.print();
      return;
    }
    if (t.closest && t.closest('#btn-eksport')) {
      if (G.Akcje) G.Akcje.eksport();
      return;
    }
    if (t.closest && t.closest('#btn-raport-pelny')) {
      widok = 'pelny';
      apply();
      return;
    }
    if (t.closest && t.closest('#btn-raport-skrocony')) {
      widok = 'skrocony';
      apply();
    }
  }

  function init(container) {
    root = container;
    const cards = build();
    cards.forEach(function (c) { root.appendChild(c); });
    root.removeEventListener('click', handleClick);
    root.removeEventListener('input', UI.handleStateInput);
    root.removeEventListener('change', UI.handleStateInput);
    root.addEventListener('click', handleClick);
    root.addEventListener('input', UI.handleStateInput);
    root.addEventListener('change', UI.handleStateInput);
  }

  function apply() {
    if (!root) return;
    if (!root.querySelector('#raport-widok')) return;

    const s = G.State.get();

    UI.sync(root);

    const kontener = root.querySelector('#raport-widok');
    kontener.innerHTML = '';
    const els = (widok === 'skrocony') ? renderSkrocony(s) : renderPelny(s);
    els.forEach(function (el) { kontener.appendChild(el); });

    root.querySelector('#btn-raport-pelny').classList.toggle('btn-primary', widok === 'pelny');
    root.querySelector('#btn-raport-skrocony').classList.toggle('btn-primary', widok === 'skrocony');
  }

  G.Tab8 = { init: init, apply: apply };
})();
