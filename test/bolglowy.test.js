/* Testy logiki zakładki „Ból głowy”: częstość, MOH, interpretacja, kryteria TTH. Uruchom: node test/bolglowy.test.js */
const assert = require('assert');
require('../js/bolglowy-logika.js');
require('../js/data/leki.js');
const B = globalThis.BolGlowy;

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

console.log('--- Nasilenie z NRS ---');
assert.strictEqual(B.nrsDoNasilenia(''), null);
assert.strictEqual(B.nrsDoNasilenia('3'), 'lagodny');
assert.strictEqual(B.nrsDoNasilenia('4'), 'umiarkowany');
assert.strictEqual(B.nrsDoNasilenia('6'), 'umiarkowany');
assert.strictEqual(B.nrsDoNasilenia('7'), 'silny');
assert.strictEqual(B.nrsDoNasilenia('10'), 'silny');
console.log('OK');

console.log('--- Wstępna interpretacja ---');
const d = (over) => Object.assign({
  alarmowe: {}, lokalizacja: {}, charakterB: {}, nrs: '', aktywnoscNasila: '',
  czasTrwania: '', dniWMiesiacu: '', objawy: {}, wyzwalacze: {}, ulga: {}, mohDni: {}
}, over);
// czerwone flagi → wtórny
assert.strictEqual(B.sugerujInterpretacje(d({ alarmowe: { nagly: true } })).opcja, 'wtorny');
// typowy TTH (NRS 5 = umiarkowane)
const tth = d({ lokalizacja: { obustronny: true }, charakterB: { uciskowy: true }, nrs: '5', aktywnoscNasila: 'nie', objawy: {} });
assert.strictEqual(B.sugerujInterpretacje(tth).opcja, 'tth');
// migrena (NRS 8 = silne)
const mig = d({ lokalizacja: { jednostronny: true }, charakterB: { pulsujacy: true }, nrs: '8', aktywnoscNasila: 'tak', objawy: { nudnosci: true, swiatlowstret: true } });
assert.strictEqual(B.sugerujInterpretacje(mig).opcja, 'migrena');
// remis TTH vs migrena → migrena (NRS 5)
const remis = d({ lokalizacja: { obustronny: true, jednostronny: false }, charakterB: { uciskowy: true }, nrs: '5', aktywnoscNasila: 'nie', objawy: { nudnosci: true } });
assert.strictEqual(B.sugerujInterpretacje(remis).opcja, 'migrena');
// klaster (NRS 9 = silny)
const klaster = d({ lokalizacja: { 'okolica-oka': true }, nrs: '9', objawy: { lzawienie: true } });
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
assert.strictEqual(k2[2].met, false, 'NRS 8 nie spełnia kryterium łagodnego/umiarkowanego nasilenia');
console.log('OK');

console.log('--- Przeniesienie charakteru 4.6 → 6.2 ---');
assert.deepStrictEqual(B.przeniesCharakter({}), {});
assert.deepStrictEqual(B.przeniesCharakter({ tepy: true, pulsujacy: true }), { tepy: true, pulsujacy: true });
assert.deepStrictEqual(B.przeniesCharakter({ uciskajacy: true }), { uciskowy: true });
assert.deepStrictEqual(B.przeniesCharakter({ rozpierajacy: true, piekacy: true }), { rozpierajacy: true, piekacy: true });
assert.deepStrictEqual(B.przeniesCharakter({ ostry: true, klujacy: true, razenie: true }), { przeszywajacy: true });
assert.deepStrictEqual(B.przeniesCharakter({ dretwienie: true, inny: true }), {});
console.log('OK');

console.log('--- Sugestia leków MOH (2 → 6.6) ---');
const pusty = { paracetamolNlpzAsa: [], zlozone: [], tryptany: [], opioidyKodeina: [] };
assert.deepStrictEqual(B.sugerujMohLeki([]), pusty);
assert.deepStrictEqual(B.sugerujMohLeki(null), pusty);
assert.deepStrictEqual(B.sugerujMohLeki([{ nazwa: '', grupy: [] }]), pusty, 'lek bez nazwy pomijany');
const lp = B.sugerujMohLeki([{ nazwa: 'Apap', moc: '500 mg', grupy: [] }, { nazwa: 'Nurofen', grupy: ['NLPZ'] }]);
assert.deepStrictEqual(lp.paracetamolNlpzAsa, ['Apap 500 mg', 'Nurofen'], 'paracetamol (auto) i NLPZ (grupa)');
const lo = B.sugerujMohLeki([{ nazwa: 'Poltram', grupy: ['opioid'] }, { nazwa: 'Aspirin', grupy: ['ASA'] }]);
assert.deepStrictEqual(lo.opioidyKodeina, ['Poltram'], 'opioid → opioidy/kodeina');
assert.deepStrictEqual(lo.paracetamolNlpzAsa, ['Aspirin'], 'ASA → paracetamol/NLPZ/ASA');
assert.deepStrictEqual(B.sugerujMohLeki([{ nazwa: 'LekInny', grupy: ['IPP'] }]).paracetamolNlpzAsa, [], 'IPP ignorowany');
console.log('OK');

console.log('Wszystkie testy bólu głowy przeszły.');
