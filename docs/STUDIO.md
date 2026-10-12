# Interaction Studio / インタラクション Studio

Version 0.4.0 adds a local workflow for trying the existing library in context, keeping a configuration, and inspecting its behavior. The four variants and 12-action catalog remain shared with the original playground. The accepted 0.3.8 Cartoon Comment and Repost motion remains the baseline.

0.4.0 は既存の部品を実際の場面に近いサンプルで試し、設定を保存し、動きや状態を観察するためのローカルな作業画面です。4スタイル・12操作と、0.3.8 で確定したコメント・リポストの動きを引き継ぎます。

Version 0.4.1 adds a shared labelled/icon-only presentation setting, retained in presets, JSON, and generated TSX. Labelled remains the default.

0.4.1 では、ラベル付き／アイコンのみの表示設定を共有し、プリセット・JSON・生成 TSX に保持します。初期値は引き続きラベル付きです。

Version 0.4.2 makes the existing action selection prominent with **Choose icons to test** and keyboard-operable ordering controls. Select 1–12 existing actions; the same ordered configuration now drives the original comparison, live actions, context previews, motion rows, state specimens, token-diff specimens, design lens, presets, and exports. This adds no new action types or library props and preserves the accepted glyph motion.

0.4.2 では「試すアイコンを選ぶ」を見つけやすくし、キーボードで操作できる並べ替えを追加します。既存の12操作から1〜12個を選び、同じ順序と設定を従来の比較・実操作・場面プレビュー・動きの比較・状態見本・トークン差分・デザインレンズ・保存・書き出しで使います。操作の種類や公開 props は増やさず、確定済みのアイコンの動きを維持します。

## 1. Context and shared settings / 場面と共有設定

Switch between **Social feed**, **Article footer**, and **AI chat**. These are fixed sample content, including the scripted chat response. They share one configuration: context, variant, presentation, action list/order, both label languages, visual tokens, treatment, and motion tokens. Switching context does not replace the configuration with a separate set of defaults.

- Five toggle actions use local controlled state: Like, Bookmark, Note, Star, and Bell
- Comment and Quote open local draft dialogs; saved draft text stays in the mounted preview
- Share opens a keyboard-operated menu that shows an example link or prepares a local share
- Other commands produce local feedback; none posts to a social network, calls an AI model, or sends a message

Use the shared controls alongside the context preview. The presentation control switches between labelled and icon-only buttons across all three contexts, both design-lens specimens, async comparisons, original comparisons, and applicable motion/state specimens. Icon-only hides visible labels and counts; the stable accessible name, native title hint, and accessible count description remain. Labels are still editable and exported. The standalone timeline icon and explanatory headings are not button labels. The original comparison and motion controls also edit the shared token/motion values. The original isolation mode uses its effective one-variable token set for Studio previews and exports; applying a Studio configuration exits that isolation mode. The design lens has a separate local comparison value and does not overwrite the shared configuration.

3つの場面はすべて固定のサンプルです。操作・ラベル・表示方法・見た目・トークン・動きを共有し、場面を切り替えても別の初期値に置き換えません。コメントと引用の下書き、共有メニュー、ほかの操作もローカルです。従来の単変数モードでは有効なトークン値をプレビューと書き出しに使い、Studio 設定の適用でそのモードを解除します。デザインレンズ内の比較値は共有設定を変更しません。表示方法は3つの場面、レンズの両側、非同期比較、従来の比較、対応する動きと状態の見本に反映します。「アイコンのみ」は見えるラベルと件数を隠し、固定のアクセシブル名・標準の title ヒント・件数の説明を保ちます。ラベルの編集と書き出しは引き続き可能です。単独の時間軸アイコンや説明用の見出しはボタンのラベルではありません。

## 2. Presets and JSON / プリセットと JSON

