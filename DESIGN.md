---
name: Thread
description: Native reading tools with local context, an Asscher gem and an optional gem-colored menu.
colors:
  native-dark-bg: "#0e1113"
  native-dark-panel: "#181c1f"
  native-dark-text: "#edf1f3"
  native-dark-muted: "#b4c1c8"
  native-dark-accent: "#5c93d7"
  native-dark-accent2: "#90baff"
  native-light-bg: "#ffffff"
  native-light-panel: "#f4f6f7"
  native-light-text: "#182126"
  native-light-muted: "#4e606a"
  native-light-accent: "#174c99"
  native-line: "#71828c"
  gem-bg: "#1e1410"
  gem-panel: "#2b1d16"
  gem-line: "#b17a58"
  gem-text: "#fff0e1"
  gem-muted: "#e5bfa6"
  gem-accent: "#c6350d"
  gem-accent2: "#ffb073"
  gem-focus: "#ffd0a3"
  gem-link: "#ffc18a"
  contrast-bg: "#000000"
  contrast-panel: "#111111"
  contrast-line: "#c8c8c8"
  contrast-text: "#ffffff"
  contrast-muted: "#dddddd"
  contrast-accent: "#252525"
  error-light: "#a51e22"
  error-dark: "#ffaaa6"
  selection-bg: "#203c61"
typography:
  menu:
    fontFamily: "\"Segoe UI\", system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.4
  title:
    fontFamily: "\"Segoe UI\", system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.3
  control:
    fontFamily: "\"Segoe UI\", system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.35
  context:
    fontFamily: "\"Segoe UI\", system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
  help:
    fontFamily: "\"Segoe UI\", system-ui, sans-serif"
    fontSize: "11px"
    lineHeight: 1.5
  subtitle:
    fontFamily: "\"Segoe UI\", system-ui, sans-serif"
    fontSize: "11px"
    lineHeight: 1.35
rounded:
  thumb: "2px"
  version: "4px"
  menu-control: "5px"
  context-control: "6px"
  menu: "7px"
  card: "8px"
spacing:
  tight: "4px"
  action-gap: "5px"
  row-gap: "6px"
  compact: "8px"
  standard: "10px"
  grid: "12px"
  card: "14px"
components:
  menu-button:
    backgroundColor: "{colors.native-dark-panel}"
    textColor: "{colors.native-dark-text}"
    rounded: "{rounded.menu-control}"
    padding: "5px 8px"
    typography: "{typography.control}"
  menu-input:
    backgroundColor: "{colors.native-dark-panel}"
    textColor: "{colors.native-dark-text}"
    rounded: "{rounded.menu-control}"
    padding: "6px"
  menu-navigation:
    backgroundColor: "{colors.native-dark-panel}"
    textColor: "{colors.native-dark-text}"
    rounded: "{rounded.menu-control}"
    padding: "5px 3px"
    typography: "{typography.control}"
  switch-off:
    backgroundColor: "{colors.native-dark-panel}"
    rounded: "{rounded.menu-control}"
    width: "34px"
    height: "24px"
    padding: "0"
  switch-on:
    backgroundColor: "{colors.native-dark-accent}"
    rounded: "{rounded.menu-control}"
    width: "34px"
    height: "24px"
    padding: "0"
  reading-card:
    rounded: "{rounded.card}"
    padding: "14px"
  context-popover:
    backgroundColor: "{colors.native-dark-bg}"
    textColor: "{colors.native-dark-text}"
    rounded: "{rounded.menu}"
    padding: "14px"
    width: "350px"
---

# Design System: Thread

## Overview

**Creative North Star: "Reading stays on the page"**

Thread extends the approved native-style reading world: quiet neutral surfaces, readable system sans, blue interaction cues, compact settings and local context beside native content. The selected T1 Asscher identifies THREAD with the owned orange faceted gem in assets/thread-gem.svg; keep its clipped-square geometry free of letters or pictograms. The existing optional palette is still named Pear Crystal in the runtime. Sole product authorship is expDARE.

The default menu follows native site colors with light/dark fallbacks. The optional gem menu theme adds warm dark surfaces and orange accents only to THREAD menu and notice surfaces. It starts off. This document captures an established implementation, not a replacement visual identity.

**Key Characteristics:**

