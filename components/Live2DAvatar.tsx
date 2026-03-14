import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { AppMode, EyeState } from '../types';

interface Live2DAvatarProps {
  state: EyeState;
  mode: AppMode;
  volume: number;
  modelUrl?: string;
}

const Live2DAvatar: React.FC<Live2DAvatarProps> = ({ state, mode, volume, modelUrl }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const modelRef = useRef<any>(null); // Use any for model type since we removed the NPM package
  const isInitialized = useRef<boolean>(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  const defaultModelUrl = "https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/haru/haru_greeter_t03.model3.json";
  const urlToLoad = modelUrl || defaultModelUrl;

  const volumeRef = useRef(volume);
  const stateRef = useRef(state);
  
  useEffect(() => {
      volumeRef.current = volume;
      stateRef.current = state;
  }, [volume, state]);

  useEffect(() => {
    if (isInitialized.current || !containerRef.current) return;
    isInitialized.current = true;
    let isMounted = true;

    // 1. Expose PIXI globally for the CDN script
    (window as any).PIXI = PIXI;

    // 2. Helper function to load the CDN script
    const loadLive2DScript = () => {
      return new Promise<void>((resolve, reject) => {
        // If already loaded by another instance
        if ((window as any).PIXI.live2d) {
          resolve();
          return;
        }

        const scriptId = 'pixi-live2d-display-script';
        let script = document.getElementById(scriptId) as HTMLScriptElement;

        if (script) {
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load pixi-live2d-display from CDN"));
          return;
        }

        // CRITICAL: Ensure runtimes are available before loading plugin
        if (!(window as any).Live2D || !(window as any).Live2DCubismCore) {
           console.warn("Runtimes missing from window. Checking again in 500ms...");
           setTimeout(() => {
              if (!(window as any).Live2D || !(window as any).Live2DCubismCore) {
                reject(new Error("Live2D Runtimes (Cubism 2/4) missing. Check index.html script tags."));
                return;
              }
              loadPlugin();
           }, 500);
        } else {
           loadPlugin();
        }

        function loadPlugin() {
          script = document.createElement('script');
          script.id = scriptId;
          // Using 0.5.0-beta.7 which is tested with PIXI v7
          script.src = "https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.5.0-beta.7/dist/index.min.js";
          
          script.onload = () => {
            // Polling for PIXI.live2d
            let attempts = 0;
            const interval = setInterval(() => {
                attempts++;
                if ((window as any).PIXI.live2d && (window as any).PIXI.live2d.Live2DModel) {
                   clearInterval(interval);
                   resolve();
                } else if (attempts > 20) {
                   clearInterval(interval);
                   reject(new Error("PIXI.live2d.Live2DModel failed to initialize after 2 seconds"));
                }
            }, 100);
          };
          
          script.onerror = () => reject(new Error("Failed to load pixi-live2d-display from CDN"));
          document.body.appendChild(script);
        }
      });
    };

    // 3. Initialize App and Load Model
    loadLive2DScript().then(() => {
      if (!isMounted) return;

      const app = new PIXI.Application({
        resizeTo: containerRef.current!,
        backgroundAlpha: 0,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });
      
      const canvas = app.view as HTMLCanvasElement;
      canvas.style.pointerEvents = 'none'; // Critical fix for InteractionManager bugs
      
      appRef.current = app;
      containerRef.current!.appendChild(canvas);
      setStatus('loading');

      if (!(window as any).PIXI.live2d || !(window as any).PIXI.live2d.Live2DModel) {
          throw new Error("PIXI.live2d.Live2DModel is undefined");
      }

      const Live2DModel = (window as any).PIXI.live2d.Live2DModel;

      Live2DModel.from(urlToLoad).then((model: any) => {
        if (!isMounted) {
          model.destroy();
          return;
        }
        
        model.interactive = false;
        if (model.internalModel) {
             model.internalModel.interactive = false;
        }

        modelRef.current = model;
        app.stage.addChild(model);

        // Responsive Fitting
        const fitModel = () => {
          if (!containerRef.current) return;
          const internalAny = model.internalModel;
          const modelWidth = internalAny.width || 1;
          const modelHeight = internalAny.height || 1;
          const containerWidth = containerRef.current.clientWidth;
          const containerHeight = containerRef.current.clientHeight;

          const targetScaleY = (containerHeight / modelHeight) * 2.0; 
          const targetScaleX = (containerWidth / modelWidth) * 1.1;
          const scale = Math.max(targetScaleX, targetScaleY);
          
          model.scale.set(scale);
          model.x = (containerWidth - modelWidth * scale) / 2;
          model.y = containerHeight * 0.05;
        };

        fitModel();
        setStatus('ready');

      }).catch((err: any) => {
        console.error('Failed to load Live2D model:', err);
        if (isMounted) setStatus('error');
      });

    }).catch((err) => {
      console.error(err);
      if (isMounted) setStatus('error');
    });

    return () => {
      isMounted = false;
      isInitialized.current = false;
      
      if (modelRef.current) {
         modelRef.current.destroy();
         modelRef.current = null;
      }
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true, baseTexture: true });
        appRef.current = null;
      }
      if (containerRef.current) {
          containerRef.current.innerHTML = '';
      }
    };
  }, [urlToLoad]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-auto" />
      {status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
      )}
      {status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4 text-center">
             <span className="text-red-500 text-sm bg-red-500/10 px-3 py-1.5 rounded border border-red-500/20">
               Lỗi tải mô hình Live2D
             </span>
          </div>
      )}
    </div>
  );
};

export default Live2DAvatar;
