/**
 * File Storage Service — Hybrid: Electron FS + IndexedDB fallback
 * 
 * When running in Electron, files are saved to the physical filesystem
 * (AuraData/Documents/) via IPC and served through the `local-file://` protocol.
 * 
 * When running in a browser (no Electron), falls back to IndexedDB blob storage.
 */

import { ID } from 'appwrite';
import { storage as appwriteStorage } from './appwriteConfig';

const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID || 'Documents';

export class FileStorageService {
  /**
   * Save a file blob to Appwrite Storage
   */
  static async saveFile(key: string, blob: Blob): Promise<string> {
    try {
      const file = new File([blob], key, { type: blob.type });
      const response = await appwriteStorage.createFile(BUCKET_ID, ID.unique(), file);
      return response.$id;
    } catch (error) {
       console.error('[FileStorage] Appwrite save failed, falling back to local memory if needed:', error);
       throw error;
    }
  }

  /**
   * Get a file url for viewing (Appwrite returns direct URL)
   */
  static async getFile(key: string): Promise<Blob | null> {
    try {
      const url = appwriteStorage.getFileDownload(BUCKET_ID, key);
      const res = await fetch(url.toString());
      if (res.ok) {
         return await res.blob();
      }
      return null;
    } catch (error) {
      console.error('[FileStorage] Appwrite get failed:', error);
      return null;
    }
  }

  /**
   * Delete a file from Appwrite Storage
   */
  static async deleteFile(key: string): Promise<void> {
    try {
      await appwriteStorage.deleteFile(BUCKET_ID, key);
    } catch (error) {
      console.error('[FileStorage] Appwrite delete failed:', error);
    }
  }

  /**
   * Create a URL for rendering a stored file.
   */
  static async getFileUrl(key: string): Promise<string | null> {
    try {
        const url = appwriteStorage.getFileView(BUCKET_ID, key);
        return url.toString();
    } catch (error) {
        return null;
    }
  }
}
