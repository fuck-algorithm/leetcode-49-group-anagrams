import * as d3 from 'd3';

// 动画配置
export const ANIMATION_CONFIG = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    bounce: d3.easeBounceOut,
    elastic: d3.easeElasticOut,
    smooth: d3.easeCubicInOut,
    linear: d3.easeLinear,
  },
  pulse: {
    scale: 1.1,
    duration: 300,
  },
};

// 颜色配置
export const COLORS = {
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
  highlight: '#fbbf24',
  highlightGlow: 'rgba(251, 191, 36, 0.5)',
};

// 脉冲动画效果
export function pulseAnimation(
  selection: d3.Selection<SVGElement, unknown, null, undefined>,
  color: string = COLORS.warning
) {
  selection
    .transition()
    .duration(ANIMATION_CONFIG.pulse.duration)
    .attr('transform', `scale(${ANIMATION_CONFIG.pulse.scale})`)
    .style('filter', `drop-shadow(0 0 8px ${color})`)
    .transition()
    .duration(ANIMATION_CONFIG.pulse.duration)
    .attr('transform', 'scale(1)')
    .style('filter', 'none');
}

// 淡入动画
export function fadeIn(
  selection: d3.Selection<SVGElement, unknown, null, undefined>,
  duration: number = ANIMATION_CONFIG.duration.normal
) {
  selection
    .style('opacity', 0)
    .transition()
    .duration(duration)
    .style('opacity', 1);
}

// 滑入动画
export function slideIn(
  selection: d3.Selection<SVGElement, unknown, null, undefined>,
  direction: 'left' | 'right' | 'top' | 'bottom' = 'left',
  distance: number = 20,
  duration: number = ANIMATION_CONFIG.duration.normal
) {
  const transforms: Record<string, string> = {
    left: `translate(-${distance}, 0)`,
    right: `translate(${distance}, 0)`,
    top: `translate(0, -${distance})`,
    bottom: `translate(0, ${distance})`,
  };

  selection
    .attr('transform', transforms[direction])
    .style('opacity', 0)
    .transition()
    .duration(duration)
    .ease(ANIMATION_CONFIG.easing.smooth)
    .attr('transform', 'translate(0, 0)')
    .style('opacity', 1);
}

// 高亮闪烁动画
export function highlightFlash(
  selection: d3.Selection<SVGRectElement, unknown, null, undefined>,
  originalFill: string,
  highlightFill: string = COLORS.warningLight,
  times: number = 2
) {
  let chain = selection.transition();
  
  for (let i = 0; i < times; i++) {
    chain = chain
      .duration(150)
      .style('fill', highlightFill)
      .transition()
      .duration(150)
      .style('fill', originalFill);
  }
  
  return chain;
}

// 创建发光滤镜
export function createGlowFilter(
  defs: d3.Selection<SVGDefsElement, unknown, null, undefined>,
  id: string,
  color: string = COLORS.warning,
  stdDeviation: number = 3
) {
  const filter = defs.append('filter')
    .attr('id', id)
    .attr('x', '-50%')
    .attr('y', '-50%')
    .attr('width', '200%')
    .attr('height', '200%');

  filter.append('feGaussianBlur')
    .attr('in', 'SourceGraphic')
    .attr('stdDeviation', stdDeviation)
    .attr('result', 'blur');

  filter.append('feFlood')
    .attr('flood-color', color)
    .attr('flood-opacity', 0.5)
    .attr('result', 'color');

  filter.append('feComposite')
    .attr('in', 'color')
    .attr('in2', 'blur')
    .attr('operator', 'in')
    .attr('result', 'glow');

  const merge = filter.append('feMerge');
  merge.append('feMergeNode').attr('in', 'glow');
  merge.append('feMergeNode').attr('in', 'SourceGraphic');

  return filter;
}

// 创建箭头标记
export function createArrowMarker(
  defs: d3.Selection<SVGDefsElement, unknown, null, undefined>,
  id: string,
  color: string = COLORS.gray
) {
  defs.append('marker')
    .attr('id', id)
    .attr('markerWidth', 10)
    .attr('markerHeight', 7)
    .attr('refX', 9)
    .attr('refY', 3.5)
    .attr('orient', 'auto')
    .append('polygon')
    .attr('points', '0 0, 10 3.5, 0 7')
    .style('fill', color);
}

