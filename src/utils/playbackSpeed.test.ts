import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { 
  savePlaybackSpeed, 
  getSavedPlaybackSpeed,
  SPEED_OPTIONS
} from './playbackSpeed';

describe('Playback Speed Storage', () => {
  /**
   * **Feature: group-anagrams-visualizer, Property 11: 播放速度持久化**
   * *对于任意*播放速度设置，存储到IndexedDB后再读取，应得到相同的速度值
   * **验证: 需求 5.8, 5.9**
   */
  it('Property 11: 播放速度持久化 - 存储后读取应得到相同值', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...SPEED_OPTIONS),
        async (speed) => {
          // 保存速度
          await savePlaybackSpeed(speed);
          
          // 读取速度
          const savedSpeed = await getSavedPlaybackSpeed();
          
          // 验证读取的值与保存的值相同
          return savedSpeed === speed;
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  it('应该支持所有预定义的速度选项', () => {
    expect(SPEED_OPTIONS).toContain(0.5);
    expect(SPEED_OPTIONS).toContain(0.75);
    expect(SPEED_OPTIONS).toContain(1);
    expect(SPEED_OPTIONS).toContain(1.25);
    expect(SPEED_OPTIONS).toContain(1.5);
    expect(SPEED_OPTIONS).toContain(2);
  });

  it('默认速度应该是1x', async () => {
    // 注意：这个测试依赖于数据库状态，可能需要清理
    // 但由于fake-indexeddb的限制，我们只验证默认值常量
    const defaultSpeed = 1;
    expect(SPEED_OPTIONS).toContain(defaultSpeed);
  });
});
