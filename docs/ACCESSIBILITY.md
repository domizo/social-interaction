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
- Saved comment/quote text is retained in mounted session state and inspectable; reload clears it
- OS reduced-motion preference and the standalone reducedMotion prop cancel main and decorative SVG animations and suppress CSS transforms. Pending keeps static dots and accessible status; selected state remains visible without motion
- Pending glyphs repeat more slowly; cartoon secondary bursts are suppressed while pending. Activation or replay is feedback, not a success announcement
- Replay, stop, settings changes, cancellation, and unmount must leave no stale decorative outline or burst
- Edited accent colors are experimental; a specimen-surface contrast warning is not a complete accessibility audit

いいね・ブックマーク・付箋・スター・ベルは名前を固定したトグルで、残り7操作はコマンドです。装飾 SVG は読み上げやフォーカスの対象にせず、処理中は追加バーストを抑えます。動きを抑える設定では装飾も止め、静止した状態表示を残します。キーボード、名前、状態、フォーカス、中止と再試行に対応します。ただし実際の支援技術での確認、利用先の背景色・表示密度・言語による検証は別途必要です。アクセシビリティ完全準拠を主張するものではありません。

## Manual review / 手動確認

Tab through all 12 catalog actions and the real actions; Enter/Space activates once. Check all five toggles for stable labels and accurate pressed states, and verify commands never announce pressed state. Open and close both composers; test Escape and pending cancellation. Navigate Share using the keyboard and verify return focus. Test 320–390px widths and 200% zoom. Replay cartoon motion, interrupt it, switch treatments, and enable OS or manual reduced motion while it is running; check for lingering effects and unchanged target bounds. Pending should keep its static cues without secondary celebration bursts. Test NVDA/VoiceOver and your supported browsers. Inspect count announcements if counts matter in your integration; the stable button label intentionally excludes changing counts.

DOM unit tests cannot prove native dialog inertness, browser layout, zoom, or assistive-technology behavior.
