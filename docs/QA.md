# Verification record / 検証記録

Date: 2026-10-10. Source checks, real-browser checks and hosted access are reported separately.

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
