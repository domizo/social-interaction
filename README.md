# Social Interaction Lab

Four original visual styles and five glyph-motion treatments for 12 social-action icons, built from shared accessible React + TypeScript primitives. Cartoon motion adds anime-inspired anticipation, squash, overshoot, and decorative effects. Includes a bilingual EN/JA Vite playground and a real installable library.

[日本語](README.ja.md)

## Run the playground

Requires Node.js 22.12+, 24, or 26 (supported even-numbered releases) and npm.

```sh
npm ci
npm run dev
npm run check
npm test
npm run build
```

`npm run build` emits the playground in `dist/`, ESM library in `package/`, and a downloadable tarball in `public/downloads/`. There are no accounts, API keys, analytics, social-network or AI connections, or posting. Every request in the playground is local simulation. Saved text lasts for the mounted session only; reload clears it.

## Install the library

Download `social-interaction-lab-react-0.3.5.tgz` from the playground or build it with `npm run build:package`. In your separate React project:

```sh
npm install ./social-interaction-lab-react-0.3.5.tgz
```

React 18.2 or 19 is a peer dependency. The library is ESM-only; styles are explicitly imported and are not automatically injected.

```tsx
import { useState } from 'react';
import { ActionBar, LikeButton, CommentButton, ShareButton, QuoteButton } from '@social-interaction-lab/react';
import '@social-interaction-lab/react/styles.css';

export function PostActions() {
  const [liked, setLiked] = useState(false);
  return (
    <ActionBar tokens={{ gap: 12, iconSize: 20 }}>
      <LikeButton label="Like" selected={liked} variant="soft"
        onClick={() => setLiked(value => !value)} />
      <CommentButton label="Comment" onClick={() => openYourComposer('comment')} />
      <ShareButton label="Share" aria-expanded={shareMenuOpen}
        onClick={() => openYourShareMenu()} />
      <QuoteButton label="Quote" onClick={() => openYourComposer('quote')} />
    </ActionBar>
  );
}
```

The popup callbacks above are integration placeholders for your application. LikeButton is controlled, as are the other toggle components listed below. CommentButton and QuoteButton announce a dialog; ShareButton announces a menu. You must supply matching accessible popups, keyboard navigation, focus handling, and aria-expanded/aria-controls. The full working popup implementations are in `src/app/LiveActions.tsx` in the source project. The exported primitives do not create popups themselves.

### Explore the action catalog

- Controlled toggles: `LikeButton`, `BookmarkButton`, `NoteButton`, `StarButton`, `BellButton`
- Commands: `CommentButton`, `ShareButton`, `QuoteButton`, `RepostButton`, `SendButton`, `SparklesButton`, `ReactionButton`
- `ActionButton` accepts all 12 `SocialAction` values; `ActionIcon` exposes the same decorative SVG catalog
- Exported `socialActions`, `toggleActions`, `isToggleAction`, and EN/JA `actionLabels` keep catalog integrations consistent

Toggle `selected` values map to `aria-pressed`; keep the accessible label stable. `NoteButton` is a sticky-note alternative for saving, labelled “Keep note” / “メモを保存” in the playground, not a text editor. Sparkles is a local visual action, not an AI service. Repost, Send, and the other catalog actions do not publish or transmit anything.

### Animate the icons

Choose `iconMotion="pulse"`, `"spring"`, `"trace"`, `"gesture"`, or `"cartoon"` independently of the visual style; `"none"` disables glyph motion. The Motion section compares the original four actions × five treatments, replays them together, and adjusts glyph duration, intensity, and part stagger. A separate 12-card catalog previews the selected treatment across every icon; those previews do not open popups or invoke a service. Select a treatment to use it in the original live local interactions.

```tsx
<LikeButton label="Like" selected={liked} iconMotion="cartoon"
  motionTokens={{ duration: 560, intensity: 1, stagger: 60 }}
  onClick={() => setLiked(value => !value)} />
```

Cartoon gives the heart a quiver and an expanding, fading outline. Comment grows continuously from a tiny lower-left circle into the standard bubble, while Repost slides fixed-length arrow bodies around its original rectangular route. Other icons use action-specific gestures. These expressive treatments are hypotheses to test in context, not universal rules for beauty.

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
npm test
npm run build
npm run verify:consumer
npm run verify:archive
```

`verify:consumer` creates a fresh external npm project, installs the tarball, typechecks with strict NodeNext and skipLibCheck:false, imports the ESM at runtime, and checks the stylesheet. `verify:archive` requires a Git HEAD and tests only files in that committed archive. Do not ignore `src/lib/`.

DOM tests cover behavior but do not prove layout, native modal focus trapping, platform assistive-technology compatibility, or visual contrast on all custom surfaces. Browser checks and their status are recorded in `docs/QA.md`. Test your real integration.

## Distribution

Private source and private demo. `UNLICENSED` until a public license is chosen; package metadata has `private: true`. Nothing is published to npm. Third-party dependency licenses apply separately.
