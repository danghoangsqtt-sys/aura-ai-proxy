import { useState, useRef, useEffect } from 'react';
import { LiveService } from '../services/liveService';
import { AudioRecorder, AudioPlayer } from '../utils/audioUtils';
import { AIConfigService } from '../services/aiConfigService';

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: number;
}

export const useGeminiLive = () => {
  const [connected, setConnected] = useState(false);
  const [volume, setVolume] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const liveServiceRef = useRef<LiveService | null>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const audioPlayerRef = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    return () => {
        disconnect();
    };
  }, []);

  const connect = async (instruction?: string) => {
    console.error("[useGeminiLive] -> [Auth Error]: Gemini Live is not supported via Proxy OAuth Bypass.");
    throw new Error("Tính năng Gemini Live (Voice 2-way Thời gian thực) tạm ngưng hỗ trợ qua kết nối Proxy.");

    try {
        // Initialize Audio Player for incoming audio
        audioPlayerRef.current = new AudioPlayer((vol) => {
            setVolume(vol);
            // Threshold for deciding if the AI is actively speaking (lip sync threshold)
            setIsSpeaking(vol > 0.05); 
        });

        // Initialize Live Service
        liveServiceRef.current = new LiveService('proxy_mode_disabled');
        liveServiceRef.current.onConnected = async () => {
            setConnected(true);
            
            try {
                // Start recording and sending audio once WS is open and setup is complete
                audioRecorderRef.current = new AudioRecorder();
                await audioRecorderRef.current.start((base64Data) => {
                    liveServiceRef.current?.sendAudio(base64Data);
                });
            } catch (micErr) {
                console.error('[useGeminiLive] -> [Audio Initialization Failed]:', micErr);
                disconnect();
            }
        };

        liveServiceRef.current.onDisconnected = () => {
            console.info('[useGeminiLive] -> [Status]: Disconnected from Gemini Live.');
            setConnected(false);
            stopAudio();
        };

        liveServiceRef.current.onError = (error) => {
            console.error('[useGeminiLive] -> [ERROR]: Gemini Live Service Error:', error);
            disconnect();
        };

        liveServiceRef.current.onMessage = (data) => {
            // Handle Model Responses (Text + Audio)
            if (data.serverContent?.modelTurn) {
                const parts = data.serverContent.modelTurn.parts;
                for (const part of parts) {
                    if (part.inlineData && part.inlineData.mimeType.startsWith('audio/pcm')) {
                        audioPlayerRef.current?.playPcm16Base64(part.inlineData.data);
                    }
                    if (part.text) {
                        console.info('[useGeminiLive] -> [AI Response]:', part.text);
                        setMessages(prev => {
                            const lastMsg = prev[prev.length - 1];
                            // If last message is from model, append text (Gemini sends in chunks)
                            if (lastMsg && lastMsg.role === 'model') {
                                return [...prev.slice(0, -1), { 
                                    ...lastMsg, 
                                    text: lastMsg.text + part.text,
                                    timestamp: Date.now() 
                                }];
                            }
                            // Otherwise, create new model message
                            return [...prev, { 
                                id: `model-${Date.now()}`, 
                                role: 'model', 
                                text: part.text, 
                                timestamp: Date.now() 
                            }];
                        });
                    }
                }
            }

            // Handle User Transcripts (Interim or Final)
            if (data.serverContent?.userTurn) {
                const parts = data.serverContent.userTurn.parts;
                for (const part of parts) {
                    if (part.text) {
                        console.info('[useGeminiLive] -> [User Transcript]:', part.text);
                        setMessages(prev => {
                            const lastMsg = prev[prev.length - 1];
                            if (lastMsg && lastMsg.role === 'user') {
                                return [...prev.slice(0, -1), { ...lastMsg, text: part.text, timestamp: Date.now() }];
                            }
                            return [...prev, { 
                                id: `user-${Date.now()}`, 
                                role: 'user', 
                                text: part.text, 
                                timestamp: Date.now() 
                            }];
                        });
                    }
                }
            }

            // Handle Setup or Error messages
            if (data.serverContent?.turnComplete) {
                console.info('[useGeminiLive] -> [Status]: Gemini model finished current turn.');
            }
        };

        // Start WS Connection
        liveServiceRef.current.connect(instruction);

    } catch (err) {
        console.error("[useGeminiLive] -> [Critical Error]:", err);
        disconnect();
    }
  };
  
  const stopAudio = () => {
      setIsSpeaking(false);
      setVolume(0);
      if (audioRecorderRef.current) {
          audioRecorderRef.current.stop();
          audioRecorderRef.current = null;
      }
      if (audioPlayerRef.current) {
          audioPlayerRef.current.stop();
          audioPlayerRef.current = null;
      }
  }

  const disconnect = () => {
     if (liveServiceRef.current) {
         liveServiceRef.current.disconnect();
         liveServiceRef.current = null;
     }
     stopAudio();
     setConnected(false);
  };

  return { connect, disconnect, connected, volume, isSpeaking, messages, setMessages };
};
