import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generateAlgorithmSteps, LINE_MAP_BY_LANGUAGE, type CodeLanguage } from '../../utils/algorithmSteps';

// 获取高亮行号的逻辑（从CodePanel组件提取）
function getHighlightedLine(
  currentStep: { lineNumber: number } | null,
  language: CodeLanguage
): number {
  if (!currentStep) return -1;
  const javaLine = currentStep.lineNumber;
  
  // 找到Java行号对应的步骤类型
  const javaLineMap = LINE_MAP_BY_LANGUAGE.java;
  let stepType: keyof typeof javaLineMap | null = null;
  
  for (const [key, value] of Object.entries(javaLineMap)) {
    if (value === javaLine) {
      stepType = key as keyof typeof javaLineMap;
      break;
    }
  }
  
  if (!stepType) return javaLine;
  return LINE_MAP_BY_LANGUAGE[language][stepType];
}

describe('CodePanel Line Highlighting', () => {
  /**
   * **Feature: group-anagrams-visualizer, Property 4: 代码行高亮同步**
   * *对于任意*算法步骤和当前选择的语言，代码面板高亮的行号应与该步骤记录的对应语言lineNumber一致
   * **验证: 需求 3.6**
   */
  it('Property 4: 代码行高亮同步 - 高亮行号应与步骤记录一致', () => {
    const languages: CodeLanguage[] = ['java', 'python', 'golang', 'javascript'];
    const testInput = ['eat', 'tea', 'tan'];
    const steps = generateAlgorithmSteps(testInput);
    
    fc.assert(
      fc.property(
        fc.constantFrom(...steps),
        fc.constantFrom(...languages),
        (step, language) => {
          const highlightedLine = getHighlightedLine(step, language);
          
          // 验证高亮行号是正整数
          expect(highlightedLine).toBeGreaterThan(0);
          
          // 验证高亮行号在该语言的有效行号范围内
          const lineMap = LINE_MAP_BY_LANGUAGE[language];
          const validLines = Object.values(lineMap);
          expect(validLines).toContain(highlightedLine);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('不同语言的行号映射应该一致', () => {
    const languages: CodeLanguage[] = ['java', 'python', 'golang', 'javascript'];
    const testInput = ['abc', 'bca'];
    const steps = generateAlgorithmSteps(testInput);
    
    // 对于每个步骤，验证所有语言都能正确映射
    for (const step of steps) {
      for (const lang of languages) {
        const highlightedLine = getHighlightedLine(step, lang);
        expect(highlightedLine).toBeGreaterThan(0);
      }
    }
  });

  it('null步骤应返回-1', () => {
    const languages: CodeLanguage[] = ['java', 'python', 'golang', 'javascript'];
    
    for (const lang of languages) {
      const highlightedLine = getHighlightedLine(null, lang);
      expect(highlightedLine).toBe(-1);
    }
  });
});
