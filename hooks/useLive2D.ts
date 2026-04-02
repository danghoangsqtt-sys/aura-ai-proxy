import { useEffect, useRef, useState, useCallback } from 'react';
import * as PIXI from 'pixi.js';
import { EyeState } from '../types';

// CRITICAL: Bind PIXI to window globally BEFORE Live2DModel is used.
// This is required for pixi-live2d-display to work in an ESM environment.
(window as any).PIXI = PIXI;

interface UseLive2DOptions {
  containerRef: React.RefObject<HTMLDivElement>;
  modelUrl: string;
  volume: number;
  state: EyeState;
}

interface Live2DState {
  status: 'loading' | 'ready' | 'error';
  error?: string;
}

/**
 * Custom hook to manage PIXI Application and Live2D Model lifecycle using NPM modules.
 */
export const useLive2D = ({ containerRef, modelUrl, volume, state }: UseLive2DOptions) => {
  const [live2DState, setLive2DState] = useState<Live2DState>({ status: 'loading' });
  const appRef = useRef<PIXI.Application | null>(null);
  const modelRef = useRef<any>(null);
  const isInitialized = useRef<boolean>(false);

  const volumeRef = useRef(volume);
  const stateRef = useRef(state);

  // Sync refs for internal callbacks
  useEffect(() => {
    volumeRef.current = volume;
    stateRef.current = state;
  }, [volume, state]);

  const fitModel = useCallback(() => {
    if (!containerRef.current || !modelRef.current) return;
    
    const model = modelRef.current;
    const internalModel = model.internalModel;
    const modelWidth = internalModel.width || 1;
    const modelHeight = internalModel.height || 1;
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    // More balanced scaling logic
    const scaleY = containerHeight / modelHeight;
    const scaleX = containerWidth / modelWidth;
    const scale = Math.min(scaleX, scaleY) * 0.95; // Slightly smaller for safe margins
    
    model.scale.set(scale);
    
    // Center horizontally
    model.x = (containerWidth - modelWidth * scale) / 2;
    
    // Position vertically (slightly above bottom to show the face clearly)
    model.y = containerHeight * 0.1; 
  }, [containerRef]);

  useEffect(() => {
    if (isInitialized.current || !containerRef.current) return;
    isInitialized.current = true;
    let isMounted = true;

    const waitForScripts = (maxRetries = 50): Promise<void> => {
      return new Promise((resolve, reject) => {
        let retries = 0;
        const check = () => {
          if ((window as any).Live2DCubismCore) {
            resolve();
          } else if (retries < maxRetries) {
            retries++;
            requestAnimationFrame(check);
          } else {
            reject(new Error("External Live2D scripts failed to load in time."));
          }
        };
        check();
      });
    };

    const init = async () => {
      try {
        console.info('[Live2D Engine] -> [Action]: Waiting for external PIXI/Live2D scripts...');
        await waitForScripts();

        // Dynamically import the plugin to ensure window.PIXI is set
        const { Live2DModel } = await import('pixi-live2d-display');

        if (!isMounted || !containerRef.current) return;

        const app = new PIXI.Application({
          view: document.createElement('canvas'),
          resizeTo: containerRef.current,
          transparent: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
          antialias: true,
          powerPreference: 'high-performance'
        });

        // Ensure the view is a canvas
        const canvas = app.view as HTMLCanvasElement;
        canvas.style.pointerEvents = 'none';

        appRef.current = app;
        containerRef.current.appendChild(canvas);

        const model = await Live2DModel.from(modelUrl);

        if (!isMounted) {
          model.destroy();
          app.destroy(true, { children: true, texture: true, baseTexture: true });
          return;
        }

        (model as any).interactive = false;
        if (model.internalModel) {
          (model.internalModel as any).interactive = false;
        }

        modelRef.current = model;
        (app.stage as any).addChild(model);
        
        fitModel();

        // 4. Interaction - Mouse Tracking
        const handleMouseMove = (e: MouseEvent) => {
          if (!containerRef.current || !modelRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          modelRef.current.focus(x, y);
        };
        window.addEventListener('mousemove', handleMouseMove);
        (model as any)._cleanupMouseMove = () => {
          window.removeEventListener('mousemove', handleMouseMove);
        };

        // 5. Lip-Sync Logic
        let currentOpen = 0;
        const lipSyncUpdate = () => {
          const coreModel = model.internalModel?.coreModel;
          if (!coreModel) return;

          const vol = volumeRef.current;
          let targetOpen = 0;
          
          if (stateRef.current === EyeState.SPEAKING || vol > 0.05) {
            targetOpen = vol > 1.0 ? Math.min(1.0, vol / 60.0) : Math.min(1.0, vol * 5.0);
          }

          currentOpen += (targetOpen - currentOpen) * 0.4;

          if (currentOpen > 0.01 || targetOpen === 0) {
            const m = coreModel as any;
            if (typeof m.setParameterValueById === 'function') {
              m.setParameterValueById('ParamMouthOpenY', currentOpen);
              m.setParameterValueById('PARAM_MOUTH_OPEN_Y', currentOpen);
            } else if (typeof m.setParamFloat === 'function') {
              m.setParamFloat('PARAM_MOUTH_OPEN_Y', currentOpen);
            }
          }
        };

        (model.internalModel as any).on('beforeModelUpdate', lipSyncUpdate);
        (model as any)._cleanupLipSync = () => {
          (model.internalModel as any).off('beforeModelUpdate', lipSyncUpdate);
        };

        if (isMounted) {
            console.info('[Live2D Engine] -> [Success]: Avatar loaded and rendered.');
            setLive2DState({ status: 'ready' });
        }

      } catch (err: any) {
        console.error('[Live2D Engine] -> [ERROR]: Failed to initialize avatar', err);
        if (isMounted) setLive2DState({ status: 'error', error: err.message });
      }
    };

    init();

    return () => {
      console.info('[Live2D Engine] -> [Action]: Destroying WebGL context and releasing GPU memory.');
      isMounted = false;
      isInitialized.current = false;

      // 1. Destroy Model
      if (modelRef.current) {
        if (modelRef.current._cleanupMouseMove) modelRef.current._cleanupMouseMove();
        if (modelRef.current._cleanupLipSync) modelRef.current._cleanupLipSync();
        modelRef.current.destroy({ children: true, texture: true, baseTexture: true });
        modelRef.current = null;
      }

      // 2. Destroy Pixi App strictly
      if (appRef.current) {
        appRef.current.stop();
        appRef.current.destroy(true, { children: true, texture: true, baseTexture: true });
        appRef.current = null;
      }

      // 3. Force global Pixi cache cleanup to avoid WebGL context leakage
      try {
        PIXI.utils.clearTextureCache();
        PIXI.utils.destroyTextureCache();
      } catch (e) {
        console.warn('[Live2D Engine] -> Cleanup warning:', e);
      }
    };
  }, [modelUrl, containerRef, fitModel]);

  // Handle manual resize
  useEffect(() => {
    const handleResize = () => fitModel();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fitModel]);

  return live2DState;
};
