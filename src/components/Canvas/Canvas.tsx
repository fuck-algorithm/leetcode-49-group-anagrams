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
  width: number
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
      .attr('class', `input-box ${isHighlighted ? 'highlighted' : ''}`);

    // 绘制文字
    group.append('text')
      .attr('x', x + boxWidth / 2)
      .attr('y', y + boxHeight / 2 + 4)
      .attr('text-anchor', 'middle')
      .attr('class', `input-text ${isHighlighted ? 'highlighted' : ''}`)
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
        .attr('class', 'arrow-indicator')
        .text('▲');
    }
  }

  // 绘制分组结果标题
  const groupsY = 130;
  group.append('text')
    .attr('x', padding)
    .attr('y', groupsY)
    .attr('class', 'section-title')
    .text('分组结果 (HashMap)');

  // 绘制分组
  const groups = step.groups;
  let groupIndex = 0;
  const groupBoxWidth = 80;
  const groupBoxHeight = 28;
  const groupGapX = 20;
  const groupGapY = 60;
  const maxGroupsPerRow = Math.floor((width - 2 * padding) / (groupBoxWidth + groupGapX));

  groups.forEach((strings, key) => {
    const row = Math.floor(groupIndex / maxGroupsPerRow);
    const col = groupIndex % maxGroupsPerRow;
    const groupX = padding + col * (groupBoxWidth + groupGapX + 100);
    const groupY = groupsY + 20 + row * groupGapY;

    // 绘制key框
    const isCurrentKey = key === step.currentKey;
    group.append('rect')
      .attr('x', groupX)
      .attr('y', groupY)
      .attr('width', groupBoxWidth)
      .attr('height', groupBoxHeight)
      .attr('rx', 4)
      .attr('class', `key-box ${isCurrentKey ? 'highlighted' : ''}`);

    group.append('text')
      .attr('x', groupX + groupBoxWidth / 2)
      .attr('y', groupY + groupBoxHeight / 2 + 4)
      .attr('text-anchor', 'middle')
      .attr('class', 'key-text')
      .text(`"${key}"`);

    // 绘制箭头
    group.append('text')
      .attr('x', groupX + groupBoxWidth + 8)
      .attr('y', groupY + groupBoxHeight / 2 + 4)
      .attr('class', 'arrow-text')
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
        .attr('class', `value-box ${isHighlighted ? 'highlighted' : ''}`);

      group.append('text')
        .attr('x', valueX + boxWidth / 2)
        .attr('y', groupY + groupBoxHeight / 2 + 4)
        .attr('text-anchor', 'middle')
        .attr('class', 'value-text')
        .text(`"${str}"`);
    });

    groupIndex++;
  });

  // 如果没有分组，显示空提示
  if (groups.size === 0) {
    group.append('text')
      .attr('x', padding)
      .attr('y', groupsY + 40)
      .attr('class', 'empty-hint')
      .text('(空)');
  }
}
