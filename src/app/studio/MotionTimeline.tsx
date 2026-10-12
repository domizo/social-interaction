import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {ActionIcon,iconMotions,tokenStyle,createGlyphTimeline,type SocialAction,type GlyphTimeline,type GlyphTimelineState,type IconMotion} from '../../lib/index.js';
import type {StudioConfig} from './config.js';
import './timeline.css';
const initial:GlyphTimelineState={time:0,duration:0,playing:false,rate:1,reducedMotion:false,supported:true};
export function MotionTimeline({config,locale,reducedMotion,onMotion,active=true}:{config:StudioConfig;locale:'en'|'ja';reducedMotion:boolean;onMotion:(motion:IconMotion)=>void;active?:boolean}){
 const ja=locale==='ja',[preferredAction,setAction]=useState<SocialAction>('comment'),[state,setState]=useState(initial),[rate,setRate]=useState(1),svg=useRef<SVGSVGElement>(null),controller=useRef<GlyphTimeline|null>(null);
 const selectedAction=config.actions.find(item=>item.action===preferredAction)??config.actions[0],action=selectedAction.action,label=selectedAction.label[locale];
 useEffect(()=>{if(preferredAction!==action)setAction(action);},[preferredAction,action]);
 const {duration,intensity,stagger}=config.motionTokens;
 const retained=useRef<{key:string;time:number;inspected:boolean}|null>(null),inspected=useRef(false);
 const timelineKey=[action,config.iconMotion,duration,intensity,stagger,reducedMotion].join(':');
 // A hidden panel owns no controller, animation, frame, watchdog, or media listener.
 // Save its inspected position before destruction; returning never resumes playback.
 useLayoutEffect(()=>{
  if(!active||!svg.current)return;
  const c=createGlyphTimeline(svg.current,{action,iconMotion:config.iconMotion,motionTokens:{duration,intensity,stagger},reducedMotion,onUpdate:next=>{if(controller.current===c)setState(next);}});
  controller.current=c;
  const previous=retained.current;inspected.current=previous?.key===timelineKey&&previous.inspected;
  if(inspected.current&&previous)c.seek(previous.time);
  setState(c.getState());
  return()=>{
   c.pause();const snapshot=c.getState();
   retained.current={key:timelineKey,time:snapshot.time,inspected:inspected.current};
   c.destroy();if(controller.current===c)controller.current=null;
   setState({...snapshot,playing:false});
  };
 },[active,timelineKey,action,config.iconMotion,duration,intensity,stagger,reducedMotion]);
 const seek=(time:number)=>{if(!active||!controller.current)return;inspected.current=true;controller.current.seek(time);};
 const inactive=!active||state.reducedMotion||!state.supported||!state.duration;
 const markers=action==='comment'&&config.iconMotion==='cartoon'?[[0,ja?'小さな円':'Small circle'],[.75,ja?'完成・頂点':'Formed · peak'],[.87,ja?'着地':'Landing'],[.93,ja?'跳ね返り':'Rebound'],[1,ja?'静止':'Rest']] as const:[[0,ja?'開始':'Start'],[.5,ja?'時間の中間':'Time midpoint'],[1,ja?'完了':'Complete']] as const;
 return <section id="timeline" className="motion-timeline section-anchor" aria-labelledby="timeline-title"><div className="studio-heading"><span className="studio-step">03 / {ja?'動きを理解する':'UNDERSTAND THE MOTION'}</span><h2 id="timeline-title">{ja?'時間をほどいて見る。':'A closer look at time.'}</h2><p>{ja?'同じ再生処理を一時停止し、途中の形を調べます。元のモーションは変えません。':'Pause the same playback engine and inspect its intermediate shapes.'}</p></div>
 <div className="timeline-body"><div className="timeline-stage" style={tokenStyle(config.tokens)}><div className="timeline-grid" aria-hidden="true"/><div className="timeline-specimen" role="img" aria-label={`${label} · ${config.iconMotion}`}><span className="sil-icon-wrap"><ActionIcon key={action} ref={svg} action={action}/></span></div><span className="timeline-stage-caption">{label} / {config.iconMotion} · {ja?'2倍表示':'2× magnified'}</span></div>
 <div className="timeline-console"><div className="timeline-selects"><label>{ja?'調べるアイコン':'Inspect icon'}<select aria-label={ja?'時間軸のアイコン':'Timeline icon'} value={action} onChange={e=>setAction(e.target.value as SocialAction)}>{config.actions.map(item=><option value={item.action} key={item.action}>{item.label[locale]}</option>)}</select></label><label>{ja?'モーション':'Treatment'}<select aria-label={ja?'時間軸のモーション':'Timeline treatment'} value={config.iconMotion} onChange={e=>onMotion(e.target.value as IconMotion)}>{[...iconMotions,'none'].map(m=><option key={m} value={m}>{m}</option>)}</select></label><label>{ja?'再生速度':'Playback speed'}<select aria-label={ja?'時間軸の再生速度':'Timeline playback speed'} value={rate} onChange={e=>{const value=Number(e.target.value);setRate(value);if(state.playing)controller.current?.play(value);}}><option value="0.25">0.25×</option><option value="0.5">0.5×</option><option value="1">1×</option></select></label></div>
 <div className="timeline-readout"><output aria-live="off">{Math.round(state.time)} <span>/ {Math.round(state.duration)} ms</span></output><span>{state.playing?(ja?'再生中':'Playing'):(ja?'停止中':'Paused')}</span></div>
 <label className="timeline-scrubber"><span className="sr-only">{ja?'再生位置':'Timeline position'}</span><input type="range" min="0" max={state.duration||1} step="1" disabled={inactive} value={state.time} aria-label={ja?'再生位置':'Timeline position'} aria-valuetext={`${Math.round(state.time)} / ${Math.round(state.duration)} ms`} onChange={e=>seek(Number(e.target.value))}/></label>
 <div className="timeline-markers">{markers.map(([fraction,label])=><button type="button" key={fraction} disabled={inactive} onClick={()=>seek(fraction*state.duration)}><strong>{label}</strong><span>{Math.round(fraction*state.duration)} ms</span></button>)}</div>
 <div className="timeline-transport"><button type="button" className="primary-button" disabled={inactive} onClick={()=>{inspected.current=true;state.playing?controller.current?.pause():controller.current?.play(rate);}}>{state.playing?(ja?'一時停止':'Pause timeline'):(ja?'再生':'Play timeline')}</button><button type="button" className="outline-button" disabled={inactive} onClick={()=>seek(state.time-1000/60)} aria-label={ja?'1コマ戻る':'Previous frame'}>← {ja?'1コマ':'Frame'}</button><button type="button" className="outline-button" disabled={inactive} onClick={()=>seek(state.time+1000/60)} aria-label={ja?'1コマ進む':'Next frame'}>{ja?'1コマ':'Frame'} →</button><button type="button" className="text-button" onClick={()=>{inspected.current=false;controller.current?.stop();}}>{ja?'基本形へ戻す':'Reset timeline'}</button></div>
 <p className="timeline-note" role="status">{state.reducedMotion?(ja?'動きを抑える設定のため基本形を表示しています。':'Reduced motion is enabled; the canonical icon remains visible.'):!state.supported?(ja?'この環境では再生を利用できません。基本形を表示します。':'This environment cannot play this treatment; the canonical icon remains visible.'):!state.duration?(ja?'時間または強さが0、または静止が選ばれています。':'Duration or intensity is zero, or Still is selected.'):ja?'コマ送りは約16.7 ms。キーボードの矢印・Home・Endでも位置を変更できます。合計時間にはパーツの時間差も含みます。':'Frame steps are ~16.7 ms. Arrow keys, Home and End also seek. Total time includes part stagger.'}</p>
 </div></div></section>;
}
