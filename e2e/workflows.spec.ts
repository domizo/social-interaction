import {expect, test, type Locator, type Page} from '@playwright/test';
import {visitStep, visitGuide, type WorkflowStep} from './workflow-helpers.js';

const steps: WorkflowStep[] = ['choose', 'appearance', 'animation', 'preview', 'export', 'guide'];
const draftKey = 'social-interaction-lab:working-draft:v1';
const tab = (page: Page, step: WorkflowStep) => page.locator(`[role=tab][data-workflow-step=${step}]`);
const panel = (page: Page, step: WorkflowStep) => page.locator(`[data-step-panel=${step}]`);
const setRange = (input: Locator, value: number) => input.evaluate((element, next) => {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(element, String(next));
  element.dispatchEvent(new Event('input', {bubbles: true}));
  element.dispatchEvent(new Event('change', {bubbles: true}));
}, value);
async function onlyActive(page: Page, active: WorkflowStep) {
  await expect(page.locator('[data-step-panel]:visible')).toHaveCount(1);
  await expect(panel(page, active)).toBeVisible();
  await expect(tab(page, active)).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('[role=tab][data-workflow-step][aria-selected=true]')).toHaveCount(1);
  for (const step of steps) {
    const owner = tab(page, step);
    await expect(owner).toHaveAttribute('aria-controls', await panel(page, step).getAttribute('id') as string);
    await expect(panel(page, step)).toHaveAttribute('aria-labelledby', await owner.getAttribute('id') as string);
    if (step !== active) {
      await expect(panel(page, step)).toBeHidden();
      await expect(owner).toHaveAttribute('aria-selected', 'false');
    }
  }
  await expect(page.locator('[role=tab][data-workflow-step][tabindex="0"]')).toHaveCount(1);
  await expect.poll(() => page.evaluate(() => !document.activeElement?.closest('[hidden],[inert]'))).toBe(true);
}

async function focusedTabInViewport(page: Page, step: WorkflowStep) {
  // Let route layout effects finish before measuring. A transient pre-scroll
  // intersection would miss the regression where activation strands tab focus.
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  await expect(tab(page, step)).toBeFocused();
  await expect(tab(page, step)).toBeInViewport({ratio: 0.5});
}

// These are real navigation tests. No fixture renders every panel, changes
// visibility, disables lifecycle cleanup, or changes the production motion clock.
test('workflow tabs use manual keyboard activation and Next Back remain keyboard usable', async ({page}) => {
  test.setTimeout(60000);
  await page.goto('/');
  await expect(page.getByRole('tab')).toHaveCount(6);
  for (const name of ['Choose icons', 'Appearance', 'Motion', 'In context', 'Export', 'Guide']) await expect(page.getByRole('tab', {name, exact: true})).toBeVisible();
  await onlyActive(page, 'choose');
  await tab(page, 'choose').focus();
  await page.keyboard.press('ArrowRight');
  await expect(tab(page, 'appearance')).toBeFocused();
  await onlyActive(page, 'choose');
  await page.keyboard.press('End');
  await expect(tab(page, 'guide')).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(tab(page, 'choose')).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(tab(page, 'guide')).toBeFocused();
  await page.keyboard.press('Home');
  await expect(tab(page, 'choose')).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await onlyActive(page, 'appearance');
  await focusedTabInViewport(page, 'appearance');
  await page.locator('[data-workflow-next]:visible').focus();
  await page.keyboard.press('Enter');
  await onlyActive(page, 'animation');
  await expect(panel(page, 'animation').locator('[data-step-heading]')).toBeFocused();
  await page.locator('[data-workflow-back]:visible').focus();
  await page.keyboard.press('Space');
  await onlyActive(page, 'appearance');
  await expect(panel(page, 'appearance').locator('[data-step-heading]')).toBeFocused();
  await tab(page, 'appearance').focus();
  await page.keyboard.press('Home');
  await page.keyboard.press('Space');
  await onlyActive(page, 'choose');
  await focusedTabInViewport(page, 'choose');
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => !document.activeElement?.closest('[data-step-panel][hidden]'))).toBe(true);
  // Native links and history can hide the element that currently owns focus.
  const guideLink = panel(page, 'choose').getByRole('link', {name: 'New here? Read the guide', exact: false});
  await guideLink.focus();
  await page.keyboard.press('Enter');
  await onlyActive(page, 'guide');
  await expect(tab(page, 'guide')).toBeFocused();
  const startLink = panel(page, 'guide').getByRole('link', {name: 'Start with your icons', exact: false});
  await startLink.focus();
  await page.keyboard.press('Enter');
  await onlyActive(page, 'choose');
  await expect(tab(page, 'choose')).toBeFocused();
  await visitStep(page, 'appearance');
  await page.getByRole('combobox', {name: 'Studio visual style', exact: true}).focus();
  await page.goBack();
  await onlyActive(page, 'choose');
  await expect(tab(page, 'choose')).toBeFocused();
  await page.locator('.studio-action-picker').getByRole('checkbox', {name: 'Like', exact: true}).focus();
  await page.goForward();
  await onlyActive(page, 'appearance');
  await expect(tab(page, 'appearance')).toBeFocused();
  // A surviving header control must retain focus during history navigation.
  const language = page.getByRole('button', {name: 'EN', exact: true});
  await language.focus();
  await page.goBack();
  await onlyActive(page, 'choose');
  await expect(language).toBeFocused();
  await page.goForward();
  await onlyActive(page, 'appearance');
  await expect(language).toBeFocused();
});

