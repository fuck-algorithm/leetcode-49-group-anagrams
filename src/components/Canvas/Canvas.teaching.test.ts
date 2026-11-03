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

  it('retains character identity while sorting letters into a signature', () => {
    const splitStep = steps.find((step) => step.description.includes('转换为字符数组'))!;
    const sortedStep = steps.find((step) => step.description.includes('排序字符数组'))!;
    const splitMarks = buildFrameMarks(splitStep, { width: 800, height: 560, inputY: 12, charY: 120, groupsY: 300, inputBoxWidth: 64, inputLaneHeight: 104, inputPitch: 74, charLaneHeight: 166, groupsHeight: 200 });
    const sortedMarks = buildFrameMarks(sortedStep, { width: 800, height: 560, inputY: 12, charY: 120, groupsY: 300, inputBoxWidth: 64, inputLaneHeight: 104, inputPitch: 74, charLaneHeight: 166, groupsHeight: 200 });
    expect(new Set(splitMarks.filter((mark) => mark.id.startsWith('letter-')).map((mark) => mark.id))).toEqual(new Set(sortedMarks.filter((mark) => mark.id.startsWith('letter-')).map((mark) => mark.id)));
    expect(sortedMarks.find((mark) => mark.id === 'letter-1-source')?.text).toBe('原位 1');
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
    expect(decision?.groups.get('aet')).toEqual(['eat']);
  });
});
