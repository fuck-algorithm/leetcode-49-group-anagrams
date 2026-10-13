import { useCallback, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { AlgorithmStep } from '../../types';
import { getMapAction } from './canvasTeaching';
import {
  COLORS,
  ANIMATION_CONFIG,
  createGlowFilter,
  createArrowMarker,
  drawParticleAlongPath,
} from '../../utils/canvasAnimations';
import './Canvas.css';

interface CanvasProps {
  currentStep: AlgorithmStep | null;
}

const PADDING = 24;
const INPUT_LANE = { height: 104 };
const CHAR_LANE = { height: 166 };
const MIN_HEIGHT = 560;
const ROW_HEIGHT = 54;
const BOX_HEIGHT = 32;

export function Canvas({ currentStep }: CanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: MIN_HEIGHT });
  const [transform, setTransform] = useState(d3.zoomIdentity);
  const previousStepRef = useRef<AlgorithmStep | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.7, 2.4])
      .on('zoom', (event) => setTransform(event.transform));
    svg.call(zoom);
    return () => { svg.on('.zoom', null); };
  }, []);

  const getLayout = useCallback(() => {
    const groupsHeight = 50 + Math.max(currentStep?.groups.size ?? 0, 1) * ROW_HEIGHT + 14;
    const inputY = 12;
    const charY = inputY + INPUT_LANE.height + 10;
    const groupsY = charY + CHAR_LANE.height + 10;
    const canvasHeight = Math.max(MIN_HEIGHT, dimensions.height, groupsY + groupsHeight + 18);
    const largestGroup = Math.max(0, ...Array.from(currentStep?.groups.values() ?? [], (values) => values.length));
    const inputWidth = currentStep ? currentStep.inputArray.length * 74 - 10 + PADDING * 2 + 32 : dimensions.width;
    const groupWidth = PADDING * 2 + 8 + 86 + 18 + largestGroup * 64 + Math.max(0, largestGroup - 1) * 9 + 24;
    const canvasWidth = Math.max(dimensions.width, inputWidth, groupWidth);
    return { inputY, charY, groupsY, groupsHeight, canvasHeight, canvasWidth };
  }, [currentStep, dimensions.height, dimensions.width]);

  useEffect(() => {
    if (!svgRef.current || !currentStep) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const defs = svg.append('defs');
    createGlowFilter(defs, 'glow-current', COLORS.warning, 2.5);
    createGlowFilter(defs, 'glow-key', COLORS.success, 2.5);
    createGlowFilter(defs, 'glow-value', COLORS.primary, 2.5);
    createArrowMarker(defs, 'arrow-info', COLORS.info);
    createArrowMarker(defs, 'arrow-success', COLORS.success);
    createArrowMarker(defs, 'arrow-primary', COLORS.primary);

    const layout = getLayout();
    const { canvasWidth: width, canvasHeight: height } = layout;
    svg.attr('width', width).attr('height', height);
    const root = svg.append('g').attr('class', 'viz-layer').attr('transform', transform.toString());
    root.append('rect').attr('class', 'canvas-surface').attr('width', width).attr('height', height).attr('fill', '#fbfcfe');

    const animate = !previousStepRef.current || previousStepRef.current.stepIndex !== currentStep.stepIndex;
    drawInputLane(root, currentStep, width, layout.inputY, animate);
    drawCharLane(root, currentStep, width, layout.charY, animate);
    drawGroupsLane(root, currentStep, width, layout.groupsY, animate, layout.groupsHeight);
    previousStepRef.current = currentStep;
  }, [currentStep, dimensions, transform, getLayout]);

  const handleZoom = (factor: number) => {
    d3.select(svgRef.current!).transition().duration(220)
      .call(d3.zoom<SVGSVGElement, unknown>().scaleBy as never, factor);
  };
  const handleZoomReset = () => {
    d3.select(svgRef.current!).transition().duration(220)
      .call(d3.zoom<SVGSVGElement, unknown>().transform as never, d3.zoomIdentity);
  };

  const layout = getLayout();
  const needsScroll = layout.canvasHeight > dimensions.height + 2;
  const needsHorizontalScroll = layout.canvasWidth > dimensions.width + 2;
  const stepDescription = currentStep?.description ?? '';

  return (
    <div className="canvas-wrap">
      <div className="canvas-head">
        <div className="canvas-head-title">
          <strong>字母异位词如何分组</strong>
          <span className="canvas-head-status">
            {currentStep?.currentString
              ? `当前单词：${currentStep.currentString}`
              : currentStep?.description.includes('返回所有分组结果')
                ? '所有单词均已完成分组'
                : '从一个单词开始，跟踪它的排序签名'}
          </span>
        </div>
        <span className="canvas-step-chip">
          {currentStep?.currentString
            ? `单词 ${Math.max(1, currentStep.inputArray.indexOf(currentStep.currentString) + 1)} / ${currentStep.inputArray.length} · 演示步 ${currentStep.stepIndex + 1}`
            : `演示步 ${currentStep ? currentStep.stepIndex + 1 : 0}`}
        </span>
      </div>
      <div className="step-explanation" aria-live="polite">
        <span className="step-explanation-label">{getActionTitle(stepDescription)}</span>
        <span className="step-explanation-separator" aria-hidden="true">—</span>
        <span>{getStepExplanation(currentStep)}</span>
      </div>
      <div className={`canvas-container ${needsScroll ? 'canvas-scroll' : ''} ${needsHorizontalScroll ? 'canvas-scroll-x' : ''}`} ref={containerRef}>
        <div className="canvas-viewport">
          <svg ref={svgRef} className="canvas-svg" role="img" aria-label="字母异位词分组执行轨迹" />
        </div>
        <div className="canvas-legend" aria-label="状态图例">
          <span className="legend-item"><span className="legend-swatch current" />当前单词</span>
          <span className="legend-item"><span className="legend-swatch key" />排序签名</span>
          <span className="legend-item"><span className="legend-swatch value" />原单词列表</span>
        </div>
        <div className="canvas-controls" aria-label="画布缩放控制">
          <button className="canvas-control-btn" onClick={() => handleZoom(1.25)} title="放大">＋</button>
          <button className="canvas-control-btn" onClick={() => handleZoom(0.8)} title="缩小">−</button>
          <button className="canvas-control-btn" onClick={handleZoomReset} title="重置缩放">⟳</button>
        </div>
      </div>
      <div className="canvas-tip">沿着单词 → 排序签名 → 分组列表阅读</div>
    </div>
  );
}

