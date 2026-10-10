import {commentTransition} from './canonicalMorph.js';
import {morphEase} from './motionTiming.js';
export const commentFormationFraction=.75;
/** Preserve the accepted inflation contour; quiver only after its exact shape exists. */
export function commentPlaybackFrame(time:number,intensity=1){
 const t=Math.min(1,Math.max(0,time)),formed=t>=commentFormationFraction;
 const shape=commentTransition(formed?1:morphEase(t/commentFormationFraction),intensity);
 const q=formed?(t-commentFormationFraction)/(1-commentFormationFraction):0;
 const wave=formed&&t<1?Math.sin(4*Math.PI*q)*(1-q)**2:0;
 const rotation=2.8*intensity*wave,squash=.015*intensity*wave;
 const transform=wave===0?'none':`rotate(${rotation}deg) scale(${1+squash}, ${1-squash})`;
 return {...shape,formed,rotation,squash,transform};
}
