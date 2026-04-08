# 🐛 BUGS & NOTABLE EDGE CASES

## High Priority: Connection Refused / Port Confusion
* **ISSUE:** `net::ERR_CONNECTION_REFUSED` on `POST http://127.0.0.1:8317/v1/chat/completions`.
* **CAUSE & RESOLUTION:** The client app implicitly depends on the `CLIProxyAPI` Golang server running parallel to the React app. If the backend is dead or running on an incorrect port, all inference fails.
* **PORT DIFFERENTIATION:**
  * **Port 8317:** The CORE REST API endpoint for chat completions (`/v1/chat`). This is where inferences and payloads must be routed.
  * **Port 8316:** Default bound port for the internal PPROF debugger / alternate internal API metrics, depending on config. Under no circumstances should the client UI perform inferences against `8316`. Ensure `.env.local` strictly targets `http://127.0.0.1:8317`.

## Technical Notes & Edge Cases
* **Browser Sandbox Limitations:** The Web Speech API `TTS` logic expects the user environment to have `Google UK English Female` or equivalent installed natively (bundled by default in Chrome). Edge cases exist on Safari or strict Firefox where Google voices might be suppressed causing fallback. Handled generically via fallback to default OS english strings. 
* **Live Chat Obscurement:** With the migration to a full-width Live Chat panel, ensure on smaller viewports that the z-indexes keep the floating 3D/2D characters visible or gracefully pushed to the side, preventing UX blocking issues.
* **Autoplay Policies:** Ensure users interact with the DOM before TTS fires. The `waitForVoices` pattern in `ttsService.ts` relies on async resolution which is generally safe, but heavy STT to TTS loop ping-pong can sometimes get paused by Chrome's anti-autoplay policies if the tab is backgrounded.
