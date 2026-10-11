import type {GlyphPlan,IconMotion,IconMotionTokens} from './iconMotion.js';
export interface GlyphTrack {node:SVGElement;frames:Keyframe[];trace:boolean;duration:number;delay:number;easing:string}
/** The same target resolution and timing are used by activation and inspection. */
export function resolveGlyphTracks(svg:SVGSVGElement,plan:GlyphPlan[],motion:IconMotion,tokens:IconMotionTokens,pending=false):GlyphTrack[]{
 return plan.flatMap(step=>{const nodes=step.part==='trace'?Array.from(svg.querySelectorAll<SVGElement>('.sil-glyph path')):Array.from(svg.querySelectorAll<SVGElement>(`[data-glyph-part="${step.part}"]`));return nodes.map((node,index)=>({node,frames:step.frames,trace:step.part==='trace',duration:pending?Math.max(1100,tokens.duration*1.8):tokens.duration,delay:step.delay+(step.part==='trace'?index*tokens.stagger:0),easing:motion==='spring'?'cubic-bezier(.2,.75,.25,1)':'ease-in-out'}));});
}
