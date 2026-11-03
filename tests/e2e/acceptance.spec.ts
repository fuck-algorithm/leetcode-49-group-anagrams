import { expect, test } from '@playwright/test';

const viewports = [
  { width: 1920, height: 1080, minCanvas: 0.76, minSvg: 0.66 },
  { width: 1366, height: 768, minCanvas: 0.62, minSvg: 0.5 },
];

test.describe('canvas budget', () => {
  for (const viewport of viewports) test(`${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const metrics = await page.evaluate(() => {
      const r = (s: string) => document.querySelector(s)!.getBoundingClientRect();
      const canvas = r('.canvas-section'), svg = r('.canvas-svg'), code = r('.code-section');
      return { canvas: canvas.height / innerHeight, svg: svg.height / innerHeight, share: canvas.width / (canvas.width + code.width), page: [document.documentElement.scrollWidth, document.documentElement.scrollHeight] };
    });
    expect(metrics.canvas).toBeGreaterThanOrEqual(viewport.minCanvas);
    expect(metrics.svg).toBeGreaterThanOrEqual(viewport.minSvg);
    expect(metrics.share).toBeGreaterThanOrEqual(.68);
    expect(metrics.page).toEqual([viewport.width, viewport.height]);
    await expect(page.locator('.operation-badge')).toBeVisible();
    await expect(page.locator('.step-explanation')).toBeVisible();
    await expect(page.locator('.canvas-legend')).toBeVisible();
    await expect(page.locator('[data-mark-tag="path"][data-mark-id="flow-arrow-input-signature"]')).toHaveAttribute('d', /L.*\d/);
    await expect(page.locator('[data-mark-tag="path"][data-mark-id="flow-arrow-signature-map"]')).toHaveAttribute('d', /L.*\d/);
    await expect(page.locator('[data-mark-id="flow-label-input-signature"]')).toContainText('读取单词 ↓');
    await expect(page.locator('[data-mark-id="flow-label-signature-map"]')).toContainText('用 key 查 Map ↓');
  });
  test('small viewport code overlay does not resize canvas', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 }); await page.goto('/');
    await expect(page.locator('[data-mark-tag="path"][data-mark-id="flow-arrow-input-signature"]')).toHaveAttribute('d', /L/);
    await expect(page.locator('[data-mark-id="flow-label-input-signature"]')).toContainText('读取单词');
    const canvas = page.locator('.canvas-section'); const before = await canvas.evaluate(e => e.getBoundingClientRect().height);
    await page.locator('.code-toggle').click(); await expect(page.locator('.code-section')).toHaveClass(/code-overlay/);
    expect(await canvas.evaluate(e => e.getBoundingClientRect().height)).toBe(before);
  });
});

test('retains SVG mark identity across frames', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-mark-id="input-0-card"]').evaluate(e => { (window as Window & { __node?: Element }).__node = e; });
  await page.getByRole('button', { name: '下一步' }).click();
  await expect(page.locator('.canvas-step-chip')).toContainText('演示步 2');
  expect(await page.locator('[data-mark-id="input-0-card"]').evaluate(e => e === (window as Window & { __node?: Element }).__node)).toBe(true);
  const count = await page.locator('[data-mark-id]').count();
  expect(await page.locator('[data-mark-id]').evaluateAll(nodes => new Set(nodes.map(e => e.getAttribute('data-mark-id'))).size)).toBe(count);
});

test('synchronizes language code and narration', async ({ page }) => {
  await page.goto('/'); await page.getByRole('button', { name: '下一步' }).click(); await page.getByRole('button', { name: 'Python', exact: true }).click();
  await expect(page.locator('.code-line-highlighted')).toContainText('for s in strs');
  await expect(page.locator('.step-explanation')).toContainText('读取输入索引');
});

test('final groups and mobile fit within viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/');
  const next = page.locator('.control-button').filter({ hasText: '下一步' });
  for (let i = 0; i < 40; i++) await next.click();
  await expect(page.locator('.canvas-step-chip')).toContainText('演示步 41');
  for (const key of ['aet', 'ant', 'abt']) await expect(page.locator(`[data-mark-id="group-${key}-key-card"]`)).toBeVisible();
  expect(await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.scrollHeight])).toEqual([390, 844]);
});

test('invalid input does not update, valid sample runs', async ({ page }) => {
  await page.goto('/'); const input = page.locator('.input-field');
  await input.fill('["eat", 7]'); await input.press('Enter');
  await expect(page.locator('.error-tooltip')).toBeVisible(); await expect(page.locator('.canvas-step-chip')).toContainText('演示步 1');
  await page.getByRole('button', { name: '示例2' }).click();
  await expect(input).toHaveValue('[""]'); await expect(page.locator('[data-mark-tag="rect"][data-mark-id^="input-"][data-mark-id$="-card"]')).toHaveCount(1);
});

test('keyboard playback and reset', async ({ page }) => {
  await page.goto('/'); await page.keyboard.press('ArrowRight'); await expect(page.locator('.canvas-step-chip')).toContainText('演示步 2');
  await page.keyboard.press('ArrowLeft'); await expect(page.locator('.canvas-step-chip')).toContainText('演示步 1');
  await page.keyboard.press('Space'); await expect(page.locator('.playing-dot')).toBeVisible(); await page.keyboard.press('Space'); await page.keyboard.press('R');
  await expect(page.locator('.canvas-step-chip')).toContainText('演示步 1');
});

test('progress click seeks', async ({ page }) => {
  await page.goto('/'); const track = page.locator('.progress-bar-container'); const b = await track.boundingBox();
  await page.mouse.click(b!.x + b!.width * .95, b!.y + b!.height / 2);
  await expect(page.locator('.canvas-step-chip')).toContainText('演示步 39');
});

test('problem statement opens and closes independently from algorithm thoughts', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '题目描述' }).click();
  const description = page.getByRole('dialog', { name: '题目描述' });
  await expect(description.locator('.problem-example')).toBeVisible();
  await expect(description.getByText(/约束/)).toBeVisible();
  await expect(description.getByText(/核心规则/)).toHaveCount(0);
  await description.getByRole('button', { name: '关闭题目描述' }).click();
  await expect(description).toHaveCount(0);

  await page.getByRole('button', { name: '算法思路' }).click();
  const algorithm = page.getByRole('dialog', { name: '算法思路' });
  await expect(algorithm.getByText('核心规则')).toBeVisible();
  await expect(algorithm.getByText(/给定字符串数组/)).toHaveCount(0);
  await algorithm.getByRole('button', { name: '关闭' }).click();
});

test('community QR is shown with correct aspect ratio', async ({ page }) => {
  await page.goto('/'); await page.getByRole('button', { name: '显示交流群二维码' }).click(); const img = page.getByRole('img', { name: '微信二维码' }); await expect(img).toBeVisible();
  const [w,h,cw,ch] = await img.evaluate((e: HTMLImageElement) => [e.naturalWidth,e.naturalHeight,e.clientWidth,e.clientHeight]); expect(w/h).toBeCloseTo(cw/ch,1);
  await page.getByRole('button', { name: '关闭二维码' }).click(); await expect(img).toHaveCount(0);
});

test('repository star link is valid', async ({ page }) => {
  await page.goto('/'); const gh = page.locator('.github-link'); await expect(gh).toHaveAttribute('href','https://github.com/fuck-algorithm/leetcode-49-group-anagrams'); await expect(gh.locator('.star-count')).toContainText(/\d+/);
});

test('reduced motion preserves information', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto('/'); await page.getByRole('button', { name: '下一步' }).click();
  await expect(page.locator('.step-explanation')).toContainText('读取输入索引'); await expect(page.locator('.code-line-highlighted')).toBeVisible(); await expect(page.locator('[data-mark-id="input-0-card"]')).toBeVisible();
});

test('no purple colors in app styles', async ({ page }) => {
  await page.goto('/'); const purple = await page.evaluate(async () => { const sheets = await Promise.all([...document.styleSheets].map(s => { try { return [...s.cssRules].map(r=>r.cssText).join('\\n'); } catch { return ''; } })); const css=sheets.join('\\n'); return /purple|violet|#(?:7c3aed|ddd6fe)/i.test(css) || [...css.matchAll(/#([0-9a-f]{6})\\b/gi)].some(([,h])=>{const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);return r>g*1.35&&b>g*1.35&&r>90&&b>90;}); }); expect(purple).toBe(false);
});

test('all code languages render', async ({ page }) => { await page.goto('/'); for(const l of ['Java','Python','Go','JavaScript']) { await page.getByRole('button',{name:l,exact:true}).click(); await expect(page.locator('.code-line')).not.toHaveCount(0); } });

test('zoom preserves marks', async ({ page }) => { await page.goto('/'); const count=await page.locator('[data-mark-id]').count(); const before=await page.locator('g.canvas-layer').getAttribute('transform'); await page.locator('.canvas-control-btn[title="放大"]').click(); await expect.poll(()=>page.locator('g.canvas-layer').getAttribute('transform')).not.toBe(before); expect(await page.locator('[data-mark-id]').count()).toBe(count); });

test('external links open in new tabs', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.header-title')).toHaveAttribute('href','https://leetcode.cn/problems/group-anagrams/'); await expect(page.locator('.header-title')).toHaveAttribute('target','_blank');
  await expect(page.locator('.back-link')).toHaveAttribute('href','https://fuck-algorithm.github.io/leetcode-hot-100/'); await expect(page.locator('.back-link')).toHaveAttribute('target','_blank'); await expect(page.locator('.github-link')).toHaveAttribute('target','_blank');
});

test('code language persists on reload', async ({ page }) => { await page.goto('/'); await page.getByRole('button',{name:'Python',exact:true}).click(); await page.reload(); await expect(page.locator('.language-tab.active')).toHaveText('Python'); });
test('playback speed persists on reload', async ({ page }) => { await page.goto('/'); await page.locator('.speed-button').click(); await page.getByRole('button',{name:'2x',exact:true}).click(); await page.reload(); await expect(page.locator('.speed-button')).toContainText('2x'); });

test('progress handle drags', async ({ page }) => { await page.goto('/'); const handle=await page.locator('.progress-bar-handle').boundingBox(), track=await page.locator('.progress-bar-container').boundingBox(); await page.mouse.move(handle!.x+7,handle!.y+7); await page.mouse.down(); await page.mouse.move(track!.x+track!.width*.5,track!.y+5,{steps:4}); await page.mouse.up(); await expect.poll(async()=>Number((await page.locator('.step-indicator').innerText()).split('/')[0])).toBeGreaterThan(15); });

test('2x, random seeks, rapid overlay toggles, and reduced motion', async ({ page }) => {
  await page.goto('/'); await page.locator('.speed-button').click(); await page.getByRole('button',{name:'2x',exact:true}).click(); await expect(page.locator('.speed-button')).toContainText('2x');
  await page.keyboard.press('Space'); await expect(page.locator('.playing-dot')).toBeVisible(); await page.keyboard.press('Space');
  const b=await page.locator('.progress-bar-container').boundingBox(); for(let i=0;i<10;i++) await page.mouse.click(b!.x+b!.width*((i*37)%91)/100,b!.y+5);
  for(let i=0;i<4;i++) await page.locator('.code-toggle').click(); await expect(page.locator('.code-section')).toBeVisible();
  expect(await page.locator('[data-mark-id]').count()).toBe(await page.locator('[data-mark-id]').evaluateAll(ns=>new Set(ns.map(n=>n.getAttribute('data-mark-id'))).size));
  await page.emulateMedia({reducedMotion:'reduce'}); await page.getByRole('button',{name:'下一步'}).click(); await expect(page.locator('.code-line-highlighted')).toBeVisible();
});
