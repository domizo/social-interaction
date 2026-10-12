# Accessibility / アクセシビリティ

- Native buttons support Enter and Space; button type defaults to button to avoid accidental form submission
- Like, Bookmark, Note, Star, and Bell use a stable name plus controlled aria-pressed; the other seven actions are commands without pressed state
- Note uses “Keep note” / “メモを保存” in the playground; selection does not rename it or imply a text editor
- Comment/Quote announce a dialog and Share a menu; integrations must provide the promised popups. Catalog previews remain separate from the live composer/menu examples
- ActionBar is a labelled group with normal Tab order, not a toolbar requiring arrow navigation
- Visible icon size is separate from the 44px minimum button hit target; cartoon overshoot and outlines never resize the button
- SVG icons and their decorative effect groups are hidden from assistive technology and are not focusable; effects carry no independent meaning
- Focus uses a 2px blue ring with 3px separation. The simulated focus specimen is explicitly separate from real keyboard focus
- Pending buttons remain focusable, expose aria-busy and aria-disabled, and suppress activation; contextual text feedback has role=status
- Share supports ArrowUp/Down, Home/End, Escape, Tab/Shift+Tab; Escape returns focus to the opener
- Native dialog supplies modal focus containment with explicit first/last Tab wrapping; close/save calls close before restoring trigger focus
- Cancellation aborts requests and invalidates stale results. Text remains after an error for retry
- Local toggle values and composer text are retained across step changes in mounted session state; reload clears them, while validated configuration, locale, and appearance-isolation choices can be restored from the separate session draft
- OS reduced-motion preference and the standalone reducedMotion prop cancel main and decorative SVG animations and suppress CSS transforms. Pending keeps busy/disabled semantics, duplicate-activation guards, and contextual status; selected state remains visible without motion. No pending-dot span or pseudo-element is rendered
- Pending glyphs repeat more slowly; cartoon secondary bursts are suppressed while pending. Activation or replay is feedback, not a success announcement
- Replay, stop, settings changes, leaving a panel, cancellation, and unmount must leave no stale decorative outline or burst
- Edited accent colors are experimental; a specimen-surface contrast warning is not a complete accessibility audit

いいね・ブックマーク・付箋・スター・ベルは名前を固定したトグルで、残り7操作はコマンドです。装飾 SVG は読み上げやフォーカスの対象にせず、処理中は追加バーストを抑えます。動きを抑える設定では装飾も止め、`aria-busy`・`aria-disabled`・重複操作の防止・状況説明を維持します。独立した処理中の点の装飾はありません。キーボード、名前、状態、フォーカス、中止と再試行に対応します。ただし実際の支援技術での確認、利用先の背景色・表示密度・言語による検証は別途必要です。アクセシビリティ完全準拠を主張するものではありません。

## Step-tab navigation / ステップ式タブの操作

- The five workflow steps are freely revisitable. Guide is a separate reference area with its own panels; no completion gate blocks navigation
- Workflow and Guide tablists use manual activation. Left/Right and Home/End move focus among tabs; Enter/Space activates the focused tab. Clicking also activates a tab
- The selected tab identifies its associated panel. Only the active panel is displayed; retained inactive panels are `hidden` and `inert`, and must not expose controls in the keyboard order or accessibility tree
- Next/Back moves focus to the destination heading and scrolls to the top of that workspace. Direct routes, legacy fragments, and browser Back/Forward select the correct panel without leaving focus in a hidden panel
- Leaving a panel closes its menu/dialog, cancels pending local requests and unfinished imports, and stops its timeline and glyph motion. A closing popup must not restore focus to an opener in the now-hidden panel
- Configuration, locale, local toggles, and composer drafts are retained while navigating the mounted application. Pending work does not continue behind a hidden tab. Same-tab reload restores the validated working configuration, locale, and appearance-isolation choices when session storage is available
- Invalid or blocked session storage produces a visible notice and usable defaults. Named presets remain a separate explicit save/load flow
- The shared labelled/icon-only setting preserves required stable accessible names and count descriptions. Native title hints are browser-dependent and do not replace visible labels for unfamiliar icons or guarantee touch discovery

