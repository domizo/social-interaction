# Interaction Studio / インタラクション Studio

**Social Interaction 0.6.2** is the renamed project. The five-step workflow introduced in **0.6.0** helps you choose an icon set: drag to order it, tune appearance in one place, assign a global motion with individual exceptions, try the result in context, and export the same configuration. **Guide** keeps exploratory comparisons separate from those working choices.

**Social Interaction 0.6.2** ではプロジェクト名を変更しました。0.6.0 で導入したワークフローでは、アイコンをドラッグで並べ、見た目を1か所で調整し、全体と個別の動きを選び、使用画面で試して同じ設定を書き出せます。比較のための実験は「ガイド」に分け、作業中の設定を意図せず変えないようにします。

The four variants, 1–12-action selection, labelled/icon-only component API, and schema version 1 remain. Optional `motionOverrides` adds per-action assignments to schema-v1 input; omitted legacy values normalize to an empty map. All 60 action/treatment geometry and timing plans are unchanged, including the accepted 0.3.8 Cartoon Comment/Repost behavior. Examples remain local simulations, with no social-network posting or AI backend.

4スタイル、1〜12操作、表示方法の API、スキーマ番号1を維持し、入力では省略可能な `motionOverrides` を追加します。旧設定で省略した場合は空のマップへ補完します。コメント・リポストを含む全60組の形状と時間配分は変更しません。SNS への投稿や AI バックエンドはありません。

## Start locally / ローカルで試す

Requires Git, Node.js 22.12+ in the 22.x line, 24.x, or 26.x, and npm. Clone the repository and start the development server:

Git、Node.js 22.12 以上の 22 系・24 系・26 系のいずれか、npm を用意し、リポジトリを取得して開発サーバーを起動します。

```sh
git clone https://github.com/domizo/social-interaction.git
cd social-interaction
npm ci
npm run dev
```

Open the local URL printed by Vite. No account or API key is required. To build the playground, library, and installable archive, then preview the production build locally:

Vite が表示するローカル URL を開いてください。アカウントや API キーは不要です。サイト・ライブラリ・インストール用アーカイブをビルドし、本番用サイトをローカルで確認するには、次を順に実行します。

```sh
npm run build
npm run preview
```

The outputs are `dist/`, `package/`, and `public/downloads/`. Open the local URL printed by the preview server after the build succeeds.

生成先は `dist/`・`package/`・`public/downloads/` です。ビルド成功後、プレビューサーバーが表示するローカル URL を開いてください。

## Five-step workflow

1. **Choose icons / アイコンを選ぶ** (`#choose`): select 1–12 actions and arrange them in your order
2. **Appearance / 見た目** (`#appearance`): choose a visual style and tune every appearance setting in one place; optionally isolate one variable
3. **Motion / 動き** (`#animation`): set global and per-icon treatments, tune shared glyph tokens, and inspect an assigned motion
4. **In context / 使用画面** (`#preview`): try the shared configuration in a feed, article footer, or fixed chat sample
5. **Export / エクスポート** (`#export`): edit/apply EN/JA labels, save/load named presets, import/export JSON, generate React TSX, and download the package archive

Use a tab directly, or use **Next / Back** to move through the suggested order. No step is locked, and there is no completion requirement. Presentation, reduced-motion preview, and hit-target display live in **Appearance → Tune the details** and apply across the workspaces. **Guide** (`#guide`) opens the explanation area; `#guide/motion`, `#guide/catalog`, `#guide/async`, `#guide/design`, and `#guide/states` open its reference panels.

タブを直接選ぶか、「次へ／戻る」で順に進めます。完了しないと開けないタブはありません。表示方法・動き抑制・操作領域表示の設定は「見た目」にまとめ、各画面へ反映します。「ガイド」には説明と、動きの比較・カタログ・非同期・デザイン・状態の参照パネルがあります。

### Navigation and retained state / 移動と状態の保持

- The workflow and Guide tablists use manual activation: Left/Right and Home/End move focus; Enter/Space activates the focused tab. Clicking a tab activates it immediately
- Only the active panel is displayed. Retained inactive panels are `hidden` and `inert`, so their controls are absent from keyboard navigation and the accessibility tree
- **Next / Back** focuses the destination heading and returns to the top of that workspace. Browser Back/Forward reconciles the active panel with the URL
- Shared configuration survives tab changes, browser history navigation, and locale changes. Local toggle values, composer drafts, and unapplied label drafts remain in their mounted panels when you leave and return
- Leaving a panel stops its timeline/glyph motion, cancels its pending local requests, invalidates unfinished imports, and closes menus/dialogs. Closing a popup during navigation must not return focus to a hidden opener. Cancellation does not discard the retained draft or confirmed toggle value
- Local interaction state starts fresh on reload; the validated working configuration, locale, and appearance-isolation choices are restored from the session draft

