/* Centralne etykiety opcji i pozycji checkboxów — używane przez raport (tab9).
   Każda dziedzina to albo mapa { id: 'etykieta' }, albo lista [id, etykieta]. */
(function () {
  const G = typeof window !== 'undefined' ? window : globalThis;

  const E = {
    plec: { k: 'Kobieta', m: 'Mężczyzna' },
    ciaza: { tak: 'Tak', nie: 'Nie', nda: 'Nie dotyczy', nw: 'Nie wiem' },
    tryb: { dorazne: 'Doraźnie', przewlekle: 'Przewlekle' },
    jednostkaKreatyniny: { mgdl: 'mg/dL', umol: 'µmol/L' },
    albuminuria: { brak: 'Brak danych', a1: 'Prawidłowa / A1', a2: 'Umiarkowanie zwiększona / A2', a3: 'Znacznie zwiększona / A3', liczba: 'Wartość liczbowa' },
    /* Ocena bólu */
    skalaOcena: { nrs: 'NRS 0-10', vas: 'VAS', vrs: 'VRS', fps: 'FPS', inna: 'Inna' },
    wplyw: { nie: 'Nie', umiarkowanie: 'Umiarkowanie', znacznie: 'Znacznie' },
    obLokalizacje: [
      ['glowa', 'Głowa'], ['twarz', 'Twarz / okolica szczękowo-twarzowa'], ['szyja', 'Szyja'],
      ['bark', 'Bark / kończyna górna'], ['kr_szyjny', 'Kręgosłup szyjny'], ['kr_piersiowy', 'Kręgosłup piersiowy'],
      ['kr_ledzwiowy', 'Kręgosłup lędźwiowo-krzyżowy'], ['klatka', 'Klatka piersiowa'], ['brzuch', 'Brzuch'],
      ['miednica', 'Miednica'], ['biodro', 'Biodro / kończyna dolna'], ['stopy', 'Stopy'],
      ['wielomiejscowy', 'Ból wielomiejscowy'], ['inne', 'Inne']
    ],
    obCharakter: [
      ['tepy', 'Tępy'], ['ostry', 'Ostry'], ['piekacy', 'Piekący / palący'], ['klujacy', 'Kłujący'],
      ['razenie', 'Jak rażenie prądem'], ['pulsujacy', 'Pulsujący'], ['uciskajacy', 'Uciskający'],
      ['rozpierajacy', 'Rozpierający'], ['dretwienie', 'Drętwienie / mrowienie'], ['inny', 'Inny']
    ],
    obPrzebieg: { staly: 'Stały', nawracajacy: 'Nawracający', napadowy: 'Napadowy', zmienny: 'Zmienny w ciągu dnia' },
    zmniejsza: {
      tak: 'Tak, wyraźnie', czesciowo: 'Częściowo', nie: 'Nie', trudno: 'Trudno powiedzieć',
      'brak-leczenia': 'Pacjent nie stosuje leczenia przeciwbólowego'
    },
    /* Kontrola bólu */
    skalaTryb: { 'ta-sama': 'Ta sama skala co poprzednio', inna: 'Inna skala' },
    ulga: { calkowita: 'Całkowita ulga w bólu', umiarkowana: 'Umiarkowana ulga w bólu', mala: 'Mała ulga w bólu', brak: 'Brak ulgi w bólu' },
    satysfakcja: { duza: 'Duża satysfakcja', umiarkowana: 'Umiarkowana satysfakcja', mala: 'Mała satysfakcja', brak: 'Brak satysfakcji' },
    miedzy: { tak: 'Tak', nie: 'Nie', nda: 'Nie dotyczy', trudno: 'Trudno ocenić' },
    dnLista: [
      ['sennosc', 'Senność / spowolnienie'], ['zawroty', 'Zawroty głowy'], ['nudnosci', 'Nudności / wymioty'],
      ['zaparcia', 'Zaparcia'], ['zoladek', 'Dolegliwości żołądkowe'], ['krwawienie', 'Krwawienie / smoliste stolce'],
      ['obrzeki', 'Obrzęki'], ['dusznosc', 'Duszność'], ['splatanie', 'Splątanie'], ['upadki', 'Upadki'],
      ['wysypka', 'Wysypka / świąd'], ['inne', 'Inne']
    ],
    dnKorygowane: { tak: 'Tak', nie: 'Nie', nda: 'Nie dotyczy', wymaga: 'Wymaga oceny' },
    zmiana: { nie: 'Nie', tak: 'Tak', nw: 'Nie wiem' },
    statusKontroli: {
      dobra: 'Dobra kontrola bólu', czesciowa: 'Częściowa kontrola bólu',
      niewystarczajaca: 'Niewystarczająca kontrola bólu', trudna: 'Kontrola trudna do oceny'
    },
    /* Ból głowy */
    bgAlarmowe: [
      ['nagly', 'Nagły, pierwszy w życiu bardzo silny ból głowy'],
      ['narastajacy', 'Ból szybko narastający lub „rozsadzający”'],
      ['po-50', 'Nowy ból głowy po 50. roku życia'],
      ['uraz', 'Ból głowy po urazie'],
      ['goraczka', 'Gorączka, sztywność karku, wysypka'],
      ['neurologiczne', 'Zaburzenia widzenia, mowy, chodu lub świadomości'],
      ['ogniskowe', 'Ogniskowe objawy neurologiczne'],
      ['oko', 'Silny ból oka z zaczerwienieniem / łzawieniem'],
      ['pozycyjny', 'Ból nasilany kaszlem, kichaniem, wysiłkiem lub zmianą pozycji'],
      ['wzorzec', 'Ból „inny niż zwykle” lub zmiana wzorca bólu'],
      ['cisnienie', 'Ciśnienie tętnicze >180/110 mmHg'],
      ['ciaza-polog', 'Ciąża lub połóg'],
      ['brak', 'Brak powyższych']
    ],
    bgLokalizacje: [
      ['obustronny', 'Obustronny'], ['jednostronny', 'Jednostronny'], ['czolo-skronie', 'Czoło / skronie'],
      ['potylica-kark', 'Potylica / kark'], ['zatoki', 'Okolica zatok / twarz'], ['okolica-oka', 'Okolica oka'],
      ['cala-glowa', 'Cała głowa'], ['inna', 'Inna']
    ],
    bgCharakter: [
      ['uciskowy', 'Uciskowy / opasujący'], ['tepy', 'Tępy'], ['rozpierajacy', 'Rozpierający'],
      ['pulsujacy', 'Pulsujący'], ['przeszywajacy', 'Przeszywający / świdrujący'], ['piekacy', 'Piekący'], ['inny', 'Inny']
    ],
    bgNasilenie: { lagodny: 'Łagodny', umiarkowany: 'Umiarkowany', silny: 'Silny' },
    bgAktywnosc: { nie: 'Nie', tak: 'Tak', nw: 'Nie wiem' },
    bgCzasTrwania: { '<30': '<30 minut', '30-7d': '30 minut do 7 dni', '>7d': '>7 dni', trudno: 'Trudno określić' },
    bgCzestosc: {
      rzadki: 'Rzadki epizodyczny napięciowy ból głowy (<1 dzień/mies.)',
      czesty: 'Częsty epizodyczny napięciowy ból głowy (1–14 dni/mies. przez >3 mies.)',
      przewlekly: 'Możliwy przewlekły napięciowy ból głowy (≥15 dni/mies. przez >3 mies.)'
    },
    bgObjawy: [
      ['brak', 'Brak objawów towarzyszących'], ['swiatlowstret', 'Światłowstręt'], ['dzwieki', 'Nadwrażliwość na dźwięki'],
      ['nudnosci', 'Nudności'], ['wymioty', 'Wymioty'], ['aura', 'Aura / zaburzenia widzenia'],
      ['lzawienie', 'Łzawienie / zaczerwienienie oka'], ['katar', 'Katar / zatkanie nosa'], ['goraczka', 'Gorączka'],
      ['zawroty', 'Zawroty głowy'], ['inne', 'Inne']
    ],
    bgWyzwalacze: [
      ['stres', 'Stres'], ['brak-snu', 'Brak snu'], ['zmeczenie', 'Zmęczenie'], ['glod', 'Głód / pomijanie posiłków'],
      ['odwodnienie', 'Odwodnienie'], ['komputer', 'Praca przy komputerze / wzrok'], ['napiecie-karku', 'Napięcie karku / zła postawa'],
      ['alkohol', 'Alkohol'], ['zapachy', 'Zapachy / światło / hałas'], ['miesiaczka', 'Miesiączka / hormony'],
      ['nw', 'Nie wiem'], ['inne', 'Inne']
    ],
    bgUlga: [
      ['odpoczynek', 'Odpoczynek'], ['sen', 'Sen'], ['nawodnienie', 'Nawodnienie / posiłek'],
      ['masaz', 'Masaż / rozluźnienie karku'], ['lek', 'Lek przeciwbólowy'], ['ciemne', 'Ciemne i ciche pomieszczenie'],
      ['nic', 'Nic nie pomaga'], ['inne', 'Inne']
    ],
    bgMohOcena: {
      brak: 'Brak cech nadużywania', mozliwe: 'Możliwe nadużywanie leków doraźnych',
      wysokie: 'Wysokie ryzyko MOH', 'wymaga-oceny': 'Wymaga pogłębionej oceny / kontaktu z lekarzem'
    },
    bgInterpretacja: {
      tth: 'Napięciowy ból głowy', migrena: 'Migrena', moh: 'Ból głowy z nadużywania leków',
      zatokowy: 'Ból zatokowy', klaster: 'Klasterowy ból głowy',
      wtorny: 'Ból wtórny wymagający konsultacji', trudno: 'Nie można ocenić'
    },
    bgEdukacja: [
      ['alarm', 'Rozpoznawanie objawów alarmowych'],
      ['bezpieczne', 'Bezpieczne stosowanie leków przeciwbólowych'],
      ['limit', 'Ograniczenie leków doraźnych (ryzyko MOH)'],
      ['nawodnienie', 'Nawodnienie i regularne posiłki'],
      ['sen', 'Sen i higiena snu'],
      ['stres', 'Stres i techniki relaksacyjne'],
      ['komputer', 'Przerwy w pracy przy komputerze / ergonomia'],
      ['kark', 'Napięcie karku, postawa i aktywność fizyczna'],
      ['dzienniczek', 'Prowadzenie dzienniczka bólu głowy']
    ],
    /* Migrena */
    mgRozpoznana: { lekarz: 'Tak, przez lekarza', pacjent: 'Tak, według pacjenta', nie: 'Nie', nw: 'Nie wiem' },
    mgCzas: { '<4': '<4 godziny', '4-72': '4–72 godziny', '>72': '>72 godziny', trudno: 'Trudno określić' },
    mgObjawy: [
      ['nudnosci', 'Nudności'], ['wymioty', 'Wymioty'], ['swiatlowstret', 'Światłowstręt'],
      ['fonofobia', 'Fonofobia'], ['zapachy', 'Nadwrażliwość na zapachy'], ['zawroty', 'Zawroty głowy'],
      ['pozycja', 'Potrzeba położenia się / ograniczenia aktywności'], ['brak', 'Brak objawów towarzyszących']
    ],
    mgProdrom: [
      ['ziewanie', 'Ziewanie'], ['nastroj', 'Zmiana nastroju'], ['sennosc', 'Senność'],
      ['glod', 'Głód / zachcianki'], ['kark', 'Sztywność karku'], ['koncentracja', 'Trudności z koncentracją'],
      ['rozpoznaje', 'Pacjent rozpoznaje prodrom'], ['brak', 'Brak / nie wiem']
    ],
    mgAura: { nie: 'Nie', wzrokowa: 'Tak, wzrokowa', czuciowa: 'Tak, czuciowa', mowy: 'Tak, zaburzenia mowy', inna: 'Tak, inna', nw: 'Nie wiem' },
    mgAuraCzas: { '<5': '<5 minut', '5-60': '5–60 minut', '>60': '>60 minut', trudno: 'Trudno określić' },
    mgAuraOst: [
      ['oslabienie', 'Osłabienie kończyny / niedowład'], ['podwojne', 'Podwójne widzenie'],
      ['rownowaga', 'Zaburzenia równowagi'], ['swiadomosc', 'Zaburzenia świadomości'],
      ['jedno-oko', 'Objawy tylko w jednym oku'], ['dluga', 'Aura trwa >60 minut'],
      ['nowa', 'Aura nowa lub istotnie inna niż zwykle'], ['brak', 'Brak powyższych']
    ],
    mgCzFlagi: [
      ['piorunujacy', 'Nagły, piorunujący ból głowy'], ['po-50', 'Nowy ból głowy po 50. roku życia'],
      ['goraczka', 'Ból głowy z gorączką, sztywnością karku lub wysypką'], ['deficyt', 'Nowy deficyt neurologiczny'],
      ['swiadomosc', 'Zaburzenia świadomości lub splątanie'], ['uraz', 'Ból po urazie głowy'],
      ['kaszlel', 'Ból nasilany kaszlem, parciem, wysiłkiem lub zmianą pozycji'],
      ['wzorzec', 'Istotna zmiana wzorca bólu'],
      ['immunosupresja', 'Nowy ból głowy u pacjenta z immunosupresją'],
      ['nowotwor', 'Nowy ból głowy u pacjenta z chorobą nowotworową w wywiadzie'], ['brak', 'Brak powyższych']
    ],
    mgWplyw: [
      ['praca', 'Pracę / naukę'], ['dom', 'Obowiązki domowe'], ['fizyczna', 'Aktywność fizyczną'],
      ['rodzina', 'Życie rodzinne / społeczne'], ['sen', 'Sen'], ['nastroj', 'Nastrój'], ['brak', 'Brak istotnego wpływu']
    ],
    mgWczesnie: {
      wczesnie: 'Tak, gdy ból jest jeszcze łagodny', pozno: 'Tak, ale dopiero przy umiarkowanym/silnym bólu',
      'za-pozno': 'Zwykle za późno', nw: 'Nie wiem'
    },
    mgSkutecznosc: { wolnosc: 'Wolność od bólu po 2 h', poprawa: 'Częściowa poprawa', brak: 'Brak odpowiedzi', nw: 'Nie wiem' },
    mgNawrot: { nie: 'Nie', sporadycznie: 'Tak, sporadycznie', czesto: 'Tak, często', nw: 'Nie wiem' },
    mgWymioty: { nie: 'Nie', tak: 'Tak', nw: 'Nie wiem' },
    mgMohStatus: { niskie: 'Niskie ryzyko', mozliwe: 'Możliwe ryzyko', wysokie: 'Wysokie ryzyko', 'wymaga-oceny': 'Wymaga oceny lekarskiej' },
    mgProfKryteria: [
      ['4-dni', '≥4 dni z bólem głowy w miesiącu'],
      ['wplyw', 'Istotny wpływ migreny na życie / pracę / funkcjonowanie'],
      ['nieskuteczne', 'Leczenie doraźne nieskuteczne mimo prawidłowego stosowania'],
      ['czeste-dorzane', 'Częste stosowanie leków doraźnych'],
      ['aura', 'Migrena z aurą o dużym nasileniu lub przedłużona aura'],
      ['przewlekla', 'Przewlekła migrena'], ['brak', 'Brak wskazań na tym etapie']
    ],
    mgProfStos: { nie: 'Nie', tak: 'Tak', nw: 'Nie wiem' },
    mgProfEfekt: { tak: 'Tak, wyraźnie', czesciowo: 'Częściowo', nie: 'Nie', 'za-wczesnie': 'Za wcześnie na ocenę', nw: 'Nie wiem' },
    mgEdukacja: [
      ['wczesnie', 'Przyjmowanie leku doraźnego wcześnie w fazie bólu'],
      ['aura-tryptan', 'Nieprzyjmowanie tryptanu wyłącznie w fazie aury'],
      ['limit-dni', 'Ograniczanie liczby dni stosowania leków doraźnych'],
      ['moh', 'Ryzyko bólu głowy z nadużywania leków'],
      ['dzienniczek', 'Prowadzenie dzienniczka bólu głowy'],
      ['alarm', 'Rozpoznawanie objawów alarmowych'],
      ['pomoc', 'Kiedy szukać pomocy lekarskiej'],
      ['profilaktyka', 'Potrzebę konsultacji w sprawie profilaktyki']
    ],
    mgKrok: {
      edukacja: 'Edukacja i kontynuacja obserwacji',
      optymalizacja: 'Optymalizacja stosowania leczenia doraźnego',
      bezpieczenstwo: 'Ocena bezpieczeństwa leków doraźnych',
      ograniczenie: 'Ograniczenie nadużywania leków doraźnych',
      profilaktyka: 'Rozważenie konsultacji lekarskiej w sprawie profilaktyki',
      pilna: 'Pilna konsultacja z powodu czerwonych flag',
      ogolny: 'Przejście do modułu ogólnego bólu przewlekłego',
      inne: 'Inne'
    }
  };

  G.E = {
    label: function (domain, id) {
      const m = E[domain];
      if (!m) return (id == null ? '' : String(id));
      if (Array.isArray(m)) {
        const f = m.find(function (x) { return x[0] === id; });
        return f ? f[1] : (id == null ? '' : String(id));
      }
      return m[id] || (id == null ? '' : String(id));
    },
    lista: function (domain, obj) {
      const out = [];
      (E[domain] || []).forEach(function (x) {
        if (obj && obj[x[0]]) out.push(x[1]);
      });
      return out;
    },
    skroty: function (domain, obj) {
      return G.E.lista(domain, obj).join(', ');
    }
  };
})();
