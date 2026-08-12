/* Szczegółowe choroby współistniejące (zakładka 1, sekcja 3).
   kategoria (grupy) — klucz checkboxa kategorii w sekcji 2;
   kategoria (pozycje) — nadpisanie kategorii grupy (np. 'pchn'/'watroba' dla grupy 'nerki_watroba').
   Kategorie: sercowo, metaboliczne, nerki_watroba, przewodpokarmowy, oddechowe,
              neurologia, psychiczne, kostno, inne */
(function () {
  const G = typeof window !== 'undefined' ? window : globalThis;

  const CHOROBY_SZCZEGOLOWE = [
    {
      system: 'Układ sercowo-naczyniowy',
      kategoria: 'sercowo',
      items: [
        { id: 'sc_nadcisnienie', label: 'Nadciśnienie tętnicze' },
        { id: 'sc_chid', label: 'Choroba niedokrwienna serca' },
        { id: 'sc_niewydolnosc', label: 'Niewydolność serca' },
        { id: 'sc_arytmie', label: 'Arytmie' },
        { id: 'sc_zawal', label: 'Przebyty zawał serca' },
        { id: 'sc_udar', label: 'Przebyty udar / TIA' },
        { id: 'sc_zakrzepowa', label: 'Choroba zakrzepowo-zatorowa' }
      ]
    },
    {
      system: 'Choroby metaboliczne',
      kategoria: 'metaboliczne',
      items: [
        { id: 'met_cukrzyca1', label: 'Cukrzyca typu 1' },
        { id: 'met_cukrzyca2', label: 'Cukrzyca typu 2' },
        { id: 'met_otylosc', label: 'Otyłość' },
        { id: 'met_dyslipidemia', label: 'Dyslipidemia' },
        { id: 'met_dna', label: 'Dna moczanowa' },
        { id: 'met_tarczyca', label: 'Choroby tarczycy' }
      ]
    },
    {
      system: 'Nerki i wątroba',
      kategoria: 'nerki_watroba',
      items: [
        { id: 'nw_pchn', label: 'Przewlekła choroba nerek', kategoria: 'pchn' },
        { id: 'nw_dializa', label: 'Dializoterapia', kategoria: 'pchn' },
        { id: 'nw_watroba', label: 'Choroba wątroby', kategoria: 'watroba' },
        { id: 'nw_marskosc', label: 'Marskość wątroby', kategoria: 'watroba' },
        { id: 'nw_wzw', label: 'Wirusowe zapalenie wątroby', kategoria: 'watroba' }
      ]
    },
    {
      system: 'Przewód pokarmowy',
      kategoria: 'przewodpokarmowy',
      items: [
        { id: 'pp_wrzodowa', label: 'Choroba wrzodowa' },
        { id: 'pp_krwawienie', label: 'Krwawienie z przewodu pokarmowego w wywiadzie' },
        { id: 'pp_refluks', label: 'Choroba refluksowa' },
        { id: 'pp_nzj', label: 'Nieswoiste choroby zapalne jelit' },
        { id: 'pp_zaparcia', label: 'Przewlekłe zaparcia' }
      ]
    },
    {
      system: 'Układ oddechowy',
      kategoria: 'oddechowe',
      items: [
        { id: 'od_astma', label: 'Astma' },
        { id: 'od_pochp', label: 'POChP' },
        { id: 'od_bezdech', label: 'Bezdech senny' }
      ]
    },
    {
      system: 'Neurologia',
      kategoria: 'neurologia',
      items: [
        { id: 'ne_padaczka', label: 'Padaczka' },
        { id: 'ne_sm', label: 'Stwardnienie rozsiane' },
        { id: 'ne_parkinson', label: 'Choroba Parkinsona' },
        { id: 'ne_neuropatia', label: 'Neuropatia obwodowa' },
        { id: 'ne_uraz', label: 'Przebyty uraz OUN' },
        { id: 'ne_poznawcze', label: 'Zaburzenia poznawcze' }
      ]
    },
    {
      system: 'Zdrowie psychiczne',
      kategoria: 'psychiczne',
      items: [
        { id: 'ps_depresja', label: 'Depresja' },
        { id: 'ps_lekowe', label: 'Zaburzenia lękowe' },
        { id: 'ps_ptsd', label: 'PTSD' },
        { id: 'ps_bezsennosc', label: 'Bezsenność' },
        { id: 'ps_alkohol', label: 'Uzależnienie od alkoholu' },
        { id: 'ps_uzaleznienie', label: 'Uzależnienie od leków lub substancji' }
      ]
    },
    {
      system: 'Układ kostno-stawowy',
      kategoria: 'kostno',
      items: [
        { id: 'ks_chzs', label: 'Choroba zwyrodnieniowa stawów' },
        { id: 'ks_rzs', label: 'Reumatoidalne zapalenie stawów' },
        { id: 'ks_zapalne', label: 'Inne choroby zapalne stawów' },
        { id: 'ks_osteoporoza', label: 'Osteoporoza' },
        { id: 'ks_fibromialgia', label: 'Fibromialgia' },
        { id: 'ks_kregoslup', label: 'Przewlekły ból kręgosłupa' }
      ]
    },
    {
      system: 'Inne',
      kategoria: 'inne',
      items: [
        { id: 'in_nowotwor_historia', label: 'Choroba nowotworowa w wywiadzie' },
        { id: 'in_nowotwor_aktywny', label: 'Aktualnie aktywna choroba nowotworowa' },
        { id: 'in_paliatywna', label: 'Leczenie paliatywne' }
      ]
    }
  ];

  const KATEGORIE = ['sercowo', 'metaboliczne', 'nerki_watroba', 'przewodpokarmowy',
    'oddechowe', 'neurologia', 'psychiczne', 'kostno', 'inne'];

  G.CHOROBY_SZCZEGOLOWE = CHOROBY_SZCZEGOLOWE;
  G.Choroby = {
    kategorie: KATEGORIE,
    kategoriaDla: function (id) {
      for (let i = 0; i < CHOROBY_SZCZEGOLOWE.length; i++) {
        const g = CHOROBY_SZCZEGOLOWE[i];
        const it = g.items.find(function (x) { return x.id === id; });
        if (it) return it.kategoria || g.kategoria;
      }
      return null;
    }
  };
})();
