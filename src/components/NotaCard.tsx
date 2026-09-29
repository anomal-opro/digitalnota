import React from 'react';
import type { Nota } from '../types/nota';
import { formatRupiah, formatDateIndo } from '../services/calculations';
import { CheckCircle2, Clock, Store, User, Phone, ChevronRight, Edit3, Trash2 } from 'lucide-react';

interface NotaCardProps {
  nota: Nota;
  onClick: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export const NotaCard: React.FC<NotaCardProps> = ({ nota, onClick, onEdit, onDelete }) => {
  const isSaved = nota.status === 'saved';
  const itemCount = nota.items?.length || 0;

  return (
    <div className="nota-card animate-fade-in" onClick={onClick} role="button" tabIndex={0}>
      <div className="card-top-header">
        <div className="card-id-date">
          <span className="nota-number">{nota.notaNumber}</span>
          <span className="nota-date">{formatDateIndo(nota.updatedAt || nota.createdAt)}</span>
        </div>
        <span className={`badge ${isSaved ? 'badge-saved' : 'badge-draft'}`}>
          {isSaved ? (
            <>
              <CheckCircle2 size={13} />
              Selesai
            </>
          ) : (
            <>
              <Clock size={13} />
              Draft
            </>
          )}
        </span>
      </div>

      <div className="card-body">
        <div className="customer-info-grid">
          <div className="info-line">
            <Store size={15} className="info-icon" />
            <span className="info-text font-bold">
              {nota.customer.toko || '(Tanpa Nama Toko)'}
            </span>
          </div>

          <div className="info-sub-row">
            <div className="info-line">
              <User size={14} className="info-icon" />
              <span className="info-text">{nota.customer.nama || '-'}</span>
            </div>
            {nota.customer.noTelp && (
              <div className="info-line">
                <Phone size={14} className="info-icon" />
                <span className="info-text">{nota.customer.noTelp}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card-footer">
        <div className="total-block">
          <span className="total-caption">{itemCount} Menu • Total</span>
          <span className="total-amount">{formatRupiah(nota.total)}</span>
        </div>

        <div className="card-actions" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="card-action-btn edit-btn"
            onClick={onEdit}
            title="Edit Nota"
            aria-label="Edit Nota"
          >
            <Edit3 size={16} />
            <span>Edit</span>
          </button>
          <button
            type="button"
            className="card-action-btn delete-btn"
            onClick={onDelete}
            title="Hapus Nota"
            aria-label="Hapus Nota"
          >
            <Trash2 size={16} />
          </button>
          <div className="card-chevron" onClick={onClick}>
            <ChevronRight size={18} />
          </div>
        </div>
      </div>
    </div>
  );
};
