/* Two islands of SocialIQA support: lexical bimodality — SVG + GSAP.
   Brief: docs/research-animations/agent-handoff/briefs/10_lexical_bimodality.md

   Claim shown: SocialIQA's top-20 high-influence bins split 10/10 between
   interactional formats (dialogic + personal) and expository/structured
   formats; relative to the expository island, interactional bins are much
   shorter and richer in mental-state and dialogue markers; the signature
   interactional bin (Literature × Customer Support) is short, second-person
   heavy, dialogue-rich text. Approved headline claim #8.

   Data honesty: the 10/10 COUNT is measured (LEXICAL.socialiqaTop20), but
   which specific ranked bin sits in which island is not transcribed — so
   rank labels are shown only while the cards form a ranked list and fade
   during the split; the islands claim only the counts. Only the signature
   bin keeps an identity (its dialogic lexical profile is transcribed). The
   per-card island assignment is seeded-illustrative and caveated on screen.

   The SVG is authored in its FINAL poster state; the timeline animates
   toward it (fromTo immediateRender hides final elements at build; cards
   fly from a transient ranked grid to their authored island slots). Static
   fallback == reduced motion == progress(1) == poster. No raw training
   text or document IDs anywhere. */

import { BENCHMARKS, LEXICAL, PROJECT } from "./socialtda-data.js";
import { benchmarkColor, UI_COLORS } from "./socialtda-palettes.js";
import { svgEl, text, formatSigned, spokenSigned, formatInt, createDocumentGlyph } from "./socialtda-svg-utils.js";
import {
  makeSeekBeat, attachBeatControls, applyInitialPosition, makeSceneApi
} from "./socialtda-timeline-utils.js";

const VB_W = 1280;
const VB_H = 720;
/* Central square-crop zone: content inside x ∈ [280, 1000] survives a 1:1
   crop of the 16:9 render. */
const SQUARE_X = (VB_W - VB_H) / 2;
const CX = VB_W / 2;

export const BEATS = ["topbins", "split", "features", "signature", "takeaway"];

const TAKEAWAY = "Social reasoning support is bimodal.";

