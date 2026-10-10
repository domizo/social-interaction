import {useEffect,useRef,useState,type RefObject} from 'react';
import type {SocialAction} from './tokens.js';
export type IconMotion='none'|'pulse'|'spring'|'trace'|'gesture';
export interface IconMotionTokens {duration:number;intensity:number;stagger:number}
export const iconMotions=['pulse','spring','trace','gesture'] as const;
export const defaultMotionTokens:Readonly<IconMotionTokens>=Object.freeze({duration:560,intensity:1,stagger:60});
export function normalizeMotionTokens(input:Partial<IconMotionTokens>={}):IconMotionTokens {
 const clamp=(n:unknown,fallback:number,min:number,max:number)=>typeof n==='number'&&Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback;
 return {duration:clamp(input.duration,560,0,1600),intensity:clamp(input.intensity,1,0,2),stagger:clamp(input.stagger,60,0,160)};
}
export interface GlyphPlan {part:string;frames:Keyframe[];delay:number}
/** Pure, inspectable keyframes. Only SVG glyph groups/paths are animated, never the hit target. */
export function glyphMotionPlan(action:SocialAction,motion:IconMotion,input:Partial<IconMotionTokens>={}):GlyphPlan[] {
 const t=normalizeMotionTokens(input),a=t.intensity,group='glyph',neutral={transform:'translate(0px, 0px) scale(1) rotate(0deg)',opacity:1};
 const single=(frames:Keyframe[],part=group,delay=0):GlyphPlan[]=>[{part,frames,delay}];
 if(motion==='none'||t.duration===0||a===0)return [];
 if(motion==='trace')return [{part:'trace',frames:[{strokeDashoffset:.5*a,fillOpacity:1-.4*a},{strokeDashoffset:0,fillOpacity:1}],delay:0}];
 if(motion==='pulse')return single([neutral,{transform:`scale(${1+.2*a})`,offset:.38},{transform:`scale(${1-.07*a})`,offset:.7},neutral]);
 if(motion==='spring'){
  if(action==='like')return single([neutral,{transform:`translateY(${-3*a}px) scale(${1+.2*a})`,offset:.35},{transform:`translateY(${1.2*a}px) scale(${1-.08*a})`,offset:.68},neutral]);
  if(action==='comment')return single([neutral,{transform:`scale(${1+.24*a}, ${1-.1*a})`,offset:.25},{transform:`scale(${1-.09*a}, ${1+.18*a})`,offset:.52},neutral]);
  if(action==='share')return single([neutral,{transform:`translateY(${-5*a}px)`,offset:.4},{transform:`translateY(${1.5*a}px)`,offset:.72},neutral],'arrow');
  return [{part:'quote-left',frames:[neutral,{transform:`translateY(${-3*a}px) scale(${1+.1*a})`,offset:.4},neutral],delay:0},{part:'quote-right',frames:[neutral,{transform:`translateY(${-3*a}px) scale(${1+.1*a})`,offset:.4},neutral],delay:t.stagger}];
 }
 if(action==='like')return single([neutral,{transform:`rotate(${-14*a}deg) scale(${1+.1*a})`,offset:.3},{transform:`rotate(${10*a}deg)`,offset:.62},neutral]);
 if(action==='comment')return single([neutral,{transform:`translateX(${-2*a}px) rotate(${-8*a}deg)`,offset:.25},{transform:`translateX(${2*a}px) rotate(${6*a}deg)`,offset:.6},neutral]);
 if(action==='share')return single([neutral,{transform:`translateY(${-7*a}px)`,opacity:0,offset:.42},{transform:`translateY(${5*a}px)`,opacity:0,offset:.44},neutral],'arrow');
 return [{part:'quote-left',frames:[neutral,{transform:`translateX(${-2*a}px) rotate(${-12*a}deg)`,offset:.4},neutral],delay:0},{part:'quote-right',frames:[neutral,{transform:`translateX(${2*a}px) rotate(${12*a}deg)`,offset:.4},neutral],delay:t.stagger}];
}
interface MotionOptions {action:SocialAction;iconMotion:IconMotion;motionTokens?:Partial<IconMotionTokens>;pending:boolean;disabled:boolean;reducedMotion:boolean;motionTrigger?:number|string}
/** Each replay owns its animations. Replays, pending changes, settings changes and unmount cancel the older set. */
export function useIconMotion(ref:RefObject<SVGSVGElement|null>,options:MotionOptions){
 const [activation,setActivation]=useState(0),[osReduced,setOsReduced]=useState(false);
 const previous=useRef({activation:0,trigger:options.motionTrigger});
 useEffect(()=>{const media=typeof window!=='undefined'&&window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):null;const update=()=>setOsReduced(!!media?.matches);update();media?.addEventListener?.('change',update);return()=>media?.removeEventListener?.('change',update);},[]);
 const t=normalizeMotionTokens(options.motionTokens);
 useEffect(()=>{
  const svg=ref.current,replay=activation!==previous.current.activation||options.motionTrigger!==previous.current.trigger;previous.current={activation,trigger:options.motionTrigger};
  if(!svg||options.disabled||options.reducedMotion||osReduced||options.iconMotion==='none'||(!options.pending&&!replay)||!t.duration||!t.intensity)return;
  // Query directly too, so a reduced-motion browser never gets an initial animation before the subscription effect settles.
  if(typeof window!=='undefined'&&window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
  const plan=glyphMotionPlan(options.action,options.iconMotion,{...t,intensity:options.pending?t.intensity*.55:t.intensity});
  const animations:Animation[]=[];let active=true;
  for(const step of plan){const nodes=step.part==='trace'?Array.from(svg.querySelectorAll<SVGPathElement>('path')):Array.from(svg.querySelectorAll<SVGElement>(`[data-glyph-part="${step.part}"]`));
   nodes.forEach((node,index)=>{if(typeof node.animate!=='function')return;const trace=step.part==='trace';if(trace)node.style.strokeDasharray='1';
    const animation=node.animate(step.frames,{duration:options.pending?Math.max(1100,t.duration*1.8):t.duration,delay:step.delay+(trace?index*t.stagger:0),iterations:options.pending?Infinity:1,easing:options.iconMotion==='spring'?'cubic-bezier(.2,.75,.25,1)':'ease-in-out',fill:'none'});
    animations.push(animation);const clear=()=>{if(active&&trace)node.style.removeProperty('stroke-dasharray');};animation.finished.then(clear,clear);
   });
  }
  return()=>{active=false;for(const animation of animations)animation.cancel();for(const path of svg.querySelectorAll('path'))path.style.removeProperty('stroke-dasharray');};
 },[activation,options.motionTrigger,options.action,options.iconMotion,t.duration,t.intensity,t.stagger,options.pending,options.disabled,options.reducedMotion,osReduced,ref]);
 return ()=>setActivation(n=>n+1);
}
