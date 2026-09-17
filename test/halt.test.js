/* Testy logiki HALT-90 (suma dni + stopień). Uruchom: node test/halt.test.js */
const assert = require('assert');
require('../js/halt.js');
const Halt = globalThis.Halt;

console.log('--- HALT-90: suma ---');
assert.strictEqual(Halt.total({}), null, 'puste → null');
assert.strictEqual(Halt.total({ q1: '', q2: '', q3: '', q4: '', q5: '' }), null, 'same puste → null');
assert.strictEqual(Halt.total({ q1: '3' }), 3, 'q1=3 → 3');
assert.strictEqual(Halt.total({ q1: '2', q2: '3', q3: '1', q4: '0', q5: '4' }), 10, 'suma 2+3+1+0+4');
assert.strictEqual(Halt.total({ q1: '5,5' }), 5.5, 'przecinek dziesiętny');
assert.strictEqual(Halt.total({ q1: 'abc' }), null, 'nie-liczba → null (brak wartości)');
assert.strictEqual(Halt.total(null), null, 'null → null');
console.log('OK');

console.log('--- HALT-90: stopnie ---');
assert.strictEqual(Halt.grade(0).stopien, 'I');
assert.strictEqual(Halt.grade(5).stopien, 'I');
assert.strictEqual(Halt.grade(6).stopien, 'II');
assert.strictEqual(Halt.grade(10).stopien, 'II');
assert.strictEqual(Halt.grade(11).stopien, 'III');
assert.strictEqual(Halt.grade(20).stopien, 'III');
assert.strictEqual(Halt.grade(21).stopien, 'IV');
assert.strictEqual(Halt.grade(90).stopien, 'IV');
assert.strictEqual(Halt.grade(null), null, 'null → null');
assert.strictEqual(Halt.grade(undefined), null, 'undefined → null');
assert.strictEqual(Halt.PYTANIA.length, 5, '5 pytań');
console.log('OK');

console.log('Wszystkie testy HALT przeszły.');
