import {describe, expect, it, vi} from 'vitest';
import {actionLabels, socialActions, tokenBounds} from '../src/lib/index.js';
import {defaultStudioConfig, generateReactUsage, MAX_CONFIG_BYTES, motionForAction, parsePresetCollection, parseStudioConfig, serializePresets, type StudioConfig} from '../src/app/studio/config.js';

const fresh = (): StudioConfig => JSON.parse(JSON.stringify(defaultStudioConfig));

describe('strict Studio configuration', () => {
  it.each(['labelled', 'icon-only'] as const)('round-trips %s configuration without mutating or retaining input references', presentation => {
    const original = fresh();
    original.context = 'chat'; original.variant = 'solid'; original.presentation = presentation; original.iconMotion = 'none';
    original.actions = socialActions.map(action => ({action, label: {...actionLabels[action]}}));
    original.actions[0].label.en = 'Appreciate'; original.tokens.accent = '#123ABC';
    const result = parseStudioConfig(JSON.stringify(original));
    expect(result).toEqual(original);
    const cloned = parseStudioConfig(original);
    cloned.actions[0].label.en = 'Changed'; cloned.tokens.gap = 4;
    expect(original.actions[0].label.en).toBe('Appreciate');
    expect(original.tokens.gap).toBe(defaultStudioConfig.tokens.gap);
  });
  it('normalizes legacy schema v1 objects and JSON to labelled presentation', () => {
    const {presentation, ...legacy} = fresh();
    expect(presentation).toBe('labelled');
    for (const input of [legacy, JSON.stringify(legacy)]) {
      expect(parseStudioConfig(input)).toEqual(defaultStudioConfig);
    }
    expect(Object.hasOwn(legacy, 'presentation')).toBe(false);
    expect(parseStudioConfig({...legacy, presentation: 'icon-only'}).presentation).toBe('icon-only');
  });
  it.each([null, [], '', '{', 12, true, JSON.stringify({schemaVersion: 2})])('rejects invalid roots: %j', input => {
    expect(() => parseStudioConfig(input)).toThrow();
  });
  it('rejects unsupported schema and all unsupported enum choices', () => {
    for (const [key, value] of [['schemaVersion', 2], ['context', 'embed'], ['variant', 'custom'], ['presentation', 'icons'], ['iconMotion', 'wobble']]) {
      expect(() => parseStudioConfig({...fresh(), [key]: value})).toThrow();
    }
    const config = fresh();
    (config.actions[0] as {action: string}).action = '<script>';
    expect(() => parseStudioConfig(config)).toThrow();
  });
  it('defaults presentation only when absent and rejects invalid present values', () => {
    for (const presentation of [undefined, null, '', 'Labelled', 'icon', true, 1, {}, []]) {
      expect(() => parseStudioConfig({...fresh(), presentation})).toThrow(/presentation/);
    }
    const {variant: _variant, ...missingRequired} = fresh();
    expect(() => parseStudioConfig(missingRequired)).toThrow(/missing or unknown property/);
  });
  it('rejects presentation accessors and hidden data without executing imported code', () => {
    const getter = vi.fn(() => 'icon-only');
    const setter = vi.fn();
    for (const descriptor of [
      {get: getter, enumerable: true},
      {set: setter, enumerable: true},
      {value: 'icon-only', enumerable: false},
    ]) {
      const config = fresh();
      Object.defineProperty(config, 'presentation', descriptor);
      expect(() => parseStudioConfig(config)).toThrow(/presentation.*data property/);
    }
    expect(getter).not.toHaveBeenCalled(); expect(setter).not.toHaveBeenCalled();
    const {presentation: _presentation, ...legacy} = fresh();
    expect(() => parseStudioConfig(Object.assign(Object.create({presentation: 'icon-only'}), legacy))).toThrow(/plain object/);
  });
  it('rejects unknown properties at every object level, including prototype pollution keys', () => {
    const paths = ['', 'tokens', 'motionTokens', 'motionOverrides', 'actions.0', 'actions.0.label'];
    for (const path of paths) {
      const config = fresh();
      const target = path.split('.').filter(Boolean).reduce<unknown>((value, key) => (value as Record<string, unknown>)[key], config) as object;
      Object.defineProperty(target, '__proto__', {value: {polluted: true}, enumerable: true});
      expect(() => parseStudioConfig(JSON.stringify(config))).toThrow();
    }
    expect(({} as {polluted?: boolean}).polluted).toBeUndefined();
    expect(() => parseStudioConfig({...fresh(), constructor: 'bad'})).toThrow();
    expect(() => parseStudioConfig({...fresh(), prototype: 'bad'})).toThrow();
  });
  it('rejects custom and null prototypes without reading accessors or invoking toJSON', () => {
    const getter = vi.fn(() => 1);
    const config = fresh();
    Object.defineProperty(config.tokens, 'gap', {get: getter, enumerable: true});
    expect(() => parseStudioConfig(config)).toThrow(); expect(getter).not.toHaveBeenCalled();
    expect(() => parseStudioConfig(Object.assign(Object.create({}), fresh()))).toThrow();
    expect(() => parseStudioConfig(Object.assign(Object.create(null), fresh()))).toThrow();
    const toJSON = vi.fn();
    expect(() => parseStudioConfig({...fresh(), toJSON})).toThrow(); expect(toJSON).not.toHaveBeenCalled();
  });
  it('rejects symbol properties, sparse arrays, array properties, and array accessors', () => {
    expect(() => parseStudioConfig({...fresh(), [Symbol('hidden')]: true})).toThrow();
    const sparse = fresh(); delete sparse.actions[0]; expect(() => parseStudioConfig(sparse)).toThrow();
    const extra = fresh(); Object.assign(extra.actions, {extra: true}); expect(() => parseStudioConfig(extra)).toThrow();
    const accessor = fresh(); const getter = vi.fn(); Object.defineProperty(accessor.actions, '0', {get: getter});
    expect(() => parseStudioConfig(accessor)).toThrow(); expect(getter).not.toHaveBeenCalled();
  });
  it('requires 1–12 unique actions and bounded nonblank bilingual labels', () => {
    expect(() => parseStudioConfig({...fresh(), actions: []})).toThrow();
    expect(() => parseStudioConfig({...fresh(), actions: Array(13).fill(fresh().actions[0])})).toThrow();
    expect(() => parseStudioConfig({...fresh(), actions: [fresh().actions[0], fresh().actions[0]]})).toThrow();
    for (const value of ['', '   ', 'a'.repeat(81), '\nline', '\0', null, 3]) {
      const config = fresh(); (config.actions[0].label as {en: unknown}).en = value;
      expect(() => parseStudioConfig(config)).toThrow();
    }
    const config = fresh(); config.actions[0].label.en = 'a'.repeat(80);
    expect(parseStudioConfig(config).actions[0].label.en).toHaveLength(80);
  });
  it('enforces every token range and never silently clamps nonfinite or invalid values', () => {
    for (const [key, [min, max]] of Object.entries(tokenBounds)) {
      for (const value of [min - .1, max + .1, NaN, Infinity, -Infinity, '20']) {
        expect(() => parseStudioConfig({...fresh(), tokens: {...fresh().tokens, [key]: value}})).toThrow();
      }
      for (const value of [min, max]) expect(parseStudioConfig({...fresh(), tokens: {...fresh().tokens, [key]: value}})).toBeTruthy();
    }
    for (const [key, max] of [['duration', 1600], ['intensity', 2], ['stagger', 160]] as const) {
      for (const value of [-1, max + 1, Infinity]) expect(() => parseStudioConfig({...fresh(), motionTokens: {...fresh().motionTokens, [key]: value}})).toThrow();
    }
    for (const accent of ['red', '#fff', '#12345678', 'url(javascript:evil())', '#GG0000']) expect(() => parseStudioConfig({...fresh(), tokens: {...fresh().tokens, accent}})).toThrow();
  });
  it('rejects oversized JSON in UTF-8 bytes, even when whitespace otherwise parses', () => {
    const json = JSON.stringify(fresh());
    expect(() => parseStudioConfig(' '.repeat(MAX_CONFIG_BYTES) + json)).toThrow(/64 KB/);
    expect(() => parseStudioConfig(JSON.stringify({...fresh(), extra: '日'.repeat(24000)}))).toThrow(/64 KB/);
  });
});

