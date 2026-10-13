import { useEffect, useCallback, useState, useRef } from 'react';
import { savePlaybackSpeed, SPEED_OPTIONS } from '../../utils/playbackSpeed';
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
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
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
  playbackSpeed,
  onSpeedChange,
}: ControlPanelProps) {
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverStep, setHoverStep] = useState<number | null>(null);
  const speedMenuRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

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
      case 'r':
      case 'R':
        e.preventDefault();
        onReset();
        break;
    }
  }, [onPrevious, onNext, onPlayPause, onReset]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // 点击外部关闭速度菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(e.target as Node)) {
        setShowSpeedMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const progress = totalSteps > 0 ? (currentStep / (totalSteps - 1)) * 100 : 0;

  // 从鼠标位置计算步骤
  const getStepFromEvent = useCallback((clientX: number): number | null => {
    if (!progressRef.current || totalSteps <= 1) return null;
    const rect = progressRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    return Math.round(percentage * (totalSteps - 1));
  }, [totalSteps]);

  // 真拖拽：mousedown → window mousemove → window mouseup
  const handleProgressMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const step = getStepFromEvent(e.clientX);
    if (step !== null) {
      setIsDragging(true);
      onSeek(step);
    }
  }, [getStepFromEvent, onSeek]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const step = getStepFromEvent(e.clientX);
      if (step !== null) onSeek(step);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'grabbing';

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
    };
  }, [isDragging, getStepFromEvent, onSeek]);

  // 悬停预览
  const handleProgressHover = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;
    setHoverStep(getStepFromEvent(e.clientX));
  }, [isDragging, getStepFromEvent]);

  const handleSpeedSelect = async (speed: number) => {
    onSpeedChange(speed);
    await savePlaybackSpeed(speed);
    setShowSpeedMenu(false);
  };

  // 少量刻度提示整体进度，避免每个算法微步骤都堆成一排噪点
  const markerPositions = totalSteps > 1
    ? [0, 0.25, 0.5, 0.75, 1].map((ratio) => Math.round(ratio * (totalSteps - 1)))
    : [0];
  const uniqueMarkerPositions = [...new Set(markerPositions)];

  const tooltipStep = isDragging ? currentStep : hoverStep;
  const tooltipLeft = progress;

  return (
    <div className="control-panel">
      <div className="controls-row">
        <div className="control-buttons">
          <button
            className="control-button"
            onClick={onReset}
            title="重置 (R)"
          >
            <span className="button-icon">⟲</span>
            <span className="button-text">重置</span>
            <span className="shortcut-hint">R</span>
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

          <div className="speed-control" ref={speedMenuRef}>
            <button
              className="control-button speed-button"
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              title="播放速度"
            >
              <span className="button-icon">⚡</span>
              <span className="button-text">{playbackSpeed}x</span>
            </button>
            {showSpeedMenu && (
              <div className="speed-menu">
                {SPEED_OPTIONS.map((speed) => (
                  <button
                    key={speed}
                    className={`speed-option ${playbackSpeed === speed ? 'active' : ''}`}
                    onClick={() => handleSpeedSelect(speed)}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={`step-indicator ${isPlaying ? 'playing' : ''}`}>
          {currentStep + 1} / {totalSteps}
          {isPlaying && <span className="playing-dot" />}
        </div>
      </div>

      <div
        className={`progress-bar-container ${isDragging ? 'dragging' : ''}`}
        ref={progressRef}
        onMouseDown={handleProgressMouseDown}
        onMouseMove={handleProgressHover}
        onMouseLeave={() => setHoverStep(null)}
      >
        {/* 轨道 */}
        <div className="progress-track" />

        {/* 已完成填充（渐变+流动动画） */}
        <div
          className={`progress-bar-fill ${isPlaying ? 'flowing' : ''}`}
          style={{ width: `${progress}%` }}
        />

        {/* 阶段刻度 */}
        {uniqueMarkerPositions.map((step) => (
          <span
            key={step}
            className={`progress-node ${step <= currentStep ? 'done' : ''} ${step === currentStep ? 'current' : ''}`}
            style={{ left: `${(step / Math.max(totalSteps - 1, 1)) * 100}%` }}
          />
        ))}

        {/* 手柄 */}
        <div
          className={`progress-bar-handle ${isDragging ? 'dragging' : ''}`}
          style={{ left: `${progress}%` }}
        />

        {/* Tooltip 气泡 */}
        {tooltipStep !== null && (
          <div
            className={`progress-tooltip ${isDragging ? 'dragging' : ''}`}
            style={{ left: `${tooltipLeft}%` }}
          >
            <span className="tooltip-step">{tooltipStep + 1}</span>
            <span className="tooltip-divider">/</span>
            <span className="tooltip-total">{totalSteps}</span>
          </div>
        )}
      </div>
    </div>
  );
}