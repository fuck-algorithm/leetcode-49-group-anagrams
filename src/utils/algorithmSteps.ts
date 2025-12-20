import type { AlgorithmStep } from '../types';

// 支持的编程语言
export type CodeLanguage = 'java' | 'python' | 'golang' | 'javascript';

// 各语言代码
export const CODE_BY_LANGUAGE: Record<CodeLanguage, string> = {
  java: `class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> map = new HashMap<>();
        
        for (String str : strs) {
            char[] array = str.toCharArray();
            Arrays.sort(array);
            String key = new String(array);
            
            if (!map.containsKey(key)) {
                map.put(key, new ArrayList<>());
            }
            map.get(key).add(str);
        }
        
        return new ArrayList<>(map.values());
    }
}`,
  python: `class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        anagram_map = {}
        
        for s in strs:
            sorted_str = ''.join(sorted(s))
            
            if sorted_str not in anagram_map:
                anagram_map[sorted_str] = []
            anagram_map[sorted_str].append(s)
        
        return list(anagram_map.values())`,
  golang: `func groupAnagrams(strs []string) [][]string {
    anagramMap := make(map[string][]string)
    
    for _, str := range strs {
        bytes := []byte(str)
        sort.Slice(bytes, func(i, j int) bool {
            return bytes[i] < bytes[j]
        })
        key := string(bytes)
        
        anagramMap[key] = append(anagramMap[key], str)
    }
    
    result := make([][]string, 0, len(anagramMap))
    for _, v := range anagramMap {
        result = append(result, v)
    }
    return result
}`,
  javascript: `var groupAnagrams = function(strs) {
    const map = new Map();
    
    for (const str of strs) {
        const sorted = str.split('').sort().join('');
        
        if (!map.has(sorted)) {
            map.set(sorted, []);
        }
        map.get(sorted).push(str);
    }
    
    return Array.from(map.values());
};`,
};

// 各语言的行号映射
export const LINE_MAP_BY_LANGUAGE: Record<CodeLanguage, {
  CLASS_START: number;
  METHOD_START: number;
  CREATE_MAP: number;
  FOR_LOOP: number;
  TO_CHAR_ARRAY: number;
  SORT_ARRAY: number;
  CREATE_KEY: number;
  CHECK_KEY: number;
  PUT_NEW_LIST: number;
  ADD_TO_LIST: number;
  RETURN: number;
}> = {
  java: {
    CLASS_START: 1,
    METHOD_START: 2,
    CREATE_MAP: 3,
    FOR_LOOP: 5,
    TO_CHAR_ARRAY: 6,
    SORT_ARRAY: 7,
    CREATE_KEY: 8,
    CHECK_KEY: 10,
    PUT_NEW_LIST: 11,
    ADD_TO_LIST: 13,
    RETURN: 16,
  },
  python: {
    CLASS_START: 1,
    METHOD_START: 2,
    CREATE_MAP: 3,
    FOR_LOOP: 5,
    TO_CHAR_ARRAY: 6,
    SORT_ARRAY: 6,
    CREATE_KEY: 6,
    CHECK_KEY: 8,
    PUT_NEW_LIST: 9,
    ADD_TO_LIST: 10,
    RETURN: 12,
  },
  golang: {
    CLASS_START: 1,
    METHOD_START: 1,
    CREATE_MAP: 2,
    FOR_LOOP: 4,
    TO_CHAR_ARRAY: 5,
    SORT_ARRAY: 6,
    CREATE_KEY: 9,
    CHECK_KEY: 11,
    PUT_NEW_LIST: 11,
    ADD_TO_LIST: 11,
    RETURN: 17,
  },
  javascript: {
    CLASS_START: 1,
    METHOD_START: 1,
    CREATE_MAP: 2,
    FOR_LOOP: 4,
    TO_CHAR_ARRAY: 5,
    SORT_ARRAY: 5,
    CREATE_KEY: 5,
    CHECK_KEY: 7,
    PUT_NEW_LIST: 8,
    ADD_TO_LIST: 10,
    RETURN: 13,
  },
};

// 语言显示名称
export const LANGUAGE_NAMES: Record<CodeLanguage, string> = {
  java: 'Java',
  python: 'Python',
  golang: 'Go',
  javascript: 'JavaScript',
};

// Prism语言映射
export const PRISM_LANGUAGE_MAP: Record<CodeLanguage, string> = {
  java: 'java',
  python: 'python',
  golang: 'go',
  javascript: 'javascript',
};

// 兼容旧代码
export const JAVA_CODE = CODE_BY_LANGUAGE.java;
export const CODE_LINE_MAP = LINE_MAP_BY_LANGUAGE.java;

