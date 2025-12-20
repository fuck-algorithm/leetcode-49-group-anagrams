import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { 
  saveLanguage, 
  getSavedLanguage, 
  isValidLanguage,
  type ProgrammingLanguage 
} from './languagePreference';

describe('Language Preference Storage', () => {
  /**
   * **Feature: group-anagrams-visualizer, Property 10: 语言选择持久化**
   * *对于任意*语言选择操作，存储到IndexedDB后再读取，应得到相同的语言值
   * **验证: 需求 3.3, 3.4**
   */
  it('Property 10: 语言选择持久化 - 存储后读取应得到相同值', async () => {
    const validLanguages: ProgrammingLanguage[] = ['java', 'python', 'golang', 'javascript'];
    
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...validLanguages),
        async (language) => {
          // 保存语言
          await saveLanguage(language);
          
          // 读取语言
          const savedLanguage = await getSavedLanguage();
          
          // 验证读取的值与保存的值相同
          return savedLanguage === language;
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  it('isValidLanguage 应该正确验证语言值', () => {
    // 有效语言
    expect(isValidLanguage('java')).toBe(true);
    expect(isValidLanguage('python')).toBe(true);
    expect(isValidLanguage('golang')).toBe(true);
    expect(isValidLanguage('javascript')).toBe(true);
    
    // 无效语言
    expect(isValidLanguage('invalid')).toBe(false);
    expect(isValidLanguage('')).toBe(false);
    expect(isValidLanguage(null)).toBe(false);
    expect(isValidLanguage(undefined)).toBe(false);
    expect(isValidLanguage(123)).toBe(false);
  });
});
