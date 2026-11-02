import * as d3 from 'd3';
import type { AlgorithmStep } from '../../types';

export const MOTION = {
  enter: 180,
  update: 240,
  exit: 140,
} as const;

const exitTimers = new WeakMap<SVGElement, number>();

type MarkTag = 'rect' | 'line' | 'text' | 'circle';
type Mark = {
  id: string;
  tag: MarkTag;
  attrs?: Record<string, string | number>;
  styles?: Record<string, string | number>;
  text?: string;
};

export interface FrameLayout {
  width: number;
  height: number;
  inputY: number;
  charY: number;
  groupsY: number;
  inputBoxWidth: number;
  inputLaneHeight: number;
  inputPitch: number;
  charLaneHeight: number;
  groupsHeight: number;
}

function addLane(marks: Mark[], id: string, x: number, y: number, width: number, height: number, title: string, fill: string, accent: string, status: string) {
  marks.push(
    { id: `${id}-background`, tag: 'rect', attrs: { x, y, width, height, rx: 9 }, styles: { fill, stroke: '#dbe5ef', 'stroke-width': 1 } },
    { id: `${id}-accent`, tag: 'line', attrs: { x1: x, y1: y + 9, x2: x, y2: y + 29 }, styles: { stroke: accent, 'stroke-width': 3, 'stroke-linecap': 'round' } },
    { id: `${id}-title`, tag: 'text', attrs: { x: x + 12, y: y + 21 }, styles: { fill: '#344b58', 'font-size': 12, 'font-weight': 700 }, text: title },
    { id: `${id}-status`, tag: 'text', attrs: { x: x + width - 12, y: y + 21, 'text-anchor': 'end' }, styles: { fill: accent, 'font-size': 10, 'font-weight': 700 }, text: status },
  );
}

