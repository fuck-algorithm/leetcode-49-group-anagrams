import { describe, expect, it } from 'vitest';
import { generateAlgorithmSteps } from '../../utils/algorithmSteps';
import { getMapAction } from './canvasTeaching';

describe('Canvas teaching decisions', () => {
  const steps = generateAlgorithmSteps(['eat', 'tea']);

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
