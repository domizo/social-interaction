import {commentMorph,repostSegment} from './cartoonGeometry.js';
import type {IconMotionTokens} from './iconMotion.js';
/** Match CSS ease-in-out without depending on an element animation timeline. */
export function morphEase(time:number):number {
 if(time<=0)return 0;if(time>=1)return 1;
 let lo=0,hi=1;
 for(let i=0;i<24;i++){const s=(lo+hi)/2,x=3*.42*(1-s)*(1-s)*s+3*.58*(1-s)*s*s+s*s*s;if(x<time)lo=s;else hi=s;}
 const s=(lo+hi)/2;return 3*s*s-2*s*s*s;
}
/** Monotonic frame time and SVG attributes work even when a modal makes the trigger inert. */
export function startMorphPlayback(svg:SVGSVGElement,action:'comment'|'repost',tokens:IconMotionTokens,pending:boolean):()=>void {
 const group=svg.querySelector<SVGElement>('.sil-glyph');
 if(!group||typeof requestAnimationFrame!=='function')return()=>{};
 const nodes=Array.from(svg.querySelectorAll<SVGPathElement>(action==='comment'?'[data-glyph-part=comment-body]':'[data-glyph-part^=repost-]'));
 const snapshots=nodes.map(node=>({node,d:node.getAttribute('d'),opacity:node.style.getPropertyValue('opacity'),priority:node.style.getPropertyPriority('opacity'),lastD:null as string|null,lastOpacity:null as string|null}));
 let active=true,frame=0,watchdog:ReturnType<typeof setTimeout>|undefined;
 const duration=pending?Math.max(1100,tokens.duration*1.8):tokens.duration;
 const started=performance.now();let lastFrame=started;
 const render=(progress:number)=>{
  const p=Math.min(1,Math.max(0,progress)),a=tokens.intensity*(pending?.55:1),phase=p+.06*a*Math.sin(2*Math.PI*p);
  const comment=action==='comment'?commentMorph(p,a):null,top=action==='repost'?repostSegment(phase):null,bottom=action==='repost'?repostSegment(phase,true):null;
  for(const item of snapshots){const part=item.node.getAttribute('data-glyph-part')!,shape=part.endsWith('bottom')?bottom:top,d=comment?comment.d:part.includes('-head-')?shape!.head:shape!.body;
   item.node.setAttribute('d',d);item.lastD=d;
   if(comment){item.node.style.setProperty('opacity',String(Math.min(1,.2+8*p)));item.lastOpacity=item.node.style.getPropertyValue('opacity');}
  }
 };
 const restore=()=>{for(const item of snapshots){
  // React may already have rendered a different action/style before passive-effect cleanup.
  if(item.lastD!==null&&item.node.getAttribute('d')===item.lastD){if(item.d===null)item.node.removeAttribute('d');else item.node.setAttribute('d',item.d);}
  if(item.lastOpacity!==null&&item.node.style.getPropertyValue('opacity')===item.lastOpacity){if(item.opacity)item.node.style.setProperty('opacity',item.opacity,item.priority);else item.node.style.removeProperty('opacity');}
 }};
 const finish=()=>{if(!active)return;active=false;cancelAnimationFrame(frame);clearTimeout(watchdog);restore();};
 const sample=()=>{const elapsed=Math.max(0,performance.now()-started);if(!pending&&elapsed>=duration){finish();return;}render(morphEase((elapsed%duration)/duration));};
 const tick=()=>{if(!active)return;lastFrame=performance.now();sample();if(active)frame=requestAnimationFrame(tick);};
 // Some engines suspend document RAF while a native modal is open. A bounded
 // watchdog keeps visible feedback progressing without relying on that timeline.
 const checkFrame=()=>{if(!active)return;const now=performance.now();if((!pending&&now-started>=duration)||(document.visibilityState!=='hidden'&&now-lastFrame>=64))sample();if(active)watchdog=setTimeout(checkFrame,64);};
 render(0);frame=requestAnimationFrame(tick);watchdog=setTimeout(checkFrame,64);
 return finish;
}