タブ列では左右矢印・Home・End でフォーカスを移し、Enter・Space で開きます。クリックでも自由に移動できます。表示していないパネルは保持しつつ `hidden` と `inert` にし、キーボードや読み上げの対象から外します。「次へ／戻る」は移動先の見出しにフォーカスを置きます。移動時は動き・処理中の操作・未完了の読み込みを止め、メニューやダイアログを閉じますが、入力中の下書きと確定済みのトグル状態は保持します。再読み込み後は検証済みの設定・言語・見た目の単変数比較の選択を復元し、その場の操作状態はリセットします。

### Working draft and saved presets / 作業中の設定とプリセット

The rename deliberately keeps the legacy keys `social-interaction-lab:working-draft:v1` and `social-interaction-lab:studio-presets:v1` to preserve saved data on the same browser origin. The keys are compatibility identifiers, not the current project name. Changing the origin or port uses different browser storage; export/import configuration JSON to carry a setup across origins.

名称変更後も、保存済みデータを引き継ぐため、旧キー `social-interaction-lab:working-draft:v1` と `social-interaction-lab:studio-presets:v1` を意図的に維持します。現在のプロジェクト名ではなく、互換性のための識別子です。オリジンやポートが変わると保存領域も別になるため、設定 JSON の書き出し・読み込みで持ち運んでください。

The session working draft is stored separately under `social-interaction-lab:working-draft:v1` in this origin's **sessionStorage**. New drafts use `{schemaVersion: 1, config, locale, comparison: {isolate, variable}}`. The complete configuration is checked with the same strict validator as JSON import; locale and comparison choices are also validated before restoration. `comparison.isolate` is a boolean, and `comparison.variable` is an editable token (`iconSize`, `strokeWidth`, `gap`, `duration`, `amplitude`, or `accent`). Legacy three-field drafts may omit `comparison`, which defaults to `{isolate: false, variable: "gap"}`. Configuration, locale, and the chosen isolation mode/variable return on a same-tab reload, preserving the effective token values used in previews and export. The schema version remains 1; normalized configurations and new named-preset exports also carry `motionOverrides`. This is browser-session storage, not account storage or cross-device sync.

Invalid or unavailable session storage falls back to defaults with a visible notice. The app does not automatically overwrite an unreadable/invalid session draft on startup; a subsequent user edit can establish a new draft. If session storage remains unavailable, the current in-memory configuration still works, but reload restoration is not guaranteed. Export JSON for a portable copy. Named presets use separate localStorage and explicit save/load controls, described under Export below.

セッション用設定は同じオリジンの sessionStorage に、設定・言語・単変数比較のオン／オフと対象項目をまとめて保存します。設定は JSON 読み込みと同じ厳密な検証を通し、言語と比較の選択も検証してから復元します。旧形式で比較の項目がない場合は、オフ・間隔（gap）を使います。再読み込み後もプレビューと書き出しに使う有効なトークン値を維持します。スキーマ番号は1を維持し、正規化した設定と新しいプリセットの書き出しには `motionOverrides` も含めます。不正なデータや保存領域の利用不可では初期値に戻し、画面に通知します。起動だけでは不正・読み込み不可のデータを上書きせず、その後の利用者の編集で新しい設定を保存できます。保存領域を使えない間も画面内の調整はできますが、再読み込み後の復元は保証しません。名前付きプリセットは別の localStorage に、明示的な操作で保存します。

### Direct and legacy routes / 直接リンクと旧リンク

Append these fragments to the local or deployed app URL, not to a documentation-file URL. Old bookmarks select the corresponding workspace rather than scrolling through a hidden long page.

| Legacy fragment | Current destination |
| --- | --- |
| `#studio` | `#choose` |
| `#compare` | `#appearance` |
| `#motion`, `#timeline` | `#animation` |
| `#studio-config` | `#export` |
| `#icon-catalog` | `#guide/catalog` |
| `#async-comparison` | `#guide/async` |
| `#design-lens` | `#guide/design` |
| `#states` | `#guide/states` |
| `#documentation` | `#guide` |

これらのフラグメントは、ドキュメントではなくアプリの URL の末尾に付けます。旧リンクでも対応する画面を開きます。

## 1. Choose icons / アイコンを選ぶ

Select 1–12 unique actions in the **Choose icons** tab. The default remains Like, Comment, Share, Quote. Newly selected actions are appended with their catalog labels. **Preview order** provides a drag handle for each selected action. Drag a handle with a pointer or touch, then release to commit the order; the preview is not saved until dropped. Dragging from a handle can scroll at the viewport edge, while touch gestures outside the handle retain normal page scrolling.

