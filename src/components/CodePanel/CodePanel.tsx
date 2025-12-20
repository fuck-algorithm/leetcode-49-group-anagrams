import { Highlight, themes } from 'prism-react-renderer';
import { JAVA_CODE } from '../../utils/algorithmSteps';
import type { AlgorithmStep } from '../../types';
import './CodePanel.css';

interface CodePanelProps {
  currentStep: AlgorithmStep | null;
}

export function CodePanel({ currentStep }: CodePanelProps) {
  const highlightedLine = currentStep?.lineNumber || -1;
  const variables = currentStep?.variables || {};

  // 获取某行应该显示的变量
  const getVariablesForLine = (lineNumber: number): string | null => {
    if (!currentStep) return null;
    
    // 根据行号决定显示哪些变量
    const lineVariableMap: Record<number, string[]> = {
      3: ['map'],
      5: ['str', 'i'],
      6: ['array'],
      7: ['array'],
      8: ['key'],
      10: ['keyExists'],
      13: ['map'],
      16: ['result'],
    };

    const varsToShow = lineVariableMap[lineNumber];
    if (!varsToShow) return null;

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
        <span className="code-panel-title">Java 代码</span>
        <span className="code-panel-subtitle">排序方法</span>
      </div>
      <div className="code-container">
        <Highlight theme={themes.vsDark} code={JAVA_CODE} language="java">
          {({ style, tokens, getLineProps, getTokenProps }) => (
            <pre style={style} className="code-pre">
              {tokens.map((line, i) => {
                const lineNumber = i + 1;
                const isHighlighted = lineNumber === highlightedLine;
                const variableDisplay = getVariablesForLine(lineNumber);
                
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
