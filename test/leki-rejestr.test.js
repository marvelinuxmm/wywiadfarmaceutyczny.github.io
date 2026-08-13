/* Testy rejestru leków (dane z CSV): format danych, wyszukiwanie, dopasowanie
   etykiet, mapowanie ATC → grupy, dopasowanie po nazwie/substancji, schematy dawkowania.
   Uruchom: node test/leki-rejestr.test.js */
const assert = require('assert');
require('../js/data/leki.js');
require('../js/data/leki-rejestr.js');
const Leki = globalThis.Leki;

console.log('--- Rejestr produktów (format danych) ---');
const R = globalThis.REJESTR_LEKOW;
assert.ok(R.length > 5000, 'rejestr ma tysiące wpisów: ' + R.length);
assert.ok(R.every(function (e) {
  return Array.isArray(e) && e.length === 5 && typeof e[0] === 'string' && e[0].length > 0;
}), 'format wpisów [nazwa, moc, postać, ATC, substancja]');
const etykiety = R.map(function (e) { return Leki.etykietaProduktu(e); });
assert.strictEqual(new Set(etykiety).size, etykiety.length, 'unikalne etykiety (nazwa+moc+postać)');
const nazwy = R.map(function (e) { return Leki.normalize(e[0]); });
const sorted = nazwy.slice().sort();
assert.deepStrictEqual(nazwy, sorted, 'rejestr posortowany po nazwie');
console.log('OK (' + R.length + ' wpisów)');

console.log('--- Wyszukiwanie (szukaj) ---');
const nur = Leki.szukaj('nurofen', 10);
assert.ok(nur.length > 0 && nur.length <= 10, 'limit wyników');
assert.ok(nur.every(function (e) { return Leki.normalize(e[0]).indexOf('nurofen') === 0; }), 'prefiks nazwy');
assert.strictEqual(Leki.szukaj('zzznieistniejacy', 5).length, 0, 'brak wyników dla bzdury');
assert.strictEqual(Leki.szukaj('', 5).length, 5, 'pusta fraza → pierwsze pozycje');
const poSubstancji = Leki.szukaj('paracetamolum', 5);
assert.ok(poSubstancji.length > 0, 'szukanie po łacińskiej substancji');
console.log('OK');

console.log('--- Dopasowanie etykiety z listy (dopasujProdukt) ---');
const p = Leki.dopasujProdukt('Nurofen (200 mg, Tabletki powlekane)');
assert.ok(p, 'etykieta z listy rozpoznana');
assert.strictEqual(p[0], 'Nurofen');
assert.strictEqual(p[1], '200 mg');
assert.strictEqual(p[3], 'M01AE01');
assert.strictEqual(Leki.dopasujProdukt('Nurofen'), null, 'sama nazwa (bez mocy/postaći) to nie etykieta');
assert.strictEqual(Leki.dopasujProdukt(''), null);
assert.strictEqual(Leki.dopasujProdukt('   '), null);
console.log('OK');

