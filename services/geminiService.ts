import { ExamConfig, Question, VocabularyItem } from "../types";
import { authService } from "./authService";

// ═══════════════════════════════════════════════
// Core: OpenAI-compatible Proxy Fetch
// ═══════════════════════════════════════════════

interface ProxyMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | { type: string; [key: string]: any }[];
}

interface ProxyRequestOptions {
  model?: string;
  temperature?: number;
  response_format?: { type: 'json_object' | 'text' };
  max_tokens?: number;
}

/**
 * Core: Gọi thẳng Gemini REST API bằng token ya29.* của người dùng (BYOA Mode)
 * Bỏ qua CLIProxyAPI — đây là kiến trúc đúng cho BYOA.
 */
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_GEMINI_MODEL = 'gemini-2.0-flash';

/** Chuyển đổi messages (OpenAI format) → Gemini content format */
const toGeminiPayload = (messages: ProxyMessage[], opts: ProxyRequestOptions) => {
  const systemMsg = messages.find(m => m.role === 'system');
  const chatMsgs  = messages.filter(m => m.role !== 'system');

  const contents = chatMsgs.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) }]
  }));

  const payload: any = {
    contents,
    generationConfig: {
      temperature: opts.temperature ?? 0.7,
      ...(opts.max_tokens ? { maxOutputTokens: opts.max_tokens } : {}),
      ...(opts.response_format?.type === 'json_object' ? { responseMimeType: 'application/json' } : {}),
    }
  };
  if (systemMsg) payload.systemInstruction = { parts: [{ text: systemMsg.content as string }] };
  return payload;
};

const proxyFetch = async (
  messages: ProxyMessage[],
  opts: ProxyRequestOptions = {}
): Promise<string> => {
  const model = opts.model || DEFAULT_GEMINI_MODEL;
  const payload = toGeminiPayload(messages, opts);

  let res: Response;
  try {
    const token = await authService.getAIToken();
    res = await fetch(`${GEMINI_API_BASE}/${model}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });
  } catch (networkError: any) {
    throw new Error(`Không thể kết nối Gemini API. Kiểm tra lại kết nối mạng.`);
  }

  if (res.status === 401) throw new Error('UNAUTHORIZED: Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.');
  if (res.status === 403) throw new Error('Tài khoản Google chưa có quyền truy cập Gemini API. Kiểm tra Google Cloud Console.');
  if (res.status === 429) throw new Error('Hệ thống AI đang quá tải (vượt quota). Vui lòng thử lại sau 1 phút.');
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Lỗi từ Gemini API (${res.status}): ${errText || 'Không xác định'}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Phản hồi từ AI không hợp lệ hoặc rỗng.');
  return text as string;
};


/**
 * Fetch có đính kèm dữ liệu nhị phân (ảnh/audio) dưới dạng base64.
 * Proxy nên hỗ trợ multipart content array theo chuẩn OpenAI vision.
 */
const proxyFetchWithMedia = async (
  systemPrompt: string,
  userText: string,
  mediaBase64: string,
  mimeType: string,
  opts: ProxyRequestOptions = {}
): Promise<string> => {
  const messages: ProxyMessage[] = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: [
        { type: 'text', text: userText },
        { type: 'image_url', image_url: { url: `data:${mimeType};base64,${mediaBase64}` } },
      ],
    },
  ];
  return proxyFetch(messages, opts);
};

const cleanJson = (text: string): string =>
  text.replace(/```json/g, '').replace(/```/g, '').trim();

// ═══════════════════════════════════════════════
// Public Exports
// ═══════════════════════════════════════════════

/**
 * Trích xuất từ vựng từ File (PDF hoặc Ảnh) qua proxy
 */
export const extractVocabularyFromFile = async (
  base64Data: string,
  mimeType: string,
  topic: string
): Promise<VocabularyItem[]> => {
  const systemPrompt = 'Bạn là chuyên gia ngôn ngữ học. Trả về JSON array hợp lệ, không giải thích thêm.';
  const userPrompt = `
Phân tích hình ảnh/tài liệu đính kèm để trích xuất danh sách từ vựng tiếng Anh.
Chủ đề: "${topic}".
Yêu cầu:
1. Lấy tất cả từ vựng tiếng Anh.
2. Nếu có IPA trong tài liệu thì lấy chính xác, nếu không tự tạo IPA chuẩn Mỹ.
3. Lấy nghĩa tiếng Việt, nếu không có thì dịch.
4. Xác định từ loại (n., v., adj., adv.)
5. Tạo câu ví dụ ngắn.
Output: JSON Array only.
Schema: [{ "id": "...", "word": "...", "pronunciation": "/ipa/", "partOfSpeech": "...", "meaning": "...", "example": "...", "topic": "${topic}" }]
  `;

  const raw = await proxyFetchWithMedia(systemPrompt, userPrompt, base64Data, mimeType, {
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  const parsed = JSON.parse(cleanJson(raw));
  // Proxy có thể trả về { items: [...] } hoặc trực tiếp array
  const arr: any[] = Array.isArray(parsed) ? parsed : parsed.items || parsed.vocabulary || [];
  return arr.map((item: any) => ({
    ...item,
    id: `vocab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    topic,
  })) as VocabularyItem[];
};

