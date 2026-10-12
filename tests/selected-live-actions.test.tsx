import {act,fireEvent,render,screen,within} from '@testing-library/react';
import {afterEach,describe,expect,it,vi} from 'vitest';
import {LiveActions} from '../src/app/LiveActions.js';
import {defaultTokens,socialActions,type SocialAction} from '../src/lib/index.js';
import type {StudioConfig} from '../src/app/studio/config.js';
const base={variant:'soft' as const,locale:'en' as const,tokens:defaultTokens,delay:100,reducedMotion:true};
const choose=(...actions:SocialAction[]):StudioConfig['actions']=>actions.map(action=>({action,label:{en:`Custom ${action}`,ja:`日本語 ${action}`}}));
const button=(action:SocialAction)=>screen.getByRole('button',{name:`Custom ${action}`});
const flush=()=>act(async()=>{await vi.runAllTimersAsync();});
afterEach(()=>{vi.useRealTimers();vi.restoreAllMocks();vi.unstubAllGlobals();});
describe('selected legacy live actions',()=>{
 it('defaults to the legacy four and follows configured order, labels, counts and presentation without replacing nodes',()=>{
  const r=render(<LiveActions {...base}/>);
  expect(within(screen.getByRole('group')).getAllByRole('button').map(node=>node.getAttribute('aria-label'))).toEqual(['Like','Comment','Share','Quote']);
  r.rerender(<LiveActions {...base} actions={choose('bell','comment','like','send')} presentation="icon-only"/>);
  const nodes=within(screen.getByRole('group')).getAllByRole('button');
  expect(nodes.map(node=>node.dataset.action)).toEqual(['bell','comment','like','send']);
  for(const node of nodes){expect(node.querySelector('.sil-label')).toBeNull();expect(node.title).toBe(node.getAttribute('aria-label'));}
  expect(button('like').querySelector('.sil-sr-only')?.textContent).toBe('Custom like: 128');
  expect(button('comment').querySelector('.sil-sr-only')?.textContent).toBe('Custom comment: 24');
  const bell=button('bell');bell.focus();
  r.rerender(<LiveActions {...base} locale="ja" actions={choose('send','like','bell','comment')}/>);
  expect(within(screen.getByRole('group')).getAllByRole('button').map(node=>node.dataset.action)).toEqual(['send','like','bell','comment']);
  expect(screen.getByRole('button',{name:'日本語 bell'})).toBe(bell);expect(document.activeElement).toBe(bell);
  expect(bell.title).toBe('');expect(bell.querySelector('.sil-label')?.textContent).toBe('日本語 bell');
 });
 it('gives each additional toggle independent local state and commands truthful feedback without pressed or request state',()=>{
  const consumeFailure=vi.fn();render(<LiveActions {...base} actions={choose(...socialActions)} fail consumeFailure={consumeFailure}/>);
  for(const action of ['bookmark','note','star','bell'] as const){const node=button(action);expect(node.getAttribute('aria-pressed')).toBe('false');fireEvent.click(node);expect(node.getAttribute('aria-pressed')).toBe('true');expect(screen.getByRole('status').textContent).toBe(`Custom ${action}: on (local only)`);}
  fireEvent.click(button('bookmark'));expect(button('bookmark').getAttribute('aria-pressed')).toBe('false');
  for(const action of ['note','star','bell'] as const)expect(button(action).getAttribute('aria-pressed')).toBe('true');
  for(const action of ['repost','send','sparkles','reaction'] as const){const node=button(action);fireEvent.click(node);expect(node.hasAttribute('aria-pressed')).toBe(false);expect(node.hasAttribute('aria-busy')).toBe(false);expect(screen.getByRole('status').textContent).toBe(`Custom ${action} previewed locally (1). Nothing was posted, sent, or generated.`);fireEvent.click(node);expect(screen.getByRole('status').textContent).toBe(`Custom ${action} previewed locally (2). Nothing was posted, sent, or generated.`);}
  expect(consumeFailure).not.toHaveBeenCalled();expect(screen.queryByRole('button',{name:'Cancel request'})).toBeNull();
 });
 it('preserves pending Like ownership and count across reorder, presentation and language changes, then retains completed selection when re-added',async()=>{
  vi.useFakeTimers();const r=render(<LiveActions {...base} actions={choose('like','bell')}/>),like=button('like');fireEvent.click(like);
  r.rerender(<LiveActions {...base} locale="ja" actions={choose('bell','like')} presentation="icon-only"/>);
  expect(screen.getByRole('button',{name:'日本語 like'})).toBe(like);expect(like.getAttribute('aria-busy')).toBe('true');expect(like.getAttribute('aria-pressed')).toBe('false');
  await flush();expect(like.getAttribute('aria-pressed')).toBe('true');expect(like.querySelector('.sil-sr-only')?.textContent).toBe('日本語 like: 129');
  r.rerender(<LiveActions {...base} actions={choose('bell')}/>);r.rerender(<LiveActions {...base} actions={choose('bell','like')}/>);
  expect(button('like').getAttribute('aria-pressed')).toBe('true');expect(button('like').querySelector('.sil-count')?.textContent).toBe('129');
  fireEvent.click(button('like'));await flush();expect(button('like').getAttribute('aria-pressed')).toBe('false');expect(button('like').querySelector('.sil-count')?.textContent).toBe('128');
 });
 it('keeps an open custom Share menu and its focused item across reorder and presentation, with existing keyboard and async behavior',async()=>{
  vi.useFakeTimers();const r=render(<LiveActions {...base} actions={choose('share','like','star')}/>),share=button('share');
  expect(share.getAttribute('aria-haspopup')).toBe('menu');fireEvent.keyDown(share,{key:'ArrowUp'});
  const item=screen.getByRole('menuitem',{name:'Prepare local share'});expect(document.activeElement).toBe(item);
  r.rerender(<LiveActions {...base} actions={choose('star','like','share')} presentation="icon-only"/>);
  expect(button('share')).toBe(share);expect(screen.getByRole('menu',{name:'Custom share'})).toBeTruthy();expect(screen.getByRole('menuitem',{name:'Prepare local share'})).toBe(item);expect(document.activeElement).toBe(item);
  fireEvent.keyDown(item,{key:'Home'});expect(document.activeElement).toBe(screen.getByRole('menuitem',{name:'Copy demo link'}));
  fireEvent.keyDown(item,{key:'Escape'});expect(screen.queryByRole('menu')).toBeNull();expect(document.activeElement).toBe(share);
  fireEvent.click(share);fireEvent.click(screen.getByRole('menuitem',{name:'Prepare local share'}));expect(share.getAttribute('aria-busy')).toBe('true');await flush();expect(screen.getByText('Demo share prepared locally')).toBeTruthy();
 });
 it('tabs out of Share past hidden, inert, disabled and closed-details descendants in the configured action order',()=>{
  render(<LiveActions {...base} actions={choose('like','share','star')}/>);
  const share=button('share'),anchor=share.closest('.share-anchor')!;
  anchor.insertAdjacentHTML('afterend','<div data-focus-fixture><button style="visibility:hidden">Hidden</button><button style="visibility:collapse">Collapsed</button><div inert><button>Inert</button></div><input type="hidden" tabindex="0"><details><summary tabindex="-1">Closed</summary><button>Hidden detail</button></details><fieldset disabled><button>Disabled by fieldset</button></fieldset><button hidden>Hidden attribute</button><button style="display:none">Undisplayed</button></div>');
  fireEvent.click(share);fireEvent.keyDown(screen.getByRole('menuitem',{name:'Copy demo link'}),{key:'Tab'});expect(screen.queryByRole('menu')).toBeNull();expect(document.activeElement).toBe(button('star'));
  fireEvent.click(share);fireEvent.keyDown(screen.getByRole('menuitem',{name:'Copy demo link'}),{key:'Tab',shiftKey:true});expect(screen.queryByRole('menu')).toBeNull();expect(document.activeElement).toBe(button('like'));
 });
 it('preserves composer nodes and typed draft during reorder, retains saved drafts/counts and keeps quote count-free',async()=>{
  vi.useFakeTimers();const r=render(<LiveActions {...base} actions={choose('comment','quote','star')}/>),comment=button('comment');
  expect(comment.getAttribute('aria-haspopup')).toBe('dialog');fireEvent.click(comment);const dialog=screen.getByRole('dialog',{name:'Custom comment'}),textarea=screen.getByRole('textbox');fireEvent.change(textarea,{target:{value:'A selected-action draft'}});
  r.rerender(<LiveActions {...base} actions={choose('star','quote','comment')} presentation="icon-only"/>);
  expect(screen.getByRole('dialog')).toBe(dialog);expect(screen.getByRole('textbox')).toBe(textarea);expect((textarea as HTMLTextAreaElement).value).toBe('A selected-action draft');expect(document.activeElement).toBe(textarea);
  fireEvent.click(screen.getByRole('button',{name:'Save locally'}));await flush();expect(document.activeElement).toBe(comment);expect(comment.querySelector('.sil-sr-only')?.textContent).toBe('Custom comment: 25');
  r.rerender(<LiveActions {...base} actions={choose('star')}/>);expect(screen.getByText(/A selected-action draft/)).toBeTruthy();r.rerender(<LiveActions {...base} actions={choose('quote','comment','star')}/>);
  expect(button('comment').querySelector('.sil-count')?.textContent).toBe('25');expect(button('quote').querySelector('.sil-count')).toBeNull();fireEvent.click(button('quote'));expect(screen.getByRole('dialog',{name:'Custom quote'})).toBeTruthy();
 });
 it('cancels a removed pending Like without cancelling Share and never applies the removed result after re-adding',async()=>{
  vi.useFakeTimers();const r=render(<LiveActions {...base} actions={choose('like','share','star')}/>);fireEvent.click(button('like'));fireEvent.click(button('share'));fireEvent.click(screen.getByRole('menuitem',{name:'Prepare local share'}));
  r.rerender(<LiveActions {...base} actions={choose('star','share')}/>);expect(button('share').getAttribute('aria-busy')).toBe('true');r.rerender(<LiveActions {...base} actions={choose('like','star','share')}/>);
  expect(button('like').hasAttribute('aria-busy')).toBe(false);await flush();expect(button('like').getAttribute('aria-pressed')).toBe('false');expect(button('like').querySelector('.sil-count')?.textContent).toBe('128');expect(screen.queryByText('Like saved locally')).toBeNull();expect(screen.getByText('Demo share prepared locally')).toBeTruthy();
 });
 it('cancels removed Share work without cancelling Like and restores cancellation focus to the surviving request owner',async()=>{
  vi.useFakeTimers();const r=render(<LiveActions {...base} actions={choose('star','like','share')}/>);fireEvent.click(button('like'));fireEvent.click(button('share'));fireEvent.click(screen.getByRole('menuitem',{name:'Prepare local share'}));
  r.rerender(<LiveActions {...base} actions={choose('star','like')}/>);expect(button('like').getAttribute('aria-busy')).toBe('true');fireEvent.click(screen.getByRole('button',{name:'Cancel request'}));expect(document.activeElement).toBe(button('like'));
  r.rerender(<LiveActions {...base} actions={choose('star','share','like')}/>);await flush();expect(button('share').hasAttribute('aria-busy')).toBe(false);expect(screen.queryByText('Demo share prepared locally')).toBeNull();expect(button('like').getAttribute('aria-pressed')).toBe('false');
 });
 it('closes a removed menu and focuses a surviving trigger without reopening it when re-added',()=>{
  const r=render(<LiveActions {...base} actions={choose('share','star')}/>);fireEvent.click(button('share'));expect(document.activeElement).toBe(screen.getByRole('menuitem',{name:'Copy demo link'}));
  r.rerender(<LiveActions {...base} actions={choose('star')}/>);expect(screen.queryByRole('menu')).toBeNull();expect(document.activeElement).toBe(button('star'));
  r.rerender(<LiveActions {...base} actions={choose('star','share')}/>);expect(screen.queryByRole('menu')).toBeNull();expect(button('share').getAttribute('aria-expanded')).toBe('false');
 });
 it('closes and cancels a removed pending composer, retaining its draft separately from Quote until a later explicit save',async()=>{
  vi.useFakeTimers();const r=render(<LiveActions {...base} actions={choose('comment','quote','star')}/>);fireEvent.click(button('comment'));fireEvent.change(screen.getByRole('textbox'),{target:{value:'Not saved yet'}});fireEvent.click(screen.getByRole('button',{name:'Save locally'}));
  r.rerender(<LiveActions {...base} actions={choose('quote','star')}/>);expect(screen.queryByRole('dialog')).toBeNull();expect(document.activeElement).toBe(button('quote'));await flush();expect(screen.queryByText(/Saved locally/)).toBeNull();
  fireEvent.click(button('quote'));expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('');fireEvent.change(screen.getByRole('textbox'),{target:{value:'Independent quote'}});fireEvent.click(screen.getAllByRole('button',{name:'Close'})[0]);
  r.rerender(<LiveActions {...base} actions={choose('comment','quote','star')}/>);expect(button('comment').querySelector('.sil-count')?.textContent).toBe('24');fireEvent.click(button('comment'));expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('Not saved yet');fireEvent.click(screen.getByRole('button',{name:'Save locally'}));await flush();expect(button('comment').querySelector('.sil-count')?.textContent).toBe('25');expect(screen.getByText('Saved locally (1)')).toBeTruthy();
  fireEvent.click(button('quote'));expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('Independent quote');
 });
 it('does not steal focus from an outside picker when removing an open composer or menu',()=>{
  const view=(actions:StudioConfig['actions'])=><><button type="button">Outside picker</button><LiveActions {...base} actions={actions}/></>;
  const r=render(view(choose('comment','share','star'))),picker=screen.getByRole('button',{name:'Outside picker'});fireEvent.click(button('comment'));picker.focus();r.rerender(view(choose('share','star')));expect(document.activeElement).toBe(picker);expect(screen.queryByRole('dialog')).toBeNull();
  fireEvent.click(button('share'));picker.focus();r.rerender(view(choose('star')));expect(document.activeElement).toBe(picker);expect(screen.queryByRole('menu')).toBeNull();
 });
 it.each(['resolve','reject'] as const)('ignores a late clipboard %s after Share was removed and re-added',async(outcome)=>{
  let resolve!:()=>void,reject!:(reason:Error)=>void;const writeText=vi.fn(()=>new Promise<void>((yes,no)=>{resolve=yes;reject=no;}));vi.stubGlobal('navigator',{...navigator,clipboard:{writeText}});
  const r=render(<LiveActions {...base} actions={choose('share','star')}/>);fireEvent.click(button('share'));fireEvent.click(screen.getByRole('menuitem',{name:'Copy demo link'}));expect(writeText).toHaveBeenCalledWith('https://example.com/posts/small-actions');
  r.rerender(<LiveActions {...base} actions={choose('star')}/>);r.rerender(<LiveActions {...base} actions={choose('star','share')}/>);
  await act(async()=>{if(outcome==='resolve')resolve();else reject(new Error('Clipboard unavailable'));});expect(screen.queryByText('Demo link copied')).toBeNull();expect(screen.queryByText(/Clipboard unavailable/)).toBeNull();expect(screen.queryByRole('textbox')).toBeNull();
 });
 it('retains additional toggle selections when hidden and localizes command feedback with current custom labels',()=>{
  const r=render(<LiveActions {...base} actions={choose('star','send')}/>);fireEvent.click(button('star'));r.rerender(<LiveActions {...base} actions={choose('send')}/>);expect(screen.queryByRole('status')).toBeNull();fireEvent.click(button('send'));
  r.rerender(<LiveActions {...base} locale="ja" actions={choose('send','star')}/>);expect(screen.getByRole('button',{name:'日本語 star'}).getAttribute('aria-pressed')).toBe('true');expect(screen.getByRole('status').textContent).toContain('日本語 sendをローカルでプレビューしました');
 });
});
