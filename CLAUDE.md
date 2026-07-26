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

- `Testimonials.astro` picks one of three static files (`public/images/testimonial_male.svg`, `_female.svg`, `_other.svg`) via a `Record<string, string>` lookup keyed by each testimonial's `gender` enum, and renders it as a normal `<img src>`.
- These are fixed placeholder avatars, not user-uploaded photos — `gender` is a closed 3-value enum edited via a `<select>` in the admin editor (same UI pattern as the social-platform select), so there's no upload/`pendingUploads` handling for this field.