describe('per-action motion configuration', () => {
  const treatments = ['none', 'pulse', 'spring', 'trace', 'gesture', 'cartoon'] as const;
  it('normalizes legacy objects, JSON, and presets to a fresh empty override map', () => {
    const {motionOverrides: _overrides, presentation: _presentation, ...legacy} = fresh();
    for (const input of [legacy, JSON.stringify(legacy)]) {
      const config = parseStudioConfig(input);
      expect(config).toEqual(defaultStudioConfig);
      expect(config.motionOverrides).not.toBe(defaultStudioConfig.motionOverrides);
    }
    const presets = parsePresetCollection({schemaVersion: 1, presets: [{name: 'Legacy', config: legacy}]});
    expect(presets[0].config.motionOverrides).toEqual({});
    expect(parsePresetCollection(serializePresets(presets))).toEqual(presets);
    expect(Object.hasOwn(legacy, 'motionOverrides')).toBe(false);
  });
  it.each(socialActions)('accepts every supported treatment for %s and preserves it without selecting that action', action => {
    for (const motion of treatments) {
      const original = {...fresh(), iconMotion: 'gesture' as const, actions: fresh().actions.filter(item => item.action !== action), motionOverrides: {[action]: motion}};
      const result = parseStudioConfig(original);
      expect(result.actions.some(item => item.action === action)).toBe(false);
      expect(result.motionOverrides).toEqual({[action]: motion});
      expect(motionForAction(result, action)).toBe(motion);
      expect(parseStudioConfig(JSON.stringify(result))).toEqual(result);
      expect(parsePresetCollection(serializePresets([{name: 'Mixed', config: result}]))[0].config).toEqual(result);
      result.motionOverrides[action] = motion === 'none' ? 'cartoon' : 'none';
      expect(original.motionOverrides[action]).toBe(motion);
    }
  });
  it('inherits only absent entries and retains overrides when global motion or selected actions change', () => {
    const config: StudioConfig = {...fresh(), iconMotion: 'spring', motionOverrides: {like: 'none', repost: 'cartoon', reaction: 'trace'}};
    expect(motionForAction(config, 'like')).toBe('none');
    expect(motionForAction(config, 'comment')).toBe('spring');
    expect(motionForAction({iconMotion: 'pulse'}, 'comment')).toBe('pulse');
    const changed = parseStudioConfig({...config, iconMotion: 'gesture', actions: [config.actions[1]]});
    expect(changed.motionOverrides).toEqual(config.motionOverrides);
    expect(motionForAction(changed, 'like')).toBe('none');
    expect(motionForAction(changed, 'comment')).toBe('gesture');
    delete changed.motionOverrides.like;
    expect(motionForAction(changed, 'like')).toBe('gesture');
  });
  it('rejects invalid present maps, keys, and values rather than treating them as inheritance', () => {
    for (const motionOverrides of [undefined, null, [], '', true, 1, Object.create(null), Object.create({like: 'pulse'})]) {
      expect(() => parseStudioConfig({...fresh(), motionOverrides})).toThrow(/motionOverrides/);
    }
    for (const key of ['unknown', 'Like', 'constructor', 'prototype', '__proto__']) {
      const motionOverrides = Object.fromEntries([[key, 'pulse']]);
      expect(() => parseStudioConfig({...fresh(), motionOverrides})).toThrow(/motionOverrides/);
      expect(() => parseStudioConfig(JSON.stringify({...fresh(), motionOverrides}))).toThrow(/motionOverrides/);
    }
    for (const value of [undefined, null, '', 'inherit', 'Pulse', 'wobble', false, 0, {}, []]) {
      expect(() => parseStudioConfig({...fresh(), motionOverrides: {like: value}})).toThrow(/motionOverrides.like/);
    }
    expect(() => parseStudioConfig({...fresh(), motionOverrides: {[Symbol('like')]: 'pulse'}})).toThrow(/motionOverrides/);
  });
  it('rejects root/map accessors and hidden properties without executing imported code', () => {
    const getter = vi.fn(() => 'cartoon'), setter = vi.fn(), toJSON = vi.fn();
    for (const descriptor of [{get: getter, enumerable: true}, {set: setter, enumerable: true}, {value: 'pulse', enumerable: false}]) {
      const config = fresh();
      Object.defineProperty(config.motionOverrides, 'like', descriptor);
      expect(() => parseStudioConfig(config)).toThrow(/motionOverrides.like.*data property/);
      expect(() => generateReactUsage(config, 'en')).toThrow(/motionOverrides.like.*data property/);
      expect(() => parsePresetCollection({schemaVersion: 1, presets: [{name: 'Unsafe', config}]})).toThrow(/motionOverrides/);
      const root = fresh();
      Object.defineProperty(root, 'motionOverrides', descriptor);
      expect(() => parseStudioConfig(root)).toThrow(/motionOverrides.*data property/);
    }
    expect(() => parseStudioConfig({...fresh(), motionOverrides: {toJSON}})).toThrow(/motionOverrides/);
    expect(getter).not.toHaveBeenCalled(); expect(setter).not.toHaveBeenCalled(); expect(toJSON).not.toHaveBeenCalled();
  });
});

