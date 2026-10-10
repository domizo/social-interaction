# Design notes / 設計ノート

These are design hypotheses to evaluate in context, not universal judgments about beauty. / 以下は文脈の中で検証する仮説であり、美しさの普遍的な法則ではありません。

- Fine minimal: less surface may leave more attention for editorial content. Trade-off: actions may be harder to discover. / 面の少なさが内容への集中を助ける可能性。発見しづらさとの交換条件
- Soft round: low-intensity tint and continuous corners may feel approachable in community spaces. Trade-off: tinted backgrounds need contrast review. / 淡い色と丸みが親しみにつながる可能性。コントラスト確認が必要
- Clear solid: filled surfaces may improve action salience. Trade-off: visual weight competes with the post. / 塗りが操作の存在を伝える可能性。投稿内容と視覚的に競合
- Playful spring: restrained overshoot-like easing may add feedback without large displacement. Trade-off: motion sensitivity and fit for task context. / 控えめな動きが手応えを生む可能性。動きへの感受性に配慮

## Compare fairly / 公平に比べる

All variants use the same native button and icon geometry. Isolate mode holds other tokens at versioned defaults; choose one editable variable. Difference specimens always use the same content and selected Like state. The live Like count changes only after a simulated success. Keep content, viewport, language, state and reduced-motion preference fixed when judging a token change.

同じ内容・画面幅・言語・状態・モーション設定で比較します。見本の状態切替は表示のみで、実際の選択や処理は変えません。比較中も各操作の実際の状態は独立しています。

## Motion and geometry / 動きと形

Default duration 180ms; icon 20px; stroke 1.6 CSS px; gap 16px; amplitude 4%; hit target 44px. The icon scales independently of stroke via vector-effect=non-scaling-stroke. Press feedback scales inner content while the outer44px hit target stays fixed. Reduced motion removes transforms and animation, retaining static pending/error feedback. The spring variant uses a cubic-bezier curve, not simulated physics. No claim that one timing is ideal for every user.

## References / 参照

- [APG Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/): native semantics, stable toggle name, keyboard activation
- [WCAG 2.2 target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): 24 × 24 CSS px with defined exceptions; 44px is our design choice
- [DTCG Format 2025.10](https://www.designtokens.org/tr/2025.10/format/): Community Group specification, not a W3C Recommendation
- [Carbon motion](https://www.carbondesignsystem.com/building-blocks/foundations/motion/overview): context-sensitive use of motion informs our hypotheses; these components are not Carbon components

Sources reviewed 2026-10-10. No source establishes a universal ranking of these four styles.
