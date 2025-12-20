import { useEffect, useCallback } from 'react';
import './ControlPanel.css';

interface ControlPanelProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onPlayPause: () => void;
  onReset: () => void;
  onSeek: (step: number) => void;
}

export function ControlPanel({
  currentStep,
  totalSteps,
  isPlaying,
  onPrevious,
  onNext,
  onPlayPause,
  onReset,
  onSeek,
}: ControlPanelProps) {
  // 键盘快捷键
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // 忽略输入框中的按键
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        onPrevious();
        break;
      case 'ArrowRight':
        e.preventDefault();
        onNext();
        break;
      case ' ':
        e.preventDefault();
        onPlayPause();
        break;
    }
  }, [onPrevious, onNext, onPlayPause]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const progress = totalSteps > 0 ? (currentStep / (totalSteps - 1)) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const step = Math.round(percentage * (totalSteps - 1));
    onSeek(Math.max(0, Math.min(totalSteps - 1, step)));
  };

  const handleProgressDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.buttons !== 1) return;
    handleProgressClick(e);
  };

  return (
    <div className="control-panel">
      <div className="controls-row">
        <div className="control-buttons">
          <button 
            className="control-button" 
            onClick={onReset}
            title="重置"
          >
            <span className="button-icon">⟲</span>
            <span className="button-text">重置</span>
          </button>
          
          <button 
            className="control-button" 
            onClick={onPrevious}
            disabled={currentStep <= 0}
            title="上一步 (←)"
          >
            <span className="button-icon">◀</span>
            <span className="button-text">上一步</span>
            <span className="shortcut-hint">←</span>
          </button>
          
          <button 
            className="control-button play-button" 
            onClick={onPlayPause}
            title={isPlaying ? '暂停 (空格)' : '播放 (空格)'}
          >
            <span className="button-icon">{isPlaying ? '⏸' : '▶'}</span>
            <span className="button-text">{isPlaying ? '暂停' : '播放'}</span>
            <span className="shortcut-hint">空格</span>
          </button>
          
          <button 
            className="control-button" 
            onClick={onNext}
            disabled={currentStep >= totalSteps - 1}
            title="下一步 (→)"
          >
            <span className="button-icon">▶</span>
            <span className="button-text">下一步</span>
            <span className="shortcut-hint">→</span>
          </button>
        </div>

        <div className="step-indicator">
          {currentStep + 1} / {totalSteps}
        </div>
      </div>

      <div 
        className="progress-bar-container"
        onClick={handleProgressClick}
        onMouseMove={handleProgressDrag}
      >
        <div 
          className="progress-bar-fill" 
          style={{ width: `${progress}%` }}
        />
        <div 
          className="progress-bar-handle"
          style={{ left: `${progress}%` }}
        />
      </div>
    </div>
  );
}