describe('preset schema', () => {
  it('round-trips versioned named presets with literal names', () => {
    const presets = [{name: '<b>My preset</b>', config: fresh()}];
    expect(parsePresetCollection(serializePresets(presets))).toEqual(presets);
  });
  it('retains icon-only presets and normalizes legacy schema v1 presets to labelled', () => {
    const {presentation: _presentation, ...legacy} = fresh();
    const input = {schemaVersion: 1, presets: [
      {name: 'Icons', config: {...fresh(), presentation: 'icon-only'}},
      {name: 'Legacy', config: legacy},
    ]};
    const parsed = parsePresetCollection(JSON.stringify(input));
    expect(parsed.map(preset => preset.config.presentation)).toEqual(['icon-only', 'labelled']);
    expect(parsePresetCollection(serializePresets(parsed))).toEqual(parsed);
    expect(parsed.every(preset => preset.config.schemaVersion === 1)).toBe(true);
  });
  it('rejects invalid presentation in presets without invoking accessors', () => {
    const getter = vi.fn(() => 'icon-only');
    const config = fresh();
    Object.defineProperty(config, 'presentation', {get: getter, enumerable: true});
    expect(() => parsePresetCollection({schemaVersion: 1, presets: [{name: 'Unsafe', config}]})).toThrow(/presentation/);
    expect(getter).not.toHaveBeenCalled();
    expect(() => parsePresetCollection({schemaVersion: 1, presets: [{name: 'Invalid', config: {...fresh(), presentation: undefined}}]})).toThrow(/presentation/);
  });
  it('rejects corrupt, unknown-schema, conflicting and oversized collections', () => {
    expect(() => parsePresetCollection('garbage')).toThrow();
    expect(() => parsePresetCollection({schemaVersion: 2, presets: []})).toThrow();
    expect(() => serializePresets([{name: ' Test ', config: fresh()}, {name: 'test', config: fresh()}])).toThrow();
    expect(() => serializePresets([{name: 'x'.repeat(61), config: fresh()}])).toThrow();
    expect(() => serializePresets(Array.from({length: 21}, (_, i) => ({name: `Preset ${i}`, config: fresh()})))).toThrow();
  });
});

