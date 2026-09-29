import type { Nota } from '../types/nota';

export const INITIAL_SEED_NOTAS: Nota[] = [
  {
    id: 'nota-seed-1',
    notaNumber: 'ND-2026001',
    tanggal: 'Senin, 29 September 2026',
    status: 'saved',
    customer: {
      nama: 'Bpk. Hendra Saputra',
      toko: 'Toko Berkah Minang',
      noTelp: '0812-9876-5432',
    },
    items: [
      {
        id: 'item-101',
        menu: 'Nasi Rendang Sapi Komplit',
        qty: 15,
        harga: 28000,
        jumlah: 420000,
      },
      {
        id: 'item-102',
        menu: 'Nasi Ayam Pop Minang',
        qty: 10,
        harga: 25000,
        jumlah: 250000,
      },
      {
        id: 'item-103',
        menu: 'Dendeng Batokok Balado',
        qty: 5,
        harga: 30000,
        jumlah: 150000,
      },
      {
        id: 'item-104',
        menu: 'Es Teh Manis',
        qty: 30,
        harga: 5000,
        jumlah: 150000,
      },
    ],
    total: 970000,
    note: 'Bungkus kuah & sambal dipisah ya kak.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'nota-seed-2',
    notaNumber: 'ND-2026002',
    tanggal: 'Senin, 29 September 2026',
    status: 'draft',
    customer: {
      nama: 'Ibu Ratna',
      toko: 'Catering Sejahtera',
      noTelp: '0857-1122-3344',
    },
    items: [
      {
        id: 'item-201',
        menu: 'Gulai Tunjang Kikil',
        qty: 8,
        harga: 32000,
        jumlah: 256000,
      },
      {
        id: 'item-202',
        menu: 'Ayam Bakar Padang',
        qty: 12,
        harga: 24000,
        jumlah: 288000,
      },
    ],
    total: 544000,
    note: 'Pesanan untuk makan siang kantor jam 12:00.',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];
