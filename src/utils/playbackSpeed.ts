// 播放速度存储工具

const SPEED_KEY = 'playback_speed';
const DEFAULT_SPEED = 1;

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

// 获取保存的播放速度
export async function getSavedPlaybackSpeed(): Promise<number> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get(SPEED_KEY);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result?.speed ?? DEFAULT_SPEED);
      };
    });
  } catch {
    return DEFAULT_SPEED;
  }
}

// 保存播放速度
export async function savePlaybackSpeed(speed: number): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      const request = store.put({
        key: SPEED_KEY,
        speed,
      });
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch {
    // 忽略保存错误
  }
}

// 可用的播放速度选项
export const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];
