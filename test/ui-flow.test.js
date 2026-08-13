/* Test przepływów UI na mini-atrapie DOM: zakładka 2 (lista leków), przełączanie
   zakładek, modal. Łapie błędy wykonania, których nie widzą testy logiki.
   Uruchom: node test/ui-flow.test.js */
const assert = require('assert');

/* ---------- Mini-DOM ---------- */
function makeEl(tag) {
  const el = {
    tagName: String(tag).toUpperCase(),
    nodeType: 1,
    children: [],
    parent: null,
    attrs: {},
    style: {},
    dataset: {},
    _text: '',
    _value: '',
    _checked: false,
    _events: {},
    _hidden: false,
    setAttribute: function (k, v) {
      this.attrs[k] = String(v);
      if (k === 'id') this._id = String(v);
      /* odzwierciedlenie własności jak w prawdziwym DOM */
      if (k === 'type' || k === 'name' || k === 'value') this['_' + k] = String(v);
      if (k === 'type' || k === 'name') this[k] = String(v);
    },
    getAttribute: function (k) { return k in this.attrs ? this.attrs[k] : null; },
    hasAttribute: function (k) { return k in this.attrs; },
    removeAttribute: function (k) { delete this.attrs[k]; },
    appendChild: function (c) { if (c == null) return c; c.parent = this; this.children.push(c); return c; },
    removeChild: function (c) {
      const i = this.children.indexOf(c);
      if (i > -1) this.children.splice(i, 1);
      c.parent = null;
      return c;
    },
    addEventListener: function (type, fn) {
      (this._events[type] = this._events[type] || []).push(fn);
    },
    removeEventListener: function (type, fn) {
      const a = this._events[type] || [];
      const i = a.indexOf(fn);
      if (i > -1) a.splice(i, 1);
    },
    dispatchEvent: function (ev) {
      ev.target = ev.target || this;
      ev.currentTarget = this;
      let n = this;
      while (n) {
        (n._events[ev.type] || []).slice().forEach(function (fn) { fn(ev); });
        if (ev._stop) break;
        n = n.parent;
      }
      return true;
    },
    closest: function (sel) {
      let n = this;
      while (n) {
        if (n.matches && n.matches(sel)) return n;
        n = n.parent;
      }
      return null;
    },
    matches: function (sel) { return matchesSel(this, sel); },
    querySelector: function (sel) { return this.querySelectorAll(sel)[0] || null; },
    querySelectorAll: function (sel) { return queryAll(this, sel); },
    focus: function () { document._active = this; },
    click: function () { this.dispatchEvent({ type: 'click' }); },
    contains: function (o) { return this === o || (function walk(n) { return n.children.some(function (c) { return c === o || walk(c); }); })(this); }
  };
  Object.defineProperty(el, 'id', { get: function () { return this._id || ''; } });
  Object.defineProperty(el, 'className', {
    get: function () { return this.attrs['class'] || ''; },
    set: function (v) {
      if (v) this.setAttribute('class', String(v));
      else delete this.attrs['class'];
    }
  });
  Object.defineProperty(el, 'textContent', {
    get: function () {
      if (this._text) return this._text;
      return this.children.map(function (c) { return c.nodeType === 3 ? c._text : c.textContent; }).join('');
    },
    set: function (v) { this._text = String(v); this.children = []; }
  });
  Object.defineProperty(el, 'innerHTML', {
    get: function () { return ''; },
    set: function () { this._text = ''; this.children = []; }
  });
  Object.defineProperty(el, 'value', {
    get: function () { return this._value; },
    set: function (v) { this._value = v == null ? '' : String(v); }
  });
  Object.defineProperty(el, 'checked', {
    get: function () { return this._checked; },
    set: function (v) { this._checked = !!v; }
  });
  Object.defineProperty(el, 'disabled', {
    get: function () { return this.hasAttribute('disabled'); },
    set: function (v) { if (v) this.setAttribute('disabled', ''); else this.removeAttribute('disabled'); }
  });
  Object.defineProperty(el, 'hidden', {
    get: function () { return this._hidden; },
    set: function (v) { this._hidden = !!v; }
  });
  Object.defineProperty(el, 'classList', {
    get: function () {
      const self = this;
      const set = function () {
        return (self.attrs['class'] || '').split(/\s+/).filter(Boolean);
      };
      return {
        add: function () {
          const s = set();
          Array.prototype.slice.call(arguments).forEach(function (c) {
            if (s.indexOf(c) === -1) s.push(c);
          });
          self.setAttribute('class', s.join(' '));
        },
        remove: function () {
          const s = set().filter(function (c) { return Array.prototype.indexOf.call(arguments, c) === -1; });
          self.setAttribute('class', s.join(' '));
        },
        toggle: function (c, force) {
          const s = set();
          const on = force === undefined ? s.indexOf(c) === -1 : !!force;
          if (on && s.indexOf(c) === -1) s.push(c);
          if (!on) { const i = s.indexOf(c); if (i > -1) s.splice(i, 1); }
          self.setAttribute('class', s.join(' '));
          return on;
        },
        contains: function (c) { return set().indexOf(c) !== -1; }
      };
    }
  });
  return el;
}

