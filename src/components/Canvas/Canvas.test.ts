import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generateAlgorithmSteps } from '../../utils/algorithmSteps';

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
