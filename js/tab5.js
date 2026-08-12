/* Zakładka 5: Kontrola bólu. */
(function () {
  const h = UI.h;
  const G = typeof window !== 'undefined' ? window : globalThis;

  const SKALE_LABEL = { nrs: 'NRS 0-10', vas: 'VAS', vrs: 'VRS', fps: 'FPS', inna: 'Inna' };
  const SKALA_TRYB = [['ta-sama', 'Ta sama skala co poprzednio'], ['inna', 'Inna skala']];
  const ULGA = [
    ['calkowita', 'Całkowita ulga w bólu'], ['umiarkowana', 'Umiarkowana ulga w bólu'],
    ['mala', 'Mała ulga w bólu'], ['brak', 'Brak ulgi w bólu']
  ];
  const SATYSFAKCJA = [
    ['duza', 'Duża satysfakcja'], ['umiarkowana', 'Umiarkowana satysfakcja'],
    ['mala', 'Mała satysfakcja'], ['brak', 'Brak satysfakcji']
  ];
  const MIEDZY = [['tak', 'Tak'], ['nie', 'Nie'], ['nda', 'Nie dotyczy'], ['trudno', 'Trudno ocenić']];
  const DN = [
    ['sennosc', 'Senność / spowolnienie'], ['zawroty', 'Zawroty głowy'], ['nudnosci', 'Nudności / wymioty'],
    ['zaparcia', 'Zaparcia'], ['zoladek', 'Dolegliwości żołądkowe'], ['krwawienie', 'Krwawienie / smoliste stolce'],
    ['obrzeki', 'Obrzęki'], ['dusznosc', 'Duszność'], ['splatanie', 'Splątanie'], ['upadki', 'Upadki'],
    ['wysypka', 'Wysypka / świąd'], ['inne', 'Inne']
  ];
  const DN_ODP = [['nie', 'Nie'], ['tak', 'Tak'], ['nw', 'Nie wiem']];
  const DN_KORYGOWANE = [['tak', 'Tak'], ['nie', 'Nie'], ['nda', 'Nie dotyczy'], ['wymaga', 'Wymaga oceny']];
  const ZMIANA = [['nie', 'Nie'], ['tak', 'Tak'], ['nw', 'Nie wiem']];
  const STATUS = [
    ['dobra', 'Dobra kontrola bólu'],
    ['czesciowa', 'Częściowa kontrola bólu'],
    ['niewystarczajaca', 'Niewystarczająca kontrola bólu'],
    ['trudna', 'Kontrola trudna do oceny']
  ];

  let root = null;

  function radio(name, value, label, dataState) {
    return h('label', { class: 'radio' }, [
      h('input', { type: 'radio', name: name, value: value, 'data-state': dataState || name }),
      h('span', { text: label })
    ]);
  }

  function checkboxState(path, id, label) {
    return h('label', { class: 'checkbox' }, [
      h('input', { type: 'checkbox', 'data-state': path + '.' + id }),
      h('span', { text: label })
    ]);
  }

  function nrsField(dataState, label, id) {
    return h('div', { class: 'field' }, [
      h('label', { class: 'ctl' }, [label]),
      h('input', { type: 'number', id: id, min: '0', max: '10', step: '1', 'data-state': dataState }),
      h('div', { class: 'hint', text: '0–10' })
    ]);
  }

  function buildDane() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '5.1' }), 'Dane kontroli']),
      h('div', { class: 'field' }, [
        h('label', { class: 'ctl' }, ['Data kontroli bólu']),
        h('input', { type: 'date', id: 'kb-data', 'data-state': 'kontrolaBolu.data' })
      ]),
      h('div', { class: 'results' }, [
        h('h3', { text: 'Poprzednia ocena' }),
        h('div', { class: 'hint', id: 'kb-poprzednia' })
      ])
    ]);
  }

  function buildSkala() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '5.2' }), 'Skala oceny bólu']),
      h('div', { class: 'field' }, [
        h('label', { class: 'ctl' }, ['Skala użyta w kontroli']),
        h('div', { class: 'radio-group' }, SKALA_TRYB.map(function (s) {
          return radio('kb.skala', s[0], s[1], 'kontrolaBolu.skalaTryb');
        })),
        h('div', { class: 'field', id: 'kb-skala-inna', style: { display: 'none', marginTop: '8px' } }, [
          h('label', { class: 'ctl' }, ['Uzasadnienie wyboru innej skali']),
          h('input', { type: 'text', placeholder: 'Uzasadnienie…', 'data-state': 'kontrolaBolu.skalaUzasadnienie' })
        ])
      ])
    ]);
  }

  function buildNatezenie() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '5.3' }), 'Natężenie bólu']),
      h('div', { class: 'grid' }, [
        nrsField('kontrolaBolu.nrsAktualne', 'Aktualne natężenie bólu', 'kb-nrs-akt'),
        nrsField('kontrolaBolu.nrsSrednie', 'Średnie natężenie bólu w ostatnim tygodniu', 'kb-nrs-sr'),
        nrsField('kontrolaBolu.nrsSpoczynek', 'Natężenie bólu w spoczynku', 'kb-nrs-sp'),
        nrsField('kontrolaBolu.nrsRuch', 'Natężenie bólu w ruchu', 'kb-nrs-ruch')
      ])
    ]);
  }

  function buildUlga() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '5.4' }), 'Ulga po leczeniu']),
      h('div', { class: 'field' }, [
        h('label', { class: 'ctl' }, ['Jaką ulgę w bólu pacjent odczuwa po leczeniu?']),
        h('div', { class: 'radio-group' }, ULGA.map(function (u) {
          return radio('kb.ulga', u[0], u[1], 'kontrolaBolu.ulga');
        }))
      ])
    ]);
  }

  function buildSatysfakcja() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '5.5' }), 'Satysfakcja z leczenia']),
      h('div', { class: 'field' }, [
        h('label', { class: 'ctl' }, ['Satysfakcja pacjenta z leczenia']),
        h('div', { class: 'radio-group' }, SATYSFAKCJA.map(function (s) {
          return radio('kb.satysfakcja', s[0], s[1], 'kontrolaBolu.satysfakcja');
        }))
      ])
    ]);
  }

  function buildMiedzyDawkami() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '5.6' }), 'Kontrola bólu między dawkami']),
      h('div', { class: 'field' }, [
        h('label', { class: 'ctl' }, ['Czy ból jest dobrze kontrolowany między dawkami leku przeciwbólowego?']),
        h('div', { class: 'radio-group' }, MIEDZY.map(function (m) {
          return radio('kb.miedzy', m[0], m[1], 'kontrolaBolu.miedzyDawkami');
        }))
      ]),
      h('div', { class: 'field', id: 'kb-miedzy-opis', style: { display: 'none' } }, [
        h('label', { class: 'ctl' }, ['Jeśli nie — krótki opis problemu']),
        h('input', {
          type: 'text',
          placeholder: 'Np. ból wraca przed kolejną dawką, pacjent przyjmuje dodatkowe leki OTC, ból nasila się w nocy.',
          'data-state': 'kontrolaBolu.miedzyDawkamiOpis'
        })
      ])
    ]);
  }

  function buildDN() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '5.7' }), 'Działania niepożądane leczenia']),
      h('div', { class: 'field' }, [
        h('label', { class: 'ctl' }, ['Czy wystąpiły działania niepożądane leczenia przeciwbólowego?']),
        h('div', { class: 'radio-group' }, DN_ODP.map(function (o) {
          return radio('kb.dn', o[0], o[1], 'kontrolaBolu.dzialaniaNiepozadane');
        }))
      ]),
      h('div', { id: 'kb-dn-lista', style: { display: 'none', marginTop: '12px' } }, [
        h('div', { class: 'checkbox-grid' }, DN.map(function (d) {
          return checkboxState('kontrolaBolu.dnLista', d[0], d[1]);
        })),
        h('div', { class: 'field', style: { marginTop: '12px' } }, [
          h('label', { class: 'ctl' }, ['Czy działania niepożądane są leczone lub korygowane?']),
          h('div', { class: 'radio-group' }, DN_KORYGOWANE.map(function (k) {
            return radio('kb.dnk', k[0], k[1], 'kontrolaBolu.dnKorygowane');
          }))
        ])
      ])
    ]);
  }

  function buildStosowanie() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '5.8' }), 'Stosowanie leczenia']),
      h('div', { class: 'results' }, [
        h('h3', { text: 'Podsumowanie adherencji (MARS-5)' }),
        h('div', { class: 'hint', id: 'kb-mars5' })
      ]),
      h('div', { class: 'field', style: { marginTop: '12px' } }, [
        h('label', { class: 'ctl' }, ['Czy od ostatniej oceny zmienił się sposób stosowania leków?']),
        h('div', { class: 'radio-group' }, ZMIANA.map(function (z) {
          return radio('kb.zmiana', z[0], z[1], 'kontrolaBolu.stosowanieZmiana');
        }))
      ]),
      h('div', { class: 'field', id: 'kb-zmiana-opis', style: { display: 'none' } }, [
        h('label', { class: 'ctl' }, ['Krótki opis zmiany']),
        h('input', { type: 'text', placeholder: 'Opis zmiany sposobu stosowania leków…', 'data-state': 'kontrolaBolu.stosowanieZmianaOpis' })
      ])
    ]);
  }

  function buildStatus() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '5.9' }), 'Status kontroli bólu']),
      h('div', { class: 'field' }, [
        h('label', { class: 'ctl' }, ['Ocena kontroli bólu']),
        h('div', { class: 'radio-group radio-col' }, STATUS.map(function (st) {
          return radio('kb.status', st[0], st[1], 'kontrolaBolu.statusKontroli');
        }))
      ]),
      h('div', { class: 'komunikat komunikat-sugestia', id: 'kb-sugestia-status' }),
      h('div', { class: 'komunikat komunikat-info', id: 'kb-komunikat-poradnia', style: { display: 'none' } })
    ]);
  }

  function buildDecyzja() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '5.10' }), 'Decyzja / dalsze postępowanie']),
      h('div', { class: 'field' }, [
        h('label', { class: 'ctl' }, ['Proponowany dalszy krok']),
        h('textarea', {
          rows: '3',
          placeholder: 'Np. kontynuacja leczenia, modyfikacja dawkowania, konsultacja lekarska, poradnia leczenia bólu, edukacja pacjenta.',
          'data-state': 'kontrolaBolu.dalszePostepowanie'
        })
      ])
    ]);
  }

  function buildEpikryza() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '5.11' }), 'Epikryza kontroli bólu']),
      h('div', { class: 'field' }, [
        h('label', { class: 'ctl' }, ['Komentarz farmaceuty']),
        h('textarea', {
          rows: '5',
          placeholder: 'Podsumuj zmianę natężenia bólu, ulgę po leczeniu, satysfakcję pacjenta, kontrolę bólu między dawkami, działania niepożądane, sposób stosowania leków oraz zalecane dalsze postępowanie.',
          'data-state': 'kontrolaBolu.epikryza'
        })
      ])
    ]);
  }

  function build() {
    return [buildDane(), buildSkala(), buildNatezenie(), buildUlga(), buildSatysfakcja(),
      buildMiedzyDawkami(), buildDN(), buildStosowanie(), buildStatus(), buildDecyzja(), buildEpikryza()];
  }

  function handleInput(e) {
    const t = e.target;
    const key = t.getAttribute && t.getAttribute('data-state');
    if (key) {
      G.State.set(key, t.type === 'checkbox' ? t.checked : t.value);
    }
  }

  function init(container) {
    root = container;
    const cards = build();
    cards.forEach(function (c) { root.appendChild(c); });
    root.removeEventListener('input', handleInput);
    root.removeEventListener('change', handleInput);
    root.addEventListener('input', handleInput);
    root.addEventListener('change', handleInput);
  }

  function apply() {
    if (!root) return;
    const q = function (sel) { return root.querySelector(sel); };
    if (!q('#kb-data')) return;

    const s = G.State.get();
    const K = G.Kontrola;

    /* Synchronizacja wartości pól */
    root.querySelectorAll('[data-state]').forEach(function (inp) {
      const v = G.State.getPath(inp.getAttribute('data-state'));
      if (inp.type === 'checkbox') inp.checked = !!v;
      else if (inp.type === 'radio') inp.checked = (inp.value === v);
      else inp.value = (v == null) ? '' : v;
    });

    /* Poprzednia ocena (z zakładki 4) */
    const ob = s.ocenaBolu || {};
    let poprzednia = 'Brak wcześniejszej oceny — uzupełnij zakładkę „Ocena bólu”.';
    if (ob.data || ob.nrsAktualne !== '' || ob.nrsSrednie !== '') {
      poprzednia = 'Data: ' + (ob.data || '—') + ' • Skala: ' + (SKALE_LABEL[ob.skala] || ob.skala || '—') +
        ' • Aktualne NRS: ' + (ob.nrsAktualne !== '' ? ob.nrsAktualne + '/10' : '—') +
        ' • Średnie NRS: ' + (ob.nrsSrednie !== '' ? ob.nrsSrednie + '/10' : '—');
    }
    q('#kb-poprzednia').textContent = poprzednia;

    /* Skala inna → uzasadnienie */
    q('#kb-skala-inna').style.display = (s.kontrolaBolu.skalaTryb === 'inna') ? '' : 'none';

    /* Kontrola między dawkami → opis */
    q('#kb-miedzy-opis').style.display = (s.kontrolaBolu.miedzyDawkami === 'nie') ? '' : 'none';

    /* Działania niepożądane */
    q('#kb-dn-lista').style.display = (s.kontrolaBolu.dzialaniaNiepozadane === 'tak') ? '' : 'none';

    /* Zmiana stosowania → opis */
    q('#kb-zmiana-opis').style.display = (s.kontrolaBolu.stosowanieZmiana === 'tak') ? '' : 'none';

    /* MARS-5 */
    const m = G.Mars5.score(s.mars5);
    q('#kb-mars5').textContent = m
      ? 'Wynik ostatniej oceny: ' + m.sum + ' / 25 (średnia ' + m.mean.toFixed(1).replace('.', ',') + ' / 5). ' + m.interp.label
      : 'Brak wyniku — uzupełnij zakładkę „MARS-5 i stosowanie leczenia”.';

    /* Auto-sugestia statusu kontroli */
    const k = s.kontrolaBolu;
    const sug = K.sugerujStatusKontroli({
      nrsAktualne: k.nrsAktualne,
      nrsSrednie: k.nrsSrednie,
      ulga: k.ulga,
      miedzyDawkami: k.miedzyDawkami,
      dnLista: k.dnLista,
      satysfakcja: k.satysfakcja,
      marsMean: m ? m.mean : null
    });
    const maDane = k.nrsAktualne !== '' || k.ulga !== '' || k.miedzyDawkami !== '' || k.dnLista && Object.keys(k.dnLista).length;
    q('#kb-sugestia-status').textContent = maDane
      ? 'Propozycja aplikacji: ' + (STATUS.find(function (x) { return x[0] === sug.opcja; }) || ['', '—'])[1] +
        '. (' + sug.powody.join('; ') + ')'
      : 'Uzupełnij dane natężenia, ulgi i działań niepożądanych, aby wyświetlić propozycję.';
    root.querySelectorAll('[name="kb.status"]').forEach(function (inp) {
      inp.parentElement.classList.toggle('sugerowane', inp.value === sug.opcja);
    });

    /* Komunikat o poradni leczenia bólu */
    const komunikat = K.komunikatPoradnia(k.nrsAktualne, k.nrsSrednie, k.ulga);
    const kp = q('#kb-komunikat-poradnia');
    kp.style.display = komunikat ? '' : 'none';
    kp.textContent = komunikat || '';
  }

  G.Tab5 = { init: init, apply: apply };
})();
