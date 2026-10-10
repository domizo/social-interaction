import {repostSegment} from './cartoonGeometry.js';
export const canonicalComment='M21 11.5a9 9 0 0 1-9 9 9.7 9.7 0 0 1-3.8-.8L3 21l1.3-5.2a9.7 9.7 0 0 1-.8-3.8 9 9 0 0 1 9-9H13a9 9 0 0 1 8 8v.5Z';
export const canonicalRepost=['M4 9V6h13m-3-3 3 3-3 3','M20 15v3H7m3-3-3 3 3 3'] as const;
type Point={x:number;y:number};
const n=(x:number)=>Number(x.toFixed(5));
const path=(points:Point[],closed=false)=>points.map((p,i)=>`${i?'L':'M'}${n(p.x)} ${n(p.y)}`).join(' ')+(closed?' Z':'');
const mix=(a:Point[],b:Point[],t:number)=>a.map((p,i)=>({x:p.x+(b[i].x-p.x)*t,y:p.y+(b[i].y-p.y)*t}));
const decode=(d:string):Point[]=>{const v=d.match(/-?\d+(?:\.\d+)?/g)!.map(Number);return Array.from({length:v.length/2},(_,i)=>({x:v[2*i],y:v[2*i+1]}));};
/** Original compound arrow stays one path, preserving Trace's path count/stagger. */
export function canonicalRepostPoints(opposite=false){const s=repostSegment(0,opposite);return {body:s.points,head:decode(s.head)};}
export function repostTransition(progress:number,intensity=1,opposite=false){
 const p=Math.min(1,Math.max(0,progress)),phase=p+.03*intensity*Math.sin(2*Math.PI*p),segment=repostSegment(phase,opposite),points=segment.points,head=decode(segment.head);
 const sampledD=`${segment.body} ${segment.head}`;return {d:p===0||p===1?canonicalRepost[opposite?1:0]:sampledD,sampledD,points,head,phase};
}
// Sample the exact circular-arc commands of the shared Comment outline. Explicit
// vertices retain its sharp tail; radial correspondence keeps the growing circle closed.
const vertices:Point[]=[{x:21,y:11.5},{x:12,y:20.5},{x:8.2,y:19.7},{x:3,y:21},{x:4.3,y:15.8},{x:3.5,y:12},{x:12.5,y:3},{x:13,y:3},{x:21,y:11}];
const boundary:Point[]=[vertices[0]];
const line=(p:Point)=>boundary.push(p);
const arc=(q:Point,r:number)=>{const p=boundary.at(-1)!,dx=q.x-p.x,dy=q.y-p.y,l=Math.hypot(dx,dy),h=Math.sqrt(r*r-l*l/4),cx=(p.x+q.x)/2-dy/l*h,cy=(p.y+q.y)/2+dx/l*h,start=Math.atan2(p.y-cy,p.x-cx);let sweep=Math.atan2(q.y-cy,q.x-cx)-start;while(sweep<0)sweep+=2*Math.PI;const count=Math.ceil(sweep*512/Math.PI);for(let i=1;i<=count;i++){const a=start+sweep*i/count;boundary.push({x:cx+r*Math.cos(a),y:cy+r*Math.sin(a)});}};
arc(vertices[1],9);arc(vertices[2],9.7);line(vertices[3]);line(vertices[4]);arc(vertices[5],9.7);arc(vertices[6],9);line(vertices[7]);arc(vertices[8],9);line(vertices[0]);
const angle=(p:Point)=>{let a=Math.atan2(p.y-12,p.x-12);while(a< -Math.PI/2)a+=2*Math.PI;return a;};
export const commentAngles=[...new Set([...Array.from({length:128},(_,i)=>-Math.PI/2+i*Math.PI/64),...vertices.map(angle)])].sort((a,b)=>a-b);
export const canonicalCommentPoints=commentAngles.map(a=>{const vx=Math.cos(a),vy=Math.sin(a);let radius=0;for(let i=1;i<boundary.length;i++){const p=boundary[i-1],q=boundary[i],wx=q.x-p.x,wy=q.y-p.y,cross=vx*wy-vy*wx;if(Math.abs(cross)<1e-10)continue;const ax=p.x-12,ay=p.y-12,r=(ax*wy-ay*wx)/cross,t=(ax*vy-ay*vx)/cross;if(r>0&&t>=-1e-9&&t<=1+1e-9)radius=Math.max(radius,r);}return {x:12+radius*vx,y:12+radius*vy};});
/** One inflation, with shape and size developing together. Activation starts small;
 * idle/cancel/reduction use ActionIcon's untouched canonical path. */
export function commentTransition(progress:number,intensity=1){
 const p=Math.min(1,Math.max(0,progress)),r=2-.5*Math.min(2,Math.max(0,intensity)),cx=3+r,cy=21-r;
 const initial=commentAngles.map(a=>({x:cx+r*Math.cos(a),y:cy+r*Math.sin(a)}));
 const growing=mix(initial,canonicalCommentPoints,p),dx=3-Math.min(...growing.map(q=>q.x)),dy=21-Math.max(...growing.map(q=>q.y));
 const points=growing.map(q=>({x:q.x+dx,y:q.y+dy})),sampledD=path(points,true);
 return {d:p===1?canonicalComment:sampledD,sampledD,points,progress:p,r};
}
