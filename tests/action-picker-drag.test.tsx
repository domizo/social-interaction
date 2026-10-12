import {useState} from 'react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {act, fireEvent, render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {ActionPicker} from '../src/app/studio/ActionPicker.js';
import {actionLabels, socialActions} from '../src/lib/index.js';
import {defaultStudioConfig, parseStudioConfig, type StudioConfig} from '../src/app/studio/config.js';

const fresh = () => parseStudioConfig(defaultStudioConfig);
const ordered = () => within(screen.getByRole('list')).getAllByRole('listitem').map(item => item.getAttribute('data-action'));
function harness(initial = fresh(), locale: 'en' | 'ja' = 'en') {
  const onChange = vi.fn();
  function Harness() {
    const [config, setConfig] = useState(initial);
    return <ActionPicker config={config} locale={locale} onChange={next => {onChange(next); setConfig(next);}}/>;
  }
  return {...render(<Harness/>), onChange};
}

/** jsdom has no native PointerEvent/capture/layout. Supply only the event fields and row geometry used by the component. */
function pointer(type: string, target: Element, values: Partial<PointerEvent> = {}) {
  const event = new MouseEvent(type, {bubbles: true, cancelable: true, clientX: 275, clientY: 25, button: 0, ...values});
  Object.defineProperties(event, {
    pointerId: {value: values.pointerId ?? 7},
    pointerType: {value: values.pointerType ?? 'mouse'},
    isPrimary: {value: values.isPrimary ?? true},
  });
  fireEvent(target, event);
  return event;
}
function geometry() {
  const list = screen.getByRole('list');
  let captured: number | undefined;
  const set = vi.fn((id: number) => {captured = id;});
  const release = vi.fn(() => {captured = undefined;});
  Object.assign(list, {setPointerCapture: set, hasPointerCapture: (id: number) => captured === id, releasePointerCapture: release});
  const measure = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function(this: HTMLElement) {
    const index = Array.from(list.children).indexOf(this);
    const top = Math.max(index, 0) * 56;
    return {x: 0, y: top, top, left: 0, right: 300, bottom: top + 50, width: 300, height: 50, toJSON() {return {};}};
  });
  return {list, set, release, measure};
}
afterEach(() => vi.restoreAllMocks());

