# Lara

**"Learn Italian with Lara"** — a landing page for Lara, a native Italian
language teacher offering 1:1 lessons. Static, single-page site built with
[Astro](https://astro.build).

Live at **https://alessandronocentini.github.io/Lara/**.

## Status

Deployed v1. Live on GitHub Pages, auto-deploying on every push to `main`.
Not yet content-complete (see
[What's deliberately missing](#whats-deliberately-missing) below).

## Getting started

Requires Node.js `>=22.12.0`.

```bash
npm install
npm run dev       # local dev server with hot reload
npm run build     # production build -> dist/
npm run preview   # serve the production build locally
```

## Deployment

`.github/workflows/deploy.yml` builds and deploys on every push to `main`
(and via manual `workflow_dispatch`): `withastro/action@v3` builds the site,
`actions/deploy-pages@v4` publishes it. The repo's **Settings → Pages →
Source** is set to "GitHub Actions" (a one-time repo setting, not something
in this codebase) — it used to default to the legacy Jekyll builder, which
doesn't run this workflow at all.

The build step pins `node-version: "22.12.0"` explicitly. **Don't remove
that pin** — `withastro/action` defaults to Node 20, which Astro 7 (this
project's version, see `package.json`) doesn't support; the deploy silently
breaks without it.

Because this is a GitHub Pages *project* page (not a user/org root page),
`astro.config.mjs` sets `base: '/Lara'` — the whole site is served under
`/Lara/...`, not domain root. This has one non-obvious consequence, see
`withBase()` below.

### `withBase()` — why every hardcoded image path must go through it

Image paths stored in `content/siteContent.json` are absolute, site-root
paths like `/images/lara_2.jpg`. Locally (`base: '/'` in dev) that resolves
fine, but in production it needs to become `/Lara/images/lara_2.jpg` — Astro
does this automatically for `src`/`href` attributes it controls (e.g. in
`<Image>` or a plain `<link>`), but **not** for paths read out of JSON at
render time or injected into CSS/JS.

`src/utils/baseUrl.ts` exports `withBase(path)`, which prefixes any
absolute `/`-rooted path with `import.meta.env.BASE_URL` (external
`http(s)://` URLs pass through unchanged). It's applied everywhere an
absolute path from `siteContent.json` (or a hardcoded asset path) gets
rendered: `PlaceholderImage.astro`, `CustomCursor.astro`, `SpritzTitle.astro`,
`Hero.astro` (the `backgroundImage` CSS `url()`), `Layout.astro` (favicon
`href`), and the admin editor's image previews (`src/pages/admin/index.astro`).

**If you add a new place that renders a `/`-rooted path from content (or
hardcodes one), route it through `withBase()` or it will 404 once
deployed** — it'll work fine in dev (where base-URL handling is more
forgiving) and only break in production, which is an easy trap.

## Architecture: one JSON file drives the page

The entire page's copy and content structure lives in
[`content/siteContent.json`](content/siteContent.json), typed by the
`SiteContent` interface in [`src/types/content.ts`](src/types/content.ts).
[`src/pages/index.astro`](src/pages/index.astro) imports that JSON once and
passes each section a typed slice of it as a `content` prop — components
never reach into the JSON themselves, and never hardcode copy.

**Why:** editing `siteContent.json` alone changes the rendered page — no
component code has to change for a copy/content edit. This is what makes the
`/admin` content editor (below) possible: it's just a form that reads and
writes this one file, with no code changes required for Lara to update her
own copy and photos. Editing the JSON by hand works too, and is the more
direct path for a developer.

Most `image`-type fields left as an empty string (`""`) render as a
"Photo coming soon" placeholder ([`PlaceholderImage.astro`](src/components/PlaceholderImage.astro))
instead of a broken `<img>` — so real photos can be dropped in later by
filling in a path, with no code change. The one exception is
`hero.backgroundImage`: it's applied as a CSS background (layered under a
translucent teal gradient in `Hero.astro`), not rendered through
`PlaceholderImage`, so an empty value there just means "no background image,"
not a visible placeholder.

`PlaceholderImage` also takes optional `frame` / `rotate` / `tapeColor` props
(all default off/unset, so existing callers are unaffected) that wrap the
image in a white polaroid-style card with a rotated washi-tape accent —
the "scrapbook" look inspired by `Ideas/style_1–3.jpeg`. It's applied to the
Hero, About, and Pain Points portraits (each its own rotation angle and tape
color — ocher/yellow/red respectively) and to the Results image (light blue
tape). `variant` picks the image's own shape independent of the frame:
`"portrait"` (3:4, used for the three "photo of Lara" spots — no circular
crop) or `"rounded"` (soft corners, no fixed ratio — used for Results' image,
whose aspect-ratio is set per-section to match its actual photo, and for
Method's card images, which don't use `frame`/`rotate`/`tapeColor` at all).
**Method's card images intentionally don't use the frame** — Method's cards
are a half-image/half-text layout from an earlier design pass, and
framing/rotating an image inside that layout would fight it rather than
complement it.

## Structure

```
content/siteContent.json   All page copy + structure (edited directly, or via /admin)
src/types/content.ts       TypeScript contract for siteContent.json (SiteContent)
src/pages/index.astro      Composes the page: Layout + one component per section
src/pages/admin/index.astro Content editor UI (see "Content editing" below)
src/layouts/Layout.astro   <html> shell, global CSS, Navbar, CustomCursor
src/components/            One component per page section (see below) + shared UI
src/scripts/githubClient.ts Browser-only GitHub Contents API client, used by /admin
src/utils/baseUrl.ts       withBase() — see "Deployment" above
src/styles/global.css      Design tokens (palette, type, spacing) as CSS custom properties
src/utils/markdown.ts      Renders markdown-flavored content fields (marked)
src/utils/highlightText.ts Splits a string into plain/highlighted parts (used by PainPoints)
.github/workflows/deploy.yml Builds and deploys to GitHub Pages on push to main
Ideas/                     Reference mockups that informed the design (see Ideas/README.md)
```

Page sections, in render order: Hero → About → PainPoints → Method → Results
→ Contact, each its own component in `src/components/`. Shared/non-section
components: `Navbar` (fixed nav), `CustomCursor`, `PlaceholderImage`,
`SectionKicker` (small rotated tab/sticker-style label, see below), and
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
- **`SectionKicker` labels are hardcoded, not content-driven** — a deliberate
  exception to this project's usual rule that components never hardcode
  copy. `SectionKicker` renders a small rotated sticker-style label
  (`label`/`color` props) above the `<h2>` in About, Method, Results, and
  Contact; each caller passes a literal string ("About", "Method", etc.)
  inline rather than reading it from `siteContent.json`. There is no
  `kicker` field in `SiteContent` — don't go looking for one. Hero skips it
  entirely since `hero.eyebrow` already fills that role from content.
  Treated as decoration (like the blob SVGs below), not editable copy.
- Soft, near-transparent background shapes — blob SVGs in About/Results, a
  faint Italy-outline watermark in Contact (reprising the Italy motif from
  `Ideas/hero_v2.jpeg`) — sit behind section content at `z-index: 0` with
  `pointer-events: none`. Both sections set `overflow: hidden` on their root
  so the (intentionally oversized/off-canvas) shapes can't cause horizontal
  page overflow. Purely decorative; safe to ignore when reasoning about
  content or layout.
- **`CustomCursor`** takes a `cursor: CursorAssets` prop (threaded from
  `index.astro` → `Layout.astro`) and renders three trailing marks, each
  48×48px: a spritz mark (no lag, leads), an ice cube (lag 0.13), and an
  orange slice (lag 0.09, trails furthest). All three now have real SVG
  art (`content/siteContent.json` → `cursor.spritzImage` / `iceImage` /
  `orangeSliceImage`, files in `public/images/`). Ice/orange-slice follow
  the empty-string-means-placeholder convention: empty falls back to an
  inline hand-drawn SVG, a path renders an `<img>`. Spritz has no SVG
  fallback — empty falls back to a 🍹 emoji instead. Disabled on touch
  devices and when `prefers-reduced-motion` is set. Source new cursor art
  square with a transparent background at roughly 128×128px (SVG
  preferred) — it displays at 48px, so this is comfortable headroom, not a
  tight crop.

No UI framework (no React/Vue/Svelte) and no CSS framework — plain Astro
components and hand-written CSS custom properties in `global.css`.

## Content editing: `/admin`

`/admin` (`src/pages/admin/index.astro`) is a hand-built form covering every
field in `SiteContent` — text/textarea inputs, image upload-and-preview
fields (with orientation hints like "Portrait photo, roughly 3:4 — shown
as-is, never cropped"), and add/remove list editors for `hero.socialLinks`,
`painPoints.questions`, `painPoints.highlightWords`, and `method.items`.

**This replaced an earlier plan to use Sveltia CMS with a Cloudflare Worker
OAuth broker.** That approach was scrapped before ever merging — it was more
infrastructure (a separate OAuth app + a deployed broker service) than a
single trusted editor (Lara) needs. If you find any reference to Sveltia,
Decap, or a CMS OAuth broker elsewhere, it's stale — the current editor is
entirely self-contained in this repo.

**Auth model:** paste a GitHub personal access token (fine-grained, scoped
to this repo, Contents read/write) into the login field. It's stored in
`localStorage` and sent directly to `api.github.com` from the browser via
`src/scripts/githubClient.ts` — no OAuth app, no server, no broker. This is
a deliberate simplification: the tradeoff is a standing credential sitting
in browser storage instead of a login flow, accepted because there's exactly
one editor and the token can be scoped/rotated/revoked from GitHub at will.
`githubClient.ts` is browser-only — it's imported from `/admin`'s
`<script type="module">`, never from server-rendered Astro frontmatter.

**Save flow:** re-fetches `content/siteContent.json` fresh right before
writing (avoids clobbering concurrent edits with stale data), uploads any
new photos to `public/images/` first (filenames get a timestamp suffix to
stay unique), then commits the updated JSON straight to `main`. There is no
draft or PR review step — saving publishes immediately, and the commit
triggers `deploy.yml` automatically.

## What's deliberately missing

These are known, intentional gaps — not oversights:

- **Contact form backend**: `Contact.astro`'s form is fully styled and
  interactive, but submission is still simulated client-side only — its
  submit handler just calls `preventDefault()` and toggles the success-state
  CSS class; no `fetch`/`action` call sends the data anywhere, so it's
  currently discarded. Web3Forms is the intended backend; not yet integrated.
- **Real photos and final copy**: `hero.backgroundImage` and 3 of the 6
  `method.items` images are still empty (rendering as placeholders or, for
  `backgroundImage`, no background at all); cursor art is done (see
  `CustomCursor` above). `results.intermediate` and `results.advanced` are
  still literal `"placeholder description"` text — `results.beginner` is
  real copy. `hero.socialLinks`' email entry is a placeholder `"#"` URL, not
  a real mailto/contact link.

## Reference material

[`Ideas/`](Ideas/README.md) holds the original mockup/screenshot images that
informed the design (hero concepts, method section, about section), plus a
few general visual-style references (`style_1–3.jpeg`, not Lara-specific
content) that inspired the scrapbook/polaroid decoration described above. It
predates most of the code and is kept for historical/design reference.
