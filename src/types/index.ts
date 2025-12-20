// 算法步骤
export interface AlgorithmStep {
  stepIndex: number;
  lineNumber: number;
  description: string;
  variables: Record<string, unknown>;
  inputArray: string[];
  groups: Map<string, string[]>;
  currentString?: string;
  currentKey?: string;
  highlightedElements: string[];
}

// 播放状态
export interface PlaybackState {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  playbackSpeed: number;
}

// 输入数据
export interface InputData {
  strings: string[];
  isValid: boolean;
  errorMessage?: string;
}

// 画布变换
export interface CanvasTransform {
  x: number;
  y: number;
  scale: number;
}

// 变量状态（用于代码面板显示）
export interface VariableState {
  name: string;
  value: unknown;
  lineNumber: number;
}
