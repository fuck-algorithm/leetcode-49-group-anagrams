import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import { act, render } from '@testing-library/react';
import { generateAlgorithmSteps } from '../../utils/algorithmSteps';
import { buildFrameMarks, renderFrame } from './renderFrame';
import { Canvas } from './Canvas';

describe('Canvas responsive rendering', () => {
  it('accepts motion speed and exposes step metrics', () => {
    vi.stubGlobal('ResizeObserver', class { observe = vi.fn(); disconnect = vi.fn(); });
    vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    const step = generateAlgorithmSteps(['eat', 'tea'])[8];
    const { container, unmount } = render(React.createElement(Canvas, { currentStep: step, playbackSpeed: 2, codeOpen: false, onToggleCode: () => {} }));
    expect(container.querySelector('.canvas-metrics')?.textContent).toContain('分组数1');
    expect(container.querySelector('.canvas-metrics')?.textContent).toContain('已处理1/2');
    unmount();
    vi.unstubAllGlobals();
  });

  it('observes canvas size, initializes zoom, and reflects current step information', () => {
    const resizeCallbacks: ResizeObserverCallback[] = [];
    class MockResizeObserver {
      constructor(callback: ResizeObserverCallback) { resizeCallbacks.push(callback); }
      observe = vi.fn();
      disconnect = vi.fn();
      unobserve = vi.fn();
    }
    vi.stubGlobal('ResizeObserver', MockResizeObserver);
    vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    const step = generateAlgorithmSteps(['eat'])[1];
    const { container, unmount } = render(React.createElement(Canvas, { currentStep: step, playbackSpeed: 1, codeOpen: false, onToggleCode: () => {} }));
    const canvas = container.querySelector('.canvas-container')!;
    const svg = container.querySelector('svg')!;
    Object.defineProperty(canvas, 'getBoundingClientRect', { value: () => ({ width: 900, height: 600 }) });
    act(() => resizeCallbacks.forEach((callback) => callback([{ contentRect: { width: 900, height: 600 } } as ResizeObserverEntry], {} as ResizeObserver)));
    expect(svg.getAttribute('viewBox')).toContain('0 0');
    expect(container.querySelector('.step-explanation')?.textContent).toContain('读取输入索引');
    expect(container.querySelectorAll('[data-mark-id]').length).toBeGreaterThan(0);
    unmount();
    vi.unstubAllGlobals();
  });
});

describe('Canvas keyed frame snapshots', () => {
  const steps = generateAlgorithmSteps(['eat', 'tea']);
  const layout = { width: 900, height: 680, inputY: 12, charY: 122, groupsY: 298, inputBoxWidth: 64, inputLaneHeight: 104, inputPitch: 74, charLaneHeight: 166, groupsHeight: 118 };

  it('creates deterministic stable IDs and preserves unchanged input geometry', () => {
    const first = buildFrameMarks(steps[0], layout);
    const second = buildFrameMarks(steps[1], layout);
    const ids = first.map((mark) => mark.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(second.filter((mark) => mark.id.startsWith('input-')).map((mark) => mark.id))
      .toEqual(first.filter((mark) => mark.id.startsWith('input-')).map((mark) => mark.id));
    expect(second.find((mark) => mark.id === 'input-0-card')?.attrs?.x)
      .toBe(first.find((mark) => mark.id === 'input-0-card')?.attrs?.x);
  });

  it('reuses keyed SVG elements, updates states, and removes exiting nodes', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const first = buildFrameMarks(steps[0], layout);
    const second = buildFrameMarks(steps[1], layout);
    const layer = svg.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'g');
    layer.setAttribute('class', 'canvas-layer');
    svg.appendChild(layer);
    renderFrame(svg, first, { duration: 0, transform: 'translate(0,0) scale(1)' });
    expect(svg.querySelectorAll('[data-mark-tag]').length).toBe(first.length);
    const originalNode = svg.querySelector('[data-mark-id="input-0-card"]');
    expect(originalNode).not.toBeNull();
    renderFrame(svg, second, { duration: 0, transform: 'translate(0,0) scale(1)' });
    expect(svg.querySelector('[data-mark-id="input-0-card"]') === originalNode).toBe(true);
    const transient = svg.querySelector('[data-mark-id="signature-caption"]');
    expect(transient).not.toBeNull();
    renderFrame(svg, first, { duration: 0, transform: 'translate(0,0) scale(1)' });
    expect(Boolean(svg.querySelector('[data-mark-id="map-decision-card"]'))).toBe(false);
    expect(svg.querySelector('[data-mark-id="input-0-card"]') === originalNode).toBe(true);
  });

  it('builds direction arrows and instructional labels at desktop and mobile widths', () => {
    for (const width of [1024, 390]) {
      const narrow = width < 700;
      const marks = buildFrameMarks(steps[1], {
        width,
        height: 600,
        inputY: 12,
        charY: 156,
        groupsY: 330,
        inputBoxWidth: narrow ? 46 : 64,
        inputLaneHeight: narrow ? 88 : 104,
        inputPitch: narrow ? 54 : 74,
        charLaneHeight: narrow ? 132 : 148,
        groupsHeight: 118,
      });
      expect(marks.find((mark) => mark.id === 'flow-arrow-input-signature')?.attrs?.d).toContain('L');
      expect(marks.find((mark) => mark.id === 'flow-arrow-signature-map')?.attrs?.d).toContain('L');
      expect(marks.find((mark) => mark.id === 'flow-label-input-signature')?.text).toContain('读取单词');
      expect(marks.find((mark) => mark.id === 'flow-label-signature-map')?.text).toContain('用 key 查 Map');
    }
  });

  it('keeps signature and group IDs tied to semantic keys', () => {
    const teaStep = steps.find((step) => step.description.includes('生成分组键') && step.currentString === 'tea');
    const appended = steps.find((step) => step.description.includes('添加到') && step.currentString === 'tea');
    expect(teaStep).toBeDefined();
    expect(appended).toBeDefined();
    const before = buildFrameMarks(teaStep!, layout).map((mark) => mark.id);
    const after = buildFrameMarks(appended!, layout).map((mark) => mark.id);
    expect(before).toContain('signature-pill');
    expect(after).toContain('group-aet-key-card');
    expect(after).toContain('group-aet-value-1-card');
    expect(after).toContain('group-aet-value-1-text');
  });
});

