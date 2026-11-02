import { expect, test } from '@playwright/test';

test('captures 1x playback, adjacent snapshots, and reduced-motion evidence', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/');
  await page.screenshot({ path: 'test-results/evidence-initial.png' });

  await page.locator('.control-button').filter({ hasText: '下一步' }).click();
  await page.screenshot({ path: 'test-results/evidence-step-2.png' });
  await page.locator('.control-button').filter({ hasText: '下一步' }).click();
  await page.screenshot({ path: 'test-results/evidence-step-3.png' });

  await page.locator('[data-mark-id="input-0-card"]').evaluate((el) => {
    (window as typeof window & { __inputNode?: Element }).__inputNode = el;
  });
  for (let index = 0; index < 38; index += 1) {
    await page.locator('.control-button').filter({ hasText: '下一步' }).click();
  }
  await expect(page.locator('.canvas-step-chip')).toContainText('演示步 41');
  await expect(page.locator('[data-mark-id="group-aet-key-card"]')).toBeVisible();
  await expect(page.locator('[data-mark-id="group-ant-key-card"]')).toBeVisible();
  await expect(page.locator('[data-mark-id="group-abt-key-card"]')).toBeVisible();
  expect(await page.locator('[data-mark-id="input-0-card"]').evaluate((el) => el === (window as typeof window & { __inputNode?: Element }).__inputNode)).toBe(true);
  await page.screenshot({ path: 'test-results/evidence-final-groups.png' });

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('.control-button').filter({ hasText: '上一步' }).click();
  await expect(page.locator('.step-explanation')).toBeVisible();
  await expect(page.locator('.code-line-highlighted')).toBeVisible();
  await page.screenshot({ path: 'test-results/evidence-reduced-motion.png' });
});