Keyboard users focus the same handle, press Space/Enter to pick up, use arrows to move or Home/End to reach an end, and press Space/Enter again to drop. Escape cancels without changing the committed order. Pickup, position, drop, and cancellation are announced; focus stays with the moved control. **Reorder without dragging**, collapsed initially, reveals the existing **Earlier / Later** buttons. The last selected action cannot be removed.

An interrupted reorder is discarded: Tab or focus departure from a keyboard pickup, window blur, page hiding, pointer cancellation/lost capture, navigation, locale changes, or a new configuration cannot commit an old preview. Removing and re-adding an action preserves its motion override; it returns with catalog labels at the end of the order.

To customize names, open **Export → Actions & labels** and edit the selected actions’ EN/JA names, then choose **Apply labels** before saving or exporting. Unapplied edits are retained for unchanged selected actions when the picker adds, removes, or reorders actions, but are not yet part of the saved/exported configuration. Loading a preset or importing JSON replaces the label drafts with that configuration’s labels. Presets, JSON, and generated TSX preserve the exact selected array order; they do not sort it into catalog order.

The timeline offers only selected actions, in that order and with the configured labels. **Async comparison** deliberately keeps its independent Like/Save examples, and the **12-action catalog** remains a full reference catalog. The picker does not filter either of those sections.

「試すアイコンを選ぶ」で1〜12個を選びます。初期値は「いいね・コメント・共有・引用」です。追加した操作は標準ラベルで末尾に入ります。「表示する順番」のハンドルをマウスやタッチでドラッグし、離して確定します。確定前のプレビューは保存しません。ハンドルを画面端へ動かすとスクロールでき、ハンドル外では通常のスクロールを維持します。

キーボードではハンドルにフォーカスし、Space／Enter で選択、矢印で移動、Home／End で先頭／末尾、Space／Enter で確定、Escape でキャンセルします。位置と確定・中止を通知し、フォーカスを維持します。初期状態で閉じた「ドラッグせずに並べ替える」を開けば「前へ／後ろへ」も使えます。最後の1個は外せません。Tab やフォーカスの移動、画面非表示、ウィンドウのフォーカス喪失、ポインター中断、タブ移動、言語・設定変更では未確定の並べ替えを破棄します。操作を外して再追加すると標準ラベルで末尾へ戻りますが、動きの個別指定は保持します。

「エクスポート → 操作とラベル」で両言語の名前を編集し、「ラベルを適用」で確定してから保存・書き出ししてください。追加・削除・並べ替えの際、引き続き選択されていて確定ラベルが変わらない操作の編集中の名前は保持しますが、自動適用はしません。プリセットや JSON の読み込みでは読み込んだラベルに置き換えます。プリセット・JSON・生成 TSX は選択した配列順をそのまま保持します。時間軸も選択中の操作・順序・ラベルを使います。独立した非同期の「いいね／保存」比較と、全12操作の参照カタログは選択で絞り込みません。

## 2. Appearance / 見た目

**Tune the details** is the single owner of the visual style (`minimal`, `soft`, `solid`, `spring`), labelled/icon-only presentation, icon size, stroke width, spacing, accent, minimum hit target, reduced-motion preview, and hit-target display. The workspace shows **Your selected style** instead of four simultaneous style panels. Change the style selector to compare alternatives with the same selected actions, order, and applied labels. Icon size and non-scaling stroke are independent from the minimum hit target; long labels/counts can make a button wider.

**Surface hover & press feedback** contains **Surface feedback duration** (`tokens.duration`, 0–400 ms) and **Press depth** (`tokens.amplitude`, 0–8%). These affect the button surface. Glyph treatment, duration, intensity, and stagger belong to **Motion**. Reducing preview motion suppresses both surface transforms and glyph animation; OS reduction always wins.

The optional one-variable comparison shows baseline and adjusted tokens for the chosen style. Its effective tokens are shared with previews and export; applying a Studio configuration exits that isolation mode. **Reset tokens** restores visual token defaults. The separate **Guide → Design lens** has a local comparison value and cannot overwrite shared settings. Descriptions remain hypotheses to test in context, not visual-quality or accessibility scores.

「見た目の設定を、ひとつの場所で。」に、4つのスタイル、ラベル付き／アイコンのみ、大きさ、線幅、間隔、色、最小操作領域、動き抑制、操作領域表示を集約します。4スタイルを同時に並べず、選択中のスタイルを表示し、セレクターで切り替えて比較します。アイコンの大きさと線幅は最小操作領域とは独立し、長いラベルや件数でボタンの幅が広がることがあります。

「表面のホバー・押下の反応」の「表面の反応時間」は `tokens.duration`（0〜400 ms）、「押し込みの深さ」は `tokens.amplitude`（0〜8%）です。アイコン自体の動きとは別で、そちらは「動き」で調整します。動き抑制は表面の変形とアイコンに作用し、OS の設定を常に優先します。任意の単変数比較で有効なトークン値はプレビューと書き出しに反映し、設定の読み込みで比較モードを解除します。「ガイド → デザインの見方」の比較値は共有設定を変更しません。

