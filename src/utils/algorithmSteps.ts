import type { AlgorithmStep } from '../types';

// Java代码（用于显示）
export const JAVA_CODE = `class Solution {
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
}`;

// 代码行映射（行号从1开始）
export const CODE_LINE_MAP = {
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
};

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
