export type QuestionType = 'mcq' | 'matching' | 'fill-blank' | 'context-pos' | 'stress-tap';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  topic: 'word-formation' | 'pos' | 'stress';
  questionText: string;
  explanation: string;
}

export interface MCQQuestion extends BaseQuestion {
  type: 'mcq';
  options: string[];
  correctAnswer: string;
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'matching';
  pairs: { left: string; right: string }[];
}

export interface FillBlankQuestion extends BaseQuestion {
  type: 'fill-blank';
  sentence: string; // use ___ for blank
  options: string[]; // options to click
  correctAnswer: string;
}

export interface ContextPOSQuestion extends BaseQuestion {
  type: 'context-pos';
  sentence: string;
  highlightedWord: string;
  correctPOS: 'Noun' | 'Verb' | 'Adjective' | 'Adverb';
}

export interface StressTapQuestion extends BaseQuestion {
  type: 'stress-tap';
  wordSyllables: string[];
  correctStressIndex: number;
}

export type Question = MCQQuestion | MatchingQuestion | FillBlankQuestion | ContextPOSQuestion | StressTapQuestion;

export const grammarArenaQuestions: Question[] = [
  // --- STRESS ---
  {
    id: 'q1',
    type: 'stress-tap',
    topic: 'stress',
    questionText: 'Chạm vào âm tiết nhận trọng âm của từ sau:',
    wordSyllables: ['pho', 'to', 'graph', 'er'],
    correctStressIndex: 1,
    explanation: 'Với hậu tố -er, trọng âm giữ nguyên như từ gốc "photography" (nhấn âm 2) hoặc theo quy tắc hậu tố -graphy nhấn âm tiết thứ 3 từ dưới lên.'
  },
  {
    id: 'q2',
    type: 'stress-tap',
    topic: 'stress',
    questionText: 'Xác định trọng âm của từ:',
    wordSyllables: ['un', 'der', 'stand'],
    correctStressIndex: 2,
    explanation: 'Với động từ ghép (compound verbs), trọng âm thường rơi vào thành phần thứ hai (stand).'
  },
  {
    id: 'q3',
    type: 'stress-tap',
    topic: 'stress',
    questionText: 'Xác định trọng âm của từ:',
    wordSyllables: ['eco', 'nom', 'ic'],
    correctStressIndex: 1,
    explanation: 'Các từ kết thúc bằng hậu tố -ic thường có trọng âm rơi vào âm tiết ngay trước nó.'
  },
  // --- POS ---
  {
    id: 'q4',
    type: 'context-pos',
    topic: 'pos',
    questionText: 'Xác định từ loại của từ bôi đậm:',
    sentence: 'She **waters** the flowers every morning.',
    highlightedWord: 'waters',
    correctPOS: 'Verb',
    explanation: 'Trong câu này, "waters" đứng sau chủ ngữ "She" và đóng vai trò hành động (tưới nước), nên nó là Động từ (Verb).'
  },
  {
    id: 'q5',
    type: 'context-pos',
    topic: 'pos',
    questionText: 'Xác định từ loại của từ bôi đậm:',
    sentence: 'It was a **beautiful** day.',
    highlightedWord: 'beautiful',
    correctPOS: 'Adjective',
    explanation: '"Beautiful" đứng trước danh từ "day" để bổ nghĩa cho nó, do đó là Tính từ (Adjective).'
  },
  {
    id: 'q6',
    type: 'mcq',
    topic: 'pos',
    questionText: 'Trạng từ (Adverb) thường đứng ở vị trí nào trong câu?',
    options: ['Trước danh từ', 'Sau mạo từ', 'Trước tính từ hoặc sau động từ', 'Đầu câu làm chủ ngữ'],
    correctAnswer: 'Trước tính từ hoặc sau động từ',
    explanation: 'Trạng từ bổ nghĩa cho động từ, tính từ hoặc một trạng từ khác. Nó không đứng trước danh từ (đó là vị trí của tính từ).'
  },
  // --- WORD FORMATION ---
  {
    id: 'q7',
    type: 'matching',
    topic: 'word-formation',
    questionText: 'Nối tiền tố với ý nghĩa tương ứng:',
    pairs: [
      { left: 'un-', right: 'not / opposite' },
      { left: 're-', right: 'again' },
      { left: 'pre-', right: 'before' },
      { left: 'mis-', right: 'wrongly' }
    ],
    explanation: 'Đây là các tiền tố (prefixes) phổ biến: un- (không), re- (lại), pre- (trước), mis- (sai).'
  },
  {
    id: 'q8',
    type: 'fill-blank',
    topic: 'word-formation',
    questionText: 'Chọn hậu tố phù hợp để hoàn thành câu:',
    sentence: 'The music was very enjoy___.',
    options: ['-ment', '-able', '-ness', '-ly'],
    correctAnswer: '-able',
    explanation: 'Sau động từ to-be "was" và trạng từ chỉ mức độ "very", ta cần một Tính từ. "Enjoyable" (có thể tận hưởng/thú vị) là tính từ phù hợp.'
  },
  {
    id: 'q9',
    type: 'mcq',
    topic: 'word-formation',
    questionText: 'Gốc từ (Root) "port" mang ý nghĩa gì?',
    options: ['To carry (mang, vác)', 'To see (nhìn)', 'To write (viết)', 'To build (xây dựng)'],
    correctAnswer: 'To carry (mang, vác)',
    explanation: 'Gốc từ "port" (Latin) nghĩa là mang vác, xuất hiện trong: export (mang ra), import (mang vào), transport (mang qua).'
  },
  // --- MIXED ---
  {
    id: 'q10',
    type: 'fill-blank',
    topic: 'pos',
    questionText: 'Điền từ loại phù hợp:',
    sentence: 'He drive very ___.',
    options: ['careful', 'careless', 'carefully', 'care'],
    correctAnswer: 'carefully',
    explanation: 'Bổ nghĩa cho động từ "drive" thường xuyên/thói quen cần một Trạng từ (Adverb). "Carefully" là trạng từ.'
  },
  {
    id: 'q11',
    type: 'matching',
    topic: 'pos',
    questionText: 'Nối từ loại với hậu tố nhận diện:',
    pairs: [
      { left: 'Noun', right: '-ness' },
      { left: 'Verb', right: '-ize' },
      { left: 'Adjective', right: '-ous' },
      { left: 'Adverb', right: '-ly' }
    ],
    explanation: 'Hậu tố giúp ta nhận diện nhanh từ loại: -ness (Danh từ), -ize (Động từ), -ous (Tính từ), -ly (Trạng từ).'
  },
  {
    id: 'q12',
    type: 'stress-tap',
    topic: 'stress',
    questionText: 'Nhấn trọng âm cho từ 2 âm tiết sau (Động từ):',
    wordSyllables: ['pre', 'sent'],
    correctStressIndex: 1,
    explanation: 'Từ "present" nếu là Động từ (thuyết trình/tặng) thì nhấn âm 2. Nếu là Danh từ (món quà/hiện tại) thì nhấn âm 1.'
  },
  {
    id: 'q13',
    type: 'mcq',
    topic: 'stress',
    questionText: 'Quy tắc trọng âm cho hậu tố -ity là gì?',
    options: ['Nhấn vào chính nó', 'Nhấn vào âm tiết ngay trước nó', 'Nhấn vào âm đầu tiên', 'Không ảnh hưởng trọng âm'],
    correctAnswer: 'Nhấn vào âm tiết ngay trước nó',
    explanation: 'Ví dụ: a-BIL-ity, clar-I-ty, curi-OS-ity. Trọng âm rơi vào âm tiết ngay sát trước -ity.'
  },
  {
    id: 'q14',
    type: 'context-pos',
    topic: 'pos',
    questionText: 'Xác định từ loại của từ bôi đậm:',
    sentence: 'The **explanation** was clear.',
    highlightedWord: 'explanation',
    correctPOS: 'Noun',
    explanation: '"Explanation" kết thúc bằng -tion và đứng sau mạo từ "The" làm chủ ngữ, nên là Danh từ.'
  },
  {
    id: 'q15',
    type: 'fill-blank',
    topic: 'word-formation',
    questionText: 'Hoàn thành từ có nghĩa "trước chiến tranh":',
    sentence: 'These are ___war documents.',
    options: ['post-', 'pre-', 'anti-', 'pro-'],
    correctAnswer: 'pre-',
    explanation: 'Tiền tố "pre-" nghĩa là "before" (trước). Pre-war = trước chiến tranh.'
  }
];