function drawInputLane(root: d3.Selection<SVGGElement, unknown, null, undefined>, step: AlgorithmStep, width: number, y: number, animate: boolean) {
  const x = PADDING;
  const laneWidth = width - PADDING * 2;
  const boxWidth = 64;
  const boxGap = 10;
  const arrayWidth = step.inputArray.length * (boxWidth + boxGap) - boxGap;
  const startX = x + Math.max(0, (laneWidth - arrayWidth) / 2);
  const arrayY = y + 44;
  drawLane(root, { x, y, width: laneWidth, height: INPUT_LANE.height, title: '① 当前输入  strs[]', accent: '#4b82d8', fill: '#f4f8fd' });

  step.inputArray.forEach((value, index) => {
    const itemX = startX + index * (boxWidth + boxGap);
    const isCurrent = value === step.currentString && step.highlightedElements.includes(value);
    const rect = root.append('rect').attr('class', `input-item${isCurrent ? ' is-current' : ''}`)
      .attr('x', itemX).attr('y', arrayY).attr('width', boxWidth).attr('height', BOX_HEIGHT).attr('rx', 6)
      .style('fill', isCurrent ? '#fff5d9' : '#ffffff').style('stroke', isCurrent ? '#e1a533' : '#cbd7e6')
      .style('stroke-width', isCurrent ? 2 : 1);
    root.append('text').attr('class', 'array-index').attr('x', itemX + boxWidth / 2).attr('y', arrayY - 8)
      .attr('text-anchor', 'middle').text(`[${index}]`);
    root.append('text').attr('class', `array-value${isCurrent ? ' current' : ''}`).attr('x', itemX + boxWidth / 2)
      .attr('y', arrayY + 22).attr('text-anchor', 'middle').text(`"${value}"`);
    if (animate && isCurrent) rect.style('opacity', 0.72).transition().duration(ANIMATION_CONFIG.duration.fast).style('opacity', 1);
  });

  if (step.currentString) {
    const index = step.inputArray.indexOf(step.currentString);
    if (index >= 0) {
      const markerX = startX + index * (boxWidth + boxGap) + boxWidth / 2;
      root.append('line').attr('class', 'current-marker').attr('x1', markerX).attr('x2', markerX)
        .attr('y1', arrayY + BOX_HEIGHT + 5).attr('y2', arrayY + BOX_HEIGHT + 13)
        .style('stroke', '#d18b1e').style('stroke-width', 2).attr('marker-end', 'url(#arrow-primary)');
    }
  }
}

