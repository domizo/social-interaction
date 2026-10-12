import {useEffect,useLayoutEffect,useRef,useState,type KeyboardEvent,type ReactNode} from 'react';
import type {Locale} from './content.js';
export const steps=['choose','appearance','animation','preview','export','guide'] as const;
export type WorkflowStep=typeof steps[number];
export const guideSections=['overview','motion','catalog','async','design','states'] as const;
export type GuideSection=typeof guideSections[number];
export interface WorkflowRoute{step:WorkflowStep;guide:GuideSection;anchor?:string}
export const stepLabels={en:['Choose icons','Appearance','Motion','In context','Export','Guide'],ja:['アイコンを選ぶ','見た目','動き','使用画面','エクスポート','ガイド']} as const;
export const guideLabels={en:['Start here','Motion reference','Icon catalog','Async states','Design lens','State reference'],ja:['考え方','動きの比較','アイコン一覧','非同期の状態','デザインの見方','状態の一覧']} as const;
const legacy:Record<string,WorkflowRoute>={
 '#studio':{step:'choose',guide:'overview'},'#compare':{step:'appearance',guide:'overview',anchor:'compare'},
 '#motion':{step:'animation',guide:'overview',anchor:'motion'},'#timeline':{step:'animation',guide:'overview',anchor:'timeline'},
 '#studio-config':{step:'export',guide:'overview'},'#icon-catalog':{step:'guide',guide:'catalog',anchor:'icon-catalog'},
 '#async-comparison':{step:'guide',guide:'async',anchor:'async-comparison'},'#design-lens':{step:'guide',guide:'design',anchor:'design-lens'},
 '#states':{step:'guide',guide:'states',anchor:'states'},'#documentation':{step:'guide',guide:'overview',anchor:'documentation'},
};
export function routeFromHash(hash:string):WorkflowRoute{
 if(legacy[hash])return legacy[hash];
 const value=hash.slice(1);if(steps.includes(value as WorkflowStep))return {step:value as WorkflowStep,guide:'overview'};
 if(value.startsWith('guide/')&&guideSections.includes(value.slice(6) as GuideSection))return {step:'guide',guide:value.slice(6) as GuideSection};
 return {step:'choose',guide:'overview'};
}
export function routeHash(step:WorkflowStep,guide:GuideSection='overview'){return step==='guide'&&guide!=='overview'?`#guide/${guide}`:`#${step}`;}
export function useWorkflow(){
 const [route,setRoute]=useState(()=>routeFromHash(window.location.hash));
 const [revision,setRevision]=useState(0),intent=useRef<'initial'|'history'|'tab'|'panel'>('initial');
 useEffect(()=>{const update=()=>{intent.current='history';setRoute(routeFromHash(window.location.hash));setRevision(n=>n+1);};window.addEventListener('hashchange',update);window.addEventListener('popstate',update);if(!window.location.hash)history.replaceState(null,'','#choose');return()=>{window.removeEventListener('hashchange',update);window.removeEventListener('popstate',update);};},[]);
 const go=(step:WorkflowStep,guide:GuideSection='overview',focus:'tab'|'panel'='tab')=>{
  const hash=routeHash(step,guide);intent.current=focus;
  if(window.location.hash!==hash)history.pushState(null,'',hash);
  setRoute({step,guide});setRevision(n=>n+1);
 };
 useLayoutEffect(()=>{
  const mode=intent.current,hash=window.location.hash;let cancelled=false,frame:number|undefined;
  const stop=()=>{cancelled=true;if(frame!==undefined)cancelAnimationFrame(frame);};
  const reposition=()=>{
   if(cancelled||window.location.hash!==hash)return;
   if(mode==='tab')return;
   if(mode==='history'){
    if(document.activeElement===document.body||document.activeElement?.closest('[hidden]')){const tab=document.querySelector<HTMLElement>(`[data-workflow-step="${route.step}"]`);tab?.focus({preventScroll:true});tab?.scrollIntoView?.({block:'nearest',inline:'nearest',behavior:'instant'});}
    return;
   }
   const panel=document.getElementById(`step-${route.step}`),anchor=route.anchor&&document.getElementById(route.anchor);
   (anchor||(mode==='initial'?document.querySelector('.workflow-navigation'):panel))?.scrollIntoView?.({block:'start',behavior:'instant'});
   if(mode==='panel')panel?.querySelector<HTMLElement>('[data-step-heading]')?.focus({preventScroll:true});
  };
  if(mode==='initial'){const events=['wheel','touchstart','pointerdown','keydown'] as const;for(const e of events)window.addEventListener(e,stop,{once:true,passive:true});Promise.resolve(document.fonts?.ready).then(()=>{if(!cancelled)frame=requestAnimationFrame(reposition);});return()=>{stop();for(const e of events)window.removeEventListener(e,stop);};}
  frame=requestAnimationFrame(reposition);return stop;
 },[route,revision]);
 return {route,go};
}
export function WorkflowTabs({active,locale,onChoose}:{active:WorkflowStep;locale:Locale;onChoose:(step:WorkflowStep)=>void}){
 const refs=useRef<(HTMLButtonElement|null)[]>([]),[focus,setFocus]=useState(steps.indexOf(active));
 useEffect(()=>setFocus(steps.indexOf(active)),[active]);
 const key=(event:KeyboardEvent<HTMLButtonElement>,index:number)=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?steps.length-1:(index+(event.key==='ArrowRight'?1:-1)+steps.length)%steps.length;setFocus(next);refs.current[next]?.focus();refs.current[next]?.scrollIntoView?.({block:'nearest',inline:'nearest',behavior:'instant'});};
 return <div className="workflow-tabs" role="tablist" aria-label={locale==='en'?'Build your interaction':'インタラクションを作る'}>{steps.map((step,i)=><button type="button" role="tab" key={step} id={`tab-${step}`} ref={node=>{refs.current[i]=node;}} data-workflow-step={step} aria-selected={active===step} aria-controls={`step-${step}`} tabIndex={focus===i?0:-1} onFocus={()=>setFocus(i)} onKeyDown={e=>key(e,i)} onClick={event=>{event.currentTarget.focus({preventScroll:true});onChoose(step);}}><span className="workflow-tab-number" aria-hidden="true">{i<5?`0${i+1}`:'↗'}</span><span>{stepLabels[locale][i]}</span></button>)}</div>;
}
export function StepPanel({step,active,children}:{step:WorkflowStep;active:boolean;children:ReactNode}){return <section id={`step-${step}`} data-step-panel={step} role="tabpanel" aria-labelledby={`tab-${step}`} hidden={!active} inert={!active} className="workflow-panel">{children}</section>;}
export function GuideTabs({active,locale,onChoose}:{active:GuideSection;locale:Locale;onChoose:(section:GuideSection)=>void}){
 const refs=useRef<(HTMLButtonElement|null)[]>([]),[focus,setFocus]=useState(guideSections.indexOf(active));useEffect(()=>setFocus(guideSections.indexOf(active)),[active]);
 return <div className="guide-tabs" role="tablist" aria-label={locale==='en'?'Guide sections':'ガイドの項目'}>{guideSections.map((section,i)=><button key={section} type="button" role="tab" data-guide-section={section} id={`guide-tab-${section}`} aria-controls={`guide-panel-${section}`} aria-selected={active===section} tabIndex={focus===i?0:-1} ref={el=>{refs.current[i]=el;}} onFocus={()=>setFocus(i)} onClick={event=>{event.currentTarget.focus({preventScroll:true});onChoose(section);}} onKeyDown={e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?guideSections.length-1:(i+(e.key==='ArrowRight'?1:-1)+guideSections.length)%guideSections.length;setFocus(next);refs.current[next]?.focus();refs.current[next]?.scrollIntoView?.({block:'nearest',inline:'nearest',behavior:'instant'});}}>{guideLabels[locale][i]}</button>)}</div>;
}
