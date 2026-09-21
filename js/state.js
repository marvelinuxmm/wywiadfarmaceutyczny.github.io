/* Centralny stan aplikacji + powiadamianie o zmianach. Bez zapisu na dysku. */
(function () {
  const G = typeof window !== 'undefined' ? window : globalThis;

  function defaultState() {
    return {
      dataUrodzenia: '',
      plec: '', // 'k' | 'm'
      masa: '',
      wzrost: '',
      cisnienieSkurczowe: '', // mmHg
      cisnienieRozkurczowe: '', // mmHg
      palenie: '', // 'tak' | 'nie' | 'nw'
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
      leki: [], // [{ nazwa, moc, postac, atc, tryb, schemat, wskazanie, komentarze, grupy[] }]
      odpowiedzi: {}, // { 'sc.antykoagulanty': 'tak'|'nie'|'nw', ... }
      epikryzaFarmakoterapii: '',
      /* Zakładka 3 — MARS-5 */
      mars5: { m1: '', m2: '', m3: '', m4: '', m5: '' },
      pomocAdherence: '',
      marsProblemy: '',
      /* Zakładka 4 — Ocena bólu */
      ocenaBolu: {
        data: '',
        skala: 'nrs',
        nrsAktualne: '',
        nrsSrednie: '',
        wplyw: { nastroj: '', sen: '', funkcjonowanie: '', praca: '' },
        halt: { q1: '', q2: '', q3: '', q4: '', q5: '' },
        lokalizacja: {},
        lokalizacjaOpis: '',
        charakter: {},
        przebieg: {}, // mapa: { staly: true, … } — wielokrotny wybór
        leczenieZmniejsza: '',
        lekiNaBol: [],
        priorytety: '',
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
        aktywnoscNasila: '',
        czasTrwania: '',
        dniWMiesiacu: '',
        odKiedyIle: '',
        odKiedyJednostka: 'miesiace',
        objawy: {},
        wyzwalacze: {},
        ulga: {},
        mohDni: { paracetamolNlpzAsa: '', zlozone: '', tryptany: '', opioidyKodeina: '' },
        mohLeki: { paracetamolNlpzAsa: '', zlozone: '', tryptany: '', opioidyKodeina: '' },
        mohOcena: '',
        interpretacja: {}, // mapa: { tth: true, migrena: true, … } — wielokrotny wybór
        edukacja: {},
        epikryza: ''
      },
      /* Zakładka 7 — Moduł migrenowy */
      migrena: {
        rozpoznana: '',
        prodrom: {},
        aura: {}, // mapa typów aury (7.3): { wzrokowa: true, … } — wielokrotny wybór
        auraCzas: '',
        auraOstroznosc: {},
        lekiDorzane: [],
        wczesnieLek: '',
        skutecznosc2h: '',
        nawrot: '',
        wymioty: '',
        profilaktykaKryteria: {},
        profAuto: {},
        profilaktykaStosowana: '',
        profilaktykaSzczegoly: { lek: '', dawka: '', odkiedy: '', regularnie: '' },
        profilaktykaEfekt: '',
        klasyfikacja: '',
        dalszyKrok: '',
        epikryza: ''
      },
      /* Zakładka 8 — PC-MAI (matryca leków przeciwbólowych) */
      pcmai: {
        data: '',
        dodatkowe: [], // id leków dodanych ręcznie do matrycy
        odpowiedzi: {}, // { [lekId]: { wskazanie: 'tak'|'nie'|'', … } }
        komentarze: {}, // { [lekId]: { wskazanie: 'opis', … } }
        auto: {}, // { [lekId]: { wskazanie: true } } — które komórki wypełniono auto-sugestią
        epikryza: ''
      },
      /* Zakładka 9 — Podsumowanie */
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
    const scalars = ['dataUrodzenia', 'plec', 'masa', 'wzrost', 'cisnienieSkurczowe', 'cisnienieRozkurczowe',
      'palenie', 'ciaza', 'kreatynina', 'jednostkaKreatyniny',
      'dataKreatyniny', 'albuminuria', 'uacr', 'uacrJednostka', 'psychAktywny',
      'psychOpis', 'epikryza', 'epikryzaFarmakoterapii',
      'pomocAdherence', 'marsProblemy', 'epikryzaKoncowa'];
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
          atc: str(r.atc),
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
      halt: { q1: 'str', q2: 'str', q3: 'str', q4: 'str', q5: 'str' },
      lokalizacja: 'bool', lokalizacjaOpis: 'str', charakter: 'bool', przebieg: 'bool',
      leczenieZmniejsza: 'str', lekiNaBol: 'arr', priorytety: 'str', epikryza: 'str'
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
      nrs: 'str', aktywnoscNasila: 'str', czasTrwania: 'str',
      dniWMiesiacu: 'str', odKiedyIle: 'str', odKiedyJednostka: 'str',
      objawy: 'bool', wyzwalacze: 'bool', ulga: 'bool',
      mohDni: { paracetamolNlpzAsa: 'str', zlozone: 'str', tryptany: 'str', opioidyKodeina: 'str' },
      mohLeki: { paracetamolNlpzAsa: 'str', zlozone: 'str', tryptany: 'str', opioidyKodeina: 'str' },
      mohOcena: 'str', interpretacja: 'bool', edukacja: 'bool', epikryza: 'str'
    });
    mergeShape(d.migrena, src.migrena, {
      rozpoznana: 'str',
      prodrom: 'bool',
      aura: 'bool', auraCzas: 'str', auraOstroznosc: 'bool',
      lekiDorzane: 'arr',
      wczesnieLek: 'str', skutecznosc2h: 'str', nawrot: 'str', wymioty: 'str',
      profilaktykaKryteria: 'bool', profAuto: 'bool', profilaktykaStosowana: 'str',
      profilaktykaSzczegoly: { lek: 'str', dawka: 'str', odkiedy: 'str', regularnie: 'str' },
      profilaktykaEfekt: 'str',
      klasyfikacja: 'str', dalszyKrok: 'str', epikryza: 'str'
    });
    /* Migracja: dawna aura (pojedynczy string, np. 'wzrokowa') → mapa typów aury */
    if (src.migrena && typeof src.migrena.aura === 'string' &&
        src.migrena.aura !== '' && src.migrena.aura !== 'nie' && src.migrena.aura !== 'nw') {
      d.migrena.aura[src.migrena.aura] = true;
    }
    /* Migracja: dawny przebieg bólu (pojedynczy string) → mapa wielokrotnego wyboru */
    if (src.ocenaBolu && typeof src.ocenaBolu.przebieg === 'string' && src.ocenaBolu.przebieg !== '') {
      d.ocenaBolu.przebieg[src.ocenaBolu.przebieg] = true;
    }
    /* Migracja: dawna wstępna interpretacja (pojedynczy string) → mapa wielokrotnego wyboru */
    if (src.bolGlowy && typeof src.bolGlowy.interpretacja === 'string' &&
        src.bolGlowy.interpretacja !== '' && src.bolGlowy.interpretacja !== 'nw') {
      d.bolGlowy.interpretacja[src.bolGlowy.interpretacja] = true;
    }
    mergePcmai(d.pcmai, src.pcmai);
    return d;
  }

  /* PC-MAI (zakładka 8) — scalanie z kluczami dynamicznymi (id leku jako klucz). */
  function mergePcmai(d, src) {
    if (!src || typeof src !== 'object') return;
    if (typeof src.data === 'string') d.data = src.data;
    if (typeof src.epikryza === 'string') d.epikryza = src.epikryza;
    if (Array.isArray(src.dodatkowe)) {
      d.dodatkowe = src.dodatkowe.filter(function (v) { return typeof v === 'number' && isFinite(v); });
    }
    if (src.odpowiedzi && typeof src.odpowiedzi === 'object') {
      Object.keys(src.odpowiedzi).forEach(function (lekId) {
        const wiersz = src.odpowiedzi[lekId];
        if (!wiersz || typeof wiersz !== 'object') return;
        const cel = {};
        Object.keys(wiersz).forEach(function (k) {
          if (typeof wiersz[k] === 'string') cel[k] = wiersz[k];
        });
        d.odpowiedzi[lekId] = cel;
      });
    }
    if (src.komentarze && typeof src.komentarze === 'object') {
      Object.keys(src.komentarze).forEach(function (lekId) {
        const wiersz = src.komentarze[lekId];
        if (!wiersz || typeof wiersz !== 'object') return;
        const cel = {};
        Object.keys(wiersz).forEach(function (k) {
          if (typeof wiersz[k] === 'string') cel[k] = wiersz[k];
        });
        d.komentarze[lekId] = cel;
      });
    }
    if (src.auto && typeof src.auto === 'object') {
      Object.keys(src.auto).forEach(function (lekId) {
        const wiersz = src.auto[lekId];
        if (!wiersz || typeof wiersz !== 'object') return;
        const cel = {};
        Object.keys(wiersz).forEach(function (k) {
          if (typeof wiersz[k] === 'boolean') cel[k] = wiersz[k];
        });
        d.auto[lekId] = cel;
      });
    }
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
