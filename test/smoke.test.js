/* Smoke test: ładuje wszystkie skrypty aplikacji w kolejności jak w index.html (z atrapą DOM),
   sprawdza spójność G.OPCJE / G.E / modułów zakładek oraz brak martwych eksportów.
   Uruchom: node test/smoke.test.js */
const assert = require('assert');

/* Atrapa DOM — skrypty tylko rejestrują funkcje; renderowanie nie jest wywoływane. */
global.window = globalThis;
global.document = {
  addEventListener: function () {},
  removeEventListener: function () {},
  createElement: function () {
    return {
      style: {}, dataset: {},
      setAttribute: function () {}, getAttribute: function () { return null; },
      appendChild: function () {}, removeChild: function () {},
      addEventListener: function () {}, removeEventListener: function () {},
      querySelector: function () { return null; }, querySelectorAll: function () { return []; },
      classList: { add: function () {}, remove: function () {}, toggle: function () {} },
      closest: function () { return null; }
    };
  },
  createTextNode: function (t) { return { textContent: t }; },
  querySelector: function () { return null; },
  querySelectorAll: function () { return []; },
  getElementById: function () { return null; },
  body: { appendChild: function () {} }
};

/* Kolejność skryptów zgodna z index.html */
[
  'js/ui.js',
  'js/state.js',
  'js/calculations.js',
  'js/flags.js',
  'js/data/leki.js',
  'js/data/pytania.js',
  'js/data/choroby.js',
  'js/data/opcje.js',
  'js/ryzyko.js',
  'js/mars5.js',
  'js/kontrola-logika.js',
  'js/bolglowy-logika.js',
  'js/etykiety.js',
  'js/tab1.js',
  'js/tab2.js',
  'js/tab3.js',
  'js/tab4.js',
  'js/tab5.js',
  'js/tab6.js',
  'js/tab7.js',
  'js/tab8.js',
  'js/app.js'
].forEach(function (f) { require('../' + f); });

const G = globalThis;

console.log('--- Moduły zakładek ---');
['Tab1', 'Tab2', 'Tab3', 'Tab4', 'Tab5', 'Tab6', 'Tab7', 'Tab8'].forEach(function (n) {
  assert.ok(G[n], 'brak modułu ' + n);
  assert.strictEqual(typeof G[n].init, 'function', n + '.init');
  assert.strictEqual(typeof G[n].apply, 'function', n + '.apply');
});
assert.strictEqual(G.Tab9, undefined, 'Tab9 powinien być przemianowany na Tab8');
console.log('OK');

console.log('--- Pomoce UI ---');
['h', 'radio', 'checkbox', 'nrsField', 'sync', 'handleStateInput'].forEach(function (k) {
  assert.strictEqual(typeof G.UI[k], 'function', 'UI.' + k);
});
console.log('OK');

console.log('--- G.OPCJE — format i kompletność ---');
const DOMENY = [
  'plec', 'ciaza', 'takNieNw', 'jednostkaKreatyniny', 'albuminuria', 'uacrJednostka',
  'marsPytania', 'marsSkala',
  'skalaOcena', 'wplywPytania', 'wplyw', 'obLokalizacje', 'obCharakter', 'obPrzebieg', 'zmniejsza',
  'skalaTryb', 'ulga', 'satysfakcja', 'miedzy', 'dnLista', 'dnOdp', 'dnKorygowane', 'zmiana', 'statusKontroli',
  'bgAlarmowe', 'bgLokalizacje', 'bgCharakter', 'bgAktywnosc', 'bgCzasTrwania', 'bgObjawy',
  'bgWyzwalacze', 'bgUlga', 'bgMohOcena', 'bgInterpretacjaOpcje', 'bgInterpretacja', 'bgEdukacja',
  'mgRozpoznana', 'mgProdrom', 'mgAura', 'mgAuraCzas', 'mgAuraOst', 'mgWczesnie', 'mgSkutecznosc',
  'mgNawrot', 'mgWymioty', 'mgProfKryteria', 'mgProfStos', 'mgProfEfekt', 'mgKrok'
];
DOMENY.forEach(function (d) {
  const m = G.OPCJE[d];
  assert.ok(Array.isArray(m) && m.length > 0, 'dziedzina OPCJE: ' + d);
  const wartosci = m.map(function (p) {
    assert.ok(Array.isArray(p) && p.length === 2, 'para [wartość, etykieta] w ' + d);
    assert.strictEqual(typeof p[0], 'string', 'wartość w ' + d);
    assert.ok(typeof p[1] === 'string' && p[1].length > 0, 'etykieta w ' + d);
    return p[0];
  });
  assert.strictEqual(new Set(wartosci).size, wartosci.length, 'duplikaty wartości w ' + d);
});
console.log('OK');

console.log('--- G.E (raport) spójne z G.OPCJE ---');
assert.strictEqual(G.E.label('plec', 'k'), 'Kobieta');
assert.strictEqual(G.E.label('bgObjawy', 'aura'), 'Aura');
assert.strictEqual(G.E.label('bgInterpretacja', 'migrena'), 'Migrena');
assert.strictEqual(G.E.label('mgAura', 'wzrokowa'), 'Wzrokowa');
assert.strictEqual(G.E.skroty('mgAura', { czuciowa: true, mowy: true }), 'Czuciowa, Zaburzenia mowy');
assert.strictEqual(G.E.label('nieznana-domena', 'x'), 'x', 'fallback dla nieznanej dziedziny');
assert.strictEqual(G.E.skroty('bgObjawy', { swiatlowstret: true, nudnosci: true }), 'Światłowstręt, Nudności');
assert.strictEqual(G.E.skroty('bgObjawy', {}), '');
console.log('OK');

console.log('--- Usunięte martwe eksporty ---');
assert.strictEqual(G.Kontrola.sugerujMOH, undefined, 'Kontrola.sugerujMOH usunięty (duplikat BolGlowy.sugerujMOH)');
assert.ok(G.BolGlowy.sugerujMOH, 'BolGlowy.sugerujMOH nadal dostępny');
console.log('OK');

console.log('Wszystkie testy dymne przeszły.');
