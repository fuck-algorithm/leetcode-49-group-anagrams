import type { InputData } from '../types';

// 验证输入数据
export function validateInput(input: string): InputData {
  // 去除首尾空格
  const trimmed = input.trim();
  
  if (!trimmed) {
    return {
      strings: [],
      isValid: false,
      errorMessage: '请输入字符串数组',
    };
  }

  // 尝试解析JSON格式的数组
  let strings: string[];
  try {
    // 支持 ["a", "b"] 格式
    if (trimmed.startsWith('[')) {
      strings = JSON.parse(trimmed);
    } else {
      // 支持逗号分隔格式: a, b, c
      strings = trimmed.split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
    }
  } catch {
    return {
      strings: [],
      isValid: false,
      errorMessage: '输入格式错误，请使用 ["eat", "tea", "tan"] 或 eat, tea, tan 格式',
    };
  }

  // 验证是否为数组
  if (!Array.isArray(strings)) {
    return {
      strings: [],
      isValid: false,
      errorMessage: '输入必须是字符串数组',
    };
  }

  // 验证数组长度
  if (strings.length === 0) {
    return {
      strings: [],
      isValid: false,
      errorMessage: '数组不能为空',
    };
  }

  if (strings.length > 10000) {
    return {
      strings: [],
      isValid: false,
      errorMessage: '数组长度不能超过10000',
    };
  }

  // 验证每个字符串
  for (let i = 0; i < strings.length; i++) {
    const str = strings[i];
    
    if (typeof str !== 'string') {
      return {
        strings: [],
        isValid: false,
        errorMessage: `第 ${i + 1} 个元素不是字符串`,
      };
    }

    if (str.length > 100) {
      return {
        strings: [],
        isValid: false,
        errorMessage: `第 ${i + 1} 个字符串 "${str}" 长度超过100`,
      };
    }

    // 验证只包含小写字母
    if (str.length > 0 && !/^[a-z]+$/.test(str)) {
      return {
        strings: [],
        isValid: false,
        errorMessage: `第 ${i + 1} 个字符串 "${str}" 包含非小写字母字符`,
      };
    }
  }

  return {
    strings,
    isValid: true,
  };
}

// 生成随机字符串数组
export function generateRandomInput(): string[] {
  const count = Math.floor(Math.random() * 8) + 3; // 3-10个字符串
  const strings: string[] = [];
  
  // 生成一些基础字符串
  const baseStrings = ['eat', 'tea', 'tan', 'ate', 'nat', 'bat', 'abc', 'bca', 'cab', 'dog', 'god', 'cat', 'act', 'tac'];
  
  for (let i = 0; i < count; i++) {
    if (Math.random() < 0.7 && baseStrings.length > 0) {
      // 70%概率从基础字符串中选择（确保有异位词）
      const idx = Math.floor(Math.random() * baseStrings.length);
      strings.push(baseStrings[idx]);
    } else {
      // 30%概率生成随机字符串
      const len = Math.floor(Math.random() * 5) + 1; // 1-5个字符
      let str = '';
      for (let j = 0; j < len; j++) {
        str += String.fromCharCode(97 + Math.floor(Math.random() * 26));
      }
      strings.push(str);
    }
  }
  
  return strings;
}

// 内置样例数据
export const SAMPLE_DATA = [
  {
    label: '示例1',
    data: ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'],
  },
  {
    label: '示例2',
    data: [''],
  },
  {
    label: '示例3',
    data: ['a'],
  },
  {
    label: '更多异位词',
    data: ['abc', 'bca', 'cab', 'dog', 'god', 'cat', 'act', 'tac'],
  },
];
