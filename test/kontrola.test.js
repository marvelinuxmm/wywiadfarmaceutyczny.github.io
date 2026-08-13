/* Testy logiki kontroli bólu: status kontroli, MOH, klasyfikacja, poradnia. Uruchom: node test/kontrola.test.js */
const assert = require('assert');
require('../js/kontrola-logika.js');
const K = globalThis.Kontrola;

console.log('--- Status kontroli bólu ---');
const st = (over) => Object.assign({
  nrsAktualne: '', nrsSrednie: '', ulga: '', miedzyDawkami: '', dnLista: {}, satysfakcja: '', marsMean: null
}, over);

assert.strictEqual(K.sugerujStatusKontroli(st({ nrsAktualne: '2', nrsSrednie: '2', ulga: 'calkowita', satysfakcja: 'duza' })).opcja, 'dobra');
assert.strictEqual(K.sugerujStatusKontroli(st({ nrsAktualne: '5', nrsSrednie: '4', ulga: 'umiarkowana', satysfakcja: 'umiarkowana' })).opcja, 'czesciowa');
assert.strictEqual(K.sugerujStatusKontroli(st({ nrsSrednie: '7' })).opcja, 'niewystarczajaca');
assert.strictEqual(K.sugerujStatusKontroli(st({ ulga: 'brak' })).opcja, 'niewystarczajaca');
assert.strictEqual(K.sugerujStatusKontroli(st({ miedzyDawkami: 'nie' })).opcja, 'niewystarczajaca');
assert.strictEqual(K.sugerujStatusKontroli(st({ dnLista: { krwawienie: true } })).opcja, 'niewystarczajaca');
assert.strictEqual(K.sugerujStatusKontroli(st({ marsMean: 2.5 })).opcja, 'niewystarczajaca');
assert.strictEqual(K.sugerujStatusKontroli(st({ dnLista: { sennosc: true } })).opcja, 'czesciowa');
assert.ok(K.sugerujStatusKontroli(st({ nrsSrednie: '7' })).powody.length >= 1);
console.log('OK');

console.log('--- Ryzyko MOH ---');
const moh = (over) => Object.assign({ paracetamolNlpz: '', tryptany: '', zlozone: '', opioidy: '', dniBoluGlowy: '' }, over);
assert.strictEqual(K.sugerujMOH(moh({})).status, 'niskie');
assert.strictEqual(K.sugerujMOH(moh({ tryptany: '8' })).status, 'mozliwe');
assert.strictEqual(K.sugerujMOH(moh({ paracetamolNlpz: '10' })).status, 'mozliwe');
assert.strictEqual(K.sugerujMOH(moh({ tryptany: '10' })).status, 'wysokie');
assert.strictEqual(K.sugerujMOH(moh({ paracetamolNlpz: '15' })).status, 'wysokie');
assert.strictEqual(K.sugerujMOH(moh({ opioidy: '12' })).status, 'wysokie');
assert.strictEqual(K.sugerujMOH(moh({ dniBoluGlowy: '20' })).status, 'wysokie');
assert.strictEqual(K.sugerujMOH(moh({ zlozone: '6', tryptany: '4' })).status, 'niskie');
console.log('OK');

console.log('--- Klasyfikacja migreny (z 6.3) ---');
assert.deepStrictEqual(K.sugerujKlasyfikacja(''), { label: '', opis: '' });
assert.strictEqual(K.sugerujKlasyfikacja('5').label, 'Migrena epizodyczna');
assert.strictEqual(K.sugerujKlasyfikacja('14').label, 'Migrena epizodyczna');
assert.strictEqual(K.sugerujKlasyfikacja('15').label, 'Migrena przewlekła');
assert.strictEqual(K.sugerujKlasyfikacja('20').label, 'Migrena przewlekła');
console.log('OK');

console.log('--- Kryteria profilaktyki (7.8) ---');
const pr = (over) => Object.assign({
  czasTrwania: '', dniWMiesiacu: '', mohDni: {}, wplyw: {}, skutecznosc2h: '', aura: ''
}, over);
assert.deepStrictEqual(K.sugerujProfilaktyka(pr({})), {
  '72h': false, wplyw: false, nieskuteczne: false, 'czeste-dorzane': false, aura: false, przewlekla: false
});
assert.strictEqual(K.sugerujProfilaktyka(pr({ czasTrwania: '>72h' }))['72h'], true);
assert.strictEqual(K.sugerujProfilaktyka(pr({ czasTrwania: '4-72h' }))['72h'], false);
assert.strictEqual(K.sugerujProfilaktyka(pr({ wplyw: { praca: true } })).wplyw, true);
assert.strictEqual(K.sugerujProfilaktyka(pr({ wplyw: { brak: true } })).wplyw, false);
assert.strictEqual(K.sugerujProfilaktyka(pr({ skutecznosc2h: 'brak' })).nieskuteczne, true);
assert.strictEqual(K.sugerujProfilaktyka(pr({ skutecznosc2h: 'poprawa' })).nieskuteczne, false);
assert.strictEqual(K.sugerujProfilaktyka(pr({ mohDni: { tryptany: '8' } }))['czeste-dorzane'], true);
assert.strictEqual(K.sugerujProfilaktyka(pr({ mohDni: { tryptany: '7', paracetamolNlpzAsa: '7' } }))['czeste-dorzane'], false);
assert.strictEqual(K.sugerujProfilaktyka(pr({ mohDni: { zlozone: '9' } }))['czeste-dorzane'], true);
assert.strictEqual(K.sugerujProfilaktyka(pr({ aura: 'wzrokowa' })).aura, true);
assert.strictEqual(K.sugerujProfilaktyka(pr({ aura: 'nie' })).aura, false);
assert.strictEqual(K.sugerujProfilaktyka(pr({ dniWMiesiacu: '15' })).przewlekla, true);
assert.strictEqual(K.sugerujProfilaktyka(pr({ dniWMiesiacu: '10' })).przewlekla, false);
console.log('OK');

console.log('--- Komunikat o poradni ---');
assert.strictEqual(K.komunikatPoradnia('3', '3', 'calkowita'), null);
assert.strictEqual(K.komunikatPoradnia('7', '5', 'mala') !== null, true);
assert.strictEqual(K.komunikatPoradnia('7', '6', 'umiarkowana'), null);
assert.strictEqual(K.komunikatPoradnia('6', '', 'brak') !== null, true);
console.log('OK');

console.log('Wszystkie testy logiki kontroli przeszły.');
