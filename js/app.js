/* Nawigacja zakładek, panel alertów, eksport/import JSON, reset. */
(function () {
  const h = UI.h;
  const G = typeof window !== 'undefined' ? window : globalThis;

  const TABS = [
    { id: 'profil', label: '1. Profil pacjenta i choroby współistniejące', enabled: true },
    { id: 'farmakoterapia', label: '2. Farmakoterapia', enabled: true },
    { id: 'mars5', label: '3. MARS-5 i stosowanie leczenia', enabled: true },
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
      const btn = h('button', {
        class: 'tab-btn',
        type: 'button',
        text: t.label,
        disabled: t.enabled ? undefined : '',
        title: t.enabled ? '' : 'Moduł w przygotowaniu',
        onclick: function () { switchTab(t.id); }
      });
      btn.setAttribute('data-tab-id', t.id);
      bar.appendChild(btn);
    });
  }

  function updateTabBar() {
    document.querySelectorAll('.tab-btn').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-tab-id') === active);
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
      G.Tab9.init(c);
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
    if (G.Tab9) G.Tab9.apply();
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
  }

  function renderFlags() {
    const panel = document.getElementById('flags-panel');
    const flags = G.Flags.compute(G.State.get());
    const order = { alert: 0, warn: 1, info: 2 };
    flags.sort(function (a, b) { return order[a.sev] - order[b.sev]; });

    panel.innerHTML = '';
    panel.appendChild(h('h2', { class: 'flags-title', text: 'Alerty i flagi' }));
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

    document.getElementById('btn-nowy').addEventListener('click', function () {
      if (confirm('Wyczyścić dane wywiadu? Tej operacji nie można cofnąć.')) {
        G.State.reset();
        renderContent();
        status('Rozpoczęto nowy wywiad.');
      }
    });
    document.getElementById('btn-import').addEventListener('click', function () {
      document.getElementById('import-file').click();
    });
    document.getElementById('import-file').addEventListener('change', function (e) {
      const file = e.target.files && e.target.files[0];
      if (file) importJson(file);
      e.target.value = '';
    });

    G.State.onChange(function () {
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
