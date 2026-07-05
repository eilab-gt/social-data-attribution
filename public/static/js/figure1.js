/* Animated Figure 1 — Capability Provenance Pipeline.
   Self-contained SVG + GSAP timeline. Falls back to the static PNG when
   GSAP is unavailable or the user prefers reduced motion.

   Stages:
     1) Corpus Construction   — Dolma3 -> dedup -> WebOrganizer 576 bins
     2) Training Data Attribution — benchmark probes -> Bergson/TrackStar scoring
     3) Bin-Level Influence Map   — 6x4 signed z-score heatmap (real panel-3 data)
     4) Unlearning Validation     — Table 49 paired Δ per benchmark (γ_influence − γ_random)
*/
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var VB_W = 880, VB_H = 360;

  // Shared 8x8 grid geometry (scenes 1 & 2) + its center (beam convergence point).
  var GRID = { x: 512, y: 72, cs: 30, gap: 2, n: 8 };
  var GRID_W = GRID.n * (GRID.cs + GRID.gap) - GRID.gap; // 254
  var GCX = GRID.x + GRID_W / 2;                          // grid center X
  var GCY = GRID.y + GRID_W / 2;                          // grid center Y

  // ---- palette ----
  var C = {
    socReason: "#762A83", socKnow: "#8C6D1F",
    stemReason: "#A14F00", stemKnow: "#1B7837",
    slate: "#4B5563", grid: "#c9b8cf", gridFill: "#efe6f2",
    doc: "#b9a7c0"
  };

  // ---- real data ----
  var BENCH = [
    { name: "SocialIQA",  color: C.socReason },
    { name: "MMLU SS",    color: C.socKnow },
    { name: "ARC-Chal.",  color: C.stemReason },
    { name: "MMLU STEM",  color: C.stemKnow }
  ];
  var INFLUENCE = { // Figure 2 Panel C: rows x [SocialIQA, MMLU SS, ARC-Chal, MMLU STEM]
    cols: ["SocialIQA", "MMLU SS", "ARC-Chal.", "MMLU STEM"],
    rows: [
      { label: "Lit. × Cust. Support", v: [16.0, -7.31, -0.45, -5.75], sig: 0 },
      { label: "Social Life × Q&A", v: [1.90, -0.06, -0.78, -0.46] },
      { label: "Home × Creative", v: [1.29, -0.63, -0.34, -0.19] },
      { label: "Politics × Docs", v: [0.41, 6.86, 1.59, 5.56] }
    ]
  };
  var UNLEARN = { // Table 49: paired Δ = γ_influence − γ_random (acc. points) per benchmark
    cols: ["Paired Δ (pp)"],
    rows: [
      { label: "SocialIQA", v: [1.60] },        // p ≈ 1e-5  (selective damage)
      { label: "MMLU STEM", v: [0.20] },         // p = 0.028
      { label: "MMLU Soc. Sci.", v: [0.17] },    // p = 0.227 (n.s.)
      { label: "ARC-Challenge", v: [-0.26] }     // p > 0.99  (reversed)
    ]
  };

  var STAGES = [
    { icon: "1", title: "Corpus Construction" },
    { icon: "2", title: "Attribution" },
    { icon: "3", title: "Influence Map" },
    { icon: "4", title: "Unlearning" }
  ];
  var CAPTIONS = [
    "<strong>1) Corpus Construction.</strong> Dolma3 (6T tokens) is de-duplicated to ~1.26B unique documents, then binned by WebOrganizer into <strong>576 bins</strong> (24 topics × 24 formats).",
    "<strong>2) Training Data Attribution.</strong> Four benchmark probes are attributed to bins with gradient-based TrackStar (via Bergson), then aggregated to a 576×4 influence matrix.",
    "<strong>3) Bin-Level Influence Map.</strong> Signed z-scores map supportive (blue) vs. suppressive (orange) bins. SocialIQA's <strong>signature bin</strong> is positive for social yet negative/flat for STEM.",
    "<strong>4) Unlearning Validation.</strong> &Delta; = &gamma;<sub>influence</sub> &minus; &gamma;<sub>random</sub> across 24 topics &times; 3 seeds (paper Table 49). Influence-targeted forgetting damages <strong>SocialIQA</strong> (+1.60 pp, p &asymp; 10<sup>-5</sup>); ARC-Challenge <em>reverses</em> (&minus;0.26 pp). Selective damage, not generic topic removal."
  ];

  // ---- helpers ----
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function txt(parent, x, y, s, attrs) {
    var t = el("text", Object.assign({ x: x, y: y }, attrs || {}), parent);
    t.textContent = s;
    return t;
  }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function hex(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
  function mix(c1, c2, t) {
    var a = hex(c1), b = hex(c2);
    return "rgb(" + Math.round(lerp(a[0], b[0], t)) + "," + Math.round(lerp(a[1], b[1], t)) + "," + Math.round(lerp(a[2], b[2], t)) + ")";
  }
  // influence: blue (+) / orange (-), diverging from near-white
  function inflColor(z) {
    var t = Math.min(Math.abs(z) / 3.1, 1);
    return z >= 0 ? mix("#f7f7f7", "#2166AC", t) : mix("#f7f7f7", "#B35806", Math.min(Math.abs(z) / 1.2, 1));
  }
  function inflInk(z) { return Math.min(Math.abs(z) / 3.1, 1) > 0.55 ? "#fff" : "#222"; }
  // paired unlearning Δ (γ_influence − γ_random): positive = selective damage (red),
  // negative = reversed (blue). Max |Δ| ≈ 1.6 pp.
  function accColor(d) {
    return d >= 0 ? mix("#fdf2f0", "#67000D", Math.min(d / 1.6, 1))
                  : mix("#eff3ff", "#2166AC", Math.min(Math.abs(d) / 1.6, 1));
  }
  function accInk(d) { return Math.min(Math.abs(d) / 1.6, 1) > 0.5 ? "#fff" : "#222"; }
  function fmt(v, plus) { return (v >= 0 && plus ? "+" : "") + v.toFixed(2); }

  // ================= scene builders =================
  // Each returns { g: <g>, enter: function(gsap)->timeline }

  // soft multi-hue palette used to suggest distinct strata/bins
  var STRATA = ["#762A83", "#8C6D1F", "#A14F00", "#1B7837", "#006D5B", "#4575B4", "#67A9CF", "#4B5563"];

  // a "document" page glyph: rounded page with a folded corner + text lines (fills its height)
  function docGlyph(parent, x, y, w, h) {
    var fold = Math.min(8, w * 0.22), gg = el("g", {}, parent);
    el("path", {
      d: "M" + x + " " + (y + 3) + " Q" + x + " " + y + " " + (x + 3) + " " + y +
         " H" + (x + w - fold) + " L" + (x + w) + " " + (y + fold) +
         " V" + (y + h - 3) + " Q" + (x + w) + " " + (y + h) + " " + (x + w - 3) + " " + (y + h) +
         " H" + (x + 3) + " Q" + x + " " + (y + h) + " " + x + " " + (y + h - 3) + " Z",
      fill: "#ffffff", stroke: "#b79bc4", "stroke-width": 1.2, "stroke-linejoin": "round"
    }, gg);
    el("path", { d: "M" + (x + w - fold) + " " + y + " V" + (y + fold) + " H" + (x + w) + " Z", fill: "#e3d4ea" }, gg);
    var ly = y + 10, li = 0;
    while (ly < y + h - 6) {
      el("rect", { x: x + 5, y: ly, width: w - 10 - (li % 3 === 2 ? 7 : 0), height: 2.2, rx: 1.1, fill: "#c9b3d1" }, gg);
      ly += 6; li++;
    }
    return gg;
  }

  function sceneCorpus(root) {
    var g = el("g", { opacity: 0 }, root);
    // Dolma3 = a block of document pages filling the SAME area as the 576-bin grid
    var blockW = GRID_W;
    var docCols = 5, docRows = 4;
    var pitchX = blockW / docCols, pitchY = blockW / docRows;
    var pageW = pitchX * 0.72, pageH = pitchY * 0.78; // page-shaped (taller than wide)
    var docX = 40, docY = GCY - blockW / 2;
    txt(g, docX + blockW / 2, docY - 16, "Dolma3 · 6T tokens",
      { class: "f1-label", "font-size": 13, "font-weight": 700, "text-anchor": "middle" });
    txt(g, docX + blockW / 2, docY + blockW + 18, "de-duplicated corpus — not all documents are used",
      { class: "f1-label", "font-size": 11, "text-anchor": "middle", fill: C.slate });
    var docs = [];
    for (var i = 0; i < docCols * docRows; i++) {
      var col = i % docCols, rrow = Math.floor(i / docCols);
      var px = docX + col * pitchX + (pitchX - pageW) / 2;
      var py = docY + rrow * pitchY + (pitchY - pageH) / 2;
      var gd = docGlyph(g, px, py, pageW, pageH);
      gd.setAttribute("opacity", "0");
      docs.push(gd);
    }
    // lines all emanate from the middle of the corpus block
    var ox = docX + blockW - 4, oy = GCY;

    // WebOrganizer 8x8 grid (right), title centered over the grid
    txt(g, GCX, GRID.y - 20, "WebOrganizer · 576 bins", { class: "f1-title", "font-size": 13, "text-anchor": "middle" });
    txt(g, GCX, GRID.y - 5, "24 topics × 24 formats", { class: "f1-label", "font-size": 11, "text-anchor": "middle" });
    var cells = [];
    for (var r = 0; r < GRID.n; r++) for (var c = 0; c < GRID.n; c++) {
      cells.push(el("rect", {
        x: GRID.x + c * (GRID.cs + GRID.gap), y: GRID.y + r * (GRID.cs + GRID.gap),
        width: GRID.cs, height: GRID.cs, rx: 4,
        fill: C.gridFill, stroke: C.grid, "stroke-width": 1, opacity: 0
      }, g));
    }

    // stratification: many rounded lines from the middle of the corpus fanning into spread bins
    var fan = [];
    for (var rr = 0; rr < GRID.n; rr++) {
      var picks = [1 + (rr % 4), 4 + (rr % 3)]; // two target columns per row
      picks.forEach(function (cc, j) {
        var cx = GRID.x + cc * (GRID.cs + GRID.gap) + GRID.cs / 2;
        var cy = GRID.y + rr * (GRID.cs + GRID.gap) + GRID.cs / 2;
        var c1x = ox + (cx - ox) * 0.42, c2x = ox + (cx - ox) * 0.6;
        var p = el("path", {
          d: "M " + ox + " " + oy + " C " + c1x + " " + oy + " " + c2x + " " + cy + " " + cx + " " + cy,
          fill: "none", stroke: STRATA[(rr + j) % STRATA.length], "stroke-width": 1.3,
          "stroke-linecap": "round", opacity: 0
        }, g);
        fan.push(p);
      });
    }

    g._enter = function (gsap) {
      var tl = gsap.timeline();
      gsap.set(docs, { opacity: 0 });
      gsap.set(cells, { opacity: 0 });
      tl.to(docs, { opacity: 1, duration: 0.4, stagger: 0.04 }, 0)
        // fade ~a third of the documents: only a stratified sample is used
        .to(docs.filter(function (_, i) { return i % 3 === 1; }), { opacity: 0.18, duration: 0.5 }, 0.7);
      // draw the stratification lines from the middle of the corpus
      fan.forEach(function (p, i) {
        var len = p.getTotalLength();
        p.setAttribute("stroke-dasharray", len);
        p.setAttribute("stroke-dashoffset", len);
        gsap.set(p, { opacity: 0.55 });
        tl.to(p, { attr: { "stroke-dashoffset": 0 }, duration: 0.55 }, 0.9 + i * 0.035);
      });
      tl.to(cells, { opacity: 1, duration: 0.5, stagger: { each: 0.012, from: "random" } }, 1.1);
      return tl;
    };
    return g;
  }

  function sceneAttribution(root) {
    var g = el("g", { opacity: 0 }, root);

    // probe chips (left), stack vertically centered on the grid center
    var chipX = 30, chipW = 150, chipH = 34, chipPitch = 44;
    var stackH = (BENCH.length - 1) * chipPitch + chipH;
    var chipY0 = GCY - stackH / 2;
    txt(g, chipX + chipW / 2, chipY0 - 14, "Benchmark probes",
      { class: "f1-label", "font-size": 13, "font-weight": 700, "text-anchor": "middle" });
    var chips = [], chipCY = [];
    BENCH.forEach(function (b, i) {
      var y = chipY0 + i * chipPitch;
      chipCY.push(y + chipH / 2);
      var cg = el("g", { opacity: 0 }, g);
      el("rect", { x: chipX, y: y, width: chipW, height: chipH, rx: 17, fill: b.color }, cg);
      txt(cg, chipX + chipW / 2, y + 22, b.name, { fill: "#fff", "font-size": 13, "font-weight": 700, "text-anchor": "middle" });
      chips.push(cg);
    });
    var chipRight = chipX + chipW;

    // grid (right) — the 576 bins that get scored
    var cells = [];
    for (var r = 0; r < GRID.n; r++) for (var c = 0; c < GRID.n; c++) {
      cells.push(el("rect", {
        x: GRID.x + c * (GRID.cs + GRID.gap), y: GRID.y + r * (GRID.cs + GRID.gap),
        width: GRID.cs, height: GRID.cs, rx: 3,
        fill: C.gridFill, stroke: C.grid, "stroke-width": 1
      }, g));
    }
    txt(g, GCX, GRID.y - 20, "Bergson · TrackStar", { class: "f1-title", "font-size": 13, "text-anchor": "middle" });
    txt(g, GCX, GRID.y - 5, "gradient attribution: score every bin", { class: "f1-label", "font-size": 11, "text-anchor": "middle" });
    var matrixLbl = txt(g, GCX, GRID.y + GRID_W + 20, "→ signed influence for all 576 bins × 4 benchmarks",
      { class: "f1-label", "font-size": 11, "font-weight": 700, "text-anchor": "middle", fill: C.socReason, opacity: 0 });

    // beams: each probe's gradient is compared against the bins
    var beams = [];
    var ctrlX = Math.round((chipRight + GCX) / 2);
    BENCH.forEach(function (b, i) {
      var y = chipCY[i];
      beams.push(el("path", {
        d: "M " + chipRight + " " + y + " Q " + ctrlX + " " + y + " " + GCX + " " + GCY,
        fill: "none", stroke: b.color, "stroke-width": 2.2, opacity: 0, "stroke-linecap": "round"
      }, g));
    });

    g._enter = function (gsap) {
      var tl = gsap.timeline();
      gsap.set(chips, { opacity: 0 });
      gsap.set(cells, { fill: C.gridFill });
      gsap.set(matrixLbl, { opacity: 0 });
      tl.to(chips, { opacity: 1, duration: 0.35, stagger: 0.12 }, 0);
      beams.forEach(function (bm, i) {
        var len = bm.getTotalLength();
        bm.setAttribute("stroke-dasharray", len);
        bm.setAttribute("stroke-dashoffset", len);
        bm.setAttribute("opacity", 0.8);
        tl.to(bm, { attr: { "stroke-dashoffset": 0 }, duration: 0.55 }, 0.5 + i * 0.16);
      });
      // score every bin: wash the grid with a signed-influence field (blue supportive / orange suppressive)
      cells.forEach(function (cell, idx) {
        var r = Math.floor(idx / GRID.n), c = idx % GRID.n;
        var z = 2.4 * Math.sin(r * 0.85 + 0.6) + 1.7 * Math.cos(c * 0.8) - 0.3;
        tl.to(cell, { fill: inflColor(z), duration: 0.4 }, 1.25 + (r + c) * 0.03);
      });
      tl.to(matrixLbl, { opacity: 1, duration: 0.4 }, 1.95);
      return tl;
    };
    return g;
  }

  function heatScene(root, data, colorFn, inkFn, title) {
    var g = el("g", { opacity: 0 }, root);
    var nCol = data.cols.length;
    var cw = nCol === 2 ? 150 : 96, ch = 38, gap = 4;
    var nRow = data.rows.length;
    // center the whole block (row-label gutter + grid) horizontally and vertically
    var labelGutter = 168;
    var gridW = nCol * (cw + gap) - gap;
    var x0 = (VB_W - (labelGutter + gridW)) / 2 + labelGutter;
    var gridH = nRow * (ch + gap) - gap;
    var y0 = (VB_H + 40 - gridH) / 2; // leave headroom for the title
    txt(g, VB_W / 2, 30, title, { class: "f1-title", "font-size": 14, "text-anchor": "middle" });

    // column headers
    data.cols.forEach(function (c, ci) {
      txt(g, x0 + ci * (cw + gap) + cw / 2, y0 - 10, c, { class: "f1-label", "font-size": 11, "font-weight": 700, "text-anchor": "middle" });
    });
    var cellObjs = [];
    data.rows.forEach(function (row, ri) {
      var y = y0 + ri * (ch + gap);
      txt(g, x0 - 12, y + ch / 2 + 4, row.label, { class: "f1-label", "font-size": 12, "font-weight": 600, "text-anchor": "end" });
      row.v.forEach(function (val, ci) {
        var x = x0 + ci * (cw + gap);
        var rect = el("rect", { x: x, y: y, width: cw, height: ch, rx: 4, fill: "#f4f4f4", opacity: 0 }, g);
        if (row.sig === ci) { rect.setAttribute("stroke", C.socReason); rect.setAttribute("stroke-width", 0); rect._sig = true; }
        var label = txt(g, x + cw / 2, y + ch / 2 + 4, "", { class: "f1-cellval", "text-anchor": "middle", opacity: 0 });
        cellObjs.push({
          rect: rect, label: label, val: val,
          color: val === null ? "#f1f1f1" : colorFn(val),
          ink: val === null ? "#9ca3af" : inkFn(val),
          sig: row.sig === ci
        });
      });
    });

    g._enter = function (gsap) {
      var tl = gsap.timeline();
      cellObjs.forEach(function (o, i) {
        var delay = 0.03 * i;
        tl.to(o.rect, { opacity: 1, fill: o.color, duration: 0.35 }, delay);
        tl.to(o.label, { opacity: 1, duration: 0.25 }, delay + 0.1);
        if (o.val === null) {
          tl.add(function () { o.label.textContent = "—"; o.label.setAttribute("fill", o.ink); }, delay + 0.1);
        } else {
          var proxy = { n: 0 };
          tl.to(proxy, {
            n: o.val, duration: 0.5,
            onUpdate: function () { o.label.textContent = fmt(proxy.n, true); o.label.setAttribute("fill", o.ink); }
          }, delay + 0.1);
        }
        if (o.sig) tl.to(o.rect, { attr: { "stroke-width": 3 }, duration: 0.3 }, delay + 0.4);
      });
      return tl;
    };
    return g;
  }

  // ================= controller =================
  function build(container) {
    var fallback = container.querySelector(".fig1-fallback");
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var gsap = window.gsap;
    if (reduce || !gsap) { if (fallback) fallback.style.display = "block"; return; }

    // scaffold
    var interactive = document.createElement("div");
    interactive.className = "fig1-interactive";

    // stage buttons
    var stagesBar = document.createElement("div");
    stagesBar.className = "fig1-stages";
    var stageBtns = STAGES.map(function (s, i) {
      var b = document.createElement("button");
      b.className = "fig1-stage-btn";
      b.innerHTML = '<span class="num">' + s.icon + '</span><span>' + s.title + '</span>';
      b.addEventListener("click", function () { goTo(i, true); });
      stagesBar.appendChild(b);
      return b;
    });
    interactive.appendChild(stagesBar);

    // svg
    var svg = el("svg", { class: "fig1-svg", viewBox: "0 0 " + VB_W + " " + VB_H, role: "img", "aria-label": "Animated capability provenance pipeline" });
    var stageWrap = document.createElement("div");
    stageWrap.className = "fig1-stage-wrap";
    stageWrap.appendChild(svg);
    interactive.appendChild(stageWrap);

    var caption = document.createElement("p");
    caption.className = "fig1-caption";
    interactive.appendChild(caption);

    // controls
    var controls = document.createElement("div");
    controls.className = "fig1-controls";
    var prevBtn = ctlBtn("❮", "Previous stage");
    var playBtn = ctlBtn("❚❚", "Play or pause");
    var nextBtn = ctlBtn("❯", "Next stage");
    var prog = document.createElement("div"); prog.className = "fig1-progress";
    var progBar = document.createElement("div"); progBar.className = "fig1-progress-bar"; prog.appendChild(progBar);
    controls.appendChild(prevBtn); controls.appendChild(playBtn); controls.appendChild(prog); controls.appendChild(nextBtn);
    interactive.appendChild(controls);

    container.insertBefore(interactive, fallback);
    if (fallback) fallback.style.display = "none";

    // build scenes
    var scenes = [
      sceneCorpus(svg),
      sceneAttribution(svg),
      heatScene(svg, INFLUENCE, inflColor, inflInk, "Bin-Level Influence Map (signed z-score)"),
      heatScene(svg, UNLEARN, accColor, accInk, "Unlearning Validation (paired Δ, acc. points)")
    ];

    var cur = -1, playing = true, tl = null, advance = null, progTween = null;
    var DWELL = 1.7;

    function ctlBtn(label, aria) {
      var b = document.createElement("button");
      b.className = "fig1-btn"; b.innerHTML = label; b.setAttribute("aria-label", aria);
      return b;
    }

    function goTo(i, manual) {
      if (i < 0) i = scenes.length - 1;
      if (i >= scenes.length) i = 0;
      if (tl) tl.kill();
      if (advance) advance.kill();
      if (progTween) progTween.kill();
      scenes.forEach(function (s, idx) { if (idx !== i) gsap.set(s, { opacity: 0 }); });
      // reset the incoming scene's animatable bits by rebuilding timeline fresh
      stageBtns.forEach(function (b, idx) { b.classList.toggle("is-active", idx === i); });
      caption.innerHTML = CAPTIONS[i];
      cur = i;
      gsap.set(scenes[i], { opacity: 1 });
      tl = scenes[i]._enter(gsap);
      // progress across full cycle
      var start = i / scenes.length * 100, end = (i + 1) / scenes.length * 100;
      gsap.set(progBar, { width: start + "%" });
      progTween = gsap.to(progBar, { width: end + "%", duration: (tl.duration() + DWELL), ease: "none" });
      if (manual) setPlaying(false);
      else scheduleAdvance();
    }

    function scheduleAdvance() {
      if (advance) advance.kill();
      advance = gsap.delayedCall(tl.duration() + DWELL, function () { goTo(cur + 1, false); });
    }

    function setPlaying(p) {
      playing = p;
      playBtn.innerHTML = p ? "❚❚" : "▶";
      if (p) { if (tl) tl.play(); if (progTween) progTween.play(); scheduleAdvance(); }
      else { if (advance) advance.kill(); if (progTween) progTween.pause(); }
    }

    prevBtn.addEventListener("click", function () { goTo(cur - 1, true); });
    nextBtn.addEventListener("click", function () { goTo(cur + 1, true); });

    // Scrub: click/drag the progress bar to seek to the matching stage
    function seekFromEvent(e) {
      var rect = prog.getBoundingClientRect();
      var px = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      var f = Math.max(0, Math.min(0.9999, px / rect.width));
      var stage = Math.floor(f * scenes.length);
      if (stage !== cur) goTo(stage, true);
    }
    var scrubbing = false;
    prog.addEventListener("mousedown", function (e) { scrubbing = true; seekFromEvent(e); e.preventDefault(); });
    window.addEventListener("mousemove", function (e) { if (scrubbing) seekFromEvent(e); });
    window.addEventListener("mouseup", function () { scrubbing = false; });
    prog.addEventListener("click", seekFromEvent);
    prog.setAttribute("role", "slider");
    prog.setAttribute("aria-label", "Animation stage");
    playBtn.addEventListener("click", function () {
      if (playing) setPlaying(false);
      else { setPlaying(true); if (advance) advance.kill(); scheduleAdvance(); }
    });

    // pause on hover for readability
    stageWrap.addEventListener("mouseenter", function () { if (playing && advance) advance.pause(); });
    stageWrap.addEventListener("mouseleave", function () { if (playing && advance) advance.resume(); });

    var params = new URLSearchParams(window.location.search);
    var startStage = parseInt(params.get("fig1stage"), 10);
    if (startStage >= 1 && startStage <= scenes.length) {
      goTo(startStage - 1, true);
      if (params.get("fig1end") && tl) tl.progress(1); // jump to final frame (screenshot aid)
    } else goTo(0, false);
  }

  function init() {
    var nodes = document.querySelectorAll("[data-fig1]");
    nodes.forEach(function (n) { build(n); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
