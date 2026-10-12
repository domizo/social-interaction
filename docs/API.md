# API / API リファレンス

## Components / コンポーネント

All named components share the native `ActionButton` implementation. `ActionIcon` is a decorative SVG for the same catalog; `ActionBar` renders role=group, not role=toolbar, so native Tab order is preserved.

| SocialAction | Export | Semantics / 意味 |
|---|---|---|
| `like` | `LikeButton` | Controlled toggle / いいねのトグル |
| `comment` | `CommentButton` | Dialog command / コメントダイアログ |
| `share` | `ShareButton` | Menu command / 共有メニュー |
| `quote` | `QuoteButton` | Dialog command / 引用ダイアログ |
| `repost` | `RepostButton` | Command / リポスト操作 |
| `bookmark` | `BookmarkButton` | Controlled toggle / ブックマークのトグル |
| `note` | `NoteButton` | Controlled toggle / 付箋型の保存トグル |
| `star` | `StarButton` | Controlled toggle / スターのトグル |
| `send` | `SendButton` | Command / 送信操作 |
| `sparkles` | `SparklesButton` | Command / きらめき操作 |
| `bell` | `BellButton` | Controlled toggle / ベルのトグル |
| `reaction` | `ReactionButton` | Command / リアクション操作 |

The catalog is visual and semantic scaffolding, not an SNS or AI integration. `NoteButton` is an alternate save affordance, with the playground label “Keep note” / “メモを保存”; it does not open a note editor. Application callbacks own any real behavior.

カタログ自体に SNS・AI 連携はありません。`note` は保存を表す付箋の形で、編集機能ではありません。実際の処理は利用側で実装します。

### Catalog metadata / カタログのメタデータ

- `socialActions`: readonly ordered list of the 12 `SocialAction` keys above
- `toggleActions`: `like`, `bookmark`, `note`, `star`, `bell`
- `isToggleAction(action)`: boolean indicating whether an action has toggle semantics
- `actionLabels[action].en` / `.ja`: English and Japanese labels, including “Keep note” / “メモを保存” for `note`

Use the metadata for consistent catalog rendering, or supply your own localized stable `label`. The playground’s 12-card catalog previews icons without opening the original Comment/Quote dialogs or Share menu.

同じメタデータでカタログを描画できます。利用先に合わせた翻訳も可能ですが、トグルの名前は選択前後で固定します。12枚のカタログは動きのプレビューで、従来のコメント・引用ダイアログや共有メニューとは別です。

### Button props / ボタンの props

主な props: label (必須・アクセシブル名), variant, tokens, count, pending, error, previewState, presentation, showLabel, onClick, ref。通常のボタン属性にも対応します。LikeButton / BookmarkButton / NoteButton / StarButton / BellButton の selected が aria-pressed に対応。ラベルは選択前後で変えません。残りの7操作はコマンドです。

- label: required stable accessible name; defaults do not assume a locale
- selected: Like, Bookmark, Note, Star, Bell only; controlled boolean. Commands do not expose pressed state
- pending: aria-busy + aria-disabled; activation suppressed, focus retained
- error: visible marker; pair with contextual live error text and a retry path
- count: visual numeric count in labelled presentation; label stays stable. Icon-only presentation hides it visually and provides it through an accessible description. In labelled presentation, supply aria-describedby if counts must be announced
- variant: minimal | soft | solid | spring
- tokens: bounded overrides. If omitted, inherit ActionBar CSS variables; explicit button tokens apply complete defaults plus that override
- previewState: visual simulation, independent of actual semantic state; intended for reference specimens, not app state
- presentation: optional exported `ActionPresentation` type (`"labelled" | "icon-only"`), default `"labelled"`. Icon-only hides both visible label and count while preserving the stable `aria-label`, a native title hint, and a supplied count as an accessible description
- showLabel: defaults true; false hides only the visible label and preserves the accessible name. With labelled presentation the count remains visible, preserving the pre-0.4.1 behavior; icon-only hides both regardless of showLabel
- ActionBar tokens: defaults plus overrides; label defaults to “Post actions” and should be localized

`presentation` is available on `ActionButton` and every named action component. In icon-only mode, `title` defaults to `label` unless you supply your own title; the hidden count description is appended to any caller-provided `aria-describedby`. It does not change toggle/command semantics, disabled/pending behavior, focus, motion, or the configured minimum hit target. Keep supplying a translated, stable `label` even when text is hidden. A native title hint is browser-dependent and is not a replacement for the accessible name or a guarantee of touch-device discovery.

```tsx
<LikeButton label="Like" presentation="icon-only" count={12} selected={liked}
  onClick={() => setLiked(value => !value)} />
```

