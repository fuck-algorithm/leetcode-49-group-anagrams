import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generateAlgorithmSteps } from '../../utils/algorithmSteps';

describe('CodePanel Variable Display', () => {
  /**
   * **Feature: group-anagrams-visualizer, Property 5: 变量显示同步**
   * *对于任意*算法步骤，代码面板显示的变量值应与该步骤记录的variables一致
   * **验证: 需求 3.7**
   */
  it('Property 5: 变量显示同步 - 每个步骤应包含有效的变量状态', () => {
    // 生成有效的小写字母字符串
    const lowercaseStringArb = fc.string({ minLength: 1, maxLength: 5 })
      .filter(s => /^[a-z]+$/.test(s));
    
    fc.assert(
      fc.property(
        fc.array(lowercaseStringArb, { minLength: 1, maxLength: 3 }),
        (inputArray) => {
          const steps = generateAlgorithmSteps(inputArray);
          
          for (const step of steps) {
            // 验证 variables 存在且为对象
            expect(step.variables).toBeDefined();
            expect(typeof step.variables).toBe('object');
            
            // 验证 variables 不为 null
            expect(step.variables).not.toBeNull();
            
            // 验证 map 变量始终存在（因为算法核心是使用HashMap）
            expect('map' in step.variables).toBe(true);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('变量状态应该随步骤演进而变化', () => {
    const testInput = ['eat', 'tea', 'tan'];
    const steps = generateAlgorithmSteps(testInput);
    
    // 第一步应该有空的map
    expect(steps[0].variables.map).toBe('{}');
    
    // 最后一步应该有完整的结果
    const lastStep = steps[steps.length - 1];
    expect(lastStep.variables.result).toBeDefined();
    expect(Array.isArray(lastStep.variables.result)).toBe(true);
  });

  it('处理字符串时应该记录当前字符串和key', () => {
    const testInput = ['abc'];
    const steps = generateAlgorithmSteps(testInput);
    
    // 找到处理字符串的步骤
    const processingSteps = steps.filter(s => s.currentString !== undefined);
    
    expect(processingSteps.length).toBeGreaterThan(0);
    
    for (const step of processingSteps) {
      expect(step.currentString).toBe('abc');
    }
    
    // 找到生成key的步骤
    const keySteps = steps.filter(s => s.currentKey !== undefined);
    expect(keySteps.length).toBeGreaterThan(0);
    
    for (const step of keySteps) {
      expect(step.currentKey).toBe('abc'); // 'abc' 排序后还是 'abc'
    }
  });

  it('变量值应该与步骤描述一致', () => {
    const testInput = ['eat'];
    const steps = generateAlgorithmSteps(testInput);
    
    // 找到创建key的步骤
    const keyStep = steps.find(s => s.description.includes('生成分组键'));
    
    expect(keyStep).toBeDefined();
    if (keyStep) {
      expect(keyStep.variables.key).toBe('aet'); // 'eat' 排序后是 'aet'
    }
  });
});
