# Verification record / 検証記録

Date: 2026-10-10. Source checks, real-browser checks and hosted access are reported separately.

## 0.2.0 glyph-motion verification / アイコンの動作検証

Flow: open the Motion section → activate each action in each treatment → observe real SVG geometry or line/fill styling change over time → cancel/replay/reduce motion without changing the hit target or request result.

- 62 unit tests passed in the first complete motion release gate; a subsequent text-contrast regression brings the source suite to 63
- All 22 real Chromium cases passed on desktop 1536×1024 and mobile 390×844, including the existing 12 interaction regressions
- All 16 motion/action combinations were sampled in each viewport. Actual SVG `g`/`path` targets changed computed transforms, stroke offsets or fill/opacity, and animation currentTime progressed between observations. Recorded intervals were 116–217 ms. This is temporal evidence, not an inference from still screenshots
- Browser checks also verified fixed ≥44 px targets, pending glyph loops, independent status, cancellation, rapid trace replay ownership, stop/zero duration, standalone reducedMotion CSS, OS reduction, selected specimens and Japanese treatment selection
- Reviewed EN/JA desktop/mobile layouts plus three recorded motion frames per viewport. No clipping or horizontal overflow in tested widths. New helper text was subsequently darkened to ≥4.5:1 on white, the controls and code surfaces, with source and computed-color regressions
- Fresh strict external consumers passed with React 18 and React 19, including motion types, runtime ESM, keyframe plans and DTCG output
- Native Sites deployment succeeded with owner-only access unchanged. The hosted sign-in flow was not exercised; see limits below

### Motion evidence / 根拠

- Application-motion source: GitHub `1d064dc515fa368880d70030878dabf0e014458d`; Site `389a696ee9f27ea3f43ca9091688d9b67babbbef`
- [Successful 22-case browser CI](https://github.com/domizo/social-interaction-lab/actions/runs/38053137595)
- [Temporal JSON, motion frames and EN/JA screenshots](https://github.com/domizo/social-interaction-lab/actions/runs/38053137595/artifacts/11670911049), retained for 14 days. Open the Playwright report for the two glyph-animation-progress.json attachments
- Artifact SHA-256: `e75a77f750f6b5bd41afb6a1a8c265108d8050d9883c3705e21ccd720360763d`
- This record, a packaged documentation-link correction and the narrow helper-text palette cleanup follow that run. The repository Quality workflow repeats all checks for each final commit

Browser plugin not available in this environment. The local browser launch was sandbox-blocked; real Playwright execution used the standard GitHub CI runner. No local restriction or production consent was bypassed.

## Original 0.1.0 baseline / 初回版

The following evidence belongs to the original release; the motion gate above supersedes its test counts. Persistent overview crops below show that original baseline.

## Passed / 通過

- Strict TypeScript checks include the application, reusable library, unit tests and Playwright configuration
- 43 unit/hook/contrast tests: shared tokens, stable toggle semantics, keyboard activation, independent pending states, cancellation, stale results, repeated activation, retry, retained text, current-language completion, Share menu navigation, focus restoration and default small-text contrast
- Production Vite build and generated installable ESM library
- Fresh external npm install: strict NodeNext, skipLibCheck:false, runtime ESM import and included CSS; independent React 18 and React 19 consumers also checked
- Clean committed archive rebuilt using fresh npm ci, typecheck, tests, build and external consumer
- npm audit: zero known vulnerabilities after updating dev-only Vitest to 5.0.3
- All 12 real Chromium Playwright cases passed on desktop 1536×1024 and mobile 390×844 (DPR 3), including EN/JA screenshots, no horizontal overflow, 44 px hit areas, native dialog initial focus and Tab/Shift+Tab containment, cancellation and focus restoration, failure/retry, retained text, Share keyboard behavior, live spacing tokens, reduced motion and package download
- Visual review inspected EN/JA desktop/mobile screenshots, including context, states and documentation, against the design concept. Mobile action bars use a balanced two-column layout
- Native Sites operation confirmed owner-private production deployment

## Evidence / 検証の根拠

- Tested application source: GitHub commit `a85764e8f98e42ac91928ccbbff98c06de677b7e`; corresponding Site source `3ec0c2daec1da2199ae580d76b04615ecf5d8d12`
- [Successful CI run 38050726831](https://github.com/domizo/social-interaction-lab/actions/runs/38050726831)
- [Browser report and full EN/JA screenshots](https://github.com/domizo/social-interaction-lab/actions/runs/38050726831/artifacts/11669222564) (GitHub artifact retention 14 days)
- Artifact SHA-256: `e0d62b1998a409b4e1c7dd325f26cdbb3ef5e875dca241b852096b4b9eae019b`
- Persistent overview crops: [desktop EN](screenshots/desktop-en.png), [mobile JA](screenshots/mobile-ja.png)

This record is a documentation-only addition after the verified application source. Subsequent CI runs verify the final repository commit as well.

## Important limits / 検証していない範囲

The production Site is private. Its hosted browser session stops at a new ChatGPT profile-consent screen; that consent was not accepted. Browser tests ran the same application source on a standard CI browser runner, not through the production sign-in flow.

200% browser zoom and real assistive-technology testing have not been performed. Chromium mobile emulation is not a physical iPhone/Safari test. Color customization remains experimental; a specimen-surface contrast check is not a full audit of arbitrary integrations.

本番サイトは private です。新しいアカウント連携の同意は行っていません。ブラウザ検証は同じソースを使う CI 上で実施しました。実機・Safari・支援技術・200%拡大の確認は未実施です。

DOM unit tests use a minimal dialog shim and do not replace the real-browser evidence above.
