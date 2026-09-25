/* Curated4Her — filtering + newsletter */
(function () {
  // Newsletter: paste your Formspree / Mailchimp-compatible endpoint here to collect emails.
  // Leave empty to fall back to an email sign-up request.
  var NEWSLETTER_ENDPOINT = "";
  var CONTACT_EMAIL = "agents@getservices.ai";

  var grid = document.getElementById("grid");
  var chips = document.querySelectorAll("[data-chip]");

  function applyFilter(cat) {
    if (!grid) return;
    grid.querySelectorAll(".pcard").forEach(function (c) {
      c.hidden = !(cat === "All" || c.getAttribute("data-cat") === cat);
    });
    var any = false;
    grid.querySelectorAll(".pblock").forEach(function (b) {
      var vis = b.querySelectorAll(".pcard:not([hidden])").length > 0;
      b.hidden = !vis; if (vis) any = true;
    });
    var sc = document.querySelector(".skin-cta");
    if (sc) sc.hidden = !(cat === "All" || cat === "Beauty");
    if (typeof syncAll === "function") setTimeout(syncAll, 0);
    var empty = document.getElementById("empty");
    if (empty) empty.hidden = any;
    chips.forEach(function (ch) {
      var on = ch.getAttribute("data-chip") === cat;
      ch.classList.toggle("on", on);
      ch.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }
  // Carousels: arrows scroll the row, hide at the ends
  function syncSlider(sl) {
    var row = sl.querySelector(".prow"), prev = sl.querySelector(".prev"), next = sl.querySelector(".next");
    var max = row.scrollWidth - row.clientWidth - 4;
    prev.hidden = row.scrollLeft <= 4;
    next.hidden = row.scrollLeft >= max;
    sl.classList.toggle("at-end", row.scrollLeft >= max);
  }
  document.querySelectorAll(".pslider").forEach(function (sl) {
    var row = sl.querySelector(".prow");
    function step(dir) {
      var card = row.querySelector(".pcard:not([hidden])");
      var w = card ? card.getBoundingClientRect().width + 18 : row.clientWidth * 0.8;
      row.scrollBy({ left: dir * Math.max(w, row.clientWidth - w), behavior: "smooth" });
    }
    sl.querySelector(".next").addEventListener("click", function () { step(1); });
    sl.querySelector(".prev").addEventListener("click", function () { step(-1); });
    row.addEventListener("scroll", function () { syncSlider(sl); }, { passive: true });
    window.addEventListener("resize", function () { syncSlider(sl); });
    syncSlider(sl);
  });
  function syncAll() { document.querySelectorAll(".pslider").forEach(syncSlider); }

  // Partner jump links: reset filter so the block is visible
  document.querySelectorAll(".pjump a, .brand-row a").forEach(function (a) {
    a.addEventListener("click", function () { applyFilter("All"); });
  });

  chips.forEach(function (ch) {
    ch.addEventListener("click", function () { applyFilter(ch.getAttribute("data-chip")); });
  });

  // Nav / tiles with data-filter
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[data-filter]");
    if (!a) return;
    var f = a.getAttribute("data-filter");
    if (grid) {
      e.preventDefault();
      applyFilter(f);
      document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
      history.replaceState(null, "", "#shop-" + f.toLowerCase().replace(/ /g, "-"));
    } else {
      a.setAttribute("href", "index.html#shop-" + f.toLowerCase().replace(/ /g, "-"));
    }
  });

  // Deep-link: index.html#shop-hair
  var m = location.hash.match(/^#shop-([\w-]+)/);
  if (m && grid) {
    var name = m[1].split("-").map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(" ");
    applyFilter(name);
    setTimeout(function () { document.getElementById("shop").scrollIntoView(); }, 50);
  }

  // Newsletter
  var form = document.getElementById("nl-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = document.getElementById("nl-email");
      var msg = document.getElementById("nl-msg");
      var email = (input.value || "").trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.textContent = "Please enter a valid email address."; return; }
      if (NEWSLETTER_ENDPOINT) {
        msg.textContent = "Subscribing…";
        fetch(NEWSLETTER_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ email: email, source: "curated4her.com" })
        }).then(function (r) {
          msg.textContent = r.ok ? "You're on the list! Watch your inbox for the next Edit." : "Something went wrong — please try again.";
          if (r.ok) form.reset();
        }).catch(function () { msg.textContent = "Network error — please try again."; });
      } else {
        location.href = "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent("Subscribe me to the Curated4Her Edit") +
          "&body=" + encodeURIComponent("Please add " + email + " to the Curated4Her newsletter.");
        msg.textContent = "Thanks! Your email app will open to confirm your sign-up.";
      }
    });
  }
})();
