import {test,expect,type Locator} from '@playwright/test';
const glyphState=(button:Locator)=>button.locator('svg').evaluate(svg=>{
 const point=(part:string,x:number,y:number)=>{const group=svg.querySelector<SVGGraphicsElement>(`[data-glyph-part="${part}"]`)!;const matrix=(svg as SVGSVGElement).getScreenCTM()!.inverse().multiply(group.getScreenCTM()!);const p=new DOMPoint(x,y).matrixTransform(matrix);return {x:p.x,y:p.y};};
 const glyph=svg.querySelector<SVGGraphicsElement>('.sil-glyph')!,rect=glyph.getBoundingClientRect();
 return {time:Number(svg.getAnimations({subtree:true})[0]?.currentTime??-1),top:point('relay-top',17,6),bottom:point('relay-bottom',7,18),parent:getComputedStyle(glyph).transform,width:rect.width};
});
const bubbleState=(button:Locator)=>button.locator('svg').evaluate(svg=>{const g=svg.querySelector<SVGGraphicsElement>('.sil-glyph')!,matrix=(svg as SVGSVGElement).getScreenCTM()!.inverse().multiply(g.getScreenCTM()!),p=new DOMPoint(3,21).matrixTransform(matrix),echo=svg.querySelector<SVGGraphicsElement>('.sil-effect')!,ep=new DOMPoint(3,21).matrixTransform((svg as SVGSVGElement).getScreenCTM()!.inverse().multiply(echo.getScreenCTM()!)),box=g.getBoundingClientRect();return {echoAnchor:{x:ep.x,y:ep.y},time:Number(svg.getAnimations({subtree:true})[0]?.currentTime??-1),anchor:{x:p.x,y:p.y},width:box.width,height:box.height,opacity:Number(getComputedStyle(g).opacity)};});
const seek=async(button:Locator,phase:number)=>button.locator('svg').evaluate((svg,p)=>{for(const a of svg.getAnimations({subtree:true})){a.pause();a.currentTime=1600*p;}},phase);
test.beforeEach(async({page})=>{await page.goto('/#icon-catalog');await page.getByRole('slider',{name:'Glyph duration',exact:true}).press('End');});
test('Cartoon Repost independently completes a rounded-rectangle circuit and returns',async({page},info)=>{
 const b=page.locator('[data-catalog-action="repost"] button');const box=await b.boundingBox();await b.click();const elapsed=[];
 for(let i=0;i<8;i++){await page.waitForTimeout(180);elapsed.push(await glyphState(b));}
 expect(elapsed[1].time).toBeGreaterThan(elapsed[0].time);expect(elapsed.every(s=>s.parent==='none')).toBe(true);expect(elapsed.some(s=>s.top.x>19)).toBe(true);expect(elapsed.some(s=>s.top.y>17)).toBe(true);expect(elapsed.some(s=>s.top.x<5)).toBe(true);
 await expect.poll(()=>b.locator('svg').evaluate(svg=>svg.getAnimations({subtree:true}).length)).toBe(0);const returned=await glyphState(b);expect(returned.top.x).toBeCloseTo(17,3);expect(returned.top.y).toBeCloseTo(6,3);expect(returned.bottom.x).toBeCloseTo(7,3);expect(returned.bottom.y).toBeCloseTo(18,3);
 await b.click();const phases=[];let lastAngle:number|undefined,winding=0;
 for(let i=0;i<=32;i++){const phase=i/32;await seek(b,phase);const s=await glyphState(b);phases.push({phase,...s});expect(s.top.x+s.bottom.x).toBeCloseTo(24,3);expect(s.top.y+s.bottom.y).toBeCloseTo(24,3);expect(s.top.x).toBeGreaterThanOrEqual(3.99);expect(s.top.x).toBeLessThanOrEqual(20.01);expect(s.top.y).toBeGreaterThanOrEqual(5.99);expect(s.top.y).toBeLessThanOrEqual(18.01);const angle=Math.atan2(s.top.y-12,s.top.x-12);if(lastAngle!==undefined){let delta=angle-lastAngle;while(delta< -Math.PI)delta+=2*Math.PI;while(delta>Math.PI)delta-=2*Math.PI;expect(delta).toBeGreaterThanOrEqual(-.001);winding+=delta;}lastAngle=angle;
  if(i%4===0)await b.screenshot({path:info.outputPath(`repost-frame-${i}.png`)});
 }
 expect(winding).toBeCloseTo(2*Math.PI,2);const next=await b.boundingBox();expect(next!.width).toBeCloseTo(box!.width,3);expect(next!.height).toBeCloseTo(box!.height,3);expect(next!.height).toBeGreaterThanOrEqual(44);expect(await b.locator('.sil-effect').evaluate(el=>getComputedStyle(el).opacity)).toBe('0');
 await info.attach('repost-circuit-evidence.json',{body:JSON.stringify({elapsed,returned,phases,winding},null,2),contentType:'application/json'});
 await page.getByRole('slider',{name:'Intensity',exact:true}).press('End');await b.click();for(const phase of [.2,.4,.6,.8]){await seek(b,phase);const s=await glyphState(b);expect(s.top.x+s.bottom.x).toBeCloseTo(24,3);expect(s.top.y+s.bottom.y).toBeCloseTo(24,3);expect(await b.locator('svg').evaluate(svg=>{const card=svg.closest('.icon-card')!.getBoundingClientRect();return [...svg.querySelectorAll<SVGGraphicsElement>('[data-glyph-part^=relay]')].every(g=>{const r=g.getBoundingClientRect();return r.left>=card.left&&r.right<=card.right&&r.top>=card.top&&r.bottom<=card.bottom;});})).toBe(true);}await b.screenshot({path:info.outputPath('repost-max-intensity.png')});
 await page.getByRole('button',{name:'Stop motion',exact:true}).click();expect(await b.locator('svg').evaluate(svg=>svg.getAnimations({subtree:true}).length)).toBe(0);
});
test('Cartoon Comment inflates from its fixed bottom-left tail and settles',async({page},info)=>{
 const b=page.locator('[data-catalog-action="comment"] button'),box=await b.boundingBox();await b.click();const elapsed=[];
 for(const ms of [100,200,300]){await page.waitForTimeout(ms);elapsed.push(await bubbleState(b));}
 expect(elapsed[1].time).toBeGreaterThan(elapsed[0].time);expect(elapsed[2].width).toBeGreaterThan(elapsed[0].width);expect(elapsed[2].opacity).toBeGreaterThan(elapsed[0].opacity);
 for(const s of elapsed){expect(s.anchor.x).toBeCloseTo(3,3);expect(s.anchor.y).toBeCloseTo(21,3);expect(s.echoAnchor.x).toBeCloseTo(3,3);expect(s.echoAnchor.y).toBeCloseTo(21,3);}
 // Natural playback must finish and clear trace styling; seeking a paused endpoint is not completion.
 await expect.poll(()=>b.locator('svg').evaluate(svg=>svg.getAnimations({subtree:true}).length)).toBe(0);
 await expect.poll(()=>b.locator('.sil-glyph path').evaluateAll(paths=>paths.every(path=>(path as SVGElement).style.strokeDasharray===''))).toBe(true);
 const settled=await bubbleState(b);expect(settled.opacity).toBe(1);expect(settled.anchor.x).toBeCloseTo(3,3);expect(settled.anchor.y).toBeCloseTo(21,3);await b.screenshot({path:info.outputPath('comment-naturally-settled.png')});
 await b.click();const phases=[];for(const phase of [0,.15,.3,.48,.72,.95,1]){await seek(b,phase);const s=await bubbleState(b);phases.push({phase,...s});expect(s.anchor.x).toBeCloseTo(3,3);expect(s.anchor.y).toBeCloseTo(21,3);expect(s.echoAnchor.x).toBeCloseTo(3,3);expect(s.echoAnchor.y).toBeCloseTo(21,3);await b.screenshot({path:info.outputPath(`comment-frame-${phase}.png`)});}
 expect(phases[3].width).toBeGreaterThan(phases.at(-1)!.width);expect(phases[0].width).toBeLessThan(phases.at(-1)!.width*.25);
 const next=await b.boundingBox();expect(next!.width).toBeCloseTo(box!.width,3);expect(next!.height).toBeCloseTo(box!.height,3);
 await info.attach('comment-tail-evidence.json',{body:JSON.stringify({elapsed,settled,phases},null,2),contentType:'application/json'});
 await page.getByRole('slider',{name:'Intensity',exact:true}).press('End');await b.click();await seek(b,.48);const maximum=await bubbleState(b);expect(maximum.anchor.x).toBeCloseTo(3,3);expect(maximum.anchor.y).toBeCloseTo(21,3);await b.screenshot({path:info.outputPath('comment-max-intensity.png')});
 await page.getByRole('checkbox',{name:'Reduce glyph motion',exact:true}).check();await b.click();expect(await b.locator('svg').evaluate(svg=>svg.getAnimations({subtree:true}).length)).toBe(0);expect((await bubbleState(b)).width).toBeCloseTo(phases.at(-1)!.width,3);
});
