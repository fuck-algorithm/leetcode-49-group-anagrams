import { useCallback, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { AlgorithmStep } from '../../types';
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
const GAP = 16;
const INPUT_LANE = { y: 40, height: 116 };
const CHAR_LANE = { height: 142 };
const MIN_HEIGHT = 640;
const ROW_HEIGHT = 64;
const BOX_HEIGHT = 34;

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
      setDimensions({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
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
    return () => {
      svg.on('.zoom', null);
    };
  }, []);

  const getLayout = useCallback(() => {
    const minGroupsHeight = 42 + Math.max(currentStep?.groups.size ?? 0, 1) * ROW_HEIGHT + 18;
    const available = Math.max(MIN_HEIGHT, dimensions.height);
    const charY = INPUT_LANE.y + INPUT_LANE.height + GAP;
    const groupsY = charY + CHAR_LANE.height + GAP;
    const canvasHeight = Math.max(available, groupsY + minGroupsHeight + 24);
    const groupsHeight = Math.max(minGroupsHeight, canvasHeight - groupsY - 24);
    const largestGroup = Math.max(0, ...Array.from(currentStep?.groups.values() ?? [], (values) => values.length));
    const inputWidth = currentStep
      ? currentStep.inputArray.length * 74 - 10 + PADDING * 2 + 32
      : dimensions.width;
    const groupWidth = PADDING * 2 + 8 + 86 + 18 + largestGroup * 64 + Math.max(0, largestGroup - 1) * 9 + 24;
    const canvasWidth = Math.max(dimensions.width, inputWidth, groupWidth);

    return { charY, groupsY, groupsHeight, canvasHeight, canvasWidth };
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
    const width = layout.canvasWidth;
    const height = layout.canvasHeight;
    svg.attr('width', width).attr('height', height);

    const root = svg.append('g')
      .attr('class', 'viz-layer')
      .attr('transform', transform.toString());

    root.append('rect')
      .attr('class', 'canvas-surface')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#fbfcfe');

    const animate = !previousStepRef.current || previousStepRef.current.stepIndex !== currentStep.stepIndex;
    drawInputLane(root, currentStep, width, animate);
    drawCharLane(root, currentStep, width, layout.charY, animate);
    drawGroupsLane(root, currentStep, width, layout.groupsY, animate, layout.groupsHeight);
    previousStepRef.current = currentStep;
  }, [currentStep, dimensions, transform, getLayout]);

  const handleZoom = (factor: number) => {
    const svg = d3.select(svgRef.current!);
    svg.transition().duration(220).call(d3.zoom<SVGSVGElement, unknown>().scaleBy as never, factor);
  };

  const handleZoomReset = () => {
    const svg = d3.select(svgRef.current!);
    svg.transition().duration(220).call(
      d3.zoom<SVGSVGElement, unknown>().transform as never,
      d3.zoomIdentity,
    );
  };

  const layout = getLayout();
  const needsScroll = layout.canvasHeight > dimensions.height + 2;
  const needsHorizontalScroll = layout.canvasWidth > dimensions.width + 2;

  return (
    <div className="canvas-wrap">
      <div className="canvas-head">
        <div className="canvas-head-title">
          <span className="canvas-kicker">EXECUTION TRACE</span>
          <strong>分组状态</strong>
        </div>
        <div className="canvas-head-meta">
          <span className="canvas-step-chip">
            {currentStep ? `STEP ${String(currentStep.stepIndex + 1).padStart(2, '0')}` : 'READY'}
          </span>
          <span className="canvas-head-status">
            {currentStep?.currentString ? `正在处理 "${currentStep.currentString}"` : '等待运行'}
          </span>
        </div>
      </div>

      <div
        className={`canvas-container ${needsScroll ? 'canvas-scroll' : ''} ${needsHorizontalScroll ? 'canvas-scroll-x' : ''}`}
        ref={containerRef}
      >
        <div className="canvas-viewport">
          <svg ref={svgRef} className="canvas-svg" role="img" aria-label="字母异位词分组执行轨迹" />
        </div>

        <div className="canvas-legend" aria-label="状态图例">
          <span className="legend-item"><span className="legend-swatch current" />当前字符串</span>
          <span className="legend-item"><span className="legend-swatch key" />分组 key</span>
          <span className="legend-item"><span className="legend-swatch value" />已归档</span>
        </div>

        <div className="canvas-controls" aria-label="画布缩放控制">
          <button className="canvas-control-btn" onClick={() => handleZoom(1.25)} title="放大">＋</button>
          <button className="canvas-control-btn" onClick={() => handleZoom(0.8)} title="缩小">−</button>
          <button className="canvas-control-btn" onClick={handleZoomReset} title="重置缩放">⟳</button>
        </div>
      </div>
      <div className="canvas-tip">拖拽画布平移 · 滚轮缩放 · 时间轴可拖动定位</div>
    </div>
  );
}

