import {useId, useLayoutEffect, useRef, useState, type CSSProperties} from 'react';
import {normalizeTokens, tokenBounds, type SocialTokens} from '../../lib/index.js';
import type {StudioConfig} from './config.js';
import {ConfiguredActions} from './ConfiguredActions.js';
import './context.css';

type Locale = 'en' | 'ja';
type Variable = 'gap' | 'iconSize' | 'strokeWidth';
type Overlays = {targets: boolean; centers: boolean; spacing: boolean};
type Measurements = {gaps: Array<{left: number; top: number; width: number; height: number}>; bounds: Array<{width: number; height: number}>};
const copy = {
  en: {eyebrow: 'LOOK CLOSER', title: 'The design lens', intro: 'Change one thing. Notice what shifts. Keep the rest still.', overlays: 'Measurement overlays', targets: 'Hit areas', centers: 'Geometric centers', spacing: 'Spacing', variable: 'Compare one variable', gap: 'Spacing', iconSize: 'Icon size', strokeWidth: 'Stroke width', adjustedValue: 'Adjusted value', baseline: 'Baseline', adjusted: 'Adjusted', current: 'Your current configuration', one: 'One variable changed', target: 'Minimum hit area', center: 'Icon-box center', measured: 'Rendered button bounds', measuredGap: 'Rendered horizontal gaps', notMeasured: 'Measured after layout', local: 'Controls are live, with independent local state in each specimen.', units: 'px', note: 'These are visual hypotheses, not rules of beauty. The crosshair marks the geometric center of the icon’s square box; it does not measure an optical center.', gapWhy: 'More space can separate choices; less can make a row feel grouped. Check wrapping and reach before choosing.', iconSizeWhy: 'A larger symbol can be easier to notice, but may compete with its label. The hit area stays the same minimum size.', strokeWidthWhy: 'A heavier line can feel more prominent. Compare legibility at the actual size, alongside the same labels.', invariant: 'Everything else stays matched: actions, labels, style, other tokens, and motion.', actions: 'Design lens actions', left: 'from left', top: 'from top'},
  ja: {eyebrow: '細部を観察する', title: 'デザインレンズ', intro: 'ひとつだけ変える。その違いを見る。ほかの条件はそのままに。', overlays: '計測オーバーレイ', targets: '操作領域', centers: '幾何学的な中心', spacing: '余白', variable: '比較する変数', gap: '余白', iconSize: 'アイコンサイズ', strokeWidth: '線の太さ', adjustedValue: '調整後の値', baseline: '基準', adjusted: '調整後', current: '現在の設定', one: 'ひとつの変数だけ変更', target: '操作領域の最小サイズ', center: 'アイコン枠の中心', measured: '描画されたボタンの寸法', measuredGap: '描画された横方向の間隔', notMeasured: 'レイアウト後に計測', local: 'どちらの操作も試せます。状態は各サンプル内だけに保存されます。', units: 'px', note: 'これは見え方の仮説で、美しさのルールではありません。十字はアイコンの正方形の枠の幾何学的な中心です。視覚的な重心を計測したものではありません。', gapWhy: '余白を増やすと選択肢が分かれて見え、減らすとまとまって見えることがあります。折り返しや操作のしやすさも確認しましょう。', iconSizeWhy: '記号を大きくすると気づきやすくなる一方、ラベルより目立つ場合があります。操作領域の最小サイズは変わりません。', strokeWidthWhy: '太い線は存在感を強めることがあります。同じラベルと並べ、実際のサイズで読み取りやすさを比べましょう。', invariant: '操作、ラベル、スタイル、ほかのトークン、動きは同じ条件です。', actions: 'デザインレンズの操作', left: '左から', top: '上から'},
};

const number = (value: number) => Number(value.toFixed(1));
function differentValue(variable: Variable, proposed: number | undefined, baseline: number): number {
  const [min, max] = tokenBounds[variable], step = variable === 'strokeWidth' ? 0.1 : 1;
  const offset = variable === 'strokeWidth' ? 0.4 : 4;
  let value = Math.max(min, Math.min(max, proposed ?? (baseline + offset <= max ? baseline + offset : baseline - offset)));
  if (Math.abs(value - baseline) < 0.001) value = baseline + step <= max ? baseline + step : baseline - step;
  return number(value);
}

