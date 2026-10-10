import type {SocialAction} from './tokens.js';
export const socialActions=['like','comment','share','quote','repost','bookmark','note','star','send','sparkles','bell','reaction'] as const;
export const toggleActions=['like','bookmark','note','star','bell'] as const;
export function isToggleAction(action:SocialAction):boolean{return (toggleActions as readonly string[]).includes(action);}
export const actionLabels:Record<SocialAction,{en:string;ja:string}>={like:{en:'Like',ja:'いいね'},comment:{en:'Comment',ja:'コメント'},share:{en:'Share',ja:'共有'},quote:{en:'Quote',ja:'引用'},repost:{en:'Repost',ja:'リポスト'},bookmark:{en:'Save',ja:'保存'},note:{en:'Keep note',ja:'メモを保存'},star:{en:'Favorite',ja:'お気に入り'},send:{en:'Send',ja:'送信'},sparkles:{en:'AI sparkle',ja:'AI スパークル'},bell:{en:'Notifications',ja:'通知'},reaction:{en:'React',ja:'リアクション'}};