Select 1–12 unique actions in **Choose icons to test**, above **Make it yours**. The default remains Like, Comment, Share, Quote. Newly selected actions are appended with their catalog labels. **Preview order** lists the current order; use **Earlier** and **Later** to move an action one position without changing its labels. Checkboxes and ordering buttons work with the keyboard, preserve focus when reordered, and announce changes and boundaries. The last selected action cannot be removed.

Edit the selected actions’ EN/JA names in **Actions & labels**, then choose **Apply labels** before saving or exporting. Unapplied edits are retained for unchanged selected actions when the picker adds, removes, or reorders actions, but are not yet part of the saved/exported configuration. Loading a preset or importing JSON replaces the label drafts with that configuration’s labels. Presets, JSON, and generated TSX preserve the exact selected array order; they do not sort it into catalog order.

The timeline offers only selected actions, in that order and with the configured labels. **Async comparison** deliberately keeps its independent Like/Save examples, and the **12-action catalog** remains a full reference catalog. The picker does not filter either of those sections.

A named preset saves a snapshot of the current configuration. Select it and choose **Load** to apply it. Presets are stored under `social-interaction-lab:studio-presets:v1` in this browser origin’s localStorage. They are not an account, cloud backup, or automatic save of every slider edit. Reload does not automatically apply a saved preset. Up to 20 names are allowed; trimmed names must be unique ignoring case, and each name must be 1–60 characters without control characters.

Storage reads/writes can fail, including unavailable storage or quota limits. The UI reports the problem and keeps the current working configuration usable. A failed save/delete does not update the in-memory preset list as though it succeeded. Invalid stored collections are left untouched; **Clear invalid saved data** explicitly removes that collection. **Retry browser storage** retries an unavailable read. Download a config JSON when you need a portable copy.

「試すアイコンを選ぶ」で1〜12個を選びます。初期値は「いいね・コメント・共有・引用」のままです。追加した操作は標準ラベルで末尾に入り、「表示する順番」の「前へ」「後ろへ」で1つずつ移動できます。並べ替えではフォーカスとラベルを保持し、変更や端の位置を読み上げ用に通知します。最後の1個は外せません。

「操作とラベル」で両言語の名前を編集し、「ラベルを適用」で確定してから保存・書き出ししてください。追加・削除・並べ替えの際、引き続き選択されていて確定ラベルが変わらない操作の編集中の名前は保持しますが、自動適用はしません。プリセットや JSON の読み込みでは読み込んだラベルに置き換えます。プリセット・JSON・生成 TSX は選択した配列順をそのまま保持します。時間軸も選択中の操作・順序・ラベルを使います。独立した非同期の「いいね／保存」比較と、全12操作の参照カタログは選択で絞り込みません。

プリセットは同じブラウザー・同じオリジンの localStorage 内だけに保存します。自動保存・クラウド同期ではなく、再読み込み後は選んで読み込みます。最大20件、名前は前後の空白を除去し、英字の大小を区別せず重複を拒否します。保存失敗は報告し、不正な既存データは明示的な消去まで保護します。

### Schema v1 contract / スキーマ v1 の条件

The downloadable `social-studio-config.json` is **one configuration**, not a preset collection. Its complete shape is:

```json
{
  "schemaVersion": 1,
  "context": "feed",
  "variant": "spring",
  "presentation": "labelled",
  "actions": [
    {"action": "like", "label": {"en": "Like", "ja": "いいね"}},
    {"action": "comment", "label": {"en": "Comment", "ja": "コメント"}}
  ],
  "tokens": {
    "iconSize": 20,
    "strokeWidth": 1.6,
    "gap": 16,
    "duration": 180,
    "amplitude": 4,
    "accent": "#b93240",
    "hitTarget": 44
  },
  "iconMotion": "cartoon",
  "motionTokens": {"duration": 560, "intensity": 1, "stagger": 60}
}
```