## 3. Motion / 動き

Choose **Global motion** from `pulse`, `spring`, `trace`, `gesture`, `cartoon`, or `none` (Still). Each selected icon has an **Inherit global** option, an explicit treatment override, and **Reset to global**. Inherit/reset deletes its override entry; explicit `none` is a real override and stays still when the global changes. Only inheriting icons follow a global-treatment change. Glyph duration, intensity, and part stagger remain shared across icons, within the library’s existing bounds.

Each row previews its resolved assignment and uses the chosen visual style, tokens, labels, order, and presentation. Activate an icon or use **Play all**; **Stop motion** stops these previews without changing assignments. The same resolution applies to live actions, contexts, the independent Like/Save async examples, the timeline, and generated React. Removed icons keep their saved overrides for re-addition. The five-treatment comparison matrix lives in **Guide → Motion reference**, with the full catalog in **Guide → Icon catalog**; their exploratory controls do not write shared settings.

「全体のモーション」を選び、必要な操作だけ個別に指定します。「全体に合わせる」「全体へ戻す」は個別指定を削除し、明示的な `none`（静止）は全体を変えても維持します。時間・強さ・パーツの時間差は全体で共有します。各行は割り当て済みの動きを表示し、押すか「すべて再生」で試せます。「動きを止める」はプレビューを止め、割り当ては変更しません。実操作・各場面・独立した非同期のいいね／保存・時間軸・生成 React でも同じ規則を使います。一度外した操作の個別指定も保持します。5表現の比較と全カタログはガイドで試し、そこで共有設定を書き換えることはありません。

### Timeline / 時間軸

Choose any currently selected icon. **Assigned motion** is a read-only display of its resolved global/override treatment, not another assignment control. Edit assignments in the Motion settings above. Icon choices follow the picker’s order and configured labels. If the inspected icon is removed, inspection moves to the first remaining action and releases the previous playback controller. Reordering alone keeps the inspected action selected. The timeline shares glyph plans, target resolution, timing, and the Comment/Repost morph renderer with activation playback. It does not approximate the motion with a separate CSS animation.

- Seek with the range input, its keyboard controls, or a phase marker; seeking pauses playback
- Play at 0.25×, 0.5×, or 1×; step backward/forward by `1000 / 60` ms of timeline time, not the display’s measured frame rate
- Cartoon Comment marks small circle (0%), formed/peak (75%), landing (87%), rebound (93%), and rest (100%). Other combinations show start, time midpoint, and complete, rather than inventing named semantic phases
- Total time includes resolved part delays/stagger, so it may exceed the selected glyph duration. Cartoon Comment/Repost use their single morph duration
- Pause retains the sampled shape; Reset restores canonical geometry. Natural completion also restores canonical geometry
- Manual or OS reduced motion leaves the canonical icon visible and disables motion inspection. Unsupported animation capability and zero-duration plans also remain static

