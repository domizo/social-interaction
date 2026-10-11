# Glyph motion / アイコンの動き

Version 0.3.7 refines only Cartoon Comment: its existing circle-to-canonical growth fills the first 75% of the selected duration, followed by a small whole-glyph bounce over the final 25%. Total duration is unchanged. Cartoon Repost retains its accepted original rectangular route and motion. Every treatment shares the canonical glyph at idle, completion, cancellation and reduced motion; Comment deliberately switches to its small circle immediately on activation. The portable SVG-attribute renderer and its existing watchdog remain in use. The catalog has 12 SVG icons and five treatments: `pulse`, `spring`, `trace`, `gesture`, and `cartoon`; `none` is the opt-out. Motion changes the glyph, a glyph part, or its drawn path; it never resizes the button hit target. These are design hypotheses to compare in context, not universal rules about what feels beautiful.

| Treatment | Like | Comment | Share | Quote | Intended feel and tradeoff |
|---|---|---|---|---|---|
| `pulse` | Scale and settle | Scale and settle | Scale and settle | Scale and settle | Consistent recognition; less action-specific personality |
| `spring` | Heart bounce | Bubble squash/inflate | Arrow lift; tray stays still | Staggered mark bounce | Responsive and tactile; can be too expressive in dense interfaces |
| `trace` | Outline redraw | Outline redraw | Staggered paths | Staggered paths | Deliberate drawing; briefly reduces the outline's completeness |
| `gesture` | Heart tilt | Bubble sway | Arrow launch and return | Marks open in sequence | Action-specific expression; more visual attention and travel |
| `cartoon` | Quiver + expanding, fading outline | Circle-to-bubble growth, then a whole-bubble bounce | Arrow anticipation and launch | Exaggerated sequential marks | Anime/cartoon-inspired expression; larger overshoot and decorative effects demand more attention |

pulse は統一感、spring は弾力、trace は線を描く印象、gesture は操作ごとの個性、cartoon はアニメ的な誇張を比較するための仮説です。ハートの震えと拡大して消える輪郭、小さな円から吹き出しへの連続的な成長などを実際の SVG で表現します。trace は線の一部が一時的に欠け、cartoon は装飾と大きめの変形で視線を集めるため、表示の小ささや情報密度に合わせて判断してください。

## Cartoon catalog / カートゥーンの操作一覧

All 12 actions can use every treatment. Cartoon gives each action its own sequence; visible icon motion is separate from the four surface variants and the fixed hit target.

| Action | Cartoon sequence / 動き |
|---|---|
| Like / いいね | Heart anticipation and quiver; a duplicate outline expands and fades / ハートの予備動作と震え、拡大して消える輪郭 |
| Comment / コメント | A tiny lower-left circle grows into the canonical bubble over 75% of the duration, then the completed glyph bounces as a whole / 最初の75%で左下の円から基本形へ育ち、完成後に吹き出し全体が小さく弾む |
| Share / 共有 | Arrow anticipates, launches, and returns / 矢印の予備動作・発射・復帰 |
| Quote / 引用 | Quote marks exaggerate their movement in sequence / 引用符が時間差で大きく動く |
| Repost / リポスト | Two 16-unit arrow bodies slide around the original rectangle, half a perimeter apart / 長さ16の矢印2本が半周の間隔を保ち、元の長方形に沿って移動する |
| Bookmark / ブックマーク | Bookmark drops and settles / しおりが落ちて収束 |
| Note / メモを保存 | Sticky-note corner folds / 付箋の角が折れる |
| Star / スター | Star pops with brief rays / 星のポップと短い放射線 |
| Send / 送信 | Paper plane folds, launches, and returns / 紙飛行機が折れ、飛んで戻る |
| Sparkles / きらめき | Glints appear with staggered timing / 光が時間差で現れる |
| Bell / ベル | Bell rings / ベルが揺れる |
| Reaction / リアクション | Face bounces / 顔が弾む |

Decorative effect groups add no accessible names, state, or success meaning. They are hidden at rest and share cancellation ownership with the main glyph. The note is an alternate save icon; sparkles is not an AI integration.

