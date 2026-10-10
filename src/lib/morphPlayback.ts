import {commentMorph,repostSegment} from './cartoonGeometry.js';
import type {IconMotionTokens} from './iconMotion.js';
/** A broadly supported WAAPI clock owns timing; SVG attributes, not CSS d, own visible geometry. */
export function startMorphPlayback(svg:SVGSVGElement,action:'comment'|'repost',tokens:IconMotionTokens,pending:boolean):()=>void {
 const group=svg.querySelector<SVGElement>('.sil-glyph');
 if(!group||typeof group.animate!=='function')return()=>{};
 const nodes=Array.from(svg.querySelectorAll<SVGPathElement>(action==='comment'?'[data-glyph-part=comment-body]':'[data-glyph-part^=repost-]'));
 const snapshots=nodes.map(node=>({node,d:node.getAttribute('d'),opacity:node.style.getPropertyValue('opacity'),priority:node.style.getPropertyPriority('opacity'),lastD:null as string|null,lastOpacity:null as string|null}));
 let active=true,frame=0;
 const duration=pending?Math.max(1100,tokens.duration*1.8):tokens.duration;
 const clock=group.animate([{opacity:1},{opacity:1}],{duration,iterations:pending?Infinity:1,easing:'ease-in-out',fill:'none'});clock.id='sil-morph-clock';
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
 const finish=()=>{if(!active)return;active=false;cancelAnimationFrame(frame);restore();};
 const tick=()=>{if(!active)return;if(clock.playState==='finished'){finish();return;}const progress=clock.effect?.getComputedTiming?.().progress;if(typeof progress==='number')render(progress);else if(!pending&&typeof clock.currentTime==='number'&&clock.currentTime>=duration)render(1);frame=requestAnimationFrame(tick);};
 render(0);frame=requestAnimationFrame(tick);clock.finished.then(finish,finish);
 return()=>{finish();clock.cancel();};
}
