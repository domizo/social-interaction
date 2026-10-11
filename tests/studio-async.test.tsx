import {afterEach, describe, expect, it, vi} from 'vitest';
import {act, fireEvent, render, renderHook, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {AsyncComparison, type AsyncComparisonProps} from '../src/app/studio/AsyncComparison.js';
import {useToggleTransaction, type ToggleRequest} from '../src/app/studio/useToggleTransaction.js';
import {defaultTokens} from '../src/lib/tokens.js';
import {defaultMotionTokens} from '../src/lib/iconMotion.js';

const props: AsyncComparisonProps = {
  tokens: {...defaultTokens}, variant: 'soft', iconMotion: 'none',
  motionTokens: {...defaultMotionTokens}, locale: 'en', reducedMotion: true,
};
function example(policy: 'Optimistic' | 'After success', action: 'Like' | 'Save') {
  return within(screen.getByRole('group', {name: `${policy}: ${action}`}));
}
async function advance(ms: number) {await act(async () => {await vi.advanceTimersByTimeAsync(ms);});}
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((yes, no) => {resolve = yes; reject = no;});
  return {promise, resolve, reject};
}
afterEach(() => {vi.clearAllTimers(); vi.useRealTimers();});

describe('Studio async comparison', () => {
  it('shows unconfirmed optimistic values immediately and holds after-success values until completion', async () => {
    vi.useFakeTimers();
    render(<AsyncComparison {...props}/>);
    const optimistic = example('Optimistic', 'Like');
    const confirmed = example('After success', 'Like');
    fireEvent.click(optimistic.getByRole('button', {name: 'Like'}));
    fireEvent.click(confirmed.getByRole('button', {name: 'Like'}));
    expect(optimistic.getByRole('button', {name: 'Like'}).getAttribute('aria-pressed')).toBe('true');
    expect(optimistic.getByRole('button', {name: 'Like'}).textContent).toContain('129');
    expect(optimistic.getByRole('status').textContent).toContain('unconfirmed');
    expect(optimistic.getByText('Confirmed').nextElementSibling?.textContent).toContain('Off · 128');
    expect(confirmed.getByRole('button', {name: 'Like'}).getAttribute('aria-pressed')).toBe('false');
    expect(confirmed.getByRole('button', {name: 'Like'}).textContent).toContain('128');
    expect(confirmed.getByRole('status').textContent).toContain('Pending');
    expect(screen.queryByText(/Succeeded/)).toBeNull();
    await advance(699);
    expect(confirmed.getByRole('button', {name: 'Like'}).getAttribute('aria-pressed')).toBe('false');
    await advance(1);
    for (const row of [optimistic, confirmed]) {
      expect(row.getByRole('button', {name: 'Like'}).getAttribute('aria-pressed')).toBe('true');
      expect(row.getByRole('button', {name: 'Like'}).textContent).toContain('129');
      expect(row.getByRole('status').textContent).toContain('Succeeded');
    }
  });

  it.each(['Like', 'Save'] as const)('rolls a failed optimistic %s removal back to its already-on committed value and retries that removal', async action => {
    vi.useFakeTimers();
    render(<AsyncComparison {...props}/>);
    const row = example('Optimistic', action);
    const button = row.getByRole('button', {name: action});
    const onCount = action === 'Like' ? '129' : '25';
    const offCount = action === 'Like' ? '128' : '24';
    fireEvent.click(button);
    await advance(700);
    fireEvent.click(row.getByRole('checkbox', {name: 'Fail next request'}));
    fireEvent.click(button);
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.textContent).toContain(offCount);
    expect((row.getByRole('checkbox') as HTMLInputElement).checked).toBe(false);
    await advance(700);
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.textContent).toContain(onCount);
    expect(row.getByRole('status').textContent).toContain('Failed');
    fireEvent.click(row.getByRole('button', {name: 'Retry'}));
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(row.getByRole('status').textContent).toContain('Requested: Off');
    await advance(700);
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.textContent).toContain(offCount);
    expect(row.getByRole('status').textContent).toContain('Succeeded');
  });

  it('after-success Save stays confirmed on failure and commits only when its retry succeeds', async () => {
    vi.useFakeTimers();
    render(<AsyncComparison {...props}/>);
    const row = example('After success', 'Save');
    const button = row.getByRole('button', {name: 'Save'});
    fireEvent.click(row.getByRole('checkbox'));
    fireEvent.click(button);
    expect(button.getAttribute('aria-pressed')).toBe('false');
    await advance(700);
    expect(row.getByRole('status').textContent).toContain('Failed');
    expect(button.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(row.getByRole('button', {name: 'Retry'}));
    expect(button.getAttribute('aria-pressed')).toBe('false');
    await advance(700);
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.textContent).toContain('25');
  });

  it('supports keyboard cancellation of a reversal and preserves focus on Cancel', async () => {
    const user = userEvent.setup();
    render(<AsyncComparison {...props}/>);
    fireEvent.change(screen.getByRole('combobox'), {target: {value: '0'}});
    const row = example('Optimistic', 'Save');
    const button = row.getByRole('button', {name: 'Save'});
    button.focus();
    await user.keyboard('{Enter}');
    await row.findByText('Succeeded · confirmed locally.');
    fireEvent.change(screen.getByRole('combobox'), {target: {value: '1800'}});
    await user.keyboard('{Enter}');
    expect(button.getAttribute('aria-pressed')).toBe('false');
    const cancel = row.getByRole('button', {name: 'Cancel'});
    cancel.focus();
    await user.keyboard(' ');
    expect(document.activeElement).toBe(cancel);
    expect(cancel.getAttribute('aria-disabled')).toBe('true');
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.textContent).toContain('25');
    expect(row.getByRole('status').textContent).toContain('Cancelled');
    expect(row.getByRole('status').textContent).toContain('Cancelled');
    expect(document.activeElement).toBe(cancel);
  });

  it('keeps all four owners independent, including a Like error alongside Save success', async () => {
    vi.useFakeTimers();
    render(<AsyncComparison {...props}/>);
    const rows = [example('Optimistic', 'Like'), example('Optimistic', 'Save'), example('After success', 'Like'), example('After success', 'Save')];
    fireEvent.click(rows[0].getByRole('checkbox'));
    for (const [index, row] of rows.entries()) fireEvent.click(row.getByRole('button', {name: index % 2 === 0 ? 'Like' : 'Save'}));
    fireEvent.click(rows[2].getByRole('button', {name: 'Cancel'}));
    await advance(700);
    expect(rows[0].getByRole('status').textContent).toContain('Failed');
    expect(rows[1].getByRole('status').textContent).toContain('Succeeded');
    expect(rows[2].getByRole('status').textContent).toContain('Cancelled');
    expect(rows[3].getByRole('status').textContent).toContain('Succeeded');
    fireEvent.click(rows[0].getByRole('button', {name: 'Retry'}));
    await advance(700);
    expect(rows[0].getByRole('status').textContent).toContain('Succeeded');
    expect(rows[2].getByRole('status').textContent).toContain('Cancelled');
  });

  it('blocks repeated activation, and arming a failure during pending applies only to the next request', async () => {
    vi.useFakeTimers();
    render(<AsyncComparison {...props}/>);
    const row = example('Optimistic', 'Like');
    const button = row.getByRole('button', {name: 'Like'});
    fireEvent.click(button);
    fireEvent.click(row.getByRole('checkbox'));
    fireEvent.click(button);
    fireEvent.click(button);
    expect((row.getByRole('checkbox') as HTMLInputElement).checked).toBe(true);
    expect(button.textContent).toContain('129');
    await advance(700);
    expect(row.getByRole('status').textContent).toContain('Succeeded');
    fireEvent.click(button);
    expect((row.getByRole('checkbox') as HTMLInputElement).checked).toBe(false);
    await advance(700);
    expect(row.getByRole('status').textContent).toContain('Failed');
    expect(button.getAttribute('aria-pressed')).toBe('true');
  });

  it('captures latency per request, offers 0/700/1800 ms, and preserves state on appearance and locale changes', async () => {
    vi.useFakeTimers();
    const view = render(<AsyncComparison {...props}/>);
    const latency = screen.getByRole('combobox', {name: 'Simulated latency'});
    expect(within(latency).getAllByRole('option').map(option => (option as HTMLOptionElement).value)).toEqual(['0', '700', '1800']);
    fireEvent.change(latency, {target: {value: '1800'}});
    fireEvent.click(example('Optimistic', 'Like').getByRole('button', {name: 'Like'}));
    fireEvent.change(latency, {target: {value: '0'}});
    view.rerender(<AsyncComparison {...props} locale="ja" variant="solid" tokens={{...props.tokens, iconSize: 26}}/>);
    const japaneseLike = within(screen.getByRole('group', {name: '楽観的に更新: いいね'}));
    expect(japaneseLike.getByRole('button', {name: 'いいね'}).getAttribute('aria-pressed')).toBe('true');
    expect(japaneseLike.getByRole('status').textContent).toContain('未確定');
    fireEvent.click(within(screen.getByRole('group', {name: '成功後に更新: 保存'})).getByRole('button', {name: '保存'}));
    await advance(0);
    expect(within(screen.getByRole('group', {name: '成功後に更新: 保存'})).getByRole('status').textContent).toContain('成功');
    await advance(1799);
    expect(japaneseLike.getByRole('status').textContent).toContain('処理中');
    await advance(1);
    expect(japaneseLike.getByRole('status').textContent).toContain('成功');
    expect(screen.queryByText(/Succeeded/)).toBeNull();
    view.rerender(<AsyncComparison {...props}/>);
    expect(example('Optimistic', 'Like').getByRole('button', {name: 'Like'}).getAttribute('aria-pressed')).toBe('true');
  });
});