/* Prosty matcher selektorów: tag, #id, .class, [attr], [attr="v"], :not(:disabled),
   selektory złożone i zstępowanie (spacja). */
function partsOf(sel) {
  const out = [];
  sel.split(/\s+/).forEach(function (token) {
    const p = { tag: null, id: null, classes: [], attrs: [], notDisabled: false };
    let rest = token;
    const mTag = rest.match(/^[a-zA-Z][a-zA-Z0-9]*/);
    if (mTag) { p.tag = mTag[0].toUpperCase(); rest = rest.slice(mTag[0].length); }
    while (rest) {
      if (rest[0] === '#') {
        const m = rest.match(/^#([a-zA-Z0-9_-]+)/);
        p.id = m[1]; rest = rest.slice(m[0].length);
      } else if (rest[0] === '.') {
        const m = rest.match(/^\.([a-zA-Z0-9_-]+)/);
        p.classes.push(m[1]); rest = rest.slice(m[0].length);
      } else if (rest[0] === '[') {
        const m = rest.match(/^\[([a-zA-Z0-9_-]+)(?:="([^"]*)")?\]/);
        p.attrs.push([m[1], m[2] === undefined ? null : m[2]]);
        rest = rest.slice(m[0].length);
      } else if (rest.indexOf(':not(:disabled)') === 0) {
        p.notDisabled = true;
        rest = rest.slice(':not(:disabled)'.length);
      } else {
        throw new Error('nieobsługiwany selektor: ' + token);
      }
    }
    out.push(p);
  });
  return out;
}

function matchesSel(el, sel) {
  const ps = partsOf(sel);
  return matchChain(el, ps);
}
function matchChain(el, ps) {
  if (!ps.length) return false;
  const p = ps[ps.length - 1];
  const ok = function (e) {
    if (!e || e.nodeType !== 1) return false;
    if (p.tag && e.tagName !== p.tag) return false;
    if (p.id && e.getAttribute('id') !== p.id) return false;
    const cls = (e.getAttribute('class') || '').split(/\s+/).filter(Boolean);
    if (p.classes.some(function (c) { return cls.indexOf(c) === -1; })) return false;
    if (p.attrs.some(function (a) {
      const v = e.getAttribute(a[0]);
      return a[1] === null ? v === null : v !== a[1];
    })) return false;
    if (p.notDisabled && e.hasAttribute('disabled')) return false;
    return true;
  };
  if (!ok(el)) return false;
  if (ps.length === 1) return true;
  const rest = ps.slice(0, -1);
  let n = el.parent;
  while (n) {
    if (matchChain(n, rest)) return true;
    n = n.parent;
  }
  return false;
}
function queryAll(root, sel) {
  const ps = partsOf(sel);
  const out = [];
  (function walk(n) {
    n.children.forEach(function (c) {
      if (c.nodeType === 1) {
        if (matchChain(c, ps)) out.push(c);
        walk(c);
      }
    });
  })(root);
  return out;
}

/* ---------- Globalne atrapy ---------- */
const document = {
  _active: null,
  _domReady: [],
  createElement: makeEl,
  createTextNode: function (t) { return { nodeType: 3, _text: String(t), children: [], parent: null }; },
  body: null,
  getElementById: function (id) { return queryAll(this.body, '#' + id)[0] || null; },
  querySelector: function (sel) { return queryAll(this.body, sel)[0] || null; },
  querySelectorAll: function (sel) { return queryAll(this.body, sel); },
  addEventListener: function (type, fn) { if (type === 'DOMContentLoaded') this._domReady.push(fn); },
  removeEventListener: function () {}
};
global.window = globalThis;
global.document = document;
document.body = document.createElement('body');

/* Szablon jak w index.html */
['tabs', 'tab-content', 'flags-panel', 'status', 'btn-nowy', 'btn-import', 'import-file'].forEach(function (id) {
  const el = document.createElement('div');
  el.setAttribute('id', id);
  document.body.appendChild(el);
});

/* ---------- Ładujemy wszystkie skrypty (kolejność jak w index.html) ---------- */
[
  'js/ui.js', 'js/state.js', 'js/calculations.js', 'js/flags.js',
  'js/data/leki.js', 'js/data/pytania.js', 'js/data/choroby.js', 'js/data/opcje.js',
  'js/ryzyko.js', 'js/mars5.js', 'js/kontrola-logika.js', 'js/bolglowy-logika.js',
  'js/etykiety.js', 'js/tab1.js', 'js/tab2.js', 'js/tab3.js', 'js/tab4.js', 'js/tab5.js',
  'js/tab6.js', 'js/tab7.js', 'js/tab8.js', 'js/app.js'
].forEach(function (f) { require('../' + f); });

const G = globalThis;

/* ---------- Start aplikacji ---------- */
document._domReady.forEach(function (fn) { fn(); });

function klik(id) {
  const el = document.getElementById(id);
  assert.ok(el, 'brak elementu #' + id);
  el.click();
}
function przejdzDo(id) {
  const b = document.querySelector('.tab-btn[data-tab-id="' + id + '"]');
  assert.ok(b, 'brak zakładki ' + id);
  b.click();
}

console.log('--- Przełączanie zakładek ---');
assert.strictEqual(document.querySelectorAll('.tab-btn').length, 8);
przejdzDo('farmakoterapia');
assert.ok(document.querySelector('.tab-btn[data-tab-id="farmakoterapia"]').classList.contains('active'));
console.log('OK');

console.log('--- 2.1 Dodawanie leku ---');
assert.strictEqual(G.State.get().leki.length, 0);
assert.strictEqual(document.getElementById('tbody-leki').children.length, 1, 'pusty wiersz „Brak dodanych leków”');
klik('btn-dodaj-lek');
assert.strictEqual(G.State.get().leki.length, 1, 'przycisk dodaje lek do stanu');
const rows = document.getElementById('tbody-leki').children;
assert.strictEqual(rows.length, 1, 'wiersz w tabeli');
console.log('OK');

console.log('--- 2.1 Wpisanie nazwy (autodetekcja grupy) ---');
const inpNazwa = rows[0].querySelector('[data-lField="nazwa"]');
assert.ok(inpNazwa, 'pole nazwy');
inpNazwa.value = 'Nurofen';
inpNazwa.dispatchEvent({ type: 'input' });
assert.strictEqual(G.State.get().leki[0].nazwa, 'Nurofen');
assert.deepStrictEqual(G.State.get().leki[0].grupy, ['NLPZ'], 'grupa wykryta z bazy');
const inpMoc = rows[0].querySelector('[data-lField="moc"]');
inpMoc.value = '200 mg';
inpMoc.dispatchEvent({ type: 'input' });
assert.strictEqual(G.State.get().leki[0].moc, '200 mg');
console.log('OK');

console.log('--- 2.1 Zmiana trybu (select) ---');
const selTryb = rows[0].querySelector('[data-lField="tryb"]');
selTryb.value = 'przewlekle';
selTryb.dispatchEvent({ type: 'change' });
assert.strictEqual(G.State.get().leki[0].tryb, 'przewlekle');
console.log('OK');

console.log('--- 2.1 Usuwanie leku ---');
const btnUsun = rows[0].querySelector('[data-lRemove]');
btnUsun.click();
assert.strictEqual(G.State.get().leki.length, 0, 'wiersz usunięty ze stanu');
assert.strictEqual(document.getElementById('tbody-leki').children.length, 1, 'wraca pusty wiersz');
console.log('OK');

console.log('--- 2.2 Podsumowanie ryzyka ---');
przejdzDo('farmakoterapia'); // ponowny init
klik('btn-dodaj-lek');
const rows2 = document.getElementById('tbody-leki').children;
rows2[0].querySelector('[data-lField="nazwa"]').value = 'Nurofen';
rows2[0].querySelector('[data-lField="nazwa"]').dispatchEvent({ type: 'input' });
const box = document.getElementById('box-ryzyko');
assert.ok(box.children.length > 0, 'ryzyko renderowane');
assert.ok(document.querySelector('#box-ryzyko .ryzyko-box'), 'klasa ryzyko-box');
console.log('OK');

console.log('--- Modal „Nowy pacjent” ---');
klik('btn-nowy');
const overlay = document.body.children.find(function (c) { return c.getAttribute && c.getAttribute('class') === 'modal-overlay'; });
assert.ok(overlay, 'modal w DOM');
assert.notStrictEqual(overlay.style.display, 'none', 'modal widoczny');
G.State.get().leki.length = 0;
const okBtn = overlay.querySelector('#btn-nowy-ok');
assert.ok(okBtn, 'przycisk potwierdzenia');
okBtn.click();
assert.strictEqual(overlay.style.display, 'none', 'modal zamknięty po potwierdzeniu');
assert.strictEqual(G.State.get().leki.length, 0, 'stan wyczyszczony');
console.log('OK');

console.log('--- Zakładki dynamiczne + ukończenie ---');
assert.ok(document.querySelector('.tab-btn[data-tab-id="bolglowy"]').disabled, '6 zablokowana na starcie');
G.State.set('ocenaBolu.lokalizacja.glowa', true);
assert.ok(!document.querySelector('.tab-btn[data-tab-id="bolglowy"]').disabled, '6 odblokowana po „Głowa”');
G.State.set('ocenaBolu.nrsAktualne', '6');
assert.ok(document.querySelector('.tab-btn[data-tab-id="ocena"]').classList.contains('done'), '✓ dla oceny po wpisaniu NRS');
G.State.reset();
document._domReady.forEach(function () {});
console.log('OK');

console.log('Wszystkie testy przepływów UI przeszły.');
