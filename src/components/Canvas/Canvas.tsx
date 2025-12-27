import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { AlgorithmStep } from '../../types';
import './Canvas.css';

interface CanvasProps {
  currentStep: AlgorithmStep | null;
}

export function Canvas({ currentStep }: CanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !currentStep) return;

    const svg = d3.select(svgRef.current);
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 清除之前的内容
    svg.selectAll('*').remove();

    // 设置SVG尺寸
    svg.attr('width', width).attr('height', height);

    // 创建主组用于缩放和平移
    const mainGroup = svg.append('g').attr('class', 'main-group');

    // 添加缩放行为
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        mainGroup.attr('transform', event.transform);
      });

    svg.call(zoom);

    // 绘制内容
    drawVisualization(mainGroup, currentStep);

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
  step: AlgorithmStep
) {
  const padding = 40;
  const boxWidth = 60;
  const boxHeight = 30;
  const boxGap = 10;

  // 绘制输入数组标题
  group.append('text')
    .attr('x', padding)
    .attr('y', 30)
    .attr('class', 'section-title')
    .style('font-size', '14px')
    .style('font-weight', '600')
    .style('fill', '#495057')
    .text('输入数组');

  // 绘制输入数组
  const inputArray = step.inputArray;
  inputArray.forEach((str, i) => {
    const x = padding + i * (boxWidth + boxGap);
    const y = 45;
    const isHighlighted = step.highlightedElements.includes(str) && str === step.currentString;

    // 绘制方框
    group.append('rect')
      .attr('x', x)
      .attr('y', y)
      .attr('width', boxWidth)
      .attr('height', boxHeight)
      .attr('rx', 4)
      .style('fill', isHighlighted ? '#fff3cd' : '#e9ecef')
      .style('stroke', isHighlighted ? '#ffc107' : '#ced4da')
      .style('stroke-width', isHighlighted ? 2 : 1);

    // 绘制文字
    group.append('text')
      .attr('x', x + boxWidth / 2)
      .attr('y', y + boxHeight / 2 + 4)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-family', "'Monaco', 'Menlo', monospace")
      .style('fill', isHighlighted ? '#856404' : '#495057')
      .style('font-weight', isHighlighted ? '600' : 'normal')
      .text(`"${str}"`);
  });

  // 如果有当前处理的字符串，显示箭头和操作说明标签
  if (step.currentString !== undefined) {
    const currentIndex = inputArray.indexOf(step.currentString);
    if (currentIndex >= 0) {
      const arrowX = padding + currentIndex * (boxWidth + boxGap) + boxWidth / 2;
      const arrowY = 45 + boxHeight + 5;
      
      // 绘制指向当前元素的箭头
      group.append('text')
        .attr('x', arrowX)
        .attr('y', arrowY + 15)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('fill', '#ffc107')
        .text('▲');
      
      // 在箭头下方添加操作说明标签
      const actionLabel = getActionLabel(step);
      if (actionLabel) {
        // 标签背景
        const labelWidth = actionLabel.length * 8 + 16;
        group.append('rect')
          .attr('x', arrowX - labelWidth / 2)
          .attr('y', arrowY + 20)
          .attr('width', labelWidth)
          .attr('height', 22)
          .attr('rx', 4)
          .style('fill', '#2563eb')
          .style('opacity', 0.9);
        
        // 标签文字
        group.append('text')
          .attr('x', arrowX)
          .attr('y', arrowY + 35)
          .attr('text-anchor', 'middle')
          .style('font-size', '11px')
          .style('fill', '#ffffff')
          .style('font-weight', '500')
          .text(actionLabel);
      }
    }
  }

  // 绘制分组结果标题
  const groupsY = 150;
  group.append('text')
    .attr('x', padding)
    .attr('y', groupsY)
    .style('font-size', '14px')
    .style('font-weight', '600')
    .style('fill', '#495057')
    .text('分组结果 (HashMap)');

  // 绘制分组 - 每个key一行
  const groups = step.groups;
  const groupBoxWidth = 80;
  const groupBoxHeight = 28;
  const rowHeight = 45; // 增加行高以容纳标签

  // 将分组转换为数组，每个key一行
  let rowIndex = 0;
  groups.forEach((strings, key) => {
    const groupY = groupsY + 25 + rowIndex * rowHeight;
    const groupX = padding;

    // 绘制key框
    const isCurrentKey = key === step.currentKey;
    group.append('rect')
      .attr('x', groupX)
      .attr('y', groupY)
      .attr('width', groupBoxWidth)
      .attr('height', groupBoxHeight)
      .attr('rx', 4)
      .style('fill', isCurrentKey ? '#c3e6cb' : '#d4edda')
      .style('stroke', '#28a745')
      .style('stroke-width', isCurrentKey ? 2 : 1);

    group.append('text')
      .attr('x', groupX + groupBoxWidth / 2)
      .attr('y', groupY + groupBoxHeight / 2 + 4)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('font-family', "'Monaco', 'Menlo', monospace")
      .style('fill', '#155724')
      .text(`"${key}"`);

    // 如果是当前key，添加"排序后的key"标签
    if (isCurrentKey) {
      group.append('text')
        .attr('x', groupX + groupBoxWidth / 2)
        .attr('y', groupY - 6)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('fill', '#28a745')
        .style('font-weight', '500')
        .text('排序后的key');
    }

    // 绘制箭头
    group.append('text')
      .attr('x', groupX + groupBoxWidth + 8)
      .attr('y', groupY + groupBoxHeight / 2 + 4)
      .style('font-size', '14px')
      .style('fill', '#6c757d')
      .text('→');

    // 绘制值列表
    const valuesX = groupX + groupBoxWidth + 25;
    strings.forEach((str, i) => {
      const valueX = valuesX + i * (boxWidth + 5);
      const isHighlighted = step.highlightedElements.includes(str);
      const isNewlyAdded = isHighlighted && str === step.currentString;

      group.append('rect')
        .attr('x', valueX)
        .attr('y', groupY)
        .attr('width', boxWidth)
        .attr('height', groupBoxHeight)
        .attr('rx', 4)
        .style('fill', isHighlighted ? '#b8daff' : '#cce5ff')
        .style('stroke', '#007bff')
        .style('stroke-width', isHighlighted ? 2 : 1);

      group.append('text')
        .attr('x', valueX + boxWidth / 2)
        .attr('y', groupY + groupBoxHeight / 2 + 4)
        .attr('text-anchor', 'middle')
        .style('font-size', '11px')
        .style('font-family', "'Monaco', 'Menlo', monospace")
        .style('fill', '#004085')
        .text(`"${str}"`);

      // 如果是新添加的元素，显示"新增"标签
      if (isNewlyAdded && step.description.includes('添加到')) {
        group.append('text')
          .attr('x', valueX + boxWidth / 2)
          .attr('y', groupY - 6)
          .attr('text-anchor', 'middle')
          .style('font-size', '10px')
          .style('fill', '#007bff')
          .style('font-weight', '500')
          .text('✓ 新增');
      }
    });

    rowIndex++;
  });

  // 如果有当前key且正在添加元素，绘制从输入数组到分组的连接箭头
  if (step.currentString !== undefined && step.currentKey !== undefined && step.description.includes('添加到')) {
    const currentIndex = inputArray.indexOf(step.currentString);
    if (currentIndex >= 0) {
      // 找到当前key在分组中的位置
      let targetRowIndex = 0;
      let found = false;
      groups.forEach((_, key) => {
        if (key === step.currentKey) {
          found = true;
        }
        if (!found) targetRowIndex++;
      });

      const startX = padding + currentIndex * (boxWidth + boxGap) + boxWidth / 2;
      const startY = 45 + boxHeight + 45; // 在操作标签下方
      const endY = groupsY + 25 + targetRowIndex * rowHeight;
      const endX = padding + groupBoxWidth / 2;

      // 绘制曲线箭头
      const midY = (startY + endY) / 2;
      group.append('path')
        .attr('d', `M ${startX} ${startY} Q ${startX} ${midY} ${endX} ${endY}`)
        .style('fill', 'none')
        .style('stroke', '#6c757d')
        .style('stroke-width', 1.5)
        .style('stroke-dasharray', '4,2')
        .attr('marker-end', 'url(#arrowhead)');

      // 定义箭头标记
      const defs = group.append('defs');
      defs.append('marker')
        .attr('id', 'arrowhead')
        .attr('markerWidth', 10)
        .attr('markerHeight', 7)
        .attr('refX', 9)
        .attr('refY', 3.5)
        .attr('orient', 'auto')
        .append('polygon')
        .attr('points', '0 0, 10 3.5, 0 7')
        .style('fill', '#6c757d');
    }
  }

  // 如果没有分组，显示空提示
  if (groups.size === 0) {
    group.append('text')
      .attr('x', padding)
      .attr('y', groupsY + 40)
      .style('font-size', '12px')
      .style('fill', '#adb5bd')
      .style('font-style', 'italic')
      .text('(空)');
  }
}

// 根据步骤获取操作标签
function getActionLabel(step: AlgorithmStep): string | null {
  const desc = step.description;
  
  if (desc.includes('遍历第')) {
    return '当前处理';
  } else if (desc.includes('转换为字符数组')) {
    return '转为字符数组';
  } else if (desc.includes('排序字符数组')) {
    return '排序中...';
  } else if (desc.includes('生成分组键')) {
    return `key: "${step.currentKey}"`;
  } else if (desc.includes('已存在于map中')) {
    return 'key已存在';
  } else if (desc.includes('不存在，需要创建')) {
    return '创建新分组';
  } else if (desc.includes('创建新的空列表')) {
    return '新建列表';
  } else if (desc.includes('添加到键')) {
    return '添加到分组';
  }
  
  return null;
}
