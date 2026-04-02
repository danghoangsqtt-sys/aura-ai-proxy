/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║          IPA VIDEO MAP — Hướng dẫn phát âm 44 âm         ║
 * ╠═══════════════════════════════════════════════════════════╣
 * ║  Hỗ trợ: YouTube, Google Drive, hoặc bất kỳ URL nào      ║
 * ║                                                           ║
 * ║  CÁCH THÊM VIDEO:                                         ║
 * ║  1. Copy link YouTube hoặc Google Drive                   ║
 * ║  2. Paste vào trường `url` của âm tương ứng               ║
 * ║  3. Lưu file → Video hiển thị ngay trên web               ║
 * ║                                                           ║
 * ║  VÍ DỤ LINK HỢP LỆ:                                      ║
 * ║  • YouTube:  https://www.youtube.com/watch?v=XXXXX        ║
 * ║  • YouTube:  https://youtu.be/XXXXX                       ║
 * ║  • Drive:    https://drive.google.com/file/d/XXXXX/view   ║
 * ╚═══════════════════════════════════════════════════════════╝
 */

interface IPAVideo {
  /** Tên âm hiển thị (để dễ đọc) */
  label: string;
  /** Paste link YouTube hoặc Google Drive vào đây */
  url: string;
}

// ══════════════════════════════════════════════════════════════
//  NGUYÊN ÂM ĐƠN — MONOPHTHONGS (12 âm)
// ══════════════════════════════════════════════════════════════
const MONOPHTHONGS: Record<string, IPAVideo> = {
  'iː': { label: 'iː — sheep, eagle',     url: 'https://drive.google.com/file/d/1NHclM1068gHX-eSq1lsbY-6sEPJE2Lo7/view?usp=sharing' },
  'ɪ':  { label: 'ɪ  — ship, fish',        url: 'https://drive.google.com/file/d/1ShNGxNZzL27MqTlmQRoYJuFKp4CcF0MD/view?usp=sharing' },
  'ʊ':  { label: 'ʊ  — good, put',         url: 'https://drive.google.com/file/d/1YNQrECKWXRuevR-FWpTb4kVKibOLwtLq/view?usp=sharing' },
  'uː': { label: 'uː — shoot, blue',      url: 'https://drive.google.com/file/d/1s89O9B5V2HuEDEBrpYBYshcbgfhVwGyL/view?usp=sharing&t=12' },
  'e':  { label: 'e  — bed, head',         url: 'https://drive.google.com/file/d/1ABuLs6VnKWMgGmUX0wP88pFysV9dYL39/view?usp=sharing' },
  'ə':  { label: 'ə  — teacher, about',    url: 'https://drive.google.com/file/d/1H2oZEXr_YLA8E9ToiQ9hb-Wi_Gojg6-_/view?usp=sharing' },
  'ɜː': { label: 'ɜː — bird, work',       url: 'https://drive.google.com/file/d/1QcELUdjrPX6jc-9HKlKk9Fpy_raKLpKr/view?usp=sharing' },
  'ɔː': { label: 'ɔː — door, more',       url: 'https://drive.google.com/file/d/1VVtywUKxUDE1OZ-_ek1sAxFww2jRYCzT/view?usp=sharing' },
  'æ':  { label: 'æ  — cat, apple',        url: 'https://drive.google.com/file/d/1k8Qg55dLOzmtf0_eORZB4OIqaQfJsILN/view?usp=sharing' },
  'ʌ':  { label: 'ʌ  — up, cup',           url: 'https://drive.google.com/file/d/1FCBH9u7hDXKukojTXNafwM9r4ylUKe76/view?usp=sharing' },
  'ɑː': { label: 'ɑː — car, father',      url: 'https://drive.google.com/file/d/1-vNZEevGmQFIeQJsL4H3Xd1aAECa4Wb3/view?usp=sharing' },
  'ɒ':  { label: 'ɒ  — hot, stop',         url: 'https://drive.google.com/file/d/12QAxWb9NaDSBn1siounYurfLF34gCzuc/view?usp=sharing' },
};

