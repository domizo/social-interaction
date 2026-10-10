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

主な props: label (必須・アクセシブル名), variant, tokens, count, pending, error, previewState, showLabel, onClick, ref。通常のボタン属性にも対応します。LikeButton / BookmarkButton / NoteButton / StarButton / BellButton の selected が aria-pressed に対応。ラベルは選択前後で変えません。残りの7操作はコマンドです。

- label: required stable accessible name; defaults do not assume a locale
- selected: Like, Bookmark, Note, Star, Bell only; controlled boolean. Commands do not expose pressed state
- pending: aria-busy + aria-disabled; activation suppressed, focus retained
- error: visible marker; pair with contextual live error text and a retry path
- count: visual numeric count; label stays stable. Supply aria-describedby if counts must be announced
- variant: minimal | soft | solid | spring
- tokens: bounded overrides. If omitted, inherit ActionBar CSS variables; explicit button tokens apply complete defaults plus that override
- previewState: visual simulation, independent of actual semantic state; intended for reference specimens, not app state
- showLabel: defaults true; false hides the visible text but preserves accessible name
- ActionBar tokens: defaults plus overrides; label defaults to “Post actions” and should be localized

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
