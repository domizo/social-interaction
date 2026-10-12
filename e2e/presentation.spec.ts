import {expect, test, type Locator} from '@playwright/test';

import {visitStep,visitGuide,visitSurface} from './workflow-helpers.js';

async function checkButtons(root:Locator, iconOnly:boolean){
 const buttons=root.locator('.sil-action');await expect(buttons.first()).toBeVisible();
 const states=await buttons.evaluateAll(nodes=>nodes.map(button=>{const r=button.getBoundingClientRect();return {presentation:button.getAttribute('data-presentation'),name:button.getAttribute('aria-label'),title:button.getAttribute('title'),labels:button.querySelectorAll('.sil-label').length,counts:button.querySelectorAll('.sil-count').length,width:r.width,height:r.height};}));expect(states.length).toBeGreaterThan(0);
 for(const state of states){expect(state.presentation).toBe(iconOnly?'icon-only':'labelled');expect(state.name).toBeTruthy();expect(state.labels).toBe(iconOnly?0:1);if(iconOnly){expect(state.counts).toBe(0);expect(state.title).toBe(state.name);}expect(state.width).toBeGreaterThanOrEqual(44);expect(state.height).toBeGreaterThanOrEqual(44);}
}
test('one presentation setting reaches all contexts and comparison surfaces in EN and JA',async({page},info)=>{
 await page.goto('/#appearance');const setting=page.getByRole('combobox',{name:'Button presentation',exact:true}),context=page.locator('.studio-context');
 await expect(setting).toHaveValue('labelled');await visitStep(page,'preview');await checkButtons(context,false);
 await visitStep(page,'appearance');await setting.selectOption('icon-only');await visitStep(page,'preview');
 for(const name of ['Social feed','Article footer','AI chat']){await context.getByRole('button',{name,exact:true}).click();await checkButtons(context,true);expect(await context.evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);await context.screenshot({path:info.outputPath(`icons-${name.split(' ')[0]}.png`)});}
 for(const selector of ['.design-lens','.async-comparison','#compare','.motion-matrix','#states','.diff-preview']){await visitSurface(page,selector);await checkButtons(page.locator(selector),true);}
 await visitStep(page,'appearance');const liveLike=page.locator('#compare .sil-action[data-action=like]').first();const described=await liveLike.getAttribute('aria-describedby');expect(described).toBeTruthy();expect(await page.evaluate(id=>document.getElementById(id!)?.textContent,described)).toBe('Like: 128');expect(await liveLike.locator('.sil-sr-only').evaluate(el=>{const s=getComputedStyle(el);return s.position==='absolute'&&s.clip==='rect(0px, 0px, 0px, 0px)'&&el.getBoundingClientRect().width===1;})).toBe(true);
 await page.getByRole('button',{name:'日本語',exact:true}).click();const jaSetting=page.getByRole('combobox',{name:'ボタンの表示',exact:true});await expect(jaSetting).toHaveValue('icon-only');
 await visitStep(page,'preview');for(const name of ['ソーシャルフィード','記事の末尾','AIチャット']){await context.getByRole('button',{name,exact:true}).click();await checkButtons(context,true);}
 await page.locator('.studio-preview-layout').screenshot({path:info.outputPath('icons-studio-ja.png')});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await visitStep(page,'appearance');await jaSetting.selectOption('labelled');await visitStep(page,'preview');await checkButtons(context,false);await visitStep(page,'appearance');await expect(page.locator('#compare .sil-count').first()).toBeVisible();
});
test('presentation preserves live request ownership, keyboard actions and saved/exported configuration',async({page},info)=>{
 await page.goto('/#appearance');const setting=page.getByRole('combobox',{name:'Button presentation',exact:true}),context=page.locator('.studio-context'),async=page.locator('.async-comparison'),group=async.getByRole('group',{name:'Optimistic: Like',exact:true}),like=group.getByRole('button',{name:'Like',exact:true});
 await visitGuide(page,'async');await async.getByRole('combobox',{name:'Simulated latency',exact:true}).selectOption('1800');await like.evaluate(el=>(window as any).__sameButton=el);await like.click();await expect(like).toHaveAttribute('aria-pressed','true');await expect(group).toHaveAttribute('data-status','success');await visitStep(page,'appearance');await setting.selectOption('icon-only');await visitGuide(page,'async');expect(await like.evaluate(el=>el===(window as any).__sameButton)).toBe(true);await expect(like).toHaveAttribute('aria-pressed','true');await expect(group).toHaveAttribute('data-status','success');
 await visitStep(page,'preview');const comment=context.getByRole('button',{name:'Comment',exact:true});await comment.focus();await page.keyboard.press('Enter');await expect(page.getByRole('dialog').getByRole('textbox')).toBeFocused();await page.keyboard.press('Escape');await expect(comment).toBeFocused();const share=context.getByRole('button',{name:'Share',exact:true});await share.focus();await page.keyboard.press('ArrowDown');await expect(page.getByRole('menuitem',{name:'Show example link'})).toBeFocused();await page.keyboard.press('Escape');await expect(share).toBeFocused();const toggle=context.getByRole('button',{name:'Like',exact:true});await comment.focus();await page.keyboard.press('Shift+Tab');await expect(toggle).toBeFocused();expect(await toggle.evaluate(el=>el.matches(':focus-visible'))).toBe(true);await page.keyboard.press('Space');await expect(toggle).toHaveAttribute('aria-pressed','true');expect(await toggle.evaluate(el=>getComputedStyle(el).outlineStyle)).not.toBe('none');
 await visitStep(page,'export');const panel=page.locator('.studio-config');await panel.getByRole('textbox',{name:'Preset name',exact:true}).fill('Only icons');await panel.getByRole('button',{name:'Save preset',exact:true}).click();await panel.getByRole('button',{name:'Show code',exact:true}).click();const code=await panel.getByRole('textbox',{name:'Generated React code'}).inputValue();expect(code).toContain('"presentation": "icon-only"');expect(code).toContain('presentation={studioConfig.presentation}');
 const stored=await page.evaluate(()=>localStorage.getItem('social-interaction-lab:studio-presets:v1'));expect(JSON.parse(stored!).presets[0].config.presentation).toBe('icon-only');await page.reload();await visitStep(page,'appearance');await expect(setting).toHaveValue('icon-only');await visitStep(page,'export');await panel.getByRole('combobox',{name:'Choose a preset',exact:true}).selectOption('Only icons');await panel.getByRole('button',{name:'Load',exact:true}).click();await visitStep(page,'appearance');await expect(setting).toHaveValue('icon-only');await visitStep(page,'preview');await checkButtons(context,true);await visitStep(page,'export');
 const legacy=JSON.parse(stored!).presets[0].config;delete legacy.presentation;await panel.getByLabel('Import JSON',{exact:true}).setInputFiles({name:'legacy.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(legacy))});await expect(panel.getByRole('status')).toContainText('Configuration imported');await visitStep(page,'appearance');await expect(setting).toHaveValue('labelled');await visitStep(page,'preview');await checkButtons(context,false);
 await visitStep(page,'appearance');await setting.selectOption('icon-only');await page.getByRole('checkbox',{name:'Reduce preview motion',exact:true}).check();await visitStep(page,'preview');await expect(context.getByRole('button',{name:'Like',exact:true})).toHaveAttribute('data-reduced-motion','true');await context.screenshot({path:info.outputPath('icons-keyboard-reduced.png')});
});
test('actual generated icon-only modules preserve names, focus and minimum targets at390px',async({page},info)=>{
 await page.setViewportSize({width:390,height:844});
 for(const locale of ['en','ja']){
  await page.goto(`http://127.0.0.1:4319/?presentation=icon-only&locale=${locale}`);await checkButtons(page.locator('body'),true);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const like=page.locator('[data-action=like]');await like.focus();await page.keyboard.press('Space');await expect(like).toHaveAttribute('aria-pressed','true');const comment=page.locator('[data-action=comment]');await comment.focus();await page.keyboard.press('Enter');await expect(page.locator('textarea')).toBeFocused();await page.keyboard.press('Escape');await expect(comment).toBeFocused();await expect.poll(()=>comment.locator('.sil-glyph').evaluate(g=>!g.hasAttribute('style')&&!g.querySelector('path')?.hasAttribute('style'))).toBe(true);await page.screenshot({path:info.outputPath(`icons-generated-${locale}.png`),fullPage:true});
 }
});

test('changing presentation releases inactive Cartoon paths and returning starts cleanly',async({page},info)=>{
 await page.goto('/#appearance');const setting=page.getByRole('combobox',{name:'Button presentation',exact:true});await setting.selectOption('icon-only');
 await visitGuide(page,'catalog');await page.getByRole('slider',{name:'Glyph duration',exact:true}).press('End');
 for(const action of ['comment','repost']){
  const button=page.locator(`[data-catalog-action=${action}] .sil-action`),svg=button.locator('svg');
  const read=()=>svg.evaluate(svg=>Array.from(svg.querySelectorAll('.sil-glyph path')).map(path=>{const p=path as SVGPathElement,b=p.getBBox();return {d:p.getAttribute('d'),bounds:[b.x,b.y,b.width,b.height],length:p.getTotalLength()};}));
  const clean=()=>svg.locator('.sil-glyph').evaluate(g=>!g.hasAttribute('style')&&Array.from(g.querySelectorAll('path')).every(p=>!p.hasAttribute('style'))&&g.getAnimations({subtree:true}).length===0);
  const sampleClick=async()=>{
   // Sample in the page from the actual click, avoiding multiple Node round trips
   // that can outlast this finite motion on slower browser engines.
   await svg.evaluate(svg=>{(window as any).__presentationSamples=new Promise(resolve=>{svg.closest('button')!.addEventListener('click',()=>{const start=performance.now(),samples:any[]=[];const sample=()=>{samples.push({elapsed:performance.now()-start,paths:Array.from(svg.querySelectorAll('.sil-glyph path')).map(path=>{const p=path as SVGPathElement,b=p.getBBox();return {d:p.getAttribute('d'),bounds:[b.x,b.y,b.width,b.height]};})});if(samples.length<5)setTimeout(sample,80);else resolve(samples);};setTimeout(sample,40);},{once:true});});});
   await button.click();return await page.evaluate(()=> (window as any).__presentationSamples) as Array<{elapsed:number;paths:Array<{d:string|null;bounds:number[]}>}>;
  };
  const baseline=await read();await svg.evaluate(svg=>(window as any).__motionNode=svg);
  const samples=await sampleClick();await info.attach(`${action}-icon-only-elapsed.json`,{body:JSON.stringify({baseline,samples}),contentType:'application/json'});
  const moved=samples.filter(s=>s.paths.some((p,i)=>p.d!==baseline[i].d));expect(moved.length).toBeGreaterThanOrEqual(2);expect(new Set(moved.map(s=>JSON.stringify(s.paths))).size).toBeGreaterThanOrEqual(2);expect(moved.some(s=>s.paths.some((p,i)=>JSON.stringify(p.bounds)!==JSON.stringify(baseline[i].bounds)))).toBe(true);
  await visitStep(page,'appearance');await setting.selectOption('labelled');
  // Hidden SVGs have no rendered bounding box. Check owned data/cleanup here,
  // then the exact native geometry again after the retained panel is visible.
  await expect.poll(()=>svg.locator('.sil-glyph path').evaluateAll(paths=>paths.map(p=>p.getAttribute('d')))).toEqual(baseline.map(p=>p.d));await expect.poll(clean).toBe(true);await expect(svg).toBeHidden();
  await visitGuide(page,'catalog');expect(await svg.evaluate(svg=>svg===(window as any).__motionNode)).toBe(true);await expect.poll(read).toEqual(baseline);
  const replay=await sampleClick();await info.attach(`${action}-labelled-replay-elapsed.json`,{body:JSON.stringify({baseline,replay}),contentType:'application/json'});expect(replay.some(s=>s.paths.some((p,i)=>p.d!==baseline[i].d))).toBe(true);await expect.poll(read).toEqual(baseline);await expect.poll(clean).toBe(true);
  await visitStep(page,'appearance');await setting.selectOption('icon-only');await visitGuide(page,'catalog');await expect.poll(read).toEqual(baseline);
 }
});
