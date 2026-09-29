import type { NotaItem, Nota } from '../types/nota';

/**
 * Safely parse a currency input into a clean positive integer.
 * Handles strings like "10.000", "10,000", "10000", empty strings, etc.
 */
export function parseCurrencyInput(value: string | number): number {
  if (typeof value === 'number') {
    if (isNaN(value) || !isFinite(value) || value < 0) return 0;
    return Math.round(value);
  }

  if (!value) return 0;

  // Remove currency prefixes, dots, commas, spaces
  const cleanStr = value
    .toString()
    .replace(/[^0-9]/g, '');

  const num = parseInt(cleanStr, 10);
  return isNaN(num) || num < 0 ? 0 : num;
}

/**
 * Safely parse a quantity input into a clean non-negative integer.
 */
export function parseQtyInput(value: string | number): number {
  if (typeof value === 'number') {
    if (isNaN(value) || !isFinite(value) || value < 0) return 0;
    return Math.round(value);
  }

  if (!value) return 0;
  const cleanStr = value.toString().replace(/[^0-9]/g, '');
  const num = parseInt(cleanStr, 10);
  return isNaN(num) || num < 0 ? 0 : num;
}

/**
 * Calculate row total (Jumlah = Qty * Harga) using integer arithmetic.
 */
export function calculateRowJumlah(qty: number, harga: number): number {
  const safeQty = Math.max(0, Math.round(qty || 0));
  const safeHarga = Math.max(0, Math.round(harga || 0));
  return safeQty * safeHarga;
}

/**
 * Calculate total for entire nota items list.
 */
export function calculateNotaTotal(items: NotaItem[]): number {
  return items.reduce((accum, item) => {
    const rowJumlah = calculateRowJumlah(item.qty, item.harga);
    return accum + rowJumlah;
  }, 0);
}

/**
 * Format a number into standard Indonesian Rupiah (IDR).
 * Example: 30000 -> "Rp 30.000"
 */
export function formatRupiah(amount: number): string {
  const safeAmount = Math.max(0, Math.round(amount || 0));
  return 'Rp ' + safeAmount.toLocaleString('id-ID');
}

/**
 * Format number with thousand separators (without "Rp" prefix).
 * Example: 30000 -> "30.000"
 */
export function formatNumberOnly(amount: number): string {
  const safeAmount = Math.max(0, Math.round(amount || 0));
  return safeAmount.toLocaleString('id-ID');
}

/**
 * Format date into Indonesian full format: e.g. "Senin, 29 September 2026"
 */
export function getFormattedTodayDateIndo(dateObj: Date = new Date()): string {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const dayName = days[dateObj.getDay()];
  const dayDate = dateObj.getDate();
  const monthName = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();

  return `${dayName}, ${dayDate} ${monthName} ${year}`;
}

/**
 * Generate sequential clean Nota number: "ND-2026001", "ND-2026002", etc.
 */
export function generateNextSequentialNotaNumber(existingNotas: Nota[] = []): string {
  const currentYear = new Date().getFullYear();
  const prefix = `ND-${currentYear}`;

  let maxSeq = 0;
  for (const n of existingNotas) {
    if (n.notaNumber && n.notaNumber.startsWith(prefix)) {
      const seqStr = n.notaNumber.substring(prefix.length);
      const parsed = parseInt(seqStr, 10);
      if (!isNaN(parsed) && parsed > maxSeq) {
        maxSeq = parsed;
      }
    }
  }

  const nextSeq = maxSeq + 1;
  const seqPadded = String(nextSeq).padStart(3, '0');
  return `${prefix}${seqPadded}`;
}

/**
 * Generate a unique UUID for items and notas.
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Format date for short Indonesian display (e.g. list view).
 */
export function formatDateIndo(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}
