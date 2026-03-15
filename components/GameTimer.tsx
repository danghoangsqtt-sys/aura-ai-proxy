import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

interface GameTimerProps {
  initialValue: number;
  type: 'time' | 'hp';
  intervalMs: number;
  decrement: number;
  onEnd: () => void;
  className?: string;
  barColor?: string;
  showPercent?: boolean;
  showSeconds?: boolean;
}

export interface GameTimerHandle {
  reset: (newValue?: number) => void;
  getValue: () => number;
  addValue: (bonus: number) => void;
  stop: () => void;
}

const GameTimer = forwardRef<GameTimerHandle, GameTimerProps>(({ 
  initialValue, 
  type, 
  intervalMs, 
  decrement, 
  onEnd,
  className = "",
  barColor = "bg-yellow-400",
  showPercent = false,
  showSeconds = false
}, ref) => {
  const [value, setValue] = useState(initialValue);
  const timerRef = useRef<number | null>(null);
  const valueRef = useRef(initialValue);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = () => {
    stopTimer();
    timerRef.current = window.setInterval(() => {
      const nextValue = Math.max(0, valueRef.current - decrement);
      valueRef.current = nextValue;
      setValue(nextValue);

      if (nextValue <= 0) {
        stopTimer();
        onEnd();
      }
    }, intervalMs);
  };

  useImperativeHandle(ref, () => ({
    reset: (newValue) => {
      stopTimer();
      const val = newValue !== undefined ? newValue : initialValue;
      valueRef.current = val;
      setValue(val);
      startTimer();
    },
    getValue: () => valueRef.current,
    addValue: (bonus) => {
        const nextValue = Math.min(type === 'hp' ? 100 : initialValue * 2, valueRef.current + bonus);
        valueRef.current = nextValue;
        setValue(nextValue);
    },
    stop: () => stopTimer()
  }));

  useEffect(() => {
    startTimer();
    return () => {
      stopTimer();
      console.info('[Gamification] -> [Action]: Component unmounted. Timer cleared.');
    };
  }, []);

  const percentage = type === 'hp' ? value : (value / initialValue) * 100;

  return (
    <div className={`w-full ${className}`}>
        {/* Progress Bar Style */}
        <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/5 relative">
            <div 
                className={`h-full transition-all duration-75 rounded-full ${barColor}`}
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
        
        {/* Optional Overlays */}
        <div className="flex justify-between mt-1 px-1">
            {showPercent && (
                <span className={`text-[10px] font-black uppercase tracking-widest ${value < 30 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`}>
                    {Math.ceil(value)}%
                </span>
            )}
            {showSeconds && (
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">
                    {Math.ceil(value)}s
                </span>
            )}
        </div>
    </div>
  );
});

export default React.memo(GameTimer);
