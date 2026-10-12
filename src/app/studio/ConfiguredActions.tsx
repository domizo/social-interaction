import {useEffect, useLayoutEffect, useId, useRef, useState, type KeyboardEvent} from 'react';
import {ActionBar, ActionButton, isToggleAction, type SocialAction} from '../../lib/index.js';
import {motionForAction, type StudioConfig} from './config.js';

type Locale = 'en' | 'ja';
type ComposerMode = 'comment' | 'quote';
type Feedback = {kind: 'toggle'; action: SocialAction; selected: boolean} | {kind: 'command'; action: SocialAction; count: number} | {kind: 'draft' | 'share' | 'link'};
const text = {
  en: {actions: 'Preview actions', local: 'Local demo only. Nothing is posted or sent.', comment: 'Local comment draft', quote: 'Local quote draft', draft: 'Your draft', close: 'Close draft', cancel: 'Cancel', save: 'Save draft locally', saved: 'Draft saved in this preview.', drafts: 'Session drafts', sample: 'Small details make room for better conversations.', share: 'Share options', link: 'Show example link', prepare: 'Prepare local share', prepared: 'Share preview prepared locally. Nothing was sent.', shown: 'Example link shown below. This is a fixture, not a published post.', example: 'Example link', enabled: 'on in this preview', disabled: 'off in this preview', completed: 'demo completed locally', characters: 'characters', empty: 'Choose an action to try it here.'},
  ja: {actions: 'プレビューの操作', local: 'ローカルデモです。投稿や送信は行いません。', comment: 'コメントのローカル下書き', quote: '引用のローカル下書き', draft: '下書き', close: '下書きを閉じる', cancel: 'キャンセル', save: '下書きをローカル保存', saved: 'このプレビューに下書きを保存しました。', drafts: 'セッション内の下書き', sample: '小さな工夫が、よりよい会話の余白をつくる。', share: '共有の選択肢', link: 'サンプルリンクを表示', prepare: '共有のローカルプレビュー', prepared: '共有プレビューをローカルで作成しました。送信していません。', shown: 'サンプルリンクを表示しました。公開された投稿ではありません。', example: 'サンプルリンク', enabled: 'このプレビューでオン', disabled: 'このプレビューでオフ', completed: 'ローカルデモ完了', characters: '文字', empty: '操作を選んで試してください。'},
};

function isSequentiallyFocusable(node: HTMLElement): boolean {
  if (node.tabIndex < 0 || node.closest('[hidden], [inert], dialog:not([open])') || node.matches('input[type="hidden"]')) return false;
  for (let ancestor: HTMLElement | null = node; ancestor; ancestor = ancestor.parentElement) {
    const style = window.getComputedStyle(ancestor);
    if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse') return false;
    if (ancestor instanceof HTMLDetailsElement && !ancestor.open) {
      const summary = Array.from(ancestor.children).find(child => child.tagName === 'SUMMARY');
      if (!summary?.contains(node)) return false;
    }
  }
  return true;
}

function LocalComposer({mode, locale, value, onChange, onClose, onSave}: {mode: ComposerMode; locale: Locale; value: string; onChange: (value: string) => void; onClose: () => void; onSave: (value: string) => void}) {
  const t = text[locale], id = useId(), dialog = useRef<HTMLDialogElement>(null), input = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {const node = dialog.current; node?.showModal(); input.current?.focus(); return () => node?.close();}, []);
  const close = () => {dialog.current?.close(); onClose();};
  const trapFocus = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'Escape') {event.preventDefault(); close(); return;}
    if (event.key !== 'Tab') return;
    const nodes = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), textarea'));
    const first = nodes[0], last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) {event.preventDefault(); last?.focus();}
    else if (!event.shiftKey && document.activeElement === last) {event.preventDefault(); first?.focus();}
  };
  return <dialog ref={dialog} className="context-composer" aria-labelledby={`${id}-title`} aria-describedby={`${id}-note`} aria-modal="true" onKeyDown={trapFocus} onCancel={event => {event.preventDefault(); close();}}>
    <form onSubmit={event => {event.preventDefault(); if (value.trim()) {dialog.current?.close(); onSave(value.trim());}}}>
      <div className="context-composer-head"><h3 id={`${id}-title`}>{t[mode]}</h3><button type="button" className="context-close" onClick={close} aria-label={t.close}>×</button></div>
      <p id={`${id}-note`}>{t.local}</p>
      {mode === 'quote' && <blockquote>{t.sample}</blockquote>}
      <label htmlFor={`${id}-draft`}>{t.draft}</label>
      <textarea ref={input} id={`${id}-draft`} rows={4} maxLength={280} value={value} onChange={event => onChange(event.target.value)}/>
      <div className="context-draft-count">{value.length} / 280 {t.characters}</div>
      <div className="context-composer-buttons"><button type="button" className="context-secondary" onClick={close}>{t.cancel}</button><button type="submit" className="context-primary" disabled={!value.trim()}>{t.save}</button></div>
    </form>
  </dialog>;
}

