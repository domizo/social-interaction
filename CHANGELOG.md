# Changelog / 変更履歴

## 0.3.8 — 2026-10-11

- Lift Cartoon Comment while its accepted contour inflates through the first 75%; reach the exact full bubble at the peak, `−3 × intensity` SVG units / 最初の75%で膨らみながら上がり、基本の吹き出しが完成する瞬間を頂点にする
- Use the final 25% for a fall, landing squash, mild rebound, and rest; keep the 560 ms default split at 420 ms + 140 ms / 最後の25%で落下・着地のつぶれ・小さな跳ね返り・静止をつなぎ、合計時間を維持
- Keep scale neutral during inflation, then smoothstep between centered poses at `q=0,.48,.72,1`; use no rotation or tail pivot / 成長中は拡大縮小せず、完成後は中心基準の姿勢を滑らかにつなぐ
- Preserve the path interpolation and local `(3,21)` growth bounds while the whole glyph moves upward on screen; retain intensity, cancellation cleanup, reduced motion, and the path-plus-transform plan / パスとローカル基準を保ち、画面上では全体が上がる。強さ・中止・動きの抑制・公開プランを維持
- Keep the accepted Repost motion unchanged / 確定済みのリポストの動きは変更しない

## 0.3.7 — 2026-10-11

- Replace only Cartoon Comment’s post-formation quiver with a whole-glyph bounce inspired by the existing Reaction face action, not the React brand / コメント完成後の震えを、既存の顔のリアクションを参考にした全体の弾みに置換
- Preserve the first 75% lower-left inflation and final 25% motion window (420 ms + 140 ms at the 560 ms default) / 左下からの成長と、合計時間・75%/25%の配分を維持
- Interpolate centered vertical translation and squash/stretch through anticipation, lift, landing, and rest using smoothstep; use no rotation or tail pivot / 中心を基準に上下移動・つぶれ・伸びを滑らかにつなぎ、回転やしっぽ支点は使わない
- Move only the fully formed canonical glyph; preserve intensity, reduced motion, style cleanup, and path-plus-transform plans without a new morph, trace, or echo / 完成した形だけを動かし、強さ・動きの抑制・後処理・公開プランを維持
- Keep the accepted Repost motion unchanged / 確定済みのリポストの動きは変更しない

## 0.3.6 — 2026-10-10

- Refine only Cartoon Comment: preserve its circle-to-canonical contour, fitting eased inflation into the first 75% of the selected duration / カートゥーンのコメントだけを調整し、円から基本形への成長を指定時間の最初の75%に収める
- Add two tiny damped rotation/squash oscillations to the fully formed bubble during the final 25%; keep total duration unchanged (420 ms + 140 ms at the 560 ms default) / 完成後にごく小さく2回揺らし、合計時間を維持
- Bound the shake by 2.8° rotation and 1.5% squash × intensity, with `(1−q)²` damping; use no second path morph, trace, or echo / 強さに応じた回転・つぶれを減衰させ、別のパス変形・線描画・残像は加えない
- Export path and glyph-transform plan steps with easing-compensated offsets; use raw runtime time for the inflation/shake split / 公開プランの時間配置を補正し、実時間で成長と揺れを分ける
- Preserve reduced motion, cancellation ownership and prior group styles on cleanup; keep Repost unchanged / 動きの抑制・中止・既存スタイルの復元を維持し、リポストは変更しない

## 0.3.5 — 2026-10-10

- Keep Cartoon Repost on its original `x=4…20`, `y=6…18` rectangle: perimeter 56, body length 16, original 3-back/3-side arrowheads, and half-perimeter separation / 元の長方形・矢印の長さ・矢じり・半周の間隔を維持
- Remove Repost entry/exit bridges and the artificial rounded route; 16-unit bodies span corners on the 12-unit vertical sides / 開始・終了の接続変形と角丸経路を除き、短い縦辺では角をまたぐ
- Start Comment activation immediately as a tiny lower-left circle and grow continuously into the canonical bubble, with its tail developing throughout / 操作直後の小さな円から基本の吹き出しへ、しっぽも含めて連続的に成長
- Keep Comment bounds anchored at `(3,21)`; remove compression, holds, rebounds, and a separate late morph / 左下の基準点を固定し、圧縮・停止・跳ね返り・最後だけの変形を除去
- Use intensity for Repost pace accent and Comment initial size; retain canonical idle/end/cancel/reduced geometry and the existing portable SVG-attribute playback/watchdog / 強さは進行速度の抑揚・初期サイズに適用。基本の静止形状と移植可能な再生処理は維持

## 0.3.4 — 2026-10-10

- Share the exact standard Repost/Comment glyphs across all treatments at rest, start, completion, cancellation and reduced motion / 全スタイルで同じ基本アイコンを使用
- Add continuous entry/settle bridges around the existing deforming-arrow circuit and circle-to-tail motion / 動作中だけ変形し、元の形へ滑らかに戻る
- Preserve the two compound Repost paths and one Comment path, including Trace staggering / Trace のパス構成と時間差を維持
- Check cross-style geometry/pixel identity and near-end contour convergence in Chromium, WebKit and Firefox / 静止時の一致と終了直前の形状収束を3エンジンで検証

## 0.3.3 — 2026-10-10

- Remove the CSS `d` compatibility bailout that disabled Cartoon Repost/Comment on unsupported engines / CSS の対応判定で2操作が止まる問題を修正
- Render the agreed geometry through SVG attributes on animation frames; preserve timing, lifecycle ownership and all other treatments / 形を保ち、毎フレーム SVG 属性を更新
- Test production builds in Chromium, WebKit and Firefox, including CSS support forced off, ordinary clicks, Play all, live Comment, natural completion and reduced motion / 3エンジンで通常操作・一括再生・完了・抑制を検証

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