test('one configuration survives all steps locale history and a reload without a preset', async ({page}) => {
  test.setTimeout(60000);
  await page.goto('/#choose');
  await page.locator('.studio-action-picker').getByRole('checkbox', {name: 'Save', exact: true}).check();
  await visitStep(page, 'appearance');
  await page.getByRole('combobox', {name: 'Studio visual style', exact: true}).selectOption('soft');
  await setRange(page.getByRole('slider', {name: 'Spacing', exact: true}), 22);
  await page.getByRole('combobox', {name: 'Button presentation', exact: true}).selectOption('icon-only');
  await visitStep(page, 'animation');
  await page.locator('#motion-settings').getByRole('combobox', {name: 'Global motion', exact: true}).selectOption('trace');
  await setRange(page.getByRole('slider', {name: 'Glyph duration', exact: true}), 1000);
  await visitStep(page, 'preview');
  await page.locator('.studio-context').getByRole('button', {name: 'AI chat', exact: true}).click();
  await expect(page.locator('.studio-context [data-action=bookmark]')).toBeVisible();
  await expect(page.locator('.studio-context .sil-action').first()).toHaveClass(/sil-soft/);
  await visitStep(page, 'export');
  const config = page.locator('.studio-config');
  await config.getByRole('button', {name: 'Show code', exact: true}).click();
  const code = await config.getByRole('textbox', {name: 'Generated React code'}).inputValue();
  for (const value of ['"soft"', '"icon-only"', '"trace"', '"chat"', '"bookmark"', '1000']) expect(code).toContain(value);
  await page.getByRole('button', {name: '日本語', exact: true}).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  await expect.poll(() => page.evaluate(key => JSON.parse(sessionStorage.getItem(key)!).locale, draftKey)).toBe('ja');
  const before = await page.evaluate(key => JSON.parse(sessionStorage.getItem(key)!).config, draftKey);
  await page.reload();
  await onlyActive(page, 'export');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  expect(await page.evaluate(key => JSON.parse(sessionStorage.getItem(key)!).config, draftKey)).toEqual(before);
  await visitStep(page, 'appearance');
  await expect(page.getByRole('combobox', {name: '共有設定の見た目', exact: true})).toHaveValue('soft');
  await expect(page.getByRole('combobox', {name: 'ボタンの表示', exact: true})).toHaveValue('icon-only');
  await page.goBack();
  await onlyActive(page, 'export');
  await page.goForward();
  await onlyActive(page, 'appearance');
  await page.getByRole('button', {name: 'EN', exact: true}).click();
  await expect(page.getByRole('slider', {name: 'Spacing', exact: true})).toHaveValue('22');
  await visitStep(page, 'choose');
  await expect(page.locator('.studio-action-picker').getByRole('checkbox', {name: 'Save', exact: true})).toBeChecked();
  await visitStep(page, 'animation');
  await expect(page.locator('#motion-settings').getByRole('combobox', {name: 'Global motion', exact: true})).toHaveValue('trace');
  await expect(page.getByRole('slider', {name: 'Glyph duration', exact: true})).toHaveValue('1000');
  await visitStep(page, 'preview');
  await expect(page.locator('.studio-context').getByRole('button', {name: 'AI chat', exact: true})).toHaveAttribute('aria-pressed', 'true');
  await visitStep(page, 'appearance');
  await page.getByRole('button', {name: 'Isolate a variable', exact: true}).click();
  await page.locator('.studio-controls').getByRole('combobox', {name: 'Only change', exact: true}).selectOption('strokeWidth');
  await setRange(page.getByRole('slider', {name: 'Stroke', exact: true}), 2.6);
  await expect.poll(() => page.evaluate(key => JSON.parse(sessionStorage.getItem(key)!).comparison, draftKey)).toEqual({isolate: true, variable: 'strokeWidth'});
  await page.reload();
  await onlyActive(page, 'appearance');
  await expect(page.getByRole('button', {name: 'Isolate a variable', exact: true})).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.studio-controls').getByRole('combobox', {name: 'Only change', exact: true})).toHaveValue('strokeWidth');
  await expect(page.getByRole('slider', {name: 'Stroke', exact: true})).toHaveValue('2.6');
  await expect(page.getByRole('slider', {name: 'Icon size', exact: true})).toBeDisabled();
});

