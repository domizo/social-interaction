# Verification record / 検証記録

Date: 2026-10-10. Source checks and native browser checks are separate.

## Passed / 通過

- TypeScript application, component, and test-source checks
- 38 DOM/hook behavioral tests: tokens, stable toggle semantics, native button activation, independent pending states, cancellation, stale results, repeated activation, retry, retained draft text, current-locale completion, share keyboard navigation, and focus restoration
- Production Vite build and generated installable library
- Fresh external npm install: strict NodeNext, skipLibCheck:false, runtime ESM import, included CSS
- Clean committed archive rebuilt with fresh npm ci, typecheck, tests, build, and external consumer verification (rerun after release changes)
- npm audit: zero known vulnerabilities after upgrading dev-only Vitest to 5.0.3
- Native Sites operation confirmed owner-private production deployment

## Browser checks pending / ブラウザ検証は保留

Desktop and mobile Playwright CI is configured for screenshot capture, no horizontal overflow, actual hit-target geometry, native modal Tab/Shift+Tab containment, failure/retry, cancellation focus, Share menu navigation, EN/JA, reduced motion, and package download. These tests must run on a supported browser runner; configuration alone is not a pass.

Hosted visual comparison with design/concept.png, browser screenshots, 200% zoom, and assistive-technology testing have not yet been completed. The cloud-local Chromium sandbox blocks launch. Private hosted browser access requires its own account authorization before testing.

DOM tests use a minimal dialog shim and do not prove modal inertness, real focus trapping, pixel layout, OS rendering, or screen-reader compatibility. / DOM テストは実際のブラウザ・支援技術での確認の代わりにはなりません。