- Files/text are limited to 65,536 bytes (64 KB); the saved preset collection has the same total serialized UTF-8 size limit
- Only schema version `1` is accepted; there is no migration from unknown versions
- `presentation` accepts only `"labelled"` or `"icon-only"`. Legacy schema-v1 JSON and saved presets may omit this field only; import normalizes it to `"labelled"`. New exports always include it
- Every other required property must be present. Unknown properties, duplicate actions, unsupported enum values (including an invalid explicit `presentation`), sparse/augmented arrays, and non-plain data objects are rejected
- Labels require both `en` and `ja`, each 1–80 JavaScript string units, nonblank and without U+0000–U+001F or U+007F control characters. Name lengths use the same string-length convention
- Visual bounds: icon size 16–28 px, stroke 1–3 CSS px, gap 4–28 px, button duration 0–400 ms, amplitude 0–8%, hit target 44–64 px; accent must be `#` plus six hex digits
- Glyph bounds: duration 0–1600 ms, intensity 0–2, stagger 0–160 ms. Treatment accepts `none`, `pulse`, `spring`, `trace`, `gesture`, or `cartoon`
- Imported numbers must be finite and in range. Unlike the library’s tolerant runtime normalizers, imports reject bad values rather than clamp them; the missing legacy `presentation` field is the only defaulting exception
- Validation reads plain data properties, does not execute imported getters or `toJSON`, and returns a fresh configuration. Imported strings remain text

Import is transactional: the entire file must pass before anything applies. A later configuration change invalidates an older in-progress file read, so a slow import cannot replace newer edits. A file error does not reset the current configuration.

JSON はプリセット一覧ではなく、ひとつの設定です。最大65,536バイト、スキーマ1のみ対応し、項目の存在と型・範囲を検証します。`presentation` は `"labelled"` または `"icon-only"` だけを受け付けます。旧 JSON と保存済みプリセットでこの項目がない場合だけ `"labelled"` に補完し、新しい書き出しには必ず含めます。それ以外の欠落、不明な項目、重複した操作、不正なラベル・数値・明示された表示値は拒否します。全体の検証に成功した場合だけ適用し、読み込み途中に新しい設定を選んだ場合は古い読み込みを破棄します。

## 3. Complete React export / React の書き出し

**Copy React** and **Download TSX** produce the same complete `SocialActions.tsx` module. Install the private package tarball in a React + TypeScript application, keep its explicit stylesheet import, and mount the default `SocialActions` component.

The generated module includes:

- `studioConfig` with the context, variant, presentation, ordered actions, both label languages, and all visual/motion tokens; each generated action uses that presentation
- The currently selected locale, package imports, controlled toggle state, local activity/status text, and working local composers for Comment, Quote, and Send
- A sharing menu with arrow/Home/End/Escape handling, focus restoration, a local-share option, and current-page-link clipboard copy with a selectable-link fallback
- An optional `onCommand` callback, plus exported `StudioCommand` and `SocialActionsProps` types, as an application integration point

The context determines the generated heading and `data-context`; the editorial fixture artwork/content, Studio panels, timeline, and async comparison are not exported. Temporary selections, drafts, request outcomes, lens overlays, and the manual reduced-motion preview switch are not included. The generated component still respects the device’s OS reduced-motion preference. `onCommand` is a synchronous notification callback, not an implemented server adapter or persistence layer. Any real side effects, async/error policy, permissions, and service integration belong to the consuming application.

Configuration labels are emitted as escaped JSON string literals, not executable expressions. If clipboard access is missing or rejected, the Studio reveals and selects the source for manual copying. If initiating a download throws, it reveals selectable TSX or JSON. These fallbacks do not prove that a browser completed a download.

コピーと TSX ダウンロードは同じ完全なモジュールを生成します。表示方法を含む設定と両言語ラベルを保持し、現在の言語と選んだ表示方法で各操作を描画します。トグル、コメント・引用・送信のローカル入力、共有メニュー、状態表示、任意の同期 `onCommand` 通知を含みます。場面の見出しと属性は引き継ぎますが、サンプルの本文・装飾や Studio 画面全体は含みません。実際の通信・保存・非同期方針は利用側で実装します。コピー失敗時はコードを選択できる形で表示します。

