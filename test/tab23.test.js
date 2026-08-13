/* Testy zakładek 2 i 3 + szczegółowe choroby: baza leków, ryzyko, MARS-5, pytania, mapowanie. Uruchom: node test/tab23.test.js */
const assert = require('assert');
require('../js/calculations.js');
require('../js/data/leki.js');
require('../js/data/pytania.js');
require('../js/data/choroby.js');
require('../js/ryzyko.js');
require('../js/mars5.js');
require('../js/flags.js');
const Leki = globalThis.Leki;
const Pytania = globalThis.Pytania;
const Ryzyko = globalThis.Ryzyko;
const Mars5 = globalThis.Mars5;
const Flags = globalThis.Flags;

console.log('--- Szczegółowe choroby ---');
const CHSZ = globalThis.CHOROBY_SZCZEGOLOWE;
assert.strictEqual(CHSZ.length, 9, '9 grup');
const idsSz = [];
CHSZ.forEach(g => g.items.forEach(it => idsSz.push(it.id)));
assert.strictEqual(new Set(idsSz).size, idsSz.length, 'unikalne identyfikatory');
idsSz.forEach(id => assert.ok(/^[a-z0-9_]+$/.test(id), 'id bez kropek: ' + id));
globalThis.Choroby.kategorie.forEach(k => {
  assert.ok(['sercowo', 'metaboliczne', 'nerki_watroba', 'przewodpokarmowy', 'oddechowe',
    'neurologia', 'psychiczne', 'kostno', 'inne'].indexOf(k) !== -1, 'kategoria: ' + k);
});
assert.deepStrictEqual(globalThis.Choroby.kategorie, ['sercowo', 'metaboliczne', 'nerki_watroba', 'przewodpokarmowy',
  'oddechowe', 'neurologia', 'psychiczne', 'kostno', 'inne']);
assert.strictEqual(globalThis.Choroby.kategoriaDla('od_astma'), 'oddechowe');
assert.strictEqual(globalThis.Choroby.kategoriaDla('nw_dializa'), 'pchn');
assert.strictEqual(globalThis.Choroby.kategoriaDla('nw_marskosc'), 'watroba');
assert.strictEqual(globalThis.Choroby.kategoriaDla('met_cukrzyca2'), 'metaboliczne');
assert.strictEqual(globalThis.Choroby.kategoriaDla('nieistnieje'), null);
console.log('OK');

console.log('--- Flagi szczegółowych chorób ---');
const fl = (over) => Flags.compute(Object.assign({
  dataUrodzenia: '', plec: '', masa: '', ciaza: '', kreatynina: '', jednostkaKreatyniny: 'mgdl',
  dataKreatyniny: '', albuminuria: 'brak', uacr: '', uacrJednostka: 'mgg',
  psychAktywny: '', psychOpis: '', epikryza: '',
  leki: [], odpowiedzi: {},
  epikryzaFarmakoterapii: '', mars5: {}, pomocAdherence: '',
  choroby: { sercowo: false, oddechowe: false, przewodpokarmowy: false, watroba: false, pchn: false, psychiczne: false, brak: false, niewiem: false },
  chorobySzczegolowe: {}
}, over));
const flTitles = (s) => s.map(f => f.title);
assert.ok(flTitles(fl({ chorobySzczegolowe: { nw_dializa: true } })).indexOf('Dializoterapia') !== -1, 'dializa → alert');
assert.ok(flTitles(fl({ chorobySzczegolowe: { in_paliatywna: true } })).indexOf('Leczenie paliatywne') !== -1, 'paliatywne → info');
assert.ok(flTitles(fl({ chorobySzczegolowe: { od_astma: true } })).indexOf('Choroba układu oddechowego') === -1, 'pozycja szczegółowa sama nie generuje flagi kategorii');
console.log('OK');

console.log('--- Baza leków ---');
assert.deepStrictEqual(Leki.znajdzGrupy('Nurofen'), ['NLPZ']);
assert.deepStrictEqual(Leki.znajdzGrupy('nurofen'), ['NLPZ']);
assert.deepStrictEqual(Leki.znajdzGrupy('ibuprofen'), ['NLPZ']);
assert.deepStrictEqual(Leki.znajdzGrupy('Poltram'), ['opioid']);
assert.deepStrictEqual(Leki.znajdzGrupy('Apap'), ['paracetamol']);
assert.deepStrictEqual(Leki.znajdzGrupy('Polocard'), ['ASA', 'antyagregant']);
assert.deepStrictEqual(Leki.znajdzGrupy('NieistniejącyLek'), []);
assert.deepStrictEqual(Leki.znajdzGrupy(''), []);
assert.ok(globalThis.GRUPA_IDS.length > 0);
console.log('OK');

