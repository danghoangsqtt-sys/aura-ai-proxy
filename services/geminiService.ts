
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ExamConfig, Question, QuestionType, BloomLevel, VocabularyItem } from "../types";
import { storage, STORAGE_KEYS } from "./storageAdapter";

// Vì getApiKey giờ là async, các hàm gọi nó cũng phải xử lý async key
const getApiKey = async (): Promise<string> => {
  const manualKey = await storage.get<string>(STORAGE_KEYS.API_KEY, '');
  return manualKey || process.env.API_KEY || '';
};

const cleanJsonResponse = (text: string): string => {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

/**
 * Sinh ảnh minh họa cho từ vựng (Sử dụng cho game Vision Linker)
 */
export const generateVocabImage = async (word: string, meaning: string): Promise<string> => {
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error("Cần API Key để sinh ảnh.");
  
  const ai = new GoogleGenAI({ apiKey });
  // Sử dụng gemini-2.5-flash-image cho tốc độ và chất lượng tốt
  const prompt = `A clear, simple, and high-quality educational illustration for the vocabulary word: "${word}" (meaning: ${meaning}). Style: Flat design, bright colors, white background, no text inside.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Không tìm thấy dữ liệu ảnh.");
  } catch (error) {
    console.error("Image Gen Error:", error);
    throw error;
  }
};

/**
 * Trích xuất từ vựng trực tiếp từ File (PDF hoặc Image)
 */
export const extractVocabularyFromFile = async (base64Data: string, mimeType: string, topic: string): Promise<VocabularyItem[]> => {
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error("Chưa cấu hình API Key trong phần Cài đặt.");
  
  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-2.0-flash'; // Dùng bản 2.0 Flash ổn định

  const prompt = `
    Đóng vai trò là một chuyên gia ngôn ngữ học và số hóa tài liệu.
    Nhiệm vụ: Phân tích hình ảnh/tài liệu đính kèm để trích xuất danh sách từ vựng tiếng Anh.
    Chủ đề gán cho các từ này là: "${topic}".
    
    Yêu cầu xử lý:
    1. Tìm tất cả các từ vựng tiếng Anh có trong tài liệu.
    2. Nếu tài liệu có cột phiên âm (IPA), hãy lấy chính xác. Nếu không, hãy tự động tạo IPA chuẩn Mỹ.
    3. Nếu tài liệu có nghĩa tiếng Việt, hãy lấy nó. Nếu không, hãy dịch nghĩa phù hợp với ngữ cảnh phổ thông.
    4. Xác định từ loại (n., v., adj., adv., v.v.).
    5. Tạo một câu ví dụ ngắn gọn (example) chứa từ đó (nếu trong ảnh không có).
    6. Bỏ qua các tiêu đề, số trang, hoặc rác. Chỉ lấy từ vựng.

    Output format: JSON Array only.
    Schema:
    [
      {
        "id": "tạo_id_ngẫu_nhiên",
        "word": "từ_gốc",
        "pronunciation": "/ipa/",
        "partOfSpeech": "từ_loại",
        "meaning": "nghĩa_tiếng_việt",
        "example": "Câu ví dụ.",
        "topic": "${topic}"
      }
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ parts: [{ text: prompt }, { inlineData: { data: base64Data, mimeType: mimeType } }] }],
      config: { responseMimeType: "application/json" }
    });
    
    const parsedData = JSON.parse(cleanJsonResponse(response.text));
    
    // Validate và chuẩn hóa dữ liệu trả về
    return parsedData.map((item: any) => ({
      ...item,
      id: `vocab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      topic: topic
    })) as VocabularyItem[];

  } catch (error: any) {
    console.error("Extract Error:", error);
    throw new Error(error?.message || "Lỗi AI không thể đọc file.");
  }
};

export const generateExamContent = async (config: ExamConfig): Promise<Question[]> => {
  const apiKey = await getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  // Xây dựng Prompt chi tiết hơn để khắc phục vấn đề "đề thi giống nhau"
  // Thay đổi: Không hardcode "Tiếng Anh", sử dụng config.subject
  // Thay đổi: Đưa customRequirement lên ưu tiên cao nhất
  const prompt = `
    Đóng vai trò là một giáo viên bộ môn: ${config.subject}.
    Nhiệm vụ: Tạo một đề thi trắc nghiệm/tự luận dưới dạng JSON.
    
    Thông tin đề thi:
    - Chủ đề chính: ${config.topic}
    - Môn học: ${config.subject}
    - Tiêu đề: ${config.title}
    
    YÊU CẦU ĐẶC BIỆT TỪ NGƯỜI DÙNG (PROMPT):
    "${config.customRequirement || "Tạo đề thi tổng hợp kiến thức tiêu chuẩn."}"
    
    Cấu trúc ma trận câu hỏi mong muốn (nếu Prompt không ghi đè):
    ${JSON.stringify(config.sections)}

    Yêu cầu đầu ra (Quan trọng):
    1. Nội dung câu hỏi phải mới mẻ, sáng tạo, KHÔNG lặp lại các câu hỏi phổ thông nhàm chán.
    2. Nếu môn học là Tiếng Anh, nội dung bằng tiếng Anh. Nếu là môn khác (Văn, Sử, Địa...), nội dung bằng Tiếng Việt.
    3. Trả về đúng định dạng JSON Schema bên dưới.
    4. "matchingLeft" và "matchingRight" chỉ dùng cho dạng câu hỏi MATCHING (Nối từ), để trống nếu là trắc nghiệm.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        // Tăng temperature để tạo sự đa dạng
        temperature: 1.0, 
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING },
              content: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              matchingLeft: { type: Type.ARRAY, items: { type: Type.STRING } },
              matchingRight: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING },
              bloomLevel: { type: Type.STRING },
              points: { type: Type.NUMBER }
            },
            required: ["id", "content", "correctAnswer", "type", "bloomLevel"]
          }
        }
      }
    });
    return JSON.parse(cleanJsonResponse(response.text)) as Question[];
  } catch (error) { 
    console.error("Generate Exam Error:", error);
    throw error; 
  }
};

