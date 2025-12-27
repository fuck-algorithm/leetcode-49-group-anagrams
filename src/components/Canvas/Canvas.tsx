import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { AlgorithmStep } from '../../types';
import { 
  COLORS, 
  ANIMATION_CONFIG,
  createGlowFilter,
  createArrowMarker,
  drawStatusLabel,
  drawDataFlowAnimation,
} from '../../utils/canvasAnimations';
import './Canvas.css';

interface CanvasProps {
  currentStep: AlgorithmStep | null;
}

export function Canvas({ currentStep }: CanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [prevStep, setPrevStep] = useState<AlgorithmStep | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !currentStep) return;

    const svg = d3.select(svgRef.current);
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const mainGroup = svg.append('g').attr('class', 'main-group');

    // 创建滤镜和标记
    const defs = svg.append('defs');
    createGlowFilter(defs, 'glow-warning', COLORS.warning);
    createGlowFilter(defs, 'glow-primary', COLORS.primary);
    createGlowFilter(defs, 'glow-success', COLORS.success);
    createArrowMarker(defs, 'arrow', COLORS.gray);
    createArrowMarker(defs, 'arrow-primary', COLORS.primary);

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        mainGroup.attr('transform', event.transform);
      });

    svg.call(zoom);

    drawVisualization(mainGroup, currentStep, width, prevStep);
    setPrevStep(currentStep);

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
  containerWidth: number,
  prevStep: AlgorithmStep | null
) {
  const padding = 30;
  const boxWidth = 55;
  const boxHeight = 28;
  const boxGap = 8;
  const charBoxSize = 24;

  // 检测是否有新增内容
  const isNewStep = !prevStep || prevStep.stepIndex !== step.stepIndex;
  const hasNewGroup = prevStep && step.groups.size > prevStep.groups.size;

  // 绘制输入数组区域
  drawInputArraySection(group, step, padding, boxWidth, boxHeight, boxGap, isNewStep);

  // 绘制字符数组处理区域
  const charArrayY = drawCharArraySection(group, step, padding, charBoxSize, containerWidth, isNewStep);

  // 绘制分组结果区域
  drawGroupsSection(group, step, padding, boxWidth, boxHeight, boxGap, charArrayY, isNewStep, hasNewGroup);
}