describe('runnable React export', () => {
  it.each(['en', 'ja'] as const)('retains mixed, explicit-none and inactive-action overrides in %s exports', locale => {
    const config: StudioConfig = {...fresh(), iconMotion: 'gesture', motionOverrides: {like: 'none', comment: 'cartoon', repost: 'trace'}};
    const generated = generateReactUsage(config, locale);
    expect(generated).toContain('"motionOverrides": {');
    for (const [action, motion] of Object.entries(config.motionOverrides)) expect(generated).toContain(`"${action}": "${motion}"`);
    expect(generated).toContain('const motionOverrides: Partial<Record<SocialAction, IconMotion>> = studioConfig.motionOverrides;');
    expect(generated).toContain('iconMotion={motionOverrides[item.action] ?? studioConfig.iconMotion}');
    expect(generated).not.toContain('iconMotion={studioConfig.iconMotion}');
  });
  it('includes the chosen config and controlled local command semantics', () => {
    const config = fresh(); config.context = 'article'; config.tokens.gap = 9;
    config.actions.push({action: 'bookmark', label: {en: 'Keep it', ja: 'とっておく'}});
    const generated = generateReactUsage(config, 'ja');
    for (const expected of ["import '@social-interaction-lab/react/styles.css'", '"gap": 9', '"context": "article"', 'とっておく', 'const locale = "ja"', 'selected={isToggleAction', 'onCommand?.(command)', 'role="menu"', '<form ', 'useState', 'onKeyDown', 'readOnly value={fallbackLink}']) expect(generated).toContain(expected);
    expect(generated).not.toContain('eval(');
  });
  it.each(['en', 'ja'] as const)('exports selected presentation and accessible labels in %s', locale => {
    for (const presentation of ['labelled', 'icon-only'] as const) {
      const config = fresh(); config.presentation = presentation;
      const generated = generateReactUsage(config, locale);
      expect(generated).toContain(`"presentation": "${presentation}"`);
      expect(generated).toContain('presentation={studioConfig.presentation}');
      expect(generated).toContain('label={item.label[locale]}');
      expect(generated).toContain(`const locale = "${locale}"`);
      for (const action of config.actions) expect(generated).toContain(action.label[locale]);
    }
  });
  it('wraps maximum-length action labels inside a narrow standalone layout', () => {
    const config = fresh(); config.actions[0].label = {en: 'W'.repeat(80), ja: '長'.repeat(80)};
    for (const locale of ['en', 'ja'] as const) {
      const generated = generateReactUsage(config, locale);
      expect(generated).toContain('W'.repeat(80)); expect(generated).toContain('長'.repeat(80));
      expect(generated).toContain("style={{maxWidth: '100%', boxSizing: 'border-box', whiteSpace: 'normal', overflowWrap: 'anywhere'}}");
      expect(generated).toContain("fontFamily: 'system-ui, sans-serif', overflowWrap: 'anywhere'");
    }
  });
  it('keeps malicious-looking labels inside escaped string literals', () => {
    const config = fresh(); config.actions[0].label.en = '</script>"; globalThis.pwned = true; //';
    const generated = generateReactUsage(config, 'en');
    expect(generated).not.toContain('</script>');
    expect(generated).toContain('\\u003c/script>\\"; globalThis.pwned = true; //');
    expect(() => generateReactUsage({...config, schemaVersion: 2} as unknown as StudioConfig, 'en')).toThrow();
  });
});
