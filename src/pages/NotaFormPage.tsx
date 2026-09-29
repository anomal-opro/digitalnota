import React, { useState } from 'react';
import type { Nota, NotaItem, NotaStatus } from '../types/nota';
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
} from '../services/calculations';
import { ArrowLeft, Plus, Trash2, Store, Save, Clock, AlertCircle, Calendar, FileText } from 'lucide-react';
import '../styles/form.css';

interface NotaFormPageProps {
  initialNota?: Nota | null;
  existingNotas?: Nota[];
  onSave: (nota: Nota, status: NotaStatus) => Promise<void>;
  onCancel: () => void;
}

export const NotaFormPage: React.FC<NotaFormPageProps> = ({
  initialNota,
  existingNotas = [],
  onSave,
  onCancel,
}) => {
  const isEditing = Boolean(initialNota);

  // Date State (Defaults to current day formatted: "Senin, 29 September 2026")
  const [tanggal, setTanggal] = useState(
    initialNota?.tanggal || getFormattedTodayDateIndo(new Date())
  );

  // Customer State
  const [nama, setNama] = useState(initialNota?.customer.nama || '');
  const [toko, setToko] = useState(initialNota?.customer.toko || '');
  const [noTelp, setNoTelp] = useState(initialNota?.customer.noTelp || '');

  // Note State (Catatan nota)
  const [note, setNote] = useState(initialNota?.note || '');

  // Items State
  const [items, setItems] = useState<NotaItem[]>(() => {
    if (initialNota && initialNota.items.length > 0) {
      return initialNota.items.map((it) => ({
        ...it,
        jumlah: calculateRowJumlah(it.qty, it.harga),
      }));
    }
    return [
      {
        id: generateId('item'),
        menu: '',
        qty: 1,
        harga: 0,
        jumlah: 0,
      },
    ];
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate live total
  const liveTotal = calculateNotaTotal(items);

  // Handle Item Changes
  const handleItemChange = (index: number, field: keyof NotaItem, value: any) => {
    setItems((prevItems) => {
      const next = [...prevItems];
      const item = { ...next[index] };

      if (field === 'menu') {
        item.menu = value;
      } else if (field === 'qty') {
        item.qty = parseQtyInput(value);
        item.jumlah = calculateRowJumlah(item.qty, item.harga);
      } else if (field === 'harga') {
        item.harga = parseCurrencyInput(value);
        item.jumlah = calculateRowJumlah(item.qty, item.harga);
      }

      next[index] = item;
      return next;
    });

    if (validationError) setValidationError(null);
  };

  // Add Item
  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: generateId('item'),
        menu: '',
        qty: 1,
        harga: 0,
        jumlah: 0,
      },
    ]);
  };

  // Remove Item
  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      setItems([
        {
          id: generateId('item'),
          menu: '',
          qty: 1,
          harga: 0,
          jumlah: 0,
        },
      ]);
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Save or Draft Handler
  const handleSubmit = async (targetStatus: NotaStatus) => {
    const validItems = items.filter((it) => it.menu.trim() !== '' || it.harga > 0);

    if (validItems.length === 0) {
      setValidationError('Silakan isi setidaknya satu menu pada tabel makanan/minuman');
      return;
    }

    setIsSubmitting(true);
    try {
      const nowIso = new Date().toISOString();
      const finalTotal = calculateNotaTotal(validItems);

      const assignedNumber =
        initialNota?.notaNumber || generateNextSequentialNotaNumber(existingNotas);

      const notaToSave: Nota = {
        id: initialNota?.id || generateId('nota'),
        notaNumber: assignedNumber,
        tanggal: tanggal.trim() || getFormattedTodayDateIndo(new Date()),
        status: targetStatus,
        customer: {
          nama: nama.trim(),
          toko: toko.trim(),
          noTelp: noTelp.trim(),
        },
        items: validItems,
        total: finalTotal,
        note: note.trim(),
        createdAt: initialNota?.createdAt || nowIso,
        updatedAt: nowIso,
      };

      await onSave(notaToSave, targetStatus);
    } catch (err: any) {
      setValidationError(err.message || 'Gagal menyimpan data');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-page-container">
      {/* Top Bar */}
      <div className="app-topbar">
        <div className="topbar-left">
          <button
            type="button"
            className="icon-btn"
            onClick={onCancel}
            title="Kembali"
            aria-label="Kembali"
          >
            <ArrowLeft size={22} />
          </button>
          <span className="topbar-title">
            {isEditing ? `Edit ${initialNota?.notaNumber}` : 'Buat Nota Baru'}
          </span>
        </div>
      </div>

      <div className="form-scrollable-content">
        {/* Validation Warning */}
        {validationError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            <AlertCircle size={20} />
            <span>{validationError}</span>
          </div>
        )}

        {/* Section 1: Customer & Date Info */}
        <div className="form-section-card">
          <div className="section-title-bar">
            <span className="section-title">
              <Store size={18} color="#741D13" />
              Informasi Pemesan & Nota
            </span>
          </div>

          {/* 1. Tanggal */}
          <div className="input-group">
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} color="#741D13" />
              <span>Tanggal Nota</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Senin, 10 September 2026"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
            />
          </div>

          {/* 2. Pemesan */}
          <div className="input-group">
            <label className="input-label">Pemesan (Nama)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Nama pemesan"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
            />
          </div>

          {/* 3. Toko */}
          <div className="input-group">
            <label className="input-label">Toko</label>
            <input
              type="text"
              className="form-input"
              placeholder="Nama toko pemesan"
              value={toko}
              onChange={(e) => setToko(e.target.value)}
            />
          </div>

          {/* 4. No. Telp */}
          <div className="input-group">
            <label className="input-label">No. Telp</label>
            <input
              type="tel"
              className="form-input"
              placeholder="Contoh: 0812-3456-7890"
              value={noTelp}
              onChange={(e) => setNoTelp(e.target.value)}
            />
          </div>
        </div>

        {/* Section 2: Items Table */}
        <div className="form-section-card">
          <div className="section-title-bar">
            <span className="section-title">Daftar Makanan / Minuman</span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {items.length} Baris
            </span>
          </div>

          <div className="items-list-container">
            {items.map((item, index) => (
              <div key={item.id} className="item-editor-card">
                {/* Top Row: Index + Menu Input + Trash Button */}
                <div className="item-card-top">
                  <span
                    className="item-index-badge"
                    style={{ backgroundColor: '#741D13', color: '#ffffff' }}
                  >
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    className="item-menu-input"
                    placeholder="Nama Makanan / Minuman..."
                    value={item.menu}
                    onChange={(e) => handleItemChange(index, 'menu', e.target.value)}
                  />
                  <button
                    type="button"
                    className="item-delete-btn"
                    onClick={() => handleRemoveItem(index)}
                    title="Hapus baris ini"
                    aria-label="Hapus baris ini"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Bottom Row: Qty, Harga, Jumlah */}
                <div className="item-card-numbers">
                  <div className="sub-input-col">
                    <label className="sub-label">Qty</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      className="number-input text-right"
                      value={item.qty === 0 ? '' : item.qty}
                      onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                      placeholder="1"
                    />
                  </div>

                  <div className="sub-input-col">
                    <label className="sub-label">Harga (Rp)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="number-input text-right"
                      value={item.harga === 0 ? '' : formatNumberOnly(item.harga)}
                      onChange={(e) => handleItemChange(index, 'harga', e.target.value)}
                      placeholder="0"
                    />
                  </div>

                  <div className="sub-input-col">
                    <label className="sub-label">Jumlah (Rp)</label>
                    <div
                      className="jumlah-display-box"
                      style={{ color: '#741D13', fontWeight: 800 }}
                    >
                      {formatNumberOnly(item.jumlah)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Item Button */}
          <button
            type="button"
            className="add-item-btn"
            onClick={handleAddItem}
            id="btn-add-item"
            style={{
              borderColor: '#741D13',
              color: '#741D13',
              backgroundColor: '#fbf2f1',
            }}
          >
            <Plus size={18} />
            <span>Tambah Makanan / Minuman</span>
          </button>
        </div>

        {/* Section 3: NOTE Field */}
        <div className="form-section-card">
          <div className="section-title-bar">
            <span className="section-title">
              <FileText size={18} color="#741D13" />
              Catatan Nota (NOTE)
            </span>
          </div>

          <div className="input-group">
            <textarea
              className="form-input"
              rows={2}
              placeholder="Contoh: Bungkus terpisah, kuah gulai dibanyakin..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>
      </div>

      {/* Sticky Bottom Summary and Action Buttons */}
      <div className="form-sticky-bottom">
        <div className="sticky-total-row">
          <span className="sticky-total-label">Total Keseluruhan</span>
          <span className="sticky-total-value" style={{ color: '#741D13' }}>
            {formatRupiah(liveTotal)}
          </span>
        </div>

        <div className="form-action-buttons">
          <button
            type="button"
            className="btn btn-draft"
            onClick={() => handleSubmit('draft')}
            disabled={isSubmitting}
            id="btn-save-draft"
          >
            <Clock size={18} />
            <span>Draft</span>
          </button>

          <button
            type="button"
            className="btn btn-save"
            style={{ backgroundColor: '#741D13' }}
            onClick={() => handleSubmit('saved')}
            disabled={isSubmitting}
            id="btn-save-data"
          >
            <Save size={18} />
            <span>Simpan Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