/**
 * Trích xuất từ vựng từ văn bản thô
 */
export const extractVocabFromText = async (text: string): Promise<any[]> => {
  const messages: ProxyMessage[] = [
    { role: 'system', content: 'Bạn là chuyên gia ngôn ngữ học. Trả về JSON array hợp lệ.' },
    {
      role: 'user',
      content: `Phân tích đoạn văn bản sau và trích xuất 10-15 từ vựng quan trọng nhất.
Trả về đúng JSON Array: [{ "word": "...", "ipa": "/phiên_âm/", "meaning": "nghĩa_tiếng_việt", "pos": "n/v/adj/adv" }]

Văn bản: "${text}"`,
    },
  ];

  const raw = await proxyFetch(messages, { response_format: { type: 'json_object' }, temperature: 0.7 });
  const parsed = JSON.parse(cleanJson(raw));
  return Array.isArray(parsed) ? parsed : parsed.words || parsed.vocabulary || [];
};

/**
 * Tạo đề thi (với retry 3 lần)
 */
export const generateExamContent = async (config: ExamConfig): Promise<Question[]> => {
  let lastError: string | null = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    const retryHeader = lastError
      ? `LỖI LẦN TRƯỚC: ${lastError}. Trả về JSON array hợp lệ theo schema.\n`
      : '';

    const prompt = `${retryHeader}Đóng vai trò là giáo viên môn: ${config.subject}.
Tạo một đề thi trắc nghiệm/tự luận dưới dạng JSON.

Thông tin đề thi:
- Chủ đề: ${config.topic}
- Môn học: ${config.subject}
- Tiêu đề: ${config.title}
- Yêu cầu: "${config.customRequirement || 'Tạo đề thi tổng hợp tiêu chuẩn.'}"
- Ma trận: ${JSON.stringify(config.sections)}

Yêu cầu đầu ra:
1. Nội dung sáng tạo, không lặp câu hỏi nhàm chán.
2. Tiếng Anh nếu môn Tiếng Anh, Tiếng Việt nếu môn khác.
3. Trả về JSON Array với schema: [{ "id": "...", "type": "...", "content": "...", "options": [...], "matchingLeft": [...], "matchingRight": [...], "correctAnswer": "...", "explanation": "...", "bloomLevel": "...", "points": 0 }]`;

    const messages: ProxyMessage[] = [
      { role: 'system', content: 'Bạn là giáo viên chuyên nghiệp. Trả về JSON array hợp lệ, không giải thích.' },
      { role: 'user', content: prompt },
    ];

    try {
      const raw = await proxyFetch(messages, { response_format: { type: 'json_object' }, temperature: 1.0 });
      const parsed = JSON.parse(cleanJson(raw));
      const arr: any[] = Array.isArray(parsed) ? parsed : parsed.questions || parsed.items || [];
      return arr as Question[];
    } catch (error: any) {
      console.warn(`[Proxy Exam Retry] Lần ${attempt}:`, error.message);
      lastError = error.message;
      if (attempt === 3) throw error;
    }
  }
  throw new Error('Không thể tạo đề thi sau nhiều lần thử.');
};

/**
 * Tái tạo một câu hỏi đơn
 */
export const regenerateSingleQuestion = async (config: ExamConfig, oldQuestion: Question): Promise<Question> => {
  let lastError: string | null = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    const prefix = lastError ? `LỖI LẦN TRƯỚC: ${lastError}. Chỉ trả về 1 JSON object.\n` : '';
    const prompt = `${prefix}Tạo một câu hỏi ${config.subject} mới thay thế cho: "${oldQuestion.content}".
- Loại: ${oldQuestion.type}, Bloom: ${oldQuestion.bloomLevel}, Chủ đề: ${config.topic}
Trả về một JSON object: { "id": "...", "type": "...", "content": "...", "options": [...], "correctAnswer": "...", "explanation": "...", "bloomLevel": "...", "points": 0 }`;

    const messages: ProxyMessage[] = [
      { role: 'system', content: 'Bạn là giáo viên chuyên nghiệp. Trả về JSON object duy nhất.' },
      { role: 'user', content: prompt },
    ];

    try {
      const raw = await proxyFetch(messages, { response_format: { type: 'json_object' }, temperature: 1.0 });
      return JSON.parse(cleanJson(raw)) as Question;
    } catch (error: any) {
      console.warn(`[Proxy Regen Retry] Lần ${attempt}:`, error.message);
      lastError = error.message;
      if (attempt === 3) throw error;
    }
  }
  throw new Error('Không thể tái tạo câu hỏi.');
};

