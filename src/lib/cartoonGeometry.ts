/** The one rectangle implied by the original Repost shafts. No guide is rendered. */
export const repostPerimeter=56;
export const repostBodyLength=16;
export interface RoutePoint {x:number;y:number;tx:number;ty:number}
const mod=(x:number)=>((x%repostPerimeter)+repostPerimeter)%repostPerimeter;
/** Clockwise from (4,6); an exact corner uses its outgoing tangent. */
export function repostRoute(distance:number):RoutePoint {
 const d=mod(distance);
 if(d<16)return {x:4+d,y:6,tx:1,ty:0};
 if(d<28)return {x:20,y:6+d-16,tx:0,ty:1};
 if(d<44)return {x:20-(d-28),y:18,tx:-1,ty:0};
 return {x:4,y:18-(d-44),tx:0,ty:-1};
}
const n=(x:number)=>Number(x.toFixed(5));
const polyline=(points:{x:number;y:number}[])=>points.map((p,i)=>`${i?'L':'M'}${n(p.x)} ${n(p.y)}`).join(' ');
/** Insert exact route corners rather than approximating a bend with sampled chords.
 * Four vertices suffice for a 16-unit window, which can cross at most two corners.
 * Repeated tip vertices keep the inspectable plans' command counts compatible. */
export function repostSegment(progress:number,opposite=false){
 const tipDistance=mod(13+progress*repostPerimeter+(opposite?28:0)),tailDistance=tipDistance-repostBodyLength;
 const corners=[-56,-40,-28,-12,0,16,28,44,56].filter(d=>d>tailDistance);
 const distances=[tailDistance,Math.min(corners[0],tipDistance),Math.min(corners[1],tipDistance),tipDistance];
 const points=distances.map(repostRoute),tip=repostRoute(tipDistance),back={x:tip.x-3*tip.tx,y:tip.y-3*tip.ty};
 const head=[{x:back.x+3*tip.ty,y:back.y-3*tip.tx},tip,{x:back.x-3*tip.ty,y:back.y+3*tip.tx}];
 return {body:polyline(points),head:polyline(head),points,tip};
}
