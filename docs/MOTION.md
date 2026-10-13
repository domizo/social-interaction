# Glyph motion / アイコンの動き

The accepted 0.3.8 Cartoon Comment motion is retained in 0.6.0: the glyph rises while its existing circle-to-canonical contour inflates through the first 75% of the selected duration, reaching the exact full bubble at the peak. The final 25% is a fall, landing squash, mild rebound, and settle. Total duration is unchanged. Cartoon Repost retains its accepted original rectangular route and motion. Every treatment shares the canonical glyph at idle, completion, cancellation and reduced motion; Comment deliberately switches to its small circle immediately on activation. The portable SVG-attribute renderer and its existing watchdog remain in use. The catalog has 12 SVG icons and five treatments: `pulse`, `spring`, `trace`, `gesture`, and `cartoon`; `none` is the opt-out. Motion changes the glyph, a glyph part, or its drawn path; it never resizes the button hit target. These are design hypotheses to compare in context, not universal rules about what feels beautiful.

| Treatment | Like | Comment | Share | Quote | Intended feel and tradeoff |
|---|---|---|---|---|---|
| `pulse` | Scale and settle | Scale and settle | Scale and settle | Scale and settle | Consistent recognition; less action-specific personality |
| `spring` | Heart bounce | Bubble squash/inflate | Arrow lift; tray stays still | Staggered mark bounce | Responsive and tactile; can be too expressive in dense interfaces |
| `trace` | Outline redraw | Outline redraw | Staggered paths | Staggered paths | Deliberate drawing; briefly reduces the outline's completeness |
| `gesture` | Heart tilt | Bubble sway | Arrow launch and return | Marks open in sequence | Action-specific expression; more visual attention and travel |
| `cartoon` | Quiver + expanding, fading outline | Inflate while rising, then fall, squash, rebound, and settle | Arrow anticipation and launch | Exaggerated sequential marks | Anime/cartoon-inspired expression; larger overshoot and decorative effects demand more attention |

pulse は統一感、spring は弾力、trace は線を描く印象、gesture は操作ごとの個性、cartoon はアニメ的な誇張を比較するための仮説です。ハートの震えと拡大して消える輪郭、小さな円から吹き出しへの連続的な成長などを実際の SVG で表現します。trace は線の一部が一時的に欠け、cartoon は装飾と大きめの変形で視線を集めるため、表示の小ささや情報密度に合わせて判断してください。

## Assign motion in Studio / Studio で動きを割り当てる

Use **Motion** to choose a global treatment and optional per-icon overrides. **Inherit global** or **Reset to global** removes an override; explicit `none` stays still independently of the global choice. Shared duration/intensity/stagger apply to all assignments. The selected-action previews and timeline resolve `motionOverrides[action] ?? iconMotion`; the timeline’s treatment is a readout, with assignment changes made above it. Live actions, contexts, async Like/Save examples, and generated React resolve the same way. Removing/re-adding an icon retains its override.

Use **Guide → Motion reference** for the five-treatment matrix, and **Guide → Icon catalog** for all 12 icons. The catalog initially shows **Assigned motions** from the working configuration. Alternative catalog treatments and reference timing controls affect only their local experiment, never the shared configuration. These changes reorganize where choices are made; all 12 × 5 existing geometry/timing plans remain unchanged in 0.6.0.

「動き」で全体と個別の動きを選びます。「全体に合わせる」「全体へ戻す」は個別指定を削除し、明示的な `none` は全体と無関係に静止します。時間・強さ・パーツの時間差は共通です。各プレビュー・実操作・各場面・非同期・時間軸・生成 React は同じ規則で動きを決定し、操作を外して再追加しても個別指定を保持します。時間軸の割り当ては読み取り専用で、上の設定から変更します。「ガイド → 動きの比較」の5表現と「アイコン一覧」の全12操作は参照実験です。カタログの初期値は「設定したモーション」で、別の動きや時間を試しても共有設定は変えません。0.6.0 では全60組の形状と時間配分を維持します。

## Cartoon catalog / カートゥーンの操作一覧

All 12 actions can use every treatment. Cartoon gives each action its own sequence; visible icon motion is separate from the four surface variants and the fixed hit target.

