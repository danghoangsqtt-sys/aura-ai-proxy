/**
 * TTS Service — Web Speech API
 * Aura luôn nói TIẾNG ANH — Google UK English Female.
 * Người dùng nói tiếng Việt qua mic (STT) → Aura trả lời bằng tiếng Anh (TTS).
 * Google UK English Female có sẵn trên mọi Chrome — không cần cài thêm.
 */

const TARGET_VOICE_NAME = 'Google UK English Female';
const FALLBACK_VOICE_NAME = 'Google US English';

export class TTSService {
  private static instance: TTSService;
  private utterance: SpeechSynthesisUtterance | null = null;
  private onEndCallback: (() => void) | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  private constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const init = () => {
        const v = window.speechSynthesis.getVoices();
        if (v.length > 0) {
          this.voices = v;
          const auraVoice = this.getAuraVoice();
          console.log(`[TTS] Giọng Aura: ${auraVoice?.name ?? 'default'} (${auraVoice?.lang ?? '?'})`);
        }
      };
      init();
      window.speechSynthesis.onvoiceschanged = () => { init(); };
    }
  }

  public static getInstance(): TTSService {
    if (!TTSService.instance) {
      TTSService.instance = new TTSService();
    }
    return TTSService.instance;
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  /** Giọng Aura: Google UK English Female → Google US English → any Google en */
  private getAuraVoice(): SpeechSynthesisVoice | null {
    const all = this.voices.length > 0 ? this.voices : window.speechSynthesis.getVoices();
    const google = all.filter(v => v.name.toLowerCase().includes('google'));

    return (
      google.find(v => v.name === TARGET_VOICE_NAME) ||
      google.find(v => v.name === FALLBACK_VOICE_NAME) ||
      google.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female')) ||
      google.find(v => v.lang.startsWith('en')) ||
      null // không dùng Microsoft
    );
  }

  private waitForVoices(): Promise<SpeechSynthesisVoice[]> {
    return new Promise((resolve) => {
      if (this.voices.length > 0) { resolve(this.voices); return; }
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) { this.voices = v; resolve(v); return; }
      let attempts = 0;
      const id = setInterval(() => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0 || ++attempts >= 20) {
          clearInterval(id);
          if (voices.length > 0) this.voices = voices;
          resolve(this.voices);
        }
      }, 100);
    });
  }

  /**
   * Aura nói tiếng Anh — Google UK English Female.
   */
  public async speak(
    text: string,
    onVolume?: (vol: number) => void,
    onEnd?: () => void
  ): Promise<void> {
    if (!this.isSupported()) {
      onEnd?.();
      return;
    }

    this.stop();

    const clean = this.cleanMarkdown(text);
    if (!clean.trim()) {
      onEnd?.();
      return;
    }

    await this.waitForVoices();
    const voice = this.getAuraVoice();

    this.onEndCallback = onEnd || null;
    this.utterance = new SpeechSynthesisUtterance(clean);

    if (voice) {
      this.utterance.voice = voice;
      this.utterance.lang = voice.lang;
    } else {
      this.utterance.lang = 'en-GB';
    }

    // Giọng Aura: tươi vui, thân thiện, pitch nữ tính
    this.utterance.rate  = 0.92;
    this.utterance.pitch = 1.15;
    this.utterance.volume = 1.0;

    this.utterance.onstart = () => onVolume?.(100);

    this.utterance.onend = () => {
      onVolume?.(0);
      this.onEndCallback?.();
      this.onEndCallback = null;
      this.utterance = null;
    };

    this.utterance.onerror = (e) => {
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.error('[TTS] error:', e.error);
      }
      onVolume?.(0);
      this.onEndCallback?.();
      this.onEndCallback = null;
      this.utterance = null;
    };

    window.speechSynthesis.speak(this.utterance);
  }

  public stop(): void {
    if (!this.isSupported()) return;
    window.speechSynthesis.cancel();
    this.onEndCallback = null;
    this.utterance = null;
  }

  public isSpeaking(): boolean {
    return this.isSupported() && window.speechSynthesis.speaking;
  }

  private cleanMarkdown(text: string): string {
    return text
      .replace(/```[\s\S]*?```/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/^[-*+]\s+/gm, '')
      .replace(/^\d+\.\s+/gm, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\n{2,}/g, '. ')
      .trim();
  }
}
