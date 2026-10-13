import {useEffect,useRef,useState} from 'react';
import {defaultStudioConfig,parseStudioConfig,MAX_CONFIG_BYTES,type StudioConfig} from './studio/config.js';
import type {EditableToken} from './Inspector.js';
import type {Locale} from './content.js';
// Retain the original storage identity across the Social Interaction rename.
export const WORKING_DRAFT_KEY='social-interaction-lab:working-draft:v1';
const initialComparison={isolate:false,variable:'gap' as EditableToken};
export function readWorkingDraft(storage:Pick<Storage,'getItem'>){
 try{const raw=storage.getItem(WORKING_DRAFT_KEY);if(raw===null)return {config:parseStudioConfig(defaultStudioConfig),locale:'en' as Locale,comparison:initialComparison,issue:null};if(raw.length>MAX_CONFIG_BYTES)throw Error('Too large');const value=JSON.parse(raw);if(!value||Array.isArray(value)||!['config,locale,schemaVersion','comparison,config,locale,schemaVersion'].includes(Object.keys(value).sort().join(','))||value.schemaVersion!==1||!['en','ja'].includes(value.locale))throw Error('Invalid working draft');const comparison=value.comparison??initialComparison;if(!comparison||Array.isArray(comparison)||Object.keys(comparison).sort().join(',')!=='isolate,variable'||typeof comparison.isolate!=='boolean'||!['iconSize','strokeWidth','gap','duration','amplitude','accent'].includes(comparison.variable))throw Error('Invalid comparison mode');return {config:parseStudioConfig(value.config),locale:value.locale as Locale,comparison:{isolate:comparison.isolate as boolean,variable:comparison.variable as EditableToken},issue:null};}catch{return {config:parseStudioConfig(defaultStudioConfig),locale:'en' as Locale,comparison:initialComparison,issue:'read' as const};}
}
export function useWorkingDraft(){
 const [initial]=useState(()=>{try{return readWorkingDraft(window.sessionStorage);}catch{return {config:parseStudioConfig(defaultStudioConfig),locale:'en' as Locale,comparison:initialComparison,issue:'read' as const};}});
 const [config,setConfigState]=useState(initial.config),[locale,setLocaleState]=useState<Locale>(initial.locale),[issue,setIssue]=useState<'read'|'write'|null>(initial.issue),dirty=useRef(false),[isolate,setIsolateState]=useState(initial.comparison.isolate),[variable,setVariableState]=useState<EditableToken>(initial.comparison.variable);
 const setConfig=(next:StudioConfig|((current:StudioConfig)=>StudioConfig))=>{dirty.current=true;setConfigState(current=>parseStudioConfig(typeof next==='function'?next(current):next));};
 const setIsolate=(next:boolean)=>{dirty.current=true;setIsolateState(next);};
 const setVariable=(next:EditableToken)=>{dirty.current=true;setVariableState(next);};
 const setLocale=(next:Locale)=>{dirty.current=true;setLocaleState(next);};
 useEffect(()=>{if(!dirty.current)return;try{window.sessionStorage.setItem(WORKING_DRAFT_KEY,JSON.stringify({schemaVersion:1,config,locale,comparison:{isolate,variable}}));setIssue(null);}catch{setIssue('write');}},[config,locale,isolate,variable]);
 return {config,setConfig,locale,setLocale,issue,isolate,setIsolate,variable,setVariable};
}
