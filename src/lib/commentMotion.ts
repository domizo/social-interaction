import {commentTransition} from './canonicalMorph.js';
import {morphEase} from './motionTiming.js';
export const commentFormationFraction=.75;
/** Rise while inflating, then fall and rebound as one center-transformed glyph. */
export function commentPlaybackFrame(time:number,intensity=1){
 const t=Math.min(1,Math.max(0,time)),formed=t>=commentFormationFraction;
 const shape=commentTransition(formed?1:morphEase(t/commentFormationFraction),intensity);
 const q=formed?(t-commentFormationFraction)/(1-commentFormationFraction):0;
 // Full size is the peak: descent and landing follow, with no second launch.
 const poses=[[0,-3,0,0],[.48,.72,.08,-.08],[.72,-.8,-.025,.04],[1,0,0,0]] as const;
 let translateY=formed?0:-3*intensity*morphEase(t/commentFormationFraction),scaleX=1,scaleY=1;
 if(formed&&t<1){const i=Math.max(1,poses.findIndex(p=>p[0]>=q)),a=poses[i-1],b=poses[i],u=(q-a[0])/(b[0]-a[0]),e=u*u*(3-2*u),mix=(j:1|2|3)=>intensity*(a[j]+(b[j]-a[j])*e);translateY=mix(1);scaleX=1+mix(2);scaleY=1+mix(3);}
 const transform=translateY===0&&scaleX===1&&scaleY===1?'none':`translateY(${translateY}px) scale(${scaleX}, ${scaleY})`;
 return {...shape,formed,translateY,scaleX,scaleY,transform};
}
