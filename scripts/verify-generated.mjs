/** Compile generated examples against the actual package archive without installing dependencies. */
import {mkdtemp, mkdir, readFile, writeFile, symlink, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import ts from 'typescript';
import {build} from 'vite';

const root = process.cwd();
const {version} = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
const archive = resolve(root, `public/downloads/social-interaction-react-${version}.tgz`);
const temp = await mkdtemp(join(tmpdir(), 'social-generated-'));
try {
  // The archive is produced by build:package. This test deliberately uses its declarations and CSS export.
  execFileSync('tar', ['-xzf', archive, '-C', temp], {stdio: 'inherit'});
  await mkdir(join(temp, 'node_modules', '@social-interaction'), {recursive: true});
  await symlink(join(temp, 'package'), join(temp, 'node_modules', '@social-interaction', 'react'), 'dir');
  for (const name of ['react', 'react-dom', '@types', 'csstype']) {
    await symlink(join(root, 'node_modules', name), join(temp, 'node_modules', name), 'dir');
  }
  await writeFile(join(temp, 'package.json'), JSON.stringify({name: 'generated-social-consumer', private: true, type: 'module'}));
  const source = await readFile(join(root, 'src/app/studio/config.ts'), 'utf8');
  const compiled = ts.transpileModule(source, {compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext}}).outputText;
  await writeFile(join(temp, 'generator.mjs'), compiled.replaceAll('../../lib/index.js', pathToFileURL(join(temp, 'package/dist/index.js')).href));
  const {defaultStudioConfig, generateReactUsage, parseStudioConfig} = await import(pathToFileURL(join(temp, 'generator.mjs')).href);
  const {socialActions, actionLabels} = await import(pathToFileURL(join(temp, 'package/dist/index.js')).href);
  const {motionOverrides: _overrides, presentation: _presentation, ...legacyConfig} = defaultStudioConfig;
  const cases = [
    ['default', defaultStudioConfig],
    ['legacy', legacyConfig],
    ['mixed', {...defaultStudioConfig, iconMotion: 'gesture', motionOverrides: {like: 'none', comment: 'cartoon', share: 'spring', quote: 'trace', repost: 'cartoon', bookmark: 'pulse', note: 'none', star: 'trace', send: 'spring', sparkles: 'pulse', bell: 'cartoon'}, actions: socialActions.map(action => ({action, label: actionLabels[action]}))}],
    ['inactive-overrides', {...defaultStudioConfig, actions: [{action: 'like', label: actionLabels.like}], motionOverrides: {like: 'none', repost: 'cartoon', reaction: 'trace'}}],
    ['icon-only', {...defaultStudioConfig, presentation: 'icon-only', actions: socialActions.map(action => ({action, label: actionLabels[action]}))}],
    ['full', {...defaultStudioConfig, context: 'article', variant: 'solid', iconMotion: 'gesture', actions: socialActions.map(action => ({action, label: actionLabels[action]})), tokens: {...defaultStudioConfig.tokens, iconSize: 28, strokeWidth: 3, gap: 4, hitTarget: 64, duration: 0, amplitude: 8, accent: '#123abc'}, motionTokens: {duration: 1600, intensity: 2, stagger: 160}}],
    ['long-labels', {...defaultStudioConfig, actions: defaultStudioConfig.actions.map(item => item.action === 'like' ? {...item, label: {en: 'W'.repeat(80), ja: '長'.repeat(80)}} : item)}],
    ['single', {...defaultStudioConfig, context: 'chat', iconMotion: 'none', actions: [{action: 'bookmark', label: {en: 'Save "quoted" <text>\\path', ja: '保存 \u2028 テスト'}}]}],
    ['hostile-labels', {...defaultStudioConfig, motionOverrides: {like: 'trace'}, actions: [{action: 'like', label: {en: '</script>"; globalThis.pwned = true; //', ja: '引用 " \\ \u2028 \u2029 </script>'}}]}],
    ['custom', {...defaultStudioConfig, actions: [
      {action: 'reaction', label: {en: 'Feel this', ja: '気持ちを伝える'}},
      {action: 'bookmark', label: {en: 'Keep this', ja: 'あとで読む'}},
      {action: 'repost', label: {en: 'Pass it on', ja: '広める'}},
      {action: 'comment', label: {en: 'Add a thought', ja: 'ひとこと添える'}},
      {action: 'share', label: {en: 'Send a link', ja: 'リンクを共有'}},
    ]}],
  ];
  for (const [name, config] of cases) {
    for (const locale of ['en', 'ja']) {
      const example = generateReactUsage(parseStudioConfig(config), locale);
      if (!example.includes("import '@social-interaction/react/styles.css'")) throw new Error('Generated example must import package CSS');
      if (!example.includes('iconMotion={motionOverrides[item.action] ?? studioConfig.iconMotion}')) throw new Error('Generated example must resolve motion per action');
      if (name === 'hostile-labels') assert.equal(example.includes('</script>'), false);
      await writeFile(join(temp, `${name}-${locale}.tsx`), example);
    }
  }
  // Rejected imported maps never reach generated executable code or invoke accessors/toJSON.
  let executed = false;
  const accessor = Object.defineProperty({}, 'like', {get() {executed = true; return 'pulse';}, enumerable: true});
  const hidden = Object.defineProperty({}, 'like', {value: 'pulse', enumerable: false});
  const rootAccessor = Object.defineProperty({...defaultStudioConfig}, 'motionOverrides', {get() {executed = true; return {};}, enumerable: true});
  for (const motionOverrides of [undefined, null, [], {like: 'inherit'}, {unknown: 'pulse'}, {like: '</script>'}, JSON.parse('{"__proto__":"pulse"}'), {constructor: 'pulse'}, {[Symbol('like')]: 'pulse'}, Object.create(null), Object.create({like: 'pulse'}), accessor, hidden, {toJSON() {executed = true; return {};}}]) {
    assert.throws(() => generateReactUsage({...defaultStudioConfig, motionOverrides}, 'en'), /motionOverrides/);
  }
  assert.throws(() => generateReactUsage(rootAccessor, 'en'), /motionOverrides/);
  assert.equal(executed, false, 'Import validation must never execute supplied accessors or toJSON');
  await writeFile(join(temp, 'css.d.ts'), "declare module '*.css';\n");
  await writeFile(join(temp, 'tsconfig.json'), JSON.stringify({compilerOptions: {strict: true, skipLibCheck: false, module: 'NodeNext', moduleResolution: 'NodeNext', target: 'ES2022', lib: ['ES2022', 'DOM', 'DOM.Iterable'], jsx: 'react-jsx', noEmit: true, noUncheckedSideEffectImports: true}, include: ['*.tsx', 'css.d.ts']}));
  execFileSync(process.execPath, [join(root, 'node_modules/typescript/bin/tsc'), '-p', join(temp, 'tsconfig.json')], {cwd: temp, stdio: 'inherit'});
  const css = await readFile(join(temp, 'package/dist/styles.css'), 'utf8');
  if (!css.includes('prefers-reduced-motion')) throw new Error('Package CSS is missing reduced-motion support');
  // Build a real, isolated consumer for narrow-screen and keyboard browser QA.
  // This output is intentionally outside dist and must never be deployed with the app.
  await writeFile(join(temp, 'index.html'), '<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Generated React consumer QA</title></head><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>');
  await writeFile(join(temp, 'main.tsx'), `import {createRoot} from 'react-dom/client';
import LabelledEnglish from './long-labels-en.tsx';
import LabelledJapanese from './long-labels-ja.tsx';
import IconsEnglish from './icon-only-en.tsx';
import IconsJapanese from './icon-only-ja.tsx';
import CustomEnglish from './custom-en.tsx';
import CustomJapanese from './custom-ja.tsx';
import MixedEnglish from './mixed-en.tsx';
import MixedJapanese from './mixed-ja.tsx';
const query = new URLSearchParams(window.location.search);
const locale = query.get('locale') === 'ja' ? 'ja' : 'en';
const presentation = query.get('presentation') === 'icon-only' ? 'icon-only' : 'labelled';
const examples = {en: {labelled: LabelledEnglish, 'icon-only': IconsEnglish}, ja: {labelled: LabelledJapanese, 'icon-only': IconsJapanese}};
const customExamples = {en: CustomEnglish, ja: CustomJapanese};
const mixedExamples = {en: MixedEnglish, ja: MixedJapanese};
const SocialActions = query.get('set') === 'mixed' ? mixedExamples[locale] : query.get('set') === 'custom' ? customExamples[locale] : examples[locale][presentation];
document.documentElement.lang = locale;
createRoot(document.getElementById('root')!).render(<SocialActions />);
`);
  await build({
    root: temp,
    configFile: false,
    publicDir: false,
    esbuild: {jsx: 'automatic'},
    build: {outDir: resolve(root, 'qa/generated'), emptyOutDir: true},
    logLevel: 'warn',
  });
  console.log('QA fixture ready: qa/generated (default maximum-length Like label; ?presentation=icon-only&locale=en|ja selects icon-only; ?set=custom&locale=en|ja selects the labelled, ordered custom subset; ?set=mixed&locale=en|ja selects mixed motion overrides and inherited Reaction; actual archive stylesheet; excluded from deployment).');
  console.log(`PASS: ${cases.length * 2} generated TSX consumers, EN/JA, labelled, icon-only, full, single-action, maximum-length-label, custom-ordered-subset, legacy, mixed-motion, inactive-override and hostile-label configurations; rejected hostile maps never execute; strict NodeNext types, archive CSS. No dependency installation.`);
} finally { await rm(temp, {recursive: true, force: true}); }
