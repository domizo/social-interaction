# Social Interaction Lab

**Find the right social actions for your interface, then take the working choices into React.**

For developers and designers building feeds, article pages, and chat interfaces. Choose icons, tune their appearance and motion, try them in context, and export a React component. Five focused tabs keep one shared configuration, so you can revisit any decision without starting over.

[日本語](README.ja.md) · [Five-step workflow](docs/STUDIO.md#five-step-workflow) · [Start locally](#start-locally) · [Use in React](#use-in-react)

![Choose actions and reorder them with drag handles](docs/screenshots/workflow-drag-desktop-en.png)

Choose only the actions your interface needs, then carry that setup through the five tabs. [The mobile Japanese In context page](docs/screenshots/workflow-context-mobile-ja.png) shows the same choices in a feed, with separate local request controls.

![Assign a shared motion and individual icon treatments](docs/screenshots/workflow-motion-desktop-en.png)

Give the row one shared motion, keep a few icons different, and inspect the resolved result below. These are actual 0.6.0 browser captures; still images show the layout, while interaction and elapsed-time checks are recorded in the [verification guide](https://github.com/domizo/social-interaction-lab/blob/main/docs/QA.md).

## From a design choice to a React component

1. **Choose icons.** Select 1–12 actions and drag their handles into order. Keyboard pickup, movement, drop, and cancellation work on the same handles; **Reorder without dragging** reveals the **Earlier / Later** fallback. The committed order follows you through the other steps.
2. **Appearance.** Use **Tune the details** as the single place for visual style, labels/icon-only presentation, spacing, size, stroke, color, hit targets, and preview options. Inspect the chosen style, with an optional one-variable comparison.
3. **Motion.** Choose a global treatment, then override individual icons or let them inherit. Tune glyph duration, intensity, and stagger; the selected-action previews and timeline show the resolved assignments.
4. **In context.** Try the same actions in a feed, article footer, or scripted chat. Test the local toggles, composers, and sharing menu with the configuration you chose.
5. **Export.** Edit the EN/JA names in **Actions & labels** and choose **Apply labels**, then save a named browser preset, download or import configuration JSON, and use **Copy React** or **Download TSX** to get `SocialActions.tsx`. Download the private package archive here, then install it in your application.

These are freely revisitable tabs, not locked milestones. Each shows its own workspace instead of adding another section to a long page. Tab changes, browser Back/Forward, and language changes keep the configuration. A validated session draft restores the configuration, language, and appearance-isolation choices after reload when browser storage is available. Leaving a panel stops its motion and pending local work, invalidates unfinished file imports, and closes its popups; its local toggles and composer drafts remain available when you return during the mounted session.

**Guide** is a separate reference area for explanations, the motion comparison matrix, the full icon catalog, async feedback, the design lens, and state specimens. Its motion experiments stay local and never rewrite the shared configuration. The previews use local interactions and simulated requests. The chat response is fixed sample content; no social-network or AI service is connected.

## What you can explore

### Build an action row for an article, feed, or chat

Choose a compact icon-only set for an article, or compare labelled actions for a community feed. Check the same configuration in all three contexts before exporting. In **Guide → Design lens**, the lens changes only spacing, icon size, or stroke width while holding the remaining configuration constant. Match the two specimens' interaction states when comparing them. Its bounds and spacing overlays help explain differences; they do not score beauty or accessibility.

### Examine the moment a motion feels off

In **Motion**, pause, scrub, slow down, and step through a selected icon's movement using the same engine as activation playback. Try another duration or intensity, then revisit **In context** without rebuilding the setup. Reduced-motion preview keeps the icon static. The timeline reads the selected icon’s assigned treatment; change assignments in the controls above it. All 60 existing action/treatment geometry and timing plans, including the accepted Comment/Repost motion, are unchanged in 0.6.0.

### Decide how to show a wait or failure before wiring a backend

**Guide → Async states** compares immediate optimistic feedback with feedback after success for independent **Like and Save** examples. Try failure, retry, and cancellation, and compare displayed values with confirmed values. These are local simulations for discussing interface behavior, not a backend integration or performance benchmark.

## Start locally

Requires Node.js 22.12+ in the 22.x line, 24.x, or 26.x, and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. The workflow starts at `#choose`; `#appearance`, `#animation`, `#preview`, `#export`, and `#guide` open the other workspaces directly. No account or API key is required. To build the playground and the installable library:

```sh
npm run build
```

The build emits the playground in `dist/`, the ESM library in `package/`, and the package archive in `public/downloads/`.

## Use in React

Download `social-interaction-lab-react-0.6.0.tgz` from **Export**, or create it with `npm run build:package`. Copy the archive into your separate React project, then install it there:

```sh
npm install ./social-interaction-lab-react-0.6.0.tgz
```

This is a private archive, not an npm registry release. React 18.2 or 19 is a peer dependency; the package is ESM-only. Styles must be explicitly imported.

For the setup you chose in Studio, save its generated module as `SocialActions.tsx` and render it:

```tsx
import SocialActions from './SocialActions';
import '@social-interaction-lab/react/styles.css';

export default function App() {
  return <SocialActions />;
}
```

You can also compose individual primitives:

```tsx
import { useState } from 'react';
import { LikeButton } from '@social-interaction-lab/react';
import '@social-interaction-lab/react/styles.css';

export function PostLike() {
  const [liked, setLiked] = useState(false);
  return (
    <LikeButton label="Like" selected={liked} variant="soft"
      onClick={() => setLiked(value => !value)} />
  );
}
```

The generated module includes local popup behavior. Individual CommentButton and QuoteButton primitives announce a dialog, and ShareButton announces a menu, but do not create those popups. When using primitives directly, provide matching accessible popups, keyboard navigation, focus handling, and `aria-expanded` / `aria-controls`. See `src/app/LiveActions.tsx` for working local examples.

## Scope and saved data

- **Application integration:** Generated code carries the chosen actions, order, labels, presentation, tokens, and motion. It does not export the Studio panels, sample article/chat content, timeline, or async comparison. `onCommand` is a synchronous notification callback; real requests, persistence, permissions, and error policy belong to your application.
- **Working configuration:** The shared action list/order, applied EN/JA labels, context, presentation, appearance, and motion survive navigation and language changes. A validated sessionStorage draft restores configuration, locale, and the appearance-isolation mode/variable on a same-tab reload when storage is available. Invalid or blocked storage uses defaults with a visible notice and is not automatically overwritten until a user edit. This draft is separate from named presets and does not sync across devices.
- **Local interaction state:** Toggle values and composer drafts survive step changes while the panels remain mounted, but reset on reload. Leaving a panel cancels pending local work and motion, closes popups, and prevents an unfinished import from applying later. Unapplied label edits are not exported. There are no accounts, analytics, social-network or AI connections, or posting.
- **Named presets and portable files:** Up to 20 named presets persist in this browser's localStorage until deleted or browser data is cleared. Saving a preset is explicit; subsequent slider edits do not overwrite it. Choose **Load** to apply one. JSON import/export uses schema v1, is limited to 64 KB, and validates the entire input before applying it. Invalid input leaves the current configuration unchanged.
- **Failure handling:** Storage errors are reported without claiming a save. Invalid named-preset data is left untouched until explicitly cleared. Clipboard failure reveals selectable source. Keep a configuration JSON if you need a portable copy.
- **Export boundaries:** Presets and exports retain the chosen action set, but not pressed toggle values, drafts, request state, or the manual reduced-motion preview switch. Generated components still honor the OS reduced-motion preference. Older schema-v1 presets/JSON without `presentation` load as labelled; omitted `motionOverrides` becomes an empty map, so every icon inherits the global treatment. New exports retain the per-icon assignments, including overrides for temporarily removed icons.

See the [Studio guide](docs/STUDIO.md) for validation rules, export scope, and inspection workflows.

## Library reference

### Explore the action catalog

- Controlled toggles: `LikeButton`, `BookmarkButton`, `NoteButton`, `StarButton`, `BellButton`
- Commands: `CommentButton`, `ShareButton`, `QuoteButton`, `RepostButton`, `SendButton`, `SparklesButton`, `ReactionButton`
- `ActionButton` accepts all 12 `SocialAction` values; `ActionIcon` exposes the same decorative SVG catalog
- Exported `socialActions`, `toggleActions`, `isToggleAction`, and EN/JA `actionLabels` keep catalog integrations consistent

Toggle `selected` values map to `aria-pressed`; keep the accessible label stable. `NoteButton` is a sticky-note alternative for saving, labelled “Keep note” / “メモを保存” in the playground, not a text editor. Sparkles is a local visual action, not an AI service. Repost, Send, and the other catalog actions do not publish or transmit anything.

### Choose icon-only presentation

`presentation="icon-only"` hides both visible text and count while preserving the stable `label` as the accessible name, a native title hint, and an accessible description for a supplied count. The optional prop defaults to `"labelled"`. It changes presentation, not toggle/command behavior, focus handling, hit-target minimums, or motion.

```tsx
<LikeButton label="Like" presentation="icon-only" count={12} selected={liked}
  onClick={() => setLiked(value => !value)} />
```

Existing `showLabel={false}` retains its original label-only behavior: in labelled presentation, the count remains visible. Native title hints are browser-dependent and do not guarantee discovery on touch devices; choose visible labels when the icon may be unfamiliar.

### Animate the icons

Choose `iconMotion="pulse"`, `"spring"`, `"trace"`, `"gesture"`, or `"cartoon"` independently of the visual style; `"none"` disables glyph motion. The **Motion** tab sets the global treatment and each selected icon’s override. **Inherit global** or **Reset to global** removes that override; an explicit `none` keeps that icon still even if the global treatment changes. Removing and re-adding an icon retains its override. Live actions, contexts, async examples, the timeline, and generated React resolve each icon the same way. Glyph duration, intensity, and stagger are shared. The timeline shows the assigned treatment as a readout and uses `createGlyphTimeline` on an exclusively owned standalone `ActionIcon` SVG; never attach it to an active `ActionButton` SVG. **Guide → Motion reference** holds the five-treatment comparison matrix. **Guide → Icon catalog** initially shows **Assigned motions** across all 12 icons. Exploring another catalog treatment or reference timing changes only that experiment, and never the shared configuration. Reference previews do not open popups or invoke a service.

```tsx
<LikeButton label="Like" selected={liked} iconMotion="cartoon"
  motionTokens={{ duration: 560, intensity: 1, stagger: 60 }}
  onClick={() => setLiked(value => !value)} />
```

Cartoon gives the heart a quiver and an expanding, fading outline. Comment rises while growing from a tiny lower-left circle into the standard bubble during the first 75% of its duration, reaching its full contour at the peak. Over the final 25%, it falls, squashes on landing, rebounds mildly, and settles (420 ms + 140 ms at the 560 ms default). Repost continues to slide fixed-length arrow bodies around its original rectangular route. Other icons use action-specific gestures. These expressive treatments are hypotheses to test in context, not universal rules for beauty.

**Appearance → Surface hover & press feedback** controls button-surface duration and press depth separately from glyph animation. Glyph duration is bounded to 0–1600 ms, intensity to 0–2, and part stagger to 0–160 ms. Activation feedback is not a success message. Pending uses a slower repeating glyph, `aria-busy`, `aria-disabled`, duplicate-activation guards, and contextual status; cartoon secondary bursts stay off during pending. There is no separate pending-dot decoration. OS/manual reduced motion leaves the glyph static while busy semantics, guards, and contextual status remain. Effects are decorative, cancellation-owned, and never enlarge the hit target. See [motion API and design tradeoffs](docs/MOTION.md).

### Async ownership

```tsx
const request = useAsyncAction<boolean>();
async function like() {
  const next = await request.run(signal => yourAdapter(!liked, signal));
  if (next !== undefined) setLiked(next);
}
// <LikeButton label="Like" selected={liked} pending={request.status === 'pending'} onClick={like} />
// request.cancel() aborts and invalidates outstanding results.
```

Import `useAsyncAction` from the same package. One hook instance owns one action. Repeated activation while pending is ignored. Cancellation protects state even when an adapter ignores its AbortSignal. Keep consequential side effects in the adapter cancellation-aware: cancelling the UI does not undo a remote server mutation.

## Design and maintenance

- `src/lib/tokens.ts` is the versioned runtime source, shared by components, specimens, controls, and DTCG JSON export
- Four variants: `minimal`, `soft`, `solid`, `spring`; see [design hypotheses](docs/DESIGN.md)
- Icon size and CSS-pixel stroke are independent through non-scaling strokes
- 44 px minimum hit targets are a product choice; WCAG 2.2 AA 2.5.8 is 24 × 24 CSS px with exceptions
- OS reduced motion and the standalone `reducedMotion` prop suppress both SVG motion and CSS transforms
- Arbitrary accent changes may reduce contrast; the inspector warns and exports remain experimental
- [API](docs/API.md), [accessibility](docs/ACCESSIBILITY.md), [contribution checklist](CONTRIBUTING.md), [changelog](CHANGELOG.md)

## Verification

```sh
npm run check
npm test
npm run build
npm run verify:consumer
npm run verify:generated
npm run verify:archive
```

`verify:consumer` creates a fresh external npm project, installs the tarball, typechecks with strict NodeNext and skipLibCheck:false, imports the ESM at runtime, and checks the stylesheet. `verify:generated` compiles generated EN/JA TSX examples against the built archive, including labelled/icon-only, full-catalog, single-action, maximum-label, legacy, mixed-motion, inactive-override, and hostile-label configurations, using existing dependencies. Its 10 configurations produce 20 EN/JA modules; unsafe override maps must be rejected without executing imported accessors or `toJSON`. It also builds a separate generated-component fixture for the browser suite; that QA page is excluded from deployment. `verify:archive` requires a Git HEAD and tests only files in that committed archive. Do not ignore `src/lib/`.

CI is defined in `.github/workflows/quality.yml`; a configured check is not evidence of a passing run. DOM tests cover behavior but do not prove layout, native modal focus trapping, platform assistive-technology compatibility, or visual contrast on all custom surfaces. Browser checks and their status are recorded in the [QA guide](https://github.com/domizo/social-interaction-lab/blob/main/docs/QA.md). Test your real integration.

## Distribution

Private source and private demo. `UNLICENSED` until a public license is chosen; package metadata has `private: true`. Nothing is published to npm. Third-party dependency licenses apply separately.
