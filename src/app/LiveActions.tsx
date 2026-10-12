import {useEffect,useLayoutEffect,useId,useRef,useState,type KeyboardEvent} from 'react';
import {ActionBar,ActionButton,isToggleAction,simulateRequest,useAsyncAction,type ActionPresentation,type SocialAction,type SocialTokens,type SocialVariant,type PreviewState,type IconMotion,type IconMotionTokens} from '../lib/index.js';
import {words,type Locale} from './content.js';
import type {StudioConfig} from './studio/config.js';
const demoLink='https://example.com/posts/small-actions';
const legacyActions=['like','comment','share','quote'] as const;
type Mode='comment'|'quote';
type MessageKey='liked'|'unliked'|'cancelled'|'saved'|'prepared'|'copied'|'copyError';
type Message={key:MessageKey;owner?:SocialAction}|{action:SocialAction;selected?:boolean;count?:number};
function isSequentiallyFocusable(node:HTMLElement):boolean{
  if(node.tabIndex<0||node.closest('[hidden], [inert], dialog:not([open])')||node.matches('input[type="hidden"], :disabled'))return false;
  for(let ancestor:HTMLElement|null=node;ancestor;ancestor=ancestor.parentElement){
    const style=window.getComputedStyle(ancestor);
    if(style.display==='none'||style.visibility==='hidden'||style.visibility==='collapse')return false;
    if(ancestor instanceof HTMLDetailsElement&&!ancestor.open){const summary=Array.from(ancestor.children).find(child=>child.tagName==='SUMMARY');if(!summary?.contains(node))return false;}
  }
  return true;
}
function Composer({mode,label,locale,fail,delay,text,onText,onClose,onSaved,onStart}:{mode:Mode;label:string;locale:Locale;fail:boolean;delay:number;text:string;onText:(text:string)=>void;onClose:()=>void;onSaved:(value:string)=>void;onStart?:()=>void}){
  const t=words[locale],ref=useRef<HTMLDialogElement>(null),textRef=useRef<HTMLTextAreaElement>(null),id=useId();const request=useAsyncAction<string>();
  useEffect(()=>{const d=ref.current;d?.showModal();textRef.current?.focus();return()=>d?.close();},[]);
  const close=()=>{request.cancel();ref.current?.close();onClose();};
  return <dialog ref={ref} className="composer" aria-labelledby={id} aria-modal="true" onKeyDown={e=>{if(e.key!=='Tab')return;const nodes=Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),a[href],[tabindex="0"]'));const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}} onCancel={e=>{e.preventDefault();close();}}>
    <form onSubmit={async e=>{e.preventDefault();if(!text.trim()||text.length>280||request.status==='pending')return;onStart?.();const value=await request.run(signal=>simulateRequest(text.trim(),{signal,delay,fail}));if(value!==undefined){ref.current?.close();onSaved(value);}}}>
      <div className="dialog-head"><h2 id={id}>{label}</h2><button type="button" onClick={close} aria-label={t.close} className="close-button">×</button></div>
      <p className="muted">{t.local}</p>{mode==='quote'&&<blockquote>{t.post}</blockquote>}
      <label htmlFor={`${id}-text`}>{t.draft}</label><textarea ref={textRef} id={`${id}-text`} value={text} onChange={e=>onText(e.target.value)} maxLength={280} readOnly={request.status==='pending'} rows={4}/>
      <div className="composer-meta"><span>{text.length} / 280 {t.character}</span><span>{locale==='en'?'Kept only during this session':'このセッション内のみ'}</span></div>
      <p className="request-status" role="status">{request.status==='pending'?t.pending:request.status==='error'?t.retry:''}</p>
      <div className="dialog-footer"><button type="button" onClick={close} className="text-button">{t.close}</button><button type="submit" className="primary-button" disabled={!text.trim()||request.status==='pending'}>{t.send}</button></div>
    </form>
  </dialog>;
}
export function LiveActions({variant,locale,tokens,actions,previewState,fail=false,delay=700,consumeFailure,compact=false,presentation='labelled',iconMotion='spring',motionTokens,reducedMotion=false,active=true}:{variant:SocialVariant;locale:Locale;tokens:SocialTokens;actions?:StudioConfig['actions'];previewState?:PreviewState;fail?:boolean;delay?:number;consumeFailure?:()=>void;compact?:boolean;presentation?:ActionPresentation;iconMotion?:IconMotion;motionTokens?:Partial<IconMotionTokens>;reducedMotion?:boolean;active?:boolean}){
  const t=words[locale],configured=actions??legacyActions.map(action=>({action,label:{en:words.en[action],ja:words.ja[action]}})),actionOrder=configured.map(item=>item.action),actionKey=actionOrder.join(','),presentActions=new Set(actionOrder),label=(action:SocialAction)=>configured.find(item=>item.action===action)?.label[locale]??(legacyActions.includes(action as typeof legacyActions[number])?t[action as typeof legacyActions[number]]:action);
  const [liked,setLiked]=useState(false),[selected,setSelected]=useState<Partial<Record<SocialAction,boolean>>>({}),[comments,setComments]=useState(24),[mode,setMode]=useState<Mode|null>(null),[drafts,setDrafts]=useState<Record<Mode,string>>({comment:'',quote:''}),[menu,setMenu]=useState(false),[message,setMessage]=useState<Message|null>(null),[copyFallback,setCopyFallback]=useState(false),[saved,setSaved]=useState<{mode:Mode;text:string}[]>([]);
  const likeRequest=useAsyncAction<boolean>(),shareRequest=useAsyncAction<string>(),triggers=useRef<Partial<Record<SocialAction,HTMLButtonElement|null>>>({}),requestTrigger=useRef<SocialAction|null>(null),menuRef=useRef<HTMLDivElement>(null),menuStart=useRef<'first'|'last'>('first'),menuId=useId();
  const enabled=useRef(presentActions),previous=useRef(presentActions),requestGeneration=useRef({like:0,share:0}),alive=useRef(true),visible=useRef(active),lastFocus=useRef<HTMLElement|null>(null),commandCounts=useRef<Partial<Record<SocialAction,number>>>({});
  const focusTrigger=(preferred?:SocialAction|null)=>{if(!visible.current)return;const target=preferred&&enabled.current.has(preferred)?triggers.current[preferred]:undefined;(target??actionOrder.map(action=>triggers.current[action]).find(node=>node?.isConnected))?.focus();};
  const closeMenu=(restore=true)=>{setMenu(false);if(restore)focusTrigger('share');};
  // Retained panels keep durable values, but never retain transient request owners.
  useLayoutEffect(()=>{
    visible.current=active;
    if(active)return;
    requestGeneration.current.like++;requestGeneration.current.share++;
    const wasPending=likeRequest.status==='pending'||shareRequest.status==='pending';
    if(likeRequest.status==='pending')likeRequest.cancel();
    if(shareRequest.status==='pending')shareRequest.cancel();
    if(wasPending)setMessage({key:'cancelled'});
    setMode(null);setMenu(false);requestTrigger.current=null;
  },[active]);
  // Invalidate the removed owner's work before a settled promise can publish a late result.
  // Completed selections and per-action drafts remain local so re-adding an action restores them.
  useLayoutEffect(()=>{
    enabled.current=presentActions;
    const removed=[...previous.current].filter(action=>!presentActions.has(action));previous.current=presentActions;
    if(!removed.length)return;
    if(removed.includes('like')){requestGeneration.current.like++;likeRequest.reset();}
    if(removed.includes('share')){requestGeneration.current.share++;shareRequest.reset();setCopyFallback(false);}
    const removedComposer=mode!==null&&removed.includes(mode),removedMenu=menu&&removed.includes('share');
    if(removedComposer)setMode(null);
    if(removedMenu)setMenu(false);
    setMessage(value=>value&&removed.includes('action' in value?value.action:value.owner!)?null:value);
    if(lastFocus.current&&!lastFocus.current.isConnected&&document.activeElement===document.body)focusTrigger();
    if(requestTrigger.current&&removed.includes(requestTrigger.current))requestTrigger.current=presentActions.has('like')&&likeRequest.status==='pending'?'like':presentActions.has('share')&&shareRequest.status==='pending'?'share':null;
  },[actionKey]);
  useEffect(()=>{alive.current=true;return()=>{alive.current=false;requestGeneration.current.like++;requestGeneration.current.share++;};},[]);
  useEffect(()=>{if(!active||!menu||!presentActions.has('share'))return;const items=menuRef.current?.querySelectorAll<HTMLButtonElement>('button');items?.[menuStart.current==='last'?items.length-1:0]?.focus();const outside=(e:PointerEvent)=>{if(!menuRef.current?.contains(e.target as Node)&&!triggers.current.share?.contains(e.target as Node))setMenu(false);};document.addEventListener('pointerdown',outside);return()=>document.removeEventListener('pointerdown',outside);},[menu,active]);
  // Reordered Share can occupy either edge of a narrow row. Keep the existing
  // vertical anchor, but clamp the popup's horizontal bounds to the viewport.
  useLayoutEffect(()=>{
    const node=menuRef.current,anchor=triggers.current.share?.parentElement;
    if(!active||!menu||!node||!anchor||!presentActions.has('share'))return;
    const priorLeft=node.style.left,priorRight=node.style.right;let ownedLeft='';
    const place=()=>{
      // Mobile innerWidth can include the temporary overflow of an unshifted popup.
      // Read the layout viewport before measuring, so placement cannot widen its own bound.
      const viewportWidth=document.documentElement.clientWidth||window.innerWidth;
      node.style.right='auto';node.style.left='0px';
      const width=node.getBoundingClientRect().width,x=anchor.getBoundingClientRect().left;
      ownedLeft=`${Math.max(8,Math.min(x,viewportWidth-width-8))-x}px`;node.style.left=ownedLeft;
    };
    place();window.addEventListener('resize',place);window.addEventListener('scroll',place,true);
    return()=>{window.removeEventListener('resize',place);window.removeEventListener('scroll',place,true);if(node.style.left===ownedLeft)node.style.left=priorLeft;if(node.style.right==='auto')node.style.right=priorRight;};
  },[menu,actionKey,presentation,locale,tokens,configured,active]);
  const menuKey=(e:KeyboardEvent)=>{const items=Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role=menuitem]')??[]),i=items.indexOf(document.activeElement as HTMLButtonElement);if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();items[e.key==='Home'?0:e.key==='End'?items.length-1:(i+(e.key==='ArrowDown'?1:-1)+items.length)%items.length]?.focus();}else if(e.key==='Escape'){e.preventDefault();closeMenu();}else if(e.key==='Tab'){e.preventDefault();const all=Array.from(document.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]')).filter(el=>!menuRef.current?.contains(el)&&isSequentiallyFocusable(el)).sort((a,b)=>(a.tabIndex>0?a.tabIndex:Infinity)-(b.tabIndex>0?b.tabIndex:Infinity));const idx=all.indexOf(triggers.current.share!);closeMenu(false);const target=all[idx+(e.shiftKey?-1:1)];(target??triggers.current.share)?.focus();}};
  const common={presentation,variant,tokens,previewState,iconMotion,motionTokens,reducedMotion:reducedMotion||!active,'aria-disabled':!active||undefined};
  const closeComposer=()=>{setMode(null);focusTrigger(mode);};
  const pending=presentActions.has('like')&&likeRequest.status==='pending'||presentActions.has('share')&&shareRequest.status==='pending';
  const localMessage=message&&('key' in message?t[message.key]:typeof message.selected==='boolean'?(locale==='en'?`${label(message.action)}: ${message.selected?'on':'off'} (local only)`:`${label(message.action)}：${message.selected?'オン':'オフ'}（ローカルのみ）`):(locale==='en'?`${label(message.action)} previewed locally (${message.count}). Nothing was posted, sent, or generated.`:`${label(message.action)}をローカルでプレビューしました（${message.count}回）。投稿・送信・生成は行いません。`));
  return <div className={`live-actions ${compact?'compact':''}`} onFocusCapture={event=>{lastFocus.current=event.target as HTMLElement;}} onBlurCapture={event=>{if(event.relatedTarget&&!event.currentTarget.contains(event.relatedTarget as Node))lastFocus.current=null;}}>
    <ActionBar label={locale==='en'?`${variant} post actions`:`${variant} 投稿の操作`} tokens={tokens}>
      {configured.map(({action})=>action==='share'?<div className="share-anchor" key={action}><ActionButton {...common} action={action} ref={node=>{triggers.current.share=node;}} label={label(action)} aria-haspopup="menu" pending={shareRequest.status==='pending'} error={shareRequest.status==='error'} aria-expanded={menu} aria-controls={menu?menuId:undefined} onClick={()=>{menuStart.current='first';setMenu(v=>!v);}} onKeyDown={e=>{if(active&&(e.key==='ArrowDown'||e.key==='ArrowUp')&&shareRequest.status!=='pending'){e.preventDefault();menuStart.current=e.key==='ArrowUp'?'last':'first';setMenu(true);}}}/>
        {active&&menu&&<div id={menuId} ref={menuRef} role="menu" aria-label={label(action)} className="share-menu" onKeyDown={menuKey}>
          <button type="button" role="menuitem" tabIndex={-1} onClick={async()=>{closeMenu();const generation=requestGeneration.current.share;try{await navigator.clipboard.writeText(demoLink);if(alive.current&&visible.current&&enabled.current.has('share')&&generation===requestGeneration.current.share)setMessage({key:'copied',owner:'share'});}catch{if(alive.current&&visible.current&&enabled.current.has('share')&&generation===requestGeneration.current.share){setCopyFallback(true);setMessage({key:'copyError',owner:'share'});}}}}>{t.copy}</button>
          <button type="button" role="menuitem" tabIndex={-1} onClick={async()=>{closeMenu();requestTrigger.current='share';setMessage(null);consumeFailure?.();await shareRequest.run(signal=>simulateRequest('shared',{signal,delay,fail}));}}>{t.prepare}</button>
        </div>}</div>:<ActionButton {...common} key={action} action={action} ref={node=>{triggers.current[action]=node;}} label={label(action)} count={action==='like'?128+Number(liked):action==='comment'?comments:undefined} selected={action==='like'?liked:!!selected[action]} aria-haspopup={action==='comment'||action==='quote'?'dialog':undefined} pending={action==='like'&&likeRequest.status==='pending'} error={action==='like'&&likeRequest.status==='error'} onClick={async()=>{
          if(action==='like'){requestTrigger.current='like';setMessage(null);consumeFailure?.();const generation=requestGeneration.current.like,result=await likeRequest.run(signal=>simulateRequest(!liked,{signal,delay,fail}));if(typeof result==='boolean'&&alive.current&&visible.current&&enabled.current.has('like')&&generation===requestGeneration.current.like)setLiked(result);}
          else if(action==='comment'||action==='quote')setMode(action);
          else if(isToggleAction(action)){const next=!selected[action];setSelected(value=>({...value,[action]:next}));setMessage({action,selected:next});}
          else {const count=(commandCounts.current[action]??0)+1;commandCounts.current[action]=count;setMessage({action,count});}
        }}/>) }
    </ActionBar>
    {(presentActions.has('like')&&likeRequest.status!=='idle'||presentActions.has('share')&&shareRequest.status!=='idle'||message||copyFallback)&&<div className="action-feedback">
      {presentActions.has('like')&&likeRequest.status!=='idle'&&<div className="feedback-item"><span className="feedback-label">{label('like')}</span><span role="status">{likeRequest.status==='pending'?t.pending:likeRequest.status==='error'?t.retry:liked?t.liked:t.unliked}</span></div>}
      {presentActions.has('share')&&shareRequest.status!=='idle'&&<div className="feedback-item"><span className="feedback-label">{label('share')}</span><span role="status">{shareRequest.status==='pending'?t.pending:shareRequest.status==='error'?t.retry:t.prepared}</span></div>}
      {localMessage&&<span role="status" aria-live="polite" aria-atomic="true">{localMessage}</span>}
      {pending&&<button type="button" className="text-button" onClick={()=>{likeRequest.cancel();shareRequest.cancel();setMessage({key:'cancelled'});focusTrigger(requestTrigger.current);}}>{t.cancel}</button>}{copyFallback&&presentActions.has('share')&&<input aria-label={t.copy} value={demoLink} readOnly onFocus={e=>e.currentTarget.select()}/>}</div>}
    {saved.length>0&&<details className="saved-drafts"><summary>{locale==='en'?`Saved locally (${saved.length})`:`ローカルに保存済み（${saved.length}）`}</summary>{saved.map((item,i)=><p key={i}><strong>{label(item.mode)}</strong> {item.text}</p>)}</details>}
    {active&&mode&&presentActions.has(mode)&&<Composer key={mode} mode={mode} label={label(mode)} locale={locale} fail={fail} delay={delay} text={drafts[mode]} onText={text=>setDrafts(value=>({...value,[mode]:text}))} onStart={consumeFailure} onClose={closeComposer} onSaved={text=>{if(!visible.current||!enabled.current.has(mode))return;if(mode==='comment')setComments(n=>n+1);setSaved(values=>[...values,{mode,text}]);setDrafts(value=>({...value,[mode]:''}));setMessage({key:'saved',owner:mode});closeComposer();}}/>}
  </div>;
}
