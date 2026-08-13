/* Logika oceny i kontroli bólu: sugerowany status kontroli, kryteria profilaktyki,
   klasyfikacja migreny, komunikat o poradni leczenia bólu. Logika czysta, testowalna w Node.
   Ryzyko MOH jest liczone przez BolGlowy.sugerujMOH (zakładka 6) — tu nie jest powielane. */
(function () {
  const G = typeof window !== 'undefined' ? window : globalThis;

  const DN_POWAZNE = ['krwawienie', 'dusznosc', 'splatanie', 'upadki'];

  function num(v) {
    if (v === '' || v === null || v === undefined) return null;
    const n = parseFloat(String(v).replace(',', '.'));
    return isNaN(n) ? null : n;
  }

  function anyTrue(obj) {
    return Object.keys(obj || {}).some(function (x) { return obj[x]; });
  }

  /* Status kontroli bólu (5.9). k = { nrsAktualne, nrsSrednie, ulga, miedzyDawkami,
     dnLista, satysfakcja, marsMean }. Zwraca { opcja, powody[] }. */
  function sugerujStatusKontroli(k) {
    const akt = num(k.nrsAktualne);
    const sr = num(k.nrsSrednie);
    const powody = [];
    let opcja = 'czesciowa';

    if (sr !== null && sr >= 6) powody.push('średnie natężenie bólu ≥6/10');
    if (k.ulga === 'mala' || k.ulga === 'brak') powody.push('mała lub brak ulgi po leczeniu');
    if (k.miedzyDawkami === 'nie') powody.push('ból niekontrolowany między dawkami');
    if (DN_POWAZNE.some(function (d) { return k.dnLista && k.dnLista[d]; })) {
      powody.push('istotne działania niepożądane (krwawienie, duszność, splątanie, upadki)');
    }
    if (k.marsMean !== null && k.marsMean !== undefined && k.marsMean < 3) {
      powody.push('istotna nieadherencja (MARS-5 <3/5)');
    }

    if (powody.length) {
      opcja = 'niewystarczajaca';
    } else if (
      akt !== null && akt <= 3 && sr !== null && sr <= 3 &&
      (k.ulga === 'calkowita' || k.ulga === 'umiarkowana') &&
      !anyTrue(k.dnLista) &&
      (k.satysfakcja === 'duza' || k.satysfakcja === 'umiarkowana')
    ) {
      opcja = 'dobra';
      powody.push('niskie natężenie bólu, ulga całkowita lub umiarkowana, brak działań niepożądanych, satysfakcja z leczenia');
    } else {
      powody.push('ból nadal obecny z częściową ulgą lub łagodne działania niepożądane');
    }

    return { opcja: opcja, powody: powody };
  }

  /* Klasyfikacja robocza migreny (uproszczona, na podstawie dni bólu głowy z 6.3). */
  function sugerujKlasyfikacja(dniBoluGlowy) {
    const dgl = num(dniBoluGlowy);
    if (dgl === null) return { label: '', opis: '' };
    if (dgl >= 15) {
      return { label: 'Migrena przewlekła', opis: 'Ból głowy ≥15 dni/mies. (przez >3 mies.).' };
    }
    return { label: 'Migrena epizodyczna', opis: 'Ból głowy <15 dni/mies.' };
  }

  /* Wyprowadzone kryteria profilaktyki (7.5) z wcześniejszych odpowiedzi.
     d = { czasTrwania, dniWMiesiacu, mohDni, wplyw, skutecznosc2h, aura }.
     wplyw pochodzi z 4.4 (ocenaBolu.wplyw): wystarcza „umiarkowanie” lub „znacznie”.
     Zwraca obiekt { '72h': bool, wplyw, nieskuteczne, 'czeste-dorzane', aura, przewlekla }. */
  function sugerujProfilaktyka(d) {
    const dni = num(d.dniWMiesiacu);
    const czeste = ['paracetamolNlpzAsa', 'zlozone', 'tryptany', 'opioidyKodeina'].some(function (k) {
      const v = num((d.mohDni || {})[k]);
      return v !== null && v >= 8;
    });
    return {
      '72h': d.czasTrwania === '>72h',
      wplyw: Object.keys(d.wplyw || {}).some(function (k) {
        const v = d.wplyw[k];
        return v === 'umiarkowanie' || v === 'znacznie';
      }),
      nieskuteczne: d.skutecznosc2h === 'brak',
      'czeste-dorzane': czeste,
      /* aura = mapa typów aury (7.3); „nw” (nie wiem) nie liczy się jako aura */
      aura: Object.keys(d.aura || {}).some(function (k) { return k !== 'nw' && d.aura[k]; }),
      przewlekla: dni !== null && dni >= 15
    };
  }

  /* Dyskretny komunikat o poradni leczenia bólu (5.9). */
  function komunikatPoradnia(aktualne, srednie, ulga) {
    const a = num(aktualne);
    const s = num(srednie);
    const v = (a !== null && s !== null) ? Math.max(a, s) : (a !== null ? a : s);
    if (v !== null && v > 5 && (ulga === 'mala' || ulga === 'brak')) {
      return 'Utrzymujące się natężenie bólu powyżej 5/10 przy małej skuteczności leczenia — rozporządzenie wskazuje poradnię leczenia bólu m.in. przy niewielkiej skuteczności dotychczasowego leczenia i utrzymywaniu się natężenia bólu powyżej 5 w skali numerycznej. Rozważ skierowanie do poradni leczenia bólu.';
    }
    return null;
  }

  G.Kontrola = {
    sugerujStatusKontroli: sugerujStatusKontroli,
    sugerujKlasyfikacja: sugerujKlasyfikacja,
    sugerujProfilaktyka: sugerujProfilaktyka,
    komunikatPoradnia: komunikatPoradnia
  };
})();
