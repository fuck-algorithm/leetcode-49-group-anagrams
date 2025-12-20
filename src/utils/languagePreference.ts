// 语言偏好存储工具

export type ProgrammingLanguage = 'java' | 'python' | 'golang' | 'javascript';

const LANGUAGE_KEY = 'selected_language';
const DEFAULT_LANGUAGE: ProgrammingLanguage = 'java';

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

// 验证语言值是否有效
export function isValidLanguage(lang: unknown): lang is ProgrammingLanguage {
  return typeof lang === 'string' && 
    ['java', 'python', 'golang', 'javascript'].includes(lang);
}

// 获取保存的语言偏好
export async function getSavedLanguage(): Promise<ProgrammingLanguage> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get(LANGUAGE_KEY);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        const lang = result?.language;
        resolve(isValidLanguage(lang) ? lang : DEFAULT_LANGUAGE);
      };
    });
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

// 保存语言偏好
export async function saveLanguage(language: ProgrammingLanguage): Promise<void> {
  if (!isValidLanguage(language)) {
    throw new Error(`Invalid language: ${language}`);
  }
  
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['settings'], 'readwrite');
    const store = transaction.objectStore('settings');
    const request = store.put({
      key: LANGUAGE_KEY,
      language,
    });
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