## 4. Motion timeline / 動きの時間軸

Choose any currently selected icon and five treatments, or `none`. The icon choices follow the picker’s order and configured labels. If the inspected icon is removed, inspection moves to the first remaining action and releases the previous playback controller. Reordering alone keeps the inspected action selected. The timeline shares glyph plans, target resolution, timing, and the Comment/Repost morph renderer with activation playback. It does not approximate the motion with a separate CSS animation.

- Seek with the range input, its keyboard controls, or a phase marker; seeking pauses playback
- Play at 0.25×, 0.5×, or 1×; step backward/forward by `1000 / 60` ms of timeline time, not the display’s measured frame rate
- Cartoon Comment marks small circle (0%), formed/peak (75%), landing (87%), rebound (93%), and rest (100%). Other combinations show start, time midpoint, and complete, rather than inventing named semantic phases
- Total time includes resolved part delays/stagger, so it may exceed the selected glyph duration. Cartoon Comment/Repost use their single morph duration
- Pause retains the sampled shape; Reset restores canonical geometry. Natural completion also restores canonical geometry
- Manual or OS reduced motion leaves the canonical icon visible and disables motion inspection. Unsupported animation capability and zero-duration plans also remain static

The public `createGlyphTimeline` controller must exclusively own a standalone `ActionIcon` SVG. Never use it on an active `ActionButton` SVG or with another animation controller. Destroy it on unmount or before replacing it. See [API](API.md#standalone-glyph-timeline--単独アイコンの時間軸).

選択中のアイコン × 5表現を実際の再生処理と同じ計画・描画で観察します。選択肢はピッカーの順序と設定ラベルに従います。観察中の操作を外すと先頭の操作へ移り、以前の再生処理を破棄します。並べ替えだけでは観察中の操作を変えません。コマ送りは時間軸上の約16.7 msで、端末の実フレームを測定したものではありません。合計時間にはパーツの遅延を含みます。コメントの段階名以外は開始・時間の中間・完了を表示します。単独 SVG の専有と破棄が必要で、ボタンの再生と競合させないでください。

## 5. Async state and design lens / 非同期状態とデザインレンズ

**Async comparison** has independent Like and Save (`bookmark`) transactions in each of two policies. These fixed teaching examples remain available regardless of the picker selection, while sharing appearance and motion settings. Optimistic display uses the pending intent immediately; after-success display keeps the last confirmed value until success. Both display the confirmed value separately. Latency is 0, 700, or 1800 ms and is captured when a request starts.

Each action supports **Fail next request**, **Retry**, and **Cancel**. A failure/cancellation preserves the last confirmed value, including an already-on value; retry repeats the failed target. Each action ignores duplicate activation while pending, without blocking the other action. Cancellation invalidates late results even if an adapter ignores its AbortSignal. Locale and appearance changes do not restart pending transactions. These are local simulations; cancelling a real UI request would not undo a remote mutation.

**Design lens** compares the current selected actions, order, and labels with one altered token: gap, icon size, or stroke width. The adjusted value remains different from the baseline; all other configuration values match. Each specimen owns independent local interaction state, so reset or match those states when making a visual comparison.

Hit-area outlines show rendered button bounds, while the numeric minimum is the configured hit-target token. Visible labels and counts can make labelled buttons wider; icon-only presentation retains the same configured minimum hit target. Crosshairs mark the square icon box’s geometric center, not an optical center. Spacing overlays measure horizontal gaps between adjacent buttons on the same row; they do not measure every vertical/wrapped gap. Measurements refresh after layout, resize, and font readiness.

Use the lens to test a claim: more space may separate choices but increase wrapping; a larger icon may be more noticeable but compete with its label; a heavier stroke may improve prominence but crowd detail. Keep the context and task in view. Overlays are neither a visual-quality score nor an accessibility audit.

非同期比較では、各方式の「いいね」「保存」を独立して処理します。楽観的更新は未確定の意図をすぐ表示し、成功後の更新は確定値を保ちます。失敗・中止では直前の確定値に戻り、再試行は失敗した変更先を再要求します。連打と古い結果を防ぎますが、実サーバーの変更を取り消す機能ではありません。

レンズでは余白・大きさ・線幅の1変数だけを変えます。操作状態は左右で独立するため、比較時は状態もそろえてください。枠は実際のボタン寸法、十字はアイコン枠の幾何学的中心、余白は同じ行の隣接ボタン間です。視覚的な重心や全方向の間隔を自動測定するものではありません。印象は文脈の中で検証する仮説として扱います。

## Verification / 検証

From a clean checkout with a supported Node.js release:

```sh
npm ci
npm run check
npm test
npm run build
npm run verify:consumer
npm run verify:generated
```

`verify:consumer` installs the archive in a fresh external consumer. `verify:generated` compiles 12 generated TSX examples against that archive with strict NodeNext types and existing dependencies: EN/JA versions of default labelled, icon-only full-catalog, full-catalog/custom-token, single-action/escaped-label, maximum-length-label, and custom-ordered-subset cases. The custom subset is Reaction, Bookmark, Repost, Comment, Share with custom EN/JA labels. It also bundles an isolated, real React consumer using the archive stylesheet in `qa/generated`, outside the deployed build. The default fixture retains the maximum-length Like label; `?presentation=icon-only&locale=en|ja` selects the full-catalog icon-only fixture, and `?set=custom&locale=en|ja` selects the labelled custom subset (taking precedence over `presentation`). The browser suite mounts that fixture for runtime checks. After committing, run `npm run verify:archive` to test committed files, and `npm run test:e2e` with the Playwright browser dependencies installed. Review `.github/workflows/quality.yml` for the CI sequence.

For browser review, exercise both languages, both presentations, and narrow/wide layouts; picker inclusion/removal, one-action/12-action limits, keyboard ordering/focus, and custom label/order propagation across shared surfaces; labelled/icon-only switching; stable accessible names, native title hints, hidden-count descriptions, and minimum hit targets; legacy schema-v1 imports without `presentation`, rejection of invalid presentation values, and selected-subset preset/JSON/TSX round trips; keyboard menus/dialogs and removal while a popup or request is active; storage denial/corruption; invalid, oversized, and racing imports; clipboard rejection; timeline selected choices, removal fallback, replay/seek/reset/unmount and OS/manual reduction; independent async reversal/failure/retry/cancel; and lens wrapping with long labels. Check that the independent Like/Save examples and full 12-action catalog remain available when the picker changes. Inspect real SVG geometry over time for all 12 × five treatments, including the accepted 0.3.8 Comment/Repost behavior. Keep code-generation type checks separate from runtime, accessibility, and visual QA.

These instructions describe the verification workflow, not a claim that new browser checks have passed. Historical results remain in [QA](https://github.com/domizo/social-interaction-lab/blob/main/docs/QA.md); record fresh evidence there only when executed. Private source/demo and `UNLICENSED` distribution remain unchanged.

生成 TSX の型検査は両言語の6設定、計12件です。任意の順序とラベルを持つ部分集合は `?set=custom&locale=en|ja` で実行用 fixture を選べます。これはラベル付き表示で、指定した `presentation` より優先します。生成コードの型検査と、実ブラウザーでの操作・動き・アクセシビリティ確認は別です。両言語・両表示方法・画面幅・選択数の上下限・キーボードでの並べ替えとフォーカス・共有画面への選択／順序／ラベルの反映・固定のアクセシブル名と件数の説明・旧 JSON の互換性と保存／書き出しの往復・中断や失敗・動き抑制を検証し、実行した範囲だけを QA に記録してください。このガイドは新しいブラウザー検証の成功を宣言するものではありません。private・UNLICENSED の配布方針は変更しません。
