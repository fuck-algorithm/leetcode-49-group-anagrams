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
        <label className="input-label">输入数据:</label>
        <input
          type="text"
          className={`input-field ${error ? 'input-error' : ''}`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='["eat", "tea", "tan", "ate", "nat", "bat"]'
        />
        <button className="run-button" onClick={handleRun}>
          运行
        </button>
        <button className="random-button" onClick={handleRandomClick}>
          随机生成
        </button>
      </div>
      
      <div className="samples-row">
        <span className="samples-label">样例:</span>
        {SAMPLE_DATA.map((sample, index) => (
          <button
            key={index}
            className="sample-button"
            onClick={() => handleSampleClick(sample.data)}
          >
            {sample.label}
          </button>
        ))}
      </div>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
}
