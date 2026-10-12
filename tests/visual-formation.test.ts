import {describe,expect,it} from 'vitest';
import {isNearFullGeometry,NEAR_FULL_SVG_TOLERANCE} from '../e2e/visual-formation.js';
describe('native elapsed formation metric',()=>{
 const rest={width:18,height:18};
 it('accepts exact and subpixel-close painted outlines, including the observed coarse WebKit frame',()=>{for(const size of [18,17.81361,17.75,18.25])expect(isNearFullGeometry({width:size,height:size},rest)).toBe(true);});
 it('rejects meaningfully incomplete or oversized shapes on either axis and invalid geometry',()=>{for(const size of [17.749,17,14,3,18.251,NaN,Infinity,0,-1]){expect(isNearFullGeometry({width:size,height:18},rest)).toBe(false);expect(isNearFullGeometry({width:18,height:size},rest)).toBe(false);}expect(isNearFullGeometry(rest,{width:NaN,height:18})).toBe(false);});
 it('bounds the visual allowance below 0.3 CSS px even at the maximum glyph size',()=>{expect(NEAR_FULL_SVG_TOLERANCE*28/24).toBeLessThan(.3);});
});