装飾グループはアクセシブル名・状態・成功の意味を追加しません。静止時は隠れ、主アイコンと同じ単位で中止されます。付箋は保存アイコンの別案、きらめきは AI 連携を持たない視覚表現です。

### Path deformation, not rigid travel / 経路に沿って形を変える

Cartoon Repost uses the exact original rectangular centerline: `x=4…20`, `y=6…18`, width `16`, height `12`, perimeter `56`. Each arrow body is a sliding path segment of constant length `16`, with the pair kept `28` units (half a perimeter) apart for one complete lap. The leading tangent determines each arrowhead: both wings extend `3` units backward and `3` units to either perpendicular side, preserving the original arrowhead dimensions. There is no artificial rounded route, entry/exit bridge, rendered guide, parent rotation, or echo. Because each vertical side is only `12` units long, a `16`-unit body necessarily spans a corner there; it does not become a fully straight vertical arrow. Intensity adjusts the pace accent without changing the route, body length, head dimensions, separation, or full lap. This synchronized pair does not use stagger.

Cartoon Comment is canonical while idle, but activation immediately displays a tiny closed circle at the lower-left. The existing continuous, monotonic circle-to-canonical interpolation is preserved, with its easing fitted into the first `75%` of the selected real duration (`420 ms` at the `560 ms` default). During this growth, the bounding-box corner stays anchored at `(x=3, y=21)` as the contour grows upward/rightward and the tail develops throughout. There is no initial compression, intermediate hold, growth overshoot/rebound, or separate late path morph. Intensity changes the initial circle size, not the target contour or growth anchor.

Once the exact canonical bubble is fully formed, the whole glyph bounces during the final `25%` (`140 ms` at the default), using the center `(12,12)` for squash/stretch. The inspiration is the existing Reaction face action, not the React brand. There is no rotation or tail pivot. With bounce progress `q=0…1` and intensity `a`, the phase landmarks are:

| q | Vertical translation y | Scale (x, y) | Phase |
|---|---|---|---|
| `0` | `0` | `(1, 1)` | Fully formed, neutral |
| `.20` | `+.8a` | `(1+.08a, 1−.08a)` | Anticipation/squash |
| `.48` | `−3a` | `(1−.05a, 1+.08a)` | Lift/stretch |
| `.78` | `+.5a` | `(1+.04a, 1−.04a)` | Landing/squash |
| `1` | `0` | `(1, 1)` | Neutral |

Each interval uses smoothstep interpolation `u²(3−2u)`, with `u` running from 0 to 1 between adjacent landmarks. The canonical path moves as one glyph; it does not morph again, and there is no trace or echo. The post-growth transform moves its visible bounds; the `(3,21)` anchor describes the growth geometry, while the button hit target remains fixed throughout. The transform settles to neutral within the selected total duration. Exact canonical geometry remains the idle/end/cancel/reduced-motion state, and cancellation restores any pre-existing group styles.

The small final bounce is a design hypothesis for a livelier finish, with an attention cost to assess in context; it is not a universal claim of pleasantness.

The public Comment plan now contains both a path step and a glyph-transform step. Its offsets compensate for the global easing so ordinary manual `element.animate()` playback can keep `ease-in-out` while preserving the intended real-time 75%/25% split. The inspectable path keyframes retain compatible commands; direct CSS-path playback still requires CSS-path support.

Portable runtime playback is owned by `ActionButton` and uses the existing cancel-owned `requestAnimationFrame` renderer to write SVG `d` attributes. Comment uses raw elapsed time to divide the selected duration, applies local inflation easing in the first 75%, then samples the bounce in real time over the last 25%. It does not globally ease the phase split a second time. Repost’s playback is unchanged. The existing cancel-owned 64 ms watchdog samples the same clock only when document animation frames stall; it stops at completion and is cleared on cancellation. Playback continues to support pending iterations and a trigger made inert by its composer. Repost uses no group transform; Comment uses one only after reaching canonical shape. All other actions and treatments, including explicit `trace`, keep their previous plans and glyph geometry.

