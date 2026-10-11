import {describe, expect, it, vi} from 'vitest';
import {actionLabels, socialActions, tokenBounds} from '../src/lib/index.js';
import {defaultStudioConfig, generateReactUsage, MAX_CONFIG_BYTES, parsePresetCollection, parseStudioConfig, serializePresets, type StudioConfig} from '../src/app/studio/config.js';

const fresh = (): StudioConfig => JSON.parse(JSON.stringify(defaultStudioConfig));

describe('strict Studio configuration', () => {
  it('round-trips all configuration without mutating or retaining input references', () => {
    const original = fresh();
    original.context = 'chat'; original.variant = 'solid'; original.iconMotion = 'none';
    original.actions = socialActions.map(action => ({action, label: {...actionLabels[action]}}));
    original.actions[0].label.en = 'Appreciate'; original.tokens.accent = '#123ABC';
    const result = parseStudioConfig(JSON.stringify(original));
    expect(result).toEqual(original);
    const cloned = parseStudioConfig(original);
    cloned.actions[0].label.en = 'Changed'; cloned.tokens.gap = 4;
    expect(original.actions[0].label.en).toBe('Appreciate');
    expect(original.tokens.gap).toBe(defaultStudioConfig.tokens.gap);
  });
  it.each([null, [], '', '{', 12, true, JSON.stringify({schemaVersion: 2})])('rejects invalid roots: %j', input => {
    expect(() => parseStudioConfig(input)).toThrow();
  });
  it('rejects unsupported schema and all unsupported enum choices', () => {
    for (const [key, value] of [['schemaVersion', 2], ['context', 'embed'], ['variant', 'custom'], ['iconMotion', 'wobble']]) {
      expect(() => parseStudioConfig({...fresh(), [key]: value})).toThrow();
    }
    const config = fresh();
    (config.actions[0] as {action: string}).action = '<script>';
    expect(() => parseStudioConfig(config)).toThrow();
  });
  it('rejects unknown properties at every object level, including prototype pollution keys', () => {
    const paths = ['', 'tokens', 'motionTokens', 'actions.0', 'actions.0.label'];
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

describe('preset schema', () => {
  it('round-trips versioned named presets with literal names', () => {
    const presets = [{name: '<b>My preset</b>', config: fresh()}];
    expect(parsePresetCollection(serializePresets(presets))).toEqual(presets);
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
  it('includes the chosen config and controlled local command semantics', () => {
    const config = fresh(); config.context = 'article'; config.tokens.gap = 9;
    config.actions.push({action: 'bookmark', label: {en: 'Keep it', ja: 'とっておく'}});
    const generated = generateReactUsage(config, 'ja');
    for (const expected of ["import '@social-interaction-lab/react/styles.css'", '"gap": 9', '"context": "article"', 'とっておく', 'const locale = "ja"', 'selected={isToggleAction', 'onCommand?.(command)', 'role="menu"', '<form ', 'useState', 'onKeyDown', 'readOnly value={fallbackLink}']) expect(generated).toContain(expected);
    expect(generated).not.toContain('eval(');
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
