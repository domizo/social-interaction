/** A native frame can precede the exact canonical handoff under coarse scheduling.
 * This fixed bound is <0.3 CSS px at the largest 28px/24-unit glyph. It describes
 * perceived formation only; deterministic phases and final d must remain exact. */
export const NEAR_FULL_SVG_TOLERANCE = 0.25;
export function isNearFullGeometry(sample:{width:number;height:number},rest:{width:number;height:number}):boolean{
 return [sample.width,sample.height,rest.width,rest.height].every(n=>Number.isFinite(n)&&n>0)
  &&Math.abs(sample.width-rest.width)<=NEAR_FULL_SVG_TOLERANCE
  &&Math.abs(sample.height-rest.height)<=NEAR_FULL_SVG_TOLERANCE;
}
