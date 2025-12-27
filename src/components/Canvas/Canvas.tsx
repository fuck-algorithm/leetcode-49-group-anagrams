import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { AlgorithmStep } from '../../types';
import './Canvas.css';

interface CanvasProps {
  currentStep: AlgorithmStep | null;
}

// 颜色配置
const COLORS = {
  primary: '#2563eb',
  primaryLight: '#3b82f6',
  success: '#22c55e',
  successLight: '#86efac',
  warning: '#f59e0b',
  warningLight: '#fde68a',
  info: '#06b6d4',
  infoLight: '#a5f3fc',
  gray: '#6b7280',
  grayLight: '#e5e7eb',
  text: '#1f2937',
  textLight: '#6b7280',
  white: '#ffffff',
};

export function Canvas({ currentStep }: CanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !currentStep) return;

    const svg = d3.select(svgRef.current);
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const mainGroup = svg.append('g').attr('class', 'main-group');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        mainGroup.attr('transform', event.transform);
      });

    svg.call(zoom);

    drawVisualization(mainGroup, currentStep, width);

  }, [currentStep]);

  return (
    <div className="canvas-container" ref={containerRef}>
      <div className="canvas-header">
        <span className="canvas-title">可视化</span>
        <span className="canvas-hint">拖拽平移 · 滚轮缩放</span>
      </div>
      <div className="canvas-content">
        <svg ref={svgRef} className="canvas-svg" />
        {currentStep && (
          <div className="step-description">
            <span className="step-index">步骤 {currentStep.stepIndex + 1}</span>
            <span className="step-text">{currentStep.description}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function drawVisualization(
  group: d3.Selection<SVGGElement, unknown, null, undefined>,
  step: AlgorithmStep,
  containerWidth: number
) {
  const padding = 30;
  const boxWidth = 55;
  const boxHeight = 28;
  const boxGap = 8;
  const charBoxSize = 24;

  // 定义箭头标记
  const defs = group.append('defs');
  defs.append('marker')
    .attr('id', 'arrow')
    .attr('markerWidth', 10)
    .attr('markerHeight', 7)
    .attr('refX', 9)
    .attr('refY', 3.5)
    .attr('orient', 'auto')
    .append('polygon')
    .attr('points', '0 0, 10 3.5, 0 7')
    .style('fill', COLORS.gray);

  // 绘制输入数组区域
  drawInputArraySection(group, step, padding, boxWidth, boxHeight, boxGap);

  // 绘制字符数组处理区域（如果当前步骤涉及）
  const charArrayY = drawCharArraySection(group, step, padding, charBoxSize, containerWidth);

  // 绘制分组结果区域
  drawGroupsSection(group, step, padding, boxWidth, boxHeight, boxGap, charArrayY);
}

// 绘制输入数组区域
function drawInputArraySection(
  group: d3.Selection<SVGGElement, unknown, null, undefined>,
  step: AlgorithmStep,
  padding: number,
  boxWidth: number,
  boxHeight: number,
  boxGap: number
) {
  const inputArray = step.inputArray;
  const startY = 30; // 增加顶部间距：20 -> 30

  // 标题带图标
  const titleGroup = group.append('g').attr('transform', `translate(${padding}, ${startY})`);
  
  // 数组图标
  titleGroup.append('text')
    .attr('x', 0)
    .attr('y', 0)
    .style('font-size', '14px')
    .text('📋');
  
  titleGroup.append('text')
    .attr('x', 22)
    .attr('y', 0)
    .style('font-size', '13px')
    .style('font-weight', '600')
    .style('fill', COLORS.text)
    .text('输入数组 strs[]');

  // 绘制数组元素
  const arrayY = startY + 30; // 增加标题与数组间距：20 -> 30
  inputArray.forEach((str, i) => {
    const x = padding + i * (boxWidth + boxGap);
    const isHighlighted = step.highlightedElements.includes(str) && str === step.currentString;

    // 索引标签
    group.append('text')
      .attr('x', x + boxWidth / 2)
      .attr('y', arrayY - 8) // 增加索引标签间距：-5 -> -8
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', COLORS.textLight)
      .text(`[${i}]`);

    // 元素框
    group.append('rect')
      .attr('x', x)
      .attr('y', arrayY)
      .attr('width', boxWidth)
      .attr('height', boxHeight)
      .attr('rx', 6)
      .style('fill', isHighlighted ? COLORS.warningLight : COLORS.grayLight)
      .style('stroke', isHighlighted ? COLORS.warning : '#d1d5db')
      .style('stroke-width', isHighlighted ? 2 : 1);

    // 元素文字
    group.append('text')
      .attr('x', x + boxWidth / 2)
      .attr('y', arrayY + boxHeight / 2 + 4)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-family', "'Monaco', 'Menlo', monospace")
      .style('fill', isHighlighted ? '#92400e' : COLORS.text)
      .style('font-weight', isHighlighted ? '600' : 'normal')
      .text(`"${str}"`);
  });

  // 当前处理指示器
  if (step.currentString !== undefined) {
    const currentIndex = inputArray.indexOf(step.currentString);
    if (currentIndex >= 0) {
      const arrowX = padding + currentIndex * (boxWidth + boxGap) + boxWidth / 2;
      const arrowY = arrayY + boxHeight + 18; // 增加箭头间距：12 -> 18

      // 指示箭头
      group.append('path')
        .attr('d', `M ${arrowX} ${arrowY} L ${arrowX - 6} ${arrowY + 10} L ${arrowX + 6} ${arrowY + 10} Z`)
        .style('fill', COLORS.warning);

      // 操作标签
      const actionLabel = getActionLabel(step);
      if (actionLabel) {
        const labelWidth = Math.max(actionLabel.length * 7 + 20, 80);
        group.append('rect')
          .attr('x', arrowX - labelWidth / 2)
          .attr('y', arrowY + 18) // 增加标签间距：16 -> 18
          .attr('width', labelWidth)
          .attr('height', 22)
          .attr('rx', 11)
          .style('fill', COLORS.primary);

        group.append('text')
          .attr('x', arrowX)
          .attr('y', arrowY + 32) // 增加文字间距：30 -> 32
          .attr('text-anchor', 'middle')
          .style('font-size', '11px')
          .style('fill', COLORS.white)
          .style('font-weight', '500')
          .text(actionLabel);
      }
    }
  }
}

// 绘制字符数组处理区域
function drawCharArraySection(
  group: d3.Selection<SVGGElement, unknown, null, undefined>,
  step: AlgorithmStep,
  padding: number,
  charBoxSize: number,
  containerWidth: number
): number {
  const variables = step.variables as Record<string, unknown>;
  const array = variables.array as string[] | undefined;
  const description = step.description;
  
  // 只在涉及字符数组操作时显示
  if (!array || (!description.includes('字符数组') && !description.includes('排序'))) {
    return 180; // 增加默认返回值：140 -> 180
  }

  const sectionY = 180; // 增加区域起始位置：145 -> 180
  const centerX = containerWidth / 2 - 50;

  // 区域背景
  group.append('rect')
    .attr('x', padding - 10)
    .attr('y', sectionY - 10)
    .attr('width', containerWidth - padding * 2 + 20)
    .attr('height', 85) // 增加区域高度：70 -> 85
    .attr('rx', 8)
    .style('fill', '#f0f9ff')
    .style('stroke', '#bae6fd')
    .style('stroke-width', 1);

  // 标题
  const titleGroup = group.append('g').attr('transform', `translate(${padding}, ${sectionY + 5})`);
  
  titleGroup.append('text')
    .attr('x', 0)
    .attr('y', 0)
    .style('font-size', '14px')
    .text(description.includes('排序') ? '🔄' : '✂️');

  titleGroup.append('text')
    .attr('x', 22)
    .attr('y', 0)
    .style('font-size', '12px')
    .style('font-weight', '600')
    .style('fill', COLORS.info)
    .text(description.includes('排序') ? '排序字符' : '拆分字符');

  // 绘制字符数组
  const charArrayX = centerX - (array.length * (charBoxSize + 4)) / 2;
  const charArrayY = sectionY + 30; // 增加字符数组位置：25 -> 30

  array.forEach((char, i) => {
    const x = charArrayX + i * (charBoxSize + 4);
    
    group.append('rect')
      .attr('x', x)
      .attr('y', charArrayY)
      .attr('width', charBoxSize)
      .attr('height', charBoxSize)
      .attr('rx', 4)
      .style('fill', COLORS.infoLight)
      .style('stroke', COLORS.info)
      .style('stroke-width', 1);

    group.append('text')
      .attr('x', x + charBoxSize / 2)
      .attr('y', charArrayY + charBoxSize / 2 + 4)
      .attr('text-anchor', 'middle')
      .style('font-size', '13px')
      .style('font-family', "'Monaco', 'Menlo', monospace")
      .style('fill', '#0e7490')
      .style('font-weight', '600')
      .text(char);
  });

  // 如果是排序步骤，显示排序后的结果提示
  if (description.includes('排序')) {
    const sortedStr = array.join('');
    group.append('text')
      .attr('x', centerX)
      .attr('y', charArrayY + charBoxSize + 18) // 增加提示文字间距：15 -> 18
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('fill', COLORS.info)
      .text(`排序结果: "${sortedStr}"`);
  }

  return sectionY + 110; // 增加返回值：90 -> 110
}

// 绘制分组结果区域
function drawGroupsSection(
  group: d3.Selection<SVGGElement, unknown, null, undefined>,
  step: AlgorithmStep,
  padding: number,
  boxWidth: number,
  boxHeight: number,
  boxGap: number,
  startY: number
) {
  const groups = step.groups;
  const groupBoxWidth = 70;
  const rowHeight = 60; // 增加行高：48 -> 60

  // 标题带图标
  const titleGroup = group.append('g').attr('transform', `translate(${padding}, ${startY})`);
  
  titleGroup.append('text')
    .attr('x', 0)
    .attr('y', 0)
    .style('font-size', '14px')
    .text('🗂️');

  titleGroup.append('text')
    .attr('x', 22)
    .attr('y', 0)
    .style('font-size', '13px')
    .style('font-weight', '600')
    .style('fill', COLORS.text)
    .text('分组结果 HashMap<String, List>');

  // 空状态
  if (groups.size === 0) {
    group.append('rect')
      .attr('x', padding)
      .attr('y', startY + 25) // 增加空状态位置：20 -> 25
      .attr('width', 120)
      .attr('height', 32)
      .attr('rx', 6)
      .style('fill', '#f9fafb')
      .style('stroke', '#e5e7eb')
      .style('stroke-dasharray', '4,2');

    group.append('text')
      .attr('x', padding + 60)
      .attr('y', startY + 45) // 增加空状态文字位置：40 -> 45
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#9ca3af')
      .text('空 HashMap');
    return;
  }

  // 绘制每个分组
  let rowIndex = 0;
  groups.forEach((strings, key) => {
    const groupY = startY + 40 + rowIndex * rowHeight; // 增加起始位置：35 -> 40
    const groupX = padding;
    const isCurrentKey = key === step.currentKey;

    // Key框
    group.append('rect')
      .attr('x', groupX)
      .attr('y', groupY)
      .attr('width', groupBoxWidth)
      .attr('height', boxHeight)
      .attr('rx', 6)
      .style('fill', isCurrentKey ? COLORS.successLight : '#dcfce7')
      .style('stroke', COLORS.success)
      .style('stroke-width', isCurrentKey ? 2 : 1);

    // Key图标
    group.append('text')
      .attr('x', groupX + 8)
      .attr('y', groupY + boxHeight / 2 + 4)
      .style('font-size', '10px')
      .text('🔑');

    // Key文字
    group.append('text')
      .attr('x', groupX + 22)
      .attr('y', groupY + boxHeight / 2 + 4)
      .style('font-size', '11px')
      .style('font-family', "'Monaco', 'Menlo', monospace")
      .style('fill', '#166534')
      .style('font-weight', isCurrentKey ? '600' : 'normal')
      .text(`"${key}"`);

    // 当前key标签
    if (isCurrentKey) {
      group.append('text')
        .attr('x', groupX + groupBoxWidth / 2)
        .attr('y', groupY - 8) // 增加标签间距：-6 -> -8
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('fill', COLORS.success)
        .style('font-weight', '500')
        .text('⬇ 当前key');
    }

    // 箭头
    group.append('text')
      .attr('x', groupX + groupBoxWidth + 8)
      .attr('y', groupY + boxHeight / 2 + 4)
      .style('font-size', '16px')
      .style('fill', COLORS.gray)
      .text('→');

    // 值列表
    const valuesX = groupX + groupBoxWidth + 28;
    strings.forEach((str, i) => {
      const valueX = valuesX + i * (boxWidth + boxGap);
      const isHighlighted = step.highlightedElements.includes(str);
      const isNewlyAdded = isHighlighted && str === step.currentString && step.description.includes('添加到');

      group.append('rect')
        .attr('x', valueX)
        .attr('y', groupY)
        .attr('width', boxWidth)
        .attr('height', boxHeight)
        .attr('rx', 6)
        .style('fill', isHighlighted ? '#bfdbfe' : '#dbeafe')
        .style('stroke', COLORS.primary)
        .style('stroke-width', isHighlighted ? 2 : 1);

      group.append('text')
        .attr('x', valueX + boxWidth / 2)
        .attr('y', groupY + boxHeight / 2 + 4)
        .attr('text-anchor', 'middle')
        .style('font-size', '11px')
        .style('font-family', "'Monaco', 'Menlo', monospace")
        .style('fill', '#1e40af')
        .style('font-weight', isHighlighted ? '600' : 'normal')
        .text(`"${str}"`);

      // 新增标签
      if (isNewlyAdded) {
        group.append('text')
          .attr('x', valueX + boxWidth / 2)
          .attr('y', groupY - 8) // 增加标签间距：-6 -> -8
          .attr('text-anchor', 'middle')
          .style('font-size', '10px')
          .style('fill', COLORS.primary)
          .style('font-weight', '500')
          .text('✨ 新增');
      }
    });

    rowIndex++;
  });
}

// 获取操作标签
function getActionLabel(step: AlgorithmStep): string | null {
  const desc = step.description;
  
  if (desc.includes('遍历第')) return '📍 当前处理';
  if (desc.includes('转换为字符数组')) return '✂️ 拆分字符';
  if (desc.includes('排序字符数组')) return '🔄 排序中';
  if (desc.includes('生成分组键')) return `🔑 key: "${step.currentKey}"`;
  if (desc.includes('已存在于map中')) return '✓ key已存在';
  if (desc.includes('不存在，需要创建')) return '➕ 创建新分组';
  if (desc.includes('创建新的空列表')) return '📝 新建列表';
  if (desc.includes('添加到键')) return '📥 添加到分组';
  
  return null;
}
