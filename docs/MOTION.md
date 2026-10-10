# Glyph motion / アイコンの動き

Version 0.3.1 refines Cartoon Repost and Comment while preserving the other plans. Version 0.3.0 expands the catalog to 12 SVG icons and five treatments, adding `cartoon` alongside `pulse`, `spring`, `trace`, and `gesture`. `none` remains the opt-out. Motion changes the glyph, a glyph part, or its drawn path; it never resizes the button hit target. These are design hypotheses to compare in context, not universal rules about what feels beautiful.

| Treatment | Like | Comment | Share | Quote | Intended feel and tradeoff |
|---|---|---|---|---|---|
| `pulse` | Scale and settle | Scale and settle | Scale and settle | Scale and settle | Consistent recognition; less action-specific personality |
| `spring` | Heart bounce | Bubble squash/inflate | Arrow lift; tray stays still | Staggered mark bounce | Responsive and tactile; can be too expressive in dense interfaces |
| `trace` | Outline redraw | Outline redraw | Staggered paths | Staggered paths | Deliberate drawing; briefly reduces the outline's completeness |
| `gesture` | Heart tilt | Bubble sway | Arrow launch and return | Marks open in sequence | Action-specific expression; more visual attention and travel |
| `cartoon` | Quiver + expanding, fading outline | Bottom-left bubble inflation | Arrow anticipation and launch | Exaggerated sequential marks | Anime/cartoon-inspired expression; larger overshoot and decorative effects demand more attention |

pulse は統一感、spring は弾力、trace は線を描く印象、gesture は操作ごとの個性、cartoon はアニメ的な誇張を比較するための仮説です。ハートの震えと拡大して消える輪郭、吹き出しのポップな出現などを実際の SVG で表現します。trace は線の一部が一時的に欠け、cartoon は装飾と大きめの変形で視線を集めるため、表示の小ささや情報密度に合わせて判断してください。

## Cartoon catalog / カートゥーンの操作一覧

All 12 actions can use every treatment. Cartoon gives each action its own sequence; visible icon motion is separate from the four surface variants and the fixed hit target.

| Action | Cartoon sequence / 動き |
|---|---|
| Like / いいね | Heart anticipation and quiver; a duplicate outline expands and fades / ハートの予備動作と震え、拡大して消える輪郭 |
| Comment / コメント | Bubble inflates from the bottom-left tail, with a short outline redraw, then overshoots and settles / 左下のしっぽを固定して吹き出しが膨らみ、軽く弾んで収束 |
| Share / 共有 | Arrow anticipates, launches, and returns / 矢印の予備動作・発射・復帰 |
| Quote / 引用 | Quote marks exaggerate their movement in sequence / 引用符が時間差で大きく動く |
| Repost / リポスト | Two opposed arrows follow one invisible rounded-rectangle circuit and return / 2本の矢印が見えない角丸の枠に沿って一周し、元に戻る |
| Bookmark / ブックマーク | Bookmark drops and settles / しおりが落ちて収束 |
| Note / メモを保存 | Sticky-note corner folds / 付箋の角が折れる |
| Star / スター | Star pops with brief rays / 星のポップと短い放射線 |
| Send / 送信 | Paper plane folds, launches, and returns / 紙飛行機が折れ、飛んで戻る |
| Sparkles / きらめき | Glints appear with staggered timing / 光が時間差で現れる |
| Bell / ベル | Bell rings / ベルが揺れる |
| Reaction / リアクション | Face bounces / 顔が弾む |

Decorative effect groups add no accessible names, state, or success meaning. They are hidden at rest and share cancellation ownership with the main glyph. The note is an alternate save icon; sparkles is not an AI integration.

装飾グループはアクセシブル名・状態・成功の意味を追加しません。静止時は隠れ、主アイコンと同じ単位で中止されます。付箋は保存アイコンの別案、きらめきは AI 連携を持たない視覚表現です。

### Two precise anchors / 2つの基準点

Cartoon Comment scales around SVG viewBox point `(3,21)`, the bottom-left tail. Its main bubble and decorative echo share this anchor; there is no translating start. Other Comment treatments keep their existing center-based transforms.

Cartoon Repost animates each arrow separately. The arrow tips start at `(17,6)` and `(7,18)`, follow the same clockwise rounded rectangle (`x=4…20`, `y=6…18`, radius `3`) half a lap apart, and return after exactly one circuit. Each arrow turns with the route tangent; the parent icon does not rotate and no guide or echo is drawn. Duration sets one lap; any nonzero intensity retains the full lap and controls in-flight compactness instead of turn count. The two arrows stay synchronized, so this pair does not use the stagger token. Zero intensity/duration and reduced motion still disable movement.

Comment は左下のしっぽ `(3,21)` を動かさずに膨らみます。Repost は2本の矢印が同じ見えない角丸の経路を半周ずれて進み、1周で元に戻ります。矢印ごとに向きが変わり、アイコン全体は回転しません。強さは移動中の縮み具合を変え、0以外では1周を保ちます。この2本は同期して動くため、時間差トークンを使用しません。他の操作・表現は変更していません。

SVG anchors use the [CSS Transforms reference-box and origin rules](https://www.w3.org/TR/css-transforms-1/#transform-box).

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
- `motionTokens.intensity`: 0–2, default 1. Zero disables glyph motion; scales spatial motion (Cartoon Repost varies compactness while retaining one full lap); Trace adjusts how much outline is redrawn and how far its fill fades
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

Release verification should cover all 12 actions × 5 treatments with plan and lifecycle tests, then sample real SVG computed transforms, line offsets, and effect opacity over elapsed time on desktop and mobile. Check currentTime progression, fixed target geometry, replay, pending without secondary bursts, cancellation, and reduced motion. Frame screenshots provide visual review only; a still image alone does not prove animation. See [QA](https://github.com/domizo/social-interaction-lab/blob/main/docs/QA.md) for actual completed runs and limits; this checklist is not a claim that a release has passed.

12操作 × 5表現について、計画・ライフサイクルのテストと実ブラウザでの時間変化を確認してください。静止画だけでは動きや中止を証明できません。実施済みの確認と未確認事項は QA に記録します。
