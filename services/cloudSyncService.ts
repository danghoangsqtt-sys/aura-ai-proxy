import { databases, APPWRITE_DATABASE_ID, COLLECTION_MINDMAPS, COLLECTION_SETTINGS } from './appwriteConfig';
import { ID, Query } from 'appwrite';

/**
 * Advanced Cloud Synchronization Service
 * Handles multi-collection document sync with automatic Upsert logic.
 */
export const cloudSyncService = {
  
  /**
   * Save or Update Mindmap Data
   */
  async saveMindmapData(userId: string, data: any) {
    console.group(`[Appwrite:CloudSync] -> [SaveMindmap] -> User: ${userId}`);
    try {
      if (!APPWRITE_DATABASE_ID) throw new Error("Database ID not configured");

      // Check for existing document
      const result = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COLLECTION_MINDMAPS,
        [Query.equal('userId', userId)]
      );

      if (result.documents.length > 0) {
        // Update existing
        const docId = result.documents[0].$id;
        await databases.updateDocument(
          APPWRITE_DATABASE_ID,
          COLLECTION_MINDMAPS,
          docId,
          { 
            data: JSON.stringify(data), 
            updatedAt: new Date().toISOString() 
          }
        );
        console.info('[Appwrite] -> [Update] -> Success');
      } else {
        // Create new
        await databases.createDocument(
          APPWRITE_DATABASE_ID,
          COLLECTION_MINDMAPS,
          ID.unique(),
          { 
            userId, 
            data: JSON.stringify(data), 
            createdAt: new Date().toISOString() 
          }
        );
        console.info('[Appwrite] -> [Create] -> Success');
      }
    } catch (error: any) {
      console.error('[Appwrite] -> [ERROR]:', error.message);
      throw error;
    } finally {
      console.groupEnd();
    }
  },

  /**
   * Load Mindmap Data from Cloud
   */
  async loadMindmapData(userId: string) {
    console.info(`[Appwrite:CloudSync] -> [LoadMindmap] -> User: ${userId}`);
    try {
      if (!APPWRITE_DATABASE_ID) return null;
      const result = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COLLECTION_MINDMAPS,
        [Query.equal('userId', userId)]
      );

      if (result.documents.length > 0) {
        return JSON.parse(result.documents[0].data);
      }
      return null;
    } catch (error: any) {
      console.error('[Appwrite] -> [LoadERROR]:', error.message);
      return null;
    }
  },

  /**
   * Save User Settings (Theme, Voice, etc)
   */
  async saveUserSettings(userId: string, settings: any) {
    console.group(`[Appwrite:CloudSync] -> [SaveSettings] -> User: ${userId}`);
    try {
      const result = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COLLECTION_SETTINGS,
        [Query.equal('userId', userId)]
      );

      if (result.documents.length > 0) {
        await databases.updateDocument(
          APPWRITE_DATABASE_ID,
          COLLECTION_SETTINGS,
          result.documents[0].$id,
          { settings: JSON.stringify(settings) }
        );
      } else {
        await databases.createDocument(
          APPWRITE_DATABASE_ID,
          COLLECTION_SETTINGS,
          ID.unique(),
          { userId, settings: JSON.stringify(settings) }
        );
      }
      console.info('[Appwrite] -> [SettingsSync] -> Success');
    } catch (error: any) {
      console.error('[Appwrite] -> [SettingsERROR]:', error.message);
    } finally {
      console.groupEnd();
    }
  },

  /**
   * BACKWARDS COMPATIBILITY: Sync generic data (Exams, etc)
   */
  async syncDataToCloud(userId: string, data: any) {
    return this.saveMindmapData(userId, data);
  },

  async fetchDataFromCloud(userId: string) {
    return this.loadMindmapData(userId);
  }
};
