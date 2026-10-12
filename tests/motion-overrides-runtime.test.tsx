import {act, fireEvent, render, screen, within} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {LiveActions} from '../src/app/LiveActions.js';
import {AsyncComparison} from '../src/app/studio/AsyncComparison.js';
import {ConfiguredActions} from '../src/app/studio/ConfiguredActions.js';
import {defaultStudioConfig, type StudioConfig} from '../src/app/studio/config.js';
import {actionLabels, socialActions, type SocialAction} from '../src/lib/index.js';

const config: StudioConfig = {
  ...defaultStudioConfig,
  iconMotion: 'gesture',
  actions: socialActions.map(action => ({action, label: {...actionLabels[action]}})),
  motionOverrides: {like: 'none', comment: 'cartoon', share: 'spring', quote: 'trace', repost: 'cartoon', bookmark: 'pulse', note: 'none', star: 'trace', send: 'spring', sparkles: 'pulse', bell: 'cartoon', reaction: 'spring'},
};
const appearance = {variant: config.variant, tokens: config.tokens, iconMotion: config.iconMotion, motionTokens: config.motionTokens};
const like = () => screen.getByRole('button', {name: actionLabels.like.en});
const actionNodes = (container: HTMLElement) => Array.from(container.querySelectorAll<HTMLButtonElement>('.sil-action'));
const expectedMotion = (action: SocialAction) => config.motionOverrides[action] ?? config.iconMotion;
const flush = async () => {await act(async () => {await vi.runAllTimersAsync();});};
afterEach(() => {vi.useRealTimers();});

describe('per-action motion runtime propagation', () => {
  it('resolves all twelve ConfiguredActions independently and retains nodes, selection, draft, and focus across changes', () => {
    const r = render(<ConfiguredActions config={config} locale="en" reducedMotion/>);
    for (const node of actionNodes(r.container)) expect(node.dataset.iconMotion).toBe(expectedMotion(node.dataset.action as SocialAction));
    const liked = like(); fireEvent.click(liked);
    fireEvent.click(screen.getByRole('button', {name: actionLabels.comment.en}));
    const draft = screen.getByRole('textbox'); fireEvent.change(draft, {target: {value: 'Keep this draft'}});
    const changed: StudioConfig = {...config, iconMotion: 'pulse', motionOverrides: {like: 'trace', comment: 'none'}, actions: [...config.actions].reverse()};
    r.rerender(<ConfiguredActions config={changed} locale="en" reducedMotion/>);
    expect(like()).toBe(liked); expect(liked.dataset.iconMotion).toBe('trace'); expect(liked.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('textbox')).toBe(draft); expect((draft as HTMLTextAreaElement).value).toBe('Keep this draft'); expect(document.activeElement).toBe(draft);
    expect(screen.getByRole('button', {name: actionLabels.comment.en}).dataset.iconMotion).toBe('none');
    expect(screen.getByRole('button', {name: actionLabels.reaction.en}).dataset.iconMotion).toBe('pulse');
  });

  it('resolves the legacy four and all twelve configured LiveActions, including the separate Share branch', () => {
    const r = render(<LiveActions {...appearance} locale="en" reducedMotion/>);
    expect(actionNodes(r.container)).toHaveLength(4);
    for (const node of actionNodes(r.container)) expect(node.dataset.iconMotion).toBe('gesture');
    r.rerender(<LiveActions {...appearance} actions={config.actions} motionOverrides={config.motionOverrides} locale="en" reducedMotion/>);
    expect(actionNodes(r.container)).toHaveLength(12);
    for (const node of actionNodes(r.container)) expect(node.dataset.iconMotion).toBe(expectedMotion(node.dataset.action as SocialAction));
    expect(r.container.querySelector('[motionOverrides]')).toBeNull();
  });

  it('changes LiveActions motion without remounting a pending request or an open Share menu', async () => {
    vi.useFakeTimers();
    const props = {...appearance, actions: config.actions, motionOverrides: config.motionOverrides, locale: 'en' as const, reducedMotion: true, delay: 100};
    const r = render(<LiveActions {...props}/>), liked = like();
    fireEvent.click(liked); fireEvent.click(screen.getByRole('button', {name: actionLabels.share.en}));
    const menu = screen.getByRole('menu'), item = screen.getByRole('menuitem', {name: 'Copy demo link'});
    expect(document.activeElement).toBe(item);
    r.rerender(<LiveActions {...props} iconMotion="trace" motionOverrides={{like: 'pulse', share: 'none'}} actions={[...config.actions].reverse()}/>);
    expect(like()).toBe(liked); expect(liked.getAttribute('aria-busy')).toBe('true'); expect(liked.dataset.iconMotion).toBe('pulse');
    expect(screen.getByRole('menu')).toBe(menu); expect(screen.getByRole('menuitem', {name: 'Copy demo link'})).toBe(item); expect(document.activeElement).toBe(item);
    expect(screen.getByRole('button', {name: actionLabels.share.en}).dataset.iconMotion).toBe('none');
    await flush(); expect(liked.getAttribute('aria-pressed')).toBe('true'); expect(liked.getAttribute('aria-busy')).toBeNull();
    r.rerender(<LiveActions {...props} motionOverrides={{}}/>);
    expect(like()).toBe(liked); expect(liked.dataset.iconMotion).toBe('gesture'); expect(liked.getAttribute('aria-pressed')).toBe('true');
  });

  it('applies Like and Save overrides in both async policies without leaking props or changing transaction ownership', async () => {
    vi.useFakeTimers();
    const props = {...appearance, locale: 'en' as const, reducedMotion: true};
    const r = render(<AsyncComparison {...props} motionOverrides={{like: 'none', bookmark: 'trace'}}/>);
    const optimistic = within(screen.getByRole('group', {name: 'Optimistic: Like'}));
    const confirmed = within(screen.getByRole('group', {name: 'After success: Like'}));
    const optimisticLike = optimistic.getByRole('button', {name: 'Like'}), confirmedLike = confirmed.getByRole('button', {name: 'Like'});
    for (const node of actionNodes(r.container)) expect(node.dataset.iconMotion).toBe(node.dataset.action === 'like' ? 'none' : 'trace');
    expect(r.container.querySelector('[motionOverrides]')).toBeNull();
    fireEvent.click(optimisticLike); fireEvent.click(confirmedLike);
    expect(optimisticLike.getAttribute('aria-pressed')).toBe('true'); expect(confirmedLike.getAttribute('aria-pressed')).toBe('false');
    r.rerender(<AsyncComparison {...props} iconMotion="spring" motionOverrides={{bookmark: 'none'}}/>);
    expect(optimistic.getByRole('button', {name: 'Like'})).toBe(optimisticLike); expect(confirmed.getByRole('button', {name: 'Like'})).toBe(confirmedLike);
    for (const node of actionNodes(r.container)) expect(node.dataset.iconMotion).toBe(node.dataset.action === 'like' ? 'spring' : 'none');
    expect(optimisticLike.getAttribute('aria-busy')).toBe('true'); expect(confirmedLike.getAttribute('aria-busy')).toBe('true');
    await flush();
    for (const node of [optimisticLike, confirmedLike]) {expect(node.getAttribute('aria-pressed')).toBe('true'); expect(node.getAttribute('aria-busy')).toBeNull();}
    r.rerender(<AsyncComparison {...props}/>);
    for (const node of actionNodes(r.container)) expect(node.dataset.iconMotion).toBe('gesture');
  });
});
