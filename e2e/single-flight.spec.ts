import {test,expect} from '@playwright/test';
// A real-time recording, separate from deterministic phase/geometry seeking.
test.use({video:{mode:'on',size:{width:960,height:720}}});
test('Comment forms sooner and bounces as a whole while accepted Repost plays unchanged at default speed',async({page},info)=>{
 await page.goto('/#icon-catalog');await expect(page.getByRole('slider',{name:'Glyph duration',exact:true})).toHaveValue('560');
 // Keep the two actual catalog controls visible together for the recording.
 await page.addStyleTag({content:'.icon-catalog{position:fixed!important;inset:24px 16px auto!important;z-index:9999;background:#fff;padding:24px!important}.catalog-heading,.catalog-feedback{display:none!important}.icon-catalog-grid{grid-template-columns:1fr 1fr!important}.icon-card:not([data-catalog-action=comment]):not([data-catalog-action=repost]){display:none!important}'});
 await page.waitForTimeout(350);
 const evidence=[];
 for(let repeat=0;repeat<2;repeat++){
  const samples=await page.evaluate(async()=>{const buttons=['comment','repost'].map(action=>document.querySelector<HTMLButtonElement>(`[data-catalog-action=${action}] button`)!);const comment=buttons[0].querySelector<SVGPathElement>('.sil-glyph path')!,repost=buttons[1].querySelector<SVGPathElement>('.sil-glyph path')!,group=comment.closest('.sil-glyph') as SVGGElement,svg=comment.closest('svg')!,canonical=comment.getAttribute('d'),length=comment.getTotalLength(),points=Array.from({length:129},(_,i)=>comment.getPointAtLength(length*i/128)),upper=points.reduce((a,p)=>p.y<a.y?p:a),tail=points.reduce((a,p)=>p.y>a.y?p:a),center=new DOMPoint(points.reduce((s,p)=>s+p.x,0)/points.length,points.reduce((s,p)=>s+p.y,0)/points.length);
   // Cache native contour landmarks before activation: resampling the arc path
   // inside the timing loop can block the very animation being measured.
   const started=performance.now();buttons.forEach(b=>b.click());const out=[];for(let i=0;i<40;i++){await new Promise(r=>setTimeout(r,20));const readStarted=performance.now(),d=comment.getAttribute('d')!,box=comment.getBBox(),matrix=svg.getScreenCTM()!.inverse().multiply(group.getScreenCTM()!),paint=(p:DOMPoint)=>{const q=p.matrixTransform(matrix);return {x:q.x,y:q.y};},bounds=group.getBoundingClientRect(),viewport=svg.getBoundingClientRect();out.push({canonicalLandmarks:d===canonical,upper:paint(upper),tail:paint(tail),centroid:paint(center),paintedBounds:[(bounds.x-viewport.x)*24/viewport.width,(bounds.y-viewport.y)*24/viewport.height,bounds.width*24/viewport.width,bounds.height*24/viewport.height],transform:getComputedStyle(group).transform,matrix:[matrix.a,matrix.b,matrix.c,matrix.d,matrix.e,matrix.f],ms:performance.now()-started,readCost:performance.now()-readStarted,comment:d,width:box.width,height:box.height,repost:repost.getAttribute('d')});}return out;});
  await info.attach(`default-duration-pass-${repeat}.json`,{body:JSON.stringify(samples),contentType:'application/json'});
  expect(new Set(samples.map(s=>s.comment)).size).toBeGreaterThan(4);expect(new Set(samples.map(s=>s.repost)).size).toBeGreaterThan(4);
  for(let i=1;i<samples.length;i++){expect(samples[i].width).toBeGreaterThanOrEqual(samples[i-1].width-.001);expect(samples[i].height).toBeGreaterThanOrEqual(samples[i-1].height-.001);}
  const formed=samples.filter(s=>s.canonicalLandmarks);expect(formed[0].ms).toBeLessThan(530);const rest=samples.at(-1)!;expect(formed.some(s=>s.upper.y<rest.upper.y-1&&s.tail.y<rest.tail.y-1&&s.centroid.y<rest.centroid.y-1&&s.paintedBounds[1]<rest.paintedBounds[1]-1)).toBe(true);expect(formed.every(s=>Math.abs(s.matrix[1])<.00001&&Math.abs(s.matrix[2])<.00001)).toBe(true);expect(samples.filter(s=>!s.comment.includes('a9 9')).every(s=>s.transform==='none')).toBe(true);expect(samples.at(-1)!.transform).toBe('none');expect(samples.at(-1)!.comment).toContain('a9 9');expect(samples.at(-1)!.repost).toBe('M4 9V6h13m-3-3 3 3-3 3');evidence.push(samples);await page.waitForTimeout(350);
 }
 await info.attach('uninterrupted-default-duration.json',{body:JSON.stringify(evidence),contentType:'application/json'});
});
