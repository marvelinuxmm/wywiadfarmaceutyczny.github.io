/* Moduł bazy leków.
   - REJESTR_LEKOW (js/data/leki-rejestr.js, generowany z rejestru produktów leczniczych CSV)
     — pełna lista produktów: nazwa handlowa, moc, postać, kod ATC, nazwa powszechnie stosowana.
   - Mapowanie ATC → grupy ryzyka: na podstawie kodu ATC leki są grupowane
     (NLPZ, paracetamol, opioid, gabapentynoid, benzodiazepina, z-lek, IPP, ASA,
     antyagregant, antykoagulant, SSRI, GKS, sedatywny).
   - Aliasy: polskie nazwy substancji i znane nazwy handlowe (rejestr używa nazw
     łacińskich, np. „Ibuprofenum”), uzupełniające dopasowanie po nazwie.
   - SCHEMATY_DAWKOWANIA: lista podpowiedzi dawkowania (pole zawsze dopuszcza
     wpisanie własnej wartości).
   API: Leki.znajdzGrupy, grupyZAtc, szukaj, etykietaProduktu, dopasujProdukt, normalize. */
(function () {
  const G = typeof window !== 'undefined' ? window : globalThis;

  const GRUPA_LABEL = {
    'NLPZ': 'NLPZ',
    'paracetamol': 'Paracetamol',
    'opioid': 'Opioid',
    'gabapentynoid': 'Gabapentynoid',
    'benzodiazepina': 'Benzodiazepina',
    'z-lek': 'Z-lek (nasenny)',
    'IPP': 'IPP',
    'ASA': 'ASA',
    'antyagregant': 'Antyagregant',
    'antykoagulant': 'Antykoagulant',
    'SSRI': 'SSRI',
    'GKS': 'GKS (steryd)',
    'sedatywny': 'Lek sedatywny'
  };

  const GRUPA_IDS = Object.keys(GRUPA_LABEL);

  /* Aliasy nazw (polskie/angielskie nazwy handlowe i substancji) → grupy.
     Rejestr zawiera łacińskie nazwy substancji („Ibuprofenum”), dlatego ta
     tabela uzupełnia dopasowanie o polskie i powszechnie znane nazwy. */
  const ALIASY = [
    /* NLPZ */
    { nazwa: 'Ibuprofen', substancja: 'ibuprofen', grupa: ['NLPZ'] },
    { nazwa: 'Ibuprom', substancja: 'ibuprofen', grupa: ['NLPZ'] },
    { nazwa: 'Ibumax', substancja: 'ibuprofen', grupa: ['NLPZ'] },
    { nazwa: 'Nurofen', substancja: 'ibuprofen', grupa: ['NLPZ'] },
    { nazwa: 'Nurofen Forte', substancja: 'ibuprofen', grupa: ['NLPZ'] },
    { nazwa: 'Mefacit', substancja: 'kwas mefenamowy', grupa: ['NLPZ'] },
    { nazwa: 'Dicloberl', substancja: 'diklofenak', grupa: ['NLPZ'] },
    { nazwa: 'Voltaren', substancja: 'diklofenak', grupa: ['NLPZ'] },
    { nazwa: 'Olfen', substancja: 'diklofenak', grupa: ['NLPZ'] },
    { nazwa: 'Naproxen', substancja: 'naproksen', grupa: ['NLPZ'] },
    { nazwa: 'Nalgesin', substancja: 'naproksen', grupa: ['NLPZ'] },
    { nazwa: 'Ketonal', substancja: 'ketoprofen', grupa: ['NLPZ'] },
    { nazwa: 'Meloxicam', substancja: 'meloksykam', grupa: ['NLPZ'] },
    { nazwa: 'Celecoxib', substancja: 'celekoksyb', grupa: ['NLPZ'] },
    /* Paracetamol */
    { nazwa: 'Paracetamol', substancja: 'paracetamol', grupa: ['paracetamol'] },
    { nazwa: 'Apap', substancja: 'paracetamol', grupa: ['paracetamol'] },
    { nazwa: 'Panadol', substancja: 'paracetamol', grupa: ['paracetamol'] },
    { nazwa: 'Paracetamol Apofarm', substancja: 'paracetamol', grupa: ['paracetamol'] },
    /* Opioidy */
    { nazwa: 'Tramadol', substancja: 'tramadol', grupa: ['opioid'] },
    { nazwa: 'Poltram', substancja: 'tramadol', grupa: ['opioid'] },
    { nazwa: 'Tramal', substancja: 'tramadol', grupa: ['opioid'] },
    { nazwa: 'Kodeina', substancja: 'kodeina', grupa: ['opioid'] },
    { nazwa: 'Codeine', substancja: 'kodeina', grupa: ['opioid'] },
    { nazwa: 'OxyContin', substancja: 'oksykodon', grupa: ['opioid'] },
    { nazwa: 'Oxycodone', substancja: 'oksykodon', grupa: ['opioid'] },
    { nazwa: 'Morfina', substancja: 'morfina', grupa: ['opioid'] },
    { nazwa: 'MST Continus', substancja: 'morfina', grupa: ['opioid'] },
    { nazwa: 'Fentanyl', substancja: 'fentanyl', grupa: ['opioid'] },
    { nazwa: 'Buprenorphine', substancja: 'buprenorfina', grupa: ['opioid'] },
    { nazwa: 'Targin', substancja: 'oksykodon + nalokson', grupa: ['opioid'] },
    { nazwa: 'Tramadol + Paracetamol', substancja: 'tramadol + paracetamol', grupa: ['opioid', 'paracetamol'] },
    /* Gabapentynoidy */
    { nazwa: 'Pregabalin', substancja: 'pregabalina', grupa: ['gabapentynoid'] },
    { nazwa: 'Lyrica', substancja: 'pregabalina', grupa: ['gabapentynoid'] },
    { nazwa: 'Pregabalin Bluefish', substancja: 'pregabalina', grupa: ['gabapentynoid'] },
    { nazwa: 'Gabapentin', substancja: 'gabapentyna', grupa: ['gabapentynoid'] },
    { nazwa: 'Neurontin', substancja: 'gabapentyna', grupa: ['gabapentynoid'] },
    /* Benzodiazepiny */
    { nazwa: 'Diazepam', substancja: 'diazepam', grupa: ['benzodiazepina'] },
    { nazwa: 'Relanium', substancja: 'diazepam', grupa: ['benzodiazepina'] },
    { nazwa: 'Oxazepam', substancja: 'oksazepam', grupa: ['benzodiazepina'] },
    { nazwa: 'Lorazepam', substancja: 'lorazepam', grupa: ['benzodiazepina'] },
    { nazwa: 'Clonazepam', substancja: 'klonazepam', grupa: ['benzodiazepina'] },
    /* Z-leki */
    { nazwa: 'Zolpidem', substancja: 'zolpidem', grupa: ['z-lek'] },
    { nazwa: 'Stilnox', substancja: 'zolpidem', grupa: ['z-lek'] },
    { nazwa: 'Zopiclon', substancja: 'zopiklon', grupa: ['z-lek'] },
    /* IPP */
    { nazwa: 'Omeprazol', substancja: 'omeprazol', grupa: ['IPP'] },
    { nazwa: 'Prazolex', substancja: 'omeprazol', grupa: ['IPP'] },
    { nazwa: 'Helicid', substancja: 'omeprazol', grupa: ['IPP'] },
    { nazwa: 'Nexium', substancja: 'ezomeprazol', grupa: ['IPP'] },
    { nazwa: 'Pantoprazole', substancja: 'pantoprazol', grupa: ['IPP'] },
    { nazwa: 'Pantasop', substancja: 'pantoprazol', grupa: ['IPP'] },
    /* ASA / antyagreganty / antykoagulanty */
    { nazwa: 'Aspirin', substancja: 'kwas acetylosalicylowy', grupa: ['ASA', 'NLPZ'] },
    { nazwa: 'Polocard', substancja: 'kwas acetylosalicylowy', grupa: ['ASA', 'antyagregant'] },
    { nazwa: 'Acard', substancja: 'kwas acetylosalicylowy', grupa: ['ASA', 'antyagregant'] },
    { nazwa: 'Clopidogrel', substancja: 'klopidogrel', grupa: ['antyagregant'] },
    { nazwa: 'Plavix', substancja: 'klopidogrel', grupa: ['antyagregant'] },
    { nazwa: 'Ticagrelor', substancja: 'tikagrelor', grupa: ['antyagregant'] },
    { nazwa: 'Warfin', substancja: 'warfaryna', grupa: ['antykoagulant'] },
    { nazwa: 'Acenocumarol', substancja: 'acenokumarol', grupa: ['antykoagulant'] },
    { nazwa: 'Xarelto', substancja: 'rywaroksaban', grupa: ['antykoagulant'] },
    { nazwa: 'Eliquis', substancja: 'apiksaban', grupa: ['antykoagulant'] },
    { nazwa: 'Pradaxa', substancja: 'dabigatran', grupa: ['antykoagulant'] },
    { nazwa: 'Heparin', substancja: 'heparyna', grupa: ['antykoagulant'] },
    /* SSRI */
    { nazwa: 'Sertralina', substancja: 'sertralina', grupa: ['SSRI'] },
    { nazwa: 'Setaloft', substancja: 'sertralina', grupa: ['SSRI'] },
    { nazwa: 'Escitalopram', substancja: 'eskitalopram', grupa: ['SSRI'] },
    { nazwa: 'Lexapro', substancja: 'eskitalopram', grupa: ['SSRI'] },
    { nazwa: 'Fluoxetine', substancja: 'fluoksetyna', grupa: ['SSRI'] },
    { nazwa: 'Paroxetine', substancja: 'paroksetyna', grupa: ['SSRI'] },
    /* GKS */
    { nazwa: 'Metipred', substancja: 'metyloprednizolon', grupa: ['GKS'] },
    { nazwa: 'Encorton', substancja: 'prednizon', grupa: ['GKS'] },
    { nazwa: 'Dexamethasone', substancja: 'deksametazon', grupa: ['GKS'] },
    { nazwa: 'Hydrocortisone', substancja: 'hydrokortyzon', grupa: ['GKS'] }
  ];

  /* Mapowanie kodów ATC na grupy. Kolejność reguł ma znaczenie: najpierw
     dokładne kody, potem prefiksy (od najbardziej specyficznych). Pierwsza
     pasująca reguła wygrywa; kilka kodów w jednym polu ATC ("+") daje unię.
     Uwaga: leki sedatywne/psychotropowe mapowane są na grupę "sedatywny",
     z wyłączeniem litu (N05AN — stabilizator nastroju, nie sedatywny). */
  const ATC_GRUPY = [
    { kody: ['B01AC06'], grupy: ['ASA', 'antyagregant'] },
    { kody: ['N02BA01'], grupy: ['ASA', 'NLPZ'] },
    { kody: ['N03AE01'], grupy: ['benzodiazepina'] },
    { kody: ['N03AX12', 'N03AX16'], grupy: ['gabapentynoid'] },
    { kody: ['N06AX03', 'N06AX05', 'N06AX11'], grupy: ['sedatywny'] }, // mianseryna, trazodon, mirtazapina
    { prefiks: 'N02BF', grupy: ['gabapentynoid'] },
    { prefiks: 'M01A', grupy: ['NLPZ'] },
    { prefiks: 'M02A', grupy: ['NLPZ'] },
    { prefiks: 'N02BE', grupy: ['paracetamol'] },
    { prefiks: 'N02A', grupy: ['opioid'] },
    { prefiks: 'N07BC', grupy: ['opioid'] },
    { prefiks: 'R05DA', grupy: ['opioid'] },
    { prefiks: 'N01AH', grupy: ['opioid'] },
    /* Leki sedatywne i psychotropowe */
    /* Antypsychotyki o istotnym potencjale sedatywnym (fenotiazyny, butyrofenony,
       tioksanteny, klozapina/olanzapina/kwetiapina). Celowo pominięte klasy o
       mniejszym działaniu sedatywnym: N05AE (indole), N05AG, N05AL (benzamidy:
       sulpiryd, amisulpryd), N05AN (lit) i N05AX (arypiprazol, rysperydon,
       paliperydon, kariprazyna, brekspiprazol). */
    { prefiksy: ['N05AA', 'N05AB', 'N05AC', 'N05AD', 'N05AF', 'N05AH'], grupy: ['sedatywny'] },
    { prefiks: 'N05CD', grupy: ['benzodiazepina'] }, // benzodiazepiny nasenne (nitrazepam, temazepam, midazolam)
    { prefiks: 'N05CF', grupy: ['z-lek'] },
    { prefiks: 'N05BA', grupy: ['benzodiazepina'] },
    { prefiks: 'N05BB', grupy: ['sedatywny'] }, // hydroksyzyna
    { prefiks: 'N05CH', grupy: ['sedatywny'] }, // agonisty receptora melatoninowego
    { prefiks: 'N05CJ', grupy: ['sedatywny'] }, // antagoniści oreksyny (daridoreksant)
    { prefiks: 'N05CM', grupy: ['sedatywny'] }, // inne leki nasenne i uspokajające
    { prefiks: 'N06AA', grupy: ['sedatywny'] }, // trójpierścieniowe (amitryptylina, doksepina…)
    { prefiks: 'R06AA', grupy: ['sedatywny'] }, // przeciwhistaminowe I gen. (difenhydramina, doksylamina…)
    { prefiks: 'R06AD', grupy: ['sedatywny'] }, // fenotiazyny przeciwhistaminowe (prometazyna)
    /* Pozostałe grupy */
    { prefiks: 'A02BC', grupy: ['IPP'] },
    { prefiks: 'B01AC', grupy: ['antyagregant'] },
    { prefiks: 'B01AA', grupy: ['antykoagulant'] },
    { prefiks: 'B01AB', grupy: ['antykoagulant'] },
    { prefiks: 'B01AE', grupy: ['antykoagulant'] },
    { prefiks: 'B01AF', grupy: ['antykoagulant'] },
    { prefiks: 'B01AX', grupy: ['antykoagulant'] },
    { prefiks: 'N06AB', grupy: ['SSRI'] },
    { prefiks: 'H02AB', grupy: ['GKS'] }
  ];

  /* Lista podpowiedzi dawkowania — pole schematu pozwala też wpisać własną wartość. */
  const SCHEMATY_DAWKOWANIA = [
    '1-0-0', '1-0-1', '0-1-0', '0-0-1', '1-1-0', '1-1-1',
    '2-0-0', '0-0-2', '2-1-0', '2-2-2',
    '1×1', '1×2', '2×1', '2×2', '3×1', '3×2',
    'co 4 h', 'co 6 h', 'co 8 h', 'co 12 h', 'co 24 h',
    'rano', 'wieczorem', 'na noc', 'co drugi dzień',
    'doraźnie (w razie bólu)', 'w dni bólu głowy', '1 raz w tygodniu'
  ];

  function normalize(s) {
    return String(s || '').toLowerCase()
      .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e')
      .replace(/ł/g, 'l').replace(/ń/g, 'n').replace(/ó/g, 'o')
      .replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z')
      .trim();
  }

  function rejestr() {
    return Array.isArray(G.REJESTR_LEKOW) ? G.REJESTR_LEKOW : [];
  }

  /* Grupy dla pojedynczego kodu ATC (pierwsza pasująca reguła wygrywa). */
  function grupyZJednegoAtc(atc) {
    const a = String(atc || '').trim().toUpperCase();
    if (!a) return [];
    for (let i = 0; i < ATC_GRUPY.length; i++) {
      const rule = ATC_GRUPY[i];
      if (rule.kody && rule.kody.indexOf(a) !== -1) return rule.grupy.slice();
      if (rule.prefiks && a.indexOf(rule.prefiks) === 0) return rule.grupy.slice();
      if (rule.prefiksy && rule.prefiksy.some(function (p) { return a.indexOf(p) === 0; })) {
        return rule.grupy.slice();
      }
    }
    return [];
  }

  /* Grupy dla pola ATC, które może zawierać kilka kodów rozdzielonych "+" — unia. */
  function grupyZAtc(atc) {
    const out = [];
    String(atc || '').split(/[+\s]+/).forEach(function (kod) {
      grupyZJednegoAtc(kod).forEach(function (g) {
        if (out.indexOf(g) === -1) out.push(g);
      });
    });
    return out;
  }

  /* Etykieta wpisu rejestru do listy wyboru: "Nazwa (moc, postać)". */
  function etykietaProduktu(e) {
    if (!e) return '';
    let out = e[0] || '';
    const rest = [];
    if (e[1]) rest.push(e[1]);
    if (e[2]) rest.push(e[2]);
    if (rest.length) out += ' (' + rest.join(', ') + ')';
    return out;
  }

  /* Łacińskie końcówki nazw substancji odcinane przy dopasowaniu (Ibuprofenum → ibuprofen). */
  const LAC_KONCOWKI = '(hydrochloridum|hydrobromidum|natricum|kalicum|calcicum|magnesicum|zincum|ferrum|' +
    'citras|fumaras|maleas|tartras|succinas|acetas|sulfas|phosphas|nitras|carbonas|' +
    'chloridum|bromidum|iodidum|oxidum|salicylas|lactas|gluconas|stearas|lysinum|' +
    'monohydricum|dihydricum|trihydricum|hemihydricum|anhydricum|acidum|um|us|i|is|ae|a|as|at|e|o|en)$';
  const RE_LAC_KONCOWKI = new RegExp(LAC_KONCOWKI);

  /* Zestaw dopasowanych słów nazwy powszechnie stosowanej (warianty z odciętymi
     końcówkami), używany przez substancjaPasuje. */
  function tokenySubstancji(e) {
    const set = new Set();
    String(e[4] || '').split(/\s+/).forEach(function (tok) {
      const t = normalize(tok);
      if (!t) return;
      set.add(t);
      const s = t.replace(RE_LAC_KONCOWKI, '');
      if (s.length >= 3 && s !== t) set.add(s);
    });
    return set;
  }

  /* Każde słowo frazy musi pasować do któregoś słowa nazwy substancji. */
  function substancjaPasuje(st, f) {
    const slowa = f.split(/\s+/).filter(Boolean);
    if (!slowa.length) return false;
    return slowa.every(function (w) { return st.has(w); });
  }

  /* Indeks rejestru budowany leniwie: posortowana lista + znormalizowane nazwy,
     mapa etykiet, mapa nazw. */
  let indeks = null;
  function zbudujIndeks() {
    if (indeks) return indeks;
    const arr = rejestr();
    const byName = arr.slice().sort(function (x, y) {
      const a = normalize(x[0]);
      const b = normalize(y[0]);
      if (a !== b) return a < b ? -1 : 1;
      return (x[1] || '') < (y[1] || '') ? -1 : (x[1] || '') > (y[1] || '') ? 1 : 0;
    });
    const nn = byName.map(function (e) { return normalize(e[0]); });
    const st = byName.map(tokenySubstancji);
    const etykiety = new Map();
    const poNazwie = new Map();
    byName.forEach(function (e) {
      const l = etykietaProduktu(e);
      if (!etykiety.has(l)) etykiety.set(l, e);
      const klucz = normalize(e[0]);
      const istnieje = poNazwie.get(klucz);
      if (!istnieje || (!istnieje[3] && e[3])) poNazwie.set(klucz, e);
    });
    indeks = { byName: byName, nn: nn, st: st, etykiety: etykiety, poNazwie: poNazwie };
    return indeks;
  }

  /* Dolna granica przedziału nazw zaczynających się od prefiksu (lista posortowana). */
  function dolnaGranica(nn, f) {
    let lo = 0;
    let hi = nn.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (nn[mid] < f) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  /* Wyszukiwanie w rejestrze: prefiks nazwy handlowej (przedział w posortowanej
     liście), a gdy mało wyników — dopasowanie nazwy powszechnie stosowanej.
     Pusta fraza zwraca pierwsze pozycje (limit domyślnie 40). */
  function szukaj(fraza, limit) {
    const f = normalize(fraza);
    const lim = (typeof limit === 'number' && limit > 0) ? limit : 40;
    const i = zbudujIndeks();
    if (!f) return i.byName.slice(0, lim);
    const out = [];
    const lo = dolnaGranica(i.nn, f);
    for (let j = lo; j < i.byName.length && out.length < lim; j++) {
      if (i.nn[j].indexOf(f) !== 0) break;
      out.push(i.byName[j]);
    }
    if (out.length < lim) {
      for (let j = 0; j < i.byName.length && out.length < lim; j++) {
        if (substancjaPasuje(i.st[j], f) && out.indexOf(i.byName[j]) === -1) out.push(i.byName[j]);
      }
    }
    return out;
  }

  /* Wpis rejestru dla etykiety wybranej z listy (null, gdy to nie etykieta). */
  function dopasujProdukt(etykieta) {
    const i = zbudujIndeks();
    return i.etykiety.get(String(etykieta || '').trim()) || null;
  }

  /* Grupy dla podanej nazwy: aliasy → dokładna nazwa handlowa z rejestru →
     nazwa powszechnie stosowana (łac.) z rejestru. [] gdy brak. */
  function znajdzGrupy(nazwa) {
    const n = normalize(nazwa);
    if (!n) return [];
    for (let i = 0; i < ALIASY.length; i++) {
      const e = ALIASY[i];
      if (normalize(e.nazwa) === n || normalize(e.substancja) === n) return e.grupa.slice();
    }
    const idx = zbudujIndeks();
    const wpis = idx.poNazwie.get(n);
    if (wpis) return grupyZAtc(wpis[3]);
    for (let j = 0; j < idx.byName.length; j++) {
      if (substancjaPasuje(idx.st[j], n)) return grupyZAtc(idx.byName[j][3]);
    }
    return [];
  }

  G.GRUPA_LABEL = GRUPA_LABEL;
  G.GRUPA_IDS = GRUPA_IDS;
  G.SCHEMATY_DAWKOWANIA = SCHEMATY_DAWKOWANIA;
  G.Leki = {
    znajdzGrupy: znajdzGrupy,
    grupyZAtc: grupyZAtc,
    grupyZJednegoAtc: grupyZJednegoAtc,
    szukaj: szukaj,
    etykietaProduktu: etykietaProduktu,
    dopasujProdukt: dopasujProdukt,
    normalize: normalize,
    rejestr: rejestr
  };
})();
