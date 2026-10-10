import {forwardRef} from 'react';
import type {SocialAction} from './tokens.js';
import type {IconMotion} from './iconMotion.js';
import {repostSegment,commentMorph} from './cartoonGeometry.js';
const shapes={heart:'M20.7 4.9a5.4 5.4 0 0 0-7.6 0L12 6 10.9 4.9a5.4 5.4 0 0 0-7.6 7.6L12 21l8.7-8.5a5.4 5.4 0 0 0 0-7.6Z',bubble:'M21 11.5a9 9 0 0 1-9 9 9.7 9.7 0 0 1-3.8-.8L3 21l1.3-5.2a9.7 9.7 0 0 1-.8-3.8 9 9 0 0 1 9-9H13a9 9 0 0 1 8 8v.5Z',bookmark:'M6 3h12v18l-6-4-6 4Z',star:'m12 2.5 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5L2.6 9.3l6.5-.9Z',plane:'m3 10 18-7-7 18-3-8Z',note:'M5 3h14v12l-6 6H5Z',face:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',glint:'m12 2 2.8 7.2L22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8Z'};
function Path({d,filled=false,part}:{d:string;filled?:boolean;part?:string}){return <path data-glyph-part={part} pathLength="1" vectorEffect="non-scaling-stroke" d={d} fill={filled?'currentColor':'none'}/>;}
function Glyph({action,filled,motion}:{action:SocialAction;filled:boolean;motion?:IconMotion}){
 if(motion==='cartoon'&&action==='comment')return <Path d={commentMorph(1).d} part="comment-body"/>;
 if(motion==='cartoon'&&action==='repost')return <>{[false,true].map(opposite=>{const shape=repostSegment(0,opposite),side=opposite?'bottom':'top';return <g key={side} data-glyph-part={`relay-${side}`}><Path d={shape.body} part={`repost-body-${side}`}/><Path d={shape.head} part={`repost-head-${side}`}/></g>;})}</>;

 switch(action){
 case 'like':return <Path d={shapes.heart} filled={filled}/>;
 case 'comment':return <Path d={shapes.bubble}/>;
 case 'share':return <><g data-glyph-part="arrow"><Path d="M12 15V3m-4 4 4-4 4 4"/></g><Path d="M6 10H4v11h16V10h-2"/></>;
 case 'quote':return <><g data-glyph-part="quote-left"><Path d="M4 14c0-4 1-6 5-8M4 14h5v6H4z"/></g><g data-glyph-part="quote-right"><Path d="M15 14c0-4 1-6 5-8M15 14h5v6h-5z"/></g></>;
 case 'repost':return <><g data-glyph-part="relay-top"><Path d="M4 9V6h13m-3-3 3 3-3 3"/></g><g data-glyph-part="relay-bottom"><Path d="M20 15v3H7m3-3-3 3 3 3"/></g></>;
 case 'bookmark':return <><Path d={shapes.bookmark} filled={filled}/><g data-glyph-part="fold"><Path d="M9 7h6"/></g></>;
 case 'note':return <><Path d={shapes.note}/><g data-glyph-part="fold"><Path d="M13 21v-6h6"/></g><Path d="M8 8h8M8 11h6"/></>;
 case 'star':return <Path d={shapes.star} filled={filled}/>;
 case 'send':return <><g data-glyph-part="plane"><Path d={shapes.plane}/><g data-glyph-part="crease"><Path d="m11 13 10-10"/></g></g></>;
 case 'sparkles':return <><g data-glyph-part="glint-main"><Path d="m10 5 2.2 5.8L18 13l-5.8 2.2L10 21l-2.2-5.8L2 13l5.8-2.2Z"/></g><g data-glyph-part="glint-top"><Path d="m19 2 1.1 2.9L23 6l-2.9 1.1L19 10l-1.1-2.9L15 6l2.9-1.1Z"/></g><g data-glyph-part="glint-bottom"><Path d="M20 17v4m-2-2h4"/></g></>;
 case 'bell':return <><g data-glyph-part="bell-body"><Path d="M5 17h14l-2-3V9a5 5 0 0 0-10 0v5Z" filled={filled}/></g><g data-glyph-part="clapper"><Path d="M10 20a2.2 2.2 0 0 0 4 0M12 2v2"/></g></>;
 case 'reaction':return <><Path d={shapes.face}/><g data-glyph-part="eyes"><Path d="M8 9h.1M16 9h.1"/></g><Path d="M8 14c1 4 7 4 8 0"/></>;
 }
}
const echoes:Record<SocialAction,string>={like:shapes.heart,comment:shapes.bubble,share:'M8 5 12 1l4 4',quote:'M2 8 0 5m22 3 2-3',repost:'M3 3h5m13 18h-5',bookmark:shapes.bookmark,note:shapes.note,star:'M12-2v2m0 24v2M-2 12h2m24 0h2M2 2 0 0m22 22 2 2M22 2l2-2M2 22l-2 2',send:'M2 17-1 20m6-1-3 3',sparkles:shapes.glint,bell:'M3 7 1 5m20 2 2-2M2 12H0m22 0h2',reaction:'M3 3 1 1m20 2 2-2'};
export const ActionIcon=forwardRef<SVGSVGElement,{action:SocialAction;filled?:boolean;motion?:IconMotion}>(function ActionIcon({action,filled=false,motion},ref){
 return <svg ref={ref} className="sil-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="var(--sil-stroke, 1.6)" strokeLinecap="round" strokeLinejoin="round"><g data-glyph-part="glyph" className="sil-glyph"><Glyph action={action} filled={filled} motion={motion}/></g><g data-glyph-part="echo" className="sil-effect" opacity="0" fill="none"><Path d={echoes[action]}/></g></svg>;
});