/** The same configured controls power every fixture. All state stays in this mounted preview. */
export function ConfiguredActions({config, locale, reducedMotion, label, active = true}: {config: StudioConfig; locale: Locale; reducedMotion: boolean; label?: string; active?: boolean}) {
  const t = text[locale], menuId = useId(), root = useRef<HTMLDivElement>(null), lastFocused = useRef<HTMLElement | null>(null);
  const [selected, setSelected] = useState<Partial<Record<SocialAction, boolean>>>({});
  const [composer, setComposer] = useState<ComposerMode | null>(null), [menuOpen, setMenuOpen] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null), [showLink, setShowLink] = useState(false);
  const [draftValues, setDraftValues] = useState<Record<ComposerMode, string>>({comment: '', quote: ''});
  const [drafts, setDrafts] = useState<Array<{mode: ComposerMode; value: string}>>([]);
  const share = useRef<HTMLButtonElement>(null), menu = useRef<HTMLDivElement>(null), composerTrigger = useRef<HTMLButtonElement | null>(null);
  const menuStart = useRef<'first' | 'last'>('first'), commandCount = useRef(0);
  const closeMenu = (restore = true) => {setMenuOpen(false); if (restore && active) share.current?.focus();};
  useLayoutEffect(() => {
    if (!active) {setMenuOpen(false); setComposer(null);}
  }, [active]);
  useEffect(() => {
    if (!active || !menuOpen) return;
    const items = menu.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');
    items?.[menuStart.current === 'last' ? items.length - 1 : 0]?.focus();
    const outside = (event: PointerEvent) => {if (!menu.current?.contains(event.target as Node) && !share.current?.contains(event.target as Node)) setMenuOpen(false);};
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [menuOpen, active]);
  // Removed actions cannot leave a hidden menu or modal behind.
  const hasShare = config.actions.some(item => item.action === 'share');
  const hasComposer = composer === null || config.actions.some(item => item.action === composer);
  useEffect(() => {
    const node=root.current, focused=document.activeElement;
    const closingMenu=!hasShare&&menuOpen, closingComposer=!hasComposer&&composer!==null;
    const restore=(closingMenu&&!!menu.current?.contains(focused))||(closingComposer&&!!node?.querySelector('dialog')?.contains(focused))||(!lastFocused.current?.isConnected&&!!lastFocused.current&&focused===document.body);
    if(closingMenu)setMenuOpen(false);
    if(closingComposer){node?.querySelector<HTMLDialogElement>('dialog')?.close();setComposer(null);}
    if(active&&restore)node?.querySelector<HTMLButtonElement>('.sil-action')?.focus();
  }, [hasShare, hasComposer, menuOpen, composer, config.actions, active]);
  const menuKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(menu.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? []);
    const index = items.indexOf(document.activeElement as HTMLButtonElement);
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      items[event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus();
    } else if (event.key === 'Escape') {event.preventDefault(); closeMenu();}
    else if (event.key === 'Tab') {
      event.preventDefault();
      const nodes = Array.from(document.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]')).filter(node => !menu.current?.contains(node) && isSequentiallyFocusable(node)).sort((a, b) => (a.tabIndex > 0 ? a.tabIndex : Infinity) - (b.tabIndex > 0 ? b.tabIndex : Infinity));
      const triggerIndex = nodes.indexOf(share.current!);
      closeMenu(false); (nodes[triggerIndex + (event.shiftKey ? -1 : 1)] ?? share.current)?.focus();
    }
  };
  const closeComposer = () => {setComposer(null); if (active) composerTrigger.current?.focus();};
  const actionLabel = (action: SocialAction) => config.actions.find(item => item.action === action)?.label[locale] ?? action;
  const message = feedback?.kind === 'toggle' ? `${actionLabel(feedback.action)}: ${feedback.selected ? t.enabled : t.disabled}`
    : feedback?.kind === 'command' ? `${actionLabel(feedback.action)}: ${t.completed} (${feedback.count})`
    : feedback?.kind === 'draft' ? t.saved : feedback?.kind === 'share' ? t.prepared : feedback?.kind === 'link' ? t.shown : '';
  return <div ref={root} onFocusCapture={e=>{lastFocused.current=e.target as HTMLElement;}} onBlurCapture={e=>{if(e.relatedTarget&&!e.currentTarget.contains(e.relatedTarget as Node))lastFocused.current=null;}} className="configured-actions" data-reduced-motion={reducedMotion || !active || undefined}>
    <ActionBar tokens={config.tokens} label={label ?? t.actions}>
      {config.actions.map(item => {
        const action = item.action;
        return <ActionButton key={action} action={action} label={item.label[locale]} presentation={config.presentation} variant={config.variant} tokens={config.tokens} iconMotion={motionForAction(config, action)} motionTokens={config.motionTokens} reducedMotion={reducedMotion || !active} aria-disabled={!active || undefined}
          selected={!!selected[action]} ref={action === 'share' ? share : undefined}
          aria-haspopup={action === 'share' ? 'menu' : action === 'comment' || action === 'quote' ? 'dialog' : undefined}
          aria-expanded={action === 'share' ? menuOpen : undefined} aria-controls={action === 'share' && menuOpen ? menuId : undefined}
          onKeyDown={event => {if (active && action === 'share' && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {event.preventDefault(); menuStart.current = event.key === 'ArrowUp' ? 'last' : 'first'; setMenuOpen(true);}}}
          onClick={event => {
            if (isToggleAction(action)) {const next = !selected[action]; setSelected(previous => ({...previous, [action]: next})); setFeedback({kind: 'toggle', action, selected: next});}
            else if (action === 'comment' || action === 'quote') {composerTrigger.current = event.currentTarget; setComposer(action);}
            else if (action === 'share') {menuStart.current = 'first'; setMenuOpen(previous => !previous);}
            else {commandCount.current += 1; setFeedback({kind: 'command', action, count: commandCount.current});}
          }}/>;
      })}
    </ActionBar>
    {active && menuOpen && <div ref={menu} id={menuId} className="context-share-menu" role="menu" aria-label={t.share} onKeyDown={menuKey}>
      <button type="button" role="menuitem" tabIndex={-1} onClick={() => {setShowLink(true); setFeedback({kind: 'link'}); closeMenu();}}>{t.link}</button>
      <button type="button" role="menuitem" tabIndex={-1} onClick={() => {setFeedback({kind: 'share'}); closeMenu();}}>{t.prepare}</button>
    </div>}
    <p className="context-action-status" role="status" aria-live="polite" aria-atomic="true">{message}</p>
    {showLink && <label className="context-example-link">{t.example}<input readOnly value="https://example.com/preview/small-details" onFocus={event => event.currentTarget.select()}/></label>}
    {drafts.length > 0 && <details className="context-saved-drafts"><summary>{t.drafts} ({drafts.length})</summary>{drafts.map((draft, index) => <p key={index}><strong>{t[draft.mode]}</strong>{draft.value}</p>)}</details>}
    {active && composer && <LocalComposer mode={composer} locale={locale} value={draftValues[composer]} onChange={value => setDraftValues(previous => ({...previous, [composer]: value}))} onClose={closeComposer} onSave={value => {setDrafts(previous => [...previous, {mode: composer, value}]); setDraftValues(previous => ({...previous, [composer]: ''})); setFeedback({kind: 'draft'}); closeComposer();}}/>}
  </div>;
}