function LensSpecimen({config, locale, reducedMotion, overlays, adjusted, variable, active}: {active:boolean;config: StudioConfig; locale: Locale; reducedMotion: boolean; overlays: Overlays; adjusted: boolean; variable: Variable}) {
  const t = copy[locale], root = useRef<HTMLDivElement>(null), id = useId();
  const [measurement, setMeasurement] = useState<Measurements>({gaps: [], bounds: []});
  useLayoutEffect(() => {
    const node = root.current; if (!node || !active) return;
    let alive = true;
    const measure = () => {
      if (!alive) return;
      const frame = node.getBoundingClientRect();
      const rects = Array.from(node.querySelectorAll<HTMLButtonElement>('.sil-action-bar > .sil-action')).map(button => button.getBoundingClientRect()).filter(rect => rect.width > 0 && rect.height > 0);
      const gaps: Measurements['gaps'] = [];
      for (let index = 1; index < rects.length; index++) {
        const a = rects[index - 1], b = rects[index];
        const overlap = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (overlap > 0 && b.left > a.right) gaps.push({left: a.right - frame.left, top: Math.max(a.top, b.top) - frame.top, width: b.left - a.right, height: overlap});
      }
      const next = {gaps, bounds: rects.map(rect => ({width: number(rect.width), height: number(rect.height)}))};
      setMeasurement(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next);
    };
    measure();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    observer?.observe(node);
    for (const button of node.querySelectorAll('.sil-action')) observer?.observe(button);
    window.addEventListener('resize', measure);
    void document.fonts?.ready.then(measure);
    return () => {alive = false; observer?.disconnect(); window.removeEventListener('resize', measure);};
  }, [config.tokens, config.actions, config.variant, config.presentation, locale, active]);
  const tokens = normalizeTokens(config.tokens);
  return <article className="lens-specimen" aria-labelledby={`${id}-title`} data-specimen={adjusted ? 'adjusted' : 'baseline'}>
    <div className="lens-specimen-heading"><div><p>{adjusted ? t.one : t.current}</p><h3 id={`${id}-title`}>{adjusted ? t.adjusted : t.baseline}</h3></div><span>{t[variable]} <strong>{tokens[variable]} {t.units}</strong></span></div>
    <div ref={root} className="lens-measurement-stage" data-lens-targets={overlays.targets || undefined} data-lens-centers={overlays.centers || undefined}>
      <ConfiguredActions active={active} config={config} locale={locale} reducedMotion={reducedMotion} label={`${t.actions}: ${adjusted ? t.adjusted : t.baseline}`}/>
      {overlays.spacing && <div className="lens-spacing-overlay" aria-hidden="true">{measurement.gaps.map((gap, index) => <i key={index} style={{left: gap.left, top: gap.top, width: gap.width, height: gap.height} as CSSProperties}/>)}</div>}
    </div>
    <dl className="lens-numbers">
      <div><dt>{t.target}</dt><dd>{tokens.hitTarget} × {tokens.hitTarget} {t.units}</dd></div>
      <div><dt>{t.spacing}</dt><dd>{tokens.gap} {t.units}</dd></div>
      <div><dt>{t.iconSize}</dt><dd>{tokens.iconSize} {t.units}</dd></div>
      <div><dt>{t.strokeWidth}</dt><dd>{tokens.strokeWidth} {t.units}</dd></div>
      {overlays.centers && <div className="lens-wide-number"><dt>{t.center}</dt><dd>{t.left} {number(tokens.iconSize / 2)} {t.units} · {t.top} {number(tokens.iconSize / 2)} {t.units}</dd></div>}
      {overlays.targets && <div className="lens-wide-number"><dt>{t.measured}</dt><dd>{measurement.bounds.length ? [...new Set(measurement.bounds.map(bound => `${bound.width} × ${bound.height} ${t.units}`))].join(' · ') : t.notMeasured}</dd></div>}
      {overlays.spacing && <div className="lens-wide-number"><dt>{t.measuredGap}</dt><dd>{measurement.gaps.length ? [...new Set(measurement.gaps.map(gap => `${number(gap.width)} ${t.units}`))].join(' · ') : '—'}</dd></div>}
    </dl>
  </article>;
}

