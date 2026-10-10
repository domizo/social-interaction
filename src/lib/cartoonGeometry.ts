/** Geometry-only helpers for the two deforming Cartoon glyphs. No guide is rendered. */
const radius=3,corner=Math.PI*radius/2;
export const repostPerimeter=48+4*corner;
export const repostBodyLength=10;
export interface RoutePoint {x:number;y:number;tx:number;ty:number}
export function repostRoute(distance:number):RoutePoint {
 const d=((distance%repostPerimeter)+repostPerimeter)%repostPerimeter;
 const segments:[number,(u:number)=>RoutePoint][]=[
  [corner,u=>({x:18+3*Math.sin(u*Math.PI/2),y:6-3*Math.cos(u*Math.PI/2),tx:Math.cos(u*Math.PI/2),ty:Math.sin(u*Math.PI/2)})],
  [12,u=>({x:21,y:6+12*u,tx:0,ty:1})],
  [corner,u=>({x:18+3*Math.cos(u*Math.PI/2),y:18+3*Math.sin(u*Math.PI/2),tx:-Math.sin(u*Math.PI/2),ty:Math.cos(u*Math.PI/2)})],
  [12,u=>({x:18-12*u,y:21,tx:-1,ty:0})],
  [corner,u=>({x:6-3*Math.sin(u*Math.PI/2),y:18+3*Math.cos(u*Math.PI/2),tx:-Math.cos(u*Math.PI/2),ty:-Math.sin(u*Math.PI/2)})],
  [12,u=>({x:3,y:18-12*u,tx:0,ty:-1})],
  [corner,u=>({x:6-3*Math.cos(u*Math.PI/2),y:6-3*Math.sin(u*Math.PI/2),tx:Math.sin(u*Math.PI/2),ty:-Math.cos(u*Math.PI/2)})],
  [12,u=>({x:6+12*u,y:3,tx:1,ty:0})],
 ];
 let rest=d;
 for(const [length,point] of segments){if(rest<=length)return point(rest/length);rest-=length;}
 return {x:18,y:3,tx:1,ty:0};
}
const n=(x:number)=>Number(x.toFixed(5));
const polyline=(points:{x:number;y:number}[],closed=false)=>points.map((p,i)=>`${i?'L':'M'}${n(p.x)} ${n(p.y)}`).join(' ')+(closed?' Z':'');
/** Fixed arc-length body and tangent head. Same command count at every phase permits d interpolation. */
export function repostSegment(progress:number,opposite=false){
 const tipDistance=repostPerimeter-5+progress*repostPerimeter+(opposite?repostPerimeter/2:0);
 const points=Array.from({length:33},(_,i)=>repostRoute(tipDistance-repostBodyLength+repostBodyLength*i/32));
 const tip=repostRoute(tipDistance),back={x:tip.x-2.4*tip.tx,y:tip.y-2.4*tip.ty};
 const head=[{x:back.x-2.1*tip.ty,y:back.y+2.1*tip.tx},tip,{x:back.x+2.1*tip.ty,y:back.y-2.1*tip.tx}];
 return {body:polyline(points),head:polyline(head),points,tip};
}
const smooth=(p:number)=>{const t=Math.min(1,Math.max(0,p));return t*t*(3-2*t);};
/** A circle grows from the lower-left; only the final 28% introduces the bubble tail. */
export function commentMorph(progress:number,intensity=1){
 const p=Math.min(1,Math.max(0,progress)),growth=smooth(p/.62),tail=smooth((p-.72)/.24);
 const overshoot=p>.45?.6*intensity*Math.sin(Math.PI*(p-.45)/.55):0;
 const r=1.5+7.5*growth+overshoot,cx=3+r,cy=21-r;
 const points=Array.from({length:64},(_,i)=>{const angle=-Math.PI/2+i*Math.PI/32;let delta=angle-3*Math.PI/4;while(delta>Math.PI)delta-=2*Math.PI;while(delta< -Math.PI)delta+=2*Math.PI;const weight=Math.max(0,1-Math.abs(delta)/(.125*Math.PI));const radial=r+tail*weight*r*(Math.SQRT2-1);return {x:cx+radial*Math.cos(angle),y:cy+radial*Math.sin(angle)};});
 return {d:polyline(points,true),points,r,cx,cy,tail};
}
