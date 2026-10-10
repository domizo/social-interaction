import {forwardRef, type ButtonHTMLAttributes, type ReactNode} from 'react';
import {ActionIcon} from './ActionIcon.js';
import {tokenStyle,type SocialAction,type SocialVariant,type SocialTokens,type PreviewState} from './tokens.js';
export interface ActionButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>,'children' | 'aria-pressed'> {
  action:SocialAction; label:string; count?:number; variant?:SocialVariant; tokens?:Partial<SocialTokens>; pending?:boolean; error?:boolean; selected?:boolean; previewState?:PreviewState; showLabel?:boolean;
}
export const ActionButton=forwardRef<HTMLButtonElement,ActionButtonProps>(function ActionButton({action,label,count,variant='minimal',tokens,pending=false,error=false,selected=false,previewState,showLabel=true,className='',style,onClick,...props},ref){
  return <button {...props} ref={ref} type={props.type??'button'} className={`sil-action sil-${variant} ${className}`} style={{...(tokens?tokenStyle(tokens):{}),...style}} aria-label={label} aria-pressed={action==='like'?selected:undefined} aria-busy={pending||undefined} aria-disabled={pending||props.disabled||props['aria-disabled']||undefined} data-action={action} data-selected={action==='like'&&selected||undefined} data-pending={pending||undefined} data-error={error||undefined} data-preview={previewState} onClick={e=>{if(pending || props.disabled || props['aria-disabled']===true || props['aria-disabled']==='true'){e.preventDefault();return;}onClick?.(e);}}>
    <span className="sil-icon-wrap"><ActionIcon action={action} filled={action==='like'&&selected}/>{pending&&<span className="sil-pending-dot"/>}{error&&<span className="sil-error-mark">!</span>}</span>
    {showLabel&&<span className="sil-label">{label}</span>}{count!==undefined&&<span className="sil-count" aria-hidden="true">{count}</span>}
  </button>;
});
export type PrimitiveProps=Omit<ActionButtonProps,'action'>;
export const LikeButton=forwardRef<HTMLButtonElement,PrimitiveProps>((props,ref)=><ActionButton {...props} ref={ref} action="like"/>);
export const CommentButton=forwardRef<HTMLButtonElement,Omit<PrimitiveProps,'selected'>>((props,ref)=><ActionButton {...props} ref={ref} action="comment" aria-haspopup="dialog"/>);
export const QuoteButton=forwardRef<HTMLButtonElement,Omit<PrimitiveProps,'selected'>>((props,ref)=><ActionButton {...props} ref={ref} action="quote" aria-haspopup="dialog"/>);
export const ShareButton=forwardRef<HTMLButtonElement,Omit<PrimitiveProps,'selected'>>((props,ref)=><ActionButton {...props} ref={ref} action="share" aria-haspopup="menu"/>);
export function ActionBar({children,label='Post actions',className='',tokens}:{children:ReactNode;label?:string;className?:string;tokens?:Partial<SocialTokens>}){return <div role="group" aria-label={label} className={`sil-action-bar ${className}`} style={tokenStyle(tokens)}>{children}</div>;}