/**
 * Phân tích ngôn ngữ từ/câu
 */
export interface DictionaryResponse {
  type: 'word' | 'phrase' | 'sentence' | 'not_found';
  word?: string;
  ipa?: string;
  meanings?: { partOfSpeech: string; def: string; example: string }[];
  translation?: string;
  correction?: string;
  grammarAnalysis?: { error: string; fix: string; explanation: string }[];
  structure?: string;
  usageNotes?: string;
}

export const analyzeLanguage = async (text: string): Promise<DictionaryResponse> => {
  const messages: ProxyMessage[] = [
    { role: 'system', content: 'Bạn là từ điển song ngữ Anh-Việt. Trả về JSON object hợp lệ.' },
    { role: 'user', content: `Phân tích từ/câu: "${text}". Trả về JSON với schema DictionaryResponse.` },
  ];
  const raw = await proxyFetch(messages, { response_format: { type: 'json_object' }, temperature: 0.2 });
  return JSON.parse(cleanJson(raw)) as DictionaryResponse;
};

/**
 * Sinh truyện chêm từ vựng (Macaronic Story)
 */
export const generateMacaronicStory = async (
  wordList: string,
  topic: string,
  baseLanguage: 'vi' | 'en' = 'vi'
): Promise<{ story: string; vocabulary: { word: string; meaning: string; pos?: string; ipa?: string; example?: string; synonyms?: string[] }[] }> => {
  const isViBase = baseLanguage === 'vi';

  const prompt = `Bạn là chuyên gia viết "Truyện Chêm" (Macaronic Story).

NHIỆM VỤ: Viết câu chuyện 200-300 từ về chủ đề "${topic}".
DANH SÁCH TỪ BẮT BUỘC: ${wordList}

${isViBase ? `
QUY TẮC: Viết bằng TIẾNG VIỆT, chêm từ TIẾNG ANH. Bọc từ chêm trong <b>...</b>.
VÍ DỤ (từ: resilient, journey): "Minh là chàng trai <b>resilient</b>. Anh bắt đầu một <b>journey</b> dài..."
` : `
QUY TẮC: Viết bằng TIẾNG ANH, chêm nghĩa TIẾNG VIỆT. Bọc từ chêm trong <b>...</b>.
VÍ DỤ (từ: kiên cường, hành trình): "Minh was <b>kiên cường</b>. He began a long <b>hành trình</b>..."
`}

BẮT BUỘC: Dùng TẤT CẢ từ trong danh sách. Từ chêm phải tự nhiên.

Trả về JSON:
{
  "story": "Nội dung với từ chêm trong <b>...</b>",
  "vocabulary": [{ "word": "...", "meaning": "...", "pos": "...", "ipa": "/ipa/", "example": "...", "synonyms": ["..."] }]
}`;

  const messages: ProxyMessage[] = [
    { role: 'system', content: 'Bạn là nhà văn ngôn ngữ học. Trả về JSON object hợp lệ.' },
    { role: 'user', content: prompt },
  ];

  const raw = await proxyFetch(messages, { response_format: { type: 'json_object' }, temperature: 0.8 });
  return JSON.parse(cleanJson(raw));
};

/**
 * Chấm bài viết tiếng Anh (Writing Evaluator)
 */
export interface WritingEvaluation {
  cefrLevel: string;
  bandScore: number;
  overallFeedback: string;
  grammarErrors: { error: string; fix: string; explanation: string }[];
  vocabUpgrades: { original: string; upgraded: string; example: string }[];
  structureFeedback: string;
  modelEssay: string;
  advancedVocab: { word: string; meaning: string; pos: string; example: string }[];
  advancedSentences: { pattern: string; example: string }[];
}

const WRITING_EVAL_SYSTEM = 'You are an expert IELTS/CEFR Writing Examiner. Return ONLY valid JSON object.';

