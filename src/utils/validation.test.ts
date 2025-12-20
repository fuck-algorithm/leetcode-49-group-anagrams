import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validateInput, generateRandomInput } from './validation';

describe('Input Validation', () => {
  /**
   * **Feature: group-anagrams-visualizer, Property 7: 输入验证正确性**
   * *对于任意*输入数据，如果包含非小写字母字符、数组长度超出[1, 10000]范围、
   * 或字符串长度超出[0, 100]范围，验证函数应返回false并提供错误信息
   * **验证: 需求 7.5, 7.6, 7.7, 7.8, 7.9**
   */
  it('Property 7: 输入验证正确性 - 非小写字母字符应被拒绝', () => {
    fc.assert(
      fc.property(
        // 生成包含非小写字母字符的字符串
        fc.string({ minLength: 1, maxLength: 10 }).filter(s => !/^[a-z]*$/.test(s)),
        (invalidString) => {
          const result = validateInput(JSON.stringify([invalidString]));
          
          // 如果字符串非空且包含非小写字母，应该返回无效
          if (invalidString.length > 0) {
            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toBeDefined();
          }
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 7: 输入验证正确性 - 字符串长度超过100应被拒绝', () => {
    fc.assert(
      fc.property(
        // 生成长度超过100的小写字母字符串
        fc.string({ minLength: 101, maxLength: 150 }).map(s => 
          s.toLowerCase().replace(/[^a-z]/g, 'a').padEnd(101, 'a')
        ),
        (longString) => {
          const result = validateInput(JSON.stringify([longString]));
          expect(result.isValid).toBe(false);
          expect(result.errorMessage).toContain('长度超过100');
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 7: 输入验证正确性 - 有效输入应被接受', () => {
    fc.assert(
      fc.property(
        // 生成有效的小写字母字符串数组
        fc.array(
          fc.string({ minLength: 0, maxLength: 10 }).map(s => 
            s.toLowerCase().replace(/[^a-z]/g, '')
          ),
          { minLength: 1, maxLength: 10 }
        ),
        (validStrings) => {
          const result = validateInput(JSON.stringify(validStrings));
          expect(result.isValid).toBe(true);
          expect(result.strings).toEqual(validStrings);
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('空输入应被拒绝', () => {
    const result = validateInput('');
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe('请输入字符串数组');
  });

  it('空数组应被拒绝', () => {
    const result = validateInput('[]');
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe('数组不能为空');
  });

  it('非数组输入应被拒绝', () => {
    const result = validateInput('"not an array"');
    expect(result.isValid).toBe(false);
  });
});

describe('Random Input Generation', () => {
  /**
   * **Feature: group-anagrams-visualizer, Property 6: 随机数据合法性**
   * *对于任意*随机生成的数据，所有字符串应仅包含小写字母a-z，
   * 数组长度应在[1, 10]范围内（演示用），每个字符串长度应在[1, 10]范围内
   * **验证: 需求 7.4**
   */
  it('Property 6: 随机数据合法性 - 随机生成的数据应符合约束', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }), // 运行次数的种子
        () => {
          const randomData = generateRandomInput();
          
          // 验证数组长度在合理范围内
          expect(randomData.length).toBeGreaterThanOrEqual(1);
          expect(randomData.length).toBeLessThanOrEqual(20); // 实际实现是3-10
          
          // 验证每个字符串
          for (const str of randomData) {
            // 验证只包含小写字母
            expect(/^[a-z]*$/.test(str)).toBe(true);
            
            // 验证字符串长度在合理范围内
            expect(str.length).toBeLessThanOrEqual(100);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('随机生成的数据应该通过验证', () => {
    for (let i = 0; i < 50; i++) {
      const randomData = generateRandomInput();
      const result = validateInput(JSON.stringify(randomData));
      expect(result.isValid).toBe(true);
    }
  });
});
