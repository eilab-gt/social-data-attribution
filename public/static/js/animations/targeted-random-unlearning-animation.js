/* Influence-targeted vs random in-topic unlearning — SVG + GSAP animation.
   Brief: docs/research-animations/agent-handoff/briefs/12_targeted_vs_random_unlearning.md

   Claim shown: for SocialIQA, influence-targeted forget sets damage the
   intended benchmark more than random in-topic controls (median paired
   difference d = +0.0160, 95% CI [+0.0130, +0.0220], n = 72, Wilcoxon
   pBH ≈ 1.0e−5); the comparison benchmarks are weaker (MMLU STEM, CI
   crosses zero), not significant (MMLU Social Sciences), or reversed at
   the noise floor (ARC-Challenge). All four results are shown — the mixed
   outcomes bound the claim and are never hidden (brief guardrail).

   Values come from UNLEARNING in the shared data module. The result panel
   is a paired-difference forest plot: dot = median d, whiskers = 95% CI,
   dashed zero line = no difference between targeted and random.

   The SVG is authored in its FINAL poster state; transient story elements
   (topic card, the two selection lanes with stylized document icons, the
   unlearning box, beat captions) are authored hidden. Static fallback ==
   reduced motion == progress(1) == poster. Seeded PRNG only. */

import { BENCHMARKS, UNLEARNING, PROJECT } from "./socialtda-data.js";
import { benchmarkColor, mix, INFLUENCE_COLORS, UI_COLORS } from "./socialtda-palettes.js";
import { svgEl, text, formatSigned, spokenSigned, createDocumentGlyph } from "./socialtda-svg-utils.js";
import {
  makeSeekBeat, attachBeatControls, applyInitialPosition, makeSceneApi
} from "./socialtda-timeline-utils.js";

const VB_W = 1280;
const VB_H = 720;
/* Central square-crop zone: content inside x ∈ [280, 1000] survives a 1:1
   crop of the 16:9 render. */
const SQUARE_X = (VB_W - VB_H) / 2;
const CX = VB_W / 2;

export const BEATS = ["lanes", "select", "unlearn", "results", "takeaway"];

const CAPTIONS = [
  "Control vs. targeted selection.",
  "Same topic — different documents.",
  "Same unlearning procedure — measure accuracy damage γ.",
  "Strongest validation: SocialIQA."
];

const TAKEAWAY = "Attribution identifies load-bearing documents most clearly for SocialIQA.";
const CAVEATS = [
  "Partial validation — strongest for SocialIQA; weaker, null, or reversed for the comparison benchmarks.",
  "OLMo3-7B / Dolma3 · stratified working set · icons and selection are illustrative — no raw documents shown."
];

/* Short badge wording per benchmark (faithful compressions of the data
   module's verdict strings; full verdicts are spoken in the aria label). */
const BADGES = {
  socialiqa: "clean paired result",
  mmlu_stem: "weaker — CI crosses zero",
  mmlu_social_sciences: "not significant",
  arc_challenge: "reversed / noise floor"
};

/* Forest-plot x scale: paired difference d → x. */
const PLOT_X0 = 560, PLOT_X1 = 950;
const D_MIN = -0.006, D_MAX = 0.024;
function xOf(d) { return PLOT_X0 + ((d - D_MIN) / (D_MAX - D_MIN)) * (PLOT_X1 - PLOT_X0); }
const TICKS = [-0.005, 0, 0.01, 0.02];