export function buildFrameMarks(step: AlgorithmStep, layout: FrameLayout): Mark[] {
  const { width, inputY, charY, groupsY, inputBoxWidth, inputLaneHeight, inputPitch, charLaneHeight, groupsHeight } = layout;
  const marks: Mark[] = [];
  const laneX = 24;
  const laneWidth = width - 48;
  const inputGap = inputPitch - inputBoxWidth;
  const inputTotal = step.inputArray.length * inputPitch - inputGap;
  const inputStart = laneX + Math.max(0, (laneWidth - inputTotal) / 2);
  addLane(marks, 'input-lane', laneX, inputY, laneWidth, inputLaneHeight, '① 当前输入  strs[]', '#f4f8fd', '#4b82d8', '');
  step.inputArray.forEach((word, index) => {
    const x = inputStart + index * inputPitch;
    const current = word === step.currentString && step.highlightedElements.includes(word);
    marks.push(
      { id: `input-${index}-card`, tag: 'rect', attrs: { x, y: inputY + 44, width: inputBoxWidth, height: 32, rx: 6 }, styles: { fill: current ? '#fff5d9' : '#fff', stroke: current ? '#d99a2b' : '#cbd7e6', 'stroke-width': current ? 2 : 1 } },
      { id: `input-${index}-index`, tag: 'text', attrs: { x: x + inputBoxWidth / 2, y: inputY + 36, 'text-anchor': 'middle' }, styles: { fill: '#687987', 'font-size': 10 }, text: `[${index}]` },
      { id: `input-${index}-word`, tag: 'text', attrs: { x: x + inputBoxWidth / 2, y: inputY + 66, 'text-anchor': 'middle' }, styles: { fill: '#26364d', 'font-size': 11, 'font-weight': 700 }, text: `"${word}"` },
    );
  });

  const variables = step.variables as Record<string, unknown>;
  const description = step.description;
  const chars = (variables.array as string[] | undefined) ?? step.currentString?.split('') ?? [];
  const showChars = description.includes('字符数组') || description.includes('排序字符数组') || Boolean(step.currentKey);
  const sortedChars = description.includes('排序字符数组') || Boolean(step.currentKey) ? chars.slice().sort() : chars;
  const signatureReady = description.includes('排序字符数组') || Boolean(step.currentKey);
  const signature = step.currentKey ?? sortedChars.join('');
  addLane(marks, 'signature-lane', laneX, charY, laneWidth, charLaneHeight, '② 生成排序签名  key', '#f3faf9', '#279b9a', signatureReady ? '签名就绪' : '提取字母');
  const centerX = width / 2;
  marks.push({ id: 'signature-caption', tag: 'text', attrs: { x: centerX, y: charY + 42, 'text-anchor': 'middle' }, styles: { fill: '#596e7a', 'font-size': 10 }, text: `"${step.currentString ?? ''}" 的字母排序后，成为签名` });
  const cellSize = width < 700 ? 26 : 30;
  const cellGap = width < 700 ? 4 : 7;
  const lettersWidth = Math.max(0, sortedChars.length * (cellSize + cellGap) - cellGap);
  const letterX = centerX - lettersWidth / 2;
  if (showChars) sortedChars.forEach((char, index) => {
    const x = letterX + index * (cellSize + cellGap);
    marks.push(
      { id: `letter-${index}-card`, tag: 'rect', attrs: { x, y: charY + 52, width: cellSize, height: cellSize, rx: 5 }, styles: { fill: '#eaf6f3', stroke: '#6bbab1', 'stroke-width': 1.2 } },
      { id: `letter-${index}-value`, tag: 'text', attrs: { x: x + cellSize / 2, y: charY + 72, 'text-anchor': 'middle' }, styles: { fill: '#126d62', 'font-size': 14, 'font-weight': 800 }, text: char },
    );
  });
  marks.push(
    { id: 'signature-stem', tag: 'line', attrs: { x1: centerX, y1: charY + 52 + cellSize + 4, x2: centerX, y2: charY + 52 + cellSize + 12 }, styles: { stroke: '#8abbb2', 'stroke-width': 1.3, opacity: signatureReady ? 1 : .35 } },
    { id: 'signature-pill', tag: 'rect', attrs: { x: centerX - 70, y: charY + 52 + cellSize + 12, width: 140, height: 26, rx: 6 }, styles: { fill: signatureReady ? '#e0f3ed' : '#f7f9fb', stroke: signatureReady ? '#35a183' : '#bac6d4', 'stroke-width': 1, 'stroke-dasharray': signatureReady ? 'none' : '3 2' } },
    { id: 'signature-label', tag: 'text', attrs: { x: centerX - 59, y: charY + 52 + cellSize + 29 }, styles: { fill: '#688276', 'font-size': 9, 'font-weight': 700 }, text: 'signature' },
    { id: 'signature-value', tag: 'text', attrs: { x: centerX + 25, y: charY + 52 + cellSize + 29, 'text-anchor': 'middle' }, styles: { fill: '#216f63', 'font-size': 11, 'font-weight': 800 }, text: signatureReady ? `"${signature}"` : '待排序' },
  );

  const groups = [...step.groups.entries()];
  const keyWidth = 86;
  const valueWidth = 64;
  const valueGap = 9;
  addLane(marks, 'groups-lane', laneX, groupsY, laneWidth, groupsHeight, '③ 分组表  key → 原单词列表', '#f5faf8', '#2b9b73', groups.length ? `${groups.length} 组` : 'Map 初始化');
  if (!groups.length) {
    marks.push({ id: 'groups-empty', tag: 'text', attrs: { x: laneX + 18, y: groupsY + 48 }, styles: { fill: '#657783', 'font-size': 11 }, text: 'Map 为空。之后每个排序签名都会成为一组的 key。' });
  }
  const currentPhase = description.includes('已存在于map中') || description.includes('不存在，需要创建') || description.includes('添加到键') || description.includes('创建新的空列表');
  if (step.currentKey && currentPhase) {
    const hit = description.includes('已存在于map中') || (description.includes('添加到键') && groups.some(([key, values]) => key === step.currentKey && values.length > 1));
    marks.push(
      { id: 'map-decision-card', tag: 'rect', attrs: { x: laneX + 8, y: groupsY + 43, width: Math.min(laneWidth - 16, 380), height: 25, rx: 5 }, styles: { fill: hit ? '#edf5ff' : '#f0f7f4', stroke: hit ? '#b4c9e8' : '#acd1bf' } },
      { id: 'map-decision-text', tag: 'text', attrs: { x: laneX + 18, y: groupsY + 60 }, styles: { fill: '#3d5f75', 'font-size': 10, 'font-weight': 700 }, text: `Map["${step.currentKey}"]  ${hit ? '复用已有列表并追加原单词' : '首次出现，创建新列表后保存原单词'}` },
    );
  }
  groups.forEach(([key, values], row) => {
    const y = groupsY + (currentPhase ? 78 : 44) + row * 54;
    const keyX = laneX + 8;
    const valuesX = keyX + keyWidth + 18;
    const active = key === step.currentKey;
    marks.push(
      { id: `group-${key}-key-card`, tag: 'rect', attrs: { x: keyX, y, width: keyWidth, height: 32, rx: 6 }, styles: { fill: active ? '#e0f3ed' : '#f1f8f5', stroke: active ? '#35a183' : '#9acbb7', 'stroke-width': active ? 2 : 1 } },
      { id: `group-${key}-key-text`, tag: 'text', attrs: { x: keyX + keyWidth / 2, y: y + 21, 'text-anchor': 'middle' }, styles: { fill: '#24775f', 'font-size': 11, 'font-weight': 700 }, text: `"${key}"` },
      { id: `group-${key}-key-caption`, tag: 'text', attrs: { x: keyX + keyWidth / 2, y: y + 45, 'text-anchor': 'middle' }, styles: { fill: '#74838e', 'font-size': 8 }, text: '排序签名' },
      { id: `group-${key}-connector`, tag: 'line', attrs: { x1: keyX + keyWidth + 7, y1: y + 16, x2: valuesX - 7, y2: y + 16 }, styles: { stroke: '#53a98d', 'stroke-width': 1.5 } },
    );
    values.forEach((value, index) => {
      const x = valuesX + index * (valueWidth + valueGap);
      const added = value === step.currentString && description.includes('添加到');
      marks.push(
        { id: `group-${key}-value-${index}-card`, tag: 'rect', attrs: { x, y, width: valueWidth, height: 32, rx: 6 }, styles: { fill: added ? '#e5efff' : '#f4f7fc', stroke: added ? '#4d83d6' : '#b9c9df', 'stroke-width': added ? 2 : 1 } },
        { id: `group-${key}-value-${index}-text`, tag: 'text', attrs: { x: x + valueWidth / 2, y: y + 21, 'text-anchor': 'middle' }, styles: { fill: added ? '#245cb4' : '#26364d', 'font-size': 11, 'font-weight': 650 }, text: `"${value}"` },
      );
    });
  });
  return marks;
}