function drawInputLane(
  root: d3.Selection<SVGGElement, unknown, null, undefined>,
  step: AlgorithmStep,
  width: number,
  animate: boolean,
) {
  const x = PADDING;
  const laneWidth = width - PADDING * 2;
  const boxWidth = 64;
  const boxGap = 10;
  const arrayWidth = step.inputArray.length * (boxWidth + boxGap) - boxGap;
  const startX = x + Math.max(0, (laneWidth - arrayWidth) / 2);
  const arrayY = INPUT_LANE.y + 50;

  drawLane(root, {
    x,
    y: INPUT_LANE.y,
    width: laneWidth,
    height: INPUT_LANE.height,
    title: '输入数组  strs[]',
    accent: '#4b82d8',
    fill: '#f4f8fd',
  });

  step.inputArray.forEach((value, index) => {
    const itemX = startX + index * (boxWidth + boxGap);
    const isCurrent = value === step.currentString && step.highlightedElements.includes(value);
    const rect = root.append('rect')
      .attr('class', `input-item${isCurrent ? ' is-current' : ''}`)
      .attr('x', itemX)
      .attr('y', arrayY)
      .attr('width', boxWidth)
      .attr('height', BOX_HEIGHT)
      .attr('rx', 6)
      .style('fill', isCurrent ? '#fff5d9' : '#ffffff')
      .style('stroke', isCurrent ? '#e1a533' : '#cbd7e6')
      .style('stroke-width', isCurrent ? 2 : 1);

    root.append('text')
      .attr('class', 'array-index')
      .attr('x', itemX + boxWidth / 2)
      .attr('y', arrayY - 8)
      .attr('text-anchor', 'middle')
      .text(`[${index}]`);

    root.append('text')
      .attr('class', `array-value${isCurrent ? ' current' : ''}`)
      .attr('x', itemX + boxWidth / 2)
      .attr('y', arrayY + 22)
      .attr('text-anchor', 'middle')
      .text(`"${value}"`);

    if (animate && isCurrent) {
      rect
        .style('opacity', 0.72)
        .transition()
        .duration(ANIMATION_CONFIG.duration.fast)
        .style('opacity', 1);
    }
  });

  if (step.currentString) {
    const index = step.inputArray.indexOf(step.currentString);
    if (index >= 0) {
      const markerX = startX + index * (boxWidth + boxGap) + boxWidth / 2;
      root.append('line')
        .attr('class', 'current-marker')
        .attr('x1', markerX)
        .attr('x2', markerX)
        .attr('y1', arrayY + BOX_HEIGHT + 5)
        .attr('y2', arrayY + BOX_HEIGHT + 13)
        .style('stroke', '#d18b1e')
        .style('stroke-width', 2)
        .attr('marker-end', 'url(#arrow-primary)');
    }
  }
}

