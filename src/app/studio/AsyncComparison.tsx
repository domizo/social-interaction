import {useId, useLayoutEffect, useState} from 'react';
import {ActionButton,type ActionPresentation} from '../../lib/ActionButton.js';
import type {IconMotion, IconMotionTokens} from '../../lib/iconMotion.js';
import type {SocialTokens, SocialVariant} from '../../lib/tokens.js';
import {useToggleTransaction, type TogglePolicy} from './useToggleTransaction.js';
import {motionForAction, type StudioConfig} from './config.js';
import './async.css';

export interface AsyncComparisonProps {
  tokens: SocialTokens;
  variant: SocialVariant;
  iconMotion: IconMotion;
  motionOverrides?: StudioConfig['motionOverrides'];
  motionTokens: IconMotionTokens;
  locale: 'en' | 'ja';
  reducedMotion: boolean;
  presentation?: ActionPresentation;
  active?: boolean;
}

const copy = {
  en: {
    title: 'What changes while you wait?',
    intro: 'Two update policies. The same local request.',
    local: 'Local simulation · no network requests',
    latency: 'Simulated latency',
    settings: 'Latency is captured when a request starts.',
    optimistic: 'Optimistic',
    optimisticNote: 'Show the intent immediately. Roll back if it fails.',
    afterSuccess: 'After success',
    afterSuccessNote: 'Keep the confirmed value until the request succeeds.',
    like: 'Like', save: 'Save',
    displayed: 'Displayed', committed: 'Confirmed', on: 'On', off: 'Off',
    failNext: 'Fail next request', retry: 'Retry', cancel: 'Cancel',
    idle: 'Ready. No request in progress.',
    pendingOptimistic: 'Pending · displayed change is unconfirmed.',
    pendingConfirmed: 'Pending · still showing the confirmed value.',
    success: 'Succeeded · confirmed locally.',
    errorOptimistic: 'Failed · restored the last confirmed value. Retry is available.',
    errorConfirmed: 'Failed · confirmed value unchanged. Retry is available.',
    cancelled: 'Cancelled · kept the last confirmed value.',
    intentOn: 'Requested: On.', intentOff: 'Requested: Off.',
    policy: 'One request per action. Repeated clicks are ignored while pending; Like and Save run independently.',
    experiment: 'Try a reversal: confirm a toggle, click it again, then cancel. The previous confirmed value returns.',
    cancelNote: 'Cancel restores the last confirmed value and ignores late results. Cancel and Retry stay in place to preserve keyboard focus.',
  },
  ja: {
    title: '待っている間、何が変わる？',
    intro: '同じローカル処理で、2つの更新方法を比較。',
    local: 'ローカルのシミュレーション・通信なし',
    latency: '応答までの時間',
    settings: '処理開始時の待ち時間が適用されます。',
    optimistic: '楽観的に更新',
    optimisticNote: 'すぐに表示を更新。失敗したら元に戻す。',
    afterSuccess: '成功後に更新',
    afterSuccessNote: '処理が成功するまで、確定済みの表示を保つ。',
    like: 'いいね', save: '保存',
    displayed: '表示中', committed: '確定済み', on: 'オン', off: 'オフ',
    failNext: '次の処理を失敗させる', retry: '再試行', cancel: 'キャンセル',
    idle: '操作できます。処理は実行されていません。',
    pendingOptimistic: '処理中・表示の変更は未確定です。',
    pendingConfirmed: '処理中・確定済みの値を表示しています。',
    success: '成功・ローカルで確定しました。',
    errorOptimistic: '失敗・直前の確定値に戻しました。再試行できます。',
    errorConfirmed: '失敗・確定済みの値は変わりません。再試行できます。',
    cancelled: 'キャンセルしました。直前の確定値を保ちます。',
    intentOn: '変更先：オン。', intentOff: '変更先：オフ。',
    policy: '各操作は同時に1件まで。処理中の連打は無視され、いいねと保存はそれぞれ独立して動きます。',
    experiment: '反転を試す：操作を確定したら、もう一度押してキャンセル。直前の確定値に戻ります。',
    cancelNote: 'キャンセルで直前の確定値に戻り、遅れて届いた結果は無視します。キャンセルと再試行は同じ位置に残り、キーボードのフォーカスを保ちます。',
  },
} as const;

interface TransactionExampleProps extends AsyncComparisonProps {
  policy: TogglePolicy;
  action: 'like' | 'bookmark';
  delay: number;
}

