/* HALT-90 (Headache-Attributed Lost Time – 90 days) — kwestionariusz wpływu bólu głowy
   na funkcjonowanie (na podstawie pierwszych pięciu pytań MIDAS, R.B. Lipton i W.F. Stewart).
   Logika czysta, testowalna w Node. */
(function () {
  const G = typeof window !== 'undefined' ? window : globalThis;

  function num(v) {
    if (v === '' || v === null || v === undefined) return null;
    const n = parseFloat(String(v).replace(',', '.'));
    return isNaN(n) ? null : n;
  }

  /* Pytania HALT-90 — pola stanu: ocenaBolu.halt.q1 … q5 */
  const PYTANIA = [
    ['q1', 'Przez ile dni w ostatnich trzech miesiącach nie mogłaś/mogłeś pójść do pracy lub szkoły z powodu bólu głowy?'],
    ['q2', 'Przez ile dni w ostatnich trzech miesiącach mogłaś/mogłeś wykonać mniej niż połowę swoich zwykłych obowiązków w pracy lub w szkole z powodu bólu głowy? (Nie licz dni z pytania 1.)'],
    ['q3', 'Przez ile dni w ostatnich trzech miesiącach nie mogłaś/mogłeś wykonać żadnych prac domowych z powodu bólu głowy? (Nie licz dni z pytań 1 i 2.)'],
    ['q4', 'Przez ile dni w ostatnich trzech miesiącach mogłaś/mogłeś wykonać mniej niż połowę swoich zwykłych prac domowych z powodu bólu głowy? (Nie licz dni z poprzednich pytań.)'],
    ['q5', 'Przez ile dni w ostatnich trzech miesiącach opuściłaś/opuściłeś rodzinne, towarzyskie lub rekreacyjne aktywności z powodu bólu głowy?']
  ];

  /* Łączna liczba dni utraconych (suma q1–q5). null, gdy brak wartości. */
  function total(h) {
    const halt = h || {};
    let suma = 0;
    let any = false;
    PYTANIA.forEach(function (p) {
      const n = num(halt[p[0]]);
      if (n !== null) {
        suma += n;
        any = true;
      }
    });
    return any ? suma : null;
  }

  /* Stopień wg sumy: 0–5 → I, 6–10 → II, 11–20 → III, >20 → IV. */
  function grade(totalDni) {
    if (totalDni === null || totalDni === undefined) return null;
    if (totalDni <= 5) return { stopien: 'I', label: 'Minimalny lub sporadyczny wpływ', text: 'Grade I' };
    if (totalDni <= 10) return { stopien: 'II', label: 'Łagodny lub sporadyczny wpływ', text: 'Grade II' };
    if (totalDni <= 20) return { stopien: 'III', label: 'Umiarkowany wpływ', text: 'Grade III' };
    return { stopien: 'IV', label: 'Ciężki wpływ', text: 'Grade IV' };
  }

  G.Halt = { PYTANIA: PYTANIA, total: total, grade: grade };
})();
