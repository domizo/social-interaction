# Accessibility / アクセシビリティ

- Native buttons support Enter and Space; button type defaults to button to avoid accidental form submission
- Like uses a stable name plus aria-pressed; Comment/Quote announce a dialog, Share a menu
- ActionBar is a labelled group with normal Tab order, not a toolbar requiring arrow navigation
- Visible icon size is separate from the 44px minimum button hit target
- Focus uses a 2px blue ring with 3px separation. The simulated focus specimen is explicitly separate from real keyboard focus
- Pending buttons remain focusable and suppress activation; text feedback has role=status
- Share supports ArrowUp/Down, Home/End, Escape, Tab/Shift+Tab; Escape returns focus to the opener
- Native dialog supplies modal focus containment; close/save calls close before restoring trigger focus
- Cancellation aborts requests and invalidates stale results. Text remains after an error for retry
- Saved comment/quote text is retained in mounted session state and inspectable; reload clears it
- Reduced-motion media query removes animation/transforms. Manual preview switch matches this behavior
- Edited accent colors are experimental; a white contrast warning is not a complete accessibility audit

キーボード、名前、状態、フォーカス、中止と再試行に対応します。ただし実際の支援技術での確認、利用先の背景色・表示密度・言語による検証は別途必要です。アクセシビリティ完全準拠を主張するものではありません。

## Manual review / 手動確認

Tab through real actions; Enter/Space activates once. Open and close both composers; test Escape and pending cancellation. Navigate Share using the keyboard and verify return focus. Test 320–390px widths and 200% zoom. Enable OS reduced motion. Test NVDA/VoiceOver and your supported browsers. Inspect count announcements if counts matter in your integration; the stable button label intentionally excludes changing counts.

DOM unit tests cannot prove native dialog inertness, browser layout, zoom, or assistive-technology behavior.
