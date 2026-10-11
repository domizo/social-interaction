import {actionLabels, defaultTokens, defaultMotionTokens, socialActions, tokenBounds} from '../../lib/index.js';
import type {SocialAction, SocialVariant, SocialTokens, IconMotion, IconMotionTokens} from '../../lib/index.js';

export type StudioConfig = {
  schemaVersion: 1;
  context: 'feed' | 'article' | 'chat';
  variant: SocialVariant;
  actions: Array<{action: SocialAction; label: {en: string; ja: string}}>;
  tokens: SocialTokens;
  iconMotion: IconMotion;
  motionTokens: IconMotionTokens;
};
export const MAX_CONFIG_BYTES = 64 * 1024;
export const PRESET_STORAGE_KEY = 'social-interaction-lab:studio-presets:v1';
export const MAX_PRESETS = 20;
export type StudioPreset = {name: string; config: StudioConfig};

export const defaultStudioConfig: StudioConfig = {
  schemaVersion: 1,
  context: 'feed',
  variant: 'spring',
  actions: (['like', 'comment', 'share', 'quote'] as const).map(action => ({action, label: {...actionLabels[action]}})),
  tokens: {...defaultTokens},
  iconMotion: 'cartoon',
  motionTokens: {...defaultMotionTokens},
};

export class StudioConfigError extends Error {
  constructor(message: string) { super(message); this.name = 'StudioConfigError'; }
}
function fail(path: string, reason: string): never { throw new StudioConfigError(`${path}: ${reason}`); }
function byteLength(value: string): number {
  let size = 0;
  for (const character of value) {
    const code = character.codePointAt(0)!;
    size += code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4;
    if (size > MAX_CONFIG_BYTES) break;
  }
  return size;
}
function jsonInput(input: unknown, path: string): unknown {
  if (typeof input !== 'string') return input;
  if (input.length > MAX_CONFIG_BYTES || byteLength(input) > MAX_CONFIG_BYTES) fail(path, 'JSON must be at most 64 KB');
  try { return JSON.parse(input); } catch { return fail(path, 'invalid JSON'); }
}
/** Read only plain data descriptors. Never invoke an imported getter or toJSON method. */
function object(input: unknown, keys: readonly string[], path: string): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.getPrototypeOf(input) !== Object.prototype) fail(path, 'expected a plain object');
  const descriptors = Object.getOwnPropertyDescriptors(input);
  const ownKeys = Reflect.ownKeys(descriptors);
  if (ownKeys.length !== keys.length || ownKeys.some(key => typeof key !== 'string' || !keys.includes(key))) fail(path, 'missing or unknown property');
  const result: Record<string, unknown> = Object.create(null);
  for (const key of keys) {
    const descriptor = descriptors[key];
    if (!descriptor || !('value' in descriptor) || !descriptor.enumerable) fail(`${path}.${key}`, 'expected a data property');
    result[key] = descriptor.value;
  }
  return result;
}
function boundedText(input: unknown, max: number, path: string): string {
  if (typeof input !== 'string' || input.length < 1 || input.length > max || !input.trim() || /[\u0000-\u001f\u007f]/.test(input)) fail(path, `expected 1–${max} characters without control characters`);
  return input;
}
function choice<T extends string>(input: unknown, choices: readonly T[], path: string): T {
  if (typeof input !== 'string' || !choices.includes(input as T)) fail(path, 'unsupported value');
  return input as T;
}
function number(input: unknown, min: number, max: number, path: string): number {
  if (typeof input !== 'number' || !Number.isFinite(input) || input < min || input > max) fail(path, `expected a finite number from ${min} to ${max}`);
  return input;
}
function dataArray(input: unknown, min: number, max: number, path: string): unknown[] {
  if (!Array.isArray(input) || Object.getPrototypeOf(input) !== Array.prototype || input.length < min || input.length > max) fail(path, `expected ${min}–${max} entries`);
  const descriptors = Object.getOwnPropertyDescriptors(input);
  const keys = Reflect.ownKeys(descriptors);
  if (keys.length !== input.length + 1) fail(path, 'unexpected array properties');
  const values: unknown[] = [];
  for (let i = 0; i < input.length; i++) {
    const descriptor = descriptors[String(i)];
    if (!descriptor || !('value' in descriptor) || !descriptor.enumerable) fail(path, 'expected plain array entries');
    values.push(descriptor.value);
  }
  return values;
}

