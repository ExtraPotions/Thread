<p align="center"><img src="assets/thread-gem.svg" width="128" height="128" alt="Thread icon"></p>

# Thread for Reddit

**Your Reddit, refined.**

[![Install Thread for Reddit](docs/badges/install.svg)](https://github.com/ExtraPotions/Thread/releases/latest/download/thread.user.js)
[![Code: PolyForm Noncommercial 1.0.0](docs/badges/code.svg)](LICENSE-CODE.md)
[![Artwork and documentation: CC BY-NC-SA 4.0](docs/badges/assets.svg)](LICENSE-ASSETS.md)

## Latest changes

- Use compact filters and open collection-management fields only when needed.
- Import account data together with preserved backups and clear save failures.
- Apply suite pause immediately without keyboard or layout bypasses.

## Get started

1. Install a userscript manager such as [Violentmonkey](https://violentmonkey.github.io/get-it/) or [Tampermonkey](https://www.tampermonkey.net/).
2. [Install Thread for Reddit](https://github.com/ExtraPotions/Thread/releases/latest/download/thread.user.js) and confirm in your userscript manager.
3. Refresh modern Reddit and open the Thread gem below the left navigation rail's collapse handle. With other ExtraPotions products installed, they share one launcher: open it and choose Thread.

## What you can do

- **Choose your layout:** keep Reddit's Native view or use Cards, Compact Cards or Grid. On feeds, the view picker and Thread's feed buttons sit in Reddit's own sort row, so posts start where they normally do; other pages keep a separate strip. Cards keep Reddit's whole-image media frames, Grid packs cards of different heights into up to four readable columns without empty gaps, and switching views fades in briefly unless your device asks for reduced motion. Saved List preferences use Compact Cards. Cards and Grid set Reddit's own View menu to Card and Compact Cards sets it to Compact, so posts arrive with the right media; the feed reloads once when that changes. Choosing Compact or Card in Reddit's View menu switches Thread to match.
- **Read media comfortably:** use thumbnail previews in Compact Cards and open full media when you want it. Opened images and embedded players fit the post width while keeping the original player controls.
- **Filter your feed:** hide, dim or blur matching posts and comments with reversible local rules, or a whole community with **Filter r/…** in a post's actions menu. Manage community filters in **Feed → Community filters**.
- **Skip the blur:** turn on **Feed → Unblur spoilers** or **Unblur mature media**. Mature media unblurs only where Reddit already shows it to your signed-in account.
- **Make room for posts:** collapse Reddit's right sidebar with the handle at its edge, like the left navigation rail. The feed widens into the free space, and your choice is remembered.
- **Keep private notes:** add local author tags, notes and nicknames. Personal records stay paused when your account cannot be identified reliably.
- **Navigate discussions:** jump between loaded comments, return to a reading position and track unread comments when local read tracking is enabled. Jump targets do not filter comments or search unloaded replies.
- **Keep a local reading library:** save posts and comments into collections with private notes, search, rename and removal Undo. Your local library is separate from Reddit Saved.
- **Browse fresh posts:** optionally mark read posts, hide them and undo the last read change.
- **Tune your reading:** choose Reddit, Comfortable, Dense or Book typography in **Look → Reading style**.
- **Choose the menu look:** pick Reddit, High contrast or Gem in **Look → Menu theme**. Gem uses Thread's orange palette for the menu and notices.

Compact Cards shows thumbnail-and-text rows with two-line previews and a **Thread actions** disclosure. Promoted posts use Reddit's own compact layout. Full media stays collapsed until you tap the thumbnail (**Open media**) or Reddit's existing expand control. Opened images and players keep their full readable layout.

In Compact Cards and Grid, and in every view on touch devices, open **Thread actions** with the small icon button at the right end of the post's voting/share row. It matches the native button size and opens a menu list without resizing the card. On narrow Grid cards with many native buttons, the row wraps and the icon stays at the right on a second line. Posts without a native action row show the icon at the end of the post.

In Compact Cards on tablet-width feeds, the vote, comment and share row sits beside the thumbnail, so rows with a thumbnail stay short. On phone widths the row spans the post below the thumbnail. Reddit continues to place native actions in its own overflow menu when they do not fit.

Native galleries retain Reddit's slide sizing and navigation. **View media** shows one image per gallery slide in order, without feed thumbnails or decorative background copies.

Previews recover when Reddit refreshes a post or loads its media later. Hide, blur and collapse also apply to media previews. **Close media** pauses native audio/video; embedded providers keep their own playback controls.

Use **Save to collection** in Thread actions, or beside a comment. Open **Local collections** beside the view picker or **Read → Local collections** to manage up to 500 bookmarks. Settings export/import includes this library; private notes stay in your local userscript storage until you export them.

Set **Feed → Read posts** to **Mark** to mark posts when opening them or using **Mark read**, or **Mark and hide** to also hide them. **Show read posts** and **Undo read change** stay beside the view picker. Read markers expire after 30 days.

On discussion pages, use **Next top-level thread**, **Next sibling comment** or **Collapse / expand loaded replies** while keeping the parent available. **Search loaded comments** outlines matching comments and offers Previous/Next; hidden, collapsed, gated and unloaded content is excluded.

With a recognized account, Thread can return you to a loaded post and its screen offset when you come back to a feed. It respects an already-restored browser position and stops after a bounded wait if the saved post is unavailable. It does not load missing feed pages.

Account switching and Reddit API enrichment are unavailable. See [development](docs/development.md) for supported behavior and verification limits.

## See it in action

<table>
  <tr>
    <td width="50%" valign="top" align="center"><a href="docs/screenshots/cards-ipad.png"><img src="docs/screenshots/cards-ipad.png" width="220" alt="Thread: Cards with full media at iPad portrait size"></a><br><strong>Cards on iPad</strong></td>
    <td width="50%" valign="top" align="center"><a href="docs/screenshots/compact-ipad.png"><img src="docs/screenshots/compact-ipad.png" width="220" alt="Thread: Compact Cards with thumbnail rows at iPad portrait size"></a><br><strong>Compact Cards on iPad</strong></td>
  </tr>
</table>

Screenshots use sample content.

<a href="docs/screenshots/header-actions-ipad.png"><img src="docs/screenshots/header-actions-ipad.png" width="660" alt="Thread: Thread actions menu open from the native-sized icon at the right end of the post action row on iPad"></a>

<table>
  <tr>
    <td width="50%" valign="top" align="center"><a href="docs/screenshots/collections-ipad.png"><img src="docs/screenshots/collections-ipad.png" width="220" alt="Thread: local collections with search and editable bookmarks on iPad"></a><br><strong>Local collections</strong></td>
    <td width="50%" valign="top" align="center"><a href="docs/screenshots/reading-presets-ipad.png"><img src="docs/screenshots/reading-presets-ipad.png" width="220" alt="Thread: reading typography on iPad"></a><br><strong>Reading styles</strong></td>
  </tr>
</table>

![Thread Look menu at iPad dimensions](docs/screenshots/menu-look-ipad.gif)

Layout captures use iPad portrait and landscape dimensions with touch emulation. They show the built userscript on authored sample pages, not an installed iPad browser.

All ExtraPotions menus share the same Core template. Open **System** for status, diagnostics, troubleshooting and Reset. Donations remain in the header heart.

## Support

[Support development](https://ko-fi.com/expdare). Donations are optional. All features remain available without donating.

## License

**Code:** [PolyForm Noncommercial License 1.0.0](LICENSE-CODE.md)<br>
**Artwork and documentation:** [CC BY-NC-SA 4.0](LICENSE-ASSETS.md)

Thread is an independent project and is not affiliated with or endorsed by Reddit.