| Action | Cartoon sequence / 動き |
|---|---|
| Like / いいね | Heart anticipation and quiver; a duplicate outline expands and fades / ハートの予備動作と震え、拡大して消える輪郭 |
| Comment / コメント | A tiny lower-left circle inflates while rising, becoming the full bubble at 75%; it then falls, squashes, rebounds mildly, and settles / 最初の75%で膨らみながら上がり、頂点で完成。落下・着地のつぶれ・小さな跳ね返りから静止へ |
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

Cartoon Comment is canonical while idle, but activation immediately displays a tiny closed circle at the lower-left. The accepted continuous, monotonic circle-to-canonical path interpolation is preserved, with its easing fitted into the first `75%` of the selected real duration (`420 ms` at the `560 ms` default). The path's local bounding-box corner remains `(x=3, y=21)` as the contour grows upward/rightward and its tail develops throughout. This is a local geometry reference: the whole glyph rises during formation, so that corner also moves upward on screen. There is no initial compression, intermediate hold, contour growth overshoot/rebound, or separate late path morph. Intensity changes the initial circle size, not the target contour or local growth bounds.

With normalized total time `t` and intensity `a`, formation uses vertical translation `−3a × morphEase(t/.75)` and identity scale. The exact canonical bubble is reached at `t=.75`, at the peak `y=−3a` SVG units. Over the final `25%` (`140 ms` at the default), the fully formed glyph falls, squashes on landing, rebounds mildly, and settles. Squash/stretch uses the center `(12,12)`; there is no rotation or tail pivot. With post-formation progress `q=(t−.75)/.25`, the landmarks are:

| q | Vertical translation y | Scale (x, y) | Phase |
|---|---|---|---|
| `0` | `−3a` | `(1, 1)` | Fully formed at peak |
| `.48` | `+.72a` | `(1+.08a, 1−.08a)` | Landing/squash |
| `.72` | `−.8a` | `(1−.025a, 1+.04a)` | Mild rebound |
| `1` | `0` | `(1, 1)` | Settled at baseline |

At landing, `+.72a` offsets the vertical squash over the tail’s 9-unit distance from the center, placing the tail on its resting `y=21` baseline. Each post-formation interval uses smoothstep interpolation `u²(3−2u)`, with `u` running from 0 to 1 between adjacent landmarks. The canonical path moves as one glyph; it does not morph again, and there is no trace or echo. The whole-glyph transform moves the visible bounds during both formation and settling, while the button hit target remains fixed. The transform settles to neutral within the selected total duration. Exact canonical geometry remains the idle/end/cancel/reduced-motion state, and cancellation restores any pre-existing group styles.

The rise-and-land motion is a design hypothesis for a livelier finish, with an attention cost to assess in context; it is not a universal claim of pleasantness.

The public Comment plan now contains both a path step and a glyph-transform step. Its offsets compensate for the global easing so ordinary manual `element.animate()` playback can keep `ease-in-out` while preserving the intended real-time 75%/25% split. The inspectable path keyframes retain compatible commands; direct CSS-path playback still requires CSS-path support.

Portable runtime playback is owned by `ActionButton` and uses the existing cancel-owned `requestAnimationFrame` renderer to write SVG `d` attributes. Comment uses raw elapsed time to divide the selected duration, applies the same local easing to contour inflation and lift in the first 75%, then samples the fall/landing/rebound in real time over the last 25%. It does not globally ease the phase split a second time. Repost’s playback is unchanged. The existing cancel-owned 64 ms watchdog samples the same clock only when document animation frames stall; it stops at completion and is cleared on cancellation. Playback continues to support pending iterations and a trigger made inert by its composer. Repost uses no group transform; Comment translates the whole glyph during formation and adds centered squash/stretch after reaching canonical shape. All other actions and treatments, including explicit `trace`, keep their previous plans and glyph geometry.

