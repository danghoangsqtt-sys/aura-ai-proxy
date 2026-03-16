export interface POSRule {
  type: string;
  suffixes: string[];
  positions: { rule: string; example: string }[];
}

export interface StressRule {
  id: string;
  rule: string;
  description: string;
  examples: { word: string; stressedWord: string; meaning: string }[];
}

export const partsOfSpeechRules: POSRule[] = [
  {
    type: 'Danh từ (Noun)',
    suffixes: ['-tion', '-sion', '-ment', '-ness', '-ity', '-ship', '-hood', '-ance', '-ence', '-er', '-or', '-ist', '-ism', '-ty', '-acy', '-dom'],
    positions: [
      { rule: 'Làm chủ ngữ trong câu (đứng đầu câu)', example: 'The **Lexicon** is a great tool.' },
      { rule: 'Làm tân ngữ đứng sau động từ', example: 'I like this **structure**.' },
      { rule: 'Đứng sau tính từ', example: 'She is a talented **writer**.' },
      { rule: 'Đứng sau các mạo từ (a, an, the)', example: 'Give me a **decision**, please.' },
      { rule: 'Đứng sau các đại từ chỉ định (this, that, these, those)', example: 'That **structure** is very high.' },
      { rule: 'Đứng sau các tính từ sở hữu (my, your, her, his...)', example: 'His **happiness** is everything.' },
      { rule: 'Đứng sau các từ chỉ số lượng (many, a lot of, some...)', example: 'There are many **solutions**.' },
      { rule: 'Đứng sau giới từ (in, at, on, of, for...)', example: 'He is interested in **photography**.' },
      { rule: 'Dùng trong cấu trúc sở hữu cách', example: 'John\'s **bicycle** is new.' },
      { rule: 'Đứng sau Enough (trong cấu trúc Adj + enough + N)', example: 'I have enough **money** to buy it.' }
    ]
  },
  {
    type: 'Động từ (Verb)',
    suffixes: ['-ate', '-ify', '-ize', '-en'],
    positions: [
      { rule: 'Đứng sau chủ ngữ', example: 'We **calculate** the total cost.' },
      { rule: 'Đứng sau trạng từ chỉ tần suất', example: 'He usually **modernizes** his apps.' },
      { rule: 'Đứng sau trợ động từ (do, does, did)', example: 'I didn\'t **recognize** him.' },
      { rule: 'Đứng sau động từ khuyết thiếu (can, should, must...)', example: 'You should **sharpen** this knife.' },
      { rule: 'Đứng sau To (trong cấu trúc To-V)', example: 'I want to **simplify** the process.' },
      { rule: 'Đứng giữa trạng từ và tân ngữ', example: 'He quickly **finished** the report.' },
      { rule: 'Waters (Verb) vs Water (Noun)', example: 'She **waters** (V) the plants with water (N).' }
    ]
  },
  {
    type: 'Tính từ (Adjective)',
    suffixes: ['-able', '-ible', '-ful', '-less', '-ive', '-ous', '-ic', '-al', '-ish', '-y', '-ent', '-ant', '-ed', '-ing'],
    positions: [
      { rule: 'Đứng trước danh từ (bổ nghĩa cho danh từ)', example: 'It is a **beautiful** day.' },
      { rule: 'Đứng sau động từ to-be', example: 'The world is **global**.' },
      { rule: 'Đứng sau các hệ từ (linking verbs: look, feel, taste, become...)', example: 'You look **happy** today.' },
      { rule: 'Trong cấu trúc: make/keep + Obj + Adj', example: 'This game keeps me **active**.' },
      { rule: 'Đứng sau các đại từ bất định (something, anything...)', example: 'There is something **unusual** here.' },
      { rule: 'Phân biệt V-ed (cảm xúc) vs V-ing (tính chất)', example: 'The movie is **boring** (V-ing), so I feel **bored** (V-ed).' },
      { rule: 'Tính từ ghép (Compound Adj)', example: 'He is a **well-known** actor.' },
      { rule: 'Trình tự tính từ (OSASCOMP)', example: 'A **beautiful small old round** table.' }
    ]
  },
  {
    type: 'Trạng từ (Adverb)',
    suffixes: ['-ly', '-wise', '-ward'],
    positions: [
      { rule: 'Đứng trước/sau động từ chính', example: 'He **quickly** finished the task.' },
      { rule: 'Đứng trước tính từ', example: 'It is **extremely** useful.' },
      { rule: 'Đứng trước trạng từ khác', example: 'She writes **very** beautifully.' },
      { rule: 'Đứng đầu câu (ngăn cách bằng dấu phẩy)', example: '**Fortunately**, we survived.' },
      { rule: 'Đứng cuối câu', example: 'She speaks English **fluently**.' },
      { rule: 'Đứng giữa trợ động từ và động từ chính', example: 'I have **recently** finished the project.' },
      { rule: 'Bổ nghĩa cho cả câu', example: '**Obviously**, he is lying.' }
    ]
  }
];

