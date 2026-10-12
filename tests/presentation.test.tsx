import {act, fireEvent, render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {renderToStaticMarkup} from 'react-dom/server';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {ActionButton, defaultTokens, defaultMotionTokens, socialActions, actionLabels} from '../src/lib/index.js';
import {ConfiguredActions} from '../src/app/studio/ConfiguredActions.js';
import {AsyncComparison} from '../src/app/studio/AsyncComparison.js';
import {defaultStudioConfig} from '../src/app/studio/config.js';

afterEach(()=>{vi.useRealTimers();});
describe('icon-only presentation',()=>{
 it('hides visible labels and counts while keeping a stable name, count description and caller metadata',()=>{
  const r=render(<><p id="help">Context help</p><ActionButton action="like" label="Like" count={128} presentation="icon-only" aria-describedby="help" title="Custom hint"/></>);
  const button=screen.getByRole('button',{name:'Like'});
  expect(button.querySelector('.sil-label')).toBeNull();expect(button.querySelector('.sil-count')).toBeNull();
  expect(button.getAttribute('title')).toBe('Custom hint');expect(button.getAttribute('aria-pressed')).toBe('false');
  const ids=button.getAttribute('aria-describedby')!.split(' ');expect(ids[0]).toBe('help');expect(document.getElementById(ids[1])?.textContent).toBe('Like: 128');
  button.focus();r.rerender(<><p id="help">Context help</p><ActionButton action="like" label="Like" count={129} selected presentation="labelled" aria-describedby="help"/></>);
  expect(screen.getByRole('button',{name:'Like'})).toBe(button);expect(document.activeElement).toBe(button);expect(button.querySelector('.sil-label')?.textContent).toBe('Like');expect(button.querySelector('.sil-count')?.textContent).toBe('129');expect(button.getAttribute('aria-describedby')).toBe('help');expect(button.getAttribute('title')).toBeNull();
 });
 it('preserves the old showLabel=false count contract and gives icon-only precedence',()=>{
  const r=render(<ActionButton action="like" label="Like" count={0} showLabel={false}/>);const b=screen.getByRole('button');expect(b.querySelector('.sil-label')).toBeNull();expect(b.querySelector('.sil-count')?.textContent).toBe('0');
  r.rerender(<ActionButton action="like" label="Like" count={0} showLabel presentation="icon-only"/>);expect(b.querySelector('.sil-label')).toBeNull();expect(b.querySelector('.sil-count')).toBeNull();expect(b.querySelector('.sil-sr-only')?.textContent).toBe('Like: 0');expect(b.title).toBe('Like');
 });
 it('keeps every glyph and SSR semantic identical across presentations',()=>{
  for(const action of socialActions){const r=render(<ActionButton action={action} label={actionLabels[action].en}/>);const b=screen.getByRole('button'),svg=b.querySelector('svg')!.outerHTML,pressed=b.getAttribute('aria-pressed');r.rerender(<ActionButton action={action} label={actionLabels[action].en} presentation="icon-only"/>);expect(b.querySelector('svg')!.outerHTML).toBe(svg);expect(b.getAttribute('aria-pressed')).toBe(pressed);expect(renderToStaticMarkup(<ActionButton action={action} label={actionLabels[action].en} presentation="icon-only"/>)).toContain('data-presentation="icon-only"');r.unmount();}
 });
 it('retains Enter/Space activation and pending focus/guard',async()=>{
  const click=vi.fn(),user=userEvent.setup(),r=render(<ActionButton action="like" label="Like" presentation="icon-only" onClick={click}/>);await user.tab();await user.keyboard('{Enter} ');expect(click).toHaveBeenCalledTimes(2);const b=screen.getByRole('button');r.rerender(<ActionButton action="like" label="Like" presentation="icon-only" pending onClick={click}/>);await user.keyboard('{Enter}');expect(click).toHaveBeenCalledTimes(2);expect(document.activeElement).toBe(b);expect(b.getAttribute('aria-busy')).toBe('true');
 });
 it('does not replace focused context nodes, local selection or open menus',()=>{
  const r=render(<ConfiguredActions config={defaultStudioConfig} locale="en" reducedMotion/>);const like=screen.getByRole('button',{name:'Like'});fireEvent.click(like);like.focus();r.rerender(<ConfiguredActions config={{...defaultStudioConfig,presentation:'icon-only'}} locale="en" reducedMotion/>);expect(screen.getByRole('button',{name:'Like'})).toBe(like);expect(document.activeElement).toBe(like);expect(like.getAttribute('aria-pressed')).toBe('true');fireEvent.click(screen.getByRole('button',{name:'Share'}));const item=screen.getByRole('menuitem',{name:'Show example link'});item.focus();r.rerender(<ConfiguredActions config={defaultStudioConfig} locale="en" reducedMotion/>);expect(screen.getByRole('menuitem',{name:'Show example link'})).toBe(item);expect(document.activeElement).toBe(item);
 });
 it('keeps in-flight optimistic state and request ownership when presentation changes',async()=>{
  vi.useFakeTimers();const props={tokens:defaultTokens,variant:'soft' as const,iconMotion:'none' as const,motionTokens:defaultMotionTokens,locale:'en' as const,reducedMotion:true};const r=render(<AsyncComparison {...props}/>),group=within(screen.getByRole('group',{name:'Optimistic: Like'})),button=group.getByRole('button',{name:'Like'});fireEvent.click(button);r.rerender(<AsyncComparison {...props} presentation="icon-only"/>);expect(group.getByRole('button',{name:'Like'})).toBe(button);expect(button.getAttribute('aria-busy')).toBe('true');expect(button.getAttribute('aria-pressed')).toBe('true');expect(button.querySelector('.sil-count')).toBeNull();expect(button.getAttribute('aria-describedby')?.split(' ')).toHaveLength(3);await act(async()=>{await vi.advanceTimersByTimeAsync(700);});expect(button.getAttribute('aria-busy')).toBeNull();expect(group.getByRole('status').textContent).toContain('Succeeded');
 });
});
