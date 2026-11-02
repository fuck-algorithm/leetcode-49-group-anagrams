import { useCallback, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { AlgorithmStep } from '../../types';
import { buildFrameMarks, MOTION, renderFrame } from './renderFrame';
import './Canvas.css';

interface CanvasProps {
  currentStep: AlgorithmStep | null;
  codeOpen: boolean;
  onToggleCode: () => void;
}

const PADDING = 24;
const INPUT_LANE = { height: 104 };
const CHAR_LANE = { height: 166 };
const ROW_HEIGHT = 54;

export function Canvas({ currentStep, codeOpen, onToggleCode }: CanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 560 });
  const [transform, setTransform] = useState(d3.zoomIdentity);
  const previousStepRef = useRef<AlgorithmStep | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
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

  const layout = useCallback(() => {
    const narrow = dimensions.width < 700;
    const compact = dimensions.width < 1100 || dimensions.height < 700;
    const gap = compact ? 6 : 10;
    const inputBoxWidth = narrow ? 46 : 64;
    const inputPitch = narrow ? 54 : 74;
    const inputLaneHeight = narrow ? 88 : INPUT_LANE.height;
    const charLaneHeight = narrow ? 132 : compact ? 148 : CHAR_LANE.height;
    const inputY = 12;
    const charY = inputY + inputLaneHeight + gap;
    const groupsY = charY + charLaneHeight + gap;
    const groupsHeight = 50 + Math.max(currentStep?.groups.size ?? 0, 1) * ROW_HEIGHT + 14;
    const contentHeight = groupsY + groupsHeight + 18;
    const height = Math.max(dimensions.height, contentHeight);
    const inputWidth = currentStep
      ? currentStep.inputArray.length * inputPitch - (inputPitch - inputBoxWidth) + PADDING * 2 + 24
      : dimensions.width;
    const largestGroup = Math.max(0, ...Array.from(currentStep?.groups.values() ?? [], (values) => values.length));
    const groupWidth = PADDING * 2 + 8 + 86 + 18 + largestGroup * 64 + Math.max(0, largestGroup - 1) * 9 + 24;
    const width = Math.max(dimensions.width, inputWidth, groupWidth);
    return { width, height, inputY, charY, groupsY, inputBoxWidth, inputPitch, inputLaneHeight, charLaneHeight, groupsHeight, contentWidth: width, contentHeight };
  }, [currentStep, dimensions]);

  useEffect(() => {
    if (!svgRef.current || !currentStep) return;
    const svg = d3.select(svgRef.current);
    const frame = layout();
    svg.attr('viewBox', `0 0 ${frame.width} ${frame.height}`).attr('preserveAspectRatio', 'xMidYMid meet');
    svg.selectAll<SVGRectElement, string>('rect.canvas-surface')
      .data(['surface'], (id) => id)
      .join('rect').attr('class', 'canvas-surface')
      .attr('width', frame.width).attr('height', frame.height).attr('fill', '#fbfcfe')
      .lower();

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const previous = previousStepRef.current;
    const jumped = previous && Math.abs(previous.stepIndex - currentStep.stepIndex) > 1;
    renderFrame(svgRef.current, buildFrameMarks(currentStep, frame), {
      duration: reduced || jumped ? 0 : MOTION.update,
      transform: transform.toString(),
    });
    previousStepRef.current = currentStep;
  }, [currentStep, dimensions, transform, layout]);

  const handleZoom = (factor: number) => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const behavior = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.7, 2.4])
      .on('zoom', (event) => setTransform(event.transform));
    svg.call(behavior.scaleBy, factor);
  };
  const handleZoomReset = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const behavior = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.7, 2.4])
      .on('zoom', (event) => setTransform(event.transform));
    svg.call(behavior.transform, d3.zoomIdentity);
  };

  const frame = layout();
  const stepDescription = currentStep?.description ?? '';
  const operation = currentStep?.operation ?? 'init';
  const action = operation === 'init' ? '初始化 Map'
    : operation === 'read' ? '读取单词'
      : operation === 'compare' ? '检查签名'
        : operation === 'insert' ? '更新分组'
          : operation === 'done' ? '分组完成'
            : '生成签名';
  const fallbackNarration = stepDescription.includes('创建HashMap')
    ? '准备一个空 Map；每种排序签名会对应一个原单词列表。'
    : stepDescription || '读取单词，整理字母后按签名归入对应分组。';

  return (
    <div className="canvas-wrap">
      <div className="canvas-head">
        <button className={`code-toggle ${codeOpen ? 'active' : ''}`} type="button" aria-expanded={codeOpen} onClick={onToggleCode}>
          <span aria-hidden="true">{'</>'}</span><span>{codeOpen ? '隐藏代码' : '查看代码'}</span>
        </button>
        <div className="canvas-head-title">
          <strong>字母异位词如何分组</strong>
          <span className="canvas-head-status">{currentStep?.currentString ? `当前单词：${currentStep.currentString}` : '按排序签名收集原单词'}</span>
        </div>
        <span className="canvas-step-chip">演示步 {currentStep ? currentStep.stepIndex + 1 : 0}</span>
      </div>
      <div className="step-explanation" aria-live="polite" data-operation={operation}>
        <span className="operation-badge">{operation.toUpperCase()}</span>
        <span className="step-explanation-label">{action}</span>
        <span className="step-explanation-separator" aria-hidden="true">—</span>
        <span>{currentStep?.narration ?? fallbackNarration}</span>
      </div>
      <div className={`canvas-container ${frame.contentHeight > dimensions.height + 2 ? 'canvas-scroll' : ''} ${frame.contentWidth > dimensions.width + 2 ? 'canvas-scroll-x' : ''}`} ref={containerRef}>
        <div className="canvas-viewport" style={{ width: frame.width, height: frame.height }}>
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