console.log('--- Pytania ---');
assert.ok(Pytania.all.length >= 4);
assert.ok(Pytania.isAlarm('pp.objawy'));
assert.ok(Pytania.isAlarm('wa.dekompensacja'));
assert.ok(!Pytania.isAlarm('sc.antykoagulanty'));
assert.strictEqual(Pytania.autodetekcja, undefined, 'brak pytań o leki i automatycznego dopasowania');
const ids = [];
Pytania.all.forEach(s => s.pytania.forEach(p => ids.push(p.id)));
assert.strictEqual(new Set(ids).size, ids.length, 'identyfikatory pytań unikalne');
console.log('OK');

console.log('--- Podsumowanie ryzyka ---');
const base = {
  choroby: { sercowo: false, oddechowe: false, przewodpokarmowy: false, watroba: false, pchn: false },
  leki: [], odpowiedzi: {}
};
assert.deepStrictEqual(Ryzyko.compute(base), { info: [], uwaga: [], reakcja: [] });

const st1 = {
  choroby: { przewodpokarmowy: true },
  leki: [{ nazwa: 'Nurofen', grupy: [] }],
  odpowiedzi: {}
};
const rz1 = Ryzyko.compute(st1);
assert.strictEqual(rz1.uwaga.length, 1, 'NLPZ + choroba PP → uwaga');
assert.ok(rz1.uwaga[0].indexOf('NLPZ') !== -1);

const st2 = {
  choroby: { oddechowe: true },
  leki: [{ nazwa: 'Poltram', grupy: [] }, { nazwa: 'Apap', grupy: [] }],
  odpowiedzi: {}
};
const rz2 = Ryzyko.compute(st2);
assert.strictEqual(rz2.uwaga.length, 1, 'opioid + oddechowe → uwaga');
assert.strictEqual(rz2.info.length, 1, '2 leki istotne dla bólu → informacja');

const st3 = {
  choroby: { watroba: true },
  leki: [{ nazwa: 'Apap', grupy: [] }],
  odpowiedzi: {}
};
assert.strictEqual(Ryzyko.compute(st3).uwaga.length, 1, 'paracetamol + wątroba → uwaga');

const st4 = {
  choroby: {},
  leki: [{ nazwa: 'Nieznany', grupy: ['NLPZ'] }],
  odpowiedzi: {}
};
assert.strictEqual(Ryzyko.compute(st4).info.length, 0, '1 lek → brak informacji');

const st5 = {
  choroby: {},
  leki: [],
  odpowiedzi: { 'pp.objawy': 'tak', 'sc.antykoagulanty': 'tak' }
};
const rz5 = Ryzyko.compute(st5);
assert.strictEqual(rz5.reakcja.length, 1, 'objaw alarmowy → wymaga reakcji');
assert.ok(rz5.reakcja[0].indexOf('smoliste') !== -1, 'wymienia objaw');
assert.ok(rz5.reakcja[0].indexOf('antykoagulanty') === -1, 'niealarmowe pytanie nie wchodzi do reakcji');

const st6 = {
  choroby: { oddechowe: true },
  leki: [{ nazwa: 'Stilnox', grupy: [] }],
  odpowiedzi: {}
};
assert.strictEqual(Ryzyko.compute(st6).uwaga.length, 1, 'z-lek + oddechowe → uwaga');
console.log('OK');

console.log('--- MARS-5 ---');
assert.strictEqual(Mars5.score({ m1: '', m2: '', m3: '', m4: '', m5: '' }), null);
assert.strictEqual(Mars5.score({ m1: 'nigdy', m2: 'nigdy', m3: 'nigdy', m4: 'nigdy', m5: 'nigdy' }).sum, 25);
const s25 = Mars5.score({ m1: 'nigdy', m2: 'nigdy', m3: 'nigdy', m4: 'nigdy', m5: 'nigdy' });
assert.strictEqual(s25.interp.sev, 'info');
assert.strictEqual(Mars5.score({ m1: 'ciagle', m2: 'ciagle', m3: 'ciagle', m4: 'ciagle', m5: 'ciagle' }).sum, 5);
assert.strictEqual(Mars5.score({ m1: 'ciagle', m2: 'ciagle', m3: 'ciagle', m4: 'ciagle', m5: 'ciagle' }).interp.sev, 'alert');
assert.strictEqual(Mars5.score({ m1: 'czasami', m2: 'czasami', m3: 'czasami', m4: 'czasami', m5: 'czasami' }).interp.sev, 'warn');
assert.strictEqual(Mars5.score({ m1: 'rzadko', m2: 'rzadko', m3: 'rzadko', m4: 'rzadko', m5: 'rzadko' }).interp.sev, 'info');
assert.strictEqual(Mars5.odchylenieOdNigdy({ m1: 'nigdy', m2: 'nigdy', m3: '', m4: '', m5: '' }), false, 'tylko „nigdy” lub brak odpowiedzi → brak odchylenia');
assert.strictEqual(Mars5.odchylenieOdNigdy({ m1: 'nigdy', m2: 'rzadko', m3: '', m4: '', m5: '' }), true, 'odpowiedź inna niż „nigdy” → odchylenie');
assert.strictEqual(Mars5.odchylenieOdNigdy({}), false);
console.log('OK');

console.log('Wszystkie testy zakładek 2/3 przeszły pomyślnie.');
