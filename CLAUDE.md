## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Landing Page Architecture

`src/pages/index.astro` composes the one-page site from section components, in this order: Hero → PainPoints → Method → Results → Testimonials → About → Contact. About sits just before Contact by design (it reads better as a "who's behind this" beat right before the CTA, rather than as a second impression right after Hero). Testimonials renders nothing (no `<section>` at all) when `content.testimonials.items` is empty, so the section can be emptied out via the admin editor without leaving a gap in the page or the nav.

Sections no longer show a small "eyebrow" pill above their `<h2>` — `Services.astro`, `Testimonials.astro`, `About.astro`, and `Contact.astro` each render only their real heading now. `SectionKicker.astro` still exists as a component but nothing imports it; it was kept in case the pattern is wanted again rather than deleted outright.

`Method.astro` is a single `<section id="method">` (one nav-dock/scroll-spy entry, same as before) split into two visually distinct halves via `MethodContent` (`src/types/content.ts`: `{ title, introSubtitle, introText, stepsLabel, steps, lessonsSubtitle, items }` — no markdown fields, so the component no longer imports `renderMarkdown`):

- `.method-intro-block`: teal gradient background (same treatment as `Contact.astro`), white text, two-column layout. Left column stacks `<h2 class="method-title">` (deliberately sized with the same `clamp(1.8rem, 3.5vw, 2.6rem)` as PainPoints' heading, for visual consistency between the two sections), a yellow `<p class="method-subtitle">`, the intro paragraph, and `<p class="method-steps-label">` (moved here from above the bubble list). The right column holds only `<ul class="method-steps">` (the bubble list, unlabeled). Because the bubbles now sit on a teal background instead of white, `.method-step`/its `::after` tail use `var(--color-white)` for the border instead of `var(--color-teal)` — a teal border would have nearly disappeared against teal.
- `.method-lessons-block`: white background, centered `<h3 class="method-lessons-subtitle">` above the unchanged 6-card `.method-grid`.

The admin editor's Method fieldset (`src/pages/admin/index.astro`) mirrors this flatter shape with separate inputs for `method.title`, `method.introSubtitle`, `method.introText`, `method.stepsLabel`, and `method.lessonsSubtitle`, alongside the existing repeatable `methodItems`/`methodSteps` lists — no new JS was needed since scalar fields go through the generic `populateScalarFields`/`readScalarFields` path.

`Testimonials.astro`'s card is a speech-bubble treatment matching the original `Ideas/testimonials.jpg` mockup: each `.testimonial-card` is a flex row where a small avatar (`.testimonial-avatar`, ~4.5rem) overlaps the left edge of a rounded `.testimonial-bubble` via negative margin, with a CSS-triangle `::before` as the bubble's "tail". (An earlier attempt on this branch tried a large background-silhouette treatment instead — abandoned in favor of the bubble, don't resurrect it.)

- Review text is clamped to 3 lines (`-webkit-line-clamp: 3`) with a "Read more" button that toggles `.is-expanded` to lift the clamp and grow the card ("Show less" to re-collapse). An inline `<script>` compares each card's `scrollHeight`/`clientHeight` on load and hides the toggle entirely when a review doesn't actually overflow 3 lines, so short reviews never show a pointless button.
- The same script also redirects vertical wheel input on `.testimonials-row` into horizontal scrolling (`row.scrollLeft += event.deltaY`, with `preventDefault()`), since the row is a horizontally-scrolling strip and requiring shift+scroll or a scrollbar drag to browse it would be unintuitive.

### Navigation: left-edge icon dock

`src/components/Navbar.astro` is a fixed vertical dock of circular icon buttons pinned to the left viewport edge (not a traditional top bar) — one button per page section, including `pain-points` ("Struggles"). There is no logo/brand element; the Home icon is considered sufficient wayfinding, so don't re-add a logo without discussing it first.

- Idle state: white circle, teal icon. Hover: inverts to teal circle/white icon and slides out a text label.
- The active section is tracked with a from-scratch `IntersectionObserver` in an inline `<script>` inside `Navbar.astro` (rootMargin `-40% 0px -40% 0px`, so a section counts as "active" once it crosses the middle 20% of the viewport). The observed section IDs (`sectionIds`) and the nav `links` array are both hardcoded in `Navbar.astro` and must be kept in the same order the sections actually render in `index.astro` — they previously drifted (`about` was listed 2nd despite rendering near the end); current order is hero, pain-points, method, results, testimonials, about, contact.
- `--navbar-height` in `src/styles/global.css` is a leftover custom property from the old top-bar layout; it's unused now that nav is a side dock (no scroll-padding-top compensation is needed), but is still defined for potential reuse.

### Icon components

Two components share one convention — an inline SVG wrapper (`viewBox 0 0 24 24`, `stroke=currentColor`, path fragments injected via `set:html`) keyed by a string prop through a `Record<string, string>` lookup, with a safe fallback if the key is unrecognized:

- `SocialIcon.astro` — keyed by social platform (`platform` prop): instagram, facebook, whatsapp, tiktok, email, website.
- `NavIcon.astro` — keyed by section id (`section` prop): hero, about, pain-points, method, results, testimonials, contact.

When adding a new social platform or page section, add its SVG fragment to the relevant component's `icons` map rather than creating a new icon component.

Testimonial avatars are a deliberately separate, simpler convention — don't fold them into the `set:html` pattern above:

- `TestimonialAvatar.astro` renders one of three inline SVGs (originally `public/images/testimonial_{male,female,other}.svg`) keyed by each testimonial's `gender` enum, using `fill="currentColor"` so the avatar tracks `--color-primary-dark` via a `color:` CSS property set on `.testimonial-avatar` in `Testimonials.astro` — this is what makes the avatars respond to admin color changes instead of staying a hardcoded hex baked into the SVG file.
- Its sizing CSS in `Testimonials.astro` uses `:global(.testimonial-avatar)` rather than a plain scoped selector, because Astro's scoped-style hashing doesn't cross into a child component's own template. Keep this in mind for any future child-component pattern — a plain (non-`:global`) selector targeting a child component's root element silently does nothing.
- These are fixed placeholder avatars, not user-uploaded photos — `gender` is a closed 3-value enum edited via a `<select>` in the admin editor (same UI pattern as the social-platform select), so there's no upload/`pendingUploads` handling for this field.

### No more polaroid photo treatment; photos are flat cutouts

`PlaceholderImage.astro` only supports `src`/`alt`/`variant`/`class` — the earlier `frame`/`rotate`/`tapeColor` props and their CSS (photo-frame card, tape `::before`) are gone. All photo assets across the site are transparent-background cutouts now, shown as plain images sized by each caller's own wrapper class (`.hero-portrait`, `.pain-points-portrait`, `.results-image`, `.about-photo`) — don't reintroduce a card/tape frame without discussing it first.

- `About.astro` is a full-bleed 2-column split: `.about-inner` is a grid (deliberately NOT wrapped in `.container`, so the photo spans full viewport width) with `.about-photo` (the image, forced to `width/height:100%; object-fit:cover; border-radius:0` via a `:global(.placeholder-image)` override, filling the section via `min-height: 40rem` on `.about-inner`) and `.about-copy` (wrapped in `.container`, keeps normal section padding). Collapses to one column with a fixed `aspect-ratio: 4/5` photo at ≤800px.
- `Results.astro`'s image previously cropped because `.results-image { aspect-ratio: 4/3 }` fought `PlaceholderImage`'s base `object-fit:cover`. Fixed by dropping that aspect-ratio and adding `.results-image :global(.placeholder-image) { height:auto; aspect-ratio:auto; }` — scoped to Results only; the shared `.rounded` variant itself never forced an aspect-ratio.
- Headings across `Services`, `Results`, `Testimonials`, `Contact`, and `About` all use the same `clamp(1.8rem, 3.5vw, 2.6rem)` as Pain Points/Method, for site-wide consistency.
- `PainPoints.astro` and `Results.astro` each declare their background explicitly (`--color-cream` / `--color-white`) instead of inheriting the body background, to break up a run of same-colored sections.

### Italy silhouette: one shared asset, two placements

`public/images/italy.svg` (a white Italy-outline silhouette) is used as a plain `<img>` in two places — there is no more hand-drawn `<svg>` doodle:

- `Hero.astro`: `.hero-italy`, absolutely positioned background overlay at `opacity: 0.5`.
- `Contact.astro`: `.contact-italy`, sized to the file's real ~0.83:1 aspect ratio (`14.5rem × 17.4rem`).

`HeroContent.backgroundImage` / `--hero-bg-image` (the old configurable hero background photo, including its admin editor field) was removed entirely — Hero's background is now just the solid gradient plus this silhouette overlay.

### The 3-color brand system — read this before touching any color

The entire palette is derived from exactly 3 admin-editable tokens. **Never hardcode a 4th brand color or a raw hex value in a component** — if you need a new tone, add it as a `color-mix()` derived token in `:root` (`src/styles/global.css`) so it inherits admin edits automatically.

- Base tokens: `--color-primary`, `--color-secondary`, `--color-tertiary` (plus the fixed `--color-white`). Everything else is derived once in `:root`, e.g. `--color-primary-dark` (80% primary/black), `--color-primary-light` (35% primary/white), `--color-secondary-light` (65% secondary/white — used for accents that used to be "yellow": Hero's eyebrow, Method's subtitle/steps-label), `--color-cream` (6% **secondary**/white — deliberately derived from secondary, not primary), `--color-ink` (40% primary/black — body text is deliberately primary-tinted, not neutral grey), `--color-ink-soft` (70% primary/black). `--shadow-soft`/`--shadow-lift` are also `color-mix()` expressions so shadows track the live palette instead of being hardcoded `rgb()`.
- The 3 base values live in content, not CSS: `SiteMeta` (`src/types/content.ts`) has `primaryColor`/`secondaryColor`/`tertiaryColor` (replacing an old single `themeColor`), seeded in `content/siteContent.json`. `src/layouts/Layout.astro` injects them as real custom properties via an inline `style` attribute on `<html>` (`--color-primary:${meta.primaryColor}; ...`) — inline style always wins the cascade, so this overrides the `:root` defaults, and every derived token recomputes automatically since they all reference these same var names. `<meta name="theme-color">` reads `primaryColor` directly.
- The admin editor's Site Info fieldset exposes 3 `<input type="color">` pickers (`meta.primaryColor`/`secondaryColor`/`tertiaryColor`) — required no new JS, since scalar fields already go through the generic populate/read path.
- Every component was mechanically renamed from the old ~10-color palette (`--color-teal`, `--color-yellow`, `--color-ocher`, `--color-red`, etc.) to the new var names. `CustomCursor.astro`'s ice/orange-slice fallback illustrations got the same var renames but are decorative and exempt from strict brand-contrast rules. Actual multi-color illustration image files (cursor sprites, hero brand mark) were left untouched — they keep their natural hues regardless of the brand tokens.
