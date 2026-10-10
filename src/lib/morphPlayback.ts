import {repostTransition} from './canonicalMorph.js';
import type {IconMotionTokens} from './iconMotion.js';
import {morphEase} from './motionTiming.js';
export {morphEase} from './motionTiming.js';
import {commentPlaybackFrame} from './commentMotion.js';
/** Monotonic frame time and SVG attributes work even when a modal makes the trigger inert. */
export function startMorphPlayback(svg:SVGSVGElement,action:'comment'|'repost',tokens:IconMotionTokens,pending:boolean):()=>void {
 const group=svg.querySelector<SVGElement>('.sil-glyph');
 if(!group||typeof requestAnimationFrame!=='function')return()=>{};
 const nodes=Array.from(svg.querySelectorAll<SVGPathElement>(action==='comment'?'[data-glyph-part=comment-body]':'[data-glyph-part^=repost-]'));
 const snapshots=nodes.map(node=>({node,d:node.getAttribute('d'),opacity:node.style.getPropertyValue('opacity'),priority:node.style.getPropertyPriority('opacity'),lastD:null as string|null,lastOpacity:null as string|null}));
 const groupStyle=action==='comment'?['transform','transform-origin','transform-box'].map(name=>({name,value:group.style.getPropertyValue(name),priority:group.style.getPropertyPriority(name),last:null as string|null})):[],groupHadStyle=group.hasAttribute('style');
 let active=true,frame=0,watchdog:ReturnType<typeof setTimeout>|undefined;
 const duration=pending?Math.max(1100,tokens.duration*1.8):tokens.duration;
 const started=performance.now();let lastFrame=started;
 const render=(progress:number)=>{
  const time=Math.min(1,Math.max(0,progress)),p=morphEase(time),a=tokens.intensity*(pending?.55:1),comment=action==='comment'?commentPlaybackFrame(time,a):null;
  for(const item of snapshots){const d=comment?comment.d:repostTransition(p,a,item.node.getAttribute('data-glyph-part')==='repost-bottom').d;
   item.node.setAttribute('d',d);item.lastD=d;
  }
  if(comment)for(const property of groupStyle){const value=property.name==='transform'?comment.transform:property.name==='transform-origin'?'12px 12px':'view-box';group.style.setProperty(property.name,value);property.last=group.style.getPropertyValue(property.name);}
 };
 const restore=()=>{for(const item of snapshots){
  // React may already have rendered a different action/style before passive-effect cleanup.
  if(item.lastD!==null&&item.node.getAttribute('d')===item.lastD){if(item.d===null)item.node.removeAttribute('d');else item.node.setAttribute('d',item.d);}
  if(item.lastOpacity!==null&&item.node.style.getPropertyValue('opacity')===item.lastOpacity){if(item.opacity)item.node.style.setProperty('opacity',item.opacity,item.priority);else item.node.style.removeProperty('opacity');}
 }
  for(const property of groupStyle)if(property.last!==null&&group.style.getPropertyValue(property.name)===property.last&&group.style.getPropertyPriority(property.name)===''){if(property.value)group.style.setProperty(property.name,property.value,property.priority);else group.style.removeProperty(property.name);}
  if(groupStyle.length&&!groupHadStyle&&group.style.length===0)group.removeAttribute('style');
 };
 const finish=()=>{if(!active)return;active=false;cancelAnimationFrame(frame);clearTimeout(watchdog);restore();};
 const sample=()=>{const elapsed=Math.max(0,performance.now()-started);if(!pending&&elapsed>=duration){finish();return;}render((elapsed%duration)/duration);};
 const tick=()=>{if(!active)return;lastFrame=performance.now();sample();if(active)frame=requestAnimationFrame(tick);};
 // Some engines suspend document RAF while a native modal is open. A bounded
 // watchdog keeps visible feedback progressing without relying on that timeline.
 const checkFrame=()=>{if(!active)return;const now=performance.now();if((!pending&&now-started>=duration)||(document.visibilityState!=='hidden'&&now-lastFrame>=64))sample();if(active)watchdog=setTimeout(checkFrame,64);};
 render(0);frame=requestAnimationFrame(tick);watchdog=setTimeout(checkFrame,64);
 return finish;
}
