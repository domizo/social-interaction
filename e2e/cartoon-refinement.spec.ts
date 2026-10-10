import {test,expect,type Locator} from '@playwright/test';
const shapeState=(button:Locator)=>button.locator('svg').evaluate(svg=>{
 const read=(part:string)=>{const el=svg.querySelector<SVGPathElement>(`[data-glyph-part="${part}"]`)!;const d=el.getAttribute('d')!,values=(d.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi)||[]).map(Number),points=Array.from({length:values.length/2},(_,i)=>({x:values[i*2],y:values[i*2+1]}));return {d,points,length:el.getTotalLength(),transform:getComputedStyle(el).transform};};
 return {time:Number(svg.getAnimations({subtree:true})[0]?.currentTime??-1),top:read('repost-body-top'),bottom:read('repost-body-bottom'),head:read('repost-head-top'),parent:getComputedStyle(svg.querySelector('.sil-glyph')!).transform};
});
const commentState=(button:Locator)=>button.locator('[data-glyph-part=comment-body]').evaluate(el=>{
 const style=getComputedStyle(el),d=el.getAttribute('d')!,v=(d.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi)||[]).map(Number),points=Array.from({length:v.length/2},(_,i)=>({x:v[i*2],y:v[i*2+1]}));
 const cx=(points[16].x+points[48].x)/2,cy=(points[0].y+points[32].y)/2,r=(points[16].x-points[48].x)/2;
 return {d,points,cx,cy,r,tailRatio:Math.hypot(points[40].x-cx,points[40].y-cy)/r,circleError:Math.max(...points.map(p=>Math.abs(Math.hypot(p.x-cx,p.y-cy)/r-1))),opacity:Number(style.opacity),dasharray:style.strokeDasharray,dashoffset:style.strokeDashoffset,transform:style.transform};
});
const seek=async(button:Locator,phase:number)=>button.locator('svg').evaluate((svg,p)=>{for(const a of svg.getAnimations({subtree:true})){if(p===1){a.finish();continue;}a.pause();(a.effect as KeyframeEffect).updateTiming({easing:'linear'});a.currentTime=1600*p;}return new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));},phase);
test.beforeEach(async({page})=>{await page.goto('/#icon-catalog');await page.getByRole('slider',{name:'Glyph duration',exact:true}).press('End');});
test('Cartoon Repost deforms constant-length bodies along the route with tangent heads',async({page},info)=>{
 test.setTimeout(90000);const b=page.locator('[data-catalog-action="repost"] button'),box=await b.boundingBox();await b.click();const elapsed=[];
 for(let i=0;i<5;i++){await page.waitForTimeout(190);elapsed.push(await shapeState(b));}
 expect(elapsed[1].time).toBeGreaterThan(elapsed[0].time);expect(elapsed[0].top.d).not.toBe(elapsed[1].top.d);expect(elapsed.every(s=>s.parent==='none'&&s.top.transform==='none')).toBe(true);
 await expect.poll(()=>b.locator('svg').evaluate(svg=>svg.getAnimations({subtree:true}).length)).toBe(0);const returned=await shapeState(b);expect(returned.top.points.at(-1)!.x).toBeCloseTo(13,3);expect(returned.top.points.at(-1)!.y).toBeCloseTo(3,3);
 await b.screenshot({path:info.outputPath('repost-naturally-settled.png')});await b.click();const samples=[];let horizontal=false,vertical=false,corner=false,winding=0,lastAngle:number|undefined;const chords=[];
 for(let i=0;i<=96;i++){await seek(b,i/96);const s=await shapeState(b),points=s.top.points,tip=points.at(-1)!,other=s.bottom.points.at(-1)!;samples.push({phase:i/96,...s});expect(points).toHaveLength(33);expect(s.top.length).toBeGreaterThan(9.94);expect(s.top.length).toBeLessThan(10.01);expect(tip.x+other.x).toBeCloseTo(24,3);expect(tip.y+other.y).toBeCloseTo(24,3);expect(s.parent).toBe('none');expect(s.top.transform).toBe('none');
  const headTip=s.head.points[1],mid={x:(s.head.points[0].x+s.head.points[2].x)/2,y:(s.head.points[0].y+s.head.points[2].y)/2},vx=headTip.x-mid.x,vy=headTip.y-mid.y;
  expect(headTip.x).toBeCloseTo(tip.x,3);expect(headTip.y).toBeCloseTo(tip.y,3);
  // Independent local tangent: a straight span or perpendicular to the nearest rounded corner's radius.
  let tx=0,ty=0;if(tip.y<3.001){tx=1;}else if(tip.x>20.999){ty=1;}else if(tip.y>20.999){tx=-1;}else if(tip.x<3.001){ty=-1;}else{const cx=tip.x>12?18:6,cy=tip.y>12?18:6;tx=-(tip.y-cy)/3;ty=(tip.x-cx)/3;}
  expect(Math.abs(vx*ty-vy*tx)).toBeLessThan(.025);expect(vx*tx+vy*ty).toBeGreaterThan(2.37);
  const xs=points.map(p=>p.x),ys=points.map(p=>p.y),dx=Math.max(...xs)-Math.min(...xs),dy=Math.max(...ys)-Math.min(...ys),chord=Math.hypot(tip.x-points[0].x,tip.y-points[0].y);chords.push(chord);
  if(!horizontal&&dy<.001){horizontal=true;await b.screenshot({path:info.outputPath('repost-straight-horizontal.png')});}if(!vertical&&dx<.001){vertical=true;await b.screenshot({path:info.outputPath('repost-straight-vertical.png')});}if(!corner&&chord<9){corner=true;await b.screenshot({path:info.outputPath('repost-bending-around-corner.png')});}
  const angle=Math.atan2(tip.y-12,tip.x-12);if(lastAngle!==undefined){let delta=angle-lastAngle;while(delta< -Math.PI)delta+=2*Math.PI;while(delta>Math.PI)delta-=2*Math.PI;expect(delta).toBeGreaterThanOrEqual(-.001);winding+=delta;}lastAngle=angle;
  if(i%16===0)await b.screenshot({path:info.outputPath(`repost-phase-${i}.png`)});
 }
 expect(horizontal&&vertical&&corner).toBe(true);expect(Math.max(...chords)-Math.min(...chords)).toBeGreaterThan(1);expect(winding).toBeCloseTo(2*Math.PI,3);const next=await b.boundingBox();expect(next!.width).toBeCloseTo(box!.width,3);expect(next!.height).toBeCloseTo(box!.height,3);expect(next!.height).toBeGreaterThanOrEqual(44);
 await info.attach('repost-deformation-evidence.json',{body:JSON.stringify({elapsed,returned,samples,winding},null,2),contentType:'application/json'});
 await page.getByRole('slider',{name:'Intensity',exact:true}).press('End');await b.click();await seek(b,.35);const maximum=await shapeState(b);expect(maximum.top.length).toBeGreaterThan(9.94);expect(maximum.top.length).toBeLessThan(10.01);await b.screenshot({path:info.outputPath('repost-max-intensity.png')});
 await page.getByRole('button',{name:'Stop motion',exact:true}).click();expect(await b.locator('svg').evaluate(svg=>svg.getAnimations({subtree:true}).length)).toBe(0);
});
test('Cartoon Comment grows a closed circle from lower-left and adds its tail only late',async({page},info)=>{
 const b=page.locator('[data-catalog-action="comment"] button'),box=await b.boundingBox();await b.click();const elapsed=[];
 for(const ms of [80,160,200]){await page.waitForTimeout(ms);elapsed.push(await commentState(b));}expect(elapsed[2].r).toBeGreaterThan(elapsed[0].r);expect(elapsed.every(s=>s.circleError<.002&&s.tailRatio<1.002)).toBe(true);
 await expect.poll(()=>b.locator('svg').evaluate(svg=>svg.getAnimations({subtree:true}).length)).toBe(0);const settled=await commentState(b);expect(settled.tailRatio).toBeCloseTo(Math.SQRT2,3);expect(settled.dasharray).toBe('none');await b.screenshot({path:info.outputPath('comment-naturally-settled.png')});
 await b.click();const samples=[];for(const phase of [0,.15,.35,.6,.7,.8,.9,1]){await seek(b,phase);const s=await commentState(b);samples.push({phase,...s});expect(s.d.toUpperCase()).toContain('Z');expect(s.dasharray).toBe('none');expect(Number.parseFloat(s.dashoffset)).toBe(0);expect(s.transform).toBe('none');expect(s.cx-s.r).toBeCloseTo(3,3);expect(s.cy+s.r).toBeCloseTo(21,3);if(phase<=.7){expect(s.circleError).toBeLessThan(.002);expect(s.tailRatio).toBeCloseTo(1,3);}if(phase>=.9)expect(s.tailRatio).toBeGreaterThan(1.3);await b.screenshot({path:info.outputPath(`comment-circle-to-tail-${phase}.png`)});}
 expect(samples[0].r).toBeCloseTo(1.5,3);expect(samples[3].r).toBeGreaterThan(9);expect(await b.locator('.sil-effect').evaluate(el=>el.getAnimations().length===0&&getComputedStyle(el).opacity==='0')).toBe(true);const next=await b.boundingBox();expect(next!.width).toBeCloseTo(box!.width,3);expect(next!.height).toBeCloseTo(box!.height,3);
 await info.attach('comment-circle-morph-evidence.json',{body:JSON.stringify({elapsed,settled,samples},null,2),contentType:'application/json'});
 await page.getByRole('slider',{name:'Intensity',exact:true}).press('End');await b.click();await seek(b,.65);const maximum=await commentState(b);expect(maximum.tailRatio).toBeCloseTo(1,3);expect(maximum.r).toBeGreaterThan(9.8);await b.screenshot({path:info.outputPath('comment-max-intensity.png')});
 await page.getByRole('checkbox',{name:'Reduce glyph motion',exact:true}).check();await b.click();expect(await b.locator('svg').evaluate(svg=>svg.getAnimations({subtree:true}).length)).toBe(0);expect((await commentState(b)).tailRatio).toBeCloseTo(Math.SQRT2,3);
 await page.getByRole('checkbox',{name:'Reduce glyph motion',exact:true}).uncheck();await page.getByRole('combobox',{name:'Catalog motion',exact:true}).selectOption('trace');await b.click();expect(await b.locator('.sil-glyph path').evaluate(el=>el.getAnimations().some(a=>(a.effect as KeyframeEffect).getKeyframes().some(f=>f.strokeDashoffset!==undefined)))).toBe(true);expect(await b.locator('[data-glyph-part=comment-body]').count()).toBe(0);
});
