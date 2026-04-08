/**
 * STT Service (Speech to Text) — Web Speech API
 * Uses the browser's built-in SpeechRecognition engine.
 * No external server, no MediaRecorder, no port 8001.
 * Continuous interim results + final transcript on stop.
 */


export class STTService {
  private static instance: STTService;
  private recognition: any | null = null;
  private isListening: boolean = false;
  private lang: string = 'vi-VN';

  // Mic volume metering (still uses AudioContext, independent of recognition)
  private audioStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private volumeAnimFrame: number | null = null;
  private onVolumeCallback: ((volume: number) => void) | null = null;

  private constructor() {}

  public static getInstance(): STTService {
    if (!STTService.instance) {
      STTService.instance = new STTService();
    }
    return STTService.instance;
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' &&
      !!(( window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public setLanguage(lang: string) {
    this.lang = lang;
    if (this.recognition) this.recognition.lang = lang;
  }

  public startListening(
    onResult: (text: string, isFinal: boolean) => void,
    onEnd: () => void,
    onError?: (err: any) => void,
    onVolume?: (volume: number) => void
  ) {
    if (this.isListening) return;

    if (!this.isSupported()) {
      onError?.('Web Speech API không được hỗ trợ trên trình duyệt này.');
      onEnd?.();
      return;
    }

    this.onVolumeCallback = onVolume || null;

    const SpeechRecognitionImpl =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    this.recognition = new SpeechRecognitionImpl();
    this.recognition.lang = this.lang;
    this.recognition.continuous = false;      // stop after one utterance
    this.recognition.interimResults = true;   // stream partial results
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      this.isListening = true;
      console.log('[STT] SpeechRecognition started, lang:', this.lang);
      // Start volume metering in parallel
      this.startVolumeMeter();
    };

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let finalText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcript;
        } else {
          interim += transcript;
        }
      }

      if (finalText) {
        onResult(finalText.trim(), true);
      } else if (interim) {
        onResult(interim.trim(), false);
      }
    };

    this.recognition.onend = () => {
      console.log('[STT] SpeechRecognition ended.');
      this.stopVolumeMeter();
      this.isListening = false;
      this.recognition = null;
      onEnd();
    };

    this.recognition.onerror = (event: any) => {
      const ignored = ['no-speech', 'aborted'];
      if (ignored.includes(event.error)) {
        console.log('[STT] Ignored error:', event.error);
        return;
      }
      console.error('[STT] Error:', event.error);
      this.stopVolumeMeter();
      this.isListening = false;
      onError?.(event.error);
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.error('[STT] Failed to start recognition:', e);
      onError?.(e);
      onEnd();
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      console.log('[STT] Stopping recognition...');
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
    this.stopVolumeMeter();
  }

  // ── Mic Volume Metering ────────────────────────────────────────────────────

  private async startVolumeMeter() {
    if (!this.onVolumeCallback) return;
    try {
      this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;

      const source = this.audioContext.createMediaStreamSource(this.audioStream);
      source.connect(this.analyser);

      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      const tick = () => {
        if (!this.analyser || !this.onVolumeCallback) return;
        this.analyser.getByteTimeDomainData(dataArray);
        let sumSquares = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const n = (dataArray[i] - 128) / 128;
          sumSquares += n * n;
        }
        const rms = Math.sqrt(sumSquares / dataArray.length);
        this.onVolumeCallback(Math.min(100, Math.floor(rms * 500)));
        this.volumeAnimFrame = requestAnimationFrame(tick);
      };
      tick();
    } catch (e) {
      console.warn('[STT] Volume metering unavailable:', e);
    }
  }

  private stopVolumeMeter() {
    if (this.volumeAnimFrame) {
      cancelAnimationFrame(this.volumeAnimFrame);
      this.volumeAnimFrame = null;
    }
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    this.analyser = null;
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(t => t.stop());
      this.audioStream = null;
    }
    this.onVolumeCallback?.(0);
  }
}
