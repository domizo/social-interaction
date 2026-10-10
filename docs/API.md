# API / API リファレンス

## Components / コンポーネント

LikeButton, CommentButton, QuoteButton, ShareButton share a native button implementation. ActionButton is the lower-level primitive; ActionIcon is a decorative SVG. ActionBar renders role=group, not role=toolbar, so native Tab order is preserved.

主な props: label (必須・アクセシブル名), variant, tokens, count, pending, error, previewState, showLabel, onClick, ref。通常のボタン属性にも対応します。LikeButton の selected が aria-pressed に対応。ラベルは選択前後で変えません。他の操作に選択状態はありません。

- label: required stable accessible name; defaults do not assume a locale
- selected: Like only; controlled boolean
- pending: aria-busy + aria-disabled; activation suppressed, focus retained
- error: visible marker; pair with contextual live error text and a retry path
- count: visual numeric count; label stays stable. Supply aria-describedby if counts must be announced
- variant: minimal | soft | solid | spring
- tokens: bounded overrides. If omitted, inherit ActionBar CSS variables; explicit button tokens apply complete defaults plus that override
- previewState: visual simulation, independent of actual semantic state; intended for reference specimens, not app state
- showLabel: defaults true; false hides the visible text but preserves accessible name
- ActionBar tokens: defaults plus overrides; label defaults to “Post actions” and should be localized

Comment/Quote set aria-haspopup=dialog; Share sets aria-haspopup=menu. Provide actual popups and appropriate aria-expanded / aria-controls in your integration. Components do not implement popup lifecycle for you.

## Glyph motion / アイコンの動き

iconMotion: none | pulse | spring | trace | gesture (default spring). motionTokens: duration 0–1600 ms, intensity 0–2, stagger 0–160 ms. motionTrigger: changing string/number replays without activating the action. reducedMotion: suppresses SVG and CSS motion; OS reduction always wins. See [complete API and lifecycle](MOTION.md).

見た目の variant と動きは独立しています。再生は状態やリクエストを変更しません。処理中は反復と静止した点で表示し、成功とは区別します。

## Tokens / トークン

iconSize 16–28 px, strokeWidth 1–3 CSS px, gap 4–28 px, duration 0–400 ms, amplitude 0–8 percent, hitTarget 44–64 px, accent six-digit hex. Nonfinite numbers and invalid hex fall back to defaults; finite out-of-range numbers clamp. DTCG amplitude exports as a fraction (4% → 0.04). Hit target and visible icon dimensions are separate. Spring uses a bounded cubic-bezier easing, not a physical spring simulation.

範囲外はクランプ、不正値は初期値に戻します。44px 以上の操作領域と見えるアイコンは別々です。spring は三次ベジェ曲線で、物理ばねシミュレーションではありません。

## Async / 非同期

useAsyncAction<T>(): { status, value, error, run, cancel, reset }. Status: idle | pending | success | error. run accepts `(signal: AbortSignal) => Promise<T>` and resolves T on current success, undefined on failure, cancellation, duplicate pending calls, or stale/unmounted completion. Use a non-undefined result type when you need to distinguish successful values. Failures are surfaced through error. cancel retains the last successful value; reset clears it.

simulateRequest<T>(result, { signal, delay = 900, fail = false }): local only; finite delay 0–2147483647 ms; invalid delay rejects RangeError. Abort rejects AbortError. Do not use it as a network adapter in production.