function drawCharLane(
  root: d3.Selection<SVGGElement, unknown, null, undefined>,
  step: AlgorithmStep,
  width: number,
  y: number,
  animate: boolean,
): void {
  const variables = step.variables as Record<string, unknown>;
  const phase = getTransformPhase(step);
  const array = variables.array as string[] | undefined;
  const displayChars = phase.kind === 'idle' ? ['a', 'e', 't'] : phase.chars;
  const x = PADDING;
  const laneWidth = width - PADDING * 2;
  const centerX = width / 2;
  const isSorting = phase.kind === 'sorting';
  const hasKey = Boolean(step.currentKey);
  const sortedChars = phase.chars.slice().sort();
  const shownChars = hasKey ? sortedChars : displayChars;
  const boxSize = 30;
  const gap = 7;
  const arrayX = centerX - (shownChars.length * (boxSize + gap) - gap) / 2;
  const arrayY = y + 54;

  drawLane(root, {
    x,
    y,
    width: laneWidth,
    height: CHAR_LANE.height,
    title: phase.title,
    accent: '#279b9a',
    fill: '#f3faf9',
    status: phase.status,
  });

  shownChars.forEach((char, index) => {
    const itemX = arrayX + index * (boxSize + gap);
    const rect = root.append('rect')
      .attr('class', 'char-item')
      .attr('x', itemX)
      .attr('y', arrayY)
      .attr('width', boxSize)
      .attr('height', boxSize)
      .attr('rx', 5)
      .style('fill', isSorting ? '#e3f4f1' : '#eef9f8')
      .style('stroke', '#6bbab1')
      .style('stroke-width', 1.2);

    root.append('text')
      .attr('class', 'char-value')
      .attr('x', itemX + boxSize / 2)
      .attr('y', arrayY + 20)
      .attr('text-anchor', 'middle')
      .text(char);

    if (animate && isSorting) {
      rect
        .style('opacity', 0.72)
        .transition()
        .delay(index * 28)
        .duration(ANIMATION_CONFIG.duration.fast)
        .style('opacity', 1);
    }
  });

  if (phase.kind === 'splitting') {
    root.append('text')
      .attr('class', 'transform-note')
      .attr('x', centerX)
      .attr('y', arrayY + boxSize + 25)
      .attr('text-anchor', 'middle')
      .text('字符拆分完成，接下来按字母顺序排序');
  } else if (phase.kind === 'sorting' || phase.kind === 'key') {
    root.append('text')
      .attr('class', 'transform-result')
      .attr('x', centerX)
      .attr('y', arrayY + boxSize + 25)
      .attr('text-anchor', 'middle')
      .text(phase.kind === 'key' ? `key = "${step.currentKey}"` : `排序结果  "${sortedChars.join('')}"`);
  }

  if (array && step.currentString && (phase.kind === 'splitting' || phase.kind === 'sorting') && animate) {
    const inputIndex = step.inputArray.indexOf(step.currentString);
    if (inputIndex >= 0) {
      const inputBoxWidth = 64;
      const inputGap = 10;
      const totalWidth = step.inputArray.length * (inputBoxWidth + inputGap) - inputGap;
      const inputStartX = PADDING + Math.max(0, (width - PADDING * 2 - totalWidth) / 2);
      const startX = inputStartX + inputIndex * (inputBoxWidth + inputGap) + inputBoxWidth / 2;
      const startY = INPUT_LANE.y + 50 + BOX_HEIGHT;
      drawParticleAlongPath(root, startX, startY, centerX, arrayY - 5, COLORS.info, 560);
    }
  }
}

function getTransformPhase(step: AlgorithmStep): {
  kind: 'idle' | 'splitting' | 'sorting' | 'key' | 'lookup' | 'append';
  chars: string[];
  title: string;
  status: string;
} {
  const variables = step.variables as Record<string, unknown>;
  const array = variables.array as string[] | undefined;
  const fromCurrent = step.currentString?.split('') ?? [];
  const chars = array ?? fromCurrent;
  const description = step.description;

  if (description.includes('排序字符数组')) {
    return { kind: 'sorting', chars, title: '排序后的字符', status: 'SORT' };
  }
  if (description.includes('字符数组')) {
    return { kind: 'splitting', chars, title: '拆分后的字符', status: 'SPLIT' };
  }
  if (description.includes('生成分组键')) {
    return { kind: 'key', chars, title: '排序后的字符', status: 'KEY READY' };
  }
  if (description.includes('已存在于map中') || description.includes('不存在，需要创建')) {
    return { kind: 'lookup', chars, title: '排序后的字符', status: 'LOOKUP' };
  }
  if (description.includes('添加到键') || description.includes('创建新的空列表')) {
    return { kind: 'append', chars, title: '排序后的字符', status: 'APPEND' };
  }
  return { kind: 'idle', chars, title: '字符处理', status: 'WAITING' };
}