`ActionIcon` retains the optional `motion` prop for compatibility, but every treatment renders identical canonical resting geometry. Repost remains two compound paths and Comment one path, preserving Trace path count and stagger. The inspectable CSS plans use sampled command-compatible outlines; the component restores exact arc/relative-command paths. CSS `d: path(...)` support is not required or queried. Natural completion, replay, settings changes and unmount restore only attributes and group styles still owned by that playback, preserving prior styles without overwriting a newly rendered glyph. These two morphs need `requestAnimationFrame`; the other treatments use Web Animations. Cross-engine checks target Chromium, WebKit and Firefox; real Safari/physical-device behavior is a separate verification limit.

リポストは元の長方形 `x=4…20`、`y=6…18`（幅16・高さ12・周長56）をそのまま使います。長さ16の本体2本が半周の28だけ離れて一周し、矢じりは先端の接線から後ろへ3、左右の垂直方向へ各3という元の寸法を保ちます。角丸の別経路や開始・終了の接続変形はありません。縦辺は12しかないため、長さ16の本体は必ず角をまたぎ、完全にまっすぐな縦矢印にはなりません。強さは速度の抑揚だけに作用し、経路・長さ・矢じり・間隔・一周は変えません。

コメントは待機中に基本の吹き出しを表示し、操作した瞬間に左下の小さな閉じた円を表示します。既存の連続的かつ単調な補間を保ち、指定した実時間の最初の75%（初期値560 msなら420 ms）で基本形まで育ちます。成長中は外接矩形の左下 `(3,21)` を固定し、しっぽも全体を通じて発達します。成長の途中に圧縮・停止・行き過ぎと跳ね返り・最後だけの別のパス変形はありません。

正確な基本形になってから、残り25%（初期値では140 ms）で吹き出し全体を小さく弾ませます。参考にしたのは既存の Reaction（顔のリアクション）アイコンで、React ブランドではありません。中心 `(12,12)` を基準につぶれ・伸びと上下移動を組み合わせ、回転やしっぽを支点にした動きは使いません。

弾みの進行を `q=0…1`、強さを `a` とし、`q=0` は標準状態、`.20` で下へ `.8a`・倍率 `(1+.08a,1−.08a)`、`.48` で上へ `3a`・倍率 `(1−.05a,1+.08a)`、`.78` で下へ `.5a`・倍率 `(1+.04a,1−.04a)`、`1` で標準状態に戻します。各区間を smoothstep `u²(3−2u)` で補間します。完成後のパス全体を動かし、新しいパス変形・線描画・残像は追加しません。成長中の `(3,21)` は固定ですが、その後の弾みで見える輪郭は動きます。操作領域と合計時間は変わりません。完了・中止・待機・動きを抑える設定では基本形を保ち、後処理は既存のグループスタイルを復元します。小さな弾みで生き生きした終わり方になるという仮説であり、万人にとって心地よいという主張ではありません。

SVG 属性を毎フレーム更新する移植可能な再生処理と、フレーム停止時だけ働く64 msの監視処理は維持します。Comment の実行時は実時間で75%/25%を分け、成長の範囲内でイージングをかけ、最後の弾みを実時間で進めます。公開プランはパスとグループ変形の2種類のステップを持ち、通常の ease-in-out 再生でも実時間の配分が合うよう offset を補正しています。中止や表示切り替えでは、その再生が所有する属性・グループスタイルだけを戻します。Repost は複合パス2本、Comment は1本のままなので、Trace のパス構成と時間差は変わりません。

