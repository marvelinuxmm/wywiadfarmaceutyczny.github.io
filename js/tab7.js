/* Zakładka 7: Moduł migrenowy. */
(function () {
  const h = UI.h;
  const G = typeof window !== 'undefined' ? window : globalThis;

  const ROZPOZNANA = G.OPCJE.mgRozpoznana;
  const PRODROM = G.OPCJE.mgProdrom;
  const AURA = G.OPCJE.mgAura;
  const AURA_CZAS = G.OPCJE.mgAuraCzas;
  const AURA_OSTROZNOSC = G.OPCJE.mgAuraOst;
  const WCZESNIE = G.OPCJE.mgWczesnie;
  const SKUTECZNOSC = G.OPCJE.mgSkutecznosc;
  const NAWROT = G.OPCJE.mgNawrot;
  const WYMIOTY = G.OPCJE.mgWymioty;
  const PROF_KR = G.OPCJE.mgProfKryteria;
  const PROF_STOS = G.OPCJE.mgProfStos;
  const PROF_EFFEKT = G.OPCJE.mgProfEfekt;
  const DALSZY_KROK = G.OPCJE.mgKrok;

  let root = null;

  const radio = UI.radio;
  const checkboxState = UI.checkbox;

  function buildSek1() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '7.1' }), 'Rozpoznanie migreny']),
      h('div', { class: 'field' }, [
        h('label', { class: 'ctl' }, ['Czy pacjent ma rozpoznaną migrenę?']),
        h('div', { class: 'radio-group' }, ROZPOZNANA.map(function (r) {
          return radio('mg.rozp', r[0], r[1], 'migrena.rozpoznana');
        }))
      ])
    ]);
  }

  function buildSek2() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '7.2' }), 'Objawy poprzedzające napad (prodrom)']),
      h('div', { class: 'field' }, [
        h('div', { class: 'checkbox-grid' }, PRODROM.map(function (p) {
          return checkboxState('migrena.prodrom', p[0], p[1]);
        })),
        h('div', { class: 'hint', text: 'Edukacyjnie: leczenie doraźne przyjmuj wcześnie, gdy ból jest jeszcze łagodny; w migrenie z aurą po rozpoczęciu fazy bólu głowy.' })
      ])
    ]);
  }

  function buildSek3() {
    return h('section', { class: 'card', id: 'mg-sek3' }, [
      h('h2', {}, [h('span', { class: 'num', text: '7.3' }), 'Aura i objawy nietypowe']),
      h('div', { class: 'komunikat komunikat-info', id: 'mg-sek3-blokada', style: { display: 'none' },
        text: 'Sekcja odblokowuje się po zaznaczeniu „Aura” w sekcji 6.4 (zakładka „Ból głowy”).' }),
      h('div', { id: 'mg-sek3-body' }, [
        h('div', { class: 'field' }, [
          h('label', { class: 'ctl' }, ['Rodzaje aury (można zaznaczyć kilka)']),
          h('div', { class: 'checkbox-grid' }, AURA.map(function (a) {
            return checkboxState('migrena.aura', a[0], a[1]);
          }))
        ]),
        h('div', { class: 'field', id: 'mg-aura-szczegoly', style: { display: 'none' } }, [
          h('label', { class: 'ctl' }, ['Czas trwania aury']),
          h('div', { class: 'radio-group' }, AURA_CZAS.map(function (c) {
            return radio('mg.aurac', c[0], c[1], 'migrena.auraCzas');
          })),
          h('div', { class: 'checkbox-grid', style: { marginTop: '10px' } }, AURA_OSTROZNOSC.map(function (o) {
            return checkboxState('migrena.auraOstroznosc', o[0], o[1]);
          }))
        ]),
        h('div', { class: 'komunikat komunikat-alert', id: 'mg-aura-alert', style: { display: 'none' } })
      ])
    ]);
  }

  function buildSek4() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '7.4' }), 'Leczenie doraźne napadu migreny']),
      h('div', { class: 'field' }, [
        h('label', { class: 'ctl' }, ['Leki stosowane doraźnie w bólu głowy (z zakładki „Farmakoterapia”)']),
        h('div', { id: 'mg-leki-dorzane' })
      ]),
      h('div', { class: 'field', style: { marginTop: '12px' } }, [
        h('label', { class: 'ctl' }, ['Czy pacjent przyjmuje lek doraźny wcześnie w napadzie?']),
        h('div', { class: 'radio-group' }, WCZESNIE.map(function (w) {
          return radio('mg.wczesnie', w[0], w[1], 'migrena.wczesnieLek');
        }))
      ]),
      h('div', { class: 'field', style: { marginTop: '12px' } }, [
        h('label', { class: 'ctl' }, ['Skuteczność leczenia doraźnego (wolność od bólu po 2 godzinach)']),
        h('div', { class: 'radio-group' }, SKUTECZNOSC.map(function (s) {
          return radio('mg.skut', s[0], s[1], 'migrena.skutecznosc2h');
        }))
      ]),
      h('div', { class: 'field', style: { marginTop: '12px' } }, [
        h('label', { class: 'ctl' }, ['Czy ból wraca w ciągu 24–48 godzin po początkowej poprawie?']),
        h('div', { class: 'radio-group' }, NAWROT.map(function (n) {
          return radio('mg.nawrot', n[0], n[1], 'migrena.nawrot');
        }))
      ]),
      h('div', { class: 'field', style: { marginTop: '12px' } }, [
        h('label', { class: 'ctl' }, ['Czy w napadzie występują wczesne wymioty utrudniające przyjęcie leku doustnego?']),
        h('div', { class: 'radio-group' }, WYMIOTY.map(function (w) {
          return radio('mg.wymioty', w[0], w[1], 'migrena.wymioty');
        }))
      ]),
      h('div', { class: 'komunikat komunikat-sugestia', id: 'mg-wymioty-sugestia', style: { display: 'none' } })
    ]);
  }

  function buildSek5() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '7.5' }), 'Profilaktyka migreny']),
      h('div', { class: 'field' }, [
        h('label', { class: 'ctl' }, ['Kryteria przesiewowe do rozważenia profilaktyki']),
        h('div', { class: 'checkbox-grid' }, PROF_KR.map(function (p) {
          return checkboxState('migrena.profilaktykaKryteria', p[0], p[1]);
        }))
      ]),
      h('div', { class: 'field', style: { marginTop: '12px' } }, [
        h('label', { class: 'ctl' }, ['Czy pacjent już stosuje leczenie profilaktyczne migreny?']),
        h('div', { class: 'radio-group' }, PROF_STOS.map(function (p) {
          return radio('mg.profst', p[0], p[1], 'migrena.profilaktykaStosowana');
        }))
      ]),
      h('div', { class: 'field', id: 'mg-prof-szczegoly', style: { display: 'none', marginTop: '12px' } }, [
        h('label', { class: 'ctl' }, ['Szczegóły profilaktyki (wpisz lek z listy zakładki „Farmakoterapia”)']),
        h('div', { class: 'grid' }, [
          h('div', { class: 'field' }, [
            h('label', { class: 'ctl' }, ['Lek profilaktyczny']),
            h('input', { type: 'text', 'data-state': 'migrena.profilaktykaSzczegoly.lek' })
          ]),
          h('div', { class: 'field' }, [
            h('label', { class: 'ctl' }, ['Dawka']),
            h('input', { type: 'text', 'data-state': 'migrena.profilaktykaSzczegoly.dawka' })
          ]),
          h('div', { class: 'field' }, [
            h('label', { class: 'ctl' }, ['Od kiedy']),
            h('input', { type: 'text', placeholder: 'np. od 3 miesięcy', 'data-state': 'migrena.profilaktykaSzczegoly.odkiedy' })
          ]),
          h('div', { class: 'field' }, [
            h('label', { class: 'ctl' }, ['Czy stosowany regularnie?']),
            h('div', { class: 'radio-group' }, G.OPCJE.takNieNw.map(function (r) {
              return radio('mg.profreg', r[0], r[1], 'migrena.profilaktykaSzczegoly.regularnie');
            }))
          ])
        ]),
        h('div', { class: 'field', style: { marginTop: '12px' } }, [
          h('label', { class: 'ctl' }, ['Czy profilaktyka zmniejszyła liczbę dni migrenowych?']),
          h('div', { class: 'radio-group' }, PROF_EFFEKT.map(function (p) {
            return radio('mg.profeff', p[0], p[1], 'migrena.profilaktykaEfekt');
          })),
          h('div', { class: 'hint', text: 'Skuteczność doustnej profilaktyki ocenia się po ok. 3 miesiącach; za skuteczność uznaje się m.in. zmniejszenie miesięcznych dni migrenowych o ≥50%.' })
        ])
      ])
    ]);
  }

  function buildSek6() {
    return h('section', { class: 'card' }, [
      h('h2', {}, [h('span', { class: 'num', text: '7.6' }), 'Podsumowanie farmaceutyczne']),
      h('div', { class: 'field' }, [
        h('label', { class: 'ctl' }, ['Klasyfikacja robocza']),
        h('input', { type: 'text', id: 'mg-klasyfikacja', placeholder: 'Auto-sugestia na podstawie liczby dni z bólem głowy (6.3)…', 'data-state': 'migrena.klasyfikacja' }),
        h('div', { class: 'hint', id: 'mg-klasyfikacja-opis' })
      ]),
      h('div', { class: 'field', style: { marginTop: '12px' } }, [
        h('label', { class: 'ctl' }, ['Rekomendowany dalszy krok']),
        h('div', { class: 'radio-group radio-col' }, DALSZY_KROK.map(function (d) {
          return radio('mg.krok', d[0], d[1], 'migrena.dalszyKrok');
        }))
      ]),
      h('div', { class: 'field', style: { marginTop: '12px' } }, [
        h('label', { class: 'ctl' }, ['Epikryza modułu migrenowego']),
        h('textarea', {
          rows: '5',
          placeholder: 'Podsumuj: liczbę dni z bólem głowy (6.3), obecność/charakter aury, leczenie doraźne, skuteczność po 2 godzinach, nawroty, wskazania do profilaktyki oraz ewentualne objawy alarmowe.',
          'data-state': 'migrena.epikryza'
        })
      ])
    ]);
  }

  function build() {
    return [buildSek1(), buildSek2(), buildSek3(), buildSek4(), buildSek5(), buildSek6()];
  }

  function handleInput(e) {
    const t = e.target;
    const key = t.getAttribute && t.getAttribute('data-state');
    if (key) {
      G.State.set(key, t.type === 'checkbox' ? t.checked : t.value);
      return;
    }
    const cel = t.getAttribute && t.getAttribute('data-cel');
    if (cel) {
      const s = G.State.get();
      const arr = G.State.getPath(cel);
      if (Array.isArray(arr)) {
        const id = parseInt(t.getAttribute('data-id'), 10);
        const idx = arr.indexOf(id);
        if (t.checked && idx === -1) arr.push(id);
        if (!t.checked && idx !== -1) arr.splice(idx, 1);
        G.State.notify();
      }
    }
  }

  function init(container) {
    root = container;
    const cards = build();
    cards.forEach(function (c) { root.appendChild(c); });
    root.querySelector('#mg-leki-dorzane').appendChild(buildLekSelect());
    root.removeEventListener('input', handleInput);
    root.removeEventListener('change', handleInput);
    root.addEventListener('input', handleInput);
    root.addEventListener('change', handleInput);
  }

  function buildLekSelect() {
    const s = G.State.get();
    const leki = s.leki || [];
    if (!leki.length) return h('p', { class: 'hint', text: 'Brak leków — uzupełnij listę w zakładce „Farmakoterapia”.' });
    return h('div', { class: 'checkbox-grid' }, leki.map(function (l) {
      const etykieta = (l.nazwa || '(bez nazwy)') + (l.moc ? ' ' + l.moc : '');
      return h('label', { class: 'checkbox' }, [
        h('input', { type: 'checkbox', 'data-cel': 'migrena.lekiDorzane', 'data-id': l.id }),
        h('span', { text: etykieta })
      ]);
    }));
  }

  function anyTrueExceptBrak(obj) {
    return Object.keys(obj || {}).some(function (k) { return k !== 'brak' && obj[k]; });
  }

  function apply() {
    if (!root) return;
    const q = function (sel) { return root.querySelector(sel); };
    if (!q('#mg-leki-dorzane')) return;

    const s = G.State.get();
    const K = G.Kontrola;

    /* Synchronizacja wartości pól */
    UI.sync(root);

    /* Wybór leków doraźnych */
    root.querySelectorAll('[data-cel="migrena.lekiDorzane"]').forEach(function (inp) {
      inp.checked = s.migrena.lekiDorzane.indexOf(parseInt(inp.getAttribute('data-id'), 10)) !== -1;
    });

    /* 7.3 — blokada do czasu zaznaczenia „Aura” w 6.4 (bolGlowy.objawy.aura) */
    const auraAktywna = !!(s.bolGlowy && s.bolGlowy.objawy && s.bolGlowy.objawy.aura);
    q('#mg-sek3-body').classList.toggle('zablokowana', !auraAktywna);
    q('#mg-sek3-blokada').style.display = auraAktywna ? 'none' : '';

    /* Aura — szczegóły (czas trwania, ostrożność) przy zaznaczonych typach aury */
    const auraTypy = Object.keys(s.migrena.aura || {}).filter(function (k) { return s.migrena.aura[k] && k !== 'nw'; });
    q('#mg-aura-szczegoly').style.display = auraTypy.length ? '' : 'none';
    const auraAlert = q('#mg-aura-alert');
    if (anyTrueExceptBrak(s.migrena.auraOstroznosc)) {
      auraAlert.style.display = '';
      auraAlert.textContent = 'Nietypowa aura lub objawy neurologiczne. Rozważ pilną konsultację lekarską zgodnie z lokalną procedurą.';
    } else {
      auraAlert.style.display = 'none';
    }

    /* Wymioty → sugestia postaci niedoustnej */
    const wym = q('#mg-wymioty-sugestia');
    if (s.migrena.wymioty === 'tak') {
      wym.style.display = '';
      wym.textContent = 'Warto omówić z lekarzem postać niedoustną (iniekcja, aerozol donosowy, czopek) lub lek przeciwwymiotny.';
    } else {
      wym.style.display = 'none';
    }

    /* Profilaktyka szczegóły */
    q('#mg-prof-szczegoly').style.display = (s.migrena.profilaktykaStosowana === 'tak') ? '' : 'none';

    /* Klasyfikacja robocza — auto-sugestia z 6.3 (nadpisywana, dopóki użytkownik nie wpisze własnej) */
    const AUTO_LABELE = ['Migrena epizodyczna', 'Migrena przewlekła'];
    const kl = K.sugerujKlasyfikacja(s.bolGlowy.dniWMiesiacu);
    q('#mg-klasyfikacja-opis').textContent = kl.opis;
    if (kl.label && s.migrena.klasyfikacja !== kl.label &&
        (s.migrena.klasyfikacja === '' || AUTO_LABELE.indexOf(s.migrena.klasyfikacja) !== -1)) {
      G.State.set('migrena.klasyfikacja', kl.label);
    }
  }

  G.Tab7 = { init: init, apply: apply };
})();