/* Enough decimals to print each transcribed value exactly (min 3). */
function dDecimals(v) {
  const s = Math.abs(v).toFixed(4);
  return s.endsWith("0") ? 3 : 4;
}
function pText(w) { return String(w).replace(/-/g, "−"); }

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildTargetedRandomUnlearningAnimation(container, options = {}) {
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

  const rows = UNLEARNING.pairedInfluenceVsRandom.map(function (u) {
    return { u, bench: BENCHMARKS.find(function (b) { return b.key === u.key; }) };
  });
  const hero = rows.find(function (r) { return r.u.key === "socialiqa"; });
  const comps = rows.filter(function (r) { return r !== hero; });
  const nPairs = hero.u.n;

  const ariaLabel = "Animated chart. Influence-targeted forget sets are compared " +
    "with random in-topic controls under the same unlearning procedure (" +
    nPairs + " pairs). Median paired difference in accuracy damage: " +
    rows.map(function (r) {
      return r.bench.name + " " + spokenSigned(r.u.medianD, dDecimals(r.u.medianD)) +
        ", 95 percent CI " + spokenSigned(r.u.ci[0], dDecimals(r.u.ci[0])) + " to " +
        spokenSigned(r.u.ci[1], dDecimals(r.u.ci[1])) + " — " + r.u.verdict;
    }).join("; ") +
    ". Partial validation, strongest for SocialIQA, in the OLMo3-7B / Dolma3 setting.";

  // ---------- scaffold ----------
  const root = document.createElement("div");
  root.className = "socialtda-animation stda-unlearning-contrast" + (animated ? "" : " is-static");
  container.appendChild(root);

  const svg = svgEl("svg", {
    class: "stda-svg",
    viewBox: "0 0 " + VB_W + " " + VB_H,
    role: "img",
    "aria-label": ariaLabel
  }, root);
  const svgTitle = svgEl("title", {}, svg);
  svgTitle.textContent = "Influence-targeted vs random in-topic unlearning: paired damage differences";

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
  const kicker = text(svg, CX, 76, "UNLEARNING VALIDATION — TARGETED VS RANDOM", {
    "text-anchor": "middle", "font-size": 13, "font-weight": 700,
    "letter-spacing": 2.2, fill: UI_COLORS.slate
  });
  const title = text(svg, CX, 118, "Attribution suggests; unlearning tests.", {
    "text-anchor": "middle", "font-size": 30, "font-weight": 800, fill: UI_COLORS.ink
  });
  const subline = text(svg, CX, 150,
    "Influence-targeted vs random in-topic forget sets · same unlearning procedure · n = " +
    nPairs + " pairs", {
      "text-anchor": "middle", "font-size": 13.5, fill: UI_COLORS.slate
    });

  // ---------- forest plot (final state) ----------
  const PANEL_LEFT = 340;
  const panelCap1 = text(svg, PANEL_LEFT, 196,
    "Paired difference in accuracy damage: d = γ(targeted) − γ(random) · γ = A_baseline − A_unlearned", {
      "font-size": 12, fill: UI_COLORS.faint
    });
  const panelCap2 = text(svg, PANEL_LEFT, 214,
    "positive d → influence-targeted forgetting damages that benchmark more than random in-topic", {
      "font-size": 12, fill: UI_COLORS.faint
    });

  /* Axis sits below the last row's badge sub-line (y = 458 + 10) so the
     verdict pills never paint over it. */
  const AXIS_Y = 470;
  const zeroX = xOf(0);
  const zeroLine = svgEl("line", {
    x1: zeroX, y1: 238, x2: zeroX, y2: AXIS_Y,
    stroke: "#B9B9B9", "stroke-width": 1.5, "stroke-dasharray": "5 4"
  }, svg);
  const axisG = svgEl("g", {}, svg);
  svgEl("line", { x1: PLOT_X0, y1: AXIS_Y, x2: PLOT_X1, y2: AXIS_Y, stroke: "#D0D0D0", "stroke-width": 1.5 }, axisG);
  TICKS.forEach(function (t2) {
    const x = xOf(t2);
    svgEl("line", { x1: x, y1: AXIS_Y, x2: x, y2: AXIS_Y + 5, stroke: "#B9B9B9", "stroke-width": 1.5 }, axisG);
    text(axisG, x, AXIS_Y + 17, t2 === 0 ? "0" : formatSigned(t2, Math.abs(t2) < 0.01 ? 3 : 2), {
      "text-anchor": "middle", "font-size": 11, fill: UI_COLORS.faint
    });
  });
  const annotRight = text(svg, zeroX + 10, AXIS_Y + 33, "targeted damages more →", {
    "font-size": 11.5, "font-weight": 600, fill: UI_COLORS.slate
  });
  const annotLeft = text(svg, zeroX - 10, AXIS_Y + 33, "← random more", {
    "text-anchor": "end", "font-size": 11.5, fill: UI_COLORS.faint
  });

  /* One forest row: label, CI whisker, median dot, printed median. */
  function buildRow(r, y, isHero) {
    const g = svgEl("g", {}, svg);
    const color = benchmarkColor(r.bench.name);
    const label = text(g, 545, y, r.bench.short, {
      "text-anchor": "end", "dominant-baseline": "central",
      "font-size": isHero ? 14 : 12.5, "font-weight": 700, fill: color
    });
    const ciX0 = xOf(r.u.ci[0]), ciX1 = xOf(r.u.ci[1]);
    const whisker = svgEl("g", {}, g);
    svgEl("line", { x1: ciX0, y1: y, x2: ciX1, y2: y, stroke: UI_COLORS.slate, "stroke-width": 2.5 }, whisker);
    [ciX0, ciX1].forEach(function (x) {
      svgEl("line", { x1: x, y1: y - 5, x2: x, y2: y + 5, stroke: UI_COLORS.slate, "stroke-width": 2.5 }, whisker);
    });
    const dot = svgEl("circle", {
      cx: xOf(r.u.medianD), cy: y, r: isHero ? 8 : 5.5,
      fill: color, stroke: "#FFFFFF", "stroke-width": 1.5
    }, g);
    const median = text(g, xOf(r.u.medianD), y - (isHero ? 16 : 13),
      formatSigned(r.u.medianD, dDecimals(r.u.medianD)), {
        "text-anchor": "middle", "font-size": isHero ? 14 : 11.5,
        "font-weight": isHero ? 800 : 600, fill: isHero ? UI_COLORS.ink : UI_COLORS.slate
      });
    return { g, label, whisker, dot, median, color };
  }

  /* Verdict badge pill, right-anchored. */
  function buildBadge(g, y, key, isHero) {
    const label = BADGES[key];
    const w = label.length * 6.2 + 18;
    const badge = svgEl("g", {}, g);
    svgEl("rect", {
      x: PLOT_X1 - w, y: y - 10, width: w, height: 20, rx: 10,
      fill: isHero ? UI_COLORS.ink : "#F0F0F2",
      stroke: isHero ? "none" : "#D8D8DC", "stroke-width": isHero ? 0 : 1
    }, badge);
    text(badge, PLOT_X1 - w / 2, y, label, {
      "text-anchor": "middle", "dominant-baseline": "central",
      "font-size": 11, "font-weight": 600, fill: isHero ? "#FFFFFF" : UI_COLORS.slate
    });
    return badge;
  }

  const HERO_Y = 262;
  const heroRow = buildRow(hero, HERO_Y, true);
  const heroStats = text(heroRow.g, PLOT_X0, HERO_Y + 24,
    "n = " + nPairs + " · Wilcoxon pBH ≈ " + pText(hero.u.wilcoxonPBH), {
      "font-size": 11.5, fill: UI_COLORS.slate
    });
  const heroBadge = buildBadge(heroRow.g, HERO_Y + 24, hero.u.key, true);

  const COMP_Y0 = 330, COMP_PITCH = 54;
  const compRows = comps.map(function (r, i) {
    const y = COMP_Y0 + i * COMP_PITCH;
    const row = buildRow(r, y, false);
    text(row.g, PLOT_X0, y + 20, "pBH " + pText(r.u.wilcoxonPBH), {
      "font-size": 11, fill: UI_COLORS.faint
    });
    buildBadge(row.g, y + 20, r.u.key, false);
    return row;
  });

  const keyLine = text(svg, CX, 522,
    "dot = median paired difference (n = " + nPairs + ") · whiskers = 95% CI · pBH = BH-corrected Wilcoxon p", {
      "text-anchor": "middle", "font-size": 12, fill: UI_COLORS.faint
    });

  // ---------- captions / takeaway / caveats ----------
  const captionEls = CAPTIONS.map(function (s) {
    return text(svg, CX, 556, s, {
      "text-anchor": "middle", "font-size": 18, "font-weight": 600,
      fill: UI_COLORS.slate, opacity: 0
    });
  });
  const takeaway = text(svg, CX, 556, TAKEAWAY, {
    "text-anchor": "middle", "font-size": 18, "font-weight": 800, fill: UI_COLORS.ink
  });
  const caveat1 = text(svg, CX, 586, CAVEATS[0], {
    "text-anchor": "middle", "font-size": 12.5, fill: UI_COLORS.slate
  });
  const caveat2 = text(svg, CX, 605, CAVEATS[1], {
    "text-anchor": "middle", "font-size": 12.5, fill: UI_COLORS.slate
  });

  // ---------- footer (public identifier — omitted entirely in review mode) ----------
  let footer = null;
  if (!opts.reviewMode) {
    footer = text(svg, CX, 668, PROJECT.shortName + " · " + PROJECT.publicUrl, {
      "text-anchor": "middle", "font-size": 12.5, "font-weight": 600, fill: UI_COLORS.slate
    });
  }

  // ---------- transient story stage (beats 1–3), authored hidden ----------
  const stage = svgEl("g", { opacity: 0 }, svg);

  const binCard = svgEl("g", {}, stage);
  svgEl("rect", { x: CX - 100, y: 188, width: 200, height: 36, rx: 18,
    fill: UI_COLORS.gridFill, stroke: UI_COLORS.gridStroke, "stroke-width": 1 }, binCard);
  text(binCard, CX, 206, "same corpus topic", {
    "text-anchor": "middle", "dominant-baseline": "central",
    "font-size": 13, "font-weight": 600, fill: UI_COLORS.slate
  });

  const connectors = svgEl("path", {
    d: "M" + (CX - 30) + " 224 L490 252 M" + (CX + 30) + " 224 L790 252",
    fill: "none", stroke: "#C9C9C9", "stroke-width": 1.5
  }, stage);

  const LANES = [
    { x: 360, cx: 490, name: "random in-topic", targeted: false },
    { x: 660, cx: 790, name: "influence-targeted", targeted: true }
  ];
  const rand = mulberry32(72);
  const DOCS_PER_LANE = 24, SELECT_COUNT = 8;
  const RANDOM_PICKS = [1, 4, 8, 11, 13, 16, 20, 23];
  const laneEls = LANES.map(function (lane) {
    const g = svgEl("g", {}, stage);
    const box = svgEl("rect", { x: lane.x, y: 258, width: 260, height: 192, rx: 12,
      fill: "#FCFCFC", stroke: "#DDDDE2", "stroke-width": 1.5 }, g);
    const header = text(g, lane.cx, 246, lane.name, {
      "text-anchor": "middle", "font-size": 13, "font-weight": 700,
      fill: lane.targeted ? INFLUENCE_COLORS.positive : UI_COLORS.slate
    });

    /* Illustrative influence strengths (targeted lane only): skewed so a few
       documents stand out; the top-8 are the targeted picks. */
    const strengths = [];
    for (let i = 0; i < DOCS_PER_LANE; i++) {
      const u = rand();
      strengths.push(lane.targeted ? u * u : 0);
    }
    const picks = lane.targeted
      ? strengths.map(function (s, i) { return [s, i]; })
          .sort(function (a, b) { return b[0] - a[0]; })
          .slice(0, SELECT_COUNT).map(function (p) { return p[1]; })
      : RANDOM_PICKS;

    const docs = [], rings = [];
    for (let i = 0; i < DOCS_PER_LANE; i++) {
      const col = i % 6, row2 = Math.floor(i / 6);
      const dx = lane.x + 24 + col * 38, dy = 278 + row2 * 42;
      const tint = lane.targeted ? 0.06 + strengths[i] * 0.5 : 0;
      const doc = createDocumentGlyph(g, dx, dy, 22, 28, {
        fill: lane.targeted ? mix("#FFFFFF", INFLUENCE_COLORS.positive, tint) : "#FFFFFF",
        stroke: lane.targeted ? mix("#DDDDE2", INFLUENCE_COLORS.positive, tint) : "#C9CBD1",
        foldFill: lane.targeted ? mix("#EEEEF2", INFLUENCE_COLORS.positive, tint * 0.8) : "#E7E8EC",
        lineFill: lane.targeted ? mix("#D8DAE0", INFLUENCE_COLORS.positive, tint * 0.7) : "#D8DAE0"
      });
      docs.push({ el: doc, x: dx + 11, y: dy + 14, selected: picks.indexOf(i) !== -1 });
    }
    picks.forEach(function (i) {
      const col = i % 6, row2 = Math.floor(i / 6);
      rings.push(svgEl("rect", {
        x: lane.x + 24 + col * 38 - 4, y: 278 + row2 * 42 - 4,
        width: 30, height: 36, rx: 6, fill: "none",
        stroke: lane.targeted ? INFLUENCE_COLORS.positive : UI_COLORS.slate,
        "stroke-width": 2
      }, g));
    });
    return { g, box, header, docs, rings, lane };
  });

  const arrows = svgEl("path", {
    d: "M490 450 L600 470 M790 450 L680 470",
    fill: "none", stroke: "#C9C9C9", "stroke-width": 1.5
  }, stage);
  const unlearnBox = svgEl("g", {}, stage);
  svgEl("rect", { x: CX - 110, y: 470, width: 220, height: 40, rx: 10, fill: UI_COLORS.ink }, unlearnBox);
  text(unlearnBox, CX, 490, "unlearning — same procedure", {
    "text-anchor": "middle", "dominant-baseline": "central",
    "font-size": 12.5, "font-weight": 600, fill: "#FFFFFF"
  });

  // ---------- static fallback path ----------
  if (!animated) {
    // Authored DOM already shows the final frame; the stage stays hidden.
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

  // Beat 1 — one topic, two selection lanes.
  tl.addLabel("lanes", 0);
  fadeUp(kicker, 0, 0.45);
  fadeUp(title, 0.12, 0.55);
  tl.fromTo(subline, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.3);
  captionSwap(0, 0.35);
  tl.fromTo(stage, { opacity: 0 }, { opacity: 1, duration: 0.15 }, 0.4);
  tl.fromTo(binCard, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, 0.5);
  tl.fromTo(connectors, { opacity: 0 }, { opacity: 1, duration: 0.35 }, 0.75);
  laneEls.forEach(function (l, li) {
    tl.fromTo(l.box, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.85 + li * 0.15);
    tl.fromTo(l.header, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.95 + li * 0.15);
    l.docs.forEach(function (d, i) {
      tl.fromTo(d.el, { opacity: 0, scale: 0.7, transformOrigin: "50% 50%" },
        { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" },
        1.1 + li * 0.15 + i * 0.035);
    });
  });

  // Beat 2 — forget sets selected.
  tl.addLabel("select", 2.8);
  captionSwap(1, 2.8);
  laneEls.forEach(function (l, li) {
    l.rings.forEach(function (ring, i) {
      tl.fromTo(ring, { opacity: 0, scale: 1.25, transformOrigin: "50% 50%" },
        { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" },
        2.95 + li * 0.1 + i * 0.07);
    });
  });

  // Beat 3 — both forget sets pass through the same unlearning module.
  tl.addLabel("unlearn", 5.4);
  captionSwap(2, 5.4);
  tl.fromTo(arrows, { opacity: 0 }, { opacity: 1, duration: 0.35 }, 5.5);
  fadeUp(unlearnBox, 5.6, 0.45);
  laneEls.forEach(function (l) {
    l.rings.forEach(function (ring) {
      tl.to(ring, { opacity: 0, duration: 0.3 }, 5.85);
    });
    l.docs.forEach(function (d, i) {
      if (!d.selected) return;
      tl.to(d.el, {
        x: CX - d.x, y: 490 - d.y, scale: 0.25, transformOrigin: "50% 50%",
        duration: 0.65, ease: "power2.in"
      }, 5.9 + i * 0.05);
      tl.to(d.el, { opacity: 0, duration: 0.2 }, 6.35 + i * 0.05);
    });
  });
  tl.to(unlearnBox, { scale: 1.05, transformOrigin: "50% 50%", duration: 0.25, ease: "power2.out" }, 7.1);
  tl.to(unlearnBox, { scale: 1, duration: 0.3, ease: "power2.inOut" }, 7.35);

  // Beat 4 — paired results: the forest plot.
  tl.addLabel("results", 8.0);
  captionSwap(3, 8.0);
  tl.to(stage, { opacity: 0, duration: 0.45, ease: "power1.in" }, 7.95);
  tl.fromTo(panelCap1, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 8.15);
  tl.fromTo(panelCap2, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 8.25);
  tl.fromTo(zeroLine, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 8.3);
  tl.fromTo(axisG, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 8.4);
  tl.fromTo(annotRight, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 8.5);
  tl.fromTo(annotLeft, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 8.55);

  tl.fromTo(heroRow.label, { opacity: 0 }, { opacity: 1, duration: 0.35 }, 8.6);
  tl.fromTo(heroRow.whisker, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 8.7);
  tl.fromTo(heroRow.dot, { opacity: 0, scale: 0.5, transformOrigin: "50% 50%" },
    { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.8)" }, 8.85);
  tl.fromTo(heroRow.median, { opacity: 0 }, { opacity: 1, duration: 0.35 }, 9.05);
  tl.fromTo(heroStats, { opacity: 0 }, { opacity: 1, duration: 0.35 }, 9.2);
  tl.fromTo(heroBadge, { opacity: 0 }, { opacity: 1, duration: 0.35 }, 9.3);

  compRows.forEach(function (row, i) {
    const at = 9.5 + i * 0.28;
    tl.fromTo(row.g, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, at);
    tl.fromTo(row.dot, { scale: 0.5, transformOrigin: "50% 50%" },
      { scale: 1, duration: 0.4, ease: "back.out(1.8)" }, at + 0.12);
  });
  tl.fromTo(keyLine, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 10.5);

  // Beat 5 — end card: bounded conclusion.
  tl.addLabel("takeaway", 11.6);
  tl.to(captionEls[3], { opacity: 0, duration: 0.3 }, 11.5);
  fadeUp(takeaway, 11.7, 0.55);
  tl.fromTo(caveat1, { opacity: 0 }, { opacity: 1, duration: 0.45 }, 12.0);
  tl.fromTo(caveat2, { opacity: 0 }, { opacity: 1, duration: 0.45 }, 12.15);
  if (footer) tl.fromTo(footer, { opacity: 0 }, { opacity: 1, duration: 0.45 }, 12.35);

  // Final hold so exports keep the takeaway on screen.
  tl.to({}, { duration: 1.3 }, 12.9);

  // ---------- controls + initial position ----------
  const seekBeat = makeSeekBeat(tl, BEATS);
  let syncPlayUi = null;
  if (opts.controls) syncPlayUi = attachBeatControls(root, tl, BEATS, seekBeat).syncPlayUi;
  applyInitialPosition(tl, opts, seekBeat);
  if (syncPlayUi) syncPlayUi();

  return makeSceneApi({ svg, root, timeline: tl, seekBeat, syncPlayUi });
}