// 绘制数据流动画（粒子效果）
export function drawDataFlowAnimation(
  group: d3.Selection<SVGGElement, unknown, null, undefined>,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  color: string = COLORS.primary,
  duration: number = 800
) {
  const particle = group.append('circle')
    .attr('cx', startX)
    .attr('cy', startY)
    .attr('r', 4)
    .style('fill', color)
    .style('filter', `drop-shadow(0 0 4px ${color})`);

  particle
    .transition()
    .duration(duration)
    .ease(ANIMATION_CONFIG.easing.smooth)
    .attr('cx', endX)
    .attr('cy', endY)
    .on('end', function() {
      d3.select(this).remove();
    });

  return particle;
}

// 绘制连接线动画
export function drawConnectionLine(
  group: d3.Selection<SVGGElement, unknown, null, undefined>,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  color: string = COLORS.gray,
  animated: boolean = true
) {
  const line = group.append('line')
    .attr('x1', startX)
    .attr('y1', startY)
    .attr('x2', animated ? startX : endX)
    .attr('y2', animated ? startY : endY)
    .style('stroke', color)
    .style('stroke-width', 2)
    .style('stroke-dasharray', '4,2');

  if (animated) {
    line
      .transition()
      .duration(ANIMATION_CONFIG.duration.normal)
      .attr('x2', endX)
      .attr('y2', endY);
  }

  return line;
}

// 状态标签类型
export type StatusLabelType = 
  | 'processing' 
  | 'completed' 
  | 'new' 
  | 'comparing' 
  | 'sorting'
  | 'adding';

// 状态标签配置
export const STATUS_LABELS: Record<StatusLabelType, { text: string; icon: string; color: string }> = {
  processing: { text: '处理中', icon: '⚙️', color: COLORS.warning },
  completed: { text: '已完成', icon: '✓', color: COLORS.success },
  new: { text: '新增', icon: '✨', color: COLORS.primary },
  comparing: { text: '比较中', icon: '⚖️', color: COLORS.info },
  sorting: { text: '排序中', icon: '🔄', color: COLORS.info },
  adding: { text: '添加中', icon: '📥', color: COLORS.primary },
};

// 绘制状态标签
export function drawStatusLabel(
  group: d3.Selection<SVGGElement, unknown, null, undefined>,
  x: number,
  y: number,
  type: StatusLabelType,
  animated: boolean = true
) {
  const config = STATUS_LABELS[type];
  const labelWidth = config.text.length * 8 + 30;
  
  const labelGroup = group.append('g')
    .attr('class', 'status-label')
    .attr('transform', `translate(${x - labelWidth / 2}, ${y})`);

  // 背景
  labelGroup.append('rect')
    .attr('width', labelWidth)
    .attr('height', 20)
    .attr('rx', 10)
    .style('fill', config.color);

  // 图标
  labelGroup.append('text')
    .attr('x', 8)
    .attr('y', 14)
    .style('font-size', '10px')
    .text(config.icon);

  // 文字
  labelGroup.append('text')
    .attr('x', 22)
    .attr('y', 14)
    .style('font-size', '10px')
    .style('fill', COLORS.white)
    .style('font-weight', '500')
    .text(config.text);

  if (animated) {
    labelGroup
      .style('opacity', 0)
      .attr('transform', `translate(${x - labelWidth / 2}, ${y - 10})`)
      .transition()
      .duration(ANIMATION_CONFIG.duration.fast)
      .style('opacity', 1)
      .attr('transform', `translate(${x - labelWidth / 2}, ${y})`);
  }

  return labelGroup;
}

// 绘制进度指示器
export function drawProgressIndicator(
  group: d3.Selection<SVGGElement, unknown, null, undefined>,
  x: number,
  y: number,
  current: number,
  total: number,
  width: number = 100
) {
  const progress = (current / total) * 100;
  
  const indicatorGroup = group.append('g')
    .attr('transform', `translate(${x}, ${y})`);

  // 背景条
  indicatorGroup.append('rect')
    .attr('width', width)
    .attr('height', 4)
    .attr('rx', 2)
    .style('fill', COLORS.grayLight);

  // 进度条
  indicatorGroup.append('rect')
    .attr('width', 0)
    .attr('height', 4)
    .attr('rx', 2)
    .style('fill', COLORS.primary)
    .transition()
    .duration(ANIMATION_CONFIG.duration.normal)
    .attr('width', (progress / 100) * width);

  // 文字
  indicatorGroup.append('text')
    .attr('x', width + 8)
    .attr('y', 4)
    .style('font-size', '10px')
    .style('fill', COLORS.textLight)
    .text(`${current}/${total}`);

  return indicatorGroup;
}
