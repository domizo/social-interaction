# Social Interaction Lab

**Choose how social actions look and feel in context, then take them into React.**

For developers and designers building feeds, article pages, and chat interfaces. Try the actions in sample screens, adjust their appearance and motion, save a configuration, and copy a React component that carries those choices into your application.

[日本語](README.ja.md) · [Start locally](#start-locally) · [Use in React](#use-in-react)

![Studio with a scripted chat preview beside shared appearance and motion controls](docs/screenshots/studio-context-desktop-en.png)

Use the same configuration across a feed, article footer, and scripted chat to judge how it fits each setting. This capture shows the context and appearance controls; the icon picker sits below them. [See the mobile Japanese preview](docs/screenshots/studio-context-mobile-ja.png). These are actual browser captures; still images do not demonstrate motion.

## From a design choice to a React component

1. **Choose a context and the actions you need.** Switch between the sample screens. In **Choose icons to test**, select 1–12 actions and use **Earlier / Later** to set their order. The chosen set and order carry through the context previews, style and motion comparisons, design lens, state specimens, presets, and generated code. The timeline lets you inspect an icon from that selection.
2. **Tune it in place.** Adjust style, spacing, icon size, stroke, and motion while watching the preview. Switch between visible labels and icon-only presentation. Edit the EN/JA names in **Actions & labels**, then choose **Apply labels** before saving or exporting.
3. **Keep a setup you can revisit.** Save a named preset in this browser, or download a configuration JSON to load later. The action order, both label languages, presentation, and visual and motion settings travel together.
4. **Take the working starting point.** **Copy React** or **Download TSX** gives you a complete `SocialActions.tsx` module with the selected configuration, controlled toggles, local composers, a keyboard-operated sharing menu, and an optional `onCommand` callback. Install the package below and mount the generated component. If clipboard access fails, selectable source is shown.

The previews use local interactions and simulated requests. The chat response is scripted; no social-network or AI service is connected.

## What you can explore

### Find a composition that fits the screen

Try a compact action row for an article or a more expressive set for a community feed. The design lens changes only spacing, icon size, or stroke width while holding the remaining configuration constant. Button bounds, icon-box centers, and same-row horizontal gaps help you see what changed. Match the two specimens' interaction states when comparing them; the overlays do not score visual quality or accessibility.

### Examine the moment a motion feels off

Use the timeline to pause, scrub, slow down, and step through a selected icon's movement. It shares the activation motion engine, so you can inspect the actual animation plan rather than a separate approximation. Try a different duration or intensity, then return to the context preview. Reduced-motion preview keeps the icon static.

### Compare feedback before connecting a backend

The async comparison focuses on **Like and Save**, independently of your selected action set. Compare an immediate optimistic update with an update after success, then try failure, retry, and cancellation. Displayed and confirmed values are shown separately so you can examine what the interface tells someone while a request is unresolved. These are local simulations, not a backend integration or performance benchmark.

## Start locally

Requires Node.js 22.12+ in the 22.x line, 24.x, or 26.x, and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. No account or API key is required. To build the playground and the installable library:

```sh
npm run build
```

The build emits the playground in `dist/`, the ESM library in `package/`, and the package archive in `public/downloads/`.

## Use in React

Download `social-interaction-lab-react-0.4.2.tgz` from the playground, or create it with `npm run build:package`. Copy the archive into your separate React project, then install it there:

```sh
npm install ./social-interaction-lab-react-0.4.2.tgz
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
- **Local state:** Toggle values, drafts, and simulated request state last only for the mounted session and reset on reload. There are no accounts, analytics, social-network or AI connections, or posting.
- **Reusable configuration:** Up to 20 named presets persist in this browser's localStorage until deleted or browser data is cleared. They are not cloud backup or automatic saving; choose a saved preset and load it after reloading. JSON import/export uses schema v1, is limited to 64 KB, and validates the entire input before applying it. Invalid input leaves the current configuration unchanged.
- **Failure handling:** Storage errors are reported without claiming a save. Invalid stored data is left untouched until explicitly cleared. Clipboard failure reveals selectable source.
- **Export boundaries:** Presets and exports retain the chosen action set, but not pressed toggle values, drafts, request state, or the manual reduced-motion preview switch. Generated components still honor the OS reduced-motion preference. Older schema-v1 presets/JSON without `presentation` load as labelled.

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

Choose `iconMotion="pulse"`, `"spring"`, `"trace"`, `"gesture"`, or `"cartoon"` independently of the visual style; `"none"` disables glyph motion. The Motion section compares the selected actions across five treatments, replays them together, and adjusts glyph duration, intensity, and part stagger. The Studio timeline inspects an icon from the selected set using `createGlyphTimeline` on an exclusively owned standalone `ActionIcon` SVG. Never attach it to an active `ActionButton` SVG. A separate 12-card catalog previews the selected treatment across every icon; those previews do not open popups or invoke a service. Select a treatment to use it in the live local interactions.

```tsx
<LikeButton label="Like" selected={liked} iconMotion="cartoon"
  motionTokens={{ duration: 560, intensity: 1, stagger: 60 }}
  onClick={() => setLiked(value => !value)} />
```

Cartoon gives the heart a quiver and an expanding, fading outline. Comment rises while growing from a tiny lower-left circle into the standard bubble during the first 75% of its duration, reaching its full contour at the peak. Over the final 25%, it falls, squashes on landing, rebounds mildly, and settles (420 ms + 140 ms at the 560 ms default). Repost continues to slide fixed-length arrow bodies around its original rectangular route. Other icons use action-specific gestures. These expressive treatments are hypotheses to test in context, not universal rules for beauty.

Glyph duration is bounded to 0–1600 ms, intensity to 0–2, and part stagger to 0–160 ms. Activation feedback is not a success message. Pending uses a slower repeating glyph with static dots and accessible status; cartoon secondary bursts stay off during pending. OS/manual reduced motion preserves state without movement. Effects are decorative, cancellation-owned, and never enlarge the hit target. See [motion API and design tradeoffs](docs/MOTION.md).

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

`verify:consumer` creates a fresh external npm project, installs the tarball, typechecks with strict NodeNext and skipLibCheck:false, imports the ESM at runtime, and checks the stylesheet. `verify:generated` compiles generated EN/JA TSX examples against the built archive, including labelled/icon-only, full-catalog, single-action, and maximum-label configurations, using existing dependencies. It also builds a separate generated-component fixture for the browser suite; that QA page is excluded from deployment. `verify:archive` requires a Git HEAD and tests only files in that committed archive. Do not ignore `src/lib/`.

CI is defined in `.github/workflows/quality.yml`; a configured check is not evidence of a passing run. DOM tests cover behavior but do not prove layout, native modal focus trapping, platform assistive-technology compatibility, or visual contrast on all custom surfaces. Browser checks and their status are recorded in the [QA guide](https://github.com/domizo/social-interaction-lab/blob/main/docs/QA.md). Test your real integration.

## Distribution

Private source and private demo. `UNLICENSED` until a public license is chosen; package metadata has `private: true`. Nothing is published to npm. Third-party dependency licenses apply separately.
