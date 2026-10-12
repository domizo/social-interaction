import {StrictMode} from 'react';
import {act, cleanup, fireEvent, render, screen, within} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {LiveActions} from '../src/app/LiveActions.js';
import {ConfiguredActions} from '../src/app/studio/ConfiguredActions.js';
import {ContextPreview} from '../src/app/studio/ContextPreview.js';
import {AsyncComparison} from '../src/app/studio/AsyncComparison.js';
import {ConfigPanel} from '../src/app/studio/ConfigPanel.js';
import {MotionTimeline} from '../src/app/studio/MotionTimeline.js';
import {defaultStudioConfig, type StudioConfig} from '../src/app/studio/config.js';
import {canonicalComment} from '../src/lib/canonicalMorph.js';

const config = (): StudioConfig => structuredClone(defaultStudioConfig);
const liveProps = {variant: 'soft' as const, locale: 'en' as const, tokens: defaultStudioConfig.tokens, delay: 100, reducedMotion: false};
const button = (name: string) => screen.getByRole('button', {name});
async function advance(ms: number) {await act(async () => {await vi.advanceTimersByTimeAsync(ms);});}
function deferred<T>() {
  let resolve!: (value: T) => void, reject!: (reason: Error) => void;
  const promise = new Promise<T>((yes, no) => {resolve = yes; reject = no;});
  return {promise, resolve, reject};
}
function clock() {
  vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout']});
  let now = 0, nextId = 0;
  const frames = new Map<number, FrameRequestCallback>();
  vi.spyOn(performance, 'now').mockImplementation(() => now);
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {frames.set(++nextId, callback); return nextId;});
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
  return {frames, step(time: number) {now = time; const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback(now));}};
}
afterEach(() => {cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); localStorage.clear();});