describe('transactional icon drag reorder', () => {
  it.each(['en', 'ja'] as const)('supports keyboard pickup, arrows/Home/End, drop and focused custom labels in %s', async locale => {
    const user = userEvent.setup();
    const initial = fresh();
    initial.actions[1].label = {en: 'Discuss with the team', ja: 'チームと話し合う'};
    initial.tokens.gap = 23;
    const {onChange} = harness(initial, locale);
    const handle = screen.getByRole('button', {name: locale === 'en' ? 'Reorder Discuss with the team' : 'チームと話し合うを並べ替え'});
    handle.focus();
    await user.keyboard(' ');
    expect(handle.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('status').textContent).toContain(locale === 'en' ? 'picked up, position 2 of 4' : '4個中2番目');
    await user.keyboard('{ArrowUp}{Home}');
    expect(ordered()).toEqual(['comment', 'like', 'share', 'quote']);
    expect(document.activeElement).toBe(handle);
    expect(onChange).not.toHaveBeenCalled();
    expect(initial.actions.map(item => item.action)).toEqual(['like', 'comment', 'share', 'quote']);
    await user.keyboard('{End}{ArrowDown}');
    expect(ordered()).toEqual(['like', 'share', 'quote', 'comment']);
    await user.keyboard('{ArrowLeft}{ArrowRight}{Enter}');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.lastCall![0]).toEqual({...initial, actions: [initial.actions[0], initial.actions[2], initial.actions[3], initial.actions[1]]});
    expect(onChange.mock.lastCall![0].actions[3]).toBe(initial.actions[1]);
    expect(document.activeElement).toBe(handle);
    expect(handle.getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByRole('status').textContent).toContain(locale === 'en' ? 'dropped at position 4 of 4' : '4個中4番目に確定');
  });

  it('cancels keyboard drafts with Escape and Tab without leaking the preview into config', async () => {
    const user = userEvent.setup();
    const {onChange} = harness();
    const handle = screen.getByRole('button', {name: 'Reorder Like'});
    handle.focus();
    await user.keyboard('{Enter}{End}{Escape}');
    expect(ordered()).toEqual(['like', 'comment', 'share', 'quote']);
    expect(document.activeElement).toBe(handle);
    expect(screen.getByRole('status').textContent).toBe('Reordering cancelled. Order unchanged.');
    expect(onChange).not.toHaveBeenCalled();
    await user.keyboard('{Enter}{End}{Tab}');
    expect(ordered()).toEqual(['like', 'comment', 'share', 'quote']);
    expect(document.activeElement).not.toBe(handle);
    expect(onChange).not.toHaveBeenCalled();
  });

  it.each(['mouse', 'touch', 'pen'])('captures %s drag only on the handle and commits once after the intent threshold', pointerType => {
    const initial = fresh();
    initial.actions[0].label = {en: 'Applaud', ja: '拍手'};
    const {onChange} = harness(initial);
    const {list, set, release} = geometry();
    const handle = screen.getByRole('button', {name: 'Reorder Applaud'});
    const label = within(list).getByText('Applaud');
    expect(pointer('pointerdown', label, {pointerType}).defaultPrevented).toBe(false);
    pointer('pointermove', list, {pointerType, clientY: 195});
    expect(set).not.toHaveBeenCalled();
    expect(pointer('pointerdown', handle, {pointerType}).defaultPrevented).toBe(true);
    expect(set).toHaveBeenCalledWith(7);
    pointer('pointermove', list, {pointerType, clientY: 29});
    expect(handle.getAttribute('aria-pressed')).toBe('false');
    expect(onChange).not.toHaveBeenCalled();
    pointer('pointermove', list, {pointerType, clientY: 195});
    expect(ordered()).toEqual(['comment', 'share', 'quote', 'like']);
    expect(handle.getAttribute('aria-pressed')).toBe('true');
    expect(onChange).not.toHaveBeenCalled();
    pointer('pointerup', list, {pointerType, clientY: 195});
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.lastCall![0].actions[3]).toBe(initial.actions[0]);
    expect(release).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(handle);
    pointer('lostpointercapture', list);
    expect(screen.getByRole('status').textContent).toBe('Applaud dropped at position 4 of 4.');
  });

  it.each(['pointercancel', 'lostpointercapture', 'escape', 'blur'])('discards pointer drafts on %s', reason => {
    const {onChange} = harness();
    const {list, release} = geometry();
    const handle = screen.getByRole('button', {name: 'Reorder Like'});
    pointer('pointerdown', handle);
    pointer('pointermove', list, {clientY: 195});
    expect(ordered()[3]).toBe('like');
    if (reason === 'escape') fireEvent.keyDown(window, {key: 'Escape'});
    else if (reason === 'blur') fireEvent.blur(window);
    else pointer(reason, list);
    expect(ordered()).toEqual(['like', 'comment', 'share', 'quote']);
    expect(onChange).not.toHaveBeenCalled();
    expect(release).toHaveBeenCalledTimes(1);
    pointer('pointerup', list);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('ignores another pointer, secondary buttons, and repeated key pickup', async () => {
    const user = userEvent.setup();
    const {onChange} = harness();
    const {list, set} = geometry();
    const handle = screen.getByRole('button', {name: 'Reorder Like'});
    pointer('pointerdown', handle, {button: 2});
    pointer('pointerdown', handle, {isPrimary: false});
    expect(set).not.toHaveBeenCalled();
    pointer('pointerdown', handle);
    pointer('pointermove', list, {pointerId: 8, clientY: 195});
    pointer('pointerup', list, {pointerId: 8});
    expect(ordered()[0]).toBe('like');
    expect(onChange).not.toHaveBeenCalled();
    pointer('pointercancel', list);
    handle.focus();
    await user.keyboard('{Enter}');
    fireEvent.keyDown(handle, {key: 'Enter', repeat: true});
    expect(handle.getAttribute('aria-pressed')).toBe('true');
    expect(onChange).not.toHaveBeenCalled();
  });

  it.each(['config', 'locale', 'inactive'] as const)('invalidates stale order when %s changes, so release cannot overwrite the incoming state', reason => {
    const onChange = vi.fn();
    const initial = fresh();
    const {rerender} = render(<ActionPicker config={initial} locale="en" onChange={onChange}/>);
    const {list, release} = geometry();
    pointer('pointerdown', screen.getByRole('button', {name: 'Reorder Like'}));
    pointer('pointermove', list, {clientY: 195});
    const incoming: StudioConfig = reason === 'config' ? {...initial, actions: [initial.actions[2], initial.actions[1]]} : initial;
    rerender(<ActionPicker config={incoming} locale={reason === 'locale' ? 'ja' : 'en'} active={reason !== 'inactive'} onChange={onChange}/>);
    expect(ordered()).toEqual(incoming.actions.map(item => item.action));
    expect(release).toHaveBeenCalledTimes(1);
    pointer('pointerup', list);
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryAllByRole('button', {pressed: true})).toHaveLength(0);
  });

  it('releases capture on unmount and makes a single selected icon non-reorderable', () => {
    const {unmount} = harness();
    const {release} = geometry();
    pointer('pointerdown', screen.getByRole('button', {name: 'Reorder Like'}));
    unmount();
    expect(release).toHaveBeenCalledTimes(1);
    const initial = fresh();
    initial.actions = initial.actions.slice(0, 1);
    const {onChange} = harness(initial);
    const handle = screen.getByRole('button', {name: 'Reorder Like'});
    expect(handle.getAttribute('aria-disabled')).toBe('true');
    pointer('pointerdown', handle);
    fireEvent.keyDown(handle, {key: 'Enter'});
    expect(handle.getAttribute('aria-pressed')).toBe('false');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('scrolls a 12-row touch drag at bounded viewport edges and remeasures offscreen targets', () => {
    const initial = fresh();
    initial.actions = socialActions.map(action => ({action, label: {...actionLabels[action]}}));
    const {onChange} = harness(initial);
    const {list, measure} = geometry();
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(400);
    let scroll = 0;
    measure.mockImplementation(function(this: HTMLElement) {
      const index = Array.from(list.children).indexOf(this);
      const top = 100 - scroll + (index < 0 ? 0 : index * 56);
      const height = index < 0 ? 12 * 56 : 50;
      return {x: 0, y: top, top, left: 0, right: 300, bottom: top + height, width: 300, height, toJSON() {return {};}};
    });
    const scrollBy = vi.spyOn(window, 'scrollBy').mockImplementation((options: unknown) => {scroll += (options as ScrollToOptions).top ?? 0;});
    const frames = new Map<number, FrameRequestCallback>();
    let frame = 0;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {frames.set(++frame, callback); return frame;});
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(id => {frames.delete(id);});
    const tick = () => act(() => {
      const [id, callback] = frames.entries().next().value!;
      frames.delete(id);
      callback(16 * id);
    });
    const handle = screen.getByRole('button', {name: 'Reorder Like'});
    pointer('pointerdown', handle, {pointerType: 'touch', clientY: 125});
    pointer('pointermove', list, {pointerType: 'touch', clientY: 128});
    expect(frames.size).toBe(0);
    pointer('pointermove', list, {pointerType: 'touch', clientY: 390});
    expect(frames.size).toBe(1);
    for (let index = 0; index < 40; index++) tick();
    expect(ordered()[11]).toBe('like');
    expect(onChange).not.toHaveBeenCalled();
    expect(scrollBy.mock.calls.length).toBeGreaterThan(10);
    expect(scrollBy.mock.calls.every(([options]) => Math.abs((options as ScrollToOptions).top!) <= 12)).toBe(true);
    const settled = scrollBy.mock.calls.length;
    tick();
    expect(scrollBy).toHaveBeenCalledTimes(settled);
    // A pointer outside the reorder region cannot keep driving page scrolling.
    pointer('pointermove', list, {pointerType: 'touch', clientX: 900, clientY: 12});
    tick();
    expect(scrollBy).toHaveBeenCalledTimes(settled);
    pointer('pointermove', list, {pointerType: 'touch', clientY: 12});
    for (let index = 0; index < 40; index++) tick();
    expect(ordered()[0]).toBe('like');
    expect(scrollBy.mock.calls.some(([options]) => (options as ScrollToOptions).top! < 0)).toBe(true);
    pointer('pointerup', list, {pointerType: 'touch', clientY: 12});
    expect(frames.size).toBe(0);
    expect(onChange).not.toHaveBeenCalled();
  });

  it.each(['pointercancel', 'lostpointercapture', 'escape', 'blur', 'drop', 'inactive', 'locale', 'config', 'unmount'] as const)('stops edge-scroll frames on %s and ignores a late callback', reason => {
    const initial = fresh();
    const onChange = vi.fn();
    const {rerender, unmount} = render(<ActionPicker config={initial} locale="en" onChange={onChange}/>);
    const {list} = geometry();
    const frames = new Map<number, FrameRequestCallback>();
    let frame = 0;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {frames.set(++frame, callback); return frame;});
    const cancel = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(id => {frames.delete(id);});
    const scrollBy = vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
    pointer('pointerdown', screen.getByRole('button', {name: 'Reorder Like'}));
    pointer('pointermove', list, {clientY: 195});
    expect(frames.size).toBe(1);
    const staleCallback = frames.values().next().value!;
    if (reason === 'escape') fireEvent.keyDown(window, {key: 'Escape'});
    else if (reason === 'blur') fireEvent.blur(window);
    else if (reason === 'unmount') unmount();
    else if (reason === 'drop') pointer('pointerup', list);
    else if (reason === 'inactive') rerender(<ActionPicker config={initial} locale="en" active={false} onChange={onChange}/>);
    else if (reason === 'locale') rerender(<ActionPicker config={initial} locale="ja" onChange={onChange}/>);
    else if (reason === 'config') rerender(<ActionPicker config={{...initial, actions: initial.actions.slice(1)}} locale="en" onChange={onChange}/>);
    else pointer(reason, list);
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(frames.size).toBe(0);
    act(() => staleCallback(16));
    expect(frames.size).toBe(0);
    expect(scrollBy).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledTimes(reason === 'drop' ? 1 : 0);
  });

  it('reveals focused keyboard and assistive-technology handles without fighting pointer scrolling', async () => {
    const user = userEvent.setup();
    const {onChange} = harness();
    const {list} = geometry();
    const handle = screen.getByRole('button', {name: 'Reorder Like'});
    const reveal = vi.fn();
    Object.assign(handle, {scrollIntoView: reveal});
    fireEvent.click(handle, {detail: 0});
    expect(document.activeElement).toBe(handle);
    expect(handle.getAttribute('aria-pressed')).toBe('true');
    await user.keyboard('{End}{Escape}');
    expect(ordered()[0]).toBe('like');
    expect(document.activeElement).toBe(handle);
    expect(reveal).toHaveBeenCalledTimes(3);
    expect(reveal).toHaveBeenLastCalledWith({block: 'nearest', inline: 'nearest', behavior: 'instant'});
    reveal.mockClear();
    pointer('pointerdown', handle);
    pointer('pointermove', list, {clientY: 195});
    pointer('pointercancel', list);
    expect(reveal).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not create a config update for a tap or unchanged drop', async () => {
    const user = userEvent.setup();
    const {onChange} = harness();
    const {list} = geometry();
    const handle = screen.getByRole('button', {name: 'Reorder Like'});
    pointer('pointerdown', handle);
    pointer('pointerup', list);
    handle.focus();
    await user.keyboard('{Enter}{Enter}');
    expect(onChange).not.toHaveBeenCalled();
    expect(handle.getAttribute('aria-pressed')).toBe('false');
  });
});
