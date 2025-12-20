import { useState, useEffect, useCallback, useMemo } from 'react';
import { Header, InputPanel, CodePanel, Canvas, ControlPanel, WeChatFloat } from './components';
import { usePlaybackSpeed } from './hooks/usePlaybackSpeed';
import { generateAlgorithmSteps } from './utils/algorithmSteps';
import type { AlgorithmStep } from './types';
import './App.css';

const DEFAULT_INPUT = ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'];
const BASE_INTERVAL = 1000; // 基础间隔1秒

function App() {
  // 使用useMemo初始化steps，避免在effect中调用setState
  const initialSteps = useMemo(() => generateAlgorithmSteps(DEFAULT_INPUT), []);
  const [steps, setSteps] = useState<AlgorithmStep[]>(initialSteps);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = usePlaybackSpeed();

  // 自动播放
  useEffect(() => {
    if (!isPlaying || steps.length === 0) return;

    const interval = BASE_INTERVAL / playbackSpeed;
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, steps.length, playbackSpeed]);

  const handleRun = useCallback((strings: string[]) => {
    const newSteps = generateAlgorithmSteps(strings);
    setSteps(newSteps);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, []);

  const handlePrevious = useCallback(() => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
  }, [steps.length]);

  const handlePlayPause = useCallback(() => {
    if (currentStepIndex >= steps.length - 1) {
      // 如果已经到最后一步，重新开始
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  }, [currentStepIndex, steps.length]);

  const handleReset = useCallback(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, []);

  const handleSeek = useCallback((step: number) => {
    setCurrentStepIndex(step);
    setIsPlaying(false);
  }, []);

  const currentStep = steps[currentStepIndex] || null;

  return (
    <div className="app">
      <Header />
      <InputPanel onRun={handleRun} />
      
      <main className="main-content">
        <div className="code-section">
          <CodePanel currentStep={currentStep} />
        </div>
        <div className="canvas-section">
          <Canvas currentStep={currentStep} />
        </div>
      </main>

      <ControlPanel
        currentStep={currentStepIndex}
        totalSteps={steps.length}
        isPlaying={isPlaying}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onPlayPause={handlePlayPause}
        onReset={handleReset}
        onSeek={handleSeek}
        playbackSpeed={playbackSpeed}
        onSpeedChange={setPlaybackSpeed}
      />

      <WeChatFloat />
    </div>
  );
}

export default App;