function TransactionExample({policy, action, delay, locale, active = true, motionOverrides = {}, ...appearance}: TransactionExampleProps) {
  const transaction = useToggleTransaction({policy, delay});
  useLayoutEffect(() => {if (!active) transaction.cancel();}, [active, transaction.cancel]);
  const t = copy[locale];
  const id = useId();
  const label = action === 'like' ? t.like : t.save;
  const baseCount = action === 'like' ? 128 : 24;
  const displayCount = baseCount + Number(transaction.displayValue);
  const committedCount = baseCount + Number(transaction.committedValue);
  const policyName = policy === 'optimistic' ? t.optimistic : t.afterSuccess;
  const status = transaction.status === 'pending'
    ? `${policy === 'optimistic' ? t.pendingOptimistic : t.pendingConfirmed} ${transaction.pendingValue ? t.intentOn : t.intentOff}`
    : transaction.status === 'error'
      ? policy === 'optimistic' ? t.errorOptimistic : t.errorConfirmed
      : t[transaction.status];

  return <div className="async-example" role="group" aria-label={`${policyName}: ${label}`} data-status={transaction.status} data-action-example={action}>
    <div className="async-example-top">
      <ActionButton
        {...appearance}
        iconMotion={motionForAction({iconMotion: appearance.iconMotion, motionOverrides}, action)}
        reducedMotion={appearance.reducedMotion || !active}
        aria-disabled={!active || undefined}
        action={action}
        label={label}
        count={displayCount}
        selected={transaction.displayValue}
        pending={transaction.pending}
        error={transaction.status === 'error'}
        aria-describedby={`${id}-status ${id}-values`}
        onClick={() => {void transaction.toggle();}}
      />
      <span className="async-status-dot" aria-hidden="true"/>
    </div>
    <dl className="async-values" id={`${id}-values`}>
      <div data-value="displayed"><dt>{t.displayed}</dt><dd>{transaction.displayValue ? t.on : t.off}<span aria-hidden="true"> · </span><span>{displayCount}</span></dd></div>
      <div data-value="committed"><dt>{t.committed}</dt><dd>{transaction.committedValue ? t.on : t.off}<span aria-hidden="true"> · </span><span>{committedCount}</span></dd></div>
    </dl>
    <p className="async-status" id={`${id}-status`} role="status" aria-atomic="true">{status}</p>
    <div className="async-example-controls">
      <label className="async-fail-control"><input type="checkbox" checked={transaction.failNext} onChange={event => transaction.setFailNext(event.target.checked)}/><span>{t.failNext}</span></label>
      <div className="async-recovery-controls">
        <button type="button" aria-disabled={transaction.status !== 'error'} onClick={() => {if (active) void transaction.retry();}}>{t.retry}</button>
        <button type="button" aria-disabled={!transaction.pending} onClick={() => {transaction.cancel();}}>{t.cancel}</button>
      </div>
    </div>
  </div>;
}

/** A bounded, local-only exercise. Locale and visual controls never remount a transaction. */
export function AsyncComparison(props: AsyncComparisonProps) {
  const [delay, setDelay] = useState(700);
  const id = useId();
  const t = copy[props.locale];
  return <section className="async-comparison" aria-labelledby={`${id}-title`} data-reduced-motion={props.reducedMotion || props.active === false || undefined}>
    <div className="async-comparison-heading">
      <div><span className="async-eyebrow">{props.locale === 'en' ? 'ASYNC BEHAVIOR' : '非同期の動作'}</span><h2 id={`${id}-title`}>{t.title}</h2><p>{t.intro}</p></div>
      <label className="async-latency-control">{t.latency}<select value={delay} onChange={event => setDelay(Number(event.target.value))} aria-describedby={`${id}-settings`}><option value={0}>0 ms</option><option value={700}>700 ms</option><option value={1800}>1800 ms</option></select></label>
    </div>
    <div className="async-comparison-meta"><span>{t.local}</span><span id={`${id}-settings`}>{t.settings}</span></div>
    <div className="async-policy-grid">
      {(['optimistic', 'after-success'] as const).map((policy, index) => <article className="async-policy" key={policy} aria-labelledby={`${id}-${policy}`} data-policy={policy}>
        <header className="async-policy-heading"><span className="async-policy-index" aria-hidden="true">0{index + 1}</span><div><h3 id={`${id}-${policy}`}>{policy === 'optimistic' ? t.optimistic : t.afterSuccess}</h3><p>{policy === 'optimistic' ? t.optimisticNote : t.afterSuccessNote}</p></div></header>
        <TransactionExample {...props} policy={policy} action="like" delay={delay}/>
        <TransactionExample {...props} policy={policy} action="bookmark" delay={delay}/>
      </article>)}
    </div>
    <div className="async-comparison-foot"><p>{t.policy}</p><p className="async-experiment">{t.experiment}</p><details><summary>{props.locale === 'en' ? 'Cancellation & keyboard behavior' : 'キャンセルとキーボード操作'}</summary><p>{t.cancelNote}</p></details></div>
  </section>;
}
