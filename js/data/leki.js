/* Baza leków — lista do ręcznej edycji. Format wpisu:
   { nazwa: 'Nazwa handlowa', substancja: 'nazwa substancji', grupa: ['NLPZ', ...] }
   Grupy: NLPZ, paracetamol, opioid, gabapentynoid, benzodiazepina, z-lek,
          IPP, ASA, antyagregant, antykoagulant, SSRI, GKS, sedatywny
   Kolejność wpisów dowolna — aplikacja dopasowuje po nazwie lub substancji. */
(function () {
  const G = typeof window !== 'undefined' ? window : globalThis;

  const BAZA_LEKOW = [
    /* NLPZ */
    { nazwa: 'Ibuprofen', substancja: 'ibuprofen', grupa: ['NLPZ'] },
    { nazwa: 'Ibuprom', substancja: 'ibuprofen', grupa: ['NLPZ'] },
    { nazwa: 'Ibumax', substancja: 'ibuprofen', grupa: ['NLPZ'] },
    { nazwa: 'Nurofen', substancja: 'ibuprofen', grupa: ['NLPZ'] },
    { nazwa: 'Nurofen Forte', substancja: 'ibuprofen', grupa: ['NLPZ'] },
    { nazwa: 'Mefacit', substancja: 'kwas mefenamowy', grupa: ['NLPZ'] },
    { nazwa: 'Dicloberl', substancja: 'diklofenak', grupa: ['NLPZ'] },
    { nazwa: 'Voltaren', substancja: 'diklofenak', grupa: ['NLPZ'] },
    { nazwa: 'Olfen', substancja: 'diklofenak', grupa: ['NLPZ'] },
    { nazwa: 'Naproxen', substancja: 'naproksen', grupa: ['NLPZ'] },
    { nazwa: 'Nalgesin', substancja: 'naproksen', grupa: ['NLPZ'] },
    { nazwa: 'Ketonal', substancja: 'ketoprofen', grupa: ['NLPZ'] },
    { nazwa: 'Meloxicam', substancja: 'meloksykam', grupa: ['NLPZ'] },
    { nazwa: 'Celecoxib', substancja: 'celekoksyb', grupa: ['NLPZ'] },
    /* Paracetamol */
    { nazwa: 'Paracetamol', substancja: 'paracetamol', grupa: ['paracetamol'] },
    { nazwa: 'Apap', substancja: 'paracetamol', grupa: ['paracetamol'] },
    { nazwa: 'Panadol', substancja: 'paracetamol', grupa: ['paracetamol'] },
    { nazwa: 'Paracetamol Apofarm', substancja: 'paracetamol', grupa: ['paracetamol'] },
    /* Opioidy */
    { nazwa: 'Tramadol', substancja: 'tramadol', grupa: ['opioid'] },
    { nazwa: 'Poltram', substancja: 'tramadol', grupa: ['opioid'] },
    { nazwa: 'Tramal', substancja: 'tramadol', grupa: ['opioid'] },
    { nazwa: 'Kodeina', substancja: 'kodeina', grupa: ['opioid'] },
    { nazwa: 'Codeine', substancja: 'kodeina', grupa: ['opioid'] },
    { nazwa: 'OxyContin', substancja: 'oksykodon', grupa: ['opioid'] },
    { nazwa: 'Oxycodone', substancja: 'oksykodon', grupa: ['opioid'] },
    { nazwa: 'Morfina', substancja: 'morfina', grupa: ['opioid'] },
    { nazwa: 'MST Continus', substancja: 'morfina', grupa: ['opioid'] },
    { nazwa: 'Fentanyl', substancja: 'fentanyl', grupa: ['opioid'] },
    { nazwa: 'Buprenorphine', substancja: 'buprenorfina', grupa: ['opioid'] },
    { nazwa: 'Targin', substancja: 'oksykodon + nalokson', grupa: ['opioid'] },
    { nazwa: 'Tramadol + Paracetamol', substancja: 'tramadol + paracetamol', grupa: ['opioid', 'paracetamol'] },
    /* Gabapentynoidy */
    { nazwa: 'Pregabalin', substancja: 'pregabalina', grupa: ['gabapentynoid'] },
    { nazwa: 'Lyrica', substancja: 'pregabalina', grupa: ['gabapentynoid'] },
    { nazwa: 'Pregabalin Bluefish', substancja: 'pregabalina', grupa: ['gabapentynoid'] },
    { nazwa: 'Gabapentin', substancja: 'gabapentyna', grupa: ['gabapentynoid'] },
    { nazwa: 'Neurontin', substancja: 'gabapentyna', grupa: ['gabapentynoid'] },
    /* Benzodiazepiny */
    { nazwa: 'Diazepam', substancja: 'diazepam', grupa: ['benzodiazepina'] },
    { nazwa: 'Relanium', substancja: 'diazepam', grupa: ['benzodiazepina'] },
    { nazwa: 'Oxazepam', substancja: 'oksazepam', grupa: ['benzodiazepina'] },
    { nazwa: 'Lorazepam', substancja: 'lorazepam', grupa: ['benzodiazepina'] },
    { nazwa: 'Clonazepam', substancja: 'klonazepam', grupa: ['benzodiazepina'] },
    /* Z-leki */
    { nazwa: 'Zolpidem', substancja: 'zolpidem', grupa: ['z-lek'] },
    { nazwa: 'Stilnox', substancja: 'zolpidem', grupa: ['z-lek'] },
    { nazwa: 'Zopiclon', substancja: 'zopiklon', grupa: ['z-lek'] },
    /* IPP */
    { nazwa: 'Omeprazol', substancja: 'omeprazol', grupa: ['IPP'] },
    { nazwa: 'Prazolex', substancja: 'omeprazol', grupa: ['IPP'] },
    { nazwa: 'Helicid', substancja: 'omeprazol', grupa: ['IPP'] },
    { nazwa: 'Nexium', substancja: 'ezomeprazol', grupa: ['IPP'] },
    { nazwa: 'Pantoprazole', substancja: 'pantoprazol', grupa: ['IPP'] },
    { nazwa: 'Pantasop', substancja: 'pantoprazol', grupa: ['IPP'] },
    /* ASA / antyagreganty / antykoagulanty */
    { nazwa: 'Aspirin', substancja: 'kwas acetylosalicylowy', grupa: ['ASA', 'NLPZ'] },
    { nazwa: 'Polocard', substancja: 'kwas acetylosalicylowy', grupa: ['ASA', 'antyagregant'] },
    { nazwa: 'Acard', substancja: 'kwas acetylosalicylowy', grupa: ['ASA', 'antyagregant'] },
    { nazwa: 'Clopidogrel', substancja: 'klopidogrel', grupa: ['antyagregant'] },
    { nazwa: 'Plavix', substancja: 'klopidogrel', grupa: ['antyagregant'] },
    { nazwa: 'Ticagrelor', substancja: 'tikagrelor', grupa: ['antyagregant'] },
    { nazwa: 'Warfin', substancja: 'warfaryna', grupa: ['antykoagulant'] },
    { nazwa: 'Acenocumarol', substancja: 'acenokumarol', grupa: ['antykoagulant'] },
    { nazwa: 'Xarelto', substancja: 'rywaroksaban', grupa: ['antykoagulant'] },
    { nazwa: 'Eliquis', substancja: 'apiksaban', grupa: ['antykoagulant'] },
    { nazwa: 'Pradaxa', substancja: 'dabigatran', grupa: ['antykoagulant'] },
    { nazwa: 'Heparin', substancja: 'heparyna', grupa: ['antykoagulant'] },
    /* SSRI */
    { nazwa: 'Sertralina', substancja: 'sertralina', grupa: ['SSRI'] },
    { nazwa: 'Setaloft', substancja: 'sertralina', grupa: ['SSRI'] },
    { nazwa: 'Escitalopram', substancja: 'eskitalopram', grupa: ['SSRI'] },
    { nazwa: 'Lexapro', substancja: 'eskitalopram', grupa: ['SSRI'] },
    { nazwa: 'Fluoxetine', substancja: 'fluoksetyna', grupa: ['SSRI'] },
    { nazwa: 'Paroxetine', substancja: 'paroksetyna', grupa: ['SSRI'] },
    /* GKS */
    { nazwa: 'Metipred', substancja: 'metyloprednizolon', grupa: ['GKS'] },
    { nazwa: 'Encorton', substancja: 'prednizon', grupa: ['GKS'] },
    { nazwa: 'Dexamethasone', substancja: 'deksametazon', grupa: ['GKS'] },
    { nazwa: 'Hydrocortisone', substancja: 'hydrokortyzon', grupa: ['GKS'] }
  ];

  const GRUPA_LABEL = {
    'NLPZ': 'NLPZ',
    'paracetamol': 'Paracetamol',
    'opioid': 'Opioid',
    'gabapentynoid': 'Gabapentynoid',
    'benzodiazepina': 'Benzodiazepina',
    'z-lek': 'Z-lek (nasenny)',
    'IPP': 'IPP',
    'ASA': 'ASA',
    'antyagregant': 'Antyagregant',
    'antykoagulant': 'Antykoagulant',
    'SSRI': 'SSRI',
    'GKS': 'GKS (steryd)',
    'sedatywny': 'Lek sedatywny'
  };

  const GRUPA_IDS = Object.keys(GRUPA_LABEL);

  function normalize(s) {
    return String(s || '').toLowerCase()
      .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e')
      .replace(/ł/g, 'l').replace(/ń/g, 'n').replace(/ó/g, 'o')
      .replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z')
      .trim();
  }

  /* Zwraca grupy dla podanej nazwy (po nazwie handlowej lub substancji), [] gdy brak. */
  function znajdzGrupy(nazwa) {
    const n = normalize(nazwa);
    if (!n) return [];
    for (let i = 0; i < BAZA_LEKOW.length; i++) {
      const e = BAZA_LEKOW[i];
      if (normalize(e.nazwa) === n || normalize(e.substancja) === n) return e.grupa.slice();
    }
    return [];
  }

  G.BAZA_LEKOW = BAZA_LEKOW;
  G.GRUPA_LABEL = GRUPA_LABEL;
  G.GRUPA_IDS = GRUPA_IDS;
  G.Leki = { znajdzGrupy: znajdzGrupy, normalize: normalize };
})();
