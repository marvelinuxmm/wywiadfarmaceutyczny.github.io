/* Testy logiki zakładki „Ból głowy”: częstość, MOH, interpretacja, kryteria TTH. Uruchom: node test/bolglowy.test.js */
const assert = require('assert');
require('../js/bolglowy-logika.js');
const B = globalThis.BolGlowy;

console.log('--- Klasyfikacja częstości ---');
assert.strictEqual(B.sugerujCzestosc('0', '').opcja, 'rzadki');
assert.strictEqual(B.sugerujCzestosc('5', '6').opcja, 'czesty');
assert.strictEqual(B.sugerujCzestosc('20', '6').opcja, 'przewlekly');
assert.strictEqual(B.sugerujCzestosc('20', '').opcja, 'przewlekly');
assert.strictEqual(B.sugerujCzestosc('', '').opcja, '');
console.log('OK');

console.log('--- MOH (ból głowy) ---');
const moh = (over) => Object.assign({ paracetamolNlpzAsa: '', zlozone: '', tryptany: '', opioidyKodeina: '', dniBoluGlowy: '' }, over);
assert.strictEqual(B.sugerujMOH(moh({})).opcja, 'brak');
assert.strictEqual(B.sugerujMOH(moh({ paracetamolNlpzAsa: '15' })).opcja, 'wysokie');
assert.strictEqual(B.sugerujMOH(moh({ tryptany: '10' })).opcja, 'wysokie');
assert.strictEqual(B.sugerujMOH(moh({ zlozone: '12' })).opcja, 'wysokie');
assert.strictEqual(B.sugerujMOH(moh({ opioidyKodeina: '10' })).opcja, 'wysokie');
assert.strictEqual(B.sugerujMOH(moh({ paracetamolNlpzAsa: '8', dniBoluGlowy: '20' })).opcja, 'mozliwe');
assert.strictEqual(B.sugerujMOH(moh({ tryptany: '4' })).opcja, 'brak');
console.log('OK');

console.log('--- Wstępna interpretacja ---');
const d = (over) => Object.assign({
  alarmowe: {}, lokalizacja: {}, charakterB: {}, nrs: '', nasilenie: '', aktywnoscNasila: '',
  czasTrwania: '', dniWMiesiacu: '', miesiace: '', objawy: {}, wyzwalacze: {}, ulga: {}, mohDni: {}
}, over);
// czerwone flagi → wtórny
assert.strictEqual(B.sugerujInterpretacje(d({ alarmowe: { nagly: true } })).opcja, 'wtorny');
// typowy TTH
const tth = d({ lokalizacja: { obustronny: true }, charakterB: { uciskowy: true }, nasilenie: 'umiarkowany', aktywnoscNasila: 'nie', objawy: {} });
assert.strictEqual(B.sugerujInterpretacje(tth).opcja, 'tth');
// migrena
const mig = d({ lokalizacja: { jednostronny: true }, charakterB: { pulsujacy: true }, nasilenie: 'silny', aktywnoscNasila: 'tak', objawy: { nudnosci: true, swiatlowstret: true } });
assert.strictEqual(B.sugerujInterpretacje(mig).opcja, 'migrena');
// remis TTH vs migrena → migrena
const remis = d({ lokalizacja: { obustronny: true, jednostronny: false }, charakterB: { uciskowy: true }, nasilenie: 'umiarkowany', aktywnoscNasila: 'nie', objawy: { nudnosci: true } });
assert.strictEqual(B.sugerujInterpretacje(remis).opcja, 'migrena');
// klaster
const klaster = d({ lokalizacja: { 'okolica-oka': true }, nasilenie: 'silny', objawy: { lzawienie: true } });
assert.strictEqual(B.sugerujInterpretacje(klaster).opcja, 'klaster');
// zatokowy
const zatoki = d({ lokalizacja: { zatoki: true }, objawy: { katar: true } });
assert.strictEqual(B.sugerujInterpretacje(zatoki).opcja, 'zatokowy');
// MOH
const mohObraz = d({ dniWMiesiacu: '20', mohDni: { paracetamolNlpzAsa: '15' } });
assert.strictEqual(B.sugerujInterpretacje(mohObraz).opcja, 'moh');
// nie można ocenić
assert.strictEqual(B.sugerujInterpretacje(d({ lokalizacja: { inna: true } })).opcja, 'trudno');
console.log('OK');

console.log('--- Kryteria TTH ---');
const k = B.kryteriaTTH(tth);
assert.strictEqual(k.length, 7);
assert.strictEqual(k.filter(function (x) { return x.met; }).length, 7);
const k2 = B.kryteriaTTH(mig);
assert.strictEqual(k2[0].met, false, 'jednostronny nie spełnia kryterium obustronności');
console.log('OK');

console.log('Wszystkie testy bólu głowy przeszły.');