// ══════════════════════════════════════════════════════════════
//  NGUYÊN ÂM ĐÔI — DIPHTHONGS (8 âm)
// ══════════════════════════════════════════════════════════════
const DIPHTHONGS: Record<string, IPAVideo> = {
  'ɪə': { label: 'ɪə — here, near',       url: 'https://drive.google.com/file/d/1K08VPrviM7zza-rkuRm2WAZ9aCZbQzFe/view?usp=sharing' },
  'eɪ': { label: 'eɪ — wait, day',         url: 'https://drive.google.com/file/d/1xkKosCOSlLva6Ngc5Q52rcmIBKpqWJfP/view?usp=sharing' },
  'ɔɪ': { label: 'ɔɪ — boy, coin',         url: 'https://drive.google.com/file/d/11KPgyHo1QVSRnRcLygVipSHTsIJiulFE/view?usp=sharing' },
  'aɪ': { label: 'aɪ — my, sight',         url: 'https://drive.google.com/file/d/1I3OMm4Lz3m-ZN0wHcfPDpWBFafraUtvC/view?usp=sharing' },
  'eə': { label: 'eə — hair, there',       url: 'https://drive.google.com/file/d/1RqGeahZmAzbsTN59WG4B6rxZl2oknmv_/view?usp=sharing' },
  'əʊ': { label: 'əʊ — show, no',          url: 'https://drive.google.com/file/d/1d_VPTTUnRdDQsgt0HJCoXah6UG8Uf0k0/view?usp=sharing' },
  'aʊ': { label: 'aʊ — cow, house',        url: 'https://drive.google.com/file/d/1ESzq5Qz7Bp3BUYPWKfhBerFXSLm-ISL6/view?usp=sharing' },
  'ʊə': { label: 'ʊə — tour, poor',       url: 'https://drive.google.com/file/d/1j6nm-1_Ano3MyW0vT-9LuqqTdYY4pF72/view?usp=sharing' },
};

