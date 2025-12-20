import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generateAlgorithmSteps, LINE_MAP_BY_LANGUAGE, type CodeLanguage } from './algorithmSteps';

// 生成有效的小写字母字符串
const lowercaseStringArb = fc.string({ minLength: 1, maxLength: 10 })
  .filter(s => /^[a-z]+$/.test(s));

// 生成有效的字符串数组（用于演示，限制较小的数组）
const validInputArrayArb = fc.array(lowercaseStringArb, { minLength: 1, maxLength: 5 });

describe('Algorithm Steps Generator', () => {
  /**
   * **Feature: group-anagrams-visualizer, Property 8: 步骤完整性**
   * *对于任意*有效输入数据，生成的步骤序列应包含完整的算法执行过程，
   * 每个步骤应包含lineNumbers（多语言映射）、description（非空）、variables和当前数据状态
   * **验证: 需求 10.1, 10.2, 10.3, 10.4, 10.5**
   */
  it('Property 8: 步骤完整性 - 每个步骤应包含必要的属性', async () => {
    await fc.assert(
      fc.asyncProperty(
        validInputArrayArb,
        async (inputArray) => {
          const steps = generateAlgorithmSteps(inputArray);
          
          // 验证步骤序列非空
          expect(steps.length).toBeGreaterThan(0);
          
          // 验证每个步骤的属性
          for (const step of steps) {
            // 验证 stepIndex 存在且为数字
            expect(typeof step.stepIndex).toBe('number');
            expect(step.stepIndex).toBeGreaterThanOrEqual(0);
            
            // 验证 lineNumber 存在且为有效行号
            expect(typeof step.lineNumber).toBe('number');
            expect(step.lineNumber).toBeGreaterThan(0);
            
            // 验证 description 非空
            expect(typeof step.description).toBe('string');
            expect(step.description.length).toBeGreaterThan(0);
            
            // 验证 variables 存在
            expect(step.variables).toBeDefined();
            expect(typeof step.variables).toBe('object');
            
            // 验证 inputArray 存在且与输入一致
            expect(step.inputArray).toBeDefined();
            expect(Array.isArray(step.inputArray)).toBe(true);
            expect(step.inputArray).toEqual(inputArray);
            
            // 验证 groups 存在且为 Map
            expect(step.groups).toBeDefined();
            expect(step.groups instanceof Map).toBe(true);
            
            // 验证 highlightedElements 存在且为数组
            expect(step.highlightedElements).toBeDefined();
            expect(Array.isArray(step.highlightedElements)).toBe(true);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  it('步骤序列应该以初始化开始，以返回结果结束', async () => {
    await fc.assert(
      fc.asyncProperty(
        validInputArrayArb,
        async (inputArray) => {
          const steps = generateAlgorithmSteps(inputArray);
          
          // 第一步应该是创建Map
          const firstStep = steps[0];
          expect(firstStep.description).toContain('创建HashMap');
          
          // 最后一步应该是返回结果
          const lastStep = steps[steps.length - 1];
          expect(lastStep.description).toContain('返回');
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  it('步骤索引应该连续递增', async () => {
    await fc.assert(
      fc.asyncProperty(
        validInputArrayArb,
        async (inputArray) => {
          const steps = generateAlgorithmSteps(inputArray);
          
          for (let i = 0; i < steps.length; i++) {
            expect(steps[i].stepIndex).toBe(i);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  it('行号应该在有效范围内', () => {
    const languages: CodeLanguage[] = ['java', 'python', 'golang', 'javascript'];
    
    for (const lang of languages) {
      const lineMap = LINE_MAP_BY_LANGUAGE[lang];
      
      // 验证所有行号都是正整数
      for (const [, value] of Object.entries(lineMap)) {
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThan(0);
      }
    }
  });

  it('最终分组结果应该正确', async () => {
    // 使用已知的测试用例
    const testCases = [
      { input: ['eat', 'tea', 'ate'], expectedGroups: 1 },
      { input: ['abc', 'def', 'ghi'], expectedGroups: 3 },
      { input: ['a'], expectedGroups: 1 },
    ];
    
    for (const { input, expectedGroups } of testCases) {
      const steps = generateAlgorithmSteps(input);
      const lastStep = steps[steps.length - 1];
      
      expect(lastStep.groups.size).toBe(expectedGroups);
    }
  });
});
