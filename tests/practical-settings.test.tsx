import {beforeEach,it,expect} from 'vitest';
import {fireEvent,render,screen,within} from '@testing-library/react';
import App from '../src/app/App.js';
import {WORKING_DRAFT_KEY} from '../src/app/workingDraft.js';
beforeEach(()=>{sessionStorage.clear();history.replaceState(null,'','/');});
function step(name:string){fireEvent.click(screen.getByRole('tab',{name}));}
function config(){return JSON.parse(sessionStorage.getItem(WORKING_DRAFT_KEY)!).config;}
it('has one appearance control owner and only the chosen style in the comparison',()=>{
 render(<App/>);expect(screen.queryByRole('combobox',{name:'Button presentation'})).toBeNull();step('Appearance');
 for(const name of ['Button presentation','Studio visual style'])expect(screen.getAllByRole('combobox',{name})).toHaveLength(1);
 for(const name of ['Icon size','Stroke','Spacing','Hit target'])expect(screen.getAllByRole('slider',{name})).toHaveLength(1);
 expect(document.querySelectorAll('#compare .specimen')).toHaveLength(1);
 fireEvent.change(screen.getByRole('combobox',{name:'Studio visual style'}),{target:{value:'solid'}});
 expect(document.querySelector('#compare .sil-action')?.classList.contains('sil-solid')).toBe(true);
 fireEvent.click(screen.getByRole('button',{name:'Isolate a variable'}));
 expect(document.querySelectorAll('#compare .isolation .sil-action:not(.sil-solid)')).toHaveLength(0);
 expect(screen.getAllByRole('checkbox',{name:'Reduce preview motion'})).toHaveLength(1);
 expect(screen.getAllByRole('checkbox',{name:'Show hit targets'})).toHaveLength(1);
});
it('resolves global and per-icon motion without changing frozen override choices',()=>{
 render(<App/>);step('Motion');expect(screen.queryByRole('combobox',{name:'Timeline treatment'})).toBeNull();
 const global=screen.getByRole('combobox',{name:'Global motion'}),like=screen.getByRole('combobox',{name:'Motion for Like'});
 fireEvent.change(like,{target:{value:'trace'}});fireEvent.change(global,{target:{value:'pulse'}});
 expect(document.querySelector('[data-motion-action=like] button.sil-action')?.getAttribute('data-icon-motion')).toBe('trace');
 expect(document.querySelector('[data-motion-action=comment] button.sil-action')?.getAttribute('data-icon-motion')).toBe('pulse');
 fireEvent.change(screen.getByRole('combobox',{name:'Timeline icon'}),{target:{value:'like'}});
 expect(document.querySelector('[data-timeline-motion]')?.textContent).toBe('trace');
 fireEvent.click(screen.getByRole('button',{name:'Reset Like motion'}));expect((like as HTMLSelectElement).value).toBe('inherit');
 expect(config().motionOverrides).toEqual({});expect(document.querySelector('[data-timeline-motion]')?.textContent).toBe('pulse');
 expect(within(document.getElementById('step-animation')!).queryByText('Redraw each stroke, keeping the icon’s original shape.')).toBeNull();
});
it('keeps saved settings separate from Guide experiments and preserves isolated source tokens',()=>{
 render(<App/>);step('Appearance');fireEvent.change(screen.getByRole('slider',{name:'Icon size'}),{target:{value:'28'}});fireEvent.click(screen.getByRole('button',{name:'Isolate a variable'}));step('Motion');
 fireEvent.change(screen.getByRole('combobox',{name:'Global motion'}),{target:{value:'gesture'}});expect(config().tokens.iconSize).toBe(28);
 fireEvent.change(screen.getByRole('combobox',{name:'Motion for Like'}),{target:{value:'none'}});
 const saved=config();step('Guide');fireEvent.click(screen.getByRole('tab',{name:'Icon catalog'}));
 const catalog=document.querySelector('#icon-catalog')!;expect(document.querySelector('#catalog-motion .motion-code')?.textContent).toContain('iconMotion="none"');expect(catalog.querySelector('[data-action=like]')?.getAttribute('data-icon-motion')).toBe('none');
 fireEvent.change(screen.getByRole('combobox',{name:'Catalog motion'}),{target:{value:'trace'}});fireEvent.change(screen.getByRole('slider',{name:'Glyph duration'}),{target:{value:'1200'}});
 expect(config()).toEqual(saved);expect(catalog.querySelector('[data-action=like]')?.getAttribute('data-icon-motion')).toBe('trace');
 step('Motion');expect((screen.getByRole('combobox',{name:'Global motion'}) as HTMLSelectElement).value).toBe('gesture');
});
it('keeps a pending action named and busy without any visible ellipsis',()=>{
 render(<App/>);step('In context');const sample=within(document.querySelector('.context-section') as HTMLElement);
 fireEvent.change(sample.getByLabelText('Response delay'),{target:{value:'2500'}});const like=sample.getByRole('button',{name:'Like'});fireEvent.click(like);
 expect(like.getAttribute('aria-busy')).toBe('true');expect(like.getAttribute('aria-disabled')).toBe('true');expect(like.getAttribute('aria-label')).toBe('Like');expect(like.textContent).not.toMatch(/···|…|\.\.\./);
 expect(like.querySelector('.sil-pending-mark')).toBeNull();expect(sample.getByText('Request in progress')).toBeTruthy();
 fireEvent.click(like);expect(like.getAttribute('aria-pressed')).toBe('false');fireEvent.click(sample.getByRole('button',{name:'Cancel request'}));
 expect(like.hasAttribute('aria-busy')).toBe(false);
});
