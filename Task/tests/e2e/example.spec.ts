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
  const banner = page.locator('.victory-banner');
  await expect(banner).toBeVisible();
  await expect(banner).toContainText('SOLVED!');
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
  expect(await page.locator('line').count()).toBe(1);
  expect(await page.locator('circle').count()).toBe(4);
});

test('right-click removes a bridge', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.selectOption('select', 'Easy');
  await page.click('button:has-text("Reset")');
  // Cycle to a double bridge (none -> single -> double) so we can verify
  // that right-clicking one of the two parallel <line>s clears the pair.
  await page.mouse.click(80, 80);
  await page.mouse.click(240, 80);
  await page.mouse.click(80, 80);
  await page.mouse.click(240, 80);
  expect(await page.locator('line').count()).toBe(2);
  // Click directly on one of the rendered <line> elements. Use boundingBox +
  // mouse.click because Playwright's locator.click visibility check doesn't
  // handle SVG <line> reliably (no HTML layout box); stroke offsets are
  // implementation-defined, so we target the element rather than a fixed pixel.
  const rcBox = await page.locator('line').first().boundingBox();
  if (!rcBox) throw new Error('no bounding box for first <line>');
  await page.mouse.click(rcBox.x + rcBox.width / 2, rcBox.y + rcBox.height / 2, { button: 'right' });
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
  // Cycle to a double bridge so Ctrl+click on one <line> must clear both.
  await page.mouse.click(80, 80);
  await page.mouse.click(240, 80);
  await page.mouse.click(80, 80);
  await page.mouse.click(240, 80);
  expect(await page.locator('line').count()).toBe(2);
  // Same approach as the right-click test: compute the line's bounding box
  // and mouse-click its center with the Control modifier held.
  const ccBox = await page.locator('line').first().boundingBox();
  if (!ccBox) throw new Error('no bounding box for first <line>');
  await page.keyboard.down('Control');
  await page.mouse.click(ccBox.x + ccBox.width / 2, ccBox.y + ccBox.height / 2);
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
  await expect(page.locator('line')).toHaveCount(1);
});

