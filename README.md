# Lara

**"Learn Italian with Lara"** — a landing page for Lara, a native Italian
language teacher offering 1:1 lessons. Static, single-page site built with
[Astro](https://astro.build).

## Status

Working v1 codebase. Not yet deployed, not yet content-complete (see
[What's deliberately missing](#whats-deliberately-missing) below).

## Getting started

Requires Node.js `>=22.12.0`.

```bash
npm install
npm run dev       # local dev server with hot reload
npm run build     # production build -> dist/
npm run preview   # serve the production build locally
```

## Architecture: one JSON file drives the page

The entire page's copy and content structure lives in
[`content/siteContent.json`](content/siteContent.json), typed by the
`SiteContent` interface in [`src/types/content.ts`](src/types/content.ts).
[`src/pages/index.astro`](src/pages/index.astro) imports that JSON once and
passes each section a typed slice of it as a `content` prop — components
never reach into the JSON themselves, and never hardcode copy.

**Why:** editing `siteContent.json` alone changes the rendered page — no
component code has to change for a copy/content edit. This is deliberate
groundwork for a future Git-based CMS (Sveltia or Decap CMS, not yet
integrated) that would let Lara edit her own site's text and images by
writing straight into this same JSON file, without touching any code. Until
that CMS exists, editing the JSON by hand *is* the content workflow.

Most `image`-type fields left as an empty string (`""`) render as a
"Photo coming soon" placeholder ([`PlaceholderImage.astro`](src/components/PlaceholderImage.astro))
instead of a broken `<img>` — so real photos can be dropped in later by
filling in a path, with no code change. The one exception is
`hero.backgroundImage`: it's applied as a CSS background (layered under a
translucent teal gradient in `Hero.astro`), not rendered through
`PlaceholderImage`, so an empty value there just means "no background image,"
not a visible placeholder.

## Structure

```
content/siteContent.json   All page copy + structure (the CMS's future target file)
src/types/content.ts       TypeScript contract for siteContent.json (SiteContent)
src/pages/index.astro      Composes the page: Layout + one component per section
src/layouts/Layout.astro   <html> shell, global CSS, Navbar, CustomCursor
src/components/            One component per page section (see below) + shared UI
src/styles/global.css      Design tokens (palette, type, spacing) as CSS custom properties
src/utils/markdown.ts      Renders markdown-flavored content fields (marked)
src/utils/highlightText.ts Splits a string into plain/highlighted parts (used by PainPoints)
Ideas/                     Reference mockups that informed the design (see Ideas/README.md)
```

Page sections, in render order: Hero → About → PainPoints → Method → Results
→ Contact, each its own component in `src/components/`. Shared/non-section
components: `Navbar` (fixed nav), `CustomCursor`, `PlaceholderImage`, and
`SocialIcon` (a small hand-authored icon set — no icon library dependency).

A couple of content-modeling choices worth knowing before editing copy:

- **Hero's `<h1>` is derived, not stored.** It comes from splitting
  `meta.siteName` (`"Learn 🍹talian with Lara"`) on `" with "` into two lines
  — there's no separate `hero.headline` field. This is deliberate: the brand
  name and the hero title are the same string, kept as one source of truth
  instead of two fields that could drift out of sync.
- **The highlighted heading above the pain-point bubbles** ("Learn Italian
  with a Native Italian Teacher", with accent-colored words) is
  `painPoints.heading` / `painPoints.highlightWords`, rendered via
  `splitHighlighted()` from `src/utils/highlightText.ts`. It lives on
  `PainPointsContent`, not `HeroContent` — despite reading like a hero
  headline, it renders inside the PainPoints section.
- **`CustomCursor`** takes a `cursor: CursorAssets` prop (threaded from
  `index.astro` → `Layout.astro`) and renders three trailing marks, each
  48×48px: a spritz mark (no lag, leads), a cocktail umbrella (lag 0.16), and
  an orange slice (lag 0.10, trails furthest). All three now have real SVG
  art (`content/siteContent.json` → `cursor.spritzImage` / `umbrellaImage` /
  `orangeSliceImage`, files in `public/images/`). Umbrella/orange-slice follow
  the empty-string-means-placeholder convention: empty falls back to an
  inline hand-drawn SVG, a path renders an `<img>`. Spritz has no SVG
  fallback — empty falls back to a 🍹 emoji instead. Disabled on touch
  devices and when `prefers-reduced-motion` is set. Source new cursor art
  square with a transparent background at roughly 128×128px (SVG
  preferred) — it displays at 48px, so this is comfortable headroom, not a
  tight crop.

No UI framework (no React/Vue/Svelte) and no CSS framework — plain Astro
components and hand-written CSS custom properties in `global.css`.

## What's deliberately missing

These are known, intentional gaps — not oversights:

- **CMS**: no Sveltia/Decap CMS wired up yet. The content-driven architecture
  above exists specifically to make adding one later low-risk.
- **Hosting**: not deployed. GitHub Pages is the intended target, not yet set up.
- **Contact form backend**: `Contact.astro`'s form is fully styled and
  interactive, but submission is simulated client-side only (it calls
  `preventDefault()` and shows the success message without sending data
  anywhere). Web3Forms is the intended backend; not yet integrated.
- **Real photos and final copy**: most other `image` fields in
  `siteContent.json` are still empty (rendering as placeholders); cursor art
  is done (see `CustomCursor` above). Some copy (e.g. `results`
  intermediate/advanced levels) is still placeholder text.

## Reference material

[`Ideas/`](Ideas/README.md) holds the original mockup/screenshot images that
informed the design (hero concepts, method section, about section). It
predates the code and is kept for historical/design reference.
