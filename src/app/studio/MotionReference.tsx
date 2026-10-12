import {useState} from 'react';
import {MotionLab} from '../MotionLab.js';
import type {IconMotion,IconMotionTokens} from '../../lib/index.js';
import type {StudioConfig} from './config.js';
/** Exploratory reference settings have no write access to the shared Studio config. */
export function MotionReference({config,locale,reduced,active,view}:{config:StudioConfig;locale:'en'|'ja';reduced:boolean;active:boolean;view:'catalog'|'treatments'}){
 const [motion,setMotion]=useState<IconMotion|null>(null),[tokens,setTokens]=useState<IconMotionTokens|null>(null),[configured,setConfigured]=useState(true);
 return <MotionLab referenceOnly view={view} active={active} actions={config.actions} presentation={config.presentation} locale={locale} tokens={config.tokens} motionTokens={tokens??config.motionTokens} onMotionTokens={setTokens} selectedMotion={configured?config.iconMotion:motion??config.iconMotion} onSelect={value=>{setMotion(value);setConfigured(false);}} catalogConfigured={configured} onCatalogConfigured={setConfigured} motionOverrides={config.motionOverrides} reduced={reduced} onReduced={()=>{}}/>;
}
