import * as d3 from 'd3';

// ============ 动画配置 ============
export const ANIMATION_CONFIG = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
    flow: 700,
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

// ============ 颜色配置（蓝绿主题） ============
export const COLORS = {
  primary: '#2563eb',
  primaryLight: '#3b82f6',
  success: '#22c55e',
  successLight: '#86efac',
  warning: '#f59e0b',
  warningLight: '#fde68a',
  info: '#06b6d4',
  infoLight: '#a5f3fc',
  violet: '#7c3aed',
  violetLight: '#ddd6fe',
  gray: '#6b7280',
  grayLight: '#e5e7eb',
  text: '#1f2937',
  textLight: '#6b7280',
  white: '#ffffff',
  highlight: '#fbbf24',
  highlightGlow: 'rgba(251, 191, 36, 0.5)',
  panelBg: '#f8fafc',
  panelBorder: '#e2e8f0',
};

// ============ 基础动画工具 ============

/** 脉冲缩放+发光 */
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

/** 淡入 */
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

/** 从方向滑入 */
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

// ============ 滤镜 / 标记 ============

/** 发光滤镜 */
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

/** 创建箭头标记 */
export function createArrowMarker(
  defs: d3.Selection<SVGDefsElement, unknown, null, undefined>,
  id: string,
  color: string = COLORS.gray
) {
  defs.append('marker')
    .attr('id', id)
    .attr('markerWidth', 12)
    .attr('markerHeight', 9)
    .attr('refX', 11)
    .attr('refY', 4.5)
    .attr('orient', 'auto')
    .append('polygon')
    .attr('points', '0 0, 12 4.5, 0 9')
    .style('fill', color);
}

/** 背景网格图案（点阵） */
export function createDotPattern(
  defs: d3.Selection<SVGDefsElement, unknown, null, undefined>,
  id: string = 'dot-grid'
) {
  const pattern = defs.append('pattern')
    .attr('id', id)
    .attr('width', 22)
    .attr('height', 22)
    .attr('patternUnits', 'userSpaceOnUse');

  pattern.append('circle')
    .attr('cx', 1)
    .attr('cy', 1)
    .attr('r', 1)
    .style('fill', '#dbeafe')
    .style('opacity', 0.6);

  return pattern;
}

/** 分区卡片渐变背景 */
export function createSectionGradient(
  defs: d3.Selection<SVGDefsElement, unknown, null, undefined>,
  id: string,
  from: string,
  to: string,
  vertical: boolean = true
) {
  const gradient = defs.append('linearGradient')
    .attr('id', id)
    .attr('x1', '0%')
    .attr('y1', '0%')
    .attr('x2', vertical ? '0%' : '100%')
    .attr('y2', vertical ? '100%' : '0%');

  gradient.append('stop').attr('offset', '0%').attr('stop-color', from);
  gradient.append('stop').attr('offset', '100%').attr('stop-color', to);

  return gradient;
}

// ============ 状态标签 ============

export type StatusLabelType =
  | 'processing'
  | 'completed'
  | 'new'
  | 'comparing'
  | 'sorting'
  | 'adding';

export const STATUS_LABELS: Record<StatusLabelType, { text: string; icon: string; color: string }> = {
  processing: { text: '处理中', icon: '⚙️', color: COLORS.warning },
  completed: { text: '已完成', icon: '✓', color: COLORS.success },
  new: { text: '新增', icon: '✨', color: COLORS.primary },
  comparing: { text: '比较中', icon: '⚖️', color: COLORS.info },
  sorting: { text: '排序中', icon: '🔄', color: COLORS.info },
  adding: { text: '添加中', icon: '📥', color: COLORS.primary },
};

/** 绘制状态标签 */
export function drawStatusLabel(
  group: d3.Selection<SVGGElement, unknown, null, undefined>,
  x: number,
  y: number,
  type: StatusLabelType,
  animated: boolean = true
) {
  const config = STATUS_LABELS[type];
  const labelWidth = config.text.length * 8 + 32;

  const labelGroup = group.append('g')
    .attr('class', 'status-label')
    .attr('transform', `translate(${x - labelWidth / 2}, ${y})`);

  labelGroup.append('rect')
    .attr('width', labelWidth)
    .attr('height', 20)
    .attr('rx', 10)
    .style('fill', config.color)
    .style('filter', `drop-shadow(0 2px 4px ${config.color}44)`);

  labelGroup.append('text')
    .attr('x', 9)
    .attr('y', 14)
    .style('font-size', '10px')
    .text(config.icon);

  labelGroup.append('text')
    .attr('x', 24)
    .attr('y', 14)
    .style('font-size', '10px')
    .style('fill', COLORS.white)
    .style('font-weight', '600')
    .text(config.text);

  if (animated) {
    labelGroup
      .style('opacity', 0)
      .attr('transform', `translate(${x - labelWidth / 2}, ${y - 10}) scale(0.8)`)
      .transition()
      .duration(ANIMATION_CONFIG.duration.fast)
      .ease(ANIMATION_CONFIG.easing.elastic)
      .style('opacity', 1)
      .attr('transform', `translate(${x - labelWidth / 2}, ${y}) scale(1)`);
  }

  return labelGroup;
}

