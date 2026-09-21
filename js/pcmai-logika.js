/* Logika zakładki „PC-MAI” (Pharmaceutical Care – Medication Appropriateness Index):
   matryca leków przeciwbólowych × 10 kryteriów MAI (wg GlobalRPH, max 18 pkt/lek),
   kwalifikacja leków pacjenta do wierszy oraz auto-sugestie odpowiedzi z innych zakładek.
   Logika czysta, testowalna w Node (bez DOM). */
(function () {
  const G = typeof window !== 'undefined' ? window : globalThis;

  /* Kryteria MAI. `wlasciwa` = odpowiedź uznawana za właściwą (0 pkt).
     Odpowiedź przeciwna dodaje `waga` punktów. Suma wag = 18. */
  const KRYTERIA = [
    { id: 'wskazanie', label: 'Wskazanie', pytanie: 'Czy istnieje wskazanie do stosowania leku?', waga: 3, wlasciwa: 'tak' },
    { id: 'skutecznosc', label: 'Skuteczność', pytanie: 'Czy lek jest skuteczny w tej chorobie lub objawie?', waga: 3, wlasciwa: 'tak' },
    { id: 'dawka', label: 'Dawka', pytanie: 'Czy dawka jest prawidłowa?', waga: 2, wlasciwa: 'tak' },
    { id: 'zalecenia', label: 'Zalecenia', pytanie: 'Czy zalecenia (sposób przyjmowania) są prawidłowe?', waga: 2, wlasciwa: 'tak' },
    { id: 'praktycznosc', label: 'Praktyczność', pytanie: 'Czy zalecenia są praktyczne i możliwe do realizacji?', waga: 2, wlasciwa: 'tak' },
    { id: 'interakcje_ll', label: 'Interakcje lek–lek', pytanie: 'Czy występują istotne interakcje lek–lek?', waga: 2, wlasciwa: 'nie' },
    { id: 'interakcje_lc', label: 'Interakcje lek–choroba', pytanie: 'Czy występują istotne interakcje lek–choroba?', waga: 1, wlasciwa: 'nie' },
    { id: 'duplikacja', label: 'Duplikacja', pytanie: 'Czy występuje zbędna duplikacja z innymi lekami?', waga: 1, wlasciwa: 'nie' },
    { id: 'czas', label: 'Czas leczenia', pytanie: 'Czy czas trwania terapii jest akceptowalny?', waga: 1, wlasciwa: 'tak' },
    { id: 'koszt', label: 'Koszt', pytanie: 'Czy lek jest najtańszą równoważną opcją?', waga: 1, wlasciwa: 'tak' }
  ];

  const MAX = KRYTERIA.reduce(function (a, k) { return a + k.waga; }, 0); // 18

  const KLASA_LABEL = {
    opioid: 'Opioid',
    gabapentynoid: 'Gabapentyna / pregabalina',
    duloksetyna_amitryptylina: 'Duloksetyna / amitryptylina',
    nlpz_przewlekle: 'NLPZ przewlekłe',
    paracetamol_wielo: 'Paracetamol (kilka preparatów)',
    kodeina: 'Leki z kodeiną',
    benzodiazepina_lekz: 'Benzodiazepina / lek Z'
  };

  const SEDACY = ['benzodiazepina', 'z-lek', 'sedatywny'];

  function norm(s) {
    return G.Leki && G.Leki.normalize ? G.Leki.normalize(s) : String(s || '').toLowerCase();
  }

  function atc(lek) {
    return String((lek && lek.atc) || '').toUpperCase();
  }

  /* Zbiór grup leku: z pola `grupy`, z nazwy (aliasing) i z kodu ATC. */
  function grupyLeku(lek) {
    const set = {};
    ((lek && lek.grupy) || []).forEach(function (g) { if (g) set[g] = true; });
    if (G.Leki) {
      if (lek && lek.nazwa && G.Leki.znajdzGrupy) {
        G.Leki.znajdzGrupy(lek.nazwa).forEach(function (g) { set[g] = true; });
      }
      if (lek && lek.atc && G.Leki.grupyZAtc) {
        G.Leki.grupyZAtc(lek.atc).forEach(function (g) { set[g] = true; });
      }
    }
    return set;
  }

  function etykieta(lek) {
    const nazwa = (lek && lek.nazwa) ? String(lek.nazwa) : '(bez nazwy)';
    return nazwa + (lek && lek.moc ? ' ' + String(lek.moc) : '');
  }

  function maKodeine(lek) {
    const n = norm(lek && lek.nazwa);
    if (n.indexOf('kodein') !== -1 || n.indexOf('codein') !== -1) return true;
    const a = atc(lek);
    return a.indexOf('R05DA04') === 0 || a.indexOf('N02AJ') === 0 ||
      a.indexOf('N02AA58') === 0 || a.indexOf('N02AA59') === 0;
  }

  /* Klasy leków przeciwbólowych używane jako wiersze matrycy.
     `kontekst.paracetamol` = liczba preparatów paracetamolu na liście pacjenta. */
  function klasyfikujLek(lek, kontekst) {
    if (!lek || !String(lek.nazwa || '').trim()) return [];
    const g = grupyLeku(lek);
    const a = atc(lek);
    const n = norm(lek.nazwa);
    const klasy = [];
    if (g.opioid) klasy.push('opioid');
    if (g.gabapentynoid) klasy.push('gabapentynoid');
    if (a.indexOf('N06AA') === 0 || a.indexOf('N06AX21') === 0 ||
        n.indexOf('amitrypt') !== -1 || n.indexOf('dulokset') !== -1 || n.indexOf('duloxet') !== -1) {
      klasy.push('duloksetyna_amitryptylina');
    }
    if (g.NLPZ && lek.tryb === 'przewlekle') klasy.push('nlpz_przewlekle');
    if (g.paracetamol && kontekst && kontekst.paracetamol >= 2) klasy.push('paracetamol_wielo');
    if (maKodeine(lek)) klasy.push('kodeina');
    if (g.benzodiazepina || g['z-lek']) klasy.push('benzodiazepina_lekz');
    return klasy;
  }

  /* Wiersze matrycy: leki pacjenta zakwalifikowane do klas przeciwbólowych
     oraz te dodane ręcznie (`dodatkowe`). */
  function wybierzWiersze(leki, dodatkowe) {
    const arr = Array.isArray(leki) ? leki : [];
    const dodat = {};
    (Array.isArray(dodatkowe) ? dodatkowe : []).forEach(function (id) { dodat[id] = true; });
    const paracetamol = arr.filter(function (l) { return l && l.nazwa && grupyLeku(l).paracetamol; }).length;
    const out = [];
    arr.forEach(function (l) {
      if (!l || !String(l.nazwa || '').trim()) return;
      const klasy = klasyfikujLek(l, { paracetamol: paracetamol });
      const reczny = dodat[l.id] === true;
      if (!klasy.length && !reczny) return;
      out.push({ id: l.id, nazwa: etykieta(l), klasy: klasy, reczny: reczny, lek: l });
    });
    return out;
  }

  function liczbaSedacyjnych(leki) {
    return (Array.isArray(leki) ? leki : []).filter(function (l) {
      const g = grupyLeku(l);
      return g.opioid || SEDACY.some(function (x) { return g[x]; });
    }).length;
  }

  function czySedacyjny(grupy) {
    return !!grupy.opioid || SEDACY.some(function (x) { return grupy[x]; });
  }

  /* Auto-sugestie odpowiedzi dla leku na podstawie stanu aplikacji.
     Zwraca { [kryteriumId]: { wartosc: 'tak'|'nie', zrodlo } } — tylko dla kryteriów,
     które da się wiarygodnie wyprowadzić z danych. */
  function sugeruj(s, lek) {
    const out = {};
    if (!lek) return out;
    const leki = Array.isArray(s.leki) ? s.leki : [];
    const kb = s.kontrolaBolu || {};
    const ob = s.ocenaBolu || {};
    const ch = s.choroby || {};
    const g = grupyLeku(lek);

    /* 1. Wskazanie */
    if (String(lek.wskazanie || '').trim()) {
      out.wskazanie = { wartosc: 'tak', zrodlo: 'Wskazanie z listy leków: ' + lek.wskazanie };
    }

    /* 2. Skuteczność — z kontroli bólu, w drugiej kolejności z oceny leczenia */
    if (kb.ulga === 'calkowita' || kb.ulga === 'umiarkowana') {
      out.skutecznosc = { wartosc: 'tak', zrodlo: 'Ulga po leczeniu: ' + kb.ulga };
    } else if (kb.ulga === 'mala' || kb.ulga === 'brak') {
      out.skutecznosc = { wartosc: 'nie', zrodlo: 'Ulga po leczeniu: ' + kb.ulga };
    } else if (ob.leczenieZmniejsza === 'tak' || ob.leczenieZmniejsza === 'czesciowo') {
      out.skutecznosc = { wartosc: 'tak', zrodlo: 'Dotychczasowe leczenie zmniejsza ból' };
    } else if (ob.leczenieZmniejsza === 'nie') {
      out.skutecznosc = { wartosc: 'nie', zrodlo: 'Dotychczasowe leczenie nie zmniejsza bólu' };
    }

    /* 3. Dawka — obecna moc i schemat sugeruje, że dawka została ustalona */
    if (String(lek.moc || '').trim() && String(lek.schemat || '').trim()) {
      out.dawka = { wartosc: 'tak', zrodlo: 'Moc i schemat dawkowania z listy leków' };
    }

    /* 4. Zalecenia */
    if (String(lek.schemat || '').trim()) {
      out.zalecenia = { wartosc: 'tak', zrodlo: 'Schemat dawkowania: ' + lek.schemat };
    }

    /* 5. Praktyczność — heurystyka złożoności schematu */
    const sch = String(lek.schemat || '').trim();
    if (sch) {
      if (/^\d+-\d+-\d+$/.test(sch) || /^[12]×[12]$/.test(sch)) {
        out.praktycznosc = { wartosc: 'tak', zrodlo: 'Prosty schemat: ' + sch };
      } else if (/[3-9]×|co\s*\d+\s*h|doraź|doraz|co drugi dzień/i.test(sch)) {
        out.praktycznosc = { wartosc: 'nie', zrodlo: 'Złożony lub częsty schemat: ' + sch };
      }
    }

    /* 6. Interakcje lek–lek — grupy sedujące / opioid + benzodiazepina lub lek Z */
    const sed = liczbaSedacyjnych(leki);
    if (czySedacyjny(g) && sed >= 2) {
      out.interakcje_ll = { wartosc: 'tak', zrodlo: 'Wiele leków o działaniu sedującym/opioidów na liście (' + sed + ')' };
    } else if (leki.length >= 2) {
      out.interakcje_ll = { wartosc: 'nie', zrodlo: 'Nie wykryto istotnych interakcji lek–lek' };
    }

    /* 7. Interakcje lek–choroba (logika jak w flags.js / ryzyko.js) */
    const chsz = s.chorobySzczegolowe || {};
    let lc = false;
    let pow = '';
    if (g.NLPZ && (ch.przewodpokarmowy || ch.pchn || ch.sercowo)) {
      lc = true; pow = 'NLPZ przy chorobie przewodu pokarmowego / PChN / sercowo-naczyniowej';
    } else if ((g.opioid || g.gabapentynoid) && ch.oddechowe) {
      lc = true; pow = 'Lek działający depresyjnie na OUN przy chorobie układu oddechowego';
    } else if (g.paracetamol && ch.watroba) {
      lc = true; pow = 'Paracetamol przy chorobie wątroby';
    } else if (SEDACY.some(function (x) { return g[x]; }) && ch.oddechowe) {
      lc = true; pow = 'Lek sedujący przy chorobie układu oddechowego';
    } else if (g.NLPZ && (chsz.nw_dializa || chsz.nw_marskosc || chsz.nw_wzw)) {
      lc = true; pow = 'NLPZ przy ciężkiej chorobie nerek/wątroby';
    }
    if (lc) out.interakcje_lc = { wartosc: 'tak', zrodlo: pow };
    else if (leki.length) out.interakcje_lc = { wartosc: 'nie', zrodlo: 'Nie wykryto istotnych interakcji lek–choroba' };

    /* 8. Duplikacja — ten sam kod ATC (5 znaków) lub ta sama grupa kluczowa */
    const grupyDup = ['NLPZ', 'paracetamol', 'opioid', 'gabapentynoid'];
    const a5 = atc(lek).slice(0, 5);
    const duplikat = leki.some(function (other) {
      if (!other || other.id === lek.id || !String(other.nazwa || '').trim()) return false;
      if (a5 && atc(other).slice(0, 5) === a5) return true;
      const og = grupyLeku(other);
      return grupyDup.some(function (x) { return g[x] && og[x]; });
    });
    if (duplikat) out.duplikacja = { wartosc: 'tak', zrodlo: 'Inny lek z tej samej grupy / o tym samym ATC jest już na liście' };
    else if (leki.length) out.duplikacja = { wartosc: 'nie', zrodlo: 'Brak duplikacji z lekami na liście' };

    /* 9. Czas leczenia — na podstawie statusu kontroli bólu */
    if (kb.statusKontroli === 'dobra') {
      out.czas = { wartosc: 'tak', zrodlo: 'Dobra kontrola bólu (5.9)' };
    } else if (kb.statusKontroli === 'niewystarczajaca') {
      out.czas = { wartosc: 'nie', zrodlo: 'Niewystarczająca kontrola bólu (5.9) — zweryfikuj czas terapii' };
    }

    return out;
  }

  /* Punktacja pojedynczego leku. odp = { [kryteriumId]: 'tak'|'nie'|'' }. */
  function policz(odp) {
    const o = odp || {};
    let suma = 0;
    let ocenione = 0;
    let nieprawidlowe = 0;
    KRYTERIA.forEach(function (k) {
      const v = o[k.id];
      if (v !== 'tak' && v !== 'nie') return;
      ocenione++;
      if (v !== k.wlasciwa) {
        suma += k.waga;
        nieprawidlowe++;
      }
    });
    return {
      suma: suma,
      max: MAX,
      ocenione: ocenione,
      liczba: KRYTERIA.length,
      kompletne: ocenione === KRYTERIA.length,
      nieprawidlowe: nieprawidlowe
    };
  }

  /* Pasmo interpretacyjne sumy MAI. */
  function band(suma) {
    const s = (typeof suma === 'number' && isFinite(suma)) ? suma : 0;
    if (s <= 0) return { sev: 'info', label: 'Lek odpowiedni — brak stwierdzonych nieprawidłowości.' };
    if (s <= 2) return { sev: 'info', label: 'Niska nieodpowiedniość — drobne uwagi.' };
    if (s <= 5) return { sev: 'warn', label: 'Umiarkowana nieodpowiedniość — zalecana weryfikacja.' };
    return { sev: 'alert', label: 'Wysoka nieodpowiedniość — wymaga reakcji farmaceuty lub lekarza.' };
  }

  G.Pcmai = {
    KRYTERIA: KRYTERIA,
    MAX: MAX,
    KLASA_LABEL: KLASA_LABEL,
    grupyLeku: grupyLeku,
    etykieta: etykieta,
    klasyfikujLek: klasyfikujLek,
    wybierzWiersze: wybierzWiersze,
    sugeruj: sugeruj,
    policz: policz,
    band: band
  };
})();