`presentation` は公開型 `ActionPresentation` を使い、`ActionButton` と全ての名前付き操作コンポーネントで指定できます。アイコンのみでは、独自の `title` がなければ `label` を使い、件数の説明を既存の `aria-describedby` に追加します。初期値は `"labelled"` です。`"icon-only"` では見えるラベルと件数を隠しますが、必須の `label` による固定のアクセシブル名、標準の title ヒント、指定した件数のアクセシブルな説明を保持します。トグル／コマンド、無効／処理中、フォーカス、動き、最小操作領域は変えません。既存の `showLabel={false}` はラベルだけを隠し、ラベル付き表示なら件数を表示する互換動作です。title ヒントはブラウザーに依存し、タッチ操作での発見を保証しません。

`ActionIcon` accepts `action`, optional `filled` (default false), and an SVG `ref`. It draws a static decorative icon; the button owns motion through the props below. `filled` changes fillable toggle shapes, not semantic state.

`ActionIcon` 単体は装飾用の静止 SVG です。動きはボタン側の props で制御し、`filled` 自体は選択状態を支援技術に伝えません。

Comment/Quote set aria-haspopup=dialog; Share sets aria-haspopup=menu. Provide actual popups and appropriate aria-expanded / aria-controls in your integration. Components do not implement popup lifecycle for you.

## Glyph motion / アイコンの動き

iconMotion: none | pulse | spring | trace | gesture | cartoon (default spring). motionTokens: duration 0–1600 ms, intensity 0–2, stagger 0–160 ms. motionTrigger: changing string/number replays without activating the action. reducedMotion: suppresses SVG and CSS motion; OS reduction always wins. See [complete API and lifecycle](MOTION.md).

`cartoon` uses action-specific anticipation, squash, and overshoot, including a quivering heart with an expanding, fading outline and a popping comment bubble. SVG effect groups are decorative and share the animation cancellation lifecycle. Pending uses the slower glyph repetition and static dots but suppresses cartoon secondary bursts.

見た目の variant と動きは独立しています。再生は状態やリクエストを変更しません。cartoon の装飾も再生単位で中止されます。処理中は追加バーストを抑え、ゆっくりした反復と静止した点で表示し、成功とは区別します。

## Tokens / トークン

iconSize 16–28 px, strokeWidth 1–3 CSS px, gap 4–28 px, duration 0–400 ms, amplitude 0–8 percent, hitTarget 44–64 px, accent six-digit hex. Nonfinite numbers and invalid hex fall back to defaults; finite out-of-range numbers clamp. DTCG amplitude exports as a fraction (4% → 0.04). Hit target and visible icon dimensions are separate. Spring uses a bounded cubic-bezier easing, not a physical spring simulation.

範囲外はクランプ、不正値は初期値に戻します。44px 以上の操作領域と見えるアイコンは別々です。spring は三次ベジェ曲線で、物理ばねシミュレーションではありません。

## Async / 非同期

useAsyncAction<T>(): { status, value, error, run, cancel, reset }. Status: idle | pending | success | error. run accepts `(signal: AbortSignal) => Promise<T>` and resolves T on current success, undefined on failure, cancellation, duplicate pending calls, or stale/unmounted completion. Use a non-undefined result type when you need to distinguish successful values. Failures are surfaced through error. cancel retains the last successful value; reset clears it.

simulateRequest<T>(result, { signal, delay = 900, fail = false }): local only; finite delay 0–2147483647 ms; invalid delay rejects RangeError. Abort rejects AbortError. Do not use it as a network adapter in production.

## Standalone glyph timeline / 単独アイコンの時間軸

Added in 0.4.0: `createGlyphTimeline(svg, options)` returns a `GlyphTimeline` controller for a **standalone `ActionIcon` SVG that it exclusively owns**. Never pass an active `ActionButton` SVG, attach two controllers to one SVG, or change its action/geometry while a controller is alive. Button activation and timeline inspection share glyph plans, track timing, and the Comment/Repost morph renderer, but have separate lifecycle owners. Destroy the old controller before replacing it.

`GlyphTimelineOptions`:

- `action: SocialAction` and `iconMotion: IconMotion`: required; `action` must match the supplied icon
- `motionTokens?: Partial<IconMotionTokens>`: normalized with the existing duration/intensity/stagger bounds and defaults
- `reducedMotion?: boolean`: manual suppression; OS `prefers-reduced-motion` always wins, including changes during playback
- `onUpdate?: (state: GlyphTimelineState) => void`: receives state updates; use `getState()` for the initial snapshot. This is not a success callback for an application action

`GlyphTimelineState` contains `time` and `duration` in milliseconds, `playing`, `rate`, `reducedMotion`, and `supported`. `duration` is the resolved total, including part delays/stagger, rather than always the selected glyph duration. Cartoon Comment/Repost use the single morph duration. Empty plans (`none`, zero duration, or zero intensity) have zero duration. `supported` reports the required playback capability, not assistive-technology or visual-quality validation.