function getTransformPhase(step: AlgorithmStep): { kind: 'idle' | 'splitting' | 'sorting' | 'key' | 'lookup' | 'append'; chars: string[]; status: string } {
  const variables = step.variables as Record<string, unknown>;
  const array = variables.array as string[] | undefined;
  const chars = array ?? step.currentString?.split('') ?? [];
  const description = step.description;
  if (description.includes('排序字符数组')) return { kind: 'sorting', chars, status: '正在排序' };
  if (description.includes('字符数组')) return { kind: 'splitting', chars, status: '拆分字母' };
  if (description.includes('生成分组键')) return { kind: 'key', chars, status: '签名就绪' };
  if (description.includes('已存在于map中') || description.includes('不存在，需要创建')) return { kind: 'lookup', chars, status: '查找签名' };
  if (description.includes('添加到键') || description.includes('创建新的空列表')) return { kind: 'append', chars, status: '归入分组' };
  return { kind: 'idle', chars, status: '等待处理' };
}

function drawCharLane(root: d3.Selection<SVGGElement, unknown, null, undefined>, step: AlgorithmStep, width: number, y: number, animate: boolean): void {
  const variables = step.variables as Record<string, unknown>;
  const phase = getTransformPhase(step);
  const array = variables.array as string[] | undefined;
  const x = PADDING;
  const laneWidth = width - PADDING * 2;
  const centerX = width / 2;
  const isSplitting = phase.kind === 'splitting';
  const isSorting = phase.kind === 'sorting';
  const hasSignature = ['sorting', 'key', 'lookup', 'append'].includes(phase.kind);
  const sortedChars = phase.chars.slice().sort();
  const shownChars = isSplitting ? phase.chars : hasSignature ? sortedChars : [];
  const boxSize = 30;
  const gap = 7;
  const arrayX = centerX - (shownChars.length * (boxSize + gap) - gap) / 2;
  const arrayY = y + 52;
  const hasCurrentKey = Boolean(step.currentKey);
  const isRelevantPhase = ['splitting', 'sorting', 'key'].includes(phase.kind);

  drawLane(root, {
    x,
    y,
    width: laneWidth,
    height: CHAR_LANE.height,
    title: '② 生成排序签名  key',
    accent: '#279b9a',
    fill: '#f3faf9',
    status: phase.status,
  });

  // Show the transformation as one trace: original word → sorted letters → key.
  const original = step.currentString ?? 'eat';
  root.append('text').attr('class', 'transform-caption').attr('x', centerX).attr('y', y + 42)
    .attr('text-anchor', 'middle').text(`"${original}" 的字母排序后，成为签名`);

  shownChars.forEach((char, index) => {
    const itemX = arrayX + index * (boxSize + gap);
    const rect = root.append('rect').attr('class', 'char-item')
      .attr('x', itemX).attr('y', arrayY).attr('width', boxSize).attr('height', boxSize).attr('rx', 5)
      .style('fill', isSorting ? '#e3f4f1' : '#eef9f8').style('stroke', '#6bbab1').style('stroke-width', 1.2);
    root.append('text').attr('class', 'char-value').attr('x', itemX + boxSize / 2).attr('y', arrayY + 20)
      .attr('text-anchor', 'middle').text(char);
    if (animate && isSorting) rect.style('opacity', 0.72).transition().delay(index * 28)
      .duration(ANIMATION_CONFIG.duration.fast).style('opacity', 1);
  });

  const signature = hasCurrentKey ? step.currentKey ?? '' : sortedChars.join('');
  root.append('line').attr('class', 'signature-link').attr('x1', centerX).attr('x2', centerX)
    .attr('y1', arrayY + boxSize + 4).attr('y2', arrayY + boxSize + 12)
    .style('opacity', hasSignature ? 1 : 0.35);
  root.append('rect').attr('class', `signature-pill${hasSignature ? ' is-ready' : ''}`)
    .attr('x', centerX - 70).attr('y', arrayY + boxSize + 12).attr('width', 140).attr('height', 26).attr('rx', 6);
  root.append('text').attr('class', 'signature-label').attr('x', centerX - 59).attr('y', arrayY + boxSize + 29).text('signature');
  root.append('text').attr('class', 'signature-value').attr('x', centerX + 25).attr('y', arrayY + boxSize + 29)
    .attr('text-anchor', 'middle').text(hasSignature ? `"${signature}"` : '待排序');

  if (array && step.currentString && isRelevantPhase && animate) {
    const inputIndex = step.inputArray.indexOf(step.currentString);
    if (inputIndex >= 0) {
      const inputBoxWidth = 64;
      const inputGap = 10;
      const totalWidth = step.inputArray.length * (inputBoxWidth + inputGap) - inputGap;
      const inputStartX = PADDING + Math.max(0, (width - PADDING * 2 - totalWidth) / 2);
      const startX = inputStartX + inputIndex * (inputBoxWidth + inputGap) + inputBoxWidth / 2;
      const startY = 18 + 46 + BOX_HEIGHT;
      drawParticleAlongPath(root, startX, startY, centerX, arrayY - 5, COLORS.info, 560);
    }
  }
}

