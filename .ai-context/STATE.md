# 🟢 CURRENT STATE

## Date: 2026-04-07

### Core Architecture & Auth
* **Appwrite Migration:** Successfully migrated off Appwrite authentication.
* **Proxy Auth Integration:** Implemented `loginWithProxy()` to use CLIProxyAPI bypass authentication.
* **Management API Access:** Fixed the locked Management API by updating `config.yaml` with the proper `secret-key` and configuring CORS correctly.

### Aura Voice & Chat Features (Latest Session)
* **Chat UI Redesign:** Replaced the small floating chat bubble with a full-width, clean, and modern glassmorphism panel in `AuraLiveChat.tsx` to ensure maximum readability of chat history alongside the Aura avatar.
* **TTS Optimization:** Refactored `ttsService.ts` to strictly prioritize and use native `Google UK English Female` (or fallback Google UK/US voices) via standard Web Speech API. 
* **Voice Consistency:** Completely stripped out the usage of robotic localized Microsoft voices (e.g., Microsoft An, Zira) to ensure consistent, natural sounding female delivery.
* **Persona Configuration:** Updated `FloatingAura.tsx` to inject a strict System Prompt: Aura now acts as an English tutor explicitly instructed to *listen* to Vietnamese (via STT) but *always respond* in English to enforce an immersive learning ecosystem.
* **Live API Investigation:** Analyzed the `Aura_assistant` codebase to trace the origin of its high-quality native Vietnamese voice. Concluded that `Aura_assistant` utilizes direct WebSocket bidirectional streams (`gemini-2.0-flash-native-audio-preview` via `@google/genai` SDK), whereas `aura-cli-proxy` operates purely via asynchronous Text-to-Text proxying over local port 8317.
