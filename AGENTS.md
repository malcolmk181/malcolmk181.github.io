# AGENTS.md

This is Malcolm Keyes' personal GitHub Pages site (`malcolmk181.github.io`), served
directly from the `main` branch with no build step.

## Commit messages

Always use Conventional Commits format (e.g. `fix: ...`, `feat: ...`, `chore: ...`, `docs: ...`) for commit message subject lines.

## Repository guidance

### Goal

Serve small, fast, accessible pages directly from GitHub Pages. Favor the web platform over abstractions.

### Default approach

- Use plain semantic HTML, modern CSS, and vanilla JavaScript.
- Do not add a framework, package manager, build step, or third-party runtime dependency without explicit user approval and a concrete need.
- Prefer one self-contained HTML file for a small standalone tool. Split out files only when genuine reuse, size, or maintainability makes that simpler.
- Prefer native elements and browser APIs over reimplementing them. Use `<details>`, `<dialog>`, popovers, native forms, and ES modules when appropriate.
- Target Baseline Widely Available features. Treat newer features as progressive enhancements with a usable fallback.
- Keep pages functional when JavaScript fails; features that inherently require JavaScript must fail clearly and preserve navigation/content access.
- Before building a new tool, search this repository for a proven pattern worth reusing.

### Browser-native tool patterns

- Treat paste, copy-to-clipboard, local file selection, and generated downloads as useful first-class input/output options.
- Process user files locally in the browser when possible; do not upload data merely to transform it.
- Put small, non-sensitive, shareable state in the URL. Use local storage only for larger non-sensitive convenience state, and provide a clear reset control.
- Never embed, persist, or request reusable secrets or API keys in client-side code or browser storage.
- Fetch only public CORS-enabled APIs from the browser, and handle offline, rate-limit, permission, and API errors clearly.
- If an approved dependency is justified, use a browser-ready file from a trusted CDN, pin an exact version, and document why it is needed. Never use an unversioned or `latest` URL.

### HTML and accessibility

- Target WCAG 2.2 AA.
- Set `lang`, charset, viewport, a unique title, and a useful meta description on every page.
- Use landmarks, one `<main>`, logical headings, and a keyboard-visible skip link.
- Use links for navigation and buttons for actions. Label every form control and give images appropriate `alt` text.
- Preserve keyboard operation, visible focus, sufficient contrast, comfortable touch targets, zoom/reflow, and reduced-motion preferences.
- Use ARIA only when native HTML cannot express the needed semantics or state.

### CSS and responsive design

- Start mobile-first; verify layouts at 320 CSS pixels and at wide desktop sizes.
- Prefer Grid, Flexbox, container queries, logical properties, and fluid sizing over device detection or many fixed breakpoints.
- Avoid fixed heights for content and avoid horizontal page scrolling.
- Keep focus and controls visible when using sticky or overlay UI.
- Always support both light and dark mode. Default to the browser/OS preference via `prefers-color-scheme`, and always provide a visible control to override it.
- Write pages to be e-reader friendly: size all text in `rem`/`em` (never fixed `px` for readable text), keep a comfortable line length (roughly 45-75 characters, e.g. a ~40rem content column), and use line-height around 1.5 or more.

### Shared theme stylesheet

Every page includes the shared stylesheet right after the accessibility widget script:

```html
<script src="/assets/a11y-widget.js"></script>
<link rel="stylesheet" href="/assets/theme.css">
```

Like the accessibility widget, this is a sanctioned shared-file exception (genuine reuse, not a framework): it defines the color tokens (`--bg`, `--fg`, `--muted`, `--accent`, `--surface`, `--border`) and base rules (`body`, `a`, `h1`, `p`, `main`, `.skip-link`) once instead of per page. A page's own `<style>` block should only hold page-specific layout, using `var(--token)` for color and overriding shared rules (e.g. `main { padding-top: ... }`) only when it genuinely needs to differ.

Each color is defined once with `light-dark(lightValue, darkValue)`, not duplicated across an `@media (prefers-color-scheme: dark)` block and `:root[data-theme="light"|"dark"]` overrides — `color-scheme: light dark` on `:root` (overridden to `light`/`dark` by the accessibility widget's `data-theme` attribute) is what `light-dark()` reads, and `color-scheme` is inherited, so this also covers the accessibility widget's own injected UI without it needing to duplicate colors either. Don't reintroduce the old triplicated pattern — add new tokens to `theme.css` the same `light-dark()` way.

### Accessibility settings widget

Every page includes the shared accessibility widget (theme + text size) via a single blocking script tag near the top of `<head>`:

```html
<script src="/assets/a11y-widget.js"></script>
```

This is the one sanctioned shared-file exception to "prefer one self-contained HTML file": the widget is genuinely reused across every page, so it lives once at `assets/a11y-widget.js` instead of being copy-pasted. Everything else about a page should still stay self-contained unless there's a similarly concrete reuse case.

The widget applies theme and text size before first paint (avoiding a flash of the wrong setting), then injects a floating "Accessibility" button that opens a `<dialog>` with theme (system/light/dark) and text-size (small/normal/large/x-large) controls, persisted to `localStorage`.

For a page to work correctly with it:

- Include `/assets/theme.css` (see above) so colors respond to the `data-theme` attribute the widget sets.
- Size text in `rem`/`em` so the text-size control actually resizes it.
- Use the root-absolute path `/assets/a11y-widget.js` (not a relative path) since this repo is a user site served at `/`, not a project site under a subpath.

### Site structure

- `index.html` is the home page. It links to `/tools/` (the tools landing page) via a `<nav aria-label="Primary">`.
- `/tools/index.html` is the tools landing page: a searchable, sortable list of every tool page. Each tool is one `<li class="tool-item">` with `data-name`, `data-category`, and `data-order` attributes (see the comment in that file for the exact markup and what `data-order` means). The list renders fully in plain HTML — the search box and sort `<select>` are a JS-only enhancement on top, so the list of tools/links is still there and usable with JavaScript disabled.
- Individual tools live at `tools/<slug>.html`, each a self-contained single file per the default approach above. Add a matching `<li>` entry to `/tools/index.html` when adding a tool.
- Every page other than the home page includes a `<nav aria-label="Breadcrumb">` near the top with a link back to `/` (see `/tools/index.html` for the pattern).

### Performance

- Ship no JavaScript on pages that do not need it. Use `type="module"` and load feature code only where used.
- Avoid third-party scripts, large font families, icon fonts, and autoplaying media.
- Prefer system fonts or a small self-hosted WOFF2 subset.
- Use responsive images, modern formats where useful, intrinsic `width`/`height`, and lazy loading below the fold. Do not lazy-load the primary above-the-fold image.
- Prevent layout shifts and keep the initial network payload deliberately small.

### GitHub Pages constraints

- The deployed site is static: never expose secrets or assume server-side code exists.
- Use path-relative internal links and assets so project sites under `/<repository>/` work correctly.
- Prefer real HTML files over client-side routing, and maintain a useful `404.html`.
- Use HTTPS URLs for all external resources.

### Before finishing

- Check for broken links, missing assets, console errors, and invalid markup.
- Test keyboard-only use, focus order, 200% zoom, narrow and wide layouts, reduced motion, and JavaScript-disabled behavior where applicable.
- Run available accessibility and Lighthouse checks, but do not treat automated scores as proof of accessibility.
- Keep changes focused; do not add tooling or refactor unrelated pages.
