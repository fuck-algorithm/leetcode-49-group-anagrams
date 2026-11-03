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
    operation: 'init',
    narration: '先建立空 Map；每个字母排序签名都将作为一组的唯一键。',
    anchorIds: ['CREATE_MAP'],
    description: '创建HashMap用于存储分组结果',
    variables: { map: '{}' },
    inputArray: [...inputArray],
    groups: deepCopyMap(groups),
    highlightedElements: [],
  });

  // 遍历每个字符串
  for (let i = 0; i < inputArray.length; i++) {
    const str = inputArray[i];
    
    // 步骤: 进入循环，获取当前字符串
    steps.push({
      stepIndex: stepIndex++,
      lineNumber: CODE_LINE_MAP.FOR_LOOP,
      operation: 'read',
      narration: `读取输入索引 ${i} 的 "${str}"；接下来提取其字母组成以忽略原始顺序。`,
      anchorIds: ['FOR_LOOP'],
      description: `遍历第 ${i + 1} 个字符串: "${str}"`,
      variables: { 
        map: mapToObject(groups),
        str: str,
        i: i,
      },
      inputArray: [...inputArray],
      groups: deepCopyMap(groups),
      currentString: str,
      currentIndex: i,
      highlightedElements: [str],
    });

    // 步骤: 转换为字符数组
    const charArray = str.split('');
    steps.push({
      stepIndex: stepIndex++,
      lineNumber: CODE_LINE_MAP.TO_CHAR_ARRAY,
      operation: 'move',
      narration: `第 ${i + 1} 个单词：拆开 "${str}" 的字符；保留每个字母的出现次数，原来的排列次序不参与分组。`,
      anchorIds: ['TO_CHAR_ARRAY'],
      description: `将 "${str}" 转换为字符数组: [${charArray.map(c => `'${c}'`).join(', ')}]`,
      variables: {
        map: mapToObject(groups),
        str: str,
        array: charArray,
        phase: 'split',
      },
      inputArray: [...inputArray],
      groups: deepCopyMap(groups),
      currentString: str,
      currentIndex: i,
      highlightedElements: [str],
    });

    // 步骤: 排序
    const sortedArray = [...charArray].sort();
    steps.push({
      stepIndex: stepIndex++,
      lineNumber: CODE_LINE_MAP.SORT_ARRAY,
      operation: 'move',
      narration: `第 ${i + 1} 个单词按字母规范排序为 "${sortedArray.join('')}"；字母及其重数相同的单词会得到同一签名。`,
      anchorIds: ['SORT_ARRAY'],
      description: `排序字符数组: [${sortedArray.map(c => `'${c}'`).join(', ')}]`,
      variables: {
        map: mapToObject(groups),
        str: str,
        array: sortedArray,
        phase: 'sort',
      },
      inputArray: [...inputArray],
      groups: deepCopyMap(groups),
      currentString: str,
      currentIndex: i,
      highlightedElements: [str],
    });

    // 步骤: 生成key
    const key = sortedArray.join('');
    steps.push({
      stepIndex: stepIndex++,
      lineNumber: CODE_LINE_MAP.CREATE_KEY,
      operation: 'move',
      narration: `将排序结果 "${key}" 固化为 Map 键；之后用它查找字母组成相同的单词组。`,
      anchorIds: ['CREATE_KEY'],
      description: `生成分组键: "${key}"`,
      variables: { 
        map: mapToObject(groups),
        str: str,
        key: key,
      },
      inputArray: [...inputArray],
      groups: deepCopyMap(groups),
      currentString: str,
      currentIndex: i,
      currentKey: key,
      highlightedElements: [str],
    });

    // 步骤: 检查key是否存在
    const keyExists = groups.has(key);
    steps.push({
      stepIndex: stepIndex++,
      lineNumber: CODE_LINE_MAP.CHECK_KEY,
      operation: 'compare',
      narration: keyExists
        ? `查询 Map 命中 "${key}"；已有列表代表先前单词的字母组成完全相同，直接复用该组。`
        : `查询 Map 未命中 "${key}"；当前 Map 没有对应列表，因此先创建新组再保存原词。`,
      anchorIds: ['CHECK_KEY'],
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
      groups: deepCopyMap(groups),
      currentString: str,
      currentIndex: i,
      currentKey: key,
      highlightedElements: [str],
    });

    // 如果key不存在，创建新列表
    if (!keyExists) {
      groups.set(key, []);
      steps.push({
        stepIndex: stepIndex++,
        lineNumber: CODE_LINE_MAP.PUT_NEW_LIST,
        operation: 'insert',
        narration: `为首次出现的签名 "${key}" 创建空列表；后续同签名单词将复用它。`,
        anchorIds: ['PUT_NEW_LIST'],
        description: `为键 "${key}" 创建新的空列表`,
        variables: { 
          map: mapToObject(groups),
          str: str,
          key: key,
        },
        inputArray: [...inputArray],
        groups: deepCopyMap(groups),
        currentString: str,
        currentIndex: i,
        currentKey: key,
        highlightedElements: [str],
      });
    }

    // 步骤: 添加字符串到分组
    groups.get(key)!.push(str);
    steps.push({
      stepIndex: stepIndex++,
      lineNumber: CODE_LINE_MAP.ADD_TO_LIST,
      operation: 'insert',
      narration: `把原单词 "${str}" 追加到签名 "${key}" 的列表；Map 保存原词而不是排序后的签名。`,
      anchorIds: ['ADD_TO_LIST'],
      description: `将 "${str}" 添加到键 "${key}" 对应的列表中`,
      variables: { 
        map: mapToObject(groups),
        str: str,
        key: key,
      },
      inputArray: [...inputArray],
      groups: deepCopyMap(groups),
      currentString: str,
      currentIndex: i,
      currentKey: key,
      highlightedElements: [str, ...groups.get(key)!],
    });
  }

  // 步骤: 返回结果
  steps.push({
    stepIndex: stepIndex++,
    lineNumber: CODE_LINE_MAP.RETURN,
    operation: 'done',
    narration: '遍历结束并返回 Map 的所有列表；同一排序签名保证组内单词互为字母异位词。',
    anchorIds: ['RETURN'],
    description: '返回所有分组结果',
    variables: { 
      map: mapToObject(groups),
      result: Array.from(groups.values()),
    },
    inputArray: [...inputArray],
    groups: deepCopyMap(groups),
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

// 深拷贝Map（确保每个步骤的状态独立）
function deepCopyMap(map: Map<string, string[]>): Map<string, string[]> {
  const newMap = new Map<string, string[]>();
  map.forEach((value, key) => {
    newMap.set(key, [...value]);
  });
  return newMap;
}
