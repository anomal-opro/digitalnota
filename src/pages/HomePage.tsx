import React, { useState, useMemo } from 'react';
import type { Nota, NotaStatus } from '../types/nota';
import { NotaCard } from '../components/NotaCard';
import { PlusCircle, Search, X, Receipt } from 'lucide-react';
import '../styles/home.css';

interface HomePageProps {
  notas: Nota[];
  onCreateNota: () => void;
  onOpenNota: (nota: Nota) => void;
  onEditNota: (nota: Nota) => void;
  onDeleteNota: (id: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  notas,
  onCreateNota,
  onOpenNota,
  onEditNota,
  onDeleteNota,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | NotaStatus>('all');

  // Filter & Search Logic
  const filteredNotas = useMemo(() => {
    return notas.filter((n) => {
      // 1. Status Filter
      if (statusFilter !== 'all' && n.status !== statusFilter) {
        return false;
      }

      // 2. Search Query
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const matchCustomer = n.customer.nama.toLowerCase().includes(q);
      const matchToko = n.customer.toko.toLowerCase().includes(q);
      const matchPhone = n.customer.noTelp.toLowerCase().includes(q);
      const matchNumber = n.notaNumber.toLowerCase().includes(q);
      const matchItems = n.items.some((item) => item.menu.toLowerCase().includes(q));

      return matchCustomer || matchToko || matchPhone || matchNumber || matchItems;
    });
  }, [notas, searchQuery, statusFilter]);

  const countAll = notas.length;
  const countSaved = notas.filter((n) => n.status === 'saved').length;
  const countDraft = notas.filter((n) => n.status === 'draft').length;

  return (
    <div className="home-container">
      {/* 3.1 Judul (Exact Requirement: "Haloo, Buat Nota Lagi Ya?") */}
      <div className="home-header-section">
        <h1 className="home-exact-title">Haloo, Buat Nota Lagi Ya?</h1>

        {/* 3.2 Button Membuat Nota Baru */}
        <button
          type="button"
          className="create-nota-btn"
          onClick={onCreateNota}
          id="btn-create-nota"
        >
          <PlusCircle size={22} />
          <span>Buat Nota Baru</span>
        </button>
      </div>

      {/* 3.3 Daftar Seluruh Nota (Scalable with Search & Filter) */}
      <div className="list-controls">
        {/* Search bar */}
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Cari toko, nama, atau menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
              title="Hapus pencarian"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button
            type="button"
            className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            <span>Semua</span>
            <span className="tab-badge">{countAll}</span>
          </button>
          <button
            type="button"
            className={`filter-tab ${statusFilter === 'saved' ? 'active' : ''}`}
            onClick={() => setStatusFilter('saved')}
          >
            <span>Selesai</span>
            <span className="tab-badge">{countSaved}</span>
          </button>
          <button
            type="button"
            className={`filter-tab ${statusFilter === 'draft' ? 'active' : ''}`}
            onClick={() => setStatusFilter('draft')}
          >
            <span>Draft</span>
            <span className="tab-badge">{countDraft}</span>
          </button>
        </div>
      </div>

      {/* Nota List */}
      <div className="nota-list">
        {filteredNotas.length > 0 ? (
          filteredNotas.map((nota) => (
            <NotaCard
              key={nota.id}
              nota={nota}
              onClick={() => onOpenNota(nota)}
              onEdit={(e) => {
                e.stopPropagation();
                onEditNota(nota);
              }}
              onDelete={(e) => {
                e.stopPropagation();
                onDeleteNota(nota.id);
              }}
            />
          ))
        ) : (
          <div className="empty-state">
            <Receipt size={48} className="empty-icon" />
            <div className="empty-title">
              {searchQuery || statusFilter !== 'all'
                ? 'Tidak ada nota yang cocok'
                : 'Belum ada nota'}
            </div>
            <div className="empty-subtitle">
              {searchQuery || statusFilter !== 'all'
                ? 'Coba gunakan kata kunci pencarian lain atau pilih tab Semua.'
                : 'Tekan tombol "Buat Nota Baru" di atas untuk membuat nota digital pertama Anda.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
