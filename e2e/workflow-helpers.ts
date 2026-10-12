import {expect, type Page} from '@playwright/test';

export type WorkflowStep = 'choose' | 'appearance' | 'animation' | 'preview' | 'export' | 'guide';
export type GuideSection = 'motion' | 'catalog' | 'async' | 'design' | 'states';

/** Navigate the real workflow. Tests never expose inactive panels or bypass lifecycle cleanup. */
export async function visitStep(page: Page, step: WorkflowStep) {
  const tab = page.locator(`[role="tab"][data-workflow-step="${step}"]`);
  await tab.click();
  await expect(tab).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator(`[data-step-panel="${step}"]`)).toBeVisible();
}

export async function visitGuide(page: Page, section?: GuideSection) {
  await visitStep(page, 'guide');
  if (section) await page.locator(`#guide-tab-${section}`).click();
  await expect(page).toHaveURL(new RegExp(`#guide${section ? `/${section}` : ''}$`));
}

/** Match a public specimen to the step that owns it before inspecting it. */
export async function visitSurface(page: Page, selector: string) {
  if (/design-lens/.test(selector)) return visitGuide(page, 'design');
  if (/async-comparison/.test(selector)) return visitGuide(page, 'async');
  if (/icon-catalog|data-catalog-action/.test(selector)) return visitGuide(page, 'catalog');
  if (/#states/.test(selector)) return visitGuide(page, 'states');
  if (/studio-action-picker/.test(selector)) return visitStep(page, 'choose');
  if (/motion-row|motion-matrix/.test(selector)) return visitGuide(page, 'motion');
  if (/timeline|#motion/.test(selector)) return visitStep(page, 'animation');
  if (/studio-context|context-section|\.post/.test(selector)) return visitStep(page, 'preview');
  if (/studio-config/.test(selector)) return visitStep(page, 'export');
  return visitStep(page, 'appearance');
}