describe('Canvas State Sync', () => {
  /**
   * **Feature: group-anagrams-visualizer, Property 9: 画布状态同步**
   * *对于任意*算法步骤，画布上显示的分组状态应与该步骤记录的groups一致
   * **验证: 需求 4.7**
   */
  it('Property 9: 画布状态同步 - 每个步骤的groups应该正确反映当前分组状态', () => {
    // 生成有效的小写字母字符串
    const lowercaseStringArb = fc.string({ minLength: 1, maxLength: 5 })
      .filter(s => /^[a-z]+$/.test(s));
    
    fc.assert(
      fc.property(
        fc.array(lowercaseStringArb, { minLength: 1, maxLength: 5 }),
        (inputArray) => {
          const steps = generateAlgorithmSteps(inputArray);
          
          for (const step of steps) {
            // 验证 groups 存在且为 Map
            expect(step.groups).toBeDefined();
            expect(step.groups instanceof Map).toBe(true);
            
            // 验证 groups 中的每个 key 都是有效的排序后的字符串
            step.groups.forEach((values, key) => {
              // key 应该是小写字母组成的字符串
              expect(/^[a-z]*$/.test(key)).toBe(true);
              
              // values 应该是数组
              expect(Array.isArray(values)).toBe(true);
              
              // 每个 value 排序后应该等于 key
              for (const value of values) {
                const sortedValue = value.split('').sort().join('');
                expect(sortedValue).toBe(key);
              }
            });
            
            // 验证 inputArray 存在且与原始输入一致
            expect(step.inputArray).toBeDefined();
            expect(Array.isArray(step.inputArray)).toBe(true);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('分组状态应该随步骤演进而增长', () => {
    const testInput = ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'];
    const steps = generateAlgorithmSteps(testInput);
    
    // 第一步应该有空的groups
    expect(steps[0].groups.size).toBe(0);
    
    // 最后一步应该有完整的分组
    const lastStep = steps[steps.length - 1];
    expect(lastStep.groups.size).toBeGreaterThan(0);
    
    // 验证最终分组包含所有输入字符串
    const allGroupedStrings: string[] = [];
    lastStep.groups.forEach((values) => {
      allGroupedStrings.push(...values);
    });
    
    expect(allGroupedStrings.sort()).toEqual([...testInput].sort());
  });

  it('相同字母异位词应该被分到同一组', () => {
    const testInput = ['eat', 'tea', 'ate'];
    const steps = generateAlgorithmSteps(testInput);
    const lastStep = steps[steps.length - 1];
    
    // 所有三个字符串应该在同一个分组中
    expect(lastStep.groups.size).toBe(1);
    
    const group = Array.from(lastStep.groups.values())[0];
    expect(group.sort()).toEqual(['ate', 'eat', 'tea']);
  });

  it('不同字母异位词应该被分到不同组', () => {
    const testInput = ['abc', 'xyz'];
    const steps = generateAlgorithmSteps(testInput);
    const lastStep = steps[steps.length - 1];
    
    // 应该有两个不同的分组
    expect(lastStep.groups.size).toBe(2);
  });

  it('highlightedElements应该与当前处理的字符串相关', () => {
    const testInput = ['eat', 'tea'];
    const steps = generateAlgorithmSteps(testInput);
    
    // 找到处理字符串的步骤
    const processingSteps = steps.filter(s => s.currentString !== undefined);
    
    for (const step of processingSteps) {
      // 当前处理的字符串应该在highlightedElements中
      expect(step.highlightedElements).toContain(step.currentString);
    }
  });
});
