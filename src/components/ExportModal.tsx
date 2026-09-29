import React, { useState } from 'react';
import type { Nota } from '../types/nota';
import { generatePdfBlob } from '../services/pdfGenerator';
import { generatePngBlob } from '../services/pngGenerator';
import {
  saveExportedFile,
  generateExportFileName,
} from '../services/fileStorage';
import {
  X,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

interface ExportModalProps {
  nota: Nota;
  receiptElementRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
}

type ExportState = 'idle' | 'processing' | 'success' | 'error';

export const ExportModal: React.FC<ExportModalProps> = ({
  nota,
  receiptElementRef,
  onClose,
}) => {
  const [exportState, setExportState] = useState<ExportState>('idle');
  const [activeType, setActiveType] = useState<'pdf' | 'png' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleExport = async (type: 'pdf' | 'png') => {
    if (!receiptElementRef.current) {
      setErrorMsg('Komponen nota belum siap, coba lagi.');
      setExportState('error');
      return;
    }

    setActiveType(type);
    setExportState('processing');
    setErrorMsg(null);

    try {
      const fileName = generateExportFileName(
        nota.customer.nama,
        nota.customer.toko,
        nota.notaNumber,
        type
      );

      const subFolder = type === 'pdf' ? 'Nota_PDF' : 'Nota_PNG';

      let blob: Blob;
      if (type === 'pdf') {
        blob = await generatePdfBlob(receiptElementRef.current);
      } else {
        blob = await generatePngBlob(receiptElementRef.current);
      }

      const saveResult = await saveExportedFile(blob, fileName, subFolder);

      if (saveResult.success) {
        setExportState('success');
      } else {
        setErrorMsg(saveResult.error || 'Gagal menyimpan file.');
        setExportState('error');
      }
    } catch (err: any) {
      console.error('Export error:', err);
      setErrorMsg(err.message || 'Terjadi kesalahan saat memproses file.');
      setExportState('error');
    }
  };

  const handleOk = () => {
    onClose();
  };

  const handleRetry = () => {
    setExportState('idle');
    setActiveType(null);
    setErrorMsg(null);
  };

  return (
    <div className="modal-overlay" onClick={exportState === 'idle' ? onClose : undefined}>
      <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>

        {/* ── IDLE: Choose format ── */}
        {exportState === 'idle' && (
          <>
            <div className="modal-header">
              <div className="modal-title">
                <span>Download Nota</span>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={onClose}
                title="Tutup"
                aria-label="Tutup"
              >
                <X size={20} />
              </button>
            </div>

            <div className="export-options-grid">
              {/* PDF */}
              <button
                type="button"
                className="export-option-btn"
                onClick={() => handleExport('pdf')}
                id="btn-export-pdf"
              >
                <div className="export-btn-icon pdf-icon-bg">
                  <FileText size={24} />
                </div>
                <span className="export-btn-title">PDF</span>
                <span className="export-btn-desc">Format Dokumen</span>
              </button>

              {/* PNG */}
              <button
                type="button"
                className="export-option-btn"
                onClick={() => handleExport('png')}
                id="btn-export-png"
              >
                <div className="export-btn-icon png-icon-bg">
                  <ImageIcon size={24} />
                </div>
                <span className="export-btn-title">PNG</span>
                <span className="export-btn-desc">Format Gambar</span>
              </button>
            </div>
          </>
        )}

        {/* ── PROCESSING: Loading ── */}
        {exportState === 'processing' && (
          <div className="export-status-box">
            <Loader2 size={44} className="animate-spin" color="#741D13" />
            <span className="export-status-title">Memproses...</span>
            <span className="export-status-sub">
              Sedang membuat file {activeType?.toUpperCase()}, mohon tunggu sebentar.
            </span>
          </div>
        )}

        {/* ── SUCCESS: Download Sukses ── */}
        {exportState === 'success' && (
          <div className="export-status-box">
            <div className="export-success-icon">
              <CheckCircle size={48} color="#741D13" />
            </div>
            <span className="export-status-title" style={{ color: '#741D13' }}>
              Download Sukses!
            </span>
            <span className="export-status-sub">
              File {activeType?.toUpperCase()} berhasil disimpan ke folder Download.
            </span>
            <button
              type="button"
              className="btn btn-primary export-ok-btn"
              onClick={handleOk}
              id="btn-export-ok"
              style={{
                background: 'linear-gradient(135deg, #741D13 0%, #5a160e 100%)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '16px',
                padding: '14px 0',
                borderRadius: '14px',
                width: '100%',
                marginTop: '4px',
              }}
            >
              OK
            </button>
          </div>
        )}

        {/* ── ERROR ── */}
        {exportState === 'error' && (
          <div className="export-status-box">
            <AlertTriangle size={44} color="#dc2626" />
            <span className="export-status-title" style={{ color: '#dc2626' }}>
              Gagal Download
            </span>
            <span className="export-status-sub">{errorMsg}</span>
            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <button
                type="button"
                className="btn"
                onClick={handleRetry}
                style={{ flex: 1, border: '1.5px solid var(--border-light)', background: 'var(--bg-subtle)' }}
              >
                Coba Lagi
              </button>
              <button
                type="button"
                className="btn"
                onClick={onClose}
                style={{ flex: 1, background: 'var(--primary)', color: '#fff' }}
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
