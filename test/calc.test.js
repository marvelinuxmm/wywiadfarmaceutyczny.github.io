/* Samotest: wartości referencyjne kalkulatorów + scenariusze flag. Uruchom: node test/calc.test.js */
const assert = require('assert');
require('../js/calculations.js');
require('../js/flags.js');
const Calc = globalThis.Calc;
const Flags = globalThis.Flags;

function near(a, b, tol) {
  assert.ok(Math.abs(a - b) < tol, 'oczekiwano ~' + b + ', otrzymano ' + a);
}

console.log('--- CKD-EPI 2021 ---');
near(Calc.ckdEpi(1.0, 50, 'm'), 91.7, 0.5);   // referencja MDCalc
near(Calc.ckdEpi(0.7, 30, 'k'), 119.2, 0.5);
near(Calc.ckdEpi(1.2, 70, 'k'), 48.7, 0.5);
console.log('OK');

console.log('--- Cockcroft-Gault ---');
near(Calc.cockcroftGault(1.2, 70, 80, 'm'), 64.8, 0.2);
near(Calc.cockcroftGault(1.2, 70, 80, 'k'), 55.1, 0.2);
near(Calc.cockcroftGault(1.0, 30, 70, 'm'), 106.9, 0.2);
console.log('OK');

console.log('--- Konwersje ---');
near(Calc.toMgdl(88.4, 'umol'), 1.0, 0.001);
near(Calc.toMgdl(132.6, 'umol'), 1.5, 0.001);
near(Calc.toMgdl('1,5', 'mgdl'), 1.5, 0.001);
assert.strictEqual(Calc.toMgdl('', 'mgdl'), null);
console.log('OK');

console.log('--- BMI i BSA ---');
near(Calc.bmi(70, 175), 22.857, 0.01);
near(Calc.bsaMosteller(70, 175), 1.8447, 0.001);
assert.strictEqual(Calc.bmiBand(17).sev, 'warn');
assert.strictEqual(Calc.bmiBand(22).sev, 'normal');
assert.strictEqual(Calc.bmiBand(27).sev, 'info');
assert.strictEqual(Calc.bmiBand(32).sev, 'warn');
console.log('OK');

console.log('--- IBW i masa do CrCL ---');
near(Calc.idealBodyWeight('m', 175), 70.5, 0.1);
near(Calc.idealBodyWeight('k', 165), 56.9, 0.1);
assert.strictEqual(Calc.crclWeight('m', 60, 175).mode, 'rzeczywista');
near(Calc.crclWeight('m', 80, 175).weight, 70.5, 0.1);
assert.strictEqual(Calc.crclWeight('m', 80, 175).mode, 'idealna');
near(Calc.crclWeight('m', 100, 175).weight, 82.3, 0.1);
assert.strictEqual(Calc.crclWeight('m', 100, 175).mode, 'korygowana');
assert.strictEqual(Calc.crclWeight('m', 80, null).mode, 'rzeczywista');
console.log('OK');

console.log('--- Progi klasyfikacji ---');
assert.strictEqual(Calc.egfrBand(92).sev, 'info');
assert.strictEqual(Calc.egfrBand(50).sev, 'warn');
assert.strictEqual(Calc.egfrBand(20).sev, 'alert');
assert.strictEqual(Calc.egfrBand(10).sev, 'alert');
assert.strictEqual(Calc.crclBand(70).sev, 'info');
assert.strictEqual(Calc.crclBand(45).sev, 'warn');
assert.strictEqual(Calc.crclBand(20).sev, 'alert');
console.log('OK');

console.log('--- Flagi: scenariusze ---');
function state(over) {
  const base = {
    wiek: '', plec: '', masa: '', wzrost: '', ciaza: '', kreatynina: '', jednostkaKreatyniny: 'mgdl',
    dataKreatyniny: '', albuminuria: 'brak', uacr: '', uacrJednostka: 'mgg',
    psychAktywny: '', psychOpis: '', epikryza: '',
    choroby: { sercowo: false, oddechowe: false, przewodpokarmowy: false, watroba: false,
      pchn: false, psychiczne: false, brak: false, niewiem: false }
  };
  if (!over) return base;
  const merged = Object.assign({}, base, over);
  if (over.choroby) merged.choroby = Object.assign({}, base.choroby, over.choroby);
  return merged;
}

const titles = (s) => Flags.compute(s).map(f => f.title);
const has = (s, ttl) => titles(s).indexOf(ttl) !== -1;

assert.ok(titles(state({ wiek: '16', plec: 'm' })).some(t => t.indexOf('poniżej 18') !== -1), 'wiek <18 → alert');
assert.ok(titles(state({ wiek: '65', plec: 'm' })).some(t => t.indexOf('65 lat') !== -1), 'wiek ≥65 → flaga');
assert.ok(titles(state({ masa: '50', wzrost: '180' })).some(t => t.indexOf('BMI') !== -1), 'niedowaga → flaga BMI');
assert.ok(titles(state({ masa: '100', wzrost: '175' })).some(t => t.indexOf('BMI') !== -1), 'otyłość → flaga BMI');
assert.ok(titles(state({ plec: 'k', ciaza: 'tak' })).some(t => t.indexOf('Ciąża') !== -1), 'ciąża tak → alert');
assert.ok(titles(state({ plec: 'k', ciaza: 'nw' })).some(t => t.indexOf('Ciąża') !== -1), 'ciąża nie wiem → alert');
assert.ok(titles(state({ plec: 'k' })).some(t => t.indexOf('brak odpowiedzi') !== -1), 'kobieta bez odpowiedzi → ostrzeżenie');
assert.ok(has(state({ wiek: '60', plec: 'm', choroby: { sercowo: true } }), 'Choroby sercowo-naczyniowe'), 'sercowo-naczyniowe → flaga');
assert.ok(has(state({ wiek: '60', plec: 'm', choroby: { oddechowe: true } }), 'Choroba układu oddechowego'), 'oddechowe → flaga');
assert.ok(has(state({ wiek: '60', plec: 'm', choroby: { przewodpokarmowy: true } }), 'Choroba przewodu pokarmowego'), 'przewód pokarmowy → flaga');
assert.ok(has(state({ wiek: '60', plec: 'm', choroby: { watroba: true } }), 'Choroba wątroby'), 'wątroba → flaga');
assert.ok(has(state({ wiek: '60', plec: 'm', choroby: { pchn: true } }), 'Brak wyniku kreatyniny'), 'PChN bez kreatyniny → ostrzeżenie');
assert.ok(has(state({ wiek: '60', plec: 'm', choroby: { psychiczne: true } }), 'Zaburzenia zdrowia psychicznego / uzależnienia'), 'psychiczne → flaga');
assert.ok(has(state({ wiek: '60', plec: 'm', dataKreatyniny: '2000-01-01' }), 'Nieaktualny wynik kreatyniny'), 'stara kreatynina → flaga');

const pelny = state({ wiek: '70', plec: 'k', masa: '60', kreatynina: '1.2', dataKreatyniny: '2026-01-01', choroby: { pchn: true } });
assert.ok(titles(pelny).some(t => t.indexOf('eGFR CKD-EPI') !== -1), 'eGFR wyliczony w flagach');
assert.ok(titles(pelny).some(t => t.indexOf('CrCL') !== -1), 'CrCL wyliczony w flagach');

console.log('Wszystkie testy przeszły pomyślnie.');
