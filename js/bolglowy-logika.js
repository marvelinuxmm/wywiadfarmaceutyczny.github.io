/* Logika zakładki „Ból głowy”: klasyfikacja częstości, ryzyko MOH,
   wstępna interpretacja (głosowanie punktowe) i kryteria TTH. Logika czysta, testowalna w Node. */
(function () {
  const G = typeof window !== 'undefined' ? window : globalThis;

  function num(v) {
    if (v === '' || v === null || v === undefined) return null;
    const n = parseFloat(String(v).replace(',', '.'));
    return isNaN(n) ? null : n;
  }

  function anyTrueExceptBrak(obj) {
    return Object.keys(obj || {}).some(function (k) { return k !== 'brak' && obj[k]; });
  }

  /* 3.3 Klasyfikacja robocza częstości. */
  function sugerujCzestosc(dni, miesiace) {
    const d = num(dni);
    const m = num(miesiace);
    if (d === null) return { opcja: '', powody: [] };
    if (d < 1) return { opcja: 'rzadki', powody: ['<1 dzień bólu głowy w miesiącu — rzadki epizodyczny napięciowy ból głowy'] };
    if (d < 15) {
      const powody = ['1–14 dni bólu głowy w miesiącu'];
      if (m === null) powody.push('podaj liczbę miesięcy trwania, aby potwierdzić klasyfikację (>3 mies.)');
      return { opcja: 'czesty', powody: powody };
    }
    const powody = ['≥15 dni bólu głowy w miesiącu'];
    if (m === null) powody.push('potwierdź czas trwania >3 mies. — możliwy przewlekły napięciowy ból głowy');
    else if (m > 3) powody.push('przez >3 miesiące — możliwy przewlekły napięciowy ból głowy');
    else powody.push('czas trwania ≤3 mies. — wymaga obserwacji');
    return { opcja: 'przewlekly', powody: powody };
  }

  /* 6.2 Podejrzenie nadużywania leków (MOH). m = { paracetamolNlpzAsa, zlozone, tryptany, opioidyKodeina, dniBoluGlowy }. */
  function sugerujMOH(m) {
    const an = num(m.paracetamolNlpzAsa);
    const zl = num(m.zlozone);
    const tz = num(m.tryptany);
    const op = num(m.opioidyKodeina);
    const dgl = num(m.dniBoluGlowy);
    const powody = [];
    let opcja = 'brak';

    if ((an !== null && an >= 15) || (zl !== null && zl >= 10) || (tz !== null && tz >= 10) || (op !== null && op >= 10)) {
      opcja = 'wysokie';
      if (an !== null && an >= 15) powody.push('paracetamol/NLPZ/ASA ≥15 dni/mies.');
      if (zl !== null && zl >= 10) powody.push('leki złożone ≥10 dni/mies.');
      if (tz !== null && tz >= 10) powody.push('tryptany ≥10 dni/mies.');
      if (op !== null && op >= 10) powody.push('opioidy/kodeina ≥10 dni/mies.');
      if (dgl !== null && dgl >= 15) powody.push('ból głowy ≥15 dni/mies. — kryteria MOH spełnione, jeśli nadużywanie trwa >3 mies.');
    } else {
      const regularne = (an !== null && an >= 5) || (zl !== null && zl >= 5) || (tz !== null && tz >= 5) || (op !== null && op >= 5);
      if (dgl !== null && dgl >= 15 && regularne) {
        opcja = 'mozliwe';
        powody.push('ból głowy ≥15 dni/mies. przy regularnym stosowaniu leków doraźnych — możliwe nadużywanie, wymaga oceny');
      } else {
        powody.push('liczby dni stosowania leków poniżej progów ryzyka MOH');
      }
    }
    return { opcja: opcja, powody: powody };
  }

  function opisMigrena(d) {
    const cechy = [];
    if (d.lokalizacja.jednostronny) cechy.push('ból jednostronny');
    if (d.charakterB.pulsujacy) cechy.push('pulsujący');
    if (d.nasilenie === 'umiarkowany' || d.nasilenie === 'silny') cechy.push('nasilenie umiarkowane/silne');
    if (d.aktywnoscNasila === 'tak') cechy.push('nasilany aktywnością');
    if (d.objawy.nudnosci || d.objawy.wymioty || d.objawy.swiatlowstret || d.objawy.dzwieki || d.objawy.aura) {
      cechy.push('objawy towarzyszące (nudności/wymioty/światłowstręt/fonofobia/aura)');
    }
    return cechy.length ? cechy.join(', ') : 'cechy migrenowe';
  }

  /* 7.1 Wstępna interpretacja. d = pełny fragment stanu bolGlowy. */
  function sugerujInterpretacje(d) {
    if (anyTrueExceptBrak(d.alarmowe)) {
      return { opcja: 'wtorny', powody: ['obecne objawy alarmowe — ból wymaga konsultacji lekarskiej'], tthScore: 0, migrenaScore: 0 };
    }
    if ((d.lokalizacja['okolica-oka'] || d.lokalizacja.jednostronny) && d.nasilenie === 'silny' &&
        (d.objawy.lzawienie || d.objawy.katar)) {
      return { opcja: 'klaster', powody: ['silny jednostronny ból okolicy oka z objawami autonomicznymi (łzawienie/katar)'], tthScore: 0, migrenaScore: 0 };
    }
    if (d.lokalizacja.zatoki && (d.objawy.katar || d.objawy.goraczka)) {
      return { opcja: 'zatokowy', powody: ['ból okolicy zatok z katarem lub gorączką — uwaga: wielu pacjentów z „zatokowym bólem głowy” ma migrenę lub ból napięciowy'], tthScore: 0, migrenaScore: 0 };
    }
    const moh = sugerujMOH(Object.assign({ dniBoluGlowy: d.dniWMiesiacu }, d.mohDni || {}));
    const dniGlowy = num(d.dniWMiesiacu);
    if (dniGlowy !== null && dniGlowy >= 15 && moh.opcja !== 'brak') {
      return { opcja: 'moh', powody: ['ból głowy ≥15 dni/mies. przy regularnym stosowaniu leków doraźnych'], tthScore: 0, migrenaScore: 0 };
    }

    let tthScore = 0;
    if (d.lokalizacja.obustronny) tthScore++;
    if (d.charakterB.uciskowy || d.charakterB.rozpierajacy || d.charakterB.tepy) tthScore++;
    if (d.nasilenie === 'lagodny' || d.nasilenie === 'umiarkowany') tthScore++;
    if (d.aktywnoscNasila === 'nie') tthScore++;

    let migrenaScore = 0;
    if (d.lokalizacja.jednostronny) migrenaScore++;
    if (d.charakterB.pulsujacy) migrenaScore++;
    if (d.nasilenie === 'umiarkowany' || d.nasilenie === 'silny') migrenaScore++;
    if (d.aktywnoscNasila === 'tak') migrenaScore++;
    if (d.objawy.nudnosci || d.objawy.wymioty || d.objawy.swiatlowstret || d.objawy.dzwieki || d.objawy.aura) migrenaScore++;

    const tthDodatkowe = !d.objawy.nudnosci && !d.objawy.wymioty && !(d.objawy.swiatlowstret && d.objawy.dzwieki);
    const tthMozliwe = tthScore >= 2 && tthDodatkowe;

    if (migrenaScore >= 2 && tthMozliwe) {
      if (migrenaScore >= tthScore) {
        return { opcja: 'migrena', powody: ['remis lub przewaga cech migrenowych przy współistniejących cechach TTH — zdecydowano o moduł migrenowy'], tthScore: tthScore, migrenaScore: migrenaScore };
      }
      return { opcja: 'tth', powody: ['przewaga kryteriów napięciowego bólu głowy (' + tthScore + ':' + migrenaScore + ')'], tthScore: tthScore, migrenaScore: migrenaScore };
    }
    if (migrenaScore >= 2) {
      return { opcja: 'migrena', powody: ['cechy migrenowe: ' + opisMigrena(d)], tthScore: tthScore, migrenaScore: migrenaScore };
    }
    if (tthMozliwe) {
      return { opcja: 'tth', powody: ['spełnione kryteria napięciowego bólu głowy (≥2 z 4, bez nudności/wymiotów i podwójnej fotofonofobii)'], tthScore: tthScore, migrenaScore: migrenaScore };
    }
    return { opcja: 'trudno', powody: ['nie można jednoznacznie ocenić obrazu — rozważ pogłębienie wywiadu'], tthScore: tthScore, migrenaScore: migrenaScore };
  }

  /* 7.2 Kryteria wspierające napięciowy ból głowy. */
  function kryteriaTTH(d) {
    return [
      { id: 'lok', label: 'Obustronna lokalizacja', met: !!d.lokalizacja.obustronny },
      { id: 'char', label: 'Uciskowy / opasujący, niepulsujący charakter', met: !!(d.charakterB.uciskowy || d.charakterB.rozpierajacy || d.charakterB.tepy) },
      { id: 'nasi', label: 'Łagodne lub umiarkowane nasilenie', met: (d.nasilenie === 'lagodny' || d.nasilenie === 'umiarkowany') },
      { id: 'akt', label: 'Aktywność fizyczna nie nasila bólu', met: d.aktywnoscNasila === 'nie' },
      { id: 'nud', label: 'Brak nudności i wymiotów', met: !d.objawy.nudnosci && !d.objawy.wymioty },
      { id: 'sw', label: 'Brak jednoczesnej światłowstrętu i fonofobii', met: !(d.objawy.swiatlowstret && d.objawy.dzwieki) },
      { id: 'czf', label: 'Brak czerwonych flag', met: !anyTrueExceptBrak(d.alarmowe) }
    ];
  }

  /* Mapowanie charakteru bólu z oceny ogólnej (4.6) na charakter bólu głowy (6.2).
     Zwraca obiekt { klucz6_2: true, ... } — bez 'dretwienie'/'inny'. */
  function przeniesCharakter(charakter) {
    const mapa = {
      tepy: 'tepy',
      pulsujacy: 'pulsujacy',
      uciskajacy: 'uciskowy',
      rozpierajacy: 'rozpierajacy',
      piekacy: 'piekacy',
      ostry: 'przeszywajacy',
      klujacy: 'przeszywajacy',
      razenie: 'przeszywajacy'
    };
    const out = {};
    Object.keys(mapa).forEach(function (k) {
      if (charakter && charakter[k]) out[mapa[k]] = true;
    });
    return out;
  }

  /* Mapowanie leków z listy (zakładka 2) na kategorie MOH (6.6).
     paracetamol/NLPZ/ASA → paracetamolNlpzAsa; opioid (w tym kodeina) → opioidyKodeina.
     Leki złożone i tryptany nie mają grup w bazie — zawsze puste (do ręcznego wpisania). */
  function sugerujMohLeki(leki) {
    const out = { paracetamolNlpzAsa: [], zlozone: [], tryptany: [], opioidyKodeina: [] };
    (Array.isArray(leki) ? leki : []).forEach(function (l) {
      if (!l || !String(l.nazwa || '').trim()) return;
      const grupy = {};
      (l.grupy || []).forEach(function (g) { if (g) grupy[g] = true; });
      if (G.Leki && G.Leki.znajdzGrupy) {
        G.Leki.znajdzGrupy(l.nazwa).forEach(function (g) { grupy[g] = true; });
      }
      const nazwa = String(l.nazwa).trim() + (l.moc ? ' ' + String(l.moc).trim() : '');
      const ma = function (g) { return grupy[g] === true; };
      if (ma('paracetamol') || ma('NLPZ') || ma('ASA')) out.paracetamolNlpzAsa.push(nazwa);
      else if (ma('opioid')) out.opioidyKodeina.push(nazwa);
    });
    return out;
  }

  G.BolGlowy = {
    sugerujCzestosc: sugerujCzestosc,
    sugerujMOH: sugerujMOH,
    sugerujInterpretacje: sugerujInterpretacje,
    kryteriaTTH: kryteriaTTH,
    anyTrueExceptBrak: anyTrueExceptBrak,
    przeniesCharakter: przeniesCharakter,
    sugerujMohLeki: sugerujMohLeki
  };
})();
