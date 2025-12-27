import { useState, useEffect } from 'react';
import { Highlight, themes, Prism } from 'prism-react-renderer';
import { 
  CODE_BY_LANGUAGE, 
  LANGUAGE_NAMES, 
  PRISM_LANGUAGE_MAP,
  LINE_MAP_BY_LANGUAGE,
  type CodeLanguage 
} from '../../utils/algorithmSteps';
import type { AlgorithmStep } from '../../types';
import './CodePanel.css';

// 设置全局Prism以支持额外语言
(typeof globalThis !== "undefined" ? globalThis : window).Prism = Prism;

interface CodePanelProps {
  currentStep: AlgorithmStep | null;
}

const LANGUAGES: CodeLanguage[] = ['java', 'python', 'golang', 'javascript'];

// 预加载Java语言支持
let javaLoaded = false;
const loadJavaLanguage = async () => {
  if (javaLoaded) return;
  try {
    await import('prismjs/components/prism-java');
    javaLoaded = true;
  } catch (e) {
    console.warn('Failed to load Java language support:', e);
  }
};

export function CodePanel({ currentStep }: CodePanelProps) {
  const [language, setLanguage] = useState<CodeLanguage>('java');
  const [languagesReady, setLanguagesReady] = useState(false);
  
  // 加载额外的语言支持
  useEffect(() => {
    loadJavaLanguage().then(() => {
      setLanguagesReady(true);
    });
  }, []);
  
  const code = CODE_BY_LANGUAGE[language];
  const lineMap = LINE_MAP_BY_LANGUAGE[language];
  const prismLanguage = PRISM_LANGUAGE_MAP[language];
  
  // 根据当前语言转换行号
  const getHighlightedLine = (): number => {
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
    return lineMap[stepType];
  };
  
  const highlightedLine = getHighlightedLine();
  const variables = currentStep?.variables || {};

  // 获取某行应该显示的变量
  const getVariablesForLine = (lineNumber: number): string | null => {
    if (!currentStep) return null;
    
    // 根据当前语言的行号映射决定显示哪些变量
    const varsToShow: string[] = [];
    
    if (lineNumber === lineMap.CREATE_MAP) {
      varsToShow.push('map');
    } else if (lineNumber === lineMap.FOR_LOOP) {
      varsToShow.push('str', 'i');
    } else if (lineNumber === lineMap.TO_CHAR_ARRAY || lineNumber === lineMap.SORT_ARRAY) {
      varsToShow.push('array');
    } else if (lineNumber === lineMap.CREATE_KEY) {
      varsToShow.push('key');
    } else if (lineNumber === lineMap.CHECK_KEY) {
      varsToShow.push('keyExists');
    } else if (lineNumber === lineMap.ADD_TO_LIST) {
      varsToShow.push('map');
    } else if (lineNumber === lineMap.RETURN) {
      varsToShow.push('result');
    }

    const displayParts: string[] = [];
    for (const varName of varsToShow) {
      if (varName in variables) {
        const value = variables[varName];
        let displayValue: string;
        
        if (typeof value === 'object') {
          displayValue = JSON.stringify(value);
        } else if (typeof value === 'string') {
          displayValue = `"${value}"`;
        } else {
          displayValue = String(value);
        }
        
        displayParts.push(`${varName} = ${displayValue}`);
      }
    }

    return displayParts.length > 0 ? displayParts.join(', ') : null;
  };

  return (
    <div className="code-panel">
      <div className="code-panel-header">
        <div className="language-tabs">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              className={`language-tab ${language === lang ? 'active' : ''}`}
              onClick={() => setLanguage(lang)}
            >
              {LANGUAGE_NAMES[lang]}
            </button>
          ))}
        </div>
        <span className="code-panel-subtitle">排序方法</span>
      </div>
      <div className="code-container">
        <Highlight 
          key={`${prismLanguage}-${languagesReady}`}
          theme={themes.vsDark} 
          code={code} 
          language={prismLanguage}
        >
          {({ style, tokens, getLineProps, getTokenProps }) => (
            <pre style={style} className="code-pre">
              {tokens.map((line, i) => {
                const lineNumber = i + 1;
                const isHighlighted = lineNumber === highlightedLine;
                const variableDisplay = isHighlighted ? getVariablesForLine(lineNumber) : null;
                
                return (
                  <div
                    key={i}
                    {...getLineProps({ line })}
                    className={`code-line ${isHighlighted ? 'code-line-highlighted' : ''}`}
                  >
                    <span className="line-number">{lineNumber}</span>
                    <span className="line-content">
                      {line.map((token, key) => (
                        <span key={key} {...getTokenProps({ token })} />
                      ))}
                    </span>
                    {isHighlighted && variableDisplay && (
                      <span className="variable-display">
                        {variableDisplay}
                      </span>
                    )}
                  </div>
                );
              })}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
}