The public `createGlyphTimeline` controller must exclusively own a standalone `ActionIcon` SVG. Never use it on an active `ActionButton` SVG or with another animation controller. Destroy it on unmount or before replacing it. See [API](API.md#standalone-glyph-timeline--単独アイコンの時間軸).

選択中のアイコンに割り当てた動きを、実際の再生処理と同じ計画・描画で観察します。「適用中のモーション」は読み取り専用で、変更は上の設定で行います。選択肢はピッカーの順序と設定ラベルに従います。観察中の操作を外すと先頭の操作へ移り、以前の再生処理を破棄します。並べ替えだけでは観察中の操作を変えません。コマ送りは時間軸上の約16.7 msで、端末の実フレームを測定したものではありません。合計時間にはパーツの遅延を含みます。コメントの段階名以外は開始・時間の中間・完了を表示します。単独 SVG の専有と破棄が必要で、ボタンの再生と競合させないでください。

## 4. In context / 使用画面

Switch between **Social feed**, **Article footer**, and **AI chat**. These are fixed sample content, including the scripted chat response. They share one configuration: context, variant, presentation, action list/order, both label languages, visual tokens, global treatment, per-icon overrides, and motion tokens. Switching context does not replace the configuration with a separate set of defaults.

- Five toggle actions use local controlled state: Like, Bookmark, Note, Star, and Bell
- Comment and Quote open local draft dialogs; draft text stays in the mounted preview across step changes
- Share opens a keyboard-operated menu that shows an example link or prepares a local share
- Other commands produce local feedback; none posts to a social network, calls an AI model, or sends a message

Use **Appearance → Tune the details** for presentation, reduced-motion preview, hit-target display, and visual adjustments; use **Motion** for glyph assignments, then return to **In context**. The presentation control switches between labelled and icon-only buttons across all three contexts, both design-lens specimens, async comparisons, original comparisons, and applicable motion/state specimens. Icon-only hides visible labels and counts; the stable accessible name, native title hint, and accessible count description remain. Labels are still editable and exported. The standalone timeline icon and explanatory headings are not button labels. The Appearance and Motion controls each edit their own part of the same shared configuration. The appearance isolation mode uses its effective one-variable token set for Studio previews and exports; applying a Studio configuration exits that isolation mode. The design lens has a separate local comparison value and does not overwrite the shared configuration.

表示方法・動き抑制・操作領域表示と見た目は「見た目」、アイコンの割り当ては「動き」で調整します。3つの場面はすべて固定のサンプルです。操作・ラベル・表示方法・見た目・トークン・全体と個別の動きを共有し、場面を切り替えても別の初期値に置き換えません。コメントと引用の下書き、共有メニュー、ほかの操作もローカルです。従来の単変数モードでは有効なトークン値をプレビューと書き出しに使い、Studio 設定の適用でそのモードを解除します。デザインレンズ内の比較値は共有設定を変更しません。表示方法は3つの場面、レンズの両側、非同期比較、従来の比較、対応する動きと状態の見本に反映します。「アイコンのみ」は見えるラベルと件数を隠し、固定のアクセシブル名・標準の title ヒント・件数の説明を保ちます。ラベルの編集と書き出しは引き続き可能です。単独の時間軸アイコンや説明用の見出しはボタンのラベルではありません。

## 5. Export / エクスポート

Edit EN/JA names in **Actions & labels**, then choose **Apply labels** before saving or generating code. Unapplied label drafts remain local to this mounted panel.

「操作とラベル」で両言語の名前を編集し、「ラベルを適用」で共有設定へ反映してから保存・書き出ししてください。未適用の名前は、このパネル内の編集中の値として保持します。

### Named presets / 名前付きプリセット

A named preset saves a snapshot of the current configuration. Select it and choose **Load** to apply it. Presets are stored under `social-interaction-lab:studio-presets:v1` in this browser origin’s localStorage. Named presets are explicit snapshots, separate from the automatic session working draft. Slider edits do not overwrite a named preset, and reload does not select or load one automatically. Up to 20 names are allowed; trimmed names must be unique ignoring case, and each name must be 1–60 characters without control characters.

Storage reads/writes can fail, including unavailable storage or quota limits. The UI reports the problem and keeps the current working configuration usable. A failed save/delete does not update the in-memory preset list as though it succeeded. Invalid stored collections are left untouched; **Clear invalid saved data** explicitly removes that collection. **Retry browser storage** retries an unavailable read. Download a config JSON when you need a portable copy.

プリセットは同じブラウザー・同じオリジンの localStorage 内だけに保存します。自動で復元するセッション用設定とは別の、明示的な保存です。調整のたびにプリセットを上書きせず、適用するときは選んで読み込みます。クラウド同期はありません。最大20件、名前は前後の空白を除去し、英字の大小を区別せず重複を拒否します。保存失敗は報告し、不正な既存データは明示的な消去まで保護します。

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
  "motionOverrides": {"comment": "spring", "bookmark": "none"},
  "motionTokens": {"duration": 560, "intensity": 1, "stagger": 60}
}
```

- Files/text are limited to 65,536 bytes (64 KB); the saved preset collection has the same total serialized UTF-8 size limit
- Only schema version `1` is accepted; there is no migration from unknown versions
- `presentation` accepts only `"labelled"` or `"icon-only"`. Legacy schema-v1 JSON and saved presets may omit this field; import normalizes it to `"labelled"`. New exports always include it
- `motionOverrides` is optional only on input. Omission normalizes to `{}`; new exports include the map. It is a plain object whose own enumerable data keys must be existing `SocialAction` values and whose values must be `none`, `pulse`, `spring`, `trace`, `gesture`, or `cartoon`. Unknown/prototype-style keys, accessors, non-data properties, arrays, `null`, and invalid values are rejected. Known actions need not be currently selected: their overrides are preserved for re-addition. `inherit` is a UI choice, not a JSON value; inheritance is represented by an absent key
- Every other required property must be present. Unknown properties, duplicate actions, unsupported enum values (including an invalid explicit `presentation`), sparse/augmented arrays, and non-plain data objects are rejected
- Labels require both `en` and `ja`, each 1–80 JavaScript string units, nonblank and without U+0000–U+001F or U+007F control characters. Name lengths use the same string-length convention
- Visual bounds: icon size 16–28 px, stroke 1–3 CSS px, gap 4–28 px, button duration 0–400 ms, amplitude 0–8%, hit target 44–64 px; accent must be `#` plus six hex digits
- Glyph bounds: duration 0–1600 ms, intensity 0–2, stagger 0–160 ms. Treatment accepts `none`, `pulse`, `spring`, `trace`, `gesture`, or `cartoon`
- Imported numbers must be finite and in range. Unlike the library’s tolerant runtime normalizers, imports reject bad values rather than clamp them; only missing legacy `presentation` and `motionOverrides` fields receive compatibility defaults
- Validation reads plain data properties, does not execute imported getters or `toJSON`, and returns a fresh configuration. Imported strings remain text

