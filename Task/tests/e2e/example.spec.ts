import { test, expect } from '@playwright/test';

test('initial render', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page.locator('svg')).toBeVisible();
  expect(await page.locator('circle').count()).toBeGreaterThan(0);
});

test('mouse adds and removes bridge', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('button:has-text("Reset")');
  // pair 1: 0 → 1 bridge
  await page.mouse.click(80, 80);
  await page.mouse.click(240, 80);
  expect(await page.locator('line').count()).toBe(1);
  // pair 2: 1 → 2 bridges
  await page.mouse.click(80, 80);
  await page.mouse.click(240, 80);
  expect(await page.locator('line').count()).toBe(2);
  // pair 3: 2 → 0 (cycle back to none)
  await page.mouse.click(80, 80);
  await page.mouse.click(240, 80);
  expect(await page.locator('line').count()).toBe(0);
});

test('invalid move shows error', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('button:has-text("Reset")');
  await page.mouse.click(80, 80);
  await page.mouse.click(240, 240);
  await expect(page.locator('.error-message')).toBeVisible();
});

test('victory banner appears', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.selectOption('select', 'Easy');
  await page.click('button:has-text("Reset")');
  await page.mouse.click(80, 80);
  await page.mouse.click(240, 80);
  await page.mouse.click(80, 80);
  await page.mouse.click(80, 240);
  await page.mouse.click(240, 80);
  await page.mouse.click(240, 240);
  await page.mouse.click(80, 240);
  await page.mouse.click(240, 240);
  await expect(page.locator('.victory-banner')).toBeVisible();
});

test('reset clears bridges', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.selectOption('select', 'Easy');
  await page.click('button:has-text("Reset")');
  await page.mouse.click(80, 80);
  await page.mouse.click(240, 80);
  await expect(page.locator('line')).toHaveCount(1);
  await page.click('button:has-text("Reset")');
  await expect(page.locator('line')).toHaveCount(0);
});

test('puzzle change resets board', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.selectOption('select', 'Easy');
  await page.mouse.click(80, 80);
  await page.mouse.click(240, 80);
  await page.selectOption('select', 'Medium');
  expect(await page.locator('circle').count()).toBe(5);
  expect(await page.locator('line').count()).toBe(0);
});

test('keyboard navigation toggles bridge', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.selectOption('select', 'Easy');
  await page.click('button:has-text("Reset")');
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await page.keyboard.press('Enter');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  expect(await page.locator('line').count()).toBeGreaterThan(0);
  expect(await page.locator('circle').count()).toBe(4);
});

test('right-click removes a bridge', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.selectOption('select', 'Easy');
  await page.click('button:has-text("Reset")');
  await page.mouse.click(80, 80);
  await page.mouse.click(240, 80);
  expect(await page.locator('line').count()).toBe(1);
  await page.mouse.click(160, 80, { button: 'right' });
  expect(await page.locator('line').count()).toBe(0);
});

test('escape cancels keyboard selection', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.selectOption('select', 'Easy');
  await page.click('button:has-text("Reset")');
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await page.keyboard.press('Enter');
  await page.keyboard.press('Escape');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  expect(await page.locator('line').count()).toBe(0);
});

test('ctrl+click removes a bridge', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.selectOption('select', 'Easy');
  await page.click('button:has-text("Reset")');
  await page.mouse.click(80, 80);
  await page.mouse.click(240, 80);
  expect(await page.locator('line').count()).toBe(1);
  await page.keyboard.down('Control');
  await page.mouse.click(160, 80);
  await page.keyboard.up('Control');
  expect(await page.locator('line').count()).toBe(0);
});

test('error message clears on next valid move', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.selectOption('select', 'Easy');
  await page.click('button:has-text("Reset")');
  await page.mouse.click(80, 80);
  await page.mouse.click(240, 240);
  await expect(page.locator('.error-message')).toBeVisible();
  await page.mouse.click(80, 80);
  await page.mouse.click(240, 80);
  await expect(page.locator('.error-message')).toHaveCount(0);
});

