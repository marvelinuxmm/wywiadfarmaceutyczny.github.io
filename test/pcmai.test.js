/* Testy logiki PC-MAI: wagi kryteriów, punktacja, pasma, kwalifikacja leków i auto-sugestie.
   Uruchom: node test/pcmai.test.js */
const assert = require('assert');
require('../js/data/leki.js');
require('../js/pcmai-logika.js');
const P = globalThis.Pcmai;

console.log('--- Kryteria i wagi ---');
assert.strictEqual(P.KRYTERIA.length, 10, '10 kryteriów MAI');
assert.strictEqual(P.MAX, 18, 'maksymalny wynik 18');
assert.strictEqual(P.KRYTERIA.find(k => k.id === 'wskazanie').waga, 3);
assert.strictEqual(P.KRYTERIA.find(k => k.id === 'skutecznosc').waga, 3);
assert.strictEqual(P.KRYTERIA.find(k => k.id === 'interakcje_ll').waga, 2);
assert.strictEqual(P.KRYTERIA.find(k => k.id === 'interakcje_ll').wlasciwa, 'nie');
assert.strictEqual(P.KRYTERIA.find(k => k.id === 'duplikacja').wlasciwa, 'nie');
console.log('OK');

console.log('--- Punktacja ---');
const wlasciwe = {};
P.KRYTERIA.forEach(k => { wlasciwe[k.id] = k.wlasciwa; });
assert.strictEqual(P.policz(wlasciwe).suma, 0, 'wszystkie właściwe → 0 pkt');
assert.strictEqual(P.policz(wlasciwe).kompletne, true);
const niewlasciwe = {};
P.KRYTERIA.forEach(k => { niewlasciwe[k.id] = k.wlasciwa === 'tak' ? 'nie' : 'tak'; });
assert.strictEqual(P.policz(niewlasciwe).suma, 18, 'wszystkie niewłaściwe → 18 pkt');
assert.strictEqual(P.policz({}).suma, 0, 'brak odpowiedzi → 0 pkt');
assert.strictEqual(P.policz({}).ocenione, 0, 'brak odpowiedzi → 0 ocenionych');
assert.strictEqual(P.policz({ wskazanie: 'nie' }).suma, 3, 'brak wskazania → 3 pkt');
assert.strictEqual(P.policz({ interakcje_ll: 'tak' }).suma, 2, 'interakcje lek–lek → 2 pkt');
assert.strictEqual(P.policz({ interakcje_lc: 'tak' }).suma, 1, 'interakcje lek–choroba → 1 pkt');
assert.strictEqual(P.policz({ interakcje_ll: 'nie' }).suma, 0, 'brak interakcji → 0 pkt');
console.log('OK');

console.log('--- Pasma interpretacyjne ---');
assert.strictEqual(P.band(0).sev, 'info');
assert.strictEqual(P.band(2).sev, 'info');
assert.strictEqual(P.band(3).sev, 'warn');
assert.strictEqual(P.band(5).sev, 'warn');
assert.strictEqual(P.band(6).sev, 'alert');
assert.strictEqual(P.band(18).sev, 'alert');
console.log('OK');

console.log('--- Kwalifikacja leków do matrycy ---');
const klasy = (lek, paracetamol) => P.klasyfikujLek(lek, { paracetamol: paracetamol || 0 });
assert.ok(klasy({ nazwa: 'Poltram', atc: 'N02AX02', grupy: [] }).indexOf('opioid') !== -1, 'opioid');
assert.ok(klasy({ nazwa: 'Lyrica', atc: 'N03AX16', grupy: [] }).indexOf('gabapentynoid') !== -1, 'gabapentynoid');
assert.ok(klasy({ nazwa: 'Duloksetyna', atc: 'N06AX21', grupy: [] }).indexOf('duloksetyna_amitryptylina') !== -1, 'duloksetyna');
assert.ok(klasy({ nazwa: 'Amitryptylinum', atc: 'N06AA09', grupy: [] }).indexOf('duloksetyna_amitryptylina') !== -1, 'amitryptylina');
assert.ok(klasy({ nazwa: 'Nurofen', atc: 'M01AE01', tryb: 'przewlekle', grupy: [] }).indexOf('nlpz_przewlekle') !== -1, 'NLPZ przewlekłe');
assert.strictEqual(klasy({ nazwa: 'Nurofen', atc: 'M01AE01', tryb: 'dorazne', grupy: [] }).indexOf('nlpz_przewlekle'), -1, 'NLPZ doraźny nie wchodzi');
assert.ok(klasy({ nazwa: 'Apap', atc: 'N02BE01', grupy: [] }, 2).indexOf('paracetamol_wielo') !== -1, 'paracetamol w kilku preparatach');
assert.strictEqual(klasy({ nazwa: 'Apap', atc: 'N02BE01', grupy: [] }, 1).indexOf('paracetamol_wielo'), -1, 'pojedynczy paracetamol nie wchodzi');
assert.ok(klasy({ nazwa: 'Codeine', atc: 'R05DA04', grupy: [] }).indexOf('kodeina') !== -1, 'kodeina');
assert.ok(klasy({ nazwa: 'Stilnox', atc: 'N05CF02', grupy: [] }).indexOf('benzodiazepina_lekz') !== -1, 'lek Z');
assert.ok(klasy({ nazwa: 'Relanium', atc: 'N05BA01', grupy: [] }).indexOf('benzodiazepina_lekz') !== -1, 'benzodiazepina');
assert.deepStrictEqual(klasy({ nazwa: '', atc: 'M01AE01' }), [], 'lek bez nazwy pomijany');
console.log('OK');