- Native reading content remains central.
- Rectangular switches and rounded rectangular controls.
- Readable text across spacing presets.
- Secondary settings disclose in place.

## Colors

Frontmatter owns the extracted values. Native tokens are fallback values, not a mandate to override Reddit's own semantic colors. The menu reads native background, panel, text and muted CSS properties when supported, while interaction accents follow the implemented light/dark selection. Page context controls have their own dark blue fallback through the context stylesheet; do not conflate it with the menu's checked-track accent.

### Primary

- **Reading Blue:** native menu checked tracks and interaction emphasis; the lighter dark accent supplies focus/selection cues.
- **Pear Orange:** gem checked tracks. **Peach Facet** supplies secondary emphasis; **Pale Peach** is explicit focus and **Warm Link** is link text.

### Neutral

- **Native Ink / Native Paper:** site-aware menu and context backgrounds, with quiet contrasting panels and strong readable foregrounds.
- **Control Slate:** native separators; fields and buttons use muted foreground borders in the compact Core menu.
- **Crystal Umber / Warm Panel:** optional gem backgrounds; **Copper Line**, **Ivory Text** and **Peach Muted** provide structural and text roles.
- **High Contrast:** black canvas, near-black panels, white text/focus and strong gray borders remain a distinct selectable menu palette when the gem switch is off.
- Error colors belong to errors; selection background belongs to context text selection.

**The Menu Scope Rule.** Gem colors affect THREAD menus and notices only; page content and other suite products retain their own appearance.

## Typography

The source stack is Segoe UI, system-ui, sans-serif. The frontmatter records actual Core menu, title, control, context, help and subtitle roles. Menu titles use semibold; ordinary settings use regular weight. No display face or new font resource is introduced.

Content font defaults to (14px), configurable from (12–24px); context UI defaults to (12px), configurable from (12–18px). Native content otherwise retains native typography. Title-first List rows use (16px) with (1.4) line height. Menu-size preferences keep their body/small font settings stable while changing width and spacing.

**The Readable Density Rule.** Tighten spacing rather than shrinking reading text.

## Layout

Use the bundled compact Core menu, not preview-specific panel dimensions. Its size presets are Compact (304px, default), Standard (324px) and Mini (280px). Content padding is respectively (8px), (10px), (6px); row padding (6px), (8px), (4px); common control minimum height (30px), (32px), (28px). Core's lean workspace uses an (88px) navigation column and a shrinkable content column. THREAD setting rows pair a shrinkable label with a control capped at (48%) or a (34px) switch column. Disclosures expand within the scrolling menu body; content maximum height is viewport-relative with contained overscroll.

Cards and Grid use bordered rounded cards with the card spacing/radius tokens. Grid fits columns with a (260px) target minimum constrained to available width and the grid gap token. Compact Cards use (8px) padding and cap text/media height at (180px). List uses title-first rows, optional (96px by 72px) thumbnail bounds and preserved metadata/actions. Native is the initial default; the four content views are user choices.

Content-width settings range from (320–1600px), initially (800px), and remain capped to the container. Context styling removes horizontal offset at (600px) and below. Coarse pointers raise page context buttons/fields/selects to a (36px) minimum; this is not proof of mobile-web usability. Parent and local-record popovers use viewport-minus-(24px) bounds and internal scrolling. The media surface likewise stays viewport-contained.

The single shared suite gem straddles the right edge of Reddit's left navigation rail, (8px) below the native collapse handle when its slot is clear. Native links and buttons retain their hit targets; the slot can slide down to clear a collision. The menu opens adjacent to the rail when it fits, below the launcher/flyout on narrow windows, or within the viewport in very short windows. Collapsed, missing and narrow rails retain a reachable top-left fallback. Coordinates clamp within (8px) viewport margins. This site docking applies only on modern www.reddit.com or sh.reddit.com with THREAD present; other-site placement stays unchanged and there is no second launcher. Rail size observation, page mutation invalidation, scroll and resize keep placement current, including while the shared flyout is open. These geometry rules come from owned Core runtime.js (redditSlot and placeMenu), not from the original illustrative preview.

## Elevation & Depth

Reading tools stay flat with structural one-pixel borders. The Core menu, notices and context popover share a restrained shadow (`0 4px 10px #0003`). Media uses a dark translucent backdrop (`#000c`) with a dark viewing surface. Do not import unused bundled Core presentation styles as a new visual vocabulary.

