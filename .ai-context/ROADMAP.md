# 🗺️ ROADMAP

## Immediate Next Steps (Tomorrow's Session)

1. **E2E Manual Testing:**
   * Run comprehensive end-to-end manual flows on `localhost:5173`.
   * Test the Aura microphone STT capture (speaking Vietnamese) and ensuring the resulting TTS playback correctly uses the English engine.

2. **Verify API Flow:**
   * Validate the `geminiService` chat completion REST flow running through the local CLIProxyAPI (`http://127.0.0.1:8317/v1/chat/completions`). Ensure no tokens or connections are dropped during extended continuous speech.

3. **Technical Debt & Cleanup:**
   * Scour the repository to clean up and remove any residual, dead Appwrite authentication code / configuration files that are no longer utilized following the migration to bypass proxy auth.
   * Address IDE linting complaints (e.g., migrating inline CSS styles in `AuraLiveChat.tsx` and `VocabArena.tsx` to CSS/Tailwind classes). Add missing `title` attributes for accessibility.

4. **Future Architecture Consideration:**
   * Decide if `aura-cli-proxy` should eventually support direct WebSocket bindings to align with the advanced Native Audio capabilities seen in the `Aura_assistant` standalone app. This would require backend Golang development on `CLIProxyAPI` to handle the `BidiGenerateContent` WebSocket proxying.