// 生成算法步骤
export function generateAlgorithmSteps(inputArray: string[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const groups = new Map<string, string[]>();
  let stepIndex = 0;

  // 步骤0: 初始化
  steps.push({
    stepIndex: stepIndex++,
    lineNumber: CODE_LINE_MAP.CREATE_MAP,
    description: '创建HashMap用于存储分组结果',
    variables: { map: '{}' },
    inputArray: [...inputArray],
    groups: new Map(groups),
    highlightedElements: [],
  });

  // 遍历每个字符串
  for (let i = 0; i < inputArray.length; i++) {
    const str = inputArray[i];
    
    // 步骤: 进入循环，获取当前字符串
    steps.push({
      stepIndex: stepIndex++,
      lineNumber: CODE_LINE_MAP.FOR_LOOP,
      description: `遍历第 ${i + 1} 个字符串: "${str}"`,
      variables: { 
        map: mapToObject(groups),
        str: str,
        i: i,
      },
      inputArray: [...inputArray],
      groups: new Map(groups),
      currentString: str,
      highlightedElements: [str],
    });

    // 步骤: 转换为字符数组
    const charArray = str.split('');
    steps.push({
      stepIndex: stepIndex++,
      lineNumber: CODE_LINE_MAP.TO_CHAR_ARRAY,
      description: `将 "${str}" 转换为字符数组: [${charArray.map(c => `'${c}'`).join(', ')}]`,
      variables: { 
        map: mapToObject(groups),
        str: str,
        array: charArray,
      },
      inputArray: [...inputArray],
      groups: new Map(groups),
      currentString: str,
      highlightedElements: [str],
    });

    // 步骤: 排序
    const sortedArray = [...charArray].sort();
    steps.push({
      stepIndex: stepIndex++,
      lineNumber: CODE_LINE_MAP.SORT_ARRAY,
      description: `排序字符数组: [${sortedArray.map(c => `'${c}'`).join(', ')}]`,
      variables: { 
        map: mapToObject(groups),
        str: str,
        array: sortedArray,
      },
      inputArray: [...inputArray],
      groups: new Map(groups),
      currentString: str,
      highlightedElements: [str],
    });

    // 步骤: 生成key
    const key = sortedArray.join('');
    steps.push({
      stepIndex: stepIndex++,
      lineNumber: CODE_LINE_MAP.CREATE_KEY,
      description: `生成分组键: "${key}"`,
      variables: { 
        map: mapToObject(groups),
        str: str,
        key: key,
      },
      inputArray: [...inputArray],
      groups: new Map(groups),
      currentString: str,
      currentKey: key,
      highlightedElements: [str],
    });

    // 步骤: 检查key是否存在
    const keyExists = groups.has(key);
    steps.push({
      stepIndex: stepIndex++,
      lineNumber: CODE_LINE_MAP.CHECK_KEY,
      description: keyExists 
        ? `键 "${key}" 已存在于map中` 
        : `键 "${key}" 不存在，需要创建新列表`,
      variables: { 
        map: mapToObject(groups),
        str: str,
        key: key,
        keyExists: keyExists,
      },
      inputArray: [...inputArray],
      groups: new Map(groups),
      currentString: str,
      currentKey: key,
      highlightedElements: [str],
    });

    // 如果key不存在，创建新列表
    if (!keyExists) {
      groups.set(key, []);
      steps.push({
        stepIndex: stepIndex++,
        lineNumber: CODE_LINE_MAP.PUT_NEW_LIST,
        description: `为键 "${key}" 创建新的空列表`,
        variables: { 
          map: mapToObject(groups),
          str: str,
          key: key,
        },
        inputArray: [...inputArray],
        groups: new Map(groups),
        currentString: str,
        currentKey: key,
        highlightedElements: [str],
      });
    }

    // 步骤: 添加字符串到分组
    groups.get(key)!.push(str);
    steps.push({
      stepIndex: stepIndex++,
      lineNumber: CODE_LINE_MAP.ADD_TO_LIST,
      description: `将 "${str}" 添加到键 "${key}" 对应的列表中`,
      variables: { 
        map: mapToObject(groups),
        str: str,
        key: key,
      },
      inputArray: [...inputArray],
      groups: new Map(groups),
      currentString: str,
      currentKey: key,
      highlightedElements: [str, ...groups.get(key)!],
    });
  }

  // 步骤: 返回结果
  steps.push({
    stepIndex: stepIndex++,
    lineNumber: CODE_LINE_MAP.RETURN,
    description: '返回所有分组结果',
    variables: { 
      map: mapToObject(groups),
      result: Array.from(groups.values()),
    },
    inputArray: [...inputArray],
    groups: new Map(groups),
    highlightedElements: [],
  });

  return steps;
}

// 将Map转换为普通对象（用于显示）
function mapToObject(map: Map<string, string[]>): Record<string, string[]> {
  const obj: Record<string, string[]> = {};
  map.forEach((value, key) => {
    obj[key] = [...value];
  });
  return obj;
}
