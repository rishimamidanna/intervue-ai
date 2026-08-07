"use client";

/**
 * components/interview/VoiceControls.tsx
 *
 * Voice input/output controls — scaffold only.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 *
 * TODO: Implement voice functionality using the useVoice() hook:
 *   - Speech-to-Text: populate AnswerInput textarea from microphone
 *   - Text-to-Speech: read questions aloud for accessibility
 *   - Push-to-talk or continuous listening mode
 *   - Visual audio level indicator during recording
 *
 * NOTE: No voice SDK is installed at this stage. Do not add paid
 *   voice APIs without team coordination.
 */

import { Button } from "@/components/ui/Button";

export function VoiceControls() {
  // TODO: Replace with useVoice() hook when voice is implemented
  const isListening = false;
  const isSupported = false;

  if (!isSupported) {
    return null; // Hide controls until voice is implemented
  }

  return (
    <div
      className="flex items-center gap-3"
      aria-label="Voice controls"
      role="group"
    >
      <Button
        id="voice-toggle-btn"
        variant="outline"
        size="sm"
        onClick={() => {
          // TODO: Toggle voice recording via useVoice()
        }}
        aria-pressed={isListening}
        aria-label={isListening ? "Stop recording" : "Start voice input"}
      >
        {isListening ? "⏹ Stop" : "🎤 Speak"}
      </Button>
    </div>
  );
}
