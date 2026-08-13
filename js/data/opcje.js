/* Jedno źródło prawdy dla list opcji (radio / checkbox / select) używanych w zakładkach
   oraz przez etykiety raportu (etykiety.js). Każda dziedzina to lista par [wartość, etykieta].
   Zakładki odwołują się do G.OPCJE.*, a raport do G.E.* (zbudowanego z G.OPCJE),
   dzięki czemu teksty nie mogą się rozjechać między UI a raportem.

   Uwaga: bgInterpretacja (raport, mianownik) i bgInterpretacjaOpcje (radio 6.7, narzędnik
   po „z …”) różnią się formą gramatyczną — celowo są osobnymi dziedzinami. */
(function () {
  const G = typeof window !== 'undefined' ? window : globalThis;

  const OPCJE = {
    /* --- Wspólne (zakładka 1) --- */
    plec: [['k', 'Kobieta'], ['m', 'Mężczyzna']],
    ciaza: [['tak', 'Tak'], ['nie', 'Nie'], ['nda', 'Nie dotyczy'], ['nw', 'Nie wiem']],
    takNieNw: [['tak', 'Tak'], ['nie', 'Nie'], ['nw', 'Nie wiem']],
    jednostkaKreatyniny: [['mgdl', 'mg/dL'], ['umol', 'µmol/L']],
    albuminuria: [
      ['brak', 'Brak danych'], ['a1', 'Prawidłowa / A1'], ['a2', 'Umiarkowanie zwiększona / A2'],
      ['a3', 'Znacznie zwiększona / A3'], ['liczba', 'Wartość liczbowa dostępna']
    ],
    uacrJednostka: [['mgg', 'mg/g'], ['mgmmol', 'mg/mmol']],

    /* --- MARS-5 (zakładka 3) --- */
    marsPytania: [
      ['m1', 'Zapomnieć o zażyciu leków'],
      ['m2', 'Zmienić dawkę leku'],
      ['m3', 'Przestać zażywać leki na jakiś czas'],
      ['m4', 'Pominąć dawkę'],
      ['m5', 'Zażyć mniej leku niż zalecono']
    ],
    marsSkala: [
      ['ciagle', 'Ciągle (1)'], ['czesto', 'Często (2)'], ['czasami', 'Czasami (3)'],
      ['rzadko', 'Rzadko (4)'], ['nigdy', 'Nigdy (5)']
    ],

    /* --- Ocena bólu (zakładka 4) --- */
    skalaOcena: [['nrs', 'NRS 0-10'], ['vas', 'VAS'], ['vrs', 'VRS'], ['fps', 'FPS'], ['inna', 'Inna']],
    wplywPytania: [
      ['nastroj', 'Czy ból wpływa na nastrój?'],
      ['sen', 'Czy ból wpływa na sen?'],
      ['funkcjonowanie', 'Czy ból wpływa na codzienne funkcjonowanie?'],
      ['praca', 'Czy ból wpływa na pracę zawodową?']
    ],
    wplyw: [['nie', 'Nie'], ['umiarkowanie', 'Umiarkowanie'], ['znacznie', 'Znacznie']],
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
    obPrzebieg: [
      ['staly', 'Stały'], ['nawracajacy', 'Nawracający'], ['napadowy', 'Napadowy'], ['zmienny', 'Zmienny w ciągu dnia']
    ],
    zmniejsza: [
      ['tak', 'Tak, wyraźnie'], ['czesciowo', 'Częściowo'], ['nie', 'Nie'],
      ['trudno', 'Trudno powiedzieć'], ['brak-leczenia', 'Pacjent nie stosuje leczenia przeciwbólowego']
    ],

    /* --- Kontrola bólu (zakładka 5) --- */
    skalaTryb: [['ta-sama', 'Ta sama skala co poprzednio'], ['inna', 'Inna skala']],
    ulga: [
      ['calkowita', 'Całkowita ulga w bólu'], ['umiarkowana', 'Umiarkowana ulga w bólu'],
      ['mala', 'Mała ulga w bólu'], ['brak', 'Brak ulgi w bólu']
    ],
    satysfakcja: [
      ['duza', 'Duża satysfakcja'], ['umiarkowana', 'Umiarkowana satysfakcja'],
      ['mala', 'Mała satysfakcja'], ['brak', 'Brak satysfakcji']
    ],
    miedzy: [['tak', 'Tak'], ['nie', 'Nie'], ['nda', 'Nie dotyczy'], ['trudno', 'Trudno ocenić']],
    dnLista: [
      ['sennosc', 'Senność / spowolnienie'], ['zawroty', 'Zawroty głowy'], ['nudnosci', 'Nudności / wymioty'],
      ['zaparcia', 'Zaparcia'], ['zoladek', 'Dolegliwości żołądkowe'], ['krwawienie', 'Krwawienie / smoliste stolce'],
      ['obrzeki', 'Obrzęki'], ['dusznosc', 'Duszność'], ['splatanie', 'Splątanie'], ['upadki', 'Upadki'],
      ['wysypka', 'Wysypka / świąd'], ['inne', 'Inne']
    ],
    dnOdp: [['nie', 'Nie'], ['tak', 'Tak'], ['nw', 'Nie wiem']],
    dnKorygowane: [['tak', 'Tak'], ['nie', 'Nie'], ['nda', 'Nie dotyczy'], ['wymaga', 'Wymaga oceny']],
    zmiana: [['nie', 'Nie'], ['tak', 'Tak'], ['nw', 'Nie wiem']],
    statusKontroli: [
      ['dobra', 'Dobra kontrola bólu'], ['czesciowa', 'Częściowa kontrola bólu'],
      ['niewystarczajaca', 'Niewystarczająca kontrola bólu'], ['trudna', 'Kontrola trudna do oceny']
    ],

    /* --- Ból głowy (zakładka 6) --- */
    bgAlarmowe: [
      ['nagly', 'Nagły, pierwszy w życiu bardzo silny ból głowy'],
      ['narastajacy', 'Ból szybko narastający lub „rozsadzający”'],
      ['po-50', 'Nowy ból głowy po 50. roku życia'],
      ['uraz', 'Ból głowy po urazie'],
      ['goraczka', 'Gorączka, sztywność karku, wysypka'],
      ['neurologiczne', 'Zaburzenia widzenia, mowy, chodu lub świadomości'],
      ['ogniskowe', 'Ogniskowe objawy neurologiczne'],
      ['oko', 'Silny ból oka z zaczerwienieniem / łzawieniem'],
      ['pozycyjny', 'Ból głowy nasilany kaszlem, kichaniem, wysiłkiem lub zmianą pozycji'],
      ['wzorzec', 'Ból „inny niż zwykle” lub zmiana dotychczasowego wzorca bólu'],
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
    bgAktywnosc: [['nie', 'Nie'], ['tak', 'Tak'], ['nw', 'Nie wiem']],
    bgCzasTrwania: [
      ['<4h', '<4 godziny'], ['4-72h', '4–72 godziny'],
      ['>72h', '>72 godziny'], ['trudno', 'Trudno określić']
    ],
    bgObjawy: [
      ['brak', 'Brak objawów towarzyszących'], ['swiatlowstret', 'Światłowstręt'], ['dzwieki', 'Nadwrażliwość na dźwięki'],
      ['nudnosci', 'Nudności'], ['wymioty', 'Wymioty'], ['aura', 'Aura'],
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
    bgMohOcena: [
      ['brak', 'Brak cech nadużywania'],
      ['mozliwe', 'Możliwe nadużywanie leków doraźnych'],
      ['wysokie', 'Wysokie ryzyko MOH'],
      ['wymaga-oceny', 'Wymaga pogłębionej oceny / kontaktu z lekarzem']
    ],
    bgInterpretacjaOpcje: [
      ['tth', 'Napięciowym bólem głowy'],
      ['migrena', 'Migreną'],
      ['moh', 'Możliwym bólem głowy z nadużywania leków'],
      ['zatokowy', 'Możliwym bólem zatokowym'],
      ['klaster', 'Możliwym klasterowym bólem głowy'],
      ['wtorny', 'Bólem wtórnym wymagającym konsultacji'],
      ['trudno', 'Nie można ocenić']
    ],
    bgInterpretacja: [
      ['tth', 'Napięciowy ból głowy'],
      ['migrena', 'Migrena'],
      ['moh', 'Ból głowy z nadużywania leków'],
      ['zatokowy', 'Ból zatokowy'],
      ['klaster', 'Klasterowy ból głowy'],
      ['wtorny', 'Ból wtórny wymagający konsultacji'],
      ['trudno', 'Nie można ocenić']
    ],
    bgEdukacja: [
      ['alarm', 'Rozpoznawanie objawów alarmowych'],
      ['bezpieczne', 'Bezpieczne stosowanie leków przeciwbólowych'],
      ['limit', 'Ograniczenie leków doraźnych, aby zmniejszyć ryzyko MOH'],
      ['nawodnienie', 'Nawodnienie i regularne posiłki'],
      ['sen', 'Sen i higiena snu'],
      ['stres', 'Stres i techniki relaksacyjne'],
      ['komputer', 'Przerwy w pracy przy komputerze / ergonomia'],
      ['kark', 'Napięcie karku, postawa i aktywność fizyczna'],
      ['dzienniczek', 'Prowadzenie dzienniczka bólu głowy']
    ],

    /* --- Migrena (zakładka 7) --- */
    mgRozpoznana: [['lekarz', 'Tak, przez lekarza'], ['pacjent', 'Tak, według pacjenta'], ['nie', 'Nie'], ['nw', 'Nie wiem']],
    mgProdrom: [
      ['ziewanie', 'Ziewanie'], ['nastroj', 'Zmiana nastroju'], ['sennosc', 'Senność'],
      ['glod', 'Głód / zachcianki'], ['kark', 'Sztywność karku'], ['koncentracja', 'Trudności z koncentracją'],
      ['rozpoznaje', 'Pacjent rozpoznaje prodrom'], ['brak', 'Brak / nie wiem']
    ],
    /* Rodzaje aury (7.3) — wielokrotny wybór; „nw” pozostaje osobną opcją.
       Sekcja 7.3 odblokowuje się po zaznaczeniu „Aura” w 6.4 (bolGlowy.objawy.aura). */
    mgAura: [
      ['wzrokowa', 'Wzrokowa'], ['czuciowa', 'Czuciowa'], ['mowy', 'Zaburzenia mowy'],
      ['inna', 'Inna'], ['nw', 'Nie wiem']
    ],
    mgAuraCzas: [['<5', '<5 minut'], ['5-60', '5–60 minut'], ['>60', '>60 minut'], ['trudno', 'Trudno określić']],
    mgAuraOst: [
      ['oslabienie', 'Osłabienie kończyny / niedowład'], ['podwojne', 'Podwójne widzenie'],
      ['rownowaga', 'Zaburzenia równowagi'], ['swiadomosc', 'Zaburzenia świadomości'],
      ['jedno-oko', 'Objawy tylko w jednym oku'], ['dluga', 'Aura trwa >60 minut'],
      ['nowa', 'Aura nowa lub istotnie inna niż zwykle'], ['brak', 'Brak powyższych']
    ],
    mgWczesnie: [
      ['wczesnie', 'Tak, gdy ból jest jeszcze łagodny'], ['pozno', 'Tak, ale dopiero przy umiarkowanym/silnym bólu'],
      ['za-pozno', 'Zwykle za późno'], ['nw', 'Nie wiem']
    ],
    mgSkutecznosc: [
      ['wolnosc', 'Tak — wolność od bólu po 2 h'], ['poprawa', 'Częściowa poprawa'],
      ['brak', 'Brak odpowiedzi'], ['nw', 'Nie wiem']
    ],
    mgNawrot: [['nie', 'Nie'], ['sporadycznie', 'Tak, sporadycznie'], ['czesto', 'Tak, często'], ['nw', 'Nie wiem']],
    mgWymioty: [['nie', 'Nie'], ['tak', 'Tak'], ['nw', 'Nie wiem']],
    mgProfKryteria: [
      ['72h', 'Napad trwa >72 godziny'],
      ['wplyw', 'Istotny wpływ migreny na życie / pracę / funkcjonowanie'],
      ['nieskuteczne', 'Leczenie doraźne jest nieskuteczne mimo prawidłowego stosowania'],
      ['czeste-dorzane', 'Częste stosowanie leków doraźnych'],
      ['aura', 'Migrena z aurą o dużym nasileniu lub przedłużona aura'],
      ['przewlekla', 'Przewlekła migrena'], ['brak', 'Brak wskazań na tym etapie']
    ],
    mgProfStos: [['nie', 'Nie'], ['tak', 'Tak'], ['nw', 'Nie wiem']],
    mgProfEfekt: [
      ['tak', 'Tak, wyraźnie'], ['czesciowo', 'Częściowo'], ['nie', 'Nie'],
      ['za-wczesnie', 'Za wcześnie na ocenę'], ['nw', 'Nie wiem']
    ],
    mgKrok: [
      ['edukacja', 'Edukacja i kontynuacja obserwacji'],
      ['optymalizacja', 'Optymalizacja stosowania leczenia doraźnego'],
      ['bezpieczenstwo', 'Ocena bezpieczeństwa leków doraźnych'],
      ['ograniczenie', 'Ograniczenie nadużywania leków doraźnych'],
      ['profilaktyka', 'Rozważenie konsultacji lekarskiej w sprawie profilaktyki'],
      ['pilna', 'Pilna konsultacja z powodu czerwonych flag'],
      ['ogolny', 'Przejście do modułu ogólnego bólu przewlekłego'],
      ['inne', 'Inne']
    ]
  };

  G.OPCJE = OPCJE;
})();
