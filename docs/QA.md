# Verification record / 検証記録

## 0.6.0 Practical configuration / 選択と設定の整理

The configured release gate includes 356 unit/schema/lifecycle tests, 20 generated EN/JA React modules and 243 discovered native cases across five engine/viewport projects. Four trusted-touch cases are intentionally skipped outside Chromium mobile; actual mouse, keyboard and remaining flows run across the applicable projects. These are gate counts, not a claim that the current candidate has passed native CI.

Checks cover transactional drag/drop and keyboard alternatives, pointer cancellation and viewport edge scrolling, stale configuration protection, one authoritative Appearance panel, selected-style comparison, and inherited/per-icon motion assignments across contexts, timelines, presets and generated React. Pending actions retain their busy/name/status semantics without visible dots. The 240 accepted motion-plan samples remain exact.

Trusted touch uses Chromium mobile CDP input; dispatched touch-shaped events in other harnesses are lifecycle checks rather than physical touch evidence. Native screenshots and interaction artifacts must be inspected after the exact-source run. Existing WebKit/Safari, physical-device and hosted-authentication limits below still apply.

ドラッグとキーボードの並べ替え、全体設定と個別設定の継承、保存・生成コードへの引き継ぎを検証します。既存モーションの形状や時間は変更していません。上記は実行予定の検証対象であり、正確なコミットの結果を確認してから配信します。

## 0.5.0 Step pages / ステップ別ページ

The workflow now presents one active step at a time, with a separate Guide. The configured release gate includes 302 unit/schema/lifecycle tests, 12 generated React examples and 208 native cases across Chromium, WebKit and Firefox desktop/mobile projects. The exact source build must pass before private deployment.

Checks cover manual keyboard tabs, Next/Back focus, browser history, initial/legacy hashes, session-draft restoration and storage failures, retained unsaved labels/preset/composer drafts, and inactive animation/request/import cleanup. Existing accepted glyph plans and strict native motion trajectories are unchanged. Only the active page is visible and accessible; retained inactive panels are hidden and inert.