// ============ 箭头 / 数据流 ============

/**
 * 绘制贝塞尔曲线箭头（长距离连接），动画沿路径生长
 */
export function drawBezierArrow(
  group: d3.Selection<SVGGElement, unknown, null, undefined>,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  color: string = COLORS.primary,
  animated: boolean = true,
  withArrowhead: boolean = true
) {
  const dx = endX - startX;
  const dy = endY - startY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const controlOffset = Math.min(Math.abs(dx) * 0.4 + 30, dist * 0.5);
  const cp1x = startX;
  const cp1y = startY + controlOffset;
  const cp2x = endX;
  const cp2y = endY - controlOffset;

  const path = group.append('path')
    .attr('d', `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`)
    .style('fill', 'none')
    .style('stroke', color)
    .style('stroke-width', 2.5)
    .style('stroke-linecap', 'round')
    .style('opacity', 0.85)
    .attr('marker-end', withArrowhead ? `url(#arrow-${color.replace('#', '')})` : '');

  if (animated) {
    const pathLength = (path.node() as SVGPathElement).getTotalLength();

    path
      .attr('stroke-dasharray', pathLength)
      .attr('stroke-dashoffset', pathLength)
      .transition()
      .duration(ANIMATION_CONFIG.duration.slow)
      .ease(ANIMATION_CONFIG.easing.smooth)
      .attr('stroke-dashoffset', 0);
  }

  return path;
}

/** 绘制直箭头（短距离），线生长动画 */
export function drawStraightArrow(
  group: d3.Selection<SVGGElement, unknown, null, undefined>,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  color: string = COLORS.primary,
  animated: boolean = true,
  label: string = ''
) {
  const arrowGroup = group.append('g');

  const line = arrowGroup.append('line')
    .attr('x1', startX)
    .attr('y1', startY)
    .attr('x2', animated ? startX : endX)
    .attr('y2', animated ? startY : endY)
    .style('stroke', color)
    .style('stroke-width', 2.5)
    .style('stroke-linecap', 'round')
    .style('opacity', 0.85)
    .attr('marker-end', `url(#arrow-${color.replace('#', '')})`);

  if (animated) {
    line
      .transition()
      .duration(ANIMATION_CONFIG.duration.normal)
      .ease(ANIMATION_CONFIG.easing.smooth)
      .attr('x2', endX)
      .attr('y2', endY);
  }

  // 标签（带小胶囊背景）
  if (label) {
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const labelWidth = label.length * 8 + 18;

    arrowGroup.append('rect')
      .attr('x', midX - labelWidth / 2)
      .attr('y', midY - 11)
      .attr('width', labelWidth)
      .attr('height', 22)
      .attr('rx', 11)
      .style('fill', color)
      .style('filter', `drop-shadow(0 2px 4px ${color}44)`);

    arrowGroup.append('text')
      .attr('x', midX)
      .attr('y', midY + 4)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', 'white')
      .style('font-weight', '600')
      .text(label);

    if (animated) {
      const elems = arrowGroup.selectAll('*');
      elems
        .style('opacity', 0)
        .transition()
        .delay(ANIMATION_CONFIG.duration.normal)
        .duration(ANIMATION_CONFIG.duration.fast)
        .style('opacity', 1);
    }
  }

  return arrowGroup;
}

/** 绘制沿路径运动的粒子（数据流动画） */
export function drawParticleAlongPath(
  group: d3.Selection<SVGGElement, unknown, null, undefined>,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  color: string = COLORS.primary,
  duration: number = ANIMATION_CONFIG.duration.flow
) {
  const controlOffset = Math.abs(endX - startX) * 0.4 + 30;
  const path = group.append('path')
    .attr('d', `M ${startX} ${startY} C ${startX} ${startY + controlOffset}, ${endX} ${endY - controlOffset}, ${endX} ${endY}`)
    .style('fill', 'none')
    .style('stroke', 'none');

  const pathNode = path.node() as SVGPathElement;
  const length = pathNode.getTotalLength();

  // 一串粒子沿路径流动
  const numParticles = 4;
  for (let i = 0; i < numParticles; i++) {
    const circle = group.append('circle')
      .attr('r', 3 + (i % 2))
      .style('fill', color)
      .style('opacity', 0.8)
      .style('filter', `drop-shadow(0 0 4px ${color})`);

    circle
      .transition()
      .delay(i * (duration / numParticles))
      .duration(duration)
      .ease(ANIMATION_CONFIG.easing.smooth)
      .attrTween('transform', () => {
        return (t: number) => {
          const point = pathNode.getPointAtLength(t * length);
          return `translate(${point.x}, ${point.y})`;
        };
      })
      .on('end', function () {
        d3.select(this).remove();
      });
  }

  // 路径用完后移除
  path.remove();

  return;
}

/** 高亮闪烁 */
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
