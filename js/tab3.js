/* Zakładka 3: MARS-5 i stosowanie leczenia. */
(function () {
  const h = UI.h;
  const G = typeof window !== 'undefined' ? window : globalThis;

  const PYTANIA = [
    ['m1', 'Zapomnieć o zażyciu leków'],
    ['m2', 'Zmienić dawkę leku'],
    ['m3', 'Przestać zażywać leki na jakiś czas'],
    ['m4', 'Pominąć dawkę'],
    ['m5', 'Zażyć mniej leku niż zalecono']
  ];

  const SKALA = [
    ['ciagle', 'Ciągle (1)'],
    ['czesto', 'Często (2)'],
    ['czasami', 'Czasami (3)'],
    ['rzadko', 'Rzadko (4)'],
    ['nigdy', 'Nigdy (5)']
  ];

  let root = null;

  function build() {
    const thead = h('tr', {},
      [h('th', { text: 'Jak często zdarza się Panu/Pani:' })].concat(
        SKALA.map(function (s) { return h('th', { text: s[1] }); })
      )
    );
    const bodyRows = PYTANIA.map(function (p) {
      return h('tr', {}, [
        h('td', { class: 'mars-pytanie', text: p[1] }),
        SKALA.map(function (s) {
          return h('td', { class: 'mars-cell' }, [
            h('input', { type: 'radio', name: 'mars.' + p[0], value: s[0], 'data-state': 'mars5.' + p[0] })
          ]);
        })
      ]);
    });
    const sumRow = h('tr', { class: 'mars-wynik' }, [
      h('td', { class: 'mars-pytanie', text: 'Wynik zsumowany' }),
      h('td', { colspan: '5', text: '' })
    ]);

    const table = h('table', { class: 'tabela mars', id: 'mars5-table' }, [
      h('thead', {}, [thead]),
      h('tbody', {}, bodyRows.concat([sumRow]))
    ]);

    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '3.2' }), 'MARS-5 — przestrzeganie zaleceń']),
      h('p', { class: 'hint', text: 'Kwestionariusz MARS-5 (Medication Adherence Rating Scale). Skala: 5 pkt – bardzo dobre przestrzeganie, 4 – dobre, 3 – dostateczne, <3 – non-adherent.' }),
      table,
      h('div', { class: 'results', id: 'mars5-wynik' }),
      h('div', { class: 'field', id: 'mars5-problemy', style: { display: 'none' } }, [
        h('label', { class: 'ctl' }, ['Z czym pacjent ma problemy przy stosowaniu leków?']),
        h('textarea', { rows: '4', placeholder: 'Np. zapominanie o dawkach, zmienianie dawek, obawy przed lekami, działania niepożądane.', 'data-state': 'marsProblemy' })
      ]),
      h('div', { class: 'field', id: 'mars5-pomoc', style: { display: 'none' } }, [
        h('label', { class: 'ctl' }, ['Jeśli pacjent ma trudności z adherence, określ jak możesz mu pomóc. Co jest ważne dla pacjenta?']),
        h('textarea', { rows: '4', placeholder: 'Np. edukacja, ułatwienia dawkowania, kontakt z lekarzem, przyczyny pomijania dawek.', 'data-state': 'pomocAdherence' })
      ])
    ]);
  }

  function handleInput(e) {
    const t = e.target;
    const key = t.getAttribute && t.getAttribute('data-state');
    if (key) G.State.set(key, t.type === 'checkbox' ? t.checked : t.value);
  }

  function init(container) {
    root = container;
    root.appendChild(build());
    root.removeEventListener('input', handleInput);
    root.removeEventListener('change', handleInput);
    root.addEventListener('input', handleInput);
    root.addEventListener('change', handleInput);
  }

  function apply() {
    if (!root) return;
    if (!root.querySelector('#mars5-table')) return; // aktywna jest inna zakładka

    const s = G.State.get();

    /* Synchronizacja wartości pól ze stanu (po imporcie) */
    root.querySelectorAll('[data-state]').forEach(function (inp) {
      const v = G.State.getPath(inp.getAttribute('data-state'));
      if (inp.type === 'checkbox') inp.checked = !!v;
      else if (inp.type === 'radio') inp.checked = (inp.value === v);
      else inp.value = (v == null) ? '' : v;
    });

    const wynik = G.Mars5.score(s.mars5);
    const box = root.querySelector('#mars5-wynik');
    box.innerHTML = '';

    /* Pole „z czym są problemy” — gdy którakolwiek odpowiedź różni się od „nigdy” */
    root.querySelector('#mars5-problemy').style.display =
      G.Mars5.odchylenieOdNigdy(s.mars5) ? '' : 'none';

    if (!wynik) {
      box.appendChild(h('div', { class: 'hint', text: 'Udziel odpowiedzi na wszystkie 5 pytań, aby wyliczyć wynik.' }));
      root.querySelector('#mars5-pomoc').style.display = 'none';
      return;
    }
    const meanStr = wynik.mean.toFixed(1).replace('.', ',');
    box.appendChild(h('div', { class: 'res-row' }, [
      h('span', { text: 'Wynik MARS-5' }),
      h('div', { class: 'res-valbox' }, [
        h('div', { class: 'res-val', text: wynik.sum + ' / 25' }),
        h('div', { class: 'res-band', text: 'średnia ' + meanStr + ' / 5' })
      ])
    ]));
    box.appendChild(h('div', { class: 'flag flag-' + wynik.interp.sev, style: { marginTop: '10px' } }, [
      h('div', { class: 'flag-title', text: wynik.interp.label })
    ]));
    root.querySelector('#mars5-pomoc').style.display = (wynik.mean < 4) ? '' : 'none';
  }

  G.Tab3 = { init: init, apply: apply };
})();
