import type { CSSProperties } from 'react';
import {normalizeMotionTokens,type IconMotionTokens} from './iconMotion.js';
export const TOKEN_VERSION = '0.3.6';
export type SocialVariant = 'minimal' | 'soft' | 'solid' | 'spring';
export type SocialAction = 'like' | 'comment' | 'share' | 'quote' | 'repost' | 'bookmark' | 'note' | 'star' | 'send' | 'sparkles' | 'bell' | 'reaction';
export type PreviewState = 'idle' | 'hover' | 'focus' | 'pressed' | 'selected' | 'pending' | 'error';
export interface SocialTokens { iconSize: number; strokeWidth: number; gap: number; duration: number; amplitude: number; accent: string; hitTarget: number }
export const defaultTokens: Readonly<SocialTokens> = Object.freeze({iconSize:20,strokeWidth:1.6,gap:16,duration:180,amplitude:4,accent:'#b93240',hitTarget:44});
export const tokenBounds = {iconSize:[16,28],strokeWidth:[1,3],gap:[4,28],duration:[0,400],amplitude:[0,8],hitTarget:[44,64]} as const;
export function normalizeTokens(input: Partial<SocialTokens> = {}): SocialTokens {
  const value={...defaultTokens};
  for(const key of Object.keys(tokenBounds) as (keyof typeof tokenBounds)[]){ const n=input[key]; const [min,max]=tokenBounds[key]; value[key]=typeof n==='number' && Number.isFinite(n) ? Math.max(min,Math.min(max,n)) : defaultTokens[key]; }
  value.accent=typeof input.accent==='string' && /^#[\da-f]{6}$/i.test(input.accent) ? input.accent : defaultTokens.accent;
  return value;
}
export function tokenStyle(input: Partial<SocialTokens> = {}): CSSProperties {
  const t=normalizeTokens(input); return {'--sil-icon':`${t.iconSize}px`,'--sil-stroke':t.strokeWidth,'--sil-gap':`${t.gap}px`,'--sil-duration':`${t.duration}ms`,'--sil-amplitude':t.amplitude/100,'--sil-accent':t.accent,'--sil-target':`${t.hitTarget}px`} as CSSProperties;
}
export function tokensToDTCG(input: Partial<SocialTokens> = {}, motionInput:Partial<IconMotionTokens>={}) {
  const t=normalizeTokens(input),m=normalizeMotionTokens(motionInput); const dimension=(value:number)=>({$type:'dimension',$value:{value,unit:'px'}});
  return {iconMotion:{duration:{$type:'duration',$value:{value:m.duration,unit:'ms'}},intensity:{$type:'number',$value:m.intensity},stagger:{$type:'duration',$value:{value:m.stagger,unit:'ms'}}},$description:'Social Interaction Lab. DTCG 2025.10 format; not a W3C Recommendation. Package version '+TOKEN_VERSION, iconSize:dimension(t.iconSize),strokeWidth:dimension(t.strokeWidth),gap:dimension(t.gap),hitTarget:dimension(t.hitTarget),duration:{$type:'duration',$value:{value:t.duration,unit:'ms'}},amplitude:{$type:'number',$value:t.amplitude/100},accent:{$type:'color',$value:{colorSpace:'srgb',components:[1,3,5].map(i=>parseInt(t.accent.slice(i,i+2),16)/255),alpha:1,hex:t.accent}}};
}
