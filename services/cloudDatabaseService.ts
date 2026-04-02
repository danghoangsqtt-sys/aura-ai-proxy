import { ID, Query } from 'appwrite';
import { databases, APPWRITE_DATABASE_ID, COLLECTION_EXAMS, COLLECTION_DOCUMENTS, COLLECTION_VOCABULARY, COLLECTION_USERDATA } from './appwriteConfig';
import { authService } from './authService';

export const COLLECTIONS = {
    EXAMS: COLLECTION_EXAMS,
    DOCUMENTS: COLLECTION_DOCUMENTS,
    VOCABULARY: COLLECTION_VOCABULARY,
    USERDATA: COLLECTION_USERDATA
};

export class CloudDatabaseService {
    /**
     * Helper to get current user ID
     */
    private static async getUserId(): Promise<string> {
        const user = await authService.getCurrentUser();
        if (!user) throw new Error('User not authenticated');
        return user.$id;
    }

    /**
     * Load all exams for the current user
     */
    static async loadAllExams(): Promise<any[]> {
        const userId = await this.getUserId();
        const response = await databases.listDocuments(
            APPWRITE_DATABASE_ID,
            COLLECTIONS.EXAMS,
            [
                Query.equal('userId', userId),
                Query.orderDesc('createdAt')
            ]
        );
        return response.documents.map(doc => ({
            ...doc,
            id: doc.$id,
            config: JSON.parse(doc.config || '{}'),
            questions: JSON.parse(doc.questions || '[]')
        }));
    }

    /**
     * Save an exam (create or update)
     */
    static async saveExam(examData: any): Promise<{ success: boolean; id?: string; error?: string }> {
        try {
            const userId = await this.getUserId();
            const documentId = examData.id && examData.id.startsWith('EXAM-') ? examData.id : ID.unique();
            
            const payload = {
                userId,
                title: examData.config?.title || 'Bản nháp',
                subject: examData.config?.subject || '',
                config: JSON.stringify(examData.config || {}),
                questions: JSON.stringify(examData.questions || []),
                createdAt: examData.createdAt || new Date().toISOString()
            };

            try {
                // Try to get first, if exists then update, else create. Appwrite uses documentId for this.
                await databases.getDocument(APPWRITE_DATABASE_ID, COLLECTIONS.EXAMS, documentId);
                await databases.updateDocument(APPWRITE_DATABASE_ID, COLLECTIONS.EXAMS, documentId, payload);
            } catch (err: any) {
                if (err.code === 404) {
                    await databases.createDocument(APPWRITE_DATABASE_ID, COLLECTIONS.EXAMS, documentId, payload);
                } else {
                    throw err;
                }
            }

            return { success: true, id: documentId };
        } catch (error: any) {
            console.error('[CloudDatabase] Save Exam error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Delete an exam
     */
    static async deleteExam(examId: string): Promise<{ success: boolean; error?: string }> {
        try {
            await databases.deleteDocument(APPWRITE_DATABASE_ID, COLLECTIONS.EXAMS, examId);
            return { success: true };
        } catch (error: any) {
            console.error('[CloudDatabase] Delete Exam error:', error);
            return { success: false, error: error.message };
        }
    }
}