Import is transactional: the entire file must pass before anything applies. A later configuration change or leaving the Export panel invalidates an older in-progress file read, so a slow import cannot replace newer edits or apply after navigation. A file error does not reset the current configuration.

JSON はプリセット一覧ではなく、ひとつの設定です。最大65,536バイト、スキーマ1のみ対応し、項目の存在と型・範囲を検証します。`presentation` は `"labelled"` または `"icon-only"` だけを受け付けます。旧 JSON と保存済みプリセットで省略した場合は `"labelled"` に補完します。`motionOverrides` も入力時のみ省略可能で、空のマップに補完します。新しい書き出しには両方を含めます。個別指定のキーは既存の操作名、値は対応する動きだけを許可し、未選択の操作の指定も保持します。継承はキーの欠落で表し、`inherit` という値は保存しません。未知のキー、特殊なプロパティ、配列、`null`、getter、不正な動きを拒否します。それ以外の必須項目の欠落、重複した操作、不正なラベル・数値・明示された表示値も拒否します。全体の検証に成功した場合だけ適用し、読み込み途中に新しい設定を選ぶか「エクスポート」タブを離れた場合は、古い読み込み結果を破棄します。

### Complete React module / React モジュール

**Copy React** and **Download TSX** produce the same complete `SocialActions.tsx` module. Download the actual `social-interaction-react-0.6.2.tgz` archive from **Export**, install it in a separate React + TypeScript application with `npm install ./social-interaction-react-0.6.2.tgz`, keep its explicit stylesheet import, and mount the default `SocialActions` component.