describe('transaction ownership and ignoring adapters', () => {
  it('deduplicates synchronously before React renders and consumes fail-next exactly once', async () => {
    const work = deferred<boolean>();
    const request = vi.fn<ToggleRequest>(() => work.promise);
    const {result} = renderHook(() => useToggleTransaction({policy: 'optimistic', request}));
    let first!: Promise<boolean | undefined>;
    act(() => {
      result.current.setFailNext(true);
      first = result.current.toggle();
      void result.current.toggle();
      void result.current.retry();
    });
    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0][1].fail).toBe(true);
    expect(result.current.failNext).toBe(false);
    expect(result.current.displayValue).toBe(true);
    expect(result.current.committedValue).toBe(false);
    await act(async () => {work.resolve(true); await first;});
    expect(result.current.committedValue).toBe(true);
  });

  it('ignores a cancelled late resolution without unlocking or overwriting a newer operation', async () => {
    const old = deferred<boolean>();
    const current = deferred<boolean>();
    const request = vi.fn<ToggleRequest>().mockReturnValueOnce(old.promise).mockReturnValueOnce(current.promise);
    const {result} = renderHook(() => useToggleTransaction({policy: 'optimistic', request}));
    let oldResult!: Promise<boolean | undefined>;
    let currentResult!: Promise<boolean | undefined>;
    act(() => {
      oldResult = result.current.toggle();
      result.current.cancel();
      currentResult = result.current.toggle();
    });
    expect(request.mock.calls[0][1].signal.aborted).toBe(true);
    await act(async () => {old.resolve(false); expect(await oldResult).toBeUndefined();});
    expect(result.current.status).toBe('pending');
    expect(result.current.committedValue).toBe(false);
    expect(result.current.displayValue).toBe(true);
    act(() => {void result.current.toggle();});
    expect(request).toHaveBeenCalledTimes(2);
    await act(async () => {current.resolve(true); await currentResult;});
    expect(result.current.status).toBe('success');
    expect(result.current.committedValue).toBe(true);
  });

  it('ignores a cancelled late rejection after the replacement succeeds', async () => {
    const old = deferred<boolean>();
    const request = vi.fn<ToggleRequest>().mockReturnValueOnce(old.promise).mockResolvedValueOnce(true);
    const {result} = renderHook(() => useToggleTransaction({policy: 'after-success', request}));
    let oldResult!: Promise<boolean | undefined>;
    act(() => {oldResult = result.current.toggle(); result.current.cancel();});
    await act(async () => {await result.current.toggle();});
    await act(async () => {old.reject(Error('ignored old failure')); await oldResult;});
    expect(result.current.status).toBe('success');
    expect(result.current.committedValue).toBe(true);
    expect(result.current.failedValue).toBeNull();
  });

  it('unmount aborts ownership and ignores completion even when the request adapter ignores abort', async () => {
    const work = deferred<boolean>();
    const request = vi.fn<ToggleRequest>(() => work.promise);
    const {result, unmount} = renderHook(() => useToggleTransaction({policy: 'optimistic', request}));
    let completion!: Promise<boolean | undefined>;
    act(() => {completion = result.current.toggle();});
    unmount();
    expect(request.mock.calls[0][1].signal.aborted).toBe(true);
    work.resolve(true);
    expect(await completion).toBeUndefined();
    expect(await result.current.toggle()).toBeUndefined();
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('cancellation restores a prior true value and a same-tick reversal uses that committed value', async () => {
    const old = deferred<boolean>();
    const current = deferred<boolean>();
    const request = vi.fn<ToggleRequest>().mockReturnValueOnce(old.promise).mockReturnValueOnce(current.promise);
    const {result} = renderHook(() => useToggleTransaction({policy: 'optimistic', initialValue: true, request}));
    act(() => {void result.current.toggle();});
    expect(result.current.displayValue).toBe(false);
    act(() => {result.current.cancel();});
    expect(result.current.displayValue).toBe(true);
    expect(result.current.committedValue).toBe(true);
    act(() => {void result.current.toggle();});
    expect(request.mock.calls.map(call => call[0])).toEqual([false, false]);
    await act(async () => {current.resolve(false); await current.promise;});
    await act(async () => {old.resolve(true); await old.promise;});
    expect(result.current.committedValue).toBe(false);
  });
});
