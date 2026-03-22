/**
 * File Storage Service — Hybrid: Electron FS + IndexedDB fallback
 * 
 * When running in Electron, files are saved to the physical filesystem
 * (AuraData/Documents/) via IPC and served through the `local-file://` protocol.
 * 
 * When running in a browser (no Electron), falls back to IndexedDB blob storage.
 */

const DB_NAME = 'aura_file_storage';
const DB_VERSION = 1;
const STORE_NAME = 'files';

// ── Electron detection ──
function isElectron(): boolean {
  return !!(window as any).electronAPI;
}

function getElectronAPI(): any {
  return (window as any).electronAPI;
}

// ── IndexedDB helpers (fallback) ──
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export class FileStorageService {
  /**
   * Save a file blob.
   * Electron: saves to filesystem, returns the physical file path as the key.
   * Browser:  saves to IndexedDB with the given key.
   */
  static async saveFile(key: string, blob: Blob): Promise<string> {
    if (isElectron()) {
      try {
        const api = getElectronAPI();
        const arrayBuffer = await blob.arrayBuffer();
        const result = await api.invoke('save-document-file', key, arrayBuffer);
        if (result?.success && result.path) {
          // Return the physical file path as the new storage key
          return result.path;
        }
      } catch (err) {
        console.error('[FileStorage] Electron save failed, falling back to IndexedDB:', err);
      }
    }
    // Fallback: IndexedDB
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(blob, key);
      tx.oncomplete = () => resolve(key);
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Get a file blob.
   * Electron: if key looks like an absolute path, reads from filesystem via IPC.
   * Browser:  reads from IndexedDB.
   */
  static async getFile(key: string): Promise<Blob | null> {
    // If key is a physical path (saved by Electron), read via IPC
    if (isElectron() && this.isPhysicalPath(key)) {
      try {
        const api = getElectronAPI();
        const result = await api.invoke('read-document-file', key);
        if (result?.success && result.buffer) {
          return new Blob([result.buffer]);
        }
      } catch (err) {
        console.error('[FileStorage] Electron read failed:', err);
      }
      return null;
    }
    // Fallback: IndexedDB
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const request = tx.objectStore(STORE_NAME).get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete a file blob from IndexedDB (filesystem files are not auto-deleted).
   */
  static async deleteFile(key: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Create a URL for rendering a stored file.
   * Electron + physical path: returns `local-file://` URL (bypasses CORS).
   * Browser / IndexedDB:     returns an Object URL (caller must revoke).
   */
  static async getFileUrl(key: string): Promise<string | null> {
    // Physical path → use custom protocol
    if (isElectron() && this.isPhysicalPath(key)) {
      // Convert backslashes to forward slashes and use triple-slash to prevent
      // Chromium from interpreting the drive letter as a hostname
      const safePath = key.replace(/\\/g, '/');
      return `local-file:///${safePath}`;
    }
    // Fallback: create Object URL from IndexedDB blob
    const blob = await this.getFile(key);
    if (!blob) return null;
    return URL.createObjectURL(blob);
  }

  /**
   * Check if a key looks like a physical file path (e.g. C:\..., /home/...).
   */
  private static isPhysicalPath(key: string): boolean {
    return /^[A-Za-z]:[/\\]/.test(key) || key.startsWith('/');
  }
}