export const regenerateSingleQuestion = async (config: ExamConfig, oldQuestion: Question): Promise<Question> => {
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error("Chưa cấu hình API Key.");
  
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Tạo một câu hỏi ${config.subject} mới thay thế cho câu hỏi cũ này: "${oldQuestion.content}".
    Yêu cầu:
    - Loại câu hỏi: ${oldQuestion.type}
    - Mức độ Bloom: ${oldQuestion.bloomLevel}
    - Chủ đề chính: ${config.topic}
    - Yêu cầu bổ sung: ${config.customRequirement}
    Trả về một đối tượng JSON câu hỏi duy nhất.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            content: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            matchingLeft: { type: Type.ARRAY, items: { type: Type.STRING } },
            matchingRight: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING },
            bloomLevel: { type: Type.STRING },
            points: { type: Type.NUMBER }
          },
          required: ["content", "correctAnswer", "explanation"]
        }
      }
    });

    const result = JSON.parse(cleanJsonResponse(response.text));
    return {
      ...result,
      id: oldQuestion.id,
      type: oldQuestion.type,
      bloomLevel: result.bloomLevel || oldQuestion.bloomLevel
    };
  } catch (error) {
    console.error("Regenerate Question Error:", error);
    throw error;
  }
};

export const analyzeLanguage = async (text: string): Promise<DictionaryResponse> => {
  const apiKey = await getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Phân tích từ/câu: "${text}"`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(cleanJsonResponse(response.text)) as DictionaryResponse;
};

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

export const generateMacaronicStory = async (wordList: string, topic: string): Promise<string> => {
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error("Chưa cấu hình API Key trong phần Cài đặt.");

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Đóng vai một chuyên gia ngôn ngữ học. Hãy viết một câu chuyện ngắn bằng tiếng Việt (khoảng 250 - 300 chữ) với chủ đề: ${topic}. 
YÊU CẦU BẮT BUỘC: Hãy thay thế các từ tiếng Việt tương ứng bằng các từ tiếng Anh sau đây: ${wordList}. 
Đảm bảo ngữ cảnh của câu chuyện đủ rõ ràng, tự nhiên để người đọc có thể dễ dàng đoán được nghĩa của các từ tiếng Anh được chêm vào. Trả về kết quả dưới dạng Markdown, in đậm (**word**) các từ tiếng Anh đó.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: { temperature: 0.9 }
    });
    return response.text || '';
  } catch (error: any) {
    console.error("Macaronic Story Error:", error);
    throw new Error(error?.message || "Lỗi AI không thể tạo truyện.");
  }
};

/**
 * Phòng Luyện Viết (Writing Master) - Chấm điểm và sửa bài chuẩn Aptis ESOL
 */
export const evaluateWriting = async (textInput: string): Promise<string> => {
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error("Chưa cấu hình API Key trong phần Cài đặt.");

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Act as an expert Aptis ESOL / IELTS Writing Examiner. Evaluate the user's text for a B2 target.
  Must output ONLY in strictly formatted Markdown.
  Structure required:
  ### 📊 Ước lượng điểm (Band Score): [Your Score]
  ### 🚨 Phân tích lỗi Ngữ pháp & Chính tả:
  - **[Lỗi sai]** -> **[Cách sửa]**: [Giải thích ngắn gọn]
  ### 💎 Gợi ý Nâng cấp Từ vựng (Vocabulary):
  - Thay vì dùng **[Từ cũ]**, hãy dùng **[Từ vựng B2/C1]**: [Câu ví dụ]
  ### 💡 Nhận xét chung & Cấu trúc bài:
  [Feedback của bạn]

  User text: "${textInput}"`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: { temperature: 0.2 } // Low temperature for consistent grading
    });
    return response.text || '';
  } catch (error: any) {
    console.error("Writing Evaluation Error:", error);
    throw new Error(error?.message || "Hệ thống AI gặp sự cố khi chấm bài.");
  }
};

