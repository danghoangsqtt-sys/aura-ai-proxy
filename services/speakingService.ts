
import { SpeakingQuestion, SpeakingFeedback } from "../types";
import { authService } from "./authService";

// ═══════════════════════════════════════════════
// Proxy helpers (chuẩn OpenAI API)
// ═══════════════════════════════════════════════

interface ProxyMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | { type: string; [key: string]: any }[];
}

const proxyFetch = async (messages: ProxyMessage[], temperature = 0.7): Promise<string> => {
  const proxyUrl = import.meta.env.VITE_PROXY_URL?.replace(/\/$/, '') || 'http://localhost:8317';
  const model = 'gemini-2.5-flash';

  let res: Response;
  try {
    const token = await authService.getAIToken();
    res = await fetch(`${proxyUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ model, messages, temperature, response_format: { type: 'json_object' } }),
    });
  } catch {
    throw new Error(`Không thể kết nối máy chủ AI (${proxyUrl}).`);
  }

  if (res.status === 401) throw new Error('UNAUTHORIZED: Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
  if (res.status === 429) throw new Error('Hệ thống AI đang quá tải. Thử lại sau 1 phút.');
  if (!res.ok) throw new Error(`Lỗi máy chủ AI (${res.status})`);

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('Phản hồi AI không hợp lệ.');
  return content as string;
};

const proxyFetchWithAudio = async (
  systemPrompt: string,
  userText: string,
  audioBase64: string,
  mimeType: string
): Promise<string> => {
  const messages: ProxyMessage[] = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: [
        { type: 'text', text: userText },
        { type: 'image_url', image_url: { url: `data:${mimeType};base64,${audioBase64}` } },
      ],
    },
  ];
  // Không yêu cầu json_object cho audio để tránh lỗi trên proxy chưa hỗ trợ
  const proxyUrl = import.meta.env.VITE_PROXY_URL?.replace(/\/$/, '') || 'http://localhost:8317';
  const model = 'gemini-2.5-flash';

  let res: Response;
  try {
    const token = await authService.getAIToken();
    res = await fetch(`${proxyUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ model, messages, temperature: 0.1 }),
    });
  } catch {
    throw new Error(`Không thể kết nối máy chủ AI.`);
  }

  if (res.status === 401) throw new Error('UNAUTHORIZED: Đăng nhập lại để tiếp tục.');
  if (!res.ok) throw new Error(`Lỗi máy chủ AI (${res.status})`);

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || '';
};

const cleanJson = (text: string): string => {
  if (!text) return '';
  const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
  // Extract first JSON structure
  const arrIdx = cleaned.indexOf('[');
  const objIdx = cleaned.indexOf('{');
  if (arrIdx !== -1 && (objIdx === -1 || arrIdx < objIdx)) {
    const end = cleaned.lastIndexOf(']');
    if (end > arrIdx) return cleaned.substring(arrIdx, end + 1);
  } else if (objIdx !== -1) {
    const end = cleaned.lastIndexOf('}');
    if (end > objIdx) return cleaned.substring(objIdx, end + 1);
  }
  return cleaned;
};

// ═══════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════

/**
 * Tạo câu hỏi phỏng vấn Speaking dựa trên chủ đề và trình độ
 */
export const generateSpeakingQuestions = async (topic: string, level: string): Promise<SpeakingQuestion[]> => {
  const prompt = `You are an expert IELTS Speaking examiner.
Generate 5 speaking interview questions (Part 1 & 2) about the topic: "${topic}".
Questions MUST be appropriate for CEFR level: ${level}.

Level guidelines:
- A1-A2: Simple, personal questions. Common vocabulary. Short answers.
- B1-B2: Opinion-based. Topic-specific vocabulary. Detailed answers.
- C1-C2: Abstract, analytical. Sophisticated vocabulary. Complex argumentation.

Return JSON object: { "questions": [ { "id": "...", "question": "...", "sampleAnswer": "...", "difficulty": "${level}", "topic": "${topic}" } ] }`;

  const messages: ProxyMessage[] = [
    { role: 'system', content: 'You are an IELTS speaking examiner. Return ONLY valid JSON.' },
    { role: 'user', content: prompt },
  ];

  const raw = await proxyFetch(messages, 0.7);
  const parsed = JSON.parse(cleanJson(raw));
  const arr: any[] = Array.isArray(parsed) ? parsed : parsed.questions || [];
  return arr.map((q: any, idx: number) => ({
    ...q,
    id: q.id || `ai-speak-${Date.now()}-${idx}`,
    topic,
  })) as SpeakingQuestion[];
};

/**
 * Đánh giá bài nói (Audio) của học sinh qua proxy
 */
export const evaluateSpeakingSession = async (
  question: string,
  audioBase64: string,
  sampleAnswer?: string
): Promise<SpeakingFeedback> => {
  const systemPrompt = 'You are a STRICT professional English speaking examiner. Return ONLY valid JSON.';

  const userPrompt = `Evaluate the student's spoken answer from the audio.

THE QUESTION: "${question}"
${sampleAnswer ? `MODEL ANSWER (reference): "${sampleAnswer}"` : ''}

CRITICAL RULES:
1. SILENCE/NOISE: If no recognizable English speech → score=0, transcription="[Không nghe được nội dung]"
2. IRRELEVANT: If completely off-topic → score 0-20 max
3. DO NOT HALLUCINATE: Only transcribe words you actually hear. Mark unclear as [unclear]
4. SCORING (0-100): 0=silence, 1-20=unintelligible, 21-40=very poor, 41-60=below avg, 61-75=good, 76-85=very good, 86-100=excellent
5. FEEDBACK IN VIETNAMESE (pronunciation, grammar fields)

Return JSON: { "transcription": "...", "score": 0, "pronunciation": "...", "grammar": "...", "betterVersion": "..." }`;

  const raw = await proxyFetchWithAudio(systemPrompt, userPrompt, audioBase64, 'audio/webm');
  return JSON.parse(cleanJson(raw)) as SpeakingFeedback;
};