/** Strict, transactional import: returns a fresh validated object, or throws without changing the input. */
export function parseStudioConfig(input: unknown): StudioConfig {
  const root = object(jsonInput(input, 'config'), ['schemaVersion', 'context', 'variant', 'actions', 'tokens', 'iconMotion', 'motionTokens'], 'config');
  if (root.schemaVersion !== 1) fail('schemaVersion', 'only version 1 is supported');
  const seen = new Set<string>();
  const actions = dataArray(root.actions, 1, 12, 'actions').map((entry, index) => {
    const row = object(entry, ['action', 'label'], `actions[${index}]`);
    const action = choice(row.action, socialActions, `actions[${index}].action`);
    if (seen.has(action)) fail('actions', 'each action must be unique');
    seen.add(action);
    const labels = object(row.label, ['en', 'ja'], `actions[${index}].label`);
    return {action, label: {en: boundedText(labels.en, 80, `${action}.en`), ja: boundedText(labels.ja, 80, `${action}.ja`)}};
  });
  const rawTokens = object(root.tokens, [...Object.keys(tokenBounds), 'accent'], 'tokens');
  const numericTokens = {} as Omit<SocialTokens, 'accent'>;
  for (const key of Object.keys(tokenBounds) as (keyof typeof tokenBounds)[]) {
    const [min, max] = tokenBounds[key];
    numericTokens[key] = number(rawTokens[key], min, max, `tokens.${key}`);
  }
  if (typeof rawTokens.accent !== 'string' || !/^#[\da-f]{6}$/i.test(rawTokens.accent)) fail('tokens.accent', 'expected a six-digit hex color');
  const motion = object(root.motionTokens, ['duration', 'intensity', 'stagger'], 'motionTokens');
  const result: StudioConfig = {
    schemaVersion: 1,
    context: choice(root.context, ['feed', 'article', 'chat'], 'context'),
    variant: choice(root.variant, ['minimal', 'soft', 'solid', 'spring'], 'variant'),
    actions,
    tokens: {...numericTokens, accent: rawTokens.accent},
    iconMotion: choice(root.iconMotion, ['none', 'pulse', 'spring', 'trace', 'gesture', 'cartoon'], 'iconMotion'),
    motionTokens: {
      duration: number(motion.duration, 0, 1600, 'motionTokens.duration'),
      intensity: number(motion.intensity, 0, 2, 'motionTokens.intensity'),
      stagger: number(motion.stagger, 0, 160, 'motionTokens.stagger'),
    },
  };
  if (byteLength(JSON.stringify(result)) > MAX_CONFIG_BYTES) fail('config', 'JSON must be at most 64 KB');
  return result;
}

export function parsePresetCollection(input: unknown): StudioPreset[] {
  const root = object(jsonInput(input, 'presets'), ['schemaVersion', 'presets'], 'presets');
  if (root.schemaVersion !== 1) fail('presets.schemaVersion', 'only version 1 is supported');
  const names = new Set<string>();
  return dataArray(root.presets, 0, MAX_PRESETS, 'presets').map((entry, index) => {
    const row = object(entry, ['name', 'config'], `presets[${index}]`);
    const name = boundedText(row.name, 60, `presets[${index}].name`).trim();
    if (names.has(name.toLowerCase())) fail('presets', 'duplicate preset names');
    names.add(name.toLowerCase());
    return {name, config: parseStudioConfig(row.config)};
  });
}
export function serializePresets(presets: StudioPreset[]): string {
  const result = JSON.stringify({schemaVersion: 1, presets: parsePresetCollection({schemaVersion: 1, presets})});
  if (byteLength(result) > MAX_CONFIG_BYTES) fail('presets', 'saved presets must total at most 64 KB');
  return result;
}
function literal(value: unknown): string {
  return JSON.stringify(value, null, 2).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

/** Complete TSX module. All imported strings remain JSON string literals, never executable expressions. */
export function generateReactUsage(input: StudioConfig, locale: 'en' | 'ja'): string {
  const config = parseStudioConfig(input);
  choice(locale, ['en', 'ja'], 'locale');
  const text = locale === 'ja' ? {
    title: {feed: 'フィードの操作', article: '記事の操作', chat: 'チャットの操作'}[config.context],
    note: 'ローカルデモ：操作はこの画面内だけに保存されます。外部への投稿や送信は行いません。',
    compose: 'テキストを入力', save: 'この画面に保存', close: '閉じる', share: '共有オプション',
    prepare: '共有内容をこの画面に保存', copy: 'ページのリンクをコピー', copied: 'ページのリンクをコピーしました',
    fallback: 'コピーできませんでした。以下のリンクを選択してコピーしてください',
    history: 'この画面の操作履歴', saved: 'この画面に保存しました', enabled: 'オン', disabled: 'オフ', error: 'コールバックでエラーが発生しました',
  } : {
    title: {feed: 'Feed actions', article: 'Article actions', chat: 'Chat actions'}[config.context],
    note: 'Local demo: changes stay in this mounted component. Nothing is posted or sent to a service.',
    compose: 'Write your text', save: 'Save in this demo', close: 'Close', share: 'Share options',
    prepare: 'Prepare a local share', copy: 'Copy page link', copied: 'Page link copied',
    fallback: 'Clipboard unavailable. Select and copy the link below',
    history: 'Local activity', saved: 'Saved in this demo', enabled: 'on', disabled: 'off', error: 'The command callback failed',
  };
  return `// Save as SocialActions.tsx in a React + TypeScript app.
// Install the downloaded @social-interaction-lab/react package and React first.
// Mount with <SocialActions />. onCommand is an optional integration callback.
// Configuration and labels are exported; transient selections and activity start fresh.
// Manual reduced-motion preview is not exported; ActionButton honors the device OS preference.
import {useEffect, useId, useRef, useState} from 'react';
import {ActionBar, ActionButton, isToggleAction, type SocialAction} from '@social-interaction-lab/react';
import '@social-interaction-lab/react/styles.css';

export const studioConfig = ${literal(config)} as const;
const locale = ${literal(locale)} as const;
const words = ${literal(text)};
const configuredActions: ReadonlyArray<{action: SocialAction; label: {readonly en: string; readonly ja: string}}> = studioConfig.actions;
export type StudioCommand = {action: SocialAction; selected?: boolean; text?: string; destination?: 'local' | 'clipboard'};
export type SocialActionsProps = {onCommand?: (command: StudioCommand) => void};

export default function SocialActions({onCommand}: SocialActionsProps = {}) {
  const [selected, setSelected] = useState<Partial<Record<SocialAction, boolean>>>({});
  const [composer, setComposer] = useState<SocialAction | null>(null);
  const [draft, setDraft] = useState('');
  const [shareOpen, setShareOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [fallbackLink, setFallbackLink] = useState('');
  const [activity, setActivity] = useState<string[]>([]);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const shareMenu = useRef<HTMLDivElement>(null);
  const shareTrigger = useRef<HTMLButtonElement | null>(null);
  const composerTrigger = useRef<HTMLButtonElement | null>(null);
  const shareStart = useRef<'first' | 'last'>('first');
  const id = useId();
  const label = (action: SocialAction) => configuredActions.find(item => item.action === action)?.label[locale] ?? action;

  useEffect(() => { if (composer) textarea.current?.focus(); }, [composer]);
  useEffect(() => {
    if (!shareOpen) return;
    const items = shareMenu.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');
    items?.[shareStart.current === 'last' ? items.length - 1 : 0]?.focus();
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Node && !shareMenu.current?.contains(event.target) && !shareTrigger.current?.contains(event.target)) setShareOpen(false);
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [shareOpen]);

  function notify(command: StudioCommand, detail: string) {
    setActivity(previous => [detail, ...previous].slice(0, 8));
    setMessage(detail);
    try { onCommand?.(command); } catch { setMessage(words.error); }
  }
  function closeComposer() {
    setComposer(null);
    setDraft('');
    composerTrigger.current?.focus();
  }
  function closeShare() { setShareOpen(false); shareTrigger.current?.focus(); }
  async function copyLink() {
    const url = window.location.href;
    closeShare();
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(url);
      setFallbackLink('');
      notify({action: 'share', destination: 'clipboard', text: url}, words.copied);
    } catch { setFallbackLink(url); setMessage(words.fallback); }
  }

  return <section lang={locale} data-context={studioConfig.context} style={{maxWidth: 720, padding: 24, fontFamily: 'system-ui, sans-serif', overflowWrap: 'anywhere'}} aria-labelledby={id + '-title'}>
    <h2 id={id + '-title'}>{words.title}</h2>
    <p>{words.note}</p>
    <ActionBar label={words.title} tokens={studioConfig.tokens}>
      {configuredActions.map(item => <ActionButton
        key={item.action} action={item.action} label={item.label[locale]}
        variant={studioConfig.variant} tokens={studioConfig.tokens}
        style={{maxWidth: '100%', boxSizing: 'border-box', whiteSpace: 'normal', overflowWrap: 'anywhere'}}
        iconMotion={studioConfig.iconMotion} motionTokens={studioConfig.motionTokens}
        selected={isToggleAction(item.action) ? !!selected[item.action] : undefined}
        aria-haspopup={item.action === 'share' ? 'menu' : undefined}
        aria-expanded={item.action === 'share' ? shareOpen : ['comment', 'quote', 'send'].includes(item.action) ? composer === item.action : undefined}
        aria-controls={item.action === 'share' && shareOpen ? id + '-share' : composer === item.action ? id + '-composer' : undefined}
        ref={item.action === 'share' ? shareTrigger : undefined}
        onKeyDown={event => {
          if (item.action === 'share' && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
            event.preventDefault(); shareStart.current = event.key === 'ArrowUp' ? 'last' : 'first'; setShareOpen(true);
          }
        }}
        onClick={event => {
          if (isToggleAction(item.action)) {
            const next = !selected[item.action];
            setSelected(previous => ({...previous, [item.action]: next}));
            notify({action: item.action, selected: next}, item.label[locale] + ': ' + (next ? words.enabled : words.disabled));
          } else if (['comment', 'quote', 'send'].includes(item.action)) {
            composerTrigger.current = event.currentTarget;
            setDraft(''); setComposer(item.action); setShareOpen(false);
          } else if (item.action === 'share') {
            shareStart.current = 'first'; setShareOpen(previous => !previous);
          } else {
            notify({action: item.action, destination: 'local'}, item.label[locale] + ': ' + words.saved);
          }
        }}
      />)}
    </ActionBar>
    {shareOpen && <div ref={shareMenu} id={id + '-share'} role="menu" aria-label={words.share}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setShareOpen(false); }}
      onKeyDown={event => {
        const items = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'));
        const index = items.indexOf(document.activeElement as HTMLButtonElement);
        if (event.key === 'Escape') { event.preventDefault(); closeShare(); }
        if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
          event.preventDefault();
          const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
          items[next]?.focus();
        }
      }}>
      <button type="button" role="menuitem" tabIndex={-1} onClick={() => void copyLink()}>{words.copy}</button>
      <button type="button" role="menuitem" tabIndex={-1} onClick={() => { closeShare(); notify({action: 'share', destination: 'local'}, label('share') + ': ' + words.saved); }}>{words.prepare}</button>
    </div>}
    {composer && <form id={id + '-composer'} aria-label={label(composer)} onSubmit={event => {
      event.preventDefault();
      const text = draft.trim();
      if (!text) { textarea.current?.focus(); return; }
      notify({action: composer, text, destination: 'local'}, label(composer) + ': ' + text);
      closeComposer();
    }} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); closeComposer(); } }}>
      <label htmlFor={id + '-draft'}>{label(composer)} · {words.compose}</label>
      <textarea ref={textarea} id={id + '-draft'} value={draft} maxLength={2000} required rows={4} style={{display: 'block', width: '100%', boxSizing: 'border-box'}} onChange={event => setDraft(event.target.value)} />
      <button type="submit" disabled={!draft.trim()}>{words.save}</button>
      <button type="button" onClick={closeComposer}>{words.close}</button>
    </form>}
    <p role="status" aria-live="polite">{message}</p>
    {fallbackLink && <label>{words.fallback}<input aria-label={words.copy} readOnly value={fallbackLink} onFocus={event => event.currentTarget.select()} style={{width: '100%'}} /></label>}
    {activity.length > 0 && <section aria-label={words.history}><h3>{words.history}</h3><ul>{activity.map((entry, index) => <li key={index}>{entry}</li>)}</ul></section>}
  </section>;
}
`;
}
