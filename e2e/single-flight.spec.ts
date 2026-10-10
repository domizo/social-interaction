import {test,expect} from '@playwright/test';
// A real-time recording, separate from deterministic phase/geometry seeking.
test.use({video:{mode:'on',size:{width:960,height:720}}});
test('Cartoon pair plays one uninterrupted real-time flight at the default duration',async({page},info)=>{
 await page.goto('/#icon-catalog');await expect(page.getByRole('slider',{name:'Glyph duration',exact:true})).toHaveValue('560');
 // Keep the two actual catalog controls visible together for the recording.
 await page.addStyleTag({content:'.icon-catalog{position:fixed!important;inset:24px 16px auto!important;z-index:9999;background:#fff;padding:24px!important}.catalog-heading,.catalog-feedback{display:none!important}.icon-catalog-grid{grid-template-columns:1fr 1fr!important}.icon-card:not([data-catalog-action=comment]):not([data-catalog-action=repost]){display:none!important}'});
 await page.waitForTimeout(350);
 const evidence=[];
 for(let repeat=0;repeat<2;repeat++){
  const samples=await page.evaluate(async()=>{const buttons=['comment','repost'].map(action=>document.querySelector<HTMLButtonElement>(`[data-catalog-action=${action}] button`)!);const started=performance.now();buttons.forEach(b=>b.click());const out=[];for(let i=0;i<26;i++){await new Promise(r=>setTimeout(r,30));const comment=buttons[0].querySelector<SVGPathElement>('.sil-glyph path')!,repost=buttons[1].querySelector<SVGPathElement>('.sil-glyph path')!,box=comment.getBBox();out.push({ms:performance.now()-started,comment:comment.getAttribute('d'),width:box.width,height:box.height,repost:repost.getAttribute('d')});}return out;});
  expect(new Set(samples.map(s=>s.comment)).size).toBeGreaterThan(4);expect(new Set(samples.map(s=>s.repost)).size).toBeGreaterThan(4);
  for(let i=1;i<samples.length;i++){expect(samples[i].width).toBeGreaterThanOrEqual(samples[i-1].width-.001);expect(samples[i].height).toBeGreaterThanOrEqual(samples[i-1].height-.001);}
  expect(samples.at(-1)!.comment).toContain('a9 9');expect(samples.at(-1)!.repost).toBe('M4 9V6h13m-3-3 3 3-3 3');evidence.push(samples);await page.waitForTimeout(350);
 }
 await info.attach('uninterrupted-default-duration.json',{body:JSON.stringify(evidence),contentType:'application/json'});
});
