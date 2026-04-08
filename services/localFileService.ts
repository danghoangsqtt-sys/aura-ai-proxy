/**
 * Service to handle local file operations via Electron IPC
 * Nâng cấp: hỗ trợ lưu đề thi dạng file riêng biệt + chọn thư mục
 */

import { CloudDatabaseService } from './cloudDatabaseService';

export class LocalFileService {
  static async getHardwareInfo() {
    return { cpu: 'Web (Cloud)', ram: 0, gpu: 'N/A' };
  }

  static async checkOllamaStatus() {
    return false; // Removed Ollama
  }

  // ===== LEGACY DATA =====
  static async saveData(fileName: string, data: any) {
    localStorage.setItem(`aura_${fileName}`, JSON.stringify(data));
    return { success: true };
  }

  static async loadData(fileName: string) {
    const data = localStorage.getItem(`aura_${fileName}`);
    return data ? JSON.parse(data) : null;
  }

  static async saveExams(exams: any[]) {
    return await this.saveData('exams', exams);
  }

  static async loadExams() {
    return await this.loadData('exams') || [];
  }

  static async saveSettings(settings: any) {
    return await this.saveData('settings', settings);
  }

  static async loadSettings() {
    return await this.loadData('settings');
  }

  // ===== NEW: Appwrite Integration — skipped in proxy/guest mode =====

  /** Returns true when Appwrite cloud sync should be skipped */
  private static isLocalOnlyMode(): boolean {
    // Guest mode
    if (sessionStorage.getItem('aura_guest_mode') === '1') return true;
    // Proxy BYOA mode — not an Appwrite user, no cloud session
    if (localStorage.getItem('aura_chat_api_key')) return true;
    return false;
  }


  static async saveExamFile(examData: any): Promise<{ success: boolean; path?: string; error?: string }> {
    if (this.isLocalOnlyMode()) {
      const exams = JSON.parse(localStorage.getItem('aura_exams_v2') || '[]');
      const idx = exams.findIndex((e: any) => e.id === examData.id);
      if (idx >= 0) exams[idx] = examData; else exams.unshift(examData);
      localStorage.setItem('aura_exams_v2', JSON.stringify(exams));
      return { success: true };
    }
    try {
      const result = await CloudDatabaseService.saveExam(examData);
      return { success: result.success, error: result.error };
    } catch (err: any) {
      console.warn("Lưu qua Cloud thất bại, fallback xuống localStorage", err);
      const exams = JSON.parse(localStorage.getItem('aura_exams_v2') || '[]');
      const idx = exams.findIndex((e: any) => e.id === examData.id);
      if (idx >= 0) exams[idx] = examData; else exams.unshift(examData);
      localStorage.setItem('aura_exams_v2', JSON.stringify(exams));
      return { success: true };
    }
  }

  static async deleteExamFile(examId: string): Promise<{ success: boolean; error?: string }> {
    const exams = JSON.parse(localStorage.getItem('aura_exams_v2') || '[]');
    localStorage.setItem('aura_exams_v2', JSON.stringify(exams.filter((e: any) => e.id !== examId)));
    if (this.isLocalOnlyMode()) return { success: true };
    try {
      const result = await CloudDatabaseService.deleteExam(examId);
      return { success: result.success, error: result.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  static async loadAllExams(): Promise<any[]> {
    if (this.isLocalOnlyMode()) {
      return JSON.parse(localStorage.getItem('aura_exams_v2') || '[]');
    }
    try {
      const cloudExams = await CloudDatabaseService.loadAllExams();
      const localExams = JSON.parse(localStorage.getItem('aura_exams_v2') || '[]');
      const map = new Map<string, any>();
      localExams.forEach((e: any) => map.set(e.id, e));
      cloudExams.forEach((e: any) => map.set(e.id, e));
      return Array.from(map.values()).sort((a, b) => {
         return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    } catch (err: any) {
       if (err.message !== 'User not authenticated') {
           console.warn("Không thể tải từ Cloud, hiện thông tin Local.", err);
       }
       return JSON.parse(localStorage.getItem('aura_exams_v2') || '[]');
    }
  }

  static async selectStorageFolder(): Promise<string | null> {
    return null;
  }

  static async getStorageFolder(): Promise<string> {
    return 'Appwrite Cloud Storage';
  }
}