function layer(svg: SVGSVGElement): SVGGElement {
  let group = svg.querySelector<SVGGElement>('g.canvas-layer');
  if (!group) {
    group = svg.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'canvas-layer');
    svg.appendChild(group);
  }
  return group;
}

function setMark(element: SVGElement, mark: Mark) {
  Object.entries(mark.attrs ?? {}).forEach(([name, value]) => element.setAttribute(name, String(value)));
  Object.entries(mark.styles ?? {}).forEach(([name, value]) => (element as SVGElement & { style: CSSStyleDeclaration }).style.setProperty(name, String(value)));
  if (mark.text !== undefined) element.textContent = mark.text;
}

export function renderFrame(svgElement: SVGSVGElement, marks: Mark[], options: { duration: number; transform: string }) {
  const root = layer(svgElement);
  root.setAttribute('transform', options.transform);
  const nextIds = new Set(marks.map((mark) => mark.id));
  (['rect', 'line', 'text', 'circle'] as const).forEach((tag) => {
    const tagMarks = marks.filter((mark) => mark.tag === tag);
    const selection = d3.select(root).selectAll<SVGElement, Mark>(`[data-mark-tag="${tag}"]`)
      .data(tagMarks, (mark, index, nodes) => mark?.id ?? nodes[index].getAttribute('data-mark-id') ?? '');
    selection.each(function (mark) {
      const element = this as SVGElement;
      const pendingExit = exitTimers.get(element);
      if (pendingExit !== undefined) window.clearTimeout(pendingExit);
      exitTimers.delete(element);
      element.style.transition = 'none';
      setMark(element, mark);
      element.style.opacity = '1';
    });
    selection.enter().each(function (mark) {
      const element = this.ownerDocument.createElementNS('http://www.w3.org/2000/svg', tag) as SVGElement & { __data__?: Mark };
      element.__data__ = mark;
      element.style.transition = 'none';
      element.setAttribute('data-mark-id', mark.id);
      element.setAttribute('data-mark-tag', tag);
      element.style.opacity = '0';
      setMark(element, mark);
      root.appendChild(element);
      element.style.opacity = '1';
    });
  });

  [...root.querySelectorAll<SVGElement>('[data-mark-id]')].forEach((element) => {
    if (nextIds.has(element.getAttribute('data-mark-id') ?? '')) return;
    if (exitTimers.has(element)) return;
    if (options.duration > 0) {
      element.style.transition = `opacity ${MOTION.exit}ms ease`;
      element.style.opacity = '0';
      exitTimers.set(element, window.setTimeout(() => {
        exitTimers.delete(element);
        element.parentNode?.removeChild(element);
      }, MOTION.exit));
    } else element.parentNode?.removeChild(element);
  });
}
