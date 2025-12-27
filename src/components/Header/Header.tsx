import { useState, useEffect } from 'react';
import { getGitHubStars } from '../../utils/githubStars';
import { AlgorithmModal } from '../AlgorithmModal';
import './Header.css';

const LEETCODE_URL = 'https://leetcode.cn/problems/group-anagrams/';
const LEETCODE_HOT_100_URL = 'https://fuck-algorithm.github.io/leetcode-hot-100/';
const GITHUB_URL = 'https://github.com/fuck-algorithm/leetcode-49-group-anagrams';

export function Header() {
  const [stars, setStars] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    getGitHubStars().then(setStars);
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        <a 
          href={LEETCODE_HOT_100_URL} 
          target="_blank" 
          rel="noopener noreferrer"
          className="back-link"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" d="M7.78 12.53a.75.75 0 01-1.06 0L2.47 8.28a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 1.06L4.81 7h7.44a.75.75 0 010 1.5H4.81l2.97 2.97a.75.75 0 010 1.06z"/>
          </svg>
          <span>Leetcode Hot 100</span>
        </a>
      </div>
      
      <a 
        href={LEETCODE_URL} 
        target="_blank" 
        rel="noopener noreferrer"
        className="header-title"
      >
        49. 字母异位词分组
      </a>
      
      <div className="header-right">
        <button 
          className="algorithm-btn"
          onClick={() => setIsModalOpen(true)}
          title="查看算法思路"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm6.5-.25A.75.75 0 017.25 7h1a.75.75 0 01.75.75v2.75h.25a.75.75 0 010 1.5h-2a.75.75 0 010-1.5h.25v-2h-.25a.75.75 0 01-.75-.75zM8 6a1 1 0 100-2 1 1 0 000 2z"/>
          </svg>
          <span>算法思路</span>
        </button>
        <a 
          href={GITHUB_URL} 
          target="_blank" 
          rel="noopener noreferrer"
          className="github-link"
          title="点击去GitHub仓库Star支持一下"
        >
          <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          <span className="star-count">
            <svg height="14" width="14" viewBox="0 0 16 16" fill="currentColor" className="star-icon">
              <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>
            </svg>
            {stars}
          </span>
        </a>
      </div>

      <AlgorithmModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </header>
  );
}
