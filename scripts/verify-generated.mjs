/** Compile generated examples against the actual package archive without installing dependencies. */
import {mkdtemp, mkdir, readFile, writeFile, symlink, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import ts from 'typescript';
import {build} from 'vite';

const root = process.cwd();
const {version} = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
const archive = resolve(root, `public/downloads/social-interaction-lab-react-${version}.tgz`);
const temp = await mkdtemp(join(tmpdir(), 'social-generated-'));
try {
  // The archive is produced by build:package. This test deliberately uses its declarations and CSS export.
  execFileSync('tar', ['-xzf', archive, '-C', temp], {stdio: 'inherit'});
  await mkdir(join(temp, 'node_modules', '@social-interaction-lab'), {recursive: true});
  await symlink(join(temp, 'package'), join(temp, 'node_modules', '@social-interaction-lab', 'react'), 'dir');
  for (const name of ['react', 'react-dom', '@types', 'csstype']) {
    await symlink(join(root, 'node_modules', name), join(temp, 'node_modules', name), 'dir');
  }
  await writeFile(join(temp, 'package.json'), JSON.stringify({name: 'generated-social-consumer', private: true, type: 'module'}));
  const source = await readFile(join(root, 'src/app/studio/config.ts'), 'utf8');
  const compiled = ts.transpileModule(source, {compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext}}).outputText;
  await writeFile(join(temp, 'generator.mjs'), compiled.replaceAll('../../lib/index.js', pathToFileURL(join(temp, 'package/dist/index.js')).href));
  const {defaultStudioConfig, generateReactUsage, parseStudioConfig} = await import(pathToFileURL(join(temp, 'generator.mjs')).href);
  const {socialActions, actionLabels} = await import(pathToFileURL(join(temp, 'package/dist/index.js')).href);
  const cases = [
    ['default', defaultStudioConfig],
    ['icon-only', {...defaultStudioConfig, presentation: 'icon-only', actions: socialActions.map(action => ({action, label: actionLabels[action]}))}],
    ['full', {...defaultStudioConfig, context: 'article', variant: 'solid', iconMotion: 'gesture', actions: socialActions.map(action => ({action, label: actionLabels[action]})), tokens: {...defaultStudioConfig.tokens, iconSize: 28, strokeWidth: 3, gap: 4, hitTarget: 64, duration: 0, amplitude: 8, accent: '#123abc'}, motionTokens: {duration: 1600, intensity: 2, stagger: 160}}],
    ['long-labels', {...defaultStudioConfig, actions: defaultStudioConfig.actions.map(item => item.action === 'like' ? {...item, label: {en: 'W'.repeat(80), ja: '長'.repeat(80)}} : item)}],
    ['single', {...defaultStudioConfig, context: 'chat', iconMotion: 'none', actions: [{action: 'bookmark', label: {en: 'Save "quoted" <text>\\path', ja: '保存 \u2028 テスト'}}]}],
  ];
  for (const [name, config] of cases) {
    for (const locale of ['en', 'ja']) {
      const example = generateReactUsage(parseStudioConfig(config), locale);
      if (!example.includes("import '@social-interaction-lab/react/styles.css'")) throw new Error('Generated example must import package CSS');
      await writeFile(join(temp, `${name}-${locale}.tsx`), example);
    }
  }
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
const query = new URLSearchParams(window.location.search);
const locale = query.get('locale') === 'ja' ? 'ja' : 'en';
const presentation = query.get('presentation') === 'icon-only' ? 'icon-only' : 'labelled';
const examples = {en: {labelled: LabelledEnglish, 'icon-only': IconsEnglish}, ja: {labelled: LabelledJapanese, 'icon-only': IconsJapanese}};
const SocialActions = examples[locale][presentation];
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
  console.log('QA fixture ready: qa/generated (default maximum-length Like label; ?presentation=icon-only&locale=en|ja selects icon-only; actual archive stylesheet; excluded from deployment).');
  console.log(`PASS: ${cases.length * 2} generated TSX consumers, EN/JA, labelled, icon-only, full, single-action and maximum-length-label configurations, strict NodeNext types, archive CSS. No dependency installation.`);
} finally { await rm(temp, {recursive: true, force: true}); }
