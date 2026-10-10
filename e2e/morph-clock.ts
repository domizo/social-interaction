import type {Page} from '@playwright/test';
/** Test-only monotonic-time override. Real elapsed playback is tested before freezing. */
export async function installMorphClock(page:Page){await page.addInitScript(()=>{
 const real=performance.now.bind(performance);let fixed:number|null=null,start=0;
 Object.defineProperty(performance,'now',{configurable:true,value:()=>fixed??real()});
 (window as unknown as {__morphClock:unknown}).__morphClock={freeze:()=>{start=fixed??real();fixed=start;},seek:(progress:number)=>{
  // Invert CSS ease-in-out's y coordinate, then evaluate its x coordinate.
  let lo=0,hi=1;for(let i=0;i<40;i++){const s=(lo+hi)/2;if(3*s*s-2*s*s*s<progress)lo=s;else hi=s;}const s=(lo+hi)/2;
  fixed=start+(progress===1?1601:1600*(progress===0?0:3*.42*(1-s)*(1-s)*s+3*.58*(1-s)*s*s+s*s*s));
 },release:()=>{fixed=null;}};
});}
export const freezeMorph=(page:Page)=>page.evaluate(()=>(window as unknown as {__morphClock:{freeze:()=>void}}).__morphClock.freeze());
export const seekMorph=(page:Page,phase:number)=>page.evaluate(p=>{(window as unknown as {__morphClock:{seek:(p:number)=>void}}).__morphClock.seek(p);return new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));},phase);
export const releaseMorph=(page:Page)=>page.evaluate(()=>(window as unknown as {__morphClock:{release:()=>void}}).__morphClock.release());
