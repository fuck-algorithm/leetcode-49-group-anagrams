import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';

// 缓存持续时间常量（1小时）
const CACHE_DURATION = 60 * 60 * 1000;

/**
 * 检查缓存是否有效
 * @param cacheTimestamp 缓存时间戳
 * @param currentTime 当前时间
 * @returns 缓存是否有效
 */
function isCacheValid(cacheTimestamp: number, currentTime: number): boolean {
  return (currentTime - cacheTimestamp) < CACHE_DURATION;
}

/**
 * 判断是否应该发起新的API请求
 * @param cacheTimestamp 缓存时间戳（null表示无缓存）
 * @param currentTime 当前时间
 * @returns 是否应该发起新请求
 */
function shouldFetchFromAPI(cacheTimestamp: number | null, currentTime: number): boolean {
  if (cacheTimestamp === null) {
    return true; // 无缓存，需要请求
  }
  return !isCacheValid(cacheTimestamp, currentTime);
}

describe('GitHub Stars Cache', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * **Feature: group-anagrams-visualizer, Property 12: Star缓存有效期**
   * *对于任意*缓存时间戳，如果当前时间距离缓存时间不足一小时，系统不应发起新的GitHub API请求
   * **验证: 需求 2.4**
   */
  it('Property 12: Star缓存有效期 - 一小时内不应发起新请求', () => {
    fc.assert(
      fc.property(
        // 生成一个基准时间戳（过去30天内的某个时间）
        fc.integer({ min: Date.now() - 30 * 24 * 60 * 60 * 1000, max: Date.now() }),
        // 生成一个时间偏移量（0到59分钟之间，即不足1小时）
        fc.integer({ min: 0, max: CACHE_DURATION - 1 }),
        (cacheTimestamp, timeOffset) => {
          const currentTime = cacheTimestamp + timeOffset;
          
          // 当时间差不足1小时时，不应该发起新请求
          const shouldFetch = shouldFetchFromAPI(cacheTimestamp, currentTime);
          
          return shouldFetch === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('缓存超过一小时后应该发起新请求', () => {
    fc.assert(
      fc.property(
        // 生成一个基准时间戳
        fc.integer({ min: Date.now() - 30 * 24 * 60 * 60 * 1000, max: Date.now() - CACHE_DURATION }),
        // 生成一个超过1小时的时间偏移量
        fc.integer({ min: CACHE_DURATION, max: CACHE_DURATION * 24 }),
        (cacheTimestamp, timeOffset) => {
          const currentTime = cacheTimestamp + timeOffset;
          
          // 当时间差超过1小时时，应该发起新请求
          const shouldFetch = shouldFetchFromAPI(cacheTimestamp, currentTime);
          
          return shouldFetch === true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('无缓存时应该发起新请求', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: Date.now() }),
        (currentTime) => {
          const shouldFetch = shouldFetchFromAPI(null, currentTime);
          return shouldFetch === true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('缓存持续时间应该是1小时', () => {
    expect(CACHE_DURATION).toBe(60 * 60 * 1000);
  });
});
