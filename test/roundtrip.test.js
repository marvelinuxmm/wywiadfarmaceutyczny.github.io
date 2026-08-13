/* Roundtrip: eksport → import nowych pól (leki, odpowiedzi, mars5, przyczyny). */
const assert = require('assert');
require('../js/state.js');
const State = globalThis.State;

const s = State.get();
s.dataUrodzenia = '1956-08-13';
s.wzrost = '175';
s.leki.push({ nazwa: 'Nurofen', moc: '200 mg', postac: 'tabl.', tryb: 'przewlekle', schemat: '1-0-0', wskazanie: 'ból', komentarze: '', grupy: ['NLPZ'] });
s.odpowiedzi['pp.objawy'] = 'tak';
s.chorobySzczegolowe = { od_astma: true, nw_dializa: true, met_cukrzyca2: false };
s.choroby.metaboliczne = true;
s.inneChoroby = { sercowo: 'kardiomiopatia', psychiczne: 'anoreksja' };
s.ocenaBolu = { data: '2026-08-12', skala: 'nrs', nrsAktualne: '6', nrsSrednie: '5', lekiNaBol: [1, 2], lokalizacja: { glowa: true }, epikryza: 'x' };
s.kontrolaBolu = { data: '2026-08-19', ulga: 'mala', dnLista: { krwawienie: true }, statusKontroli: 'niewystarczajaca' };
s.migrena = { rozpoznana: 'lekarz', lekiDorzane: [2], profAuto: { '72h': true }, klasyfikacja: 'Migrena przewlekła' };
s.bolGlowy.odKiedyIle = '2';
s.bolGlowy.odKiedyJednostka = 'lata';
s.bolGlowy.mohLeki = { paracetamolNlpzAsa: 'Nurofen', zlozone: '', tryptany: '', opioidyKodeina: '' };
s.epikryzaFarmakoterapii = 'test';
s.mars5 = { m1: 'nigdy', m2: 'rzadko', m3: 'czasami', m4: 'nigdy', m5: 'rzadko' };
s.pomocAdherence = 'pomoc';
s.marsProblemy = 'zapomina o dawce';

const exportData = JSON.parse(JSON.stringify({ dane: s })); // symulacja pliku
const merged = State.merge(exportData.dane);
assert.strictEqual(merged.dataUrodzenia, '1956-08-13');
assert.strictEqual(merged.wzrost, '175');
assert.strictEqual(merged.leki.length, 1);
assert.deepStrictEqual(merged.leki[0].grupy, ['NLPZ']);
assert.strictEqual(merged.leki[0].tryb, 'przewlekle');
assert.strictEqual(merged.odpowiedzi['pp.objawy'], 'tak');
assert.strictEqual(merged.epikryzaFarmakoterapii, 'test');
assert.strictEqual(merged.mars5.m3, 'czasami');
assert.strictEqual(merged.pomocAdherence, 'pomoc');
assert.strictEqual(merged.marsProblemy, 'zapomina o dawce');
assert.strictEqual(merged.choroby.brak, false);
assert.strictEqual(merged.choroby.metaboliczne, true);
assert.strictEqual(merged.chorobySzczegolowe.od_astma, true);
assert.strictEqual(merged.chorobySzczegolowe.nw_dializa, true);
assert.strictEqual(merged.chorobySzczegolowe.met_cukrzyca2, false);
assert.strictEqual(Object.keys(merged.chorobySzczegolowe).length, 3);
assert.strictEqual(merged.inneChoroby.sercowo, 'kardiomiopatia');
assert.strictEqual(merged.inneChoroby.psychiczne, 'anoreksja');
assert.strictEqual(merged.ocenaBolu.nrsAktualne, '6');
assert.strictEqual(merged.ocenaBolu.lokalizacja.glowa, true);
assert.deepStrictEqual(merged.ocenaBolu.lekiNaBol, [1, 2]);
assert.strictEqual(merged.bolGlowy.mohLeki.paracetamolNlpzAsa, 'Nurofen');
assert.deepStrictEqual(merged.bolGlowy.mohLeki.zlozone, '');
assert.strictEqual(merged.bolGlowy.odKiedyIle, '2');
assert.strictEqual(merged.bolGlowy.odKiedyJednostka, 'lata');
assert.strictEqual(merged.kontrolaBolu.dnLista.krwawienie, true);
assert.strictEqual(merged.kontrolaBolu.statusKontroli, 'niewystarczajaca');
assert.strictEqual(merged.migrena.profAuto['72h'], true);
assert.deepStrictEqual(merged.migrena.lekiDorzane, [2]);
assert.strictEqual(merged.migrena.klasyfikacja, 'Migrena przewlekła');
assert.strictEqual(merged.ocenaBolu.wplyw.nastroj, '', 'nieznane klucze zagnieżdżone ignorowane');

// zepsute poddrzewa — nie wywala
const zly2 = State.merge({ ocenaBolu: 'x', kontrolaBolu: null, migrena: { prodrom: 'nie' } });
assert.strictEqual(zly2.ocenaBolu.data, '');
assert.deepStrictEqual(zly2.migrena.prodrom, {});
assert.deepStrictEqual(zly2.kontrolaBolu.dnLista, {});

// zepsuty plik — nie powinien wywalać
const zly = State.merge({ leki: 'nie-tablica', odpowiedzi: null, mars5: { m1: 5 }, chorody: 'x' });
assert.strictEqual(zly.leki.length, 0);
assert.deepStrictEqual(zly.odpowiedzi, {});
assert.strictEqual(zly.mars5.m1, '');
console.log('Roundtrip OK');