function drawGroupsLane(
  root: d3.Selection<SVGGElement, unknown, null, undefined>,
  step: AlgorithmStep,
  width: number,
  y: number,
  animate: boolean,
  groupsHeight: number,
) {
  const laneWidth = width - PADDING * 2;
  const rowHeight = ROW_HEIGHT;
  const keyWidth = 86;
  const valueWidth = 64;
  const valueGap = 9;

  drawLane(root, {
    x: PADDING,
    y,
    width: laneWidth,
    height: groupsHeight,
    title: '最终分组  map[key]',
    accent: '#2b9b73',
    fill: '#f5faf8',
    status: step.groups.size ? `${step.groups.size} GROUP${step.groups.size === 1 ? '' : 'S'}` : 'EMPTY',
  });

  if (step.groups.size === 0) {
    root.append('text')
      .attr('class', 'empty-state')
      .attr('x', width / 2)
      .attr('y', y + Math.max(84, groupsHeight * 0.46))
      .attr('text-anchor', 'middle')
      .text('当前还没有分组 · 下一步将创建第一个 key');
    return;
  }

  let row = 0;
  step.groups.forEach((values, key) => {
    const rowY = y + 44 + row * rowHeight;
    const keyX = PADDING + 8;
    const valuesX = keyX + keyWidth + 18;
    const isCurrentKey = key === step.currentKey;

    root.append('rect')
      .attr('class', `map-key${isCurrentKey ? ' is-active' : ''}`)
      .attr('x', keyX)
      .attr('y', rowY)
      .attr('width', keyWidth)
      .attr('height', BOX_HEIGHT)
      .attr('rx', 6)
      .style('fill', isCurrentKey ? '#e0f3ed' : '#f1f8f5')
      .style('stroke', isCurrentKey ? '#35a183' : '#9acbb7')
      .style('stroke-width', isCurrentKey ? 2 : 1);

    root.append('text')
      .attr('class', 'map-key-label')
      .attr('x', keyX + keyWidth / 2)
      .attr('y', rowY + 22)
      .attr('text-anchor', 'middle')
      .text(`"${key}"`);

    root.append('line')
      .attr('class', 'map-connector')
      .attr('x1', keyX + keyWidth + 7)
      .attr('x2', valuesX - 7)
      .attr('y1', rowY + BOX_HEIGHT / 2)
      .attr('y2', rowY + BOX_HEIGHT / 2)
      .attr('marker-end', 'url(#arrow-success)');

    values.forEach((value, index) => {
      const valueX = valuesX + index * (valueWidth + valueGap);
      const isNew = value === step.currentString && isCurrentKey && step.description.includes('添加到');
      const valueRect = root.append('rect')
        .attr('class', `map-value${isNew ? ' is-new' : ''}`)
        .attr('x', valueX)
        .attr('y', rowY)
        .attr('width', valueWidth)
        .attr('height', BOX_HEIGHT)
        .attr('rx', 6)
        .style('fill', isNew ? '#e5efff' : '#f4f7fc')
        .style('stroke', isNew ? '#4d83d6' : '#b9c9df')
        .style('stroke-width', isNew ? 2 : 1);

      root.append('text')
        .attr('class', `map-value-label${isNew ? ' is-new' : ''}`)
        .attr('x', valueX + valueWidth / 2)
        .attr('y', rowY + 22)
        .attr('text-anchor', 'middle')
        .text(`"${value}"`);

      if (isNew && animate) {
        valueRect
          .style('opacity', 0)
          .attr('transform', 'translate(8, 0)')
          .transition()
          .duration(ANIMATION_CONFIG.duration.slow)
          .ease(d3.easeCubicOut)
          .style('opacity', 1)
          .attr('transform', 'translate(0, 0)');
      }
    });

    if (isCurrentKey && step.currentString && step.description.includes('添加到') && animate) {
      const inputIndex = step.inputArray.indexOf(step.currentString);
      if (inputIndex >= 0) {
        const inputBoxWidth = 64;
        const inputGap = 10;
        const totalWidth = step.inputArray.length * (inputBoxWidth + inputGap) - inputGap;
        const inputStartX = PADDING + Math.max(0, (width - PADDING * 2 - totalWidth) / 2);
        const startX = inputStartX + inputIndex * (inputBoxWidth + inputGap) + inputBoxWidth / 2;
        const startY = INPUT_LANE.y + 50 + BOX_HEIGHT;
        const endX = valuesX + (values.length - 1) * (valueWidth + valueGap) + valueWidth / 2;
        const endY = rowY + BOX_HEIGHT / 2;
        drawParticleAlongPath(root, startX, startY, endX, endY, COLORS.primary);
      }
    }

    row += 1;
  });
}

function drawLane(
  root: d3.Selection<SVGGElement, unknown, null, undefined>,
  options: {
    x: number;
    y: number;
    width: number;
    height: number;
    title: string;
    accent: string;
    fill: string;
    status?: string;
  },
) {
  const { x, y, width, height, title, accent, fill, status } = options;
  root.append('rect')
    .attr('class', 'lane-background')
    .attr('x', x)
    .attr('y', y)
    .attr('width', width)
    .attr('height', height)
    .attr('rx', 9)
    .style('fill', fill)
    .style('stroke', '#dbe5ef')
    .style('stroke-width', 1);

  root.append('line')
    .attr('class', 'lane-accent')
    .attr('x1', x)
    .attr('x2', x)
    .attr('y1', y + 10)
    .attr('y2', y + 32)
    .style('stroke', accent)
    .style('stroke-width', 3)
    .style('stroke-linecap', 'round');

  root.append('text')
    .attr('class', 'lane-title')
    .attr('x', x + 12)
    .attr('y', y + 22)
    .style('fill', '#3d4c62')
    .text(title);

  if (status) {
    root.append('text')
      .attr('class', 'lane-status')
      .attr('x', x + width - 12)
      .attr('y', y + 22)
      .attr('text-anchor', 'end')
      .style('fill', accent)
      .text(status);
  }
}
