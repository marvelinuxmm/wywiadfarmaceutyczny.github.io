/* Nawigacja zakładek, panel alertów, eksport/import JSON, reset. */
(function () {
  const h = UI.h;
  const G = typeof window !== 'undefined' ? window : globalThis;

  const TABS = [
    { id: 'profil', label: '1. Profil pacjenta i choroby współistniejące', enabled: true },
    { id: 'farmakoterapia', label: '2. Farmakoterapia', enabled: true },
    { id: 'mars5', label: '3. MARS-5 (przestrzeganie zaleceń)', enabled: true },
    { id: 'ocena', label: '4. Ocena bólu', enabled: true },
    { id: 'kontrola', label: '5. Kontrola bólu', enabled: true },
    { id: 'bolglowy', label: '6. Ból głowy', enabled: 'dynamic' },
    { id: 'migrena', label: '7. Moduł migrenowy', enabled: 'dynamic' },
    { id: 'podsumowanie', label: '8. Podsumowanie i raport', enabled: true }
  ];
  let active = 'profil';
  let statusTimer = null;

  function initTabs() {
    const bar = document.getElementById('tabs');
    TABS.forEach(function (t) {
      const kropka = t.label.indexOf('.');
      const num = kropka > -1 ? t.label.slice(0, kropka) : '';
      const txt = kropka > -1 ? t.label.slice(kropka + 1).trim() : t.label;
      const btn = h('button', {
        class: 'tab-btn',
        type: 'button',
        disabled: t.enabled ? undefined : '',
        title: t.enabled ? '' : 'Moduł w przygotowaniu',
        onclick: function () { switchTab(t.id); }
      }, [
        h('span', { class: 'tab-num', text: num }),
        h('span', { class: 'tab-txt', text: txt })
      ]);
      btn.setAttribute('data-tab-id', t.id);
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-controls', 'tab-content');
      btn.setAttribute('aria-label', t.label);
      bar.appendChild(btn);
    });
    /* Nawigacja klawiaturą (strzałki / Home / End) między zakładkami */
    bar.addEventListener('keydown', function (e) {
      if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].indexOf(e.key) === -1) return;
      const btns = Array.prototype.slice.call(bar.querySelectorAll('.tab-btn:not(:disabled)'));
      const idx = btns.indexOf(document.activeElement);
      if (idx === -1) return;
      e.preventDefault();
      let next;
      if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = btns.length - 1;
      else next = (idx + (e.key === 'ArrowRight' ? 1 : -1) + btns.length) % btns.length;
      btns[next].focus();
      switchTab(btns[next].getAttribute('data-tab-id'));
    });
  }

  function updateTabBar() {
    document.querySelectorAll('.tab-btn').forEach(function (b) {
      const jest = b.getAttribute('data-tab-id') === active;
      b.classList.toggle('active', jest);
      b.setAttribute('aria-selected', jest ? 'true' : 'false');
    });
  }

  function switchTab(id) {
    active = id;
    updateTabBar();
    renderContent();
  }

  function bolGlowyAktywna() {
    const s = G.State.get();
    return !!(s.ocenaBolu && s.ocenaBolu.lokalizacja && s.ocenaBolu.lokalizacja.glowa);
  }

  function migrenaAktywna() {
    const s = G.State.get();
    return !!(s.bolGlowy && s.bolGlowy.interpretacja === 'migrena');
  }

  /* Czy zakładka ma wypełnione kluczowe dane (wskaźnik ukończenia w pasku zakładek).
     Kryteria oparte na substancjalnych odpowiedziach — samo otwarcie zakładki
     (np. auto-uzupełnienie daty w 4.1) nie zaznacza zakładki jako ukończonej. */
  function tabUkonczony(id, s) {
    const wyp = function (v) { return v !== '' && v !== null && v !== undefined; };
    const anyTrue = function (obj) { return Object.keys(obj || {}).some(function (k) { return obj[k]; }); };
    if (id === 'profil') return !!(s.dataUrodzenia && s.plec);
    if (id === 'farmakoterapia') return !!(s.leki && s.leki.length);
    if (id === 'mars5') return ['m1', 'm2', 'm3', 'm4', 'm5'].every(function (k) { return s.mars5[k] !== ''; });
    if (id === 'ocena') {
      const ob = s.ocenaBolu || {};
      return wyp(ob.nrsAktualne) || wyp(ob.nrsSrednie) || anyTrue(ob.lokalizacja) || anyTrue(ob.charakter) ||
        Object.keys(ob.wplyw || {}).some(function (k) { return wyp(ob.wplyw[k]); }) ||
        wyp(ob.przebieg) || wyp(ob.leczenieZmniejsza);
    }
    if (id === 'kontrola') {
      const kb = s.kontrolaBolu || {};
      return wyp(kb.nrsAktualne) || wyp(kb.nrsSrednie) || wyp(kb.nrsSpoczynek) || wyp(kb.nrsRuch) ||
        wyp(kb.ulga) || wyp(kb.satysfakcja) || wyp(kb.miedzyDawkami) || wyp(kb.dzialaniaNiepozadane) ||
        wyp(kb.statusKontroli) || wyp(kb.dalszePostepowanie);
    }
    if (id === 'bolglowy') {
      return bolGlowyAktywna() && !!(s.bolGlowy.nrs !== '' || Object.keys(s.bolGlowy.lokalizacja || {}).length);
    }
    if (id === 'migrena') return migrenaAktywna() && s.migrena.rozpoznana !== '';
    if (id === 'podsumowanie') return s.epikryzaKoncowa !== '';
    return false;
  }

  function renderContent() {
    const c = document.getElementById('tab-content');
    c.innerHTML = '';
    if (active === 'profil') {
      G.Tab1.init(c);
    } else if (active === 'farmakoterapia') {
      G.Tab2.init(c);
    } else if (active === 'mars5') {
      G.Tab3.init(c);
    } else if (active === 'ocena') {
      G.Tab4.init(c);
    } else if (active === 'kontrola') {
      G.Tab5.init(c);
    } else if (active === 'bolglowy') {
      G.Tab6.init(c);
    } else if (active === 'migrena') {
      G.Tab7.init(c);
    } else if (active === 'podsumowanie') {
      G.Tab8.init(c);
    } else {
      c.appendChild(h('div', { class: 'card' }, [
        h('p', { class: 'hint', text: 'Moduł w przygotowaniu.' })
      ]));
    }
    applyAll();
    renderFlags();
  }

  function applyAll() {
    if (G.Tab1) G.Tab1.apply();
    if (G.Tab2) G.Tab2.apply();
    if (G.Tab3) G.Tab3.apply();
    if (G.Tab4) G.Tab4.apply();
    if (G.Tab5) G.Tab5.apply();
    if (G.Tab6) G.Tab6.apply();
    if (G.Tab7) G.Tab7.apply();
    if (G.Tab8) G.Tab8.apply();
    /* Warunkowa dostępność zakładek 6 i 7 */
    const bgBtn = document.querySelector('.tab-btn[data-tab-id="bolglowy"]');
    if (bgBtn) {
      const aktywBG = bolGlowyAktywna();
      bgBtn.disabled = !aktywBG;
      bgBtn.title = aktywBG ? '' : 'Zaznacz lokalizację „Głowa” w sekcji 4.5 (zakładka „Ocena bólu”), aby odblokować.';
      if (!aktywBG && active === 'bolglowy') switchTab('ocena');
    }
    const migBtn = document.querySelector('.tab-btn[data-tab-id="migrena"]');
    if (migBtn) {
      const aktyw = migrenaAktywna();
      migBtn.disabled = !aktyw;
      migBtn.title = aktyw ? '' : 'Wybierz interpretację „Migreną” w sekcji 6.7 (zakładka „Ból głowy”), aby odblokować.';
      if (!aktyw && active === 'migrena') switchTab('bolglowy');
    }

    /* Wskaźniki ukończenia zakładek */
    const s2 = G.State.get();
    document.querySelectorAll('.tab-btn').forEach(function (b) {
      b.classList.toggle('done', tabUkonczony(b.getAttribute('data-tab-id'), s2));
    });
  }

  function renderFlags() {
    const panel = document.getElementById('flags-panel');
    const flags = G.Flags.compute(G.State.get());
    const order = { alert: 0, warn: 1, info: 2 };
    flags.sort(function (a, b) { return order[a.sev] - order[b.sev]; });

    panel.innerHTML = '';
    panel.appendChild(h('h2', { class: 'flags-title' }, [
      'Alerty i flagi',
      h('span', { class: 'flags-count', text: String(flags.length) })
    ]));
    if (!flags.length) {
      panel.appendChild(h('div', { class: 'flags-empty', text: 'Brak aktywnych alertów.' }));
      return;
    }
    flags.forEach(function (f) {
      panel.appendChild(h('div', { class: 'flag flag-' + f.sev }, [
        h('div', { class: 'flag-title', text: f.title }),
        f.text ? h('div', { class: 'flag-text', text: f.text }) : null
      ]));
    });
  }

  function status(msg, isError) {
    const el = document.getElementById('status');
    el.textContent = msg;
    el.className = 'status' + (isError ? ' error' : '');
    el.hidden = false;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(function () { el.hidden = true; }, 3500);
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  function exportJson() {
    const now = new Date();
    const data = {
      _meta: {
        app: 'wywiad-farmaceutyczny',
        wersja: 1,
        eksport: now.toISOString()
      },
      dane: G.State.get()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = h('a', {
      href: url,
      download: 'wywiad-' + now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate()) +
        '-' + pad(now.getHours()) + pad(now.getMinutes()) + '.json'
    });
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    status('Wyeksportowano wywiad do pliku JSON.');
  }

  function importJson(file) {
    const reader = new FileReader();
    reader.onload = function () {
      try {
        const parsed = JSON.parse(reader.result);
        const src = parsed && typeof parsed === 'object' && parsed.dane ? parsed.dane : parsed;
        const next = G.State.merge(src);
        G.State.replace(next);
        renderContent();
        status('Zaimportowano wywiad.');
      } catch (e) {
        status('Błąd: plik nie jest poprawnym wywiadem JSON.', true);
      }
    };
    reader.onerror = function () {
      status('Błąd odczytu pliku.', true);
    };
    reader.readAsText(file);
  }

  function init() {
    initTabs();
    updateTabBar();

    /* Modal potwierdzenia „Nowy pacjent” (zamiast natywnego confirm) */
    const modal = h('div', { class: 'modal-overlay', style: { display: 'none' } }, [
      h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'modal-title' }, [
        h('h3', { id: 'modal-title', class: 'modal-title', text: 'Rozpocząć nowy wywiad?' }),
        h('p', { class: 'modal-text', text: 'Wszystkie dane obecnego wywiadu zostaną usunięte. Tej operacji nie można cofnąć.' }),
        h('div', { class: 'modal-actions' }, [
          h('button', { class: 'btn', type: 'button', 'data-modal-close': '', text: 'Anuluj' }),
          h('button', { class: 'btn btn-danger-solid', type: 'button', id: 'btn-nowy-ok', text: 'Wyczyść i zacznij nowy' })
        ])
      ])
    ]);
    document.body.appendChild(modal);

    function pokazModal(show) { modal.style.display = show ? '' : 'none'; }

    document.getElementById('btn-nowy').addEventListener('click', function () {
      pokazModal(true);
    });
    modal.addEventListener('click', function (e) {
      if (e.target === modal || (e.target.closest && e.target.closest('[data-modal-close]'))) pokazModal(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') pokazModal(false);
    });
    document.getElementById('btn-nowy-ok').addEventListener('click', function () {
      pokazModal(false);
      G.State.reset();
      renderContent();
      status('Rozpoczęto nowy wywiad.');
    });
    document.getElementById('btn-import').addEventListener('click', function () {
      document.getElementById('import-file').click();
    });
    document.getElementById('import-file').addEventListener('change', function (e) {
      const file = e.target.files && e.target.files[0];
      if (file) importJson(file);
      e.target.value = '';
    });

    /* Transfery między zakładkami (uzupełnianie tylko pustych pól) */
    function transfery() {
      const s = G.State.get();
      let zmieniono = false;

      /* 4.6 → 6.2: charakter bólu przy zaznaczonej lokalizacji „Głowa” */
      if (s.ocenaBolu && s.ocenaBolu.lokalizacja && s.ocenaBolu.lokalizacja.glowa) {
        const map = G.BolGlowy.przeniesCharakter(s.ocenaBolu.charakter);
        Object.keys(map).forEach(function (k) {
          if (!s.bolGlowy.charakterB[k]) {
            s.bolGlowy.charakterB[k] = true;
            zmieniono = true;
          }
        });
        /* 4.3 → 6.2: NRS aktualne */
        if (s.bolGlowy.nrs === '' && s.ocenaBolu.nrsAktualne !== '') {
          s.bolGlowy.nrs = s.ocenaBolu.nrsAktualne;
          zmieniono = true;
        }
      }

      /* 2 → 6.6: leki wg kategorii MOH (edytowalne, uzupełniane raz) */
      if (s.leki && s.leki.length) {
        const sugestie = G.BolGlowy.sugerujMohLeki(s.leki);
        ['paracetamolNlpzAsa', 'zlozone', 'tryptany', 'opioidyKodeina'].forEach(function (kat) {
          if (s.bolGlowy.mohLeki[kat] === '' && sugestie[kat].length) {
            s.bolGlowy.mohLeki[kat] = sugestie[kat].join(', ');
            zmieniono = true;
          }
        });
      }

      /* 7.5: autozaznaczenie kryteriów profilaktyki na podstawie wcześniejszych odpowiedzi (raz) */
      const kryteria = G.Kontrola.sugerujProfilaktyka({
        czasTrwania: s.bolGlowy.czasTrwania,
        dniWMiesiacu: s.bolGlowy.dniWMiesiacu,
        mohDni: s.bolGlowy.mohDni,
        wplyw: s.ocenaBolu.wplyw,
        skutecznosc2h: s.migrena.skutecznosc2h,
        aura: s.migrena.aura
      });
      Object.keys(kryteria).forEach(function (k) {
        if (kryteria[k] && !s.migrena.profAuto[k] && !s.migrena.profilaktykaKryteria[k]) {
          s.migrena.profilaktykaKryteria[k] = true;
          s.migrena.profAuto[k] = true;
          zmieniono = true;
        }
      });

      if (zmieniono) G.State.notify();
    }

    G.State.onChange(function () {
      transfery();
      applyAll();
      renderFlags();
    });

    /* Akcje udostępniane zakładce „Podsumowanie i raport” (eksport JSON) */
    G.Akcje = {
      eksport: exportJson,
      status: status
    };

    renderContent();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