`ActionIcon` retains the optional `motion` prop for compatibility, but every treatment renders identical canonical resting geometry. Repost remains two compound paths and Comment one path, preserving Trace path count and stagger. The inspectable CSS plans use sampled command-compatible outlines; the component restores exact arc/relative-command paths. CSS `d: path(...)` support is not required or queried. Natural completion, replay, settings changes and unmount restore only attributes and group styles still owned by that playback, preserving prior styles without overwriting a newly rendered glyph. These two morphs need `requestAnimationFrame`; the other treatments use Web Animations. Cross-engine checks target Chromium, WebKit and Firefox; real Safari/physical-device behavior is a separate verification limit.

リポストは元の長方形 `x=4…20`、`y=6…18`（幅16・高さ12・周長56）をそのまま使います。長さ16の本体2本が半周の28だけ離れて一周し、矢じりは先端の接線から後ろへ3、左右の垂直方向へ各3という元の寸法を保ちます。角丸の別経路や開始・終了の接続変形はありません。縦辺は12しかないため、長さ16の本体は必ず角をまたぎ、完全にまっすぐな縦矢印にはなりません。強さは速度の抑揚だけに作用し、経路・長さ・矢じり・間隔・一周は変えません。

コメントは待機中に基本の吹き出しを表示し、操作した瞬間に左下の小さな閉じた円を表示します。既存の連続的かつ単調なパス補間を保ち、指定した実時間の最初の75%（初期値560 msなら420 ms）で膨らみながら上がり、頂点で基本形が完成します。パスのローカルな外接矩形の左下は `(3,21)` を保ち、しっぽも全体を通じて発達します。ただし、グループ全体が上がるため、この基準点の画面上の位置は動きます。輪郭の成長に圧縮・停止・行き過ぎ・最後だけの別のパス変形は加えません。

全体の進行を `t`、強さを `a` とすると、成長中の上下移動は `−3a × morphEase(t/.75)`、倍率は `(1,1)` です。`t=.75` で正確な基本形になり、上へ `3a` SVG 単位の頂点に達します。残り25%（初期値では140 ms）で落下し、着地時につぶれ、小さく跳ね返って静止します。つぶれ・伸びは中心 `(12,12)` を基準とし、回転やしっぽ支点は使いません。

完成後の進行を `q=(t−.75)/.25` とし、`q=0` は上へ `3a`・倍率 `(1,1)`、`.48` で下へ `.72a`・倍率 `(1+.08a,1−.08a)`、`.72` で上へ `.8a`・倍率 `(1−.025a,1+.04a)`、`1` で上下移動なし・倍率 `(1,1)` に戻します。着地時の下向き `.72a` は、中心からしっぽまでの9単位にかかるつぶれを補い、しっぽを静止時の `y=21` に着地させます。各区間を smoothstep `u²(3−2u)` で補間します。完成後はパス全体を動かし、新しいパス変形・線描画・残像は追加しません。成長中も完成後も見える輪郭は移動しますが、操作領域と合計時間は変わりません。完了・中止・待機・動きを抑える設定では基本形を保ち、後処理は既存のグループスタイルを復元します。上がって着地する動きで生き生きした終わり方になるという仮説であり、万人にとって心地よいという主張ではありません。

SVG 属性を毎フレーム更新する移植可能な再生処理と、フレーム停止時だけ働く64 msの監視処理は維持します。Comment の実行時は実時間で75%/25%を分け、最初の75%で輪郭の成長と上昇に同じイージングをかけ、最後の25%で落下・着地・跳ね返りを進めます。公開プランはパスとグループ変形の2種類のステップを持ち、通常の ease-in-out 再生でも実時間の配分が合うよう offset を補正しています。中止や表示切り替えでは、その再生が所有する属性・グループスタイルだけを戻します。Repost は複合パス2本、Comment は1本のままなので、Trace のパス構成と時間差は変わりません。

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
- `motionTokens.intensity`: 0–2, default 1. Zero disables glyph motion; scales spatial motion; Cartoon Repost varies pace while retaining its original rectangle, fixed body length and one full lap, and Cartoon Comment varies its initial circle size, formation lift, and post-formation translation/scale; Trace adjusts how much outline is redrawn and how far its fill fades
- `motionTokens.stagger`: 0–160 ms, default 60. Delay between staggered glyph parts, effects, or traced paths; it adds to the total duration
- `motionTrigger`: number or string; changing it replays the selected glyph without invoking `onClick` or changing semantic state. Initial render does not replay
- `reducedMotion`: default false; true suppresses both glyph motion and this button's CSS press/hover transforms, even outside the playground
- `defaultMotionTokens`, `normalizeMotionTokens`, `iconMotions`, `glyphMotionPlan` and their TypeScript types are exported. `glyphMotionPlan` is a pure inspectable keyframe plan; the internal hook is not a public export