| Method | Contract |
|---|---|
| `seek(milliseconds)` | Finite input only; throws `RangeError` otherwise. Pauses, clamps to `[0, duration]`, and paints that sample. Reduced motion keeps time at zero. Seeking to the end restores the canonical icon |
| `play(rate?)` | Plays from the current position; restarts from zero when at the end. Uses the previous rate if omitted. Accepts finite 0.1–2 inclusive; throws `RangeError` otherwise. Does nothing for reduced/unsupported/zero-duration playback or absent animation-frame support |
| `pause()` | Samples the current time and pauses, retaining the inspected shape |
| `stop()` | Stops, sets time to zero, and releases animation resources to restore canonical geometry/styles |
| `destroy()` | Idempotently stops and releases owned resources and preference listeners. Call on unmount; create a new controller to resume use |
| `getState()` | Returns the current state snapshot |

Playback uses a finite clock with animation-frame sampling and a completion watchdog; it does not loop. The clock measures timeline time and respects rate. OS/manual reduction stops playback and restores the icon. Playback does not mutate selected state, invoke a button, or start a request.

```tsx
import {useEffect, useRef} from 'react';
import {ActionIcon, createGlyphTimeline, type GlyphTimeline} from '@social-interaction-lab/react';
import '@social-interaction-lab/react/styles.css';

export function CommentInspector() {
  const svg = useRef<SVGSVGElement>(null);
  const timeline = useRef<GlyphTimeline | null>(null);
  useEffect(() => {
    if (!svg.current) return;
    const controller = createGlyphTimeline(svg.current, {
      action: 'comment', iconMotion: 'cartoon',
      motionTokens: {duration: 560, intensity: 1, stagger: 60},
    });
    timeline.current = controller;
    return () => { controller.destroy(); timeline.current = null; };
  }, []);
  return <section aria-label="Comment motion inspection">
    <div role="img" aria-label="Comment icon" style={{width: 48, height: 48}}>
      <ActionIcon ref={svg} action="comment" />
    </div>
    <button onClick={() => timeline.current?.play(0.5)}>Play slowly</button>
    <button onClick={() => timeline.current?.seek(420)}>Inspect the peak</button>
    <button onClick={() => timeline.current?.pause()}>Pause</button>
    <button onClick={() => timeline.current?.stop()}>Reset</button>
  </section>;
}
```

The example’s 420 ms peak is specific to Cartoon Comment at its 560 ms duration. General consumers should derive seek positions from `getState().duration` or `onUpdate`, and expose static/reduced-motion status when relevant. `ActionIcon` remains decorative; the wrapper supplies the description. Changing configuration requires destroying/recreating the controller with the matching standalone icon.

`createGlyphTimeline` は単独の `ActionIcon` SVG を専有する公開 API です。動作中の `ActionButton` 内の SVG や、別の再生処理と共有した SVG には使用しません。`seek` は有限のミリ秒値を範囲内に収めて一時停止し、`play` は0.1〜2倍、`pause` は現在の形を保持、`stop` は基本形へ戻し、`destroy` はアンマウント時に後処理します。合計時間はパーツの時間差を含み、OS・手動の動き抑制を優先します。再生は選択状態や実リクエストを変更しません。

## Studio configuration boundary / Studio 設定の境界

`StudioConfig`, presets, config parsing, `generateReactUsage`, and `useToggleTransaction` are playground source modules under `src/app/studio/`, **not package-root exports**. The generated module exports its own configuration and callback types; that does not add those types to the library API. `useAsyncAction` remains the public async primitive.

Studio JSON is strict schema-v1 configuration data, not DTCG token JSON and not executable code. Imports reject unknown/missing fields and out-of-range values, with one compatibility exception: legacy schema-v1 data may omit `presentation`, which normalizes to `"labelled"`. This strict validation differs intentionally from tolerant public token normalization. Explicit presentation values must be `"labelled"` or `"icon-only"`, and presets, JSON, and generated TSX retain that value. See [Studio](STUDIO.md) for the complete schema, limits, browser-storage behavior, generated component scope, and local async comparison.

Studio の設定・プリセット・コード生成・比較用の非同期 hook はプレイグラウンド内部で、パッケージの公開 export ではありません。公開の非同期 hook は引き続き `useAsyncAction` です。Studio JSON は DTCG トークン出力と異なり、スキーマ1の厳密な設定データとして全体を検証します。互換性のため、旧データで `presentation` がない場合だけ `"labelled"` に補完します。明示する値は `"labelled"` と `"icon-only"` に限り、プリセット・JSON・生成 TSX に保持します。
