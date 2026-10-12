import {expect, test, type Locator, type Page} from '@playwright/test';
import {visitGuide, visitStep} from './workflow-helpers.js';

const draftKey = 'social-interaction-lab:working-draft:v1';
const settings = (page: Page) => page.locator('#motion-settings');
const globalMotion = (page: Page) => settings(page).getByRole('combobox', {name: 'Global motion', exact: true});
const assignment = (page: Page, action: string) => settings(page).locator(`[data-motion-action=${action}]`);
const selectedOrder = (page: Page) => page.locator('.workflow-choice-preview .sil-action').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-action')));
const draftOrder = (page: Page) => page.locator('.action-picker-order > li').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-action')));
const handle = (page: Page, action: string) => page.locator(`.action-picker-order > [data-action=${action}] .action-picker-drag-handle`);
const workingConfig = (page: Page) => page.evaluate(key => JSON.parse(sessionStorage.getItem(key)!).config, draftKey);
async function importConfig(page: Page, config: unknown) {
  await visitStep(page, 'export');
  const panel = page.locator('.studio-config');
  await panel.getByLabel('Import JSON', {exact: true}).setInputFiles({name: 'mixed-motion.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(config))});
  await expect(panel.getByRole('status')).toContainText('Configuration imported');
}
async function setRange(input: Locator, value: number) {
  await input.evaluate((element, next) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(element, String(next));
    element.dispatchEvent(new Event('input', {bubbles: true}));
    element.dispatchEvent(new Event('change', {bubbles: true}));
  }, value);
}
async function dragPoints(page: Page, source: string, target: string) {
  await page.locator('.action-picker-order').scrollIntoViewIfNeeded();
  const from = await handle(page, source).boundingBox();
  const to = await page.locator(`.action-picker-order > [data-action=${target}]`).boundingBox();
  expect(from).not.toBeNull(); expect(to).not.toBeNull();
  return {from: {x: from!.x + from!.width / 2, y: from!.y + from!.height / 2}, to: {x: to!.x + to!.width / 2, y: to!.y + to!.height / 2}};
}

test('genuine mouse dragging commits only on drop and Escape restores order and focus', async ({page}) => {
  await page.goto('/#choose');
  const original = ['like', 'comment', 'share', 'quote'];
  await expect(page.locator('.action-picker-alternative')).not.toHaveAttribute('open');
  await expect(page.getByRole('button', {name: 'Move Like later', exact: true})).toBeHidden();
  const points = await dragPoints(page, 'quote', 'like');
  await page.mouse.move(points.from.x, points.from.y); await page.mouse.down();
  await page.mouse.move(points.to.x, points.to.y);
  await expect(handle(page, 'quote')).toHaveAttribute('aria-pressed', 'true');
  expect(await draftOrder(page)).toEqual(['quote', 'like', 'comment', 'share']);
  expect(await selectedOrder(page)).toEqual(original);
  await expect(page.locator('.action-picker-status')).toContainText('Not saved until dropped');
  await page.keyboard.press('Escape'); await page.mouse.up();
  expect(await draftOrder(page)).toEqual(original); expect(await selectedOrder(page)).toEqual(original);
  await expect(handle(page, 'quote')).toBeFocused();
  await expect(page.locator('.action-picker-status')).toContainText('cancelled');
  const retry = await dragPoints(page, 'quote', 'like');
  await page.mouse.move(retry.from.x, retry.from.y); await page.mouse.down();
  await page.mouse.move(retry.to.x, retry.to.y); await page.mouse.up();
  await expect.poll(() => selectedOrder(page)).toEqual(['quote', 'like', 'comment', 'share']);
  await expect(handle(page, 'quote')).toBeFocused();
  await expect(page.locator('.action-picker-status')).toContainText('dropped at position 1 of 4');
  await page.reload(); expect(await draftOrder(page)).toEqual(['quote', 'like', 'comment', 'share']);
});

test('keyboard reorder announces pickup movement drop and cancellation without hidden work', async ({page}, info) => {
  await page.goto('/#choose'); const control = handle(page, 'share');
  await control.focus(); await page.keyboard.press('Space');
  await expect(control).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.action-picker-status')).toContainText('picked up, position 3 of 4');
  await page.keyboard.press('ArrowUp'); await expect(control).toBeFocused();
  expect(await draftOrder(page)).toEqual(['like', 'share', 'comment', 'quote']);
  expect(await selectedOrder(page)).toEqual(['like', 'comment', 'share', 'quote']);
  await expect(page.locator('.action-picker-status')).toContainText('position 2 of 4');
  await page.keyboard.press('Escape'); await expect(control).toBeFocused();
  expect(await draftOrder(page)).toEqual(['like', 'comment', 'share', 'quote']);
  await page.keyboard.press('Enter'); await page.keyboard.press('Home'); await page.keyboard.press('Enter');
  expect(await selectedOrder(page)).toEqual(['share', 'like', 'comment', 'quote']);
  await expect(control).toBeFocused(); await expect(control).toHaveAttribute('aria-pressed', 'false');
  await page.keyboard.press('Space'); await page.keyboard.press('End'); await page.keyboard.press('Tab');
  expect(await draftOrder(page)).toEqual(['share', 'like', 'comment', 'quote']);
  await expect(page.locator('.action-picker-status')).toContainText('cancelled');
  await control.focus(); await page.keyboard.press('Space'); await page.keyboard.press('End');
  await visitStep(page, 'animation'); await visitStep(page, 'choose');
  expect(await draftOrder(page)).toEqual(['share', 'like', 'comment', 'quote']);
  await expect(control).toHaveAttribute('aria-pressed', 'false');
  expect(await page.evaluate(() => !document.activeElement?.closest('[hidden],[inert]'))).toBe(true);
  await page.getByRole('button', {name: '日本語', exact: true}).click();
  await control.focus(); await page.keyboard.press('Space'); await page.keyboard.press('ArrowRight');
  await expect(page.locator('.action-picker-status')).toContainText('4個中2番目');
  await page.keyboard.press('Escape');
  await expect(page.locator('.action-picker-status')).toContainText('キャンセル');
  await page.locator('.studio-action-picker').screenshot({path: info.outputPath('drag-keyboard-ja.png')});
});

test('native touch drag commits and touchcancel rolls back without scrolling the handle', async ({page, browserName, isMobile}) => {
  test.skip(browserName !== 'chromium' || !isMobile, 'Playwright exposes genuine touch dragging through Chromium browser input; other projects cover mouse, keyboard and responsive layouts');
  await page.goto('/#choose');
  const session = await page.context().newCDPSession(page);
  const touch = async (type: 'touchStart' | 'touchMove' | 'touchEnd' | 'touchCancel', point?: {x: number; y: number}) => {
    await session.send('Input.dispatchTouchEvent', {type, touchPoints: point ? [{...point, id: 1, radiusX: 5, radiusY: 5, force: 1}] : []});
  };
  try {
    const points = await dragPoints(page, 'quote', 'like');
    const scroll = await page.evaluate(() => scrollY);
    await touch('touchStart', points.from); await touch('touchMove', points.to);
    await expect(handle(page, 'quote')).toHaveAttribute('aria-pressed', 'true');
    expect(await draftOrder(page)).toEqual(['quote', 'like', 'comment', 'share']);
    expect(await selectedOrder(page)).toEqual(['like', 'comment', 'share', 'quote']);
    expect(await page.evaluate(() => scrollY)).toBe(scroll);
    await touch('touchCancel');
    expect(await draftOrder(page)).toEqual(['like', 'comment', 'share', 'quote']);
    await expect(page.locator('.action-picker-status')).toContainText('cancelled');
    await touch('touchStart', points.from); await touch('touchMove', points.to); await touch('touchEnd');
    await expect.poll(() => selectedOrder(page)).toEqual(['quote', 'like', 'comment', 'share']);
    await expect(page.locator('.action-picker-status')).toContainText('dropped at position 1 of 4');
    // A shorter genuine mobile viewport makes the 12-row list exceed the screen.
    await page.setViewportSize({width: 390, height: 560});
    for (const checkbox of await page.locator('.studio-action-picker').getByRole('checkbox').all()) await checkbox.check();
    await handle(page, 'quote').scrollIntoViewIfNeeded();
    const firstRow = await page.locator('.action-picker-order > li').first().boundingBox();
    const panStart = {x: firstRow!.x + 38, y: firstRow!.y + firstRow!.height / 2};
    const beforePan = await page.evaluate(() => scrollY);
    await touch('touchStart', panStart);
    for (let step = 1; step <= 6; step++) { await touch('touchMove', {x: panStart.x, y: panStart.y - step * 16}); await page.waitForTimeout(20); }
    await touch('touchEnd');
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(beforePan);
    await expect(page.locator('.action-picker-order')).not.toHaveAttribute('data-reordering', 'true');
    const twelve = await selectedOrder(page);
    await handle(page, 'quote').scrollIntoViewIfNeeded();
    const source = await handle(page, 'quote').boundingBox();
    const start = {x: source!.x + source!.width / 2, y: source!.y + source!.height / 2};
    const beforeEdge = await page.evaluate(() => scrollY);
    await touch('touchStart', start); await touch('touchMove', {x: start.x, y: start.y + 10});
    await touch('touchMove', {x: start.x, y: 552});
    await expect.poll(async () => (await draftOrder(page)).at(-1), {timeout: 10000}).toBe('quote');
    expect(await page.evaluate(() => scrollY)).toBeGreaterThan(beforeEdge);
    expect(await selectedOrder(page)).toEqual(twelve);
    await touch('touchEnd');
    await expect.poll(() => selectedOrder(page)).toEqual([...twelve.filter(action => action !== 'quote'), 'quote']);
    await expect(page.locator('.action-picker-status')).toContainText('dropped at position 12 of 12');
  } finally { await session.detach(); }
});

test('Appearance owns exactly one control set and compares only the chosen visual style', async ({page}, info) => {
  await page.goto('/#choose');
  await expect(page.locator('.workflow-navigation select,.workflow-navigation input')).toHaveCount(0);
  await visitStep(page, 'appearance'); const controls = page.locator('.studio-controls');
  await expect(controls).toHaveCount(1); await expect(page.locator('.inspector')).toHaveCount(0);
  await controls.locator('.appearance-feedback > summary').click();
  for (const name of ['Icon size', 'Stroke', 'Spacing', 'Hit target', 'Surface feedback duration', 'Press depth']) await expect(page.getByRole('slider', {name, exact: true})).toHaveCount(1);
  for (const name of ['Button presentation', 'Studio visual style']) await expect(page.getByRole('combobox', {name, exact: true})).toHaveCount(1);
  for (const name of ['Reduce preview motion', 'Show hit targets']) await expect(page.getByRole('checkbox', {name, exact: true})).toHaveCount(1);
  for (const variant of ['minimal', 'soft', 'solid', 'spring']) {
    await controls.getByRole('combobox', {name: 'Studio visual style', exact: true}).selectOption(variant);
    await expect(page.locator('#compare .specimen')).toHaveCount(1);
    for (const button of await page.locator('#compare .specimen .sil-action').all()) await expect(button).toHaveClass(new RegExp(`sil-${variant}`));
  }
  await setRange(controls.getByRole('slider', {name: 'Hit target', exact: true}), 60);
  await controls.getByRole('checkbox', {name: 'Show hit targets', exact: true}).check();
  await controls.getByRole('button', {name: 'Isolate a variable', exact: true}).click();
  await controls.getByRole('combobox', {name: 'Only change', exact: true}).selectOption('strokeWidth');
  await setRange(controls.getByRole('slider', {name: 'Stroke', exact: true}), 2.7);
  await expect(page.locator('#compare .isolated-row')).toHaveCount(2);
  for (const button of await page.locator('#compare .isolated-row .sil-action').all()) await expect(button).toHaveClass(/sil-spring/);
  await expect(controls.getByRole('slider', {name: 'Spacing', exact: true})).toBeDisabled();
  await page.screenshot({path: info.outputPath('unified-appearance-en.png'), fullPage: true});
  await page.getByRole('button', {name: '日本語', exact: true}).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({path: info.outputPath('unified-appearance-ja.png'), fullPage: true});
});

test('per-icon inherit override reset and hidden selections survive presets JSON and generated code', async ({page}, info) => {
  await page.goto('/#animation');
  await expect(settings(page).locator('[data-motion-action]')).toHaveCount(4);
  await expect(page.locator('#timeline').getByRole('combobox', {name: 'Timeline treatment', exact: true})).toHaveCount(0);
  await globalMotion(page).selectOption('pulse');
  await assignment(page, 'like').getByRole('combobox').selectOption('trace');
  await assignment(page, 'comment').getByRole('combobox').selectOption('none');
  await globalMotion(page).selectOption('gesture');
  await expect(assignment(page, 'like').locator('.sil-action')).toHaveAttribute('data-icon-motion', 'trace');
  await expect(assignment(page, 'comment').locator('.sil-action')).toHaveAttribute('data-icon-motion', 'none');
  await expect(assignment(page, 'share').getByRole('combobox')).toHaveValue('inherit');
  await expect(assignment(page, 'share').locator('.sil-action')).toHaveAttribute('data-icon-motion', 'gesture');
  await assignment(page, 'like').getByRole('button', {name: 'Reset Like motion', exact: true}).click();
  await expect(assignment(page, 'like').getByRole('combobox')).toHaveValue('inherit');
  await expect(assignment(page, 'like').locator('.sil-action')).toHaveAttribute('data-icon-motion', 'gesture');
  await assignment(page, 'like').getByRole('combobox').selectOption('trace');
  await setRange(settings(page).getByRole('slider', {name: 'Glyph duration', exact: true}), 1000);
  await setRange(settings(page).getByRole('slider', {name: 'Intensity', exact: true}), 1.4);
  await setRange(settings(page).getByRole('slider', {name: 'Part stagger', exact: true}), 80);
  const before = await workingConfig(page);
  expect(before.motionOverrides).toEqual({like: 'trace', comment: 'none'});
  await visitStep(page, 'choose'); await page.locator('.studio-action-picker').getByRole('checkbox', {name: 'Comment', exact: true}).uncheck();
  await visitStep(page, 'animation'); await expect(assignment(page, 'comment')).toHaveCount(0);
  expect((await workingConfig(page)).motionOverrides.comment).toBe('none');
  await visitStep(page, 'choose'); await page.locator('.studio-action-picker').getByRole('checkbox', {name: 'Comment', exact: true}).check();
  await visitStep(page, 'animation'); await expect(assignment(page, 'comment').getByRole('combobox')).toHaveValue('none');
  await page.screenshot({path: info.outputPath('mixed-motion-en.png'), fullPage: true});
  await visitStep(page, 'export'); const config = page.locator('.studio-config');
  await config.getByLabel('Preset name', {exact: true}).fill('Mixed treatments'); await config.getByRole('button', {name: 'Save preset', exact: true}).click();
  const saved = await workingConfig(page);
  await config.getByRole('button', {name: 'Show code', exact: true}).click();
  const code = await config.getByRole('textbox', {name: 'Generated React code', exact: true}).inputValue();
  expect(code).toContain('"motionOverrides"'); expect(code).toContain('"like": "trace"'); expect(code).toContain('"comment": "none"');
  expect(code).toContain('motionOverrides[item.action] ?? studioConfig.iconMotion');
  await page.reload(); await config.getByRole('combobox', {name: 'Choose a preset', exact: true}).selectOption('Mixed treatments');
  await config.getByRole('button', {name: 'Load', exact: true}).click(); expect(await workingConfig(page)).toEqual(saved);
  await importConfig(page, {...saved, iconMotion: 'spring'}); await visitStep(page, 'animation');
  await expect(assignment(page, 'like').locator('.sil-action')).toHaveAttribute('data-icon-motion', 'trace');
  await expect(assignment(page, 'share').locator('.sil-action')).toHaveAttribute('data-icon-motion', 'spring');
  await importConfig(page, saved); expect(await workingConfig(page)).toEqual(saved);
  const legacy = {...saved}; delete legacy.motionOverrides;
  await importConfig(page, legacy); expect((await workingConfig(page)).motionOverrides).toEqual({});
  await visitStep(page, 'animation'); await expect(assignment(page, 'comment').getByRole('combobox')).toHaveValue('inherit');
  await importConfig(page, saved); await visitStep(page, 'animation');
  await expect(assignment(page, 'like').getByRole('combobox')).toHaveValue('trace');
  await expect(assignment(page, 'comment').getByRole('combobox')).toHaveValue('none');
  await page.getByRole('button', {name: '日本語', exact: true}).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({path: info.outputPath('mixed-motion-ja.png'), fullPage: true});
});

test('Guide motion experiments cannot change saved assignments and timeline resolves each icon', async ({page}) => {
  await page.goto('/#animation'); await globalMotion(page).selectOption('pulse');
  await assignment(page, 'like').getByRole('combobox').selectOption('trace');
  await assignment(page, 'comment').getByRole('combobox').selectOption('none');
  const before = await workingConfig(page), timeline = page.locator('#timeline');
  await timeline.getByRole('combobox', {name: 'Timeline icon', exact: true}).selectOption('comment');
  await expect(timeline.getByRole('slider', {name: 'Timeline position', exact: true})).toBeDisabled();
  await timeline.getByRole('combobox', {name: 'Timeline icon', exact: true}).selectOption('like');
  await expect(timeline.getByRole('img')).toHaveAccessibleName('Like · trace');
  const range = timeline.getByRole('slider', {name: 'Timeline position', exact: true});
  await setRange(range, 180); const position = await range.inputValue();
  const inspected = await timeline.locator('.sil-glyph path').evaluateAll(paths => paths.map(p => ({d: p.getAttribute('d'), dash: getComputedStyle(p).strokeDashoffset})));
  expect(inspected.some(path => path.dash !== '0px' && path.dash !== '0')).toBe(true);
  await visitGuide(page, 'motion'); await page.getByRole('slider', {name: 'Glyph duration', exact: true}).press('End');
  await page.getByRole('button', {name: 'Play all', exact: true}).click();
  await visitGuide(page, 'catalog'); const catalogMotion = page.getByRole('combobox', {name: 'Catalog motion', exact: true});
  await expect(catalogMotion).toHaveValue('configured');
  for (const [action, motion] of [['like', 'trace'], ['comment', 'none'], ['share', 'pulse']]) await expect(page.locator(`[data-catalog-action=${action}] .sil-action`)).toHaveAttribute('data-icon-motion', motion);
  await catalogMotion.selectOption('spring');
  for (const button of await page.locator('.icon-catalog .sil-action').all()) await expect(button).toHaveAttribute('data-icon-motion', 'spring');
  await page.getByRole('slider', {name: 'Intensity', exact: true}).press('Home');
  expect(await workingConfig(page)).toEqual(before);
  await catalogMotion.selectOption('configured');
  await expect(page.locator('[data-catalog-action=comment] .sil-action')).toHaveAttribute('data-icon-motion', 'none');
  await visitStep(page, 'animation'); await expect(range).toHaveValue(position);
  expect(await timeline.locator('.sil-glyph path').evaluateAll(paths => paths.map(p => ({d: p.getAttribute('d'), dash: getComputedStyle(p).strokeDashoffset})))).toEqual(inspected);
  await expect(timeline.getByRole('button', {name: 'Play timeline', exact: true})).toBeVisible();
  await visitStep(page, 'preview');
  for (const [action, motion] of [['like', 'trace'], ['comment', 'none'], ['share', 'pulse'], ['quote', 'pulse']]) {
    await expect(page.locator(`.studio-context [data-action=${action}]`)).toHaveAttribute('data-icon-motion', motion);
    await expect(page.locator(`.context-section [data-action=${action}]`)).toHaveAttribute('data-icon-motion', motion);
  }
});

test('actual generated mixed-motion modules render distinct assignments and native Cartoon movement in EN JA', async ({page}, info) => {
  const expected: Record<string, string> = {like: 'none', comment: 'cartoon', share: 'spring', quote: 'trace', repost: 'cartoon', bookmark: 'pulse', note: 'none', star: 'trace', send: 'spring', sparkles: 'pulse', bell: 'cartoon', reaction: 'gesture'};
  for (const locale of ['en', 'ja']) {
    await page.goto(`http://127.0.0.1:4319/?set=mixed&locale=${locale}`);
    for (const [action, motion] of Object.entries(expected)) await expect(page.locator(`[data-action=${action}]`)).toHaveAttribute('data-icon-motion', motion);
    const like = page.locator('[data-action=like]'); await like.click();
    await expect(like).toHaveAttribute('aria-pressed', 'true');
    expect(await like.locator('svg').evaluate(svg => svg.getAnimations({subtree: true}).length)).toBe(0);
    const comment = page.locator('[data-action=comment]'), path = comment.locator('.sil-glyph path').first();
    const canonical = await path.getAttribute('d');
    await comment.evaluate(button => button.addEventListener('click', () => {
      (window as any).__mixedMotionFrames = (async () => {
        const out = [];
        for (const delay of [80, 170, 600]) {
          await new Promise(resolve => setTimeout(resolve, delay));
          const path = button.querySelector<SVGPathElement>('.sil-glyph path')!, bounds = path.getBBox();
          out.push({d: path.getAttribute('d'), bounds: [bounds.x, bounds.y, bounds.width, bounds.height]});
        }
        return out;
      })();
    }, {once: true}));
    await comment.click(); await expect(page.locator('textarea')).toBeFocused();
    const frames = await page.evaluate(() => (window as any).__mixedMotionFrames);
    expect(frames[0].d).not.toBe(frames[1].d); expect(frames[0].bounds).not.toEqual(frames[1].bounds); expect(frames.at(-1).d).toBe(canonical);
    await info.attach(`generated-mixed-native-${locale}.json`, {body: JSON.stringify(frames), contentType: 'application/json'});
    await page.keyboard.press('Escape'); await expect(comment).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({path: info.outputPath(`generated-mixed-${locale}.png`), fullPage: true});
  }
});
