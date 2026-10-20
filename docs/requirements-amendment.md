# Thread implementation amendments — 2026-10-20

The preserved behavior-only v3 spec remains the scope input. This note records subsequent direct user requirements and implementation boundaries; it contains no third-party enhancement implementation material.

- Product name **Thread**, suite header **THREAD**, internal ID `thread`.
- Selected icon **Pear Crystal**, approved owned option6 SVG. Plain orange faceted gem; no inset letter or pictogram.
- Four content views: **Cards**, **Compact Cards**, **Grid**, and recommended **List**. List uses title-first rows with optional small thumbnails; metadata/actions remain. Defaults persist, explicit selection overrides the current route, and responsive grid columns fit available width. Native view remains the initial default so installation does not force a feed layout.
- Optional **Use gem menu theme** switch in Look, **off by default**. Warm dark surfaces and facet colors are limited to Thread's menu/notices/version surfaces. Disable restores the normal selected native/site-aware menu theme. The preference is validated and survives reload; missing/invalid/older settings do not enable it. SHIFT page themes and other suite menus stay independent.
- Deliver actual built-menu captures of gem theme OFF and ON after build/tests pass, same viewport/Look section/fixture. Label synthetic evidence. This does not authorize installation or publication.
- The Thread entry point sits at the top-right edge of Reddit's left navigation rail, immediately below the native collapse handle. Use the owned gem/shared suite opener, not any enhancement application's gear or source. Open the menu beside that anchor, with contained below-anchor placement on narrow windows. Collapsed/missing rails retain a reachable top-left fallback. Preserve native controls, SPA/resize behavior, keyboard focus and one shared launcher/flyout with the other suite products. Other sites and Reddit without Thread retain their prior placement. Refresh theme OFF/ON captures after verifying this follow-up.

API identity/authentication/enrichment remain unavailable until legitimate independent access exists. Account switching remains deferred. No commit, push, tag, release, publication or installed-userscript change is authorized.
