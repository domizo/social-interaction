import type { SocialAction } from './tokens.js';
export function ActionIcon({action,filled=false}:{action:SocialAction;filled?:boolean}) {
  return <svg className="sil-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill={filled && action==='like'?'currentColor':'none'} stroke="currentColor" strokeWidth="var(--sil-stroke, 1.6)" strokeLinecap="round" strokeLinejoin="round">
    {action==='like' && <path vectorEffect="non-scaling-stroke" d="M20.7 4.9a5.4 5.4 0 0 0-7.6 0L12 6 10.9 4.9a5.4 5.4 0 0 0-7.6 7.6L12 21l8.7-8.5a5.4 5.4 0 0 0 0-7.6Z"/>}
    {action==='comment' && <path vectorEffect="non-scaling-stroke" d="M21 11.5a9 9 0 0 1-9 9 9.7 9.7 0 0 1-3.8-.8L3 21l1.3-5.2a9.7 9.7 0 0 1-.8-3.8 9 9 0 0 1 9-9H13a9 9 0 0 1 8 8v.5Z"/>}
    {action==='share' && <><path vectorEffect="non-scaling-stroke" d="M12 15V3m-4 4 4-4 4 4"/><path vectorEffect="non-scaling-stroke" d="M6 10H4v11h16V10h-2"/></>}
    {action==='quote' && <><path vectorEffect="non-scaling-stroke" d="M4 14c0-4 1-6 5-8M4 14h5v6H4zM15 14c0-4 1-6 5-8M15 14h5v6h-5z"/></>}
  </svg>;
}
