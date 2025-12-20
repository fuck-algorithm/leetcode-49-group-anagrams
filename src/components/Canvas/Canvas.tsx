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

  // 如果有当前处理的字符串，显示箭头
  if (step.currentString !== undefined) {
    const currentIndex = inputArray.indexOf(step.currentString);
    if (currentIndex >= 0) {
      const arrowX = padding + currentIndex * (boxWidth + boxGap) + boxWidth / 2;
      const arrowY = 45 + boxHeight + 5;
      
      group.append('text')
        .attr('x', arrowX)
        .attr('y', arrowY + 15)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('fill', '#ffc107')
        .text('▲');
    }
  }

  // 绘制分组结果标题
  const groupsY = 130;
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
  const rowHeight = 38; // 每行高度

  // 将分组转换为数组，每个key一行
  let rowIndex = 0;
  groups.forEach((strings, key) => {
    const groupY = groupsY + 20 + rowIndex * rowHeight;
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
    });

    rowIndex++;
  });

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
