# Contribution checklist / 変更チェックリスト

1. Write the intended feeling, context, and downside as a testable hypothesis / 印象・文脈・制約を仮説として記録
2. Change shared visual/motion tokens in src/lib/tokens.ts and src/lib/iconMotion.ts; do not fork specimen-only values / 共通トークンを変更
3. Compare baseline and adjusted states in both EN and JA, phone and desktop / 両言語・画面幅で差分確認
4. Keep Like/Bookmark/Note/Star/Bell as stable-label controlled toggles, the other seven as commands, and Comment/Quote composer and Share menu contracts intact / 5トグル・7コマンド・ポップアップの意味を維持
5. Check focus, target size, contrast, reduced motion, cancellation, repeated clicks, failure and stale results / 操作状態を検証
6. Add a regression test and update docs/CHANGELOG / 回帰テスト・文書・変更履歴を更新
7. Run npm run check, npm test, npm run build, npm run verify:consumer / 型・テスト・外部利用を検証
8. Commit, then run npm run verify:archive and browser tests / コミット済みソースから再現確認
9. Review package exports and license; never publish publicly without explicit approval / 出力・ライセンスを確認し、無断公開しない

Semantic versioning: bug fixes patch; backward-compatible additions minor; breaking props or behavior major. Record token and visual changes even when the TypeScript API stays compatible. / 型が変わらなくても見た目・トークンの変更を記録します。

For glyph changes, sample real SVG computed styles over time, not just animation names or screenshots. Verify all 12 actions × five treatments, fixed hit geometry, pending cancellation, rapid trace/cartoon replay, standalone reducedMotion and OS reduction. Include effect opacity and cleanup: an old replay must not hide a new effect, and stop/unmount/reduction must not leave a burst visible. Pending must retain static status without cartoon secondary bursts. / アイコン変更では12操作 × 5表現の時間変化を確認。装飾の不透明度・後処理・中止・動きの抑制も検証し、古い再生が次の再生を壊さないようにします。

Keep `socialActions`, `toggleActions`, `isToggleAction`, `actionLabels`, named exports, EN/JA copy, and the docs synchronized. Note is a sticky-note save alternative (“Keep note” / “メモを保存”), not an editor. Catalog previews must not open live popups or imply SNS/AI integration. Treat expressive motion as a design hypothesis with an attention cost. / メタデータ・公開部品・両言語の文言を同期。付箋は保存操作の別案とし、カタログは外部サービスを起動しません。誇張した動きの利点と視線を集めるコストを記録します。

## Studio 0.4.0 checks / Studio の確認項目

- Keep one shared configuration across feed/article/scripted-chat previews, settings, preset snapshots, and exports; preserve the original comparison workflow and accepted 0.3.8 motion / 場面・保存・書き出しの設定を共有し、既存の比較と確定済みモーションを維持
- Test schema/version/size limits, exact keys, duplicate actions/names, both labels, finite bounded values, escaped strings, and slow-import races; a rejected import must not alter the working configuration / 不正・過大・競合する読み込みで現在の設定を壊さない
- Test blocked/full storage and corrupt data without claiming persistence or silently deleting stored presets; test denied clipboard and download-initiation fallbacks / 保存失敗・破損・コピー失敗を可視化し、データを無断で消さない
- Run `npm run verify:generated` after building the archive, alongside the clean external `verify:consumer`; keep CI and archive verification in sync. Generated TSX must compile in EN/JA with every action, custom tokens, and hostile-looking text labels / 生成コードとクリーンな外部利用を両方検証
- Give each timeline an exclusively owned standalone SVG. Check seek/play/pause/stop/destroy, finite rates/times, total staggered duration, repeated/replaced playback, resource cleanup, unsupported animation, and live OS/manual reduction / 時間軸の専有・時間・中止・復元・動き抑制を検証
- Exercise all four independent async examples through pending, success, failure, retry, cancel, off-to-on and on-to-off reversal; ignore stale results without unlocking a newer request / 非同期の独立性・反転・古い応答対策を検証
- Verify that the design lens changes only its selected token; distinguish configured minimum target, rendered bounds, icon-box center, and same-row gap. Check long labels, wrapping, fonts, and resize / レンズの単変数と測定対象を明確にし、折り返しも確認
- Inspect browser behavior in both languages and narrow/wide layouts. Record actual evidence in `docs/QA.md` without rewriting historical results or equating type/DOM tests with browser or accessibility QA / 実施した検証だけを記録し、過去の結果は保持
