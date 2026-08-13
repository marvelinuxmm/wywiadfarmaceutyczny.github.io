/* Generator bazy leków z oficjalnego rejestru produktów leczniczych (CSV).
   Uruchom: node tools/generuj-rejestr.js
   Czyta:   Rejestr_Produktow_Leczniczych_calosciowy_stan_na_dzien_20260813.csv (katalog główny)
   Zapisuje: js/data/leki-rejestr.js

   Co robi:
   - parsuje CSV (separator ';', pola w cudzysłowach, znaki nowej linii w polach),
   - bierze tylko preparaty "Ludzki" (pomija weterynaryjne),
   - scala wiersze zduplikowane po opakowaniu: deduplikacja po (nazwa, moc, postać),
     a różne kody ATC / nazwy substancji tego samego produktu łączy,
   - sortuje alfabetycznie po nazwie (bez polskich znaków i wielkości liter),
   - zapisuje kompaktowy plik JS z wpisami [nazwa handlowa, moc, postać, kod ATC, nazwa powszechnie stosowana].
*/
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CSV_PATH = path.join(ROOT, 'Rejestr_Produktow_Leczniczych_calosciowy_stan_na_dzien_20260813.csv');
const OUT_PATH = path.join(ROOT, 'js', 'data', 'leki-rejestr.js');

/* ---------- Parsowanie CSV (RFC-4180-style: ';', '"', "" wewnątrz pola, \n w polach) ---------- */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ';') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (c !== '\r') {
      field += c;
    }
  }
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function strip(v) {
  return String(v == null ? '' : v).replace(/\s+/g, ' ').trim();
}

function norm(s) {
  return strip(s).toLowerCase()
    .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e')
    .replace(/ł/g, 'l').replace(/ń/g, 'n').replace(/ó/g, 'o')
    .replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z')
    .replace(/ß/g, 'ss');
}

/* ---------- Główna część ---------- */
let text = fs.readFileSync(CSV_PATH, 'utf8');
if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);

const rows = parseCsv(text);
if (!rows.length) {
  console.error('Błąd: pusty plik CSV.');
  process.exit(1);
}
const header = rows[0];
const col = {};
header.forEach(function (h, i) { col[h] = i; });
const colN = col['Nazwa Produktu Leczniczego'];
const colM = col['Moc'];
const colP = col['Postać farmaceutyczna'];
const colA = col['Kod ATC'];
const colS = col['Nazwa powszechnie stosowana'];
const colR = col['Rodzaj preparatu'];
if (colN === undefined || colA === undefined || colR === undefined) {
  console.error('Błąd: brak oczekiwanych kolumn w nagłówku CSV.');
  process.exit(1);
}

/* Scalanie: klucz = nazwa|moc|postać */
const map = new Map();
let liczbaWierszy = 0;
for (let r = 1; r < rows.length; r++) {
  const raw = rows[r];
  if (strip(raw[colR]) !== 'Ludzki') continue;
  const n = strip(raw[colN]);
  if (!n) continue;
  const m = strip(raw[colM]);
  const p = strip(raw[colP]);
  const a = strip(raw[colA]).toUpperCase();
  const s = strip(raw[colS]);
  liczbaWierszy++;
  const key = n + '|' + m + '|' + p;
  let e = map.get(key);
  if (!e) {
    e = { n: n, m: m, p: p, atc: new Set(), sub: new Set() };
    map.set(key, e);
  }
  if (a) {
    a.split(/[+,\s]+/).filter(Boolean).forEach(function (kod) { e.atc.add(kod); });
  }
  if (s) e.sub.add(s);
}

const entries = [];
map.forEach(function (e) {
  entries.push([
    e.n,
    e.m,
    e.p,
    Array.from(e.atc).sort().join('+'),
    Array.from(e.sub).sort().join(' + ')
  ]);
});
entries.sort(function (x, y) {
  const a = norm(x[0]);
  const b = norm(y[0]);
  if (a !== b) return a < b ? -1 : 1;
  return norm(x[1]) < norm(y[1]) ? -1 : norm(x[1]) > norm(y[1]) ? 1 : 0;
});

const head =
  '/* Wygenerowano automatycznie — NIE EDYTUJ RĘCZNIE.\n' +
  '   Źródło: Rejestr_Produktow_Leczniczych_calosciowy_stan_na_dzien_20260813.csv\n' +
  '   Regeneracja: node tools/generuj-rejestr.js\n' +
  '   Zawartość: produkty lecznicze ludzkie (bez weterynaryjnych), wiersze po opakowaniu scalone.\n' +
  '   Format wpisu: [nazwa handlowa, moc, postać, kod ATC (kody rozdzielone "+"), nazwa powszechnie stosowana].\n' +
  '   Kolejność: alfabetyczna wg nazwy handlowej (bez polskich znaków). */\n';

const body =
  '(function () {\n' +
  "  const G = typeof window !== 'undefined' ? window : globalThis;\n" +
  '  G.REJESTR_LEKOW = ' + JSON.stringify(entries) + ';\n' +
  '})();\n';

fs.writeFileSync(OUT_PATH, head + body, 'utf8');
const bytes = fs.statSync(OUT_PATH).size;
console.log('Wierszy ludzkich w CSV: ' + liczbaWierszy);
console.log('Wpisów w rejestrze (po scaleniu): ' + entries.length);
console.log('Zapisano: ' + OUT_PATH + ' (' + bytes + ' bajtów)');
