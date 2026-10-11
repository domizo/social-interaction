import {useCallback, useEffect, useRef, useState} from 'react';
import {simulateRequest} from '../../lib/useAsyncAction.js';

export type TogglePolicy = 'optimistic' | 'after-success';
export type ToggleTransactionStatus = 'idle' | 'pending' | 'success' | 'error' | 'cancelled';
export type ToggleRequest = (
  value: boolean,
  options: {signal: AbortSignal; delay: number; fail: boolean},
) => Promise<boolean>;

interface TransactionState {
  committedValue: boolean;
  pendingValue: boolean | null;
  failedValue: boolean | null;
  status: ToggleTransactionStatus;
  failNext: boolean;
}

interface ToggleTransactionOptions {
  policy: TogglePolicy;
  initialValue?: boolean;
  delay?: number;
  /** An injectable adapter makes the stale-result guarantee testable. */
  request?: ToggleRequest;
}

const localRequest: ToggleRequest = (value, options) => simulateRequest(value, options);

/**
 * One owner per toggle, not one owner per comparison panel.
 * Committed state changes only on a current successful result. The optimistic
 * display is derived from the pending intent, so failure/cancel always rolls
 * back to the last committed value, including when that value was already on.
 */
export function useToggleTransaction({
  policy,
  initialValue = false,
  delay = 700,
  request = localRequest,
}: ToggleTransactionOptions) {
  const [state, setState] = useState<TransactionState>(() => ({
    committedValue: initialValue,
    pendingValue: null,
    failedValue: null,
    status: 'idle',
    failNext: false,
  }));
  const stateRef = useRef(state);
  const mounted = useRef(true);
  const generation = useRef(0);
  const active = useRef<{id: number; controller: AbortController} | null>(null);
  const configuration = useRef({delay, request});
  configuration.current = {delay, request};

  // Update the synchronous snapshot too: several events may occur before a render.
  const publish = useCallback((next: TransactionState) => {
    stateRef.current = next;
    if (mounted.current) setState(next);
  }, []);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      generation.current += 1;
      const previous = active.current;
      active.current = null;
      previous?.controller.abort();
    };
  }, []);

  const start = useCallback(async (target: boolean): Promise<boolean | undefined> => {
    // This guard is synchronous; aria-disabled alone does not prevent duplicates.
    if (!mounted.current || active.current) return undefined;
    const controller = new AbortController();
    const id = ++generation.current;
    active.current = {id, controller};
    const fail = stateRef.current.failNext;
    const settings = configuration.current;
    publish({...stateRef.current, pendingValue: target, failedValue: null, status: 'pending', failNext: false});
    try {
      const result = await settings.request(target, {signal: controller.signal, delay: settings.delay, fail});
      if (!mounted.current || id !== generation.current || controller.signal.aborted) return undefined;
      publish({...stateRef.current, committedValue: result, pendingValue: null, failedValue: null, status: 'success'});
      return result;
    } catch {
      if (mounted.current && id === generation.current && !controller.signal.aborted) {
        publish({...stateRef.current, pendingValue: null, failedValue: target, status: 'error'});
      }
      return undefined;
    } finally {
      // An old completion must never unlock a newer in-flight operation.
      if (active.current?.id === id) active.current = null;
    }
  }, [publish]);

  const toggle = useCallback(() => start(!stateRef.current.committedValue), [start]);
  const retry = useCallback(() => {
    const snapshot = stateRef.current;
    if (snapshot.status !== 'error' || snapshot.failedValue === null) return Promise.resolve(undefined);
    return start(snapshot.failedValue);
  }, [start]);
  const cancel = useCallback(() => {
    const previous = active.current;
    if (!previous || !mounted.current) return false;
    // Invalidate before abort: adapters are allowed to ignore AbortSignal.
    generation.current += 1;
    active.current = null;
    previous.controller.abort();
    publish({...stateRef.current, pendingValue: null, failedValue: null, status: 'cancelled'});
    return true;
  }, [publish]);
  const setFailNext = useCallback((failNext: boolean) => {
    if (mounted.current) publish({...stateRef.current, failNext});
  }, [publish]);

  const pending = state.status === 'pending';
  const displayValue = policy === 'optimistic' && pending
    ? state.pendingValue ?? state.committedValue
    : state.committedValue;

  return {...state, displayValue, pending, toggle, retry, cancel, setFailNext};
}
