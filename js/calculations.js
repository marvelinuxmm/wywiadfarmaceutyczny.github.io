/* Kalkulacje: CKD-EPI 2021, Cockcroft-Gault, konwersje jednostek, progi klasyfikacji. */
(function () {
  const G = typeof window !== 'undefined' ? window : globalThis;

  const K_CONST = { k: 0.7, m: 0.9 };
  const ALPHA = { k: -0.241, m: -0.302 };

  function toMgdl(kreatynina, jednostka) {
    const v = parseNum(kreatynina);
    if (v === null) return null;
    if (jednostka === 'umol') return v / 88.4;
    return v;
  }

  /* eGFR = 142 × min(Scr/K,1)^α × max(Scr/K,1)^−1,200 × 0,9938^wiek × 1,012 [jeśli kobieta] */
  function ckdEpi(scrMgdl, wiek, plec) {
    if (scrMgdl === null || scrMgdl === undefined || !wiek || !plec) return null;
    const k = K_CONST[plec], a = ALPHA[plec];
    return 142 *
      Math.pow(Math.min(scrMgdl / k, 1), a) *
      Math.pow(Math.max(scrMgdl / k, 1), -1.2) *
      Math.pow(0.9938, wiek) *
      (plec === 'k' ? 1.012 : 1);
  }

  /* CrCL = ((140 − wiek) × masa [kg]) / (72 × Scr [mg/dL]); ×0,85 dla kobiet */
  function cockcroftGault(scrMgdl, wiek, masa, plec) {
    if (scrMgdl === null || scrMgdl === undefined || !wiek || !masa || !plec) return null;
    let crcl = ((140 - wiek) * masa) / (72 * scrMgdl);
    if (plec === 'k') crcl *= 0.85;
    return crcl;
  }

  /* Devine IBW: 50 kg (mężczyzna) / 45,5 kg (kobieta) + 2,3 kg na cal powyżej 5 stóp. */
  function idealBodyWeight(plec, wzrostCm) {
    if (!plec || wzrostCm === null || wzrostCm === undefined || wzrostCm <= 0) return null;
    const inches = wzrostCm / 2.54;
    return (plec === 'k' ? 45.5 : 50) + 2.3 * (inches - 60);
  }

  /*
    Masa do Cockcrofta-Gaulta:
    < IBW          — masa rzeczywista,
    IBW–130% IBW  — masa idealna,
    >130% IBW      — masa korygowana (IBW + 0,4 × nadmiar).
  */
  function crclWeight(plec, masa, wzrostCm) {
    if (masa === null || masa === undefined || masa <= 0) return null;
    const ibw = idealBodyWeight(plec, wzrostCm);
    if (ibw === null || ibw <= 0) {
      return { weight: masa, mode: 'rzeczywista', ideal: null };
    }
    if (masa < ibw) return { weight: masa, mode: 'rzeczywista', ideal: ibw };
    if (masa <= ibw * 1.3) return { weight: ibw, mode: 'idealna', ideal: ibw };
    return { weight: ibw + 0.4 * (masa - ibw), mode: 'korygowana', ideal: ibw };
  }

  function bmi(masa, wzrostCm) {
    if (masa === null || wzrostCm === null || masa <= 0 || wzrostCm <= 0) return null;
    return masa / Math.pow(wzrostCm / 100, 2);
  }

  function bsaMosteller(masa, wzrostCm) {
    if (masa === null || wzrostCm === null || masa <= 0 || wzrostCm <= 0) return null;
    return Math.sqrt((masa * wzrostCm) / 3600);
  }

  function bmiBand(value) {
    if (value < 18.5) {
      return { sev: 'warn', label: 'Niedowaga — zachowaj ostrożność przy ocenie dawkowania i ryzyka osłabienia.' };
    }
    if (value < 25) return { sev: 'normal', label: 'Prawidłowa masa ciała.' };
    if (value < 30) return { sev: 'info', label: 'Nadwaga.' };
    return {
      sev: 'warn',
      label: 'Otyłość — przy skrajnej otyłości CrCL liczony z masy rzeczywistej może być zawyżony.'
    };
  }

  function egfrBand(egfr) {
    if (egfr >= 90) return { sev: 'info', label: '≥90 ml/min/1,73 m² — brak flagi lub informacyjna.' };
    if (egfr >= 60) return { sev: 'info', label: '60–89 ml/min/1,73 m² — łagodne obniżenie, interpretować w kontekście albuminurii.' };
    if (egfr >= 45) return { sev: 'warn', label: '45–59 ml/min/1,73 m² — PChN G3a / ostrożność przy lekach nefrotoksycznych.' };
    if (egfr >= 30) return { sev: 'warn', label: '30–44 ml/min/1,73 m² — PChN G3b / konieczna weryfikacja dawek.' };
    if (egfr >= 15) return { sev: 'alert', label: '15–29 ml/min/1,73 m² — alert wysoki: ciężkie upośledzenie funkcji nerek.' };
    return { sev: 'alert', label: '<15 ml/min/1,73 m² — alert bardzo wysoki: schyłkowa niewydolność nerek / pilna ostrożność.' };
  }

  /* eGFR odindeksowany (de-indexed): koryguje wartość indeksowaną (ml/min/1,73 m²)
     do rzeczywistej powierzchni ciała pacjenta (BSA). Wynik w ml/min. */
  function egfrOdindeksowany(egfr, bsa) {
    if (egfr === null || egfr === undefined || bsa === null || bsa === undefined || bsa <= 0) return null;
    return egfr * bsa / 1.73;
  }

  function crclBand(crcl) {
    if (crcl >= 60) return { sev: 'info', label: '≥60 ml/min — brak lub umiarkowana ostrożność.' };
    if (crcl >= 30) return { sev: 'warn', label: '30–59 ml/min — sprawdzić dawkowanie leków zależnych od funkcji nerek.' };
    if (crcl >= 15) return { sev: 'alert', label: '15–29 ml/min — wysokie ryzyko kumulacji leków.' };
    return { sev: 'alert', label: '<15 ml/min — bardzo wysokie ryzyko, wymagana indywidualna ocena.' };
  }

  function daysSince(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return (Date.now() - d.getTime()) / 86400000;
  }

  /* Wiek w latach z daty urodzenia (YYYY-MM-DD); refDate dla testów. */
  function ageFromBirthDate(dateStr, refDate) {
    if (!dateStr) return null;
    const d = new Date(String(dateStr) + 'T00:00:00');
    if (isNaN(d.getTime())) return null;
    const r = (refDate instanceof Date) ? refDate : new Date();
    let age = r.getFullYear() - d.getFullYear();
    const m = r.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && r.getDate() < d.getDate())) age--;
    return age;
  }

  function parseNum(v) {
    if (v === '' || v === null || v === undefined) return null;
    const n = parseFloat(String(v).replace(',', '.'));
    return isNaN(n) ? null : n;
  }

  G.Calc = {
    toMgdl: toMgdl,
    ckdEpi: ckdEpi,
    cockcroftGault: cockcroftGault,
    idealBodyWeight: idealBodyWeight,
    crclWeight: crclWeight,
    bmi: bmi,
    bsaMosteller: bsaMosteller,
    bmiBand: bmiBand,
    egfrBand: egfrBand,
    egfrOdindeksowany: egfrOdindeksowany,
    crclBand: crclBand,
    daysSince: daysSince,
    ageFromBirthDate: ageFromBirthDate,
    parseNum: parseNum
  };
})();
