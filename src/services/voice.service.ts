'use client';

// Clean Gigi message for speech synthesis: remove [link:...], [option:...], emojis, markdown symbols
export function cleanTextForSpeech(text: string): string {
  if (!text) return '';
  return text
    .replace(/\[\s*link\s*:\s*[^\]]+?\]/g, '')
    .replace(/\[\s*option\s*:\s*([^\]]+?)\]/g, '')
    .replace(/[*_#`~>]/g, '')
    // remove some emojis that sound weird when read aloud by screen readers
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .trim();
}

export class GigiVoiceService {
  private static recognition: any = null;
  private static synth: SpeechSynthesis | null = null;
  private static selectedVoice: SpeechSynthesisVoice | null = null;

  // Initialize Speech Synthesis
  public static initSynth(): SpeechSynthesis | null {
    if (typeof window === 'undefined') return null;
    if (!this.synth && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadBestVoice();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadBestVoice();
      }
    }
    return this.synth;
  }

  private static loadBestVoice() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    if (!voices || voices.length === 0) return;

    // Prefer pleasant female English voices
    const preferredNames = [
      'Google UK English Female',
      'Google US English',
      'Microsoft Zira',
      'Microsoft Heera',
      'Samantha',
      'Karen',
      'Victoria',
      'Moira',
      'en-IN',
      'en-US',
      'en-GB'
    ];

    for (const name of preferredNames) {
      const found = voices.find(v => v.name.includes(name) || v.lang.includes(name));
      if (found) {
        this.selectedVoice = found;
        return;
      }
    }

    // Fallback to any English voice
    const anyEnglish = voices.find(v => v.lang.startsWith('en'));
    this.selectedVoice = anyEnglish || voices[0];
  }

  // Text-To-Speech: Speak text
  public static speak(text: string, onStart?: () => void, onEnd?: () => void): void {
    if (typeof window === 'undefined') return;
    const synth = this.initSynth();
    if (!synth) return;

    // Stop any ongoing speech first
    this.stopSpeaking();

    const cleaned = cleanTextForSpeech(text);
    if (!cleaned) {
      onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleaned);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.rate = 0.95; // Slightly slower for warm, clear big-sister tone
    utterance.pitch = 1.05; // Slightly upbeat & friendly

    utterance.onstart = () => {
      onStart?.();
    };

    utterance.onend = () => {
      onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn('[GigiVoice] Speech synthesis error:', e);
      onEnd?.();
    };

    synth.speak(utterance);
  }

  // Stop current speech
  public static stopSpeaking(): void {
    if (typeof window === 'undefined') return;
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
    }
  }

  public static isSpeaking(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(this.synth && this.synth.speaking);
  }

  // Speech-To-Text: Check support
  public static isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    return !!SpeechRecognition;
  }

  // Start Listening via Microphone
  public static startListening(callbacks: {
    onTranscript: (transcript: string, isFinal: boolean) => void;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }): () => void {
    if (typeof window === 'undefined') return () => {};
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      callbacks.onError?.('Speech recognition is not supported in this browser.');
      return () => {};
    }

    // Stop previous if active
    this.stopListening();

    try {
      const recognition = new SpeechRecognition();
      this.recognition = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Default to Indian English, compatible with global English

      recognition.onstart = () => {
        callbacks.onStart?.();
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          callbacks.onTranscript(final, true);
        } else if (interim) {
          callbacks.onTranscript(interim, false);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('[GigiVoice] Speech recognition error:', event.error);
        callbacks.onError?.(event.error);
        callbacks.onEnd?.();
      };

      recognition.onend = () => {
        callbacks.onEnd?.();
        this.recognition = null;
      };

      recognition.start();

      return () => this.stopListening();
    } catch (err) {
      console.warn('[GigiVoice] Failed to start speech recognition:', err);
      callbacks.onError?.(err);
      callbacks.onEnd?.();
      return () => {};
    }
  }

  // Stop speech recognition
  public static stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
      this.recognition = null;
    }
  }
}