The first exact step-page candidate [passed all 208 native cases without retries](https://github.com/domizo/social-interaction-lab/actions/runs/38202730327), alongside 302 unit tests and the clean-source/package gates. Reviewed captures show the [desktop icon-selection step](screenshots/workflow-choose-desktop-en.png) and [mobile Japanese context step](screenshots/workflow-preview-mobile-ja.png). The complete artifact also contains every step in both languages on all five projects. These images come from source `fe65898d`, remote `36c5c3aa`; the following documentation-only snapshot retains the same application and must pass its own exact-commit gate before deployment. Native workflow evidence includes fresh legacy routes, visible keyboard focus, browser Back/Forward, retained drafts, and aborted hidden imports/requests. The accepted default-speed flight and canonical glyph gates also pass.


Updated: 2026-10-12. Source checks, real-browser checks and hosted access are reported separately.

## 0.4.2 Chosen action sets / 試す操作を選ぶ

This release combines the icon-only setting below with a visible 1–12 icon picker and ordered previews. Its exact-commit gate includes 273 unit/schema/lifecycle tests, 12 generated EN/JA consumers and 163 native browser cases across the five engine/viewport projects. These numbers describe the configured gate; the exact run must finish successfully before deployment.

Selection, custom labels and order are checked across context, live, motion, state, diff and lens previews, preset reload, JSON and runnable generated modules. Native cases exercise keyboard reordering, the last-action guard, removed pending owners, removal of an open native modal/menu through a delayed configuration import, and all 12 icons in both presentations at 390 px. The full icon catalog and fixed Like/Save asynchronous experiment retain their clearly described scopes.

Browser screenshots can take longer than a finite animation. Portable playback therefore has independent real elapsed geometry samples from actual click/replay handlers and separately labelled held-clock phase screenshots; geometry must remain unchanged before/after each phase capture. The default-speed flight video uses the actual mounted catalog with unrelated paint hidden, waits for fonts/foreground/scroll readiness, and records RAF, visibility and timing telemetry. A separate unrecorded/untraced native560ms run retains every peak, landing and rebound predicate; video capture can skip brief extrema, so the recorded run is judged on growth, rise, descent and exact rest rather than claimed frame completeness. Whole-page native clicks remain covered separately. No accepted animation plan or production renderer was changed to accommodate capture scheduling; exact formation, landing/rebound, completion and cancellation gates remain.

選択・順序・名前を一つの設定で共有し、保存と書き出しまで検証します。実時間の再生と停止したコマの画像は別の証拠として扱います。実機・支援技術の読み上げ・本番ログインの検証範囲は引き続き限定されます。

## 0.4.1 Icon-only presentation / アイコンのみの表示

The exact-commit release gate adds a shared labelled/icon-only setting without changing any accepted motion plan. Before deployment it must pass the [Quality workflow](https://github.com/domizo/social-interaction-lab/actions), including:

- 240 unit/schema/lifecycle tests, strict types, clean tracked-source reconstruction and fresh package consumers
- Ten generated EN/JA TSX consumers, including full-catalog icon-only modules using the actual archive and stylesheet
- 138 native cases across Chromium desktop/mobile, WebKit desktop/mobile and Firefox; the new flows cover all three contexts, shared previews, legacy imports, preset reload, exported presentation, native keyboard focus, count descriptions and minimum 44 px targets
- Actual icon-only generated modules at 390 px, EN/JA screenshots and no horizontal overflow

The visible label and count are hidden together. Required accessible names remain stable; count descriptions merge with caller descriptions, and pending/status semantics remain available. Existing `showLabel={false}` remains label-only. Static screenshots establish layout only; the existing temporal regressions continue to establish motion. Actual Mac/iPhone, assistive-technology speech output and hosted authentication remain outside these automated checks. Native elapsed-frame peak recognition permits a fixed 0.25 SVG-unit size difference (less than 0.3 CSS px at the maximum 28 px icon), independently checked against recorded WebKit frames; materially incomplete shapes are rejected. Deterministic formation, full canonical completion, descent, contact and rebound remain exact gates.

表示だけを切り替え、保存した設定と生成コードにも引き継ぎます。旧形式の設定はラベル付きへ補完し、キーボード操作・読み上げ用の名前・処理中の状態・操作領域を維持します。上の件数はリリースの検証対象であり、正確なコミットの CI 結果を確認してから公開します。

## 0.4.0 Interaction Studio / 実際の画面・設定・時間・状態をつなぐ

The release gate is the exact-commit [Quality workflow](https://github.com/domizo/social-interaction-lab/actions). A configured test is not, by itself, a passing result. The Studio gate combines:

- 218 unit/lifecycle/schema/raster-metric tests and strict TypeScript; fresh committed-source reconstruction and package consumption
- React 18 and 19 consumers, strict NodeNext imports and CSS; eight generated EN/JA TSX configurations, including maximum-length labels
- 118 native browser cases across Chromium desktop/mobile, WebKit desktop/mobile and Firefox, retaining the accepted motion regressions
- All 60 timeline combinations: real slow playback, paused seek, backward seek after completion, exact reset, reduced motion and delayed Trace/Sparkles frame parity with normal activation
- Context → shared settings → named preset → runnable code, JSON/clipboard failure behavior, local popup keyboard handling, optimistic/after-success state, one-variable overlays and fresh section links
- A separate real generated-component page at 390 px, using the actual package and CSS rather than Studio styles

The accepted 0.3.8 motion plans and canonical glyphs are frozen by regression. Timeline inspection shares the production target resolver and morph sampler. It owns a separate SVG and does not rewrite motion durations or shapes to simulate slow playback.

Reviewed native layout captures: [desktop context/settings](screenshots/studio-context-desktop-en.png), [mobile Japanese context/settings](screenshots/studio-context-mobile-ja.png). These images were captured from the first Studio candidate's passing context workflow; they are layout evidence, not proof of animation. Native elapsed-time and paused-frame tests provide motion evidence. The exact release commit must pass the complete workflow before deployment.

WebKit on Linux is useful cross-engine evidence, not a test on the user's Mac or a physical iPhone. Hosted sign-in remains outside this verification; owner-private access is unchanged. The QA-only generated page is excluded from deployment.

0.4.0 は、設定の保存・生成コード・時間軸・非同期状態・比較表示を同じ設定で検証します。モーションの既存仕様は固定し、実際のブラウザーで時間経過と描画を確認します。画像はレイアウトの根拠であり、動きの証明には使いません。実機・支援技術・本番ログインの検証範囲は下記の制限を参照してください。

## 0.3.0 Cartoon and catalog / カートゥーンと一覧

- 99 unit tests passed, including real SVG target resolution for every one of 12 actions × 5 treatments, toggle versus command semantics, selected-preview primary-path fill, hidden effects, pending suppression, cancellation and unmount ownership
- All 28 Chromium desktop/mobile browser cases passed. The prior 16 motion combinations plus 44 additional catalog combinations supply temporal coverage for all 60 combinations in each viewport
- Heart outline was measured while the animation ran normally: width grew approximately 20 → 26 → 34 px while opacity rose approximately 0.08 → 0.59 and fell to 0.07 on desktop. Mobile independently showed the same growth/fade pattern. Comment bubble opacity and size increased over elapsed time
- Deterministic paused-phase screenshots supplement the elapsed-time measurements; still frames alone are not used as proof of movement
- Maximum intensity with 28 px glyphs kept effects visible, and outer hit targets stayed fixed. Pending suppressed secondary echoes; cancellation, stop, manual and OS reduction removed movement without losing static status
- EN/JA desktop/mobile catalog layouts and heart frames were visually reviewed. A mobile element-only capture showed an offscreen skip-link/native-select painting artifact; the independent full-page Japanese screenshot rendered correctly. A following narrow cleanup clips the unfocused skip-link and settles a reduced-motion Japanese overview before capture, while retaining keyboard skip-link access
- Clean committed-source rebuild, strict external package consumption, React 18/19 checks and all 60 exported keyframe plans passed. No social-network or AI calls were added

Evidence: application GitHub `f6d53ebf082f9f6f0734c74f7e77f8644b7fb9de`, corresponding Site source `7ee9363b499628480aa52ae74260162869a3cfe7`.

- [Successful 28-case CI](https://github.com/domizo/social-interaction-lab/actions/runs/38056363811)
- [Temporal JSON, heart phases and bilingual catalog screenshots](https://github.com/domizo/social-interaction-lab/actions/runs/38056363811/artifacts/11671121654), retained 14 days
- Artifact SHA-256: `86e57bc83e85aeb48bd1760ffa2eaad23a2a1914aabe66e8fa8ee30c8598cbdd`

This record and the narrow capture/deep-link cleanup follow the measured application source. A later fresh-page regression exposed initial fragment scrolling before React mounted; the app now performs the initial jump after layout fonts settle, cancels stale/unmounted work, and yields to user input. Three lifecycle regressions bring the unit suite to 102. Every subsequent exact repository commit reruns the full Quality workflow. Hosted sign-in, Safari, physical devices and assistive-technology limits below still apply.

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