test('unapplied labels preset names and composer drafts survive revisiting their steps', async ({page}) => {
  await page.goto('/#export');
  const config = page.locator('.studio-config');
  await config.getByLabel('Preset name', {exact: true}).fill('A work in progress');
  await config.locator('.studio-config-actions > summary').click();
  await config.getByLabel('comment English', {exact: true}).fill('Draft discussion label');
  await visitStep(page, 'choose');
  await page.locator('.studio-action-picker').getByRole('checkbox', {name: 'Save', exact: true}).check();
  await visitStep(page, 'preview');
  await expect(page.locator('.studio-context').getByRole('button', {name: 'Comment', exact: true})).toBeVisible();
  await visitStep(page, 'export');
  await expect(config.getByLabel('Preset name', {exact: true})).toHaveValue('A work in progress');
  await expect(config.getByLabel('comment English', {exact: true})).toHaveValue('Draft discussion label');
  await config.getByRole('button', {name: 'Apply labels', exact: true}).click();
  await visitStep(page, 'preview');
  const comment = page.locator('.studio-context').getByRole('button', {name: 'Draft discussion label', exact: true});
  await comment.click();
  await page.getByRole('dialog').getByRole('textbox').fill('Retain this local composer text');
  await page.keyboard.press('Escape');
  await visitStep(page, 'appearance');
  await visitStep(page, 'preview');
  await comment.click();
  await expect(page.getByRole('dialog').getByRole('textbox')).toHaveValue('Retain this local composer text');
  await page.evaluate(() => {location.hash = 'choose';});
  await onlyActive(page, 'choose');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await visitStep(page, 'preview');
  await comment.click();
  await expect(page.getByRole('dialog').getByRole('textbox')).toHaveValue('Retain this local composer text');
  await page.keyboard.press('Escape');
});

