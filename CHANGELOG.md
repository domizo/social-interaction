# Changelog / 変更履歴

## 0.3.2 — 2026-10-10

- Correct Cartoon Repost to deform fixed-length sliding path segments, with tangent heads, rather than move rigid bent arrows / 矢印本体が経路の角で曲がり、直線で伸びる表現に修正
- Correct Cartoon Comment to grow a closed circle from the lower-left and introduce its tail only near the end; remove its trace and echo / 左下の円が育ち、最後にしっぽが現れる。線描画と残像を除去
- Preserve every other action/treatment, including explicit Trace; add path-shape, curvature, length, tangent, late-tail and no-dash browser checks / 他の表現を維持し、形そのものを検証

## 0.3.1 — 2026-10-10

- Refine only Cartoon Repost and Comment; preserve every other action/treatment plan / カートゥーンのリポスト・コメントだけを調整
- Move both Repost arrows around one invisible rounded-rectangle circuit, with independent tangent orientation and an exact return / 2本の矢印が見えない角丸経路を一周して復帰
- Inflate Comment from its fixed bottom-left tail, then overshoot and settle / 吹き出しを左下のしっぽから膨らませ、軽く弾んで収束
- Add route winding, elapsed-time, multi-phase frame and fixed-anchor regressions / 一周・時間経過・複数フレーム・固定基準点の検証を追加

## 0.3.0 — 2026-10-10

- Add `cartoon`: action-specific anticipation, squash, overshoot, heart quiver with an expanding/fading outline, and bubble pop / カートゥーン表現、震えるハートと広がって消える輪郭、吹き出しの出現
- Expand to 12 icons with Repost, Bookmark, Note, Star, Send, Sparkles, Bell, and Reaction, plus named components and shared EN/JA catalog metadata / 8アイコン・名前付き部品・両言語メタデータを追加
- Add controlled Bookmark/Note/Star/Bell toggles alongside Like; keep the remaining seven actions as commands / 5トグルと7コマンドの意味を明確化
- Add a 12-card catalog and a fifth motion-comparison row; keep previews separate from live composers/menu and external services / 12枚のカタログ・5行目の比較、プレビューと実操作を分離
- Cancel decorative SVG effects with their replay; preserve fixed hit targets, bounded controls, and OS/manual reduced motion / 装飾も再生単位で中止し、操作領域・範囲・動きの抑制を維持
- Suppress cartoon secondary bursts while pending; retain slower glyph repetition, static dots, and accessible status / 処理中は追加バーストを抑え、ゆっくりした反復と静止した状態表示を維持
- Document the new API and review requirements; completed checks and limits belong in `docs/QA.md` / 新 API と確認項目を文書化、実施結果は QA に記録

## 0.2.0 — 2026-10-10

- Four selectable glyph-motion treatments × four actions: pulse, spring, trace, gesture / 4操作 × 4種類のアイコンアニメーション
- Dedicated EN/JA motion comparison, replay/stop, duration/intensity/stagger and live-action selection / 比較・一括再生・調整・実操作への反映
- Reusable iconMotion/motionTokens/motionTrigger/reducedMotion API and DTCG motion tokens / 再利用 API とトークン出力
- Pending now repeats the glyph with static dots; activation motion never implies success / 処理中はアイコンと静止した点で表現
- Cancel-owned Web Animations, stale trace cleanup protection, OS/manual reduction and fixed hit areas / 再生の所有・中止・古い後処理対策
- Real-browser temporal SVG sampling for all 16 combinations / 全16組合せの時間経過に伴う SVG 変化を検証

## 0.1.0 — 2026-10-10

- Initial private release: four shared social actions × four original styles / 初回 private 版
- Versioned bounded tokens, DTCG 2025.10 export, isolated comparisons and state catalog / 共通トークン・単変数比較・状態一覧
- EN/JA playground, design rationale, docs and contribution workflow / 両言語 UI・設計意図・運用手順
- Cancel-safe local asynchronous interactions and retained session-only drafts / 中止・古い応答対策とセッション内保存
- Strict external ESM / NodeNext package verification / 外部環境でのパッケージ検証