describe('retained inactive action previews', () => {
  it('cancels LiveActions pending owners and keeps confirmed values when revisiting', async () => {
    vi.useFakeTimers();
    const current = config(); current.actions.push({action: 'bookmark', label: {en: 'Save', ja: '保存'}});
    const view = render(<LiveActions {...liveProps} actions={current.actions}/>);
    const like = button('Like'), save = button('Save'), share = button('Share');
    fireEvent.click(like); await advance(100); fireEvent.click(save);
    fireEvent.click(like); fireEvent.click(share); fireEvent.click(screen.getByRole('menuitem', {name: 'Prepare local share'}));
    expect(view.container.querySelectorAll('[aria-busy="true"]')).toHaveLength(2);
    view.rerender(<LiveActions {...liveProps} actions={current.actions} active={false}/>);
    expect(view.container.querySelector('[aria-busy="true"]')).toBeNull();
    expect(screen.getByRole('status').textContent).toBe('Request cancelled');
    for (const node of view.container.querySelectorAll('.sil-action')) expect(node.getAttribute('data-reduced-motion')).toBe('true');
    await advance(0); expect(vi.getTimerCount()).toBe(0);
    await advance(1000);
    view.rerender(<LiveActions {...liveProps} actions={current.actions}/>);
    expect(button('Like')).toBe(like); expect(like.getAttribute('aria-pressed')).toBe('true');
    expect(save.getAttribute('aria-pressed')).toBe('true'); expect(like.textContent).toContain('129');
    expect(screen.queryByText('Demo share prepared locally')).toBeNull();
    fireEvent.click(like); await advance(100); expect(like.getAttribute('aria-pressed')).toBe('false');
  });

  it('closes a pending live composer without refocusing its trigger, retains its text, and never publishes the cancelled save', async () => {
    const timing = clock();
    const view = render(<><LiveActions {...liveProps} iconMotion="cartoon"/><button>Next step</button></>);
    const comment = button('Comment'); fireEvent.click(comment);
    fireEvent.change(screen.getByRole('textbox'), {target: {value: 'Keep my unfinished comment'}});
    fireEvent.click(button('Save locally'));
    const dialog = screen.getByRole('dialog'); const close = vi.spyOn(dialog as HTMLDialogElement, 'close');
    const focus = vi.spyOn(comment, 'focus'); button('Next step').focus();
    view.rerender(<><LiveActions {...liveProps} iconMotion="cartoon" active={false}/><button>Next step</button></>);
    expect(close).toHaveBeenCalled(); expect(focus).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(button('Next step')); expect(screen.queryByRole('dialog')).toBeNull();
    expect(comment.querySelector('path')?.getAttribute('d')).toBe(canonicalComment);
    expect(timing.frames.size).toBe(0); await advance(0); expect(vi.getTimerCount()).toBe(0);
    await advance(1000);
    view.rerender(<><LiveActions {...liveProps} iconMotion="cartoon"/><button>Next step</button></>);
    expect(screen.queryByRole('dialog')).toBeNull(); expect(comment.textContent).toContain('24');
    fireEvent.click(comment); expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('Keep my unfinished comment');
  });

  it.each(['resolve', 'reject'] as const)('ignores a %s from a live clipboard owner invalidated by hiding and returning', async outcome => {
    const work = deferred<void>();
    vi.stubGlobal('navigator', {...navigator, clipboard: {writeText: vi.fn(() => work.promise)}});
    const view = render(<LiveActions {...liveProps}/>);
    fireEvent.click(button('Share')); fireEvent.click(screen.getByRole('menuitem', {name: 'Copy demo link'}));
    view.rerender(<LiveActions {...liveProps} active={false}/>); view.rerender(<LiveActions {...liveProps}/>);
    await act(async () => {if (outcome === 'resolve') work.resolve(); else work.reject(Error('late clipboard error'));});
    expect(screen.queryByRole('status')).toBeNull(); expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('retains separate configured composer drafts and selections while closing modal and menu on hide', () => {
    const current = config(), props = {config: current, locale: 'en' as const, reducedMotion: false};
    const view = render(<><ConfiguredActions {...props}/><button>Next step</button></>);
    fireEvent.click(button('Like')); fireEvent.click(button('Comment'));
    fireEvent.change(screen.getByRole('textbox'), {target: {value: 'Comment draft'}});
    const commentFocus = vi.spyOn(button('Comment'), 'focus'), firstFocus = vi.spyOn(button('Like'), 'focus');
    view.rerender(<><ConfiguredActions {...props} active={false}/><button>Next step</button></>);
    expect(screen.queryByRole('dialog')).toBeNull(); expect(commentFocus).not.toHaveBeenCalled(); expect(firstFocus).not.toHaveBeenCalled();
    view.rerender(<><ConfiguredActions {...props}/><button>Next step</button></>);
    fireEvent.click(button('Quote')); fireEvent.change(screen.getByRole('textbox'), {target: {value: 'Quote draft'}});
    view.rerender(<><ConfiguredActions {...props} active={false}/><button>Next step</button></>);
    view.rerender(<><ConfiguredActions {...props}/><button>Next step</button></>);
    fireEvent.click(button('Comment')); expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('Comment draft');
    fireEvent.click(button('Save draft locally')); expect(screen.getByText('Comment draft')).toBeTruthy();
    fireEvent.click(button('Quote')); expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('Quote draft');
    fireEvent.click(button('Cancel')); fireEvent.click(button('Share'));
    const shareFocus = vi.spyOn(button('Share'), 'focus'); button('Next step').focus();
    view.rerender(<><ConfiguredActions {...props} active={false}/><button>Next step</button></>);
    expect(screen.queryByRole('menu')).toBeNull(); expect(shareFocus).not.toHaveBeenCalled();
    view.rerender(<><ConfiguredActions {...props}/><button>Next step</button></>);
    expect(screen.queryByRole('menu')).toBeNull(); expect(button('Like').getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText('Comment draft')).toBeTruthy();
  });

  it('forwards context inactivity and prevents hidden actions from opening new work', () => {
    const current = config();
    const view = render(<ContextPreview config={current} onContext={vi.fn()} locale="en" reducedMotion={false} active={false}/>);
    for (const node of view.container.querySelectorAll('.sil-action')) expect(node.getAttribute('data-reduced-motion')).toBe('true');
    fireEvent.click(button('Comment')); fireEvent.keyDown(button('Share'), {key: 'ArrowDown'});
    expect(screen.queryByRole('dialog')).toBeNull(); expect(screen.queryByRole('menu')).toBeNull();
    view.rerender(<ContextPreview config={current} onContext={vi.fn()} locale="en" reducedMotion={false}/>);
    expect(button('Comment').getAttribute('data-reduced-motion')).toBeNull();
  });

  it('cancels all four async owners, rolls back reversals, and preserves latency and armed failures', async () => {
    vi.useFakeTimers(); const current = config();
    const props = {tokens: current.tokens, variant: current.variant, iconMotion: current.iconMotion, motionTokens: current.motionTokens, locale: 'en' as const, reducedMotion: false};
    const view = render(<AsyncComparison {...props}/>);
    const rows = screen.getAllByRole('group', {name: /^(Optimistic|After success):/}).map(node => within(node));
    for (const row of rows) fireEvent.click(row.getByRole('button', {name: /^(Like|Save)$/}));
    await advance(700); fireEvent.change(screen.getByRole('combobox'), {target: {value: '1800'}});
    for (const row of rows) {fireEvent.click(row.getByRole('button', {name: /^(Like|Save)$/})); fireEvent.click(row.getByRole('checkbox'));}
    view.rerender(<AsyncComparison {...props} active={false}/>);
    expect(vi.getTimerCount()).toBe(0);
    for (const row of rows) {
      const action = row.getByRole('button', {name: /^(Like|Save)$/});
      expect(row.getByRole('status').textContent).toContain('Cancelled');
      expect(action.getAttribute('aria-pressed')).toBe('true'); expect(action.getAttribute('aria-busy')).toBeNull();
      expect(action.getAttribute('data-reduced-motion')).toBe('true');
      expect((row.getByRole('checkbox') as HTMLInputElement).checked).toBe(true);
    }
    await advance(2000); view.rerender(<AsyncComparison {...props}/>);
    expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe('1800');
    expect(screen.getAllByText('Cancelled · kept the last confirmed value.')).toHaveLength(4);
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('retained inactive configuration', () => {
  it('aborts pending file reads, rejects late completions after return, and retains label and preset drafts', async () => {
    const readers: FileReader[] = [];
    vi.spyOn(FileReader.prototype, 'readAsText').mockImplementation(function (this: FileReader) {readers.push(this);});
    const abort = vi.spyOn(FileReader.prototype, 'abort'), onApply = vi.fn(), current = config();
    const props = {config: current, onApply, locale: 'en' as const};
    const view = render(<StrictMode><ConfigPanel {...props}/></StrictMode>);
    fireEvent.click(screen.getByText('Actions & labels', {selector: 'summary'}));
    fireEvent.change(screen.getByLabelText('like English'), {target: {value: 'Unsaved appreciation'}});
    fireEvent.change(screen.getByLabelText('Preset name'), {target: {value: 'Unfinished preset'}});
    const upload = screen.getByLabelText('Import JSON') as HTMLInputElement;
    fireEvent.change(upload, {target: {files: [new File(['pending'], 'config.json')]}});
    expect(upload.disabled).toBe(true);
    view.rerender(<StrictMode><ConfigPanel {...props} active={false}/></StrictMode>); expect(abort).toHaveBeenCalledTimes(1); expect(upload.disabled).toBe(false);
    view.rerender(<StrictMode><ConfigPanel {...props}/></StrictMode>);
    Object.defineProperty(readers[0], 'result', {value: JSON.stringify({...current, presentation: 'icon-only'})});
    await act(async () => {readers[0].dispatchEvent(new ProgressEvent('load'));});
    expect(onApply).not.toHaveBeenCalled(); expect(screen.queryByRole('status')).toBeNull(); expect(screen.queryByRole('alert')).toBeNull();
    expect((screen.getByLabelText('like English') as HTMLInputElement).value).toBe('Unsaved appreciation');
    expect((screen.getByLabelText('Preset name') as HTMLInputElement).value).toBe('Unfinished preset');
    fireEvent.change(upload, {target: {files: [new File(['current'], 'config.json')]}});
    Object.defineProperty(readers[1], 'result', {value: JSON.stringify(current)});
    await act(async () => {readers[1].dispatchEvent(new ProgressEvent('load'));});
    expect(onApply).toHaveBeenCalledTimes(1); expect(upload.disabled).toBe(false);
  });

  it('does not reveal or focus a late clipboard fallback after changing steps', async () => {
    const work = deferred<void>(); vi.stubGlobal('navigator', {...navigator, clipboard: {writeText: vi.fn(() => work.promise)}});
    const props = {config: config(), onApply: vi.fn(), locale: 'en' as const};
    const view = render(<><ConfigPanel {...props}/><button>Next step</button></>);
    fireEvent.click(button('Copy React')); button('Next step').focus();
    view.rerender(<><ConfigPanel {...props} active={false}/><button>Next step</button></>);
    view.rerender(<><ConfigPanel {...props}/><button>Next step</button></>);
    await act(async () => {work.reject(Error('late failure'));});
    expect(screen.queryByLabelText('Generated React code')).toBeNull(); expect(screen.queryByRole('alert')).toBeNull();
    expect(document.activeElement).toBe(button('Next step'));
  });
});

describe('retained inactive motion timeline', () => {
  it('releases WAAPI animations and media listeners while hidden and recreates only paused resources on return', () => {
    const timing = clock(), add = vi.fn(), remove = vi.fn();
    vi.stubGlobal('matchMedia', vi.fn(() => ({matches: false, addEventListener: add, removeEventListener: remove})));
    const animations: Array<{pause: ReturnType<typeof vi.fn>; cancel: ReturnType<typeof vi.fn>; currentTime: number}> = [];
    const descriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'animate');
    Object.defineProperty(Element.prototype, 'animate', {configurable: true, writable: true, value: vi.fn(() => {
      const animation = {pause: vi.fn(), cancel: vi.fn(), currentTime: 0}; animations.push(animation); return animation;
    })});
    try {
      const current = config(); current.actions = current.actions.filter(item => item.action === 'quote'); current.iconMotion = 'trace';
      const props = {config: current, locale: 'en' as const, reducedMotion: false, onMotion: vi.fn()};
      const view = render(<StrictMode><MotionTimeline {...props} active={false}/></StrictMode>);
      const svg = view.container.querySelector('svg')!, canonical = svg.outerHTML;
      expect(add).not.toHaveBeenCalled(); expect(animations).toHaveLength(0);
      view.rerender(<StrictMode><MotionTimeline {...props}/></StrictMode>);
      fireEvent.change(screen.getByRole('slider'), {target: {value: '100'}});
      expect(add).toHaveBeenCalledTimes(1); expect(animations.length).toBeGreaterThan(0);
      const count = animations.length, inspected = svg.outerHTML;
      view.rerender(<StrictMode><MotionTimeline {...props} active={false}/></StrictMode>);
      expect(remove).toHaveBeenCalledTimes(1); expect(svg.outerHTML).toBe(canonical);
      expect(animations.every(animation => animation.cancel.mock.calls.length === 1)).toBe(true);
      expect(timing.frames.size).toBe(0); expect(vi.getTimerCount()).toBe(0);
      view.rerender(<StrictMode><MotionTimeline {...props}/></StrictMode>);
      expect(add).toHaveBeenCalledTimes(2); expect(animations).toHaveLength(count * 2);
      expect(svg.outerHTML).toBe(inspected); expect(timing.frames.size).toBe(0); expect(vi.getTimerCount()).toBe(0);
      expect(animations.slice(count).every(animation => animation.pause.mock.calls.length === 1 && animation.currentTime === 100)).toBe(true);
      view.unmount(); expect(remove).toHaveBeenCalledTimes(2);
    } finally {
      if (descriptor) Object.defineProperty(Element.prototype, 'animate', descriptor);
      else delete (Element.prototype as unknown as {animate?: unknown}).animate;
    }
  });

  it('distinguishes an inspected zero frame from Reset when revisiting', () => {
    clock(); const props = {config: config(), locale: 'en' as const, reducedMotion: false, onMotion: vi.fn()};
    const view = render(<MotionTimeline {...props}/>), svg = view.container.querySelector('svg')!, canonical = svg.outerHTML;
    fireEvent.change(screen.getByRole('slider'), {target: {value: '100'}});
    fireEvent.change(screen.getByRole('slider'), {target: {value: '0'}});
    const zeroFrame = svg.outerHTML; expect(zeroFrame).not.toBe(canonical);
    view.rerender(<MotionTimeline {...props} active={false}/>); expect(svg.outerHTML).toBe(canonical);
    view.rerender(<MotionTimeline {...props}/>); expect(svg.outerHTML).toBe(zeroFrame);
    fireEvent.click(button('Reset timeline'));
    view.rerender(<MotionTimeline {...props} active={false}/>); view.rerender(<MotionTimeline {...props}/>);
    expect(svg.outerHTML).toBe(canonical);
  });

  it('destroys running owners and canonicalizes while hidden, then restores the same paused position and speed', () => {
    const timing = clock(), current = config(), props = {config: current, locale: 'en' as const, reducedMotion: false, onMotion: vi.fn()};
    const view = render(<MotionTimeline {...props}/>), svg = view.container.querySelector('svg')!;
    const canonical = svg.outerHTML;
    const slider = screen.getByRole('slider') as HTMLInputElement;
    fireEvent.change(screen.getByRole('combobox', {name: 'Timeline playback speed'}), {target: {value: '0.5'}});
    fireEvent.click(button('Play timeline')); act(() => timing.step(200));
    expect(slider.value).toBe('100'); const inspected = svg.outerHTML;
    const stale = [...timing.frames.values()][0];
    view.rerender(<MotionTimeline {...props} active={false}/>);
    expect(slider.value).toBe('100'); expect(svg.outerHTML).toBe(canonical);
    expect(timing.frames.size).toBe(0); expect(vi.getTimerCount()).toBe(0);
    act(() => stale(500)); expect(svg.outerHTML).toBe(canonical);
    view.rerender(<MotionTimeline {...props}/>);
    expect(svg.outerHTML).toBe(inspected); expect(slider.value).toBe('100');
    expect((screen.getByRole('combobox', {name: 'Timeline playback speed'}) as HTMLSelectElement).value).toBe('0.5');
    expect(button('Play timeline')).toBeTruthy(); expect(timing.frames.size).toBe(0); expect(vi.getTimerCount()).toBe(0);
    fireEvent.click(button('Play timeline')); act(() => timing.step(400)); expect(slider.value).toBe('200');
  });

  it('does not create a hidden timeline owner or restore a stale pose after its action changes', () => {
    const timing = clock(), current = config(), props = {locale: 'en' as const, reducedMotion: false, onMotion: vi.fn()};
    const view = render(<MotionTimeline {...props} config={current} active={false}/>);
    const svg = view.container.querySelector('svg')!;
    expect(svg.querySelector('path')?.getAttribute('d')).toBe(canonicalComment);
    expect(timing.frames.size).toBe(0); expect(vi.getTimerCount()).toBe(0);
    view.rerender(<MotionTimeline {...props} config={current}/>);
    fireEvent.change(screen.getByRole('slider'), {target: {value: '200'}});
    view.rerender(<MotionTimeline {...props} config={current} active={false}/>);
    const quoteOnly = {...current, actions: current.actions.filter(item => item.action === 'quote')};
    view.rerender(<MotionTimeline {...props} config={quoteOnly} active={false}/>);
    const next = view.container.querySelector('svg')!; const canonical = next.outerHTML;
    expect(next).not.toBe(svg); expect(timing.frames.size).toBe(0); expect(vi.getTimerCount()).toBe(0);
    view.rerender(<MotionTimeline {...props} config={quoteOnly}/>);
    expect((screen.getByRole('slider') as HTMLInputElement).value).toBe('0'); expect(next.outerHTML).toBe(canonical);
  });
});
