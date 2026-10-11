import {glyphMotionPlan,normalizeMotionTokens,type IconMotion,type IconMotionTokens} from './iconMotion.js';
import {createMorphRenderer} from './morphPlayback.js';
import {resolveGlyphTracks} from './motionTracks.js';
import type {SocialAction} from './tokens.js';
export interface GlyphTimelineState {time:number;duration:number;playing:boolean;rate:number;reducedMotion:boolean;supported:boolean}
export interface GlyphTimelineOptions {action:SocialAction;iconMotion:IconMotion;motionTokens?:Partial<IconMotionTokens>;reducedMotion?:boolean;onUpdate?:(state:GlyphTimelineState)=>void}
export interface GlyphTimeline {seek:(milliseconds:number)=>void;play:(rate?:number)=>void;pause:()=>void;stop:()=>void;destroy:()=>void;getState:()=>GlyphTimelineState}
/** Own this SVG exclusively: use ActionIcon, never an active ActionButton's SVG. */
export function createGlyphTimeline(svg:SVGSVGElement,options:GlyphTimelineOptions):GlyphTimeline {
 const tokens=normalizeMotionTokens(options.motionTokens),plan=glyphMotionPlan(options.action,options.iconMotion,tokens),tracks=resolveGlyphTracks(svg,plan,options.iconMotion,tokens),morph=options.iconMotion==='cartoon'&&(options.action==='comment'||options.action==='repost');
 const duration=plan.length?(morph?tokens.duration:Math.max(0,...tracks.map(t=>t.duration+t.delay))):0;
 const media=typeof window!=='undefined'?window.matchMedia?.('(prefers-reduced-motion: reduce)'):undefined;
 let reduced=!!options.reducedMotion||!!media?.matches,destroyed=false,playing=false,time=0,rate=1,frame=0,watchdog:ReturnType<typeof setTimeout>|undefined,started=0,from=0,lastFrame=0,epoch=0;
 let resources=false,renderer:ReturnType<typeof createMorphRenderer>|undefined;
 let animations:Animation[]=[];let traces:{node:SVGElement;value:string;priority:string;hadStyle:boolean;end:number}[]=[];
 const supported=morph||tracks.every(t=>typeof t.node.animate==='function');
 const getState=():GlyphTimelineState=>({time,duration,playing,rate,reducedMotion:reduced,supported});
 const notify=()=>{if(!destroyed)options.onUpdate?.(getState());};
 const release=()=>{renderer?.restore();renderer=undefined;for(const animation of animations)animation.cancel();animations=[];for(const item of traces)if(item.node.style.strokeDasharray==='1'&&item.node.style.getPropertyPriority('stroke-dasharray')===''){if(item.value)item.node.style.setProperty('stroke-dasharray',item.value,item.priority);else item.node.style.removeProperty('stroke-dasharray');if(!item.hadStyle&&item.node.style.length===0)item.node.removeAttribute('style');}traces=[];resources=false;};
 const prepare=()=>{if(resources)return;resources=true;if(morph){renderer=createMorphRenderer(svg,options.action as 'comment'|'repost',tokens);return;}
  for(const track of tracks){if(typeof track.node.animate!=='function')continue;if(track.trace){traces.push({node:track.node,value:track.node.style.getPropertyValue('stroke-dasharray'),priority:track.node.style.getPropertyPriority('stroke-dasharray'),hadStyle:track.node.hasAttribute('style'),end:track.delay+track.duration});track.node.style.setProperty('stroke-dasharray','1');}const animation=track.node.animate(track.frames,{duration:track.duration,delay:track.delay,easing:track.easing,iterations:1,fill:'none'});animation.pause();animations.push(animation);}
 };
 const paint=()=>{if(reduced||!supported||!duration||time>=duration){release();return;}prepare();if(renderer)renderer.render(time/duration);else{for(const animation of animations)animation.currentTime=time;for(const item of traces){if(time<item.end)item.node.style.setProperty('stroke-dasharray','1');else if(item.node.style.strokeDasharray==='1'&&item.node.style.getPropertyPriority('stroke-dasharray')===''){if(item.value)item.node.style.setProperty('stroke-dasharray',item.value,item.priority);else item.node.style.removeProperty('stroke-dasharray');if(!item.hadStyle&&item.node.style.length===0)item.node.removeAttribute('style');}}}};
 const clearClock=()=>{if(typeof cancelAnimationFrame==='function')cancelAnimationFrame(frame);clearTimeout(watchdog);};
 const sample=()=>{time=Math.min(duration,from+Math.max(0,performance.now()-started)*rate);paint();if(time>=duration){playing=false;clearClock();}notify();};
 const tick=(owner:number)=>{if(destroyed||!playing||owner!==epoch)return;lastFrame=performance.now();sample();if(playing&&!destroyed&&owner===epoch)frame=requestAnimationFrame(()=>tick(owner));};
 const check=(owner:number)=>{if(destroyed||!playing||owner!==epoch)return;if(from+Math.max(0,performance.now()-started)*rate>=duration||(document.visibilityState!=='hidden'&&performance.now()-lastFrame>=64))sample();if(playing&&!destroyed&&owner===epoch)watchdog=setTimeout(()=>check(owner),64);};
 const pause=()=>{if(destroyed)return;const owner=++epoch;if(playing){sample();if(destroyed||owner!==epoch)return;playing=false;clearClock();}notify();};
 const seek=(milliseconds:number)=>{if(!Number.isFinite(milliseconds))throw new RangeError('Timeline time must be finite');if(destroyed)return;++epoch;playing=false;clearClock();time=reduced?0:Math.min(duration,Math.max(0,milliseconds));paint();notify();};
 const stop=()=>{if(destroyed)return;++epoch;playing=false;clearClock();time=0;release();notify();};
 const play=(nextRate=rate)=>{if(!Number.isFinite(nextRate)||nextRate<.1||nextRate>2)throw new RangeError('Playback rate must be between 0.1 and 2');if(destroyed||reduced||!duration||!supported||typeof requestAnimationFrame!=='function')return;const owner=++epoch;if(playing){sample();if(destroyed||owner!==epoch)return;}clearClock();rate=nextRate;if(time>=duration)time=0;from=time;started=performance.now();lastFrame=started;playing=true;paint();notify();if(destroyed||!playing||owner!==epoch)return;frame=requestAnimationFrame(()=>tick(owner));watchdog=setTimeout(()=>check(owner),64);};
 const preference=()=>{reduced=!!options.reducedMotion||!!media?.matches;if(reduced)stop();else notify();};media?.addEventListener?.('change',preference);
 const destroy=()=>{if(destroyed)return;destroyed=true;++epoch;playing=false;clearClock();release();media?.removeEventListener?.('change',preference);};
 return {seek,play,pause,stop,destroy,getState};
}
