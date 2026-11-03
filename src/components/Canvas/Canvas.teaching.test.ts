import { describe, expect, it } from 'vitest';
import { generateAlgorithmSteps } from '../../utils/algorithmSteps';
import { getMapAction } from './canvasTeaching';
import { buildFrameMarks } from './renderFrame';

describe('Canvas teaching decisions', () => {
  const steps = generateAlgorithmSteps(['eat', 'tea']);

  it('assigns a distinct semantic action and code anchor to each step', () => {
    expect(steps.every((step) => step.operation && step.narration && step.anchorIds.length > 0)).toBe(true);
    expect(steps.slice(1).every((step, index) => step.narration !== steps[index].narration)).toBe(true);
  });

  it('tracks the exact input index when duplicate words are present', () => {
    const duplicateSteps = generateAlgorithmSteps(['eat', 'eat']);
    const secondRead = duplicateSteps.find((step) => step.operation === 'read' && step.currentIndex === 1)!;
    const marks = buildFrameMarks(secondRead, { width: 800, height: 560, inputY: 12, charY: 120, groupsY: 300, inputBoxWidth: 64, inputLaneHeight: 104, inputPitch: 74, charLaneHeight: 166, groupsHeight: 200 });
    expect(marks.find((mark) => mark.id === 'input-0-card')?.styles?.fill).toBe('#fff');
    expect(marks.find((mark) => mark.id === 'input-1-card')?.styles?.fill).toBe('#fff5d9');
  });

  it('retains character identity while sorting letters into a signature', () => {
    const splitStep = steps.find((step) => step.description.includes('转换为字符数组'))!;
    const sortedStep = steps.find((step) => step.description.includes('排序字符数组'))!;
    const splitMarks = buildFrameMarks(splitStep, { width: 800, height: 560, inputY: 12, charY: 120, groupsY: 300, inputBoxWidth: 64, inputLaneHeight: 104, inputPitch: 74, charLaneHeight: 166, groupsHeight: 200 });
    const sortedMarks = buildFrameMarks(sortedStep, { width: 800, height: 560, inputY: 12, charY: 120, groupsY: 300, inputBoxWidth: 64, inputLaneHeight: 104, inputPitch: 74, charLaneHeight: 166, groupsHeight: 200 });
    expect(new Set(splitMarks.filter((mark) => mark.id.startsWith('letter-')).map((mark) => mark.id))).toEqual(new Set(sortedMarks.filter((mark) => mark.id.startsWith('letter-')).map((mark) => mark.id)));
    const originalA = splitMarks.find((mark) => mark.id === 'letter-0-card')?.attrs?.x;
    const sortedA = sortedMarks.find((mark) => mark.id === 'letter-0-card')?.attrs?.x;
    expect(sortedA).toBeGreaterThan(originalA as number);
    expect(sortedMarks.find((mark) => mark.id === 'letter-0-value')?.text).toBe('e');
    expect(sortedMarks.find((mark) => mark.id === 'letter-0-position')?.text).toBe('原0');
    expect(splitMarks.find((mark) => mark.id === 'signature-value')?.text).toBe('待排序');
    expect(splitMarks.find((mark) => mark.id === 'signature-caption')?.text).toContain('保留原始顺序');
    expect(splitMarks.find((mark) => mark.id === 'letter-0-position')?.text).toBe('0');
  });

  it('does not reveal the Map lookup result while creating a key', () => {
    const keyStep = steps.find((step) => step.description.includes('生成分组键'));
    expect(keyStep).toBeDefined();
    expect(getMapAction(keyStep!).mode).toBe('neutral');
    expect(getMapAction(keyStep!).detail).toContain('下一步再检查');
  });

  it('explains the first signature as a new group, not a cache hit', () => {
    const decision = steps.find((step) => step.description.includes('不存在，需要创建'));
    expect(decision).toBeDefined();
    expect(getMapAction(decision!).mode).toBe('create');
  });

  it('describes the first append as writing a newly-created group', () => {
    const append = steps.find((step) => step.description.includes('添加到键'));
    expect(append).toBeDefined();
    expect(getMapAction(append!).mode).toBe('create');
    expect(getMapAction(append!).detail).toContain('新建的 Map');
  });

  it('explains an anagram signature as a hit and reuses the group', () => {
    const decision = steps.find((step) => step.description.includes('已存在于map中'));
    expect(decision).toBeDefined();
    expect(decision?.currentKey).toBe('aet');
    expect(getMapAction(decision!).mode).toBe('hit');
    const decisionMarks = buildFrameMarks(decision!, { width: 800, height: 560, inputY: 12, charY: 120, groupsY: 300, inputBoxWidth: 64, inputPitch: 74, inputLaneHeight: 104, charLaneHeight: 166, groupsHeight: 200 });
    const append = steps.find((step) => step.description.includes('添加到键') && step.currentString === 'tea')!;
    const appendMarks = buildFrameMarks(append, { width: 800, height: 560, inputY: 12, charY: 120, groupsY: 300, inputBoxWidth: 64, inputPitch: 74, inputLaneHeight: 104, charLaneHeight: 166, groupsHeight: 200 });
    expect(decisionMarks.find((mark) => mark.id === 'map-decision-text')?.text).toContain('复用已有列表');
    expect(decisionMarks.find((mark) => mark.id === 'groups-empty')).toBeUndefined();
    expect(decisionMarks.find((mark) => mark.id === 'group-aet-key-card')?.styles?.fill).toBe('#e0f3ed');
    expect(appendMarks.find((mark) => mark.id === 'map-decision-text')).toBeUndefined();
    expect(appendMarks.find((mark) => mark.id === 'group-aet-value-1-card')?.styles?.fill).toBe('#e5efff');
    expect(decision?.groups.get('aet')).toEqual(['eat']);
  });
});
