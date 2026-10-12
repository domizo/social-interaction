import {useId, useLayoutEffect, useRef, useState} from 'react';
import {ActionIcon, actionLabels, socialActions, type SocialAction} from '../../lib/index.js';
import type {StudioConfig} from './config.js';
import './action-picker.css';

type ActionPickerProps = {
  config: StudioConfig;
  onChange: (config: StudioConfig) => void;
  locale: 'en' | 'ja';
};

/** The shared configuration is the only source of truth for inclusion and order. */
export function ActionPicker({config, onChange, locale}: ActionPickerProps) {
  const id = useId();
  const ja = locale === 'ja';
  const [notice, setNotice] = useState<{en: string; ja: string; revision: number} | null>(null);
  const restoreFocus = useRef<HTMLButtonElement | null>(null);
  const count = config.actions.length;

  // Moving keyed DOM nodes can blur the initiating control in a real browser.
  // Keep edge controls focusable, too, even when that direction is unavailable.
  useLayoutEffect(() => {
    restoreFocus.current?.focus({preventScroll: true});
    restoreFocus.current = null;
  }, [config.actions]);

  function announce(en: string, japanese: string) {
    setNotice(previous => ({en, ja: japanese, revision: (previous?.revision ?? 0) + 1}));
  }

  function toggle(action: SocialAction) {
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
          <input
            type="checkbox"
            checked={included}
            aria-disabled={included && count === 1 || !included && count >= socialActions.length || undefined}
            onChange={() => toggle(action)}
          />
          <span className="action-picker-glyph"><ActionIcon action={action}/></span>
          <span className="action-picker-name">{actionLabels[action][locale]}</span>
        </label>;
      })}
    </fieldset>
    <div className="action-picker-order-heading">
      <h4 id={`${id}-order`}>{ja ? '表示する順番' : 'Preview order'}</h4>
      <span>{ja ? '前へ・後ろへで並べ替え' : 'Move icons earlier or later'}</span>
    </div>
    <ol className="action-picker-order" aria-labelledby={`${id}-order`}>
      {config.actions.map((item, index) => <li key={item.action} data-action={item.action}>
        <span className="action-picker-ordered-name">
          <span className="action-picker-position" aria-hidden="true">{index + 1}</span>
          <span className="action-picker-glyph"><ActionIcon action={item.action}/></span>
          <span className="action-picker-name">{item.label[locale]}</span>
        </span>
        <span className="action-picker-move">
          <button type="button" aria-disabled={index === 0 || undefined}
            aria-label={ja ? `${actionLabels[item.action].ja}を前へ` : `Move ${actionLabels[item.action].en} earlier`}
            onClick={event => move(item.action, -1, event.currentTarget)}>{ja ? '前へ' : 'Earlier'}</button>
          <button type="button" aria-disabled={index === count - 1 || undefined}
            aria-label={ja ? `${actionLabels[item.action].ja}を後ろへ` : `Move ${actionLabels[item.action].en} later`}
            onClick={event => move(item.action, 1, event.currentTarget)}>{ja ? '後ろへ' : 'Later'}</button>
        </span>
      </li>)}
    </ol>
    <p className="action-picker-status" role="status" aria-live="polite" aria-atomic="true">
      {notice && <span key={notice.revision}>{notice[locale]}</span>}
    </p>
  </section>;
}
