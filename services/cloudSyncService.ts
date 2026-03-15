import { databases } from './appwriteConfig';
import { ID, Query } from 'appwrite';

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

/**
 * Dịch vụ đồng bộ dữ liệu người dùng với Appwrite Database
 */
export const cloudSyncService = {
  /**
   * Lưu hoặc cập nhật dữ liệu người dùng lên Cloud
   */
  async syncDataToCloud(userId: string, data: any) {
    if (!DATABASE_ID || !COLLECTION_ID) {
      console.warn('[CloudSync] -> [Warning]: Database/Collection IDs not configured.');
      return;
    }

    console.info(`[CloudSync] -> [Action]: Syncing data for user: ${userId}`);

    try {
      // Tìm xem user đã có record chưa
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.equal('userId', userId)]
      );

      if (response.documents.length > 0) {
        // Cập nhật
        const documentId = response.documents[0].$id;
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTION_ID,
          documentId,
          { data: JSON.stringify(data), lastSync: new Date().toISOString() }
        );
      } else {
        // Tạo mới
        await databases.createDocument(
          DATABASE_ID,
          COLLECTION_ID,
          ID.unique(),
          { userId, data: JSON.stringify(data), lastSync: new Date().toISOString() }
        );
      }
      console.info('[CloudSync] -> [Success]: Data synced with Appwrite Database.');
    } catch (error: any) {
      console.error('[CloudSync] -> [ERROR]: Failed to sync with Appwrite Database:', error.message);
      // Không ném lỗi ra ngoài để app vẫn chạy bằng LocalStorage
    }
  },

  /**
   * Lấy dữ liệu từ Cloud về
   */
  async fetchDataFromCloud(userId: string) {
    if (!DATABASE_ID || !COLLECTION_ID) return null;

    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.equal('userId', userId)]
      );

      if (response.documents.length > 0) {
        const cloudDataStr = response.documents[0].data;
        return JSON.parse(cloudDataStr);
      }
      return null;
    } catch (error: any) {
      console.error('[CloudSync] -> [ERROR]: Failed to fetch from Cloud:', error.message);
      return null;
    }
  }
};
