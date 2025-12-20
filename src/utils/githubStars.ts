// GitHub Star数获取与缓存工具

const GITHUB_REPO = 'fuck-algorithm/leetcode-49-group-anagrams';
const CACHE_KEY = 'github_stars_cache';
const CACHE_DURATION = 60 * 60 * 1000; // 1小时缓存

interface StarCache {
  stars: number;
  timestamp: number;
}

// 打开IndexedDB数据库
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AlgorithmVisualizerDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };
  });
}

// 从IndexedDB获取缓存
async function getCachedStars(): Promise<StarCache | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get(CACHE_KEY);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? { stars: result.stars, timestamp: result.timestamp } : null);
      };
    });
  } catch {
    return null;
  }
}

// 保存到IndexedDB
async function setCachedStars(stars: number): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      const request = store.put({
        key: CACHE_KEY,
        stars,
        timestamp: Date.now(),
      });
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch {
    // 忽略缓存错误
  }
}

// 从GitHub API获取Star数
async function fetchStarsFromAPI(): Promise<number> {
  const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}`);
  if (!response.ok) {
    throw new Error('Failed to fetch GitHub stars');
  }
  const data = await response.json();
  return data.stargazers_count || 0;
}

// 获取GitHub Star数（带缓存）
export async function getGitHubStars(): Promise<number> {
  // 先检查缓存
  const cached = await getCachedStars();
  const now = Date.now();
  
  // 如果缓存有效（1小时内），直接返回
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.stars;
  }
  
  // 尝试从API获取
  try {
    const stars = await fetchStarsFromAPI();
    await setCachedStars(stars);
    return stars;
  } catch {
    // 如果API获取失败，返回缓存值或默认值0
    return cached?.stars ?? 0;
  }
}
