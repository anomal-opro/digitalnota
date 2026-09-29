// Automated Verification Test for Nota Digital Logic & Data Integrity
import {
  calculateRowJumlah,
  calculateNotaTotal,
  parseCurrencyInput,
  parseQtyInput,
  formatRupiah,
  formatNumberOnly,
  generateId,
  generateNextSequentialNotaNumber,
  getFormattedTodayDateIndo,
} from './src/services/calculations.ts';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('--- 1. Testing Calculations & Currency Precision ---');
assert(calculateRowJumlah(3, 10000) === 30000, '3 x 10.000 = 30.000');
assert(calculateRowJumlah(0, 50000) === 0, '0 x 50.000 = 0');
assert(calculateRowJumlah(5, 0) === 0, '5 x 0 = 0');
assert(calculateRowJumlah(7, 12500) === 87500, '7 x 12.500 = 87.500');

assert(parseCurrencyInput('10.000') === 10000, 'Parse "10.000" -> 10000');
assert(parseCurrencyInput('Rp 250.000') === 250000, 'Parse "Rp 250.000" -> 250000');
assert(parseCurrencyInput('1,500,000') === 1500000, 'Parse "1,500,000" -> 1500000');
assert(parseCurrencyInput('') === 0, 'Parse "" -> 0');
assert(parseQtyInput('15') === 15, 'Parse qty "15" -> 15');
assert(parseQtyInput('0') === 0, 'Parse qty "0" -> 0');

const testItems = [
  { id: '1', menu: 'Nasi Rendang', qty: 3, harga: 25000, jumlah: 75000 },
  { id: '2', menu: 'Es Jeruk', qty: 4, harga: 8000, jumlah: 32000 },
  { id: '3', menu: 'Nasi Putih', qty: 5, harga: 5000, jumlah: 25000 },
];
assert(calculateNotaTotal(testItems) === 132000, 'Total 3 items sum: 75.000 + 32.000 + 25.000 = 132.000');
assert(formatRupiah(132000).includes('132.000'), 'Formatted Rupiah contains 132.000');
assert(formatNumberOnly(132000) === '132.000', 'formatNumberOnly(132000) === 132.000');

console.log('--- 2. Testing Sequential ND-2026XXX Numbering ---');
const existing = [
  { notaNumber: 'ND-2026001' },
  { notaNumber: 'ND-2026002' },
];
const nextNumber = generateNextSequentialNotaNumber(existing);
assert(nextNumber === 'ND-2026003', `Next number after ND-2026002 is ${nextNumber}`);

const emptyListNumber = generateNextSequentialNotaNumber([]);
assert(emptyListNumber === 'ND-2026001', `First number for empty list is ${emptyListNumber}`);

console.log('--- 3. Testing Indonesian Date Formatter ---');
const todayDate = getFormattedTodayDateIndo(new Date('2026-09-29T12:00:00'));
assert(todayDate.includes('September 2026'), `Indonesian date includes September 2026 (${todayDate})`);

console.log('--- 4. Testing Precision & Large Numbers ---');
const largeQty = 500;
const largePrice = 1750000;
const largeRow = calculateRowJumlah(largeQty, largePrice);
assert(largeRow === 875000000, '500 x 1.750.000 = 875.000.000 (No floating point drift)');

console.log(`\n========================================`);
console.log(`Summary: Passed: ${passed}, Failed: ${failed}`);
if (failed > 0) process.exit(1);
