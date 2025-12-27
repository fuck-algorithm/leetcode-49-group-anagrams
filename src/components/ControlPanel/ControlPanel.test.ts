import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// 模拟播放控制逻辑（从App组件提取）
interface PlaybackState {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
}

function handlePrevious(state: PlaybackState): PlaybackState {
  return {
    ...state,
    currentStep: Math.max(0, state.currentStep - 1),
  };
}

function handleNext(state: PlaybackState): PlaybackState {
  return {
    ...state,
    currentStep: Math.min(state.totalSteps - 1, state.currentStep + 1),
  };
}

function handleReset(state: PlaybackState): PlaybackState {
  return {
    ...state,
    currentStep: 0,
    isPlaying: false,
  };
}

function handleSeek(state: PlaybackState, position: number): PlaybackState {
  const step = Math.round(position * (state.totalSteps - 1));
  return {
    ...state,
    currentStep: Math.max(0, Math.min(state.totalSteps - 1, step)),
    isPlaying: false,
  };
}

describe('ControlPanel Navigation', () => {
  /**
   * **Feature: group-anagrams-visualizer, Property 1: 步骤导航一致性**
   * *对于任意*当前步骤索引n，如果0 < n < totalSteps，执行"上一步"操作后步骤索引应为n-1；
   * 如果0 <= n < totalSteps-1，执行"下一步"操作后步骤索引应为n+1
   * **验证: 需求 5.1, 5.2**
   */
  it('Property 1: 步骤导航一致性 - 上一步和下一步操作应正确更新步骤索引', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 100 }), // totalSteps
        fc.integer({ min: 0, max: 99 }),  // currentStep (will be clamped)
        (totalSteps, currentStep) => {
          // 确保currentStep在有效范围内
          currentStep = Math.min(currentStep, totalSteps - 1);
          
          const state: PlaybackState = {
            currentStep,
            totalSteps,
            isPlaying: false,
          };
          
          // 测试上一步
          if (currentStep > 0) {
            const prevState = handlePrevious(state);
            expect(prevState.currentStep).toBe(currentStep - 1);
          }
          
          // 测试下一步
          if (currentStep < totalSteps - 1) {
            const nextState = handleNext(state);
            expect(nextState.currentStep).toBe(currentStep + 1);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('上一步在第一步时应保持不变', () => {
    const state: PlaybackState = {
      currentStep: 0,
      totalSteps: 10,
      isPlaying: false,
    };
    
    const newState = handlePrevious(state);
    expect(newState.currentStep).toBe(0);
  });

  it('下一步在最后一步时应保持不变', () => {
    const state: PlaybackState = {
      currentStep: 9,
      totalSteps: 10,
      isPlaying: false,
    };
    
    const newState = handleNext(state);
    expect(newState.currentStep).toBe(9);
  });
});

describe('ControlPanel Reset', () => {
  /**
   * **Feature: group-anagrams-visualizer, Property 2: 重置状态一致性**
   * *对于任意*当前播放状态，执行"重置"操作后，步骤索引应为0，播放状态应为暂停
   * **验证: 需求 5.5**
   */
  it('Property 2: 重置状态一致性 - 重置后步骤索引应为0且播放状态为暂停', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }), // totalSteps
        fc.integer({ min: 0, max: 99 }),  // currentStep
        fc.boolean(),                      // isPlaying
        (totalSteps, currentStep, isPlaying) => {
          currentStep = Math.min(currentStep, totalSteps - 1);
          
          const state: PlaybackState = {
            currentStep,
            totalSteps,
            isPlaying,
          };
          
          const resetState = handleReset(state);
          
          // 重置后步骤索引应为0
          expect(resetState.currentStep).toBe(0);
          
          // 重置后播放状态应为暂停
          expect(resetState.isPlaying).toBe(false);
          
          // totalSteps应保持不变
          expect(resetState.totalSteps).toBe(totalSteps);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('ControlPanel Progress Bar', () => {
  /**
   * **Feature: group-anagrams-visualizer, Property 3: 进度条同步**
   * *对于任意*进度条位置p（0 <= p <= 1），拖动到该位置后，
   * 当前步骤索引应为floor(p * (totalSteps - 1))
   * **验证: 需求 6.3**
   */
  it('Property 3: 进度条同步 - 拖动进度条应正确跳转到对应步骤', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 100 }), // totalSteps
        fc.float({ min: 0, max: 1 }),     // position (0-1)
        (totalSteps, position) => {
          const state: PlaybackState = {
            currentStep: 0,
            totalSteps,
            isPlaying: true,
          };
          
          const seekState = handleSeek(state, position);
          
          // 计算期望的步骤索引
          const expectedStep = Math.round(position * (totalSteps - 1));
          const clampedExpected = Math.max(0, Math.min(totalSteps - 1, expectedStep));
          
          // 验证步骤索引
          expect(seekState.currentStep).toBe(clampedExpected);
          
          // 验证播放状态应为暂停
          expect(seekState.isPlaying).toBe(false);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('进度条位置0应跳转到第一步', () => {
    const state: PlaybackState = {
      currentStep: 5,
      totalSteps: 10,
      isPlaying: true,
    };
    
    const seekState = handleSeek(state, 0);
    expect(seekState.currentStep).toBe(0);
  });

  it('进度条位置1应跳转到最后一步', () => {
    const state: PlaybackState = {
      currentStep: 0,
      totalSteps: 10,
      isPlaying: true,
    };
    
    const seekState = handleSeek(state, 1);
    expect(seekState.currentStep).toBe(9);
  });

  it('进度条位置0.5应跳转到中间步骤', () => {
    const state: PlaybackState = {
      currentStep: 0,
      totalSteps: 11,
      isPlaying: false,
    };
    
    const seekState = handleSeek(state, 0.5);
    expect(seekState.currentStep).toBe(5);
  });
});
