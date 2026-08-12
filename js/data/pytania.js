/* Pytania kliniczne aktywowane przez choroby współistniejące + objawy alarmowe.
   Informacje o lekach pochodzą bezpośrednio z listy leków pacjenta. */
(function () {
  const G = typeof window !== 'undefined' ? window : globalThis;

  const PYTANIA = [
    {
      choroba: 'sercowo',
      tytul: 'Choroby sercowo-naczyniowe',
      pytania: [
        { id: 'sc.nadcisnienie', tekst: 'Czy występuje trudno kontrolowane nadciśnienie?' },
        { id: 'sc.obrzeki-dusznosc', tekst: 'Czy występują obrzęki lub duszność?', alarm: true }
      ]
    },
    {
      choroba: 'oddechowe',
      tytul: 'Choroba układu oddechowego',
      pytania: [
        { id: 'od.sennosc', tekst: 'Czy występuje senność, spowolnienie lub zawroty głowy?' }
      ]
    },
    {
      choroba: 'przewodpokarmowy',
      tytul: 'Choroba przewodu pokarmowego',
      pytania: [
        { id: 'pp.objawy', tekst: 'Czy występują bóle brzucha, smoliste stolce lub fusowate wymioty?', alarm: true }
      ]
    },
    {
      choroba: 'watroba',
      tytul: 'Choroba wątroby',
      pytania: [
        { id: 'wa.alkohol', tekst: 'Czy pacjent spożywa alkohol?' },
        { id: 'wa.dekompensacja', tekst: 'Czy występują objawy dekompensacji choroby wątroby?', alarm: true }
      ]
    },
    {
      choroba: '__alarmowe__',
      tytul: 'Objawy alarmowe — sprawdź zawsze',
      zawsze: true,
      pytania: [
        { id: 'al.splatanie', tekst: 'Czy występuje splątanie lub inne zaburzenia świadomości?', alarm: true },
        { id: 'al.upadki', tekst: 'Czy występują upadki?', alarm: true },
        { id: 'al.reakcja', tekst: 'Czy występują objawy ciężkiej reakcji polekowej?', alarm: true }
      ]
    }
  ];

  const byId = {};
  PYTANIA.forEach(function (sek) {
    sek.pytania.forEach(function (p) { byId[p.id] = p; });
  });

  G.PYTANIA = PYTANIA;
  G.Pytania = {
    all: PYTANIA,
    byId: byId,
    isAlarm: function (id) {
      const p = byId[id];
      return !!(p && p.alarm);
    },
  };
})();