/**
 * Phân tích cấu tạo từ (Word Formation) - Tiền tố, Gốc từ, Hậu tố
 */
export const analyzeWordFormation = async (word: string): Promise<WordFormationResponse> => {
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error("Chưa cấu hình API Key trong phần Cài đặt.");

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Act as an expert linguist. Analyze the word: '${word}'. 
  Break it down into prefix, root, and suffix. If a part doesn't exist, return null.
  Provide 3 related words in the same word family.
  Must return strictly in JSON format matching this schema:
  {
    "word": "string",
    "prefix": { "morpheme": "string", "meaning": "string" } | null,
    "root": { "morpheme": "string", "meaning": "string" },
    "suffix": { "morpheme": "string", "meaning": "string" } | null,
    "family": ["string", "string", "string"]
  }`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        temperature: 0.1 
      }
    });
    
    return JSON.parse(cleanJsonResponse(response.text)) as WordFormationResponse;
  } catch (error: any) {
    console.error("Word Formation Error:", error);
    throw new Error(error?.message || "Hệ thống AI gặp sự cố khi phân tích cấu tạo từ.");
  }
};

export interface WordFormationResponse {
  word: string;
  prefix: { morpheme: string; meaning: string } | null;
  root: { morpheme: string; meaning: string };
  suffix: { morpheme: string; meaning: string } | null;
  family: string[];
}

/**
 * Sinh Sơ đồ tư duy từ vựng (Vocab Mind Map)
 */
export const generateVocabMindMap = async (topic: string): Promise<VocabMindMapResponse> => {
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error("Chưa cấu hình API Key trong phần Cài đặt.");

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Act as an English vocabulary expert. Generate a mind map for the topic: '${topic}'.
  Categorize the vocabulary into 3 to 4 branches (e.g., Types, Causes, Solutions, Adjectives).
  Each branch should have 3 to 5 related English words with their Vietnamese meanings and a fitting emoji.
  Must return STRICTLY in JSON format matching this schema:
  {
    "centralTopic": "string",
    "centralEmoji": "string",
    "branches": [
      {
        "categoryName": "string",
        "words": [
          { "word": "string", "meaning": "string", "emoji": "string" }
        ]
      }
    ]
  }`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        temperature: 0.7 
      }
    });
    
    return JSON.parse(cleanJsonResponse(response.text)) as VocabMindMapResponse;
  } catch (error: any) {
    console.error("Vocab Mind Map Error:", error);
    throw new Error(error?.message || "Hệ thống AI gặp sự cố khi sinh sơ đồ tư duy.");
  }
};

export interface VocabMindMapResponse {
  centralTopic: string;
  centralEmoji: string;
  branches: {
    categoryName: string;
    words: { word: string; meaning: string; emoji: string }[];
  }[];
}