// 绘制输入数组区域
function drawInputArraySection(
  group: d3.Selection<SVGGElement, unknown, null, undefined>,
  step: AlgorithmStep,
  padding: number,
  boxWidth: number,
  boxHeight: number,
  boxGap: number,
  animate: boolean
) {
  const inputArray = step.inputArray;
  const startY = 30;

  // 标题带图标
  const titleGroup = group.append('g').attr('transform', `translate(${padding}, ${startY})`);
  
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
  const arrayY = startY + 30;
  inputArray.forEach((str, i) => {
    const x = padding + i * (boxWidth + boxGap);
    const isHighlighted = step.highlightedElements.includes(str) && str === step.currentString;

    // 索引标签
    group.append('text')
      .attr('x', x + boxWidth / 2)
      .attr('y', arrayY - 8)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', COLORS.textLight)
      .text(`[${i}]`);

    // 元素框
    const rect = group.append('rect')
      .attr('x', x)
      .attr('y', arrayY)
      .attr('width', boxWidth)
      .attr('height', boxHeight)
      .attr('rx', 6)
      .style('fill', isHighlighted ? COLORS.warningLight : COLORS.grayLight)
      .style('stroke', isHighlighted ? COLORS.warning : '#d1d5db')
      .style('stroke-width', isHighlighted ? 2 : 1)
      .style('transition', 'all 0.3s ease');

    // 高亮时添加发光效果
    if (isHighlighted) {
      rect.style('filter', 'url(#glow-warning)');
    }

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
      const arrowY = arrayY + boxHeight + 18;

      // 指示箭头（带动画）
      const arrow = group.append('path')
        .attr('d', `M ${arrowX} ${arrowY} L ${arrowX - 6} ${arrowY + 10} L ${arrowX + 6} ${arrowY + 10} Z`)
        .style('fill', COLORS.warning);

      if (animate) {
        arrow
          .style('opacity', 0)
          .attr('transform', `translate(0, -5)`)
          .transition()
          .duration(ANIMATION_CONFIG.duration.fast)
          .style('opacity', 1)
          .attr('transform', 'translate(0, 0)');
      }

      // 操作标签
      const actionLabel = getActionLabel(step);
      if (actionLabel) {
        const labelWidth = Math.max(actionLabel.length * 7 + 20, 80);
        
        const labelGroup = group.append('g')
          .attr('transform', `translate(${arrowX - labelWidth / 2}, ${arrowY + 18})`);

        labelGroup.append('rect')
          .attr('width', labelWidth)
          .attr('height', 22)
          .attr('rx', 11)
          .style('fill', COLORS.primary);

        labelGroup.append('text')
          .attr('x', labelWidth / 2)
          .attr('y', 14)
          .attr('text-anchor', 'middle')
          .style('font-size', '11px')
          .style('fill', COLORS.white)
          .style('font-weight', '500')
          .text(actionLabel);

        if (animate) {
          labelGroup
            .style('opacity', 0)
            .transition()
            .duration(ANIMATION_CONFIG.duration.normal)
            .style('opacity', 1);
        }
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
  containerWidth: number,
  animate: boolean
): number {
  const variables = step.variables as Record<string, unknown>;
  const array = variables.array as string[] | undefined;
  const description = step.description;
  
  if (!array || (!description.includes('字符数组') && !description.includes('排序'))) {
    return 180;
  }

  const sectionY = 180;
  const centerX = containerWidth / 2 - 50;

  // 区域背景（带动画）
  const bgRect = group.append('rect')
    .attr('x', padding - 10)
    .attr('y', sectionY - 10)
    .attr('width', containerWidth - padding * 2 + 20)
    .attr('height', 85)
    .attr('rx', 8)
    .style('fill', '#f0f9ff')
    .style('stroke', '#bae6fd')
    .style('stroke-width', 1);

  if (animate) {
    bgRect
      .style('opacity', 0)
      .transition()
      .duration(ANIMATION_CONFIG.duration.fast)
      .style('opacity', 1);
  }

  // 标题
  const titleGroup = group.append('g').attr('transform', `translate(${padding}, ${sectionY + 5})`);
  const isSorting = description.includes('排序');
  
  titleGroup.append('text')
    .attr('x', 0)
    .attr('y', 0)
    .style('font-size', '14px')
    .text(isSorting ? '🔄' : '✂️');

  titleGroup.append('text')
    .attr('x', 22)
    .attr('y', 0)
    .style('font-size', '12px')
    .style('font-weight', '600')
    .style('fill', COLORS.info)
    .text(isSorting ? '排序字符' : '拆分字符');

  // 添加状态标签
  if (isSorting) {
    drawStatusLabel(group, centerX + 80, sectionY - 5, 'sorting', animate);
  }

  // 绘制字符数组
  const charArrayX = centerX - (array.length * (charBoxSize + 4)) / 2;
  const charArrayY = sectionY + 30;

  array.forEach((char, i) => {
    const x = charArrayX + i * (charBoxSize + 4);
    
    const charRect = group.append('rect')
      .attr('x', x)
      .attr('y', charArrayY)
      .attr('width', charBoxSize)
      .attr('height', charBoxSize)
      .attr('rx', 4)
      .style('fill', COLORS.infoLight)
      .style('stroke', COLORS.info)
      .style('stroke-width', 1);

    const charText = group.append('text')
      .attr('x', x + charBoxSize / 2)
      .attr('y', charArrayY + charBoxSize / 2 + 4)
      .attr('text-anchor', 'middle')
      .style('font-size', '13px')
      .style('font-family', "'Monaco', 'Menlo', monospace")
      .style('fill', '#0e7490')
      .style('font-weight', '600')
      .text(char);

    // 字符动画
    if (animate) {
      charRect
        .style('opacity', 0)
        .attr('transform', `translate(0, -10)`)
        .transition()
        .delay(i * 50)
        .duration(ANIMATION_CONFIG.duration.fast)
        .style('opacity', 1)
        .attr('transform', 'translate(0, 0)');

      charText
        .style('opacity', 0)
        .transition()
        .delay(i * 50 + 100)
        .duration(ANIMATION_CONFIG.duration.fast)
        .style('opacity', 1);
    }
  });

  // 排序结果提示
  if (isSorting) {
    const sortedStr = array.join('');
    group.append('text')
      .attr('x', centerX)
      .attr('y', charArrayY + charBoxSize + 18)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('fill', COLORS.info)
      .text(`排序结果: "${sortedStr}"`);
  }

  return sectionY + 110;
}

// 绘制分组结果区域
function drawGroupsSection(
  group: d3.Selection<SVGGElement, unknown, null, undefined>,
  step: AlgorithmStep,
  padding: number,
  boxWidth: number,
  boxHeight: number,
  boxGap: number,
  startY: number,
  animate: boolean,
  _hasNewGroup: boolean | null
) {
  const groups = step.groups;
  const groupBoxWidth = 70;
  const rowHeight = 60;

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
      .attr('y', startY + 25)
      .attr('width', 120)
      .attr('height', 32)
      .attr('rx', 6)
      .style('fill', '#f9fafb')
      .style('stroke', '#e5e7eb')
      .style('stroke-dasharray', '4,2');

    group.append('text')
      .attr('x', padding + 60)
      .attr('y', startY + 45)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#9ca3af')
      .text('空 HashMap');
    return;
  }

  // 绘制每个分组
  let rowIndex = 0;
  groups.forEach((strings, key) => {
    const groupY = startY + 40 + rowIndex * rowHeight;
    const groupX = padding;
    const isCurrentKey = key === step.currentKey;

    // Key框
    const keyRect = group.append('rect')
      .attr('x', groupX)
      .attr('y', groupY)
      .attr('width', groupBoxWidth)
      .attr('height', boxHeight)
      .attr('rx', 6)
      .style('fill', isCurrentKey ? COLORS.successLight : '#dcfce7')
      .style('stroke', COLORS.success)
      .style('stroke-width', isCurrentKey ? 2 : 1)
      .style('transition', 'all 0.3s ease');

    if (isCurrentKey) {
      keyRect.style('filter', 'url(#glow-success)');
    }

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
      drawStatusLabel(group, groupX + groupBoxWidth / 2, groupY - 18, 'processing', animate);
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

      const valueRect = group.append('rect')
        .attr('x', valueX)
        .attr('y', groupY)
        .attr('width', boxWidth)
        .attr('height', boxHeight)
        .attr('rx', 6)
        .style('fill', isHighlighted ? '#bfdbfe' : '#dbeafe')
        .style('stroke', COLORS.primary)
        .style('stroke-width', isHighlighted ? 2 : 1)
        .style('transition', 'all 0.3s ease');

      if (isHighlighted) {
        valueRect.style('filter', 'url(#glow-primary)');
      }

      group.append('text')
        .attr('x', valueX + boxWidth / 2)
        .attr('y', groupY + boxHeight / 2 + 4)
        .attr('text-anchor', 'middle')
        .style('font-size', '11px')
        .style('font-family', "'Monaco', 'Menlo', monospace")
        .style('fill', '#1e40af')
        .style('font-weight', isHighlighted ? '600' : 'normal')
        .text(`"${str}"`);

      // 新增标签和动画
      if (isNewlyAdded) {
        drawStatusLabel(group, valueX + boxWidth / 2, groupY - 18, 'new', animate);
        
        // 数据流动画
        if (animate && step.currentString) {
          const inputIndex = step.inputArray.indexOf(step.currentString);
          if (inputIndex >= 0) {
            const startX = padding + inputIndex * (boxWidth + boxGap) + boxWidth / 2;
            const startYPos = 30 + 30 + boxHeight;
            drawDataFlowAnimation(group, startX, startYPos, valueX + boxWidth / 2, groupY, COLORS.primary, 600);
          }
        }
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
