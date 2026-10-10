# Changelog / 変更履歴

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