OS の `prefers-reduced-motion: reduce` は手動設定より優先されます。`motionTrigger` の変更は動きの再生だけで、いいねの状態や非同期処理を変更しません。`duration` / `intensity` が 0 の場合は静止します。不正な数値は初期値に戻し、有限な範囲外の値はクランプします。`stagger` は時間差を使うパーツ・装飾・線の間の遅延で、全体の所要時間に加算されます。

`tokensToDTCG(visualTokens, motionTokens)` includes the versioned `iconMotion` duration/intensity/stagger group. Visual `tokens.duration` controls button-surface CSS transitions and `tokens.amplitude` controls press depth; both live under Appearance → Surface hover & press feedback. They are separate from glyph duration/intensity and do not change an icon’s assigned treatment. DTCG 2025.10 is a Community Group specification, not a W3C Recommendation.

## Activation, pending, completion / 操作・処理中・完了

Activation feedback runs once and does **not** claim success. When `pending` is true, the chosen glyph repeats at lower spatial intensity and a slower period (at least 1100 ms). Cartoon secondary burst effects are suppressed while pending, so the loop does not repeatedly celebrate an unfinished action. `aria-busy`, `aria-disabled`, duplicate-activation guards, and contextual live status carry the pending state independently of animation. There is no separate pending-dot span, pending-dot pseudo-element, or rotating ring. With reduced/unsupported motion, `none`, or zero motion tokens, the glyph can stay static while the busy semantics, guards, and contextual status remain. The application owns result/error text and retry controls.

開始時の動きは成功の通知ではありません。処理中はゆっくり反復し、cartoon の追加バーストを抑え、`aria-busy`・`aria-disabled`・重複操作防止・状況説明を維持します。独立した点の要素や疑似要素はありません。動き抑制・再生非対応・`none`・時間や強さが0の場合も、静止したまま処理中の意味と操作防止を維持します。完了や失敗の意味は、利用側の結果・エラー表示で伝えてください。`pending` を false に戻すと反復は止まり、勝手に成功アニメーションを再生しません。

Reactivation, trigger changes, settings changes, reduced-motion changes, cancellation and unmount cancel the prior animation set. Each replay owns its trace and decorative-effect cleanup, so an old cancelled promise cannot erase the next replay's styling. Reduced motion leaves no lingering outline burst or other secondary effect. Animation never schedules or mutates a request. Continue to use `useAsyncAction` for async cancellation and stale-result ownership.

## Verification / 動作確認

Release verification should cover all 12 actions × 5 treatments with plan and lifecycle tests, then sample real SVG path attributes, computed transforms, line offsets, and effect opacity over elapsed time on desktop and mobile. For these two morphs, check Repost’s original rectangular route, constant 16-unit path length, 3-back/3-side heads, and half-perimeter separation; check Comment’s immediate small-circle start, monotonic contour growth, developing tail, and unchanged local `(3,21)` bounds while its screen position rises. Verify identity scale during formation and the exact canonical contour at the `−3 × intensity` peak at 75% of real duration, then the fall/landing/rebound/settle landmarks with smoothstep interpolation, center-based squash/stretch, no rotation or tail pivot, and no further path changes. Check the public two-part plan’s easing-compensated timing, intensity limits, unchanged total duration, and restoration of prior group styles. Also check playback-clock progression, fixed target geometry, replay, pending without secondary bursts, cancellation, and reduced motion. Frame screenshots provide visual review only; a still image alone does not prove animation. See [QA](https://github.com/domizo/social-interaction/blob/main/docs/QA.md) for actual completed runs and limits; this checklist is not a claim that a release has passed.

12操作 × 5表現について、計画・ライフサイクルのテストと実ブラウザでの時間変化を確認してください。静止画だけでは動きや中止を証明できません。実施済みの確認と未確認事項は QA に記録します。
