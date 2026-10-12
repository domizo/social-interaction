import {expect, test, type Locator} from '@playwright/test';

async function checkButtons(root:Locator, iconOnly:boolean){
 const buttons=root.locator('.sil-action');await expect(buttons.first()).toBeVisible();
 const states=await buttons.evaluateAll(nodes=>nodes.map(button=>{const r=button.getBoundingClientRect();return {presentation:button.getAttribute('data-presentation'),name:button.getAttribute('aria-label'),title:button.getAttribute('title'),labels:button.querySelectorAll('.sil-label').length,counts:button.querySelectorAll('.sil-count').length,width:r.width,height:r.height};}));expect(states.length).toBeGreaterThan(0);
 for(const state of states){expect(state.presentation).toBe(iconOnly?'icon-only':'labelled');expect(state.name).toBeTruthy();expect(state.labels).toBe(iconOnly?0:1);if(iconOnly){expect(state.counts).toBe(0);expect(state.title).toBe(state.name);}expect(state.width).toBeGreaterThanOrEqual(44);expect(state.height).toBeGreaterThanOrEqual(44);}
}
test('one presentation setting reaches all contexts and comparison surfaces in EN and JA',async({page},info)=>{
 await page.goto('/#studio');const setting=page.getByRole('combobox',{name:'Button presentation',exact:true}),context=page.locator('.studio-context');
 await expect(setting).toHaveValue('labelled');await checkButtons(context,false);
 await setting.selectOption('icon-only');
 for(const name of ['Social feed','Article footer','AI chat']){await context.getByRole('button',{name,exact:true}).click();await checkButtons(context,true);expect(await context.evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);await context.screenshot({path:info.outputPath(`icons-${name.split(' ')[0]}.png`)});}
 for(const selector of ['.design-lens','.async-comparison','#compare','#motion','#states','.diff-preview'])await checkButtons(page.locator(selector),true);
 const liveLike=page.locator('#compare .sil-action[data-action=like]').first();const described=await liveLike.getAttribute('aria-describedby');expect(described).toBeTruthy();expect(await page.evaluate(id=>document.getElementById(id!)?.textContent,described)).toBe('Like: 128');expect(await liveLike.locator('.sil-sr-only').evaluate(el=>{const s=getComputedStyle(el);return s.position==='absolute'&&s.clip==='rect(0px, 0px, 0px, 0px)'&&el.getBoundingClientRect().width===1;})).toBe(true);
 await page.getByRole('button',{name:'日本語',exact:true}).click();const jaSetting=page.getByRole('combobox',{name:'ボタンの表示',exact:true});await expect(jaSetting).toHaveValue('icon-only');
 for(const name of ['ソーシャルフィード','記事の末尾','AIチャット']){await context.getByRole('button',{name,exact:true}).click();await checkButtons(context,true);}
 await page.locator('.studio-preview-layout').screenshot({path:info.outputPath('icons-studio-ja.png')});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await jaSetting.selectOption('labelled');await checkButtons(context,false);await expect(page.locator('#compare .sil-count').first()).toBeVisible();
});
test('presentation preserves live request ownership, keyboard actions and saved/exported configuration',async({page},info)=>{
 await page.goto('/#studio');const setting=page.getByRole('combobox',{name:'Button presentation',exact:true}),context=page.locator('.studio-context'),async=page.locator('.async-comparison'),group=async.getByRole('group',{name:'Optimistic: Like',exact:true}),like=group.getByRole('button',{name:'Like',exact:true});
 await async.getByRole('combobox',{name:'Simulated latency',exact:true}).selectOption('1800');await like.evaluate(el=>(window as any).__sameButton=el);await like.click();await setting.selectOption('icon-only');expect(await like.evaluate(el=>el===(window as any).__sameButton)).toBe(true);await expect(like).toHaveAttribute('aria-pressed','true');await expect(group).toHaveAttribute('data-status','success');
 const comment=context.getByRole('button',{name:'Comment',exact:true});await comment.focus();await page.keyboard.press('Enter');await expect(page.getByRole('dialog').getByRole('textbox')).toBeFocused();await page.keyboard.press('Escape');await expect(comment).toBeFocused();const share=context.getByRole('button',{name:'Share',exact:true});await share.focus();await page.keyboard.press('ArrowDown');await expect(page.getByRole('menuitem',{name:'Show example link'})).toBeFocused();await page.keyboard.press('Escape');await expect(share).toBeFocused();const toggle=context.getByRole('button',{name:'Like',exact:true});await toggle.focus();await page.keyboard.press('Space');await expect(toggle).toHaveAttribute('aria-pressed','true');expect(await toggle.evaluate(el=>getComputedStyle(el).outlineStyle)).not.toBe('none');
 const panel=page.locator('.studio-config');await panel.getByRole('textbox',{name:'Preset name',exact:true}).fill('Only icons');await panel.getByRole('button',{name:'Save preset',exact:true}).click();await panel.getByRole('button',{name:'Show code',exact:true}).click();const code=await panel.getByRole('textbox',{name:'Generated React code'}).inputValue();expect(code).toContain('"presentation": "icon-only"');expect(code).toContain('presentation={studioConfig.presentation}');
 const stored=await page.evaluate(()=>localStorage.getItem('social-interaction-lab:studio-presets:v1'));expect(JSON.parse(stored!).presets[0].config.presentation).toBe('icon-only');await page.reload();await expect(setting).toHaveValue('labelled');await panel.getByRole('combobox',{name:'Choose a preset',exact:true}).selectOption('Only icons');await panel.getByRole('button',{name:'Load',exact:true}).click();await expect(setting).toHaveValue('icon-only');await checkButtons(context,true);
 const legacy=JSON.parse(stored!).presets[0].config;delete legacy.presentation;await panel.getByLabel('Import JSON',{exact:true}).setInputFiles({name:'legacy.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(legacy))});await expect(setting).toHaveValue('labelled');await checkButtons(context,false);
 await setting.selectOption('icon-only');await page.getByRole('checkbox',{name:'Reduce preview motion',exact:true}).check();await expect(context.getByRole('button',{name:'Like',exact:true})).toHaveAttribute('data-reduced-motion','true');await context.screenshot({path:info.outputPath('icons-keyboard-reduced.png')});
});
test('actual generated icon-only modules preserve names, focus and minimum targets at390px',async({page},info)=>{
 await page.setViewportSize({width:390,height:844});
 for(const locale of ['en','ja']){
  await page.goto(`http://127.0.0.1:4319/?presentation=icon-only&locale=${locale}`);await checkButtons(page.locator('body'),true);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const like=page.locator('[data-action=like]');await like.focus();await page.keyboard.press('Space');await expect(like).toHaveAttribute('aria-pressed','true');const comment=page.locator('[data-action=comment]');await comment.focus();await page.keyboard.press('Enter');await expect(page.locator('textarea')).toBeFocused();await page.keyboard.press('Escape');await expect(comment).toBeFocused();await expect.poll(()=>comment.locator('.sil-glyph').evaluate(g=>!g.hasAttribute('style')&&!g.querySelector('path')?.hasAttribute('style'))).toBe(true);await page.screenshot({path:info.outputPath(`icons-generated-${locale}.png`),fullPage:true});
 }
});

test('icon-only Cartoon paths keep playing through presentation switches and restore canonical geometry',async({page},info)=>{
 await page.goto('/#icon-catalog');const setting=page.getByRole('combobox',{name:'Button presentation',exact:true});await setting.selectOption('icon-only');
 await page.getByRole('slider',{name:'Studio glyph duration',exact:true}).evaluate(el=>{const input=el as HTMLInputElement;Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(input,'1600');input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));});
 const evidence=[];
 for(const action of ['comment','repost']){
  const button=page.locator(`[data-catalog-action=${action}] .sil-action`),svg=button.locator('svg');
  const read=()=>svg.evaluate(svg=>Array.from(svg.querySelectorAll('.sil-glyph path')).map(path=>{const p=path as SVGPathElement,b=p.getBBox();return {d:p.getAttribute('d'),bounds:[b.x,b.y,b.width,b.height],length:p.getTotalLength()};}));
  const baseline=await read();await svg.evaluate(svg=>(window as any).__motionNode=svg);await button.click();await expect.poll(read).not.toEqual(baseline);const during=await read();expect(during.map(p=>p.bounds)).not.toEqual(baseline.map(p=>p.bounds));
  await setting.selectOption('labelled');expect(await svg.evaluate(svg=>svg===(window as any).__motionNode)).toBe(true);const switched=await read();expect(switched).not.toEqual(baseline);await expect.poll(read).not.toEqual(switched);const advancing=await read();expect(advancing).not.toEqual(baseline);await setting.selectOption('icon-only');await expect.poll(read).toEqual(baseline);await expect.poll(()=>svg.locator('.sil-glyph').evaluate(g=>!g.hasAttribute('style')&&Array.from(g.querySelectorAll('path')).every(p=>!p.hasAttribute('style')))).toBe(true);evidence.push({action,baseline,during,switched,advancing,settled:await read()});
 }
 await info.attach('icon-only-real-path-playback.json',{body:JSON.stringify(evidence),contentType:'application/json'});
});