function signedInt(v) {
  return (v < 0 ? "−" : "+") + formatInt(Math.abs(v));
}
function spokenSignedInt(v) {
  return (v < 0 ? "minus " : "plus ") + formatInt(Math.abs(v));
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildLexicalBimodalityAnimation(container, options = {}) {
  const opts = Object.assign({
    autoplay: true,
    loop: false,
    reducedMotion: null,   // null = follow prefers-reduced-motion
    stage: null,           // beat name or index to seek to
    end: false,            // jump to deterministic final frame
    reviewMode: false,     // hide public identifiers
    controls: true,
    showSquareGuide: false // dev aid: outline the square-crop zone
  }, options);

  const prefersReduced = typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reduced = opts.reducedMotion === null ? prefersReduced : !!opts.reducedMotion;
  const gsap = window.gsap;
  const animated = !reduced && !!gsap;

  const top20 = LEXICAL.socialiqaTop20;
  const profile = LEXICAL.literatureCustomerSupportProfile;
  const contrast = LEXICAL.socialVsExpositoryContrast;
  const socialiqa = BENCHMARKS.find(function (b) { return b.key === "socialiqa"; });

  const CAPTIONS = [
    "SocialIQA's top-" + top20.bins + " high-influence bins.",
    "They split " + top20.interactional + " / " + top20.expository + " — interactional vs expository.",
    "Different communicative forms.",
    "Short, dialogue-rich, support-like text."
  ];
  const CAVEATS = [
    "Counts are the measured " + top20.interactional + "/" + top20.expository +
      " split; which unlabeled card sits in which island is illustrative.",
    "OLMo3-7B / Dolma3 · stratified working set · aggregate lexical statistics — no raw text shown."
  ];

  const ariaLabel = "Animated diagram. " + socialiqa.name + "'s top-" + top20.bins +
    " high-influence bins split " + top20.interactional + " and " + top20.expository +
    " between interactional (dialogic and personal) and expository or structured formats. " +
    "The interactional minus expository contrast: " +
    spokenSignedInt(contrast.meanWordsPerDocDelta) + " mean words per document, " +
    spokenSigned(contrast.mentalStatePer1kDelta, 2) +
    " mental-state terms per 1,000 words, dialogue z " +
    spokenSigned(contrast.dialogueZDelta, 2) + ", social z " +
    spokenSigned(contrast.socialZDelta, 2) +
    ". The signature interactional bin, Literature × Customer Support, averages " +
    profile.meanWords + " words per document, " + profile.secondPersonPer1k +
    " second-person pronouns and " + profile.mentalStatePer1k +
    " mental-state terms per 1,000 words, dialogue z " +
    spokenSigned(profile.dialogueZ, 2) + ", social z " +
    spokenSigned(profile.socialZ, 2) +
    ". Social reasoning support is bimodal — not all high-influence text is conversational. " +
    "OLMo3-7B / Dolma3 setting.";

  // ---------- scaffold ----------
  const root = document.createElement("div");
  root.className = "socialtda-animation stda-lexical-bimodality" + (animated ? "" : " is-static");
  container.appendChild(root);

  const svg = svgEl("svg", {
    class: "stda-svg",
    viewBox: "0 0 " + VB_W + " " + VB_H,
    role: "img",
    "aria-label": ariaLabel
  }, root);
  const svgTitle = svgEl("title", {}, svg);
  svgTitle.textContent = "Lexical bimodality: two islands of SocialIQA support";

  // Opaque background so exported frames are clean.
  svgEl("rect", { x: 0, y: 0, width: VB_W, height: VB_H, fill: UI_COLORS.background }, svg);

  if (opts.showSquareGuide) {
    svgEl("rect", {
      x: SQUARE_X + 0.5, y: 0.5, width: VB_H - 1, height: VB_H - 1,
      fill: "none", stroke: "#D8D8D8", "stroke-dasharray": "6 5"
    }, svg);
    text(svg, SQUARE_X + 10, 22, "square crop", { "font-size": 12, fill: "#B9B9B9" });
  }

  // ---------- header (final state) ----------
  const kicker = text(svg, CX, 76, "SOCIALIQA LEXICAL BIMODALITY — TOP-" + top20.bins + " BINS", {
    "text-anchor": "middle", "font-size": 13, "font-weight": 700,
    "letter-spacing": 2.2, fill: UI_COLORS.slate
  });
  const title = text(svg, CX, 118, "Two islands of high-influence text", {
    "text-anchor": "middle", "font-size": 34, "font-weight": 800, fill: UI_COLORS.ink
  });

  // ---------- SocialIQA chip + links to both islands (final state) ----------
  const chip = svgEl("g", {}, svg);
  svgEl("rect", { x: CX - 75, y: 140, width: 150, height: 26, rx: 13,
    fill: benchmarkColor(socialiqa.name) }, chip);
  text(chip, CX, 153, socialiqa.short, {
    "text-anchor": "middle", "dominant-baseline": "central",
    "font-size": 13, "font-weight": 700, fill: "#FFFFFF"
  });
  const linkLeft = svgEl("path", {
    d: "M" + (CX - 20) + " 166 Q560 184 470 200",
    fill: "none", stroke: UI_COLORS.gridStroke, "stroke-width": 2
  }, svg);
  const linkRight = svgEl("path", {
    d: "M" + (CX + 20) + " 166 Q720 184 810 200",
    fill: "none", stroke: UI_COLORS.gridStroke, "stroke-width": 2
  }, svg);

  // ---------- islands (final state) ----------
  const ISLANDS = [
    { x: 320, cx: 470, name: "interactional", count: top20.interactional,
      feature: "dialogic + personal · shorter · mental-state terms", kind: "speech" },
    { x: 660, cx: 810, name: "expository / structured", count: top20.expository,
      feature: "documentation-like · longer · formal", kind: "doc" }
  ];
  const islandEls = ISLANDS.map(function (isl) {
    const g = svgEl("g", {}, svg);
    svgEl("rect", { x: isl.x, y: 200, width: 300, height: 168, rx: 14,
      fill: "#FCFBFD", stroke: "#DDD8E4", "stroke-width": 1.5 }, g);
    if (isl.kind === "speech") {
      // Two small speech bubbles.
      svgEl("rect", { x: isl.x + 18, y: 210, width: 16, height: 11, rx: 3,
        fill: "#FFFFFF", stroke: UI_COLORS.slate, "stroke-width": 1.2 }, g);
      svgEl("path", { d: "M" + (isl.x + 22) + " 221 l2.5 4 l1.5 -4 Z", fill: UI_COLORS.slate }, g);
      svgEl("rect", { x: isl.x + 27, y: 216, width: 16, height: 11, rx: 3,
        fill: UI_COLORS.gridFill, stroke: UI_COLORS.slate, "stroke-width": 1.2 }, g);
    } else {
      createDocumentGlyph(g, isl.x + 20, 208, 15, 20, {
        stroke: UI_COLORS.slate, foldFill: "#E7E8EC", lineFill: "#C9CBD1"
      });
    }
    text(g, isl.x + 50, 224, isl.name, {
      "font-size": 12.5, "font-weight": 700, fill: UI_COLORS.slate
    });
    text(g, isl.x + 286, 224, isl.count + " of " + top20.bins, {
      "text-anchor": "end", "font-size": 12, "font-weight": 700, fill: UI_COLORS.ink
    });
    const featureLine = text(g, isl.cx, 348, isl.feature, {
      "text-anchor": "middle", "font-size": 11, fill: UI_COLORS.slate
    });
    return { g, featureLine, isl };
  });

  // ---------- the 20 bin cards (final state = island slots) ----------
  /* Ranked-grid start positions (transient): 5 × 4 centered under the title. */
  function gridPos(i) {
    return { x: 520 + (i % 5) * 60 - 22, y: 224 + Math.floor(i / 5) * 44 - 15 };
  }
  /* Island slot positions: 2 rows × 5 per island. */
  function slotPos(islandIndex, s) {
    const baseX = ISLANDS[islandIndex].x + 20;
    return { x: baseX + (s % 5) * 54, y: s < 5 ? 246 : 288 };
  }
  /* Rank 1 (the signature bin) goes to the interactional island, slot 0 —
     supported by its transcribed dialogic profile. The remaining assignment
     is seeded-illustrative (only the 10/10 count is a claim). */
  const rand = mulberry32(top20.bins);
  const remaining = [];
  for (let r = 2; r <= top20.bins; r++) remaining.push(r);
  const leftRanks = [1];
  while (leftRanks.length < top20.interactional) {
    const pick = Math.floor(rand() * remaining.length);
    leftRanks.push(remaining.splice(pick, 1)[0]);
  }
  const cards = [];
  let leftSlot = 0, rightSlot = 0;
  for (let rankIdx = 0; rankIdx < top20.bins; rankIdx++) {
    const rank = rankIdx + 1;
    const left = leftRanks.indexOf(rank) !== -1;
    const slot = left ? slotPos(0, leftSlot++) : slotPos(1, rightSlot++);
    const start = gridPos(rankIdx);
    const g = svgEl("g", {}, svg);
    svgEl("rect", { x: slot.x, y: slot.y, width: 44, height: 30, rx: 6,
      fill: "#FFFFFF", stroke: "#C9CBD1", "stroke-width": 1.2 }, g);
    // Rank label: shown only while the cards form a ranked list (transient).
    const rankLabel = text(g, slot.x + 22, slot.y + 15, "#" + rank, {
      "text-anchor": "middle", "dominant-baseline": "central",
      "font-size": 12, "font-weight": 700, fill: UI_COLORS.slate, opacity: 0
    });
    cards.push({ g, rankLabel, rank, dx: start.x - slot.x, dy: start.y - slot.y, isSignature: rank === 1 });
  }
  /* Ring around the signature card (drawn during the signature beat). */
  const sigSlot = slotPos(0, 0);
  const ring = svgEl("rect", {
    x: sigSlot.x - 5, y: sigSlot.y - 5, width: 54, height: 40, rx: 9,
    fill: "none", stroke: benchmarkColor(socialiqa.name), "stroke-width": 2.5
  }, svg);

  // ---------- contrast strip + signature profile (final state) ----------
  const deltaStrip = text(svg, CX, 392,
    "interactional − expository: " + signedInt(contrast.meanWordsPerDocDelta) +
    " words per doc · " + formatSigned(contrast.mentalStatePer1kDelta, 2) +
    " mental-state terms per 1k · dialogue z " + formatSigned(contrast.dialogueZDelta, 2) +
    " · social z " + formatSigned(contrast.socialZDelta, 2), {
      "text-anchor": "middle", "font-size": 12, fill: UI_COLORS.faint
    });
  const sigLine1 = text(svg, CX, 424,
    "Literature × Customer Support — the signature interactional bin", {
      "text-anchor": "middle", "font-size": 13.5, "font-weight": 700, fill: UI_COLORS.ink
    });
  const sigLine2 = text(svg, CX, 446,
    profile.meanWords + " mean words · " + profile.secondPersonPer1k +
    " second-person /1k · " + profile.mentalStatePer1k +
    " mental-state terms /1k · dialogue z " + formatSigned(profile.dialogueZ, 2) +
    " · social z " + formatSigned(profile.socialZ, 2), {
      "text-anchor": "middle", "font-size": 12, fill: UI_COLORS.slate
    });

  // ---------- captions / takeaway / caveats ----------
  const captionEls = CAPTIONS.map(function (s) {
    return text(svg, CX, 506, s, {
      "text-anchor": "middle", "font-size": 18, "font-weight": 600,
      fill: UI_COLORS.slate, opacity: 0
    });
  });
  const takeaway = text(svg, CX, 506, TAKEAWAY, {
    "text-anchor": "middle", "font-size": 21, "font-weight": 800, fill: UI_COLORS.ink
  });
  const caveat1 = text(svg, CX, 536, CAVEATS[0], {
    "text-anchor": "middle", "font-size": 12.5, fill: UI_COLORS.slate
  });
  const caveat2 = text(svg, CX, 555, CAVEATS[1], {
    "text-anchor": "middle", "font-size": 12.5, fill: UI_COLORS.slate
  });

  // ---------- footer (public identifier — omitted entirely in review mode) ----------
  let footer = null;
  if (!opts.reviewMode) {
    footer = text(svg, CX, 650, PROJECT.shortName + " · " + PROJECT.publicUrl, {
      "text-anchor": "middle", "font-size": 12.5, "font-weight": 600, fill: UI_COLORS.slate
    });
  }

  // ---------- static fallback path ----------
  if (!animated) {
    // Authored DOM already shows the final frame; rank labels stay hidden.
    return makeSceneApi({ svg, root, timeline: null });
  }

  // ---------- timeline ----------
  const tl = gsap.timeline({
    paused: true,
    repeat: opts.loop ? -1 : 0,
    repeatDelay: opts.loop ? 1.6 : 0
  });

  function fadeUp(el, pos, dur) {
    tl.fromTo(el, { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: dur || 0.5, ease: "power2.out" }, pos);
  }
  function captionSwap(idx, pos) {
    if (idx > 0) tl.to(captionEls[idx - 1], { opacity: 0, duration: 0.3 }, pos - 0.1);
    tl.fromTo(captionEls[idx], { opacity: 0 }, { opacity: 1, duration: 0.4 }, pos + 0.15);
  }

  // Beat 1 — the ranked top-20 list.
  tl.addLabel("topbins", 0);
  fadeUp(kicker, 0, 0.45);
  fadeUp(title, 0.12, 0.55);
  captionSwap(0, 0.35);
  cards.forEach(function (card, i) {
    // Hold the card at its ranked-grid offset while it fades in.
    tl.fromTo(card.g,
      { x: card.dx, y: card.dy, opacity: 0 },
      { x: card.dx, y: card.dy, opacity: 1, duration: 0.35, ease: "power2.out" },
      0.9 + i * 0.05);
    /* Rank labels are visible from the start of the animated run (authored
       hidden) and fade out BEFORE this card's flight begins, so no moving
       card ever carries a rank — a mid-flight frame cannot be read as a
       per-bin island claim (the assignment beyond #1 is illustrative). */
    tl.fromTo(card.rankLabel, { opacity: 1 }, { opacity: 0, duration: 0.3 },
      2.62 + i * 0.03);
  });

  // Beat 2 — the 10/10 split into two islands.
  tl.addLabel("split", 2.6);
  captionSwap(1, 2.6);
  islandEls.forEach(function (el, i) {
    tl.fromTo(el.g, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 2.65 + i * 0.12);
  });
  cards.forEach(function (card, i) {
    tl.to(card.g, { x: 0, y: 0, duration: 0.8, ease: "power2.inOut" }, 2.95 + i * 0.07);
  });

  // Beat 3 — feature meters + measured contrast.
  tl.addLabel("features", 5.6);
  captionSwap(2, 5.6);
  islandEls.forEach(function (el, i) {
    tl.fromTo(el.featureLine, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 5.75 + i * 0.15);
  });
  tl.fromTo(deltaStrip, { opacity: 0 }, { opacity: 1, duration: 0.45 }, 6.15);

  // Beat 4 — the signature interactional bin.
  tl.addLabel("signature", 8.2);
  captionSwap(3, 8.2);
  ring.setAttribute("pathLength", "1");
  ring.setAttribute("stroke-dasharray", "1");
  tl.fromTo(ring,
    { attr: { "stroke-dashoffset": 1 } },
    { attr: { "stroke-dashoffset": 0 }, duration: 0.6, ease: "power1.inOut" },
    8.35);
  fadeUp(sigLine1, 8.6, 0.5);
  tl.fromTo(sigLine2, { opacity: 0 }, { opacity: 1, duration: 0.45 }, 8.85);

  // Beat 5 — end card: both islands feed SocialIQA.
  tl.addLabel("takeaway", 11.2);
  tl.to(captionEls[3], { opacity: 0, duration: 0.3 }, 11.1);
  tl.fromTo(chip, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, 11.3);
  [linkLeft, linkRight].forEach(function (link, i) {
    link.setAttribute("pathLength", "1");
    link.setAttribute("stroke-dasharray", "1");
    tl.fromTo(link,
      { attr: { "stroke-dashoffset": 1 } },
      { attr: { "stroke-dashoffset": 0 }, duration: 0.5, ease: "power1.inOut" },
      11.5 + i * 0.15);
  });
  fadeUp(takeaway, 11.9, 0.55);
  tl.fromTo(caveat1, { opacity: 0 }, { opacity: 1, duration: 0.45 }, 12.2);
  tl.fromTo(caveat2, { opacity: 0 }, { opacity: 1, duration: 0.45 }, 12.35);
  if (footer) tl.fromTo(footer, { opacity: 0 }, { opacity: 1, duration: 0.45 }, 12.55);

  // Final hold so exports keep the takeaway on screen.
  tl.to({}, { duration: 1.25 }, 13.1);

  // ---------- controls + initial position ----------
  const seekBeat = makeSeekBeat(tl, BEATS);
  let syncPlayUi = null;
  if (opts.controls) syncPlayUi = attachBeatControls(root, tl, BEATS, seekBeat).syncPlayUi;
  applyInitialPosition(tl, opts, seekBeat);
  if (syncPlayUi) syncPlayUi();

  return makeSceneApi({ svg, root, timeline: tl, seekBeat, syncPlayUi });
}
