export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class OllamaService {
  private static readonly ENDPOINT = 'http://localhost:11434/api/chat';
  private static readonly MODEL = 'llama3.2:1b';

  static async sendChatMessage(history: ChatMessage[], currentMessage: string): Promise<string> {
    try {
      const response = await fetch(this.ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.MODEL,
          messages: [
            ...history,
            { role: 'user', content: currentMessage }
          ],
          stream: false,
          options: {
            num_ctx: 2048,
            num_predict: 256,
            temperature: 0.7,
            top_p: 0.9,
          }
        }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Không tìm thấy Ollama hoặc model llama3.2:1b chưa được tải.');
        }
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.message.content;
    } catch (error: any) {
      console.error('Ollama Service Error:', error);
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Không thể kết nối với Ollama. Vui lòng đảm bảo Ollama đang chạy tại http://localhost:11434');
      }
      throw error;
    }
  }
}
