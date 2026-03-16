export interface Morpheme {
  id: string;
  type: 'prefix' | 'root' | 'suffix';
  morpheme: string;
  meaning: string;
  origin?: string;
  examples: { word: string; meaning: string; breakdown: string }[];
}

export const morphemesData: Morpheme[] = [
  // --- 30 PREFIXES ---
  {
    id: 'pre-1', type: 'prefix', morpheme: 'un-', meaning: 'Không, ngược lại (Not, opposite)', origin: 'Old English',
    examples: [
      { word: 'unhappy', meaning: 'không vui', breakdown: 'un + happy' },
      { word: 'unusual', meaning: 'bất thường', breakdown: 'un + usual' },
      { word: 'unbelievable', meaning: 'không thể tin được', breakdown: 'un + believ + able' }
    ]
  },
  {
    id: 'pre-2', type: 'prefix', morpheme: 're-', meaning: 'Lặp lại, trở lại (Again, back)', origin: 'Latin',
    examples: [
      { word: 'rewrite', meaning: 'viết lại', breakdown: 're + write' },
      { word: 'return', meaning: 'trở lại', breakdown: 're + turn' },
      { word: 'rebuild', meaning: 'xây dựng lại', breakdown: 're + build' }
    ]
  },
  {
    id: 'pre-3', type: 'prefix', morpheme: 'pre-', meaning: 'Trước (Before)', origin: 'Latin',
    examples: [
      { word: 'preview', meaning: 'xem trước', breakdown: 'pre + view' },
      { word: 'prepay', meaning: 'trả trước', breakdown: 'pre + pay' },
      { word: 'preheat', meaning: 'làm nóng trước', breakdown: 'pre + heat' }
    ]
  },
  {
    id: 'pre-4', type: 'prefix', morpheme: 'dis-', meaning: 'Không, phủ định, tách rời (Not, opposite, away)', origin: 'Latin',
    examples: [
      { word: 'disagree', meaning: 'không đồng ý', breakdown: 'dis + agree' },
      { word: 'disappear', meaning: 'biến mất', breakdown: 'dis + appear' },
      { word: 'disconnect', meaning: 'ngắt kết nối', breakdown: 'dis + connect' }
    ]
  },
  {
    id: 'pre-5', type: 'prefix', morpheme: 'anti-', meaning: 'Chống lại (Against)', origin: 'Greek',
    examples: [
      { word: 'antivirus', meaning: 'chống virus', breakdown: 'anti + virus' },
      { word: 'antisocial', meaning: 'khó gần', breakdown: 'anti + social' },
      { word: 'antibiotics', meaning: 'thuốc kháng sinh', breakdown: 'anti + bio + tics' }
    ]
  },
  {
    id: 'pre-6', type: 'prefix', morpheme: 'mis-', meaning: 'Sai, nhầm (Wrongly)', origin: 'Old English',
    examples: [
      { word: 'misunderstand', meaning: 'hiểu lầm', breakdown: 'mis + understand' },
      { word: 'misspell', meaning: 'viết sai chính tả', breakdown: 'mis + spell' },
      { word: 'mislead', meaning: 'dẫn dắt sai', breakdown: 'mis + lead' }
    ]
  },
  {
    id: 'pre-7', type: 'prefix', morpheme: 'in-', meaning: 'Không (Not - for adjectives)', origin: 'Latin',
    examples: [
      { word: 'incorrect', meaning: 'không đúng', breakdown: 'in + correct' },
      { word: 'invisible', meaning: 'vô hình', breakdown: 'in + vis + ible' },
      { word: 'injustice', meaning: 'sự bất công', breakdown: 'in + justice' }
    ]
  },
  {
    id: 'pre-8', type: 'prefix', morpheme: 'im-', meaning: 'Không (Not - before p, m, b)', origin: 'Latin',
    examples: [
      { word: 'impossible', meaning: 'không thể', breakdown: 'im + poss + ible' },
      { word: 'impatient', meaning: 'không kiên nhẫn', breakdown: 'im + patient' },
      { word: 'immortal', meaning: 'bất tử', breakdown: 'im + mort + al' }
    ]
  },
  {
    id: 'pre-9', type: 'prefix', morpheme: 'ir-', meaning: 'Không (Not - before r)', origin: 'Latin',
    examples: [
      { word: 'irregular', meaning: 'bất quy tắc', breakdown: 'ir + regular' },
      { word: 'irresponsible', meaning: 'vô trách nhiệm', breakdown: 'ir + respons + ible' },
      { word: 'irrelevant', meaning: 'không liên quan', breakdown: 'ir + relevant' }
    ]
  },
  {
    id: 'pre-10', type: 'prefix', morpheme: 'il-', meaning: 'Không (Not - before l)', origin: 'Latin',
    examples: [
      { word: 'illegal', meaning: 'bất hợp pháp', breakdown: 'il + legal' },
      { word: 'illiterate', meaning: 'mù chữ', breakdown: 'il + literate' },
      { word: 'illogical', meaning: 'không logic', breakdown: 'il + log + ical' }
    ]
  },
  {
    id: 'pre-11', type: 'prefix', morpheme: 'non-', meaning: 'Không (Not)', origin: 'Latin',
    examples: [
      { word: 'nonsense', meaning: 'vô lý', breakdown: 'non + sense' },
      { word: 'nonstop', meaning: 'không dừng', breakdown: 'non + stop' },
      { word: 'nonfiction', meaning: 'phi hư cấu', breakdown: 'non + fiction' }
    ]
  },
  {
    id: 'pre-12', type: 'prefix', morpheme: 'over-', meaning: 'Quá mức (Too much)', origin: 'Old English',
    examples: [
      { word: 'overcook', meaning: 'nấu quá chín', breakdown: 'over + cook' },
      { word: 'oversleep', meaning: 'ngủ quá giờ', breakdown: 'over + sleep' },
      { word: 'overwork', meaning: 'làm việc quá sức', breakdown: 'over + work' }
    ]
  },
  {
    id: 'pre-13', type: 'prefix', morpheme: 'under-', meaning: 'Dưới, không đủ (Under, below, not enough)', origin: 'Old English',
    examples: [
      { word: 'underground', meaning: 'dưới lòng đất', breakdown: 'under + ground' },
      { word: 'underestimate', meaning: 'đánh giá thấp', breakdown: 'under + estimate' },
      { word: 'underwater', meaning: 'dưới nước', breakdown: 'under + water' }
    ]
  },
  {
    id: 'pre-14', type: 'prefix', morpheme: 'sub-', meaning: 'Dưới (Under, below)', origin: 'Latin',
    examples: [
      { word: 'submarine', meaning: 'tàu ngầm', breakdown: 'sub + marine' },
      { word: 'subway', meaning: 'tàu điện ngầm', breakdown: 'sub + way' },
      { word: 'subtitle', meaning: 'phụ đề', breakdown: 'sub + title' }
    ]
  },
  {
    id: 'pre-15', type: 'prefix', morpheme: 'inter-', meaning: 'Giữa (Between)', origin: 'Latin',
    examples: [
      { word: 'international', meaning: 'quốc tế', breakdown: 'inter + nation + al' },
      { word: 'interaction', meaning: 'tương tác', breakdown: 'inter + act + ion' },
      { word: 'internet', meaning: 'mạng liên kết', breakdown: 'inter + net' }
    ]
  },
  {
    id: 'pre-16', type: 'prefix', morpheme: 'intra-', meaning: 'Bên trong (Inside, within)', origin: 'Latin',
    examples: [
      { word: 'intravenous', meaning: 'trong tĩnh mạch', breakdown: 'intra + ven + ous' },
      { word: 'intranet', meaning: 'mạng nội bộ', breakdown: 'intra + net' },
      { word: 'intracellular', meaning: 'trong tế bào', breakdown: 'intra + cell + ular' }
    ]
  },
  {
    id: 'pre-17', type: 'prefix', morpheme: 'semi-', meaning: 'Một nửa (Half, partly)', origin: 'Latin',
    examples: [
      { word: 'semicircle', meaning: 'hình bán nguyệt', breakdown: 'semi + circle' },
      { word: 'semifinal', meaning: 'bán kết', breakdown: 'semi + final' },
      { word: 'semiannual', meaning: 'nửa năm một lần', breakdown: 'semi + annu + al' }
    ]
  },
  {
    id: 'pre-18', type: 'prefix', morpheme: 'mono-', meaning: 'Một, đơn (One, single)', origin: 'Greek',
    examples: [
      { word: 'monologue', meaning: 'độc thoại', breakdown: 'mono + logue' },
      { word: 'monotone', meaning: 'đơn điệu', breakdown: 'mono + tone' },
      { word: 'monopoly', meaning: 'độc quyền', breakdown: 'mono + poly' }
    ]
  },
  {
    id: 'pre-19', type: 'prefix', morpheme: 'poly-', meaning: 'Nhiều (Many)', origin: 'Greek',
    examples: [
      { word: 'polygon', meaning: 'đa giác', breakdown: 'poly + gon' },
      { word: 'polyglot', meaning: 'người biết nhiều thứ tiếng', breakdown: 'poly + glot' },
      { word: 'polymer', meaning: 'polyme', breakdown: 'poly + mer' }
    ]
  },
  {
    id: 'pre-20', type: 'prefix', morpheme: 'multi-', meaning: 'Nhiều (Many, much)', origin: 'Latin',
    examples: [
      { word: 'multicultural', meaning: 'đa văn hóa', breakdown: 'multi + cultur + al' },
      { word: 'multimedia', meaning: 'đa phương tiện', breakdown: 'multi + media' },
      { word: 'multitask', meaning: 'đa nhiệm', breakdown: 'multi + task' }
    ]
  },
  {
    id: 'pre-21', type: 'prefix', morpheme: 'post-', meaning: 'Sau (After)', origin: 'Latin',
    examples: [
      { word: 'postpone', meaning: 'trì hoãn', breakdown: 'post + pone' },
      { word: 'postwar', meaning: 'hậu chiến', breakdown: 'post + war' },
      { word: 'postgraduate', meaning: 'sau đại học', breakdown: 'post + gradu + ate' }
    ]
  },
  {
    id: 'pre-22', type: 'prefix', morpheme: 'pro-', meaning: 'Về phía trước, ủng hộ (Forward, in favor of)', origin: 'Latin',
    examples: [
      { word: 'progress', meaning: 'tiến bộ', breakdown: 'pro + gress' },
      { word: 'promote', meaning: 'thúc đẩy', breakdown: 'pro + mote' },
      { word: 'pro-democracy', meaning: 'ủng hộ dân chủ', breakdown: 'pro + democracy' }
    ]
  },
  {
    id: 'pre-23', type: 'prefix', morpheme: 'contra-', meaning: 'Chống lại (Against)', origin: 'Latin',
    examples: [
      { word: 'contradict', meaning: 'mâu thuẫn', breakdown: 'contra + dict' },
      { word: 'contrast', meaning: 'đối chiếu', breakdown: 'contra + st' },
      { word: 'contrary', meaning: 'ngược lại', breakdown: 'contra + ry' }
    ]
  },
  {
    id: 'pre-24', type: 'prefix', morpheme: 'counter-', meaning: 'Ngược lại (Opposite, against)', origin: 'Latin',
    examples: [
      { word: 'counterattack', meaning: 'phản công', breakdown: 'counter + attack' },
      { word: 'counterpart', meaning: 'đối tác/bên tương ứng', breakdown: 'counter + part' },
      { word: 'counterclockwise', meaning: 'ngược chiều kim đồng hồ', breakdown: 'counter + clock + wise' }
    ]
  },
  {
    id: 'pre-25', type: 'prefix', morpheme: 'de-', meaning: 'Ngược lại, lấy đi (Opposite, remove)', origin: 'Latin',
    examples: [
      { word: 'dehumidify', meaning: 'hút ẩm', breakdown: 'de + humid + ify' },
      { word: 'deforestation', meaning: 'nạn phá rừng', breakdown: 'de + forest + ation' },
      { word: 'decrease', meaning: 'giảm bớt', breakdown: 'de + crease' }
    ]
  },
  {
    id: 'pre-26', type: 'prefix', morpheme: 'ex-', meaning: 'Ra ngoài, trước đây (Out of, former)', origin: 'Latin',
    examples: [
      { word: 'ex-boyfriend', meaning: 'bạn trai cũ', breakdown: 'ex + boyfriend' },
      { word: 'export', meaning: 'xuất khẩu', breakdown: 'ex + port' },
      { word: 'exclude', meaning: 'loại trừ', breakdown: 'ex + clude' }
    ]
  },
  {
    id: 'pre-27', type: 'prefix', morpheme: 'extra-', meaning: 'Vượt ra ngoài (Beyond, outside)', origin: 'Latin',
    examples: [
      { word: 'extraordinary', meaning: 'phi thường', breakdown: 'extra + ordinary' },
      { word: 'extravagant', meaning: 'xa hoa', breakdown: 'extra + vagant' },
      { word: 'extraterrestrial', meaning: 'ngoài trái đất', breakdown: 'extra + terrestri + al' }
    ]
  },
  {
    id: 'pre-28', type: 'prefix', morpheme: 'hyper-', meaning: 'Quá mức (Over, excessive)', origin: 'Greek',
    examples: [
      { word: 'hyperactive', meaning: 'tăng động', breakdown: 'hyper + active' },
      { word: 'hypersensitive', meaning: 'quá nhạy cảm', breakdown: 'hyper + sensitive' },
      { word: 'hyperlink', meaning: 'siêu liên kết', breakdown: 'hyper + link' }
    ]
  },
  {
    id: 'pre-29', type: 'prefix', morpheme: 'hypo-', meaning: 'Dưới, thiếu (Under, below)', origin: 'Greek',
    examples: [
      { word: 'hypothermia', meaning: 'hạ thân nhiệt', breakdown: 'hypo + therm + ia' },
      { word: 'hypodermic', meaning: 'dưới da', breakdown: 'hypo + derm + ic' },
      { word: 'hypothesis', meaning: 'giả thuyết', breakdown: 'hypo + thesis' }
    ]
  },
  {
    id: 'pre-30', type: 'prefix', morpheme: 'mega-', meaning: 'Lớn (Great, large)', origin: 'Greek',
    examples: [
      { word: 'megaphone', meaning: 'loa cầm tay', breakdown: 'mega + phone' },
      { word: 'megabyte', meaning: 'megabyte', breakdown: 'mega + byte' },
      { word: 'megacity', meaning: 'siêu đô thị', breakdown: 'mega + city' }
    ]
  },

  // --- 40 ROOTS ---
  {
    id: 'root-1', type: 'root', morpheme: 'port', meaning: 'Mang, vác (Carry)', origin: 'Latin',
    examples: [
      { word: 'transport', meaning: 'vận chuyển', breakdown: 'trans + port' },
      { word: 'portable', meaning: 'có thể mang đi', breakdown: 'port + able' },
      { word: 'import', meaning: 'nhập khẩu', breakdown: 'in + port' }
    ]
  },
  {
    id: 'root-2', type: 'root', morpheme: 'struct', meaning: 'Xây dựng (Build)', origin: 'Latin',
    examples: [
      { word: 'structure', meaning: 'cấu trúc', breakdown: 'struct + ure' },
      { word: 'construct', meaning: 'xây dựng', breakdown: 'con + struct' },
      { word: 'destruct', meaning: 'phá hủy', breakdown: 'de + struct' }
    ]
  },
  {
    id: 'root-3', type: 'root', morpheme: 'dict', meaning: 'Nói (Say)', origin: 'Latin',
    examples: [
      { word: 'predict', meaning: 'dự đoán', breakdown: 'pre + dict' },
      { word: 'dictionary', meaning: 'từ điển', breakdown: 'dict + ionary' },
      { word: 'verdict', meaning: 'lời tuyên án', breakdown: 'ver + dict' }
    ]
  },
  {
    id: 'root-4', type: 'root', morpheme: 'spect', meaning: 'Nhìn (Look)', origin: 'Latin',
    examples: [
      { word: 'inspect', meaning: 'kiểm tra', breakdown: 'in + spect' },
      { word: 'spectator', meaning: 'khán giả', breakdown: 'spect + ator' },
      { word: 'respect', meaning: 'tôn trọng', breakdown: 're + spect' }
    ]
  },
  {
    id: 'root-5', type: 'root', morpheme: 'bio', meaning: 'Sự sống (Life)', origin: 'Greek',
    examples: [
      { word: 'biology', meaning: 'sinh học', breakdown: 'bio + logy' },
      { word: 'biography', meaning: 'tiểu sử', breakdown: 'bio + graph + y' },
      { word: 'biosphere', meaning: 'sinh quyển', breakdown: 'bio + sphere' }
    ]
  },
  {
    id: 'root-6', type: 'root', morpheme: 'graph', meaning: 'Viết, vẽ (Write)', origin: 'Greek',
    examples: [
      { word: 'autograph', meaning: 'chữ ký', breakdown: 'auto + graph' },
      { word: 'paragraph', meaning: 'đoạn văn', breakdown: 'para + graph' },
      { word: 'geography', meaning: 'địa lý', breakdown: 'geo + graph + y' }
    ]
  },
  {
    id: 'root-7', type: 'root', morpheme: 'phon', meaning: 'Âm thanh (Sound)', origin: 'Greek',
    examples: [
      { word: 'telephone', meaning: 'điện thoại', breakdown: 'tele + phone' },
      { word: 'microphone', meaning: 'mi-crô', breakdown: 'micro + phone' },
      { word: 'symphony', meaning: 'giao hưởng', breakdown: 'sym + phony' }
    ]
  },
  {
    id: 'root-8', type: 'root', morpheme: 'chron', meaning: 'Thời gian (Time)', origin: 'Greek',
    examples: [
      { word: 'chronology', meaning: 'niên đại học', breakdown: 'chron + ology' },
      { word: 'chronic', meaning: 'mãn tính', breakdown: 'chron + ic' },
      { word: 'synchronize', meaning: 'đồng bộ hóa', breakdown: 'sync + hron + ize' }
    ]
  },
  {
    id: 'root-9', type: 'root', morpheme: 'geo', meaning: 'Trái đất (Earth)', origin: 'Greek',
    examples: [
      { word: 'geology', meaning: 'địa chất học', breakdown: 'geo + logy' },
      { word: 'geometry', meaning: 'hình học', breakdown: 'geo + metry' },
      { word: 'geothermal', meaning: 'địa nhiệt', breakdown: 'geo + therm + al' }
    ]
  },
  {
    id: 'root-10', type: 'root', morpheme: 'logy', meaning: 'Học thuyết, nghiên cứu (Study of)', origin: 'Greek',
    examples: [
      { word: 'psychology', meaning: 'tâm lý học', breakdown: 'psych + ology' },
      { word: 'sociology', meaning: 'xã hội học', breakdown: 'socio + logy' },
      { word: 'theology', meaning: 'thần học', breakdown: 'theo + logy' }
    ]
  },
  {
    id: 'root-11', type: 'root', morpheme: 'anthrop', meaning: 'Con người (Human)', origin: 'Greek',
    examples: [
      { word: 'anthropology', meaning: 'nhân chủng học', breakdown: 'anthrop + ology' },
      { word: 'philanthropy', meaning: 'lòng nhân từ', breakdown: 'phil + anthrop + y' },
      { word: 'misanthrope', meaning: 'người ghét loài người', breakdown: 'mis + anthrope' }
    ]
  },
  {
    id: 'root-12', type: 'root', morpheme: 'audi', meaning: 'Nghe (Hear)', origin: 'Latin',
    examples: [
      { word: 'audience', meaning: 'khán giả', breakdown: 'audi + ence' },
      { word: 'audible', meaning: 'có thể nghe thấy', breakdown: 'audi + ble' },
      { word: 'audio', meaning: 'âm thanh', breakdown: 'audi + o' }
    ]
  },
  {
    id: 'root-13', type: 'root', morpheme: 'bene', meaning: 'Tốt (Good, well)', origin: 'Latin',
    examples: [
      { word: 'benefit', meaning: 'lợi ích', breakdown: 'bene + fit' },
      { word: 'beneficent', meaning: 'hay giúp đỡ', breakdown: 'bene + ficent' },
      { word: 'benign', meaning: 'lành tính', breakdown: 'bene + ign' }
    ]
  },
  {
    id: 'root-14', type: 'root', morpheme: 'brev', meaning: 'Ngắn (Short)', origin: 'Latin',
    examples: [
      { word: 'brevity', meaning: 'sự ngắn gọn', breakdown: 'brev + ity' },
      { word: 'abbreviation', meaning: 'từ viết tắt', breakdown: 'ab + brev + iation' },
      { word: 'brief', meaning: 'ngắn gọn', breakdown: 'brev/brief' }
    ]
  },
  {
    id: 'root-15', type: 'root', morpheme: 'cap', meaning: 'Cầm, giữ (Take, hold)', origin: 'Latin',
    examples: [
      { word: 'capture', meaning: 'bắt giữ', breakdown: 'cap + ture' },
      { word: 'capable', meaning: 'có khả năng', breakdown: 'cap + able' },
      { word: 'capacity', meaning: 'sức chứa', breakdown: 'cap + acity' }
    ]
  },
  {
    id: 'root-16', type: 'root', morpheme: 'ced', meaning: 'Đi, nhường (Go, yield)', origin: 'Latin',
    examples: [
      { word: 'precede', meaning: 'đi trước', breakdown: 'pre + cede' },
      { word: 'recede', meaning: 'rút lui', breakdown: 're + cede' },
      { word: 'excess', meaning: 'sự dư thừa', breakdown: 'ex + cess' }
    ]
  },
  {
    id: 'root-17', type: 'root', morpheme: 'circum', meaning: 'Xung quanh (Around)', origin: 'Latin',
    examples: [
      { word: 'circumference', meaning: 'chu vi', breakdown: 'circum + ference' },
      { word: 'circumnavigate', meaning: 'đi vòng quanh', breakdown: 'circum + navigate' },
      { word: 'circumstance', meaning: 'hoàn cảnh', breakdown: 'circum + stance' }
    ]
  },
  {
    id: 'root-18', type: 'root', morpheme: 'cogn', meaning: 'Biết (Know)', origin: 'Latin',
    examples: [
      { word: 'recognize', meaning: 'nhận ra', breakdown: 're + cogn + ize' },
      { word: 'cognitive', meaning: 'nhận thức', breakdown: 'cogn + itive' },
      { word: 'incognito', meaning: 'ẩn danh', breakdown: 'in + cogn + ito' }
    ]
  },
  {
    id: 'root-19', type: 'root', morpheme: 'corp', meaning: 'Thân thể (Body)', origin: 'Latin',
    examples: [
      { word: 'corporation', meaning: 'tập đoàn', breakdown: 'corp + oration' },
      { word: 'corpse', meaning: 'xác chết', breakdown: 'corp + se' },
      { word: 'corpulent', meaning: 'béo tốt', breakdown: 'corp + ulent' }
    ]
  },
  {
    id: 'root-20', type: 'root', morpheme: 'cred', meaning: 'Tin tưởng (Believe)', origin: 'Latin',
    examples: [
      { word: 'credible', meaning: 'đáng tin', breakdown: 'cred + ible' },
      { word: 'credit', meaning: 'tín dụng', breakdown: 'cred + it' },
      { word: 'incredible', meaning: 'không thể tin được', breakdown: 'in + cred + ible' }
    ]
  },
  {
    id: 'root-21', type: 'root', morpheme: 'cycl', meaning: 'Vòng tròn (Circle, wheel)', origin: 'Greek',
    examples: [
      { word: 'bicycle', meaning: 'xe đạp', breakdown: 'bi + cycle' },
      { word: 'cyclone', meaning: 'lốc xoáy', breakdown: 'cycl + one' },
      { word: 'recycle', meaning: 'tái chế', breakdown: 're + cycle' }
    ]
  },
  {
    id: 'root-22', type: 'root', morpheme: 'dem', meaning: 'Nhân dân (People)', origin: 'Greek',
    examples: [
      { word: 'democracy', meaning: 'dân chủ', breakdown: 'dem + ocracy' },
      { word: 'epidemic', meaning: 'dịch bệnh', breakdown: 'epi + dem + ic' },
      { word: 'demographic', meaning: 'nhân khẩu học', breakdown: 'dem + o + graph + ic' }
    ]
  },
  {
    id: 'root-23', type: 'root', morpheme: 'dorm', meaning: 'Ngủ (Sleep)', origin: 'Latin',
    examples: [
      { word: 'dormitory', meaning: 'ký túc xá', breakdown: 'dorm + itory' },
      { word: 'dormant', meaning: 'ngủ đông/tiềm tàng', breakdown: 'dorm + ant' },
      { word: 'dormer', meaning: 'cửa sổ mái', breakdown: 'dorm + er' }
    ]
  },
  {
    id: 'root-24', type: 'root', morpheme: 'duct', meaning: 'Dẫn dắt (Lead)', origin: 'Latin',
    examples: [
      { word: 'conduct', meaning: 'hành vi/dẫn dắt', breakdown: 'con + duct' },
      { word: 'product', meaning: 'sản phẩm', breakdown: 'pro + duct' },
      { word: 'educate', meaning: 'giáo dục', breakdown: 'e + duc + ate' }
    ]
  },
  {
    id: 'root-25', type: 'root', morpheme: 'fac', meaning: 'Làm (Make, do)', origin: 'Latin',
    examples: [
      { word: 'factory', meaning: 'nhà máy', breakdown: 'fac + tory' },
      { word: 'manufacture', meaning: 'sản xuất', breakdown: 'manu + fac + ture' },
      { word: 'facilitate', meaning: 'tạo điều kiện', breakdown: 'fac + il + itate' }
    ]
  },
  {
    id: 'root-26', type: 'root', morpheme: 'fer', meaning: 'Mang, chuyển (Carry, bring)', origin: 'Latin',
    examples: [
      { word: 'transfer', meaning: 'chuyển nhượng', breakdown: 'trans + fer' },
      { word: 'offer', meaning: 'đưa ra lời mời', breakdown: 'of + fer' },
      { word: 'refer', meaning: 'tham khảo', breakdown: 're + fer' }
    ]
  },
  {
    id: 'root-27', type: 'root', morpheme: 'flex', meaning: 'Bẻ, cong (Bend)', origin: 'Latin',
    examples: [
      { word: 'flexible', meaning: 'linh hoạt', breakdown: 'flex + ible' },
      { word: 'reflex', meaning: 'phản xạ', breakdown: 're + flex' },
      { word: 'deflect', meaning: 'làm chệch hướng', breakdown: 'de + flect' }
    ]
  },
  {
    id: 'root-28', type: 'root', morpheme: 'form', meaning: 'Hình dáng (Shape)', origin: 'Latin',
    examples: [
      { word: 'format', meaning: 'định dạng', breakdown: 'form + at' },
      { word: 'conform', meaning: 'tuân theo', breakdown: 'con + form' },
      { word: 'reform', meaning: 'cải cách', breakdown: 're + form' }
    ]
  },
  {
    id: 'root-29', type: 'root', morpheme: 'gen', meaning: 'Sinh ra (Birth, origin)', origin: 'Greek',
    examples: [
      { word: 'generation', meaning: 'thế hệ', breakdown: 'gen + eration' },
      { word: 'genetics', meaning: 'di truyền học', breakdown: 'gen + etics' },
      { word: 'genesis', meaning: 'nguồn gốc', breakdown: 'gen + esis' }
    ]
  },
  {
    id: 'root-30', type: 'root', morpheme: 'gress', meaning: 'Bước đi (Step, go)', origin: 'Latin',
    examples: [
      { word: 'progress', meaning: 'tiến bộ', breakdown: 'pro + gress' },
      { word: 'aggressive', meaning: 'hung hăng', breakdown: 'ag + gress + ive' },
      { word: 'congress', meaning: 'quốc hội', breakdown: 'con + gress' }
    ]
  },
  {
    id: 'root-31', type: 'root', morpheme: 'ject', meaning: 'Ném (Throw)', origin: 'Latin',
    examples: [
      { word: 'reject', meaning: 'từ chối', breakdown: 're + ject' },
      { word: 'project', meaning: 'dự án/chiếu ra', breakdown: 'pro + ject' },
      { word: 'eject', meaning: 'đẩy ra', breakdown: 'e + ject' }
    ]
  },
  {
    id: 'root-32', type: 'root', morpheme: 'jur', meaning: 'Luật pháp (Law, swear)', origin: 'Latin',
    examples: [
      { word: 'jury', meaning: 'ban bồi thẩm', breakdown: 'jur + y' },
      { word: 'justice', meaning: 'công lý', breakdown: 'jus + tice' },
      { word: 'perjury', meaning: 'tội khai man', breakdown: 'per + jur + y' }
    ]
  },
  {
    id: 'root-33', type: 'root', morpheme: 'loc', meaning: 'Địa điểm (Place)', origin: 'Latin',
    examples: [
      { word: 'locate', meaning: 'xác định vị trí', breakdown: 'loc + ate' },
      { word: 'local', meaning: 'địa phương', breakdown: 'loc + al' },
      { word: 'allocate', meaning: 'phân bổ', breakdown: 'al + loc + ate' }
    ]
  },
  {
    id: 'root-34', type: 'root', morpheme: 'luc', meaning: 'Ánh sáng (Light)', origin: 'Latin',
    examples: [
      { word: 'lucid', meaning: 'sáng suốt/rõ ràng', breakdown: 'luc + id' },
      { word: 'translucent', meaning: 'bán trong suốt', breakdown: 'trans + luc + ent' },
      { word: 'illuminate', meaning: 'chiếu sáng', breakdown: 'il + lumin + ate' }
    ]
  },
  {
    id: 'root-35', type: 'root', morpheme: 'magn', meaning: 'Lớn (Great, large)', origin: 'Latin',
    examples: [
      { word: 'magnify', meaning: 'phóng đại', breakdown: 'magn + ify' },
      { word: 'magnificent', meaning: 'tráng lệ', breakdown: 'magn + ificent' },
      { word: 'magnitude', meaning: 'độ lớn', breakdown: 'magn + itude' }
    ]
  },
  {
    id: 'root-36', type: 'root', morpheme: 'mal', meaning: 'Xấu (Bad, evil)', origin: 'Latin',
    examples: [
      { word: 'malfunction', meaning: 'trục trặc', breakdown: 'mal + function' },
      { word: 'malevolent', meaning: 'hiểm độc', breakdown: 'mal + evolent' },
      { word: 'malnutrition', meaning: 'suy dinh dưỡng', breakdown: 'mal + nutrition' }
    ]
  },
  {
    id: 'root-37', type: 'root', morpheme: 'man', meaning: 'Tay (Hand)', origin: 'Latin',
    examples: [
      { word: 'manual', meaning: 'thủ công', breakdown: 'man + ual' },
      { word: 'manufacture', meaning: 'sản xuất', breakdown: 'manu + fac + ture' },
      { word: 'manuscript', meaning: 'bản thảo', breakdown: 'manu + script' }
    ]
  },
  {
    id: 'root-38', type: 'root', morpheme: 'mar', meaning: 'Biển (Sea)', origin: 'Latin',
    examples: [
      { word: 'marine', meaning: 'thuộc về biển', breakdown: 'mar + ine' },
      { word: 'submarine', meaning: 'tàu ngầm', breakdown: 'sub + marine' },
      { word: 'maritime', meaning: 'hàng hải', breakdown: 'mar + itime' }
    ]
  },
  {
    id: 'root-39', type: 'root', morpheme: 'mater', meaning: 'Mẹ (Mother)', origin: 'Latin',
    examples: [
      { word: 'maternal', meaning: 'thuộc về mẹ', breakdown: 'mater + nal' },
      { word: 'maternity', meaning: 'thai sản', breakdown: 'mater + nity' },
      { word: 'matriarch', meaning: 'nữ chúa', breakdown: 'matri + arch' }
    ]
  },
  {
    id: 'root-40', type: 'root', morpheme: 'path', meaning: 'Cảm xúc, chịu đựng (Feeling, suffering)', origin: 'Greek',
    examples: [
      { word: 'empathy', meaning: 'sự đồng cảm', breakdown: 'em + path + y' },
      { word: 'sympathy', meaning: 'sự cảm thông', breakdown: 'sym + path + y' },
      { word: 'apathy', meaning: 'sự thờ ơ', breakdown: 'a + path + y' }
    ]
  },

  // --- 30 SUFFIXES ---
  {
    id: 'suf-1', type: 'suffix', morpheme: '-able', meaning: 'Có thể (Can be done)', origin: 'Latin',
    examples: [
      { word: 'comfortable', meaning: 'thoải mái', breakdown: 'comfort + able' },
      { word: 'adaptable', meaning: 'có thể thích nghi', breakdown: 'adapt + able' },
      { word: 'manageable', meaning: 'có thể quản lý', breakdown: 'manage + able' }
    ]
  },
  {
    id: 'suf-2', type: 'suffix', morpheme: '-less', meaning: 'Không có (Without)', origin: 'Old English',
    examples: [
      { word: 'hopeless', meaning: 'vô vọng', breakdown: 'hope + less' },
      { word: 'careless', meaning: 'cẩu thả', breakdown: 'care + less' },
      { word: 'fearless', meaning: 'không sợ hãi', breakdown: 'fear + less' }
    ]
  },
  {
    id: 'suf-3', type: 'suffix', morpheme: '-ful', meaning: 'Đầy (Full of)', origin: 'Old English',
    examples: [
      { word: 'beautiful', meaning: 'đẹp đẽ', breakdown: 'beauty + ful' },
      { word: 'helpful', meaning: 'có ích', breakdown: 'help + ful' },
      { word: 'wonderful', meaning: 'tuyệt vời', breakdown: 'wonder + ful' }
    ]
  },
  {
    id: 'suf-4', type: 'suffix', morpheme: '-er', meaning: 'Người làm gì đó (Person who does)', origin: 'Old English',
    examples: [
      { word: 'teacher', meaning: 'giáo viên', breakdown: 'teach + er' },
      { word: 'dancer', meaning: 'vũ công', breakdown: 'dance + er' },
      { word: 'reader', meaning: 'độc giả', breakdown: 'read + er' }
    ]
  },
  {
    id: 'suf-5', type: 'suffix', morpheme: '-tion', meaning: 'Hành động, trạng thái (Act, state)', origin: 'Latin',
    examples: [
      { word: 'action', meaning: 'hành động', breakdown: 'act + ion' },
      { word: 'education', meaning: 'giáo dục', breakdown: 'educate + ion' },
      { word: 'creation', meaning: 'sự sáng tạo', breakdown: 'create + ion' }
    ]
  },
  {
    id: 'suf-6', type: 'suffix', morpheme: '-ment', meaning: 'Hành động, quá trình (Action, process)', origin: 'Latin',
    examples: [
      { word: 'enjoyment', meaning: 'sự tận hưởng', breakdown: 'enjoy + ment' },
      { word: 'development', meaning: 'sự phát triển', breakdown: 'develop + ment' },
      { word: 'agreement', meaning: 'sự đồng ý', breakdown: 'agree + ment' }
    ]
  },
  {
    id: 'suf-7', type: 'suffix', morpheme: '-ness', meaning: 'Trạng thái, tính chất (State, quality)', origin: 'Old English',
    examples: [
      { word: 'happiness', meaning: 'hạnh phúc', breakdown: 'happy + ness' },
      { word: 'kindness', meaning: 'sự tử tế', breakdown: 'kind + ness' },
      { word: 'weakness', meaning: 'điểm yếu', breakdown: 'weak + ness' }
    ]
  },
  {
    id: 'suf-8', type: 'suffix', morpheme: '-ity', meaning: 'Trạng thái, tính chất (State, quality)', origin: 'Latin',
    examples: [
      { word: 'priority', meaning: 'sự ưu tiên', breakdown: 'prior + ity' },
      { word: 'ability', meaning: 'khả năng', breakdown: 'able + ity' },
      { word: 'necessity', meaning: 'sự cần thiết', breakdown: 'necess + ity' }
    ]
  },
  {
    id: 'suf-9', type: 'suffix', morpheme: '-al', meaning: 'Liên quan đến (Related to)', origin: 'Latin',
    examples: [
      { word: 'natural', meaning: 'tự nhiên', breakdown: 'nature + al' },
      { word: 'musical', meaning: 'thuộc về âm nhạc', breakdown: 'music + al' },
      { word: 'global', meaning: 'toàn cầu', breakdown: 'globe + al' }
    ]
  },
  {
    id: 'suf-10', type: 'suffix', morpheme: '-ive', meaning: 'Có tính chất (Having quality of)', origin: 'Latin',
    examples: [
      { word: 'active', meaning: 'năng động', breakdown: 'act + ive' },
      { word: 'creative', meaning: 'sáng tạo', breakdown: 'create + ive' },
      { word: 'decisive', meaning: 'quyết đoán', breakdown: 'decide + ive' }
    ]
  },
  {
    id: 'suf-11', type: 'suffix', morpheme: '-ous', meaning: 'Đầy rẫy (Full of)', origin: 'Latin',
    examples: [
      { word: 'joyous', meaning: 'vui mừng', breakdown: 'joy + ous' },
      { word: 'dangerous', meaning: 'nguy hiểm', breakdown: 'danger + ous' },
      { word: 'famous', meaning: 'nổi tiếng', breakdown: 'fame + ous' }
    ]
  },
  {
    id: 'suf-12', type: 'suffix', morpheme: '-ize', meaning: 'Làm cho (To make)', origin: 'Greek',
    examples: [
      { word: 'modernize', meaning: 'hiện đại hóa', breakdown: 'modern + ize' },
      { word: 'visualize', meaning: 'hình dung', breakdown: 'visual + ize' },
      { word: 'organize', meaning: 'tổ chức', breakdown: 'organ + ize' }
    ]
  },
  {
    id: 'suf-13', type: 'suffix', morpheme: '-ify', meaning: 'Làm cho (To make)', origin: 'Latin',
    examples: [
      { word: 'justify', meaning: 'biện hộ', breakdown: 'just + ify' },
      { word: 'magnify', meaning: 'phóng đại', breakdown: 'magn + ify' },
      { word: 'simplify', meaning: 'đơn giản hóa', breakdown: 'simpl + ify' }
    ]
  },
  {
    id: 'suf-14', type: 'suffix', morpheme: '-ate', meaning: 'Làm cho (To make - verb)', origin: 'Latin',
    examples: [
      { word: 'activate', meaning: 'kích hoạt', breakdown: 'active + ate' },
      { word: 'calculate', meaning: 'tính toán', breakdown: 'calcul + ate' },
      { word: 'create', meaning: 'sáng tạo', breakdown: 'cre + ate' }
    ]
  },
  {
    id: 'suf-15', type: 'suffix', morpheme: '-en', meaning: 'Làm cho (To make)', origin: 'Old English',
    examples: [
      { word: 'soften', meaning: 'làm mềm', breakdown: 'soft + en' },
      { word: 'sharpen', meaning: 'mài sắc', breakdown: 'sharp + en' },
      { word: 'strengthen', meaning: 'làm mạnh thêm', breakdown: 'strength + en' }
    ]
  },
  {
    id: 'suf-16', type: 'suffix', morpheme: '-ic', meaning: 'Liên quan đến (Related to)', origin: 'Greek',
    examples: [
      { word: 'italic', meaning: 'chữ nghiêng', breakdown: 'ital + ic' },
      { word: 'energetic', meaning: 'năng lượng', breakdown: 'energy + tic' },
      { word: 'historic', meaning: 'mang tính lịch sử', breakdown: 'history + ic' }
    ]
  },
  {
    id: 'suf-17', type: 'suffix', morpheme: '-ish', meaning: 'Hơi hơi, có vẻ (Somewhat)', origin: 'Old English',
    examples: [
      { word: 'childish', meaning: 'trẻ con', breakdown: 'child + ish' },
      { word: 'reddish', meaning: 'hơi đỏ', breakdown: 'red + ish' },
      { word: 'selfish', meaning: 'ích kỷ', breakdown: 'self + ish' }
    ]
  },
  {
    id: 'suf-18', type: 'suffix', morpheme: '-ist', meaning: 'Người thực hiện/tin vào (Person who)', origin: 'Greek',
    examples: [
      { word: 'artist', meaning: 'nghệ sĩ', breakdown: 'art + ist' },
      { word: 'scientist', meaning: 'nhà khoa học', breakdown: 'science + ist' },
      { word: 'optimist', meaning: 'người lạc quan', breakdown: 'optim + ist' }
    ]
  },
  {
    id: 'suf-19', type: 'suffix', morpheme: '-ism', meaning: 'Học thuyết, niềm tin (Belief, theory)', origin: 'Greek',
    examples: [
      { word: 'optimism', meaning: 'sự lạc quan', breakdown: 'optim + ism' },
      { word: 'criticism', meaning: 'sự chỉ trích', breakdown: 'critic + ism' },
      { word: 'terrorism', meaning: 'chủ nghĩa khủng bố', breakdown: 'terror + ism' }
    ]
  },
  {
    id: 'suf-20', type: 'suffix', morpheme: '-ology', meaning: 'Nghiên cứu về (The study of)', origin: 'Greek',
    examples: [
      { word: 'biology', meaning: 'sinh học', breakdown: 'bio + logy' },
      { word: 'geology', meaning: 'địa chất học', breakdown: 'geo + logy' },
      { word: 'sociology', meaning: 'xã hội học', breakdown: 'socio + logy' }
    ]
  },
  {
    id: 'suf-21', type: 'suffix', morpheme: '-ance', meaning: 'Hành động, trạng thái (Action, state)', origin: 'Latin',
    examples: [
      { word: 'performance', meaning: 'buổi biểu diễn', breakdown: 'perform + ance' },
      { word: 'resistance', meaning: 'sự kháng cự', breakdown: 'resist + ance' },
      { word: 'appearance', meaning: 'ngoại hình', breakdown: 'appear + ance' }
    ]
  },
  {
    id: 'suf-22', type: 'suffix', morpheme: '-acy', meaning: 'Trạng thái, chất lượng (State, quality)', origin: 'Latin',
    examples: [
      { word: 'privacy', meaning: 'sự riêng tư', breakdown: 'priv + acy' },
      { word: 'accuracy', meaning: 'sự chính xác', breakdown: 'accur + acy' },
      { word: 'literacy', meaning: 'trình độ học vấn', breakdown: 'liter + acy' }
    ]
  },
  {
    id: 'suf-23', type: 'suffix', morpheme: '-dom', meaning: 'Trạng thái, lãnh thổ (State, realm)', origin: 'Old English',
    examples: [
      { word: 'freedom', meaning: 'tự do', breakdown: 'free + dom' },
      { word: 'wisdom', meaning: 'sự khôn ngoan', breakdown: 'wise + dom' },
      { word: 'kingdom', meaning: 'vương quốc', breakdown: 'king + dom' }
    ]
  },
  {
    id: 'suf-24', type: 'suffix', morpheme: '-hood', meaning: 'Trạng thái, nhóm (State, condition)', origin: 'Old English',
    examples: [
      { word: 'childhood', meaning: 'tuổi thơ', breakdown: 'child + hood' },
      { word: 'neighborhood', meaning: 'khu xóm', breakdown: 'neighbor + hood' },
      { word: 'brotherhood', meaning: 'tình anh em', breakdown: 'brother + hood' }
    ]
  },
  {
    id: 'suf-25', type: 'suffix', morpheme: '-ship', meaning: 'Tình trạng, vị thế (State, position)', origin: 'Old English',
    examples: [
      { word: 'friendship', meaning: 'tình bạn', breakdown: 'friend + ship' },
      { word: 'leadership', meaning: 'khả năng lãnh đạo', breakdown: 'leader + ship' },
      { word: 'ownership', meaning: 'quyền sở hữu', breakdown: 'owner + ship' }
    ]
  },
  {
    id: 'suf-26', type: 'suffix', morpheme: '-ward', meaning: 'Hướng về (In a direction)', origin: 'Old English',
    examples: [
      { word: 'forward', meaning: 'về phía trước', breakdown: 'for + ward' },
      { word: 'backward', meaning: 'về phía sau', breakdown: 'back + ward' },
      { word: 'homeward', meaning: 'về phía nhà', breakdown: 'home + ward' }
    ]
  },
  {
    id: 'suf-27', type: 'suffix', morpheme: '-wise', meaning: 'Theo hướng/cách (In a manner of)', origin: 'Old English',
    examples: [
      { word: 'clockwise', meaning: 'theo chiều kim đồng hồ', breakdown: 'clock + wise' },
      { word: 'otherwise', meaning: 'nếu không thì/cách khác', breakdown: 'other + wise' },
      { word: 'likewise', meaning: 'tương tự', breakdown: 'like + wise' }
    ]
  },
  {
    id: 'suf-28', type: 'suffix', morpheme: '-esque', meaning: 'Theo phong cách (In the style of)', origin: 'French',
    examples: [
      { word: 'picturesque', meaning: 'đẹp như tranh', breakdown: 'picture + esque' },
      { word: 'statuesque', meaning: 'đẹp như tượng', breakdown: 'statue + esque' },
      { word: 'Kafkaesque', meaning: 'như phong cách Kafka', breakdown: 'Kafka + esque' }
    ]
  },
  {
    id: 'suf-29', type: 'suffix', morpheme: '-ly', meaning: 'Một cách (In a manner of - adverb)', origin: 'Old English',
    examples: [
      { word: 'quickly', meaning: 'một cách nhanh chóng', breakdown: 'quick + ly' },
      { word: 'happily', meaning: 'một cách hạnh phúc', breakdown: 'happy + ly' },
      { word: 'slowly', meaning: 'một cách chậm chạp', breakdown: 'slow + ly' }
    ]
  },
  {
    id: 'suf-30', type: 'suffix', morpheme: '-ism', meaning: 'Niềm tin, học thuyết (System of belief)', origin: 'Greek',
    examples: [
      { word: 'capitalism', meaning: 'chủ nghĩa tư bản', breakdown: 'capital + ism' },
      { word: 'buddhism', meaning: 'phật giáo', breakdown: 'buddha + ism' },
      { word: 'socialism', meaning: 'chủ nghĩa xã hội', breakdown: 'social + ism' }
    ]
  }
];

console.info('[WordFormation] -> [Data]: Loaded', morphemesData.length, 'morphemes.');