export function DesignLens({config, locale, reducedMotion, active=true}: {active?:boolean;config: StudioConfig; locale: Locale; reducedMotion: boolean}) {
  const t = copy[locale], id = useId();
  const [variable, setVariable] = useState<Variable>('gap');
  const [values, setValues] = useState<Partial<Record<Variable, number>>>({});
  const [overlays, setOverlays] = useState<Overlays>({targets: false, centers: false, spacing: false});
  const baselineTokens = normalizeTokens(config.tokens), value = differentValue(variable, values[variable], baselineTokens[variable]);
  const baselineConfig = {...config, tokens: baselineTokens}, adjustedConfig = {...config, tokens: {...baselineTokens, [variable]: value}};
  const updateValue = (proposed: number) => {
    const [min, max] = tokenBounds[variable], step = variable === 'strokeWidth' ? 0.1 : 1;
    let next = proposed;
    // Skip the baseline in the direction of travel so either side remains keyboard-reachable.
    if (Math.abs(next - baselineTokens[variable]) < 0.001) {
      const direction = next < value ? -1 : 1;
      next += direction * step;
      if (next < min || next > max) next = baselineTokens[variable] - direction * step;
    }
    setValues(previous => ({...previous, [variable]: number(Math.max(min, Math.min(max, next)))}));
  };
  return <section className="design-lens" aria-labelledby={`${id}-title`} data-reduced-motion={reducedMotion || undefined}>
    <div className="context-section-heading"><div><p className="context-eyebrow">{t.eyebrow}</p><h2 id={`${id}-title`}>{t.title}</h2><p className="context-intro">{t.intro}</p></div><span className="context-section-index" aria-hidden="true">05</span></div>
    <div className="lens-controls"><fieldset><legend>{t.overlays}</legend>{(['targets', 'centers', 'spacing'] as const).map(key => <label key={key}><input type="checkbox" checked={overlays[key]} onChange={event => setOverlays(previous => ({...previous, [key]: event.target.checked}))}/><span>{t[key]}</span><i className={`lens-key lens-key-${key}`} aria-hidden="true"/></label>)}</fieldset>
      <div className="lens-variable-controls"><label htmlFor={`${id}-variable`}>{t.variable}<select id={`${id}-variable`} value={variable} onChange={event => setVariable(event.target.value as Variable)}>{(['gap', 'iconSize', 'strokeWidth'] as const).map(key => <option key={key} value={key}>{t[key]}</option>)}</select></label><label htmlFor={`${id}-value`} className="lens-range"><span>{t.adjustedValue}: {t[variable]}<output htmlFor={`${id}-value`}>{baselineTokens[variable]} → {value} {t.units}</output></span><input id={`${id}-value`} type="range" aria-label={`${t.adjustedValue}: ${t[variable]}`} min={tokenBounds[variable][0]} max={tokenBounds[variable][1]} step={variable === 'strokeWidth' ? 0.1 : 1} value={value} onChange={event => updateValue(Number(event.target.value))} onKeyDown={event => {
        const step = variable === 'strokeWidth' ? 0.1 : 1;
        if (['ArrowLeft', 'ArrowDown', 'ArrowRight', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
          event.preventDefault();
          updateValue(event.key === 'Home' ? tokenBounds[variable][0] : event.key === 'End' ? tokenBounds[variable][1] : value + (event.key === 'ArrowLeft' || event.key === 'ArrowDown' ? -step : step));
        }
      }}/></label></div>
    </div>
    <div className="lens-comparison"><LensSpecimen active={active} config={baselineConfig} locale={locale} reducedMotion={reducedMotion} overlays={overlays} adjusted={false} variable={variable}/><LensSpecimen active={active} config={adjustedConfig} locale={locale} reducedMotion={reducedMotion} overlays={overlays} adjusted variable={variable}/></div>
    <div className="lens-rationale"><span aria-hidden="true">↳</span><div><p>{t[`${variable}Why`]}</p><p>{t.invariant}</p></div></div>
    <p className="lens-caveat">{t.note}</p><p className="lens-local-note">{t.local}</p>
  </section>;
}
