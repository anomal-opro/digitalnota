import React, { useState } from 'react';
import type { Nota } from '../types/nota';
import { generatePdfBlob } from '../services/pdfGenerator';
import { generatePngBlob } from '../services/pngGenerator';
import {
  saveExportedFile,
  generateExportFileName,
  shareExportedFile,
  type SaveFileResult,
} from '../services/fileStorage';
import {
  X,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  Share2,
  Folder,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

interface ExportModalProps {
  nota: Nota;
  receiptElementRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  nota,
  receiptElementRef,
  onClose,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processType, setProcessType] = useState<'pdf' | 'png' | null>(null);
  const [lastResult, setLastResult] = useState<SaveFileResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleExport = async (type: 'pdf' | 'png') => {
    if (!receiptElementRef.current) {
      setErrorMsg('Komponen nota belum siap untuk diexport.');
      return;
    }

    setIsProcessing(true);
    setProcessType(type);
    setErrorMsg(null);
    setLastResult(null);

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
      setLastResult(saveResult);

      if (!saveResult.success && saveResult.error) {
        setErrorMsg(saveResult.error);
      }
    } catch (err: any) {
      console.error('Export error:', err);
      setErrorMsg(err.message || 'Terjadi kesalahan saat memproses file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    if (!lastResult?.blob) return;
    await shareExportedFile(
      lastResult.blob,
      lastResult.filePath,
      `${nota.customer.toko || 'Nota'} - ${nota.notaNumber}`
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Folder size={20} color="var(--primary)" />
            <span>Download Nota Digital</span>
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

        {/* Export Buttons */}
        <div className="export-options-grid">
          {/* Option 1: PDF */}
          <button
            type="button"
            className="export-option-btn"
            onClick={() => handleExport('pdf')}
            disabled={isProcessing}
            id="btn-export-pdf"
          >
            <div className="export-btn-icon pdf-icon-bg">
              {isProcessing && processType === 'pdf' ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <FileText size={24} />
              )}
            </div>
            <span className="export-btn-title">Download PDF</span>
            <span className="export-btn-desc">
              Folder: <b>Nota_PDF</b>
            </span>
          </button>

          {/* Option 2: PNG */}
          <button
            type="button"
            className="export-option-btn"
            onClick={() => handleExport('png')}
            disabled={isProcessing}
            id="btn-export-png"
          >
            <div className="export-btn-icon png-icon-bg">
              {isProcessing && processType === 'png' ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <ImageIcon size={24} />
              )}
            </div>
            <span className="export-btn-title">Download PNG</span>
            <span className="export-btn-desc">
              Folder: <b>Nota_PNG</b>
            </span>
          </button>
        </div>

        {/* Success Confirmation Alert */}
        {lastResult && lastResult.success && (
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065f46', fontWeight: 700, fontSize: '14px' }}>
              <CheckCircle size={18} />
              <span>Berhasil Disimpan!</span>
            </div>
            <div style={{ fontSize: '12px', color: '#047857', wordBreak: 'break-all' }}>
              File: <b>{lastResult.filePath}</b>
            </div>
            <div style={{ fontSize: '11px', color: '#065f46' }}>
              Tersimpan di: <code className="folder-path-code">{lastResult.folderPath}</code>
            </div>

            {/* Share to WhatsApp / Android share sheet */}
            <button
              type="button"
              className="btn btn-success"
              style={{ padding: '8px 14px', fontSize: '13px', marginTop: '4px' }}
              onClick={handleShare}
            >
              <Share2 size={16} />
              <span>Kirim / Bagikan ke WhatsApp</span>
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              color: '#991b1b',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertTriangle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Folder Destination Notice */}
        <div className="folder-info-card">
          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
            📁 Struktur Lokasi Penyimpanan Android:
          </div>
          <div>
            • PDF otomatis masuk ke:{' '}
            <code className="folder-path-code">Download/NotaDigital/Nota_PDF/</code>
          </div>
          <div>
            • PNG otomatis masuk ke:{' '}
            <code className="folder-path-code">Download/NotaDigital/Nota_PNG/</code>
          </div>
        </div>
      </div>
    </div>
  );
};
