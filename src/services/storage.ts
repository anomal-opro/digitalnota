import type { Nota } from '../types/nota';

const DB_NAME = 'NotaDigitalDB';
const DB_VERSION = 1;
const NOTAS_STORE = 'notas';
const LOCAL_STORAGE_BACKUP_KEY = 'nota_digital_backup_v1';

class OfflineStorage {
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    this.initDB();
  }

  private initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        console.warn('IndexedDB is not available. Falling back to localStorage.');
        return reject(new Error('IndexedDB not supported'));
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(NOTAS_STORE)) {
          const notaStore = db.createObjectStore(NOTAS_STORE, { keyPath: 'id' });
          notaStore.createIndex('updatedAt', 'updatedAt', { unique: false });
          notaStore.createIndex('status', 'status', { unique: false });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  /**
   * Read all backup notas from localStorage as a fallback.
   */
  private getLocalStorageBackup(): Nota[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_BACKUP_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error('Failed to read localStorage backup:', err);
      return [];
    }
  }

  /**
   * Save snapshot to localStorage as double safety.
   */
  private saveLocalStorageBackup(notas: Nota[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_BACKUP_KEY, JSON.stringify(notas));
    } catch (err) {
      console.warn('LocalStorage backup quota reached or error:', err);
    }
  }

  /**
   * Get all notas sorted by latest first (updatedAt descending).
   */
  async getAllNotas(): Promise<Nota[]> {
    try {
      const db = await this.initDB();
      return new Promise<Nota[]>((resolve) => {
        const tx = db.transaction(NOTAS_STORE, 'readonly');
        const store = tx.objectStore(NOTAS_STORE);
        const request = store.getAll();

        request.onsuccess = () => {
          let notas: Nota[] = request.result || [];
          // If indexedDB is empty but localStorage has data, sync it
          if (notas.length === 0) {
            const backup = this.getLocalStorageBackup();
            if (backup.length > 0) {
              notas = backup;
              this.restoreFromBackup(backup);
            }
          }

          // Sort latest updated or created first
          notas.sort((a, b) => {
            const timeA = new Date(a.updatedAt || a.createdAt).getTime();
            const timeB = new Date(b.updatedAt || b.createdAt).getTime();
            return timeB - timeA;
          });

          // Keep backup in sync
          this.saveLocalStorageBackup(notas);
          resolve(notas);
        };

        request.onerror = () => {
          console.warn('IndexedDB getAll error, using localStorage backup');
          const backup = this.getLocalStorageBackup();
          backup.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
          resolve(backup);
        };
      });
    } catch {
      const backup = this.getLocalStorageBackup();
      backup.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
      return backup;
    }
  }

  /**
   * Get a single nota by ID.
   */
  async getNotaById(id: string): Promise<Nota | null> {
    try {
      const db = await this.initDB();
      return new Promise<Nota | null>((resolve) => {
        const tx = db.transaction(NOTAS_STORE, 'readonly');
        const store = tx.objectStore(NOTAS_STORE);
        const request = store.get(id);

        request.onsuccess = () => {
          if (request.result) {
            resolve(request.result);
          } else {
            const backup = this.getLocalStorageBackup();
            const found = backup.find((n) => n.id === id) || null;
            resolve(found);
          }
        };

        request.onerror = () => {
          const backup = this.getLocalStorageBackup();
          resolve(backup.find((n) => n.id === id) || null);
        };
      });
    } catch {
      const backup = this.getLocalStorageBackup();
      return backup.find((n) => n.id === id) || null;
    }
  }

  /**
   * Save or update a nota.
   * Ensures data integrity and updates the backup immediately.
   */
  async saveNota(nota: Nota): Promise<Nota> {
    const updatedNota: Nota = {
      ...nota,
      updatedAt: new Date().toISOString(),
      createdAt: nota.createdAt || new Date().toISOString(),
    };

    try {
      const db = await this.initDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(NOTAS_STORE, 'readwrite');
        const store = tx.objectStore(NOTAS_STORE);
        const request = store.put(updatedNota);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.warn('Error saving to IndexedDB, fallback directly to backup:', err);
    }

    // Always update localStorage backup mirror
    const currentBackup = this.getLocalStorageBackup();
    const existingIndex = currentBackup.findIndex((n) => n.id === updatedNota.id);
    if (existingIndex >= 0) {
      currentBackup[existingIndex] = updatedNota;
    } else {
      currentBackup.unshift(updatedNota);
    }
    this.saveLocalStorageBackup(currentBackup);

    return updatedNota;
  }

  /**
   * Delete a nota by ID.
   */
  async deleteNota(id: string): Promise<boolean> {
    try {
      const db = await this.initDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(NOTAS_STORE, 'readwrite');
        const store = tx.objectStore(NOTAS_STORE);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.warn('Error deleting from IndexedDB:', err);
    }

    // Update localStorage backup mirror
    const currentBackup = this.getLocalStorageBackup().filter((n) => n.id !== id);
    this.saveLocalStorageBackup(currentBackup);

    return true;
  }

  /**
   * Restore/sync data to IndexedDB.
   */
  private async restoreFromBackup(backupNotas: Nota[]): Promise<void> {
    try {
      const db = await this.initDB();
      const tx = db.transaction(NOTAS_STORE, 'readwrite');
      const store = tx.objectStore(NOTAS_STORE);
      for (const nota of backupNotas) {
        store.put(nota);
      }
    } catch (err) {
      console.error('Error restoring from backup:', err);
    }
  }

}

export const offlineStorage = new OfflineStorage();
