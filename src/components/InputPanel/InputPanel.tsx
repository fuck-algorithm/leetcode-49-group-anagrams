import { useState } from 'react';
import { validateInput, generateRandomInput, SAMPLE_DATA } from '../../utils/validation';
import './InputPanel.css';

interface InputPanelProps {
  onRun: (strings: string[]) => void;
}

export function InputPanel({ onRun }: InputPanelProps) {
  const [inputValue, setInputValue] = useState('["eat", "tea", "tan", "ate", "nat", "bat"]');
  const [error, setError] = useState<string | null>(null);

  const handleRun = () => {
    const result = validateInput(inputValue);
    if (result.isValid) {
      setError(null);
      onRun(result.strings);
    } else {
      setError(result.errorMessage || '输入无效');
    }
  };

  const handleSampleClick = (data: string[]) => {
    const formatted = JSON.stringify(data);
    setInputValue(formatted);
    setError(null);
    onRun(data);
  };

  const handleRandomClick = () => {
    const data = generateRandomInput();
    const formatted = JSON.stringify(data);
    setInputValue(formatted);
    setError(null);
    onRun(data);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleRun();
    }
  };

  return (
    <div className="input-panel">
      <div className="input-row">
        <label className="input-label">输入:</label>
        <input
          type="text"
          className={`input-field ${error ? 'input-error' : ''}`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='["eat", "tea", "tan", "ate", "nat", "bat"]'
          title={error || '输入字符串数组，按Enter运行'}
        />
        
        <div className="samples-group">
          <span className="samples-label">样例:</span>
          {SAMPLE_DATA.map((sample, index) => (
            <button
              key={index}
              className="sample-button"
              onClick={() => handleSampleClick(sample.data)}
              title={JSON.stringify(sample.data)}
            >
              {sample.label}
            </button>
          ))}
        </div>

        <div className="action-buttons">
          <button className="random-button" onClick={handleRandomClick} title="随机生成符合规则的数据">
            🎲 随机
          </button>
          <button className="run-button" onClick={handleRun} title="运行算法">
            ▶ 运行
          </button>
        </div>
      </div>

      {error && <div className="error-tooltip">{error}</div>}
    </div>
  );
}