export const wordStressRules: StressRule[] = [
  {
    id: 'stress-1',
    rule: 'Danh từ 2 âm tiết',
    description: 'Trọng âm thường rơi vào âm tiết đầu tiên.',
    examples: [
      { word: 'present', stressedWord: 'PRE-sent', meaning: 'món quà' },
      { word: 'mirror', stressedWord: 'MIR-ror', meaning: 'cái gương' },
      { word: 'table', stressedWord: 'TA-ble', meaning: 'cái bàn' }
    ]
  },
  {
    id: 'stress-2',
    rule: 'Tính từ 2 âm tiết',
    description: 'Trọng âm thường rơi vào âm tiết đầu tiên.',
    examples: [
      { word: 'happy', stressedWord: 'HAP-py', meaning: 'hạnh phúc' },
      { word: 'clever', stressedWord: 'CLEV-er', meaning: 'thông minh' },
      { word: 'quiet', stressedWord: 'QUI-et', meaning: 'yên tĩnh' }
    ]
  },
  {
    id: 'stress-3',
    rule: 'Động từ 2 âm tiết',
    description: 'Trọng âm thường rơi vào âm tiết thứ hai.',
    examples: [
      { word: 'begin', stressedWord: 'be-GIN', meaning: 'bắt đầu' },
      { word: 'relax', stressedWord: 're-LAX', meaning: 'thư giãn' },
      { word: 'decide', stressedWord: 'de-CIDE', meaning: 'quyết định' }
    ]
  },
  {
    id: 'stress-4',
    rule: 'Từ thay đổi trọng âm theo loại (Noun/Verb)',
    description: 'Danh từ nhấn âm 1, Động từ nhấn âm 2.',
    examples: [
      { word: 'record', stressedWord: 'REC-ord (N) / re-CORD (V)', meaning: 'kỷ lục / ghi âm' },
      { word: 'present', stressedWord: 'PRE-sent (N) / pre-SENT (V)', meaning: 'món quà / thuyết trình' },
      { word: 'object', stressedWord: 'OB-ject (N) / ob-JECT (V)', meaning: 'vật thể / phản đối' }
    ]
  },
  {
    id: 'stress-5',
    rule: 'Hậu tố nhận trọng âm (-ee, -eer, -ese, -ique)',
    description: 'Trọng âm rơi vào chính hậu tố đó.',
    examples: [
      { word: 'volunteer', stressedWord: 'vol-un-TEER', meaning: 'tình nguyện viên' },
      { word: 'Japanese', stressedWord: 'Jap-an-ESE', meaning: 'người Nhật' },
      { word: 'unique', stressedWord: 'u-NIQUE', meaning: 'độc nhất' }
    ]
  },
  {
    id: 'stress-6',
    rule: 'Hậu tố kéo trọng âm về trước âm đó (-ic, -tion, -ity...)',
    description: 'Trọng âm rơi vào âm tiết ngay trước hậu tố.',
    examples: [
      { word: 'economic', stressedWord: 'e-co-NOM-ic', meaning: 'thuộc kinh tế' },
      { word: 'solution', stressedWord: 'so-LU-tion', meaning: 'giải pháp' },
      { word: 'ability', stressedWord: 'a-BIL-ity', meaning: 'khả năng' }
    ]
  },
  {
    id: 'stress-7',
    rule: 'Hậu tố -ate, -ize, -ify, -ogy, -phy',
    description: 'Trọng âm rơi vào âm tiết thứ 3 từ dưới lên.',
    examples: [
      { word: 'activate', stressedWord: 'AC-ti-vate', meaning: 'kích hoạt' },
      { word: 'organize', stressedWord: 'OR-gan-ize', meaning: 'tổ chức' },
      { word: 'biology', stressedWord: 'bi-OL-o-gy', meaning: 'sinh học' }
    ]
  },
  {
    id: 'stress-8',
    rule: 'Hậu tố không ảnh hưởng (-ful, -less, -ness, -ship...)',
    description: 'Trọng âm giữ nguyên như từ gốc.',
    examples: [
      { word: 'beautiful', stressedWord: 'BEAU-ti-ful', meaning: 'đẹp đẽ' },
      { word: 'hopeless', stressedWord: 'HOPE-less', meaning: 'vô vọng' },
      { word: 'friendship', stressedWord: 'FRIEND-ship', meaning: 'tình bạn' }
    ]
  },
  {
    id: 'stress-9',
    rule: 'Danh từ ghép (Compound Nouns)',
    description: 'Trọng âm thường rơi vào danh từ đầu tiên.',
    examples: [
      { word: 'blackboard', stressedWord: 'BLACK-board', meaning: 'bảng đen' },
      { word: 'notebook', stressedWord: 'NOTE-book', meaning: 'vở ghi' },
      { word: 'haircut', stressedWord: 'HAIR-cut', meaning: 'cắt tóc' }
    ]
  },
  {
    id: 'stress-10',
    rule: 'Tính từ ghép (Compound Adjectives)',
    description: 'Trọng âm thường rơi vào thành phần thứ hai.',
    examples: [
      { word: 'bad-tempered', stressedWord: 'bad-TEM-pered', meaning: 'nóng tính' },
      { word: 'old-fashioned', stressedWord: 'old-FASH-ioned', meaning: 'lỗi thời' },
      { word: 'well-known', stressedWord: 'well-KNOWN', meaning: 'nổi tiếng' }
    ]
  },
  {
    id: 'stress-11',
    rule: 'Động từ ghép (Compound Verbs)',
    description: 'Trọng âm thường rơi vào thành phần thứ hai.',
    examples: [
      { word: 'understand', stressedWord: 'un-der-STAND', meaning: 'hiểu' },
      { word: 'overflow', stressedWord: 'o-ver-FLOW', meaning: 'tràn ra' },
      { word: 'overcook', stressedWord: 'o-ver-COOK', meaning: 'nấu quá chín' }
    ]
  },
  {
    id: 'stress-12',
    rule: 'Số đếm -teen vs -ty',
    description: '-teen nhấn âm tiết cuối, -ty nhấn âm tiết đầu.',
    examples: [
      { word: 'thirteen', stressedWord: 'thir-TEEN', meaning: '13' },
      { word: 'thirty', stressedWord: 'THIR-ty', meaning: '30' },
      { word: 'fifteen', stressedWord: 'fif-TEEN', meaning: '15' }
    ]
  },
  {
    id: 'stress-13',
    rule: 'Hậu tố -graphy, -logy',
    description: 'Nhấn vào âm tiết thứ 3 từ dưới lên.',
    examples: [
      { word: 'geography', stressedWord: 'ge-OG-ra-phy', meaning: 'địa lý' },
      { word: 'sociology', stressedWord: 'so-ci-OL-o-gy', meaning: 'xã hội học' },
      { word: 'archaeology', stressedWord: 'ar-chae-OL-o-gy', meaning: 'khảo cổ học' }
    ]
  },
  {
    id: 'stress-14',
    rule: 'Hậu tố -eous, -ious, -ia',
    description: 'Nhấn vào âm tiết ngay trước hậu tố.',
    examples: [
      { word: 'advantageous', stressedWord: 'ad-van-TA-geous', meaning: 'có lợi' },
      { word: 'mysterious', stressedWord: 'mys-TE-ri-ous', meaning: 'bí ẩn' },
      { word: 'bacteria', stressedWord: 'bac-TE-ri-a', meaning: 'vi khuẩn' }
    ]
  },
  {
    id: 'stress-15',
    rule: 'Tiền tố (Prefixes)',
    description: 'Hầu hết các tiền tố không nhận trọng âm.',
    examples: [
      { word: 'unimportant', stressedWord: 'un-im-POR-tant', meaning: 'không quan trọng' },
      { word: 'mislead', stressedWord: 'mis-LEAD', meaning: 'dẫn dắt sai' },
      { word: 'disagree', stressedWord: 'dis-a-GREE', meaning: 'không đồng ý' }
    ]
  },
  {
    id: 'stress-16',
    rule: 'Hậu tố -ian',
    description: 'Nhấn vào âm tiết ngay trước hậu tố.',
    examples: [
      { word: 'musician', stressedWord: 'mu-SI-cian', meaning: 'nhạc sĩ' },
      { word: 'politician', stressedWord: 'pol-i-TI-cian', meaning: 'chính trị gia' },
      { word: 'librarian', stressedWord: 'li-BRAR-i-an', meaning: 'thủ thư' }
    ]
  },
  {
    id: 'stress-17',
    rule: 'Từ chỉ phương hướng kết thúc bằng -ern',
    description: 'Nhấn vào âm tiết đầu tiên.',
    examples: [
      { word: 'northern', stressedWord: 'NORTH-ern', meaning: 'thuộc phương bắc' },
      { word: 'southern', stressedWord: 'SOUTH-ern', meaning: 'thuộc phương nam' },
      { word: 'western', stressedWord: 'WEST-ern', meaning: 'thuộc phương tây' }
    ]
  },
  {
    id: 'stress-18',
    rule: 'Hậu tố -itis (bệnh viêm)',
    description: 'Nhấn vào âm tiết t-i.',
    examples: [
      { word: 'appendicitis', stressedWord: 'ap-pen-di-CI-tis', meaning: 'viêm ruột thừa' },
      { word: 'gastritis', stressedWord: 'gas-TRI-tis', meaning: 'viêm dạ dày' },
      { word: 'bronchitis', stressedWord: 'bron-CHI-tis', meaning: 'viêm phế quản' }
    ]
  },
  {
    id: 'stress-19',
    rule: 'Hậu tố -esque',
    description: 'Nhấn vào chính hậu tố -esque.',
    examples: [
      { word: 'picturesque', stressedWord: 'pic-tur-ESQUE', meaning: 'đẹp như tranh' },
      { word: 'statuesque', stressedWord: 'stat-u-ESQUE', meaning: 'đẹp như tượng' },
      { word: 'Kafkaesque', stressedWord: 'Kaf-ka-ESQUE', meaning: 'như phong cách Kafka' }
    ]
  },
  {
    id: 'stress-20',
    rule: 'Hậu tố -aire',
    description: 'Nhấn vào chính hậu tố -aire.',
    examples: [
      { word: 'millionaire', stressedWord: 'mil-lion-AIRE', meaning: 'triệu phú' },
      { word: 'questionnaire', stressedWord: 'ques-tion-NAIRE', meaning: 'bản câu hỏi' },
      { word: 'billionaire', stressedWord: 'bil-lion-AIRE', meaning: 'tỷ phú' }
    ]
  }
];