function getStepExplanation(step: AlgorithmStep | null): string {
  if (!step) return '排序后得到的签名，是异位词分组的共同依据。';
  const { description, currentString, currentKey } = step;
  if (description.includes('创建HashMap')) return '先准备一个空 Map；每个排序签名会对应一个原单词列表。';
  if (description.includes('遍历第')) return `取出 "${currentString}"，把它转换成稳定的排序签名。`;
  if (description.includes('转换为字符数组')) return `把 "${currentString}" 拆成字母；只看字母组成，不依赖原顺序。`;
  if (description.includes('排序字符数组')) {
    const signature = (step.variables.array as string[] | undefined)?.join('') ?? '';
    return `排序得到 "${signature}"；异位词会得到同一个签名。`;
  }
  if (description.includes('生成分组键')) return `签名 "${currentKey}" 将作为 key；原单词会放进对应列表。`;
  if (description.includes('已存在于map中')) return `签名 "${currentKey}" 已命中，复用已有列表。`;
  if (description.includes('不存在，需要创建')) return `签名 "${currentKey}" 尚未出现，需要新建一个列表。`;
  if (description.includes('创建新的空列表')) return `新列表已建好，接下来把原单词 "${currentString}" 放进去。`;
  if (description.includes('添加到键')) return `把 "${currentString}" 追加到 "${currentKey}" 组；签名不是输出内容。`;
  if (description.includes('返回所有分组结果')) return '遍历结束；每个 key 下的原单词彼此都是字母异位词。';
  return description;
}

function getActionTitle(description: string): string {
  if (description.includes('创建HashMap')) return '初始化 Map';
  if (description.includes('遍历第')) return '取出单词';
  if (description.includes('转换为字符数组')) return '拆分字母';
  if (description.includes('排序字符数组')) return '排序得到签名';
  if (description.includes('生成分组键')) return '检查 Map';
  if (description.includes('已存在于map中')) return '检查 Map';
  if (description.includes('不存在，需要创建')) return '检查 Map';
  if (description.includes('创建新的空列表')) return '创建空列表';
  if (description.includes('添加到键')) return '保存原单词';
  if (description.includes('返回所有分组结果')) return '分组完成';
  return '算法步骤';
}