console.log('--- Wiersze matrycy ---');
const leki = [
  { id: 1, nazwa: 'Nurofen', atc: 'M01AE01', tryb: 'przewlekle', grupy: ['NLPZ'] },
  { id: 2, nazwa: 'Apap', atc: 'N02BE01', tryb: 'doraźne', grupy: ['paracetamol'] },
  { id: 3, nazwa: 'Witamina C', atc: '', grupy: [] }
];
let w = P.wybierzWiersze(leki, []);
assert.strictEqual(w.length, 1, 'tylko NLPZ przewlekły wchodzi automatycznie');
assert.strictEqual(w[0].id, 1);
assert.strictEqual(w[0].reczny, false);
w = P.wybierzWiersze(leki, [3]);
assert.strictEqual(w.length, 2, 'ręcznie dodany lek dołącza wiersz');
assert.strictEqual(w.find(r => r.id === 3).reczny, true);
console.log('OK');

console.log('--- Auto-sugestie ---');
const stan = {
  leki: [
    { id: 1, nazwa: 'Nurofen', moc: '200 mg', atc: 'M01AE01', tryb: 'przewlekle', schemat: '1-0-0', wskazanie: 'ból', grupy: ['NLPZ'] },
    { id: 2, nazwa: 'Apap', moc: '500 mg', atc: 'N02BE01', tryb: 'doraźne', schemat: '1-0-1', wskazanie: 'ból', grupy: ['paracetamol'] }
  ],
  kontrolaBolu: { ulga: 'mala', statusKontroli: 'niewystarczajaca' },
  ocenaBolu: {},
  choroby: { przewodpokarmowy: true },
  chorobySzczegolowe: {}
};
const sug = P.sugeruj(stan, stan.leki[0]);
assert.strictEqual(sug.wskazanie.wartosc, 'tak', 'wskazanie z listy');
assert.strictEqual(sug.skutecznosc.wartosc, 'nie', 'mała ulga → nieskuteczny');
assert.strictEqual(sug.dawka.wartosc, 'tak', 'moc + schemat');
assert.strictEqual(sug.zalecenia.wartosc, 'tak', 'schemat obecny');
assert.strictEqual(sug.praktycznosc.wartosc, 'tak', 'prosty schemat');
assert.strictEqual(sug.interakcje_lc.wartosc, 'tak', 'NLPZ + choroba przewodu pokarmowego');
assert.strictEqual(sug.duplikacja.wartosc, 'nie', 'brak duplikacji');
assert.strictEqual(sug.czas.wartosc, 'nie', 'niewystarczająca kontrola → czas do weryfikacji');

const stanSed = {
  leki: [
    { id: 1, nazwa: 'Poltram', atc: 'N02AX02', grupy: ['opioid'] },
    { id: 2, nazwa: 'Stilnox', atc: 'N05CF02', grupy: ['z-lek'] }
  ],
  kontrolaBolu: {}, ocenaBolu: {}, choroby: {}, chorobySzczegolowe: {}
};
assert.strictEqual(P.sugeruj(stanSed, stanSed.leki[0]).interakcje_ll.wartosc, 'tak', 'opioid + lek Z → interakcja');
console.log('OK');

console.log('Wszystkie testy PC-MAI przeszły.');
