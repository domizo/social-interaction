import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{await page.goto('/');});
test('responsive specimen and hit targets; EN and JA screenshots',async({page},info)=>{
 await expect(page.getByRole('heading',{level:1})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 for(const box of await page.locator('.sil-action').evaluateAll(buttons=>buttons.map(b=>{const r=b.getBoundingClientRect();return {w:r.width,h:r.height};}))){expect(box.w).toBeGreaterThanOrEqual(44);expect(box.h).toBeGreaterThanOrEqual(44);}
 await page.screenshot({path:info.outputPath('social-en.png'),fullPage:true});
 await page.getByRole('button',{name:'日本語',exact:true}).click();await expect(page.locator('html')).toHaveAttribute('lang','ja');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:info.outputPath('social-ja.png'),fullPage:true});
});
test('native composer traps focus, cancels pending and restores trigger',async({page})=>{
 const context=page.locator('.context-section'),comment=context.getByRole('button',{name:'Comment',exact:true});
 await context.getByLabel('Response delay').selectOption('2500');await comment.click();
 const dialog=page.getByRole('dialog'),text=dialog.getByRole('textbox');await expect(text).toBeFocused();await text.fill('Cancel this draft');
 for(const key of ['Tab','Tab','Tab','Tab','Tab','Shift+Tab','Shift+Tab','Shift+Tab','Shift+Tab','Shift+Tab']){await page.keyboard.press(key);expect(await dialog.evaluate(el=>el.contains(document.activeElement))).toBe(true);}
 await dialog.getByRole('button',{name:'Save locally',exact:true}).click();
 await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(comment).toBeFocused();
 await expect(comment).toContainText('24');await page.waitForTimeout(2600);await expect(comment).toContainText('24');
});
test('fail-next composer retries once and retains text',async({page})=>{
 const context=page.locator('.context-section');await context.getByLabel('Fail next request').check();await context.getByLabel('Response delay').selectOption('0');await context.getByRole('button',{name:'Comment',exact:true}).click();
 const dialog=page.getByRole('dialog');await dialog.getByRole('textbox').fill('Retained in this session');await dialog.getByRole('button',{name:'Save locally',exact:true}).click();await expect(dialog.getByRole('status')).toContainText('Simulated failure');await dialog.getByRole('button',{name:'Save locally',exact:true}).click();await expect(dialog).toHaveCount(0);await context.getByText('Saved locally (1)',{exact:true}).click();await expect(context.getByText('Retained in this session',{exact:false})).toBeVisible();
});
test('share keyboard navigation, tab and cancellation focus',async({page})=>{
 const context=page.locator('.context-section'),share=context.getByRole('button',{name:'Share',exact:true}),quote=context.getByRole('button',{name:'Quote',exact:true});await share.focus();await page.keyboard.press('ArrowUp');await expect(page.getByRole('menuitem',{name:'Prepare local share'})).toBeFocused();await page.keyboard.press('Home');await expect(page.getByRole('menuitem',{name:'Copy demo link'})).toBeFocused();await page.keyboard.press('Tab');await expect(quote).toBeFocused();await expect(page.getByRole('menu')).toHaveCount(0);
 await context.getByLabel('Response delay').selectOption('2500');await share.click();await page.getByRole('menuitem',{name:'Prepare local share'}).click();await expect(share).toHaveAttribute('aria-busy','true');await context.getByRole('button',{name:'Cancel request'}).click();await expect(share).toBeFocused();
});
test('isolation and reduced motion reflect actual components',async({page})=>{
 await page.getByRole('button',{name:'Isolate a variable'}).click();await expect(page.getByRole('slider',{name:'Icon size',exact:true})).toBeDisabled();await page.getByRole('checkbox',{name:'Reduce motion',exact:true}).check();expect(await page.locator('.sil-action').first().evaluate(el=>getComputedStyle(el).transitionDuration)).toBe('0s');
 await page.getByRole('checkbox',{name:'Reduce motion',exact:true}).uncheck();await page.emulateMedia({reducedMotion:'reduce'});expect(await page.locator('.sil-action').first().evaluate(el=>getComputedStyle(el).transitionDuration)).toBe('0s');
});
test('exported archive downloads successfully',async({page})=>{const [download]=await Promise.all([page.waitForEvent('download'),page.locator('.header-actions a.export').click()]);expect(download.suggestedFilename()).toBe('social-interaction-lab-react-0.1.0.tgz');expect(await download.failure()).toBeNull();});
