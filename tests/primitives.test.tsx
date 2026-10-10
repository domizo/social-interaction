import {describe,it,expect,vi} from 'vitest';
import {render,screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {ActionBar,LikeButton,CommentButton,QuoteButton,ShareButton,normalizeTokens,defaultTokens,tokenStyle,tokensToDTCG} from '../src/lib/index.js';
describe('token contract',()=>{
 it('rejects malformed and nonfinite values; bounds protect icon and hit targets',()=>{const t=normalizeTokens({iconSize:NaN,strokeWidth:Infinity,hitTarget:2,gap:100,accent:'url(evil)'});expect(t).toEqual({...defaultTokens,hitTarget:44,gap:28});});
 it('exports DTCG 2025.10 object shapes with fractions for amplitude',()=>{const t=tokensToDTCG({accent:'#ff0000',amplitude:8});expect(t.iconSize.$value).toEqual({value:20,unit:'px'});expect(t.duration.$value).toEqual({value:180,unit:'ms'});expect(t.accent.$value.components).toEqual([1,0,0]);expect(t.amplitude.$value).toBe(.08);});
 it('generates the same CSS values used by specimens',()=>{expect(tokenStyle({gap:23})).toHaveProperty('--sil-gap','23px');});
});
describe('accessible primitives',()=>{
 it('keeps toggle label stable and uses pressed only on Like',()=>{const r=render(<LikeButton label="Like" selected={false}/>);let b=screen.getByRole('button',{name:'Like'});expect(b.getAttribute('aria-pressed')).toBe('false');r.rerender(<LikeButton label="Like" selected/>);b=screen.getByRole('button',{name:'Like'});expect(b.getAttribute('aria-pressed')).toBe('true');});
 it('distinguishes dialog and menu actions without aria-pressed',()=>{render(<><CommentButton label="Comment"/><QuoteButton label="Quote"/><ShareButton label="Share"/></>);expect(screen.getByRole('button',{name:'Share'}).getAttribute('aria-haspopup')).toBe('menu');for(const name of ['Comment','Quote']){const b=screen.getByRole('button',{name});expect(b.getAttribute('aria-haspopup')).toBe('dialog');expect(b.hasAttribute('aria-pressed')).toBe(false);}});
 it('uses native Enter and Space activation',async()=>{const user=userEvent.setup(),click=vi.fn();render(<LikeButton label="Like" onClick={click}/>);await user.tab();await user.keyboard('{Enter} ');expect(click).toHaveBeenCalledTimes(2);});
 it('guards pending activation while preserving focusability',async()=>{const user=userEvent.setup(),click=vi.fn();render(<LikeButton label="Like" onClick={click} pending/>);const b=screen.getByRole('button',{name:'Like'});await user.tab();expect(document.activeElement).toBe(b);await user.keyboard('{Enter}');expect(click).not.toHaveBeenCalled();expect(b.getAttribute('aria-busy')).toBe('true');});
 it('inherits ActionBar tokens without default child overrides',()=>{render(<ActionBar tokens={{iconSize:28}}><LikeButton label="Like"/></ActionBar>);expect(screen.getByRole('group').style.getPropertyValue('--sil-icon')).toBe('28px');expect(screen.getByRole('button').style.getPropertyValue('--sil-icon')).toBe('');});
 it('does not accidentally submit host forms',async()=>{const submit=vi.fn(),user=userEvent.setup();render(<form onSubmit={submit}><LikeButton label="Like"/></form>);await user.click(screen.getByRole('button'));expect(submit).not.toHaveBeenCalled();expect(screen.getByRole('button').getAttribute('type')).toBe('button');});
 it('keeps visible icon geometry independent of CSS-pixel stroke',()=>{render(<LikeButton label="Like" tokens={{iconSize:28,strokeWidth:2}}/>);expect(document.querySelector('path')?.getAttribute('vector-effect')).toBe('non-scaling-stroke');});
});