const WRITING_EVAL_PROMPT = (text: string) => `Evaluate this English text and return a JSON object:

USER TEXT:
"""
${text}
"""

Schema:
{
  "cefrLevel": "<A1|A2|B1|B2|C1|C2>",
  "bandScore": <0-100>,
  "overallFeedback": "<2-3 sentence assessment in Vietnamese>",
  "grammarErrors": [{"error": "...", "fix": "...", "explanation": "..."}],
  "vocabUpgrades": [{"original": "...", "upgraded": "...", "example": "..."}],
  "structureFeedback": "<Vietnamese>",
  "modelEssay": "<rewrite at one CEFR level higher>",
  "advancedVocab": [{"word": "...", "meaning": "<Vietnamese>", "pos": "...", "example": "..."}],
  "advancedSentences": [{"pattern": "...", "example": "..."}]
}

RULES: grammarErrors max 10, vocabUpgrades 5-8, advancedVocab 8-12, advancedSentences 5-8. Return ONLY raw JSON.`;

export const evaluateWritingStructured = async (textInput: string): Promise<WritingEvaluation> => {
  const messages: ProxyMessage[] = [
    { role: 'system', content: WRITING_EVAL_SYSTEM },
    { role: 'user', content: WRITING_EVAL_PROMPT(textInput) },
  ];
  const raw = await proxyFetch(messages, { response_format: { type: 'json_object' }, temperature: 0.2 });
  return JSON.parse(cleanJson(raw)) as WritingEvaluation;
};

/**
 * Sinh 10 đề luyện viết hàng tuần
 */
import { WritingTopic } from '../types';

const WRITING_TOPICS_PROMPT = `You are an IELTS/CEFR writing topic designer.
Generate EXACTLY 10 diverse English writing practice topics.

Requirements:
- Mix: 2 essays, 2 letters, 2 emails, 2 reports, 2 reviews
- CEFR mix: 2×A2, 2×B1, 3×B2, 2×C1, 1×C2
- Modern, practical topics
- Each topic has 3 tips in Vietnamese
- Word count: A2=80-120, B1=120-180, B2=180-250, C1=250-350, C2=300-400

Return JSON object: { "topics": [ { "id": "topic_1", "prompt": "...", "taskType": "essay|letter|email|report|review", "cefrTarget": "...", "wordCountHint": "...", "tips": ["...", "...", "..."] } ] }
No duplicate topics. Return ONLY raw JSON.`;

export const generateWritingTopics = async (): Promise<WritingTopic[]> => {
  const messages: ProxyMessage[] = [
    { role: 'system', content: 'You are a writing topic generator. Return ONLY valid JSON.' },
    { role: 'user', content: WRITING_TOPICS_PROMPT },
  ];
  const raw = await proxyFetch(messages, { response_format: { type: 'json_object' }, temperature: 0.9 });
  const parsed = JSON.parse(cleanJson(raw));
  const arr: any[] = Array.isArray(parsed) ? parsed : parsed.topics || [];
  if (arr.length < 5) throw new Error('Không đủ đề luyện viết. Thử lại.');
  return arr as WritingTopic[];
};

/**
 * Phân tích cấu tạo từ (Word Formation)
 */
export interface WordFormationResponse {
  word: string;
  prefix: { morpheme: string; meaning: string } | null;
  root: { morpheme: string; meaning: string };
  suffix: { morpheme: string; meaning: string } | null;
  family: string[];
}

export const analyzeWordFormation = async (word: string): Promise<WordFormationResponse> => {
  const messages: ProxyMessage[] = [
    { role: 'system', content: 'You are an expert linguist. Return ONLY valid JSON.' },
    {
      role: 'user',
      content: `Analyze the word: '${word}'. Break into prefix, root, suffix (null if absent). Include 3 related words.
JSON Schema: { "word": "...", "prefix": { "morpheme": "...", "meaning": "..." } | null, "root": { "morpheme": "...", "meaning": "..." }, "suffix": { "morpheme": "...", "meaning": "..." } | null, "family": ["...", "...", "..."] }`,
    },
  ];
  const raw = await proxyFetch(messages, { response_format: { type: 'json_object' }, temperature: 0.1 });
  return JSON.parse(cleanJson(raw)) as WordFormationResponse;
};

/**
 * Sinh sơ đồ tư duy từ vựng (Vocab Mind Map)
 */
export interface VocabMindMapResponse {
  centralTopic: string;
  centralEmoji: string;
  branches: { categoryName: string; words: { word: string; meaning: string; emoji: string }[] }[];
}