function drawGroupsLane(root: d3.Selection<SVGGElement, unknown, null, undefined>, step: AlgorithmStep, width: number, y: number, animate: boolean, groupsHeight: number) {
  const laneWidth = width - PADDING * 2;
  const rowHeight = ROW_HEIGHT;
  const keyWidth = 86;
  const valueWidth = 64;
  const valueGap = 9;
  const action = getMapAction(step);
  const phase = getTransformPhase(step);
  const isKeyPhase = ['key', 'lookup', 'append'].includes(phase.kind);

  drawLane(root, {
    x: PADDING,
    y,
    width: laneWidth,
    height: groupsHeight,
    title: '③ 分组表  key → 原单词列表',
    accent: '#2b9b73',
    fill: '#f5faf8',
    status: action.badge,
  });

  if (step.groups.size === 0 && !step.currentKey) {
    root.append('text').attr('class', 'empty-state').attr('x', PADDING + 18)
      .attr('y', y + 48).attr('text-anchor', 'start').text(action.detail);
    return;
  }

  if (step.currentKey && step.currentString && ['lookup', 'append'].includes(phase.kind)) {
    const hit = phase.kind === 'lookup'
      ? step.description.includes('已存在于map中')
      : action.mode === 'hit';
    const outcome = phase.kind === 'lookup'
      ? (hit ? '签名已存在，复用这个列表' : '签名首次出现，创建一个新列表')
      : (hit ? '命中已有列表，追加原单词' : '新列表已创建，写入第一个原单词');
    const decision = root.append('g').attr('class', `map-decision ${hit ? 'hit' : 'create'}`);
    decision.append('rect').attr('x', PADDING + 8).attr('y', y + 43).attr('width', Math.min(laneWidth - 16, 380)).attr('height', 25).attr('rx', 5);
    decision.append('text').attr('x', PADDING + 18).attr('y', y + 60).text(`Map["${step.currentKey}"]  ${outcome}`);
  }

  let row = 0;
  step.groups.forEach((values, key) => {
    const rowY = y + (isKeyPhase ? 78 : 44) + row * rowHeight;
    const keyX = PADDING + 8;
    const valuesX = keyX + keyWidth + 18;
    const isCurrentKey = key === step.currentKey;

    root.append('rect').attr('class', `map-key${isCurrentKey ? ' is-active' : ''}`)
      .attr('x', keyX).attr('y', rowY).attr('width', keyWidth).attr('height', BOX_HEIGHT).attr('rx', 6)
      .style('fill', isCurrentKey ? '#e0f3ed' : '#f1f8f5').style('stroke', isCurrentKey ? '#35a183' : '#9acbb7')
      .style('stroke-width', isCurrentKey ? 2 : 1);
    root.append('text').attr('class', 'map-key-label').attr('x', keyX + keyWidth / 2).attr('y', rowY + 21)
      .attr('text-anchor', 'middle').text(`"${key}"`);
    root.append('text').attr('class', 'map-key-caption').attr('x', keyX + keyWidth / 2).attr('y', rowY + 45)
      .attr('text-anchor', 'middle').text('排序签名');

    root.append('line').attr('class', 'map-connector')
      .attr('x1', keyX + keyWidth + 7).attr('x2', valuesX - 7)
      .attr('y1', rowY + BOX_HEIGHT / 2).attr('y2', rowY + BOX_HEIGHT / 2)
      .attr('marker-end', 'url(#arrow-success)');

    values.forEach((value, index) => {
      const valueX = valuesX + index * (valueWidth + valueGap);
      const isNew = value === step.currentString && isCurrentKey && step.description.includes('添加到');
      const valueRect = root.append('rect').attr('class', `map-value${isNew ? ' is-new' : ''}`)
        .attr('x', valueX).attr('y', rowY).attr('width', valueWidth).attr('height', BOX_HEIGHT).attr('rx', 6)
        .style('fill', isNew ? '#e5efff' : '#f4f7fc').style('stroke', isNew ? '#4d83d6' : '#b9c9df')
        .style('stroke-width', isNew ? 2 : 1);
      root.append('text').attr('class', `map-value-label${isNew ? ' is-new' : ''}`)
        .attr('x', valueX + valueWidth / 2).attr('y', rowY + 21).attr('text-anchor', 'middle').text(`"${value}"`);
      if (isNew) {
        root.append('text').attr('class', 'new-value-caption').attr('x', valueX + valueWidth / 2)
          .attr('y', rowY + 45).attr('text-anchor', 'middle').text('原单词');
      }

      if (isNew && animate) {
        root.append('circle').attr('class', 'archive-pulse').attr('cx', valueX + valueWidth / 2)
          .attr('cy', rowY + BOX_HEIGHT / 2).attr('r', 7).style('fill', 'none')
          .style('stroke', '#4d83d6').style('stroke-width', 2).transition().duration(520)
          .attr('r', 20).style('opacity', 0).remove();
        valueRect.style('opacity', 0).attr('transform', 'translate(8, 0)').transition()
          .duration(ANIMATION_CONFIG.duration.slow).ease(d3.easeCubicOut).style('opacity', 1).attr('transform', 'translate(0, 0)');
      }
    });
    row += 1;
  });
}

function drawLane(root: d3.Selection<SVGGElement, unknown, null, undefined>, options: {
  x: number; y: number; width: number; height: number; title: string; accent: string; fill: string; status?: string;
}) {
  const { x, y, width, height, title, accent, fill, status } = options;
  root.append('rect').attr('class', 'lane-background').attr('x', x).attr('y', y)
    .attr('width', width).attr('height', height).attr('rx', 9).style('fill', fill)
    .style('stroke', '#dbe5ef').style('stroke-width', 1);
  root.append('line').attr('class', 'lane-accent').attr('x1', x).attr('x2', x)
    .attr('y1', y + 9).attr('y2', y + 29).style('stroke', accent).style('stroke-width', 3).style('stroke-linecap', 'round');
  root.append('text').attr('class', 'lane-title').attr('x', x + 12).attr('y', y + 21)
    .style('fill', '#3d4c62').text(title);
  if (status) {
    root.append('text').attr('class', 'lane-status').attr('x', x + width - 12).attr('y', y + 21)
      .attr('text-anchor', 'end').style('fill', accent).text(status);
  }
}