Menu layout transitions are disabled in the lean layer. Page context rules remove transitions and smooth scrolling under reduced motion. Preserve the runtime's existing interaction states rather than adding ornamental motion.

## Shapes

Use the frontmatter's observed corner roles: near-square thumbs, slightly softened version badges and menu controls, context controls, menu/popover frames and cards. Switches are rectangular (34px by 24px) with rectangular thumbs (12px by 16px), offset (3px), travelling (14px). The explicit native-site exception is the rail launcher: a circle sized to Reddit's native handle, normally 32px. Flyout product tiles keep their existing shape. There are no pill controls or checkbox settings.

## Components

### Core menu and navigation

Reuse the actual owned Core menu, launcher and notice runtime. Follow the shared Core sidebar template: Feed, Read, Filters, People, Look and System are primary sections. System reuses grouped Status, Support, settings transfer and Reset; Support and Reset are disclosures inside System, without separate navigation shortcuts. The header heart opens the suite donation control, separate from troubleshooting. The THREAD title, version and selected Asscher gem retain their existing compact hierarchy. Secondary settings remain native disclosures. Descriptions use selective Core hover/focus help contained within the menu. Keep the header visible and scroll the content pane. The version button opens the themed Core changelog notice and toggles it closed on repeat activation. Missing release/install destinations stay hidden; public issue reporting remains unavailable until a real repository exists.

### Buttons, fields and switches

Menu action buttons use rounded rectangular panel fills and muted borders. Core navigation selected state mixes the secondary accent (13%) into the panel, with an accent focus border. Focus-visible is a (2px) outline offset (2px) across buttons, fields and summaries; gem uses its explicit focus color. THREAD uses real button switches with role=switch and aria-checked. Checked tracks use the active accent and a background-colored thumb; unchecked tracks use the panel and muted thumb. Preserve both states' contrast when changing palettes.

Page context buttons use their own context styling: minimum (32px) height, context-control corners and (5px 8px) padding. Their links remain underlined; disabled controls reduce opacity to (.6). Input forms and local-record disclosures retain labels, wrapping and narrow containment. Sidecar examples illustrate the real appearance and states; they do not replace bundled Core behavior.

### Reading, context and media

Local tools sit beside native content. Treated content retains a reveal path; local labels/notes remain distinct from native account writes. Navigation marks loaded content without implying unloaded comments were searched. Popovers and media include explicit dismiss controls and viewport containment. Preserve focus restoration, editor-safe shortcuts and native spoiler/security gates in runtime changes. Own context/media overlays pause comment read exposure; closing an overlay restarts the full visibility interval rather than counting time obscured by that overlay.

## Do's and Don'ts

### Do:

- Do preserve native foreground/background pairs and visible focus.
- Do keep the gem theme optional, off by default and limited to THREAD menu/notice surfaces.
- Do reuse the bundled Core launcher, menu, menu-size controls and notice components.
- Do preserve one shared launcher, native rail controls and reachable viewport fallbacks.
- Do keep native actions, metadata, flair and spoiler gates available across views.
- Do label authored fixtures and distinguish local annotations from native server actions.

### Don't:

- Don't introduce pill controls or checkboxes.
- Don't recolor the page or other products with the gem theme.
- Don't replace the selected gem with letters, pictograms or new artwork.
- Don't infer live Reddit, installed Vivaldi, mobile-web or long-session validation from fixtures.
- Don't treat a limited switch correction verdict as whole-product approval.


Evidence boundary: earlier menu/launcher evidence is recorded in ../local-verification/thread-menu-fix-20261020/REPORT.txt; later runtime refinement evidence is in ../local-verification/thread-refinement-20261020/. The selected artwork there is T1 Asscher for Thread and D1 split purple/graphite Brilliant for Dropper. Native desktop account components and feed wrappers were observed in the prior live audit; source now addresses identity recognition, wrapped content views and reduced navigation controls. Current captures and recorded checks use authored fixtures and do not verify the installed candidate. Prior native feed-action visibility and parent-preview findings remain outside this change. Thread remains a local prototype without a Git/public repository; account switching is deferred. No installed or whole-product acceptance is implied. The existing sidecar still contains the older gem-identity narrative and is preserved pending a separately scoped refresh; token frontmatter and palette names are unchanged.
