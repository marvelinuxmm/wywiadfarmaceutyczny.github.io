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
s.ocenaBolu = { data: '2026-08-12', skala: 'nrs', nrsAktualne: '6', nrsSrednie: '5', lekiNaBol: [1, 2], lokalizacja: { glowa: true }, interpretacja: 'umiarkowany', epikryza: 'x' };
s.kontrolaBolu = { data: '2026-08-19', ulga: 'mala', dnLista: { krwawienie: true }, statusKontroli: 'niewystarczajaca' };
s.migrena = { dniBoluGlowy: '12', dniMigrenowe: '9', czFlagi: { piorunujacy: true }, mohDni: { tryptany: '10' }, lekiDorzane: [2], klasyfikacja: 'Migrena wysokoczęsta' };
s.statusFarmakoterapii = 'polipragmazja';
s.przyczyny.rownolegle = true;
s.epikryzaFarmakoterapii = 'test';
s.mars5 = { m1: 'nigdy', m2: 'rzadko', m3: 'czasami', m4: 'nigdy', m5: 'rzadko' };
s.pomocAdherence = 'pomoc';

const exportData = JSON.parse(JSON.stringify({ dane: s })); // symulacja pliku
const merged = State.merge(exportData.dane);
assert.strictEqual(merged.dataUrodzenia, '1956-08-13');
assert.strictEqual(merged.wzrost, '175');
assert.strictEqual(merged.leki.length, 1);
assert.deepStrictEqual(merged.leki[0].grupy, ['NLPZ']);
assert.strictEqual(merged.leki[0].tryb, 'przewlekle');
assert.strictEqual(merged.odpowiedzi['pp.objawy'], 'tak');
assert.strictEqual(merged.statusFarmakoterapii, 'polipragmazja');
assert.strictEqual(merged.przyczyny.rownolegle, true);
assert.strictEqual(merged.epikryzaFarmakoterapii, 'test');
assert.strictEqual(merged.mars5.m3, 'czasami');
assert.strictEqual(merged.pomocAdherence, 'pomoc');
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
assert.strictEqual(merged.ocenaBolu.interpretacja, 'umiarkowany');
assert.strictEqual(merged.kontrolaBolu.dnLista.krwawienie, true);
assert.strictEqual(merged.kontrolaBolu.statusKontroli, 'niewystarczajaca');
assert.strictEqual(merged.migrena.czFlagi.piorunujacy, true);
assert.strictEqual(merged.migrena.mohDni.tryptany, '10');
assert.deepStrictEqual(merged.migrena.lekiDorzane, [2]);
assert.strictEqual(merged.migrena.klasyfikacja, 'Migrena wysokoczęsta');
assert.strictEqual(merged.ocenaBolu.wplyw.nastroj, '', 'nieznane klucze zagnieżdżone ignorowane');

// zepsute poddrzewa — nie wywala
const zly2 = State.merge({ ocenaBolu: 'x', kontrolaBolu: null, migrena: { czFlagi: 'nie' } });
assert.strictEqual(zly2.ocenaBolu.data, '');
assert.deepStrictEqual(zly2.migrena.czFlagi, {});
assert.deepStrictEqual(zly2.kontrolaBolu.dnLista, {});

// zepsuty plik — nie powinien wywalać
const zly = State.merge({ leki: 'nie-tablica', odpowiedzi: null, mars5: { m1: 5 }, chorody: 'x' });
assert.strictEqual(zly.leki.length, 0);
assert.deepStrictEqual(zly.odpowiedzi, {});
assert.strictEqual(zly.mars5.m1, '');
console.log('Roundtrip OK');
