import {test,expect} from '@playwright/test';
import {visitStep} from './workflow-helpers.js';
test.beforeEach(async({page})=>{await page.goto('/#animation');});
test('all16 glyph treatments actually progress over time with fixed hit areas',async({page},info)=>{
 await page.getByRole('slider',{name:'Glyph duration',exact:true}).press('End');const samples=[];
 for(const motion of ['pulse','spring','trace','gesture'])for(const action of ['like','comment','share','quote']){
  const button=page.locator(`[data-motion-row="${motion}"] [data-action="${action}"]`),icon=button.locator('svg');const beforeBox=await button.boundingBox();await button.click();
  const read=()=>icon.evaluate(svg=>{const animations=svg.getAnimations({subtree:true});const targets=animations.map(a=>(a.effect as KeyframeEffect).target as Element);return {time:Number(animations[0]?.currentTime??-1),running:animations.some(a=>a.playState==='running'),tags:targets.map(t=>t.tagName),styles:targets.map(t=>({transform:getComputedStyle(t).transform,offset:getComputedStyle(t).strokeDashoffset,opacity:getComputedStyle(t).opacity,fill:getComputedStyle(t).fillOpacity}))};});
  const before=await read();expect(before.running).toBe(true);await page.waitForTimeout(95);const after=await read();expect(after.time).toBeGreaterThan(before.time);expect(JSON.stringify(after.styles)).not.toBe(JSON.stringify(before.styles));expect(after.tags.every(t=>['g','path'].includes(t))).toBe(true);
  const afterBox=await button.boundingBox();expect(afterBox!.width).toBeCloseTo(beforeBox!.width,3);expect(afterBox!.height).toBeCloseTo(beforeBox!.height,3);expect(afterBox!.height).toBeGreaterThanOrEqual(44);samples.push({motion,action,before,after});
 }
 await info.attach('glyph-animation-progress.json',{body:JSON.stringify(samples,null,2),contentType:'application/json'});
 await page.getByRole('button',{name:'Play all',exact:true}).click();for(const [index,delay] of [0,140,260].entries()){if(delay)await page.waitForTimeout(delay);await page.locator('[data-step-panel=animation] .motion-lab').screenshot({path:info.outputPath(`glyph-frame-${index}.png`)});}
});
test('pending uses the glyph, keeps honest status, and cancellation stops it',async({page})=>{
 await page.getByRole('radio',{name:'Use in live actions: Trace',exact:true}).check();await visitStep(page,'preview');const context=page.locator('.context-section'),like=context.getByRole('button',{name:'Like',exact:true});await context.getByLabel('Response delay').selectOption('2500');await like.click();await expect(like).toHaveAttribute('aria-busy','true');await expect(like.locator('.sil-pending-mark')).toBeVisible();expect(await like.locator('svg').evaluate(svg=>svg.getAnimations({subtree:true}).some(a=>(a.effect as KeyframeEffect).getTiming().iterations===Infinity))).toBe(true);
 expect(await like.locator('svg').evaluate(svg=>svg.getAnimations({subtree:true}).every(a=>(a.effect as KeyframeEffect).target?.tagName==='path'))).toBe(true);
 await context.getByRole('button',{name:'Cancel request',exact:true}).click();expect(await like.locator('svg').evaluate(svg=>svg.getAnimations({subtree:true}).length)).toBe(0);await expect(like).toHaveAttribute('aria-pressed','false');await expect(context.getByText('Request cancelled',{exact:true})).toBeVisible();
});
test('rapid replay owns trace cleanup; reduced motion preserves static state',async({page})=>{
 await page.getByRole('slider',{name:'Glyph duration',exact:true}).press('End');const play=page.getByRole('button',{name:'Play all',exact:true});await play.click();await play.click();await play.click();const path=page.locator('[data-motion-row="trace"] [data-action="like"] .sil-glyph path');expect(await path.evaluate(el=>el.style.strokeDasharray)).toBe('1');
 await page.getByRole('checkbox',{name:'Loop pending preview',exact:true}).check();await page.getByRole('checkbox',{name:'Reduce glyph motion',exact:true}).check();expect(await page.locator('.motion-matrix svg').evaluateAll(s=>s.flatMap(svg=>svg.getAnimations({subtree:true})).length)).toBe(0);await expect(page.locator('.motion-matrix .sil-pending-mark')).toHaveCount(20);
 await page.getByRole('checkbox',{name:'Reduce glyph motion',exact:true}).uncheck();await page.emulateMedia({reducedMotion:'reduce'});await play.click();expect(await page.locator('.motion-matrix svg').evaluateAll(s=>s.flatMap(svg=>svg.getAnimations({subtree:true})).length)).toBe(0);await expect(page.locator('[data-motion-row="spring"] [data-action="like"]')).toHaveAttribute('aria-busy','true');
});
test('zero duration and stop keep still glyphs and selectable variants',async({page})=>{
 await page.getByRole('slider',{name:'Glyph duration',exact:true}).press('Home');await page.getByRole('button',{name:'Play all',exact:true}).click();expect(await page.locator('.motion-matrix svg').evaluateAll(s=>s.flatMap(svg=>svg.getAnimations({subtree:true})).length)).toBe(0);
 await page.getByRole('slider',{name:'Glyph duration',exact:true}).press('End');await page.getByRole('button',{name:'Play all',exact:true}).click();await page.getByRole('button',{name:'Stop motion',exact:true}).click();expect(await page.locator('.motion-matrix svg').evaluateAll(s=>s.flatMap(svg=>svg.getAnimations({subtree:true})).length)).toBe(0);
 await page.getByRole('button',{name:'日本語',exact:true}).click();await expect(page.getByRole('heading',{name:'アイコンそのものを動かす。',exact:true})).toBeVisible();await page.getByRole('radio',{name:'実際の操作に使う: ジェスチャー',exact:true}).check();await visitStep(page,'preview');await expect(page.locator('.context-section [data-action="like"]')).toHaveAttribute('data-icon-motion','gesture');
});

test('standalone reduced prop suppresses CSS movement and selected specimens stay filled',async({page})=>{
 expect(await page.locator('.motion-lab>.section-title p').first().evaluate(el=>getComputedStyle(el).color)).toBe('rgb(100, 113, 129)');await visitStep(page,'appearance');await page.locator('input[name="preview"][value="selected"]').check();const selected=page.locator('.specimen [data-action="like"]').first();await expect(selected).toHaveAttribute('aria-pressed','false');expect(await selected.locator('svg').evaluate(el=>getComputedStyle(el).fill)).not.toBe('none');
 await visitStep(page,'animation');await page.getByRole('checkbox',{name:'Reduce glyph motion',exact:true}).check();const button=page.locator('[data-motion-row="spring"] [data-action="like"]');
 await expect(button).toHaveAttribute('data-reduced-motion','true');await button.evaluate(el=>{for(let p=el.parentElement;p;p=p.parentElement)p.removeAttribute('data-reduced-motion');el.setAttribute('data-preview','pressed');});await button.hover();
 expect(await button.evaluate(el=>getComputedStyle(el).transform)).toBe('none');expect(await button.locator('.sil-content').evaluate(el=>getComputedStyle(el).transform)).toBe('none');
});
