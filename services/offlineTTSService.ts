/**
 * Offline Text-to-Speech Service using Web Speech API
 * Includes a lip-sync hack for Live2D volume simulation
 */

export class OfflineTTSService {
  private static instance: OfflineTTSService;
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private lipSyncInterval: any = null;

  private constructor() {
    this.synth = window.speechSynthesis;
    this.initVoices();
    // Some browsers need this event to populate voices
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => this.initVoices();
    }
  }

  public static getInstance(): OfflineTTSService {
    if (!OfflineTTSService.instance) {
      OfflineTTSService.instance = new OfflineTTSService();
    }
    return OfflineTTSService.instance;
  }

  private initVoices() {
    this.voices = this.synth.getVoices();
  }

  private pickFemaleVoice(lang: 'en' | 'vi'): SpeechSynthesisVoice | null {
    const all = this.voices;

    if (lang === 'vi') {
      // Priority: Google vi-VN female → any vi female → any vi
      return (
        all.find(v => v.lang.startsWith('vi') && v.name.toLowerCase().includes('google') && v.name.toLowerCase().includes('female')) ||
        all.find(v => v.lang.startsWith('vi') && v.name.toLowerCase().includes('google')) ||
        all.find(v => v.lang.startsWith('vi') && (v.name.toLowerCase().includes('female') || v.name.includes('HoaiMy'))) ||
        all.find(v => v.lang.startsWith('vi')) ||
        null
      );
    }

    // English: Google US English Female → Google UK Female → Zira/Female → any en
    return (
      all.find(v => v.lang.startsWith('en') && v.name === 'Google US English') ||
      all.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('google') && v.name.toLowerCase().includes('female')) ||
      all.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('google')) ||
      all.find(v => v.lang.startsWith('en') && (v.name.includes('Zira') || v.name.includes('Female') || v.name.includes('UK English Female'))) ||
      all.find(v => v.lang.startsWith('en')) ||
      null
    );
  }


  public stop() {
    this.synth.cancel();
    if (this.lipSyncInterval) {
      clearInterval(this.lipSyncInterval);
      this.lipSyncInterval = null;
    }
  }

  public speak(
    text: string, 
    onVolumeChange: (vol: number) => void, 
    onEnd: () => void
  ) {
    this.stop();

    if (!text.trim()) {
      onEnd();
      return;
    }

    // Detect language (simple check: if contains Vietnamese chars)
    const isVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(text);
    const voice = this.pickFemaleVoice(isVietnamese ? 'vi' : 'en');

    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) utterance.voice = voice;
    utterance.rate = 0.92; // Slightly slower for conversational pacing
    utterance.pitch = 1.08; // Pleasant female tone

    utterance.onstart = () => {
      // Lip-sync hack: random volume every 100ms
      this.lipSyncInterval = setInterval(() => {
        const fakeVol = Math.floor(Math.random() * 60) + 20; // 20 to 80
        onVolumeChange(fakeVol);
      }, 100);
    };

    utterance.onend = () => {
      if (this.lipSyncInterval) {
        clearInterval(this.lipSyncInterval);
        this.lipSyncInterval = null;
      }
      onVolumeChange(0);
      onEnd();
    };

    utterance.onerror = (err) => {
      console.error('TTS Error:', err);
      this.stop();
      onVolumeChange(0);
      onEnd();
    };

    this.synth.speak(utterance);
  }
}
