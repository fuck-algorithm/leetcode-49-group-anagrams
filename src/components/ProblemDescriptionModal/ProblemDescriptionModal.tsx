import { useEffect, useRef } from 'react';
import './ProblemDescriptionModal.css';

interface ProblemDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProblemDescriptionModal({ isOpen, onClose }: ProblemDescriptionModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    const handlePointer = (event: PointerEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.addEventListener('pointerdown', handlePointer);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('pointerdown', handlePointer);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="problem-overlay">
      <div className="problem-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="problem-title">
        <header className="problem-dialog-header">
          <div>
            <h2 id="problem-title">题目描述</h2>
            <span>LeetCode 49 · 字母异位词分组</span>
          </div>
          <button className="problem-close" type="button" onClick={onClose} aria-label="关闭题目描述">×</button>
        </header>
        <div className="problem-dialog-body">
          <section>
            <h3>题意</h3>
            <p>给定字符串数组 <code>strs</code>，请将所有<strong>字母异位词</strong>归为一组，并以二维列表返回。答案可以按任意顺序排列。</p>
            <p>字母异位词由另一个单词的全部字母重新排列得到，字母及其出现次数必须完全一致。</p>
          </section>
          <section>
            <h3>示例</h3>
            <pre className="problem-example">{`输入：strs = ["eat", "tea", "tan", "ate", "nat", "bat"]
输出：[["bat"], ["nat", "tan"], ["ate", "eat", "tea"]]`}</pre>
          </section>
          <section>
            <h3>约束</h3>
            <ul>
              <li>1 ≤ strs.length ≤ 10⁴</li>
              <li>每个字符串长度为 0–100</li>
              <li>字符串仅包含小写英文字母</li>
            </ul>
          </section>
          <a href="https://leetcode.cn/problems/group-anagrams/" target="_blank" rel="noopener noreferrer">打开 LeetCode 原题 ↗</a>
        </div>
      </div>
    </div>
  );
}
