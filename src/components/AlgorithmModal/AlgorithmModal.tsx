import { useEffect, useRef } from 'react';
import './AlgorithmModal.css';

interface AlgorithmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AlgorithmModal({ isOpen, onClose }: AlgorithmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalRef}>
        <div className="modal-header">
          <h2 className="modal-title">
            <span className="modal-icon">💡</span>
            算法思路
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="关闭">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>
        
        <div className="modal-body">
          <section className="algorithm-section">
            <h3>📋 题目描述</h3>
            <p>给你一个字符串数组，请你将 <strong>字母异位词</strong> 组合在一起。可以按任意顺序返回结果列表。</p>
            <p><strong>字母异位词</strong> 是由重新排列源单词的所有字母得到的一个新单词。</p>
          </section>

          <section className="algorithm-section">
            <h3>🎯 核心思路</h3>
            <p>字母异位词的特点是：<strong>排序后的字符串相同</strong>。</p>
            <p>例如："eat"、"tea"、"ate" 排序后都是 "aet"。</p>
          </section>

          <section className="algorithm-section">
            <h3>🔧 解题步骤</h3>
            <ol className="steps-list">
              <li>
                <strong>遍历字符串数组</strong>
                <p>依次处理每个字符串</p>
              </li>
              <li>
                <strong>生成分组键</strong>
                <p>将字符串转为字符数组，排序后拼接成新字符串作为键</p>
              </li>
              <li>
                <strong>哈希表分组</strong>
                <p>使用 HashMap 存储，键为排序后的字符串，值为原字符串列表</p>
              </li>
              <li>
                <strong>返回结果</strong>
                <p>将 HashMap 的所有值转为列表返回</p>
              </li>
            </ol>
          </section>

          <section className="algorithm-section">
            <h3>⏱️ 复杂度分析</h3>
            <ul className="complexity-list">
              <li><strong>时间复杂度：</strong>O(n × k × log k)，其中 n 是字符串数量，k 是字符串最大长度</li>
              <li><strong>空间复杂度：</strong>O(n × k)，用于存储哈希表</li>
            </ul>
          </section>

          <section className="algorithm-section">
            <h3>💻 代码实现</h3>
            <pre className="code-block">
{`function groupAnagrams(strs: string[]): string[][] {
    const map = new Map<string, string[]>();
    
    for (const str of strs) {
        // 将字符串排序作为键
        const key = str.split('').sort().join('');
        
        // 如果键不存在，创建新数组
        if (!map.has(key)) {
            map.set(key, []);
        }
        
        // 将原字符串添加到对应分组
        map.get(key)!.push(str);
    }
    
    // 返回所有分组
    return Array.from(map.values());
}`}
            </pre>
          </section>
        </div>
      </div>
    </div>
  );
}
