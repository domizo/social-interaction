# Accessibility / アクセシビリティ

- Native buttons support Enter and Space; button type defaults to button to avoid accidental form submission
- Like, Bookmark, Note, Star, and Bell use a stable name plus controlled aria-pressed; the other seven actions are commands without pressed state
- Note uses “Keep note” / “メモを保存” in the playground; selection does not rename it or imply a text editor
- Comment/Quote announce a dialog and Share a menu; integrations must provide the promised popups. Catalog previews remain separate from the live composer/menu examples
- ActionBar is a labelled group with normal Tab order, not a toolbar requiring arrow navigation
- Visible icon size is separate from the 44px minimum button hit target; cartoon overshoot and outlines never resize the button
- SVG icons and their decorative effect groups are hidden from assistive technology and are not focusable; effects carry no independent meaning
- Focus uses a 2px blue ring with 3px separation. The simulated focus specimen is explicitly separate from real keyboard focus
- Pending buttons remain focusable and suppress activation; text feedback has role=status
- Share supports ArrowUp/Down, Home/End, Escape, Tab/Shift+Tab; Escape returns focus to the opener
- Native dialog supplies modal focus containment with explicit first/last Tab wrapping; close/save calls close before restoring trigger focus
- Cancellation aborts requests and invalidates stale results. Text remains after an error for retry
- Local toggle values and composer text are retained across step changes in mounted session state; reload clears them, while validated configuration, locale, and appearance-isolation choices can be restored from the separate session draft
- OS reduced-motion preference and the standalone reducedMotion prop cancel main and decorative SVG animations and suppress CSS transforms. Pending keeps static dots and accessible status; selected state remains visible without motion
- Pending glyphs repeat more slowly; cartoon secondary bursts are suppressed while pending. Activation or replay is feedback, not a success announcement
- Replay, stop, settings changes, leaving a panel, cancellation, and unmount must leave no stale decorative outline or burst
- Edited accent colors are experimental; a specimen-surface contrast warning is not a complete accessibility audit

いいね・ブックマーク・付箋・スター・ベルは名前を固定したトグルで、残り7操作はコマンドです。装飾 SVG は読み上げやフォーカスの対象にせず、処理中は追加バーストを抑えます。動きを抑える設定では装飾も止め、静止した状態表示を残します。キーボード、名前、状態、フォーカス、中止と再試行に対応します。ただし実際の支援技術での確認、利用先の背景色・表示密度・言語による検証は別途必要です。アクセシビリティ完全準拠を主張するものではありません。

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

## Manual review / 手動確認

Start with the workflow tabs and Guide. Check manual arrow/Home/End focus movement, Enter/Space activation, selected-tab/panel relationships, Next/Back heading focus, direct and legacy links, and browser history. Ensure inactive panels cannot be reached by Tab, screen-reader navigation, or modal focus restoration. Start motion or a request, open a menu/composer, and begin an import before leaving its panel; confirm cancellation/closure and that retained toggles/drafts return without a late result applying. Reload with a valid session draft and confirm the same effective tokens with isolation enabled; also check legacy drafts without comparison choices. Then test invalid/blocked session storage and the visible recovery notice.

Tab through all 12 catalog actions and the real actions; Enter/Space activates once. Check all five toggles for stable labels and accurate pressed states, and verify commands never announce pressed state. Open and close both composers; test Escape and pending cancellation. Navigate Share using the keyboard and verify return focus. Test 320–390px widths and 200% zoom. Replay cartoon motion, interrupt it, switch treatments, and enable OS or manual reduced motion while it is running; check for lingering effects and unchanged target bounds. Pending should keep its static cues without secondary celebration bursts. Test NVDA/VoiceOver and your supported browsers. Inspect count announcements if counts matter in your integration; the stable button label intentionally excludes changing counts.

DOM unit tests cannot prove native dialog inertness, browser layout, zoom, or assistive-technology behavior.
