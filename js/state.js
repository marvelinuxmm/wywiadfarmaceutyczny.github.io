/* Centralny stan aplikacji + powiadamianie o zmianach. Bez zapisu na dysku. */
(function () {
  const G = typeof window !== 'undefined' ? window : globalThis;

  function defaultState() {
    return {
      dataUrodzenia: '',
      plec: '', // 'k' | 'm'
      masa: '',
      wzrost: '',
      ciaza: '', // 'tak' | 'nie' | 'nda' | 'nw'
      choroby: {
        sercowo: false,
        metaboliczne: false,
        nerki_watroba: false, // wyświetlana = watroba || pchn
        przewodpokarmowy: false,
        oddechowe: false,
        neurologia: false,
        psychiczne: false,
        kostno: false,
        inne: false,
        watroba: false, // wewnętrzny
        pchn: false, // wewnętrzny
        brak: false,
        niewiem: false
      },
      chorobySzczegolowe: {}, // { 'sc_nadcisnienie': true, ... }
      inneChoroby: {}, // { 'sercowo': '…', 'metaboliczne': '…', ... }
      kreatynina: '',
      jednostkaKreatyniny: 'mgdl', // 'mgdl' | 'umol'
      dataKreatyniny: '',
      albuminuria: 'brak', // 'brak' | 'a1' | 'a2' | 'a3' | 'liczba'
      uacr: '',
      uacrJednostka: 'mgg', // 'mgg' | 'mgmmol'
      psychAktywny: '', // 'tak' | 'nie' | 'nw'
      psychOpis: '',
      epikryza: '',
      /* Zakładka 2 — farmakoterapia */
      leki: [], // [{ nazwa, moc, postac, tryb, schemat, wskazanie, komentarze, grupy[] }]
      odpowiedzi: {}, // { 'sc.antykoagulanty': 'tak'|'nie'|'nw', ... }
      statusFarmakoterapii: '',
      przyczyny: {
        powielenie: false,
        dorazne: false,
        dawki: false,
        rownolegle: false,
        dzialania: false,
        polaczenie: false,
        nieadekwatny: false,
        inne: false
      },
      epikryzaFarmakoterapii: '',
      /* Zakładka 3 — MARS-5 */
      mars5: { m1: '', m2: '', m3: '', m4: '', m5: '' },
      pomocAdherence: '',
      /* Zakładka 4 — Ocena bólu */
      ocenaBolu: {
        data: '',
        skala: 'nrs',
        nrsAktualne: '',
        nrsSrednie: '',
        wplyw: { nastroj: '', sen: '', funkcjonowanie: '', praca: '' },
        lokalizacja: {},
        lokalizacjaOpis: '',
        charakter: {},
        przebieg: '',
        leczenieZmniejsza: '',
        lekiNaBol: [],
        interpretacja: '',
        epikryza: ''
      },
      /* Zakładka 5 — Kontrola bólu */
      kontrolaBolu: {
        data: '',
        skalaTryb: 'ta-sama',
        skalaUzasadnienie: '',
        nrsAktualne: '',
        nrsSrednie: '',
        nrsSpoczynek: '',
        nrsRuch: '',
        ulga: '',
        satysfakcja: '',
        miedzyDawkami: '',
        miedzyDawkamiOpis: '',
        dzialaniaNiepozadane: '',
        dnLista: {},
        dnKorygowane: '',
        stosowanieZmiana: '',
        stosowanieZmianaOpis: '',
        statusKontroli: '',
        dalszePostepowanie: '',
        epikryza: ''
      },
      /* Zakładka 6 — Ból głowy */
      bolGlowy: {
        alarmowe: {},
        lokalizacja: {},
        charakterB: {},
        nrs: '',
        nasilenie: '',
        aktywnoscNasila: '',
        czasTrwania: '',
        dniWMiesiacu: '',
        miesiace: '',
        czestoscKlasa: '',
        objawy: {},
        wyzwalacze: {},
        ulga: {},
        mohDni: { paracetamolNlpzAsa: '', zlozone: '', tryptany: '', opioidyKodeina: '' },
        mohOcena: '',
        interpretacja: '',
        edukacja: {},
        epikryza: ''
      },
      /* Zakładka 7 — Moduł migrenowy */
      migrena: {
        rozpoznana: '',
        dniBoluGlowy: '',
        dniMigrenowe: '',
        dniDorzane: '',
        czasTrwania: '',
        charakter: {},
        objawy: {},
        prodrom: {},
        aura: '',
        auraCzas: '',
        auraOstroznosc: {},
        czFlagi: {},
        wplyw: {},
        dniOgraniczonejAktywnosci: '',
        lekiDorzane: [],
        wczesnieLek: '',
        skutecznosc2h: '',
        nawrot: '',
        wymioty: '',
        mohDni: { paracetamolNlpz: '', tryptany: '', zlozone: '', opioidy: '', inne: '' },
        mohStatus: '',
        profilaktykaKryteria: {},
        profilaktykaStosowana: '',
        profilaktykaSzczegoly: { lek: '', dawka: '', odkiedy: '', regularnie: '' },
        profilaktykaEfekt: '',
        edukacja: {},
        klasyfikacja: '',
        dalszyKrok: '',
        epikryza: ''
      },
      /* Zakładka 8 — Podsumowanie */
      epikryzaKoncowa: ''
    };
  }

  let state = defaultState();
  const listeners = [];

  /* Ścieżka kropkowa, np. 'choroby.pchn' lub 'odpowiedzi.pp.objawy'
     (klucze obiektów mogą same zawierać kropki — wybieramy najdłuższe dopasowanie). */
  function resolve(cur, parts) {
    let idx = 0;
    let parent = null;
    let key = null;
    while (idx < parts.length && cur != null) {
      let matched = -1;
      for (let len = parts.length - idx; len >= 1; len--) {
        const k = parts.slice(idx, idx + len).join('.');
        if (k in cur) { matched = len; key = k; break; }
      }
      if (matched === -1) break;
      parent = cur;
      cur = cur[key];
      idx += matched;
    }
    return { cur: cur, idx: idx, parent: parent, key: key };
  }

  function getPath(obj, path) {
    const parts = String(path).split('.');
    const r = resolve(obj, parts);
    return r.idx === parts.length ? r.cur : undefined;
  }

  function notify() {
    for (let i = 0; i < listeners.length; i++) listeners[i](state);
  }

  function merge(src) {
    const d = defaultState();
    if (src == null || typeof src !== 'object') return d;
    const scalars = ['dataUrodzenia', 'plec', 'masa', 'wzrost', 'ciaza', 'kreatynina', 'jednostkaKreatyniny',
      'dataKreatyniny', 'albuminuria', 'uacr', 'uacrJednostka', 'psychAktywny',
      'psychOpis', 'epikryza', 'statusFarmakoterapii', 'epikryzaFarmakoterapii',
      'pomocAdherence', 'epikryzaKoncowa'];
    scalars.forEach(function (k) {
      if (typeof src[k] === 'string' || typeof src[k] === 'number') d[k] = src[k];
    });
    if (src.choroby && typeof src.choroby === 'object') {
      Object.keys(d.choroby).forEach(function (k) {
        if (typeof src.choroby[k] === 'boolean') d.choroby[k] = src.choroby[k];
      });
    }
    if (src.chorobySzczegolowe && typeof src.chorobySzczegolowe === 'object') {
      Object.keys(src.chorobySzczegolowe).forEach(function (k) {
        if (typeof src.chorobySzczegolowe[k] === 'boolean') d.chorobySzczegolowe[k] = src.chorobySzczegolowe[k];
      });
    }
    if (src.inneChoroby && typeof src.inneChoroby === 'object') {
      Object.keys(src.inneChoroby).forEach(function (k) {
        if (typeof src.inneChoroby[k] === 'string') d.inneChoroby[k] = src.inneChoroby[k];
      });
    }
    /* Migracja: dawna sekcja 6 (psychOpis) → pole „Inne” grupy psychicznej */
    if (typeof src.psychOpis === 'string' && src.psychOpis && !(d.inneChoroby.psychiczne)) {
      d.inneChoroby.psychiczne = src.psychOpis;
    }
    if (src.przyczyny && typeof src.przyczyny === 'object') {
      Object.keys(d.przyczyny).forEach(function (k) {
        if (typeof src.przyczyny[k] === 'boolean') d.przyczyny[k] = src.przyczyny[k];
      });
    }
    if (src.odpowiedzi && typeof src.odpowiedzi === 'object') {
      Object.keys(src.odpowiedzi).forEach(function (k) {
        if (typeof src.odpowiedzi[k] === 'string') d.odpowiedzi[k] = src.odpowiedzi[k];
      });
    }
    if (src.mars5 && typeof src.mars5 === 'object') {
      ['m1', 'm2', 'm3', 'm4', 'm5'].forEach(function (k) {
        if (typeof src.mars5[k] === 'string') d.mars5[k] = src.mars5[k];
      });
    }
    if (Array.isArray(src.leki)) {
      d.leki = src.leki.filter(function (r) { return r && typeof r === 'object'; }).map(function (r) {
        const str = function (v) { return (typeof v === 'string' || typeof v === 'number') ? String(v) : ''; };
        return {
          id: (typeof r.id === 'number' && isFinite(r.id)) ? r.id : null,
          nazwa: str(r.nazwa),
          moc: str(r.moc),
          postac: str(r.postac),
          tryb: (r.tryb === 'dorazne' || r.tryb === 'przewlekle') ? r.tryb : '',
          schemat: str(r.schemat),
          wskazanie: str(r.wskazanie),
          komentarze: str(r.komentarze),
          grupy: Array.isArray(r.grupy) ? r.grupy.filter(function (g) { return typeof g === 'string'; }) : []
        };
      });
      let maxId = 0;
      d.leki.forEach(function (r) { if (typeof r.id === 'number' && r.id > maxId) maxId = r.id; });
      d.leki.forEach(function (r) { if (r.id === null) r.id = ++maxId; });
    }

    /* Generyczne scalanie poddrzew zakładek 4–6 */
    mergeShape(d.ocenaBolu, src.ocenaBolu, {
      data: 'str', skala: 'str', nrsAktualne: 'str', nrsSrednie: 'str',
      wplyw: { nastroj: 'str', sen: 'str', funkcjonowanie: 'str', praca: 'str' },
      lokalizacja: 'bool', lokalizacjaOpis: 'str', charakter: 'bool', przebieg: 'str',
      leczenieZmniejsza: 'str', lekiNaBol: 'arr', interpretacja: 'str', epikryza: 'str'
    });
    mergeShape(d.kontrolaBolu, src.kontrolaBolu, {
      data: 'str', skalaTryb: 'str', skalaUzasadnienie: 'str',
      nrsAktualne: 'str', nrsSrednie: 'str', nrsSpoczynek: 'str', nrsRuch: 'str',
      ulga: 'str', satysfakcja: 'str', miedzyDawkami: 'str', miedzyDawkamiOpis: 'str',
      dzialaniaNiepozadane: 'str', dnLista: 'bool', dnKorygowane: 'str',
      stosowanieZmiana: 'str', stosowanieZmianaOpis: 'str', statusKontroli: 'str',
      dalszePostepowanie: 'str', epikryza: 'str'
    });
    mergeShape(d.bolGlowy, src.bolGlowy, {
      alarmowe: 'bool', lokalizacja: 'bool', charakterB: 'bool',
      nrs: 'str', nasilenie: 'str', aktywnoscNasila: 'str', czasTrwania: 'str',
      dniWMiesiacu: 'str', miesiace: 'str', czestoscKlasa: 'str',
      objawy: 'bool', wyzwalacze: 'bool', ulga: 'bool',
      mohDni: { paracetamolNlpzAsa: 'str', zlozone: 'str', tryptany: 'str', opioidyKodeina: 'str' },
      mohOcena: 'str', interpretacja: 'str', edukacja: 'bool', epikryza: 'str'
    });
    mergeShape(d.migrena, src.migrena, {
      rozpoznana: 'str', dniBoluGlowy: 'str', dniMigrenowe: 'str', dniDorzane: 'str', czasTrwania: 'str',
      charakter: 'bool', objawy: 'bool', prodrom: 'bool',
      aura: 'str', auraCzas: 'str', auraOstroznosc: 'bool', czFlagi: 'bool',
      wplyw: 'bool', dniOgraniczonejAktywnosci: 'str', lekiDorzane: 'arr',
      wczesnieLek: 'str', skutecznosc2h: 'str', nawrot: 'str', wymioty: 'str',
      mohDni: { paracetamolNlpz: 'str', tryptany: 'str', zlozone: 'str', opioidy: 'str', inne: 'str' },
      mohStatus: 'str',
      profilaktykaKryteria: 'bool', profilaktykaStosowana: 'str',
      profilaktykaSzczegoly: { lek: 'str', dawka: 'str', odkiedy: 'str', regularnie: 'str' },
      profilaktykaEfekt: 'str', edukacja: 'bool',
      klasyfikacja: 'str', dalszyKrok: 'str', epikryza: 'str'
    });
    return d;
  }

  /* shape: { klucz: 'str' | 'bool' | 'arr' | { zagnieżdżone } } */
  function mergeShape(d, src, shape) {
    if (!src || typeof src !== 'object') return;
    Object.keys(shape).forEach(function (k) {
      const t = shape[k];
      if (typeof t === 'object') {
        mergeShape(d[k], src[k], t);
      } else if (t === 'str') {
        if (typeof src[k] === 'string') d[k] = src[k];
      } else if (t === 'bool') {
        if (src[k] && typeof src[k] === 'object') {
          Object.keys(src[k]).forEach(function (key) {
            if (typeof src[k][key] === 'boolean') d[k][key] = src[k][key];
          });
        }
      } else if (t === 'arr') {
        if (Array.isArray(src[k])) {
          d[k] = src[k].filter(function (v) { return typeof v === 'number' || typeof v === 'string'; });
        }
      }
    });
  }

  G.State = {
    get: function () { return state; },
    getPath: function (path) { return getPath(state, path); },
    reset: function () { state = defaultState(); },
    replace: function (next) { state = next; },
    merge: merge,
    set: function (path, value) {
      const parts = String(path).split('.');
      const r = resolve(state, parts);
      if (r.idx === parts.length) {
        r.parent[r.key] = value;
      } else {
        r.cur[parts.slice(r.idx).join('.')] = value;
      }
      notify();
    },
    onChange: function (fn) { listeners.push(fn); },
    notify: notify
  };
})();
