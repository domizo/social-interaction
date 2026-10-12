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
- pending: aria-busy + aria-disabled; activation suppressed, focus retained. The assigned glyph repeats when motion is available; provide contextual status text in the application. No separate pending-dot element or pseudo-element is rendered
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

`cartoon` uses action-specific anticipation, squash, and overshoot, including a quivering heart with an expanding, fading outline and a popping comment bubble. SVG effect groups are decorative and share the animation cancellation lifecycle. Pending uses slower glyph repetition but suppresses cartoon secondary bursts. Busy/disabled semantics and duplicate-activation guards remain when motion is reduced or unavailable; contextual status belongs to the integration.

見た目の variant と動きは独立しています。再生は状態やリクエストを変更しません。cartoon の装飾も再生単位で中止されます。処理中は追加バーストを抑え、ゆっくりした反復と `aria-busy`・`aria-disabled`・重複操作防止を使います。独立した点の装飾はありません。動き抑制でも処理中の意味を保ち、状況説明は利用側で示します。成功とは区別します。

## Tokens / トークン

iconSize 16–28 px, strokeWidth 1–3 CSS px, gap 4–28 px, duration 0–400 ms, amplitude 0–8 percent, hitTarget 44–64 px, accent six-digit hex. Nonfinite numbers and invalid hex fall back to defaults; finite out-of-range numbers clamp. DTCG amplitude exports as a fraction (4% → 0.04). Hit target and visible icon dimensions are separate. `tokens.duration` controls button-surface transitions and `tokens.amplitude` its press depth; neither selects or times the glyph animation. Studio owns these under Appearance → Surface hover & press feedback; glyph controls live in Motion. Spring uses a bounded cubic-bezier easing, not a physical spring simulation.

範囲外はクランプ、不正値は初期値に戻します。44px 以上の操作領域と見えるアイコンは別々です。`tokens.duration` は表面の遷移時間、`tokens.amplitude` は押し込みの深さで、アイコンの動き・時間とは別です。Studio では「見た目 → 表面のホバー・押下の反応」にまとめ、アイコン自体は「動き」で設定します。spring は三次ベジェ曲線で、物理ばねシミュレーションではありません。

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

The Studio picker selects 1–12 unique existing actions and commits the order in `StudioConfig.actions`. Drag handles are the primary ordering control, with keyboard pickup/movement/drop/Escape and a collapsed Earlier/Later fallback. This adds no library action types or button props. The selected order and each action’s EN/JA labels drive applicable live/comparison/context/state/lens surfaces and generated code. Presets, JSON, and TSX retain that order. Timeline choices use the selection; removing the inspected action selects the first remaining action. The public `createGlyphTimeline` still accepts any `SocialAction`. Independent Async Like/Save examples and the complete 12-action catalog remain available.

### Per-action Studio assignments / Studio の個別割り当て

`StudioConfig.iconMotion` is the global treatment. Normalized configuration adds `motionOverrides: Partial<Record<SocialAction, IconMotion>>`; an icon resolves to `motionOverrides[action] ?? iconMotion`. Missing entries inherit, while explicit `none` is an override. Inherit/reset deletes the entry. Removing an action from the selected array preserves its override for re-addition. Duration, intensity, and stagger remain shared `motionTokens`; there are no per-action token overrides.

Live actions, context previews, the Like/Save async comparison, timeline, and generated React all use that resolution. The timeline displays the resolved treatment without editing it. Guide → Motion reference and Icon catalog keep exploratory settings local; the catalog defaults to Assigned motions. These experiments never write the shared Studio configuration.

Studio JSON remains strict `schemaVersion: 1` configuration data, distinct from DTCG token JSON and executable code. The two optional legacy input fields are `presentation` and `motionOverrides`: omission becomes `"labelled"` and `{}` respectively. New exports include both. An explicit presentation must be `"labelled"` or `"icon-only"`. An explicit override map must be a plain data object with only known action keys and valid `IconMotion` values (`none`, `pulse`, `spring`, `trace`, `gesture`, `cartoon`). Unknown/prototype-style keys, accessors, arrays, `null`, non-data properties, and invalid values are rejected. A known action need not be currently selected. `inherit` is not a JSON value. All other required fields, bounds, and whole-input transactional validation remain in force. This intentionally differs from tolerant public token normalization. See [Studio](STUDIO.md) for the complete schema and storage/export limits.

Studio のピッカーは既存の1〜12操作を選び、ドラッグハンドル、キーボードでの選択・移動・確定・Escape、折りたたんだ「前へ／後ろへ」で配列順を変更します。公開する操作やボタンの props は増やしません。選択順と両言語ラベルを各画面と書き出しへ反映し、時間軸もその選択を使います。独立した非同期のいいね／保存と全12操作のカタログは残ります。

全体の `iconMotion` と個別の `motionOverrides` から `motionOverrides[action] ?? iconMotion` で動きを決定します。キーの欠落は継承、明示的な `none` は静止の個別指定です。継承／リセットはキーを削除し、操作を外して再追加しても個別指定は保持します。時間・強さ・時間差は共通で、操作別のトークン指定はありません。実操作・各場面・非同期・時間軸・生成 React へ同じ規則を適用します。時間軸は割り当てを読み取り専用で表示します。ガイドの動きの比較とカタログ内の変更は各実験だけに作用し、共有設定は変えません。カタログの初期値は「設定したモーション」です。

スキーマ番号は1のままです。旧入力で `presentation` がない場合は `"labelled"`、`motionOverrides` がない場合は `{}` に補完し、新しい書き出しには両方を含めます。個別指定は既存の操作名と対応する動きだけを許可し、未選択の操作も保持します。未知のキー、特殊なプロパティ、getter、配列、`null`、不正な値は拒否します。`inherit` は保存値ではありません。それ以外の必須項目・範囲・全体を検証してから適用する規則は維持します。Studio の設定型・ヘルパーはパッケージの公開 export ではありません。
