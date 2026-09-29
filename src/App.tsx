import React, { useState, useEffect } from 'react';
import type { Nota, NotaStatus } from './types/nota';
import { offlineStorage } from './services/storage';
import { INITIAL_SEED_NOTAS } from './services/defaultData';
import { HomePage } from './pages/HomePage';
import { NotaFormPage } from './pages/NotaFormPage';
import { NotaDetailPage } from './pages/NotaDetailPage';
import { ConfirmDialog } from './components/ConfirmDialog';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import './styles/index.css';

type PageView = 'home' | 'form' | 'detail';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [notas, setNotas] = useState<Nota[]>([]);
  const [selectedNota, setSelectedNota] = useState<Nota | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);
  const [notaIdToDelete, setNotaIdToDelete] = useState<string | null>(null);

  // Trigger brief toast message
  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Load initial data from offline storage
  useEffect(() => {
    const loadAppData = async () => {
      try {
        let loadedNotas = await offlineStorage.getAllNotas();
        if (loadedNotas.length === 0) {
          for (const seed of INITIAL_SEED_NOTAS) {
            await offlineStorage.saveNota(seed);
          }
          loadedNotas = await offlineStorage.getAllNotas();
        }
        setNotas(loadedNotas);
      } catch (err) {
        console.error('Failed to load local offline data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAppData();
  }, []);

  // Reload notas from storage
  const reloadNotas = async () => {
    const list = await offlineStorage.getAllNotas();
    setNotas(list);
  };

  // Navigation handlers
  const handleGoToCreate = () => {
    setSelectedNota(null);
    setCurrentPage('form');
  };

  const handleOpenDetail = (nota: Nota) => {
    setSelectedNota(nota);
    setCurrentPage('detail');
  };

  const handleGoToEdit = (nota?: Nota) => {
    if (nota) {
      setSelectedNota(nota);
    }
    setCurrentPage('form');
  };

  const handleBackToHome = () => {
    setSelectedNota(null);
    setCurrentPage('home');
  };

  // Save / Draft handler
  const handleSaveNota = async (nota: Nota, status: NotaStatus) => {
    try {
      const saved = await offlineStorage.saveNota(nota);
      await reloadNotas();
      setSelectedNota(saved);

      const statusLabel = status === 'saved' ? 'Selesai' : 'Draft';
      showToast(`Nota berhasil disimpan sebagai ${statusLabel}!`, 'success');

      setCurrentPage('detail');
    } catch (err: any) {
      console.error('Failed to save nota:', err);
      showToast(err.message || 'Gagal menyimpan nota', 'info');
    }
  };

  // Delete handler
  const handleConfirmDelete = async () => {
    if (!notaIdToDelete) return;
    try {
      await offlineStorage.deleteNota(notaIdToDelete);
      await reloadNotas();
      setNotaIdToDelete(null);

      if (currentPage === 'detail' && selectedNota?.id === notaIdToDelete) {
        setCurrentPage('home');
        setSelectedNota(null);
      }

      showToast('Nota berhasil dihapus', 'info');
    } catch (err: any) {
      console.error('Failed to delete nota:', err);
      showToast('Gagal menghapus nota', 'info');
    }
  };

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: 'calc(16px + var(--safe-top))',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            backgroundColor: toastMessage.type === 'success' ? '#741D13' : '#1e293b',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: '9999px',
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)',
            animation: 'fadeIn 0.2s ease-out',
            maxWidth: '90%',
          }}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 size={16} color="#34d399" />
          ) : (
            <AlertCircle size={16} color="#fca5a5" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            minHeight: '60vh',
            gap: '12px',
          }}
        >
          <Loader2 size={36} className="animate-spin" color="#741D13" />
          <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600 }}>
            Memuat Nota Digital...
          </span>
        </div>
      )}

      {/* Pages Switcher */}
      {!isLoading && currentPage === 'home' && (
        <HomePage
          notas={notas}
          onCreateNota={handleGoToCreate}
          onOpenNota={handleOpenDetail}
          onEditNota={handleGoToEdit}
          onDeleteNota={(id) => setNotaIdToDelete(id)}
        />
      )}

      {currentPage === 'form' && (
        <NotaFormPage
          initialNota={selectedNota}
          existingNotas={notas}
          onSave={handleSaveNota}
          onCancel={() => {
            if (selectedNota) {
              setCurrentPage('detail');
            } else {
              setCurrentPage('home');
            }
          }}
        />
      )}

      {currentPage === 'detail' && selectedNota && (
        <NotaDetailPage
          nota={selectedNota}
          onBack={handleBackToHome}
          onEdit={() => handleGoToEdit(selectedNota)}
          onDelete={(id) => setNotaIdToDelete(id)}
        />
      )}

      {/* Deletion Confirmation Modal */}
      {notaIdToDelete && (
        <ConfirmDialog
          title="Hapus Nota Ini?"
          message="Nota yang dihapus tidak dapat dikembalikan. Apakah Anda yakin ingin menghapus data nota ini?"
          confirmText="Ya, Hapus"
          cancelText="Batal"
          isDanger={true}
          onConfirm={handleConfirmDelete}
          onCancel={() => setNotaIdToDelete(null)}
        />
      )}
    </div>
  );
};

export default App;