The package is distributed as an installable archive and is not published to the npm registry. Its ESM build expects React 18.2 or 19 as a peer dependency. See [License and distribution](#license-and-distribution--ライセンスと配布) for reuse terms.

Newly generated modules use `@social-interaction/react` and explicitly import `@social-interaction/react/styles.css`. Existing installations of older tarballs remain usable under `@social-interaction-lab/react`; previously generated snippets retain those old imports. To use an older snippet with the renamed 0.6.2 package, regenerate it or update both its package and stylesheet imports.

新しい生成コードは `@social-interaction/react` と `@social-interaction/react/styles.css` を読み込みます。旧 tarball のインストール済みパッケージは `@social-interaction-lab/react` として引き続き使え、以前の生成コードも旧 import を保持します。名称変更後の 0.6.2 パッケージで使う場合は、コードを再生成するか、パッケージと CSS の両方の import を更新してください。

The generated module includes:

- `studioConfig` with the context, variant, presentation, ordered actions, both label languages, all visual/motion tokens, the global motion, and `motionOverrides`; each action uses that presentation and resolves `motionOverrides[action] ?? iconMotion`
- The currently selected locale, package imports, controlled toggle state, local activity/status text, and working local composers for Comment, Quote, and Send
- A sharing menu with arrow/Home/End/Escape handling, focus restoration, a local-share option, and current-page-link clipboard copy with a selectable-link fallback
- An optional `onCommand` callback, plus exported `StudioCommand` and `SocialActionsProps` types, as an application integration point

The context determines the generated heading and `data-context`; the editorial fixture artwork/content, Studio panels, timeline, and async comparison are not exported. Temporary selections, drafts, request outcomes, lens overlays, and the manual reduced-motion preview switch are not included. The generated component still respects the device’s OS reduced-motion preference. `onCommand` is a synchronous notification callback, not an implemented server adapter or persistence layer. Any real side effects, async/error policy, permissions, and service integration belong to the consuming application.

Configuration labels are emitted as escaped JSON string literals, not executable expressions. If clipboard access is missing or rejected, the Studio reveals and selects the source for manual copying. If initiating a download throws, it reveals selectable TSX or JSON. These fallbacks do not prove that a browser completed a download.

コピーと TSX ダウンロードは同じ完全なモジュールを生成します。表示方法・全体と個別の動きを含む設定と両言語ラベルを保持し、現在の言語と選んだ表示方法で各操作を描画します。各操作の動きは `motionOverrides[action] ?? iconMotion` で決定します。トグル、コメント・引用・送信のローカル入力、共有メニュー、状態表示、任意の同期 `onCommand` 通知を含みます。場面の見出しと属性は引き継ぎますが、サンプルの本文・装飾や Studio 画面全体は含みません。実際の通信・保存・非同期方針は利用側で実装します。コピー失敗時はコードを選択できる形で表示します。

## Guide / ガイド

**Guide** is a separate reference area, not a required sixth step. Its explanation panel (`#guide`) introduces the interaction semantics and links to documentation. **Motion reference** (`#guide/motion`) compares the selected actions across five treatment rows. The full **Icon catalog** (`#guide/catalog`) previews all 12 existing actions regardless of your selection. Its default **Assigned motions** mode resolves the current global motion and each stored override, including actions outside the selected set. Choosing another catalog treatment or adjusting reference duration/intensity/stagger changes only that local experiment. Neither reference has write access to shared configuration, presets, or export assignments. Previews do not open composers or invoke services. **State reference** (`#guide/states`) shows visual state specimens for the chosen actions. An illustrated focus ring is not real keyboard focus, and selected state applies only to toggle actions.

「ガイド」は必須の6段階目ではなく、必要なときに開く参照エリアです。説明、選んだ操作を5表現で並べる「動きの比較」、全12操作のカタログ、状態見本、以下の非同期比較とデザインレンズをまとめます。カタログの初期値「設定したモーション」は全体と個別指定を反映し、未選択の操作も表示します。別の動きや時間・強さ・時間差を試す変更は各参照画面だけに作用し、共有設定・プリセット・書き出しを書き換えません。カタログは入力フォームや外部サービスを起動しません。状態の見本で描いたフォーカスは実際のキーボードフォーカスとは異なり、選択状態はトグル操作だけに使います。

### Async and design / 非同期とデザイン

Open **Async states / 非同期の状態** at `#guide/async` and **Design lens / デザインの見方** at `#guide/design`.

**Async comparison** has independent Like and Save (`bookmark`) transactions in each of two policies. These fixed teaching examples remain available regardless of the picker selection, while sharing appearance, motion tokens, and the resolved global/override treatment for each action. Optimistic display uses the pending intent immediately; after-success display keeps the last confirmed value until success. Both display the confirmed value separately. Latency is 0, 700, or 1800 ms and is captured when a request starts.

Each action supports **Fail next request**, **Retry**, and **Cancel**. A failure/cancellation preserves the last confirmed value, including an already-on value; retry repeats the failed target. Each action ignores duplicate activation while pending, without blocking the other action. Cancellation invalidates late results even if an adapter ignores its AbortSignal. Locale and appearance changes do not restart pending transactions. Leaving the Async panel cancels pending local transactions and prevents late results from changing its state; confirmed values remain available when you return in the same mounted session. These are local simulations; cancelling a real UI request would not undo a remote mutation.

**Design lens** compares the current selected actions, order, and labels with one altered token: gap, icon size, or stroke width. The adjusted value remains different from the baseline; all other configuration values match. Each specimen owns independent local interaction state, so reset or match those states when making a visual comparison.

Hit-area outlines show rendered button bounds, while the numeric minimum is the configured hit-target token. Visible labels and counts can make labelled buttons wider; icon-only presentation retains the same configured minimum hit target. Crosshairs mark the square icon box’s geometric center, not an optical center. Spacing overlays measure horizontal gaps between adjacent buttons on the same row; they do not measure every vertical/wrapped gap. Measurements refresh after layout, resize, and font readiness.

Use the lens to test a claim: more space may separate choices but increase wrapping; a larger icon may be more noticeable but compete with its label; a heavier stroke may improve prominence but crowd detail. Keep the context and task in view. Overlays are neither a visual-quality score nor an accessibility audit.

非同期比較では、各方式の「いいね」「保存」を独立して処理します。楽観的更新は未確定の意図をすぐ表示し、成功後の更新は確定値を保ちます。失敗・中止では直前の確定値に戻り、再試行は失敗した変更先を再要求します。連打と古い結果を防ぎますが、実サーバーの変更を取り消す機能ではありません。このパネルを離れると処理中の要求を中止し、戻ったときは直前の確定値を保持します。

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

`verify:consumer` installs the archive in a fresh external consumer. `verify:generated` compiles 20 generated TSX examples against that archive with strict NodeNext types and existing dependencies: EN/JA versions of default labelled, legacy fields omitted, mixed per-icon motions, inactive-action overrides, icon-only full-catalog, full-catalog/custom-token, maximum-length-label, single-action/escaped-label, hostile-label, and custom-ordered-subset configurations. It also checks that unsafe override maps are rejected without executing accessors or `toJSON`. The custom subset is Reaction, Bookmark, Repost, Comment, Share with custom EN/JA labels. It also bundles an isolated, real React consumer using the archive stylesheet in `qa/generated`, outside the deployed build. The default fixture retains the maximum-length Like label; `?presentation=icon-only&locale=en|ja` selects the full-catalog icon-only fixture, and `?set=custom&locale=en|ja` selects the labelled custom subset, and `?set=mixed&locale=en|ja` selects mixed overrides with an inheriting Reaction (both take precedence over `presentation`). The browser suite mounts that fixture for runtime checks. After committing, run `npm run verify:archive` to test committed files, and `npm run test:e2e` with the Playwright browser dependencies installed. Review `.github/workflows/quality.yml` for the CI sequence.

For browser review, exercise both languages, both presentations, and narrow/wide layouts; all five tabs and Guide panels, freely revisited steps, direct/legacy hashes, browser Back/Forward, manual keyboard tab activation, Next/Back heading focus, hidden/inert inactive panels, same-tab reload restoration of configuration, locale, and effective isolation-mode tokens, including legacy drafts without comparison choices, invalid/blocked session storage, retained local toggles and composer drafts on step changes, popup closure without hidden focus restoration, and cancellation of motion, requests, and imports when leaving a panel; picker inclusion/removal, one-action/12-action limits, pointer/touch handle ordering, keyboard pickup/arrows/Home/End/drop/Escape, interrupted-reorder rollback, the collapsed Earlier/Later fallback, focus/announcements, and custom label/order propagation across shared surfaces; labelled/icon-only switching; stable accessible names, native title hints, hidden-count descriptions, and minimum hit targets; legacy schema-v1 imports without `presentation` or `motionOverrides`, rejection of invalid values and unsafe override keys/properties, global inheritance and explicit `none`, per-icon reset and remove/re-add preservation, Guide experiment isolation and Assigned motions defaults, and preset/JSON/session/TSX assignment round trips; keyboard menus/dialogs and removal while a popup or request is active; storage denial/corruption; invalid, oversized, and racing imports; clipboard rejection; timeline selected choices, resolved-treatment readout, removal fallback, replay/seek/reset/unmount and OS/manual reduction; independent async reversal/failure/retry/cancel; and lens wrapping with long labels. Check that the independent Like/Save examples and full 12-action catalog remain available when the picker changes. Inspect real SVG geometry over time for all 12 × five treatments, including the accepted 0.3.8 Comment/Repost behavior. Keep code-generation type checks separate from runtime, accessibility, and visual QA.

These instructions describe the verification workflow, not a claim that new browser checks have passed. Historical results remain in [QA](https://github.com/domizo/social-interaction/blob/main/docs/QA.md); record fresh evidence there only when executed.

生成 TSX の型検査は両言語の10設定、計20件です。旧形式、混在する個別の動き、未選択操作の個別指定、攻撃的な文字列を含むラベルも扱い、不正なマップを拒否して getter や `toJSON` を実行しないことも確認します。任意の順序とラベルを持つ部分集合は `?set=custom&locale=en|ja`、個別指定と全体の動きを継承する Reaction の例は `?set=mixed&locale=en|ja` で選べます。どちらも指定した `presentation` より優先します。生成コードの型検査と、実ブラウザーでの操作・動き・アクセシビリティ確認は別です。両言語・両表示方法・画面幅・5つのタブとガイド・直接リンクと旧リンク・戻る／進む・キーボード操作・非表示パネルへのフォーカス防止・再読み込みでの設定復元・移動時の中止と下書き保持・選択数の上下限・ドラッグとキーボードの選択／移動／確定／中止・中断時の復元・折りたたんだ代替操作・フォーカスと通知・全体継承と個別指定・削除／再追加・ガイドの変更が共有設定に影響しないこと・共有画面への選択／順序／ラベルの反映・固定のアクセシブル名と件数の説明・旧 JSON の互換性と保存／書き出しの往復・中断や失敗・動き抑制を検証し、実行した範囲だけを QA に記録してください。このガイドは新しいブラウザー検証の成功を宣言するものではありません。

## License and distribution / ライセンスと配布

Project-authored code is available under the [MIT License](../LICENSE), including for modification, redistribution, and commercial use. Retain the copyright and license notice as required by that license. Third-party code and fonts retain their own licenses; see [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md) for the notices and license texts.

The package metadata keeps `private: true` to prevent accidental npm publishing. This publishing guard does not restrict MIT-licensed reuse or installation of the `.tgz` archive. The package is not published to the npm registry.

このプロジェクトが作成したコードは [MIT License](../LICENSE) で提供し、改変・再配布・商用利用が可能です。ライセンスに従って著作権表示とライセンス表示を保持してください。第三者のコードとフォントにはそれぞれのライセンスが適用されます。権利表示とライセンス全文は [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md) を参照してください。

`private: true` は、誤って npm に公開することを防ぐ設定です。MIT License に基づく再利用や `.tgz` アーカイブのインストールを制限するものではありません。パッケージは npm レジストリには公開していません。
