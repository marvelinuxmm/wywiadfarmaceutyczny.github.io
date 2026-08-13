/* Silnik reguł: stan pacjenta → lista flag (info / warn / alert). */
(function () {
  const G = typeof window !== 'undefined' ? window : globalThis;

  function compute(s) {
    const flags = [];
    const Calc = G.Calc;
    const age = Calc.ageFromBirthDate(s.dataUrodzenia);
    const masa = Calc.parseNum(s.masa);
    const wzrost = Calc.parseNum(s.wzrost);
    const scr = Calc.toMgdl(s.kreatynina, s.jednostkaKreatyniny);
    const ageOk = age !== null && age >= 18 && age <= 120;
    const masaOk = masa !== null && masa >= 30 && masa <= 250;
    const wzrostOk = wzrost !== null && wzrost >= 130 && wzrost <= 230;

    /* Wiek */
    if (age !== null && age < 18) {
      flags.push({ sev: 'alert', title: 'Pacjent poniżej 18 lat', text: 'Kryterium wykluczenia / ścieżka pediatryczna — wymagana odrębna ocena.' });
    }
    if (age !== null && age >= 65) {
      flags.push({ sev: 'warn', title: 'Pacjent starszy (≥65 lat)', text: 'Zwiększone ryzyko działań niepożądanych, upadków i interakcji.' });
    }

    /* BMI */
    const bmi = masaOk && wzrostOk ? Calc.bmi(masa, wzrost) : null;
    if (bmi !== null) {
      const band = Calc.bmiBand(bmi);
      if (band.sev !== 'normal') {
        flags.push({
          sev: band.sev,
          title: 'BMI ' + bmi.toFixed(1).replace('.', ',') + ' kg/m²',
          text: band.label
        });
      }
    }

    /* Ciąża / karmienie piersią */
    if (s.plec === 'k') {
      if (s.ciaza === 'tak' || s.ciaza === 'nw') {
        flags.push({
          sev: 'alert',
          title: 'Ciąża / karmienie piersią',
          text: 'Pacjentka poza zakresem standardowej ścieżki aplikacji. Wymagana indywidualna konsultacja lekarska/farmaceutyczna.'
        });
      } else if (s.ciaza === '') {
        flags.push({
          sev: 'warn',
          title: 'Ciąża / karmienie piersią — brak odpowiedzi',
          text: 'Określ status ciąży/karmienia piersią przed oceną bezpieczeństwa farmakoterapii.'
        });
      }
    }

    /* Choroby współistniejące */
    if (s.choroby.sercowo) {
      flags.push({
        sev: 'warn',
        title: 'Choroby sercowo-naczyniowe',
        text: 'Zachować ostrożność przy NLPZ, szczególnie przy przewlekłym stosowaniu, nadciśnieniu, niewydolności serca, chorobie niedokrwiennej serca, leczeniu przeciwkrzepliwym lub przeciwpłytkowym.'
      });
    }
    if (s.choroby.oddechowe) {
      flags.push({
        sev: 'warn',
        title: 'Choroba układu oddechowego',
        text: 'Zwiększona ostrożność przy opioidach, lekach sedujących, benzodiazepinach, Z-lekach oraz gabapentynoidach.'
      });
    }
    if (s.choroby.przewodpokarmowy) {
      flags.push({
        sev: 'warn',
        title: 'Choroba przewodu pokarmowego',
        text: 'Zwiększone ryzyko działań niepożądanych NLPZ, szczególnie krwawienia z przewodu pokarmowego i zaostrzenia choroby wrzodowej.'
      });
    }
    if (s.choroby.watroba) {
      flags.push({
        sev: 'warn',
        title: 'Choroba wątroby',
        text: 'Konieczna ostrożność przy paracetamolu, opioidach, lekach przeciwdepresyjnych i interakcjach lekowych.'
      });
    }
    if (s.choroby.pchn) {
      flags.push({
        sev: 'warn',
        title: 'Przewlekła choroba nerek',
        text: 'Konieczna ocena eGFR i/lub CrCL oraz ostrożność przy NLPZ, gabapentynoidach, wybranych opioidach i lekach wymagających dostosowania dawki do funkcji nerek.'
      });
      if (scr === null) {
        flags.push({
          sev: 'warn',
          title: 'Brak wyniku kreatyniny',
          text: 'Zaznaczono przewlekłą chorobę nerek — wprowadź kreatyninę i datę oznaczenia, aby ocenić funkcję nerek.'
        });
      }
    }
    if (s.choroby.psychiczne) {
      flags.push({
        sev: 'warn',
        title: 'Zaburzenia zdrowia psychicznego / uzależnienia',
        text: 'Konieczna ostrożność przy opioidach, benzodiazepinach, Z-lekach, gabapentynoidach oraz lekach o potencjale sedującym lub uzależniającym.'
      });
    }

    /* Pozycje szczegółowe (sekcja 3 zakładki 1) */
    const chsz = s.chorobySzczegolowe || {};
    if (chsz.nw_dializa) {
      flags.push({
        sev: 'alert',
        title: 'Dializoterapia',
        text: 'Schyłkowa niewydolność nerek — leki wymagają dostosowania dawkowania; unikać NLPZ i gabapentynoidów bez konsultacji. Ocenę oprzyj na zasadach dawkowania w dializoterapii.'
      });
    }
    if (chsz.in_paliatywna) {
      flags.push({
        sev: 'info',
        title: 'Leczenie paliatywne',
        text: 'Farmakoterapia bólu wg odrębnych wytycznych (drabina WHO) — wymagana współpraca z lekarzem prowadzącym / opieką paliatywną.'
      });
    }

    /* Data oznaczenia kreatyniny */
    if (s.dataKreatyniny) {
      const d = Calc.daysSince(s.dataKreatyniny);
      if (d !== null && d > 182) {
        flags.push({
          sev: 'warn',
          title: 'Nieaktualny wynik kreatyniny',
          text: 'Wynik kreatyniny może być nieaktualny. Rozważ potrzebę aktualnego badania przed oceną bezpieczeństwa farmakoterapii.'
        });
      }
    }

    /* Funkcja nerek */
    if (scr !== null && s.plec && ageOk) {
      const egfr = Calc.ckdEpi(scr, age, s.plec);
      if (egfr !== null && isFinite(egfr)) {
        const b = Calc.egfrBand(egfr);
        flags.push({ sev: b.sev, title: 'eGFR CKD-EPI 2021: ' + Math.round(egfr) + ' ml/min/1,73 m²', text: b.label });
      }
      if (masaOk) {
        const selectedWeight = Calc.crclWeight(s.plec, masa, wzrostOk ? wzrost : null);
        const crcl = Calc.cockcroftGault(scr, age, selectedWeight.weight, s.plec);
        if (crcl !== null && isFinite(crcl)) {
          const cb = Calc.crclBand(crcl);
          flags.push({
            sev: cb.sev,
            title: 'CrCL Cockcroft-Gaulta: ' + Math.round(crcl) + ' ml/min',
            text: cb.label + ' Masa do obliczeń: ' + selectedWeight.mode + ' (' + selectedWeight.weight.toFixed(1).replace('.', ',') + ' kg).'
          });
        }
      }
    }

    return flags;
  }

  G.Flags = { compute: compute };
})();
