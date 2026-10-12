import {useEffect,useId,useRef,useState,type KeyboardEvent} from 'react';
import {ActionBar,LikeButton,CommentButton,QuoteButton,ShareButton,simulateRequest,useAsyncAction,type ActionPresentation,type SocialTokens,type SocialVariant,type PreviewState,type IconMotion,type IconMotionTokens} from '../lib/index.js';
import {words,type Locale} from './content.js';
const demoLink='https://example.com/posts/small-actions';
type Mode='comment'|'quote';
type MessageKey='liked'|'unliked'|'cancelled'|'saved'|'prepared'|'copied'|'copyError';
function Composer({mode,locale,fail,delay,onClose,onSaved,onStart}:{mode:Mode;locale:Locale;fail:boolean;delay:number;onClose:()=>void;onSaved:(value:string)=>void;onStart?:()=>void}){
  const t=words[locale],ref=useRef<HTMLDialogElement>(null),textRef=useRef<HTMLTextAreaElement>(null),id=useId(),[text,setText]=useState('');const request=useAsyncAction<string>();
  useEffect(()=>{const d=ref.current;d?.showModal();textRef.current?.focus();return()=>d?.close();},[]);
  const close=()=>{request.cancel();ref.current?.close();onClose();};
  return <dialog ref={ref} className="composer" aria-labelledby={id} aria-modal="true" onKeyDown={e=>{if(e.key!=='Tab')return;const nodes=Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),a[href],[tabindex="0"]'));const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}} onCancel={e=>{e.preventDefault();close();}}>
    <form onSubmit={async e=>{e.preventDefault();if(!text.trim()||text.length>280||request.status==='pending')return;onStart?.();const value=await request.run(signal=>simulateRequest(text.trim(),{signal,delay,fail}));if(value!==undefined){ref.current?.close();onSaved(value);}}}>
      <div className="dialog-head"><h2 id={id}>{t[mode]}</h2><button type="button" onClick={close} aria-label={t.close} className="close-button">×</button></div>
      <p className="muted">{t.local}</p>{mode==='quote'&&<blockquote>{t.post}</blockquote>}
      <label htmlFor={`${id}-text`}>{t.draft}</label><textarea ref={textRef} id={`${id}-text`} value={text} onChange={e=>setText(e.target.value)} maxLength={280} readOnly={request.status==='pending'} rows={4}/>
      <div className="composer-meta"><span>{text.length} / 280 {t.character}</span><span>{locale==='en'?'Kept only during this session':'このセッション内のみ'}</span></div>
      <p className="request-status" role="status">{request.status==='pending'?t.pending:request.status==='error'?t.retry:''}</p>
      <div className="dialog-footer"><button type="button" onClick={close} className="text-button">{t.close}</button><button type="submit" className="primary-button" disabled={!text.trim()||request.status==='pending'}>{t.send}</button></div>
    </form>
  </dialog>;
}
export function LiveActions({variant,locale,tokens,previewState,fail=false,delay=700,consumeFailure,compact=false,presentation='labelled',iconMotion='spring',motionTokens,reducedMotion=false}:{variant:SocialVariant;locale:Locale;tokens:SocialTokens;previewState?:PreviewState;fail?:boolean;delay?:number;consumeFailure?:()=>void;compact?:boolean;presentation?:ActionPresentation;iconMotion?:IconMotion;motionTokens?:Partial<IconMotionTokens>;reducedMotion?:boolean}){
  const t=words[locale],[liked,setLiked]=useState(false),[comments,setComments]=useState(24),[mode,setMode]=useState<Mode|null>(null),[menu,setMenu]=useState(false),[message,setMessage]=useState<MessageKey|null>(null),[copyFallback,setCopyFallback]=useState(false),[saved,setSaved]=useState<{mode:Mode;text:string}[]>([]);
  const likeRequest=useAsyncAction<boolean>(),shareRequest=useAsyncAction<string>(),trigger=useRef<HTMLButtonElement|null>(null),requestTrigger=useRef<HTMLButtonElement|null>(null),share=useRef<HTMLButtonElement>(null),menuRef=useRef<HTMLDivElement>(null),menuStart=useRef<'first'|'last'>('first'),menuId=useId();
  const closeMenu=(restore=true)=>{setMenu(false);if(restore)share.current?.focus();};
  useEffect(()=>{if(!menu)return;const items=menuRef.current?.querySelectorAll<HTMLButtonElement>('button');items?.[menuStart.current==='last'?items.length-1:0]?.focus();const outside=(e:PointerEvent)=>{if(!menuRef.current?.contains(e.target as Node)&&!share.current?.contains(e.target as Node))setMenu(false);};document.addEventListener('pointerdown',outside);return()=>document.removeEventListener('pointerdown',outside);},[menu]);
  const menuKey=(e:KeyboardEvent)=>{const items=Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role=menuitem]')??[]),i=items.indexOf(document.activeElement as HTMLButtonElement);if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();items[e.key==='Home'?0:e.key==='End'?items.length-1:(i+(e.key==='ArrowDown'?1:-1)+items.length)%items.length]?.focus();}else if(e.key==='Escape'){e.preventDefault();closeMenu();}else if(e.key==='Tab'){e.preventDefault();const all=Array.from(document.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input,select,textarea')).filter(el=>!menuRef.current?.contains(el)&&el.tabIndex>=0&&el.getClientRects().length>0);const idx=all.indexOf(share.current!);closeMenu(false);const target=all[idx+(e.shiftKey?-1:1)];(target??share.current)?.focus();}};
  const common={presentation,variant,tokens,previewState,iconMotion,motionTokens,reducedMotion};
  const closeComposer=()=>{setMode(null);trigger.current?.focus();};
  const pending=likeRequest.status==='pending'||shareRequest.status==='pending';
  return <div className={`live-actions ${compact?'compact':''}`}>
    <ActionBar label={locale==='en'?`${variant} post actions`:`${variant} 投稿の操作`} tokens={tokens}>
      <LikeButton {...common} label={t.like} count={128+Number(liked)} selected={liked} pending={likeRequest.status==='pending'} error={likeRequest.status==='error'} onClick={async e=>{requestTrigger.current=e.currentTarget;setMessage(null);consumeFailure?.();const result=await likeRequest.run(signal=>simulateRequest(!liked,{signal,delay,fail}));if(typeof result==='boolean'){setLiked(result);}}}/>
      <CommentButton {...common} label={t.comment} count={comments} onClick={e=>{trigger.current=e.currentTarget;setMode('comment');}}/>
      <div className="share-anchor"><ShareButton {...common} ref={share} label={t.share} pending={shareRequest.status==='pending'} error={shareRequest.status==='error'} aria-expanded={menu} aria-controls={menu?menuId:undefined} onClick={()=>{menuStart.current='first';setMenu(v=>!v);}} onKeyDown={e=>{if((e.key==='ArrowDown'||e.key==='ArrowUp')&&shareRequest.status!=='pending'){e.preventDefault();menuStart.current=e.key==='ArrowUp'?'last':'first';setMenu(true);}}}/>
      {menu&&<div id={menuId} ref={menuRef} role="menu" aria-label={t.share} className="share-menu" onKeyDown={menuKey}>
        <button type="button" role="menuitem" tabIndex={-1} onClick={async()=>{closeMenu();try{await navigator.clipboard.writeText(demoLink);setMessage('copied');}catch{setCopyFallback(true);setMessage('copyError');}}}>{t.copy}</button>
        <button type="button" role="menuitem" tabIndex={-1} onClick={async()=>{closeMenu();requestTrigger.current=share.current;setMessage(null);consumeFailure?.();await shareRequest.run(signal=>simulateRequest('shared',{signal,delay,fail}));}}>{t.prepare}</button>
      </div>}</div>
      <QuoteButton {...common} label={t.quote} onClick={e=>{trigger.current=e.currentTarget;setMode('quote');}}/>
    </ActionBar>
    {(likeRequest.status!=='idle'||shareRequest.status!=='idle'||message||copyFallback)&&<div className="action-feedback">
      {likeRequest.status!=='idle'&&<div className="feedback-item"><span className="feedback-label">{t.like}</span><span role="status">{likeRequest.status==='pending'?t.pending:likeRequest.status==='error'?t.retry:liked?t.liked:t.unliked}</span></div>}
      {shareRequest.status!=='idle'&&<div className="feedback-item"><span className="feedback-label">{t.share}</span><span role="status">{shareRequest.status==='pending'?t.pending:shareRequest.status==='error'?t.retry:t.prepared}</span></div>}
      {message&&<span role="status">{t[message]}</span>}
      {pending&&<button type="button" className="text-button" onClick={()=>{likeRequest.cancel();shareRequest.cancel();setMessage('cancelled');requestTrigger.current?.focus();}}>{t.cancel}</button>}{copyFallback&&<input aria-label={t.copy} value={demoLink} readOnly onFocus={e=>e.currentTarget.select()}/>}</div>}
    {saved.length>0&&<details className="saved-drafts"><summary>{locale==='en'?`Saved locally (${saved.length})`:`ローカルに保存済み（${saved.length}）`}</summary>{saved.map((item,i)=><p key={i}><strong>{t[item.mode]}</strong> {item.text}</p>)}</details>}
    {mode&&<Composer mode={mode} locale={locale} fail={fail} delay={delay} onStart={consumeFailure} onClose={closeComposer} onSaved={text=>{if(mode==='comment')setComments(n=>n+1);setSaved(values=>[...values,{mode,text}]);setMessage('saved');closeComposer();}}/>}
  </div>;
}
