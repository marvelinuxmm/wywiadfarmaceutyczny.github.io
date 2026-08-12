/* MARS-5 — scoring kwestionariusza przestrzegania zaleceń. Logika czysta, testowalna w Node. */
(function () {
  const G = typeof window !== 'undefined' ? window : globalThis;

  const SKALA = { ciagle: 1, czesto: 2, czasami: 3, rzadko: 4, nigdy: 5 };
  const KLUCZE = ['m1', 'm2', 'm3', 'm4', 'm5'];

  /* Zwraca null, gdy nie wszystkie odpowiedzi udzielone; inaczej { sum, mean, interp }. */
  function score(m) {
    const vals = KLUCZE.map(function (k) {
      const v = m ? m[k] : '';
      return SKALA[v] !== undefined ? SKALA[v] : null;
    });
    if (vals.some(function (v) { return v === null; })) return null;
    const sum = vals.reduce(function (a, b) { return a + b; }, 0);
    const mean = sum / 5;
    let interp;
    if (mean === 5) interp = { sev: 'info', label: 'Bardzo dobre przestrzeganie zaleceń (5/5).' };
    else if (mean >= 4) interp = { sev: 'info', label: 'Dobre przestrzeganie zaleceń (≥4/5).' };
    else if (mean >= 3) interp = { sev: 'warn', label: 'Dostateczne przestrzeganie zaleceń (3–3,9/5).' };
    else interp = { sev: 'alert', label: 'Niedostateczne przestrzeganie zaleceń (<3/5) — non-adherent.' };
    return { sum: sum, mean: mean, interp: interp };
  }

  G.Mars5 = { score: score, klucze: KLUCZE, skala: SKALA };
})();