test('inactive panels cancel requests and glyph loops while timeline inspection stays paused', async ({page}) => {
  await page.goto('/#guide/motion');
  await page.getByRole('checkbox', {name: 'Loop pending preview', exact: true}).check();
  await expect(page.locator('.motion-matrix .sil-action').first()).toHaveAttribute('aria-busy', 'true');
  expect(await page.locator('.motion-matrix svg').evaluateAll(nodes => nodes.flatMap(svg => svg.getAnimations({subtree: true})).length)).toBeGreaterThan(0);
  await visitStep(page, 'animation');
  await expect.poll(() => page.locator('.motion-matrix svg').evaluateAll(nodes => nodes.flatMap(svg => svg.getAnimations({subtree: true})).filter(animation => animation.playState === 'running' || animation.pending).length)).toBe(0);
  const timeline = page.locator('#timeline');
  await timeline.getByRole('button', {name: 'Formed · peak', exact: false}).click();
  const position = await timeline.getByRole('slider', {name: 'Timeline position', exact: true}).inputValue();
  await visitStep(page, 'export');
  await expect.poll(() => page.locator('[data-step-panel=animation] svg').evaluateAll(nodes => nodes.flatMap(svg => svg.getAnimations({subtree: true})).filter(animation => animation.playState === 'running' || animation.pending).length)).toBe(0);
  await visitStep(page, 'animation');
  await expect(timeline.getByRole('slider', {name: 'Timeline position', exact: true})).toHaveValue(position);
  await expect(timeline.getByRole('button', {name: 'Play timeline', exact: true})).toBeVisible();
  await visitStep(page, 'preview');
  const context = page.locator('.context-section'), like = context.getByRole('button', {name: 'Like', exact: true});
  await context.getByLabel('Response delay').selectOption('2500');
  await like.click();
  await expect(like).toHaveAttribute('aria-busy', 'true');
  await visitStep(page, 'export');
  await page.waitForTimeout(2600);
  await visitStep(page, 'preview');
  await expect(like).not.toHaveAttribute('aria-busy', 'true');
  await expect(like).toHaveAttribute('aria-pressed', 'false');
  await visitGuide(page, 'async');
  const async = page.locator('.async-comparison'), optimistic = async.getByRole('group', {name: 'Optimistic: Like', exact: true});
  await async.getByRole('combobox', {name: 'Simulated latency', exact: true}).selectOption('1800');
  await optimistic.getByRole('button', {name: 'Like', exact: true}).click();
  await expect(optimistic.getByRole('button', {name: 'Like', exact: true})).toHaveAttribute('aria-pressed', 'true');
  await visitStep(page, 'choose');
  await page.waitForTimeout(1900);
  await visitGuide(page, 'async');
  await expect(optimistic.getByRole('button', {name: 'Like', exact: true})).toHaveAttribute('aria-pressed', 'false');
  await expect(optimistic.locator('[data-value=committed]')).toContainText('Off');
  await expect(optimistic.getByRole('button', {name: 'Like', exact: true})).not.toHaveAttribute('aria-busy', 'true');
});

test('legacy deep links select the owning step and Guide sections stay separate', async ({page}) => {
  test.setTimeout(90000);
  const routes: Array<[string, WorkflowStep, string]> = [
    ['studio', 'choose', '.studio-action-picker'],
    ['compare', 'appearance', '#compare'], ['motion', 'animation', '#motion-settings'], ['timeline', 'animation', '#timeline'],
    ['studio-config', 'export', '#studio-config'], ['icon-catalog', 'guide', '#icon-catalog'],
    ['async-comparison', 'guide', '#async-comparison'], ['design-lens', 'guide', '#design-lens'],
    ['states', 'guide', '#states'], ['documentation', 'guide', '#documentation'],
  ];
  for (const [hash, step, selector] of routes) {
    await page.goto('about:blank');
    await page.goto('/#' + hash);
    await onlyActive(page, step);
    await expect(page.locator(selector)).toBeVisible();
  }
  for (const [section, selector] of [['motion', '.motion-matrix'], ['catalog', '#icon-catalog'], ['async', '#async-comparison'], ['design', '#design-lens'], ['states', '#states']] as const) {
    await visitGuide(page, section);
    await expect(page.locator(selector)).toBeVisible();
    await onlyActive(page, 'guide');
    for (const other of ['.motion-matrix', '#icon-catalog', '#async-comparison', '#design-lens', '#states']) {
      if (other !== selector) await expect(page.locator(other)).toBeHidden();
    }
  }
  await visitStep(page, 'choose');
  await visitStep(page, 'guide');
  await expect(page.locator('#documentation')).toBeVisible();
});

