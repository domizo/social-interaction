import {defaultTokens,tokenBounds,type SocialTokens,type SocialVariant} from '../../lib/index.js';
import {minimumAccentContrast,type EditableToken} from '../Inspector.js';
import {variantInfo,variants,words} from '../content.js';
import type {StudioConfig} from './config.js';
type Props={config:StudioConfig;onChange:(config:StudioConfig)=>void;locale:'en'|'ja';reduced:boolean;onReduced:(value:boolean)=>void;targets:boolean;onTargets:(value:boolean)=>void;isolate:boolean;onIsolate:(value:boolean)=>void;variable:EditableToken;onVariable:(value:EditableToken)=>void};
/** A single owner for appearance and surface-feedback settings. Glyph motion lives in Motion. */
export function StudioControls({config,onChange,locale,reduced,onReduced,targets,onTargets,isolate,onIsolate,variable,onVariable}:Props){
 const ja=locale==='ja',t=words[locale];
 const labels:Record<keyof SocialTokens,string>={iconSize:t.iconSize,strokeWidth:t.strokeWidth,gap:t.gap,hitTarget:t.hitTarget,accent:t.accent,duration:ja?'表面の反応時間':'Surface feedback duration',amplitude:ja?'押し込みの深さ':'Press depth'};
 const setToken=(key:keyof SocialTokens,value:number|string)=>onChange({...config,tokens:{...config.tokens,[key]:value}});
 const ranges=(keys:Array<Exclude<keyof SocialTokens,'accent'>>)=>keys.map(key=><label key={key}><span>{labels[key]} <output>{config.tokens[key]} {key==='duration'?'ms':key==='amplitude'?'%':'px'}</output></span><input type="range" aria-label={labels[key]} min={tokenBounds[key][0]} max={tokenBounds[key][1]} step={key==='strokeWidth'?.1:key==='amplitude'?.5:key==='duration'?10:1} disabled={isolate&&variable!==key} value={config.tokens[key]} onChange={e=>setToken(key,Number(e.target.value))}/></label>);
 return <aside className="studio-controls unified-appearance" aria-label={ja?'見た目の共有設定':'Shared appearance settings'}>
  <div><span className="studio-step">02 / {ja?'見た目を調整':'TUNE THE DETAILS'}</span><h2>{ja?'見た目の設定を、ひとつの場所で。':'Tune the details.'}</h2></div>
  <div className="studio-controls-grid">
   <label>{ja?'見た目のスタイル':'Visual style'}<select aria-label={ja?'共有設定の見た目':'Studio visual style'} value={config.variant} onChange={e=>onChange({...config,variant:e.target.value as SocialVariant})}>{variants.map(v=><option value={v} key={v}>{variantInfo[v].name[locale]}</option>)}</select></label>
   <label>{ja?'ボタンの表示':'Button presentation'}<select aria-label={ja?'ボタンの表示':'Button presentation'} value={config.presentation} onChange={e=>onChange({...config,presentation:e.target.value as StudioConfig['presentation']})}><option value="labelled">{ja?'ラベルと件数':'Labels & counts'}</option><option value="icon-only">{ja?'アイコンのみ':'Icons only'}</option></select></label>
   {ranges(['iconSize','strokeWidth','gap','hitTarget'])}
   <label className="studio-accent">{t.accent}<input type="color" aria-label={t.accent} value={config.tokens.accent} disabled={isolate&&variable!=='accent'} onChange={e=>setToken('accent',e.target.value)}/><code>{config.tokens.accent.toUpperCase()}</code></label>
  </div>
  <div className="appearance-options"><label><input type="checkbox" checked={reduced} onChange={e=>onReduced(e.target.checked)}/>{ja?'プレビューの動きを抑える':'Reduce preview motion'}</label><label><input type="checkbox" checked={targets} onChange={e=>onTargets(e.target.checked)}/>{t.targets}</label></div>
  <details className="appearance-feedback"><summary>{ja?'表面のホバー・押下の反応':'Surface hover & press feedback'}</summary><div className="studio-controls-grid">{ranges(['duration','amplitude'])}</div><p>{ja?'ボタン表面の反応です。アイコンの動きは「動き」で選びます。':'Button-surface feedback. Choose glyph animations in Motion.'}</p></details>
  <div className="appearance-comparison-controls"><button type="button" className="outline-button" aria-pressed={isolate} onClick={()=>onIsolate(!isolate)}>{t.isolate}</button>{isolate&&<label>{t.variable}<select aria-label={t.variable} value={variable} onChange={e=>onVariable(e.target.value as EditableToken)}>{(['iconSize','strokeWidth','gap','duration','amplitude','accent'] as const).map(key=><option key={key} value={key}>{labels[key]}</option>)}</select></label>}<button type="button" className="text-button" onClick={()=>onChange({...config,tokens:{...defaultTokens}})}>{t.reset}</button></div>
  {minimumAccentContrast(config.tokens.accent)<4.5&&<p className="studio-warning" role="status">{t.contrastWarning}</p>}
 </aside>;
}
