export interface NotaItem {
  id: string;
  menu: string;
  qty: number;
  harga: number;
  jumlah: number;
}

export interface CustomerInfo {
  nama: string;
  toko: string;
  noTelp: string;
}

export type NotaStatus = 'draft' | 'saved';

export interface Nota {
  id: string;
  notaNumber: string; // e.g. "ND-2026001"
  tanggal: string; // e.g. "Senin, 29 September 2026" (fully editable)
  customer: CustomerInfo;
  items: NotaItem[];
  total: number;
  note: string; // Editable note box (e.g. "Bungkus terpisah", "DP 50rb")
  status: NotaStatus;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