export const generateVocabMindMap = async (topic: string): Promise<VocabMindMapResponse> => {
  const messages: ProxyMessage[] = [
    { role: 'system', content: 'You are an English vocabulary expert. Return ONLY valid JSON.' },
    {
      role: 'user',
      content: `Generate a vocabulary mind map for topic: '${topic}'.
3-4 branches, each with 3-5 words with Vietnamese meanings and emoji.
JSON Schema: { "centralTopic": "...", "centralEmoji": "...", "branches": [{ "categoryName": "...", "words": [{ "word": "...", "meaning": "...", "emoji": "..." }] }] }`,
    },
  ];
  const raw = await proxyFetch(messages, { response_format: { type: 'json_object' }, temperature: 0.7 });
  return JSON.parse(cleanJson(raw)) as VocabMindMapResponse;
};

/**
 * Phân tích phát âm từ audio blob
 */
export interface PronunciationFeedback {
  score: number;
  transcription: string;
  errors: string[];
  advice: string;
}

export const analyzePronunciation = async (audioBlob: Blob, targetText: string): Promise<PronunciationFeedback> => {
  const arrayBuffer = await audioBlob.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
  const mimeType = audioBlob.type || 'audio/webm';

  const systemPrompt = 'You are an expert English pronunciation coach. Return ONLY valid JSON.';
  const userPrompt = `The user is trying to say: "${targetText}". Listen to the audio and evaluate pronunciation.
Return JSON: { "score": <0-100>, "transcription": "<what you heard>", "errors": ["<error1>"], "advice": "<one tip>" }
Scoring: 90-100 native, 70-89 good, 50-69 noticeable errors, 30-49 hard to understand. Return ONLY raw JSON.`;

  const raw = await proxyFetchWithMedia(systemPrompt, userPrompt, base64, mimeType, { temperature: 0.1 });
  return JSON.parse(cleanJson(raw)) as PronunciationFeedback;
};

/**
 * Sinh ảnh minh họa từ vựng — NOTE: Cần proxy hỗ trợ image generation endpoint
 */
export const generateVocabImage = async (word: string, meaning: string): Promise<string> => {
  // Image generation qua text-to-image endpoint nếu proxy hỗ trợ
  // Fallback: trả về placeholder URL để UI không bị crash
  const messages: ProxyMessage[] = [
    { role: 'system', content: 'You are a helpful assistant.' },
    {
      role: 'user',
      content: `Describe a simple educational illustration for the word "${word}" (meaning: ${meaning}) in one sentence suitable for image generation. Style: flat design, bright colors, white background.`,
    },
  ];

  try {
    const proxyUrl = import.meta.env.VITE_PROXY_URL?.replace(/\/$/, '') || 'http://localhost:8317';

    // Thử gọi image generation endpoint nếu proxy hỗ trợ
    const res = await fetch(`${proxyUrl}/v1/images/generations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemini-2.5-flash-image',
        prompt: `Educational illustration of "${word}" (${meaning}). Flat design, bright colors, white background, no text.`,
        n: 1,
        size: '512x512',
        response_format: 'b64_json',
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const b64 = data?.data?.[0]?.b64_json;
      if (b64) return `data:image/png;base64,${b64}`;
    }
  } catch {
    // Fallthrough to placeholder
  }

  // Placeholder nếu endpoint không hỗ trợ
  return `https://placehold.co/512x512/E0E7FF/4F46E5?text=${encodeURIComponent(word)}`;
};

// ═══════════════════════════════════════════════
// Chatbot: sendChatMessage (dùng cho ChatbotPanel)
// ═══════════════════════════════════════════════

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
}

const AURA_SYSTEM_PROMPT = `Bạn là Aura — một gia sư AI thông minh, thân thiện và chuyên sâu về giáo dục.
Nhiệm vụ của bạn là hỗ trợ học sinh và giáo viên trong việc học tập và giảng dạy tiếng Anh.
Trả lời súc tích, rõ ràng, dùng tiếng Việt hoặc tiếng Anh tùy ngữ cảnh người hỏi.
Khi giải thích ngữ pháp hoặc từ vựng, hãy kèm ví dụ cụ thể.`;

/**
 * Gửi tin nhắn trong Chatbot và nhận phản hồi trực tiếp từ Gemini API
 */
export const sendChatMessage = async (history: ChatMessage[], newMessage: string): Promise<string> => {
  const messages: ProxyMessage[] = [
    { role: 'system', content: AURA_SYSTEM_PROMPT },
    ...history.map(m => ({
      role: (m.role === 'model' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: newMessage },
  ];

  return proxyFetch(messages, { temperature: 0.8 });
};
