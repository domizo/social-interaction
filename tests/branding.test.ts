import {readFileSync} from 'node:fs';
import {expect,it} from 'vitest';
import {defaultStudioConfig,generateReactUsage,parsePresetCollection,PRESET_STORAGE_KEY,serializePresets} from '../src/app/studio/config.js';
import {readWorkingDraft,WORKING_DRAFT_KEY} from '../src/app/workingDraft.js';
import {tokensToDTCG} from '../src/lib/tokens.js';

it('aligns the visible brand, package and generated imports with Social Interaction',()=>{
 const pkg=JSON.parse(readFileSync('package.json','utf8'));
 expect(pkg.name).toBe('social-interaction');
 expect(readFileSync('index.html','utf8')).toContain('<title>Social Interaction</title>');
 expect(readFileSync('src/app/App.tsx','utf8')).not.toContain('Social Interaction Lab');
 expect(tokensToDTCG().$description).toMatch(/^Social Interaction\./);
 for(const locale of ['en','ja'] as const){const code=generateReactUsage(defaultStudioConfig,locale);expect(code).toContain("from '@social-interaction/react'");expect(code).toContain("import '@social-interaction/react/styles.css'");expect(code).not.toContain('@social-interaction-lab/');}
});
it('retains named presets written under the former branding without migration or data loss',()=>{
 expect(PRESET_STORAGE_KEY).toBe('social-interaction-lab:studio-presets:v1');
 const config={...defaultStudioConfig,presentation:'icon-only' as const,actions:[defaultStudioConfig.actions[2],defaultStudioConfig.actions[0]],motionOverrides:{like:'trace' as const}};
 const legacy=JSON.stringify({schemaVersion:1,presets:[{name:'Saved before rename',config}]});
 localStorage.setItem('social-interaction-lab:studio-presets:v1',legacy);
 const presets=parsePresetCollection(localStorage.getItem(PRESET_STORAGE_KEY));
 expect(presets).toEqual([{name:'Saved before rename',config}]);
 expect(parsePresetCollection(serializePresets(presets))).toEqual(presets);
 expect(localStorage.getItem(PRESET_STORAGE_KEY)).toBe(legacy);
 localStorage.removeItem(PRESET_STORAGE_KEY);
});
it('retains session settings, locale and comparison choices written before the rename',()=>{
 expect(WORKING_DRAFT_KEY).toBe('social-interaction-lab:working-draft:v1');
 const saved={schemaVersion:1,config:defaultStudioConfig,locale:'ja',comparison:{isolate:true,variable:'iconSize'}};
 sessionStorage.setItem('social-interaction-lab:working-draft:v1',JSON.stringify(saved));
 expect(readWorkingDraft(sessionStorage)).toEqual({config:defaultStudioConfig,locale:'ja',comparison:{isolate:true,variable:'iconSize'},issue:null});
 expect(JSON.parse(sessionStorage.getItem(WORKING_DRAFT_KEY)!)).toEqual(saved);
 sessionStorage.removeItem(WORKING_DRAFT_KEY);
});
