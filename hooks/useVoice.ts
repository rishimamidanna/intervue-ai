"use client";

/**
 * hooks/useVoice.ts
 *
 * Voice input/output hook — scaffold only.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 *
 * TODO: Implement voice functionality:
 *   - Speech-to-Text: use Web Speech API (SpeechRecognition) as a free option
 *     or integrate a paid STT provider via VOICE_API_KEY
 *   - Text-to-Speech: use Web Speech API (SpeechSynthesis) for TTS
 *   - Manage microphone permissions
 *   - Provide transcript to AnswerInput via onTranscript callback
 *   - Provide speak() function for reading questions aloud
 *
 * NOTE: No paid voice SDK is installed. Coordinate with the team before
 *   adding external voice dependencies.
 */

export interface UseVoiceReturn {
  /** Whether voice input is actively recording */
  isListening: boolean;
  /** Whether voice output (TTS) is speaking */
  isSpeaking: boolean;
  /** Whether the browser supports the required voice APIs */
  isSupported: boolean;
  /** Starts listening for voice input */
  startListening: () => void;
  /** Stops listening for voice input */
  stopListening: () => void;
  /** Reads the provided text aloud */
  speak: (text: string) => void;
  /** Stops any ongoing TTS speech */
  stopSpeaking: () => void;
}

/**
 * Manages browser voice input/output (scaffold).
 *
 * @returns UseVoiceReturn — voice state and control functions
 */
export function useVoice(): UseVoiceReturn {
  // TODO: Implement real voice functionality using Web Speech API or SDK
  return {
    isListening: false,
    isSpeaking: false,
    isSupported: false,
    startListening: () => {
      // TODO: Implement SpeechRecognition.start()
    },
    stopListening: () => {
      // TODO: Implement SpeechRecognition.stop()
    },
    speak: (text: string) => {
      // TODO: Implement SpeechSynthesis.speak()
      void text;
    },
    stopSpeaking: () => {
      // TODO: Implement SpeechSynthesis.cancel()
    },
  };
}
