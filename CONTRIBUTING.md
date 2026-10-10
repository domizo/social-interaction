# Contribution checklist / 変更チェックリスト

1. Write the intended feeling, context, and downside as a testable hypothesis / 印象・文脈・制約を仮説として記録
2. Change shared visual/motion tokens in src/lib/tokens.ts and src/lib/iconMotion.ts; do not fork specimen-only values / 共通トークンを変更
3. Compare baseline and adjusted states in both EN and JA, phone and desktop / 両言語・画面幅で差分確認
4. Keep Like toggle, Comment/Quote composer and Share menu semantics distinct / 操作の意味を維持
5. Check focus, target size, contrast, reduced motion, cancellation, repeated clicks, failure and stale results / 操作状態を検証
6. Add a regression test and update docs/CHANGELOG / 回帰テスト・文書・変更履歴を更新
7. Run npm run check, npm test, npm run build, npm run verify:consumer / 型・テスト・外部利用を検証
8. Commit, then run npm run verify:archive and browser tests / コミット済みソースから再現確認
9. Review package exports and license; never publish publicly without explicit approval / 出力・ライセンスを確認し、無断公開しない

Semantic versioning: bug fixes patch; backward-compatible additions minor; breaking props or behavior major. Record token and visual changes even when the TypeScript API stays compatible. / 型が変わらなくても見た目・トークンの変更を記録します。

For glyph changes, sample real SVG computed styles over time, not just animation names or screenshots. Verify all actions, fixed hit geometry, pending cancellation, rapid trace replay, standalone reducedMotion and OS reduction. / アイコン変更では時間経過に伴う実際の SVG 表示差も検証します。
