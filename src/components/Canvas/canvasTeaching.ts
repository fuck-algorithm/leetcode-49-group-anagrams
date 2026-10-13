import type { AlgorithmStep } from '../../types';

export function getMapAction(step: AlgorithmStep): { badge: string; detail: string; mode: 'create' | 'hit' | 'neutral' } {
  const { description, currentString, currentKey } = step;
  const processedCount = Array.from(step.groups.values()).reduce((count, values) => count + values.length, 0);
  if (description.includes('创建HashMap')) return { badge: 'MAP 初始化', detail: 'Map 为空。之后每个排序签名都会成为一组的 key。', mode: 'neutral' };
  if (description.includes('遍历第')) return { badge: '准备签名', detail: `当前单词 "${currentString}" 还没有签名；先拆分并排序字母。`, mode: 'neutral' };
  if (description.includes('转换为字符数组')) return { badge: '拆分字母', detail: `"${currentString}" 已拆成字母；顺序不同不影响它们的分组身份。`, mode: 'neutral' };
  if (description.includes('排序字符数组')) return { badge: '签名已排序', detail: '相同的字母排序后会得到相同签名，因此可以作为 Map key。', mode: 'neutral' };
  if (description.includes('生成分组键')) return { badge: `KEY "${currentKey}"`, detail: `得到签名 "${currentKey}"。下一步再检查 Map 中是否已有这个 key。`, mode: 'neutral' };
  if (description.includes('已存在于map中')) return { badge: '命中已有组', detail: `Map["${currentKey}"] 已存在；把原单词追加到该组。`, mode: 'hit' };
  if (description.includes('不存在，需要创建')) return { badge: '创建新组', detail: `Map["${currentKey}"] 不存在；为这个签名新建列表。`, mode: 'create' };
  if (description.includes('创建新的空列表')) return { badge: '新组已建立', detail: `Map["${currentKey}"] = []；下一步保存原单词 "${currentString}"。`, mode: 'create' };
  if (description.includes('添加到键')) {
    const keyWasPreviouslySeen = step.inputArray
      .slice(0, Math.max(0, processedCount - 1))
      .some((word) => word.split('').sort().join('') === currentKey);
    const appendMode = keyWasPreviouslySeen ? 'hit' : 'create';
    const detail = appendMode === 'create'
      ? `新建的 Map["${currentKey}"] 列表现在保存原单词 "${currentString}"。`
      : `复用 Map["${currentKey}"]，并追加原单词 "${currentString}"。`;
    return { badge: appendMode === 'create' ? '新组已写入' : '命中组已追加', detail, mode: appendMode };
  }
  if (description.includes('返回所有分组结果')) return { badge: '分组完成', detail: '同一个 key 下的所有原单词互为字母异位词。', mode: 'neutral' };
  return { badge: '等待运行', detail: '每个排序签名对应一个原单词列表。', mode: 'neutral' };
}
