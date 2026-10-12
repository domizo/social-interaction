import {forwardRef, useId, useRef, type ButtonHTMLAttributes, type ReactNode} from 'react';
import {useIconMotion,type IconMotion,type IconMotionTokens} from './iconMotion.js';
import {isToggleAction} from './actions.js';
import {ActionIcon} from './ActionIcon.js';
import {tokenStyle,type SocialAction,type SocialVariant,type SocialTokens,type PreviewState} from './tokens.js';
export type ActionPresentation = 'labelled' | 'icon-only';
export interface ActionButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>,'children' | 'aria-pressed'> {
  action:SocialAction; label:string; count?:number; variant?:SocialVariant; tokens?:Partial<SocialTokens>; pending?:boolean; error?:boolean; selected?:boolean; previewState?:PreviewState; showLabel?:boolean; presentation?:ActionPresentation; iconMotion?:IconMotion; motionTokens?:Partial<IconMotionTokens>; motionTrigger?:number|string; reducedMotion?:boolean;
}
export const ActionButton=forwardRef<HTMLButtonElement,ActionButtonProps>(function ActionButton({action,label,count,variant='minimal',tokens,pending=false,error=false,selected=false,previewState,showLabel=true,presentation='labelled',iconMotion='spring',motionTokens,motionTrigger,reducedMotion=false,className='',style,onClick,...props},ref){
  const iconRef=useRef<SVGSVGElement>(null), countId=useId(), iconOnly=presentation==='icon-only';
  const countDescription=iconOnly&&count!==undefined?countId:undefined;
  const describedBy=[props['aria-describedby'],countDescription].filter(Boolean).join(' ')||undefined;
  const visualSelected=isToggleAction(action)&&(selected||previewState==='selected');
  const play=useIconMotion(iconRef,{action,iconMotion,motionTokens,motionTrigger,pending,disabled:!!props.disabled||props['aria-disabled']===true||props['aria-disabled']==='true',reducedMotion});
  return <button {...props} ref={ref} type={props.type??'button'} className={`sil-action sil-${variant} ${className}`} style={{...(tokens?tokenStyle(tokens):{}),...style}} aria-label={label} aria-describedby={describedBy} title={props.title??(iconOnly?label:undefined)} data-presentation={presentation} aria-pressed={isToggleAction(action)?selected:undefined} aria-busy={pending||undefined} aria-disabled={pending||props.disabled||props['aria-disabled']||undefined} data-reduced-motion={reducedMotion||undefined} data-icon-motion={iconMotion} data-action={action} data-selected={isToggleAction(action)&&selected||undefined} data-visual-selected={visualSelected||undefined} data-pending={pending||undefined} data-error={error||undefined} data-preview={previewState} onClick={e=>{if(pending || props.disabled || props['aria-disabled']===true || props['aria-disabled']==='true'){e.preventDefault();return;}play();onClick?.(e);}}>
    <span className="sil-content"><span className="sil-icon-wrap"><ActionIcon ref={iconRef} action={action} filled={visualSelected} motion={iconMotion}/>{pending&&<span className="sil-pending-mark" aria-hidden="true">···</span>}{error&&<span className="sil-error-mark">!</span>}</span>
    {showLabel&&!iconOnly&&<span className="sil-label">{label}</span>}{count!==undefined&&(iconOnly?<span id={countId} className="sil-sr-only">{label}: {count}</span>:<span className="sil-count" aria-hidden="true">{count}</span>)}</span>
  </button>;
});
export type PrimitiveProps=Omit<ActionButtonProps,'action'>;
export const LikeButton=forwardRef<HTMLButtonElement,PrimitiveProps>((props,ref)=><ActionButton {...props} ref={ref} action="like"/>);
export const CommentButton=forwardRef<HTMLButtonElement,Omit<PrimitiveProps,'selected'>>((props,ref)=><ActionButton {...props} ref={ref} action="comment" aria-haspopup="dialog"/>);
export const QuoteButton=forwardRef<HTMLButtonElement,Omit<PrimitiveProps,'selected'>>((props,ref)=><ActionButton {...props} ref={ref} action="quote" aria-haspopup="dialog"/>);
export const ShareButton=forwardRef<HTMLButtonElement,Omit<PrimitiveProps,'selected'>>((props,ref)=><ActionButton {...props} ref={ref} action="share" aria-haspopup="menu"/>);
export const RepostButton=forwardRef<HTMLButtonElement,Omit<PrimitiveProps,'selected'>>((props,ref)=><ActionButton {...props} ref={ref} action="repost"/>);
export const BookmarkButton=forwardRef<HTMLButtonElement,PrimitiveProps>((props,ref)=><ActionButton {...props} ref={ref} action="bookmark"/>);
export const NoteButton=forwardRef<HTMLButtonElement,PrimitiveProps>((props,ref)=><ActionButton {...props} ref={ref} action="note"/>);
export const StarButton=forwardRef<HTMLButtonElement,PrimitiveProps>((props,ref)=><ActionButton {...props} ref={ref} action="star"/>);
export const SendButton=forwardRef<HTMLButtonElement,Omit<PrimitiveProps,'selected'>>((props,ref)=><ActionButton {...props} ref={ref} action="send"/>);
export const SparklesButton=forwardRef<HTMLButtonElement,Omit<PrimitiveProps,'selected'>>((props,ref)=><ActionButton {...props} ref={ref} action="sparkles"/>);
export const BellButton=forwardRef<HTMLButtonElement,PrimitiveProps>((props,ref)=><ActionButton {...props} ref={ref} action="bell"/>);
export const ReactionButton=forwardRef<HTMLButtonElement,Omit<PrimitiveProps,'selected'>>((props,ref)=><ActionButton {...props} ref={ref} action="reaction"/>);
export function ActionBar({children,label='Post actions',className='',tokens}:{children:ReactNode;label?:string;className?:string;tokens?:Partial<SocialTokens>}){return <div role="group" aria-label={label} className={`sil-action-bar ${className}`} style={tokenStyle(tokens)}>{children}</div>;}