Compatible command lists follow the [SVG path interpolation rules](https://www.w3.org/TR/SVG/paths.html#TheDProperty).

## Reusable API / 再利用

```tsx
<LikeButton label="Like" selected={liked}
  iconMotion="cartoon"
  motionTokens={{ duration: 560, intensity: 1, stagger: 60 }}
  reducedMotion={false}
  onClick={() => setLiked(value => !value)} />
```

- `iconMotion`: `none | pulse | spring | trace | gesture | cartoon`; default `spring`. Independent of visual `variant`
- `motionTokens.duration`: 0–1600 ms, default 560. Zero disables glyph motion
- `motionTokens.intensity`: 0–2, default 1. Zero disables glyph motion; scales spatial motion; Cartoon Repost varies pace while retaining its original rectangle, fixed body length and one full lap, and Cartoon Comment varies its initial circle size and final bounce translation/scale; Trace adjusts how much outline is redrawn and how far its fill fades
- `motionTokens.stagger`: 0–160 ms, default 60. Delay between staggered glyph parts, effects, or traced paths; it adds to the total duration
- `motionTrigger`: number or string; changing it replays the selected glyph without invoking `onClick` or changing semantic state. Initial render does not replay
- `reducedMotion`: default false; true suppresses both glyph motion and this button's CSS press/hover transforms, even outside the playground
- `defaultMotionTokens`, `normalizeMotionTokens`, `iconMotions`, `glyphMotionPlan` and their TypeScript types are exported. `glyphMotionPlan` is a pure inspectable keyframe plan; the internal hook is not a public export

OS の `prefers-reduced-motion: reduce` は手動設定より優先されます。`motionTrigger` の変更は動きの再生だけで、いいねの状態や非同期処理を変更しません。`duration` / `intensity` が 0 の場合は静止します。不正な数値は初期値に戻し、有限な範囲外の値はクランプします。`stagger` は時間差を使うパーツ・装飾・線の間の遅延で、全体の所要時間に加算されます。

`tokensToDTCG(visualTokens, motionTokens)` includes the versioned `iconMotion` duration/intensity/stagger group. Visual `duration` still controls CSS state transitions; it is deliberately separate from glyph duration. DTCG 2025.10 is a Community Group specification, not a W3C Recommendation.

## Activation, pending, completion / 操作・処理中・完了

Activation feedback runs once and does **not** claim success. When `pending` is true, the chosen glyph repeats at lower spatial intensity and a slower period (at least 1100 ms). Cartoon secondary burst effects are suppressed while pending, so the loop does not repeatedly celebrate an unfinished action. Static `···`, `aria-busy`, and contextual live status carry the pending state. Reduced motion and browsers without Web Animations still retain those static cues. There is no rotating ring.

開始時の動きは成功の通知ではありません。処理中はゆっくり反復し、cartoon の追加バーストを抑え、静止した点・`aria-busy`・状況説明も残します。完了や失敗の意味は、利用側の結果・エラー表示で伝えてください。`pending` を false に戻すと反復は止まり、勝手に成功アニメーションを再生しません。

Reactivation, trigger changes, settings changes, reduced-motion changes, cancellation and unmount cancel the prior animation set. Each replay owns its trace and decorative-effect cleanup, so an old cancelled promise cannot erase the next replay's styling. Reduced motion leaves no lingering outline burst or other secondary effect. Animation never schedules or mutates a request. Continue to use `useAsyncAction` for async cancellation and stale-result ownership.

## Verification / 動作確認

Release verification should cover all 12 actions × 5 treatments with plan and lifecycle tests, then sample real SVG path attributes, computed transforms, line offsets, and effect opacity over elapsed time on desktop and mobile. For these two morphs, check Repost’s original rectangular route, constant 16-unit path length, 3-back/3-side heads, and half-perimeter separation; check Comment’s immediate small-circle start, monotonic growth, developing tail, and fixed `(3,21)` bounds during inflation. Verify it reaches the canonical contour at 75% of real duration, then moves the whole glyph through the bounce landmarks with smoothstep interpolation, center-based squash/stretch, no rotation or tail pivot, and no further path changes. Check the public two-part plan’s easing-compensated timing, intensity limits, unchanged total duration, and restoration of prior group styles. Also check playback-clock progression, fixed target geometry, replay, pending without secondary bursts, cancellation, and reduced motion. Frame screenshots provide visual review only; a still image alone does not prove animation. See [QA](https://github.com/domizo/social-interaction-lab/blob/main/docs/QA.md) for actual completed runs and limits; this checklist is not a claim that a release has passed.

12操作 × 5表現について、計画・ライフサイクルのテストと実ブラウザでの時間変化を確認してください。静止画だけでは動きや中止を証明できません。実施済みの確認と未確認事項は QA に記録します。