5つのタブとガイドは自由に行き来できます。タブ列では左右矢印・Home・End でフォーカスを動かし、Enter・Space で表示を切り替えます。非表示パネルは `hidden` と `inert` にし、読み上げや Tab 移動の対象から外します。「次へ／戻る」では移動先の見出しへフォーカスを置き、ブラウザーの戻る／進むでも URL と表示をそろえます。離れた画面のポップアップ・要求・動きを止め、隠れたボタンへフォーカスを戻しません。下書きとトグル状態はタブ移動で保持し、再読み込みではリセットします。検証済みの設定・言語・見た目の単変数比較の選択は、利用可能なセッション保存領域から復元します。

## Ordering and motion choices / 並べ替えと動きの選択

- Choose icons uses labelled drag-handle buttons with current-position descriptions; touch/pointer dragging begins only at a handle, leaving normal page scrolling available elsewhere
- On a focused handle, Space/Enter picks up; arrows move one position, Home/End reach the ends; Space/Enter drops and Escape cancels. Assistive-technology button activation also supports pickup/drop
- Position, pickup, drop, and cancellation use polite status announcements. The order is a temporary preview until drop; focus follows the same moved handle
- Keyboard Tab/focus departure, pointer cancellation/lost capture, window blur, document hiding, panel/locale changes, or incoming configuration discard an unfinished reorder. Do not move focus into an inactive panel during cleanup
- The initially collapsed Reorder without dragging section retains native Earlier/Later buttons, announced boundaries, and focus preservation. At least one selected icon must remain
- Appearance owns visual settings, presentation, reduced-motion preview, and hit-target display in one place. Surface hover/press settings are separate from glyph treatment and tokens
- Motion assigns global and per-icon treatments with native selects and a reset button. The timeline presents its resolved treatment as an output, rather than another editing control
- Guide motion-reference/catalog experiments do not change shared assignments. The catalog’s Assigned motions default reflects the working configuration

並べ替えハンドルは名前と現在位置を持つボタンです。Space／Enter で選択、矢印・Home・End で移動、Space／Enter で確定、Escape で中止し、位置と結果を通知します。確定前は保存せず、フォーカス移動・ポインター中断・画面非表示・言語や設定の変更でも中止します。非表示パネルへフォーカスを戻しません。ハンドル外は通常のスクロールを保ち、折りたたんだ「ドラッグせずに並べ替える」で「前へ／後ろへ」も使えます。見た目の設定は1か所、全体と個別の動きは「動き」、時間軸は適用結果の読み取り表示です。ガイドの参照実験は共有設定を書き換えません。

## Manual review / 手動確認

Start with the workflow tabs and Guide. Check manual arrow/Home/End focus movement, Enter/Space activation, selected-tab/panel relationships, Next/Back heading focus, direct and legacy links, and browser history. Ensure inactive panels cannot be reached by Tab, screen-reader navigation, or modal focus restoration. Start motion or a request, open a menu/composer, and begin an import before leaving its panel; confirm cancellation/closure and that retained toggles/drafts return without a late result applying. Reload with a valid session draft and confirm the same effective tokens with isolation enabled; also check legacy drafts without comparison choices. Then test invalid/blocked session storage and the visible recovery notice.

Exercise pointer/touch ordering and every keyboard pickup/move/drop/cancel path, including interrupted drags, viewport-edge scrolling, one/12-action limits, custom labels, focus retention, and announced positions. Open the fallback controls and check boundaries. Verify global inheritance, explicit Still, reset, remove/re-add preservation, a read-only resolved timeline treatment, and Guide isolation.

Tab through all 12 catalog actions and the real actions; Enter/Space activates once. Check all five toggles for stable labels and accurate pressed states, and verify commands never announce pressed state. Open and close both composers; test Escape and pending cancellation. Navigate Share using the keyboard and verify return focus. Test 320–390px widths and 200% zoom. Replay cartoon motion, interrupt it, switch treatments, and enable OS or manual reduced motion while it is running; check for lingering effects and unchanged target bounds. Pending should retain busy/disabled semantics, duplicate-activation guards, and contextual status with reduced motion, without secondary celebration bursts or extra pending-dot decoration. Test NVDA/VoiceOver and your supported browsers. Inspect count announcements if counts matter in your integration; the stable button label intentionally excludes changing counts.

DOM unit tests cannot prove native dialog inertness, browser layout, zoom, or assistive-technology behavior.
