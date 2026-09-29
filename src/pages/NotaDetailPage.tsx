import React, { useState, useRef } from 'react';
import type { Nota } from '../types/nota';
import { NotaReceipt } from '../components/NotaReceipt';
import { ExportModal } from '../components/ExportModal';
import { ArrowLeft, Download, Edit3, Trash2, CheckCircle2, Clock } from 'lucide-react';
import '../styles/detail.css';

interface NotaDetailPageProps {
  nota: Nota;
  onBack: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
}

export const NotaDetailPage: React.FC<NotaDetailPageProps> = ({
  nota,
  onBack,
  onEdit,
  onDelete,
}) => {
  const [showExportModal, setShowExportModal] = useState(false);
  const receiptOffscreenRef = useRef<HTMLDivElement>(null);
  const isSaved = nota.status === 'saved';

  return (
    <div className="detail-page-container">
      {/* Top Bar */}
      <div className="detail-topbar">
        <div className="detail-title-group">
          <button
            type="button"
            className="icon-btn"
            onClick={onBack}
            title="Kembali ke Beranda"
            aria-label="Kembali ke Beranda"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <div style={{ fontWeight: 800, fontSize: '16px', color: '#741D13' }}>
              {nota.customer.toko || nota.customer.nama || 'Detail Nota'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {nota.notaNumber} • {nota.tanggal}
            </div>
          </div>
        </div>

        <div className="detail-actions-top">
          <span className={`badge ${isSaved ? 'badge-saved' : 'badge-draft'}`}>
            {isSaved ? <CheckCircle2 size={13} /> : <Clock size={13} />}
            {isSaved ? 'Selesai' : 'Draft'}
          </span>
          <button
            type="button"
            className="icon-btn"
            onClick={() => onDelete(nota.id)}
            title="Hapus Nota"
            aria-label="Hapus Nota"
            style={{ color: 'var(--danger)' }}
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Main Viewport for Receipt */}
      <div className="receipt-viewport-container">
        <div className="receipt-scaler">
          <NotaReceipt
            nota={nota}
            fillEmptyRows={true}
          />
        </div>
      </div>

      {/* Off-screen pure 800px element used for pixel-perfect PDF & PNG rendering */}
      <div className="export-offscreen-container" aria-hidden="true">
        <NotaReceipt
          ref={receiptOffscreenRef}
          nota={nota}
          fillEmptyRows={true}
        />
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="detail-sticky-bar">
        <button
          type="button"
          className="btn btn-edit-main"
          style={{
            color: '#741D13',
            backgroundColor: '#fbf2f1',
            borderColor: '#e8c8c5',
          }}
          onClick={onEdit}
          id="btn-edit-nota"
        >
          <Edit3 size={18} />
          <span>Edit Nota</span>
        </button>

        <button
          type="button"
          className="btn btn-download-main"
          style={{
            background: 'linear-gradient(135deg, #741D13 0%, #5a160e 100%)',
            boxShadow: '0 4px 14px rgba(116, 29, 19, 0.35)',
          }}
          onClick={() => setShowExportModal(true)}
          id="btn-download-nota"
        >
          <Download size={18} />
          <span>Download</span>
        </button>
      </div>

      {/* Export / Download Modal */}
      {showExportModal && (
        <ExportModal
          nota={nota}
          receiptElementRef={receiptOffscreenRef}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
};
