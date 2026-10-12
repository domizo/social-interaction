import {useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent} from 'react';
import {ActionIcon, actionLabels, socialActions, type SocialAction} from '../../lib/index.js';
import type {StudioConfig} from './config.js';
import './action-picker.css';

type ActionPickerProps = {
  config: StudioConfig;
  onChange: (config: StudioConfig) => void;
  locale: 'en' | 'ja';
  active?: boolean;
};
type ReorderSession = {
  action: SocialAction;
  source: StudioConfig;
  locale: 'en' | 'ja';
  order: StudioConfig['actions'];
  handle: HTMLButtonElement;
  mode: 'keyboard' | 'pointer';
  lifted: boolean;
  pointerId?: number;
  startX?: number;
  startY?: number;
  capture?: HTMLOListElement;
};
const DRAG_THRESHOLD = 6;

/** config.actions is the only committed order; a reorder session is a disposable preview. */
export function ActionPicker({config, onChange, locale, active = true}: ActionPickerProps) {
  const id = useId();
  const ja = locale === 'ja';
  const [notice, setNotice] = useState<{en: string; ja: string; revision: number} | null>(null);
  const [draft, setDraft] = useState<ReorderSession | null>(null);
  const session = useRef<ReorderSession | null>(null);
  const list = useRef<HTMLOListElement>(null);
  const scrollFrame = useRef<number | null>(null);
  const pointerPosition = useRef<{x: number; y: number} | null>(null);
  const restoreFocus = useRef<HTMLButtonElement | null>(null);
  const revealFocus = useRef(false);
  const count = config.actions.length;
  const currentDraft = active && draft?.source === config && draft.locale === locale ? draft : null;
  const order = currentDraft?.order ?? config.actions;

  function announce(en: string, japanese: string) {
    setNotice(previous => ({en, ja: japanese, revision: (previous?.revision ?? 0) + 1}));
  }

  function release(current: ReorderSession) {
    if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current);
    scrollFrame.current = null;
    pointerPosition.current = null;
    // Capture belongs to the stable list, not a keyed handle that moves in the DOM.
    if (current.pointerId !== undefined && current.capture?.hasPointerCapture?.(current.pointerId)) {
      current.capture.releasePointerCapture(current.pointerId);
    }
  }

  function cancelReorder(focus = true) {
    const current = session.current;
    if (!current) return;
    session.current = null;
    if (focus) {
      restoreFocus.current = current.handle;
      revealFocus.current = current.mode === 'keyboard';
    }
    setDraft(null);
    release(current);
    if (current.lifted) announce('Reordering cancelled. Order unchanged.', '並べ替えをキャンセルしました。順番は変更されていません。');
  }

  // Incoming imports, presets, tokens, locale and panel changes invalidate a draft.
  useLayoutEffect(() => {
    const current = session.current;
    if (current && (!active || current.source !== config || current.locale !== locale)) cancelReorder(false);
  }, [config, locale, active]);

  // Moving keyed DOM nodes can blur their control in a real browser.
  useLayoutEffect(() => {
    const handle = restoreFocus.current;
    if (active && handle?.isConnected) {
      handle.focus({preventScroll: true});
      if (revealFocus.current) handle.scrollIntoView?.({block: 'nearest', inline: 'nearest', behavior: 'instant'});
    }
    restoreFocus.current = null;
    revealFocus.current = false;
  }, [config.actions, draft, active]);

  useEffect(() => {
    function escape(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape' && session.current) {
        event.preventDefault();
        cancelReorder();
      }
    }
    function leaveWindow() { cancelReorder(false); }
    function visibilityChange() { if (document.hidden) leaveWindow(); }
    window.addEventListener('keydown', escape, true);
    window.addEventListener('blur', leaveWindow);
    document.addEventListener('visibilitychange', visibilityChange);
    return () => {
      window.removeEventListener('keydown', escape, true);
      window.removeEventListener('blur', leaveWindow);
      document.removeEventListener('visibilitychange', visibilityChange);
      const current = session.current;
      session.current = null;
      if (current) release(current);
    };
  }, []);

  function setSession(current: ReorderSession) {
    session.current = current;
    setDraft(current);
  }

  function announcePickup(current: ReorderSession) {
    const index = current.order.findIndex(item => item.action === current.action);
    const label = current.order[index].label;
    announce(
      `${label.en} picked up, position ${index + 1} of ${count}. ${current.mode === 'keyboard' ? 'Use arrow keys to move, Space or Enter to drop, Escape to cancel.' : 'Drag to a new position. Release to drop, Escape to cancel.'}`,
      `${label.ja}を選択しました。${count}個中${index + 1}番目。${current.mode === 'keyboard' ? '矢印キーで移動、スペースかEnterで確定、Escapeでキャンセル。' : 'ドラッグで移動、離すと確定、Escapeでキャンセル。'}`,
    );
  }

  function previewMove(destination: number) {
    const current = session.current;
    if (!current?.lifted) return;
    const index = current.order.findIndex(item => item.action === current.action);
    const target = Math.max(0, Math.min(current.order.length - 1, destination));
    if (index === target) return;
    const nextOrder = [...current.order];
    const [item] = nextOrder.splice(index, 1);
    nextOrder.splice(target, 0, item);
    restoreFocus.current = current.handle;
    revealFocus.current = current.mode === 'keyboard';
    setSession({...current, order: nextOrder});
    announce(
      `${item.label.en}, position ${target + 1} of ${count}. Not saved until dropped.`,
      `${item.label.ja}、${count}個中${target + 1}番目。確定するまで保存されません。`,
    );
  }

  function dropReorder() {
    const current = session.current;
    if (!current) return;
    if (!active || current.source !== config || current.locale !== locale) {
      cancelReorder(false);
      return;
    }
    session.current = null;
    setDraft(null);
    restoreFocus.current = current.handle;
    revealFocus.current = current.mode === 'keyboard';
    release(current);
    if (!current.lifted) return;
    const index = current.order.findIndex(item => item.action === current.action);
    const label = current.order[index].label;
    if (current.order.some((item, position) => item !== config.actions[position])) {
      onChange({...config, actions: current.order});
    }
    announce(
      `${label.en} dropped at position ${index + 1} of ${count}.`,
      `${label.ja}を${count}個中${index + 1}番目に確定しました。`,
    );
  }

  function keyboardPickup(action: SocialAction, handle: HTMLButtonElement) {
    if (!active || count < 2) return;
    cancelReorder(false);
    const current: ReorderSession = {action, source: config, locale, order: config.actions, handle, mode: 'keyboard', lifted: true};
    restoreFocus.current = handle;
    revealFocus.current = true;
    setSession(current);
    announcePickup(current);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, action: SocialAction) {
    const current = session.current;
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (event.repeat) return;
      if (current?.mode === 'keyboard' && current.action === action) dropReorder();
      else if (!current) keyboardPickup(action, event.currentTarget);
      return;
    }
    if (!current || current.mode !== 'keyboard' || current.action !== action) return;
    const index = current.order.findIndex(item => item.action === action);
    const destination = {ArrowUp: index - 1, ArrowLeft: index - 1, ArrowDown: index + 1, ArrowRight: index + 1, Home: 0, End: count - 1}[event.key];
    if (destination !== undefined) {
      event.preventDefault();
      previewMove(destination);
    } else if (event.key === 'Tab') cancelReorder(false);
  }

  function pointerPickup(event: PointerEvent<HTMLButtonElement>, action: SocialAction) {
    if (!active || count < 2 || event.button !== 0 || event.isPrimary === false || session.current || !list.current) return;
    event.preventDefault();
    event.currentTarget.focus({preventScroll: true});
    const current: ReorderSession = {
      action, source: config, locale, order: config.actions, handle: event.currentTarget,
      mode: 'pointer', lifted: false, pointerId: event.pointerId,
      startX: event.clientX, startY: event.clientY, capture: list.current,
    };
    try { list.current.setPointerCapture?.(event.pointerId); } catch { return; }
    setSession(current);
  }

  function previewPointerPosition(x: number, y: number) {
    const current = session.current;
    if (!current?.lifted) return;
    // Measure real rows, so custom wrapping labels and multi-column layouts work.
    let destination = current.order.findIndex(item => item.action === current.action);
    let distance = Infinity;
    Array.from(list.current?.children ?? []).forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      const dx = Math.max(rect.left - x, 0, x - rect.right);
      const dy = Math.max(rect.top - y, 0, y - rect.bottom);
      const nextDistance = dx * dx + dy * dy;
      if (nextDistance < distance) { distance = nextDistance; destination = index; }
    });
    previewMove(destination);
  }

  function scrollWhileDragging() {
    scrollFrame.current = null;
    const current = session.current;
    const point = pointerPosition.current;
    if (!current?.lifted || current.mode !== 'pointer' || !point || !list.current) return;
    const bounds = list.current.getBoundingClientRect();
    // Handle-only edge scrolling lets touch users reach all 12 rows. The page's
    // normal scroll gestures outside a handle remain completely untouched.
    if (point.x >= bounds.left - 44 && point.x <= bounds.right + 44) {
      const edge = 48;
      const down = bounds.bottom > innerHeight && point.y > innerHeight - edge;
      const up = bounds.top < 0 && point.y < edge;
      const delta = down ? Math.min(12, (point.y - innerHeight + edge) / 3) : up ? -Math.min(12, (edge - point.y) / 3) : 0;
      if (delta) {
        window.scrollBy({top: delta, behavior: 'instant'});
        previewPointerPosition(point.x, point.y);
      }
    }
    scrollFrame.current = requestAnimationFrame(scrollWhileDragging);
  }

  function pointerMove(event: PointerEvent<HTMLOListElement>) {
    let current = session.current;
    if (!current || current.mode !== 'pointer' || current.pointerId !== event.pointerId) return;
    if (!current.lifted) {
      if (Math.hypot(event.clientX - current.startX!, event.clientY - current.startY!) < DRAG_THRESHOLD) return;
      current = {...current, lifted: true};
      setSession(current);
      announcePickup(current);
    }
    event.preventDefault();
    pointerPosition.current = {x: event.clientX, y: event.clientY};
    previewPointerPosition(event.clientX, event.clientY);
    if (scrollFrame.current === null) scrollFrame.current = requestAnimationFrame(scrollWhileDragging);
  }

  function toggle(action: SocialAction) {
    cancelReorder(false);
    const included = config.actions.some(item => item.action === action);
    if (included && count === 1) {
      announce('Keep at least one icon selected.', 'アイコンを1つ以上選んでください。');
      return;
    }
    if (!included && count >= socialActions.length) {
      announce('You can select up to 12 icons.', '選べるアイコンは最大12個です。');
      return;
    }
    const actions = included
      ? config.actions.filter(item => item.action !== action)
      : [...config.actions, {action, label: {...actionLabels[action]}}];
    onChange({...config, actions});
    if (actions.length === socialActions.length) {
      announce('All 12 icons selected. Maximum 12.', '12個すべてを選択しました。最大12個です。');
    } else {
      announce(
        `${actionLabels[action].en} ${included ? 'removed' : 'added'}. ${actions.length} of 12 icons selected.`,
        `${actionLabels[action].ja}を${included ? '外しました' : '追加しました'}。12個中${actions.length}個を選択中。`,
      );
    }
  }

  function move(action: SocialAction, direction: -1 | 1, button: HTMLButtonElement) {
    cancelReorder(false);
    const index = config.actions.findIndex(item => item.action === action);
    const destination = index + direction;
    if (index < 0) return;
    if (destination < 0 || destination >= count) {
      announce(
        `${actionLabels[action].en} is already ${direction === -1 ? 'first' : 'last'}.`,
        `${actionLabels[action].ja}はすでに${direction === -1 ? '先頭' : '最後'}です。`,
      );
      return;
    }
    const actions = [...config.actions];
    [actions[index], actions[destination]] = [actions[destination], actions[index]];
    restoreFocus.current = button;
    onChange({...config, actions});
    announce(
      `${actionLabels[action].en} moved to position ${destination + 1} of ${count}.`,
      `${actionLabels[action].ja}を${count}個中${destination + 1}番目に移動しました。`,
    );
  }

  return <section className="studio-action-picker" aria-labelledby={`${id}-title`} lang={locale}>
    <div className="action-picker-heading">
      <h3 id={`${id}-title`}>{ja ? '試すアイコンを選ぶ' : 'Choose icons to test'}</h3>
      <span className="action-picker-count">{ja ? `${count} / 12 個` : `${count} / 12 selected`}</span>
    </div>
    <p id={`${id}-help`} className="action-picker-help">
      {ja ? '1〜12個を選択。選んだアイコンと順番が、プレビューと書き出しに反映されます。' : 'Choose 1–12 icons. Your selection and order update the previews and exports.'}
    </p>
    <fieldset className="action-picker-options" aria-describedby={`${id}-help`}>
      <legend className="action-picker-sr-only">{ja ? '表示するアイコン' : 'Included icons'}</legend>
      {socialActions.map(action => {
        const included = config.actions.some(item => item.action === action);
        return <label key={action} className="action-picker-option" data-included={included}>
          <input type="checkbox" checked={included}
            aria-disabled={included && count === 1 || !included && count >= socialActions.length || undefined}
            onChange={() => toggle(action)}/>
          <span className="action-picker-glyph"><ActionIcon action={action}/></span>
          <span className="action-picker-name">{actionLabels[action][locale]}</span>
        </label>;
      })}
    </fieldset>
    <div className="action-picker-order-heading">
      <h4 id={`${id}-order`}>{ja ? '表示する順番' : 'Preview order'}</h4>
      <span>{ja ? 'ハンドルをドラッグして並べ替え' : 'Drag the handle to reorder'}</span>
    </div>
    <p className="action-picker-sr-only" id={`${id}-drag-help`}>
      {ja ? 'スペースかEnterで選択。矢印キーで移動、Homeで先頭、Endで最後へ。スペースかEnterで確定、Escapeでキャンセル。' : 'Press Space or Enter to pick up. Use arrow keys to move, Home for first, End for last. Space or Enter drops; Escape cancels.'}
    </p>
    <ol ref={list} className="action-picker-order" aria-labelledby={`${id}-order`} data-reordering={currentDraft?.lifted || undefined}
      onPointerMove={pointerMove}
      onPointerUp={event => {if (session.current?.pointerId === event.pointerId) dropReorder();}}
      onPointerCancel={event => {if (session.current?.pointerId === event.pointerId) cancelReorder();}}
      onLostPointerCapture={event => {if (session.current?.pointerId === event.pointerId) cancelReorder();}}>
      {order.map((item, index) => <li key={item.action} data-action={item.action} data-dragging={currentDraft?.lifted && currentDraft.action === item.action || undefined}>
        <span className="action-picker-ordered-name">
          <span className="action-picker-position" aria-hidden="true">{index + 1}</span>
          <span className="action-picker-glyph"><ActionIcon action={item.action}/></span>
          <span className="action-picker-name">{item.label[locale]}</span>
        </span>
        <span className="action-picker-sr-only" id={`${id}-position-${item.action}`}>{ja ? `${count}個中${index + 1}番目` : `Position ${index + 1} of ${count}`}</span>
        <button type="button" className="action-picker-drag-handle"
          aria-label={ja ? `${item.label.ja}を並べ替え` : `Reorder ${item.label.en}`}
          aria-describedby={`${id}-position-${item.action} ${id}-drag-help`}
          aria-pressed={!!(currentDraft?.lifted && currentDraft.action === item.action)}
          aria-disabled={count < 2 || undefined}
          onPointerDown={event => pointerPickup(event, item.action)}
          onKeyDown={event => handleKeyDown(event, item.action)}
          onBlur={event => {if (session.current?.mode === 'keyboard' && event.relatedTarget && event.relatedTarget !== event.currentTarget) cancelReorder(false);}}
          onClick={event => {
            // Assistive technology can activate a button without a keyboard event.
            if (event.detail === 0) {
              if (session.current?.mode === 'keyboard' && session.current.action === item.action) dropReorder();
              else if (!session.current) keyboardPickup(item.action, event.currentTarget);
            }
          }}>
          <svg viewBox="0 0 16 20" width="16" height="20" aria-hidden="true" focusable="false">
            {[4, 10, 16].flatMap(y => [5, 11].map(x => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.5" fill="currentColor"/>))}
          </svg>
        </button>
      </li>)}
    </ol>
    <details className="action-picker-alternative action-picker-order-options">
      <summary>{ja ? 'ドラッグせずに並べ替える' : 'Reorder without dragging'}</summary>
      <div className="action-picker-alternative-controls">
        {config.actions.map((item, index) => <div className="action-picker-alternative-row" key={item.action}>
          <span className="action-picker-name">{actionLabels[item.action][locale]}</span>
          <span className="action-picker-move">
            <button type="button" aria-disabled={index === 0 || undefined}
              aria-label={ja ? `${actionLabels[item.action].ja}を前へ` : `Move ${actionLabels[item.action].en} earlier`}
              onClick={event => move(item.action, -1, event.currentTarget)}>{ja ? '前へ' : 'Earlier'}</button>
            <button type="button" aria-disabled={index === count - 1 || undefined}
              aria-label={ja ? `${actionLabels[item.action].ja}を後ろへ` : `Move ${actionLabels[item.action].en} later`}
              onClick={event => move(item.action, 1, event.currentTarget)}>{ja ? '後ろへ' : 'Later'}</button>
          </span>
        </div>)}
      </div>
    </details>
    <p className="action-picker-status" role="status" aria-live="polite" aria-atomic="true">
      {notice && <span key={notice.revision}>{notice[locale]}</span>}
    </p>
  </section>;
}