console.log('--- Grupy z kodu ATC (grupyZAtc) ---');
const testyAtc = [
  ['M01AE01', ['NLPZ']],
  ['M02AA13', ['NLPZ'], 'miejscowe NLPZ'],
  ['N02BE01', ['paracetamol']],
  ['N02BE51', ['paracetamol'], 'paracetamol złożony'],
  ['N02AX02', ['opioid']],
  ['N02AA01', ['opioid']],
  ['N07BC01', ['opioid'], 'buprenorfina'],
  ['N02BF01', ['gabapentynoid']],
  ['N03AX12', ['gabapentynoid']],
  ['N03AX16', ['gabapentynoid']],
  ['N03AE01', ['benzodiazepina']],
  ['N05BA01', ['benzodiazepina']],
  ['N05CF02', ['z-lek']],
  ['N05AH04', ['sedatywny'], 'kwetiapina (Kventiax) — antypsychotyk sedatywny'],
  ['N05AA01', ['sedatywny'], 'chloropromazyna — fenotiazyna sedatywna'],
  ['N05AD01', ['sedatywny'], 'haloperydol — butyrofenon sedatywny'],
  ['N05AX08', [], 'rysperydon — niski potencjał sedatywny, bez grupy'],
  ['N05AX12', [], 'arypiprazol — niski potencjał sedatywny, bez grupy'],
  ['N05AL05', [], 'amisulpryd — niski potencjał sedatywny, bez grupy'],
  ['N05AN01', [], 'lit nie jest sedatywny'],
  ['N05CD02', ['benzodiazepina'], 'benzodiazepina nasenna (nitrazepam)'],
  ['N05CH01', ['sedatywny'], 'melatonina'],
  ['N06AA09', ['sedatywny'], 'amitryptylina (TCA)'],
  ['N06AX11', ['sedatywny'], 'mirtazapina'],
  ['R06AA02', ['sedatywny'], 'difenhydramina'],
  ['R06AD02', ['sedatywny'], 'prometazyna'],
  ['A02BC05', ['IPP']],
  ['B01AC06', ['ASA', 'antyagregant']],
  ['N02BA01', ['ASA', 'NLPZ']],
  ['B01AF02', ['antykoagulant']],
  ['B01AA03', ['antykoagulant']],
  ['B01AB01', ['antykoagulant']],
  ['N06AB06', ['SSRI']],
  ['H02AB07', ['GKS']],
  ['', []],
  [null, []],
  ['L01BC02', [], 'nieznany ATC → brak grup']
];
testyAtc.forEach(function (t) {
  assert.deepStrictEqual(Leki.grupyZAtc(t[0]), t[1], t[2] || ('ATC ' + t[0]));
});
assert.deepStrictEqual(Leki.grupyZAtc('M01AE01+N02BE01'), ['NLPZ', 'paracetamol'], 'unia wielu kodów');
console.log('OK');

console.log('--- Grupy po nazwie (znajdzGrupy: rejestr + aliasy) ---');
const testyNazw = [
  ['Nurofen', ['NLPZ']],
  ['Nurofen Forte', ['NLPZ']],
  ['Poltram Retard 100', ['opioid']],
  ['Apap', ['paracetamol']],
  ['Apap Noc', ['paracetamol'], 'N02BE71 (z difenhydraminą)'],
  ['Polocard', ['ASA', 'antyagregant']],
  ['Stilnox', ['z-lek']],
  ['Nexium Control', ['IPP']],
  ['Setaloft', ['SSRI']],
  ['Encorton', ['GKS']],
  ['Kventiax SR', ['sedatywny'], 'kwetiapina z rejestru (N05AH04)'],
  ['Nitrazepam GSK', ['benzodiazepina'], 'benzodiazepina nasenna z rejestru (N05CD02)'],
  ['ibuprofen', ['NLPZ'], 'polska substancja (alias)'],
  ['tramadol', ['opioid'], 'polska substancja (alias)'],
  ['kwas acetylosalicylowy', ['ASA', 'NLPZ'], 'polska substancja (alias, pierwszy wpis: Aspirin)'],
  ['Acard', ['ASA', 'antyagregant'], 'nazwa handlowa z aliasów'],
  ['Ibuprofenum', ['NLPZ'], 'łacińska substancja z rejestru'],
  ['Paracetamolum', ['paracetamol'], 'łacińska substancja z rejestru'],
  ['Zolpidemi tartras', ['z-lek'], 'łacińska substancja z rejestru (wiele słów)'],
  ['NieistniejącyLek', []],
  ['', []],
  [null, []]
];
testyNazw.forEach(function (t) {
  assert.deepStrictEqual(Leki.znajdzGrupy(t[0]), t[1], t[2] || ('nazwa ' + t[0]));
});
console.log('OK');

console.log('--- Schematy dawkowania (podpowiedzi, zawsze z własną wartością) ---');
const S = globalThis.SCHEMATY_DAWKOWANIA;
assert.ok(Array.isArray(S) && S.length >= 15, 'lista schematów');
assert.strictEqual(new Set(S).size, S.length, 'unikalne schematy');
assert.ok(S.every(function (s) { return typeof s === 'string' && s.length > 0; }));
assert.ok(S.indexOf('1-0-0') !== -1, 'schemat 1-0-0');
assert.ok(S.indexOf('co 8 h') !== -1, 'schemat co 8 h');
console.log('OK');

console.log('Wszystkie testy rejestru leków przeszły.');
