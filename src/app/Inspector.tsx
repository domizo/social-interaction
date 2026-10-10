import {defaultTokens,tokenBounds,type SocialTokens} from '../lib/index.js';
import {words,type Locale} from './content.js';
export type EditableToken=Exclude<keyof SocialTokens,'hitTarget'>;
const controls:[Exclude<EditableToken,'accent'>,string,number][]=[['iconSize','px',1],['strokeWidth','px',.1],['gap','px',1],['duration','ms',10],['amplitude','%',.5]];
export function contrastOnWhite(hex:string){const c=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4);return 1.05/(.2126*c[0]+.7152*c[1]+.0722*c[2]+.05);}
export function Inspector({locale,tokens,onChange,isolate,variable,setVariable}:{locale:Locale;tokens:SocialTokens;onChange:(t:SocialTokens)=>void;isolate:boolean;variable:EditableToken;setVariable:(v:EditableToken)=>void}){
 const t=words[locale];return <aside className="inspector" aria-label={t.tune}><h2>{t.tune}</h2>{isolate&&<label className="select-label">{t.variable}<select value={variable} onChange={e=>setVariable(e.target.value as EditableToken)}>{[...controls.map(c=>c[0]),'accent'].map(key=><option key={key} value={key}>{t[key as EditableToken]}</option>)}</select></label>}
 {controls.map(([key,unit,step])=><label className="range-field" key={key}><span>{t[key]}<output>{tokens[key]} <span>{unit}</span></output></span><input aria-label={t[key]} type="range" min={tokenBounds[key][0]} max={tokenBounds[key][1]} step={step} value={tokens[key]} disabled={isolate&&variable!==key} onChange={e=>onChange({...tokens,[key]:Number(e.target.value)})}/></label>)}
 <label className="color-field"><span>{t.accent}</span><input type="color" aria-label={t.accent} value={tokens.accent} disabled={isolate&&variable!=='accent'} onChange={e=>onChange({...tokens,accent:e.target.value})}/><code>{tokens.accent.toUpperCase()}</code></label>
 {contrastOnWhite(tokens.accent)<4.5&&<p className="warning">{t.contrastWarning}</p>}<div className="inspector-foot"><span>{t.hitTarget}<strong>{tokens.hitTarget} px</strong></span><button className="text-button" onClick={()=>onChange({...defaultTokens})}>{t.reset}</button></div>
 </aside>;
}