// ══════════════════════════════════════════════════════════════
//  PHỤ ÂM — CONSONANTS (24 âm)
// ══════════════════════════════════════════════════════════════
const CONSONANTS: Record<string, IPAVideo> = {
  // Plosives (Âm tắc)
  'p':  { label: 'p  — pen, copy',         url: 'https://drive.google.com/file/d/1RBur7A2QkfYrcpPkTNtkNHGUHzEfI362/view?usp=sharing' },
  'b':  { label: 'b  — back, baby',        url: 'https://drive.google.com/file/d/1jJLbT3nc3LwoGbzN-ZOXGknw7VVMmy47/view?usp=sharing' },
  't':  { label: 't  — tea, tight',        url: 'https://drive.google.com/file/d/1mSzcP7SBua665ZOn34izcTTAPIlFvyGi/view?usp=sharing' },
  'd':  { label: 'd  — day, ladder',       url: 'https://drive.google.com/file/d/1oFr_3Oue45kMKYgDq1MJq96qRcNEH2K0/view?usp=sharing' },
  'k':  { label: 'k  — key, clock',        url: 'https://drive.google.com/file/d/1K54QsT4sWcesxd1PGcWXUeHkELcTxlKF/view?usp=sharing' },
  'g':  { label: 'g  — get, giggle',       url: 'https://drive.google.com/file/d/1zpUUmDySxC1hBe0rqoZFiC4oiyzUUavt/view?usp=sharing' },

  // Fricatives (Âm xát)
  'f':  { label: 'f  — fat, coffee',       url: 'https://drive.google.com/file/d/1KA6uoJJ9_CwtbQtyUC0fXkqj__yXwwez/view?usp=sharing' },
  'v':  { label: 'v  — view, heavy',       url: 'https://drive.google.com/file/d/1yn-5Avhep7F-BmQX5VV02hyjsY3jIu6A/view?usp=sharing' },
  'θ':  { label: 'θ  — think, both',       url: 'https://drive.google.com/file/d/1NR9J56DGQVrF_0HNH29Rzl2-_aHkN21U/view?usp=sharing' },
  'ð':  { label: 'ð  — this, mother',      url: 'https://drive.google.com/file/d/12uzjBTDXCQWtb6ZA68OR7OsO06NZmpqc/view?usp=sharing' },
  's':  { label: 's  — soon, sister',      url: 'https://drive.google.com/file/d/1Lg5fHLMccP0tkOWqryfe-MfxA4bQpmmv/view?usp=sharing' },
  'z':  { label: 'z  — zero, music',       url: 'https://drive.google.com/file/d/18ezR_o0IY_42-2SVEM-sa-WDgiZCqOBK/view?usp=sharing' },
  'ʃ':  { label: 'ʃ  — she, crash',        url: 'https://drive.google.com/file/d/1DxqNJRfblBtiVQCscZB4ldY_1NprSKh8/view?usp=sharing' },
  'ʒ':  { label: 'ʒ  — pleasure, vision',  url: 'https://drive.google.com/file/d/1BKacjX9ijkdZzwP23N6G_P5bayEkpO2Q/view?usp=sharing' },
  'h':  { label: 'h  — hot, whole',        url: 'https://drive.google.com/file/d/1I3vG_dNFjgvvC3sA-acb_pJ-8QaErdPY/view?usp=sharing' },

  // Affricates (Âm tắc-xát)
  'tʃ': { label: 'tʃ — church, match',     url: 'https://drive.google.com/file/d/1q8ySKc_Cvb9opuxjqM-PKh2Bx2UM8jOA/view?usp=sharing' },
  'dʒ': { label: 'dʒ — judge, age',        url: 'https://drive.google.com/file/d/11osUL76pCK5rOVzSrAyj2RRvx5huxJVO/view?usp=sharing' },

  // Nasals (Âm mũi)
  'm':  { label: 'm  — more, hammer',      url: 'https://drive.google.com/file/d/1CVXmzjjQDVX7GrP0_cXdus2bJ19wU9jt/view?usp=sharing' },
  'n':  { label: 'n  — nice, funny',       url: 'https://drive.google.com/file/d/1UueRHW2GPFG0qemUyGKlsQZTX1Njh-qC/view?usp=sharing' },
  'ŋ':  { label: 'ŋ  — ring, anger',       url: 'https://drive.google.com/file/d/1aL1UvfxxWGVaquEgZSMaw-jHVK9i9q-j/view?usp=sharing' },

  // Approximants (Âm tiếp cận)
  'l':  { label: 'l  — light, valley',     url: 'https://drive.google.com/file/d/1lSACMo8rL1W_bQ6TjYeyISig-CSqIpQn/view?usp=sharing' },
  'r':  { label: 'r  — right, wrong',      url: 'https://drive.google.com/file/d/12vxfYdX1oKhTTUt_9Ryj_MdjRMqfJSfh/view?usp=sharing' },
  'j':  { label: 'j  — yet, use',          url: 'https://drive.google.com/file/d/1qIdiGAifq3Nrm9SvGyyhxe19-I2G_kYL/view?usp=sharing' },
  'w':  { label: 'w  — wet, one',          url: 'https://drive.google.com/file/d/1Hnxuk4jZnUY23n7WyX3P_hQ2scBrWTIF/view?usp=sharing' },
};

// ══════════════════════════════════════════════════════════════
//  HỆ THỐNG — Không cần chỉnh sửa phần dưới đây
// ══════════════════════════════════════════════════════════════

/** Gộp tất cả videos */
const ipaVideoMap: Record<string, IPAVideo> = {
  ...MONOPHTHONGS,
  ...DIPHTHONGS,
  ...CONSONANTS,
};

/**
 * Tự động chuyển link YouTube/Drive thành embed URL
 */
function toEmbedUrl(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // YouTube: youtube.com/watch?v=ID hoặc youtu.be/ID
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/
  );
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }

  // Google Drive: drive.google.com/file/d/ID/...
  const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (driveMatch) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  }

  // Nếu đã là embed URL hoặc URL khác → trả về nguyên
  return trimmed;
}

/**
 * Lấy embed URL cho một âm IPA
 * @returns embed URL hoặc null nếu chưa có video
 */
export function getVideoEmbedUrl(symbol: string): string | null {
  const entry = ipaVideoMap[symbol];
  if (!entry || !entry.url) return null;
  return toEmbedUrl(entry.url);
}

/**
 * Kiểm tra âm IPA có video chưa
 */
export function hasVideo(symbol: string): boolean {
  const entry = ipaVideoMap[symbol];
  return !!(entry && entry.url);
}

export default ipaVideoMap;
