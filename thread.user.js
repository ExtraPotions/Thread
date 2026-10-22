// ==UserScript==
// @name         Thread for Reddit
// @namespace    expDARE.ExtraPotions.THREAD
// @version      0.2.3
// @description  Your Reddit, refined. Reading, layout and local personal context for modern Reddit.
// @author       expDARE
// @license      PolyForm-Noncommercial-1.0.0
// @icon         https://raw.githubusercontent.com/ExtraPotions/Thread/main/assets/thread-gem.svg
// @homepageURL  https://github.com/ExtraPotions/Thread
// @supportURL   https://github.com/ExtraPotions/Thread/issues
// @updateURL    https://github.com/ExtraPotions/Thread/releases/latest/download/thread.user.js
// @downloadURL  https://github.com/ExtraPotions/Thread/releases/latest/download/thread.user.js
// @match        https://www.reddit.com/*
// @match        https://sh.reddit.com/*
// @match        https://old.reddit.com/*
// @run-at       document-idle
// @noframes
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_addValueChangeListener
// @grant        GM_removeValueChangeListener
// @grant        GM_xmlhttpRequest
// @connect      api.github.com
// ==/UserScript==

(()=>{
"use strict";
// Native exp-core foundation. Shared UI primitives are owned and maintained here.
const CoreFoundation = (() => {
const LAUNCHER_ORDER_KEY = "exp:v3:launcher-order";
const LAUNCHER_GRID_DELTA_KEY = "exp:v3:launcher-grid-delta";
const PRIDE_RAINBOW = "linear-gradient(90deg,#c84e66,#d07840,#be9f37,#3b8a5f,#3d79a6,#7455a4)";

const PRIDE_RAINBOW_VERTICAL = "linear-gradient(180deg,#c84e66,#d07840,#be9f37,#3b8a5f,#3d79a6,#7455a4)";

const CRIMSON_THEME = Object.freeze({ id:"crimson", name:"Crimson", swatch:"linear-gradient(135deg,#0c0508 0 38%,#941f2f 38% 69%,#2f746e 69% 100%)", canvas:"#0c0508", surface:"#1d090f", primary:"#941f2f", companion:"#5e2144", counterpoint:"#2f746e", interactive:"#b63243", bg:"#0c0508", panel:"#1d090f", line:"#4a1b28", text:"#e5d2d7", muted:"#ae8b94", accent:"#941f2f", accent2:"#b63243", skin:"linear-gradient(135deg,#941f2f 0%,#5e2144 52%,#2f746e 100%)", skinVertical:"linear-gradient(180deg,#941f2f 0%,#5e2144 52%,#2f746e 100%)" });

const UI_THEMES = Object.freeze([
    { id:"ember", name:"Ember", swatch:"linear-gradient(135deg,#120807 0 38%,#c9512c 38% 69%,#b68a32 69% 100%)", canvas:"#120807", surface:"#24100c", primary:"#c9512c", companion:"#8f2d3f", counterpoint:"#b68a32", interactive:"#e16a3b", bg:"#120807", panel:"#24100c", line:"#4e2a22", text:"#f1ddd2", muted:"#b99787", accent:"#c9512c", accent2:"#e16a3b", skin:"linear-gradient(135deg,#c9512c 0%,#8f2d3f 52%,#b68a32 100%)", skinVertical:"linear-gradient(180deg,#c9512c 0%,#8f2d3f 52%,#b68a32 100%)" },
    { id:"midnight", name:"Midnight", swatch:"linear-gradient(135deg,#050a12 0 38%,#3563a3 38% 69%,#348f8b 69% 100%)", canvas:"#050a12", surface:"#0c1726", primary:"#3563a3", companion:"#65558f", counterpoint:"#348f8b", interactive:"#477abd", bg:"#050a12", panel:"#0c1726", line:"#26364b", text:"#d4deeb", muted:"#91a2b7", accent:"#3563a3", accent2:"#477abd", skin:"linear-gradient(135deg,#3563a3 0%,#65558f 52%,#348f8b 100%)", skinVertical:"linear-gradient(180deg,#3563a3 0%,#65558f 52%,#348f8b 100%)" },
    { id:"glacier", name:"Glacier", swatch:"linear-gradient(135deg,#061216 0 38%,#4a9eaa 38% 69%,#92b85b 69% 100%)", canvas:"#061216", surface:"#0d252a", primary:"#4a9eaa", companion:"#5c76a4", counterpoint:"#92b85b", interactive:"#67b7c1", bg:"#061216", panel:"#0d252a", line:"#29464b", text:"#d8ebee", muted:"#8fa9ae", accent:"#4a9eaa", accent2:"#67b7c1", skin:"linear-gradient(135deg,#4a9eaa 0%,#5c76a4 52%,#92b85b 100%)", skinVertical:"linear-gradient(180deg,#4a9eaa 0%,#5c76a4 52%,#92b85b 100%)" },
    { id:"contrast", name:"High contrast", swatch:"linear-gradient(135deg,#000000 0 48%,#ffffff 48% 78%,#ffd400 78% 100%)", canvas:"#000000", surface:"#0a0a0a", primary:"#ffffff", companion:"#bfbfbf", counterpoint:"#ffd400", interactive:"#ffd400", bg:"#000000", panel:"#0a0a0a", line:"#ffffff", text:"#ffffff", muted:"#e0e0e0", accent:"#ffffff", accent2:"#ffd400", skin:"linear-gradient(135deg,#ffffff 0%,#bfbfbf 55%,#ffd400 100%)", skinVertical:"linear-gradient(180deg,#ffffff 0%,#bfbfbf 55%,#ffd400 100%)" },
    { id:"verdant", name:"Verdant", swatch:"linear-gradient(135deg,#06110d 0 38%,#318c61 38% 69%,#2f7f86 69% 100%)", canvas:"#06110d", surface:"#0d2218", primary:"#318c61", companion:"#667c3c", counterpoint:"#2f7f86", interactive:"#49a879", bg:"#06110d", panel:"#0d2218", line:"#28483a", text:"#d7e9df", muted:"#93aa9e", accent:"#318c61", accent2:"#49a879", skin:"linear-gradient(135deg,#318c61 0%,#667c3c 52%,#2f7f86 100%)", skinVertical:"linear-gradient(180deg,#318c61 0%,#667c3c 52%,#2f7f86 100%)" },
    { id:"pride", name:"Pride", swatch:"linear-gradient(135deg,#c84e66 0%,#d07840 16.6%,#be9f37 33.3%,#3b8a5f 50%,#3d79a6 66.6%,#7455a4 100%)", canvas:"#100a12", surface:"#1d1222", primary:"#c34f7d", companion:"#7555a6", counterpoint:"#328c82", interactive:"#dd6793", bg:"#100a12", panel:"#1d1222", line:"#4a2b50", text:"#f0ddea", muted:"#b89db4", accent:"#c34f7d", accent2:"#dd6793", skin:PRIDE_RAINBOW, skinVertical:PRIDE_RAINBOW_VERTICAL },
    { id:"twitch", name:"Twitch", swatch:"linear-gradient(135deg,#18181b 0 48%,#9147ff 48% 78%,#bf94ff 78% 100%)", canvas:"#111114", surface:"#19191e", primary:"#9147ff", companion:"#772ce8", counterpoint:"#bf94ff", interactive:"#bf94ff", bg:"#111114", panel:"#19191e", line:"#34343b", text:"#efeff1", muted:"#adadb8", accent:"#9147ff", accent2:"#bf94ff", skin:"linear-gradient(135deg,#9147ff,#bf94ff)", skinVertical:"linear-gradient(180deg,#9147ff,#bf94ff)", skinMode:"flat" },
    { id:"dropper", name:"Dropper gem", swatch:"linear-gradient(135deg,#0b0713 0 38%,#7a46c8 38% 69%,#2a8c9b 69% 100%)", canvas:"#0b0713", surface:"#171025", primary:"#7a46c8", companion:"#b14589", counterpoint:"#2a8c9b", interactive:"#9864dc", bg:"#0b0713", panel:"#171025", line:"#3c2850", text:"#e8ddf2", muted:"#aa98bb", accent:"#7a46c8", accent2:"#9864dc", skin:"linear-gradient(135deg,#7a46c8 0%,#b14589 52%,#2a8c9b 100%)", skinVertical:"linear-gradient(180deg,#7a46c8 0%,#b14589 52%,#2a8c9b 100%)" }
  ]);
const SHARED_UI_THEMES = Object.freeze(UI_THEMES.slice(0, 6));

// A support control carries these styles into native and custom Shadow DOM shells.
function supportControlCss() {
    return `
      .support-wrap { position:static; }
      .support-button {
        width:30px; height:30px; min-width:30px; padding:0;
        border:1px solid #3a3a42; border-radius:8px; background:#151519; color:#b8b8c0;
        cursor:pointer;
      }
      .support-button { box-sizing:border-box; display:grid; place-items:center; }
      .support-button svg { width:15px; height:15px; fill:currentColor; }
      .support-button:hover,
      .support-button:focus-visible {
        border-color:var(--theme-accent); color:var(--theme-accent2); background:#211b2b; outline:none;
      }
      .support-popover {
        position:absolute; z-index:14; top:35px; right:0;
        width:min(190px,100%); max-width:100%;
        box-sizing:border-box; padding:8px 9px;
        border:1px solid color-mix(in srgb,var(--theme-accent) 46%,var(--theme-line));
        border-radius:9px; background:var(--theme-panel); color:var(--theme-text);
        box-shadow:0 10px 28px #0009;
      }
      .support-popover[hidden] { display:none; }
      .support-popover strong { display:block; margin-bottom:3px; font-size:var(--exp-font-size-small,11px); }
      .support-popover span { display:block; color:var(--theme-muted); font-size:var(--exp-font-size-small,11px); line-height:1.35; }
      .support-popover a {
        display:flex; align-items:center; justify-content:center; min-height:26px; margin-top:7px; padding:0 9px;
        border:1px solid color-mix(in srgb,var(--theme-accent) 58%,var(--theme-line));
        border-radius:7px; background:color-mix(in srgb,var(--theme-panel) 76%,var(--theme-accent) 24%);
        color:var(--theme-text); text-decoration:none; font-size:var(--exp-font-size-small,11px); font-weight:800;
      }
      .support-popover a:hover,
      .support-popover a:focus-visible {
        border-color:var(--theme-accent2); outline:none;
        background:color-mix(in srgb,var(--theme-panel) 66%,var(--theme-accent) 34%);
      }
    `;
}

function css() {
    return `
      :host { all: initial; --exp-font-size-small:11px; --exp-font-size-body:13px; }
      * { box-sizing: border-box; }
      small { font-size:var(--exp-font-size-small,11px); }
      .exp-core-theme {
        position: fixed; right: 12px; z-index: 2147483600;
        display: flex; flex-direction: column-reverse; align-items: flex-end;
        width: max-content; max-width: calc(100vw - 24px); gap: 8px;
        --theme-bg:#111114; --theme-panel:#19191e; --theme-raised:#2a2a31; --theme-inset:#0e0e10; --theme-line:#34343b; --theme-text:#efeff1; --theme-muted:#adadb8; --theme-accent:#9147ff; --theme-accent2:#bf94ff; --theme-link:#c6a4ff; --theme-focus:#bf94ff; --theme-onAccent:#111114; --theme-skin:linear-gradient(135deg,#d9b5ff,#9b5af9,#7428e8); --theme-skin-vertical:linear-gradient(180deg,#d9b5ff,#9b5af9,#7428e8); --exp-ui-opacity:1; --exp-menu-width:260px;
        font: 13px/1.42 ui-sans-serif, system-ui, "Segoe UI", sans-serif; color: var(--theme-text);
      }
      .exp-core-theme.open-up { flex-direction: column; }
      [data-exp-part="dock"],
      .update-notice {
        opacity:var(--exp-ui-opacity,1);
        transition:opacity .15s ease;
      }
      .exp-core-theme [data-exp-part="dock"],
      .exp-core-theme > .update-notice[data-placement="menu"] {
        width:min(var(--exp-menu-width,260px), calc(100vw - 24px));
      }

      .progress-age { color:#a7a7b0; }
      .progress-age.warn { color:#f59e0b; }
      .progress-age.bad { color:#ef4444; font-weight:800; }
      /* 3.2.0 progress panel */
      .exp-core-theme{pointer-events:none!important}
      .exp-core-theme :is([data-exp-part="dock"],.update-notice,[data-exp-part="launcher"]){pointer-events:auto!important}
      .exp-core-theme .badge-row{position:fixed!important;min-height:112px!important;height:auto!important;justify-content:flex-end!important;align-items:center!important;pointer-events:none!important}

      .badge-row {display:flex!important;flex-wrap:nowrap!important;align-items:center!important;gap:8px!important;width:100%!important;min-height:112px!important;height:auto!important;position:relative!important}

      [data-exp-part="launcher"] {
        position:relative; width:48px; min-width:48px; height:48px; min-height:48px; align-self:flex-end; padding:0; margin:0;
        display:grid; place-items:center; border:1px solid color-mix(in srgb,var(--theme-accent) 30%,transparent); border-radius:10px;
        background:var(--theme-panel,#18181b); box-shadow:0 6px 22px #0006; cursor:grab; touch-action:none; user-select:none;
        transition:.14s border-color,.14s box-shadow,.14s background,.14s transform;
      }
      .action-separator{grid-column:1/-1;width:100%;border:0;border-top:1px solid var(--theme-line,#34343b);margin:8px 0 0}
      .stream-subsection-label{grid-column:1/-1;min-width:0;margin:1px 0 2px;color:var(--theme-accent2);font-size:var(--exp-font-size-small,11px);font-weight:900;line-height:1.2;letter-spacing:.08em;text-transform:uppercase}
      .stream-subsection-label.with-divider{margin-top:7px;padding-top:8px;border-top:1px solid var(--theme-line,#34343b)}
      .queue-switches{display:grid;grid-template-columns:minmax(58px,.7fr) minmax(0,1.3fr);column-gap:10px;row-gap:0;min-width:0;margin:6px 0;padding:2px 0;border:0;align-items:stretch}
      .queue-switches-label{grid-column:1;grid-row:1/span 3;display:flex;align-items:center;min-width:0;font-size:var(--exp-font-size-body,13px);font-weight:700;line-height:1.2;color:var(--theme-text,#efeff1)}
      .queue-switches>.fl-switch{grid-column:2;display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:space-between!important;gap:10px;min-width:0;padding:5px 0!important;text-align:left!important}
      .queue-switches>.fl-switch>span:first-child{display:block;flex:1 1 auto;width:auto!important;min-width:0!important;min-height:0!important;white-space:normal!important;word-break:normal!important;overflow-wrap:normal!important;line-height:1.25;text-align:left}
      .queue-switches>.fl-switch>.toggleSwitch{flex:0 0 34px;margin-left:auto}
      .appearance-separator{grid-column:1/-1;width:100%;border:0;border-top:1px solid var(--theme-line,#34343b);margin:3px 0 1px}
      .opacity-row{grid-column:1/-1;display:grid;grid-template-columns:auto minmax(72px,1fr) auto;align-items:center;gap:6px;min-width:0;padding:4px 0;border-top:1px solid #26262b}
      .opacity-row[hidden]{display:none!important}
      .opacity-row>span{font-size:var(--exp-font-size-body,13px);line-height:1.25;white-space:nowrap}
      [data-exp-part="opacity-range"]{width:100%;min-width:0;accent-color:var(--theme-accent)}
      [data-exp-part="opacity-value"]{min-width:34px;text-align:right;font-size:var(--exp-font-size-small,11px);font-weight:800;color:var(--theme-muted)}

      [data-exp-part="launcher"]:hover {
        border-color:color-mix(in srgb,var(--theme-accent) 58%,transparent);
        background:color-mix(in srgb,var(--theme-panel,#18181b) 96%,var(--theme-accent) 4%);
        box-shadow:0 8px 24px #0007; transform:scale(1.015);
      }
      [data-exp-part="launcher"][aria-expanded="true"] {
        border-color:color-mix(in srgb,var(--theme-accent) 72%,transparent);
        background:var(--theme-panel,#18181b);
        box-shadow:0 0 0 1px color-mix(in srgb,var(--theme-accent) 22%,transparent),0 8px 26px #0008;
        transform:scale(1.01);
      }
      [data-exp-part="launcher"].is-dragging {
        cursor:grabbing; transform:scale(1.03); box-shadow:0 10px 28px #0009;
      }
      [data-exp-part="launcher"].update-available::after {
        content:"↑"; position:absolute; top:-4px; right:-4px; width:14px; height:14px; display:grid; place-items:center;
        border:2px solid var(--theme-panel,#18181b); border-radius:4px; background:#f59e0b; color:#111114; font-size:var(--exp-font-size-small,11px); font-weight:950;
        box-shadow:0 2px 6px #0007; z-index:4; pointer-events:none;
      }
      [data-exp-part="launcher"] .ring { position:absolute; top:50%; left:50%; width:44px; height:44px; pointer-events:none; transform:translate(-50%,-50%); }
      [data-exp-part="launcher"] .track { fill:none; stroke:color-mix(in srgb,var(--theme-line,#34343b) 72%,transparent); stroke-width:2.5; }
      [data-exp-part="launcher"] .fill { fill:none; stroke:var(--theme-accent,#9147ff); stroke-width:2.5; stroke-linecap:round; transition:.2s stroke; }
      [data-exp-part="launcher"] .icon { position:absolute; top:50%; left:50%; width:40px; height:40px; pointer-events:none; z-index:1; transform:translate(-50%,-50%); }
      [data-exp-part="dock"] {
        position:fixed; right:12px; top:auto; bottom:auto;
        display:none; width:min(var(--exp-menu-width,260px), calc(100vw - 24px)); max-width:calc(100vw - 24px);
        height:max-content; min-height:0; max-height:none; overflow-x:hidden; overflow-y:auto; overscroll-behavior:contain; flex:0 0 auto;
        transition:.15s width;
        padding:9px 9px 4px; background:var(--theme-bg); border:1px solid var(--theme-line); border-radius:14px; box-shadow:0 18px 50px #0008; color-scheme:dark;
      }
      [data-exp-part="dock"].fl-rail-open { display:block; height:max-content; min-height:0; max-height:none; }
      [data-exp-part="dock"]:focus { outline:none; }
      [data-exp-part="dock"] :is(.fl-tool-body,.row,.group,.section,.fl-tool-title) { min-width:0; max-width:100%; overflow-wrap:anywhere; }
      [data-exp-part="dock"] :is(input,select,textarea) { min-width:0; max-width:100%; }
      [data-exp-part="dock"] :is(option,optgroup) { background:var(--theme-panel) !important; color:var(--theme-text) !important; }
      .menu-head {
        position:relative;
        display:grid; grid-template-columns:minmax(0,1fr) auto;
        align-items:start; gap:8px; width:100%;
      }
      .header-actions { display:flex; align-items:flex-start; gap:5px; position:static; }
      [data-exp-part="close"] {
        width:30px; height:30px; min-width:30px; padding:0;
        border:1px solid #3a3a42; border-radius:8px; background:#151519; color:#b8b8c0;
        cursor:pointer;
      }
      ${supportControlCss()}
      .header-brand {
        display:grid; grid-template-columns:38px minmax(0,1fr);
        align-items:center; gap:8px; min-width:0; width:100%;
      }
      .header-icon {
        box-sizing:border-box; width:38px; height:38px; display:grid; place-items:center;
        border:1px solid color-mix(in srgb,var(--theme-accent) 48%,var(--theme-line));
        border-radius:9px; background:var(--theme-panel);
        box-shadow:inset 0 0 0 1px color-mix(in srgb,#000 22%,transparent);
      }
      .header-icon .menu-icon { width:38px; height:38px; display:block; }
      .header-copy { min-width:0; overflow:hidden; }
      .header-title-row { display:flex; align-items:center; gap:6px; min-width:0; flex-wrap:wrap; }
      [data-exp-part="title"] { margin:0; font-size:15px; font-weight:800; line-height:1.1; }
      [data-exp-part="version"] {
        min-height:18px; padding:1px 6px; border:1px solid #4a3b61; border-radius:5px;
        background:#1b1721; color:#c9a7ff; cursor:pointer; font:800 var(--exp-font-size-small,11px)/1 ui-sans-serif,system-ui,sans-serif;
        white-space:nowrap;
      }
      [data-exp-part="version"]:hover,
      [data-exp-part="version"]:focus-visible {
        border-color:#9147ff; background:#251d31; color:#fff; outline:none;
      }
      [data-exp-part="subtitle"] {
        margin-top:2px; font-size:var(--exp-font-size-small,11px); line-height:1.2; color:#adadb8;
        white-space:normal; overflow-wrap:anywhere;
      }
      [data-exp-part="close"] { font:18px/1 Arial,sans-serif; }
      [data-exp-part="close"]:hover,
      [data-exp-part="close"]:focus-visible { border-color:#9147ff; color:#fff; background:#211b2b; outline:none; }
      .header-divider { height:1px; width:100%; margin:5px 0; background:linear-gradient(90deg,transparent,#9147ff88 50%,transparent); }
      .update-notice {
        position:fixed; display:block; width:100%; max-width:calc(100vw - 24px); margin:0; padding:10px;
        box-sizing:border-box;
        border:1px solid color-mix(in srgb,var(--theme-accent) 62%,var(--theme-line)); border-radius:10px;
        background:
          linear-gradient(
            180deg,
            color-mix(in srgb,var(--theme-panel) 88%,var(--theme-accent) 12%),
            var(--theme-bg) 76%
          );
        color:var(--theme-text);
        box-shadow:0 10px 28px #0008; z-index:12;
      }
      .update-notice[hidden] { display:none; }
      .update-head { display:flex; align-items:flex-start; justify-content:space-between; gap:10px; padding-right:22px; }
      .update-heading { min-width:0; }
      .update-kicker { margin-bottom:2px; color:var(--theme-accent2); font-size:var(--exp-font-size-small,11px); font-weight:900; letter-spacing:.08em; text-transform:uppercase; }
      .update-title { font-size:var(--exp-font-size-body,13px); line-height:1.25; font-weight:850; color:var(--theme-text); }
      .update-version {
        flex:none; padding:2px 6px;
        border:1px solid color-mix(in srgb,var(--theme-accent) 62%,var(--theme-line));
        border-radius:5px;
        background:color-mix(in srgb,var(--theme-panel) 82%,var(--theme-accent) 18%);
        color:var(--theme-text);
        font-size:var(--exp-font-size-small,11px); font-weight:800; white-space:nowrap;
      }
      .update-text { margin-top:6px; font-size:var(--exp-font-size-small,11px); line-height:1.45; color:var(--theme-muted); white-space:normal; overflow:visible; }
      .update-list { margin:7px 0 0; padding:0 0 0 15px; max-height:86px; overflow:auto; color:var(--theme-text); font-size:var(--exp-font-size-small,11px); line-height:1.4; scrollbar-width:thin; }
      .update-list li::marker { color:var(--theme-accent); }
      .update-list li + li { margin-top:3px; }
      .update-footer { display:flex; justify-content:flex-end; gap:6px; margin-top:8px; padding-top:7px; border-top:1px solid var(--theme-line); }
      .update-action,
      .update-release,
      .update-dismiss,
      .life-btn {
        border:1px solid var(--theme-line); border-radius:7px;
        background:var(--theme-bg); color:var(--theme-text); cursor:pointer;
      }
      .update-action,
      .update-release { min-height:27px; padding:0 10px; font-size:var(--exp-font-size-small,11px); font-weight:800; }
      .update-action { display:inline-flex; align-items:center; justify-content:center; text-decoration:none; }
      .update-action[hidden],
      .update-release[hidden] { display:none; }
      .update-action {
        border-color:var(--theme-accent);
        background:color-mix(in srgb,var(--theme-panel) 68%,var(--theme-accent) 32%);
        color:var(--theme-text);
      }
      .update-release {
        border-color:color-mix(in srgb,var(--theme-line) 78%,var(--theme-accent) 22%);
        background:var(--theme-panel);
        color:var(--theme-text);
      }
      .update-dismiss {
        position:absolute; top:7px; right:7px; width:23px; height:23px; padding:0;
        border-color:transparent; background:transparent; color:var(--theme-muted); font-size:15px; line-height:1;
      }
      .update-action:hover,
      .update-action:focus-visible,
      .update-release:hover,
      .update-release:focus-visible,
      .update-dismiss:hover,
      .update-dismiss:focus-visible,
      .life-btn:hover {
        border-color:var(--theme-accent);
        color:var(--theme-text);
        outline:none;
      }
      .update-action:hover,
      .update-action:focus-visible {
        background:color-mix(in srgb,var(--theme-panel) 55%,var(--theme-accent) 45%);
      }
      .update-release:hover,
      .update-release:focus-visible {
        background:color-mix(in srgb,var(--theme-panel) 88%,var(--theme-accent) 12%);
      }
            .exp-core-theme[data-theme-skin="gradient"] .update-notice {
        border:1px solid transparent;
        background-image:linear-gradient(var(--theme-panel),var(--theme-panel)),var(--theme-skin);
        background-origin:border-box;
        background-clip:padding-box,border-box;
      }
      .exp-core-theme[data-theme-skin="gradient"] .update-version,
      .exp-core-theme[data-theme-skin="gradient"] .update-action {
        border-color:transparent;
        background-image:linear-gradient(var(--theme-panel),var(--theme-panel)),var(--theme-skin);
        background-origin:border-box;
        background-clip:padding-box,border-box;
      }
      .toast { margin-bottom:7px; padding:6px 8px; border:1px solid #34343b; border-radius:8px; background:#18181b; color:#efeff1; font-size:var(--exp-font-size-small,11px); box-shadow:0 8px 24px #0006; }
      .toast[hidden] { display:none; }
      .fl-tool-panel { position:relative; margin-top:5px; border:1px solid #27272d; background:#19191e; border-radius:9px; overflow:visible; }
      .fl-tool-header { display:flex; justify-content:space-between; align-items:flex-start; height:auto; min-height:0; padding:7px 8px; cursor:pointer; border-radius:8px; }
      .fl-tool-header:hover { background:#9147ff18; }
      .fl-tool-header.last-opened { box-shadow:inset 3px 0 0 #b783ff; }
      .fl-tool-title { min-width:0; flex:1; font-size:var(--exp-font-size-body,13px); font-weight:700; white-space:normal; overflow-wrap:anywhere; }
      .fl-tool-chevron { background:none; border:0; color:#adadb8; cursor:pointer; }
      .fl-tool-body { padding:0 10px 8px; }
      .fl-tool-body:not(.fl-tool-hidden) { display:grid; height:auto; min-height:0; max-height:none; overflow:visible; grid-template-columns:repeat(2,minmax(0,1fr)); align-items:stretch; column-gap:8px; }
      .exp-core-theme .fl-tool-body:not(.fl-tool-hidden) { grid-template-columns:minmax(0,1fr); }
      .exp-core-theme .fl-tool-body:not(.fl-tool-hidden) > * { grid-column:1/-1; }
      .fl-tool-body > :is(.fl-switch,.mini-row,.life-btn) { min-width:0; }
      .fl-tool-body > :is(.diag) { grid-column:1/-1; }
      .fl-tool-hidden { display:none !important; }
      .fl-switch,
      .mini-row { display:flex; align-items:flex-start; justify-content:space-between; gap:10px; height:auto; min-height:0; padding:6px 0; }
      .fl-switch + .fl-switch,
      .mini-row + .mini-row { border-top:1px solid #26262b; }
      .fl-switch-text,
      .mini-row > span {
        min-width:0;
        font-size:var(--exp-font-size-body,13px);
        line-height:1.25;
        white-space:normal;
        word-break:normal;
        overflow-wrap:break-word;
        hyphens:none;
      }
      .toggleSwitch {
        position:relative; box-sizing:border-box; flex:none; width:34px; height:20px;
        border:1px solid color-mix(in srgb,var(--theme-line) 88%,var(--theme-muted) 12%);
        border-radius:6px;
        background:color-mix(in srgb,var(--theme-bg) 84%,var(--theme-panel) 16%);
        box-shadow:inset 0 1px 0 rgba(255,255,255,.018);
        cursor:pointer;
        transition:.15s background,.15s border-color;
      }
      .toggleSwitch::after {
        content:""; position:absolute; top:2px; left:2px; width:14px; height:14px;
        box-sizing:border-box; border:0; border-radius:4px;
        background:color-mix(in srgb,var(--theme-muted) 82%,var(--theme-text) 18%);
        box-shadow:none;
        transition:.15s transform,.15s background;
      }
      .toggleSwitch[aria-checked="true"] {
        border-color:color-mix(in srgb,var(--theme-line) 52%,var(--theme-accent) 48%);
        background:color-mix(in srgb,var(--theme-panel) 72%,var(--theme-accent) 28%);
      }
      .toggleSwitch[aria-checked="true"]::after {
        transform:translateX(14px);
        background:var(--theme-text);
      }
      .life-btn { width:100%; min-height:28px; margin-top:6px; font-size:var(--exp-font-size-body,13px); }
      .life-btn.last-opened { box-shadow:inset 3px 0 0 #b783ff; }
      .select-lite { min-width:0; max-width:72px; background:#111114; color:#efeff1; border:1px solid #34343b; border-radius:6px; padding:4px 6px; font-size:var(--exp-font-size-body,13px); }
      .auth-required {
        grid-column:1/-1;
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:8px;
        margin-top:6px;
        padding:7px 8px;
        border:1px solid color-mix(in srgb,#f59e0b 46%,var(--theme-line));
        border-radius:7px;
        background:color-mix(in srgb,var(--theme-panel) 84%,#f59e0b 16%);
        color:#ffe5a8;
        font-size:var(--exp-font-size-small,11px);
        font-weight:800;
      }
      .auth-required[hidden] { display:none !important; }
      .auth-required .life-btn {
        width:auto;
        min-width:112px;
        margin:0;
        flex:0 0 auto;
      }
      .auth-advanced { margin-top:2px; border:1px solid var(--theme-line); border-radius:7px; background:var(--theme-inset); padding:6px 8px; }
      .auth-advanced > summary { cursor:pointer; list-style:none; color:var(--theme-muted); font-size:var(--exp-font-size-body,13px); font-weight:600; user-select:none; }
      .auth-advanced > summary::-webkit-details-marker { display:none; }
      .auth-advanced[open] > summary { margin-bottom:6px; color:var(--theme-text); }
      .auth-advanced-body { display:flex; flex-direction:column; gap:6px; }
      .auth-hint { color:var(--theme-muted); font-size:var(--exp-font-size-small,11px); line-height:1.35; }
      .auth-input { width:100%; min-height:30px; border:1px solid var(--theme-line); border-radius:6px; background:var(--theme-inset); color:var(--theme-text); padding:6px 8px; font-size:var(--exp-font-size-body,13px); }
      .auth-input:focus { outline:2px solid var(--theme-focus); outline-offset:2px; border-color:var(--theme-focus); }
      .theme-row { grid-column:1/-1; display:flex; align-items:center; justify-content:space-between; gap:10px; min-height:28px; padding:6px 0; font-size:var(--exp-font-size-body,13px); }
      .exp-theme-swatch{box-sizing:border-box!important;flex:0 0 22px!important;width:22px!important;height:22px!important;min-width:22px!important;min-height:22px!important;max-width:22px!important;max-height:22px!important;padding:0!important;border-radius:5px!important}
      .exp-theme-swatches { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
      .exp-theme-swatch { appearance:none; width:18px; height:18px; min-width:18px; padding:0; border:2px solid var(--theme-line); border-radius:4px; box-sizing:border-box; cursor:pointer; }
      .exp-theme-swatch.is-on { border-color:var(--theme-text); box-shadow:0 0 0 2px var(--theme-accent); }
      .fl-tool-panel { border-color:var(--theme-line); background:var(--theme-panel); }
      .fl-tool-body { border-color:var(--theme-line); background:var(--theme-bg); color:var(--theme-text); }
      .select-lite,
      .life-btn { border-color:var(--theme-line); background:var(--theme-raised); color:var(--theme-text); }
      .exp-core-theme a { color:var(--theme-link); }
      .fl-tool-chevron,
      [data-exp-part="subtitle"] { color:var(--theme-muted); }
      .exp-core-theme[data-ui-theme="contrast"] .toggleSwitch { border:2px solid #fff; background:#050505; }
      .exp-core-theme[data-ui-theme="contrast"] .toggleSwitch::after { top:0; left:0; border:1px solid #050505; background:#fff; }
      .exp-core-theme[data-ui-theme="contrast"] .toggleSwitch[aria-checked="true"] { background:#fff; border-color:#fff; }
      .exp-core-theme[data-ui-theme="contrast"] .toggleSwitch[aria-checked="true"]::after { background:#050505; border-color:#fff; transform:translateX(14px); }
      @media (forced-colors: active) {
        .toggleSwitch { forced-color-adjust:none; border:1px solid CanvasText; background:Canvas; }
        .toggleSwitch::after { border-color:CanvasText; background:CanvasText; }
        .toggleSwitch[aria-checked="true"] { border-color:Highlight; background:Highlight; }
        .toggleSwitch[aria-checked="true"]::after { border-color:HighlightText; background:HighlightText; }
      }
            .exp-core-theme[data-theme-skin="gradient"] [data-exp-part="dock"]:not([data-exp-menu-layout="lean"]) {
        border:1px solid transparent !important;
        background-origin:border-box !important;
        background-clip:padding-box, border-box !important;
        background-image:linear-gradient(var(--theme-bg),var(--theme-bg)),var(--theme-skin) !important;
      }
      .exp-core-theme[data-theme-skin="gradient"] [data-exp-part="launcher"] {
        border-color:color-mix(in srgb,var(--theme-accent) 30%,transparent) !important;
        background:var(--theme-panel) !important;
        background-image:none !important;
      }
      .exp-core-theme[data-theme-skin="gradient"] [data-exp-part="launcher"]:hover {
        border-color:color-mix(in srgb,var(--theme-accent) 58%,transparent) !important;
        background:color-mix(in srgb,var(--theme-panel) 96%,var(--theme-accent) 4%) !important;
        background-image:none !important;
      }
      .exp-core-theme[data-theme-skin="gradient"] [data-exp-part="launcher"][aria-expanded="true"] {
        border:1px solid transparent !important;
        background-image:linear-gradient(var(--theme-panel),var(--theme-panel)),var(--theme-skin) !important;
        background-origin:border-box !important;
        background-clip:padding-box,border-box !important;
      }
      .exp-core-theme[data-theme-skin="gradient"] [data-exp-part="version"] {
        border:1px solid var(--theme-line);
        background:var(--theme-bg);
        color:var(--theme-text);
        border-radius:6px;
      }
      .exp-core-theme[data-theme-skin="gradient"] [data-exp-part="version"]:hover,
      .exp-core-theme[data-theme-skin="gradient"] [data-exp-part="version"]:focus-visible {
        border-color:transparent;
        background-image:linear-gradient(var(--theme-panel),var(--theme-panel)),var(--theme-skin);
        background-origin:border-box;
        background-clip:padding-box,border-box;
      }
      .exp-core-theme[data-theme-skin="gradient"] .header-divider {
        height:2px;
        border-radius:2px;
        opacity:.9;
        background:var(--theme-skin);
        -webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 16%,#000 84%,transparent 100%);
        mask-image:linear-gradient(90deg,transparent 0%,#000 16%,#000 84%,transparent 100%);
      }
      .exp-core-theme[data-theme-skin="gradient"]:not([data-ui-theme="contrast"]) .toggleSwitch[aria-checked="true"] {
        border-color:color-mix(in srgb,var(--theme-line) 52%,var(--theme-accent) 48%);
        background:color-mix(in srgb,var(--theme-panel) 72%,var(--theme-accent) 28%);
      }
      .exp-core-theme[data-theme-skin="gradient"] .exp-theme-swatch.is-on {
        border-color:var(--theme-text);
        box-shadow:0 0 0 2px var(--theme-accent2);
      }
      .exp-core-theme[data-theme-skin="gradient"] :is(.fl-tool-header,.life-btn).last-opened {
        box-shadow:none;
        position:relative;
      }
      .exp-core-theme[data-theme-skin="gradient"] :is(.fl-tool-header,.life-btn).last-opened::before {
        content:"";
        position:absolute;
        left:0;
        top:4px;
        bottom:4px;
        width:2px;
        border-radius:2px;
        background:var(--theme-skin-vertical);
      }
      .exp-core-theme[data-theme-skin="gradient"] .fl-tool-header:hover,
      .exp-core-theme[data-theme-skin="gradient"] .fl-tool-header:focus-visible,
      .exp-core-theme[data-theme-skin="gradient"] .fl-tool-header[aria-expanded="true"] {
        background:color-mix(in srgb,var(--theme-panel) 88%,var(--theme-accent) 12%);
      }
      .exp-core-theme[data-theme-skin="gradient"] :is(.life-btn,.select-lite,.auth-input):focus-visible {
        outline:2px solid transparent !important;
        border-color:transparent !important;
        background-origin:border-box !important;
        background-clip:padding-box,border-box !important;
        background-image:linear-gradient(var(--theme-bg),var(--theme-bg)),var(--theme-skin) !important;
      }
      .exp-core-theme[data-ui-theme="warm"] [data-exp-part="dock"]:not([data-exp-menu-layout="lean"]) {
        border:1px solid color-mix(in srgb,var(--theme-line) 84%,var(--theme-accent) 16%) !important;
        background-image:
          radial-gradient(120% 65% at 50% -18%,color-mix(in srgb,var(--theme-accent) 9%,transparent),transparent 72%),
          linear-gradient(180deg,color-mix(in srgb,var(--theme-panel) 42%,var(--theme-bg) 58%),var(--theme-bg) 44%) !important;
        background-clip:padding-box !important;
        box-shadow:0 18px 50px #0009,inset 0 1px 0 #ffedcf12;
      }
      .exp-core-theme[data-ui-theme="warm"] .header-icon {
        background:linear-gradient(155deg,color-mix(in srgb,var(--theme-accent) 13%,var(--theme-panel)),var(--theme-panel) 70%);
        box-shadow:inset 0 1px 0 #ffedcf20,0 2px 9px #0005;
      }
      .exp-core-theme[data-ui-theme="warm"] [data-exp-part="version"] {
        border-color:color-mix(in srgb,var(--theme-line) 66%,var(--theme-accent) 34%);
        background:color-mix(in srgb,var(--theme-panel) 88%,var(--theme-accent) 12%);
        color:var(--theme-accent2);
      }
      .exp-core-theme[data-ui-theme="warm"] [data-exp-part="close"] {
        border-color:var(--theme-line);background:var(--theme-panel);color:var(--theme-muted);
      }
      .exp-core-theme[data-ui-theme="warm"] .header-divider {
        background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--theme-accent) 55%,transparent) 50%,transparent);
      }
      .exp-core-theme[data-ui-theme="warm"] :is(.fl-tool-header,.life-btn):not(.last-opened) {
        box-shadow:inset 0 1px 0 #ffedcf0a;
      }
      .exp-core-theme[data-ui-theme="contrast"] .toggleSwitch[aria-checked="true"] {
        background:#fff;
        border-color:#fff;
      }
      .exp-core-theme[data-ui-theme="contrast"] .toggleSwitch[aria-checked="true"]::after {
        background:#050505;
        border-color:#fff;
      }
      .campaign-manager-title { min-width:0; font-size:var(--exp-font-size-body,13px); font-weight:800; color:var(--theme-text); }
      .campaign-manager-summary { flex:0 0 auto; font-size:var(--exp-font-size-small,11px); font-weight:700; color:var(--theme-muted); }
      .campaign-manager-note { padding:6px 8px 3px; font-size:var(--exp-font-size-small,11px); line-height:1.35; color:var(--theme-muted); }
      .diag { display:none; box-sizing:border-box;width:100%;min-width:0;height:160px;max-height:160px;overflow:auto;overscroll-behavior:contain;overflow-wrap:anywhere;box-shadow:inset 0 2px 6px #0006; margin-top:6px; padding:7px; border:1px solid #2b2b31; border-radius:7px; background:#101014; font:var(--exp-font-size-small,11px)/1.45 ui-monospace,SFMono-Regular,Consolas,monospace; color:#b8b8c0; white-space:pre-wrap; }
      .diag.open { display:block; }
      .has-tooltip { position:relative; }
      .has-tooltip::after { content:attr(data-tip); position:absolute; left:0; top:calc(100% + 4px); width:min(190px, calc(100vw - 48px)); max-width:100%; padding:6px 8px; border:1px solid #3b3b44; border-radius:7px; background:#0e0e10; color:#efeff1; box-shadow:0 6px 18px #0007; box-sizing:border-box; font-size:var(--exp-font-size-small,11px); line-height:1.35; white-space:normal; overflow-wrap:anywhere; opacity:0; pointer-events:none; z-index:999; transform:translateY(-2px); transition:.12s opacity,.12s transform; }
      .has-tooltip:hover::after,
      .has-tooltip:focus-visible::after { opacity:1; transform:translateY(0); }
      .reduce-motion *,
      .reduce-motion *::before,
      .reduce-motion *::after { animation:none !important; transition:none !important; }
      @media (max-width:700px) {
        .badge-row { width:100%; }
      }
    `;
  }

function protectLauncherHost(host) {
    host = host?.getRootNode?.().host || host;
    if (!host || host.nodeType !== 1) return () => {};
    host.dataset.expOwned = '1';
    const shadow = host.shadowRoot;
    const hostCss = `:host{all:initial!important;position:fixed!important;top:0!important;left:0!important;right:auto!important;bottom:auto!important;display:block!important;width:0!important;height:0!important;min-width:0!important;min-height:0!important;max-width:none!important;max-height:none!important;margin:0!important;padding:0!important;border:0!important;overflow:visible!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;z-index:2147483647!important;isolation:isolate!important;transform:none!important;filter:none!important;clip:auto!important;clip-path:none!important;contain:none!important;content-visibility:visible!important;mix-blend-mode:normal!important}`;
    let protectionSheet = null;
    let protectionStyle = null;
    let repairing = false;
    const installHostCss = () => {
      if (!shadow) return;
      try {
        const current = shadow.adoptedStyleSheets;
        if (protectionSheet && current?.includes?.(protectionSheet)) return;
        const view = host.ownerDocument?.defaultView || window;
        const Sheet = view.CSSStyleSheet || (typeof CSSStyleSheet === 'function' ? CSSStyleSheet : null);
        if (typeof Sheet === 'function' && Sheet.prototype?.replaceSync && current && typeof current[Symbol.iterator] === 'function') {
          if (!protectionSheet) {
            protectionSheet = new Sheet();
            protectionSheet.replaceSync(hostCss);
          }
          if (![...current].includes(protectionSheet)) shadow.adoptedStyleSheets = [...current, protectionSheet];
          return;
        }
      } catch {}
      if (!protectionStyle) {
        protectionStyle = document.createElement('style');
        protectionStyle.dataset.expHostProtection = '1';
        protectionStyle.textContent = hostCss;
      }
      if (!protectionStyle.isConnected) {
        try { shadow.prepend(protectionStyle); } catch {}
      }
    };
    const ensure = () => {
      if (repairing) return;
      repairing = true;
      try {
        const root = document.documentElement;
        if (root && host.parentNode !== root) root.append(host);
        if (host.hidden) host.hidden = false;
        host.removeAttribute('hidden');
        host.removeAttribute('inert');
        if (host.getAttribute('aria-hidden') === 'true') host.removeAttribute('aria-hidden');
        installHostCss();
        if (typeof host.showPopover === 'function') {
          if (host.getAttribute('popover') !== 'manual') host.setAttribute('popover', 'manual');
          let open = false;
          try { open = host.matches(':popover-open'); } catch {}
          if (!open) { try { host.showPopover(); } catch {} }
        }
      } catch {}
      repairing = false;
    };
    ensure();
    const hostObserver = new MutationObserver(() => queueMicrotask(ensure));
    hostObserver.observe(host, { attributes: true, attributeFilter: ['hidden', 'inert', 'aria-hidden', 'popover'] });
    const rootObserver = new MutationObserver(() => {
      if (host.parentNode !== document.documentElement) queueMicrotask(ensure);
    });
    rootObserver.observe(document.documentElement, { childList: true });
    const timer = setInterval(ensure, 2000);
    const onToggle = () => queueMicrotask(ensure);
    host.addEventListener('toggle', onToggle);
    return () => {
      hostObserver.disconnect();
      rootObserver.disconnect();
      clearInterval(timer);
      host.removeEventListener('toggle', onToggle);
      if (protectionSheet && shadow?.adoptedStyleSheets) {
        try { shadow.adoptedStyleSheets = [...shadow.adoptedStyleSheets].filter((sheet) => sheet !== protectionSheet); } catch {}
      }
      try { protectionStyle?.remove(); } catch {}
    };
  }

function compareVersions(a, b) {
    // Semantic version order: a leading "v" and build metadata are ignored, and a pre-release sorts below its release.
    const parse = (value) => {
      const [core, pre] = String(value || '').trim().replace(/^v/i, '').split('+')[0].split(/-(.*)/s);
      return { core: core.split('.').slice(0, 3).map((part) => parseInt(part, 10) || 0), pre: pre ? pre.split('.') : [] };
    };
    const pa = parse(a), pb = parse(b);
    for (let i = 0; i < 3; i += 1) {
      const na = pa.core[i] || 0, nb = pb.core[i] || 0;
      if (na !== nb) return na > nb ? 1 : -1;
    }
    if (!pa.pre.length || !pb.pre.length) return pa.pre.length === pb.pre.length ? 0 : pa.pre.length ? -1 : 1;
    for (let i = 0; i < Math.max(pa.pre.length, pb.pre.length); i += 1) {
      const x = pa.pre[i], y = pb.pre[i];
      if (x === undefined || y === undefined) return x === undefined ? -1 : 1;
      if (x === y) continue;
      const nx = /^\d+$/.test(x), ny = /^\d+$/.test(y);
      if (nx && ny) return Number(x) > Number(y) ? 1 : -1;
      if (nx !== ny) return nx ? -1 : 1;
      return x > y ? 1 : -1;
    }
    return 0;
  }
return Object.freeze({ PRIDE_RAINBOW, PRIDE_RAINBOW_VERTICAL, CRIMSON_THEME, UI_THEMES, SHARED_UI_THEMES, css, supportControlCss, protectLauncherHost, compareVersions });
})();

/* Local diagnostic capture shared at build time by ExtraPotions products. */
const ExtraPotionsDiagnostics = (() => {
  const LIMIT = 100;
  const supportedProducts = ["thread","dropper","shift","ward","prisma"];
  const protocol = 'exp-core-coordination-v1';
  const entries = [], hooks = [], registrations = new Map();
  const startedAt = new Date().toISOString();
  let omitted = 0, recording = false, active = true;
  const redact = value => String(value)
    .replace(/https?:\/\/[^\s"<>]+/gi, '[url]')
    .replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, '[email]')
    .replace(/\b(Bearer|OAuth)\s+\S+/gi, '$1 [redacted]')
    .replace(/\b(token|password|secret|authorization|cookie)\s*[:=]\s*[^\s,;]+/gi, '$1=[redacted]')
    .replace(/\b\d{3}-\d{7}-\d{7}\b/g, '[order-id]')
    .replace(/\b[A-Za-z0-9_-]{40,}\b/g, '[opaque-id]')
    .slice(0, 2000);
  const RESOURCE_INITIATOR_TYPES = new Set(['audio','beacon','css','embed','fetch','font','iframe','img','link','navigation','object','ping','script','track','video','xmlhttprequest','other']);
  const resourceInitiatorType = value => {
    const type = String(value || '').trim().toLowerCase();
    return RESOURCE_INITIATOR_TYPES.has(type) ? type : 'other';
  };
  function clean(value, depth = 0, seen = new WeakSet()) {
    if (depth > 8) return '[depth limit]';
    if (typeof value === 'string') return redact(value);
    if (typeof value === 'bigint') return String(value);
    if (typeof value === 'function' || typeof value === 'symbol') return undefined;
    if (!value || typeof value !== 'object') return value;
    if (value instanceof Node || value === window) return undefined;
    if (seen.has(value)) return '[circular]';
    seen.add(value);
    try {
      if (value instanceof Error) return { name: redact(value.name), message: redact(value.message), stack: redact(value.stack || '') };
      if (Array.isArray(value)) return value.slice(0, 100).map(item => clean(item, depth + 1, seen));
      const result = {};
      for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(value)).slice(0, 150)) {
        if (/token|cookie|authorization|password|secret|pageText|innerHTML|outerHTML|formValue|matchText|__proto__|constructor|prototype/i.test(key)) continue;
        if (!('value' in descriptor)) continue;
        const item = clean(descriptor.value, depth + 1, seen);
        const safeKey = redact(key);
        if (item !== undefined && safeKey) result[safeKey] = item;
      }
      return result;
    } catch { return '[unavailable]'; } finally { seen.delete(value); }
  }
  function record(level, kind, values) {
    if (recording || !active) return;
    recording = true;
    try {
      entries.push({ at: new Date().toISOString(), level, kind, values: clean(values.slice(0, 10)) });
      if (entries.length > LIMIT) { entries.shift(); omitted += 1; }
    } catch {} finally { recording = false; }
  }
  for (const level of ['debug', 'log', 'info', 'warn', 'error']) {
    try {
      const original = console[level];
      if (typeof original !== 'function') continue;
      const wrapped = function(...args) { record(level, 'console', args); return Reflect.apply(original, this, args); };
      console[level] = wrapped;
      if (console[level] === wrapped) hooks.push({ level, original, wrapped });
    } catch {}
  }
  function resourceErrorDetails(target) {
    const element = target?.tagName || 'unknown';
    const root = target?.getRootNode?.();
    const host = root?.host || null;
    const productId = host?.dataset?.productId || host?.dataset?.expDiagnosticsProduct || null;
    const owned = Boolean(
      productId ||
      host?.dataset?.expOwned === '1' ||
      target?.dataset?.expOwned === '1'
    );
    let assetHost = null;
    try {
      const raw = target?.currentSrc || target?.src || target?.href || '';
      assetHost = raw ? new URL(raw, location.href).hostname : null;
    } catch {}
    return {
      element,
      owner: owned ? (productId || 'extrapotions') : 'page',
      assetHost,
    };
  }
  const onError = event => record('error', event.target === window ? 'runtime-error' : 'resource-error',
    event.target === window
      ? [event.error || event.message, { line: event.lineno, column: event.colno }]
      : [resourceErrorDetails(event.target)]);
  const onRejection = event => record('error', 'unhandled-rejection', [event.reason]);
  addEventListener('error', onError, true);
  addEventListener('unhandledrejection', onRejection);

  function registerProduct(id, version, host) {
    id = String(id).toLowerCase();
    if (!supportedProducts.includes(id)) return null;
    let marker = registrations.get(id);
    if (!marker) {
      marker = document.createElement('meta');
      marker.dataset.expOwned = '1';
      marker.dataset.expDiagnosticsProduct = id;
      marker.dataset.expProductVersion = String(version || 'unknown').slice(0, 40);
      marker.dataset.expCoordinationProtocol = protocol;
      marker.dataset.expDiagnosticsInstance = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
      registrations.set(id, marker);
    }
    if (!marker.isConnected) (document.head || document.documentElement)?.append(marker);
    if (host) host.dataset.expDiagnosticsInstance = marker.dataset.expDiagnosticsInstance;
    return marker;
  }
  addEventListener('DOMContentLoaded', () => { for (const marker of registrations.values()) if (!marker.isConnected) (document.head || document.documentElement)?.append(marker); }, { once: true });
  function compatibility() {
    const markers = [...document.querySelectorAll('meta[data-exp-diagnostics-product]')];
    const hosts = [...document.querySelectorAll('[data-exp-product-launcher="1"][data-product-id]')];
    const conflicts = [];
    const products = supportedProducts.map(id => {
      const records = markers.filter(n => n.dataset.expDiagnosticsProduct === id);
      const launchers = hosts.filter(n => n.dataset.productId === id);
      const versions = [...new Set(records.map(n => redact(n.dataset.expProductVersion || 'unknown')))];
      const protocols = [...new Set(records.map(n => redact(n.dataset.expCoordinationProtocol || 'unknown')))];
      if (records.length > 1 || launchers.length > 1) conflicts.push({ type: 'duplicate-product', products: [id], instances: Math.max(records.length, launchers.length) });
      if (protocols.some(p => p !== protocol && p !== 'unknown')) conflicts.push({ type: 'protocol-mismatch', products: [id], protocols });
      return { id, status: records.length || launchers.length ? 'observed' : 'not-observed', versions, protocols, instances: Math.max(records.length, launchers.length), launchers: launchers.length };
    });
    const boxes = hosts.map(host => {
      // An inaccessible shadow or unknown box is not evidence of a collision.
      const launcher = host.shadowRoot?.querySelector('[data-exp-part="launcher"]');
      if (!launcher || !launcher.getClientRects().length || getComputedStyle(launcher).visibility === 'hidden') return null;
      return { id: host.dataset.productId, box: launcher.getBoundingClientRect() };
    }).filter(x => x && supportedProducts.includes(x.id));
    for (let a = 0; a < boxes.length; a++) for (let b = a + 1; b < boxes.length; b++) {
      const x = boxes[a], y = boxes[b];
      if (Math.min(x.box.right, y.box.right) - Math.max(x.box.left, y.box.left) > 2 && Math.min(x.box.bottom, y.box.bottom) - Math.max(x.box.top, y.box.top) > 2)
        conflicts.push({ type: 'launcher-overlap', products: [x.id, y.id] });
    }
    return { scope: 'current-page', installationInventory: 'unavailable', products, conflicts,
      status: conflicts.length ? 'conflicts-detected' : 'no-conflicts-observed',
      limitations: ['Disabled products and products outside their match rules cannot be enumerated.', 'Only reported registrations, protocol mismatches, duplicate instances and observable launcher overlap are checked.'] };
  }
  // Diagnostics: the hardest-to-read text on screen and what covers the page, so a washed-out site can be
  // diagnosed from a copied report. Records colors and element names only, never page text.
  function readabilityScan({limit=25,budget=6000}={}){
    const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const context=canvas.getContext('2d',{willReadFrequently:true});
    const rgba=color=>{context.clearRect(0,0,1,1);context.fillStyle='#000';context.fillStyle=color;context.fillRect(0,0,1,1);return [...context.getImageData(0,0,1,1).data].map(n=>n/255);};
    const channel=v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4,luminance=c=>.2126*channel(c[0])+.7152*channel(c[1])+.0722*channel(c[2]);
    const up=node=>node.parentElement||node.getRootNode?.().host||null;
    const css=color=>'rgb('+color.slice(0,3).map(v=>Math.round(v*255)).join(', ')+')';
    const name=node=>({tag:node.tagName.toLowerCase(),id:node.id?String(node.id).slice(0,40):'',cls:String(node.className?.baseVal??node.className??'').slice(0,80),host:node.getRootNode?.().host?.tagName.toLowerCase()||''});
    const backdrop=node=>{const layers=[];for(let n=node;n;n=up(n)){const c=rgba(getComputedStyle(n).backgroundColor);if(c[3]>0)layers.push(c);if(c[3]>=.99)break;}return layers.reduceRight((base,c)=>base.map((v,i)=>c[i]*c[3]+v*(1-c[3])),[1,1,1]);};
    const nodes=[];const walk=root=>{for(const node of root.querySelectorAll('*')){if(nodes.length>=budget)return;if(node.closest('[data-exp-owned="1"]')||node.id?.startsWith('exp-'))continue;nodes.push(node);if(node.shadowRoot)walk(node.shadowRoot);}};
    walk(document);
    const rows=[];
    for(const node of nodes){
      const text=[...node.childNodes].reduce((sum,child)=>sum+(child.nodeType===3?child.textContent.trim().length:0),0);
      if(!text)continue;
      const box=node.getBoundingClientRect();
      if(!box.width||!box.height||box.bottom<0||box.top>innerHeight*2)continue;
      const style=getComputedStyle(node),fg=rgba(style.color),bg=backdrop(node),mixed=fg.slice(0,3).map((v,i)=>v*fg[3]+bg[i]*(1-fg[3]));
      const a=luminance(mixed),b=luminance(bg);
      rows.push({ratio:Math.round((Math.max(a,b)+.05)/(Math.min(a,b)+.05)*100)/100,...name(node),textLength:text,color:style.color,background:css(bg),opacity:style.opacity,
        ...(style.filter!=='none'?{filter:style.filter}:{}),...(node.closest('[data-exp-shift-preserve]')?{preserved:true}:{}),...(node.hasAttribute('data-exp-shift-live')?{repaired:true}:{})});
    }
    rows.sort((x,y)=>x.ratio-y.ratio);
    const layer=node=>{const style=getComputedStyle(node);return {...name(node),background:style.backgroundColor,opacity:style.opacity,position:style.position,...(style.filter!=='none'?{filter:style.filter}:{}),...(style.backdropFilter&&style.backdropFilter!=='none'?{backdropFilter:style.backdropFilter}:{}),...(style.mixBlendMode!=='normal'?{blend:style.mixBlendMode}:{})};};
    const points=[[.5,.4],[.1,.4],[.5,.85]].map(([x,y])=>{
      const px=Math.round(innerWidth*x),py=Math.round(innerHeight*y);
      const stack=document.elementsFromPoint(px,py).filter(node=>!node.closest('[data-exp-owned="1"]')).slice(0,6).map(layer);
      let root=document,deepest=null;for(let i=0;i<20;i++){const hit=root.elementFromPoint(px,py);if(!hit||hit===deepest)break;deepest=hit;if(!hit.shadowRoot)break;root=hit.shadowRoot;}
      const chain=[];for(let n=deepest;n&&chain.length<10;n=up(n))chain.push(layer(n));
      return {x:px,y:py,stack,chain};
    });
    // Click-through layers (pointer-events:none) never show up at a point, so list large painted layers too.
    const overlays=[];
    for(const node of nodes){
      if(overlays.length>=8)break;
      const style=getComputedStyle(node);if(style.position!=='fixed'&&style.position!=='absolute'&&style.position!=='sticky')continue;
      const box=node.getBoundingClientRect(),area=Math.max(0,Math.min(box.right,innerWidth)-Math.max(box.left,0))*Math.max(0,Math.min(box.bottom,innerHeight)-Math.max(box.top,0));
      if(area<innerWidth*innerHeight*.5)continue;
      const painted=rgba(style.backgroundColor)[3]>0||style.filter!=='none'||(style.backdropFilter&&style.backdropFilter!=='none')||style.mixBlendMode!=='normal';
      if(painted)overlays.push({...layer(node),coverage:Math.round(area/(innerWidth*innerHeight)*100)/100,pointerEvents:style.pointerEvents,zIndex:style.zIndex});
    }
    return {scanned:nodes.length,truncated:nodes.length>=budget,viewport:{width:innerWidth,height:innerHeight},colorScheme:getComputedStyle(document.documentElement).colorScheme,worst:rows.slice(0,limit),overlays,points};
  }
  function createReport(product, details = {}, core = {}) {
    const { host, shadow: suppliedShadow, ...rest } = details;
    const shadow = suppliedShadow || host?.shadowRoot;
    const id = String(product || 'ExtraPotions').toLowerCase();
    const registration = registerProduct(id, details.product?.version || details.version, host);
    const data = clean(rest);
    const count = selector => document.querySelectorAll(selector).length;
    const navigation = performance.getEntriesByType('navigation')[0];
    const resources = performance.getEntriesByType('resource');
    const byType = {};
    for (const entry of resources) {
      const summary = byType[resourceInitiatorType(entry.initiatorType)] ||= { count: 0, durationMs: 0, transferBytes: 0 };
      summary.count++; summary.durationMs += Math.round(entry.duration); summary.transferBytes += entry.transferSize || 0;
    }
    const page = { origin: location.origin, protocol: location.protocol, readyState: document.readyState, contentType: document.contentType, characterSet: document.characterSet, compatibilityMode: document.compatMode, language: document.documentElement?.lang || null, direction: document.documentElement?.dir || 'auto',
      structure: { elements: count('*'), headings: count('h1,h2,h3,h4,h5,h6'), links: count('a[href]'), forms: count('form'), inputs: count('input,select,textarea'), buttons: count('button,[role="button"]'), images: count('img'), videos: count('video'), audio: count('audio'), frames: count('iframe'), scripts: count('script'), stylesheets: document.styleSheets.length },
      layout: { documentWidth: document.documentElement?.scrollWidth || 0, documentHeight: document.documentElement?.scrollHeight || 0, scrollX, scrollY, horizontalOverflow: (document.documentElement?.scrollWidth || 0) > innerWidth },
      preferences: { reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches, darkColorScheme: matchMedia('(prefers-color-scheme: dark)').matches, forcedColors: matchMedia('(forced-colors: active)').matches },
      performance: { navigation: navigation ? { type: navigation.type, durationMs: Math.round(navigation.duration), responseMs: Math.round(navigation.responseEnd), domInteractiveMs: Math.round(navigation.domInteractive), domContentLoadedMs: Math.round(navigation.domContentLoadedEventEnd), loadMs: Math.round(navigation.loadEventEnd), redirectCount: navigation.redirectCount } : null, resources: { count: resources.length, byType }, paint: performance.getEntriesByType('paint').map(e => ({ name: e.name, startMs: Math.round(e.startTime) })) },
      privacy: { pageText: 'excluded', formValues: 'excluded', urlPathsAndQueries: 'excluded', resourceUrls: 'excluded', cookiesAndStorage: 'excluded; sanitized plugin state supplied separately' } };
    const environment = { hostname: location.hostname, topLevelContext: window.top === window.self, visibility: document.visibilityState, online: navigator.onLine, language: navigator.language, userAgent: navigator.userAgent, viewport: { width: innerWidth, height: innerHeight, pixelRatio: devicePixelRatio } };
    const rect = n => { const b = n.getBoundingClientRect(); return { width: b.width, height: b.height, x: b.x, y: b.y, visible: !!n.getClientRects().length && getComputedStyle(n).visibility !== 'hidden' }; };
    const first = selector => shadow?.querySelector(selector) || null;
    const visibleFirst = selector => [...(shadow?.querySelectorAll(selector) || [])].find(n => !n.hidden && n.getClientRects().length) || first(selector);
    const progressCard = first('[data-exp-part="progress-card"]');
    const launcher = first('[data-exp-part="launcher"]');
    const launcherRow = first('[data-exp-part="launcher-row"]');
    const menu = first('[data-exp-part="dock"]');
    const notice = visibleFirst('[data-exp-update-notice],.update-notice,.changelog');
    const uiGeometry = {
      progressCardRect: progressCard ? rect(progressCard) : null,
      launcherRect: launcher ? rect(launcher) : null,
      launcherRowRect: launcherRow ? rect(launcherRow) : null,
      menuRect: menu ? rect(menu) : null,
      noticeRect: notice ? rect(notice) : null,
    };
    const ui = {
      mounted: !!host?.isConnected,
      menuSizing: 'viewport-clamped',
      uiGeometry,
      progressPanelWidth: progressCard ? Math.round(progressCard.getBoundingClientRect().width) : null,
      launcherRowWidth: launcherRow ? Math.round(launcherRow.getBoundingClientRect().width) : null,
      menuWidth: menu ? Math.round(menu.getBoundingClientRect().width) : null,
      noticeWidth: notice && !notice.hidden ? Math.round(notice.getBoundingClientRect().width) : null,
      surfaces: [...(shadow?.querySelectorAll('[data-exp-part="dock"]') || [])].map(rect),
      categories: [...(shadow?.querySelectorAll('.route,.nav-item,.fl-tool-header') || [])].map(n => ({ name: redact(n.textContent.trim()), expanded: n.getAttribute('aria-expanded') })),
      swatches: [...(shadow?.querySelectorAll('.exp-theme-swatch') || [])].map(n => ({ name: n.getAttribute('aria-label'), selected: n.getAttribute('aria-pressed'), ...rect(n) })),
    };
    let manager = null;
    try { if (typeof GM_info === 'object') manager = { name: GM_info.scriptHandler || null, version: GM_info.version || null, injectInto: GM_info.injectInto || null }; } catch {}
    return { ...data, report: `${product} Diagnostics`, schemaVersion: 3, generatedAt: new Date().toISOString(), page,
      technical: { manager, core: clean(core), capabilities: { mutationObserver: typeof MutationObserver === 'function', constructedStylesheets: typeof CSSStyleSheet === 'function' && 'replaceSync' in CSSStyleSheet.prototype, clipboard: !!navigator.clipboard, trustedTypes: !!globalThis.trustedTypes } },
      console: { startedAt, scope: 'accessible-userscript-realm-and-window-events', limit: LIMIT, omitted, hooks: hooks.map(h => ({ level: h.level, installed: console[h.level] === h.wrapped })), entries: clean(entries), limitations: ['No DevTools history, browser-internal logs, or inaccessible isolated-world console messages.', 'Messages are redacted and bounded; attribution to another script is not inferred.'] },
      // Product state is reported once, at the top level of the report.
      plugin: { id, version: data.product?.version || data.version || registration?.dataset.expProductVersion || null, stateLocation: 'top-level', compatibility: compatibility() },
      environment, ui, core: data.core || clean(core),
      readability: data.readability || (() => { try { return readabilityScan(); } catch (error) { return { error: String(error?.message || error) }; } })() };
  }
  function dispose() {
    active = false;
    for (const {level, original, wrapped} of hooks) if (console[level] === wrapped) console[level] = original;
    removeEventListener('error', onError, true); removeEventListener('unhandledrejection', onRejection);
    for (const marker of registrations.values()) marker.remove();
  }
  // Core owns the shared diagnostics interaction contract: Show/Hide first, Copy second,
  // transient Diagnostics Copied / Copy Failed feedback, and fresh reports per action.
  // The report behind each set of controls, so Report a Problem can attach a fresh one.
  const reportSources = new WeakMap();
  function reportSource(container) {
    if (!container) return null;
    if (reportSources.has(container)) return reportSources.get(container);
    for (const node of container.querySelectorAll?.('*') || []) if (reportSources.has(node)) return reportSources.get(node);
    return null;
  }
  function bindControls({ show, copy, output, getReport, notify = () => {}, onShow = () => {}, onCopy = () => {} }) {
    let timer, generation = 0;
    reportSources.set(output, getReport); reportSources.set(copy, getReport);
    output.hidden = true; output.setAttribute('role', 'region');
    output.setAttribute('aria-label', 'Page, technical, console, and plugin diagnostics'); output.tabIndex = 0;
    show.setAttribute('aria-expanded', 'false');
    const showClick = async () => {
      const opening = output.hidden, ticket = ++generation;
      output.hidden = !opening; output.classList.toggle('open', opening);
      show.textContent = opening ? 'Hide Diagnostics' : 'Show Diagnostics';
      show.setAttribute('aria-expanded', String(opening)); show.classList.toggle('last-opened', opening);
      if (opening) {
        try { const report = await getReport(); if (ticket === generation) output.textContent = JSON.stringify(report, null, 2); }
        catch { if (ticket === generation) output.textContent = 'Diagnostics unavailable.'; notify('Could not generate diagnostics.'); }
      }
      onShow(opening);
    };
    const copyClick = async () => {
      copy.disabled = true; clearTimeout(timer);
      try {
        await navigator.clipboard.writeText(JSON.stringify(await getReport(), null, 2));
        copy.textContent = 'Diagnostics Copied'; onCopy();
      } catch { copy.textContent = 'Copy Failed'; notify('Could not copy diagnostics. Use Show Diagnostics.'); }
      finally { copy.disabled = false; timer = setTimeout(() => { copy.textContent = 'Copy Diagnostics'; }, 1600); }
    };
    show.addEventListener('click', showClick); copy.addEventListener('click', copyClick);
    return () => { ++generation; clearTimeout(timer); show.removeEventListener('click', showClick); copy.removeEventListener('click', copyClick); };
  }
  function createControls(getReport, notify) {
    const wrapper = document.createElement('div'); wrapper.className = 'diagnostics-controls';
    const actions = document.createElement('div'); actions.className = 'action-pair';
    const show = document.createElement('button'), copy = document.createElement('button'), output = document.createElement('pre');
    for (const button of [show, copy]) { button.type = 'button'; button.className = 'life-btn action'; }
    show.textContent = 'Show Diagnostics'; copy.textContent = 'Copy Diagnostics'; output.className = 'diag';
    bindControls({ show, copy, output, getReport, notify });
    actions.append(show, copy); wrapper.append(actions, output); return wrapper;
  }
  return Object.freeze({ createReport, readabilityScan, registerProduct, compatibility, bindControls, createControls, reportSource, dispose });
})();

/* Canonical ExtraPotions shared lifecycle runtime. */
function createProductLifecycle(shared) {
  const VERSION = shared.version;
  const PROTOCOL = 'exp-core-coordination-v1';
  const CAPABILITIES = new Set(['lifecycle', 'settings', 'diagnostics', 'dom-scheduler', 'navigation', 'launcher', 'ui']);
  const products = new Map();
  const cleanups = new Set();
  const errors = [];
  const metrics = { batches: 0, roots: 0, startedAt: Date.now() };
  let coordinator;
  const navigationSubscribers = new Set();
  let stopNavigationHooks;
  let suiteControlCleanup;

  function compareVersions(left, right) {
    const a = String(left).split(/[.-]/).slice(0, 3).map((part) => Number(part) || 0);
    const b = String(right).split(/[.-]/).slice(0, 3).map((part) => Number(part) || 0);
    for (let index = 0; index < 3; index += 1) if (a[index] !== b[index]) return a[index] > b[index] ? 1 : -1;
    return 0;
  }

  function negotiate(peerVersion, peerProtocol = PROTOCOL) {
    if (peerProtocol !== PROTOCOL || !/^\d+\.\d+\.\d+/.test(peerVersion || '')) return { compatible: false, selection: 'isolated', reason: 'PROTOCOL_INCOMPATIBLE' };
    const comparison = compareVersions(VERSION, peerVersion);
    return { compatible: true, selection: comparison < 0 ? 'peer-newer' : comparison > 0 ? 'local-newer' : 'equal', reason: 'COMPATIBLE' };
  }

  const safeError = (error, source = 'core') => {
    const message = String(error && error.message || error || 'Unknown error').replace(/https?:\/\/\S+/g, '[url]').slice(0, 180);
    errors.push({ source, code: error && error.code || 'UNEXPECTED', message, at: Date.now() });
    if (errors.length > 12) errors.shift();
  };

  function ensureCoordinator() {
    if (!document.documentElement) return null;
    coordinator = document.querySelector('[data-exp-core-coordinator="1"]');
    if (!coordinator) {
      coordinator = document.createElement('meta');
      coordinator.dataset.expCoreCoordinator = '1';
      coordinator.dataset.protocol = PROTOCOL;
      coordinator.dataset.protocolVersion = '1';
      document.documentElement.append(coordinator);
    }
    const selected = coordinator.dataset.activeCoreVersion;
    if (!selected || compareVersions(VERSION, selected) > 0) coordinator.dataset.activeCoreVersion = VERSION;
    return coordinator;
  }

  function announce(type, detail = {}) {
    const node = ensureCoordinator();
    if (!node) return;
    const payload = { protocol: PROTOCOL, protocolVersion: 1, coreVersion: VERSION, type, ...detail };
    document.dispatchEvent(new CustomEvent('exp-core:coordination', { detail: payload }));
  }

  function publishProduct(manifest, state) {
    const node = ensureCoordinator();
    if (!node) return;
    const key = `product${manifest.id.replace(/[^a-z0-9]/gi, '')}`;
    node.dataset[key] = JSON.stringify({ id: manifest.id, version: manifest.version, state, capabilities: manifest.capabilities });
    announce('product-state', { productId: manifest.id, productVersion: manifest.version, state });
  }

  function validateManifest(manifest) {
    if (!manifest || !/^[a-z][a-z0-9-]+$/.test(manifest.id || '')) throw Object.assign(new Error('Invalid product ID'), { code: 'MANIFEST_ID' });
    if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(manifest.version || '')) throw Object.assign(new Error('Invalid product version'), { code: 'MANIFEST_VERSION' });
    if (!Array.isArray(manifest.capabilities)) throw Object.assign(new Error('Capabilities must be an array'), { code: 'MANIFEST_CAPABILITIES' });
    const missing = manifest.capabilities.filter((item) => !CAPABILITIES.has(item));
    if (missing.length) throw Object.assign(new Error(`Missing Core capability: ${missing.join(', ')}`), { code: 'CAPABILITY_MISSING' });
  }

  function register(manifest, hooks) {
    validateManifest(manifest);
    if (products.has(manifest.id)) return products.get(manifest.id).public;
    const record = { manifest: Object.freeze({ ...manifest }), hooks, state: 'registered', queue: Promise.resolve(), desiredEnabled: false };
    const transition = (allowed, next, action) => {
      record.queue = record.queue.catch(() => {}).then(async () => {
        if (!allowed.includes(record.state)) return;
        try {
          if(next==='enabled'&&shared.suiteSitePaused?.()){record.state='disabled';publishProduct(record.manifest,'disabled');return;}
          await action?.();
          record.state = next;
          publishProduct(record.manifest, next);
        } catch (error) {
          record.state = 'failed';
          safeError(error, manifest.id);
          publishProduct(record.manifest, 'failed');
          throw error;
        }
      });
      return record.queue;
    };
    const enable = () => {
      record.desiredEnabled = true;
      if (shared.suiteSitePaused?.()) return transition(['initialized'], 'disabled');
      return transition(['initialized', 'disabled'], 'enabled', hooks.enable);
    };
    const disable = () => { record.desiredEnabled = false; return transition(['enabled'], 'disabled', hooks.disable); };
    record.public = Object.freeze({
      manifest: record.manifest,
      get state() { return record.state; },
      initialize: () => transition(['registered', 'failed'], 'initialized', hooks.initialize),
      enable,
      disable,
      cleanup: () => transition(['registered', 'initialized', 'enabled', 'disabled', 'failed'], 'cleaned', hooks.cleanup)
    });
    products.set(manifest.id, record);
    if (!suiteControlCleanup && typeof shared.onSuiteEvent === 'function') {
      suiteControlCleanup = shared.onSuiteEvent((event) => {
        if (event.type !== 'suite.site-control' || event.detail?.hostname !== String(location.hostname || 'local-document').toLowerCase()) return;
        for (const item of products.values()) {
          item.queue=item.queue.catch(()=>{}).then(async()=>{const paused=shared.suiteSitePaused?.();try{if(paused&&item.state==='enabled'){await item.hooks.disable?.();item.state='disabled';publishProduct(item.manifest,'disabled');}else if(!paused&&item.desiredEnabled&&item.state==='disabled'){await item.hooks.enable?.();item.state='enabled';publishProduct(item.manifest,'enabled');}}catch(error){item.state='failed';safeError(error,item.manifest.id);publishProduct(item.manifest,'failed');}});
        }
      }, { type: 'suite.site-control' });
      cleanups.add(() => { suiteControlCleanup?.(); suiteControlCleanup = null; });
    }
    publishProduct(record.manifest, 'registered');
    return record.public;
  }

  function createScheduler(callback, options = {}) {
    let observer;
    let sharedObserverCleanup;
    let frame = 0;
    let active = false;
    const roots = new Set();
    const flush = () => {
      frame = 0;
      if (!active || !roots.size) return;
      const batch = [...roots];
      roots.clear();
      metrics.batches += 1;
      metrics.roots += batch.length;
      try { callback(batch); } catch (error) { safeError(error, options.source || 'scheduler'); }
    };
    const queueRoot = (root) => {
      if (!active || !root || root.closest?.('[data-exp-owned="1"]')) return false;
      const target = root.nodeType === Node.TEXT_NODE ? root.parentElement : root;
      if (!target) return false;
      roots.add(target);
      return true;
    };
    const schedule = (root) => {
      if (!queueRoot(root)) return;
      if (!frame) frame = requestAnimationFrame(flush);
    };
    const startDedicatedObserver = () => {
      observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          const target = mutation.target?.nodeType === Node.TEXT_NODE ? mutation.target.parentElement : mutation.target;
          if (!target) continue;
          if (target.closest?.('[data-exp-owned="1"]')) continue;
          if (mutation.type === 'childList') {
            const changed = [...mutation.addedNodes, ...mutation.removedNodes];
            if (changed.length && changed.every((node) => node.nodeType === 1 && (node.matches?.('[data-exp-owned="1"]') || node.closest?.('[data-exp-owned="1"]')))) continue;
          }
          schedule(target);
        }
      });
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: Boolean(options.attributes),
        characterData: Boolean(options.characterData),
        attributeFilter: options.attributeFilter
      });
    };
    return Object.freeze({
      start() {
        if (active) return;
        active = true;
        if (!options.attributes && typeof shared.observePageBatch === 'function') {
          const productId = options.source || 'scheduler';
          const phase = options.phase || shared.suiteContract?.(productId)?.presentationPhases?.[0] || 'observe';
          sharedObserverCleanup = shared.observePageBatch((batch, batchRoots, details) => {
            for (let index = 0; index < batchRoots.length; index += 1) {
              const types = Array.isArray(details?.[index]?.types) ? details[index].types : [];
              if (!options.characterData && types.length && types.every(type => type === 'characterData')) continue;
              queueRoot(batchRoots[index]);
            }
            if (roots.size) {
              if (frame) { cancelAnimationFrame(frame); frame = 0; }
              flush();
            }
          }, { productId, phase });
        } else if (!options.attributes && typeof shared.observePage === 'function') {
          sharedObserverCleanup = shared.observePage((batch, root) => {
            const types = Array.isArray(batch?.types) ? batch.types : [];
            if (!options.characterData && types.length && types.every(type => type === 'characterData')) return;
            schedule(root);
          }, { productId: options.source || 'scheduler' });
        } else {
          startDedicatedObserver();
        }
        schedule(document.documentElement);
      },
      stop() {
        active = false;
        sharedObserverCleanup?.();
        sharedObserverCleanup = null;
        observer?.disconnect();
        observer = null;
        roots.clear();
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
      },
      schedule,
      flush
    });
  }

  function onNavigation(callback) {
    if (typeof callback !== 'function') throw new TypeError('Navigation callback must be a function');
    if (typeof shared.observeNavigation === 'function') {
      let disposed = false;
      const stop = shared.observeNavigation(event => callback({
        href: event.href,
        kind: event.kind,
        epoch: event.epoch,
      }), { owner: 'lifecycle' });
      const cleanup = () => {
        if (disposed) return;
        disposed = true;
        stop();
        cleanups.delete(cleanup);
      };
      cleanups.add(cleanup);
      return cleanup;
    }
    let previous=location.href;
    const subscriber=({href})=>{if(href!==previous){previous=href;callback({href});}};
    if (!stopNavigationHooks) {
      const originals={},wrappers={};
      const check=()=>{const href=location.href;for(const notify of [...navigationSubscribers])notify({href});};
      for(const name of ['pushState','replaceState']){const original=history[name];originals[name]=original;const wrapped=function(...args){const result=Reflect.apply(original,this,args);check();return result;};wrappers[name]=wrapped;history[name]=wrapped;}
      addEventListener('popstate',check);addEventListener('hashchange',check);globalThis.navigation?.addEventListener('currententrychange',check);
      stopNavigationHooks=()=>{for(const name of Object.keys(wrappers))if(history[name]===wrappers[name])history[name]=originals[name];removeEventListener('popstate',check);removeEventListener('hashchange',check);globalThis.navigation?.removeEventListener('currententrychange',check);stopNavigationHooks=null;};
    }
    navigationSubscribers.add(subscriber);
    let disposed=false;
    const cleanup=()=>{if(disposed)return;disposed=true;navigationSubscribers.delete(subscriber);cleanups.delete(cleanup);if(!navigationSubscribers.size)stopNavigationHooks?.();};
    cleanups.add(cleanup);return cleanup;
  }


  function protectLauncherHost(host) { return shared.reference.protectLauncherHost(host); }

  function registerLauncher(host, options) { const cleanup = shared.registerLauncher(host, options); cleanups.add(cleanup); return cleanup; }

  function pageView() {
    try { if (typeof unsafeWindow !== 'undefined' && unsafeWindow?.document) return unsafeWindow; } catch {}
    return window;
  }

  function isShadowRoot(node) {
    return Boolean(node && node.nodeType === 11 && node.host);
  }

  // Every stylesheet Core injects begins with an empty marker rule. A constructed sheet
  // has no owner node, and a tool such as SHIFT cannot see a JavaScript flag across
  // userscript sandboxes, but it can always read the first rule through the CSSOM.
  const OWNED_SHEET_MARKER = '.exp-owned-sheet-marker{}';
  const ensureMarker = (text) => { const value = String(text || ''); return value.startsWith(OWNED_SHEET_MARKER) ? value : OWNED_SHEET_MARKER + value; };

  function appendShadowStyle(root, css, data) {
    const node = document.createElement('style');
    try { node.textContent = ensureMarker(css); } catch (error) { safeError(error, 'core.style'); }
    node.dataset.expOwned = '1';
    for (const [key, value] of Object.entries(data || {})) node.dataset[key] = String(value);
    root.append(node);
    return node;
  }

  function paintToken() {
    return `expink${Math.random().toString(36).slice(2, 10)}`;
  }

  function withPaintProbe(css, token) {
    css = ensureMarker(css);
    return `${css}\n[data-${token}]{color:rgb(1, 2, 3)!important}`;
  }

  function isConnectedNode(node) {
    try { return Boolean(node && (node.isConnected || node.host?.isConnected)); } catch { return false; }
  }

  function sheetHasRules(sheet) {
    try { return sheet.cssRules.length > 0; } catch { return null; }
  }

  function sawPaint(token, parent) {
    if (!parent || !isConnectedNode(parent)) return false;
    const probe = document.createElement('span');
    probe.setAttribute(`data-${token}`, '');
    parent.append(probe);
    let painted = false;
    try { painted = getComputedStyle(probe).color === 'rgb(1, 2, 3)'; } catch {}
    try { probe.remove(); } catch { probe.parentNode?.removeChild(probe); }
    return painted;
  }

  function writeSheet(sheet, text, view) {
    const source = ensureMarker(text);
    try { sheet.replaceSync(source); return; } catch {}
    view.Function('sheet', 'css', 'sheet.replaceSync(css)')(sheet, source);
  }

  function setAdopted(host, sheets) {
    try { host.adoptedStyleSheets = sheets; return; } catch {}
    const view = pageView();
    const proto = isShadowRoot(host) ? (view.ShadowRoot || ShadowRoot).prototype : (view.Document || Document).prototype;
    const desc = Object.getOwnPropertyDescriptor(proto, 'adoptedStyleSheets');
    if (!desc?.set) throw new Error('adoptedStyleSheets unavailable');
    desc.set.call(host, sheets);
  }

  function adoptConstructable(host, css, shadow) {
    const view = pageView();
    const Ctor = view.CSSStyleSheet || (typeof CSSStyleSheet === 'function' ? CSSStyleSheet : null);
    if (typeof Ctor !== 'function' || !Ctor.prototype.replaceSync) return null;
    const current = host.adoptedStyleSheets;
    if (!current || typeof current[Symbol.iterator] !== 'function') return null;
    const sheet = new Ctor();
    const token = paintToken();
    writeSheet(sheet, withPaintProbe(css, token), view);
    const before = current.length;
    setAdopted(host, [...current, sheet]);
    const sample = shadow || host.documentElement || host;
    if (host.adoptedStyleSheets.length !== before + 1) {
      try { setAdopted(host, [...host.adoptedStyleSheets].filter((item) => item !== sheet)); } catch {}
      throw new Error('adoptedStyleSheets ignored');
    }
    const painted = isConnectedNode(sample) ? sawPaint(token, sample) : sheetHasRules(sheet) !== false;
    if (!painted) {
      try { setAdopted(host, [...host.adoptedStyleSheets].filter((item) => item !== sheet)); } catch {}
      throw new Error('adoptedStyleSheets did not paint');
    }
    writeSheet(sheet, css, view);
    return {
      sheet,
      write: (text) => writeSheet(sheet, text, view),
      detach() {
        try { setAdopted(host, [...host.adoptedStyleSheets].filter((item) => item !== sheet)); } catch {}
      }
    };
  }

  // Shadow roots share one constructed sheet per stylesheet text. Paint is probed once per
  // page: every probe forces a style recalculation of the whole page, which on a site with
  // thousands of components (Reddit) cost seconds. Later roots only check that their adopted
  // list took the sheet. A root that edits its style gets its own copy first.
  const sharedShadowSheets = new Map();
  // null until the first connected root answers; false sends every later root to the fallback.
  let shadowAdoptionPaints = null;

  function withoutOne(list, sheet, replacement) {
    const next = [...list];
    const index = next.lastIndexOf(sheet);
    if (index >= 0) { if (replacement) next[index] = replacement; else next.splice(index, 1); }
    return next;
  }

  function adoptionPaints(root, Ctor, view) {
    const token = paintToken();
    const probe = new Ctor();
    writeSheet(probe, withPaintProbe('', token), view);
    setAdopted(root, [...root.adoptedStyleSheets, probe]);
    try { return sawPaint(token, root); } finally { try { setAdopted(root, withoutOne(root.adoptedStyleSheets, probe)); } catch {} }
  }

  function adoptShared(root, css) {
    const view = pageView();
    const Ctor = view.CSSStyleSheet || (typeof CSSStyleSheet === 'function' ? CSSStyleSheet : null);
    if (typeof Ctor !== 'function' || !Ctor.prototype.replaceSync) return null;
    const current = root.adoptedStyleSheets;
    if (!current || typeof current[Symbol.iterator] !== 'function') return null;
    if (shadowAdoptionPaints === false) throw new Error('adoptedStyleSheets did not paint');
    let entry = sharedShadowSheets.get(css);
    if (!entry) {
      const created = new Ctor();
      writeSheet(created, css, view);
      entry = { sheet: created, users: 0 };
    }
    let sheet = entry.sheet;
    const before = current.length;
    setAdopted(root, [...current, sheet]);
    if (root.adoptedStyleSheets.length !== before + 1) {
      try { setAdopted(root, withoutOne(root.adoptedStyleSheets, sheet)); } catch {}
      throw new Error('adoptedStyleSheets ignored');
    }
    if (shadowAdoptionPaints === null && isConnectedNode(root)) {
      let painted = false;
      try { painted = adoptionPaints(root, Ctor, view); } catch {}
      shadowAdoptionPaints = painted;
      if (!painted) {
        try { setAdopted(root, withoutOne(root.adoptedStyleSheets, sheet)); } catch {}
        throw new Error('adoptedStyleSheets did not paint');
      }
    }
    entry.users += 1;
    sharedShadowSheets.set(css, entry);
    let shared = true;
    const release = () => {
      if (!shared) return;
      shared = false;
      entry.users -= 1;
      if (entry.users <= 0 && sharedShadowSheets.get(css) === entry) sharedShadowSheets.delete(css);
    };
    return {
      write(text) {
        if (!shared) { writeSheet(sheet, text, view); return; }
        const own = new Ctor();
        writeSheet(own, text, view);
        const list = [...root.adoptedStyleSheets];
        // A component that reassigned its list dropped the shared copy; the edit still lands.
        setAdopted(root, list.includes(sheet) ? withoutOne(list, sheet, own) : [...list, own]);
        release();
        sheet = own;
      },
      detach() {
        try { setAdopted(root, withoutOne(root.adoptedStyleSheets, sheet)); } catch {}
        release();
      }
    };
  }

  function injectShadowStyle(root, css, data) {
    const mark = (node) => {
      node.dataset.expOwned = '1';
      for (const [key, value] of Object.entries(data || {})) node.dataset[key] = String(value);
      return node;
    };
    const fail = (error) => safeError(Object.assign(error || new Error('Style injection failed'), { code: 'STYLE_INJECTION' }), 'core.style');
    // Adopted sheets stay inside the shadow and still apply when the page CSP
    // blocks <style>. GM_addElement / GM_addStyle are not used here: managers
    // attach those to the document and leak header/nav/button/* onto the site.
    try {
      const adopted = adoptShared(root, css);
      if (adopted) {
        const node = document.createElement('style');
        let current = css;
        Object.defineProperty(node, 'textContent', {
          configurable: true,
          enumerable: true,
          get() { return current; },
          set(value) {
            current = String(value || '');
            try { adopted.write(current); } catch (error) { fail(error); }
          }
        });
        node.remove = () => {
          try { adopted.detach(); } catch {}
          if (node.parentNode) node.parentNode.removeChild(node);
        };
        try { root.append(node); } catch {}
        return mark(node);
      }
    } catch (error) { fail(error); }
    return appendShadowStyle(root, css, data);
  }

  function injectStyle(root, cssText, data = {}) {
    const css = String(cssText || '');
    if (isShadowRoot(root)) return injectShadowStyle(root, css, data);
    const isShadow = false;
    const view = pageView();
    const doc = view.document || document;
    const parent = isShadow ? root : (doc.documentElement || doc.head || doc.body);
    const host = isShadow ? root : doc;
    const sample = isShadow ? root : (doc.body || doc.documentElement);
    const mark = (node) => {
      node.dataset.expOwned = '1';
      for (const [key, value] of Object.entries(data || {})) node.dataset[key] = String(value);
      return node;
    };
    const fail = (error) => safeError(Object.assign(error || new Error('Style injection failed'), { code: 'STYLE_INJECTION' }), 'core.style');
    const handle = (write, detach) => {
      const node = document.createElement('style');
      let current = css;
      Object.defineProperty(node, 'textContent', {
        configurable: true,
        enumerable: true,
        get() { return current; },
        set(value) {
          current = String(value || '');
          try { write(current); } catch (error) { fail(error); }
        }
      });
      node.remove = () => {
        try { detach(); } catch {}
        if (node.parentNode) node.parentNode.removeChild(node);
      };
      parent.append(node);
      return mark(node);
    };
    try {
      if (typeof GM_addElement === 'function') {
        const token = paintToken();
        let live = GM_addElement(parent, 'style', { textContent: withPaintProbe(css, token) });
        if (live && sawPaint(token, sample)) {
          try { live.textContent = ensureMarker(css); } catch {}
          return handle(
            (text) => {
              try { live.textContent = ensureMarker(text); } catch {
                const next = GM_addElement(parent, 'style', { textContent: ensureMarker(text) });
                try { live.remove(); } catch {}
                live = next;
              }
            },
            () => { try { live.remove(); } catch {} }
          );
        }
        try { live?.remove(); } catch {}
      }
    } catch (error) { fail(error); }
    try {
      if (!isShadow && typeof GM_addStyle === 'function') {
        const token = paintToken();
        let live = GM_addStyle(withPaintProbe(css, token));
        if (live && sawPaint(token, sample)) {
          try { live.textContent = ensureMarker(css); } catch {}
          return handle(
            (text) => {
              try { live.textContent = ensureMarker(text); } catch { live = GM_addStyle(ensureMarker(text)); }
            },
            () => { try { live.remove(); } catch {} }
          );
        }
        try { live?.remove(); } catch {}
      }
    } catch (error) { fail(error); }
    try {
      const adopted = adoptConstructable(host, css, sample);
      if (adopted) return handle((text) => adopted.write(text), () => adopted.detach());
    } catch (error) { fail(error); }
    const node = document.createElement('style');
    try { node.textContent = ensureMarker(css); } catch (error) { fail(error); }
    parent.append(node);
    return mark(node);
  }

  function diagnosticSnapshot() {
    return {
      core: { version: VERSION, protocol: PROTOCOL, capabilities: [...CAPABILITIES] },
      products: [...products.values()].map(({ manifest, state }) => ({ id: manifest.id, version: manifest.version, state })),
      metrics: { ...metrics, uptimeMs: Date.now() - metrics.startedAt },
      errors: errors.map(({ source, code, message }) => ({ source, code, message }))
    };
  }

  function focusMenuSurface(surface) { if (!(surface instanceof HTMLElement)) return false; if (!surface.hasAttribute('tabindex')) surface.setAttribute('tabindex', '-1'); surface.style.outline='none'; surface.focus({ preventScroll: true }); return true; }

  addEventListener('pagehide', () => { for (const cleanup of cleanups) { try { cleanup(); } catch {} } }, { once: true });
  return Object.freeze({
    VERSION, PROTOCOL, register, createScheduler, onNavigation, registerLauncher, announce, negotiate, safeError,
    diagnosticSnapshot, diagnostics: diagnosticSnapshot, focusMenuSurface, injectStyle,
    registerFloatingNotice: shared.registerFloatingNotice,
    layoutFloatingNotices: shared.layoutFloatingNotices,
    claimNotice: shared.claimNotice,
    consumeVersionChange: shared.consumeVersionChange,
  });
}

// Shared, local-only compatibility controls.
const ExtraPotionsTools = (() => {
  const PRODUCT_ROOT_IDS = {"thread":"exp-thread-root","dropper":"tdh-root","shift":"exp-shift-root","ward":"exp-ward-root","prisma":"exp-prisma-root"};
  function createPageActions({host,shadow,label,actions,visible=()=>true,preferVideo=false}){
    const bar=document.createElement('div');bar.dataset.expPageActions='1';bar.setAttribute('role','group');bar.setAttribute('aria-label',label+' page actions');
    const style=document.createElement('style');style.textContent=`[data-exp-page-actions]{pointer-events:auto;position:fixed;z-index:2147483500;display:flex;align-items:center;flex-wrap:wrap;gap:5px;max-width:calc(100vw - 24px);padding:5px;border:1px solid var(--theme-muted,#848494);border-radius:5px;background:var(--theme-bg,#18181b);color:var(--theme-text,#efeff1);font:12px/1.4 "Segoe UI",sans-serif;box-sizing:border-box}[data-exp-page-actions][hidden]{display:none!important}[data-exp-page-actions]>strong{font-size:11px;font-weight:600}[data-exp-page-actions]>button{min-height:30px;min-width:0;padding:4px 7px;border:1px solid var(--theme-muted,#848494);border-radius:5px;background:var(--theme-panel,#1f1f23);color:var(--theme-text,#efeff1);font:12px/1.4 "Segoe UI",sans-serif;white-space:normal;cursor:pointer}[data-exp-page-actions]>button:disabled{opacity:.6;cursor:default}[data-exp-page-actions]>button:focus-visible{outline:2px solid var(--theme-accent2,#bf94ff);outline-offset:2px}@media(pointer:coarse){[data-exp-page-actions]>button{min-height:36px}}`;
    const title=document.createElement('strong');title.textContent=label;bar.append(title);
    const buttons=actions.map(action=>{
      const button=document.createElement('button');button.type='button';button.textContent=action.label;bar.append(button);
      button.addEventListener('click',()=>{try{action.run?.();}finally{refresh();}});
      if(action.hold){const release=()=>action.hold(false);button.addEventListener('pointerdown',()=>action.hold(true));for(const event of ['pointerup','pointercancel','pointerleave','blur'])button.addEventListener(event,release);button.addEventListener('keydown',event=>{if([' ','Enter'].includes(event.key)){event.preventDefault();action.hold(true);}});button.addEventListener('keyup',release);}
      return button;
    });
    shadow.append(style);(shadow.querySelector('.exp-core-theme,.cluster')||shadow).append(bar);
    let frame=0,disposed=false;
    const releaseHeld=()=>actions.forEach(action=>action.hold?.(false));
    const visibilityChanged=()=>{if(document.hidden)releaseHeld();};
    addEventListener('blur',releaseHeld);document.addEventListener('visibilitychange',visibilityChanged);
    function refresh(){if(!frame&&!disposed)frame=requestAnimationFrame(layout);}
    function layout(){
      frame=0;if(disposed)return;
      let shown=false;try{shown=host.isConnected&&visible();}catch{}
      if(bar.hidden===shown){if(!shown)actions.forEach(action=>action.hold?.(false));bar.hidden=!shown;document.dispatchEvent(new Event('exp-core:page-actions'));}
      if(!shown)return;
      actions.forEach((action,i)=>{buttons[i].disabled=action.enabled?!action.enabled():false;buttons[i].textContent=action.text?.()||action.label;});
      const bars=Object.values(PRODUCT_ROOT_IDS).map(id=>document.getElementById(id)?.shadowRoot?.querySelector('[data-exp-page-actions]')).filter(node=>node&&!node.hidden);
      const index=Math.max(0,bars.indexOf(bar)),previous=bars.slice(0,index).reduce((sum,node)=>sum+node.getBoundingClientRect().height+5,0);
      const video=preferVideo?[...document.querySelectorAll('video')].map(node=>node.getBoundingClientRect()).find(r=>r.width>100&&r.height>80&&r.bottom>0&&r.bottom<innerHeight-90):null;
      bar.style.left=(video?Math.max(12,Math.min(video.left,innerWidth-bar.getBoundingClientRect().width-12)):12)+'px';
      bar.style.top=(video?Math.min(innerHeight-bar.getBoundingClientRect().height-12,video.bottom+5+previous):Math.max(12,innerHeight-bar.getBoundingClientRect().height-12-previous))+'px';
    }
    for(const event of ['resize','scroll'])addEventListener(event,refresh,{passive:true,capture:event==='scroll'});
    document.addEventListener('exp-core:page-actions',refresh);document.addEventListener('exp-core:coordination',refresh);refresh();document.dispatchEvent(new Event('exp-core:page-actions'));
    return Object.freeze({element:bar,refresh,destroy(){disposed=true;releaseHeld();removeEventListener('blur',releaseHeld);document.removeEventListener('visibilitychange',visibilityChanged);cancelAnimationFrame(frame);for(const event of ['resize','scroll'])removeEventListener(event,refresh,event==='scroll');document.removeEventListener('exp-core:page-actions',refresh);document.removeEventListener('exp-core:coordination',refresh);bar.remove();style.remove();document.dispatchEvent(new Event('exp-core:page-actions'));}});
  }
  function placeDonationPanel(panel, trigger){
    trigger.closest('.menu-head,header')?.after(panel);
    panel.style.cssText='position:static!important;width:100%!important;max-width:100%!important;margin:7px 0;box-shadow:none';
  }
  function createBitcoinDonation(){
    const address='bc1qg4xq63mwu63qc5dnqugk3qtxvulv5p3frjayna8ey8tu8ey4wpxsg92hv3';
    const details=document.createElement('details');details.className='exp-bitcoin-donation';details.style.cssText='margin-top:7px;min-width:0';
    const summary=document.createElement('summary');summary.textContent='₿ Bitcoin';summary.style.cssText='cursor:pointer;font-weight:700;padding:6px;border:1px solid var(--theme-line);border-radius:7px';
    const code=document.createElement('code');code.textContent=address;code.setAttribute('aria-label','Bitcoin donation address');code.style.cssText='display:block;overflow-wrap:anywhere;word-break:break-all;user-select:all;margin:7px 0;font-size:var(--exp-font-size-body,13px);line-height:1.4';
    const status=document.createElement('p');status.setAttribute('role','status');status.style.cssText='margin:5px 0 0;font-size:var(--exp-font-size-small,11px)';
    const copy=button('Copy Bitcoin address',async()=>{try{await navigator.clipboard.writeText(address);status.textContent='Bitcoin address copied.';}catch{status.textContent='Select and copy the address above.';}});copy.style.cssText='width:100%;min-width:0;white-space:normal;border-radius:7px';
    const wallet=document.createElement('a');wallet.href='bitcoin:'+address;wallet.textContent='Open Bitcoin wallet';
    details.append(summary,code,copy,wallet,status);return details;
  }
  function compatibilitySnapshot(){
    const rows=[];const warnings=[];const versions=new Set();
    for(const [id,rootId] of Object.entries(PRODUCT_ROOT_IDS)){
      const markers=[...document.querySelectorAll('[data-exp-diagnostics-product]')].filter(n=>n.dataset.expDiagnosticsProduct===id);
      if(!markers.length)continue;
      const productVersions=[...new Set(markers.map(n=>n.dataset.expProductVersion||'unknown'))];
      const host=document.getElementById(rootId);
      const core=host?.dataset.coreVersion||null;if(core)versions.add(core);
      rows.push({id,versions:productVersions,core,instances:markers.length});
      if(markers.length>1)warnings.push(`More than one ${id.toUpperCase()} instance is active.`);
    }
    if(versions.size>1)warnings.push('Different core versions are active. Update the products and reload this page.');
    return {products:rows,warnings};
  }
  const button=(label,fn)=>{const b=document.createElement('button');b.type='button';b.className='life-btn action';b.textContent=label;b.addEventListener('click',fn);return b;};
  function card(title){const d=document.createElement('details');d.className='exp-tools-card';d.style.cssText='border:1px solid var(--theme-line,var(--line,#777));border-radius:7px;padding:7px;margin-top:8px';const s=document.createElement('summary');s.textContent=title;d.append(s);return d;}
  function createCompatibilityControls(){const d=card('Product compatibility'),out=document.createElement('div');out.setAttribute('aria-live','polite');function refresh(){out.replaceChildren();const value=compatibilitySnapshot();for(const p of value.products){const line=document.createElement('p');line.textContent=`${p.id.toUpperCase()} ${p.versions.join(', ')} · ${p.core?'core '+p.core:'native product UI'}`;out.append(line);}const status=document.createElement('p');status.textContent=value.warnings.join(' ')||'No mixed core versions or duplicate instances detected on this page.';out.append(status);const note=document.createElement('small');note.textContent='Only products running on this page are visible. This is not an online update check.';out.append(note);}d.addEventListener('toggle',()=>{if(d.open)refresh();});d.append(out,button('Refresh compatibility',refresh));return d;}
  function createSuiteSiteControls(){
    const d=card('Site control'),out=document.createElement('div');out.setAttribute('aria-live','polite');
    const toggle=document.createElement('button');toggle.type='button';toggle.className='switch';toggle.setAttribute('role','switch');toggle.setAttribute('aria-label','Pause all ExtraPotions products on this site');toggle.append(document.createElement('span'));
    const row=document.createElement('div');row.className='row';const copy=document.createElement('div');copy.className='copy';const label=document.createElement('strong');label.textContent='Pause all on this site';const help=document.createElement('small');help.className='help';help.textContent='Stops page changes from every active ExtraPotions product while keeping launchers and System recovery menus available.';copy.append(label,help);row.append(copy,toggle);
    function refresh(){const core=ExtraPotionsCore;const paused=Boolean(core.suiteSitePaused());toggle.setAttribute('aria-checked',String(paused));out.replaceChildren();const status=document.createElement('p');status.textContent=paused?'ExtraPotions page features are paused on this site.':'ExtraPotions page features are active on this site.';out.append(status);for(const product of core.suiteSnapshot().products){const line=document.createElement('p'),state=core.latestSuiteState(product.id)?.state;line.textContent=`${product.id.toUpperCase()} · ${paused?'Site paused':state?.status|| (state?.active===false?'Inactive':'Active')}`;out.append(line);}}
    toggle.addEventListener('click',()=>{const core=ExtraPotionsCore;core.setSuiteSitePaused(!core.suiteSitePaused());refresh();});
    const duration=document.createElement('select');duration.setAttribute('aria-label','Temporary suite pause duration');for(const [value,label] of [['15','15 minutes'],['60','1 hour'],['240','4 hours']]){const option=document.createElement('option');option.value=value;option.textContent=label;duration.append(option);}const temporary=button('Pause temporarily',()=>{ExtraPotionsCore.setSuiteSitePaused(true,location.hostname,Number(duration.value));refresh();});
    d.addEventListener('toggle',()=>{if(d.open)refresh();});d.append(row,duration,temporary,out);refresh();return d;
  }
  const productRepositories = Object.freeze({dropper:'Dropper',shift:'SHIFT',prisma:'PRISMA',ward:'WARD',thread:'THREAD'});
  // GitHub prefills an issue from the link; longer links fail, so a large report goes by clipboard.
  const ISSUE_URL_LIMIT=8000;
  const plain=(value,limit=200)=>String(value||'').replace(/https?:\/\/\S+/gi,'[link]').replace(/\S+@\S+/g,'[address]').replace(/\s+/g,' ').trim().slice(0,limit);
  function browserName(agent=''){
    const version=pattern=>(agent.match(pattern)||[])[1];
    const name=version(/Edg\/(\d+)/)?'Edge '+version(/Edg\/(\d+)/):version(/OPR\/(\d+)/)?'Opera '+version(/OPR\/(\d+)/):version(/Firefox\/(\d+)/)?'Firefox '+version(/Firefox\/(\d+)/):version(/Chrome\/(\d+)/)?'Chrome '+version(/Chrome\/(\d+)/):version(/Version\/(\d+)[^ ]* Safari/)?'Safari '+version(/Version\/(\d+)[^ ]* Safari/):'Unknown browser';
    const os=/Windows/.test(agent)?'Windows':/Android/.test(agent)?'Android':/iPhone|iPad/.test(agent)?'iOS':/Mac OS X/.test(agent)?'macOS':/CrOS/.test(agent)?'ChromeOS':/Linux/.test(agent)?'Linux':'Unknown OS';
    return name+' · '+os;
  }
  // The minimum a maintainer needs to triage, small enough to always fit in the issue link.
  // Only settings that differ from the product's defaults are listed.
  function issueSummary(report={},{settings,activity=[]}={}){
    const lines=[],add=(label,value)=>{if(value)lines.push(`- ${label}: ${value}`);};
    const self=report.plugin?.id;
    add('Product',[productRepositories[self]||self,report.plugin?.version].filter(Boolean).join(' ')+(report.technical?.core?.version?' · Core '+report.technical.core.version:''));
    add('Other products on page',(report.plugin?.compatibility?.products||[]).filter(p=>p.id!==self&&p.status==='observed').map(p=>(productRepositories[p.id]||p.id)+' '+(p.versions||[]).join('/')).join(', '));
    const manager=report.technical?.manager;add('Userscript manager',manager?.name?plain(manager.name+' '+(manager.version||''),60):'');
    const env=report.environment||{};add('Browser',env.userAgent?browserName(env.userAgent):'');add('Site',plain(env.hostname,100));
    if(env.viewport)add('Viewport',`${env.viewport.width}×${env.viewport.height} @${env.viewport.pixelRatio}x`);
    if(settings?.current&&settings?.defaults){
      const changed=Object.keys(settings.current).filter(key=>JSON.stringify(settings.current[key])!==JSON.stringify(settings.defaults[key])).slice(0,25);
      add('Settings changed from defaults',changed.map(key=>`${key}: ${plain(JSON.stringify(settings.current[key]),60)}`).join(', ')||'none');
    }
    const errors=[...(report.core?.errors||[]).map(e=>[e.source,e.code,e.message].filter(Boolean).join(' ')),...(report.console?.entries||[]).filter(e=>/error|warn/.test(e.level)).map(e=>e.message||e.text||'')].filter(Boolean).slice(-5);
    if(errors.length)lines.push('- Recent errors:',...errors.map(e=>'  - '+plain(e,200)));
    const recent=activity.map(entry=>plain(entry,120)).filter(Boolean).slice(-5);
    if(recent.length)lines.push('- Recent activity:',...recent.map(e=>'  - '+e));
    return lines.join('\n');
  }
  function productIssueUrl(id, version, {health,diagnostics,copied=false,summary=''}={}) {
    if (!Object.hasOwn(productRepositories,id)) throw new Error('Unknown product');
    const product=productRepositories[id];
    const safeVersion=/^\d+\.\d+\.\d+(?:[-+][a-zA-Z0-9.-]+)?$/.test(String(version))?String(version):'unknown';
    // Status is the product's own plain-language health text with links and addresses removed.
    // Diagnostics are the product's own redacted report, attached only when the person reports.
    const status=health&&plain(health.label)?`\nStatus: ${plain(health.label)}${plain(health.reason)?' - '+plain(health.reason):''}\n`:'';
    const template=`Product: ${product} v${safeVersion}\n${status}\nWhat happened?\n\nSteps to reproduce\n1. \n\nExpected behavior\n\nActual behavior\n\n`+(summary?`Summary (review and remove anything private before submitting)\n${summary}\n\n`:'Browser and userscript manager\n\n');
    const link=body=>'https://github.com/ExtraPotions/'+product+'/issues/new?title='+encodeURIComponent('['+product+' '+safeVersion+'] Issue')+'&body='+encodeURIComponent(body);
    if(diagnostics&&typeof diagnostics==='object'){
      const review='Full diagnostics\n';
      for(const text of [JSON.stringify(diagnostics,null,2),JSON.stringify(diagnostics)]){const url=link(template+review+'```json\n'+text+'\n```\n');if(url.length<=ISSUE_URL_LIMIT)return url;}
      const url=link(template+review+(copied?'The full diagnostics were copied to your clipboard when you selected Report a Problem. Paste them here if asked.\n':'Select Copy Diagnostics and paste the full diagnostics here if asked.\n'));
      if(url.length<=ISSUE_URL_LIMIT||summary.length<=1500)return url;
      return productIssueUrl(id,version,{health,diagnostics,copied,summary:summary.slice(0,1500)});
    }
    return link(template+'Diagnostics (optional)\nSelect Copy Diagnostics, paste them here, and remove anything private.\n');
  }
  const productTimelines=new Map(),resettingProducts=new Set();
  const productDataResetting=id=>resettingProducts.has(id);
  function clearProductData(id, {legacyKeys=[]} = {}) {
    if (!Object.hasOwn(productRepositories,id)) throw new Error('Unknown product');
    resettingProducts.add(id);
    try {
    const owns=key=>key.startsWith(`exp:v3:${id}:`)||legacyKeys.some(base=>key===base||key.startsWith(base+':account:'));
    const known=new Set([`exp:v3:${id}:settings`,`exp:v3:${id}:update-cache`,`exp:v3:${id}:installed-version`,`exp:v3:${id}:last-version-v2`,...legacyKeys]);
    for(const storageName of ['localStorage','sessionStorage']) {
      let storage;try{storage=globalThis[storageName];}catch{throw new Error('Could not access product storage.');}if(!storage)continue;
      for(let i=0;i<storage.length;i++){const key=storage.key(i);if(key&&owns(key))known.add(key);}
      for(const key of known) { try{storage.removeItem(key);}catch{throw new Error('Could not clear '+id+' data. Check browser storage permissions.');} }
    }
    try{if(typeof GM_listValues==='function')for(const key of GM_listValues())if(owns(key))known.add(key);}catch{throw new Error('Could not list product storage.');}
    for(const key of known){if(typeof GM_deleteValue==='function')GM_deleteValue(key);else if(typeof GM_setValue==='function')GM_setValue(key,undefined);}
    productTimelines.delete(id);
    return [...known];
    } catch(error){resettingProducts.delete(id);throw error;}
  }
  // Groups consecutive entries that share a key, keeping the newest time and a count.
  function groupTimelineEntries(entries,key=entry=>entry.reason){
    const groups=[];for(const entry of entries||[]){const k=key(entry),last=groups.at(-1);
      if(last&&last.key===k){last.count++;last.at=Math.max(last.at,Number(entry.at)||0);}else groups.push({...entry,key:k,count:1,at:Number(entry.at)||0});}
    return groups;
  }
  function createProductTimeline(id,getHealth,notify=()=>{},{layout='classic',showActivity=true}={}) {
    if(!Object.hasOwn(productRepositories,id))throw new Error('Unknown product');
    const rows=document.createElement('div');rows.dataset.expProductTimeline='1';
    let disposed=false;
    function render(){rows.replaceChildren();for(const entry of (productTimelines.get(id)||[]).slice().reverse()){
      const line=document.createElement('p');line.textContent=new Date(entry.at).toLocaleTimeString()+' · '+entry.state+' · '+entry.reason;
      line.style.cssText='margin:6px 0;overflow-wrap:anywhere';rows.append(line);
    }}
    async function observedHealth(){const value=await getHealth();if(!disposed&&showActivity){
      const history=productTimelines.get(id)||[];
      const state=String(value?.state||'waiting').slice(0,30),reason=String(value?.reason||'Status unavailable.').replace(/https?:\/\/\S+/gi,'[page]').slice(0,500),last=history.at(-1);
      if(!last||last.state!==state||last.reason!==reason){history.push({at:Date.now(),state,reason});if(history.length>30)history.shift();productTimelines.set(id,history);}
      render();
    }return value;}
    const health=ExtraPotionsCore.createHealthControls(observedHealth,notify);
    if(layout==='grouped'){
      if(!showActivity){
        const status=ExtraPotionsCore.createDisclosure('Status',health.element);status.open=true;
        status.addEventListener('toggle',()=>{if(status.open)health.refresh();});
        return {element:status,dispose(){disposed=true;health.dispose();},refresh:health.refresh};
      }
      // Status stays open so its recovery action is visible; history is one tap away.
      const activity=document.createElement('div');activity.dataset.expProductActivity='1';
      const log=ExtraPotionsCore.createDisclosure('Recent activity',activity,rows);log.dataset.expSystemActivity='1';
      const status=ExtraPotionsCore.createDisclosure('Status',health.element,log);status.open=true;
      status.addEventListener('toggle',()=>{if(status.open)health.refresh();});
      log.addEventListener('toggle',()=>{if(log.open)health.refresh();});
      return {element:status,activity,log,dispose(){disposed=true;health.dispose();},refresh:health.refresh};
    }
    const timeline=ExtraPotionsCore.createDisclosure(id==='dropper'?'Dropper Status':'Product Timeline',health.element,rows);
    timeline.addEventListener('toggle',()=>{if(timeline.open)health.refresh();});
    return {element:timeline,dispose(){disposed=true;health.dispose();},refresh:health.refresh};
  }
  const RESET_ARM_MS=4000;
  function groupedProductSystem({id,version,timeline,diagnostics,preferences,onReset,notify,issueSettings}) {
    const product=productRepositories[id];
    const system=document.createElement('div');system.dataset.expProductSystem=id;system.dataset.expSystemLayout='grouped';
    system.style.cssText='display:grid;grid-template-columns:minmax(0,1fr);gap:8px;min-width:0;max-width:100%;overflow-wrap:anywhere';
    const wide=node=>{node.style.cssText+=';width:100%;min-width:0;white-space:normal;border-radius:7px';return node;};
    const note=text=>{const p=document.createElement('p');p.textContent=text;p.style.cssText='margin:6px 0;font-size:var(--exp-font-size-small,11px);line-height:1.4';return p;};
    // Support: Copy is the everyday action; Show stays available for review.
    const pair=diagnostics.querySelector?.('.action-pair'),buttons=pair?[...pair.querySelectorAll(':scope > button')]:[];
    const copy=buttons.find(b=>/^Copy/.test(b.textContent)),show=buttons.find(b=>/^(Show|Hide)/.test(b.textContent));
    if(copy&&show){pair.insertBefore(show,copy);pair.style.cssText='display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px';ExpMenuHelp.setMenuHelp(copy,'Copy a fresh diagnostic snapshot for troubleshooting. Review it for private data before sharing.');ExpMenuHelp.setMenuHelp(show,'Show or hide the diagnostic snapshot used for troubleshooting.');}
    const output=diagnostics.querySelector?.('pre');if(output)output.style.cssText+=';max-height:240px;overflow:auto';
    const health=()=>({label:timeline.querySelector?.('[data-exp-health-state]')?.textContent||'',reason:timeline.querySelector?.('[data-exp-health-reason]')?.textContent||''});
    // Each report takes a fresh diagnostics report, copies it, and attaches it to the issue when it fits.
    const report=wide(button('Report a Problem',async()=>{
      if(report.disabled)return;report.disabled=true;
      let data=null,copied=false;
      try{const source=typeof ExtraPotionsDiagnostics==='object'?ExtraPotionsDiagnostics.reportSource?.(diagnostics):null;if(source)data=await source();}catch{}
      if(data){try{await navigator.clipboard.writeText(JSON.stringify(data,null,2));copied=true;}catch{}}
      let summary='';
      if(data){try{let settings=null;try{settings=issueSettings?.()||null;}catch{}
        const reason=health().reason.trim(),activity=[...(timeline.querySelectorAll?.('p')||[])].map(p=>p.textContent.trim()).filter(text=>text&&text!==reason).slice(-5);
        summary=issueSummary(data,{settings,activity});}catch{}}
      try{const link=document.createElement('a');link.href=productIssueUrl(id,version,{health:health(),diagnostics:data,copied,summary});link.target='_blank';link.rel='noopener noreferrer';link.click();}
      finally{report.disabled=false;}
    }));
    report.dataset.expSystemReport='1';
    ExpMenuHelp.setMenuHelp(report,'Attaches fresh diagnostics to a GitHub issue. GitHub issues are public; remove private data before submitting.');
    const support=document.createElement('section');support.setAttribute('aria-label','Diagnostics and support');support.append(diagnostics,report);
    // Reset: one tap arms, a second tap within a few seconds confirms. No browser dialogs.
    const resetStatus=note('');resetStatus.setAttribute('role','status');resetStatus.setAttribute('aria-live','polite');
    let armedUntil=0,armTimer=0;
    const reset=wide(button('Reset All Settings',async()=>{
      if(reset.disabled)return;
      if(Date.now()>=armedUntil){
        armedUntil=Date.now()+RESET_ARM_MS;reset.textContent='Tap Again to Reset';reset.dataset.expResetArmed='1';
        resetStatus.textContent=`Tap again within ${RESET_ARM_MS/1000} seconds to permanently reset ${product}.`;
        clearTimeout(armTimer);armTimer=setTimeout(disarm,RESET_ARM_MS);return;
      }
      disarm();reset.disabled=true;
      try{await onReset();notify(product+' reset complete.');}catch{notify('Reset did not complete. Check storage permissions and try again.');}finally{reset.disabled=false;}
    }));
    reset.dataset.expDestructive='1';
    function disarm(){clearTimeout(armTimer);armedUntil=0;reset.textContent='Reset All Settings';delete reset.dataset.expResetArmed;resetStatus.textContent='';}
    reset.style.cssText+=';border:1px solid #ff2438;background:#e11428;color:#fff;font-weight:700';
    ExpMenuHelp.setMenuHelp(reset,`Clears ${product} settings and stored data on this browser. This cannot be undone. Tap twice within 4 seconds to confirm.`);
    const resetCard=document.createElement('section');resetCard.setAttribute('aria-label','Reset settings');resetCard.style.cssText='margin-block-start:12px;padding-block-start:8px';resetCard.append(reset,resetStatus);
    reset.addEventListener('blur',disarm);
    for(const [key,node] of [['status',timeline],['support',support],['preferences',preferences],['reset',resetCard]]){
      if(!node)continue;node.dataset.expSystemItem=key;node.style.minWidth='0';node.style.maxWidth='100%';
      const summary=node.tagName==='DETAILS'?node.querySelector(':scope > summary'):null;if(summary)summary.style.cssText+=';min-height:28px;padding:4px 0;box-sizing:border-box;cursor:pointer';system.append(node);
    }
    return system;
  }
  function createProductSystem({id,version,timeline,diagnostics,preferences,onReset,notify=()=>{},layout='grouped',issueSettings}) {
    if(!Object.hasOwn(productRepositories,id))throw new Error('Unknown product');
    if(layout==='grouped')return groupedProductSystem({id,version,timeline,diagnostics,preferences,onReset,notify,issueSettings});
    const system=document.createElement('div');system.dataset.expProductSystem=id;
    system.style.cssText='display:grid;grid-template-columns:minmax(0,1fr);gap:8px;min-width:0;max-width:100%;overflow-wrap:anywhere';
    const issue=button('Create GitHub Issue',()=>{const link=document.createElement('a');link.href=productIssueUrl(id,version);link.target='_blank';link.rel='noopener noreferrer';link.click();});
    issue.style.cssText='width:100%;min-width:0;white-space:normal;border-radius:7px';
    const reset=button('Reset All Settings',async()=>{
      if(!confirm(`Reset all ${productRepositories[id]} settings and stored product data?`))return;
      if(!confirm(`Confirm permanent reset of ${productRepositories[id]} data. This cannot be undone.`))return;
      reset.disabled=true;
      try{await onReset();notify(productRepositories[id]+' reset complete.');}catch{notify('Reset did not complete. Check storage permissions and try again.');}finally{reset.disabled=false;}
    });
    reset.style.cssText='width:100%;min-width:0;white-space:normal;border:1px solid #ff2438;border-radius:7px;background:#e11428;color:#fff;font-weight:700';
    for(const [key,node] of [['timeline',timeline],['diagnostics',diagnostics],['issue',issue],['preferences',preferences],['reset',reset]]){node.dataset.expSystemItem=key;node.style.minWidth='0';node.style.maxWidth='100%';const summary=node.tagName==='DETAILS'?node.querySelector(':scope > summary'):null;if(summary)summary.style.cssText+=';min-height:28px;padding:4px 0;box-sizing:border-box;cursor:pointer';system.append(node);}
    return system;
  }
  return Object.freeze({createPageActions,issueSummary,productIssueUrl,productDataResetting,clearProductData,groupTimelineEntries,createProductTimeline,createProductSystem,placeDonationPanel,createBitcoinDonation,compatibilitySnapshot,createCompatibilityControls,createSuiteSiteControls});
})();

/* Product sections as one row of tabs. Core opens a section by clicking the product's own
   (hidden) section header, so each product keeps its section code and lazy rendering. */
const ExpMenuTabs = (() => {
  const shortLabels = Object.freeze({ appearance: 'Look', protection: 'Protect' });
  const icons = Object.freeze({ drops: 'gift', streams: 'screen', appearance: 'brush', advanced: 'sliders', system: 'system', highlights: 'sparkle', protection: 'shield', amazon: 'bag' });
  // Disclosures that are inline controls, not groups, stay collapsible.
  // Products use data-exp-collapsible for groups that build expensive content when opened.
  const KEEP_COLLAPSIBLE = 'details';
  // Setting rows for the cards. Rows with the hidden attribute are skipped when finding where a run
  // starts and ends; selectors cannot skip an unbounded number, so up to three hidden rows in a row are bridged.
  const P = '[data-exp-section-tabs][data-exp-section-tabs]', R = ':is(.row,.mini-row,.fl-switch,.setting-row)';
  const V = R + ':not([hidden])', H = R + '[hidden]', HIDDEN = [0, 1, 2, 3].map(n => Array(n).fill(H));
  const AFTER_ROW = ':is(' + HIDDEN.map(h => [V, ...h, '*'].join('+')).join(',') + ')';
  const BEFORE_ROW = HIDDEN.map(h => ['', ...h, V].join('+')).join(',');
  // The doubled attribute outranks Core's content-driven `:host(...) :is(.fl-tool-header,...)` rule,
  // which would otherwise give the hidden headers their full height back.
  const css = `
    [data-exp-section-tabs][data-exp-section-tabs]>.fl-tool-panel>.fl-tool-header,[data-exp-section-tabs][data-exp-section-tabs] nav>.fl-tool-panel>.fl-tool-header{position:absolute!important;width:1px!important;height:1px!important;min-height:0!important;margin:-1px!important;padding:0!important;border:0!important;overflow:hidden!important;clip-path:inset(50%)!important;white-space:nowrap!important}
    [data-exp-section-tabs] .fl-tool-panel{margin:0!important;border:0!important;background:transparent!important}
    [data-exp-section-tabs] .fl-tool-body{padding:0!important}
    .exp-section-tabs{display:flex;gap:2px;margin:0 0 2px;padding:3px;border-radius:9px;background:var(--exp-menu-track,#18181b);min-width:0}
    .exp-section-tabs>[role=tab]{flex:1 1 auto;display:flex;align-items:center;justify-content:center;gap:4px;min-width:0;min-height:28px;padding:4px 2px;border:0;border-radius:7px;background:transparent;color:var(--theme-muted);font:500 calc(var(--exp-font-size-small,12px) - .5px)/1.2 Inter,"Segoe UI",system-ui,sans-serif;white-space:nowrap;cursor:pointer}
    .exp-section-tabs>[role=tab]:hover{color:var(--theme-text)}
    .exp-section-tabs>[role=tab][aria-selected=true]{background:var(--theme-line);color:var(--theme-text);box-shadow:inset 0 -2px 0 var(--theme-accent)}
    .exp-section-tabs>[role=tab]:focus-visible{outline:2px solid var(--theme-accent);outline-offset:1px}
    .exp-section-tabs .exp-section-icon{flex:0 0 12px;transform:scale(.8)}
    .exp-section-tabs .exp-section-icon:not([data-icon]){display:none}
    .exp-section-tabs .exp-section-tab-label{overflow:hidden;text-overflow:ellipsis}
    .exp-section-tabs[data-compact="1"] .exp-section-icon[data-icon]+.exp-section-tab-label{display:none}
    @media(forced-colors:active){.exp-section-tabs>[role=tab][aria-selected=true]{border-bottom:2px solid Highlight}}
    [data-exp-section-tabs] details[data-exp-flat]{border:0!important;padding:0!important;margin:0!important;background:transparent!important}
    [data-exp-section-tabs] details[data-exp-flat]>summary{display:block!important;margin:14px 0 6px!important;padding:0!important;list-style:none!important;color:var(--theme-muted)!important;font:500 calc(var(--exp-font-size-small,12px) - 1px)/1.3 Inter,"Segoe UI",system-ui,sans-serif!important;pointer-events:none!important}
    [data-exp-section-tabs] details[data-exp-flat]>summary::before,[data-exp-section-tabs] details[data-exp-flat]>summary::after{display:none!important}
    [data-exp-section-tabs] details[data-exp-flat]>summary::-webkit-details-marker{display:none}
    /* Setting rows sit flat on the menu. A light divider separates neighbouring rows; a run of rows keeps its outer spacing. */
    ${P} ${V}{margin:0!important;padding:9px 0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important}
    ${P} ${V}:not(${AFTER_ROW}):not(:nth-child(1 of :not([hidden]))){margin-top:6px!important}
    ${P} ${V}${AFTER_ROW}{border-top:1px solid var(--theme-line)!important}
    ${P} ${V}:not(:has(${BEFORE_ROW})):has(~:not([hidden])){margin-bottom:10px!important}
    /* A flex or grid gap would open a run between its rows, so a parent of a run with several rows has none.
       Other children of that parent keep a 6px space; the zero-specificity rule yields to any margin a product sets. */
    ${P} :has(>${V}${AFTER_ROW}){row-gap:0!important}
    :where(${P} :has(>${V}${AFTER_ROW})>:not(${R}):not(${R}+*):not(:nth-child(1 of :not([hidden])))){margin-top:6px}
  `;
  const read = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const write = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
  const isOpen = entry => !entry.body.hidden && !entry.body.classList.contains('fl-tool-hidden');
  const FOCUSABLE = 'a[href],button,input,select,textarea,summary,[tabindex],[contenteditable]';
  let serial = 0;

  function mount({ panel, id, entries }) {
    const document = panel.ownerDocument, view = document.defaultView;
    const style = document.createElement('style'); style.textContent = css;
    const styleRoot = panel.getRootNode();
    (styleRoot instanceof view.ShadowRoot ? styleRoot : (document.head || document.documentElement)).append(style);
    const storageKey = 'exp:suite:menu-tab:' + id;
    const list = document.createElement('div');
    list.className = 'exp-section-tabs'; list.dataset.expSectionTabs = '1';
    list.setAttribute('role', 'tablist'); list.setAttribute('aria-label', 'Sections');
    const saved = new Map(), tabStops = new Map();
    // Hidden headers and flattened group labels are not controls anyone can see; the tabs replace them.
    function untab(node) { if (!tabStops.has(node)) tabStops.set(node, node.getAttribute('tabindex')); node.setAttribute('tabindex', '-1'); }
    function retab(node) {
      if (!tabStops.has(node)) return;
      const before = tabStops.get(node); tabStops.delete(node);
      if (before === null) node.removeAttribute('tabindex'); else node.setAttribute('tabindex', before);
    }
    const tabs = entries.map(entry => {
      const index = ++serial, slug = entry.label.toLowerCase();
      const tab = document.createElement('button');
      tab.type = 'button'; tab.id = 'exp-section-tab-' + index; tab.dataset.expSectionTab = entry.key;
      // The accessible name is the word on the tab, so voice control and screen readers match what is seen.
      const name = id==='shift'&&slug==='appearance'&&entries.some(item=>item.label==='Look')?'Appearance':shortLabels[slug] || entry.label;
      tab.setAttribute('role', 'tab'); tab.setAttribute('aria-label', name);
      if (!entry.body.id) entry.body.id = 'exp-section-panel-' + index;
      tab.setAttribute('aria-controls', entry.body.id);
      const icon = document.createElement('span'); icon.className = 'exp-section-icon'; icon.setAttribute('aria-hidden', 'true');
      if (icons[slug]) icon.dataset.icon = icons[slug];
      const text = document.createElement('span'); text.className = 'exp-section-tab-label'; text.textContent = name;
      tab.append(icon, text); list.append(tab);
      saved.set(entry, { tabindex: entry.header.getAttribute('tabindex'), hidden: entry.header.getAttribute('aria-hidden'), role: entry.body.getAttribute('role'), labelledby: entry.body.getAttribute('aria-labelledby') });
      entry.header.setAttribute('tabindex', '-1'); entry.header.setAttribute('aria-hidden', 'true');
      entry.body.setAttribute('role', 'tabpanel'); entry.body.setAttribute('aria-labelledby', tab.id);
      return tab;
    });
    panel.dataset.expSectionTabs = '1';
    let syncing = false, disposed = false, queued = false;
    const visible = () => !panel.hidden && panel.getClientRects().length > 0;

    const workspace=document.createElement('div'),rail=document.createElement('div'),content=document.createElement('div');
    workspace.className='exp-menu-workspace';rail.className='exp-menu-rail';content.className='exp-menu-content';
    list.setAttribute('aria-orientation','vertical');
    function place() {
      if(workspace.parentNode)return;
      const parent=entries[0].section.parentElement;if(!parent)return;
      parent.insertBefore(workspace,entries[0].section);rail.append(list);content.append(...entries.map(entry=>entry.section));workspace.append(rail,content);
    }
    function flatten() {
      for (const entry of entries) for (const details of entry.body.querySelectorAll('details')) {
        // A group can become an inner-tab item after it was flattened; inner tabs own it then.
        if (details.matches(KEEP_COLLAPSIBLE)) { if (details.dataset.expFlat) delete details.dataset.expFlat; continue; }
        details.dataset.expFlat = '1';
        if (!details.open) details.open = true;
      }
      for (const [node] of tabStops) if (node.matches('summary') && !node.matches('details[data-exp-flat]>summary')) retab(node);
      for (const entry of entries) {
        entry.header.querySelectorAll(FOCUSABLE).forEach(untab);
        entry.body.querySelectorAll('details[data-exp-flat]>summary').forEach(untab);
      }
    }
    // A flattened group label stays open: clicking it, or Enter or Space on it, does nothing.
    const guard = event => {
      const summary = event.target.closest?.('summary');
      if (summary && summary === event.target.closest(FOCUSABLE) && summary.matches('details[data-exp-flat]>summary')) event.preventDefault();
    };
    // Tabs shrink with an ellipsis instead of overflowing the row, so a label that no longer
    // fits is the signal to drop to icons.
    function compact() {
      list.dataset.compact = '0';
      const clipped = list.scrollWidth > list.clientWidth + 1 || [...list.querySelectorAll('.exp-section-tab-label')].some(label => label.scrollWidth > label.clientWidth + 1);
      list.dataset.compact = clipped ? '1' : '0';
    }
    function open(index) { if (entries[index] && !isOpen(entries[index])) entries[index].header.click(); }
    function sync() {
      if (syncing || disposed) return;
      syncing = true;
      try {
        place();
        const nowVisible = visible();
        let active = entries.findIndex(isOpen);
        if (nowVisible) {
          // Products close their sections as the menu opens, so the remembered tab is restored then.
          // A section the product opened itself, the first one included, is kept.
          if (active < 0) { const remembered = entries.findIndex(entry => entry.key === read(storageKey)); open(remembered >= 0 ? remembered : 0); }
          active = entries.findIndex(isOpen);
        }
        tabs.forEach((tab, i) => { const on = i === active; tab.setAttribute('aria-selected', String(on)); tab.tabIndex = on || (active < 0 && i === 0) ? 0 : -1; });
        flatten();
        if (nowVisible) compact();
      } finally { syncing = false; }
    }
    function select(index, focus = false) {
      if (!entries[index]) return;
      write(storageKey, entries[index].key);
      open(index); sync();
      if (focus) tabs[index].focus();
    }
    const click = event => { const index = tabs.indexOf(event.target.closest('[role=tab]')); if (index >= 0) select(index); };
    const keydown = event => {
      const current = tabs.indexOf(event.target); if (current < 0) return;
      const last = tabs.length - 1;
      const index = ['ArrowRight','ArrowDown'].includes(event.key) ? (current + 1) % tabs.length : ['ArrowLeft','ArrowUp'].includes(event.key) ? (current + last) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? last : -1;
      if (index < 0) return;
      event.preventDefault(); select(index, true);
    };
    list.addEventListener('click', click); list.addEventListener('keydown', keydown); panel.addEventListener('click', guard, true);
    const observer = new view.MutationObserver(() => { if (!queued && !disposed) { queued = true; queueMicrotask(() => { queued = false; sync(); }); } });
    observer.observe(panel, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'class', 'aria-expanded', 'open'] });
    const resize = new view.ResizeObserver(() => { if (visible()) compact(); }); resize.observe(panel);
    sync();
    return {
      update: sync,
      select: key => select(entries.findIndex(entry => entry.key === key)),
      destroy() {
        disposed = true; observer.disconnect(); resize.disconnect();
        list.removeEventListener('click', click); list.removeEventListener('keydown', keydown); panel.removeEventListener('click', guard, true);for(const entry of entries)workspace.before(entry.section);workspace.remove();list.remove();style.remove();
        for (const [node] of tabStops) retab(node);
        delete panel.dataset.expSectionTabs;
        for (const [entry, before] of saved) {
          for (const [node, name, value] of [[entry.header, 'tabindex', before.tabindex], [entry.header, 'aria-hidden', before.hidden], [entry.body, 'role', before.role], [entry.body, 'aria-labelledby', before.labelledby]]) {
            if (value === null) node.removeAttribute(name); else node.setAttribute(name, value);
          }
          entry.body.querySelectorAll('details[data-exp-flat]').forEach(details => delete details.dataset.expFlat);
        }
      },
    };
  }
  return Object.freeze({ mount });
})();

// Shared ExtraPotions menu categories, submenu behavior, reordering, and visibility.
const ExpMenuArrangement = (() => {
  const CATEGORY_ORDER = Object.freeze(['main', 'appearance', 'advanced', 'system']);
  const CATEGORY_META = Object.freeze({
    main: Object.freeze({ id: 'main', label: 'Main', order: 0 }),
    appearance: Object.freeze({ id: 'appearance', label: 'Appearance', order: 1 }),
    advanced: Object.freeze({ id: 'advanced', label: 'Advanced', order: 2 }),
    system: Object.freeze({ id: 'system', label: 'System', order: 3 }),
  });
  const PRODUCT_SECTIONS = {"thread":{"main":["feed","read"],"appearance":["look"],"advanced":["filters","people"],"system":["system"]},"dropper":{"main":["drops","streams","campaigns","settings"],"appearance":["appearance"],"advanced":["advanced"],"system":["system"]},"shift":{"appearance":["appearance","readability"],"advanced":["effects","effects-integrations","profiles","profiles-sites"],"system":["system"]},"ward":{"main":["protection","amazon","tools"],"appearance":["appearance"],"advanced":["advanced","patterns","advanced-amazon"],"system":["system"]},"prisma":{"main":["page","highlights"],"appearance":["style","highlight-style","look","appearance"],"advanced":["tools","language","sites"],"system":["system"]}};
  const GENERIC_SECTIONS = Object.freeze({
    appearance: Object.freeze(['appearance', 'readability', 'style', 'highlight-style', 'look', 'theme', 'themes']),
    advanced: Object.freeze(['advanced', 'effects', 'integrations', 'profiles', 'sites', 'language', 'patterns', 'routing', 'playback']),
    system: Object.freeze(['system', 'settings', 'diagnostics', 'maintenance', 'recovery']),
  });
  const slug = value => String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const categoryList = Object.freeze(CATEGORY_ORDER.map(id => CATEGORY_META[id]));

  function categoryFor(productId, section = {}, index = 0) {
    const product = slug(productId);
    const key = slug(section.key || section.id || section.route);
    const label = slug(section.label || section.name || section.title);
    const tokens = new Set([key, label].filter(Boolean));
    const profile = PRODUCT_SECTIONS[product] || {};
    for (const category of CATEGORY_ORDER) {
      const aliases = profile[category] || [];
      if (aliases.some(alias => tokens.has(slug(alias)))) return category;
    }
    for (const category of ['system', 'appearance', 'advanced']) {
      if (GENERIC_SECTIONS[category].some(alias => tokens.has(slug(alias)))) return category;
    }
    if (index === 0) return 'main';
    return 'main';
  }

  function describe(productId, sections = []) {
    const groups = new Map(CATEGORY_ORDER.map(id => [id, {
      ...CATEGORY_META[id],
      sections: [],
    }]));
    sections.forEach((section, index) => {
      const category = categoryFor(productId, section, index);
      groups.get(category).sections.push(section);
    });
    return CATEGORY_ORDER.map(id => groups.get(id)).filter(group => group.sections.length);
  }

  function createDisclosure({ document, label, category = 'advanced', key = '', contents = [], className = 'exp-system-card' } = {}) {
    if (!document?.createElement) throw new Error('Menu disclosure requires a document');
    const details = document.createElement('details');
    details.className = className;
    details.dataset.expMenuSubmenu = '1';
    details.dataset.expMenuCategory = CATEGORY_META[category] ? category : 'advanced';
    if (key) details.dataset.expMenuKey = slug(key);
    details.open = false;
    // Core created this submenu in its canonical collapsed state. Mark it initialized
    // immediately so a later arrangement refresh cannot re-collapse a user-opened
    // disclosure during the same interaction.
    details.dataset.expMenuInitialized = '1';
    const summary = document.createElement('summary');
    summary.textContent = String(label || CATEGORY_META[category]?.label || 'Advanced');
    details.append(summary, ...contents);
    return details;
  }

  function collapseSubmenus(root) {
    if (!root?.querySelectorAll) return;
    for (const details of root.querySelectorAll('details[data-exp-menu-submenu]')) {
      if (details.dataset.expMenuInitialized === '1') continue;
      details.open = false;
      details.dataset.expMenuInitialized = '1';
    }
  }

  const css = `
    [data-exp-menu-submenu]{box-sizing:border-box;min-width:0;max-width:100%;overflow-wrap:anywhere}
    [data-exp-menu-submenu]>summary{cursor:pointer}
  `;

  let tabSerial = 0;
  const tabCss = `
    [data-exp-submenu-tabs]{min-width:0;grid-column:1/-1}
    .exp-submenu-home,.exp-submenu-detail{min-width:0;max-width:100%}
    .exp-submenu-home[hidden],.exp-submenu-detail[hidden]{display:none!important}
    .exp-submenu-nav{display:grid;min-width:0}
    .exp-submenu-home>.exp-submenu-tabpanel+.exp-submenu-nav{margin-top:8px;border-top:1px solid var(--theme-line)}
    .exp-submenu-row{display:grid;grid-template-columns:minmax(0,1fr) 14px;align-items:center;gap:10px;width:100%;min-width:0;min-height:40px;margin:0!important;padding:8px 2px!important;text-align:left;font:600 var(--exp-font-size-body,13px)/1.4 "Segoe UI",system-ui,sans-serif!important;color:var(--theme-text);background:transparent!important;border:0!important;border-top:1px solid var(--theme-line)!important;border-radius:0!important;box-shadow:none!important;cursor:pointer;overflow-wrap:anywhere}
    .exp-submenu-nav>.exp-submenu-row:first-child{border-top:0!important}
    .exp-submenu-row:hover>span{color:var(--theme-accent)}
    .exp-submenu-row>svg,.exp-submenu-back>svg{width:14px;height:14px;color:var(--theme-muted);flex:none}
    .exp-submenu-back{display:flex;align-items:center;gap:6px;min-height:36px;margin:0!important;padding:4px 4px 4px 0!important;font:600 var(--exp-font-size-body,13px)/1.4 "Segoe UI",system-ui,sans-serif!important;color:var(--theme-muted);background:transparent!important;border:0!important;box-shadow:none!important;cursor:pointer}
    .exp-submenu-back:hover{color:var(--theme-text)}
    .exp-submenu-title{margin:2px 0 8px;font:700 14px/1.35 "Segoe UI",system-ui,sans-serif;color:var(--theme-text);overflow-wrap:anywhere}
    .exp-submenu-row:focus-visible,.exp-submenu-back:focus-visible{outline:2px solid var(--theme-accent2,var(--theme-accent));outline-offset:2px}
    .exp-submenu-tabpanel{min-width:0;max-width:100%}
    .exp-submenu-tabpanel[hidden]{display:none!important}
    .exp-submenu-tabpanel>[data-exp-tab-item]{margin-top:0!important}
    .exp-submenu-tabpanel>details[data-exp-tab-item]{border:0!important;padding:0!important;background:transparent!important}
    .exp-submenu-tabpanel>details[data-exp-tab-item]>summary{display:none!important}
    @media(pointer:coarse){.exp-submenu-row,.exp-submenu-back{min-height:44px}}
  `;
  const chevron = (document, back) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 16 16');svg.setAttribute('aria-hidden', 'true');svg.setAttribute('focusable', 'false');
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    line.setAttribute('d', back ? 'M10 3 5 8l5 5' : 'm6 3 5 5-5 5');line.setAttribute('fill', 'none');line.setAttribute('stroke', 'currentColor');line.setAttribute('stroke-width', '1.8');line.setAttribute('stroke-linecap', 'round');line.setAttribute('stroke-linejoin', 'round');
    svg.append(line);return svg;
  };
  const shortLabels = Object.freeze({
    'highlight-style':'Style', 'menu-preferences':'Menu', 'settings-transfer':'Transfer',
    'effects-and-integrations':'Effects', 'profiles-and-sites':'Profiles', 'page-tools':'Page',
    'retailer-modules':'Retailers', 'protection-review':'Review', 'page-activity':'Activity',
  });
  function tabLabel(node) {
    // Existing primary sections stay together in Overview. Only submenu
    // disclosures become tabs; status chips and inline explanations stay local.
    if(node.tagName!=='DETAILS'||node.matches('.eligibility-chip,[data-shift-appearance-explanation]'))return null;
    const title = node.querySelector(':scope>summary,:scope>h3,:scope>h2');
    const label = (title?.querySelector('.campaign-manager-title')||title)?.textContent.trim();
    if (!label) return null;
    return shortLabels[slug(label)] || label;
  }
  function mountTabs({panel,id,onChange=()=>{}}) {
    const document=panel.ownerDocument,view=document.defaultView;
    const style=document.createElement('style');style.textContent=tabCss;
    const styleRoot=panel.getRootNode();
    (styleRoot instanceof view.ShadowRoot?styleRoot:(document.head||document.documentElement)).append(style);
    const mounted=new Map(),selection=new Map();let disposed=false,queued=false;
    function groupsFor(container) {
      const groups=new Map(),home=[];
      const add=(label,node)=>{if(!groups.has(label))groups.set(label,[]);groups.get(label).push(node);};
      const stream=id==='dropper'&&container.id==='tdh-streams-body';
      const drops=id==='dropper'&&container.id==='tdh-drops-body';
      const retailer=id==='ward'&&container.id==='exp-ward-view-tools';
      for(const node of [...container.children]) {
        if(node.matches('style,script,[data-exp-submenu-tabs],.badge-only-progress-slot'))continue;
        // Everyday controls stay on the home view; each submenu disclosure becomes
        // a row that opens its own detail view.
        if(drops&&node.id==='tdh-open-campaigns'){home.push(node);continue;}
        let label=tabLabel(node);
        // System status stays open on the home view so recovery actions remain in sight.
        if(!label||(id!=='dropper'&&node.matches('[data-exp-system-item="status"]'))){home.push(node);continue;}
        if(stream){
          const key=slug(node.querySelector(':scope>summary')?.textContent);
          label=key==='playback-options'?'Playback':key==='notifications'?'Alerts':node.id==='tdh-routing-history-panel'||['routing-and-backup','interruption-rules','why-did-it-switch'].includes(key)?'Routing':label;
        } else if(drops){
          label=node.id==='tdh-open-campaigns'?'Campaigns':node.id==='tdh-claim-history-panel'?'History':label;
        } else if(retailer){
          label=label.startsWith('Advanced ')?'Patterns':['Page','Transfer'].includes(label)?'Tools':label;
        }
        add(label,node);
      }
      const order=stream?['Stream Health','Playback','Routing','Alerts']:drops?['Campaigns','History']:retailer?['Seller clarity','Coverage','Retailers','Patterns','Tools']:['Page'];
      const rows=[...new Set([...order,...groups.keys()])].filter(label=>groups.has(label)).map(label=>({label,nodes:groups.get(label)}));
      return {home,rows};
    }
    function mountContainer(container,key) {
      const {home,rows}=groupsFor(container);if(!rows.length||rows.length+(home.length?1:0)<2)return false;
      const original=[...container.childNodes];
      const root=document.createElement('div');root.dataset.expSubmenuTabs='1';
      const homeView=document.createElement('div');homeView.className='exp-submenu-home';
      const nav=document.createElement('div');nav.className='exp-submenu-nav';
      const detail=document.createElement('div');detail.className='exp-submenu-detail';
      const backButton=document.createElement('button');backButton.type='button';backButton.className='exp-submenu-back';backButton.append(chevron(document,true),'Back');
      const title=document.createElement('div');title.className='exp-submenu-title';title.setAttribute('role','heading');title.setAttribute('aria-level','3');
      detail.append(backButton,title);
      const panel=label=>{const body=document.createElement('div');body.id='exp-submenu-panel-'+(++tabSerial);body.className='exp-submenu-tabpanel';body.setAttribute('role','region');body.setAttribute('aria-label',label+' settings');return body;};
      const homePanel=panel('Overview'),navRows=[],panels=[],detailsState=new Map();
      for(const node of home){if(tabLabel(node)){node.dataset.expTabItem='1';detailsState.set(node,node.open);}homePanel.append(node);}
      // Back owns the home panel so a product can reveal any control by clicking
      // the element whose aria-controls names the panel that holds it.
      backButton.setAttribute('aria-controls',homePanel.id);
      homeView.append(...(home.length?[homePanel,nav]:[nav]));
      for(const {label,nodes} of rows){
        const body=panel(label),button=document.createElement('button'),text=document.createElement('span');
        button.type='button';button.className='exp-submenu-row';button.setAttribute('aria-controls',body.id);button.setAttribute('aria-expanded','false');
        text.textContent=label;button.append(text,chevron(document,false));
        for(const node of nodes){node.dataset.expTabItem='1';detailsState.set(node,node.open);body.append(node);}
        body.hidden=true;navRows.push(button);panels.push(body);nav.append(button);detail.append(body);
      }
      root.append(homeView,detail);
      let active=-1;
      function show(index,focus=null){
        active=index;selection.set(key,index<0?null:rows[index].label);
        homeView.hidden=index>=0;detail.hidden=index<0;
        panels.forEach((body,i)=>{body.hidden=i!==index;navRows[i].setAttribute('aria-expanded',String(i===index));});
        title.textContent=index<0?'':rows[index].label;
        syncOpen();
        focus?.focus();onChange();
      }
      function syncOpen(){const visible=container.getClientRects().length>0&&!container.closest('[hidden],.fl-tool-hidden')&&view.getComputedStyle(container).visibility!=='hidden';[homePanel,...panels].forEach(body=>{const shown=body===homePanel?!homeView.hidden:!body.hidden;for(const node of body.children)if(detailsState.has(node)){const open=visible&&shown;if(node.open!==open)node.open=open;}});}
      function goBack(){const from=navRows[active];show(-1,from);}
      function click(event){
        const button=event.target.closest('button');
        if(button===backButton){if(active>=0)goBack();return;}
        const index=navRows.indexOf(button);if(index>=0)show(index,backButton);
      }
      function keydown(event){
        if(event.key!=='Escape'||active<0||event.defaultPrevented||event.target.closest?.('select'))return;
        // Leave the detail view instead of letting the menu's own Escape close it.
        event.preventDefault();event.stopPropagation();goBack();
      }
      root.addEventListener('click',click);root.addEventListener('keydown',keydown);
      const progressSlot=container.querySelector(':scope>.badge-only-progress-slot');
      container.replaceChildren(...(progressSlot?[progressSlot,root]:[root]));
      show(rows.findIndex(row=>row.label===selection.get(key)));
      mounted.set(container,{root,syncOpen,destroy(restore){root.removeEventListener('click',click);root.removeEventListener('keydown',keydown);for(const node of detailsState.keys())delete node.dataset.expTabItem;if(restore){for(const [node,open]of detailsState)node.open=open;container.replaceChildren(...original);}}});
      return true;
    }
    function update(){
      if(disposed)return;
      for(const [container,controller]of mounted)if(!panel.contains(container)||controller.root.parentElement!==container){controller.destroy(false);mounted.delete(container);}
      for(const container of panel.querySelectorAll('.fl-tool-body,.route-body,[data-exp-product-system]')){
        // System's grouped contents own their tabs rather than its outer wrapper.
        if(container.querySelector(':scope>[data-exp-product-system]')||mounted.has(container))continue;
        const key=container.id||container.dataset.expProductSystem||container.closest('section')?.querySelector('.fl-tool-title')?.textContent||'submenu';
        mountContainer(container,key);
      }
      for(const controller of mounted.values())controller.syncOpen();
    }
    const observer=new view.MutationObserver(()=>{if(!queued&&!disposed){queued=true;queueMicrotask(()=>{queued=false;update();});}});
    update();observer.observe(panel,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class','aria-expanded']});
    return {update,destroy(){disposed=true;observer.disconnect();for(const [container,controller]of mounted)controller.destroy(controller.root.parentElement===container);mounted.clear();selection.clear();style.remove();}};
  }

  // Tags each menu section with its category and keeps sections in category
  // order (Main, Appearance, Advanced, System). Sections keep their own order
  // inside a category; there is nothing for the user to arrange or hide.
  function mount({ panel, id, onChange = () => {} }) {
    const document = panel.ownerDocument, view = document.defaultView;
    collapseSubmenus(panel);
    const entries = [...panel.querySelectorAll(':scope .fl-tool-panel')].filter(section => section.parentElement === panel || section.parentElement?.closest('.fl-tool-panel') === null).map(section => {
      const header = section.querySelector(':scope>.fl-tool-header');
      const body = section.querySelector(':scope>.fl-tool-body');
      if (!header || !body) return null;
      const label = (header.querySelector('.fl-tool-title') || header).textContent.replace(/[▸▾›]/g, '').trim();
      const key = header.dataset.route || header.dataset.section || header.dataset.panel || body.id;
      return { section, header, body, label, key };
    }).filter(entry => entry?.key);
    // Compact menus retain the product's native inline disclosures and lazy toggle handlers.
    const tabs={update(){},destroy(){}};
    const none = { update() { collapseSubmenus(panel);tabs.update(); }, select() {}, describe: () => [], destroy() {tabs.destroy();} };
    if (entries.length < 2) return none;
    const parent = entries[0].section.parentElement;
    if (entries.some(entry => entry.section.parentElement !== parent)) return none;
    entries.forEach((entry, index) => {
      entry.category = categoryFor(id, entry, index);
      entry.section.dataset.expMenuCategory = entry.category;
    });
    const style = document.createElement('style'); style.textContent = css;
    const styleRoot = panel.getRootNode();
    (styleRoot instanceof view.ShadowRoot ? styleRoot : (document.head || document.documentElement)).append(style);
    const rank = entry => CATEGORY_ORDER.indexOf(entry.category);
    const desired = [...entries].sort((a, b) => rank(a) - rank(b));
    function apply() {
      const present = entries.filter(entry => entry.section.parentElement === parent);
      const wanted = desired.filter(entry => present.includes(entry));
      const current = [...parent.children].filter(node => wanted.some(entry => entry.section === node));
      const after = current.length ? current.at(-1).nextSibling : null;
      for (const entry of wanted) parent.insertBefore(entry.section, after);
      onChange();
    }
    apply();
    const sectionTabs = ExpMenuTabs.mount({ panel, id, entries: desired });
    return {
      update() { collapseSubmenus(panel); tabs.update(); sectionTabs.update(); },
      select: key => sectionTabs.select(key),
      describe: () => describe(id, entries.map(({ key, label, category }) => ({ key, label, category }))),
      destroy() {
        sectionTabs.destroy();
        tabs.destroy();
        style.remove();
        entries.forEach(entry => { delete entry.section.dataset.expMenuCategory; });
      }
    };
  }

  return Object.freeze({
    categories: categoryList,
    categoryFor,
    describe,
    createDisclosure,
    collapseSubmenus,
    mount,
    mountTabs,
  });
})();

/* Plain health facts and safe, product-owned actions. */
const ExpHealthSummary = (() => {
  const labels = Object.freeze({working:'Working',waiting:'Waiting',paused:'Paused',attention:'Needs attention'});
  function normalizeHealth(value) {
    const valid = value && Object.hasOwn(labels, value.state);
    const state = valid ? value.state : 'waiting';
    const checkedAt = Number(value?.checkedAt);
    return {state,label:labels[state],reason:valid && typeof value.reason === 'string' ? value.reason.slice(0,500) : 'Status information is not available yet.',
      checkedAt:Number.isFinite(checkedAt) && checkedAt > 0 ? checkedAt : null,
      action:valid && typeof value.action?.label === 'string' && typeof value.action.run === 'function' ? {label:value.action.label.slice(0,80),run:value.action.run} : null};
  }
  function createHealthControls(getHealth, notify = () => {}) {
    const element=document.createElement('section');element.className='exp-health';element.dataset.expHealth='1';
    element.style.cssText='margin:0 0 10px;padding:8px;border:1px solid var(--theme-line);border-radius:7px;background:var(--theme-inset);min-width:0;overflow-wrap:anywhere';
    const state=document.createElement('strong'),reason=document.createElement('p'),checked=document.createElement('small'),action=document.createElement('button');
    state.dataset.expHealthState='1';reason.dataset.expHealthReason='1';reason.style.cssText='margin:5px 0;line-height:1.4';checked.style.cssText='display:block;margin-bottom:4px';
    action.type='button';action.className='life-btn action';action.hidden=true;
    element.append(state,reason,checked,action);
    let generation=0,disposed=false,pending=false,current=null;
    function render(value) {current=normalizeHealth(value);state.textContent=current.label;reason.textContent=current.reason;checked.textContent=current.checkedAt?`Checked ${new Date(current.checkedAt).toLocaleTimeString()}`:'Not checked yet';action.textContent=current.action?.label||'';action.hidden=!current.action;action.disabled=pending;}
    async function refresh() {
      if(disposed)return;const ticket=++generation;
      try {const value=await getHealth();if(!disposed&&ticket===generation)render(value);}
      catch {if(!disposed&&ticket===generation)render(null);}
    }
    const click=async()=>{
      if(disposed||pending||!current?.action)return;
      const run=current.action.run;pending=true;action.disabled=true;
      try {await run();}catch {if(!disposed)notify('The recovery action did not complete. Open diagnostics for details.');}
      finally {pending=false;if(!disposed){action.disabled=false;await refresh();}}
    };
    element.refreshHealth=refresh;state.setAttribute('role','status');
    action.addEventListener('click',click);render(null);refresh();
    return {element,refresh,dispose(){disposed=true;++generation;action.removeEventListener('click',click);}};
  }
  return Object.freeze({normalizeHealth,createHealthControls});
})();

/* Feature/context isolation and bounded single-flight recovery. */
const ExpRecoveryControl = (() => {
  function createRecoveryGuard({limit=3,windowMs=120000,now=Date.now}={}) {
    const contexts=new Map();let disposed=false;
    const record=(feature,context)=>{let features=contexts.get(context);if(!features){features=new Map();contexts.set(context,features);}let value=features.get(feature);if(!value){value={times:[],suspended:false,retryPending:false,lastFailureAt:null};features.set(feature,value);}return value;};
    const view=value=>({suspended:value.suspended,consecutiveFailures:value.times.length,retryPending:value.retryPending,lastFailureAt:value.lastFailureAt});
    function failed(feature,context){const value=record(feature,context),time=now();value.times=value.times.filter(at=>time-at<=windowMs);value.times.push(time);value.times=value.times.slice(-limit);value.lastFailureAt=time;if(value.times.length>=limit)value.suspended=true;return view(value);}
    function succeeded(feature,context){const value=record(feature,context);value.times=[];value.suspended=false;return view(value);}
    async function retry(feature,context,run){
      if(disposed||typeof run!=='function')return false;const value=record(feature,context);if(value.retryPending)return false;value.retryPending=true;
      const isCurrent=()=>!disposed&&contexts.get(context)?.get(feature)===value;
      try {const result=await run();if(!isCurrent()||result===false)return false;succeeded(feature,context);return true;}
      catch(error){if(isCurrent())failed(feature,context);throw error;}
      finally {value.retryPending=false;}
    }
    return Object.freeze({failed,succeeded,snapshot:(feature,context)=>view(record(feature,context)),retry,clearContext:context=>contexts.delete(context),dispose(){disposed=true;contexts.clear();}});
  }
  return Object.freeze({createRecoveryGuard});
})();

// Layout and surfaces from the approved Lean menu, with product-specific colors.
const ExpLeanMenu = (() => {
  // The shell is shared by existing products and new createProduct/createMenuController consumers.
  const template=Object.freeze({id:'extrapotions-menu',version:1,layout:'sidebar',systemLayout:'grouped',supportNavigation:'system',resetNavigation:'system',donations:'header-heart'});
  const twitch=Object.freeze({bg:'#18181b',panel:'#1f1f23',raised:'#3a3a3d',inset:'#0e0e10',line:'#848494',text:'#efeff1',muted:'#adadb8',hover:'#53535f',accent:'#9146ff',accent2:'#bf94ff',link:'#bf94ff',focus:'#bf94ff',onAccent:'#ffffff'});
  // THREAD supplies its native/default and opt-in gem palette through Core.applyTheme.
  const palettes=Object.freeze({dropper:twitch});
  const sectionIcons = Object.freeze({campaigns:'gift',settings:'system',drops:'gift',streams:'screen',appearance:'brush',advanced:'sliders',system:'system',highlights:'sparkle',protection:'shield',amazon:'bag'});
  // Scoped switches outrank the older product gradient rules.
  const SWITCH='[data-exp-menu-layout="lean"][data-exp-menu-layout="lean"][data-exp-menu-layout="lean"] .toggleSwitch[role="switch"]';
  const css = `
    [data-exp-menu-layout="lean"]{box-sizing:border-box!important;padding:0!important;border:1px solid var(--theme-muted)!important;border-radius:7px!important;background:var(--theme-bg)!important;background-image:none!important;box-shadow:0 4px 10px #0003!important;color:var(--theme-text)!important;font:400 13px/1.4 "Segoe UI",system-ui,sans-serif!important;text-align:start;letter-spacing:0!important;transition:none!important}
    [data-exp-menu-layout="lean"] *{box-sizing:border-box}
    /* One shell must outrank legacy product-ID rules, including Dropper's sibling card. */
    :host :is(#tdh-tools-dock,[data-exp-menu-layout="lean"])[data-exp-menu-template]{position:fixed!important;z-index:2147483647!important;overflow:hidden!important;flex-direction:column;max-height:calc(100dvh - 16px)}
    :host :is(#tdh-tools-dock,[data-exp-menu-layout="lean"])[data-exp-menu-template].fl-rail-open:not([hidden]){display:flex!important}
    [data-exp-menu-layout="lean"] .menu-head{display:flex!important;align-items:center!important;gap:5px!important;width:100%!important;margin:0!important;padding:7px!important;border:0!important;border-bottom:1px solid var(--theme-line)!important;background:transparent!important}
    [data-exp-menu-layout="lean"] .header-brand{display:flex!important;align-items:center!important;gap:6px!important;flex:1;min-width:0}
    [data-exp-menu-layout="lean"] .header-icon{flex:0 0 28px;width:28px!important;height:30px!important;border:0!important;background:transparent!important;overflow:hidden}
    [data-exp-menu-layout="lean"] .header-icon .menu-icon{width:28px!important;height:30px!important;object-fit:contain}
    [data-exp-menu-layout="lean"] .header-copy{flex:1;min-width:0;overflow:visible!important}
    [data-exp-menu-layout="lean"] .header-title-row{display:flex;align-items:center;gap:5px;flex-wrap:wrap}
    [data-exp-menu-layout="lean"] :is(.header-title-row h2,[data-exp-part="title"],#tdh-rail-title){margin:0!important;font-size:14px!important;font-weight:600!important;line-height:1.3!important}
    [data-exp-menu-layout="lean"] :is([data-exp-part="subtitle"],#tdh-rail-subtitle){display:block!important;margin-top:1px!important;color:var(--theme-muted)!important;font-size:11px!important;line-height:1.35!important}
    [data-exp-menu-layout="lean"] :is([data-exp-part="version"],#tdh-header-version){padding:1px 4px!important;min-height:23px!important;border:1px solid var(--theme-muted)!important;border-radius:4px!important;background:var(--theme-panel)!important;color:var(--theme-text)!important;font-size:11px!important;font-weight:400!important}
    [data-exp-menu-layout="lean"] .header-actions{display:flex!important;align-items:center!important;gap:5px!important;flex:none}
    [data-exp-menu-layout="lean"] :is(.support-button,[data-exp-part="close"],#tdh-rail-close){display:grid!important;place-items:center!important;flex:none;width:28px!important;height:28px!important;min-width:28px!important;min-height:28px!important;padding:2px!important;border:1px solid var(--theme-muted)!important;border-radius:5px!important;background:var(--theme-panel)!important;color:var(--theme-text)!important;box-shadow:none!important}
    [data-exp-menu-layout="lean"] :is(.header-divider,.exp-menu-tagline,[data-exp-part="status"]){display:none!important}
    [data-exp-menu-layout="lean"]>nav{padding:0!important;margin:0!important}
    [data-exp-menu-layout="lean"] .exp-menu-workspace{display:grid!important;grid-template-columns:84px minmax(0,1fr)!important;min-width:0;min-height:0;overflow:hidden;align-items:stretch;flex:1 1 auto}
    [data-exp-menu-layout="lean"] .exp-menu-rail{padding:5px;border-right:1px solid var(--theme-line);min-width:0;min-height:0;overflow:auto;overscroll-behavior:contain;align-self:stretch;background:var(--exp-menu-navigation,transparent)}
    [data-exp-menu-layout="lean"] .exp-menu-content{padding:var(--exp-menu-padding,8px)!important;min-width:0;min-height:0;overflow:auto;max-height:calc(100dvh - 116px);overscroll-behavior:contain}
    [data-exp-menu-layout="lean"] .exp-section-tabs{display:flex!important;flex-direction:column!important;gap:4px!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important}
    [data-exp-menu-layout="lean"] .exp-menu-shortcuts{display:flex;flex-direction:column;gap:4px;border-top:1px solid var(--theme-line);padding-top:8px;margin-top:8px}
    [data-exp-menu-layout="lean"] :is(.exp-section-tabs>[role=tab],.exp-menu-shortcuts>button){width:100%!important;min-width:0!important;min-height:30px!important;justify-content:flex-start!important;padding:5px 3px!important;text-align:left!important;font:400 12px/1.35 "Segoe UI",sans-serif!important;white-space:normal!important;overflow-wrap:anywhere!important;border:1px solid var(--theme-muted)!important;border-radius:5px!important;background:var(--theme-panel)!important;color:var(--theme-text)!important;box-shadow:none!important}
    [data-exp-menu-layout="lean"] .exp-section-tabs>[aria-selected=true]{border-color:var(--theme-focus,var(--theme-accent2))!important;background:color-mix(in srgb,var(--theme-accent2) 13%,var(--theme-panel))!important}
    [data-exp-menu-layout="lean"] .exp-section-tabs .exp-section-icon{display:none!important}
    [data-exp-menu-layout="lean"] .exp-section-tabs .exp-section-tab-label{display:inline!important;white-space:normal!important;overflow:visible!important;text-overflow:clip!important}
    [data-exp-menu-layout="lean"] .exp-menu-content>.fl-tool-panel>.fl-tool-header{position:absolute!important;width:1px!important;height:1px!important;min-height:0!important;margin:-1px!important;padding:0!important;border:0!important;overflow:hidden!important;clip-path:inset(50%)!important;white-space:nowrap!important}
    [data-exp-menu-layout="lean"] :is(.fl-tool-panel,.exp-system-card){margin:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important}
    [data-exp-menu-layout="lean"] .fl-tool-body{padding:0!important}
    [data-exp-menu-layout="lean"] :is(.row,.mini-row,.fl-switch,.setting-row){min-width:0!important;min-height:32px;gap:6px!important;padding:var(--exp-menu-row,6px) 0!important;margin:0!important;border:0!important;border-bottom:1px solid var(--theme-line)!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;line-height:1.4!important}
    [data-exp-menu-layout="lean"] :is(.label,.setting-label,.fl-switch-text,.copy>strong,.row-copy>strong,.mini-row>span,.row>span){font-size:12px!important;font-weight:400!important;line-height:1.4!important;white-space:normal!important;overflow-wrap:anywhere!important;min-width:0!important}
    [data-exp-menu-layout="lean"] :is(.row,.mini-row,.setting-row):has(>select){grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;gap:6px!important}
    [data-exp-menu-layout="lean"] :is(button,input,select,textarea){max-width:100%;color:var(--theme-text);font-family:"Segoe UI",system-ui,sans-serif}
    [data-exp-menu-layout="lean"][data-exp-menu-layout="lean"] .fl-tool-body button{font-size:12px!important;font-weight:400!important;line-height:1.35!important}
    [data-exp-menu-layout="lean"] :is(.life-btn,.action,.secondary,.primary,.compact,select,input:not([type=range]),textarea){min-width:0!important;min-height:var(--exp-menu-control,30px)!important;padding:4px 7px!important;font-size:12px!important;line-height:1.35!important;border:1px solid var(--theme-muted)!important;border-radius:5px!important;background:var(--theme-panel)!important;color:var(--theme-text)!important;white-space:normal!important;box-shadow:none!important}
    [data-exp-menu-layout="lean"] option{background:var(--theme-panel)!important;color:var(--theme-text)!important}
    ${SWITCH}{flex:none!important;width:32px!important;min-width:32px!important;max-width:32px!important;height:22px!important;min-height:22px!important;max-height:22px!important;border:1px solid var(--theme-muted)!important;border-radius:4px!important;background:var(--theme-panel)!important;padding:0!important;box-shadow:none!important}
    ${SWITCH}::after{width:12px!important;height:16px!important;top:2px!important;left:2px!important;border-radius:2px!important;background:var(--theme-muted)!important}
    ${SWITCH}>span{display:none!important}
    ${SWITCH}[aria-checked=true]{background:var(--theme-accent)!important}
    ${SWITCH}[aria-checked=true]::after{transform:translateX(14px)!important;background:var(--theme-bg)!important}
    [data-exp-menu-layout="lean"] :is(button,select,input,textarea,summary):focus-visible{outline:2px solid var(--theme-focus,var(--theme-accent2))!important;outline-offset:2px}
    [data-exp-menu-layout="lean"] details{border:0!important;border-bottom:1px solid var(--theme-line)!important;background:transparent!important;padding:0!important;margin:0!important;min-width:0}
    [data-exp-menu-layout="lean"] details>summary{min-height:32px!important;padding:7px 0!important;font-size:12px!important;font-weight:600!important;color:var(--theme-text)!important;cursor:pointer}
    [data-exp-menu-layout="lean"] details>:not(summary){min-width:0;margin-inline:0!important}
    [data-exp-menu-layout="lean"] :is(.note,.help,.empty,.meta){color:var(--theme-muted)!important;font-size:11px!important;line-height:1.5!important}
    [data-exp-menu-layout="lean"] .action-pair{display:flex!important;gap:5px!important;margin:6px 0!important;min-width:0}
    [data-exp-menu-layout="lean"] .action-pair>*{flex:1!important;min-width:0!important;white-space:normal!important}
    [data-exp-menu-layout="lean"][data-exp-menu-layout="lean"] .fl-tool-body .diagnostics-controls .action-pair>button{font-size:11px!important;line-height:1.25!important;padding:3px!important;min-height:28px!important;overflow-wrap:normal!important;word-break:normal!important;white-space:normal!important}
    [data-exp-menu-layout="lean"] [data-exp-system-report]{text-align:center!important;justify-content:center!important;width:100%}
    [data-exp-menu-layout="lean"] :is([data-exp-destructive],[data-exp-system-item=reset]>button,button[data-exp-system-item=reset]){color:light-dark(#9f1239,#fca5a5)!important;border-color:light-dark(#be123c,#f87171)!important;background:transparent!important}
    .exp-floating-update,.update-notice[data-placement="menu"]{max-height:calc(100dvh - 16px)!important;overflow:auto;overscroll-behavior:contain;background:var(--exp-notice-top,var(--theme-bg))!important;background-image:none!important;border-color:var(--exp-notice-border,var(--theme-muted))!important;border-radius:7px!important;box-shadow:0 4px 10px #0003!important;font-size:12px!important}
    .update-notice :is(.update-text,.update-list){overflow-wrap:anywhere;line-height:1.5}
    @media(max-width:300px){[data-exp-menu-layout="lean"][data-exp-menu-layout="lean"] .fl-tool-body .diagnostics-controls .action-pair>button{white-space:normal!important}}
    @media(pointer:coarse){[data-exp-menu-layout="lean"] :is(.life-btn,.action,.secondary,.primary,.exp-menu-shortcuts>button,.exp-section-tabs>[role=tab],select,summary){min-height:36px!important}}

    @media(forced-colors:active){
      [data-exp-menu-layout="lean"] :is(button,select,input,textarea){forced-color-adjust:auto!important;border-color:ButtonText!important}
      ${SWITCH}[aria-checked=true]{background:Highlight!important;forced-color-adjust:none!important}
      ${SWITCH}[aria-checked=true]::after{background:HighlightText!important}
      [data-exp-menu-layout="lean"] .exp-section-tabs>[aria-selected=true]{border-color:Highlight!important}
    }

  `;
  // Products register how to read their health; the header shows it and the tagline moves to the menu footer.
  const statusSources=new Map(),statusPanels=new Map();
  function setMenuStatus(id,getHealth){
    if(typeof getHealth!=='function')throw new TypeError('Menu status needs a health function');
    statusSources.set(String(id).toLowerCase(),getHealth);
    for(const refresh of statusPanels.get(String(id).toLowerCase())||[])refresh();
  }
  function mount({shadow,panel}) {
    const document=panel.ownerDocument,host=shadow.host;
    const id=host?.dataset.productId||host?.id.replace(/^(exp-)|(\-root)$/g,'').replace(/^tdh$/,'dropper');
    const palette=palettes[id],saved=new Map();panel.dataset.expMenuLayout='lean';panel.dataset.expMenuTemplate=template.id+'-v'+template.version;
    const themeRoot=shadow.querySelector('.exp-core-theme,.cluster');
    const properties=['bg','panel','line','text','muted','accent','accent2','link','focus'].map(key=>'--theme-'+key).concat('--exp-menu-hover','background-image');
    for(const property of properties)saved.set(property,[panel.style.getPropertyValue(property),panel.style.getPropertyPriority(property)]);
    function applyPalette(){
      const selected=themeRoot?.dataset.uiTheme;
      for(const[key,[value,priority]]of saved){if(value)panel.style.setProperty(key,value,priority);else panel.style.removeProperty(key);}
      panel.style.setProperty('background-image','none','important');
      panel.style.setProperty('--exp-menu-hover','color-mix(in srgb,var(--theme-accent) 12%,var(--theme-panel))');
      if(palette&&selected!=='contrast'){
        for(const[key,value]of Object.entries(palette)){const property=key==='hover'?'--exp-menu-hover':'--theme-'+key;panel.style.setProperty(property,value);themeRoot?.style.setProperty(property,value);}
        if(themeRoot)themeRoot.dataset.themeSkin='flat';
      }
    }
    applyPalette();
    const themeObserver=new MutationObserver(applyPalette);if(themeRoot)themeObserver.observe(themeRoot,{attributes:true,attributeFilter:['data-ui-theme']});
    const style=document.createElement('style');style.dataset.expLeanMenu='1';style.textContent=css;shadow.append(style);
    const status=document.createElement('div');status.dataset.expPart='status';status.setAttribute('role','status');
    const dot=document.createElement('span');dot.className='exp-status-dot';const statusText=document.createElement('span');statusText.className='exp-status-text';status.append(dot,statusText);
    const tagline=document.createElement('p');tagline.className='exp-menu-tagline';tagline.dataset.expPart='tagline';
    function placeTagline(){
      const text=panel.querySelector('[data-exp-part="subtitle"],#tdh-rail-subtitle')?.textContent.trim();
      if(panel.dataset.expMenuStatus!=='1'||!text){tagline.remove();return;}
      if(tagline.textContent!==text)tagline.textContent=text;
      if(panel.lastElementChild!==tagline)panel.append(tagline);
    }
    let statusTicket=0,statusTimer=0;
    async function refreshStatus(){
      const source=statusSources.get(id);
      if(!source){delete panel.dataset.expMenuStatus;status.remove();placeTagline();return;}
      const copy=panel.querySelector('.header-copy');
      if(!copy){delete panel.dataset.expMenuStatus;status.remove();placeTagline();return;}
      if(!copy.contains(status))copy.append(status);
      if(panel.dataset.expMenuStatus!=='1')panel.dataset.expMenuStatus='1';placeTagline();const ticket=++statusTicket;
      let value=null;try{value=await source();}catch{}
      if(ticket!==statusTicket)return;
      const health=ExpHealthSummary.normalizeHealth(value);
      // Unchanged values are not written again, so observers and screen readers are not woken every poll.
      if(dot.dataset.state!==health.state)dot.dataset.state=health.state;
      if(statusText.textContent!==health.label)statusText.textContent=health.label;
    }
    if(!statusPanels.has(id))statusPanels.set(id,new Set());statusPanels.get(id).add(refreshStatus);
    // Polls only while the menu is on screen. Products show it by the hidden attribute, a class (Dropper's
    // dock, WARD's shell) or an ancestor; the resize observer sees the panel gain or lose its box.
    const shown=()=>!panel.hidden&&panel.getClientRects().length>0;
    let statusShown=shown();
    // A product that hides and shows the panel in one task leaves no hidden state to observe;
    // the hidden attribute's old value still says the menu was reopened.
    function followVisibility(reopened=false){
      const now=shown();if(now===statusShown&&!(now&&reopened))return;statusShown=now;
      clearInterval(statusTimer);statusTimer=0;
      if(now){refreshStatus();statusTimer=setInterval(refreshStatus,10000);}
    }
    const visibility=new MutationObserver(records=>followVisibility(records.some(record=>record.attributeName==='hidden'&&record.oldValue!==null)));
    visibility.observe(panel,{attributes:true,attributeOldValue:true,attributeFilter:['hidden','class','style']});
    const visibilityResize=new ResizeObserver(()=>followVisibility());visibilityResize.observe(panel);
    refreshStatus();if(statusShown)statusTimer=setInterval(refreshStatus,10000);
    const icons=new Set();
    function decorate(){
      for(const header of panel.querySelectorAll('.fl-tool-header')){
        if(header.querySelector('.exp-section-icon'))continue;
        const title=header.querySelector('.fl-tool-title');if(!title)continue;
        const name=sectionIcons[title.textContent.trim().toLowerCase()];if(!name)continue;
        const icon=document.createElement('span');icon.className='exp-section-icon';icon.setAttribute('aria-hidden','true');
        icon.dataset.icon=name;header.prepend(icon);icons.add(icon);
      }
    }
    decorate();const observer=new MutationObserver(decorate);observer.observe(panel,{childList:true,subtree:true});
    return ()=>{visibility.disconnect();visibilityResize.disconnect();clearInterval(statusTimer);statusPanels.get(id)?.delete(refreshStatus);status.remove();tagline.remove();delete panel.dataset.expMenuStatus;themeObserver.disconnect();observer.disconnect();icons.forEach(icon=>icon.remove());style.remove();for(const[key,[value,priority]]of saved){if(value)panel.style.setProperty(key,value,priority);else panel.style.removeProperty(key);}delete panel.dataset.expMenuLayout;delete panel.dataset.expMenuTemplate;};
  }
  return Object.freeze({mount,setMenuStatus,template});
})();

// Descriptions belong to settings and consequential actions, not ordinary navigation.
const ExpMenuHelp = (() => {
  let serial=0;
  function setMenuHelp(node,text){
    if(!node||!String(text||'').trim())return node;
    node.dataset.expHelp=String(text).trim();
    node.setAttribute('aria-description',node.dataset.expHelp);
    if(!node.matches('button,input,select,a[href],summary')){node.tabIndex=0;node.setAttribute('role','button');}
    return node;
  }
  function mount({shadow,panel}){
    const doc=panel.ownerDocument,view=doc.defaultView;
    const tip=doc.createElement('div');tip.id='exp-menu-help-'+(++serial);tip.className='exp-menu-help';tip.role='tooltip';tip.hidden=true;
    const style=doc.createElement('style');style.dataset.expMenuHelp='1';
    style.textContent='.exp-menu-help{position:fixed;z-index:2147483647;box-sizing:border-box;max-width:260px;padding:8px 10px;border:1px solid var(--theme-line,#938f99);border-radius:7px;background:var(--theme-panel,#211f26);color:var(--theme-text,#e6e0e9);font:400 12px/1.5 "Segoe UI",system-ui,sans-serif;overflow:auto;overflow-wrap:anywhere;pointer-events:none}.exp-menu-help[hidden]{display:none!important}.exp-menu-help[data-scrollable=true]{pointer-events:auto}[data-exp-help]:not(button):not(input):not(select){cursor:help;text-decoration:underline dotted;text-underline-offset:3px}.has-tooltip::after{display:none!important}';
    shadow.append(style,tip);
    let target=null,timer=0,frame=0,pointer={x:-1,y:-1};
    const inside=()=>{if(tip.hidden)return false;const r=tip.getBoundingClientRect();return pointer.x>=r.left&&pointer.x<=r.right&&pointer.y>=r.top&&pointer.y<=r.bottom;};
    function hide(){clearTimeout(timer);if(target?.getAttribute('aria-describedby')===tip.id)target.removeAttribute('aria-describedby');target=null;tip.hidden=true;}
    function show(node){
      if(!node?.isConnected)return hide();
      const text=node.dataset.expHelp||node.dataset.tip;if(!text)return;
      const owner=node.closest('[data-exp-part="dock"],[data-exp-part="progress-card"]')||panel;
      const b=owner.getBoundingClientRect(),left=Math.max(8,b.left+6),right=Math.min(view.innerWidth-8,b.right-6),top=Math.max(8,b.top+6),bottom=Math.min(view.innerHeight-8,b.bottom-6);
      if(right<=left||bottom<=top)return hide();
      clearTimeout(timer);if(target&&target!==node)target.removeAttribute('aria-describedby');target=node;target.setAttribute('aria-describedby',tip.id);
      const colors=view.getComputedStyle(owner);for(const key of ['panel','line','text'])tip.style.setProperty('--theme-'+key,colors.getPropertyValue('--theme-'+key));
      // Fixed auto width depends on the previous left offset after resize. Measure
      // intrinsic width first, bounded by the owner, so the final position cannot grow it.
      tip.textContent=text;tip.style.width='max-content';tip.style.maxWidth=(right-left)+'px';tip.style.maxHeight=(bottom-top)+'px';tip.hidden=false;
      const r=node.getBoundingClientRect(),t=tip.getBoundingClientRect();
      tip.style.left=Math.max(left,Math.min(r.left,right-t.width))+'px';
      tip.style.top=Math.max(top,Math.min(r.bottom+t.height+6<=bottom?r.bottom+6:r.top-t.height-6,bottom-t.height))+'px';
      tip.dataset.scrollable=String(tip.scrollHeight>tip.clientHeight);
    }
    const help=node=>node?.closest?.('[data-exp-help],[data-tip]');
    const defer=()=>{clearTimeout(timer);timer=setTimeout(()=>{if(shadow.activeElement!==target&&!inside())hide();},150);};
    const over=e=>{pointer={x:e.clientX,y:e.clientY};const node=help(e.target);if(node&&e.pointerType!=='touch'&&(!inside()||node===target))show(node);};
    const move=e=>{pointer={x:e.clientX,y:e.clientY};if(target&&!inside()&&!target.contains(e.target))defer();};
    const out=e=>{if(help(e.target))defer();};
    const focus=e=>{const node=help(e.target);if(node)show(node);else hide();};
    const click=e=>{const node=help(e.target);if(node){show(node);if(node.matches('[role=button]:not(button)'))e.preventDefault();}else if(!tip.contains(e.target))hide();};
    const key=e=>{if(e.key==='Escape'&&!tip.hidden){hide();e.preventDefault();e.stopImmediatePropagation();return;}const node=help(e.target);if(node?.matches('[role=button]:not(button)')&&['Enter',' '].includes(e.key)){e.preventDefault();show(node);}};
    const layout=e=>{if(target&&!(e?.target instanceof view.Node&&tip.contains(e.target)))show(target);};
    // Menu positioning settles on the next frame after a submenu changes its height.
    const resize=new ResizeObserver(()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>layout());});resize.observe(panel);
    for(const [name,fn,capture] of [['pointerover',over],['pointermove',move],['pointerout',out],['focusin',focus],['click',click],['keydown',key,true],['scroll',layout,true]])shadow.addEventListener(name,fn,capture);
    view.addEventListener('resize',layout);view.addEventListener('scroll',layout,true);
    return ()=>{hide();resize.disconnect();cancelAnimationFrame(frame);for(const [name,fn,capture] of [['pointerover',over],['pointermove',move],['pointerout',out],['focusin',focus],['click',click],['keydown',key,true],['scroll',layout,true]])shadow.removeEventListener(name,fn,capture);view.removeEventListener('resize',layout);view.removeEventListener('scroll',layout,true);tip.remove();style.remove();};
  }
  return Object.freeze({setMenuHelp,mount});
})();

// Shared type and alignment for product menus, including custom shells.
const ExpMenuTypography = (() => {
  const css = `
    [data-exp-menu-typography]{font:400 var(--exp-font-size-body,14px)/1.45 "Segoe UI",system-ui,sans-serif!important;text-align:start;letter-spacing:normal}
    [data-exp-menu-typography] :is(button,input,select,textarea){font-family:inherit!important;letter-spacing:normal}
    [data-exp-menu-typography] :is(.row,.mini-row,.fl-switch,.setting-row){gap:12px!important;padding-block:8px!important;align-items:center!important;font-size:var(--exp-font-size-body,14px);line-height:1.4}
    [data-exp-menu-typography] :is(.label,.setting-label,.fl-switch-text,.copy>strong,.row-copy>strong,.mini-row>span){font-size:var(--exp-font-size-body,14px)!important;font-weight:500!important;line-height:1.4!important;letter-spacing:normal;min-width:0}
    [data-exp-menu-typography] :is(.copy>.help,.row-copy>small,.help,.row-help,.note,.empty,.meta){font-size:var(--exp-font-size-small,12px)!important;font-weight:400!important;line-height:1.5!important}
    [data-exp-menu-typography] :is(.copy>.help,.row-copy>small,.row-help){display:block;margin-top:4px}
    [data-exp-menu-typography] :is(.row,.mini-row,.setting-row):has(>select){display:grid!important;grid-template-columns:minmax(0,1fr) minmax(104px,.95fr)!important;column-gap:12px!important}
    [data-exp-menu-typography] :is(.row,.mini-row,.setting-row)>select{width:100%!important;max-width:100%!important;min-width:0!important;justify-self:end}
    [data-exp-menu-typography] select{box-sizing:border-box;min-height:32px!important;padding:5px 8px!important;font-size:var(--exp-font-size-body,14px)!important;line-height:1.4!important;font-weight:400}
    [data-exp-menu-typography] :is(input:not([type=range]):not([type=color]),textarea){font-size:var(--exp-font-size-body,14px)!important;line-height:1.45;min-height:32px}
    [data-exp-menu-typography] .fl-tool-header{align-items:center!important;padding:9px 10px!important;gap:10px}
    [data-exp-menu-typography] .fl-tool-title{font-size:var(--exp-font-size-body,14px)!important;font-weight:600!important;line-height:1.4!important}
    [data-exp-menu-typography] .fl-tool-chevron{flex:none;display:grid;place-items:center;align-self:center;padding:0;width:14px;line-height:1.4}
    [data-exp-menu-typography] .fl-tool-body{padding-inline:10px!important;padding-bottom:10px!important}
    [data-exp-menu-typography] :is(.group>h3,.section>h3,.section>h2,.stream-subsection-label){margin:12px 0 4px!important;font-size:var(--exp-font-size-small,12px)!important;font-weight:600!important;line-height:1.5!important;letter-spacing:normal!important;text-transform:none!important}
    [data-exp-menu-typography] :is(.group,.section):first-child>h3{margin-top:6px!important}
    [data-exp-menu-typography] :is(.fl-tool-body,.route-body) :is(.life-btn,.action,.secondary,.primary,.compact){min-height:32px!important;padding:6px 8px!important;font-size:var(--exp-font-size-body,14px)!important;font-weight:500!important;line-height:1.4!important;text-align:center}
    [data-exp-menu-typography] :is(.button-grid,.actions,.profile-actions,.menu-footer,.diagnostics-controls>div,.rules-transfer){gap:8px!important;align-items:stretch}
    [data-exp-menu-typography] :is(.button-grid,.actions,.profile-actions,.diagnostics-controls)>:is(button,a),[data-exp-menu-typography] .diagnostics-controls>div>button{margin-top:0!important}
    [data-exp-menu-typography] :is(.appearance-group,.exp-system-card,[data-exp-menu-submenu])>summary{display:flex;align-items:center;gap:8px;padding-block:7px;list-style:none;font-size:var(--exp-font-size-body,14px)!important;font-weight:500!important;line-height:1.4!important}
    [data-exp-menu-typography] :is(.appearance-group,.exp-system-card,[data-exp-menu-submenu])>summary::-webkit-details-marker{display:none}
    [data-exp-menu-typography] :is(.appearance-group,.exp-system-card,[data-exp-menu-submenu])>summary::before{content:"▸";flex:0 0 10px;text-align:center}
    [data-exp-menu-typography] :is(.appearance-group,.exp-system-card,[data-exp-menu-submenu])[open]>summary::before{content:"▾"}
    [data-exp-menu-typography] :is(.header-title-row h2,[data-exp-part="title"],#tdh-rail-title){font-size:calc(var(--exp-font-size-body,14px) + 2px)!important;font-weight:700!important;line-height:1.25!important}
    [data-exp-menu-typography] :is([data-exp-part="subtitle"],#tdh-rail-subtitle){font-size:var(--exp-font-size-small,12px)!important;line-height:1.4!important}
    [data-exp-menu-typography] :is([data-exp-part="version"],#tdh-header-version){font-weight:600!important;line-height:1.2!important;font-variant-numeric:tabular-nums}
    [data-exp-menu-typography] :is(output,.status-value,.step-value,.status-check-value){font-variant-numeric:tabular-nums}
  `;
  function mount({shadow,panel}) {
    panel.dataset.expMenuTypography='1';
    const style=document.createElement('style');style.dataset.expMenuTypography='1';style.textContent=css;shadow.append(style);
    const disposeLean=ExpLeanMenu.mount({shadow,panel});
    const disposeHelp=ExpMenuHelp.mount({shadow,panel});
    return ()=>{disposeHelp();disposeLean();style.remove();delete panel.dataset.expMenuTypography;};
  }
  return Object.freeze({mount});
})();

/* Same-origin preferences for product-owned menu surfaces only. */
const ExpMenuPreferences = (() => {
  const key='exp:suite:menu-size',eventName='exp-core:menu-size';
  const sizes=Object.freeze({standard:{body:14,small:12,width:324,cardWidth:272,padding:8,row:7,control:32},compact:{body:14,small:12,width:304,cardWidth:252,padding:7,row:6,control:30},mini:{body:14,small:12,width:280,cardWidth:232,padding:6,row:4,control:28}});
  let memory='compact';
  const valid=value=>Object.hasOwn(sizes,value)?value:'compact';
  function menuSizePreference(){try {const stored=localStorage.getItem(key);memory=valid(stored);}catch {}return memory;}
  function setMenuSizePreference(size){memory=valid(size);try{localStorage.setItem(key,memory);}catch{}document.dispatchEvent(new CustomEvent(eventName,{detail:memory}));return memory;}
  function bindMenuSize({host,shadow,panel,onLayout=()=>{}}){
    const disposeTypography=ExpMenuTypography.mount({shadow,panel});
    function apply(size){
      memory=valid(size);const value=sizes[memory];host.dataset.expMenuSize=memory;
      for(const token of ['padding','row','control'])host.style.setProperty('--exp-menu-'+token,value[token]+'px');
      host.style.setProperty('--exp-font-size-body',value.body+'px');host.style.setProperty('--exp-font-size-small',value.small+'px');host.style.setProperty('--exp-menu-width',value.width+'px');
      for(const select of shadow.querySelectorAll('[data-exp-menu-size-select]'))select.value=memory;
      onLayout();
    }
    const changed=event=>apply(event.detail),storage=event=>{if(event.key===key||event.key===null)apply(menuSizePreference());};
    document.addEventListener(eventName,changed);addEventListener('storage',storage);apply(menuSizePreference());
    return ()=>{document.removeEventListener(eventName,changed);removeEventListener('storage',storage);disposeTypography();};
  }
  function createMenuSizeControls(){
    const row=document.createElement('label');row.className='row exp-menu-size';const copy=document.createElement('span');copy.className='copy';
    const title=document.createElement('strong');title.textContent='Menu Size';ExpMenuHelp.setMenuHelp(title,'Standard, Compact and Mini resize menus and cards with tighter spacing and controls. All settings stay available. This preference is shared by ExtraPotions menus on this site.');copy.append(title);
    const select=document.createElement('select');select.setAttribute('aria-label','Menu size');select.dataset.expMenuSizeSelect='1';
    for(const [value,label] of [['standard','Standard'],['compact','Compact'],['mini','Mini']]){const option=document.createElement('option');option.value=value;option.textContent=label;select.append(option);}
    select.value=menuSizePreference();select.addEventListener('change',()=>setMenuSizePreference(select.value));row.append(copy,select);return row;
  }
  return Object.freeze({menuSizePreference,setMenuSizePreference,bindMenuSize,createMenuSizeControls,menuSizeTokens:()=>sizes[menuSizePreference()]});
})();

/* Optional page colours for a product's own site. Core owns the palette list, the Site colors control
   and one scoped style per product; each product maps the palette tokens onto its site's own surfaces. */
const ExpSiteColors = (() => {
  const base=Object.freeze({
    dark:{bg:'#18181b',panel:'#202024',raised:'#2b2b31',inset:'#111114',line:'#85858f',text:'#f4f4f6',muted:'#b9b9c3',onAccent:'#111114'},
    light:{bg:'#f4f4f6',panel:'#ffffff',raised:'#e9e9ee',inset:'#ededf1',line:'#777780',text:'#202024',muted:'#555560',onAccent:'#ffffff'},
  });
  // [id, name, dark accent, light accent, dark surfaces bg/panel/raised/inset, light surfaces bg/panel/raised/inset]
  const table=[
    ['default','Default','#c4c4cc','#50505c'],
    ['indigo','Indigo','#b4a2ff','#5943b6',['#171222','#241c36','#34284a','#0f0b18'],['#eee8f7','#faf7ff','#e1d8ef','#e5ddf1']],
    ['blue','Blue','#82b9ff','#155cad',['#0b1420','#132337','#1e324a','#070e18'],['#e7f0fb','#f6faff','#d7e6f7','#dce8f6']],
    ['green','Green','#85c99e','#216b3c',['#0e1913','#162a1e','#203b2a','#07100b'],['#e8f3eb','#f5fcf7','#d5e8dc','#dcece2']],
    ['red','Red','#f6a0a0','#a52b35',['#201214','#321d22','#452931','#160b0f'],['#f8eaec','#fff7f8','#f0d9df','#f1dfe4']],
    ['gray','Gray','#aeb3b9','#4f5964',['#181a1c','#22262a','#30363b','#111315'],['#eceff1','#fafbfc','#dce2e6','#e1e6ea']],
  ];
  const surfaces=values=>values?{bg:values[0],panel:values[1],raised:values[2],inset:values[3]}:{};
  const sitePalettes=Object.freeze(table.map(([id,name,darkAccent,lightAccent,dark,light])=>Object.freeze({id,name,
    dark:Object.freeze({...base.dark,...surfaces(dark),accent:darkAccent}),light:Object.freeze({...base.light,...surfaces(light),accent:lightAccent})})));
  function sitePalette(id,mode='dark',extra=[]){const palette=[...extra,...sitePalettes].find(item=>item.id===id);return palette?{id:palette.id,name:palette.name,mode:mode==='light'?'light':'dark',...palette[mode==='light'?'light':'dark']}:null;}
  const systemMode=()=>matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';
  function watchSystem(callback){const query=matchMedia('(prefers-color-scheme: light)');query.addEventListener('change',callback);return ()=>query.removeEventListener('change',callback);}
  // mode() reads the site's current light/dark state; watch(callback) reports changes and returns a disposer.
  function createSiteColors({product,css,mode=systemMode,watch=watchSystem,extra=[]}){
    const attribute='data-exp-site-colors',scope=`html[${attribute}="${product}"]`,id='exp-site-colors-'+product;
    let current='off',stopWatching=null,style=null;
    function render(){
      const palette=sitePalette(current,mode(),extra);if(!palette)return clear();
      if(!style?.isConnected){style=document.getElementById(id)||document.createElement('style');style.id=id;style.dataset.expOwned='1';style.dataset.expSiteColors=product;(document.head||document.documentElement).append(style);}
      const text=css(palette,scope);if(style.textContent!==text)style.textContent=text;
      if(document.documentElement.getAttribute(attribute)!==product)document.documentElement.setAttribute(attribute,product);
      document.documentElement.dataset.expSitePalette=palette.id+'-'+palette.mode;
    }
    function apply(next){current=next||'off';if(!sitePalette(current,'dark',extra))return clear();stopWatching??=watch(render);render();}
    function clear(){current='off';stopWatching?.();stopWatching=null;style?.remove();document.getElementById(id)?.remove();style=null;
      if(document.documentElement.getAttribute(attribute)===product){document.documentElement.removeAttribute(attribute);delete document.documentElement.dataset.expSitePalette;}}
    return Object.freeze({apply,clear,refresh:()=>{if(current!=='off')render();},palette:()=>sitePalette(current,mode(),extra)});
  }
  function createSiteColorControl({value='off',onChange,offLabel='Site default',extra=[],help='Recolor this site’s pages with a palette. Follows the site’s light or dark mode. Menus keep their own theme.'}){
    const row=document.createElement('label');row.className='row exp-site-colors';const copy=document.createElement('span');copy.className='copy';
    const title=document.createElement('strong');title.textContent='Site colors';ExpMenuHelp.setMenuHelp(title,help);copy.append(title);
    const select=document.createElement('select');select.setAttribute('aria-label','Site colors');select.dataset.expSiteColorsSelect='1';
    for(const [id,name] of [['off',offLabel],...[...extra,...sitePalettes].map(item=>[item.id,item.name])]){const option=document.createElement('option');option.value=id;option.textContent=name;select.append(option);}
    select.value=sitePalette(value,'dark',extra)?value:'off';select.addEventListener('change',()=>onChange?.(select.value));row.append(copy,select);return row;
  }
  return Object.freeze({sitePalettes,sitePalette,createSiteColors,createSiteColorControl});
})();

// Flyout launcher rules shared by every Core copy on a page. Each copy computes the same answer from the
// launcher hosts' attributes alone, so products agree on one launcher without messaging each other.
const ExpLauncherFlyout = (() => {
  const PROTOCOL = '1';
  const SUITE_ORDER = Object.freeze(['dropper','shift','prisma','ward','thread']);
  // Products that only run on their own sites (Dropper on Twitch, WARD on retailers) lead there.
  const SITE_PRODUCTS = Object.freeze(['dropper','ward','thread']);
  const idOf = host => String(host?.dataset?.productId || '');
  const rank = id => { const index = SUITE_ORDER.indexOf(id); return index < 0 ? SUITE_ORDER.length : index; };
  function isSiteProduct(productId) { return SITE_PRODUCTS.includes(String(productId || '')); }
  function flyoutOrder(hosts = []) {
    return [...new Set([...hosts].map(idOf).filter(Boolean))].sort((a,b) => rank(a) - rank(b) || a.localeCompare(b));
  }
  // An older Core on the page cannot draw tiles, so one launcher without the protocol keeps the grid for everyone.
  function flyoutActive(hosts = []) {
    const list = [...hosts];
    return list.length >= 2 && list.every(host => host?.dataset?.expFlyout === PROTOCOL);
  }
  function leadProduct(hosts = []) {
    const list = [...hosts];
    const site = flyoutOrder(list.filter(host => host?.dataset?.expSiteProduct === '1'));
    return site[0] || flyoutOrder(list)[0] || '';
  }
  return Object.freeze({ PROTOCOL, SUITE_ORDER, SITE_PRODUCTS, isSiteProduct, flyoutOrder, flyoutActive, leadProduct });
})();

// Product-neutral shared runtime. Product engines own their settings, content, and actions.
// exp-core owns shared UI, launcher, diagnostics, update, and coordination behavior.
const ExtraPotionsCore = (() => {
  'use strict';
  const version = '3.10.0';
  const sourceVersion = version; // Backward-compatible alias for Core's own foundation version.
  const SUPPORT_URL = 'https://ko-fi.com/expdare';
  const protocol = 'exp-core-coordination-v1';
  const gridProtocol = 'exp-launcher-grid-v3';
  const GRID_ORDER = 'exp:v3:launcher-order';
  const GRID_DELTA = 'exp:v3:launcher-grid-delta';
  // Product importance, launcher placement, and theme ownership are separate
  // coordination policies backed by the same canonical suite manifest.
  const freezeSuiteContract = values => Object.freeze(Object.fromEntries(
    Object.entries(values || {}).map(([id, value]) => [id, Object.freeze({
      role: String(value?.role || 'product'),
      repository: String(value?.repository || ''),
      rootId: String(value?.rootId || ''),
      priority: Number(value?.priority || 0),
      launcherPriority: Number(value?.launcherPriority || 0),
      themePriority: Number(value?.themePriority || 0),
      capabilities: Object.freeze([...(value?.capabilities || [])]),
      presentationPhases: Object.freeze([...(value?.presentationPhases || [])]),
      menuSections: Object.freeze(Object.fromEntries(
        Object.entries(value?.menuSections || {}).map(([category, sections]) => [category, Object.freeze([...(sections || [])])])
      )),
      state: value?.state ? Object.freeze({
        type: String(value.state.type || ''),
        fields: Object.freeze({ ...(value.state.fields || {}) }),
      }) : null,
    })])
  ));
  const SUITE_PRODUCTS = freezeSuiteContract({"thread":{"role":"product","priority":0,"launcherPriority":90,"themePriority":0,"capabilities":["reddit.reading","reddit.local-context","reddit.local-filtering"],"presentationPhases":["visibility","annotate"],"state":{"type":"thread.state-changed","fields":{"active":"boolean","loaded":"count"}},"menuSections":{"main":["feed","read"],"appearance":["look"],"advanced":["filters","people"],"system":["system"]},"repository":"THREAD","rootId":"exp-thread-root"},"dropper":{"role":"flagship","priority":4,"launcherPriority":110,"themePriority":4,"capabilities":["twitch.drops","twitch.campaigns","twitch.progress","twitch.claims","twitch.stream-management"],"presentationPhases":[],"state":{"type":"dropper.state-changed","fields":{"activeReward":"boolean","progressPercent":"percent-nullable","routingState":"token"}},"menuSections":{"main":["drops","streams","campaigns","settings"],"appearance":["appearance"],"advanced":["advanced"],"system":["system"]},"repository":"Dropper","rootId":"tdh-root"},"shift":{"role":"product","priority":3,"launcherPriority":100,"themePriority":3,"capabilities":["appearance.theme","appearance.readability","appearance.site-profile"],"presentationPhases":["theme"],"state":{"type":"shift.state-changed","fields":{"active":"boolean","theme":"token","safeMode":"boolean","excluded":"boolean"}},"menuSections":{"appearance":["appearance","readability"],"advanced":["effects","effects-integrations","profiles","profiles-sites"],"system":["system"]},"repository":"SHIFT","rootId":"exp-shift-root","maintenance":"retired"},"ward":{"role":"product","priority":2,"launcherPriority":60,"themePriority":1,"capabilities":["retail.classification","retail.cleanup","retail.coupons"],"presentationPhases":["classify","visibility"],"state":{"type":"ward.state-changed","fields":{"active":"boolean","pageType":"token","interventions":"count","hide":"count","dim":"count","collapse":"count","annotate":"count"}},"menuSections":{"main":["protection","amazon","tools"],"appearance":["appearance"],"advanced":["advanced","patterns","advanced-amazon"],"system":["system"]},"repository":"WARD","rootId":"exp-ward-root"},"prisma":{"role":"product","priority":1,"launcherPriority":40,"themePriority":2,"capabilities":["text.identity-detection","text.identity-highlighting","identity.catalog"],"presentationPhases":["annotate"],"state":{"type":"prisma.state-changed","fields":{"status":"token","total":"count","temporarilyHidden":"boolean"}},"menuSections":{"main":["page","highlights"],"appearance":["style","highlight-style","look","appearance"],"advanced":["tools","language","sites"],"system":["system"]},"repository":"PRISMA","rootId":"exp-prisma-root"}});
  const SUITE_PRIORITY = Object.freeze(Object.fromEntries(
    Object.entries(SUITE_PRODUCTS).map(([id, value]) => [id, value.priority])
  ));
  const LAUNCHER_PRIORITY = Object.freeze(Object.fromEntries(
    Object.entries(SUITE_PRODUCTS).map(([id, value]) => [id, value.launcherPriority])
  ));
  const THEME_PRIORITY = Object.freeze(Object.fromEntries(
    Object.entries(SUITE_PRODUCTS).map(([id, value]) => [id, value.themePriority])
  ));
  const SUITE_EVENT = 'exp-core:suite';
  const SUITE_SITE_PAUSE_PREFIX = 'exp:v3:suite-site-pause:';
  let suitePauseTimer;
  // Suite events/state cross userscript realms through shared DOM metadata.
  // They are advisory coordination signals, never an authorization boundary.
  const SUITE_TRUST = 'shared-dom-advisory';
  const PAGE_BATCH_EVENT = 'exp-core:page-batch';
  const NAVIGATION_EVENT = 'exp-core:navigation';
  const NAVIGATION_CONTROL_EVENT = 'exp-core:navigation-control';
  const PAGE_PHASE_EVENT = 'exp-core:page-phase';
  const PAGE_PHASE_END_EVENT = 'exp-core:page-phase-end';
  const PRESENTATION_STATE_EVENT = 'exp-core:presentation-state';
  const PRESENTATION_PHASES = Object.freeze({
    observe: 10,
    classify: 20,
    visibility: 30,
    theme: 40,
    annotate: 50,
    ui: 60,
  });
  const PRESENTATION_CHANNELS = Object.freeze(['classification', 'visibility', 'surface', 'annotation']);
  const suiteStateFingerprints = new Map();
  const registrations = new WeakMap();
  const floatingNoticeRegistrations = new WeakMap();
  const controllers = new WeakMap();
  const menuControllers = new WeakMap();
  let noticeSerial = 0;
  const baseTokenNames = ['bg', 'panel', 'line', 'text', 'muted', 'accent', 'accent2'];
  const tokenNames = [...baseTokenNames, 'raised', 'inset', 'link', 'focus', 'onAccent'];
  const hex = value => /^#[0-9a-f]{6}$/i.test(value || '') ? value : '#000000';
  const rgb = value => [1, 3, 5].map(index => parseInt(hex(value).slice(index, index + 2), 16));
  const blend = (from, to, amount) => '#' + rgb(from).map((part, index) => Math.round(part + (rgb(to)[index] - part) * amount).toString(16).padStart(2, '0')).join('');
  const luminance = value => {
    const parts = rgb(value).map(part => { const channel = part / 255; return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4; });
    return .2126 * parts[0] + .7152 * parts[1] + .0722 * parts[2];
  };
  const contrast = (one, two) => { const [light, dark] = [luminance(one), luminance(two)].sort((a, b) => b - a); return (light + .05) / (dark + .05); };
  function readable(candidate, background, fallback) {
    if (contrast(candidate, background) >= 4.5) return candidate;
    for (let amount = .15; amount <= 1; amount += .05) {
      const lighter = blend(candidate, '#ffffff', amount);
      if (contrast(lighter, background) >= 4.5) return lighter;
      const darker = blend(candidate, '#000000', amount);
      if (contrast(darker, background) >= 4.5) return darker;
    }
    return fallback;
  }
  function semanticTheme(theme = {}) {
    const panel = hex(theme.panel);
    const background = hex(theme.bg);
    const onAccent = [hex(theme.text), background, '#ffffff', '#000000'].sort((a, b) => contrast(b, theme.accent) - contrast(a, theme.accent))[0];
    return {
      ...theme,
      raised: hex(theme.raised) !== '#000000' || theme.raised === '#000000' ? theme.raised : blend(panel, theme.text, .08),
      inset: hex(theme.inset) !== '#000000' || theme.inset === '#000000' ? theme.inset : blend(background, '#000000', .18),
      link: theme.link && contrast(theme.link, panel) >= 4.5 ? theme.link : readable(theme.accent2, panel, theme.text),
      focus: theme.focus && contrast(theme.focus, panel) >= 3 ? theme.focus : readable(theme.accent2, panel, theme.text),
      onAccent: theme.onAccent && contrast(theme.onAccent, theme.accent) >= 4.5 ? theme.onAccent : onAccent,
    };
  }
  // Callers own foreground, accessibility fallbacks, and removing these inline properties.
  // Settings use the persisted JSON schema. Parse in the caller's userscript realm
  // instead of returning a native structuredClone page-realm Xray wrapper.
  function cloneSettings(value) { return JSON.parse(JSON.stringify(value)); }
  function applyTextGradient(element, backgroundImage) {
    const properties = {'background-color':'transparent','background-image':backgroundImage,'background-clip':'text','-webkit-background-clip':'text','background-size':'auto','background-position':'0% 0%','background-repeat':'repeat'};
    for (const [property,value] of Object.entries(properties)) element.style.setProperty(property,value,'important');
  }
  function replaceMenuContent(container, content) {
    const summary = node => node.querySelector(':scope > summary')?.textContent.trim();
    const expanded = new Set([...container.querySelectorAll('details[open]')].map(summary));
    container.replaceChildren(content);
    for (const node of container.querySelectorAll('details')) if (expanded.has(summary(node))) node.open = true;
  }
  function createDisclosure(label, ...contents) {
    return ExpMenuArrangement.createDisclosure({
      document,
      label,
      category: 'advanced',
      contents,
      className: 'exp-system-card',
    });
  }
  function createSystemGrid(...contents) {
    const grid = document.createElement('div'); grid.dataset.expSystemTools = '1';
    grid.append(...contents); return grid;
  }
  // One suite size. Placement clamps this preferred width to the viewport.
  function menuWidth() { return ExpMenuPreferences.menuSizeTokens().width; }
  const canonicalCss = CoreFoundation.css();
  const compositionCss = `
    [data-exp-part="dock"]{box-sizing:border-box;overflow-x:hidden;overscroll-behavior:contain}
    [data-exp-part="dock"] :is(.row,.group,.section,.fl-tool-body,.route-body,.fl-tool-title){min-width:0;max-width:100%;overflow-wrap:anywhere!important}
    [data-exp-part="dock"] :is(input,select,textarea){min-width:0;max-width:100%}
    .update-notice,.changelog{max-height:calc(100vh - 24px)!important;overflow-x:hidden!important;overflow-y:auto!important;overscroll-behavior:contain;overflow-wrap:anywhere}

    [data-exp-system-tools]{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:6px!important;align-items:stretch;grid-column:1/-1!important;min-width:0}
    [data-exp-system-tools]>details{box-sizing:border-box;min-width:0;margin:0!important;padding:7px!important;border:1px solid var(--theme-line);border-radius:7px;grid-column:auto!important;overflow-wrap:anywhere}
    [data-exp-system-tools]>details[open]{grid-column:1/-1!important}
    [data-exp-system-tools]>details>summary{cursor:pointer;font-weight:600}
    .exp-system-card>summary{cursor:pointer}
    .exp-system-card>summary+*{margin-top:6px}
    :host{color-scheme:dark}
    [data-exp-part="launcher"]{box-sizing:border-box!important;width:48px!important;min-width:48px!important;max-width:48px!important;height:48px!important;min-height:48px!important;max-height:48px!important}
    [data-exp-part="launcher"] .launcher-icon{width:40px!important;height:40px!important}
    .header-icon{width:38px!important;height:38px!important}
    .header-icon .menu-icon{width:38px!important;height:38px!important}
    :host([data-exp-theme-deprioritized="1"]) .theme-row:has(.exp-theme-swatches),:host([data-exp-theme-deprioritized="1"]) #mb-theme-dots{display:none!important}
    :host([data-exp-theme-deprioritized="1"]) #mb-cluster{--mb-bg:var(--theme-bg)!important;--mb-surface:var(--theme-panel)!important;--mb-chip:var(--theme-raised)!important;--mb-ink:var(--theme-text)!important;--mb-muted:var(--theme-muted)!important;--mb-line:var(--theme-line)!important;--mb-brand:var(--theme-accent)!important;--mb-brand-ink:var(--theme-onAccent)!important;--mb-hover:var(--theme-raised)!important;--mb-track:var(--theme-line)!important}
    [hidden]{display:none!important}
    .exp-core-theme{position:static;display:contents;color:var(--theme-text);font:13px/1.42 ui-sans-serif,system-ui,"Segoe UI",sans-serif}
    [data-exp-part="dock"],[data-exp-part="launcher"]{position:fixed}
    [data-exp-part="dock"]{color:var(--theme-text);scrollbar-width:thin}
    [data-exp-part="dock"] [data-exp-part="title"]{color:var(--theme-text)}
    .exp-core-theme a{color:var(--theme-link)}
    button,input,select,textarea{font-family:inherit}
    button{color:inherit}
    button:disabled{opacity:.5;cursor:not-allowed}
    button:focus-visible,input:focus-visible,select:focus-visible,summary:focus-visible{outline:2px solid var(--theme-focus);outline-offset:2px}
    button.fl-tool-header{width:100%;border:0;background:transparent;color:var(--theme-text);text-align:left;font:inherit}
    .fl-tool-header .fl-tool-chevron{font:var(--exp-font-size-body,13px)/1.42 system-ui}
    .fl-tool-body[hidden]{display:none!important}
    .fl-tool-body>.group,.fl-tool-body>.section,.fl-tool-body>.flat-group{grid-column:1/-1;min-width:0}
    .fl-tool-body :is(.group,.section,.flat-group){display:grid!important;grid-template-columns:minmax(0,1fr)!important}
    .fl-tool-body :is(.group,.section,.flat-group)>*{grid-column:1/-1!important;min-width:0}
    .group,.section,.flat-group{margin:0;padding:0;border:0;background:transparent}
    .group>h3,.section>h3,.section>h2{margin:8px 0 3px;font-size:var(--exp-font-size-small,11px);font-weight:800;color:var(--theme-muted)}
    .group:first-child>h3,.section:first-child>h3{margin-top:6px}
    .group>.row,.section>.row,.flat-group>.row{min-width:0}
    .row>.copy,.row>.row-copy,.row>.setting-label,.row>div:first-child{min-width:0;flex:1}
    .label,.copy>strong,.row-copy>strong,.setting-label{font-size:var(--exp-font-size-body,13px);font-weight:500;line-height:1.25}
    .copy>.help,.row-copy>small,.help,.empty,.note,.meta{font-size:var(--exp-font-size-small,11px);line-height:1.4;color:var(--theme-muted)}
    .copy>.help,.row-copy>small{display:block;margin-top:3px}
    .toggleSwitch{padding:0;min-width:34px;max-width:34px;min-height:20px;max-height:20px}
    .toggleSwitch>span{display:none}
    .row>.life-btn,.mini-row>.life-btn{width:auto;min-width:50px;margin:0;padding:3px 7px}
    .row>select,.mini-row>select{max-width:55%}
    .button-grid,.actions,.profile-actions,.menu-footer,.diagnostics-controls>div,.rules-transfer{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;min-width:0}
    .button-grid>*{min-width:0}
    .life-btn.warn{border-color:#cb6868!important;background:#402020!important;color:#ffd7d7!important}
    input:not([type=file]),textarea{box-sizing:border-box;max-width:100%;min-width:0;border:1px solid var(--theme-line);border-radius:6px;background:var(--theme-inset);color:var(--theme-text);padding:5px 6px;font-size:var(--exp-font-size-body,13px)}
    input[type=search],textarea{width:100%}
    .identity{display:flex;gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid var(--theme-line)}
    .identity>.copy{flex:1;min-width:0}
    .identity-actions{display:flex;gap:6px;align-items:center}
    .identity-actions>.life-btn{width:auto;margin:0;padding:3px 6px}
    .theme-row{flex-wrap:wrap}
    .exp-theme-swatches{min-width:0}
    .appearance-group,.auth-advanced,.rule-card,.stat-card{grid-column:1/-1;min-width:0;border:1px solid var(--theme-line);border-radius:7px;margin-top:6px;padding:6px;background:var(--theme-inset)}
    summary{cursor:pointer;font-size:var(--exp-font-size-body,13px)}
    .feature-pair,.category-grid{display:block}
    .status-value,output{font-size:var(--exp-font-size-small,11px);color:var(--theme-muted)}
    .live,.sr-only,.status{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
    .toast{position:fixed;z-index:2147483647;right:12px;max-width:calc(100vw - 24px)}
    .update-notice{position:fixed;z-index:2147483647}
    .diag{margin:6px 0 0}
    .diag[hidden]{display:none!important}
    .diag:not([hidden]){display:block}
    .utility-grid,.stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}
    .workspace-actions{grid-column:1/-1}
    .setting-arrow,.step-btn{width:25px;min-height:25px;border:1px solid var(--theme-line);border-radius:6px;background:var(--theme-raised);color:var(--theme-text)}
    .step-value{flex:1;text-align:center;font-size:var(--exp-font-size-small,11px)}
    .stepper{display:flex;align-items:center;gap:5px}
  `;
  const TOGGLE = ':is(.toggleSwitch,.switch,[role="switch"])';
  const TOGGLE_BG = 'var(--theme-bg,var(--bg,#111114))';
  const TOGGLE_PANEL = 'var(--theme-panel,var(--panel,var(--surface,#18181d)))';
  const TOGGLE_LINE = 'var(--theme-line,var(--line,var(--border,#41434d)))';
  const TOGGLE_MUTED = 'var(--theme-muted,var(--muted,#9aa0a6))';
  const TOGGLE_TEXT = 'var(--theme-text,var(--text,#f4f4f6))';
  const TOGGLE_ACCENT = 'var(--theme-accent,var(--accent,var(--teal,#8b5cf6)))';
  const MATTE_TOGGLE_CHROME_CSS = `${TOGGLE}{position:relative!important;box-sizing:border-box!important;flex:none!important;width:34px!important;height:20px!important;min-width:34px!important;min-height:20px!important;padding:0!important;border:1px solid color-mix(in srgb,${TOGGLE_LINE} 88%,${TOGGLE_MUTED} 12%)!important;border-radius:6px!important;background:color-mix(in srgb,${TOGGLE_BG} 84%,${TOGGLE_PANEL} 16%)!important;background-image:none!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.018)!important;cursor:pointer!important}${TOGGLE}:not(:has(> span))::after{content:""!important;position:absolute!important;top:2px!important;left:2px!important;width:14px!important;height:14px!important;box-sizing:border-box!important;border:0!important;border-radius:4px!important;background:color-mix(in srgb,${TOGGLE_MUTED} 82%,${TOGGLE_TEXT} 18%)!important;box-shadow:none!important}${TOGGLE}>span{display:block!important;position:absolute!important;top:2px!important;left:2px!important;width:14px!important;height:14px!important;box-sizing:border-box!important;border:0!important;border-radius:4px!important;background:color-mix(in srgb,${TOGGLE_MUTED} 82%,${TOGGLE_TEXT} 18%)!important;box-shadow:none!important}${TOGGLE}[aria-checked="true"]{border-color:color-mix(in srgb,${TOGGLE_LINE} 52%,${TOGGLE_ACCENT} 48%)!important;background:color-mix(in srgb,${TOGGLE_PANEL} 72%,${TOGGLE_ACCENT} 28%)!important;background-image:none!important}${TOGGLE}[aria-checked="true"]:not(:has(> span))::after{transform:translateX(14px)!important;background:${TOGGLE_TEXT}!important}${TOGGLE}[aria-checked="true"]>span{transform:translateX(14px)!important;background:${TOGGLE_TEXT}!important}:host([data-ui-theme="pride"]) ${TOGGLE}[aria-checked="true"],.exp-core-theme[data-ui-theme="pride"] ${TOGGLE}[aria-checked="true"],:host([data-theme-skin="gradient"]) ${TOGGLE}[aria-checked="true"],.exp-core-theme[data-theme-skin="gradient"]:not([data-ui-theme="contrast"]) ${TOGGLE}[aria-checked="true"]{background-image:none!important;border-color:color-mix(in srgb,${TOGGLE_LINE} 52%,${TOGGLE_ACCENT} 48%)!important;background:color-mix(in srgb,${TOGGLE_PANEL} 72%,${TOGGLE_ACCENT} 28%)!important}:host([data-ui-theme="contrast"]) ${TOGGLE},:host([data-ui-theme="obsidian"]) ${TOGGLE},.exp-core-theme[data-ui-theme="contrast"] ${TOGGLE},.exp-core-theme[data-ui-theme="obsidian"] ${TOGGLE}{border:2px solid #fff!important;background:#050505!important;background-image:none!important}:host([data-ui-theme="contrast"]) ${TOGGLE}:not(:has(> span))::after,:host([data-ui-theme="obsidian"]) ${TOGGLE}:not(:has(> span))::after,.exp-core-theme[data-ui-theme="contrast"] ${TOGGLE}:not(:has(> span))::after,.exp-core-theme[data-ui-theme="obsidian"] ${TOGGLE}:not(:has(> span))::after{top:0!important;left:0!important;border:1px solid #050505!important;background:#fff!important}:host([data-ui-theme="contrast"]) ${TOGGLE}>span,:host([data-ui-theme="obsidian"]) ${TOGGLE}>span,.exp-core-theme[data-ui-theme="contrast"] ${TOGGLE}>span,.exp-core-theme[data-ui-theme="obsidian"] ${TOGGLE}>span{top:0!important;left:0!important;border:1px solid #050505!important;background:#fff!important}:host([data-ui-theme="contrast"]) ${TOGGLE}[aria-checked="true"],:host([data-ui-theme="obsidian"]) ${TOGGLE}[aria-checked="true"],.exp-core-theme[data-ui-theme="contrast"] ${TOGGLE}[aria-checked="true"],.exp-core-theme[data-ui-theme="obsidian"] ${TOGGLE}[aria-checked="true"]{background:#fff!important;border-color:#fff!important;background-image:none!important}:host([data-ui-theme="contrast"]) ${TOGGLE}[aria-checked="true"]:not(:has(> span))::after,:host([data-ui-theme="obsidian"]) ${TOGGLE}[aria-checked="true"]:not(:has(> span))::after,.exp-core-theme[data-ui-theme="contrast"] ${TOGGLE}[aria-checked="true"]:not(:has(> span))::after,.exp-core-theme[data-ui-theme="obsidian"] ${TOGGLE}[aria-checked="true"]:not(:has(> span))::after{background:#050505!important;border-color:#fff!important;transform:translateX(14px)!important}:host([data-ui-theme="contrast"]) ${TOGGLE}[aria-checked="true"]>span,:host([data-ui-theme="obsidian"]) ${TOGGLE}[aria-checked="true"]>span,.exp-core-theme[data-ui-theme="contrast"] ${TOGGLE}[aria-checked="true"]>span,.exp-core-theme[data-ui-theme="obsidian"] ${TOGGLE}[aria-checked="true"]>span{background:#050505!important;border-color:#fff!important;transform:translateX(14px)!important}@media (forced-colors: active){${TOGGLE}{forced-color-adjust:none;border:1px solid CanvasText!important;background:Canvas!important;background-image:none!important}${TOGGLE}:not(:has(> span))::after{border-color:CanvasText!important;background:CanvasText!important}${TOGGLE}>span{border-color:CanvasText!important;background:CanvasText!important}${TOGGLE}[aria-checked="true"]{border-color:Highlight!important;background:Highlight!important;background-image:none!important}${TOGGLE}[aria-checked="true"]:not(:has(> span))::after{border-color:HighlightText!important;background:HighlightText!important}${TOGGLE}[aria-checked="true"]>span{border-color:HighlightText!important;background:HighlightText!important}}`;
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };
  const emit = (type, productId) => document.dispatchEvent(new CustomEvent('exp-core:coordination', { detail: { protocol, type, productId } }));

  function normalizeSuiteCapabilities(values = []) {
    if (!Array.isArray(values)) return [];
    return [...new Set(values.map(value => String(value || '').trim().toLowerCase()).filter(value => /^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)+$/.test(value)))];
  }

  function suiteContract(productId) {
    const id = String(productId || '').toLowerCase();
    const known = SUITE_PRODUCTS[id];
    if (!known) return null;
    return Object.freeze({
      id,
      role: known.role || 'product',
      repository: known.repository || '',
      rootId: known.rootId || '',
      priority: Number(known.priority || SUITE_PRIORITY[id] || 0),
      launcherPriority: Number(known.launcherPriority || LAUNCHER_PRIORITY[id] || 0),
      themePriority: Number(known.themePriority || THEME_PRIORITY[id] || 0),
      capabilities: Object.freeze(normalizeSuiteCapabilities(known.capabilities)),
      presentationPhases: Object.freeze(normalizePresentationPhases(known.presentationPhases || [])),
      menuSections: Object.freeze(Object.fromEntries(
        Object.entries(known.menuSections || {}).map(([category, sections]) => [category, Object.freeze([...sections])])
      )),
      state: known.state ? Object.freeze({
        type: known.state.type,
        fields: Object.freeze({ ...known.state.fields }),
      }) : null,
    });
  }

  function suiteProductNode(productId) {
    const id = String(productId || '').toLowerCase();
    if (!/^[a-z][a-z0-9-]+$/.test(id)) return null;
    return [...document.querySelectorAll('[data-exp-suite-product]')]
      .find(node => node.dataset.expSuiteProduct === id) || null;
  }

  function registerSuiteProduct(options = {}) {
    const id = String(options.id || options.productId || '').toLowerCase();
    const productVersion = String(options.version || options.productVersion || 'unknown');
    if (!/^[a-z][a-z0-9-]+$/.test(id)) throw new Error('Invalid suite product ID');
    const contract = suiteContract(id);
    const capabilities = normalizeSuiteCapabilities(contract ? contract.capabilities : options.capabilities);
    const priority = Number(contract?.priority ?? options.priority ?? 0);
    const role = String(contract?.role ?? options.role ?? 'product');
    let node = suiteProductNode(id);
    const previous = node ? JSON.stringify({
      version: node.dataset.expSuiteVersion || '',
      coreVersion: node.dataset.expSuiteCoreVersion || '',
      role: node.dataset.expSuiteRole || '',
      priority: node.dataset.expSuitePriority || '',
      capabilities: node.dataset.expSuiteCapabilities || '[]',
    }) : null;
    if (!node) {
      node = document.createElement('meta');
      node.dataset.expSuiteProduct = id;
      (document.documentElement || document.head || document.body)?.append(node);
    }
    node.dataset.expSuiteVersion = productVersion;
    node.dataset.expSuiteCoreVersion = version;
    node.dataset.expSuiteRole = role;
    node.dataset.expSuitePriority = String(Number.isFinite(priority) ? priority : 0);
    node.dataset.expSuiteCapabilities = JSON.stringify(capabilities);
    const current = JSON.stringify({
      version: node.dataset.expSuiteVersion,
      coreVersion: node.dataset.expSuiteCoreVersion,
      role: node.dataset.expSuiteRole,
      priority: node.dataset.expSuitePriority,
      capabilities: node.dataset.expSuiteCapabilities,
    });
    if (previous !== current) emitSuiteEvent(id, 'product.registered', { capabilities, role, version: productVersion });
    return Object.freeze({
      id,
      update(next = {}) { return registerSuiteProduct({ id, version: productVersion, role, priority, capabilities, ...next }); },
      dispose() {
        const current = suiteProductNode(id);
        if (current === node) current.remove();
        emitSuiteEvent(id, 'product.unregistered', {});
      },
    });
  }

  function suiteSnapshot() {
    const products = [...document.querySelectorAll('[data-exp-suite-product]')].map(node => {
      let capabilities = [];
      try { capabilities = normalizeSuiteCapabilities(JSON.parse(node.dataset.expSuiteCapabilities || '[]')); } catch {}
      return Object.freeze({
        id: node.dataset.expSuiteProduct,
        version: node.dataset.expSuiteVersion || 'unknown',
        coreVersion: node.dataset.expSuiteCoreVersion || 'unknown',
        role: node.dataset.expSuiteRole || 'product',
        priority: Number(node.dataset.expSuitePriority || 0),
        capabilities: Object.freeze(capabilities),
      });
    }).filter(product => product.id)
      .sort((left, right) => right.priority - left.priority || left.id.localeCompare(right.id));
    return Object.freeze({
      protocol: 'exp-suite-interoperability-v1',
      coreVersion: version,
      trust: SUITE_TRUST,
      products: Object.freeze(products),
    });
  }

  function capabilityProviders(capability) {
    const name = String(capability || '').trim().toLowerCase();
    return Object.freeze(suiteSnapshot().products.filter(product => product.capabilities.includes(name)));
  }

  function hasProductCapability(capability) {
    return capabilityProviders(capability).length > 0;
  }

  function pageContext() {
    return Object.freeze({
      href: location.href,
      origin: location.origin,
      hostname: location.hostname,
      pathname: location.pathname,
      topLevel: window.top === window.self,
    });
  }

  function navigationObserverMarker() {
    return document.querySelector('meta[data-exp-navigation-observer]');
  }

  function ensureSharedNavigationObserver(owner = 'core') {
    let marker = navigationObserverMarker();
    if (marker) return Object.freeze({ leader: false, owner: marker.dataset.expNavigationObserver || 'unknown' });
    marker = document.createElement('meta');
    marker.dataset.expOwned = '1';
    marker.dataset.expNavigationObserver = String(owner || 'core').toLowerCase();
    marker.dataset.expNavigationProtocol = 'exp-navigation-observer-v1';
    marker.dataset.expNavigationEpoch = '0';
    marker.dataset.expNavigationSubscribers = '0';
    (document.head || document.documentElement || document.body)?.append(marker);

    let previous = location.href;
    let epoch = 0;
    let pendingHistoryKind = '';
    let disposed = false;
    const publish = kind => {
      if (disposed) return false;
      const href = location.href;
      if (href === previous) return false;
      previous = href;
      epoch += 1;
      marker.dataset.expNavigationEpoch = String(epoch);
      const payload = JSON.stringify({
        protocol: 'exp-navigation-observer-v1',
        owner: marker.dataset.expNavigationObserver,
        epoch,
        kind: String(kind || 'navigation'),
        href,
        at: Date.now(),
      });
      document.dispatchEvent(new CustomEvent(NAVIGATION_EVENT, { detail: payload }));
      return true;
    };
    const originals = {};
    const wrappers = {};
    for (const name of ['pushState', 'replaceState']) {
      const original = history[name];
      originals[name] = original;
      const wrapped = function (...args) {
        const priorKind = pendingHistoryKind;
        pendingHistoryKind = name;
        try {
          const result = Reflect.apply(original, this, args);
          publish(name);
          return result;
        } finally {
          pendingHistoryKind = priorKind;
        }
      };
      wrappers[name] = wrapped;
      history[name] = wrapped;
    }
    const onPopState = () => publish('popstate');
    const onHashChange = () => publish('hashchange');
    const onCurrentEntryChange = () => publish(pendingHistoryKind || 'currententrychange');
    addEventListener('popstate', onPopState);
    addEventListener('hashchange', onHashChange);
    globalThis.navigation?.addEventListener('currententrychange', onCurrentEntryChange);
    const teardown = () => {
      if (disposed || Number(marker.dataset.expNavigationSubscribers || 0) > 0) return false;
      disposed = true;
      for (const name of Object.keys(wrappers)) if (history[name] === wrappers[name]) history[name] = originals[name];
      removeEventListener('popstate', onPopState);
      removeEventListener('hashchange', onHashChange);
      globalThis.navigation?.removeEventListener('currententrychange', onCurrentEntryChange);
      document.removeEventListener(NAVIGATION_CONTROL_EVENT, onControl);
      if (marker.isConnected) marker.remove();
      return true;
    };
    const onControl = event => {
      let payload;
      try { payload = typeof event.detail === 'string' ? JSON.parse(event.detail) : event.detail; } catch { return; }
      if (!payload || payload.protocol !== 'exp-navigation-observer-v1' || payload.type !== 'release-if-idle') return;
      teardown();
    };
    document.addEventListener(NAVIGATION_CONTROL_EVENT, onControl);
    return Object.freeze({ leader: true, owner: marker.dataset.expNavigationObserver });
  }

  function observeNavigation(callback, options = {}) {
    if (typeof callback !== 'function') throw new TypeError('Navigation callback must be a function');
    ensureSharedNavigationObserver(options.productId || options.owner || 'core');
    let marker = navigationObserverMarker();
    if (marker) marker.dataset.expNavigationSubscribers = String(Number(marker.dataset.expNavigationSubscribers || 0) + 1);
    const listener = event => {
      let payload;
      try { payload = typeof event.detail === 'string' ? JSON.parse(event.detail) : event.detail; } catch { return; }
      if (!payload || payload.protocol !== 'exp-navigation-observer-v1') return;
      callback(Object.freeze({ ...payload }));
    };
    document.addEventListener(NAVIGATION_EVENT, listener);
    let disposed = false;
    return () => {
      if (disposed) return;
      disposed = true;
      document.removeEventListener(NAVIGATION_EVENT, listener);
      marker = navigationObserverMarker();
      if (!marker) return;
      const next = Math.max(0, Number(marker.dataset.expNavigationSubscribers || 0) - 1);
      marker.dataset.expNavigationSubscribers = String(next);
      if (!next) document.dispatchEvent(new CustomEvent(NAVIGATION_CONTROL_EVENT, {
        detail: JSON.stringify({ protocol: 'exp-navigation-observer-v1', type: 'release-if-idle' }),
      }));
    };
  }

  function navigationObserverState() {
    const marker = navigationObserverMarker();
    return Object.freeze({
      active: Boolean(marker),
      owner: marker?.dataset.expNavigationObserver || null,
      protocol: marker?.dataset.expNavigationProtocol || null,
      epoch: Number(marker?.dataset.expNavigationEpoch || 0),
      subscribers: Number(marker?.dataset.expNavigationSubscribers || 0),
    });
  }

  function emitSuiteEvent(productId, type, detail = {}) {
    const source = String(productId || 'core').toLowerCase();
    const eventType = String(type || '').trim().toLowerCase();
    if (!/^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)+$/.test(eventType)) throw new Error('Invalid suite event type');
    let safeDetail = {};
    try { safeDetail = JSON.parse(JSON.stringify(detail || {})); } catch {}
    const payload = JSON.stringify({
      protocol: 'exp-suite-interoperability-v1',
      coreVersion: version,
      trust: SUITE_TRUST,
      source,
      type: eventType,
      detail: safeDetail,
      at: Date.now(),
    });
    document.dispatchEvent(new CustomEvent(SUITE_EVENT, { detail: payload }));
  }

  function suiteSiteKey(hostname = location.hostname) {
    return `${SUITE_SITE_PAUSE_PREFIX}${String(hostname || 'local-document').trim().toLowerCase()}`;
  }

  function suiteSitePaused(hostname = location.hostname) {
    try { const value=Number(localStorage.getItem(suiteSiteKey(hostname))||0);return value===1||value>Date.now(); } catch { return false; }
  }

  function setSuiteSitePaused(paused, hostname = location.hostname, minutes = 0) {
    const host = String(hostname || 'local-document').trim().toLowerCase();
    const value = Boolean(paused);
    try {
      if (value) localStorage.setItem(suiteSiteKey(host),String(Number(minutes)>0?Date.now()+Math.min(1440,Number(minutes))*60000:1));
      else localStorage.removeItem(suiteSiteKey(host));
    } catch {}
    emitSuiteEvent('core', 'suite.site-control', { hostname: host, paused: value });
    scheduleSuitePauseExpiry();
    return value;
  }
  function scheduleSuitePauseExpiry(){clearTimeout(suitePauseTimer);let until=0;try{until=Number(localStorage.getItem(suiteSiteKey())||0);}catch{}if(until>1){suitePauseTimer=setTimeout(()=>{let current=0;try{current=Number(localStorage.getItem(suiteSiteKey())||0);}catch{}if(current===until)setSuiteSitePaused(false);else scheduleSuitePauseExpiry();},Math.max(0,until-Date.now()));}}
  addEventListener('storage',event=>{if(event.key!==suiteSiteKey())return;emitSuiteEvent('core','suite.site-control',{hostname:String(location.hostname||'local-document').toLowerCase(),paused:suiteSitePaused()});scheduleSuitePauseExpiry();});
  scheduleSuitePauseExpiry();

  function stableSuiteValue(value) {
    if (Array.isArray(value)) return value.map(stableSuiteValue);
    if (!value || typeof value !== 'object') return value;
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, stableSuiteValue(value[key])]));
  }

  function normalizeSuiteStateForContract(productId, type, state = {}) {
    const source = String(productId || '').toLowerCase();
    const eventType = String(type || '').trim().toLowerCase();
    const contract = suiteContract(source);
    const schema = contract?.state;
    const input = state && typeof state === 'object' && !Array.isArray(state) ? state : {};
    if (!schema || schema.type !== eventType) return stableSuiteValue(input);
    const keys = Object.keys(input);
    const expected = Object.keys(schema.fields);
    const unknown = keys.filter(key => !Object.hasOwn(schema.fields, key));
    if (unknown.length) throw new Error(`Unknown suite state field: ${unknown[0]}`);
    const missing = expected.filter(key => !Object.hasOwn(input, key));
    if (missing.length) throw new Error(`Missing suite state field: ${missing[0]}`);
    const output = {};
    for (const [key, kind] of Object.entries(schema.fields)) {
      const value = input[key];
      if (kind === 'boolean') {
        if (typeof value !== 'boolean') throw new Error(`Invalid boolean suite state field: ${key}`);
        output[key] = value;
      } else if (kind === 'token') {
        const token = String(value ?? '').trim().toLowerCase();
        if (!/^[a-z0-9][a-z0-9._:-]{0,79}$/.test(token)) throw new Error(`Invalid token suite state field: ${key}`);
        output[key] = token;
      } else if (kind === 'count') {
        const count = Number(value);
        if (!Number.isSafeInteger(count) || count < 0) throw new Error(`Invalid count suite state field: ${key}`);
        output[key] = count;
      } else if (kind === 'percent-nullable') {
        if (value === null) output[key] = null;
        else {
          const percent = Number(value);
          if (!Number.isFinite(percent) || percent < 0 || percent > 100) throw new Error(`Invalid percent suite state field: ${key}`);
          output[key] = percent;
        }
      } else {
        throw new Error(`Unsupported suite state schema kind: ${kind}`);
      }
    }
    return stableSuiteValue(output);
  }

  function suiteStateNode(productId, type) {
    const source = String(productId || '').toLowerCase();
    const eventType = String(type || '').trim().toLowerCase();
    return [...document.querySelectorAll('meta[data-exp-suite-state-product][data-exp-suite-state-type]')]
      .find(node => node.dataset.expSuiteStateProduct === source && node.dataset.expSuiteStateType === eventType) || null;
  }

  function readSuiteStateNode(node) {
    if (!(node instanceof Element)) return null;
    let state = {};
    try { state = JSON.parse(node.dataset.expSuiteStatePayload || '{}'); } catch {}
    return Object.freeze({
      productId: node.dataset.expSuiteStateProduct || '',
      type: node.dataset.expSuiteStateType || '',
      coreVersion: node.dataset.expSuiteStateCoreVersion || 'unknown',
      trust: node.dataset.expSuiteStateTrust || SUITE_TRUST,
      at: Number(node.dataset.expSuiteStateAt || 0),
      state: Object.freeze(stableSuiteValue(state && typeof state === 'object' ? state : {})),
    });
  }

  function suiteStateSnapshot(productId = '') {
    const source = String(productId || '').toLowerCase();
    return Object.freeze(
      [...document.querySelectorAll('meta[data-exp-suite-state-product][data-exp-suite-state-type]')]
        .filter(node => !source || node.dataset.expSuiteStateProduct === source)
        .map(readSuiteStateNode)
        .filter(Boolean)
        .sort((left, right) => left.productId.localeCompare(right.productId) || left.type.localeCompare(right.type))
    );
  }

  function latestSuiteState(productId, type = '') {
    const source = String(productId || '').toLowerCase();
    const eventType = String(type || '').trim().toLowerCase();
    const states = suiteStateSnapshot(source).filter(entry => !eventType || entry.type === eventType);
    return states.sort((left, right) => right.at - left.at)[0] || null;
  }

  function publishSuiteState(productId, type, state = {}) {
    const source = String(productId || '').toLowerCase();
    const eventType = String(type || '').trim().toLowerCase();
    if (!/^[a-z][a-z0-9-]+$/.test(source)) throw new Error('Invalid suite state product ID');
    if (!/^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)+$/.test(eventType)) throw new Error('Invalid suite state event type');
    let safeState = {};
    try {
      safeState = normalizeSuiteStateForContract(source, eventType, JSON.parse(JSON.stringify(state || {})));
    } catch (error) {
      throw error;
    }
    const serialized = JSON.stringify(safeState);
    if (serialized.length > 4096) throw new Error('Suite state payload exceeds 4096 bytes');
    const key = `${source}:${eventType}`;
    let node = suiteStateNode(source, eventType);
    const sharedFingerprint = node?.dataset.expSuiteStatePayload || '';
    if (sharedFingerprint === serialized || suiteStateFingerprints.get(key) === serialized) return false;
    suiteStateFingerprints.set(key, serialized);
    if (!node) {
      node = document.createElement('meta');
      node.dataset.expOwned = '1';
      node.dataset.expSuiteStateProduct = source;
      node.dataset.expSuiteStateType = eventType;
      (document.head || document.documentElement || document.body)?.append(node);
    }
    node.dataset.expSuiteStatePayload = serialized;
    node.dataset.expSuiteStateCoreVersion = version;
    node.dataset.expSuiteStateTrust = SUITE_TRUST;
    node.dataset.expSuiteStateAt = String(Date.now());
    emitSuiteEvent(source, eventType, safeState);
    return true;
  }

  function onSuiteEvent(callback, options = {}) {
    if (typeof callback !== 'function') throw new TypeError('Suite event callback must be a function');
    const expectedType = options.type ? String(options.type).toLowerCase() : null;
    const listener = event => {
      let payload;
      try { payload = typeof event.detail === 'string' ? JSON.parse(event.detail) : event.detail; } catch { return; }
      if (!payload || payload.protocol !== 'exp-suite-interoperability-v1') return;
      if (expectedType && payload.type !== expectedType) return;
      callback(payload);
    };
    document.addEventListener(SUITE_EVENT, listener);
    return () => document.removeEventListener(SUITE_EVENT, listener);
  }

  function subscribeSuiteState(productId, callback, options = {}) {
    if (typeof callback !== 'function') throw new TypeError('Suite state callback must be a function');
    const source = String(productId || '').toLowerCase();
    if (!/^[a-z][a-z0-9-]+$/.test(source)) throw new Error('Invalid suite state product ID');
    const contractType = suiteContract(source)?.state?.type || '';
    const eventType = String(options.type || contractType).trim().toLowerCase();
    if (eventType && !/^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)+$/.test(eventType)) throw new Error('Invalid suite state event type');
    let disposed = false;
    const deliver = entry => {
      if (disposed || !entry) return;
      callback(Object.freeze({ ...entry, state: Object.freeze(stableSuiteValue(entry.state || {})) }));
    };
    if (options.immediate !== false) deliver(latestSuiteState(source, eventType));
    const stop = onSuiteEvent(event => {
      if (event.source !== source) return;
      if (eventType && event.type !== eventType) return;
      deliver(latestSuiteState(source, eventType));
    }, eventType ? { type: eventType } : {});
    return () => {
      if (disposed) return;
      disposed = true;
      stop();
    };
  }

  function normalizePresentationPhases(values = []) {
    const list = Array.isArray(values) ? values : [values];
    return [...new Set(list.map(value => String(value || '').trim().toLowerCase()).filter(value => PRESENTATION_PHASES[value]))]
      .sort((left, right) => PRESENTATION_PHASES[left] - PRESENTATION_PHASES[right]);
  }

  function presentationProviderNode(productId) {
    const id = String(productId || '').toLowerCase();
    if (!/^[a-z][a-z0-9-]+$/.test(id)) return null;
    return [...document.querySelectorAll('[data-exp-presentation-provider]')]
      .find(node => node.dataset.expPresentationProvider === id) || null;
  }

  function registerPresentationProvider(options = {}) {
    const id = String(options.id || options.productId || '').toLowerCase();
    if (!/^[a-z][a-z0-9-]+$/.test(id)) throw new Error('Invalid presentation product ID');
    const contract = suiteContract(id);
    if (contract && !contract.presentationPhases.length) throw new Error('Presentation provider is not declared for this suite product');
    const phases = normalizePresentationPhases(contract ? contract.presentationPhases : options.phases || options.phase);
    if (!phases.length) throw new Error('Presentation provider requires at least one valid phase');
    let node = presentationProviderNode(id);
    const previous = node ? JSON.stringify({
      phases: node.dataset.expPresentationPhases || '[]',
      priority: node.dataset.expPresentationPriority || '',
    }) : null;
    if (!node) {
      node = document.createElement('meta');
      node.dataset.expPresentationProvider = id;
      (document.documentElement || document.head || document.body)?.append(node);
    }
    node.dataset.expPresentationPhases = JSON.stringify(phases);
    node.dataset.expPresentationPriority = String(Number(contract?.priority ?? options.priority ?? 0) || 0);
    const current = JSON.stringify({
      phases: node.dataset.expPresentationPhases,
      priority: node.dataset.expPresentationPriority,
    });
    if (previous !== current) emitSuiteEvent(id, 'presentation.provider-registered', { phases });
    return Object.freeze({
      id,
      phases: Object.freeze([...phases]),
      dispose() {
        const current = presentationProviderNode(id);
        if (current === node) current.remove();
        emitSuiteEvent(id, 'presentation.provider-unregistered', {});
      },
    });
  }

  function presentationProviders() {
    return Object.freeze([...document.querySelectorAll('[data-exp-presentation-provider]')].map(node => {
      let phases = [];
      try { phases = normalizePresentationPhases(JSON.parse(node.dataset.expPresentationPhases || '[]')); } catch {}
      return Object.freeze({
        id: node.dataset.expPresentationProvider,
        phases: Object.freeze(phases),
        priority: Number(node.dataset.expPresentationPriority || 0),
      });
    }).filter(provider => provider.id)
      .sort((left, right) => {
        const leftPhase = Math.min(...left.phases.map(phase => PRESENTATION_PHASES[phase]));
        const rightPhase = Math.min(...right.phases.map(phase => PRESENTATION_PHASES[phase]));
        return leftPhase - rightPhase || right.priority - left.priority || left.id.localeCompare(right.id);
      }));
  }

  function suiteHealth() {
    const suite = suiteSnapshot();
    const providers = presentationProviders();
    const providerMap = new Map(providers.map(provider => [provider.id, provider]));
    const conflicts = [];
    const sameList = (left = [], right = []) => left.length === right.length && left.every((value, index) => value === right[index]);
    const products = suite.products.map(product => {
      const contract = suiteContract(product.id);
      if (!contract) {
        conflicts.push({ type: 'unknown-suite-product', products: [product.id] });
        return Object.freeze({ id: product.id, status: 'unknown-product' });
      }
      const expectedCapabilities = [...contract.capabilities].sort();
      const actualCapabilities = [...product.capabilities].sort();
      const provider = providerMap.get(product.id) || null;
      const expectedPhases = [...contract.presentationPhases];
      const actualPhases = provider ? [...provider.phases] : [];
      if (product.role !== contract.role) conflicts.push({ type: 'suite-role-mismatch', products: [product.id], expected: contract.role, actual: product.role });
      if (product.priority !== contract.priority) conflicts.push({ type: 'suite-priority-mismatch', products: [product.id], expected: contract.priority, actual: product.priority });
      if (!sameList(actualCapabilities, expectedCapabilities)) conflicts.push({ type: 'suite-capability-mismatch', products: [product.id], expected: expectedCapabilities, actual: actualCapabilities });
      if (expectedPhases.length && !provider) conflicts.push({ type: 'missing-presentation-provider', products: [product.id], expected: expectedPhases });
      if (!expectedPhases.length && provider) conflicts.push({ type: 'unexpected-presentation-provider', products: [product.id], actual: actualPhases });
      if (provider && !sameList(actualPhases, expectedPhases)) conflicts.push({ type: 'presentation-phase-mismatch', products: [product.id], expected: expectedPhases, actual: actualPhases });
      const latestState = latestSuiteState(product.id);
      return Object.freeze({
        id: product.id,
        status: conflicts.some(conflict => conflict.products?.includes(product.id)) ? 'conflict' : 'healthy',
        coreVersion: product.coreVersion,
        capabilities: Object.freeze(actualCapabilities),
        presentationPhases: Object.freeze(actualPhases),
        stateType: latestState?.type || null,
        stateAt: latestState?.at || 0,
        stateAgeMs: latestState?.at ? Math.max(0, Date.now() - latestState.at) : null,
        state: latestState?.state || null,
      });
    });
    const coreVersions = [...new Set(
      [...document.querySelectorAll('meta[data-exp-diagnostics-product]')]
        .map(node => node.dataset.expCoreVersion)
        .filter(Boolean)
    )].sort();
    if (coreVersions.length > 1) conflicts.push({ type: 'mixed-core-versions', coreVersions });
    const observerCount = document.querySelectorAll('meta[data-exp-page-observer]').length;
    if (observerCount > 1) conflicts.push({ type: 'duplicate-page-observer', instances: observerCount });
    return Object.freeze({
      status: conflicts.length ? 'conflicts-detected' : 'healthy',
      coreVersions: Object.freeze(coreVersions),
      observerCount,
      products: Object.freeze(products),
      conflicts: Object.freeze(conflicts.map(conflict => Object.freeze({ ...conflict }))),
    });
  }

  function readPresentationState(target) {
    if (!(target instanceof Element)) return Object.freeze({});
    try {
      const value = JSON.parse(target.getAttribute('data-exp-presentation-state') || '{}');
      if (!value || typeof value !== 'object' || Array.isArray(value)) return Object.freeze({});
      return Object.freeze(Object.fromEntries(Object.entries(value).map(([productId, state]) => [
        productId,
        Object.freeze({ ...(state && typeof state === 'object' && !Array.isArray(state) ? state : {}) }),
      ])));
    } catch {
      return Object.freeze({});
    }
  }

  function setPresentationState(target, productId, patch = {}) {
    if (!(target instanceof Element)) throw new TypeError('Presentation target must be an Element');
    const id = String(productId || '').toLowerCase();
    if (!/^[a-z][a-z0-9-]+$/.test(id)) throw new Error('Invalid presentation product ID');
    const previous = target.getAttribute('data-exp-presentation-state') || '';
    const current = JSON.parse(JSON.stringify(readPresentationState(target)));
    const next = { ...(current[id] || {}) };
    for (const [channel, raw] of Object.entries(patch || {})) {
      if (!PRESENTATION_CHANNELS.includes(channel)) continue;
      if (raw === null || raw === undefined || raw === '') delete next[channel];
      else {
        const value = String(raw).trim().toLowerCase();
        if (!/^[a-z0-9][a-z0-9._:-]{0,79}$/.test(value)) throw new Error('Invalid presentation state value');
        next[channel] = value;
      }
    }
    if (Object.keys(next).length) current[id] = next;
    else delete current[id];
    const serialized = Object.keys(current).length ? JSON.stringify(current) : '';
    if (serialized === previous) return readPresentationState(target);
    if (serialized) target.setAttribute('data-exp-presentation-state', serialized);
    else target.removeAttribute('data-exp-presentation-state');
    const phase = pageObserverMarker()?.dataset.expPageObserverPhase || null;
    const detail = JSON.stringify({
      protocol: 'exp-presentation-state-v1',
      source: id,
      channels: Object.keys(next),
      phase,
      at: Date.now(),
    });
    target.dispatchEvent(new CustomEvent(PRESENTATION_STATE_EVENT, {
      bubbles: true,
      composed: true,
      detail,
    }));
    emitSuiteEvent(id, 'presentation.state-changed', { channels: Object.keys(next), phase });
    return readPresentationState(target);
  }

  function clearPresentationState(target, productId) {
    return setPresentationState(target, productId, Object.fromEntries(PRESENTATION_CHANNELS.map(channel => [channel, null])));
  }

  // Only elements carrying the attribute are parsed; closest() skips the rest natively.
  // Visibility checks call this for every candidate element, so an ancestor-by-ancestor
  // JSON walk cost seconds on deep pages.
  function presentationStateChain(target) {
    const chain = [];
    let node = target instanceof Element ? target : target?.parentElement;
    while (node instanceof Element) {
      node = node.closest(PRESENTATION_STATE_SELECTOR);
      if (!node) break;
      const state = readPresentationState(node);
      if (Object.keys(state).length) chain.push(Object.freeze({ node, state }));
      node = node.parentElement;
    }
    return Object.freeze(chain);
  }

  const PRESENTATION_STATE_SELECTOR = '[data-exp-presentation-state]';
  function isPresentationSuppressed(target) {
    for (const entry of presentationStateChain(target)) {
      for (const state of Object.values(entry.state)) {
        if (state?.visibility === 'hide' || state?.visibility === 'collapse') return true;
      }
    }
    return false;
  }

  function pageObserverMarker() {
    return document.querySelector('meta[data-exp-page-observer]');
  }

  function ensureSharedPageObserver(owner = 'core', options = {}) {
    let marker = pageObserverMarker();
    if (marker) return Object.freeze({ leader: false, owner: marker.dataset.expPageObserver || 'unknown' });
    marker = document.createElement('meta');
    marker.dataset.expPageObserver = String(owner || 'core').toLowerCase();
    marker.dataset.expPageObserverProtocol = 'exp-page-observer-v1';
    marker.dataset.expPageObserverEpoch = '0';
    (document.documentElement || document.head || document.body)?.append(marker);

    const delay = Math.max(16, Math.min(500, Number(options.delayMs || 60) || 60));
    let timer = 0;
    let epoch = 0;
    const pending = new Map();
    const queue = (target, record) => {
      if (!(target instanceof Element)) return;
      if (target.closest?.('[data-exp-owned="1"]')) return;
      const state = pending.get(target) || { types: new Set(), added: 0, removed: 0 };
      state.types.add(record.type);
      state.added += record.addedNodes?.length || 0;
      state.removed += record.removedNodes?.length || 0;
      pending.set(target, state);
    };
    // Roots are delivered in chunks, each a complete epoch through every phase, and the
    // event loop gets a turn whenever a task has run past its budget: listeners do real
    // work per root, and one task holding a whole page's batch froze Reddit for seconds.
    const CHUNK_ROOTS = 32;
    const TASK_BUDGET_MS = 8;
    const flush = () => {
      timer = 0;
      const started = performance.now();
      while (pending.size) {
        const chunk = [];
        for (const entry of pending) {
          pending.delete(entry[0]);
          if (entry[0].isConnected) chunk.push(entry);
          if (chunk.length >= CHUNK_ROOTS) break;
        }
        if (chunk.length) deliver(chunk);
        if (pending.size && performance.now() - started >= TASK_BUDGET_MS) {
          timer = setTimeout(flush, 0);
          return;
        }
      }
    };
    const deliver = (entries) => {
      epoch += 1;
      marker.dataset.expPageObserverEpoch = String(epoch);
      const payloads = entries.map(([target, state], index) => [target, JSON.stringify({
        protocol: 'exp-page-observer-v1',
        owner: marker.dataset.expPageObserver,
        epoch,
        rootIndex: index,
        rootCount: entries.length,
        types: [...state.types].sort(),
        added: state.added,
        removed: state.removed,
        href: location.href,
        at: Date.now(),
      })]);
      payloads.forEach(([target, payload]) => {
        target.dispatchEvent(new CustomEvent(PAGE_BATCH_EVENT, { bubbles: true, composed: true, detail: payload }));
      });
      for (const phase of Object.keys(PRESENTATION_PHASES).sort((left, right) => PRESENTATION_PHASES[left] - PRESENTATION_PHASES[right])) {
        marker.dataset.expPageObserverPhase = phase;
        for (const [target, payload] of payloads) {
          target.dispatchEvent(new CustomEvent(`${PAGE_PHASE_EVENT}:${phase}`, { bubbles: true, composed: true, detail: payload }));
        }
        document.dispatchEvent(new CustomEvent(`${PAGE_PHASE_END_EVENT}:${phase}`, {
          detail: JSON.stringify({
            protocol: 'exp-page-observer-v1',
            owner: marker.dataset.expPageObserver,
            epoch,
            phase,
            rootCount: entries.length,
            href: location.href,
            at: Date.now(),
          }),
        }));
        delete marker.dataset.expPageObserverPhase;
      }
    };
    const observer = new MutationObserver(records => {
      for (const record of records) {
        const target = record.target?.nodeType === Node.TEXT_NODE ? record.target.parentElement : record.target;
        queue(target, record);
      }
      if (!timer && pending.size) timer = setTimeout(flush, delay);
    });
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
    return Object.freeze({ leader: true, owner: marker.dataset.expPageObserver });
  }

  function observePage(callback, options = {}) {
    if (typeof callback !== 'function') throw new TypeError('Page observer callback must be a function');
    ensureSharedPageObserver(options.productId || options.owner || 'core', options);
    const listener = event => {
      let payload;
      try { payload = typeof event.detail === 'string' ? JSON.parse(event.detail) : event.detail; } catch { return; }
      if (!payload || payload.protocol !== 'exp-page-observer-v1') return;
      callback(payload, event.target instanceof Element ? event.target : document.documentElement);
    };
    document.addEventListener(PAGE_BATCH_EVENT, listener);
    return () => document.removeEventListener(PAGE_BATCH_EVENT, listener);
  }

  function observePageBatch(callback, options = {}) {
    if (typeof callback !== 'function') throw new TypeError('Page batch callback must be a function');
    const productId = String(options.productId || options.owner || 'core').toLowerCase();
    const contract = suiteContract(productId);
    const requested = options.phase || contract?.presentationPhases?.[0] || 'observe';
    const phase = normalizePresentationPhases([requested])[0] || 'observe';
    ensureSharedPageObserver(productId, options);
    const roots = new Map();
    const rootEvent = `${PAGE_PHASE_EVENT}:${phase}`;
    const endEvent = `${PAGE_PHASE_END_EVENT}:${phase}`;
    const onRoot = event => {
      let payload;
      try { payload = typeof event.detail === 'string' ? JSON.parse(event.detail) : event.detail; } catch { return; }
      if (!payload || payload.protocol !== 'exp-page-observer-v1') return;
      const root = event.target instanceof Element ? event.target : null;
      if (root) roots.set(root, payload);
    };
    const onEnd = event => {
      let payload;
      try { payload = typeof event.detail === 'string' ? JSON.parse(event.detail) : event.detail; } catch { return; }
      if (!payload || payload.protocol !== 'exp-page-observer-v1' || payload.phase !== phase) return;
      const entries = [...roots.entries()];
      roots.clear();
      callback(
        Object.freeze({ ...payload }),
        Object.freeze(entries.map(([root]) => root)),
        Object.freeze(entries.map(([, detail]) => Object.freeze({ ...detail }))),
      );
    };
    document.addEventListener(rootEvent, onRoot);
    document.addEventListener(endEvent, onEnd);
    return () => {
      document.removeEventListener(rootEvent, onRoot);
      document.removeEventListener(endEvent, onEnd);
      roots.clear();
    };
  }

  function observePresentationState(callback, options = {}) {
    if (typeof callback !== 'function') throw new TypeError('Presentation state callback must be a function');
    const source = options.source ? String(options.source).toLowerCase() : '';
    const channel = options.channel ? String(options.channel).toLowerCase() : '';
    const listener = event => {
      let payload;
      try { payload = typeof event.detail === 'string' ? JSON.parse(event.detail) : event.detail; } catch { return; }
      if (!payload || payload.protocol !== 'exp-presentation-state-v1') return;
      if (source && payload.source !== source) return;
      if (channel && !payload.channels?.includes(channel)) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target) callback(Object.freeze({ ...payload }), target);
    };
    document.addEventListener(PRESENTATION_STATE_EVENT, listener);
    return () => document.removeEventListener(PRESENTATION_STATE_EVENT, listener);
  }

  function pageObserverState() {
    const marker = pageObserverMarker();
    return Object.freeze({
      active: Boolean(marker),
      owner: marker?.dataset.expPageObserver || null,
      protocol: marker?.dataset.expPageObserverProtocol || null,
      epoch: Number(marker?.dataset.expPageObserverEpoch || 0),
      phase: marker?.dataset.expPageObserverPhase || null,
    });
  }

  function registerDiagnosticsProduct(productId, productVersion, host) {
    const result = ExtraPotionsDiagnostics.registerProduct(productId, productVersion, host);
    if (result) result.dataset.expCoreVersion = version;
    const contract = suiteContract(productId);
    registerSuiteProduct({ productId, productVersion });
    if (contract?.presentationPhases?.length) registerPresentationProvider({ productId });
    return result;
  }
  function menuThemeOwner() {
    return [...document.querySelectorAll('[data-exp-product-launcher="1"][data-product-id]')]
      .filter(node => node.isConnected && THEME_PRIORITY[node.dataset.productId])
      .sort((a,b) => THEME_PRIORITY[b.dataset.productId] - THEME_PRIORITY[a.dataset.productId])[0] || null;
  }
  function menuPalette(host) {
    try {
      const value = JSON.parse(host.dataset.expMenuPalette || 'null');
      if (!value || !baseTokenNames.every(key => /^#[0-9a-f]{3,8}$/i.test(value[key]))) return null;
      if (value.skin && (/url\(|var\(|;|\/\*/i.test(value.skin) || value.skin.length > 300)) return null;
      return semanticTheme(value);
    } catch { return null; }
  }
  function publishMenuPalette(host, theme) {
    if (!host || !theme) return;
    const palette = Object.fromEntries([...tokenNames,'id','skin','skinVertical','skinMode'].map(key => [key, theme[key]]));
    const serialized = JSON.stringify(palette);
    if (host.dataset.expMenuPalette === serialized) return;
    host.dataset.expMenuPalette = serialized;
    emit('menu-theme', host.dataset.productId);
  }
  // Every stylesheet Core injects is marked as owned by ExtraPotions so theming tools
  // such as SHIFT leave it alone. A <style> node carries data-exp-owned; a constructed
  // sheet has no node, so it starts with an empty marker rule that any script on the
  // page can read through the CSSOM.
  const OWNED_SHEET_MARKER = '.exp-owned-sheet-marker{}';
  function isOwnedSheet(sheet) {
    try { return sheet?.ownerNode?.dataset?.expOwned === '1' || sheet?.cssRules?.[0]?.selectorText === '.exp-owned-sheet-marker'; } catch { return false; }
  }
  function injectStyle(shadow, css, data = {}) {
    const node = document.createElement('style');
    Object.assign(node.dataset, data);
    node.dataset.expOwned = '1';
    // Keep the editable handle without parsing a second copy of the adopted CSS.
    node.type = 'text/plain';
    node.textContent = css;
    let sheet;
    try {
      sheet = new CSSStyleSheet(); sheet.replaceSync(OWNED_SHEET_MARKER + css);
      shadow.adoptedStyleSheets = [...shadow.adoptedStyleSheets, sheet];
      if (!shadow.adoptedStyleSheets.includes(sheet)) throw new Error('Style adoption ignored');
    } catch {
      if (sheet) { try { shadow.adoptedStyleSheets = [...shadow.adoptedStyleSheets].filter(item => item !== sheet); } catch {} }
      sheet = undefined; node.type = 'text/css';
    }
    shadow.append(node);
    const observe = sheet ? new MutationObserver(() => { try { sheet.replaceSync(OWNED_SHEET_MARKER + node.textContent); } catch {} }) : null;
    observe?.observe(node, { childList: true, characterData: true, subtree: true });
    node.dispose = () => { observe?.disconnect(); if (sheet) shadow.adoptedStyleSheets = [...shadow.adoptedStyleSheets].filter(item => item !== sheet); node.remove(); };
    node.expSheet = sheet;
    return node;
  }
  function resolveShadowRoot(target) {
    if (target instanceof ShadowRoot) return target;
    if (target instanceof Element) {
      if (target.shadowRoot instanceof ShadowRoot) return target.shadowRoot;
      const root = target.getRootNode?.();
      if (root instanceof ShadowRoot) return root;
    }
    return null;
  }
  function applyMatteToggleChrome(target) {
    const shadow = resolveShadowRoot(target);
    if (!shadow) return false;
    if (shadow.querySelector('style[data-exp-matte-toggle-chrome]')) return true;
    injectStyle(shadow, MATTE_TOGGLE_CHROME_CSS, { expMatteToggleChrome: '1' });
    return true;
  }
  function applyTwoColumnSettingsGrid(container) {
    if (!(container instanceof HTMLElement)) return false;
    const root = resolveShadowRoot(container);
    if (root && !root.querySelector('style[data-exp-settings-grid]')) {
      injectStyle(root, '[data-exp-settings-grid="two-column"]{display:grid!important;grid-template-columns:minmax(0,1fr)!important;align-items:stretch!important;column-gap:0!important}[data-exp-settings-grid="two-column"]>*{grid-column:1/-1!important;min-width:0!important}[data-exp-settings-grid="two-column"]>[data-exp-grid-cell="compact"]{grid-column:1/-1!important}', { expSettingsGrid: '1' });
    }
    container.dataset.expSettingsGrid = 'two-column';
    if (root) applyMatteToggleChrome(root);
    return true;
  }
  function applyContentDrivenMenuLayout(shadow) {
    if (!(shadow instanceof ShadowRoot)) return false;
    shadow.host.dataset.expContentDrivenMenu = '1';
    if (!shadow.querySelector('style[data-exp-content-driven-menu]')) {
      injectStyle(shadow, '.fl-tool-body .action.warn{border-color:#cb6868!important;background:#402020!important;color:#ffd7d7!important}.fl-tool-body .action.warn:hover{background:#582828!important;color:#fff!important}:host([data-exp-content-driven-menu="1"]) :is(.panel,#mb-dock,[data-exp-part="dock"]){height:auto!important;min-height:0!important}:host([data-exp-content-driven-menu="1"]) :is(.fl-tool-body,.panel-body,.route-body){height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important}:host([data-exp-content-driven-menu="1"]) :is(.fl-tool-header,.panel-head,.route,.nav-item,.group>summary){height:auto!important;min-height:0!important;white-space:normal!important}:host([data-exp-content-driven-menu="1"]) :is(.fl-tool-title,.label,.setting-label,.setting-value,.copy strong,.copy .label){overflow:visible!important;text-overflow:clip!important;white-space:normal!important;word-break:normal!important;overflow-wrap:anywhere!important}:host([data-exp-content-driven-menu="1"]) :is(.row,.mini-row,.setting-row){height:auto!important;min-height:0!important;align-items:center!important}:host([data-exp-content-driven-menu="1"]) :is(.group,.section,.panel-body:not(.hidden)){grid-template-columns:minmax(0,1fr)!important}:host([data-exp-content-driven-menu="1"]) :is(.group,.section,.panel-body:not(.hidden))>*{grid-column:1/-1!important}.fl-tool-body .row:has(>select){display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr)!important;min-width:0!important}.fl-tool-body .row>select{width:100%!important;min-width:0!important;max-width:100%!important}', { expContentDrivenMenu: '1' });
    }
    applyMatteToggleChrome(shadow);
    return true;
  }
  function layoutGrid() {
    const order = read(GRID_ORDER, []);
    const sorted = [...document.querySelectorAll('[data-exp-product-launcher="1"]')].sort((a,b) => {
      const ai = Array.isArray(order) ? order.indexOf(a.dataset.productId) : -1;
      const bi = Array.isArray(order) ? order.indexOf(b.dataset.productId) : -1;
      if (ai !== bi) return ai < 0 ? 1 : bi < 0 ? -1 : ai - bi;
      const ap = Number(a.dataset.launcherPriority || 0);
      const bp = Number(b.dataset.launcherPriority || 0);
      return bp - ap || a.dataset.productId.localeCompare(b.dataset.productId);
    });
    const assign = (node, slot, span = 1) => {
      const row = Math.floor(slot / 3), column = slot % 3;
      Object.assign(node.dataset, { launcherSlot:String(slot), launcherRow:String(row), launcherColumn:String(column), launcherSpan:String(span) });
      node.style.setProperty('--exp-launcher-x', column * 56 + 'px');
      node.style.setProperty('--exp-launcher-y', row * 56 + 'px');
      node.style.setProperty('--exp-launcher-offset', row * 56 + 'px');
    };
    // Dropper's progress card spans the space to the left of the launchers, so while any launcher
    // reserves rows, every launcher stacks in the right-hand column where nothing can cover it.
    const stacked = sorted.some(node => Number(node.dataset.launcherReservedRows) > 0);
    sorted.forEach((node, index) => assign(node, stacked ? index * 3 : index));
    const ids = sorted.map(node => node.dataset.productId);
    const known = new Set(Object.keys(SUITE_PRODUCTS));
    const completeSuite = ids.filter(id => known.has(id)).length === known.size;
    // Do not turn userscript injection timing into a saved preference. A fresh
    // install stays priority-sorted until either the complete suite is present
    // or the user explicitly reorders the visible launchers.
    if ((Array.isArray(order) && order.length) || completeSuite) write(GRID_ORDER, ids);
  }
  // The single source of launcher coordinates for every product: the saved group position
  // (GRID_DELTA) plus the launcher's grid cell. Products position their launcher from this.
  function launcherPlacement(host) {
    const state = flyoutState();
    if (state.active) {
      // Every product launcher is a tile: hidden while the flyout is closed, in the flyout row while it is open.
      const { hub, panel } = flyoutBand(state);
      const index = Math.max(0, state.order.indexOf(host?.dataset?.productId));
      const left = panel.left + 1 + FLYOUT_PAD + index * (FLYOUT_TILE + FLYOUT_GAP);
      document.documentElement.dataset.expLauncherAnchor = hub.anchor;
      return { top: panel.top + 1 + FLYOUT_PAD, right: viewWidth() - left - FLYOUT_TILE, anchor: hub.anchor, delta: savedDelta(), flyout: true, size: FLYOUT_TILE };
    }
    const single = singleSlot(state);
    if (single) {
      document.documentElement.dataset.expLauncherAnchor = 'top';
      return { top: single.hub.top, right: viewWidth() - single.hub.left - single.hub.size, anchor: 'top', delta: savedDelta(), site: true, size: single.hub.size };
    }
    const { offset, x } = launcherCell(host);
    const delta = Math.max(8-(innerHeight-60), Math.min(4, Number(read(GRID_DELTA,0)) || 0));
    const origin = innerHeight-60+delta, anchor = origin <= (innerHeight-48)/2 ? 'top':'bottom';
    document.documentElement.dataset.expLauncherAnchor = anchor;
    const top = Math.max(8, Math.min(innerHeight-56, anchor === 'top' ? origin+offset : origin-offset));
    return { top: top + siteControlShift(origin, anchor), right: 12+x, anchor, delta };
  }
  function launcherCell(host) {
    const style = getComputedStyle(host);
    return { offset: parseFloat(style.getPropertyValue('--exp-launcher-offset')) || 0, x: parseFloat(style.getPropertyValue('--exp-launcher-x')) || 0 };
  }
  // Site controls the launchers must not cover: controls that stay put while the page scrolls (a fixed chat
  // button) and the controls in the page's header. Content that scrolls under the launchers is not avoided,
  // or the group would jump around while scrolling.
  const SITE_CONTROL = 'a[href],button,input,select,textarea,summary,iframe,[role=button],[role=link],[role=menuitem],[role=tab]';
  const SITE_CONTROL_CLEARANCE = 8;
  let shiftMemo = null, groupDragging = false;
  function pinnedControlAt(x, y) {
    let hit = document.elementsFromPoint(x, y).find(node => node !== document.documentElement && node !== document.body && !registrations.has(node) && !node.closest('[data-exp-product-launcher]'));
    // A site widget drawn in an open shadow root (Allbirds' "Shop Deals") hit-tests as its host; look inside.
    for (let depth = 0, inner; hit?.shadowRoot && depth < 4 && (inner = hit.shadowRoot.elementsFromPoint(x, y).find(node => node.getRootNode() === hit.shadowRoot)); depth++) hit = inner;
    const up = node => node.parentElement || (node.parentNode instanceof ShadowRoot ? node.parentNode.host : null);
    let control = null;
    for (let node = hit; node; node = up(node)) {
      if (registrations.has(node) || node.matches('[data-exp-product-launcher]')) return null;
      if (!control && node.matches(SITE_CONTROL)) control = node;
    }
    if (!control) return null;
    let scrolls = false;
    for (let node = control; node && node !== document.body && node !== document.documentElement; node = up(node)) {
      if (node.matches('[role=banner]') || (node.matches('header') && !node.parentElement?.closest('article,aside,main,nav,section'))) return control;
      const style = getComputedStyle(node);
      const scroller = node !== control && /auto|scroll/.test(style.overflowY) && node.scrollHeight > node.clientHeight;
      // An app that scrolls inside a container covering the whole window: its content is the page.
      if (scroller && node.clientWidth >= innerWidth * .9 && node.clientHeight >= innerHeight * .9) return null;
      scrolls ||= scroller;
      if (style.position === 'fixed') return control;
      // A sticky bar (a header, a toolbar) stays put; a tall sticky column (Reddit's sidebar) is page content.
      if (style.position === 'sticky') return node.getBoundingClientRect().height <= innerHeight * .25 ? control : null;
    }
    // A window that never scrolls (Twitch signed out) keeps everything outside its scrolling containers in place.
    const page = document.scrollingElement || document.documentElement;
    return !scrolls && page.scrollHeight <= page.clientHeight + 1 ? control : null;
  }
  function controlsUnder(box) {
    const found = new Set(), step = 12;
    for (let y = box.top; y <= box.bottom; y += step) for (let x = box.left; x <= box.right; x += step) {
      if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) continue;
      const control = pinnedControlAt(x, y);
      if (control) found.add(control);
    }
    return [...found].map(node => node.getBoundingClientRect()).filter(r => r.width && r.height);
  }
  // One vertical shift for the whole group, so order and spacing stay as the user arranged them.
  // It is never written to the saved position, and it is recomputed when the page changes.
  function siteControlShift(origin, anchor) {
    if (groupDragging) return 0;
    const now = performance.now();
    if (shiftMemo && shiftMemo.origin === origin && now - shiftMemo.at < 200) return shiftMemo.value;
    // The flyout launcher is one 48px tile in the corner; the grid is every launcher cell.
    const cells = ExpLauncherFlyout.flyoutActive(launcherHosts()) ? [{ offset:0, x:0 }] : [...document.querySelectorAll('[data-exp-product-launcher="1"]')].map(launcherCell);
    if (!cells.length) return 0;
    const tops = cells.map(cell => Math.max(8, Math.min(innerHeight-56, anchor === 'top' ? origin+cell.offset : origin-cell.offset)));
    const c = SITE_CONTROL_CLEARANCE;
    const group = { top: Math.min(...tops) - c, bottom: Math.max(...tops) + 48 + c, right: innerWidth - 12 + c, left: innerWidth - 12 - 48 - Math.max(...cells.map(cell => cell.x)) - c };
    const at = s => ({ ...group, top: group.top + s, bottom: group.bottom + s });
    const fits = s => at(s).top >= 8 - c && at(s).bottom <= innerHeight - 8 + c;
    const hits = (s, blockers) => blockers.some(b => b.left < group.right && b.right > group.left && b.top < at(s).bottom && b.bottom > at(s).top);
    let blockers = [], value = 0;
    for (let round = 0; round < 4; round++) {
      const more = controlsUnder(at(value));
      if (!more.length) break;
      blockers = blockers.concat(more);
      const candidates = [0, ...blockers.flatMap(b => [b.top - group.bottom, b.bottom - group.top])].filter(s => fits(s) && !hits(s, blockers));
      if (!candidates.length) { value = 0; break; }
      value = candidates.reduce((best, s) => Math.abs(s) < Math.abs(best) ? s : best);
    }
    shiftMemo = { origin, at: now, value };
    return value;
  }
  // Chat buttons and sticky headers come and go after load, so the shift is rechecked once page changes and
  // scrolling pause, and at most every 2s while they go on (an infinite feed never pauses). Each check hit-tests a
  // grid of points, so rechecking on every change made scrolling a long page slow. Launchers move only when the
  // shift changes.
  const SITE_CHECK_PAUSE = 300, SITE_CHECK_MAX_WAIT = 2000;
  let siteCheckTimer = 0, siteCheckDue = 0;
  function recheckSiteControls() {
    const now = performance.now();
    if (!siteCheckTimer) siteCheckDue = now + SITE_CHECK_MAX_WAIT;
    clearTimeout(siteCheckTimer);
    siteCheckTimer = setTimeout(() => {
      siteCheckTimer = 0;
      const host = document.querySelector('[data-exp-product-launcher="1"]');
      if (!host || groupDragging) return;
      const before = shiftMemo ? shiftMemo.value : 0;
      shiftMemo = null;
      const delta = Math.max(8-(innerHeight-60), Math.min(4, Number(read(GRID_DELTA,0)) || 0));
      const origin = innerHeight-60+delta, value = siteControlShift(origin, origin <= (innerHeight-48)/2 ? 'top':'bottom');
      if (value !== before) emit('launcher-site-controls', 'core');
    }, Math.max(0, Math.min(SITE_CHECK_PAUSE, siteCheckDue - now)));
  }
  // Restores the default launcher order and group position for every product.
  // Shared geometry for menus and notices: the launcher that owns them, the left edge of the launcher grid,
  // and any visible surface a product marks with data-exp-reserved (Dropper's progress card).
  function surfaceGeometry(host, ignoredSurface = null) {
    const launcherOf = node => node?.shadowRoot?.querySelector('[data-exp-part="launcher"],.launcher');
    const own = launcherOf(host)?.getBoundingClientRect();
    if (!own || !own.width) return null;
    const hosts = [...document.querySelectorAll('[data-exp-product-launcher="1"]')];
    const launchers = hosts.map(node => launcherOf(node)?.getBoundingClientRect()).filter(box => box?.width && box?.height);
    // A reserved surface never reaches into the launcher column: a product that marks a whole row holding
    // its launcher gets the same geometry as one that marks only the card beside it.
    const columnLeft = Math.min(...launchers.map(box => box.left));
    const reservedBoxes = hosts.flatMap(node => [...(node.shadowRoot?.querySelectorAll('[data-exp-reserved]') || [])]).filter(node=>node!==ignoredSurface&&!ignoredSurface?.contains(node))
      .map(node => node.getBoundingClientRect()).filter(box => box.width && box.height)
      .map(box => ({ top:box.top, bottom:box.bottom, left:box.left, right:box.left < columnLeft ? Math.min(box.right, columnLeft - 8) : box.right }))
      .filter(box => box.right > box.left);
    const reserved = reservedBoxes.length ? reservedBoxes.reduce((all, box) => ({ top:Math.min(all.top, box.top), bottom:Math.max(all.bottom, box.bottom), left:Math.min(all.left, box.left), right:Math.max(all.right, box.right) })) : null;
    const gridLeft = Math.min(own.left, ...launchers.map(box => box.left), ...reservedBoxes.map(box => box.left));
    const anchorTop = document.documentElement.dataset.expLauncherAnchor === 'top';
    return { own, launchers, reserved, gridLeft, anchorTop };
  }
  // The single menu placement for every product, in order of preference:
  // 1. Directly above a reserved surface such as Dropper's progress card (below it when the launchers are
  //    anchored at the top), sharing its right edge, so the menu covers neither it nor any launcher.
  // 2. Beside the launcher grid, lined up with the launcher that opened it.
  // 3. Above or below the grid when the window is too narrow for either.
  function placeMenu(host, panel, preferredWidth = 312) {
    // An embedded progress card moves with this menu; it is not an external obstacle.
    const geometry = surfaceGeometry(host, panel);
    if (!geometry) return null;
    const { own, reserved, gridLeft, anchorTop } = geometry;
    // A product stylesheet may still size its menu; decide using the width the menu actually renders at.
    panel.style.width = Math.max(0, Math.min(preferredWidth, innerWidth - 24)) + 'px';
    const width = panel.offsetWidth || preferredWidth;
    Object.assign(panel.style, { left:'auto', bottom:'auto' });
    const finish = (side, right, top, h) => {
      top = Math.round(Math.max(8, Math.min(innerHeight - h - 8, top)));
      Object.assign(panel.style, { right:Math.round(right)+'px', top:top+'px' });
      host.dataset.menuSide = side;
      return { top, right:Math.round(right), width, side };
    };
    const slot = slotBand();
    if (slot?.hub?.dock === 'right') {
      // A left-rail entry opens beside the rail, rather than at the window's right edge.
      const viewport = viewWidth(), hub = slot.hub;
      panel.style.width = Math.min(preferredWidth, Math.max(0, viewport - 16)) + 'px';
      const w = panel.offsetWidth || preferredWidth;
      const beside = hub.left + hub.size + 8;
      const fitsBeside = beside + w <= viewport - 8;
      const left = fitsBeside ? beside : Math.max(8, Math.min(viewport - w - 8, hub.left));
      const top = fitsBeside ? (slot.bottom > hub.top + hub.size ? slot.bottom + 8 : hub.top) : slot.bottom + 8;
      const room = innerHeight - top - 8;
      panel.style.maxHeight = Math.max(0, room < 160 ? innerHeight - 16 : room) + 'px';
      host.dataset.openDirection = 'down';
      return finish(room < 160 ? 'rail-viewport' : fitsBeside ? 'rail-beside' : 'rail-below', viewport - left - w, room < 160 ? 8 : top, panel.offsetHeight);
    }
    if (slot) {
      // From the flyout or a site slot: right-aligned 8px from the window edge, beyond the launcher and its open flyout.
      const blocks=reserved&&reserved.left<innerWidth-8&&reserved.right>innerWidth-8-width;
      const edge=blocks?(slot.down?Math.max(slot.bottom,reserved.bottom):Math.min(slot.top,reserved.top)):(slot.down?slot.bottom:slot.top);
      const room = slot.down ? innerHeight - edge - 16 : edge - 16;
      // In very short windows the open menu takes the viewport; Close/Escape restores the card and flyout.
      if(room<160){panel.style.maxHeight=Math.max(0,innerHeight-16)+'px';return finish('viewport',8,8,panel.offsetHeight);}
      panel.style.maxHeight = Math.max(0, room) + 'px';
      const h = panel.offsetHeight;
      host.dataset.openDirection = slot.down ? 'down' : 'up';
      return finish('flyout', 8, slot.down ? edge + 8 : edge - 8 - h, h);
    }
    if (reserved) {
      const blockers=geometry.launchers.filter(box=>box.left<reserved.right&&box.right>reserved.right-width);
      const edge=anchorTop?Math.max(reserved.bottom,...blockers.map(box=>box.bottom)):Math.min(reserved.top,...blockers.map(box=>box.top));
      const room = anchorTop ? innerHeight - edge - 16 : edge - 16;
      if (room >= 200 && reserved.right - 8 >= width) {
        panel.style.maxHeight = room + 'px';
        const h = panel.offsetHeight;
        host.dataset.openDirection = anchorTop ? 'down' : 'up';
        return finish('reserved', innerWidth - reserved.right, anchorTop ? edge + 8 : edge - 8 - h, h);
      }
    }
    if (gridLeft - 16 >= width) {
      panel.style.maxHeight = Math.max(0, innerHeight - 16) + 'px';
      const h = panel.offsetHeight;
      host.dataset.openDirection = 'down';
      return finish('beside', innerWidth - gridLeft + 8, anchorTop ? own.top : own.bottom - h, h);
    }
    // Stacked menus clear the launcher and any reserved surface in its row.
    const band = [...geometry.launchers, ...(reserved ? [reserved] : [])].filter(box => box.left < innerWidth - 12 && box.right > innerWidth - 12 - width)
      .reduce((all, box) => ({ top:Math.min(all.top, box.top), bottom:Math.max(all.bottom, box.bottom) }), { top:own.top, bottom:own.bottom });
    const below = innerHeight - band.bottom - 16, above = band.top - 16;
    const up = anchorTop ? below < 160 && above > below : !(above < 160 && below > above);
    panel.style.maxHeight = Math.max(0, up ? above : below) + 'px';
    const h = panel.offsetHeight;
    host.dataset.openDirection = up ? 'up' : 'down';
    return finish('stacked', 12, up ? band.top - h - 8 : band.bottom + 8, h);
  }
  // The single placement for update and changelog notices. With a menu open, the notice stacks beyond it
  // (above it, or below it when the launchers are anchored at the top) and shares its right edge; when the
  // window is too short for that, it sits beside the menu, on its left, instead of overlapping it. With no
  // menu open it takes the menu's place: above a reserved surface, or beside the launcher grid.
  function placeNotice(host, notice, panel = null) {
    const geometry = surfaceGeometry(host, notice);
    if (!geometry) return null;
    const { own, reserved, gridLeft, anchorTop } = geometry;
    const width = notice.offsetWidth || 260;
    const height = notice.offsetHeight || notice.scrollHeight || 72;
    const menu = panel && !panel.hidden && panel.getClientRects().length ? panel.getBoundingClientRect() : null;
    let right, top;
    if (menu?.width && menu?.height) {
      const beyond = anchorTop ? menu.bottom + 8 : menu.top - height - 8;
      const fits = anchorTop ? beyond + height <= innerHeight - 8 : beyond >= 8;
      if (fits) {
        right = menu.right;
        top = beyond;
      } else if (menu.left - 8 - width >= 8) {
        // A short window leaves no room beyond the menu: sit beside it instead, on the side away from the
        // launchers, lined up with the menu's edge nearest them, so nothing overlaps.
        right = menu.left - 8;
        top = anchorTop ? menu.top : menu.bottom - height;
      } else {
        right = menu.right;
        top = anchorTop ? menu.top - height - 8 : menu.bottom + 8;
      }
    } else if (slotBand()) {
      const band = slotBand();
      if (band.hub?.dock === 'right') {
        const left = Math.max(8, Math.min(viewWidth() - width - 8, band.hub.left + band.hub.size + 8));
        right = left + width; top = band.bottom + 8;
      } else {
        right = viewWidth() - 8;
        top = clearReserved(band.down ? band.bottom + 8 : band.top - height - 8, height, right - width, right, band.down, notice);
      }
    } else if (reserved && reserved.right - 8 >= width) {
      right = reserved.right;
      top = anchorTop ? reserved.bottom + 8 : reserved.top - height - 8;
    } else if (gridLeft - 16 >= width) {
      right = gridLeft - 8;
      top = anchorTop ? own.top : own.bottom - height;
    } else {
      right = own.right;
      top = anchorTop ? own.bottom + 8 : own.top - height - 8;
    }
    const left = Math.round(Math.max(8, Math.min(innerWidth - width - 8, right - width)));
    top = Math.round(Math.max(8, Math.min(innerHeight - height - 8, top)));
    notice.style.setProperty('left', left + 'px', 'important');
    notice.style.setProperty('right', 'auto', 'important');
    notice.style.setProperty('top', top + 'px', 'important');
    notice.style.setProperty('bottom', 'auto', 'important');
    return { left, top };
  }
  // Every launcher host is its own top-layer popover, and the top layer stacks in the order popovers were
  // shown (product load order), not by z-index. Whenever a menu opens, re-show its host so the open menu
  // sits above every other launcher. Any product that announces exp-core:menu-open gets this for free.
  function raiseOpenMenuHost() {
    // With several products a menu belongs to the flyout: opening one any way (a tile, a shortcut, a product
    // call) shows the flyout with that product selected.
    if (flyoutState().active) { if (!setFlyoutOpen(true)) restackFlyout(); return; }
    const id = document.documentElement.getAttribute('data-exp-open-menu');
    const host = [...document.querySelectorAll('[data-exp-product-launcher="1"]')].find(node => node.dataset.productId === id);
    if (!host || typeof host.hidePopover !== 'function') return;
    try { if (host.matches(':popover-open')) host.hidePopover(); host.showPopover(); } catch {}
  }
  // Flyout launcher: with two or more products on a page, one shared launcher (the hub, owned by the lead
  // product's host) opens a row of tiles, and each tile is that product's own launcher. Every Core copy derives
  // the same state from host attributes; the open state lives on <html> as data-exp-flyout-open.
  const FLYOUT_ACCENTS = Object.freeze({ dropper:'#bc94f5', shift:'#80d7d2', prisma:'#91bfff', ward:'#e7bb75', thread:'#ff7636' });
  const FLYOUT_NAMES = Object.freeze({ dropper:'Dropper', shift:'SHIFT', prisma:'PRISMA', ward:'WARD', thread:'THREAD' });
  const FLYOUT_TILE = 40, FLYOUT_GAP = 6, FLYOUT_PAD = 7;
  const launcherHosts = () => [...document.querySelectorAll('[data-exp-product-launcher="1"]')];
  const hostLauncher = host => host?.shadowRoot?.querySelector('[data-exp-part="launcher"],.launcher') || null;
  function flyoutState() {
    const hosts = launcherHosts();
    const active = ExpLauncherFlyout.flyoutActive(hosts);
    return { hosts, active, lead: active ? ExpLauncherFlyout.leadProduct(hosts) : '', order: active ? ExpLauncherFlyout.flyoutOrder(hosts) : [], open: active && document.documentElement.dataset.expFlyoutOpen === '1' };
  }
  // innerWidth counts a classic page scrollbar (or a reserved gutter); fixed-position parts live in the
  // narrower area beside it, so the flyout measures that area with a fixed probe inside a launcher host.
  let viewProbe = null;
  function viewWidth() {
    if (!viewProbe?.isConnected) {
      const root = document.querySelector('[data-exp-product-launcher="1"]')?.shadowRoot;
      if (!root) return innerWidth;
      viewProbe = document.createElement('div'); viewProbe.className = 'exp-view-probe'; viewProbe.setAttribute('aria-hidden', 'true');
      viewProbe.style.cssText = 'position:fixed;inset:0;visibility:hidden;pointer-events:none';
      root.append(viewProbe);
    }
    return viewProbe.getBoundingClientRect().width || innerWidth;
  }
  // Visible surfaces a product marks reserved (Dropper's progress strip under the top bar): a notice in the
  // slot's column moves past them instead of covering them. A hidden strip takes no room.
  function clearReserved(top, height, left, right, down, ignoredSurface = null) {
    const boxes = [...document.querySelectorAll('[data-exp-product-launcher="1"]')]
      .flatMap(host => [...(host.shadowRoot?.querySelectorAll('[data-exp-reserved]') || [])])
      .filter(node => node !== ignoredSurface && getComputedStyle(node).visibility !== 'hidden')
      .map(node => node.getBoundingClientRect()).filter(box => box.width && box.height && box.left < right && box.right > left)
      .sort((a, b) => down ? a.top - b.top : b.bottom - a.bottom);
    for (const box of boxes) if (box.top < top + height && box.bottom > top) top = down ? box.bottom + 8 : box.top - height - 8;
    return top;
  }
  function savedDelta() { return Math.max(8-(innerHeight-60), Math.min(4, Number(read(GRID_DELTA,0)) || 0)); }
  // The shared launcher sits in the site's slot when it has one, otherwise in the bottom-right corner.
  function flyoutHubBox() {
    const slot = siteSlot();
    if (slot) return { left:slot.left, top:slot.top, size:slot.size||FLYOUT_TILE, shape:slot.shape, anchor:'top', site:true, dock:slot.dock };
    const origin = innerHeight-60+savedDelta(), anchor = origin <= (innerHeight-48)/2 ? 'top' : 'bottom';
    return { left:viewWidth()-12-48, top:Math.max(8, Math.min(innerHeight-56, origin)) + siteControlShift(origin, anchor), size:48, anchor, site:false };
  }
  function flyoutPanelBox(hub, count) {
    const width = 2 + FLYOUT_PAD*2 + FLYOUT_TILE*count + FLYOUT_GAP*Math.max(0, count-1), height = 2 + FLYOUT_PAD*2 + FLYOUT_TILE;
    const left = Math.max(8, Math.min(viewWidth() - 8 - width, hub.dock === 'right' ? hub.left + hub.size + 6 : hub.left + hub.size - width));
    const top = hub.dock === 'right' && hub.left + hub.size + 6 + width <= viewWidth() - 8 ? hub.top : hub.anchor === 'top' ? hub.top + hub.size + 6 : hub.top - 6 - height;
    return { left, top, width, height, right:left+width, bottom:top+height };
  }
  function flyoutBand(state = flyoutState()) {
    const hub = flyoutHubBox(), panel = flyoutPanelBox(hub, state.order.length);
    // A closed flyout takes no room: menus and notices line up with the launcher alone.
    const room = state.open ? panel : { top:hub.top, bottom:hub.top + hub.size };
    return { hub, panel, top:Math.min(hub.top, room.top), bottom:Math.max(hub.top+hub.size, room.bottom), down:hub.anchor === 'top' };
  }
  // Sites with a better home for the launcher than the corner, one row per site. A slot that is missing, hidden
  // (theater mode, fullscreen) or too narrow returns null and the launcher uses the corner.
  const visibleBox = node => { const box = node.getBoundingClientRect(); if (box.width < 1 || box.height < 1) return null; const style = getComputedStyle(node); return style.visibility === 'hidden' || style.display === 'none' ? null : box; };
  // Twitch: the top bar between the search box and the first icon of the right-hand group. Twitch keeps a
  // zero-size Search button in that group and collapses search to an icon on narrow windows; both are ignored.
  // Theater mode and fullscreen hide the bar with style changes the page observer does not watch, so the slot's
  // container is watched for size changes instead (hiding it resizes it to zero).
  let slotWatch = null, watchedSlotNode = null;
  function watchSlotNode(node) {
    if (node === watchedSlotNode || typeof ResizeObserver !== 'function') return;
    slotWatch ??= new ResizeObserver(() => { slotMemo = null; scheduleGrid(); });
    if (watchedSlotNode) slotWatch.unobserve(watchedSlotNode);
    watchedSlotNode = node; if (node) slotWatch.observe(node);
  }
  function twitchSlot() {
    const bar = document.querySelector('nav[data-a-target="top-nav-container"] .top-nav__menu');
    if (bar) watchSlotNode(bar);
    if (!bar || bar.children.length < 3) return null;
    const barBox = visibleBox(bar);
    if (!barBox || barBox.height < 40 || barBox.top < -1 || barBox.top > 8) return null;
    const search = [...bar.children[1].querySelectorAll('input[type="search"],input[data-a-target="tw-input"]')].map(visibleBox).filter(Boolean);
    if (!search.length) return null;
    // Theater mode draws the player over the bar, which keeps its size: the bar must be on top where search is.
    const probe = document.elementFromPoint(search[0].left + search[0].width / 2, search[0].top + search[0].height / 2);
    if (!probe || !bar.contains(probe)) return null;
    const searchEnd = Math.max(...[...bar.children[1].querySelectorAll('input,button,a')].map(visibleBox).filter(Boolean).map(box => box.right));
    const icons = [...bar.children[2].querySelectorAll('button,a,input')].map(visibleBox).filter(Boolean);
    if (!icons.length) return null;
    const left = Math.min(...icons.map(box => box.left)) - 16 - FLYOUT_TILE;
    if (left < searchEnd + 8) return null;
    return { left, top: Math.round(barBox.top + (barBox.height - FLYOUT_TILE) / 2) };
  }
  // Reddit's left-rail entry belongs to THREAD. Other products alone keep their existing placement.
  // Native accessible controls/rail geometry supply coordinates; no enhancement-script anchor is used.
  function redditSlot() {
    if (!document.querySelector('[data-exp-product-launcher="1"][data-product-id="thread"]')) return null;
    const rail = document.querySelector('#left-sidebar-container');
    watchSlotNode(rail);
    const box = rail && visibleBox(rail);
    const handles = [...document.querySelectorAll('button[aria-controls="left-sidebar-container"],button[aria-label="Collapse navigation"],button[aria-label="Collapse sidebar"],button[aria-label="Expand navigation"],button[aria-label="Expand sidebar"]')]
      .filter(node => !node.closest('[data-exp-owned]')).map(visibleBox).filter(Boolean);
    const handle = handles.find(r => r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < Math.min(innerWidth / 2, 420)) || null;
    const header = document.querySelector('reddit-header-large,shreddit-header,header[role="banner"]');
    const headerBox = header && visibleBox(header);
    const expanded = box && box.width >= 120 && box.right <= Math.min(viewWidth() - 48, 600) && box.bottom > 80;
    const size = handle ? Math.max(24, Math.min(48, Math.min(handle.width, handle.height))) : 32;
    let left = expanded ? box.right - size / 2 : handle ? handle.left + (handle.width - size) / 2 : 12;
    let top = handle ? handle.bottom + 8 : expanded ? Math.max(8, box.top) + 56 : Math.max(8, headerBox?.bottom || 48) + 12;
    // Sidebar links retain their hit targets. Slide clear of a native control in the proposed slot.
    const controls = [...(rail?.querySelectorAll('button,a[href]') || [])].slice(0,120).map(visibleBox).filter(Boolean);
    for (let attempt=0;attempt<8;attempt++) {
      const blocked = controls.find(r => r.left < left + size && r.right > left && r.top < top + size && r.bottom > top);
      if (!blocked) break;
      top = blocked.bottom + 8;
    }
    left = Math.max(8, Math.min(viewWidth() - size - 8, left));
    top = Math.max(8, Math.min(innerHeight - size - 8, top));
    return {left:Math.round(left),top:Math.round(top),dock:'right',size,shape:'circle'};
  }
  const SITE_SLOTS = Object.freeze([{ host:/(^|\.)twitch\.tv$/, find:twitchSlot },{ host:/^(www|sh)\.reddit\.com$/, find:redditSlot }]);
  let slotMemo = null, frozenSlot;
  function siteSlot() {
    // While the flyout is open the launcher stays put, so the open flyout never jumps under the pointer.
    if (frozenSlot !== undefined && frozenSlot?.dock !== 'right' && document.documentElement.dataset.expFlyoutOpen === '1') return frozenSlot;
    const now = performance.now();
    if (!slotMemo || now - slotMemo.at > 150 || slotMemo.width !== innerWidth || slotMemo.height !== innerHeight) {
      const row = SITE_SLOTS.find(entry => entry.host.test(location.hostname));
      let slot = null;
      try { slot = row ? row.find() : null; } catch {}
      slotMemo = { at:now, width:innerWidth, height:innerHeight, slot };
    }
    frozenSlot = document.documentElement.dataset.expFlyoutOpen === '1' ? slotMemo.slot : undefined;
    return slotMemo.slot;
  }
  // One product in a site slot: its own launcher sits there at tile size and its menu drops below it.
  function singleSlot(state = flyoutState()) {
    if (state.active || state.hosts.length !== 1) return null;
    const slot = siteSlot();
    return slot ? { hub:{ ...slot, size:slot.size||FLYOUT_TILE, anchor:'top', site:true }, panel:null, top:slot.top, bottom:slot.top + (slot.size||FLYOUT_TILE), down:true } : null;
  }
  function slotBand(state = flyoutState()) { return state.active ? flyoutBand(state) : singleSlot(state); }
  function setFlyoutOpen(value) {
    const root = document.documentElement, was = root.dataset.expFlyoutOpen === '1';
    value = Boolean(value) && flyoutState().active;
    if (was === value) return false;
    if (value) { frozenSlot = undefined; siteSlot(); root.dataset.expFlyoutOpen = '1'; frozenSlot = slotMemo?.slot ?? null; } else { delete root.dataset.expFlyoutOpen; frozenSlot = undefined; slotMemo = null; }
    syncFlyout();
    if (value) restackFlyout(); else document.dispatchEvent(new Event('exp-core:flyout-close'));
    emit('flyout', 'core');
    return true;
  }
  // Every host is its own top-layer popover, stacked in show order. Re-show the lead host first so its flyout
  // panel sits under every tile, and an open menu's host last so the menu sits above everything. Focus inside a
  // re-shown host is restored, so keyboard users keep their place.
  function restackFlyout() {
    const state = flyoutState();
    if (!state.active) return;
    const deepActive = () => { let node = document.activeElement; while (node?.shadowRoot?.activeElement) node = node.shadowRoot.activeElement; return node; };
    const focused = deepActive(), menu = document.documentElement.getAttribute('data-exp-open-menu') || '';
    const byId = id => state.hosts.find(host => host.dataset.productId === id);
    const sequence = [state.lead, ...state.order.filter(id => id !== state.lead && id !== menu), ...(menu && menu !== state.lead ? [menu] : [])].map(byId).filter(Boolean);
    // data-exp-restack marks these re-shows as Core's own for every Core copy, so their toggle events do not restack again.
    for (const host of sequence) { if (typeof host.showPopover !== 'function') continue; try { host.dataset.expRestack = '1'; if (host.matches(':popover-open')) host.hidePopover(); host.showPopover(); } catch { delete host.dataset.expRestack; } }
    if (focused?.isConnected && deepActive() !== focused) try { focused.focus({ preventScroll:true }); } catch {}
  }
  function focusFlyout(target) {
    document.documentElement.dataset.expFlyoutFocus = target;
    document.dispatchEvent(new Event('exp-core:flyout-focus'));
  }
  function onFlyoutFocus() {
    const target = document.documentElement.dataset.expFlyoutFocus || '';
    const state = flyoutState();
    if (!target || !state.active) return;
    syncFlyout();
    for (const host of state.hosts) {
      if (!registrations.has(host)) continue;
      const node = target === 'hub' ? (host.dataset.productId === state.lead ? host.shadowRoot?.querySelector('[data-exp-part="flyout-hub"]') : null) : (host.dataset.productId === target ? hostLauncher(host) : null);
      if (node) { delete document.documentElement.dataset.expFlyoutFocus; node.focus({ preventScroll:true }); }
    }
  }
  function onTileKey(event) {
    const host = event.currentTarget?.host, state = flyoutState();
    if (!state.open || !host || event.target !== hostLauncher(host) || event.altKey || event.ctrlKey || event.metaKey) return;
    const index = state.order.indexOf(host.dataset.productId), last = state.order.length - 1;
    const next = { ArrowRight:index+1, ArrowDown:index+1, ArrowLeft:index-1, ArrowUp:index-1, Home:0, End:last }[event.key];
    if (next === undefined) return;
    event.preventDefault(); event.stopPropagation();
    focusFlyout(state.order[Math.max(0, Math.min(last, next))]);
  }
  function onHubKey(event) {
    const state = flyoutState();
    if (!state.open || !['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Home','End'].includes(event.key)) return;
    event.preventDefault();
    focusFlyout(['ArrowLeft','ArrowUp','End'].includes(event.key) ? state.order.at(-1) : state.order[0]);
  }
  // Host protection and page scripts can re-show a launcher while the flyout is open, which lifts it above the
  // others (the lead's would cover every tile with its panel). Any re-show Core did not make restacks once a frame.
  let restackFrame = 0;
  function onHostToggle(event) {
    const host = event.currentTarget;
    if (host.dataset.expRestack) { delete host.dataset.expRestack; return; }
    if (event.newState !== 'open' || restackFrame || !flyoutState().open) return;
    restackFrame = requestAnimationFrame(() => { restackFrame = 0; if (flyoutState().open) restackFlyout(); });
  }
  function onFlyoutEscape(event) {
    if (event.key !== 'Escape' || !flyoutState().open) return;
    setFlyoutOpen(false);
    focusFlyout('hub');
  }
  function onFlyoutOutside(event) {
    if (!event.isTrusted || !flyoutState().open) return;
    const path = event.composedPath();
    if (launcherHosts().some(host => path.includes(host))) return;
    setFlyoutOpen(false);
  }
  function flyoutCss(productId) {
    const accent = FLYOUT_ACCENTS[productId] || '#a1a1aa', launcherPart = ':is([data-exp-part="launcher"],.launcher)';
    return `:host([data-exp-flyout-role]) ${launcherPart}{width:40px!important;height:40px!important;min-width:40px!important;min-height:40px!important;max-width:40px!important;max-height:40px!important;border-radius:10px!important;box-sizing:border-box!important}
:host([data-exp-flyout-role]) ${launcherPart} > :is(img,svg,.icon):not(.launcher-ring):not(.ring){width:26px!important;height:26px!important}
:host([data-exp-flyout-role="hidden"]) ${launcherPart}{visibility:hidden!important;pointer-events:none!important}
:host([data-exp-flyout-selected="1"]) ${launcherPart}{border-color:${accent}!important;box-shadow:inset 0 0 0 1px ${accent}!important}
.exp-flyout-hub{all:initial;position:fixed;z-index:2147483601;box-sizing:border-box;display:grid;place-items:center;width:48px;height:48px;border-radius:12px;background:radial-gradient(circle at 50% 35%,#1d1a24,#0c0b10 70%);border:1px solid color-mix(in srgb,${accent} 50%,#3f3f46);box-shadow:inset 0 1px 0 #ffffff12;cursor:pointer;pointer-events:auto}
.exp-flyout-hub[data-size="40"]{border-radius:10px}
.exp-flyout-hub[data-shape="circle"]{border-radius:50%;background:var(--theme-panel,#181c1f);box-shadow:none}
:host([data-exp-rail-launcher="circle"][data-exp-flyout-role="site"]) ${launcherPart}{width:var(--exp-rail-launcher-size)!important;height:var(--exp-rail-launcher-size)!important;min-width:var(--exp-rail-launcher-size)!important;min-height:var(--exp-rail-launcher-size)!important;max-width:var(--exp-rail-launcher-size)!important;max-height:var(--exp-rail-launcher-size)!important;border-radius:50%!important}
:host([data-exp-rail-launcher="circle"][data-exp-flyout-role="site"]) ${launcherPart}>:is(img,svg,.icon):not(.launcher-ring):not(.ring){width:22px!important;height:22px!important}
.exp-flyout-hub.has-ring{border-color:transparent}
.exp-flyout-ring{position:absolute;left:-6px;top:-6px;pointer-events:none;overflow:visible}
.exp-flyout-ring[hidden]{display:none}
.exp-flyout-hub:focus-visible{outline:2px solid ${accent};outline-offset:3px}
.exp-flyout-icon{display:grid;place-items:center;width:32px;height:32px;pointer-events:none}
.exp-flyout-hub[data-size="40"] .exp-flyout-icon{width:26px;height:26px}
.exp-flyout-hub[data-shape="circle"] .exp-flyout-icon{width:22px;height:22px}
.exp-flyout-icon>*{display:block!important;position:static!important;width:100%!important;height:100%!important;margin:0!important}
.exp-flyout-count{position:absolute;right:-6px;bottom:-6px;box-sizing:border-box;min-width:20px;height:16px;padding:0 4px;border-radius:4px;background:#27272a;border:1px solid #3f3f46;outline:2px solid #0e0e10;color:#fafafa;font:600 10px/14px Inter,"Segoe UI",system-ui,sans-serif;text-align:center;pointer-events:none}
.exp-flyout-mark{position:absolute;top:-5px;right:-5px;width:10px;height:10px;box-sizing:border-box;border-radius:3px;background:var(--exp-flyout-mark,#a1a1aa);outline:2px solid #0e0e10;pointer-events:none}
.exp-flyout-mark[hidden]{display:none}
.exp-flyout-panel{position:fixed;z-index:2147483590;box-sizing:border-box;background:#09090b;border:1px solid #27272a;border-radius:12px;box-shadow:0 12px 32px #0008;pointer-events:auto}
.exp-flyout-panel[hidden]{display:none!important}`;
  }
  // A product with an update marks its own host; the launcher corner shows the first marked product's colour.
  function setLauncherUpdate(productId, available) {
    const host = launcherHosts().find(node => node.dataset.productId === String(productId || ''));
    if (!host) return false;
    if (available) host.dataset.expUpdate = '1'; else delete host.dataset.expUpdate;
    syncFlyout(); emit('launcher-update', productId);
    return true;
  }
  // Progress (Dropper's drop progress) shows as a ring on the shared launcher. fraction is 0..1, or null to clear.
  function setLauncherProgress(productId, fraction) {
    const host = launcherHosts().find(node => node.dataset.productId === String(productId || ''));
    if (!host) return false;
    const value = Number(fraction);
    if (fraction === null || fraction === undefined || !Number.isFinite(value)) delete host.dataset.expProgress;
    else host.dataset.expProgress = String(Math.max(0, Math.min(1, value)));
    syncFlyout(); emit('launcher-progress', productId);
    return true;
  }
  // The ring is concentric with the launcher: its stroke centre is 3px outside the launcher edge (corner radius
  // + 3, stroke 2), which leaves an even 2px gap. It starts at the top centre, fills clockwise, and breaks with
  // 3px clearance around the count and the update marker.
  const SVG_NS = 'http://www.w3.org/2000/svg';
  function ringPath(size, radius) {
    // The ring runs along the launcher outline (1px inside its edge), so it reads as one border, not a second line.
    const a = 6, b = size + 4, r = radius - 1, c = (size + 10) / 2;
    return `M${c} ${a}H${b-r}A${r} ${r} 0 0 1 ${b} ${a+r}V${b-r}A${r} ${r} 0 0 1 ${b-r} ${b}H${a+r}A${r} ${r} 0 0 1 ${a} ${b-r}V${a+r}A${r} ${r} 0 0 1 ${a+r} ${a}Z`;
  }
  function renderRing(hub, size, radius, progress, mark) {
    let svg = hub.querySelector('[data-exp-part="flyout-ring"]');
    if (!progress) { svg?.setAttribute('hidden', ''); hub.classList.remove('has-ring'); return; }
    const s = size + 10;
    if (!svg) { svg = document.createElementNS(SVG_NS, 'svg'); svg.dataset.expPart = 'flyout-ring'; svg.setAttribute('class', 'exp-flyout-ring'); svg.setAttribute('aria-hidden', 'true'); hub.prepend(svg); }
    const key = [size, radius, progress.fraction, progress.color, mark].join('|');
    svg.removeAttribute('hidden'); hub.classList.add('has-ring');
    if (svg.dataset.key === key) return;
    svg.dataset.key = key;
    svg.setAttribute('width', s); svg.setAttribute('height', s); svg.setAttribute('viewBox', `0 0 ${s} ${s}`);
    const id = 'exp-flyout-ring-mask';
    const cuts = [`<rect x="${size-17}" y="${size-9}" width="${s-(size-17)}" height="${s-(size-9)}" fill="black"/>`].concat(mark ? [`<rect x="${size-4}" y="0" width="${s-(size-4)}" height="14" fill="black"/>`] : []);
    const d = ringPath(size, radius), pct = Math.round(progress.fraction * 1000) / 10;
    // The dark edge under the ring matches the count and marker outlines: the accent stays at 3:1 or better on light pages.
    svg.innerHTML = `<mask id="${id}"><rect width="${s}" height="${s}" fill="white"/>${cuts.join('')}</mask><g mask="url(#${id})"><path d="${d}" fill="none" stroke="#0e0e10" stroke-width="4"/><path d="${d}" fill="none" stroke="#3f3f46" stroke-width="2"/><path d="${d}" fill="none" stroke="${progress.color}" stroke-width="2" pathLength="100" stroke-dasharray="${pct} 200"/></g>`;
  }
  function removeHub(host) { host.shadowRoot?.querySelectorAll('[data-exp-part="flyout-hub"],[data-exp-part="flyout-panel"]').forEach(node => { node.expDragCleanup?.(); node.remove(); }); }
  function renderHub(host, state) {
    const shadow = host.shadowRoot;
    if (!shadow) return;
    let hub = shadow.querySelector('[data-exp-part="flyout-hub"]'), panel = shadow.querySelector('[data-exp-part="flyout-panel"]');
    if (!hub || !panel) {
      removeHub(host);
      panel = document.createElement('div'); panel.dataset.expPart = 'flyout-panel'; panel.className = 'exp-flyout-panel'; panel.hidden = true;
      hub = document.createElement('button'); hub.type = 'button'; hub.dataset.expPart = 'flyout-hub'; hub.className = 'exp-flyout-hub'; hub.setAttribute('aria-haspopup', 'true');
      const icon = document.createElement('span'); icon.className = 'exp-flyout-icon';
      const count = document.createElement('span'); count.dataset.expPart = 'flyout-count'; count.className = 'exp-flyout-count'; count.setAttribute('aria-hidden', 'true');
      const mark = document.createElement('span'); mark.dataset.expPart = 'flyout-mark'; mark.className = 'exp-flyout-mark'; mark.hidden = true;
      hub.append(icon, count, mark);
      hub.addEventListener('click', event => { const opening = document.documentElement.dataset.expFlyoutOpen !== '1'; setFlyoutOpen(opening); if (opening && event.detail === 0) focusFlyout(flyoutState().order[0]); });
      hub.addEventListener('keydown', onHubKey);
      // The corner launcher keeps vertical drag and its saved position; a site slot cannot be dragged.
      hub.expDragCleanup = bindLauncherDrag(hub, host.dataset.productId, { reorder:false, canDrag:() => !flyoutHubBox().site, title:'Drag to move the launcher.', layout:syncFlyout });
      shadow.append(panel, hub);
    }
    const icon = hub.querySelector('.exp-flyout-icon');
    if (!icon.firstElementChild) {
      const art = hostLauncher(host)?.querySelector('img,svg:not(.launcher-ring):not(.ring),.icon');
      if (art) { const copy = art.cloneNode(true); copy.removeAttribute('id'); copy.removeAttribute('style'); copy.setAttribute('aria-hidden', 'true'); icon.append(copy); }
    }
    const { hub:box, panel:panelBox } = flyoutBand(state);
    const others = state.order.length - 1;
    hub.querySelector('[data-exp-part="flyout-count"]').textContent = '+' + others;
    const updating = state.order.find(id => state.hosts.some(node => node.dataset.productId === id && node.dataset.expUpdate === '1'));
    const mark = hub.querySelector('[data-exp-part="flyout-mark"]');
    mark.hidden = !updating;
    if (updating) mark.style.setProperty('--exp-flyout-mark', FLYOUT_ACCENTS[updating] || '#a1a1aa');
    const progressHost = state.order.map(id => state.hosts.find(node => node.dataset.productId === id)).find(node => node?.dataset.expProgress !== undefined);
    renderRing(hub, box.size, box.shape === 'circle' ? box.size/2 : box.size === FLYOUT_TILE ? 10 : 12, progressHost ? { fraction:Number(progressHost.dataset.expProgress), color:FLYOUT_ACCENTS[progressHost.dataset.productId] || '#a1a1aa' } : null, Boolean(updating));
    hub.dataset.size = String(box.size);
    hub.dataset.shape = box.shape || 'rectangle';
    hub.setAttribute('aria-expanded', String(state.open));
    // The marker and ring are visual; the name carries the same news for screen readers.
    const notes = [];
    if (updating) notes.push(`${FLYOUT_NAMES[updating] || updating} update available`);
    if (progressHost) notes.push(`${FLYOUT_NAMES[progressHost.dataset.productId] || progressHost.dataset.productId} ${Math.round(Number(progressHost.dataset.expProgress) * 100)}%`);
    hub.setAttribute('aria-label', ['ExtraPotions: ' + state.order.map(id => FLYOUT_NAMES[id] || id).join(', '), ...notes].join('. '));
    Object.assign(hub.style, { left:Math.round(box.left)+'px', top:Math.round(box.top)+'px', width:box.size+'px', height:box.size+'px' });
    panel.hidden = !state.open;
    Object.assign(panel.style, { left:Math.round(panelBox.left)+'px', top:Math.round(panelBox.top)+'px', width:panelBox.width+'px', height:panelBox.height+'px' });
  }
  // Applies the flyout state to the hosts this Core copy registered. Safe to run any number of times.
  function syncFlyout() {
    const state = flyoutState(), root = document.documentElement;
    if (!state.active && root.dataset.expFlyoutOpen) delete root.dataset.expFlyoutOpen;
    const menu = root.getAttribute('data-exp-open-menu') || '';
    for (const host of state.hosts) {
      if (!registrations.has(host)) continue;
      const id = host.dataset.productId;
      const slot=siteSlot();
      if(slot?.shape==='circle'){host.dataset.expRailLauncher='circle';host.style.setProperty('--exp-rail-launcher-size',slot.size+'px');}
      else{delete host.dataset.expRailLauncher;host.style.removeProperty('--exp-rail-launcher-size');}
      if (!state.active) {
        if (singleSlot(state)) host.dataset.expFlyoutRole = 'site'; else delete host.dataset.expFlyoutRole;
        delete host.dataset.expFlyoutSelected; removeHub(host); continue;
      }
      const role = state.open ? 'tile' : 'hidden';
      if (host.dataset.expFlyoutRole !== role) host.dataset.expFlyoutRole = role;
      if (state.open && menu === id) host.dataset.expFlyoutSelected = '1'; else delete host.dataset.expFlyoutSelected;
      if (id === state.lead) renderHub(host, state); else removeHub(host);
    }
  }
  function resetLauncherGrid(productId) { write(GRID_ORDER,[]); write(GRID_DELTA,0); layoutGrid(); emit('launcher-grid-moved', productId); }
  // Shared launcher drag for every product: drag moves the launcher group along the right edge;
  // Shift+drag and Alt+Arrow keys reorder. Listens on window in the capture phase so host pages
  // that stop pointer events (Twitch's player) cannot stall a drag. Returns a cleanup function.
  // reorder:false (the flyout launcher) moves the group only; canDrag() can refuse a drag (a site slot).
  function bindLauncherDrag(launcher, id, { layout = () => {}, reorder = true, canDrag = () => true, title = '' } = {}) {
    const removers = [];
    const on = (node,type,fn,opts) => { node.addEventListener(type,fn,opts); removers.push(() => node.removeEventListener(type,fn,opts)); };
    let startX=0,startY=0,startDelta=0,pointer=null,dragged=false,mode='',axis='',order=[];
    launcher.title = launcher.title || title || 'Drag to move the launchers. Shift+drag or Alt+Arrow keys reorder.';
    on(launcher,'pointerdown',e=>{if(e.button!==0||(reorder&&flyoutState().active)||(!reorder&&e.shiftKey)||!canDrag())return;pointer=e.pointerId;startX=e.clientX;startY=e.clientY;startDelta=Number(read(GRID_DELTA,0))||0;mode=e.shiftKey?'order':'group';order=interactionGridOrder();if(!order.includes(id))order.push(id);dragged=false;axis='';e.preventDefault();try{launcher.setPointerCapture(e.pointerId);}catch{}});
    // Listen on window in the capture phase so host pages that stop pointer events (Twitch's player) cannot stall a drag.
    on(launcher,'dragstart',e=>e.preventDefault());
    on(window,'pointermove',e=>{if(e.pointerId!==pointer)return;const dx=e.clientX-startX,dy=e.clientY-startY;if(!axis&&Math.max(Math.abs(dx),Math.abs(dy))>4)axis=mode;if(!axis)return;dragged=true;groupDragging=true;e.preventDefault();launcher.classList.add('is-dragging');if(axis==='group')write(GRID_DELTA,Math.round(Math.max(8-(innerHeight-60),Math.min(4,startDelta+dy))));else{const from=order.indexOf(id),offset=Math.abs(dx)>Math.abs(dy)?Math.round(-dx/56):Math.round(dy/56)*3,to=Math.max(0,Math.min(order.length-1,from+offset)),next=[...order];next.splice(from,1);next.splice(to,0,id);write(GRID_ORDER,next);}layoutGrid();emit('launcher-grid-moved',id);layout();},{passive:false,capture:true});
    const end=e=>{if(e.pointerId===pointer){pointer=null;if(groupDragging){groupDragging=false;shiftMemo=null;layoutGrid();emit('launcher-grid-moved',id);layout();}launcher.classList.remove('is-dragging');try{launcher.releasePointerCapture(e.pointerId);}catch{}}};
    on(window,'pointerup',end,true);on(window,'pointercancel',end,true);on(launcher,'lostpointercapture',end);
    on(launcher,'click',e=>{if(dragged){e.preventDefault();e.stopImmediatePropagation();dragged=false;}},true);
    on(launcher,'keydown',e=>{if(!reorder||flyoutState().active||!e.altKey||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();let next=interactionGridOrder();if(!next.includes(id))next.push(id);const from=next.indexOf(id),offset={ArrowLeft:1,ArrowRight:-1,ArrowUp:-3,ArrowDown:3}[e.key],to=Math.max(0,Math.min(next.length-1,from+offset));next=[...next];next.splice(from,1);next.splice(to,0,id);write(GRID_ORDER,next);layoutGrid();emit('launcher-grid-moved',id);layout();launcher.focus();});
    return () => { while (removers.length) removers.pop()(); };
  }
  function interactionGridOrder() {
    let order = read(GRID_ORDER, []);
    if (!Array.isArray(order)) order = [];
    const visible = [...document.querySelectorAll('[data-exp-product-launcher="1"]')]
      .sort((a,b) => Number(a.dataset.launcherSlot || 0) - Number(b.dataset.launcherSlot || 0))
      .map(node => node.dataset.productId);
    if (!order.length) return visible;
    const seen = new Set(order);
    return [...order, ...visible.filter(id => !seen.has(id))];
  }
  function storageRead(key, fallback = null) {
    try { if (typeof GM_getValue === 'function') return GM_getValue(key, fallback); } catch {}
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  }
  function storageWrite(key, value) {
    try { if (typeof GM_setValue === 'function') { GM_setValue(key, value); return; } } catch {}
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }
  function claimNotice(productId, changeId) {
    const key = `exp:v3:${String(productId || 'product')}:notice:${String(changeId || 'change')}`;
    if (storageRead(key, false) === true) return false;
    storageWrite(key, true);
    return true;
  }
  function consumeVersionChange(productId, currentVersion, legacyKey = '') {
    const key = `exp:v3:${String(productId || 'product')}:installed-version`;
    let previous = String(storageRead(key, '') || '');
    if (!previous && legacyKey) { try { previous = String(localStorage.getItem(legacyKey) || ''); } catch {} }
    storageWrite(key, String(currentVersion || ''));
    return previous && previous !== currentVersion && claimNotice(productId, `updated:${currentVersion}`) ? previous : '';
  }
  // True only when at least one released version lies in (previous, current], current among them,
  // and every one of them is quiet. Anything unparseable is not quiet.
  function isQuietUpgrade(previous, current, releasedVersions, quietVersions) {
    const pattern = /^\d+\.\d+\.\d+$/;
    previous = String(previous || '');
    current = String(current || '');
    if (!pattern.test(previous) || !pattern.test(current) || CoreFoundation.compareVersions(current, previous) <= 0) return false;
    const quiet = new Set(Array.from(quietVersions || [], String));
    const skipped = Array.from(releasedVersions || [], String).filter(version => pattern.test(version)
      && CoreFoundation.compareVersions(version, previous) > 0 && CoreFoundation.compareVersions(version, current) <= 0);
    return skipped.includes(current) && skipped.every(version => quiet.has(version));
  }
  function visibleFloatingNotices() {
    return [...document.querySelectorAll('[data-exp-product-launcher="1"][data-product-id]')]
      .flatMap(host => [...(host.shadowRoot?.querySelectorAll('[data-exp-floating-notice="1"]') || [])].map(notice => ({ host, notice })))
      .filter(({ notice }) => !notice.hidden && notice.getClientRects().length)
      .sort((a,b) => Number(a.host.dataset.launcherSlot || 0) - Number(b.host.dataset.launcherSlot || 0) || a.host.dataset.productId.localeCompare(b.host.dataset.productId));
  }
  function layoutFloatingNotices() {
    const launchers = [...document.querySelectorAll('[data-exp-product-launcher="1"][data-product-id]')]
      .map(host => host.shadowRoot?.querySelector('[data-exp-part="launcher"]'))
      .filter(Boolean).map(node => node.getBoundingClientRect()).filter(box => box.width && box.height);
    const notices = visibleFloatingNotices();
    if (!launchers.length || !notices.length) return;
    let anchor = document.documentElement.dataset.expLauncherAnchor === 'top' ? 'top' : 'bottom';
    let gridTop = Math.min(...launchers.map(box => box.top));
    let gridBottom = Math.max(...launchers.map(box => box.bottom));
    let gridRight = Math.max(...launchers.map(box => box.right));
    const band = slotBand();
    if (band) { anchor = band.down ? 'top' : 'bottom'; gridTop = band.top; gridBottom = band.bottom; gridRight = viewWidth() - 8; }
    let cursor = anchor === 'top' ? gridBottom + 8 : gridTop - 8;
    for (const { notice } of notices) {
      const width = Math.min(notice.offsetWidth || notice.scrollWidth || 260, Math.max(0, innerWidth - 24));
      const height = notice.offsetHeight || notice.scrollHeight || 72;
      const left = Math.max(8, Math.min(innerWidth - width - 8, gridRight - width));
      let top = anchor === 'top' ? cursor : cursor - height;
      if (band) top = clearReserved(top, height, left, left + width, anchor === 'top', notice);
      notice.style.setProperty('width', `${width}px`, 'important');
      notice.style.setProperty('left', `${left}px`, 'important');
      notice.style.setProperty('right', 'auto', 'important');
      notice.style.setProperty('top', `${Math.max(8, Math.min(innerHeight - height - 8, top))}px`, 'important');
      notice.style.setProperty('bottom', 'auto', 'important');
      cursor = anchor === 'top' ? top + height + 8 : top - 8;
    }
  }
  function registerFloatingNotice(host, notice) {
    if (!(host instanceof Element) || !(notice instanceof Element)) return () => {};
    if (floatingNoticeRegistrations.has(notice)) return floatingNoticeRegistrations.get(notice);
    notice.dataset.expFloatingNotice = '1';
    const refresh = () => requestAnimationFrame(layoutFloatingNotices);
    const mutation = new MutationObserver(refresh); mutation.observe(notice, { attributes:true, attributeFilter:['hidden','class'] });
    const resize = new ResizeObserver(refresh); resize.observe(notice);
    addEventListener('resize', refresh, { passive:true }); document.addEventListener('exp-core:coordination', refresh);
    const dispose = () => { mutation.disconnect(); resize.disconnect(); removeEventListener('resize', refresh); document.removeEventListener('exp-core:coordination', refresh); floatingNoticeRegistrations.delete(notice); };
    floatingNoticeRegistrations.set(notice, dispose); refresh(); return dispose;
  }
  function registerLauncher(host, options = {}) {
    if (registrations.has(host)) return registrations.get(host);
    const id = options.productId || options.id || host.dataset.productId;
    const contract = suiteContract(id);
    const launcherPriority = contract ? contract.launcherPriority : options.priority ?? 0;
    Object.assign(host.dataset, { expProductLauncher:'1', productId:id, launcherPriority:String(launcherPriority) });
    // Advertises the flyout protocol; every Core copy reads the lead and the mode from these attributes only.
    host.dataset.expFlyout = ExpLauncherFlyout.PROTOCOL;
    if (ExpLauncherFlyout.isSiteProduct(id)) host.dataset.expSiteProduct = '1'; else delete host.dataset.expSiteProduct;
    applyMatteToggleChrome(host);
    // The launcher is non-modal: site-wide dialog backdrop styles must never
    // paint over the page when the reference opens its manual popover.
    const backdropStyle = host.shadowRoot ? injectStyle(host.shadowRoot,
      ':host::backdrop{all:initial!important;display:none!important;background:transparent!important;pointer-events:none!important}',
      { expLauncherBackdrop: '1' }) : null;
    const stopProtect = CoreFoundation.protectLauncherHost(host);
    const flyoutStyle = host.shadowRoot ? injectStyle(host.shadowRoot, flyoutCss(id), { expFlyoutStyle: '1' }) : null;
    host.shadowRoot?.addEventListener('keydown', onTileKey);
    host.addEventListener('toggle', onHostToggle);
    let frame = 0;
    const refresh = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; layoutGrid(); syncFlyout(); controllers.get(host)?.layout(); }); };
    document.addEventListener('exp-core:coordination', refresh);
    addEventListener('resize', refresh);
    layoutGrid(); syncFlyout(); emit('launcher-added', id);
    const dispose = () => { stopProtect(); backdropStyle?.dispose(); flyoutStyle?.dispose(); host.shadowRoot?.removeEventListener('keydown', onTileKey); host.removeEventListener('toggle', onHostToggle); removeHub(host); delete host.dataset.expFlyoutRole; delete host.dataset.expFlyoutSelected; cancelAnimationFrame(frame); document.removeEventListener('exp-core:coordination', refresh); removeEventListener('resize', refresh); delete host.dataset.expProductLauncher; delete host.dataset.expFlyout; delete host.dataset.expSiteProduct; registrations.delete(host); layoutGrid(); emit('launcher-removed', id); };
    registrations.set(host, dispose);
    return dispose;
  }
  function themes(productTheme) {
    return Object.freeze([productTheme || CoreFoundation.UI_THEMES.at(-1)].map(t => { const theme = semanticTheme(t); return Object.freeze({ ...theme, vars: Object.fromEntries(tokenNames.map(k => [k, theme[k]])) }); }));
  }
  function createThemeSwatches({ container, themes: choices, value, label = 'Menu Theme', onChange = () => {} }) {
    const root = resolveShadowRoot(container);
    if (root && !root.querySelector('style[data-exp-theme-swatches]')) {
      injectStyle(root, '.exp-theme-swatches{display:flex;align-items:center;gap:6px;min-height:28px;flex-wrap:wrap}.exp-theme-swatch{appearance:none;box-sizing:border-box!important;flex:0 0 22px!important;width:22px!important;height:22px!important;min-width:22px!important;min-height:22px!important;max-width:22px!important;max-height:22px!important;padding:0!important;border:2px solid var(--theme-line,var(--line,#41434d));border-radius:5px!important;cursor:pointer}.exp-theme-swatch:hover,.exp-theme-swatch:focus-visible{outline:2px solid var(--theme-accent,var(--accent,#8b5cf6));outline-offset:2px}.exp-theme-swatch.is-on{border-color:var(--theme-text,var(--text,#fff));box-shadow:0 0 0 2px var(--theme-accent,var(--accent,#8b5cf6))}', { expThemeSwatches: '1' });
      applyMatteToggleChrome(root);
    }
    container.classList.add('exp-theme-swatches'); container.setAttribute('role', 'radiogroup'); container.setAttribute('aria-label', label);
    const buttons = choices.map(theme => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'exp-theme-swatch';
      for (const property of ['width','height','min-width','min-height','max-width','max-height']) button.style.setProperty(property, '22px', 'important');
      button.style.setProperty('border-radius', '5px', 'important');
      button.style.setProperty('padding', '0', 'important');
      button.style.setProperty('box-sizing', 'border-box', 'important');
      button.style.setProperty('flex', '0 0 22px', 'important');
      button.setAttribute('role', 'radio'); button.setAttribute('aria-label', theme.name); button.title = theme.name;
      button.dataset.theme = button.dataset.swatch = theme.id; button.style.background = theme.swatch;
      button.addEventListener('click', () => { paint(theme.id); onChange(theme.id); }); container.append(button); return button;
    });
    function paint(next) { value = next; buttons.forEach((b,i) => { const on = choices[i].id === value; b.classList.toggle('is-on', on); b.setAttribute('aria-checked', String(on)); b.setAttribute('aria-pressed', String(on)); b.tabIndex = on || !choices.some(t => t.id === value) && i === 0 ? 0 : -1; }); }
    const keyboard = event => { const current = buttons.indexOf(event.target); if (current < 0 || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) return; event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (current + (['ArrowRight','ArrowDown'].includes(event.key) ? 1 : -1) + buttons.length) % buttons.length; buttons[next].click(); buttons[next].focus(); };
    container.addEventListener('keydown', keyboard); paint(value);
    return { setValue: paint, destroy() { container.removeEventListener('keydown', keyboard); buttons.forEach(b => b.remove()); } };
  }
  function focusMenuSurface(panel) { if (!(panel instanceof HTMLElement)) return false; panel.tabIndex = -1; panel.style.outline = 'none'; panel.focus({ preventScroll: true }); return true; }
  const FLOATING_NOTICE_CSS = '.exp-floating-update{position:fixed;z-index:2147483647;box-sizing:border-box;width:min(312px,calc(100vw - 24px));max-width:calc(100vw - 24px);margin:0;padding:10px 32px 10px 10px;border:1px solid var(--exp-notice-border,#6f42b4);border-radius:10px;background:linear-gradient(180deg,var(--exp-notice-top,#251a35),var(--exp-notice-bottom,#18181d) 70%);color:var(--exp-notice-text,#f4f4f6);box-shadow:0 10px 28px #0008;font:500 var(--exp-font-size-small,11px)/1.45 system-ui,sans-serif}.exp-floating-update[hidden]{display:none!important}.exp-floating-update-dismiss{position:absolute;top:7px;right:7px;width:23px;height:23px;padding:0;border:1px solid transparent;border-radius:7px;background:transparent;color:inherit;cursor:pointer;font:15px/1 Arial,sans-serif}.exp-floating-update-dismiss:hover,.exp-floating-update-dismiss:focus-visible{border-color:var(--exp-notice-border,#6f42b4);outline:none}';
  function ensureFloatingNoticeStyle(shadow) {
    if (!shadow.querySelector('style[data-exp-floating-notice]')) {
      injectStyle(shadow, FLOATING_NOTICE_CSS, { expFloatingNotice: '1' });
    }
  }
  function syncNoticeTheme(notice, themeSource) {
    const theme = getComputedStyle(themeSource);
    const first = (names, fallback) => names.map(name => theme.getPropertyValue(name).trim()).find(Boolean) || fallback;
    notice.style.setProperty('--exp-notice-border', first(['--exp-notice-border','--theme-accent','--accent','--accent2','--teal','--mb-brand'], theme.borderTopColor || '#6f42b4'));
    notice.style.setProperty('--exp-notice-top', first(['--exp-notice-top','--theme-panel','--surface','--panel','--raised','--mb-surface','--bg','--mb-bg'], theme.backgroundColor || '#251a35'));
    notice.style.setProperty('--exp-notice-bottom', first(['--exp-notice-bottom','--theme-bg','--bg','--mb-bg','--surface','--mb-surface'], theme.backgroundColor || '#18181d'));
    notice.style.setProperty('--exp-notice-text', first(['--exp-notice-text','--theme-text','--text','--mb-ink'], theme.color || '#f4f4f6'));
  }
  function createFloatingNotice(options = {}) {
    const { shadow, panel, notice, versionButton = null } = options;
    const host = options.host || shadow?.host;
    if (!(shadow instanceof ShadowRoot) || !(panel instanceof Element) || !(notice instanceof Element)) return Object.freeze({ show() {}, hide() {}, toggle() {}, layout() {}, setMenuOpen() {}, destroy() {} });
    const durationMs = Math.max(0, Number(options.durationMs ?? 30000));
    const manageVersion = options.manageVersion !== false;
    let timer = 0, menuOpen = false, destroyed = false;
    ensureFloatingNoticeStyle(shadow);
    applyMatteToggleChrome(shadow);
    notice.classList.add('update-notice','exp-floating-update'); notice.setAttribute('role','status');
    let dismiss = notice.querySelector(':scope > .exp-floating-update-dismiss');
    if (!dismiss) { dismiss=document.createElement('button'); dismiss.type='button'; dismiss.className='exp-floating-update-dismiss'; dismiss.setAttribute('aria-label','Dismiss changelog'); dismiss.textContent='×'; notice.prepend(dismiss); }
    shadow.append(notice); const unregisterNotice = registerFloatingNotice(host, notice);
    const themeSource = options.themeSource instanceof Element ? options.themeSource : panel;
    const syncTheme = () => syncNoticeTheme(notice, themeSource);
    const clearTimer=()=>{clearTimeout(timer);timer=0;};
    function layout(){if(destroyed||notice.hidden)return;syncTheme();layoutFloatingNotices();}
    function hide(){clearTimer();notice.hidden=true;versionButton?.setAttribute('aria-expanded','false');layoutFloatingNotices();}
    function show(){notice.hidden=false;versionButton?.setAttribute('aria-expanded','true');clearTimer();if(durationMs)timer=setTimeout(hide,durationMs);requestAnimationFrame(layoutFloatingNotices);}
    function toggle(){if(notice.hidden)show();else hide();}
    function versionClick(){if(manageVersion)toggle();else if(!notice.hidden)show();}
    function setMenuOpen(value){menuOpen=Boolean(value);if(!menuOpen)hide();else requestAnimationFrame(layout);}
    const coordination=()=>requestAnimationFrame(layout);
    dismiss.addEventListener('click',hide);versionButton?.addEventListener('click',versionClick);addEventListener('resize',layout,{passive:true});document.addEventListener('exp-core:coordination',coordination);
    return Object.freeze({show,hide,toggle,layout,setMenuOpen,destroy(){destroyed=true;clearTimer();unregisterNotice();dismiss.removeEventListener('click',hide);versionButton?.removeEventListener('click',versionClick);removeEventListener('resize',layout);document.removeEventListener('exp-core:coordination',coordination);}});
  }
  // Core-owned update and changelog cards use the canonical menu-width notice
  // geometry. The legacy floating-notice coordinator remains exported
  // for compatibility, but it no longer owns these product notices.
  // Cards that appear on their own (menu closed) show one at a time: the owner is recorded on <html> so every
  // Core copy shares the queue, and a waiting card shows when the owner hides. The turn is taken even while a
  // product is alone, so products that load later wait for a card already showing. Products that draw their
  // own card (Dropper) take and give back a turn with the same calls.
  function takeNoticeTurn(token) {
    const root = document.documentElement, owner = root.dataset.expNoticeOwner || '';
    if (owner && owner !== token) return false;
    root.dataset.expNoticeOwner = String(token);
    return true;
  }
  function releaseNoticeTurn(token) {
    if (document.documentElement.dataset.expNoticeOwner !== String(token)) return;
    delete document.documentElement.dataset.expNoticeOwner;
    document.dispatchEvent(new Event('exp-core:notice-released'));
  }
  function createMenuNotice(options = {}) {
    const { shadow, panel, notice, versionButton = null } = options;
    const host = options.host || shadow?.host;
    if (!(shadow instanceof ShadowRoot) || !(panel instanceof Element) || !(notice instanceof Element)) {
      return Object.freeze({ show() {}, hide() {}, toggle() {}, layout() {}, setMenuOpen() {}, destroy() {} });
    }
    const durationMs = Math.max(0, Number(options.durationMs ?? 30000));
    const manageVersion = options.manageVersion !== false;
    let timer = 0, menuOpen = false, destroyed = false, frame = 0, waiting = false;
    const token = String(host?.dataset?.productId || 'product') + ':' + (++noticeSerial);

    ensureFloatingNoticeStyle(shadow);
    applyMatteToggleChrome(shadow);
    notice.classList.add('update-notice', 'exp-floating-update');
    notice.dataset.placement = 'menu';
    delete notice.dataset.expFloatingNotice;
    notice.setAttribute('role', 'status');

    let dismiss = notice.querySelector(':scope > .exp-floating-update-dismiss,.update-dismiss');
    if (!dismiss) {
      dismiss = document.createElement('button');
      dismiss.type = 'button';
      dismiss.className = 'exp-floating-update-dismiss';
      dismiss.setAttribute('aria-label', 'Dismiss changelog');
      dismiss.textContent = '×';
      notice.prepend(dismiss);
    }

    const themeSource = options.themeSource instanceof Element ? options.themeSource : panel;
    const returnFocus=options.returnFocus||versionButton;
    const syncTheme = () => syncNoticeTheme(notice, themeSource);
    function clearTimer() { clearTimeout(timer); timer = 0; }
    function queueLayout() {
      if (destroyed || frame) return;
      frame = requestAnimationFrame(() => { frame = 0; layout(); });
    }
    function layout() {
      if (destroyed || notice.hidden) return;
      syncTheme();
      const width = Math.min(menuWidth(), Math.max(0, innerWidth - 24));
      notice.style.setProperty('width', width + 'px', 'important');

      placeNotice(host || shadow.host, notice, menuOpen ? panel : null);
    }
    function release() { releaseNoticeTurn(token); }
    function retry() { if (waiting && !destroyed) show(); }
    function hide() {
      clearTimer();
      waiting = false;
      const focused=notice.contains(shadow.activeElement);notice.hidden = true;
      returnFocus?.setAttribute('aria-expanded', 'false');
      if(focused)returnFocus?.focus({preventScroll:true});
      release();
    }
    function show() {
      if (!menuOpen && !takeNoticeTurn(token)) { waiting = true; return; }
      waiting = false;
      notice.hidden = false;
      returnFocus?.setAttribute('aria-expanded', 'true');
      clearTimer();
      if (durationMs) timer = setTimeout(hide, durationMs);
      queueLayout();
    }
    function toggle() { if (notice.hidden) show(); else hide(); }
    function versionClick() { if (manageVersion) toggle(); else if (!notice.hidden) show(); }
    function setMenuOpen(value) { menuOpen = Boolean(value); queueLayout(); }

    const resize = new ResizeObserver(queueLayout);
    resize.observe(panel);
    resize.observe(notice);
    const mutation = new MutationObserver(queueLayout);
    mutation.observe(notice, { attributes:true, attributeFilter:['hidden'], childList:true, subtree:true });
    const coordination = () => queueLayout();
    const escape=event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();hide();}};notice.addEventListener('keydown',escape);
    dismiss.addEventListener('click', hide);
    versionButton?.addEventListener('click', versionClick);
    addEventListener('resize', queueLayout, { passive:true });
    document.addEventListener('exp-core:coordination', coordination);
    document.addEventListener('exp-core:notice-released', retry);

    return Object.freeze({
      show, hide, toggle, layout, setMenuOpen,
      destroy() {
        destroyed = true;
        cancelAnimationFrame(frame);
        clearTimer();
        resize.disconnect();
        mutation.disconnect();
        notice.removeEventListener('keydown',escape);dismiss.removeEventListener('click', hide);
        versionButton?.removeEventListener('click', versionClick);
        removeEventListener('resize', queueLayout);
        document.removeEventListener('exp-core:coordination', coordination);
        document.removeEventListener('exp-core:notice-released', retry);
        release();
      },
    });
  }

  function applyTheme(host, value, choices) {
    const controller = controllers.get(host); if (!controller) return;
    controller.setTheme(value, choices);
  }
  function normalizeControls(panel) {
    panel.querySelectorAll('button[role="switch"],button.toggle').forEach(button => {
      button.classList.add('toggleSwitch'); button.setAttribute('role', 'switch');
      if (!button.hasAttribute('aria-checked')) button.setAttribute('aria-checked', 'false');
      const row = button.closest('.row,.mini-row,.fl-switch,.setting-row');
      if (row) { row.classList.add('fl-switch'); const label = row.querySelector('.label,.copy>strong,.row-copy>strong,.setting-label,span'); if (label) label.classList.add('fl-switch-text'); if (!button.hasAttribute('aria-label') && !button.hasAttribute('aria-labelledby')) button.setAttribute('aria-label', label?.textContent || row.textContent.trim()); }
    });
    panel.querySelectorAll('.row,.mini-row,.setting-row').forEach(row => { if (!row.classList.contains('fl-switch')) row.classList.add('mini-row'); });
    panel.querySelectorAll('select').forEach(node => node.classList.add('select-lite'));
    panel.querySelectorAll('button.action,button.secondary,button.primary,button.compact,.diagnostics-controls button,.button-grid button,.menu-footer button').forEach(node => { if (!node.dataset.expPart) node.classList.add('life-btn'); });
    panel.querySelectorAll('.route-body').forEach(body => body.classList.toggle('fl-tool-hidden', body.hidden));
    const active = panel.querySelector('.fl-tool-header[aria-expanded="true"]');
    panel.querySelectorAll('.fl-tool-header').forEach(header => { if (active) header.classList.toggle('last-opened', header === active); const chevron = header.querySelector('.fl-tool-chevron'); if (chevron) { const text = header.getAttribute('aria-expanded') === 'true' ? '▾' : '▸'; if (chevron.textContent !== text) chevron.textContent = text; } });
  }
  function normalizeHeader(panel) {
    const head = panel.querySelector('.menu-head,header,.head'); if (!head) return;
    head.classList.add('menu-head');
    const brand = head.querySelector('.header-brand,.identity,.brand'); if (!brand) return;
    brand.classList.add('header-brand');
    let icon = brand.firstElementChild;
    if (icon?.tagName === 'IMG' || icon?.tagName.toLowerCase() === 'svg') { const frame = document.createElement('div'); frame.className = 'header-icon'; icon.before(frame); frame.append(icon); icon.classList.add('menu-icon'); icon = frame; }
    if (icon) { icon.classList.add('header-icon'); icon.querySelector('img,svg')?.classList.add('menu-icon'); }
    const copy = brand.children[1]; if (copy) copy.classList.add('header-copy');
    const row = copy?.firstElementChild; row?.classList.add('header-title-row');
    const title = row?.querySelector('h1,h2,h3,strong,.menu-title'); if (title) title.dataset.expPart = 'title';
    const ver = head.querySelector('.version,.header-version,[id$="header-version"]'); if (ver) ver.dataset.expPart = 'version';
    const subtitle = copy?.querySelector('small,.subtitle,.menu-subtitle,[id$="subtitle"]'); if (subtitle) subtitle.dataset.expPart = 'subtitle';
    const close = head.querySelector('.close,.menu-close,[id$="rail-close"]'); if (close) close.dataset.expPart = 'close';
    panel.querySelector('.divider')?.classList.add('header-divider');
    for (const section of panel.querySelectorAll('nav>.tool-panel,nav>section')) {
      section.classList.add('fl-tool-panel'); const control = section.querySelector(':scope>button'); const body = section.querySelector(':scope>div'); if (!control || !body) continue;
      control.classList.add('fl-tool-header'); body.classList.add('fl-tool-body');
      if (!control.querySelector('.fl-tool-title')) { let title = control.querySelector('span:not(.chevron)'); if (!title) { title = document.createElement('span'); title.textContent = control.textContent; control.replaceChildren(title); } title.classList.add('fl-tool-title'); }
      let chevron = control.querySelector('.chevron,.fl-tool-chevron'); if (!chevron) { chevron = document.createElement('span'); chevron.textContent = '▸'; control.append(chevron); } chevron.classList.add('fl-tool-chevron');
    }
  }
  function makeLauncher(launcher, launcherSrc) {
    if (launcher.dataset.expCoreLauncher) return;
    const image = launcher.querySelector('img,.launcher-gem svg,.icon,svg:not(.launcher-ring):not(.ring)');
    if (!image) throw new Error('Core launcher requires the product launcher artwork');
    const mark = image.cloneNode(true); mark.removeAttribute('style'); mark.removeAttribute('id'); mark.setAttribute('class','icon launcher-icon');
    if (launcherSrc && mark.tagName === 'IMG') mark.src = launcherSrc;
    launcher.replaceChildren(mark); launcher.dataset.expCoreLauncher = '1'; launcher.dataset.expPart = 'launcher';
    launcher.removeAttribute('data-help');
  }
  // Behavior-only adapter for products with a custom progress surface. Full
  // Core chrome and custom shells share these bindings; no styles or nodes move.
  function createMenuController(options = {}) {
    const { id, host, shadow, panel, setOpen, getSettings = () => ({}) } = options;
    if (!id || !host || !shadow || !panel || typeof setOpen !== 'function') {
      throw new Error('Incomplete menu controller configuration');
    }
    if (menuControllers.has(host)) return menuControllers.get(host);
    const idleTimeoutMs = 15000;
    let open = false, destroyed = false, timer = 0, deadline = 0;
    const removers = [];
    const on = (node, type, handler, opts) => {
      node.addEventListener(type, handler, opts);
      removers.push(() => node.removeEventListener(type, handler, opts));
    };
    function cancelDismiss() {
      clearTimeout(timer);
      timer = 0;
      deadline = 0;
    }
    function enforceDeadline(now = Date.now()) {
      if (destroyed || !open || !deadline || now < deadline) return false;
      cancelDismiss();
      setOpen(false, false);
      return true;
    }
    function scheduleDismiss() {
      cancelDismiss();
      if (destroyed || !open || getSettings().menuAutoClose === false) return;
      deadline = Date.now() + idleTimeoutMs;
      timer = setTimeout(() => enforceDeadline(), idleTimeoutMs + 20);
    }
    function clearOwner() {
      if (document.documentElement.getAttribute('data-exp-open-menu') === id) {
        document.documentElement.removeAttribute('data-exp-open-menu');
      }
    }
    const keepOpen = typeof options.keepOpen === 'function' ? options.keepOpen : () => false;
    for (const type of ['pointerdown', 'click', 'wheel', 'keydown', 'input', 'change']) {
      on(panel, type, scheduleDismiss, { passive: type === 'wheel' });
    }
    on(document, 'exp-core:flyout-close', () => { if (open) setOpen(false, false); });
    on(document, 'exp-core:menu-open', () => {
      if (open && document.documentElement.getAttribute('data-exp-open-menu') !== id) setOpen(false, false);
    });
    if (options.closeOnOutsidePointer !== false) on(document, 'pointerdown', event => {
      if (!open || !event.isTrusted || event.composedPath().includes(host)) return;
      if (shadow.activeElement instanceof HTMLSelectElement) return;
      try { if (keepOpen(event)) return; } catch {}
      setOpen(false, false);
    }, true);
    const controller = Object.freeze({
      state(value) {
        if (destroyed) return;
        open = Boolean(value);
        if (open) {
          document.documentElement.setAttribute('data-exp-open-menu', id);
          document.dispatchEvent(new Event('exp-core:menu-open'));
        } else clearOwner();
        panel.classList.toggle('fl-rail-open', open);
        if (open) scheduleDismiss(); else cancelDismiss();
      },
      scheduleDismiss, cancelDismiss, enforceDeadline,
      get isOpen() { return open; },
      get dismissAt() { return deadline; },
      get timerActive() { return Boolean(timer); },
      idleTimeoutMs,
      destroy() {
        if (destroyed) return;
        destroyed = true;
        open = false;
        cancelDismiss();
        clearOwner();
        removers.forEach(remove => remove());
        menuControllers.delete(host);
      },
    });
    removers.push(ExpMenuPreferences.bindMenuSize({host,shadow,panel,onLayout:options.onLayout}));
    menuControllers.set(host, controller);
    return controller;
  }

  function create(options) {
    const { id, host, shadow, launcher, panel, getSettings = () => ({}), setOpen, shortcutKey = '', productTheme, launcherSrc } = options;
    if (controllers.has(host)) return controllers.get(host);
    // All styling comes from the reference and the composition adapter. Remove
    // product copies and their constructed sheets before mounting the canonical UI. A product that registers its
    // launcher first keeps the launcher's own styles (backdrop and flyout), which follow the canonical sheet.
    const launcherStyles = [...shadow.querySelectorAll('style[data-exp-launcher-backdrop],style[data-exp-flyout-style]')];
    shadow.querySelectorAll('style').forEach(node => { if (!launcherStyles.includes(node)) node.dispose ? node.dispose() : node.remove(); });
    try { shadow.adoptedStyleSheets = []; } catch {}
    const styles = injectStyle(shadow, canonicalCss + compositionCss, { expCoreStyle:version });
    try { shadow.adoptedStyleSheets = [...shadow.adoptedStyleSheets, ...launcherStyles.map(node => node.expSheet).filter(Boolean)]; } catch {}
    const themeRoot = document.createElement('div'); themeRoot.className = 'exp-core-theme';
    [...shadow.childNodes].filter(node => node !== styles).forEach(node => themeRoot.append(node)); shadow.append(themeRoot);
    panel.dataset.expPart = 'dock'; panel.classList.add('exp-menu-surface'); makeLauncher(launcher,launcherSrc); normalizeHeader(panel); normalizeControls(panel);
    let defaultSupport = null;
    const header = panel.querySelector('.menu-head');
    if (header && !header.querySelector('.support-wrap') && options.supportUrl !== '') {
      defaultSupport = createSupportControl({url:options.supportUrl || SUPPORT_URL,label:'Support '+id.toUpperCase()});
      let actions = header.querySelector('.header-actions');
      if (!actions) { actions=document.createElement('div');actions.className='header-actions';const close=header.querySelector('[data-exp-part="close"]');if(close)actions.append(close);header.append(actions); }
      actions.prepend(defaultSupport.element);
    }
    applyContentDrivenMenuLayout(shadow);
    applyMatteToggleChrome(shadow);
    const versionButton=panel.querySelector('.version,[data-exp-part="version"]');
    const menuNotices=[...themeRoot.querySelectorAll('.update-notice,.changelog')].map(notice=>createMenuNotice({host,shadow,panel,notice,versionButton:notice.classList.contains('changelog')?versionButton:null,manageVersion:false,durationMs:30000}));
    if (launcherSrc) panel.querySelectorAll('.header-icon img').forEach(image => image.src = launcherSrc);
    host.dataset.coreVersion = version; host.dataset.coreSource = 'exp-core';
    let choices = themes(productTheme), selected = choices.at(-1), open = false, destroyed = false, frame = 0;
    const removers = [];
    const on = (node,type,fn,opts) => { node.addEventListener(type,fn,opts); removers.push(() => node.removeEventListener(type,fn,opts)); };
    let localTheme = null;
    function paintTheme(theme) {
      selected = theme;
      for (const key of tokenNames) { themeRoot.style.setProperty('--theme-' + key, selected[key]); host.style.setProperty('--' + key, selected[key]); }
      themeRoot.style.setProperty('--theme-skin', selected.skin || selected.swatch || selected.accent);
      themeRoot.style.setProperty('--theme-skin-vertical', selected.skinVertical || selected.skin || selected.swatch || selected.accent);
      Object.assign(themeRoot.dataset, { uiTheme:selected.id, themeSkin:selected.skinMode === 'flat' ? 'flat' : 'gradient' });
      host.dataset.uiTheme = selected.id;
    }
    function syncThemeOwner() {
      host.dataset.expThemeDeprioritized = '0';
      host.dataset.expThemeOwner = id;
      paintTheme(localTheme);
    }
    function setTheme(value, supplied) {
      if (supplied) choices = supplied.map(t => semanticTheme({ ...t, ...t.vars, skin:t.skin || t.swatch, skinVertical:t.skinVertical || t.skin || t.swatch }));
      const alias = ({warm:'ember',discord:'glacier',pine:'verdant',obsidian:'contrast'})[value] || value;
      localTheme = choices.find(t => t.id === alias) || choices.at(-1);
      publishMenuPalette(host, localTheme);
      syncThemeOwner();
    }
    function layout() {
      if (destroyed || !launcher.isConnected) return;
      const state = getSettings();
      themeRoot.style.setProperty('--exp-menu-width', menuWidth() + 'px');
      const fontTokens=ExpMenuPreferences.menuSizeTokens();themeRoot.style.setProperty('--exp-font-size-body',fontTokens.body+'px');themeRoot.style.setProperty('--exp-font-size-small',fontTokens.small+'px');
      themeRoot.classList.toggle('reduce-motion', state.reduceMotion === true || state.reduceMotion === 'on' || state.reducedMotion === 'reduce' || (state.reduceMotion === 'system' || state.reducedMotion === 'system') && matchMedia('(prefers-reduced-motion:reduce)').matches);
      const opacityValue = Number(state.opacityPercent);
      const opacity = state.customOpacity ? (Number.isFinite(opacityValue) ? Math.max(40, Math.min(100, Math.round(opacityValue / 5) * 5)) : 85)/100 : 1;
      themeRoot.style.setProperty('--exp-ui-opacity',String(opacity));
      const { top, right } = launcherPlacement(host);
      Object.assign(launcher.style,{top:top+'px',right:right+'px',bottom:'auto',left:'auto',zIndex:open?'2147483647':'2147483600'});
      Object.assign(panel.style,{overflowY:'auto',overflowX:'hidden',overscrollBehavior:'contain',zIndex:open?'2147483647':'2147483599'});
      if (!open) return;
      placeMenu(host, panel, menuWidth());
      menuNotices.forEach(notice=>notice.layout());
    }
    let arrangement, resize, mutation;
    const arrangementAnchor = document.createComment('menu arrangement styles'); shadow.append(arrangementAnchor);
    function mountMenu() {
      if (arrangement) return;
      const existingStyles = new Set(shadow.querySelectorAll('style'));
      arrangement = ExpMenuArrangement.mount({ panel, id, onChange: queueLayout, resetLaunchers() { resetLauncherGrid(id); queueLayout(); } });
      // Deferred base styles must retain their original precedence below product styles.
      for (const style of shadow.querySelectorAll('style')) if (!existingStyles.has(style)) shadow.insertBefore(style, arrangementAnchor);
      arrangementAnchor.remove();
      resize = new ResizeObserver(queueLayout); resize.observe(panel);
      mutation = new MutationObserver(records=>{if(records.some(r=>r.type==='childList'||r.attributeName==='hidden'))queueLayout();}); mutation.observe(panel,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
    }
    function queueLayout() { if (!frame && !destroyed) frame = requestAnimationFrame(() => { frame = 0; normalizeControls(panel); arrangement?.update(); layout(); }); }
    removers.push(bindLauncherDrag(launcher, id, { layout }));
    const menuController = createMenuController({ ...options, id, host, shadow, panel, getSettings, setOpen, onLayout:queueLayout });
    on(window,'keydown',e=>{if(shortcutKey&&e.altKey&&e.shiftKey&&e.key.toLowerCase()===shortcutKey.toLowerCase()&&!e.repeat){e.preventDefault();setOpen(!open,true);} });
    on(window,'resize',queueLayout);on(document,'exp-core:coordination',queueLayout);
    on(document,'exp-core:coordination',syncThemeOwner);
    const controller = {
      layout, setTheme,
      state(value) {open=Boolean(value);if(open)mountMenu();menuController.state(open);menuNotices.forEach(notice=>notice.setMenuOpen(open));if(open)panel.querySelectorAll('[data-exp-health]').forEach(node=>node.refreshHealth?.());queueLayout();},
      update(){normalizeControls(panel);if(open)panel.querySelectorAll('[data-exp-health]').forEach(node=>node.refreshHealth?.());queueLayout();},
      get dismissAt(){return menuController.dismissAt;},
      destroy(){destroyed=true;arrangement?.destroy();arrangementAnchor.remove();defaultSupport?.destroy();menuController.destroy();cancelAnimationFrame(frame);resize?.disconnect();mutation?.disconnect();menuNotices.forEach(notice=>notice.destroy());removers.forEach(f=>f());styles.dispose();controllers.delete(host);}
    };
    controllers.set(host,controller);setTheme(id);
    queueLayout();return controller;
  }
  function createReleaseUpdateChecker(options = {}) {
    const productId = String(options.productId || '').toLowerCase();
    const repository = String(options.repository || '');
    const resolveCurrentVersion = typeof options.currentVersion === 'function'
      ? () => String(options.currentVersion() || '')
      : () => String(options.currentVersion || '');
    const enabled = typeof options.enabled === 'function' ? options.enabled : () => true;
    const onError = typeof options.onError === 'function' ? options.onError : () => {};
    if (!productId || !repository) throw new Error('Incomplete update checker configuration');
    function getCurrentVersion() {
      const currentVersion = resolveCurrentVersion();
      if (!currentVersion) throw new Error('Update checker current version unavailable');
      return currentVersion;
    }

    const ENDPOINT = String(options.endpoint || ('https://api.github.com/repos/' + repository + '/releases/latest'));
    // Installs and updates come only from published releases, never from the
    // branch: GitHub serves the newest release's asset at this address.
    const RELEASE_URL = 'https://github.com/' + repository + '/releases';
    const INSTALL_URL = RELEASE_URL + '/latest/download/' + String(options.scriptAsset || (productId + '.user.js'));
    const CACHE_KEY = 'exp:v3:' + productId + ':update-cache';
    const CHECK_INTERVAL = 12 * 60 * 60 * 1000;
    const CHECK_LEASE = 30 * 1000;
    let memory = {};

    function readState() {
      try {
        if (typeof GM_getValue === 'function') {
          const value = GM_getValue(CACHE_KEY, null);
          if (value && typeof value === 'object' && !Array.isArray(value)) return { ...value };
        }
      } catch {}
      try {
        const value = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
        if (value && typeof value === 'object' && !Array.isArray(value)) return { ...value };
      } catch {}
      return { ...memory };
    }
    function writeState(value) {
      if(ExtraPotionsTools.productDataResetting(productId))return;
      memory = { ...(value || {}) };
      try { if (typeof GM_setValue === 'function') GM_setValue(CACHE_KEY, memory); } catch {}
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(memory)); } catch {}
    }
    function releaseDetails(body) {
      const details = [];
      let section = false;
      for (const line of String(body || '').split(/\r?\n/)) {
        if (/^##\s+/.test(line)) { if (section) break; section = true; continue; }
        if (!section) continue;
        const match = line.match(/^\s*[-*]\s+(.+)/);
        if (!match) continue;
        const detail = match[1].replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[`*_]/g, '').trim();
        if (detail) details.push(detail.slice(0, 220));
        if (details.length === 4) break;
      }
      return details;
    }
    // A release is quiet when the newest heading of its notes is that release, marked "(quiet)".
    function releaseQuiet(body, latest) {
      for (const line of String(body || '').split(/\r?\n/)) {
        if (!/^##\s+/.test(line)) continue;
        const heading = line.match(/^##\s+v?(\d+\.\d+\.\d+)\b(.*)$/);
        return Boolean(heading && heading[1] === latest && /\(quiet\)\s*$/.test(heading[2]));
      }
      return false;
    }
    function normalize(state) {
      const next = { ...(state || {}) };
      if (!Object.hasOwn(next, 'lastCheckAt') && next.checkedAt) next.lastCheckAt = Number(next.checkedAt) || 0;
      if (!Object.hasOwn(next, 'lastRemoteVersion') && next.latest) next.lastRemoteVersion = String(next.latest || '');
      if (!Array.isArray(next.details)) next.details = [];
      return next;
    }
    function snapshot(state, stateName) {
      const currentVersion = getCurrentVersion();
      const next = normalize(state);
      const latest = String(next.lastRemoteVersion || '');
      return {
        checkedAt: Number(next.lastCheckAt || 0),
        latest: latest || null,
        state: stateName || next.state || 'idle',
        current: currentVersion,
        available: Boolean(latest && CoreFoundation.compareVersions(latest, currentVersion) > 0),
        details: next.details.slice(0, 4),
        quiet: Boolean(next.quiet && latest && CoreFoundation.compareVersions(latest, currentVersion) > 0),
        checkedForVersion: next.checkedForVersion || null,
        lastRemoteVersion: latest || null,
        lastHttpStatus: Number(next.lastHttpStatus || 0),
        lastError: String(next.lastError || ''),
        installUrl: INSTALL_URL,
        releaseUrl: RELEASE_URL,
      };
    }
    function request() {
      return new Promise((resolve, reject) => {
        if (typeof GM_xmlhttpRequest !== 'function') return reject(Object.assign(new Error('Update request capability unavailable'), { code:'UPDATE_CAPABILITY' }));
        GM_xmlhttpRequest({
          method:'GET',
          url:ENDPOINT,
          timeout:10000,
          headers:{ Accept:'application/vnd.github+json', 'Cache-Control':'no-cache', Pragma:'no-cache' },
          onload(response) {
            if (response.status >= 200 && response.status < 300) return resolve(response);
            reject(Object.assign(new Error('Update metadata request failed'), { code:'UPDATE_HTTP_' + response.status, status:response.status }));
          },
          onerror:() => reject(Object.assign(new Error('Update metadata request failed'), { code:'UPDATE_NETWORK' })),
          ontimeout:() => reject(Object.assign(new Error('Update metadata request timed out'), { code:'UPDATE_TIMEOUT' })),
        });
      });
    }
    async function check(force = false) {
      const currentVersion = getCurrentVersion();
      let state = normalize(readState());
      if (!enabled() && !force) return snapshot(state, 'disabled');

      const now = Date.now();
      const checkedForCurrentVersion = state.checkedForVersion === currentVersion;
      if (!checkedForCurrentVersion) {
        state.checkedForVersion = currentVersion;
        state.lastCheckAt = 0;
        state.checkLeaseUntil = 0;
        state.lastRemoteVersion = '';
        state.lastHttpStatus = 0;
        state.lastError = '';
        state.details = [];
        state.quiet = false;
        state.availableVersion = '';
        state.availableAt = 0;
      }
      writeState(state);

      if (!force && Number(state.checkLeaseUntil || 0) > now) return snapshot(state, 'checking');
      if (!force && checkedForCurrentVersion && now - Number(state.lastCheckAt || 0) < CHECK_INTERVAL) return snapshot(state, 'cached');

      state.checkedForVersion = currentVersion;
      state.lastCheckAt = now;
      state.checkLeaseUntil = now + CHECK_LEASE;
      state.lastError = '';
      state.state = 'checking';
      writeState(state);

      try {
        const response = await request();
        const payload = JSON.parse(String(response.responseText || '{}'));
        const latest = String(payload.tag_name || '').replace(/^v/, '');
        if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(latest)) throw Object.assign(new Error('Invalid update metadata'), { code:'UPDATE_METADATA' });

        state = normalize(readState());
        state.checkedForVersion = currentVersion;
        state.lastCheckAt = Date.now();
        state.checkLeaseUntil = 0;
        state.lastRemoteVersion = latest;
        state.lastHttpStatus = Number(response.status || 0);
        state.lastError = '';
        state.details = releaseDetails(payload.body);
        state.quiet = releaseQuiet(payload.body, latest);
        state.state = 'checked';
        if (CoreFoundation.compareVersions(latest, currentVersion) > 0) {
          state.availableVersion = latest;
          state.availableAt = Date.now();
        } else {
          state.availableVersion = '';
          state.availableAt = 0;
        }
        writeState(state);
        return snapshot(state, 'checked');
      } catch (error) {
        state = normalize(readState());
        state.checkedForVersion = currentVersion;
        state.lastCheckAt = Date.now();
        state.checkLeaseUntil = 0;
        state.lastError = String(error?.message || 'Update check failed');
        state.state = 'failed';
        writeState(state);
        try { onError(error); } catch {}
        return snapshot(state, 'failed');
      }
    }
    function status() { return snapshot(readState()); }
    return Object.freeze({
      get CURRENT_VERSION() { return getCurrentVersion(); },
      ENDPOINT,
      INSTALL_URL,
      RELEASE_URL,
      CHECK_INTERVAL,
      check,
      status,
      compare: CoreFoundation.compareVersions,
    });
  }

  function createSupportControl({ url = SUPPORT_URL, label = 'Support' } = {}) {
    if (!url) return null;
    const wrapper = document.createElement('div');
    wrapper.className = 'support-wrap';
    const style = document.createElement('style');
    style.dataset.expSupportControl = '1';
    style.dataset.expOwned = '1';
    style.textContent = CoreFoundation.supportControlCss();
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'exp-support-button';
    button.className = 'support-button';
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', 'exp-support-popover');
    button.title = label;
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.2-4.35-9.55-8.45C.42 9.02 2.3 5 6.25 5c2.15 0 3.56 1.21 4.33 2.3C11.36 6.21 12.77 5 14.92 5c3.95 0 5.83 4.02 3.8 7.55C16.36 16.65 12 21 12 21Z"/></svg>';
    const popover = document.createElement('div');
    popover.id = 'exp-support-popover';
    popover.className = 'support-popover';
    popover.setAttribute('role', 'dialog');
    popover.setAttribute('aria-label', label);
    popover.hidden = true;
    const strong = document.createElement('strong');
    strong.textContent = label;
    const copy = document.createElement('span');
    copy.textContent = 'Donations are optional. All features stay free.';
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.textContent = 'Open Ko-fi';
    popover.append(strong, copy, anchor, ExtraPotionsTools.createBitcoinDonation());
    wrapper.append(style, button, popover);
    const toggle = event => {
      event?.stopPropagation?.();
      ExtraPotionsTools.placeDonationPanel(popover,button);
      popover.hidden = !popover.hidden;
      button.setAttribute('aria-expanded', String(!popover.hidden));
    };
    const outside = event => {
      if (popover.hidden || event.composedPath().includes(wrapper) || event.composedPath().includes(popover)) return;
      popover.hidden = true;
      button.setAttribute('aria-expanded', 'false');
    };
    button.addEventListener('click', toggle);
    document.addEventListener('pointerdown', outside, true);
    return Object.freeze({
      element: wrapper,
      button,
      popover,
      hide() { popover.hidden = true; button.setAttribute('aria-expanded', 'false'); },
      destroy() { button.removeEventListener('click', toggle); document.removeEventListener('pointerdown', outside, true); popover.remove(); wrapper.remove(); },
    });
  }

  function createProductNotice(options = {}) {
    const { host, shadow, panel, versionButton = null } = options;
    if (!(host instanceof Element) || !(shadow instanceof ShadowRoot) || !(panel instanceof Element)) {
      throw new Error('Product notice requires a mounted Core product');
    }
    const notice = document.createElement('div');
    notice.className = 'update-notice';
    notice.dataset.expUpdateNotice = '1';
    notice.hidden = true;
    notice.innerHTML = '<button type="button" class="update-dismiss" aria-label="Dismiss Update Notice">×</button><div class="update-head"><div class="update-heading"><div class="update-kicker">What\'s New</div><div class="update-title"></div></div><div class="update-version"></div></div><div class="update-text"></div><ul class="update-list"></ul><div class="update-footer"><a class="update-release" target="_blank" rel="noopener noreferrer">GitHub Release</a><a class="update-action" target="_blank" rel="noopener noreferrer">Install Update</a></div>';
    (shadow.querySelector('.exp-core-theme') || shadow).append(notice);
    const controller = createMenuNotice({
      host,
      shadow,
      panel,
      notice,
      versionButton: null,returnFocus:options.returnFocus||versionButton,
      manageVersion: false,
      durationMs: options.durationMs ?? 30000,
    });
    function show(state = {}) {
      notice.querySelector('.update-kicker').textContent = state.kicker || "What's New";
      notice.querySelector('.update-title').textContent = state.title || '';
      notice.querySelector('.update-version').textContent = state.version ? 'v' + state.version : '';
      notice.querySelector('.update-text').textContent = state.text || '';
      const list = notice.querySelector('.update-list');
      list.replaceChildren();
      const details = Array.isArray(state.details) ? state.details.slice(0, 4) : [];
      for (const detail of details) {
        const item = document.createElement('li');
        item.textContent = detail;
        list.append(item);
      }
      list.hidden = !details.length;
      const release = notice.querySelector('.update-release');
      const releaseUrl = state.releaseUrl || options.releaseUrl || '';
      release.hidden = !releaseUrl;
      if (releaseUrl) release.href = releaseUrl;
      const action = notice.querySelector('.update-action');
      const actionUrl = state.actionUrl || options.installUrl || '';
      action.hidden = !actionUrl || state.showAction === false;
      if (actionUrl) action.href = actionUrl;
      action.textContent = state.actionText || 'Install Update';
      notice.dataset.noticeKind = state.kind || 'current';
      // Some products close the menu without marking the panel hidden; only a drawn panel counts as open.
      controller.setMenuOpen(!panel.hidden && panel.getClientRects().length > 0);
      controller.show();
    }
    const versionClick = () => {
      if (typeof options.onVersion === 'function') options.onVersion();
      else controller.toggle();
    };
    versionButton?.addEventListener('click', versionClick);
    return Object.freeze({
      element: notice,
      show,
      hide: controller.hide,
      toggle: controller.toggle,
      layout: controller.layout,
      setMenuOpen: controller.setMenuOpen,
      destroy() {
        versionButton?.removeEventListener('click', versionClick);
        controller.destroy();
        notice.remove();
      },
    });
  }

  function productCompatibilityReport() {
    const base = ExtraPotionsDiagnostics.compatibility();
    const interoperability = suiteHealth();
    const conflicts = [
      ...(Array.isArray(base.conflicts) ? base.conflicts : []),
      ...interoperability.conflicts,
    ];
    return Object.freeze({
      ...base,
      conflicts: Object.freeze(conflicts.map(conflict => Object.freeze({ ...conflict }))),
      status: conflicts.length ? 'conflicts-detected' : 'no-conflicts-observed',
      interoperability,
    });
  }

  function createSuiteCompatibilityControls() {
    const details = document.createElement('details');
    details.className = 'exp-tools-card';
    details.style.cssText = 'border:1px solid var(--theme-line,var(--line,#777));border-radius:7px;padding:7px;margin-top:8px';
    const summary = document.createElement('summary');
    summary.textContent = 'Product compatibility';
    const output = document.createElement('div');
    output.setAttribute('aria-live', 'polite');
    const refreshButton = document.createElement('button');
    refreshButton.type = 'button';
    refreshButton.className = 'life-btn action';
    refreshButton.textContent = 'Refresh compatibility';

    const refresh = () => {
      output.replaceChildren();
      const report = productCompatibilityReport();
      const suite = suiteSnapshot();
      const healthById = new Map(report.interoperability.products.map(product => [product.id, product]));
      if (!suite.products.length) {
        const empty = document.createElement('p');
        empty.textContent = 'No ExtraPotions products are registered on this page yet.';
        output.append(empty);
      }
      for (const product of suite.products) {
        const health = healthById.get(product.id);
        const line = document.createElement('p');
        const stateAge = health?.stateAgeMs == null ? '' : ` · state ${Math.max(0, Math.round(health.stateAgeMs / 1000))}s ago`;
        line.textContent = `${product.id.toUpperCase()} ${product.version} · Core ${product.coreVersion} · ${health?.status === 'healthy' ? 'Healthy' : 'Check compatibility'}${stateAge}`;
        output.append(line);
      }

      const observers = document.createElement('p');
      const page = pageObserverState();
      const navigation = navigationObserverState();
      observers.textContent = `Shared observers · DOM: ${page.active ? page.owner || 'active' : 'idle'} · Navigation: ${navigation.active ? navigation.owner || 'active' : 'idle'}`;
      output.append(observers);

      const status = document.createElement('p');
      status.textContent = report.conflicts.length
        ? report.conflicts.map(conflict => conflict.type).join(', ')
        : 'No interoperability conflicts detected on this page.';
      output.append(status);

      const note = document.createElement('small');
      note.textContent = 'Only products running on this page are shown. Shared suite state is advisory coordination data, not an authorization signal.';
      output.append(note);
    };

    details.addEventListener('toggle', () => { if (details.open) refresh(); });
    refreshButton.addEventListener('click', refresh);
    details.append(summary, output, refreshButton);
    return details;
  }

  function createDiagnosticsReport(product, details = {}) {
    const report = ExtraPotionsDiagnostics.createReport(product, details, { version, source: 'exp-core', sourceVersion });
    return {
      ...report,
      interoperability: {
        suite: suiteSnapshot(),
        presentation: {
          phases: { ...PRESENTATION_PHASES },
          providers: presentationProviders(),
        },
        pageObserver: pageObserverState(),
        navigationObserver: navigationObserverState(),
        states: suiteStateSnapshot(),
        health: suiteHealth(),
      },
    };
  }
  function downloadDiagnostics(report) {
    const name=`${String(report.report||'Diagnostics').toLowerCase().replace(/[^a-z0-9]+/g,'-')}-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;
    const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));
    const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return; } catch {}
    const area=document.createElement('textarea');area.value=text;area.style.cssText='position:fixed;left:-9999px';document.documentElement.append(area);area.select();const success=document.execCommand('copy');area.remove();if(!success)throw new Error('Clipboard unavailable');
  }
  function createDiagnosticsControls(getReport, notify = () => {}) { return ExtraPotionsDiagnostics.createControls(getReport, notify); }
  const { normalizeHealth, createHealthControls } = ExpHealthSummary;
  const { createRecoveryGuard } = ExpRecoveryControl;
  function createProduct({id,name,version:productVersion,subtitle='',artwork,theme,sections=[],getSettings,onSettings=()=>{},priority,supportUrl=SUPPORT_URL,keepOpen}) {
    const host=document.createElement('div');host.id='exp-'+id+'-root';host.dataset.expOwned='1';const shadow=host.attachShadow({mode:'open'});const panel=document.createElement('aside');panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-label',name+' settings');
    const header=document.createElement('header');header.className='menu-head';const brand=document.createElement('div');brand.className='header-brand';const image=document.createElement('img');image.src=artwork;image.alt='';const copy=document.createElement('div');const titleRow=document.createElement('div');const title=document.createElement('strong');title.textContent=name;const v=document.createElement('button');v.type='button';v.className='version';v.textContent='v'+productVersion;v.setAttribute('aria-label','View '+name+' v'+productVersion+' Changelog');titleRow.append(title,v);const sub=document.createElement('small');sub.textContent=subtitle;copy.append(titleRow,sub);brand.append(image,copy);const close=document.createElement('button');close.className='close';close.textContent='×';close.setAttribute('aria-label','Close '+name);const actions=document.createElement('div');actions.className='header-actions';const support=createSupportControl({url:supportUrl,label:'Support '+name});if(support)actions.append(support.element);actions.append(close);header.append(brand,actions);const divider=document.createElement('div');divider.className='header-divider';const nav=document.createElement('nav');
    let isOpen=false, activeId='';let chrome;
    const sectionMap=new Map();
    function renderSection(section,body){const content=section.render({core:api,onSettings});replaceMenuContent(body,content);chrome?.update();}
    function renderActive(){if(!activeId)return false;const entry=sectionMap.get(activeId);if(!entry||entry.body.hidden)return false;renderSection(entry.section,entry.body);return true;}
    function setOpen(value,focus=true){isOpen=Boolean(value);panel.hidden=!isOpen;launcher.setAttribute('aria-expanded',String(isOpen));if(isOpen){activeId='';nav.querySelectorAll('.route-body').forEach(n=>n.hidden=true);nav.querySelectorAll('button[data-section]').forEach(n=>n.setAttribute('aria-expanded','false'));}chrome.state(isOpen);if(focus)(isOpen?focusMenuSurface(panel):launcher.focus());}
    for(const section of sections){const group=document.createElement('section');group.className='tool-panel';const button=document.createElement('button');button.type='button';button.textContent=section.label;button.dataset.section=section.id;const body=document.createElement('div');body.className='route-body';body.hidden=true;sectionMap.set(section.id,{section,body,button});button.addEventListener('click',()=>{const opening=body.hidden;nav.querySelectorAll('.route-body').forEach(n=>n.hidden=true);nav.querySelectorAll('button[data-section]').forEach(n=>{n.classList.toggle('last-opened',n===button);n.setAttribute('aria-expanded',String(opening&&n===button));});body.hidden=!opening;activeId=opening?section.id:'';if(opening)renderSection(section,body);chrome.update();});group.append(button,body);nav.append(group);}
    const launcher=document.createElement('button');launcher.className='launcher';launcher.type='button';launcher.setAttribute('aria-label','Open '+name);const mark=image.cloneNode(true);launcher.append(mark);launcher.addEventListener('click',()=>setOpen(!isOpen));close.addEventListener('click',()=>setOpen(false));panel.append(header,divider,nav);shadow.append(panel,launcher);document.documentElement.append(host);chrome=create({id,host,shadow,panel,launcher,getSettings,setOpen,productTheme:theme,supportUrl,keepOpen});const unregister=registerLauncher(host,{productId:id,priority});
    const key=e=>{if(e.key==='Escape'&&isOpen)setOpen(false);};document.addEventListener('keydown',key);
    return {host,shadow,panel,launcher,versionButton:v,open:()=>setOpen(true),close:()=>setOpen(false),toggle:()=>setOpen(!isOpen),refresh:()=>chrome.update(),renderActive,get isOpen(){return isOpen;},destroy(){document.removeEventListener('keydown',key);support?.destroy();chrome.destroy();unregister();host.remove();}};
  }
  let gridFrame=0;
  let lastSlotKey='';
  const checkSlot=()=>{const slot=siteSlot();const key=slot?slot.left+','+slot.top:'';if(key!==lastSlotKey){lastSlotKey=key;emit('launcher-site-slot','core');}};
  const scheduleGrid=()=>{if(!gridFrame)gridFrame=requestAnimationFrame(()=>{gridFrame=0;layoutGrid();syncFlyout();checkSlot();recheckSiteControls();});};
  // Page changes can add, move or hide a site slot, so they also drop the remembered slot, at most once per
  // 150ms: a busy page (Twitch chat) would otherwise re-measure the top bar on every change.
  let slotStale=0;
  const markSlotStale=()=>{if(!slotStale)slotStale=setTimeout(()=>{slotStale=0;slotMemo=null;scheduleGrid();},150);};
  const gridObserver=new MutationObserver(()=>{markSlotStale();scheduleGrid();});
  const startGrid=()=>{if(!document.documentElement)return;gridObserver.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['data-exp-product-launcher','data-product-id','data-launcher-priority','data-launcher-reserved-rows','data-exp-flyout','data-exp-update','data-exp-progress','data-exp-open-menu','data-exp-flyout-open']});scheduleGrid();};
  if(document.documentElement)startGrid();else addEventListener('DOMContentLoaded',startGrid,{once:true});
  document.addEventListener('exp-core:coordination',scheduleGrid);
  document.addEventListener('exp-core:menu-open', raiseOpenMenuHost);
  document.addEventListener('exp-core:flyout-focus', onFlyoutFocus);
  document.addEventListener('pointerdown', onFlyoutOutside, true);
  addEventListener('keydown', onFlyoutEscape, true);
  addEventListener('resize',scheduleGrid,{passive:true});
  addEventListener('scroll',()=>{recheckSiteControls();if (/^(www|sh)\.reddit\.com$/.test(location.hostname)) markSlotStale();},{passive:true,capture:true});
  // Core-owned product bootstrap for downstream consumers.
  function createProductServices(options = {}) {
    const productId = String(options.productId || '').toLowerCase();
    const repository = String(options.repository || '');
    const currentVersion = options.currentVersion;
    if (!productId || !repository || (typeof currentVersion !== 'function' && !String(currentVersion || ''))) {
      throw new Error('Incomplete product services configuration');
    }
    const lifecycle = createProductLifecycle(api);
    const diagnostics = Object.freeze({
      createDiagnosticsReport,
      downloadDiagnostics,
      createDiagnosticsControls,
    });
    const updates = createReleaseUpdateChecker({
      productId,
      repository,
      currentVersion,
      endpoint: options.endpoint,
      scriptAsset: options.scriptAsset,
      enabled: options.enabled,
      onError: options.onError,
    });
    return Object.freeze({ lifecycle, diagnostics, updates });
  }

  const api = Object.freeze({...ExtraPotionsTools,setMenuHelp:ExpMenuHelp.setMenuHelp,...ExpMenuPreferences,...ExpSiteColors,normalizeHealth,createHealthControls,createRecoveryGuard,version,sourceVersion,protocol,gridProtocol,reference:CoreFoundation,css:canonicalCss,themes,create,createMenuController,createProduct,menuTemplate:ExpLeanMenu.template,setMenuStatus:ExpLeanMenu.setMenuStatus,createSupportControl,createProductNotice,createLifecycle:()=>createProductLifecycle(api),createProductServices,registerLauncher,setLauncherUpdate,setLauncherProgress,bindLauncherDrag,launcherPlacement,placeMenu,placeNotice,resetLauncherGrid,layout:layoutGrid,replaceMenuContent,createDisclosure,createSystemGrid,isOwnedSheet,menuWidth,cloneSettings,applyTextGradient,injectStyle,applyTheme,applyMatteToggleChrome,applyTwoColumnSettingsGrid,applyContentDrivenMenuLayout,createThemeSwatches,publishMenuPalette,createFloatingNotice,createMenuNotice,takeNoticeTurn,releaseNoticeTurn,createReleaseUpdateChecker,registerFloatingNotice,layoutFloatingNotices,claimNotice,consumeVersionChange,isQuietUpgrade,focusMenuSurface,registerDiagnosticsProduct,registerSuiteProduct,suiteContract,suiteSnapshot,hasProductCapability,capabilityProviders,emitSuiteEvent,publishSuiteState,suiteStateSnapshot,latestSuiteState,subscribeSuiteState,onSuiteEvent,suiteSitePaused,setSuiteSitePaused,pageContext,observeNavigation,navigationObserverState,suiteTrust:SUITE_TRUST,registerPresentationProvider,presentationProviders,suiteHealth,readPresentationState,setPresentationState,clearPresentationState,presentationStateChain,isPresentationSuppressed,presentationPhases:PRESENTATION_PHASES,presentationChannels:PRESENTATION_CHANNELS,observePresentationState,observePage,observePageBatch,pageObserverState,suiteProducts:SUITE_PRODUCTS,suitePriority:SUITE_PRIORITY,productCompatibility:productCompatibilityReport,createCompatibilityControls:createSuiteCompatibilityControls,bindDiagnosticsControls:ExtraPotionsDiagnostics.bindControls,createDiagnosticsReport,downloadDiagnostics,createDiagnosticsControls,mountMenuArrangement:ExpMenuArrangement.mount,mountSubmenuTabs:ExpMenuArrangement.mountTabs,menuCategories:ExpMenuArrangement.categories,categorizeMenuSections:ExpMenuArrangement.describe,createMenuCategoryDisclosure:(label,category,...contents)=>ExpMenuArrangement.createDisclosure({document,label,category,contents}),collapseMenuSubmenus:ExpMenuArrangement.collapseSubmenus,compareVersions:CoreFoundation.compareVersions});
  return api;
})();

const RC={VERSION:"0.2.3",NOTES:["Collapse the right sidebar with a handle at its edge, like the left navigation rail; its arrow shows which way it will move, the feed widens into the free space, and the choice is remembered.","Hide, dim or blur posts from a whole community with Filter r/… in a post’s actions menu, and add Unblur spoilers and Unblur mature media toggles; mature media unblurs only where Reddit already shows it to your signed-in account.","Put the view picker in Reddit’s sort row, keep whole images in Cards, pack Grid without gaps, show promoted posts in the chosen view, and open Thread actions as a list with subtle motion.","Trim the menu to one control per behaviour; removed settings keep one fixed behaviour."],GEM:"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 128 128\" role=\"img\" aria-label=\"Thread orange Asscher gem\"><polygon points=\"35.00,14.00 93.00,14.00 77.34,41.00 50.66,41.00\" fill=\"#ffd0a3\"/><polygon points=\"50.66,41.00 77.34,41.00 64.00,64.00\" fill=\"#ff7636\"/><polygon points=\"93.00,14.00 114.00,35.00 87.00,50.66 77.34,41.00\" fill=\"#ff8d4b\"/><polygon points=\"77.34,41.00 87.00,50.66 64.00,64.00\" fill=\"#ff4500\"/><polygon points=\"114.00,35.00 114.00,93.00 87.00,77.34 87.00,50.66\" fill=\"#ff7636\"/><polygon points=\"87.00,50.66 87.00,77.34 64.00,64.00\" fill=\"#c6350d\"/><polygon points=\"114.00,93.00 93.00,114.00 77.34,87.00 87.00,77.34\" fill=\"#ff4500\"/><polygon points=\"87.00,77.34 77.34,87.00 64.00,64.00\" fill=\"#a82d0d\"/><polygon points=\"93.00,114.00 35.00,114.00 50.66,87.00 77.34,87.00\" fill=\"#c6350d\"/><polygon points=\"77.34,87.00 50.66,87.00 64.00,64.00\" fill=\"#dd4814\"/><polygon points=\"35.00,114.00 14.00,93.00 41.00,77.34 50.66,87.00\" fill=\"#a82d0d\"/><polygon points=\"50.66,87.00 41.00,77.34 64.00,64.00\" fill=\"#ffb073\"/><polygon points=\"14.00,93.00 14.00,35.00 41.00,50.66 41.00,77.34\" fill=\"#dd4814\"/><polygon points=\"41.00,77.34 41.00,50.66 64.00,64.00\" fill=\"#ffd0a3\"/><polygon points=\"14.00,35.00 35.00,14.00 50.66,41.00 41.00,50.66\" fill=\"#ffb073\"/><polygon points=\"41.00,50.66 50.66,41.00 64.00,64.00\" fill=\"#ff8d4b\"/></svg>",CSS:"/* All page rules are companion-owned or opt-in attributes on exact native nodes. */\n[data-rc-owned]{--rc-bg:var(--color-neutral-background,#fff);--rc-surface:var(--color-neutral-background-weak,#f4f6f7);--rc-text:var(--color-neutral-content-strong,#182126);--rc-muted:var(--color-neutral-content,#4e606a);--rc-line:#71828c;--rc-blue:#174c99;color:var(--rc-text);background:var(--rc-bg);font:400 var(--rc-ui-font,12px)/1.5 \"Segoe UI\",system-ui,sans-serif;box-sizing:border-box;letter-spacing:normal;overflow-wrap:anywhere;color-scheme:light dark}\n@media(prefers-color-scheme:dark){[data-rc-owned]{--rc-bg:var(--color-neutral-background,#0e1113);--rc-surface:var(--color-neutral-background-weak,#181c1f);--rc-text:var(--color-neutral-content-strong,#edf1f3);--rc-muted:var(--color-neutral-content,#b4c1c8);--rc-blue:#90baff}}\n[data-rc-owned] *{box-sizing:border-box}\n[data-rc-owned] :is(button,input,select,textarea){font:inherit;max-width:100%;min-width:0;color:inherit;background:var(--rc-surface);border:1px solid var(--rc-line);border-radius:6px;padding:5px 8px;min-height:32px;letter-spacing:normal}\n[data-rc-owned] button{cursor:pointer}\n[data-rc-owned] button:disabled{opacity:.6;cursor:default}\n[data-rc-owned] :is(button,a,input,select,textarea,summary):focus-visible,[data-rc-selected]{outline:2px solid var(--rc-blue,#1768b5)!important;outline-offset:2px}\n[data-rc-owned] ::selection{background:#203c61;color:#edf1f3}\n[data-rc-owned] a{color:var(--rc-blue);text-decoration:underline;text-underline-offset:2px}\n.rc-tools{position:relative;z-index:1;display:flex;gap:4px;flex-wrap:wrap;align-items:center;padding:5px 0;border-block:1px solid var(--rc-line);margin:5px 0}\n.rc-tools small{color:var(--rc-muted)}\n[data-rc-treatment=\"dim\"]>:not([data-rc-owned]){opacity:.45}\n[data-rc-treatment=\"blur\"]>:not([data-rc-owned]){filter:blur(6px);pointer-events:none;user-select:none}\n[data-rc-treatment=\"hide\"]>:not([data-rc-owned]){display:none!important}\n[data-rc-collapsed]>:not([data-rc-owned]){display:none!important}\n[data-rc-read] [slot=\"comment\"]{opacity:.78}\n[data-rc-post-read-hidden]{display:none!important}\n[data-rc-post-read]:not([data-rc-post-read-hidden])>[slot=\"title\"]{opacity:.75}\n[data-rc-reading-font] :is([slot=\"title\"],[slot=\"comment\"],[slot=\"text-body\"]){font-family:var(--rc-reading-font)!important}\n[data-rc-reading-line] :is([slot=\"comment\"],[slot=\"text-body\"]){line-height:var(--rc-line-height)!important}\n[data-rc-reading-gap] :is([slot=\"comment\"],[slot=\"text-body\"]) p{margin-block:var(--rc-paragraph-gap)!important}\n[data-rc-search-match] [slot=\"comment\"]{outline:2px solid var(--rc-blue,#174c99);outline-offset:2px}\n.rc-reading-controls{display:grid;gap:8px;margin-block:8px}\n.rc-library-entry{border-bottom:1px solid var(--rc-line);padding-block:12px}\n.rc-library-entry button{margin:4px 4px 0 0}\n.rc-popover :is(input,textarea,select){width:100%}\n.rc-popover[data-rc-owned] :is(input,select,button){min-height:44px}\n.rc-popover.rc-reading-panel{left:50%;translate:-50% 0;z-index:2147483647}\n.rc-reading-panel :is(input,textarea)::placeholder{color:var(--rc-muted);opacity:1}\n[data-rc-density=\"compact\"]{padding-block:8px!important}\n[data-rc-density=\"mini\"]{padding-block:5px!important}\n[data-rc-font]{font-size:var(--rc-content-font,14px)!important}\n[data-rc-font] :is([slot=\"comment\"],[slot=\"text-body\"]){font-size:var(--rc-content-font,14px)!important}\n[data-rc-negative] [slot=\"comment\"]{opacity:.55}\n[data-rc-view-container=\"grid\"]{position:relative;display:grid!important;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));grid-auto-rows:4px;gap:0 12px;align-items:start}\n[data-rc-view-container=\"grid\"]>[data-rc-view-wrapper]{grid-row-end:span var(--rc-grid-span,60)}\n[data-rc-view-container=\"grid\"]>[data-rc-view-aux]{position:absolute!important;inset:auto 0 0}\n[data-rc-view-container=\"grid\"] [data-rc-view=\"grid\"]{margin-block:0!important}\n[data-rc-view-container=\"grid\"]>hr{display:none!important}\n[data-rc-view-wrapper]{min-width:0;max-width:100%}\n[data-rc-view=\"cards\"],[data-rc-view=\"grid\"]{display:block!important;border:1px solid var(--color-neutral-border,#71828c)!important;border-radius:8px!important;padding:14px!important;margin-block:10px!important;min-width:0;max-width:100%;overflow-wrap:anywhere}\n[data-rc-view=\"compact\"]{display:block!important;padding:4px 6px!important;margin-block:0!important;border-bottom:1px solid var(--color-neutral-border,#71828c)!important}\n/* Native compact ads keep their own inner column; the frame adds no second inset. */\nshreddit-ad-post[data-rc-view=\"compact\"]{padding-inline:0!important}\n[data-rc-view=\"compact\"] [slot=\"title\"]{font-size:16px;line-height:1.25;margin-block:2px}\n[data-rc-view=\"compact\"] [slot=\"text-body\"]{line-height:1.4;margin-block:3px;max-height:2.8em;overflow:auto}\n[data-rc-view=\"compact\"] .rc-tools{padding:0;border:0;margin:3px 0}\n[data-rc-compact-flat]{display:flow-root!important}\n.rc-compact-actions{min-width:0;max-width:100%}\n.rc-compact-actions summary{font:inherit;color:inherit;background:var(--rc-surface);border:1px solid var(--rc-line);border-radius:6px;padding:5px 8px;min-height:32px;max-width:100%;letter-spacing:normal;cursor:pointer;width:fit-content}\n.rc-action-items{display:flex;flex-wrap:wrap;gap:4px;padding-block:4px}\n.rc-tools[data-rc-feed-actions]{display:inline-flex;order:-1!important;flex:0 1 auto;align-self:flex-start;vertical-align:middle;max-width:100%;padding:0;border:0;margin:0 4px 0 0}\n[data-rc-header-row]{display:flex;align-items:center;gap:4px;min-width:0;position:relative;z-index:1}\n.rc-tools[data-rc-header-actions],[data-rc-compact-flat]>.rc-tools[data-rc-header-actions]{display:flex;flex:0 0 auto;width:fit-content;order:initial!important;align-self:center;margin:0 0 0 auto!important;padding:0!important;border:0!important;pointer-events:auto}\n.rc-tools[data-rc-header-actions],.rc-tools[data-rc-header-actions]>details{background:transparent!important}\n.rc-tools[data-rc-header-actions]>details{display:block;padding:0!important;margin:0!important;border:0!important;border-radius:0}\n.rc-tools[data-rc-header-actions] summary{display:flex;align-items:center;justify-content:center;list-style:none;width:var(--rc-native-action-size,32px);min-width:var(--rc-native-action-size,32px);height:var(--rc-native-action-size,32px);min-height:0!important;padding:0;border:0;background:var(--rc-native-action-bg,transparent);color:inherit;border-radius:8px;cursor:pointer}\n.rc-tools[data-rc-header-actions] summary svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round}\n.rc-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}\n.rc-tools[data-rc-header-actions] summary::-webkit-details-marker{display:none}\n.rc-tools[data-rc-header-actions] summary:focus-visible{outline-offset:-2px}\n.rc-tools[data-rc-header-actions] .rc-action-items{position:fixed;inset:auto;margin:0;padding:4px;z-index:2147483645;max-height:calc(100dvh - 24px);overflow:auto;box-sizing:border-box;background:var(--rc-bg);color:var(--rc-text);border:1px solid var(--color-neutral-border-weak,var(--rc-line));border-radius:7px;box-shadow:0 4px 10px #0003;font:400 var(--rc-ui-font,12px)/1.5 \"Segoe UI\",system-ui,sans-serif}\n.rc-tools[data-rc-header-actions] .rc-action-items:popover-open{display:flex;flex-direction:column;flex-wrap:nowrap;gap:0}\n/* Native menu rows: full-width, left-aligned, tinted only on hover or press. */\n.rc-tools[data-rc-header-actions] .rc-action-items :is(button,a){display:flex;align-items:center;justify-content:flex-start;width:100%;min-height:40px;padding:8px 12px;border:0;border-radius:5px;background:transparent;color:inherit;text-align:start;text-decoration:none;font-size:14px;line-height:20px}\n.rc-tools[data-rc-header-actions] .rc-action-items :is(button,a):is(:hover,:active){background:var(--color-neutral-background-hover,var(--rc-surface))}\n.rc-tools[data-rc-header-actions] .rc-action-items small{display:block;padding:6px 12px 2px;font-size:12px}\n[data-rc-view=\"compact\"][data-rc-compact-preview]:not([data-rc-compact-media-open])>[slot=\"post-media-container\"]:not([hidden]){display:none!important}\n.rc-compact-preview{position:relative;z-index:1;display:block;width:104px;height:78px;padding:0;overflow:hidden;cursor:pointer;border:1px solid var(--rc-line);border-radius:6px}\n.rc-compact-preview img{width:100%;height:100%;object-fit:cover}\n.rc-compact-preview>span{display:none}\n[data-rc-compact-flat]>.rc-compact-preview,[data-rc-compact-flat]>[slot=\"thumbnail\"]{float:left;margin:0 8px 4px 0}\n[data-rc-compact-flat]:where(:not([data-rc-treatment=\"hide\"]):not([data-rc-collapsed]))>[slot=\"thumbnail\"]:not([hidden]):not(.hidden){display:block!important;width:104px;max-height:78px;overflow:hidden}\n[data-rc-compact-flat][data-rc-compact-has-thumb]>:is([slot=\"credit-bar\"],[slot=\"title\"],[slot=\"text-body\"]){margin-left:112px!important}\n[data-rc-compact-flat]>[slot=\"credit-bar\"]{font-size:12px;line-height:16px;margin-block:0}\n[data-rc-compact-flat]>[slot=\"title\"]{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}\n[data-rc-compact-flat]>:is([slot=\"post-flair\"],[slot=\"awards\"]){display:none}\n[data-rc-compact-flat]>.rc-tools{display:inline-flex;vertical-align:middle}\n[data-rc-compact-native-layout]>[slot=\"thumbnail\"]>:first-child,[data-rc-compact-native-layout]>[slot=\"thumbnail\"] [slot=\"thumbnail\"]{width:80px!important;max-width:80px!important;height:60px!important;max-height:60px!important;overflow:hidden}\n[data-rc-compact-native-layout]>[slot=\"thumbnail\"] :is(img,video){width:100%;height:100%;object-fit:cover}\n[data-rc-compact-flat]>[slot=\"post-media-container\"]{clear:both}\n@media(pointer:coarse){.rc-compact-actions summary,[data-rc-view=\"compact\"] .rc-tools button{min-height:44px}}\n@media(pointer:coarse){.rc-tools[data-rc-feed-actions] button{min-height:44px}}\n/* Keep native thumbnails compact; only full media owns uncapped height. Native aspect frames already letterbox the whole image. */\n[data-rc-view]:where(:not([data-rc-treatment=\"hide\"]):not([data-rc-collapsed])) [slot=\"post-media-container\"]:not([hidden]):not(.hidden):not(:has(gallery-carousel,faceplate-carousel)):where(:not(:has([data-aspect-ratio-container]))){display:block!important;width:100%!important;max-width:100%!important;height:auto!important;max-height:none!important;overflow:visible}\n[data-rc-view] [slot=\"expando-content\"]{width:100%;max-width:100%;max-height:none;overflow:visible}\n[data-rc-view] :is([slot=\"post-media-container\"],[slot=\"expando-content\"]) :is(img,video):not(:is(gallery-carousel,faceplate-carousel) *):where(:not([data-aspect-ratio-container] *)){display:block;max-width:100%!important;max-height:none!important;height:auto!important;object-fit:contain}\n[data-rc-view] :is([slot=\"post-media-container\"],[slot=\"expando-content\"]) :is(iframe,object,embed){max-width:100%!important;box-sizing:border-box}\n[data-rc-view] [data-rc-owned]{order:10}\n[data-rc-select]{user-select:text!important}\n[data-rc-expand] [slot=\"text-body\"]{max-height:none!important;-webkit-line-clamp:unset!important}\n[data-rc-hover]:hover{background:var(--color-neutral-background-hover,#e8edef)}\n[data-rc-hide-author] [slot=\"authorName\"],[data-rc-hide-flair] [slot=\"post-flair\"],[data-rc-hide-awards] [slot=\"awards\"],[data-rc-hide-save] [data-testid=\"save-button\"],[data-rc-profile-simple] :is([data-testid=\"profile-trophy-case\"],[data-testid=\"profile-achievements\"]){display:none!important}\n[data-rc-awards-collapsed] [slot=\"awards\"]{max-height:24px;overflow:auto}\n[data-rc-sidebar-hidden],[data-rc-secondary-hidden]{display:none!important}\n[data-rc-layout]{width:min(100%,var(--rc-width,800px))!important;max-width:100%!important;margin-inline:auto!important;translate:var(--rc-offset,0px) 0}\n.rc-pagebar{display:flex;align-items:center;gap:5px;flex-wrap:wrap;padding:4px 0;margin:4px 0;position:sticky;top:var(--rc-sticky-top,0px);z-index:10;border-bottom:1px solid var(--rc-line)}\n.rc-pagebar[data-rc-page-type=\"feed\"]{position:static;z-index:auto}\n.rc-pagebar:empty{display:none}\n/* Inside Reddit's sort row the controls read as native plain buttons: no strip, no box, same 32px rhythm. */\n[data-rc-sort-row]{display:flex;flex-wrap:wrap;align-items:center;column-gap:4px}\n.rc-pagebar[data-rc-inline]{flex:1 1 auto;position:static;z-index:auto;margin:0;padding:0;border:0;gap:2px;background:transparent;color:var(--color-neutral-content-weak,var(--rc-muted));font-size:12px;font-weight:600}\n.rc-pagebar[data-rc-inline] :is(button,select,a){height:32px;min-height:0;margin:0;padding:0 10px;border:0;border-radius:8px;background:transparent;color:inherit;font-weight:inherit;line-height:32px;text-decoration:none}\n.rc-pagebar[data-rc-inline] a{display:inline-block}\n.rc-pagebar[data-rc-inline] :is(button,select,a):hover,.rc-view-picker:hover>select{background:var(--color-neutral-background-hover,var(--rc-surface))}\n.rc-pagebar .rc-view-picker{position:relative;display:flex;align-items:center;height:32px;margin:0}\n.rc-view-picker .rc-icon{position:absolute;pointer-events:none;width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}\n.rc-view-picker .rc-icon-sliders{left:9px}.rc-view-picker .rc-icon-chevron{right:7px}\n.rc-pagebar .rc-view-picker>select{appearance:none;-webkit-appearance:none;field-sizing:content;padding-inline:31px 27px;cursor:pointer}\n.rc-pagebar:not([data-rc-inline]) .rc-view-picker>select{min-height:32px}\n.rc-pagebar label{display:flex;align-items:center;gap:6px}\n.rc-back-top{position:fixed;right:16px;bottom:80px;z-index:20;border:1px solid var(--rc-line);border-radius:6px;padding:7px 10px;min-height:34px;cursor:pointer}\n.rc-back-top[hidden]{display:none}\n/* Right rail handle: mirrors Reddit's left navigation collapse control; the arrow points the way the rail will move. */\n[data-rc-fill]{grid-template-columns:minmax(0,1fr)!important;box-sizing:border-box!important;padding-inline-end:40px!important}\n.rc-rail-handle{position:fixed;z-index:20;display:grid;place-items:center;width:32px;height:32px;padding:0;color:var(--rc-text);background:var(--rc-bg);border:1px solid var(--color-neutral-border-weak,var(--rc-line));border-radius:8px;cursor:pointer;touch-action:manipulation}\n.rc-rail-handle::before{content:\"\";position:absolute;inset:-6px}\n.rc-rail-handle:hover{background:var(--rc-surface)}\n.rc-rail-handle:focus-visible{outline:2px solid var(--rc-blue);outline-offset:2px}\n.rc-rail-handle .rc-icon{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;rotate:90deg}\n.rc-rail-handle[data-rc-open=\"1\"] .rc-icon{rotate:-90deg}\n.rc-popover{position:fixed;z-index:2147483646;inset:12px auto auto 12px;max-width:calc(100vw - 24px);width:350px;max-height:calc(100dvh - 24px);overflow:auto;padding:14px;border:1px solid var(--rc-line);border-radius:7px;box-shadow:0 4px 10px #0003}\n.rc-popover label{display:grid;gap:4px;margin-block:8px}\n.rc-popover h2{font-size:16px;margin:0 0 8px}\n.rc-popover p{margin:8px 0;white-space:pre-wrap}\n.rc-media{position:fixed;inset:0;padding:12px;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:#000c;color:#edf1f3}\n.rc-media-box{max-width:calc(100vw - 24px);max-height:calc(100dvh - 24px);overflow:auto;background:#181c1f;border-radius:8px;padding:12px}\n.rc-media-stage{overflow:auto;max-height:calc(100dvh - 140px);max-width:100%}\n.rc-media img{display:block;max-width:100%;max-height:calc(100dvh - 150px);object-fit:contain}\n.rc-media-toolbar{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px}\n.rc-media button{background:#20272b;color:#edf1f3}\n.rc-error{color:#a51e22}\n@media(prefers-color-scheme:dark){.rc-error{color:#ffaaa6}}\n@media(max-width:600px){[data-rc-layout]{translate:0 0}.rc-pagebar{margin:4px 0}.rc-tools{gap:3px}}\n@media(pointer:coarse){[data-rc-owned] :is(button,input,select){min-height:36px}.rc-tools[data-rc-header-actions] .rc-action-items :is(button,a){min-height:44px}}\n/* Subtle motion: one short exponential ease-out per change, interruptible, and absent under reduced motion. */\n@media(prefers-reduced-motion:no-preference){\n.rc-rail-handle .rc-icon{transition:rotate .18s cubic-bezier(.16,1,.3,1)}\n.rc-tools[data-rc-header-actions] .rc-action-items{transition:opacity .14s cubic-bezier(.16,1,.3,1),translate .14s cubic-bezier(.16,1,.3,1)}\n@starting-style{.rc-tools[data-rc-header-actions] .rc-action-items:popover-open{opacity:0;translate:0 -4px}}\n[data-rc-compact-media-open]>[slot=\"post-media-container\"]{transition:opacity .18s cubic-bezier(.16,1,.3,1),translate .18s cubic-bezier(.16,1,.3,1)}\n@starting-style{[data-rc-compact-media-open]>[slot=\"post-media-container\"]{opacity:0;translate:0 -6px}}\n}\n@media(prefers-reduced-motion:reduce){[data-rc-owned],[data-rc-owned] *{scroll-behavior:auto!important;transition:none!important;animation:none!important}}\n"};
// Original local reading model. Copyright expDARE.
RC.Model=(()=>{
  const PREFIX='exp:v1:thread:';
  const defaults=Object.freeze({enabled:true,siteColors:'off',hideDecorations:false,unblurSpoilers:false,unblurMature:false,updateNotifications:true,gemTheme:false,defaultView:'native',shortcuts:[],defaultSort:'native',rememberSort:false,sortButtons:false,topRange:'day',autoPages:false,autoReplies:false,loadBudget:3,flair:true,awards:'show',highlights:false,recommendations:false,hover:false,author:true,selectText:false,expandText:false,saveVisibility:'native',trackRead:false,trackPosts:false,hideReadPosts:false,markScrolled:false,restoreFeed:false,readingFont:'native',lineHeight:0,paragraphGap:0,density:'compact',parentContext:true,keyboard:false,navButtons:true,scrollTop:true,inlineMedia:true,backgroundClose:true,backgroundNav:false,commentSort:'native',rememberCommentSort:false,commentSortButtons:false,related:false,stickyBar:false,shareContext:false,dimNegative:false,collapsePinned:false,collapseAutoMod:false,commentSave:true,collapseDepth:99,left:true,right:true,wide:false,feedWidth:800,commentWidth:800,offset:0,contentFont:14,uiFont:12,redirect:'off',simplifyProfile:false,historyCapacity:100,retentionDays:30,theme:'native',nicknameMode:'both',nicknameMax:24,keys:{next:'j',previous:'k',open:'o',collapse:'',save:'',hide:'',upvote:'',downvote:''}});
  // Settings without a menu control keep one fixed behaviour; stored values for them are ignored.
  const fixed=Object.freeze({shortcuts:[],defaultSort:'native',sortButtons:false,topRange:'day',autoPages:false,autoReplies:false,loadBudget:3,hover:false,selectText:false,expandText:false,markScrolled:false,restoreFeed:true,density:'compact',parentContext:true,scrollTop:true,inlineMedia:true,backgroundClose:true,backgroundNav:false,commentSort:'native',commentSortButtons:false,stickyBar:false,shareContext:false,dimNegative:false,commentSave:true,left:true,wide:false,offset:0,uiFont:12,simplifyProfile:false,historyCapacity:100,retentionDays:30,nicknameMax:24});
  const enumValues={siteColors:['off','default','indigo','blue','green','red','gray'],readingFont:['native','sans','serif'],defaultView:['native','cards','compact','grid'],defaultSort:['native','best','hot','new','top','rising'],topRange:['hour','day','week','month','year','all'],awards:['show','upvoted','collapse','off'],saveVisibility:['native','always','upvoted','off'],density:['standard','compact','mini'],commentSort:['native','confidence','top','new','controversial','old','qa'],redirect:['off','suggest','redirect'],theme:['native','contrast','thread'],nicknameMode:['profile','nickname','both']};
  const ranges={lineHeight:[0,220],paragraphGap:[0,24],loadBudget:[1,5],collapseDepth:[0,99],feedWidth:[320,1600],commentWidth:[320,1600],offset:[-400,400],contentFont:[12,24],uiFont:[12,18],historyCapacity:[0,500],retentionDays:[1,90],nicknameMax:[4,40]};
  const plain=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
  const text=(v,max=160)=>typeof v==='string'?v.slice(0,max):'';
  const validUser=v=>/^[A-Za-z0-9_-]{1,32}$/.test(v)&&!['deleted','unknown','automoderator'].includes(v.toLowerCase());
  function settings(raw){const out=structuredClone(defaults);if(!plain(raw))return out;for(const k of Object.keys(defaults)){if(typeof defaults[k]==='boolean')out[k]=typeof raw[k]==='boolean'?raw[k]:defaults[k];else if(enumValues[k])out[k]=enumValues[k].includes(raw[k])?raw[k]:defaults[k];else if(ranges[k]){const [lo,hi]=ranges[k];out[k]=Number.isFinite(raw[k])?Math.min(hi,Math.max(lo,Math.round(raw[k]))):defaults[k];}}if(out.lineHeight>0)out.lineHeight=Math.max(100,out.lineHeight);if(raw.defaultView==='list')out.defaultView='compact';return combined(out);}
  // One menu control drives each group, so the grouped keys always agree with the first one.
  function combined(out){Object.assign(out,structuredClone(fixed));out.keys=structuredClone(defaults.keys);out.rememberCommentSort=out.rememberSort;out.keyboard=out.navButtons;out.collapsePinned=out.collapseAutoMod;out.commentWidth=out.feedWidth;out.recommendations=out.related=out.highlights;if(!out.trackPosts)out.hideReadPosts=false;Object.assign(out,out.hideDecorations?{flair:false,awards:'off',author:false,saveVisibility:'off'}:{flair:true,awards:'show',author:true,saveVisibility:'native'});return out;}
  function rules(raw){if(!Array.isArray(raw))return [];return raw.slice(0,100).filter(plain).map((r,i)=>({id:String(i),field:['text','title','domain','community','author','flair'].includes(r.field)?r.field:'text',pattern:text(r.pattern,256),regex:r.regex===true,target:['post','comment','both'].includes(r.target)?r.target:'both',scope:text(r.scope,80).toLowerCase(),except:text(r.except,200).toLowerCase(),treatment:['hide','dim','blur'].includes(r.treatment)?r.treatment:'hide',...(r.exact===true?{exact:true}:{})})).filter(r=>r.pattern);}
  function person(raw){return {tag:text(raw?.tag,40),note:text(raw?.note,4000),nickname:text(raw?.nickname,40),ignore:raw?.ignore===true};}
  function prune(raw,cap,days){if(!Array.isArray(raw)||!cap)return [];const cutoff=Date.now()-days*86400000;return raw.filter(v=>plain(v)&&typeof v.id==='string'&&Number.isFinite(v.at)&&v.at>=cutoff).slice(-cap).map(v=>({id:text(v.id,120),at:v.at,reason:text(v.reason,100)}));}
  function literal(rule,item){const value=String(item[rule.field]||'').toLowerCase(),pattern=rule.pattern.toLowerCase();return rule.exact?value===pattern:value.includes(pattern);}
  function applies(rule,item){const community=String(item.community||'').toLowerCase();return (rule.target==='both'||rule.target===item.kind)&&(!rule.scope||rule.scope.split(',').map(s=>s.trim()).includes(community))&&!rule.except.split(',').map(s=>s.trim()).filter(Boolean).includes(community);}
  function validateImport(raw){if(!plain(raw)||raw.schema!==1||!plain(raw.settings)||!Array.isArray(raw.rules)||!plain(raw.people))throw Error('Expected a schema 1 companion export.');if(raw.library!==undefined&&!Array.isArray(raw.library))throw Error('Expected an array of local bookmarks.');const entries=Object.entries(raw.people);if(entries.length>1000)throw Error('Import exceeds 1,000 people.');if(entries.some(([u,p])=>!validUser(u)||!plain(p)))throw Error('Invalid people records.');if(raw.rules.length>100)throw Error('Import exceeds 100 rules.');return {...(raw.library===undefined?{}:{library:library(raw.library)}),settings:settings(raw.settings),rules:rules(raw.rules),people:Object.fromEntries(entries.map(([u,p])=>[u.toLowerCase(),person(p)]))};}
  function library(raw){
    const entries=new Map();
    for(const item of (Array.isArray(raw)?raw:[]).slice(-1000)){
      if(!plain(item))continue;let url;
      try{url=new URL(item.url);if(url.protocol!=='https:'||url.username||url.password||url.port||!['www.reddit.com','sh.reddit.com','old.reddit.com'].includes(url.hostname)||!/^\/(?:r\/[^/]+\/|user\/[^/]+\/)?comments\/[^/]+(?:\/|$)/.test(url.pathname))continue;}catch{continue;}
      url.hostname='www.reddit.com';url.pathname=url.pathname.replace(/\/?$/,'/');url.search='';url.hash='';
      const parts=url.pathname.split('/'),index=parts.indexOf('comments'),key=(parts[index+1]+':'+(parts[index+3]||'')).toLowerCase();
      entries.set(key,{key,url:url.href,title:text(item.title,300)||'Saved discussion',collection:text(item.collection,40).trim()||'Read later',note:text(item.note,2000),at:Number.isFinite(item.at)?item.at:Date.now()});
    }
    return [...entries.values()].slice(-500);
  }
  function postReads(raw,days){
    const map=new Map();for(const row of prune(Array.isArray(raw)?raw.slice(-2000):[],1000,days))map.set(row.id,{id:row.id,at:row.at});return [...map.values()];
  }
  return {PREFIX,defaults,settings,rules,person,prune,literal,applies,validateImport,validUser,plain,library,postReads};
})();
RC.Store=class {
  constructor(){this.account='guest';this.error='';this.listeners=[];}
  key(name){return RC.Model.PREFIX+this.account+':'+name;}
  get(name,fallback){try {const v=GM_getValue(this.key(name),fallback);return v===undefined?fallback:structuredClone(v);}catch{this.error='Local storage is unavailable. Changes are not saved.';return structuredClone(fallback);}}
  set(name,value){try {GM_setValue(this.key(name),structuredClone(value));return true;}catch{this.error='Local storage is full or unavailable. Export or free space, then retry.';return false;}}
  remove(name){try{GM_deleteValue(this.key(name));}catch{this.error='Could not delete local data.';}}
  people(){const raw=this.get('people',{});return RC.Model.plain(raw)?Object.fromEntries(Object.entries(raw).filter(([user,value])=>RC.Model.validUser(user)&&RC.Model.plain(value)).slice(0,1000).map(([user,value])=>[user.toLowerCase(),RC.Model.person(value)])):{};}
  person(user){return RC.Model.person(this.people()[user.toLowerCase()]);}
  setPerson(user,value){if(!RC.Model.validUser(user))return false;const people=this.people();if(!Object.hasOwn(people,user.toLowerCase())&&Object.keys(people).length>=1000){this.error='People capacity reached (1,000). Export or remove a record.';return false;}const p=RC.Model.person(value);if(!p.tag&&!p.note&&!p.nickname&&!p.ignore)delete people[user.toLowerCase()];else people[user.toLowerCase()]=p;return this.set('people',people);}
  listen(fn){this.unlisten();if(typeof GM_addValueChangeListener==='function')for(const n of ['settings','rules','people','history','visits','sorts','collapse','library','postReads','feedPositions']){const id=GM_addValueChangeListener(this.key(n),(_k,_old,_new,remote)=>{if(remote)fn(n);});this.listeners.push(id);}}
  unlisten(){if(typeof GM_removeValueChangeListener==='function')this.listeners.forEach(id=>GM_removeValueChangeListener(id));this.listeners=[];}
  reset(){for(const name of ['settings','rules','people','history','visits','sorts','collapse','library','postReads','feedPositions'])this.remove(name);}
};

// Each batch has its own disposable worker and wall-clock deadline. No arbitrary regex runs in the UI thread.
RC.Regex=class {
  constructor(){this.pending=new Set();}
  evaluate(pattern,texts,timeout=90){
    if(pattern.length>256||texts.length>250)return Promise.resolve({error:'Regex batch exceeds limits.'});
    return new Promise(resolve=>{
      let worker,url,timer,done=false;
      const finish=value=>{if(done)return;done=true;clearTimeout(timer);worker?.terminate();if(url)URL.revokeObjectURL(url);this.pending.delete(cancel);resolve(value);};
      const cancel=()=>finish({error:'Regex cancelled.'});this.pending.add(cancel);
      try{
        url=URL.createObjectURL(new Blob(['onmessage=e=>{try{const r=new RegExp(e.data.pattern,"iu");postMessage({matches:e.data.texts.map(t=>r.test(t))});}catch{postMessage({error:"Invalid regex. Edit or remove this rule."});}}'],{type:'text/javascript'}));
        worker=new Worker(url);timer=setTimeout(()=>finish({error:'Regex exceeded its time limit. Simplify or remove this rule.'}),timeout);
        worker.onmessage=e=>finish(e.data);worker.onerror=()=>finish({error:'Regex worker unavailable (browser policy). Literal rules still work.'});
        worker.postMessage({pattern,texts:texts.map(t=>String(t).slice(0,4000))});
      }catch{finish({error:'Regex isolation unavailable. Literal rules still work.'});}
    });
  }
  dispose(){[...this.pending].forEach(cancel=>cancel());}
};

// Modern Reddit adapter: native light DOM and accessible open shadow controls only.
// Native header identity and feed wrappers checked against the current desktop DOM.
RC.Adapter=(()=>{
  const selector='shreddit-post,shreddit-comment';
  const owned=n=>!!n?.closest?.('[data-rc-owned],#exp-thread-root');
  function nodes(root=document,query=selector){return [...root.querySelectorAll(query)].filter(n=>!owned(n));}
  function own(node,query){return [...node.querySelectorAll(query)].filter(n=>!owned(n)&&n.closest(selector)===node);}
  function visible(n){const r=n.getBoundingClientRect();return !!n.getClientRects().length&&r.bottom>0&&r.top<innerHeight&&getComputedStyle(n).visibility!=='hidden';}
  function nearby(n){const r=n.getBoundingClientRect();return n.isConnected&&r.bottom> -1800&&r.top<innerHeight+1800;}
  function link(raw){try{const u=new URL(raw,location.href);return u.protocol==='https:'&&['www.reddit.com','sh.reddit.com','old.reddit.com'].includes(u.hostname)?u:null;}catch{return null;}}
  function account(){
    const app=document.querySelector('shreddit-app');
    const values=[app?.getAttribute('user-name'),app?.getAttribute('username')];
    for(const component of document.querySelectorAll('achievements-entrypoint[username],after-login-toast-dispatcher[username]'))if(!owned(component)&&!component.closest(selector))values.push(component.getAttribute('username'));
    for(const anchor of document.querySelectorAll('header a[href], [data-testid="user-menu"] a[href]')){
      if(owned(anchor)||anchor.closest(selector))continue;
      const url=link(anchor.getAttribute('href'));
      const match=url?.pathname.match(/^\/user\/([^/]+)\/?$/);
      if(match)values.push(match[1]);
    }
    const names=[...new Set(values.filter(v=>RC.Model.validUser(v||'')&&!['me','undefined','null'].includes(v.toLowerCase())).map(v=>v.toLowerCase()))];
    if(names.length===1)return names[0];
    if(names.length>1)return null;
    const header=document.querySelector('header')||document;
    if([...header.querySelectorAll('a[href]')].some(a=>!owned(a)&&!a.closest(selector)&&link(a.getAttribute('href'))?.pathname==='/login'))return 'guest';
    return null;
  }
  function item(node){
    const kind=node.localName==='shreddit-comment'?'comment':'post';
    const attr=(...names)=>names.map(n=>node.getAttribute(n)).find(Boolean)||'';
    const author=attr('author')||own(node,'a[href*="/user/"]')[0]?.getAttribute('href')?.split('/user/')[1]?.split('/')[0]||'';
    const href=attr('permalink','content-href')||own(node,'a[href*="/comments/"]')[0]?.getAttribute('href')||'';
    const url=link(href);
    const blocks=own(node,'[slot="comment"],[slot="text-body"],[slot="title"],h1,h2,h3,p');
    // Slot containers already include their paragraphs; reading both repeats the parent preview.
    const copy=blocks.filter(n=>!blocks.some(parent=>parent!==n&&parent.contains(n))).map(n=>n.textContent.replace(/\s+/g,' ').trim()).join('\n\n').slice(0,4000);
    const community=attr('subreddit-prefixed-name','subreddit-name').replace(/^r\//,'')||location.pathname.match(/^\/r\/([^/]+)/)?.[1]||'';
    const outbound=own(node,'a[href]') .map(a=>{try{return new URL(a.href);}catch{return null;}}).find(u=>u&&u.protocol==='https:'&&!u.hostname.endsWith('reddit.com'));
    return {node,kind,id:attr('thingid','thing-id','id')||url?.pathname||'',author:author==='[deleted]'?'[deleted]':author||'[unknown]',community,text:copy,title:attr('post-title')||own(node,'[slot="title"],h1,h2,h3')[0]?.textContent||'',domain:outbound?.hostname||'',flair:own(node,'[slot="post-flair"],[data-testid="post-flair"]')[0]?.textContent||'',url:url?.href||'',parent:attr('parentid','parent-id'),depth:Math.min(99,Math.max(0,Number(attr('depth'))||0)),score:Number(attr('score'))||0,op:node.hasAttribute('is-op'),mod:attr('distinguished')==='moderator',pinned:node.hasAttribute('stickied')||node.hasAttribute('is-stickied'),gated:node.hasAttribute('spoiler')||node.hasAttribute('nsfw')||node.hasAttribute('is-nsfw')};
  }
  function controls(root){const result=[];const walk=(r,depth)=>{if(depth>3)return;for(const n of r.querySelectorAll('button,a,[role="button"]'))if(!owned(n))result.push(n);for(const n of [...r.querySelectorAll('*')].slice(0,800))if(n.shadowRoot)walk(n.shadowRoot,depth+1);};walk(root,0);return result;}
  function action(item,name){
    const labels={save:['save','save comment','save post','unsave','unsave comment','unsave post'],upvote:['upvote'],downvote:['downvote'],collapse:['collapse comment','expand comment']};
    const names=labels[name]||[];
    return controls(item.node).find(n=>{const label=(n.getAttribute('aria-label')||n.textContent||'').trim().toLowerCase();let owner=n.closest(selector),root=n.getRootNode();for(let depth=0;!owner&&root?.host&&depth<4;depth++){owner=root.host.closest(selector);root=root.host.getRootNode();}return names.includes(label)&&!n.disabled&&owner===item.node;});
  }
  function loadControls(kind){
    // Never traverse hidden/native menus, guess API endpoints, or recursively crawl.
    const candidates=[...document.querySelectorAll(kind==='post'?'button[slot="load-more"],button[data-testid="load-more-posts"],faceplate-partial[slot="load-more"] button':'shreddit-comment-tree button,shreddit-comment button')].filter(n=>!owned(n)&&visible(n)&&!n.disabled);
    return candidates.filter(n=>kind==='post'?/^(load more|view more posts|load more posts)$/i.test((n.getAttribute('aria-label')||n.textContent).trim()):/^(view|load|show) (\d+ )?more (replies|comments)$/i.test((n.getAttribute('aria-label')||n.textContent).trim()));
  }
  function sortLinks(comment=false){return [...document.querySelectorAll('a[href]')].filter(n=>!owned(n)).map(a=>({a,u:link(a.getAttribute('href'))})).filter(({u})=>u&&(comment?u.searchParams.has('sort')&&u.pathname.includes('/comments/'):!u.pathname.includes('/comments/')&&/\/(best|hot|new|top|rising)\/?$/.test(u.pathname)));}
  function sortUrl(sort,comment,range){const match=sortLinks(comment).find(({u})=>comment?u.searchParams.get('sort')===sort:u.pathname.replace(/\/$/,'').endsWith('/'+sort));if(!match)return null;const u=new URL(match.u);if(sort==='top'&&!comment)u.searchParams.set('t',range);return u;}
  function media(item){
    if(item.gated||item.node.querySelector('shreddit-blurred-container,[data-testid="nsfw-gate"],[data-testid="spoiler-gate"]'))return [];
    const source=n=>{try{const u=new URL(n.currentSrc||n.getAttribute('src')||n.getAttribute('data-lazy-src'));return u.protocol==='https:'&&['i.redd.it','preview.redd.it'].includes(u.hostname)?{src:u.href,alt:n.alt||'Post image'}:null;}catch{return null;}};
    const galleries=own(item.node,'gallery-carousel');
    if(galleries.length){
      // A slide includes a decorative backdrop, a preview and a lightbox original.
      // Preserve slide order and do not mix feed thumbnails into the gallery.
      return galleries.flatMap(g=>[...g.querySelectorAll('ul > li')].flatMap(slide=>{
        const candidates=[...slide.querySelectorAll('zoomable-img img,figure img')].map(source).filter(Boolean);
        const image=candidates.find(i=>new URL(i.src).hostname==='i.redd.it')||candidates[0];
        return image?[image]:[];
      })).slice(0,20);
    }
    const images=new Map();
    for(const n of own(item.node,'img')){
      if(n.closest('button,a[href*="/user/"],[slot="author"],[slot="commentAvatar"],[data-testid*="avatar"]')||n.hasAttribute('hidden'))continue;
      try{const u=new URL(n.currentSrc||n.src);if(u.protocol!=='https:'||!['i.redd.it','preview.redd.it'].includes(u.hostname))continue;
        // Reddit renders several preview sizes plus an original for the same asset.
        const key=u.pathname.split('/').pop().replace(/^.*-v\d+-/,'').replace(/\.[^.]+$/,'');
        if(key&&(!images.has(key)||u.hostname==='i.redd.it'))images.set(key,{src:u.href,alt:n.alt||'Post image'});
      }catch{}
    }
    return [...images.values()].slice(0,20);
  }
  return {selector,nodes,own,owned,visible,nearby,link,account,item,action,controls,loadControls,sortLinks,sortUrl,media};
})();

RC.Runtime=class {
  constructor(store){
    this.store=store;this.regex=new RC.Regex();this.items=new Map();this.revealed=new Set();this.manual=new Map();this.readTimers=new Map();this.regexErrors=new Map();this.collapsed=new Set();this.loadSeen=new WeakSet();this.loadCounts={post:0,comment:0};this.selected='';this.scope='all';this.route='';this.epoch=0;this.timer=0;this.destroyed=false;this.overlay=null;this.bar=null;this.account=null;this.verified=false;this.routeObserver=null;this.resize=()=>{this.layout();for(const record of this.items.values())this.positionHeaderMenu(record);};
    this.scroll=()=>{this.captureFeedAnchor();this.schedule();};this.key=e=>this.onKey(e);this.dismissMenus=e=>this.dismissHeaderMenus(e);this.click=e=>{this.dismissHeaderMenus(e);this.onClick(e);};
    this.style=document.createElement('style');this.style.dataset.rcOwned='style';this.style.textContent=RC.CSS;document.head.append(this.style);
    this.readObserver=new IntersectionObserver(entries=>this.observeRead(entries),{threshold:[0,.6]});
    this.observer=new MutationObserver(records=>{if(records.some(r=>!RC.Adapter.owned(r.target)&&((r.type==='attributes'&&(r.attributeName!=='href'||r.target.closest('header,[data-testid="user-menu"]')))||[...r.addedNodes,...r.removedNodes].some(n=>n.nodeType===1&&!RC.Adapter.owned(n)&&!n.hasAttribute('data-rc-owned')))))this.schedule();});
    this.observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['author','score','user-name','username','href','permalink','thingid','is-op','distinguished','spoiler','nsfw','comment-count','src','srcset','data-lazy-src','data-lazy-srcset','hidden']});
    addEventListener('scroll',this.scroll,{passive:true});addEventListener('resize',this.resize,{passive:true});document.addEventListener('keydown',this.key);document.addEventListener('click',this.click);document.addEventListener('pointerdown',this.dismissMenus,true);
    this.routeObserver=ExtraPotionsCore.observeNavigation(()=>this.schedule());
    this.schedule();
  }
  notify(text){this.message=text;this.ui?.status(text);}
  refreshSettings(){this.settings=RC.Model.settings(this.store.get('settings',{}));this.rules=RC.Model.rules(this.store.get('rules',[]));this.history=RC.Model.prune(this.store.get('history',[]),this.settings.historyCapacity,this.settings.retentionDays);this.visits=this.cleanVisits(this.store.get('visits',{}));this.people=this.store.people();this.readingState();}
  cleanVisits(raw){if(!RC.Model.plain(raw))return {};return Object.fromEntries(Object.entries(raw).filter(([k,v])=>k.length<160&&RC.Model.plain(v)&&Number.isFinite(v.at)&&v.at>Date.now()-(this.settings?.retentionDays||30)*86400000).sort((a,b)=>b[1].at-a[1].at).slice(0,100).map(([k,v])=>[k,{at:v.at,read:Array.isArray(v.read)?v.read.filter(id=>typeof id==='string').slice(-500):[],count:Number.isFinite(v.count)?Math.max(0,v.count):0,last:typeof v.last==='string'?v.last.slice(0,120):''}]));}
  accountCheck(){const next=RC.Adapter.account();if(next===this.account&&this.initialized)return false;this.clearRoute();this.postReadUndo=null;this.libraryUndo=null;this.route='';this.initialized=true;this.account=next;this.verified=!!next;this.store.unlisten();this.store.account=next||'unverified';this.refreshSettings();if(!next){this.people={};this.rules=[];this.visits={};this.history=[];}
    this.store.listen(()=>{this.closeOverlay();this.refreshSettings();if(!this.verified){this.people={};this.rules=[];this.visits={};this.history=[];}this.epoch++;this.schedule();this.ui?.refresh();});return true;
  }
  schedule(){if(this.timer||this.destroyed)return;this.timer=setTimeout(()=>{this.timer=0;this.scan().catch(()=>this.notify('Page adaptation paused after an error. Reload or disable companion.'));},160);}
  async scan(){
    if(this.destroyed)return;const changed=this.accountCheck();const route=location.pathname+location.search;
    if(this.route!==route){this.clearRoute();this.route=route;this.loadCounts={post:0,comment:0};this.loadSeen=new WeakSet();this.viewOverride=null;this.refreshSettings();if(!this.verified){this.people={};this.rules=[];this.visits={};}this.previousVisit=this.visits[this.threadKey()]||null;if(this.settings.trackRead&&this.verified&&location.pathname.includes('/comments/')){const old=this.previousVisit||{read:[],last:'',count:0};this.visits[this.threadKey()]={...old,at:Date.now(),count:this.nativeCommentCount()??old.count};this.store.set('visits',this.visits);}this.sortDefault();}
    if(changed)this.ui?.refresh();if(location.hostname==='old.reddit.com')return;
    const epoch=++this.epoch;
    if(!this.settings.enabled||ExtraPotionsCore.suiteSitePaused()){this.siteColors?.clear();this.clearNodes();this.bar?.remove();this.bar=null;this.topButton?.remove();this.topButton=null;this.railHandle?.remove();this.railHandle=null;this.closeOverlay();return;}
    this.pageBar();this.layout();
    const all=RC.Adapter.nodes().slice(0,2000),readHidden=this.filterReadPosts(all);const nodes=all.filter(n=>!readHidden.has(n)&&RC.Adapter.nearby(n)).slice(0,250);const keep=new Set(nodes);
    for(const [node,record]of this.items)if(!keep.has(node))this.release(node,record);
    for(const node of readHidden)this.attr(node,'data-rc-post-read-hidden','1');
    const batch=nodes.map(RC.Adapter.item).filter(item=>item.id);
    const regexResults=new Map();this.regexErrors.clear();
    for(const rule of this.rules.filter(r=>r.regex)){
      const result=await this.regex.evaluate(rule.pattern,batch.map(item=>RC.Model.applies(rule,item)?item[rule.field]||'':''));
      if(epoch!==this.epoch||this.destroyed)return;
      if(result.error)this.regexErrors.set(rule.id,result.error);else regexResults.set(rule.id,result.matches);
    }
    if(epoch!==this.epoch||this.destroyed)return;
    const rawCollapse=this.store.get('collapse',{});const collapseMemory=RC.Model.plain(rawCollapse)?rawCollapse:{};this.currentRead=new Set(this.visits[this.threadKey()]?.read||[]);
    for(let i=0;i<batch.length;i++){
      const item=batch[i],node=item.node;
      let record=this.items.get(node);if(!record){record={item,tools:null,signature:''};this.items.set(node,record);this.readObserver.observe(node);}record.item=item;
      const person=this.people[item.author.toLowerCase()]||{};
      const rule=this.rules.find(r=>RC.Model.applies(r,item)&&(r.regex?regexResults.get(r.id)?.[i]:RC.Model.literal(r,item)));
      const treatment=this.manual.get(item.id)||(person.ignore?'hide':rule?.treatment);const reason=this.manual.has(item.id)?'Hidden manually':person.ignore?'Local ignore':rule?'Filter: '+rule.pattern:'';
      this.attr(node,'data-rc-treatment',treatment&&!this.revealed.has(item.id)?treatment:null);
      const shouldCollapse=this.collapsed.has(item.id)||(Array.isArray(collapseMemory[this.threadKey()])?collapseMemory[this.threadKey()]:[]).includes(item.id)||(item.kind==='comment'&&(item.depth>this.settings.collapseDepth||this.settings.collapsePinned&&item.pinned||this.settings.collapseAutoMod&&item.author.toLowerCase()==='automoderator'));
      this.attr(node,'data-rc-collapsed',shouldCollapse&&!this.revealed.has('collapse:'+item.id)?'1':null);
      this.attr(node,'data-rc-density',this.settings.density==='standard'?null:this.settings.density);
      this.attr(node,'data-rc-font','1');node.style.setProperty('--rc-content-font',this.settings.contentFont+'px');
      this.attr(node,'data-rc-read',this.settings.trackRead&&this.currentRead.has(item.id)?'1':null);
      for(const [name,on]of Object.entries({select:this.settings.selectText,expand:this.settings.expandText,hover:this.settings.hover,'hide-author':!this.settings.author,'hide-flair':!this.settings.flair,'hide-awards':this.settings.awards==='off'||this.settings.awards==='upvoted'&&node.getAttribute('vote-state')!=='UP','awards-collapsed':this.settings.awards==='collapse','hide-save':item.kind==='comment'?!this.settings.commentSave:this.settings.saveVisibility==='off'||this.settings.saveVisibility==='upvoted'&&node.getAttribute('vote-state')!=='UP'}))this.attr(node,'data-rc-'+name,on?'1':null);
      this.attr(node,'data-rc-negative',item.kind==='comment'&&this.settings.dimNegative&&item.score<0?'1':null);
      const signature=JSON.stringify([reason,treatment,this.revealed.has(item.id),shouldCollapse,this.revealed.has('collapse:'+item.id),person,this.settings.parentContext,this.settings.inlineMedia,this.settings.inlineMedia&&RC.Adapter.media(item).length>0,this.settings.nicknameMode,this.settings.nicknameMax,this.settings.trackRead,this.currentRead.has(item.id),this.settings.commentSave,this.settings.saveVisibility,this.isSaved(item),this.settings.trackPosts,this.postIsRead(item.id)]);
      if(signature!==record.signature){record.signature=signature;this.tools(record,reason,treatment,shouldCollapse,person);}
      if(treatment&&!this.revealed.has(item.id)&&this.verified&&item.kind==='post')this.recordHidden(item,reason);
    }
    this.contentView();this.readingPass();this.unblur();this.pruneTransient();
    if(this.regexErrors.size)this.notify([...this.regexErrors.values()][0]);
    ExtraPotionsCore.publishSuiteState('thread','thread.state-changed',{active:true,loaded:this.items.size});
  }
  attr(n,k,v){if(v===null){if(n.hasAttribute(k))n.removeAttribute(k);}else if(n.getAttribute(k)!==v)n.setAttribute(k,v);}
  nativeCommentCount(){const raw=document.querySelector('shreddit-post[comment-count]')?.getAttribute('comment-count');return raw!==null&&raw!==undefined&&Number.isFinite(Number(raw))?Math.max(0,Number(raw)):null;}
  threadKey(){return location.pathname.match(/\/comments\/[^/]+/)?.[0]||location.pathname.slice(0,120);}
  recordHidden(item,reason){if(!this.settings.historyCapacity)return;if(this.history.some(v=>v.id===item.id))return;this.history=RC.Model.prune([...this.history,{id:item.id,at:Date.now(),reason}],this.settings.historyCapacity,this.settings.retentionDays);this.store.set('history',this.history);}
  tools(record,reason,treatment,collapsed,person){
    const {item}=record;const previous=record.tools;const focused=previous?.contains(document.activeElement)?document.activeElement?.textContent:null;
    const bar=RC.el('div',{class:'rc-tools','data-rc-owned':'tools'});bar.style.setProperty('--rc-ui-font',this.settings.uiFont+'px');
    this.guardToolEvents(bar);
    const button=(label,fn)=>{const b=RC.button(label,fn);bar.append(b);return b;};
    if(treatment){bar.append(RC.el('small',{},this.revealed.has(item.id)?'Revealed · '+reason:reason));button(this.revealed.has(item.id)?'Apply treatment':'Reveal',()=>{if(this.revealed.has(item.id))this.revealed.delete(item.id);else this.revealed.add(item.id);this.schedule();});}
    if(collapsed)button('Reveal collapsed content',()=>{this.revealed.add('collapse:'+item.id);this.collapsed.delete(item.id);this.saveCollapse(item.id,false);this.schedule();});
    if(RC.Model.validUser(item.author))button(person.tag?'Tag: '+person.tag:'Tag / note',()=>this.editPerson(item));
    if(person.nickname&&this.settings.nicknameMode!=='profile')bar.append(RC.el('small',{},(this.settings.nicknameMode==='both'?item.author+' · ':'')+person.nickname.slice(0,this.settings.nicknameMax)));
    if(person.note)button('Read private note',()=>this.popover('Private note',RC.el('p',{},person.note)));
    if(this.settings.trackRead&&item.kind==='comment')bar.append(RC.el('small',{},this.currentRead?.has(item.id)?'Read':'Unread · loaded'));
    if(item.kind==='comment'&&this.settings.parentContext){const b=button('Parent context',()=>this.parent(item,true));b.addEventListener('focus',()=>{if(!this.overlay&&!this.suppressContext)this.parent(item,false);});b.addEventListener('mouseenter',()=>{clearTimeout(record.hoverTimer);if(!this.overlay)record.hoverTimer=setTimeout(()=>{if(b.isConnected&&!this.overlay)this.parent(item,false);},350);});b.addEventListener('mouseleave',()=>clearTimeout(record.hoverTimer));}
    button(collapsed?'Keep collapsed':'Collapse locally',()=>{this.collapsed.add(item.id);this.revealed.delete('collapse:'+item.id);this.saveCollapse(item.id,true);this.schedule();});
    if(this.verified&&this.savedItem(item))button(this.isSaved(item)?'Edit local bookmark':'Save to collection',()=>this.saveToCollection(item));
    if(item.kind==='post'&&this.settings.trackPosts&&this.verified)button(this.postIsRead(item.id)?'Mark unread':'Mark read',()=>this.markPostRead(item,!this.postIsRead(item.id)));
    if(item.kind==='comment')button('Collapse / expand loaded replies',()=>this.foldReplies(item));
    button('Hide locally',()=>{this.manual.set(item.id,'hide');this.revealed.delete(item.id);this.schedule();});
    if((item.kind==='comment'&&this.settings.commentSave)||(item.kind==='post'&&this.settings.saveVisibility==='always'))button('Reddit Save',()=>this.native(item,'save'));
    if(item.kind==='post'&&item.community&&this.verified)button('Filter r/'+item.community,()=>this.communityFilter(item.community));
    if(this.settings.inlineMedia&&!item.node.hasAttribute('data-rc-collapsed')&&!['hide','blur'].includes(item.node.getAttribute('data-rc-treatment'))&&RC.Adapter.media(item).length)button('View media',()=>this.media(item));
    if(previous)previous.replaceWith(bar);else item.node.prepend(bar);record.tools=bar;
    if(focused==='Thread actions')record.compactSummaryFocus=true;
    if(focused)[...bar.querySelectorAll('button')].find(b=>b.textContent===focused)?.focus();
  }
  // One exact community rule per community; the feed list and the post menu edit the same rule.
  communityFilter(name){
    const rule=this.rules.find(r=>r.exact&&r.field==='community'&&r.pattern.toLowerCase()===name.toLowerCase()),panel=RC.el('div',{class:'rc-reading-controls'});
    for(const treatment of ['hide','dim','blur'])panel.append(RC.button((rule?.treatment===treatment?'Keep ':'')+treatment[0].toUpperCase()+treatment.slice(1)+' r/'+name,()=>{this.setCommunityFilter(name,treatment);this.closeOverlay();}));
    if(rule)panel.append(RC.button('Stop filtering r/'+name,()=>{this.setCommunityFilter(name,null);this.closeOverlay();}));
    this.popover('Filter r/'+name,panel);
  }
  setCommunityFilter(name,treatment){
    if(!this.verified)return this.notify('Account identity is unverified; private rules are paused.');
    const others=this.rules.filter(r=>!(r.exact&&r.field==='community'&&r.pattern.toLowerCase()===name.toLowerCase()));
    if(treatment&&others.length>=100)return this.notify('Rule capacity reached (100). Remove a rule first.');
    this.rules=RC.Model.rules(treatment?[...others,{field:'community',pattern:name,target:'post',treatment,exact:true}]:others);this.store.set('rules',this.rules);this.schedule();this.ui?.refresh();
  }
  // Reddit's own reveal control, pressed once per blur: spoilers always; mature media only for a recognized account,
  // where Reddit has already delivered it. Signed-out age gates are left alone.
  unblur(){
    const s=this.settings;if(!s.unblurSpoilers&&!s.unblurMature)return;this.unblurred??=new WeakSet();
    for(const {item} of this.items.values()){if(item.kind!=='post')continue;for(const blur of item.node.querySelectorAll('shreddit-blurred-container[blurred]')){
      if(this.unblurred.has(blur))continue;const reason=blur.getAttribute('reason');
      if(!(reason==='spoiler'&&s.unblurSpoilers||reason==='nsfw'&&s.unblurMature&&this.verified&&this.account!=='guest'))continue;
      const reveal=blur.shadowRoot?.querySelector('.overlay button');if(!reveal)continue;this.unblurred.add(blur);reveal.click();
    }}
  }
  saveCollapse(id,on){if(!this.verified)return;const raw=this.store.get('collapse',{});const entries=RC.Model.plain(raw)?Object.entries(raw).slice(-99):[];const data=Object.fromEntries(entries);const ids=new Set(Array.isArray(data[this.threadKey()])?data[this.threadKey()]:[]);on?ids.add(id):ids.delete(id);data[this.threadKey()]=[...ids].slice(-500);this.store.set('collapse',data);}
  native(item,action){const n=RC.Adapter.action(item,action);if(!n)return this.notify('Native '+action+' control unavailable. Use Reddit’s own menu.');n.click();}
  observeRead(entries){this.observePostReads(entries);for(const e of entries){const node=e.target,record=this.items.get(node);if(!record)continue;clearTimeout(this.readTimers.get(node));this.readTimers.delete(node);if(!this.settings?.enabled||!this.settings.trackRead||!this.verified||this.overlay||document.visibilityState!=='visible'||e.intersectionRatio<.6||node.hasAttribute('data-rc-treatment')||node.hasAttribute('data-rc-collapsed')||record.item.kind!=='comment')continue;const generation=this.readGeneration;this.readTimers.set(node,setTimeout(()=>{this.readTimers.delete(node);if(this.destroyed||!node.isConnected||this.readGeneration!==generation||this.overlay||!RC.Adapter.visible(node)||document.visibilityState!=='visible')return;const key=this.threadKey(),visits=this.cleanVisits(this.store.get('visits',{}));const visit=visits[key]||{at:Date.now(),read:[],count:0,last:''};const ids=new Set(visit.read);ids.add(record.item.id);const nativeCount=this.nativeCommentCount();visits[key]={at:Date.now(),read:[...ids].slice(-500),count:Number.isFinite(nativeCount)?Math.max(0,nativeCount):visit.count,last:record.item.id};this.visits=this.cleanVisits(visits);this.store.set('visits',this.visits);this.attr(node,'data-rc-read','1');},1200));}}
  pageBar(){const main=document.querySelector('main');if(!main)return;if(!this.bar)this.bar=RC.el('div',{'data-rc-owned':'pagebar',class:'rc-pagebar'});const comment=location.pathname.includes('/comments/');this.bar.dataset.rcPageType=comment?'comments':'feed';
    // Feed controls join Reddit's sort row so the feed starts where it natively does; other pages keep the strip.
    const sortLoader=!comment&&main.querySelector('shreddit-async-loader[bundlename="shreddit_sort_dropdown"]'),row=sortLoader?.parentElement;
    if(row){if(this.bar.previousElementSibling!==sortLoader)sortLoader.after(this.bar);}else if(main.firstElementChild!==this.bar)main.prepend(this.bar);
    for(const n of document.querySelectorAll('[data-rc-sort-row]'))if(n!==row)n.removeAttribute('data-rc-sort-row');if(row)this.attr(row,'data-rc-sort-row','1');this.attr(this.bar,'data-rc-inline',row?'1':null);const state=JSON.stringify([this.settings,comment,this.verified,this.viewOverride,this.nativeCommentCount(),this.visits[this.threadKey()]?.last,this.library.length,this.postReads.length,this.postReadUndo?.id]);if(this.barState===state)return;this.barState=state;const focused=this.bar.contains(document.activeElement)?document.activeElement.getAttribute('aria-label'):null;this.bar.replaceChildren();
    const button=(label,fn)=>this.bar.append(RC.button(label,fn));
    if(!comment){const label=RC.el('label',{class:'rc-view-picker'});label.append(RC.icon('sliders'),RC.select('Content view',this.viewOverride||this.settings.defaultView,[['native','Native'],['cards','Cards'],['compact','Compact Cards'],['grid','Grid']],v=>{this.viewOverride=null;this.viewFade=true;this.update({defaultView:v});}),RC.icon('chevron'));this.bar.append(label);}if(comment&&this.settings.navButtons){if(this.scope==='unread'&&(!this.settings.trackRead||!this.verified))this.scope='all';button('Previous comment',()=>this.navigate(-1));button('Next comment',()=>this.navigate(1));const select=RC.select('Jump between loaded comments',this.scope,[['all','All comments'],['op','OP comments'],['moderator','Moderator comments'],['tagged','Tagged authors'],['unread','Unread comments']],v=>{this.scope=v;});select.title='Jump targets only. Comments stay visible; unloaded replies are not searched.';select.querySelector('[value="unread"]').disabled=!this.settings.trackRead||!this.verified;this.bar.append(select);}
    if(this.verified)button('Local collections',()=>this.collections());
    if(!comment&&this.settings.trackPosts&&this.verified){button(this.settings.hideReadPosts?'Show read posts':'Hide read posts',()=>this.update({hideReadPosts:!this.settings.hideReadPosts}));if(this.postReadUndo?.account===this.account)button('Undo read change',()=>this.undoPostRead());}
    if(comment&&this.settings.navButtons){button('Next top-level thread',()=>this.navigateThread('roots'));button('Next sibling comment',()=>this.navigateThread('siblings'));}
    if(comment)button('Search loaded comments',()=>this.searchLoadedComments());
    if(comment){button('Collapse depth',()=>{const panel=RC.el('div');panel.append(RC.select('Collapse after depth',String(this.settings.collapseDepth),['0','1','2','3','99'],v=>this.update({collapseDepth:Number(v)})));this.popover('Loaded comment depth',panel);});const visit=this.visits[this.threadKey()];if(visit?.last)button('Resume loaded comment',()=>{const r=[...this.items.values()].find(r=>r.item.id===visit.last);r?this.focusItem(r.item):this.notify('Resume comment is not loaded. Use native context or load more replies.');});if(this.previousVisit){const count=this.nativeCommentCount();if(Number.isFinite(count))this.bar.append(RC.el('small',{},Math.max(0,count-this.previousVisit.count)+' new comments · count estimate'));}}
    if(location.hostname==='old.reddit.com'&&this.settings.redirect==='suggest'){const u=new URL(location.href);u.hostname='www.reddit.com';this.bar.append(RC.el('a',{href:u.href},'Open modern Reddit'));}
    if(focused)[...this.bar.querySelectorAll('[aria-label]')].find(n=>n.getAttribute('aria-label')===focused)?.focus({preventScroll:true});
  }
  sortKey(comment){return (comment?'comment:':'feed:')+(location.pathname.match(/^\/r\/([^/]+)/)?.[1]||location.pathname.replace(/\/(best|hot|new|top|rising)\/?$/,'')).slice(0,120);}
  sortDefault(){if(!this.settings.enabled)return;if(location.hostname==='old.reddit.com'){if(this.settings.redirect==='redirect'){const u=new URL(location.href);u.hostname='www.reddit.com';location.replace(u.href);}return;}
    const comment=location.pathname.includes('/comments/');if(comment?new URL(location.href).searchParams.has('sort'):/\/(best|hot|new|top|rising)\/?$/.test(location.pathname))return;
    const sort=(this.verified&&(comment?this.settings.rememberCommentSort:this.settings.rememberSort)?this.store.get('sorts',{})?.[this.sortKey(comment)]:null)||(comment?this.settings.commentSort:this.settings.defaultSort);if(sort==='native'||!sort)return;const url=RC.Adapter.sortUrl(sort,comment,this.settings.topRange);if(url&&url.href!==location.href)location.replace(url.href);
  }
  layout(){if(!this.settings?.enabled)return;const s=this.settings;this.applySiteColors();for(const n of document.querySelectorAll('#right-sidebar-container')){this.attr(n,'data-rc-sidebar-hidden',s.right?null:'1');if(n.parentElement?.matches('.main-container'))this.attr(n.parentElement,'data-rc-fill',s.right?null:'1');}this.sidebarHandle();
    const header=document.querySelector('header');const top=header?Math.max(0,Math.min(160,header.getBoundingClientRect().bottom)):0;if(this.bar)this.bar.style.setProperty('--rc-sticky-top',top+'px');
    if(s.scrollTop){if(!this.topButton){this.topButton=RC.button('Top',()=>scrollTo({top:0,behavior:'instant'}));this.topButton.className='rc-back-top';this.topButton.dataset.rcOwned='back-top';this.topButton.setAttribute('aria-label','Back to top');document.body.append(this.topButton);}this.topButton.hidden=scrollY<300;}else{this.topButton?.remove();this.topButton=null;}
    const main=document.querySelector('main');if(main){this.attr(main,'data-rc-layout',s.wide||s.feedWidth!==800||s.commentWidth!==800||s.offset?'1':null);const width=s.wide?Math.max(320,innerWidth-32):(location.pathname.includes('/comments/')?s.commentWidth:s.feedWidth);main.style.setProperty('--rc-width',width+'px');main.style.setProperty('--rc-offset',Math.max(-Math.max(0,(innerWidth-width-32)/2),Math.min(s.offset,Math.max(0,(innerWidth-width-32)/2)))+'px');}
    const groups=[['shreddit-community-highlights',s.highlights],['[data-testid="recommendations"]',s.recommendations],['[data-testid="related-posts"]',s.related],['shreddit-post-sticky-header',s.stickyBar]];
    for(const [query,hidden]of groups)for(const n of document.querySelectorAll(query))this.attr(n,'data-rc-secondary-hidden',hidden?'1':null);
    for(const n of document.querySelectorAll('[data-testid="profile-menu"]'))this.attr(n,'data-rc-profile-simple',s.simplifyProfile?'1':null);
  }
  // Site colors recolor Reddit through its own colour variables, which reach inside post components. Reddit redeclares
  // them on its theme containers, so the override covers those too. Brand, vote and status colours stay native.
  applySiteColors(){
    this.siteColors??=ExtraPotionsCore.createSiteColors({product:'thread',mode:()=>document.documentElement.classList.contains('theme-dark')?'dark':'light',
      watch:render=>{const observer=new MutationObserver(render);observer.observe(document.documentElement,{attributes:true,attributeFilter:['class']});return ()=>observer.disconnect();},css:RC.siteColorCss});
    this.siteColors.apply(this.settings.siteColors);
  }
  // A handle on the right rail mirroring Reddit's left navigation collapse control; the choice persists.
  sidebarHandle(){
    const rail=document.querySelector('#right-sidebar-container');let shown=false;
    if(rail){if(this.settings.right)shown=getComputedStyle(rail).display!=='none';else{rail.removeAttribute('data-rc-sidebar-hidden');shown=getComputedStyle(rail).display!=='none';rail.setAttribute('data-rc-sidebar-hidden','1');}}
    if(!shown){this.railHandle?.remove();this.railHandle=null;return;}
    if(!this.railHandle){this.railHandle=RC.button('',()=>this.update({right:!this.settings.right}));this.railHandle.className='rc-rail-handle';this.railHandle.dataset.rcOwned='rail-handle';this.railHandle.append(RC.icon('chevron'));document.body.append(this.railHandle);}
    const open=this.settings.right,label=open?'Collapse right sidebar':'Expand right sidebar',handle=this.railHandle;handle.setAttribute('aria-label',label);handle.title=label;handle.setAttribute('aria-expanded',String(open));handle.dataset.rcOpen=open?'1':'0';
    const header=Math.max(0,document.querySelector('header')?.getBoundingClientRect().bottom||0),width=document.documentElement.clientWidth;
    handle.style.top=Math.round(header+16)+'px';handle.style.left=Math.round(open?rail.getBoundingClientRect().left-16:width-40)+'px';
  }
  navigate(direction){let list=[...this.items.values()].map(r=>r.item).filter(i=>i.node.isConnected&&!i.node.hasAttribute('data-rc-treatment')&&(!location.pathname.includes('/comments/')||i.kind==='comment'));list=list.filter(i=>this.scope==='all'||this.scope==='op'&&i.op||this.scope==='moderator'&&i.mod||this.scope==='tagged'&&this.people[i.author.toLowerCase()]?.tag||this.scope==='unread'&&!this.currentRead?.has(i.id));const current=list.findIndex(i=>i.id===this.selected);const next=current<0?(direction>0?0:list.length-1):Math.max(0,Math.min(list.length-1,current+direction));if(list[next])this.focusItem(list[next]);else this.notify('No matching loaded content. Unloaded comments have not been searched.');}
  focusItem(item){for(const n of this.items.keys())n.removeAttribute('data-rc-selected');this.selected=item.id;item.node.setAttribute('data-rc-selected','1');if(!item.node.hasAttribute('tabindex')){item.node.tabIndex=-1;item.node.dataset.rcTabindex='1';}item.node.scrollIntoView({block:'center',behavior:'instant'});item.node.focus({preventScroll:true});}
  onKey(e){if(!this.settings?.enabled||!this.settings.keyboard||e.defaultPrevented||e.repeat||e.isComposing||e.ctrlKey||e.altKey||e.metaKey||e.shiftKey||this.overlay)return;const path=e.composedPath();if(path.some(n=>n?.matches?.('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"],dialog,[role="dialog"],[role="menu"]')||n?.id==='exp-thread-root'))return;if(document.querySelector('dialog[open],[aria-modal="true"]'))return;const action=Object.entries(this.settings.keys).find(([,key])=>key&&key===e.key.toLowerCase())?.[0];if(!action)return;e.preventDefault();if(action==='next'||action==='previous')return this.navigate(action==='next'?1:-1);const item=[...this.items.values()].find(r=>r.item.id===this.selected)?.item;if(!item)return;if(action==='open'&&item.url){if(item.kind==='post')this.markPostRead(item);this.captureFeedAnchor();this.saveFeedPosition();location.assign(item.url);}else if(action==='hide'){this.manual.set(item.id,'hide');this.schedule();}else if(action==='collapse'){this.collapsed.add(item.id);this.saveCollapse(item.id,true);this.schedule();}else if(['save','upvote','downvote'].includes(action))this.native(item,action);}
  onClick(e){if(!this.settings?.enabled||e.defaultPrevented)return;this.pendingFeedRestore=null;const anchor=e.composedPath().find(n=>n?.localName==='a');if(!anchor||RC.Adapter.owned(anchor))return;const u=RC.Adapter.link(anchor.getAttribute('href'));if(!u)return;const comment=u.pathname.includes('/comments/');if(comment){const post=anchor.closest('shreddit-post'),record=post&&this.items.get(post);if(record){this.captureFeedAnchor();this.saveFeedPosition();this.markPostRead(record.item);}}const sort=comment?u.searchParams.get('sort'):u.pathname.match(/\/(best|hot|new|top|rising)\/?$/)?.[1];if(sort&&this.verified&&(comment?this.settings.rememberCommentSort:this.settings.rememberSort)){const raw=this.store.get('sorts',{});this.store.set('sorts',{...(RC.Model.plain(raw)?Object.fromEntries(Object.entries(raw).slice(-99)):{}),[this.sortKey(comment)]:sort});}}
  update(patch){this.settings=RC.Model.settings({...this.settings,...patch});this.store.set('settings',this.settings);this.history=RC.Model.prune(this.history,this.settings.historyCapacity,this.settings.retentionDays);if(this.verified)this.store.set('history',this.history);this.epoch++;this.barState='';this.closeOverlay();this.regex.dispose();this.schedule();this.ui?.refresh();}
  editPerson(item){if(!this.verified)return this.notify('Personal records are paused until the native account or logged-out state is identifiable.');if(!RC.Model.validUser(item.author))return;const p=this.store.person(item.author),panel=RC.el('div');const fields={};for(const [key,title,max]of [['tag','Local tag',40],['nickname','Nickname',40],['note','Private note',4000]]){const input=RC.el(key==='note'?'textarea':'input',{maxlength:String(max),value:p[key]||'','aria-label':title});fields[key]=input;const label=RC.el('label',{},title);label.append(input);panel.append(label);}const ignore=RC.switch('Ignore locally',p.ignore,v=>p.ignore=v);panel.append(ignore);panel.append(RC.button('Save local record',()=>{if(this.store.setPerson(item.author,{...p,...Object.fromEntries(Object.entries(fields).map(([k,n])=>[k,n.value]))})){this.people=this.store.people();this.closeOverlay();this.schedule();}else this.notify(this.store.error);}));panel.append(RC.button('Remove record',()=>{this.store.setPerson(item.author,{});this.people=this.store.people();this.closeOverlay();this.schedule();}));this.popover('Local record · '+item.author,panel);}
  parent(item,focus=false){const parent=[...this.items.values()].find(r=>r.item.id===item.parent)?.item;const content=RC.el('div');content.append(RC.el('p',{},parent?parent.text:'Parent is removed, unavailable or not loaded.'));if(parent?.url||item.url)content.append(RC.el('a',{href:parent?.url||item.url},'Open native context'));this.popover('Parent context',content,focus);}
  popover(title,content,focus=true){const from=document.activeElement;this.closeOverlay();this.suspendHeaderMenus();const panel=RC.el('section',{'data-rc-owned':'popover',class:'rc-popover',role:'region','aria-label':title});const close=RC.button('Close',()=>this.closeOverlay());panel.append(RC.el('h2',{},title),close,content);document.body.append(panel);this.overlay={node:panel,from,cleanup:()=>{}};const key=e=>{if(e.key==='Escape'){e.stopPropagation();this.closeOverlay();}};panel.addEventListener('keydown',key);if(focus)close.focus();}
  media(item){const media=RC.Adapter.media(item);if(!media.length)return this.notify('Native media unavailable or gated. Reveal it using Reddit’s controls.');const from=document.activeElement;this.closeOverlay();this.suspendHeaderMenus();const overlay=RC.el('div',{'data-rc-owned':'media',class:'rc-media',role:'dialog','aria-modal':'true','aria-label':'Post images'});const box=RC.el('div',{class:'rc-media-box'}),toolbar=RC.el('div',{class:'rc-media-toolbar'}),stage=RC.el('div',{class:'rc-media-stage'}),img=RC.el('img'),count=RC.el('span');let index=0,zoom=1;const paint=()=>{img.removeAttribute('src');img.src=media[index].src;img.alt=media[index].alt;img.style.maxWidth=zoom===1?'100%':'none';img.style.maxHeight=zoom===1?'calc(100dvh - 150px)':'none';img.style.width=zoom===1?'auto':(Math.max(1,img.naturalWidth||800)*zoom)+'px';count.textContent=(index+1)+'/'+media.length+' · '+Math.round(zoom*100)+'%';};const move=d=>{index=(index+d+media.length)%media.length;zoom=1;paint();};toolbar.append(RC.button('Close',()=>this.closeOverlay()),RC.button('Previous',()=>move(-1)),RC.button('Next',()=>move(1)),RC.button('Zoom in',()=>{zoom=Math.min(4,zoom+.5);paint();}),RC.button('Fit',()=>{zoom=1;paint();}),count);stage.append(img);box.append(toolbar,stage);overlay.append(box);document.body.append(overlay);paint();const inert=[...document.body.children,...document.querySelectorAll('[data-exp-product-launcher]')].filter(n=>n!==overlay&&!n.inert);inert.forEach(n=>n.inert=true);const key=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();this.closeOverlay();}else if(e.key==='ArrowRight'){e.preventDefault();move(1);}else if(e.key==='ArrowLeft'){e.preventDefault();move(-1);}else if(e.key==='Tab'){const buttons=[...toolbar.querySelectorAll('button')];const first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}};document.addEventListener('keydown',key,true);overlay.addEventListener('click',e=>{if(e.target!==overlay)return;if(this.settings.backgroundNav&&(e.clientX<innerWidth*.22||e.clientX>innerWidth*.78))move(e.clientX<innerWidth*.22?-1:1);else if(this.settings.backgroundClose)this.closeOverlay();});img.addEventListener('error',()=>this.notify('Image could not load. Close or try the native media link.'));this.overlay={node:overlay,from,cleanup:()=>{document.removeEventListener('keydown',key,true);img.removeAttribute('src');inert.forEach(n=>{if(n.isConnected)n.inert=false;});}};toolbar.querySelector('button').focus();}
  closeOverlay(){if(!this.overlay)return;const {node,from,cleanup}=this.overlay;this.overlay=null;cleanup();node.remove();if(!this.destroyed&&this.settings?.trackRead){for(const item of this.items.keys()){this.readObserver.unobserve(item);this.readObserver.observe(item);}}for(const record of this.items.values())this.positionHeaderMenu(record);if(from?.isConnected){this.suppressContext=true;from.focus({preventScroll:true});this.suppressContext=false;}}
  pruneTransient(){const ids=new Set([...this.items.values()].map(r=>r.item.id));for(const set of [this.revealed,this.collapsed])if(set.size>500)for(const id of set)if(!ids.has(id)&&!ids.has(id.replace(/^collapse:/,'')))set.delete(id);if(this.manual.size>500)for(const id of this.manual.keys())if(!ids.has(id))this.manual.delete(id);}
  contentView(){
    const view=this.viewOverride||this.settings.defaultView;
    const grids=new Set();
    for(const record of this.items.values()){
      const {item}=record;
      if(item.kind!=='post'||location.pathname.includes('/comments/'))continue;
      if(view==='native')this.restoreView(record);else{if(record.nativeViewApplied===undefined)record.nativeView=item.node.getAttribute('view-type');else if(item.node.getAttribute('view-type')!==record.nativeViewApplied)record.nativeView=item.node.getAttribute('view-type');const type=item.node.querySelector(':scope > [slot="expando-content"]')?'compactView':item.node.querySelector(':scope > [slot="post-media-container"]')?'cardView':['compactView','cardView'].includes(record.nativeView)?record.nativeView:['cards','grid'].includes(view)?'cardView':'compactView';this.attr(item.node,'view-type',type);record.nativeViewApplied=type;}
      this.attr(item.node,'data-rc-view',view==='native'?null:view);
      this.compactTools(record,view);
      this.compactMedia(record,view);
      this.nativeMediaLayout(record,view);
      if(view==='grid'){
        let parent=item.node.parentElement;
        for(let depth=0;parent&&depth<5;depth++,parent=parent.parentElement){const posts=parent.querySelectorAll('shreddit-post');if(posts.length>1&&posts.length<1000){grids.add(parent);break;}}
      }
    }
    this.adView(location.pathname.includes('/comments/')?'native':view);this.gridLayout(grids);
    // A chosen view settles in with a short fade from an already-visible feed; input is never blocked and a newer choice restarts it.
    if(this.viewFade){this.viewFade=false;const feed=document.querySelector('main shreddit-feed');if(feed&&typeof feed.animate==='function'&&!matchMedia('(prefers-reduced-motion: reduce)').matches){this.viewFadeAnimation?.cancel();this.viewFadeAnimation=feed.animate([{opacity:.35},{opacity:1}],{duration:180,easing:'cubic-bezier(.16,1,.3,1)'});}}
  }
  // Ads keep native markup; only Reddit's own view-type and the shared card frame follow the chosen view.
  adView(view){
    this.adViews??=new Map();const ads=view==='native'?[]:[...document.querySelectorAll('main shreddit-ad-post')].slice(0,100),type=view==='compact'?'compactView':'cardView';
    for(const [ad,{native,applied}] of this.adViews)if(!ads.includes(ad)){if(ad.getAttribute('view-type')===applied)native===null?ad.removeAttribute('view-type'):ad.setAttribute('view-type',native);ad.removeAttribute('data-rc-view');this.adViews.delete(ad);}
    for(const ad of ads){const state=this.adViews.get(ad)||{native:ad.getAttribute('view-type')};state.applied=type;this.adViews.set(ad,state);this.attr(ad,'view-type',type);this.attr(ad,'data-rc-view',view);}
  }
  // Masonry packing: every visible feed child is one cell spanning its own height in 4px rows, so no row waits for its tallest card.
  // Empty native nodes (loaders, partials) sit at the grid's end, where their visibility still requests the next page.
  gridLayout(grids){
    this.gridCells??=new Set();this.gridContainers??=new Set();const cells=new Set(),aux=new Set();
    this.gridObserver??=new ResizeObserver(entries=>{for(const e of entries){const n=e.target;if(!n.hasAttribute('data-rc-view-wrapper'))continue;const h=e.borderBoxSize?.[0]?.blockSize??n.offsetHeight;n.style.setProperty('--rc-grid-span',String(Math.max(1,Math.ceil((h+12)/4))));}});
    for(const grid of grids)for(const n of grid.children){if(n.matches('hr,script,style,template'))continue;(n.matches('shreddit-post,shreddit-ad-post')||n.querySelector('shreddit-post,shreddit-ad-post')||n.offsetHeight>0?cells:aux).add(n);}
    for(const n of this.gridContainers)if(!grids.has(n))n.removeAttribute('data-rc-view-container');
    for(const n of this.gridCells)if(!cells.has(n)){this.gridObserver.unobserve(n);n.removeAttribute('data-rc-view-wrapper');n.style.removeProperty('--rc-grid-span');}
    for(const n of document.querySelectorAll('[data-rc-view-aux]'))if(!aux.has(n))n.removeAttribute('data-rc-view-aux');
    for(const n of grids)this.attr(n,'data-rc-view-container','grid');
    for(const n of aux)this.attr(n,'data-rc-view-aux','1');
    for(const n of cells)if(!this.gridCells.has(n)){this.attr(n,'data-rc-view-wrapper','1');this.gridObserver.observe(n);}
    this.gridCells=cells;this.gridContainers=grids;
  }
  guardToolEvents(bar){
    for(const type of ['pointerdown','pointerup','touchstart','touchend','keydown','keyup'])bar.addEventListener(type,e=>e.stopPropagation(),{passive:true});
    for(const type of ['auxclick','dblclick'])bar.addEventListener(type,e=>{e.stopPropagation();e.preventDefault();});
    bar.addEventListener('click',e=>{const summary=e.composedPath().find(n=>n?.localName==='summary'&&n.parentElement?.classList.contains('rc-compact-actions'));e.stopPropagation();e.preventDefault();if(summary)summary.parentElement.open=!summary.parentElement.open;});
  }
  pauseMedia(root){
    const walk=(node,depth)=>{for(const media of node.querySelectorAll('video,audio'))media.pause();if(depth<4)for(const host of [...node.querySelectorAll('*')].slice(0,800))if(host.shadowRoot)walk(host.shadowRoot,depth+1);};
    if(root)walk(root,0);
  }
  compactMedia(record,view){
    const post=record.item.node,full=post.querySelector(':scope > [slot="post-media-container"]:not([data-rc-owned])');
    const nativeThumb=post.querySelector(':scope > [slot="thumbnail"]:not([data-rc-owned])');
    const root=post.shadowRoot,supported=!root||root.querySelector('slot[name="thumbnail"]')&&(!nativeThumb||root.querySelector('slot[name="desktop-cta-row"],slot:not([name]),slot[name=""]'));
    const blocked=post.hasAttribute('data-rc-treatment')||post.hasAttribute('data-rc-collapsed')||record.item.gated||post.querySelector('shreddit-blurred-container,[data-testid="nsfw-gate"],[data-testid="spoiler-gate"]');
    const eligible=view==='compact'&&full&&supported&&!full.hidden&&!full.classList.contains('hidden')&&!blocked;
    this.attr(post,'data-rc-compact-flat',view==='compact'&&!post.shadowRoot?'1':null);
    this.attr(post,'data-rc-compact-has-thumb',view==='compact'&&(nativeThumb||eligible)?'1':null);
    if(!eligible){if(record.compactMediaOpen&&(blocked||full?.hidden||full?.classList.contains('hidden')))this.pauseMedia(record.compactFull);record.compactPreview?.remove();delete record.compactPreview;delete record.compactFull;delete record.compactMediaOpen;this.attr(post,'data-rc-compact-preview',null);this.attr(post,'data-rc-compact-media-open',null);return;}
    record.compactFull=full;
    if(record.compactPreview&&(!record.compactPreview.isConnected||!post.contains(record.compactPreview))){record.compactPreview.remove();delete record.compactPreview;}
    if(!record.compactPreview){
      const button=RC.button('',()=>{record.compactMediaOpen=!record.compactMediaOpen;if(!record.compactMediaOpen)this.pauseMedia(record.compactFull);this.compactMedia(record,this.viewOverride||this.settings.defaultView);});
      button.dataset.rcOwned='compact-preview';this.guardToolEvents(button);button.append(RC.el('span'));record.compactPreview=button;
    }
    const button=record.compactPreview,parent=nativeThumb&&record.tools?(record.tools.querySelector('.rc-action-items')||record.tools):post;
    button.className=nativeThumb?'rc-compact-media-toggle':'rc-compact-preview';
    if(root&&!nativeThumb)button.slot='thumbnail';else button.removeAttribute('slot');
    if(button.parentElement!==parent){if(parent===post)post.prepend(button);else parent.append(button);}
    // Native preview renditions suit a 104px thumbnail; lazy loading never starts inside the slotted button.
    const preview=!nativeThumb&&[...full.querySelectorAll('img')].map(n=>n.getAttribute('src')||'').find(src=>src.startsWith('https://preview.redd.it/'));
    const image=!nativeThumb&&(preview?{src:preview}:RC.Adapter.media(record.item)[0]);let img=button.querySelector('img');
    if(image){if(!img){img=RC.el('img',{alt:'',decoding:'async'});button.prepend(img);}if(img.getAttribute('src')!==image.src)img.src=image.src;}else img?.remove();
    const open=!!record.compactMediaOpen,label=open?'Close media':'Open media';button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',label);button.querySelector('span').textContent=label;
    if(!open)this.pauseMedia(record.compactFull);
    this.attr(post,'data-rc-compact-media-open',open?'1':null);this.attr(post,'data-rc-compact-preview',button.isConnected&&post.contains(button)?'1':null);
  }
  compactTools(record,view){
    const bar=record.tools;if(!bar)return;
    const previous=bar.querySelector(':scope > details.rc-compact-actions');
    const touch=matchMedia('(pointer:coarse)').matches;
    const compact=(view==='compact'||touch)&&!record.item.node.hasAttribute('data-rc-treatment')&&!record.item.node.hasAttribute('data-rc-collapsed');
    this.attr(bar,'data-rc-feed-actions',touch?'1':null);
    if(!record.item.node.shadowRoot&&!touch){const post=record.item.node,focused=bar.contains(document.activeElement)?document.activeElement:null;if(compact&&bar!==post.lastElementChild)post.append(bar);else if(!compact&&bar!==post.firstElementChild)post.prepend(bar);focused?.focus({preventScroll:true});}
    if(compact&&!previous){
      const details=RC.el('details',{class:'rc-compact-actions'}),summary=RC.el('summary',{},'Thread actions'),actions=RC.el('div',{class:'rc-action-items'});
      const focused=bar.contains(document.activeElement)?document.activeElement:null;
      actions.append(...bar.childNodes);details.append(summary,actions);details.open=!!record.compactActionsOpen||!!focused;
      details.addEventListener('toggle',()=>{record.compactActionsOpen=details.open;this.positionHeaderMenu(record);});bar.addEventListener('keydown',e=>{if(e.key==='Escape'&&bar.hasAttribute('data-rc-header-actions')){e.preventDefault();details.open=false;this.positionHeaderMenu(record);summary.focus({preventScroll:true});}});bar.append(details);if(record.compactSummaryFocus){summary.focus({preventScroll:true});delete record.compactSummaryFocus;}else if(focused)focused.focus({preventScroll:true});
    }else if(!compact&&previous){
      const focused=previous.contains(document.activeElement)?document.activeElement:null;
      bar.append(...previous.querySelector('.rc-action-items').childNodes);previous.remove();
      if(focused?.localName==='summary')bar.querySelector('button')?.focus({preventScroll:true});else focused?.focus({preventScroll:true});
    }
  }
  clearToolsLayout(record){const label=record.tools?.querySelector('summary');if(label?.querySelector('svg'))label.textContent='Thread actions';record.actionsSlot?.remove();record.actionsStyle?.remove();record.actionsRow?.removeAttribute('data-rc-header-row');if(record.headerContainer?.contains(record.tools))record.item.node.prepend(record.tools);record.headerContainer?.remove();record.tools?.removeAttribute('data-rc-header-actions');delete record.actionsSlot;delete record.actionsStyle;delete record.actionsRow;delete record.headerContainer;}
  nativeToolsLayout(record){
    const post=record.item.node,root=post.shadowRoot,bar=record.tools,summary=bar?.querySelector('summary');
    if(!matchMedia('(pointer:coarse)').matches){this.clearToolsLayout(record);return '';}
    if(!summary){
      if(record.actionsSlot?.dataset.rcRecovery&&record.actionsSlot.isConnected)return 'thread-feed-actions';
      this.clearToolsLayout(record);if(bar.parentElement!==post)post.prepend(bar);
      if(root){const projection=document.createElement('slot');projection.name='thread-feed-actions';projection.dataset.rcActionsSlot='1';projection.dataset.rcRecovery='1';root.prepend(projection);record.actionsSlot=projection;record.actionsRow=projection;return 'thread-feed-actions';}return '';
    }
    // Touch: a native-sized icon at the right end of the native footer action row.
    const actions=root?.querySelector('rpl-action-bar [data-testid="action-row"]')||root?.querySelector('slot[name="overflow-menu-bar"]')?.parentElement||null;
    const row=actions&&([...actions.children].filter(n=>n.localName==='div').pop()||actions);
    if(record.actionsRow!==row||row&&(!row.isConnected||!record.actionsSlot?.isConnected)){
      this.clearToolsLayout(record);
      if(row){
        const projection=document.createElement('slot');projection.name='thread-feed-actions';projection.dataset.rcActionsSlot='1';row.append(projection);row.dataset.rcHeaderRow='1';
        // Grid footers fit the icon with a tighter native gap; crowded rows (repost, mod actions) wrap it right-aligned instead of clipping.
        const style=document.createElement('style');style.dataset.rcHeaderStyle='1';style.textContent='[data-rc-actions-slot]{display:flex;align-items:center;margin-inline-start:auto}[data-testid="action-row"]:has([data-rc-actions-slot]){flex-wrap:wrap!important;row-gap:4px}:host([data-rc-view="grid"]) [data-testid="action-row"]:has([data-rc-actions-slot]){column-gap:6px!important}[data-rc-header-row],div:has(>slot[name="overflow-menu-bar"]){position:relative;z-index:1}';root.append(style);
        record.actionsSlot=projection;record.actionsStyle=style;record.actionsRow=row;
      }
    }
    if(record.actionsSlot){if(bar.parentElement!==post)post.prepend(bar);}else if(bar!==post.lastElementChild){const focused=bar.contains(document.activeElement)?document.activeElement:null;post.append(bar);focused?.focus({preventScroll:true});}
    const native=actions&&[...actions.querySelectorAll('button,a[href]'),...[...actions.querySelectorAll('slot:not([data-rc-actions-slot])')].flatMap(slot=>slot.assignedElements({flatten:true}).flatMap(n=>[n,...n.querySelectorAll('*')]).filter(n=>n.matches('button,a[href]')&&!RC.Adapter.owned(n)))].find(n=>RC.Adapter.visible(n)),box=native?.getBoundingClientRect(),height=box?.height;
    bar.style.setProperty('--rc-native-action-size',(height>=20&&height<=48?height:32)+'px');
    const tone=native&&getComputedStyle(native).backgroundColor;if(tone&&!/^(transparent|rgba\(0, 0, 0, 0\))$/.test(tone))bar.style.setProperty('--rc-native-action-bg',tone);
    bar.dataset.rcHeaderActions='1';
    if(!summary.querySelector('svg')){
      summary.replaceChildren(RC.icon('sliders'),RC.el('span',{class:'rc-sr'},'Thread actions'));
    }
    summary.setAttribute('title','Thread actions');
    this.positionHeaderMenu(record);return record.actionsSlot?'thread-feed-actions':'';
  }
  positionHeaderMenu(record){const bar=record.tools,details=bar?.querySelector('details'),panel=bar?.querySelector('.rc-action-items');if(!panel||!bar.hasAttribute('data-rc-header-actions'))return;if(!details.open||this.overlay){if(typeof panel.hidePopover==='function'&&panel.matches(':popover-open'))panel.hidePopover();return;}if(typeof panel.showPopover==='function'){panel.setAttribute('popover','manual');if(!panel.matches(':popover-open'))panel.showPopover();}const r=details.querySelector('summary').getBoundingClientRect(),width=Math.min(280,document.documentElement.clientWidth-24);panel.style.width=width+'px';const h=panel.getBoundingClientRect().height;panel.style.left=Math.max(12,Math.min(r.right-width,document.documentElement.clientWidth-width-12))+'px';const below=r.bottom+4,above=r.top-4-h;panel.style.top=(below+h<=innerHeight-12?below:above>=12?above:Math.max(12,innerHeight-h-12))+'px';}
  dismissHeaderMenus(e){if(this.overlay?.node.contains(e.target)||e.target.closest?.('[data-rc-owned="popover"],[data-rc-owned="media"]'))return;for(const record of this.items.values())if(record.tools?.hasAttribute('data-rc-header-actions')&&!record.tools.contains(e.target)){const details=record.tools.querySelector('details');if(details?.open){details.open=false;this.positionHeaderMenu(record);}}}
  suspendHeaderMenus(){for(const record of this.items.values()){const panel=record.tools?.querySelector('.rc-action-items');if(typeof panel?.hidePopover==='function'&&panel.matches(':popover-open'))panel.hidePopover();}}
  nativeMediaLayout(record,view){
    const post=record.item.node,root=post.shadowRoot;
    this.attr(post,'data-rc-compact-card-layout',view==='compact'&&root?.querySelector('slot[name="post-media-container"]')?'1':null);
    this.compactRow(record,view);
    const headerSlot=this.nativeToolsLayout(record),toolsSlot=record.actionsRow?headerSlot:(view!=='native'&&root?.querySelector('slot[name="desktop-cta-row"]')?'desktop-cta-row':'');
    this.attr(post,'data-rc-compact-native-layout',view==='compact'&&matchMedia('(pointer:coarse)').matches&&root?.querySelector('slot[name="expando-content"]')?'1':null);
    if(record.tools&&record.tools.getAttribute('slot')!==toolsSlot){if(toolsSlot)record.tools.setAttribute('slot',toolsSlot);else record.tools.removeAttribute('slot');}this.positionHeaderMenu(record);
    if(view==='native'||!root?.querySelector('slot[name="expando-content"],slot[name="desktop-cta-row"]')){record.mediaStyle?.remove();delete record.mediaStyle;return;}
    if(record.mediaStyle?.isConnected&&record.mediaStyle.getRootNode()===root)return;
    record.mediaStyle?.remove();const style=document.createElement('style');style.dataset.rcMediaLayout='1';
    // Leave the native thumbnail column intact. Only full media spans the post;
    // native hidden expandos, player nodes and handlers retain control of opening it.
    style.textContent=':host([data-rc-view="compact"][data-rc-compact-card-layout]) div:has(>div>slot[name="thumbnail"]){display:grid!important;grid-template-columns:104px minmax(0,1fr)!important;grid-template-rows:auto auto auto auto!important;gap:2px 8px}:host([data-rc-view="compact"][data-rc-compact-card-layout]) div:has(>slot[name="thumbnail"]){grid-column:1!important;grid-row:1/4!important;margin:0!important;width:104px}:host([data-rc-view="compact"][data-rc-compact-card-layout]) div:has(>div>slot[name="credit-bar"]){grid-column:2!important;grid-row:1/3!important;margin:0!important}:host([data-rc-view="compact"]) h2:has(>slot[name="title"]){font-size:16px!important;line-height:20px!important;margin:0!important;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}:host([data-rc-view="compact"]) :is(div,section):has(>slot[name="desktop-cta-row"]):not(:has(>slot[name="title"])){display:flex;flex-wrap:wrap;align-items:center;gap:4px}:host([data-rc-view="compact"][data-rc-compact-card-layout]) :is(div,section):has(>slot[name="overflow-menu-bar"]){grid-column:2!important;grid-row:3!important;margin-block:0!important}:host([data-rc-view="compact"][data-rc-compact-card-layout]) :is(div,section):has(>slot[name="post-media-container"]){grid-column:1/-1!important;grid-row:4!important}:host([data-rc-view="compact"][data-rc-compact-preview]:not([data-rc-compact-media-open])) :is(div,section):has(>slot[name="post-media-container"]){display:none!important}:host([data-rc-view]) :is(div,section):has(>slot[name="expando-content"]){grid-column:1/-1!important;width:100%!important;max-width:100%!important;height:auto!important;max-height:none!important;overflow:visible!important}';
    style.textContent+=':host([data-rc-compact-native-layout]) div:has(>div>slot[name="thumbnail"]){grid-template-columns:88px minmax(0,1fr)!important}:host([data-rc-compact-native-layout]) div:has(>slot[name="thumbnail"]){grid-row:2/3!important;align-self:start;margin:2px 8px 0 0!important;width:80px;height:60px;overflow:hidden}:host([data-rc-compact-native-layout]) div:has(>slot[name="overflow-menu-bar"]){grid-column:1/-1!important;margin-block:2px!important}';
    root.append(style);record.mediaStyle=style;
  }
  // Reddit's compact card puts vote/comments/share below the 104x78 thumbnail. From 600px the thumbnail
  // column gives the action row's height back and the row reserves the thumbnail's width, so the row sits
  // beside the thumbnail; narrower feeds keep the full-width row because the controls would not fit.
  compactRow(record,view){
    const post=record.item.node,root=post.shadowRoot,active=view==='compact'&&!!root?.querySelector('div:has(>slot[name="share-button"])')&&!!root.querySelector('div:has(>slot[name="thumbnail"])');
    if(!active){record.rowStyle?.remove();delete record.rowStyle;return;}
    if(record.rowStyle?.isConnected&&record.rowStyle.getRootNode()===root)return;
    record.rowStyle?.remove();const style=document.createElement('style');style.dataset.rcCompactRow='1';
    style.textContent='@media(min-width:600px){:host([data-rc-view="compact"][data-rc-compact-has-thumb]:not([data-rc-compact-media-open])) div:has(>slot[name="thumbnail"]){margin-bottom:-40px!important}:host([data-rc-view="compact"][data-rc-compact-has-thumb]:not([data-rc-compact-media-open])) div:has(>slot[name="share-button"]){padding-inline-end:112px!important;box-sizing:border-box}}';
    root.append(style);record.rowStyle=style;
  }
  restoreView(record){record.rowStyle?.remove();delete record.rowStyle;record.compactPreview?.remove();delete record.compactPreview;delete record.compactFull;delete record.compactMediaOpen;record.mediaStyle?.remove();delete record.mediaStyle;if(record.nativeViewApplied!==undefined&&record.item.node.getAttribute('view-type')===record.nativeViewApplied)this.attr(record.item.node,'view-type',record.nativeView);delete record.nativeViewApplied;delete record.nativeView;}
  release(node,record){clearTimeout(record.postReadTimer);this.clearToolsLayout(record);this.restoreView(record);clearTimeout(record.hoverTimer);this.readObserver.unobserve(node);clearTimeout(this.readTimers.get(node));this.readTimers.delete(node);record.tools?.remove();if(node.dataset.rcTabindex==='1')node.removeAttribute('tabindex');for(const a of [...node.attributes])if(a.name.startsWith('data-rc-'))node.removeAttribute(a.name);node.style.removeProperty('--rc-content-font');for(const name of ['--rc-reading-font','--rc-line-height','--rc-paragraph-gap'])node.style.removeProperty(name);this.items.delete(node);}
  clearNodes(){for(const [node,r]of this.items)this.release(node,r);this.adView('native');this.gridLayout(new Set());for(const n of document.querySelectorAll('[data-rc-post-read-hidden],[data-rc-sidebar-hidden],[data-rc-fill],[data-rc-secondary-hidden],[data-rc-layout],[data-rc-profile-simple],[data-rc-view-container],[data-rc-view-wrapper],[data-rc-view-aux],[data-rc-sort-row],shreddit-ad-post[data-rc-view]')){for(const a of [...n.attributes])if(a.name.startsWith('data-rc-'))n.removeAttribute(a.name);for(const name of ['--rc-width','--rc-offset','--rc-grid-span'])n.style.removeProperty(name);}}
  clearRoute(){this.saveFeedPosition();this.feedAnchor=null;this.pendingFeedRestore=null;this.feedRestoreRoute='';this.readGeneration=(this.readGeneration||0)+1;this.epoch++;this.regex.dispose();this.clearNodes();this.readObserver?.disconnect();this.readTimers.forEach(clearTimeout);this.readTimers.clear();this.closeOverlay();this.bar?.remove();this.bar=null;this.topButton?.remove();this.topButton=null;this.railHandle?.remove();this.railHandle=null;this.barState='';this.revealed.clear();this.manual.clear();this.collapsed.clear();this.selected='';this.scope='all';}
  diagnostics(){return {product:'THREAD',version:RC.VERSION,accountVerified:this.verified,loaded:this.items.size,readTimers:this.readTimers.size,regexWorkers:this.regex.pending.size,loadCounts:{...this.loadCounts},regexErrors:[...this.regexErrors.values()],storage:this.store.error||'available',api:'Unavailable: own registration and legitimate access required',liveContract:'native header and feed DOM observed; candidate installed behavior unverified'};}
  destroy(){if(this.destroyed)return;this.destroyed=true;this.siteColors?.clear();clearTimeout(this.timer);this.observer.disconnect();this.routeObserver?.();this.clearRoute();this.store.unlisten();removeEventListener('scroll',this.scroll);removeEventListener('resize',this.resize);document.removeEventListener('keydown',this.key);document.removeEventListener('click',this.click);document.removeEventListener('pointerdown',this.dismissMenus,true);this.style.remove();this.ui?.destroy();if(RC.ARTWORK)URL.revokeObjectURL(RC.ARTWORK);}
};

// Original local reading tools. Copyright expDARE.
RC.PRESETS={native:{readingFont:'native',lineHeight:0,paragraphGap:0,contentFont:14},comfortable:{readingFont:'sans',contentFont:18,lineHeight:170,paragraphGap:12},dense:{readingFont:'sans',contentFont:15,lineHeight:140,paragraphGap:6},book:{readingFont:'serif',contentFont:18,lineHeight:180,paragraphGap:14}};
Object.assign(RC.Runtime.prototype,{
  readingPopover(title,content){this.popover(title,content);this.overlay.node.classList.add('rc-reading-panel');},
  readingState(){
    this.library=this.verified?RC.Model.library(this.store.get('library',[])):[];
    this.postReads=this.verified?RC.Model.postReads(this.store.get('postReads',[]),this.settings.retentionDays):[];
    this.feedPositions=this.cleanFeedPositions(this.store.get('feedPositions',{}));
  },
  savedItem(item){return RC.Model.library([{url:item.url}])[0];},
  isSaved(item){const key=this.savedItem(item)?.key;return !!key&&this.library?.some(row=>row.key===key);},
  persistLibrary(next){
    if(!this.verified)return false;
    const library=RC.Model.library(next);if(!this.store.set('library',library)){this.notify(this.store.error);return false;}
    this.library=library;this.barState='';this.schedule();return true;
  },
  saveToCollection(item){
    if(!this.verified)return this.notify('Local collections are paused until account identity is recognized.');
    const candidate=this.savedItem(item);if(!candidate)return this.notify('A native Reddit discussion link is needed to save locally.');
    const previous=this.library.find(row=>row.key===candidate.key),panel=RC.el('form'),title=RC.el('input',{'aria-label':'Saved title',maxlength:'300',value:previous?.title||item.title||'Saved comment'}),collection=RC.el('input',{'aria-label':'Collection name',maxlength:'40',value:previous?.collection||'Read later'}),note=RC.el('textarea',{'aria-label':'Saved note',maxlength:'2000',rows:'4'});
    note.value=previous?.note||'';
    for(const [label,control]of [['Title',title],['Collection',collection],['Private note',note]]){const line=RC.el('label',{},label);line.append(control);panel.append(line);}
    panel.append(RC.el('p',{},'Local bookmark only. This does not change Reddit Saved.'));
    const submit=RC.el('button',{type:'submit'},'Save locally'),status=RC.el('p',{role:'status','aria-live':'polite'});panel.append(submit,status);
    panel.addEventListener('submit',e=>{e.preventDefault();if(!previous&&this.library.length>=500){status.textContent='Local collection capacity reached (500). Remove or export an item first.';return;}if(this.persistLibrary([...this.library.filter(row=>row.key!==candidate.key),{...candidate,title:title.value,collection:collection.value,note:note.value,at:previous?.at||Date.now()}])){this.closeOverlay();this.notify('Saved to local collection.');}else status.textContent=this.store.error||'Could not save local bookmark.';});
    this.readingPopover(previous?'Edit local bookmark':'Save to collection',panel);
  },
  collections(){
    if(!this.verified)return this.notify('Local collections are paused until account identity is recognized.');
    const panel=RC.el('div'),search=RC.el('input',{type:'search','aria-label':'Search local collections',placeholder:'Search titles and notes'}),filter=RC.select('Collection','',[['','All collections'],...Array.from(new Set(this.library.map(row=>row.collection))).sort().map(name=>[name,name])],()=>paint()),list=RC.el('div'),status=RC.el('p',{role:'status','aria-live':'polite'});
    const controls=RC.el('div',{class:'rc-reading-controls'});controls.append(search,filter);panel.append(controls,status,list);
    const paint=()=>{
      const query=search.value.trim().toLocaleLowerCase(),rows=this.library.filter(row=>(filter.value===''||row.collection===filter.value)&&[row.title,row.note,row.collection].join(' ').toLocaleLowerCase().includes(query));
      status.textContent=rows.length+' local bookmarks · '+this.library.length+'/500';list.replaceChildren();rename.disabled=!filter.value;renameButton.disabled=!filter.value;moveButton.disabled=!filter.value;
      for(const row of rows.slice().reverse()){
        const entry=RC.el('article',{class:'rc-library-entry'}),link=RC.el('a',{href:row.url},row.title);entry.append(link,RC.el('p',{},row.collection));if(row.note)entry.append(RC.el('p',{},row.note));
        entry.append(RC.button('Edit bookmark',()=>this.saveToCollection({url:row.url,title:row.title})),RC.button('Remove bookmark',()=>{if(this.persistLibrary(this.library.filter(r=>r.url!==row.url))){this.libraryUndo={row,account:this.account};this.collections();}}));list.append(entry);
      }
      if(!rows.length)list.append(RC.el('p',{},this.library.length?'No matching local bookmarks.':'No local bookmarks yet. Use Save to collection in Thread actions.'));
    };
    search.addEventListener('input',paint);
    const rename=RC.el('input',{'aria-label':'New collection name',maxlength:'40',placeholder:'New collection name'});
    const renameButton=RC.button('Rename selected collection',()=>{const name=rename.value.trim();if(!name){status.textContent='Enter a new collection name.';rename.focus();return;}if(this.persistLibrary(this.library.map(row=>row.collection===filter.value?{...row,collection:name}:row)))this.collections();else status.textContent=this.store.error||'Could not update local collection.';});
    const moveButton=RC.button('Move selected collection to Read later',()=>{if(this.persistLibrary(this.library.map(row=>row.collection===filter.value?{...row,collection:'Read later'}:row)))this.collections();else status.textContent=this.store.error||'Could not update local collection.';});panel.append(rename,renameButton,moveButton);
    if(this.libraryUndo?.account===this.account)panel.append(RC.button('Undo bookmark removal',()=>{const row=this.libraryUndo.row;if(this.library.length>=500)return this.notify('Local collection capacity reached (500).');if(this.persistLibrary([...this.library,row])){this.libraryUndo=null;this.collections();}}));
    this.readingPopover('Local collections',panel);paint();
  },
  postIsRead(id){return this.postReads?.some(row=>row.id===id);},
  filterReadPosts(all){
    const hidden=new Set(),ids=new Set(this.postReads.map(row=>row.id)),enabled=this.verified&&this.settings.trackPosts&&this.settings.hideReadPosts;
    for(const node of all){if(node.localName!=='shreddit-post')continue;const id=node.getAttribute('thingid')||node.getAttribute('thing-id')||node.id;const hide=enabled&&ids.has(id);this.attr(node,'data-rc-post-read-hidden',hide?'1':null);if(hide)hidden.add(node);}
    return hidden;
  },
  markPostRead(item,read=true){
    if(!this.verified||!this.settings.trackPosts)return;
    const old=this.postReads.find(row=>row.id===item.id);if(!!old===read)return;
    const next=this.postReads.filter(row=>row.id!==item.id);if(read)next.push({id:item.id,at:Date.now()});
    if(!this.store.set('postReads',RC.Model.postReads(next,this.settings.retentionDays)))return this.notify(this.store.error);
    this.postReadUndo={id:item.id,old,account:this.account};this.postReads=RC.Model.postReads(next,this.settings.retentionDays);this.barState='';this.schedule();
  },
  undoPostRead(){
    const undo=this.postReadUndo;if(!undo||undo.account!==this.account||!this.verified)return;
    const next=this.postReads.filter(row=>row.id!==undo.id);if(undo.old)next.push(undo.old);
    if(this.store.set('postReads',next)){this.postReads=next;this.postReadUndo=null;this.barState='';this.schedule();}
  },
  observePostReads(entries){
    for(const entry of entries){const record=this.items.get(entry.target);if(record?.item.kind!=='post')continue;
      clearTimeout(record.postReadTimer);delete record.postReadTimer;
      if(!this.settings?.trackPosts||!this.settings.markScrolled||!this.verified||this.overlay||record.item.gated||document.visibilityState!=='visible'||entry.intersectionRatio<.6||entry.target.matches('[data-rc-treatment],[data-rc-collapsed],[data-rc-post-read-hidden]'))continue;
      const account=this.account;record.postReadTimer=setTimeout(()=>{delete record.postReadTimer;if(!this.destroyed&&this.settings.enabled&&this.settings.trackPosts&&this.settings.markScrolled&&this.account===account&&document.visibilityState==='visible'&&!this.overlay&&entry.target.isConnected&&RC.Adapter.visible(entry.target)&&!entry.target.matches('[data-rc-treatment],[data-rc-collapsed]'))this.markPostRead(record.item);},1200);
    }
  },
  captureFeedAnchor(){
    if(!this.settings?.enabled||!this.settings.restoreFeed||!this.verified||this.overlay||this.pendingFeedRestore||location.pathname.includes('/comments/'))return;
    const top=(document.querySelector('header')?.getBoundingClientRect().bottom||0)+20;
    const item=[...this.items.values()].map(r=>r.item).find(i=>i.kind==='post'&&RC.Adapter.visible(i.node)&&i.node.getBoundingClientRect().bottom>top&&!i.node.hasAttribute('data-rc-post-read-hidden'));
    if(item)this.feedAnchor={route:location.pathname+location.search,id:item.id,offset:Math.round(item.node.getBoundingClientRect().top),at:Date.now()};
  },
  cleanFeedPositions(raw){
    if(!RC.Model.plain(raw))return {};
    return Object.fromEntries(Object.entries(raw).filter(([path,row])=>path.startsWith('/')&&path.length<=240&&RC.Model.plain(row)&&typeof row.id==='string'&&row.id.length<=120&&Number.isFinite(row.offset)&&Math.abs(row.offset)<=50000&&Number.isFinite(row.at)&&row.at>Date.now()-this.settings.retentionDays*86400000).sort((a,b)=>a[1].at-b[1].at).slice(-100));
  },
  saveFeedPosition(){
    if(!this.settings?.enabled||!this.settings.restoreFeed||!this.verified||!this.feedAnchor)return;
    const {route,...anchor}=this.feedAnchor;const next=this.cleanFeedPositions({...this.feedPositions,[route]:anchor});
    if(this.store.set('feedPositions',next))this.feedPositions=next;
  },
  restoreFeedPosition(){
    const route=location.pathname+location.search;
    if(!this.settings.restoreFeed||!this.verified||location.pathname.includes('/comments/')){this.pendingFeedRestore=null;return;}
    if(this.feedRestoreRoute!==route){this.feedRestoreRoute=route;const anchor=this.feedPositions[route];this.pendingFeedRestore=anchor&&scrollY<5?{...anchor,attempts:0}:null;}
    const pending=this.pendingFeedRestore;if(!pending)return;
    if(this.overlay||scrollY>5){this.pendingFeedRestore=null;return;}
    const record=[...this.items.values()].find(r=>r.item.id===pending.id);
    if(record?.item.node.getClientRects().length){
      const node=record.item.node;this.pendingFeedRestore=null;scrollBy({top:node.getBoundingClientRect().top-pending.offset,behavior:'instant'});return;
    }
    if(scrollY>5||++pending.attempts>=20){this.pendingFeedRestore=null;return this.notify('Saved feed post is not loaded or is hidden. Position restoration stopped.');}
    this.schedule();
  },
  readingPass(){
    for(const {item}of this.items.values()){
      if(item.kind==='post'){this.attr(item.node,'data-rc-post-read',this.settings.trackPosts&&this.postIsRead(item.id)?'1':null);this.attr(item.node,'data-rc-post-read-hidden',this.verified&&this.settings.trackPosts&&this.settings.hideReadPosts&&this.postIsRead(item.id)?'1':null);}
      const font={native:'inherit',sans:'system-ui,sans-serif',serif:'Georgia,serif'}[this.settings.readingFont];
      item.node.style.setProperty('--rc-reading-font',font);item.node.style.setProperty('--rc-line-height',this.settings.lineHeight?String(this.settings.lineHeight/100):'normal');item.node.style.setProperty('--rc-paragraph-gap',this.settings.paragraphGap?this.settings.paragraphGap+'px':'revert');
      this.attr(item.node,'data-rc-reading-font',this.settings.readingFont!=='native'?'1':null);this.attr(item.node,'data-rc-reading-line',this.settings.lineHeight?'1':null);this.attr(item.node,'data-rc-reading-gap',this.settings.paragraphGap?'1':null);
    }
    this.refreshCommentSearch();this.restoreFeedPosition();
  },
  readingPreset(name){
    if(RC.PRESETS[name])this.update(RC.PRESETS[name]);
  },
  navigateThread(mode,direction=1){
    let comments=[...this.items.values()].map(r=>r.item).filter(i=>i.kind==='comment'&&i.node.isConnected&&i.node.getClientRects().length&&!i.node.hasAttribute('data-rc-treatment'));
    const top=(this.bar?.getBoundingClientRect().bottom||document.querySelector('header')?.getBoundingClientRect().bottom||0)+8;
    const selected=comments.find(i=>i.id===this.selected&&i.node.getBoundingClientRect().top>=top-24&&RC.Adapter.visible(i.node));
    const current=selected||comments.find(i=>i.node.getBoundingClientRect().top>=top)||comments.filter(i=>RC.Adapter.visible(i.node)).at(-1);if(!current)return this.notify('No matching loaded comments.');
    const parent=item=>item.parent||this.loadedParent(item)?.id||'';
    comments=comments.filter(i=>mode==='roots'?i.depth===0:i.depth===current.depth&&parent(i)===parent(current));
    const index=comments.findIndex(i=>i.id===current.id);
    const target=index>=0?comments[index+direction]:comments.find(i=>i.node.getBoundingClientRect().top>current.node.getBoundingClientRect().top);
    if(target)this.focusItem(target);else this.notify('No next matching loaded thread. Unloaded replies are not searched.');
  },
  loadedParent(item){
    const node=item.node.parentElement?.closest('shreddit-comment');if(node&&this.items.has(node))return this.items.get(node).item;
    return [...this.items.values()].map(r=>r.item).filter(i=>i.kind==='comment'&&i.depth<item.depth&&(i.node.compareDocumentPosition(item.node)&Node.DOCUMENT_POSITION_FOLLOWING)).sort((a,b)=>a.node.compareDocumentPosition(b.node)&Node.DOCUMENT_POSITION_FOLLOWING?-1:1).at(-1);
  },
  foldReplies(item){
    if(!this.verified)return this.notify('Local reply folding requires recognized account identity.');
    const descendants=[...this.items.values()].map(r=>r.item).filter(i=>i.kind==='comment'&&i.depth>item.depth);
    const ids=new Set([item.id]);let changed=true;while(changed){changed=false;for(const i of descendants)if(!ids.has(i.id)&&(ids.has(i.parent)||item.node.contains(i.node))){ids.add(i.id);changed=true;}}
    ids.delete(item.id);if(!ids.size)return this.notify('No loaded replies to collapse.');
    const reopen=descendants.filter(i=>ids.has(i.id)).every(i=>i.node.hasAttribute('data-rc-collapsed'));
    const raw=this.store.get('collapse',{}),data=RC.Model.plain(raw)?Object.fromEntries(Object.entries(raw).slice(-99)):{},key=this.threadKey(),saved=new Set(Array.isArray(data[key])?data[key]:[]);
    for(const id of ids)reopen?saved.delete(id):saved.add(id);data[key]=[...saved].slice(-500);
    if(!this.store.set('collapse',data))return this.notify(this.store.error);
    for(const id of ids){if(reopen){this.collapsed.delete(id);this.revealed.add('collapse:'+id);}else{this.collapsed.add(id);this.revealed.delete('collapse:'+id);}}this.schedule();
  },
  searchLoadedComments(){
    const panel=RC.el('div'),input=RC.el('input',{type:'search','aria-label':'Search loaded comments',placeholder:'Search visible loaded comment text',maxlength:'200',value:this.commentQuery||''}),status=RC.el('p',{role:'status','aria-live':'polite'}),previous=RC.button('Previous match',()=>move(-1)),next=RC.button('Next match',()=>move(1));
    let cursor=-1;
    const paint=()=>{this.commentQuery=input.value.trim();this.refreshCommentSearch();status.textContent=(this.commentMatches?.length||0)+' matching loaded comments. Hidden, collapsed and unloaded replies are excluded.';};
    const move=direction=>{const matches=this.commentMatches||[];if(!matches.length)return;cursor=cursor<0?(direction>0?0:matches.length-1):(cursor+direction+matches.length)%matches.length;matches[cursor].node.scrollIntoView({block:'center',behavior:'instant'});status.textContent=(cursor+1)+' / '+matches.length+' loaded matches';};
    input.addEventListener('input',()=>{cursor=-1;paint();});panel.append(input,status,previous,next,RC.button('Clear search',()=>{input.value='';cursor=-1;paint();}));this.readingPopover('Search loaded comments',panel);paint();input.focus();
    const cleanup=this.overlay.cleanup;this.overlay.cleanup=()=>{cleanup();this.commentQuery='';this.refreshCommentSearch();};
  },
  refreshCommentSearch(){
    const query=this.commentQuery?.toLocaleLowerCase();this.commentMatches=[];
    for(const {item}of this.items.values()){
      let matched=false;
      if(query&&item.kind==='comment'&&!item.gated&&!item.node.closest('[data-rc-collapsed],[data-rc-treatment="hide"],[data-rc-treatment="blur"]')){
        const body=RC.Adapter.own(item.node,'[slot="comment"]')[0];
        if(body){const range=document.createRange();range.selectNodeContents(body);matched=!!range.getClientRects().length&&body.textContent.toLocaleLowerCase().includes(query);}
      }
      this.attr(item.node,'data-rc-search-match',matched?'1':null);if(matched)this.commentMatches.push(item);
    }
  }
});

RC.el=(tag,attrs={},text='')=>{const n=document.createElement(tag);for(const [k,v]of Object.entries(attrs)){if(k==='value')n.value=v;else n.setAttribute(k,v);}if(text)n.textContent=text;return n;};
RC.button=(label,fn)=>{const n=RC.el('button',{type:'button'},label);n.addEventListener('click',fn);return n;};
RC.select=(label,value,options,fn)=>{const n=RC.el('select',{'aria-label':label});const names={native:'Reddit default',best:'Best',hot:'Hot',new:'New',top:'Top',rising:'Rising',hour:'Past hour',day:'Past day',week:'Past week',month:'Past month',year:'Past year',all:label==='Top time range'?'All time':'All',show:'Always',upvoted:'When upvoted',collapse:'Collapsed',off:'Off',always:'Always',standard:'Standard',compact:'Compact',mini:'Mini',confidence:'Best',controversial:'Controversial',old:'Old',qa:'Q&A',suggest:'Suggest modern Reddit',redirect:'Open modern Reddit',profile:'Profile name',nickname:'Local nickname',both:'Both',post:'Posts',comment:'Comments',text:'Text',title:'Title',domain:'Domain',community:'Community',author:'Author',flair:'Flair',hide:'Hide',dim:'Dim',blur:'Blur'};for(const choice of options){const [v,t]=Array.isArray(choice)?choice:[choice,names[choice]||choice];n.append(RC.el('option',{value:v},t));}n.value=value;n.addEventListener('change',()=>fn(n.value));return n;};
// Authored stroke icons shared by the feed controls; one 20px grid and stroke weight.
// Maps a Core site palette onto Reddit's neutral colour variables.
RC.siteColorCss=(p,scope)=>{
  const mix=(a,b,pct)=>`color-mix(in srgb,${a} ${pct}%,${b})`,hover=mix(p.raised,p.text,88),active=mix(p.raised,p.text,78);
  const vars={bg:['neutral-background','neutral-background-pinned','neutral-background-strong'],panel:['neutral-background-canvas','neutral-background-container','neutral-background-highlighted','neutral-background-gilded','neutral-background-medium','neutral-background-hover','neutral-background-weak-hover'],inset:['neutral-background-weak'],raised:['neutral-background-container-hover','neutral-background-container-strong','neutral-background-strong-hover','secondary-background','button-secondary-background','button-secondary-background-focus','input-secondary'],
    [hover]:['neutral-background-container-strong-hover','neutral-background-selected','neutral-background-highlighted-strong','neutral-background-gilded-hover','secondary-background-hover','button-secondary-background-hover','button-plain-background-hover','input-secondary-hover'],
    [active]:['secondary-background-selected','button-secondary-background-activated','button-plain-background-activated'],
    text:['neutral-content-strong','secondary','secondary-plain','secondary-hover','secondary-plain-hover','button-plain-text','button-plain-text-hover','button-secondary-text','input-secondary-text','input-text','input-bordered-text'],
    muted:['neutral-content'],[mix(p.muted,p.bg,78)]:['neutral-content-weak','secondary-weak','secondary-plain-weak','button-plain-text-weak'],
    [mix(p.line,'transparent',45)]:['neutral-border'],[mix(p.line,'transparent',25)]:['neutral-border-weak'],[mix(p.line,p.bg,40)]:['neutral-border-divider'],line:['neutral-border-medium'],[p.text]:['neutral-border-strong'],accent:['primary-plain','interactive-focused']};
  const body=Object.entries(vars).map(([token,names])=>names.map(name=>`--color-${name}:${p[token]||token}!important`).join(';')).join(';');
  return `${scope},${scope} :is(.theme-rpl,.theme-beta,.theme-dark,.theme-light){${body}}${scope}{color-scheme:${p.mode};background-color:${p.bg}!important}${scope} ::selection{background:${mix(p.accent,'transparent',35)}}`;
};
RC.icon=name=>{const ns='http://www.w3.org/2000/svg',icon=document.createElementNS(ns,'svg');icon.setAttribute('viewBox','0 0 20 20');icon.setAttribute('aria-hidden','true');icon.setAttribute('class','rc-icon rc-icon-'+name);for(const [tag,attrs] of {sliders:[['path',{d:'M3 5h8M15 5h2M3 10h2M9 10h8M3 15h10'}],['circle',{cx:13,cy:5,r:2}],['circle',{cx:7,cy:10,r:2}],['circle',{cx:15,cy:15,r:2}]],chevron:[['path',{d:'M6 8l4 4 4-4'}]]}[name]){const n=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);icon.append(n);}return icon;};
RC.switch=(label,value,fn,help)=>{const row=RC.el('div',{class:'setting-row'}),copy=RC.el('span',{},label),button=RC.el('button',{type:'button',class:'toggleSwitch','role':'switch','aria-checked':String(value),'aria-label':label});button.addEventListener('click',()=>{const v=button.getAttribute('aria-checked')!=='true';button.setAttribute('aria-checked',String(v));fn(v);});ExtraPotionsCore.setMenuHelp(copy,help);row.append(copy,button);return row;};
RC.HELP={
  "enabled": "Turn Thread’s page tools on or off. Your settings and local records are kept.",
  "rememberSort": "Remember your last native feed and comment sort separately for each community.",
  "readPosts": "Mark keeps local read markers when you open a post or choose Mark read. Mark and hide also hides read posts from feeds; Undo recovers them. Requires a recognized account.",
  "highlights": "Hide community highlights, recommendations and related posts that Reddit suggests.",
  "hideDecorations": "Hide flair, awards, author lines and the native post Save button for a cleaner feed.",
  "unblurSpoilers": "Reveal spoiler-blurred posts automatically as they load.",
  "unblurMature": "Reveal blurred mature media automatically. Works only when Reddit already shows this content to your signed-in account.",
  "communityFilters": "Hide, dim or blur posts from a community in feeds. Add one from Filter r/… in a post’s actions menu.",
  "trackRead": "Count a comment as read after it is at least 60% visible for 1.2 seconds in the foreground. Requires a recognized account.",
  "navButtons": "Show previous and next comment controls on discussions and enable the j, k and o keys.",
  "collapseAutoMod": "Collapse AutoModerator and pinned comments; each stays available to reveal.",
  "nicknameMode": "Choose how locally saved nicknames appear beside authors.",
  "readingStyle": "Font, size and spacing for post and comment text. Code and native controls keep their own fonts.",
  "feedWidth": "Maximum feed and discussion width. 800 keeps Reddit’s width; with the right sidebar collapsed the feed fills the free space.",
  "siteColors": "Recolor Reddit with a palette. Follows Reddit’s light or dark mode; brand, vote and warning colors stay as they are. Choose Reddit to keep its own colors.",
  "menuTheme": "Colors for Thread’s menus and notices only. Reddit follows the site; Gem uses the Pear Crystal facets.",
  "updateNotifications": "Show a notice when a new Thread release is available.",
  "redirect": "Open old.reddit.com pages on modern Reddit."
};
RC.UI=class {
  constructor(runtime){this.r=runtime;runtime.ui=this;
    const palette={id:'thread',name:'Reddit',bg:'#0e1113',panel:'#181c1f',line:'#71828c',text:'#edf1f3',muted:'#b4c1c8',accent:'#203c61',accent2:'#90baff'};
    this.product=ExtraPotionsCore.createProduct({id:'thread',name:'Thread',version:RC.VERSION,subtitle:'Your Reddit, refined.',artwork:RC.ARTWORK,theme:palette,getSettings:()=>({...this.r.settings,menuAutoClose:false}),sections:[['feed','Feed'],['read','Read'],['filters','Filters'],['people','People'],['look','Look'],['system','System']].map(([id,label])=>({id,label,render:()=>this.render(id)}))});
    const style=RC.el('style');style.textContent=`.route-body [aria-disabled=true]{opacity:.6;cursor:default}:host .route-body .setting-row[hidden]{display:none!important}.route-body{min-width:0}.route-body pre{white-space:pre-wrap;overflow-wrap:anywhere;max-width:100%}.route-body .rc-menu-status{font-size:11px}.route-body label{font-size:12px}.route-body .rc-transfer-actions{display:flex;gap:5px}.route-body .rc-transfer-actions>button{flex:1}.setting-row{display:flex;align-items:center;justify-content:space-between;gap:8px}:host .route-body .setting-row{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(62px,48%)!important}:host .route-body .setting-row:has(>button[role=switch]){grid-template-columns:minmax(0,1fr) 34px!important}:host .route-body .setting-row:has(>select){grid-template-columns:minmax(0,1fr) minmax(62px,max-content)!important}:host .route-body .setting-row>select{white-space:nowrap;text-overflow:ellipsis}:host .route-body .setting-row>span{min-width:0;overflow-wrap:normal;word-break:normal}:host .route-body .setting-row>:is(input,select){width:100%!important;max-width:100%!important;min-width:0!important}.setting-row>select,.setting-row>input{max-width:48%}.route-body label{display:grid;gap:4px;margin:8px 0}.route-body textarea,.route-body input{width:100%;color:var(--theme-text);background:var(--theme-panel);border:1px solid var(--theme-muted);border-radius:5px;padding:6px;font:inherit;line-height:1.5}.route-body p{font-size:12px;line-height:1.5;overflow-wrap:anywhere}.route-body button{color:var(--theme-text);background:var(--theme-panel);border:1px solid var(--theme-muted);border-radius:5px;padding:5px 8px;min-height:30px;cursor:pointer}.rc-menu-actions{display:flex;gap:5px;flex-wrap:wrap;margin-block:8px}.rc-menu-status{padding:6px 8px;font-size:12px;color:var(--theme-text);border-bottom:1px solid var(--theme-line)}.rc-menu-status:empty{display:none}.rc-rule{padding:6px 0;border-bottom:1px solid var(--theme-line)}.rc-menu-error{color:#ffaaa6}.route-body pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:11px}.route-body details{margin-block:8px}.route-body summary{cursor:pointer}.header-actions .rc-donate{width:28px;min-width:28px;height:28px;padding:4px}.rc-donate svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8}`;this.product.shadow.append(style);
    this.statusNode=RC.el('div',{class:'rc-menu-status',role:'status','aria-live':'polite'});this.product.panel.querySelector('header').after(this.statusNode);
    this.updates=ExtraPotionsCore.createReleaseUpdateChecker({productId:'thread',repository:'ExtraPotions/Thread',currentVersion:RC.VERSION,enabled:()=>this.r.settings.updateNotifications});
    this.notice=ExtraPotionsCore.createProductNotice({host:this.product.host,shadow:this.product.shadow,panel:this.product.panel,versionButton:this.product.versionButton,onVersion:()=>{if(!this.notice.element.hidden&&this.notice.element.dataset.noticeKind==='current')this.notice.hide();else this.showReleaseNotes();}});
    ExtraPotionsCore.setMenuStatus('thread',()=>this.health());
    this.theme();
    const previous=ExtraPotionsCore.consumeVersionChange('thread',RC.VERSION,'exp:v3:thread:last-version');
    if(previous&&this.r.settings.updateNotifications)this.notice.show({kind:'complete',kicker:'Update Complete',title:'Thread Updated',version:RC.VERSION,text:`Updated from v${previous} to v${RC.VERSION}.`,details:RC.NOTES,releaseUrl:this.releaseUrl(),showAction:false});
    this.checkUpdates();
  }
  releaseUrl(version=RC.VERSION){return 'https://github.com/ExtraPotions/Thread/releases/tag/v'+version;}
  showReleaseNotes(){this.notice.show({kind:'current',kicker:'Current Version',title:'Thread Changelog',version:RC.VERSION,text:`What's new in v${RC.VERSION}.`,details:RC.NOTES,releaseUrl:this.releaseUrl(),showAction:false});}
  async checkUpdates(force=false){
    const result=await this.updates.check(force);if(this.destroyed)return result;
    ExtraPotionsCore.setLauncherUpdate('thread',result.available);
    this.product.launcher.setAttribute('aria-label',result.available?`Open Thread · Update v${result.latest} Available`:'Open Thread');
    if(['failed','checking','disabled'].includes(result.state)){if(force)this.status(result.state==='failed'?'Update check failed. Try again later.':'An update check is already running.');return result;}
    if(result.state!=='disabled'&&result.available&&!result.quiet&&(force||ExtraPotionsCore.claimNotice('thread','available:'+result.latest)))this.notice.show({kind:'available',kicker:'Update Available',title:'Thread Update Available',version:result.latest,text:`v${result.latest} is ready to install.`,details:result.details,releaseUrl:this.releaseUrl(result.latest),actionUrl:result.installUrl,showAction:true});
    else if(force){if(result.state==='failed')this.status('Update check failed. Try again later.');else if(result.state==='checking')this.status('An update check is already running.');else {this.status('Thread is up to date.');this.showReleaseNotes();}}
    return result;
  }
  status(text){this.statusNode.textContent=text;}
  refresh(){const focused=this.product.shadow.activeElement;const label=focused?.getAttribute('aria-label');this.product.renderActive();if(label)[...this.product.shadow.querySelectorAll('[aria-label]')].find(n=>n.getAttribute('aria-label')===label&&n.getClientRects().length)?.focus();this.product.refresh();this.theme();}
  theme(){
    const apply=palette=>ExtraPotionsCore.applyTheme(this.product.host,palette.id,[palette]);
    if(this.r.settings?.gemTheme)return apply({id:'thread-gem',name:'Pear Crystal',bg:'#1e1410',panel:'#2b1d16',line:'#b17a58',text:'#fff0e1',muted:'#e5bfa6',accent:'#c6350d',accent2:'#ffb073',focus:'#ffd0a3',link:'#ffc18a',skinMode:'flat'});
    if(this.r.settings?.theme==='contrast')return apply({id:'contrast',name:'High contrast',bg:'#000000',panel:'#111111',line:'#c8c8c8',text:'#ffffff',muted:'#dddddd',accent:'#252525',accent2:'#ffffff',focus:'#ffffff',skinMode:'flat'});
    // Read the native surface colors without applying a page theme or competing with SHIFT.
    const css=getComputedStyle(document.documentElement),dark=matchMedia('(prefers-color-scheme:dark)').matches;
    const color=(name,fallback)=>{const raw=css.getPropertyValue(name).trim();if(/^#[0-9a-f]{6}$/i.test(raw))return raw;const m=raw.match(/^rgba?\(\s*(\d+)[, ]+\s*(\d+)[, ]+\s*(\d+)/);return m?'#'+m.slice(1,4).map(v=>Number(v).toString(16).padStart(2,'0')).join(''):fallback;};
    apply({id:'reddit-native',name:'Native',bg:color('--color-neutral-background',dark?'#0e1113':'#ffffff'),panel:color('--color-neutral-background-weak',dark?'#181c1f':'#f4f6f7'),line:'#71828c',text:color('--color-neutral-content-strong',dark?'#edf1f3':'#182126'),muted:color('--color-neutral-content',dark?'#b4c1c8':'#4e606a'),accent:dark?'#5c93d7':'#174c99',accent2:dark?'#90baff':'#174c99'});
  }
  health(){
    const r=this.r;
    if(r.store.error)return {state:'attention',reason:r.store.error};
    if(!r.settings.enabled||ExtraPotionsCore.suiteSitePaused())return {state:'paused',reason:'Page tools are paused. Your settings are retained.'};
    if(!r.verified)return {state:'waiting',reason:'Reddit account not recognized. Personal records are paused; page tools remain available.'};
    return {state:'working',reason:'Reading tools are active. Personal records stay local.',checkedAt:Date.now()};
  }
  system(){
    this.healthControl?.dispose();
    this.healthControl=ExtraPotionsCore.createProductTimeline('thread',()=>this.health(),text=>this.status(text),{layout:'grouped',showActivity:false});
    const diagnostics=ExtraPotionsCore.createDiagnosticsControls(()=>this.r.diagnostics(),text=>this.status(text));
    const preferences=this.detail('Settings transfer',this.note('Exports contain your private tags and notes. Import replaces this account’s settings, rules and people.'),RC.button('Export current account',()=>this.export()),this.importForm());
    const system=ExtraPotionsCore.createProductSystem({id:'thread',version:RC.VERSION,timeline:this.healthControl.element,diagnostics,preferences,layout:'grouped',notify:text=>this.status(text),onReset:()=>{this.r.store.reset();this.r.clearRoute();this.r.refreshSettings();this.r.schedule();this.refresh();}});
    const reset=system.querySelector('[data-exp-destructive]');ExtraPotionsCore.setMenuHelp(reset,'Permanently clears this account’s Thread settings and local records. Other products are unaffected. Tap twice within 4 seconds to confirm.');
    system.insertBefore(this.detail('API access',this.note('Optional API enrichment is unavailable. Reading tools use native page content; own registration and approved access are required for enrichment.')),system.querySelector('[data-exp-system-item="reset"]'));
    return system;
  }
  openRoute(id){if(['support','reset'].includes(id)){this.openRoute('system');const target=this.product.panel.querySelector('[data-exp-system-item="'+id+'"]');if(target){target.open=true;target.scrollIntoView({block:'nearest'});}return;}if(!this.product.isOpen)this.product.open();const button=this.product.shadow.querySelector('[data-section="'+id+'"]');if(button?.getAttribute('aria-expanded')!=='true')button?.click();}
  when(node,test){const sync=()=>{node.hidden=!test();};sync();node.dataset.rcConditional='1';return node;}
  row(label,control,help){const row=RC.el('div',{class:'setting-row'}),copy=RC.el('span',{},label);ExtraPotionsCore.setMenuHelp(copy,help);row.append(copy,control);return row;}
  toggle(key,label){return RC.switch(label,this.r.settings[key],v=>this.r.update({[key]:v}),RC.HELP[key]);}
  select(key,label,choices){return this.row(label,RC.select(label,this.r.settings[key],choices,v=>this.r.update({[key]:v})),RC.HELP[key]);}
  number(key,label,min,max){const n=RC.el('input',{type:'number',min,max,value:this.r.settings[key],'aria-label':label});n.addEventListener('change',()=>this.r.update({[key]:Number(n.value)}));return this.row(label,n,RC.HELP[key]);}
  detail(title,...children){const d=RC.el('details');d.append(RC.el('summary',{},title),...children);return d;}
  note(text){return RC.el('p',{class:'note'},text);}
  actions(...buttons){const n=RC.el('div',{class:'rc-menu-actions'});n.append(...buttons);return n;}
  render(id){const root=RC.el('div');const add=(...n)=>root.append(...n);const t=(...a)=>this.toggle(...a),s=(...a)=>this.select(...a),num=(...a)=>this.number(...a),set=this.r.settings;
    const choose=(label,value,choices,fn,help)=>this.row(label,RC.select(label,value,choices,fn),help);
    const removeRule=rule=>{this.r.rules=this.r.rules.filter(r=>r!==rule);this.r.store.set('rules',this.r.rules);this.r.schedule();this.refresh();};
    if(id==='feed'){
      add(t('enabled','Enable Thread'),t('rememberSort','Remember sort per community'),choose('Read posts',set.trackPosts?(set.hideReadPosts?'hide':'mark'):'off',[['off','Off'],['mark','Mark'],['hide','Mark and hide']],v=>this.r.update({trackPosts:v!=='off',hideReadPosts:v==='hide'}),RC.HELP.readPosts),t('highlights','Hide Reddit suggestions'),t('hideDecorations','Hide post decorations'),t('unblurSpoilers','Unblur spoilers'),t('unblurMature','Unblur mature media'));
      const list=RC.el('div'),communities=this.r.rules.filter(r=>r.exact&&r.field==='community');
      for(const rule of communities){list.append(this.row('r/'+rule.pattern,RC.select('Treatment for r/'+rule.pattern,rule.treatment,[['hide','Hide'],['dim','Dim'],['blur','Blur']],v=>this.r.setCommunityFilter(rule.pattern,v))),this.actions(RC.button('Remove r/'+rule.pattern,()=>this.r.setCommunityFilter(rule.pattern,null))));}
      if(!communities.length)list.append(this.note(this.r.verified?'No filtered communities. Use Filter r/… in a post’s actions menu to add one.':'Personal records are paused until the native Reddit account is recognized.'));
      const filtered=this.detail('Community filters',list);ExtraPotionsCore.setMenuHelp(filtered.querySelector('summary'),RC.HELP.communityFilters);add(filtered);
    }
    if(id==='read'){
      add(this.detail('Local collections',this.note('Keep up to 500 local post/comment bookmarks with collections and private notes. Separate from Reddit Saved.'),RC.button('Open local collections',()=>this.r.collections())));
      add(t('trackRead','Track read comments'),t('navButtons','Comment navigation'),t('collapseAutoMod','Collapse AutoModerator and pinned'));
    }
    if(id==='filters'){
      for(const rule of this.r.rules.filter(r=>!(r.exact&&r.field==='community'))){const line=RC.el('div',{class:'rc-rule'});line.append(RC.el('p',{},rule.field+': '+rule.pattern+' · '+rule.target+' · '+rule.treatment+(rule.regex?' · regex':'')),RC.button('Remove rule '+(Number(rule.id)+1),()=>removeRule(rule)));if(this.r.regexErrors.has(rule.id))line.append(RC.el('p',{class:'rc-menu-error'},this.r.regexErrors.get(rule.id)));add(line);}
      const form=RC.el('form');const inputs={};const field=(key,title,options)=>{const input=options?RC.select(title,options[0],options,()=>{}):RC.el('input',{'aria-label':title,maxlength:key==='pattern'?'256':'200'});inputs[key]=input;const label=RC.el('label',{},title);label.append(input);form.append(label);};field('field','Match field',['text','title','domain','community','author','flair']);field('pattern','Pattern');field('target','Content',['both','post','comment']);field('scope','Only communities (comma separated)');field('except','Except communities (comma separated)');field('treatment','Treatment',['hide','dim','blur']);let regex=false;form.append(RC.switch('Regex rule',false,v=>regex=v));const submit=RC.el('button',{type:'submit'},'Add local rule');form.append(submit);form.addEventListener('submit',e=>{e.preventDefault();if(!this.r.verified)return this.status('Account identity is unverified; private rules are paused.');if(this.r.rules.length>=100)return this.status('Rule capacity reached (100). Remove a rule first.');const rule=Object.fromEntries(Object.entries(inputs).map(([k,n])=>[k,n.value]));this.r.rules=RC.Model.rules([...this.r.rules,{...rule,regex}]);this.r.store.set('rules',this.r.rules);this.r.schedule();this.refresh();});
      add(this.detail('Add rule',form),this.detail('Hidden history',this.note('History stores IDs and reasons, not post bodies. Up to 100 items are kept for 30 days.'),this.actions(RC.button('Show hidden history',()=>{const list=RC.el('div');for(const h of this.r.history.slice().reverse()){const line=RC.el('p',{},h.id+' · '+h.reason+' · '+new Date(h.at).toLocaleDateString());line.append(RC.button('Reveal if loaded',()=>{this.r.revealed.add(h.id);this.r.schedule();this.r.closeOverlay();}));list.append(line);}if(!this.r.history.length)list.append(this.note('No hidden posts recorded.'));this.r.popover('Recent hidden posts',list);}),RC.button('Clear hidden history',()=>{this.r.history=[];this.r.store.set('history',[]);this.status('Hidden history cleared; tags retained.');}))));
    }
    if(id==='people'){add(s('nicknameMode','Nickname display',['profile','nickname','both']));for(const [user,p]of Object.entries(this.r.people)){add(this.actions(RC.button(user+(p.tag?' · '+p.tag:''),()=>this.r.editPerson({author:user})),RC.button('Remove '+user,()=>{this.r.store.setPerson(user,{});this.r.people=this.r.store.people();this.r.schedule();this.refresh();})));}if(!Object.keys(this.r.people).length)add(this.note(this.r.verified?'No saved people. Use Tag / note beside an author to add one.':'Personal records are paused until the native Reddit account is recognized.'));
    }
    if(id==='look'){
      const preset=Object.entries(RC.PRESETS).find(([,p])=>Object.entries(p).every(([k,v])=>set[k]===v))?.[0]||'custom';
      add(choose('Reading style',preset,[...(preset==='custom'?[['custom','Custom']]:[]),['native','Reddit'],['comfortable','Comfortable'],['dense','Dense'],['book','Book']],v=>this.r.readingPreset(v),RC.HELP.readingStyle),num('feedWidth','Content width (px)',320,1600),ExtraPotionsCore.createSiteColorControl({value:set.siteColors,offLabel:'Reddit',onChange:v=>this.r.update({siteColors:v}),help:RC.HELP.siteColors}),choose('Menu theme',set.gemTheme?'gem':set.theme,[['native','Reddit'],['contrast','High contrast'],['gem','Gem']],v=>this.r.update({gemTheme:v==='gem',theme:v==='contrast'?'contrast':'native'}),RC.HELP.menuTheme),ExtraPotionsCore.createMenuSizeControls(),t('updateNotifications','Update notifications'),this.row('Check for updates now',RC.button('Check now',()=>this.checkUpdates(true))));
    }
    if(id==='system')add(RC.switch('Open old Reddit links on modern Reddit',set.redirect==='redirect',v=>this.r.update({redirect:v?'redirect':'off'}),RC.HELP.redirect),this.system());
    return root;
  }
  export(){if(!this.r.verified)return this.status('Account identity must be verified before export.');const value={schema:1,settings:this.r.settings,rules:this.r.rules,people:this.r.people,library:this.r.library};const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=RC.el('a',{href:url,download:'reddit-companion-local.json'});a.click();setTimeout(()=>URL.revokeObjectURL(url),0);}
  importForm(){const root=RC.el('div'),input=RC.el('textarea',{'aria-label':'Companion export JSON',maxlength:'500000',placeholder:'Paste a companion export'});root.append(input,RC.button('Validate import',()=>{try{if(!this.r.verified)throw Error('Account identity must be verified before import.');if(input.value.length>500000)throw Error('Import exceeds 500 KB.');const value=RC.Model.validateImport(JSON.parse(input.value));const panel=RC.el('div');panel.append(this.note('Replace settings, rules and people for the current account? This cannot be undone.'),RC.button('Confirm import',()=>{for(const [k,v]of Object.entries(value))this.r.store.set(k,v);this.r.clearRoute();this.r.refreshSettings();this.r.schedule();this.refresh();this.status('Local data imported.');}),RC.button('Cancel',()=>this.r.closeOverlay()));this.r.popover('Confirm local import',panel);}catch(error){this.status('Import rejected: '+error.message);}}));return root;}
  destroy(){this.destroyed=true;this.healthControl?.dispose();this.notice?.destroy();this.product.destroy();}
};

// Copyright expDARE. Local build; no publication or installed-script modification.
if(window.top===window.self&&['www.reddit.com','sh.reddit.com','old.reddit.com'].includes(location.hostname)&&!document.getElementById('exp-thread-root')){
  let active;
  const boot=()=>{
  if(active&&!active.destroyed)return;
  ExtraPotionsCore.registerDiagnosticsProduct('thread',RC.VERSION);
  const store=new RC.Store();
  const runtime=new RC.Runtime(store);runtime.accountCheck();
  RC.ARTWORK=URL.createObjectURL(new Blob([RC.GEM],{type:'image/svg+xml'}));
  const ui=new RC.UI(runtime);
  active=runtime;
  runtime.schedule();
  };
  addEventListener('pagehide',()=>active?.destroy());
  addEventListener('pageshow',event=>{if(event.persisted)boot();});
  boot();
}

})();
