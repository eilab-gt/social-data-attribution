/* Site interactions: navigation, scroll reveals, taxonomy grid, and compact figure animations. */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.remove("no-js");

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function setNavHeight() {
    var navbar = document.querySelector(".paper-nav");
    if (!navbar) return;
    root.style.setProperty("--nav-height", Math.round(navbar.getBoundingClientRect().height) + "px");
  }

  function initNavbar() {
    document.querySelectorAll(".navbar-burger").forEach(function (burger) {
      burger.addEventListener("click", function () {
        var target = document.getElementById(burger.dataset.target);
        var active = !burger.classList.contains("is-active");
        burger.classList.toggle("is-active", active);
        burger.setAttribute("aria-expanded", active ? "true" : "false");
        if (target) target.classList.toggle("is-active", active);
      });
    });

    document.querySelectorAll(".navbar-menu .navbar-item").forEach(function (item) {
      item.addEventListener("click", function () {
        document.querySelectorAll(".navbar-burger").forEach(function (burger) {
          burger.classList.remove("is-active");
          burger.setAttribute("aria-expanded", "false");
        });
        document.querySelectorAll(".navbar-menu").forEach(function (menu) {
          menu.classList.remove("is-active");
        });
      });
    });
  }

  function initTaxonomyGrid() {
    var grid = document.querySelector("[data-tax-grid]");
    if (!grid || grid.childElementCount) return;

    var hotCells = {
      "3-5": "is-social",
      "4-15": "is-negative",
      "8-9": "is-social",
      "10-18": "is-knowledge",
      "14-6": "is-negative",
      "17-13": "is-knowledge",
      "20-2": "is-social"
    };

    for (var r = 0; r < 24; r += 1) {
      for (var c = 0; c < 24; c += 1) {
        var cell = document.createElement("span");
        cell.className = "tax-cell";
        var delay = ((r * 19 + c * 13) % 130) * 6;
        cell.style.setProperty("--delay", delay + "ms");
        var cls = hotCells[r + "-" + c];
        if (cls) cell.classList.add(cls);
        cell.setAttribute("aria-hidden", "true");
        grid.appendChild(cell);
      }
    }
  }

  function initBarWidths() {
    document.querySelectorAll(".bar-row[data-value]").forEach(function (row) {
      var value = parseFloat(row.getAttribute("data-value"));
      var max = parseFloat(row.getAttribute("data-max")) || Math.abs(value) || 1;
      var width = clamp(Math.abs(value) / max * 50, 1.5, 50);
      row.style.setProperty("--bar-width", width + "%");
      var fill = row.querySelector(".bar-fill");
      if (fill) {
        fill.classList.toggle("positive", value >= 0);
        fill.classList.toggle("negative", value < 0);
      }
    });

    document.querySelectorAll(".unlearn-row").forEach(function (row) {
      var social = parseFloat(row.getAttribute("data-social")) || 0;
      var arc = parseFloat(row.getAttribute("data-arc")) || 0;
      var max = parseFloat(row.getAttribute("data-max")) || 18;
      row.style.setProperty("--social-width", clamp(Math.abs(social) / max * 50, 1.5, 50) + "%");
      row.style.setProperty("--arc-width", clamp(Math.abs(arc) / max * 50, 1.5, 50) + "%");
    });
  }

  function revealRows(container, selector) {
    container.querySelectorAll(selector).forEach(function (row, i) {
      window.setTimeout(function () {
        row.classList.add("is-visible");
      }, i * 90);
    });
  }

  function initScrollAnimations() {
    var nodes = [].slice.call(document.querySelectorAll(
      ".taxonomy-viz, .contrast-viz, .cluster-viz, [data-bars], [data-unlearning]"
    ));

    if (!("IntersectionObserver" in window)) {
      nodes.forEach(function (node) {
        node.classList.add("is-visible");
        revealRows(node, ".bar-row, .unlearn-row");
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var node = entry.target;
        node.classList.add("is-visible");
        revealRows(node, ".bar-row, .unlearn-row");
        observer.unobserve(node);
      });
    }, { threshold: 0.25, rootMargin: "0px 0px -8% 0px" });

    nodes.forEach(function (node) { observer.observe(node); });
  }

  function initBibtexCopy() {
    var button = document.querySelector("[data-copy-bibtex]");
    var code = document.getElementById("bibtex-code");
    if (!button || !code) return;
    if (!navigator.clipboard) {
      button.hidden = true;
      return;
    }
    button.addEventListener("click", function () {
      navigator.clipboard.writeText(code.textContent).then(function () {
        var original = button.textContent;
        button.textContent = "Copied";
        window.setTimeout(function () { button.textContent = original; }, 1600);
      });
    });
  }

  ready(function () {
    setNavHeight();
    initNavbar();
    initTaxonomyGrid();
    initBarWidths();
    initScrollAnimations();
    initBibtexCopy();

    window.addEventListener("resize", setNavHeight);

    if (window.AOS) {
      var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.AOS.init({ once: true, duration: 650, easing: "ease-out-cubic", disable: reduce });
    }
  });
})();