test('all six steps have accessible ownership unique IDs and responsive EN JA screenshots', async ({page}, info) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {if (message.type() === 'error') errors.push(message.text());});
  await page.goto('/');
  await expect(page).toHaveTitle('Social Interaction');
  await expect(page.locator('.brand')).toHaveText('Social Interaction');
  for (const locale of ['en', 'ja']) {
    if (locale === 'ja') await page.getByRole('button', {name: '日本語', exact: true}).click();
    for (const step of steps) {
      await visitStep(page, step);
      await onlyActive(page, step);
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('vite-error-overlay')).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const duplicateIds = await page.evaluate(() => {
        const seen = new Set<string>();
        return Array.from(document.querySelectorAll('[id]')).map(element => element.id).filter(id => seen.has(id) || !seen.add(id));
      });
      expect(duplicateIds).toEqual([]);
      await page.screenshot({path: info.outputPath(`workflow-${locale}-${step}.png`), fullPage: true});
    }
  }
  expect(errors).toEqual([]);
});

test('invalid working drafts remain untouched until a valid edit replaces them', async ({page}) => {
  const invalid = '{"schemaVersion":999,"config":{"actions":[]},"locale":"ja"}';
  await page.addInitScript(({key, value}) => sessionStorage.setItem(key, value), {key: draftKey, value: invalid});
  await page.goto('/#choose');
  await onlyActive(page, 'choose');
  await expect(page.locator('.studio-action-picker input:checked')).toHaveCount(4);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  expect(await page.evaluate(key => sessionStorage.getItem(key), draftKey)).toBe(invalid);
  await visitStep(page, 'appearance');
  expect(await page.evaluate(key => sessionStorage.getItem(key), draftKey)).toBe(invalid);
  await page.getByRole('combobox', {name: 'Studio visual style', exact: true}).selectOption('soft');
  await expect.poll(() => page.evaluate(key => JSON.parse(sessionStorage.getItem(key)!).config.variant, draftKey)).toBe('soft');
});

test('blocked session storage leaves a usable navigable configuration', async ({page}) => {
  await page.addInitScript(() => {
    const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
    Storage.prototype.getItem = function(key) {if (this === sessionStorage) throw new DOMException('Storage blocked', 'SecurityError'); return get.call(this, key);};
    Storage.prototype.setItem = function(key, value) {if (this === sessionStorage) throw new DOMException('Storage blocked', 'SecurityError'); return set.call(this, key, value);};
  });
  await page.goto('/#choose');
  await page.locator('.studio-action-picker').getByRole('checkbox', {name: 'Save', exact: true}).check();
  await visitStep(page, 'preview');
  await expect(page.locator('.studio-context [data-action=bookmark]')).toBeVisible();
  await visitStep(page, 'export');
  await page.locator('.studio-config').getByRole('button', {name: 'Show code', exact: true}).click();
  await expect(page.locator('.studio-config').getByRole('textbox', {name: 'Generated React code'})).toHaveValue(/"bookmark"/);
  await onlyActive(page, 'export');
});

