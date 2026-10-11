import {useEffect,useRef,useState,type RefObject} from 'react';
import type {SocialAction} from './tokens.js';
import {repostTransition} from './canonicalMorph.js';
import {commentPlaybackFrame} from './commentMotion.js';
import {morphEase} from './motionTiming.js';
import {startMorphPlayback} from './morphPlayback.js';
import {resolveGlyphTracks} from './motionTracks.js';
export type IconMotion='none'|'pulse'|'spring'|'trace'|'gesture'|'cartoon';
export interface IconMotionTokens {duration:number;intensity:number;stagger:number}
export const iconMotions=['pulse','spring','trace','gesture','cartoon'] as const;
export const defaultMotionTokens:Readonly<IconMotionTokens>=Object.freeze({duration:560,intensity:1,stagger:60});
export function normalizeMotionTokens(input:Partial<IconMotionTokens>={}):IconMotionTokens {
 const clamp=(n:unknown,fallback:number,min:number,max:number)=>typeof n==='number'&&Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback;
 return {duration:clamp(input.duration,560,0,1600),intensity:clamp(input.intensity,1,0,2),stagger:clamp(input.stagger,60,0,160)};
}
export interface GlyphPlan {part:string;frames:Keyframe[];delay:number}
/** Pure keyframe plans, targeting SVG parts only. Echo geometry is decorative and hidden at rest. */
export function glyphMotionPlan(action:SocialAction,motion:IconMotion,input:Partial<IconMotionTokens>={}):GlyphPlan[] {
 const t=normalizeMotionTokens(input),a=t.intensity,neutral={transform:'translate(0px, 0px) scale(1) rotate(0deg)',opacity:1};
 const part=(name:string,frames:Keyframe[],delay=0):GlyphPlan=>({part:name,frames,delay});
 const single=(frames:Keyframe[],name='glyph'):GlyphPlan[]=>[part(name,frames)];
 const pop=(amount=.22):Keyframe[]=>[neutral,{transform:`scale(${1-.18*a}, ${1+.08*a})`,offset:.18},{transform:`scale(${1+amount*a}, ${1+amount*a})`,offset:.46},{transform:`scale(${1-.05*a})`,offset:.74},neutral];
 if(motion==='none'||t.duration===0||a===0)return [];
 if(motion==='trace')return [part('trace',[{strokeDashoffset:.5*a,fillOpacity:1-.4*a},{strokeDashoffset:0,fillOpacity:1}])];
 if(motion==='pulse')return single([neutral,{transform:`scale(${1+.2*a})`,offset:.38},{transform:`scale(${1-.07*a})`,offset:.7},neutral]);
 if(motion==='cartoon'){
  const echo=part('echo',[{transform:'scale(.85)',opacity:0},{transform:`scale(${1+.08*a})`,opacity:Math.min(.8,.65*a),offset:.3},{transform:`scale(${1+.5*a})`,opacity:0,offset:1}],t.stagger);
  let main:GlyphPlan[];
  switch(action){
   case 'like':main=single([neutral,{transform:`rotate(${-9*a}deg) scale(${1-.1*a})`,offset:.12},{transform:`rotate(${9*a}deg)`,offset:.22},{transform:`rotate(${-7*a}deg)`,offset:.32},{transform:`rotate(${5*a}deg) scale(${1+.2*a})`,offset:.45},{transform:`rotate(${-3*a}deg)`,offset:.58},neutral]);break;
   case 'comment':{const frames=Array.from({length:129},(_,i)=>({frame:commentPlaybackFrame(i/128,a),offset:morphEase(i/128)}));return [part('comment-body',frames.map(({frame,offset})=>({d:`path("${frame.sampledD}")`,offset}))),part('glyph',frames.map(({frame,offset})=>({transform:frame.transform,offset})))];}
   case 'share':main=single([neutral,{transform:`translateY(${2*a}px) scaleY(${1-.18*a})`,offset:.2},{transform:`translateY(${-6*a}px) scaleY(${1+.1*a})`,offset:.48},neutral],'arrow');break;
   case 'quote':main=['quote-left','quote-right'].map((name,i)=>part(name,[neutral,{transform:`scale(${1-.2*a}) translateY(${2*a}px)`,offset:.18},{transform:`translate(${(i?1:-1)*2*a}px,${-3*a}px) scale(${1+.15*a})`,offset:.5},neutral],i*t.stagger));break;
   case 'repost':return [false,true].map(opposite=>part(`repost-${opposite?'bottom':'top'}`,Array.from({length:97},(_,i)=>({d:`path("${repostTransition(i/96,a,opposite).sampledD}")`,offset:i/96}))));
   case 'bookmark':case 'note':main=[part('glyph',[neutral,{transform:`translateY(${-5*a}px) scaleY(${1-.12*a})`,offset:.2},{transform:`translateY(${2*a}px) scaleY(${1-.18*a}) scaleX(${1+.12*a})`,offset:.48},neutral]),part('fold',[neutral,{transform:`scaleY(${1-.7*a/2}) rotate(${-15*a}deg)`,offset:.3},neutral],t.stagger)];break;
   case 'star':main=single([neutral,{transform:`rotate(${-20*a}deg) scale(${1-.3*a})`,offset:.2},{transform:`rotate(${10*a}deg) scale(${1+.22*a})`,offset:.5},neutral]);break;
   case 'send':main=[part('plane',[neutral,{transform:`rotate(${-12*a}deg) scale(${1-.2*a})`,offset:.2},{transform:`translate(${7*a}px,${-7*a}px) scale(.85)`,opacity:0,offset:.48},{transform:`translate(${-4*a}px,${4*a}px) scale(.85)`,opacity:0,offset:.52},neutral]),part('crease',[neutral,{transform:`scaleX(${1-.6*a/2})`,offset:.22},neutral])];break;
   case 'sparkles':main=['glint-main','glint-top','glint-bottom'].map((name,i)=>part(name,[{transform:`scale(${1-.45*a}) rotate(${-18*a}deg)`,opacity:.25},{transform:`scale(${1+.25*a}) rotate(${8*a}deg)`,opacity:1,offset:.45},neutral],i*t.stagger));break;
   case 'bell':main=[part('bell-body',[neutral,{transform:`rotate(${-20*a}deg)`,offset:.18},{transform:`rotate(${18*a}deg)`,offset:.35},{transform:`rotate(${-12*a}deg)`,offset:.52},{transform:`rotate(${7*a}deg)`,offset:.7},neutral]),part('clapper',[neutral,{transform:`translateX(${2*a}px)`,offset:.25},{transform:`translateX(${-2*a}px)`,offset:.5},neutral],t.stagger)];break;
   case 'reaction':main=[part('glyph',[neutral,{transform:`scale(${1+.18*a},${1-.2*a}) translateY(${2*a}px)`,offset:.2},{transform:`translateY(${-4*a}px) scale(${1-.08*a},${1+.15*a})`,offset:.48},neutral]),part('eyes',[neutral,{opacity:Math.max(0,1-.85*a),offset:.3},neutral],t.stagger)];break;
  }
  return [...main,echo];
 }
 if(motion==='spring'){
  if(action==='like')return single([neutral,{transform:`translateY(${-3*a}px) scale(${1+.2*a})`,offset:.35},{transform:`translateY(${1.2*a}px) scale(${1-.08*a})`,offset:.68},neutral]);
  if(action==='comment')return single([neutral,{transform:`scale(${1+.24*a}, ${1-.1*a})`,offset:.25},{transform:`scale(${1-.09*a}, ${1+.18*a})`,offset:.52},neutral]);
  if(action==='share')return single([neutral,{transform:`translateY(${-5*a}px)`,offset:.4},{transform:`translateY(${1.5*a}px)`,offset:.72},neutral],'arrow');
  if(action==='quote')return ['quote-left','quote-right'].map((name,i)=>part(name,[neutral,{transform:`translateY(${-3*a}px) scale(${1+.1*a})`,offset:.4},neutral],i*t.stagger));
  return single(pop());
 }
 if(action==='like')return single([neutral,{transform:`rotate(${-14*a}deg) scale(${1+.1*a})`,offset:.3},{transform:`rotate(${10*a}deg)`,offset:.62},neutral]);
 if(action==='comment')return single([neutral,{transform:`translateX(${-2*a}px) rotate(${-8*a}deg)`,offset:.25},{transform:`translateX(${2*a}px) rotate(${6*a}deg)`,offset:.6},neutral]);
 if(action==='share')return single([neutral,{transform:`translateY(${-7*a}px)`,opacity:0,offset:.42},{transform:`translateY(${5*a}px)`,opacity:0,offset:.44},neutral],'arrow');
 if(action==='quote')return ['quote-left','quote-right'].map((name,i)=>part(name,[neutral,{transform:`translateX(${(i?1:-1)*2*a}px) rotate(${(i?1:-1)*12*a}deg)`,offset:.4},neutral],i*t.stagger));
 return single([neutral,{transform:`rotate(${-10*a}deg) translateY(${-2*a}px)`,offset:.3},{transform:`rotate(${7*a}deg)`,offset:.62},neutral]);
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
  if(options.iconMotion==='cartoon'&&(options.action==='comment'||options.action==='repost'))return startMorphPlayback(svg,options.action,t,options.pending);
  const plan=glyphMotionPlan(options.action,options.iconMotion,{...t,intensity:options.pending?t.intensity*.55:t.intensity}).filter(step=>!options.pending||step.part!=='echo');
  const animations:Animation[]=[];let active=true;
  for(const {node,frames,trace,duration,delay,easing} of resolveGlyphTracks(svg,plan,options.iconMotion,t,options.pending)){
   if(typeof node.animate!=='function')continue;if(trace)node.style.strokeDasharray='1';
   const animation=node.animate(frames,{duration,delay,iterations:options.pending?Infinity:1,easing,fill:'none'});
   animations.push(animation);const clear=()=>{if(active&&trace)node.style.removeProperty('stroke-dasharray');};animation.finished.then(clear,clear);
  }
  return()=>{active=false;for(const animation of animations)animation.cancel();for(const path of svg.querySelectorAll<SVGPathElement>('.sil-glyph path'))path.style.removeProperty('stroke-dasharray');};
 },[activation,options.motionTrigger,options.action,options.iconMotion,t.duration,t.intensity,t.stagger,options.pending,options.disabled,options.reducedMotion,osReduced,ref]);
 return ()=>setActivation(n=>n+1);
}