test('leaving Export aborts a held import and a late reader cannot replace configuration or drafts', async ({page}) => {
  await page.addInitScript(() => {
    const read = FileReader.prototype.readAsText, abort = FileReader.prototype.abort;
    let held: FileReader | undefined;
    (window as any).__heldImportAborts = 0;
    FileReader.prototype.readAsText = function(file, encoding) {
      held = this;
      const callback = this.onload;
      this.onload = event => {
        const text = this.result;
        (window as any).__releaseHeldImport = () => {
          // Deliver the completed bytes even after abort, to exercise the stale
          // completion guard as well as the native reader cancellation path.
          Object.defineProperty(this, 'result', {configurable: true, value: text});
          callback?.call(this, event);
        };
      };
      return read.call(this, file, encoding);
    };
    FileReader.prototype.abort = function() {
      if (this === held) (window as any).__heldImportAborts++;
      return abort.call(this);
    };
  });
  await page.goto('/#appearance');
  await page.getByRole('combobox', {name: 'Studio visual style', exact: true}).selectOption('soft');
  await expect.poll(() => page.evaluate(key => {const raw = sessionStorage.getItem(key); return raw ? JSON.parse(raw).config.variant : null;}, draftKey)).toBe('soft');
  const before = await page.evaluate(key => JSON.parse(sessionStorage.getItem(key)!).config, draftKey);
  await visitStep(page, 'export');
  const config = page.locator('.studio-config'), input = config.getByLabel('Import JSON', {exact: true});
  await config.getByLabel('Preset name', {exact: true}).fill('Keep this preset draft');
  await config.locator('.studio-config-actions > summary').click();
  await config.getByLabel('comment English', {exact: true}).fill('Keep this label draft');
  await input.setInputFiles({name: 'late-import.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({...before, variant: 'minimal', actions: before.actions.filter((item: {action: string}) => item.action !== 'comment')}))});
  await expect.poll(() => page.evaluate(() => typeof (window as any).__releaseHeldImport)).toBe('function');
  await expect(input).toBeDisabled();
  await visitStep(page, 'appearance');
  await expect(tab(page, 'appearance')).toBeFocused();
  await expect.poll(() => page.evaluate(() => (window as any).__heldImportAborts)).toBe(1);
  await page.evaluate(async () => {
    (window as any).__releaseHeldImport();
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  });
  await onlyActive(page, 'appearance');
  await expect(tab(page, 'appearance')).toBeFocused();
  await expect(page.getByRole('combobox', {name: 'Studio visual style', exact: true})).toHaveValue('soft');
  expect(await page.evaluate(key => JSON.parse(sessionStorage.getItem(key)!).config, draftKey)).toEqual(before);
  await visitStep(page, 'export');
  await expect(input).toBeEnabled();
  await expect(config.getByLabel('Preset name', {exact: true})).toHaveValue('Keep this preset draft');
  await expect(config.getByLabel('comment English', {exact: true})).toHaveValue('Keep this label draft');
  await expect(config.getByRole('status')).toHaveCount(0);
  await expect(config.getByRole('alert')).toHaveCount(0);
});

test('Guide exposes the exact served MIT license and complete third-party notices',async({page})=>{
 await page.goto('/#guide');
 const license=page.getByRole('link',{name:'MIT license',exact:true});
 const notices=page.getByRole('link',{name:'Third-party notices',exact:true});
 await expect(license).toHaveAttribute('href','/LICENSE.txt');await expect(notices).toHaveAttribute('href','/THIRD_PARTY_NOTICES.txt');
 const licenseResponse=await page.request.get('/LICENSE.txt');expect(licenseResponse.ok()).toBe(true);const text=await licenseResponse.text();expect(text).toContain('MIT License');expect(text).toContain('Copyright (c) 2026 domizo');expect(text).toContain('THE SOFTWARE IS PROVIDED "AS IS"');
 const noticeResponse=await page.request.get('/THIRD_PARTY_NOTICES.txt');expect(noticeResponse.ok()).toBe(true);const notice=await noticeResponse.text();for(const name of ['react 19.3.0','react-dom 19.3.0','scheduler 0.28.0','@fontsource-variable/dm-sans 5.3.0','@fontsource/ibm-plex-mono 5.3.0','vite 7.3.7'])expect(notice).toContain(`## ${name}`);expect(notice).toContain('SIL OPEN FONT LICENSE Version 1.1');
 await page.getByRole('button',{name:'日本語',exact:true}).click();await expect(page.getByRole('link',{name:'MIT ライセンス',exact:true})).toBeVisible();await expect(page.getByRole('link',{name:'第三者ライセンス通知',exact:true})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
