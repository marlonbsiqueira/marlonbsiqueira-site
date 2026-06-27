/* ============================================================================
 *  MY JOURNEY — journey.js
 *  Slide controller: builds slides from JOURNEY_DATA, handles EN/PT language
 *  (persisted), prev/next + dots + keyboard + swipe navigation, and drives the
 *  globe per chapter (soft-fill country highlight, origin star marker, distant
 *  rotating overview). Two-sided layout: media panel one side, text the other.
 * ========================================================================== */

(function () {
  "use strict";

  const DATA = window.JOURNEY_DATA;
  const SLIDES = DATA.slides;
  const S = DATA.settings || {};
  const NE = "public/data/";

  const $ = sel => document.querySelector(sel);
  const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };
  const flagUrl = (code, w) => `public/flags/${code}.png`;

  const ICON = {
    prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    video:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M10 9l5 3-5 3z" fill="currentColor"/></svg>',
    email:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M4 7l8 6 8-6"/></svg>',
    linkedin:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.94 6.5A1.94 1.94 0 1 1 5 4.56 1.94 1.94 0 0 1 6.94 6.5zM5.2 8.2h3.5V20H5.2zM10.5 8.2H14v1.6h.05a3.85 3.85 0 0 1 3.46-1.9c3.7 0 4.38 2.43 4.38 5.6V20h-3.5v-5.2c0-1.24 0-2.84-1.73-2.84s-2 1.35-2 2.75V20h-3.5z"/></svg>',
  };

  /* ---------------------------------------------------------------- state */
  let lang = localStorage.getItem("journey-lang") || "en";
  let index = parseInt(localStorage.getItem("journey-index") || "0", 10);
  if (isNaN(index) || index < 0 || index >= SLIDES.length) index = 0;

  const t = (obj) => (obj && (obj[lang] != null ? obj[lang] : obj.en)) || "";

  /* --------------------------------------------------- globe + borders */
  document.documentElement.style.setProperty("--accent", S.accent || "#5cc8ff");
  document.documentElement.style.setProperty("--hl", S.highlight || "#7df2a8");
  const globe = new window.Globe({
    canvas: $("#globe-canvas"),
    accent: S.accent, highlightColor: S.highlight,
    autoRotate: S.autoRotate, rotateSpeed: S.rotateSpeed,
    onProgress: pct => { const b = $("#loader .loader-bar > i"); if (b) b.style.width = Math.round(pct * 100) + "%"; },
  });

  let subunitIndex = {};
  function featureFor(match) {
    const polys = subunitIndex[match];
    if (!polys || !polys.length) return null;
    return { type: "Feature", geometry: { type: "MultiPolygon", coordinates: polys } };
  }
  fetch(NE + "ne_110m_admin_0_countries.geojson").then(r => r.json())
    .then(gj => globe.setGlobalBorders(gj)).catch(() => {});
  fetch(NE + "ne_50m_admin_0_map_subunits.geojson").then(r => r.json()).then(gj => {
    gj.features.forEach(f => {
      const k = f.properties && f.properties.SUBUNIT, g = f.geometry; if (!k || !g) return;
      const b = subunitIndex[k] || (subunitIndex[k] = []);
      if (g.type === "Polygon") b.push(g.coordinates);
      else if (g.type === "MultiPolygon") g.coordinates.forEach(p => b.push(p));
    });

    // Paint all visited countries with a subtle permanent fill
    const visited = [...new Set(SLIDES.filter(s => s.focus && s.focus.match).map(s => s.focus.match))];
    const visitedFeatures = visited.map(m => featureFor(m)).filter(Boolean);
    if (visitedFeatures.length) globe.setVisitedCountries(visitedFeatures);

    applyFocus(SLIDES[index].focus, true);
  }).catch(() => {});

  /* --------------------------------------------------- focus star marker */
  const markerEl = $("#marker");
  globe.on("marker", p => {
    if (!p) { markerEl.classList.remove("show"); return; }
    markerEl.style.left = p.x + "px";
    markerEl.style.top = p.y + "px";
    markerEl.classList.toggle("show", !!p.front);
  });
  function setMarker(focus) {
    if (focus && focus.marker) {
      markerEl.querySelector(".m-text").textContent = t(focus.markerLabel);
      globe.setMarker(focus.marker);
    } else {
      globe.setMarker(null);
      markerEl.classList.remove("show");
    }
  }

  /* ------------------------------------------------------ media helpers */
  function placeholder(cls, src, label, opts) {
    opts = opts || {};
    const box = el("div", "ph " + cls);
    if (opts.icon) box.appendChild(el("div", "ph-icon", ICON.video));
    if (label) box.appendChild(el("div", "ph-tag", label));
    const clear = () => { const tg = box.querySelector(".ph-tag"); tg && tg.remove(); const ic = box.querySelector(".ph-icon"); ic && ic.remove(); };
    fetch(src, { cache: "force-cache" })
      .then(r => (r.ok ? r.blob() : null))
      .then(blob => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        if (opts.video) {
          const v = document.createElement("video");
          v.src = url; v.muted = true; v.loop = true; v.playsInline = true; v.preload = "metadata"; v.controls = !!opts.controls;
          v.setAttribute("loop", "");
          v.setAttribute("muted", "");
          v.setAttribute("playsinline", "");
          v.setAttribute("data-journey-video", "1");
          v.addEventListener("ended", () => { try { v.currentTime = 0; v.play(); } catch (e) {} });
          v.onloadeddata = () => { clear(); syncVideos(); }; box.appendChild(v);
        } else {
          const img = new Image();
          img.src = url; img.alt = label || ""; img.onload = clear; box.appendChild(img);
        }
      })
      .catch(() => {});
    return box;
  }

  function galleryItem(it, square) {
    const card = el("div", "g-card");
    card.appendChild(placeholder("g-media" + (square ? " sq" : ""), it.src, it.src, { video: it.video, icon: it.video, controls: it.video }));
    const cap = t(it); if (cap && cap.cap) card.appendChild(el("div", "g-cap", cap.cap));
    return card;
  }

  function renderMedia(m) {
    if (!m) return null;
    switch (m.type) {
      case "image": {
        const wrap = el("div", "m-single");
        wrap.appendChild(placeholder("single-img", m.src, m.label));
        return wrap;
      }
      case "logos": {
        const container = el("div", "m-logos-wrap");
        const wrap = el("div", "m-logos");
        m.items.forEach(it => {
          const card = el("div", "logo-card");
          card.appendChild(placeholder("lc-img", it.src, it.src));
          card.appendChild(el("div", "lc-t", `<span class="lc-n">${t(it).n}</span><span class="lc-r">${t(it).r}</span>`));
          wrap.appendChild(card);
        });
        container.appendChild(wrap);
        if (m.photos && m.photos.length) {
          const photoGrid = el("div", "g-grid career-photos");
          photoGrid.style.gridTemplateColumns = "repeat(2, 1fr)";
          m.photos.forEach(it => photoGrid.appendChild(galleryItem(it)));
          container.appendChild(photoGrid);
        }
        return container;
      }
      case "gallery": {
        const wrap = el("div", "m-gallery");
        if (m.stat) {
          wrap.appendChild(el("div", "stat-banner",
            `<span class="sb-v">${m.stat.value}</span><span class="sb-u">${m.stat.unit}</span><span class="sb-l">${t(m.stat)}</span>`));
        }
        const grid = el("div", "g-grid");
        grid.style.gridTemplateColumns = `repeat(${m.cols || 2}, 1fr)`;
        m.items.forEach(it => grid.appendChild(galleryItem(it)));
        wrap.appendChild(grid);
        return wrap;
      }
      default: return null;
    }
  }

  /* ------------------------------------------------------- build a slide */
  function buildSlide(s, i) {
    const slide = el("section", "slide");
    slide.dataset.layout = s.layout;
    slide.dataset.index = i;
    slide.dataset.media = s.media ? "1" : "0";
    slide.dataset.side = s.side || (i % 2 ? "left" : "right");
    slide.setAttribute("data-screen-label", "Slide " + String(i + 1).padStart(2, "0"));

    const inner = el("div", "slide-inner");
    const text = el("div", "col-text");
    const L = t(s);

    if (s.layout === "story" && s.chapter)
      text.appendChild(el("div", "s-chapter anim", `${t(DATA.ui.chapter)} ${s.chapter}`));

    const kick = el("div", "s-kicker anim");
    if (s.flag) { const f = document.createElement("img"); f.className = "s-flag"; f.src = flagUrl(s.flag, 40); f.alt = ""; kick.appendChild(f); }
    kick.appendChild(el("span", null, L.kicker || ""));
    text.appendChild(kick);

    if (L.title) text.appendChild(el("h1", "s-title anim", L.title));
    if (L.name) text.appendChild(el("div", "s-name anim", L.name));
    if (L.alt) text.appendChild(el("div", "s-alt anim", L.alt));
    if (L.body) text.appendChild(el("p", "s-body anim", L.body));

    if (s.experiences) {
      const chips = el("div", "chips anim");
      (s.experiences[lang] || s.experiences.en).forEach(c => chips.appendChild(el("span", "chip", c)));
      text.appendChild(chips);
    }

    if (L.cta) {
      const cta = el("button", "btn btn-primary anim", `${ICON.play}<span>${L.cta}</span>`);
      cta.onclick = () => go(i + 1);
      text.appendChild(cta);
    }
    if (s.contact) {
      const c = el("div", "contacts anim");
      s.contact.forEach(ct => {
        const a = el("a", "contact-btn", `${ICON[ct.type] || ""}<span>${ct.value}</span>`);
        a.href = ct.href; a.target = "_blank"; a.rel = "noopener";
        c.appendChild(a);
      });
      text.appendChild(c);
    }

    inner.appendChild(text);
    const media = renderMedia(s.media);
    if (media) { media.classList.add("col-media", "anim"); inner.appendChild(media); }

    slide.appendChild(inner);
    return slide;
  }

  /* ------------------------------------------------------------- render */
  function syncVideos() {
    if (!slideEls || !slideEls.length) return;
    slideEls.forEach((el, i) => {
      el.querySelectorAll('video[data-journey-video]').forEach(v => {
        if (i === index) { v.muted = true; const p = v.play(); if (p && p.catch) p.catch(() => {}); }
        else { try { v.pause(); v.currentTime = 0; } catch (e) {} }
      });
    });
  }

  const deck = $("#deck");
  let slideEls = [];
  function renderAll() {
    deck.innerHTML = "";
    slideEls = SLIDES.map((s, i) => { const e = buildSlide(s, i); deck.appendChild(e); return e; });
    slideEls[index].classList.add("active");
    buildDots();
    syncChrome();
    syncVideos();
    updateScrim();
  }

  const dotsWrap = $("#dots");
  function buildDots() {
    dotsWrap.innerHTML = "";
    SLIDES.forEach((s, i) => {
      const d = el("button", "dot");
      const label = t(s).title || ("Slide " + (i + 1));
      d.title = label;
      d.setAttribute("aria-label", label);
      d.onclick = () => go(i);
      dotsWrap.appendChild(d);
    });
  }

  /* globe focus per slide */
  function applyFocus(focus, silent) {
    if (!focus) return;
    setMarker(focus);
    if (focus.overview) { globe.clearHighlight(); globe.returnToOrbit(); return; }
    globe.flyTo({ coordinates: focus.coordinates, camDistance: focus.dist || 255 });
    globe.clearHighlight();
    if (focus.match) {
      const feat = featureFor(focus.match);
      if (feat) setTimeout(() => globe.highlight(feat), silent ? 0 : 700);
    }
  }

  function updateScrim() {
    const s = SLIDES[index];
    const scrim = $("#scrim");
    scrim.dataset.mode = s.layout === "splash" ? "none"
      : (s.layout === "closing" || s.layout === "thanks") ? "center"
      : (slideEls[index].dataset.side === "left" ? "right" : "left");
  }

  function syncChrome() {
    [...dotsWrap.children].forEach((d, i) => {
      d.classList.toggle("on", i === index);
      d.classList.toggle("done", i < index);
      d.setAttribute("aria-current", i === index ? "true" : "false");
    });
    const countEl = $("#nav-count");
    countEl.innerHTML = `<b>${String(index + 1).padStart(2, "0")}</b> ${t(DATA.ui.of)} ${String(SLIDES.length).padStart(2, "0")}`;
    countEl.setAttribute("aria-live", "polite");
    countEl.setAttribute("aria-label", `${t(DATA.ui.chapter)} ${index + 1} ${t(DATA.ui.of)} ${SLIDES.length}`);
    const prevBtn = $("#prev-btn"), nextBtn = $("#next-btn");
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === SLIDES.length - 1;
    prevBtn.querySelector(".lbl").textContent = t(DATA.ui.prev);
    nextBtn.querySelector(".lbl").textContent = t(DATA.ui.next);
    prevBtn.setAttribute("aria-label", t(DATA.ui.prev));
    nextBtn.setAttribute("aria-label", t(DATA.ui.next));
  }

  /* navigation */
  const flashEl = $("#flight-flash");
  function triggerFlash() {
    if (!flashEl) return;
    flashEl.classList.add("fire");
    setTimeout(() => flashEl.classList.remove("fire"), 650);
  }

  let busy = false;
  function go(i) {
    if (i < 0 || i >= SLIDES.length || i === index || busy) return;
    busy = true;
    const prev = slideEls[index];
    index = i;
    localStorage.setItem("journey-index", String(index));
    prev.classList.remove("active");
    if (window.JourneyAudio) window.JourneyAudio.whoosh();
    triggerFlash();
    applyFocus(SLIDES[index].focus);
    setTimeout(() => {
      slideEls[index].classList.add("active");
      const inner = slideEls[index].querySelector(".col-text"); if (inner) inner.scrollTop = 0;
      syncChrome(); updateScrim(); syncVideos();
      busy = false;
    }, 300);
  }
  function next() { go(index + 1); }
  function prev() { go(index - 1); }

  /* language */
  function setLang(l) {
    if (l === lang) return;
    lang = l;
    localStorage.setItem("journey-lang", l);
    $("#lang-en").classList.toggle("on", l === "en");
    $("#lang-pt").classList.toggle("on", l === "pt");
    document.documentElement.lang = l;
    renderAll();
    setMarker(SLIDES[index].focus);
  }

  /* ------------------------------------------------------------- wire up */
  $("#bar-name").textContent = DATA.brand.name;
  $("#lang-en").onclick = () => setLang("en");
  $("#lang-pt").onclick = () => setLang("pt");
  $("#lang-en").classList.toggle("on", lang === "en");
  $("#lang-pt").classList.toggle("on", lang === "pt");
  document.documentElement.lang = lang;

  $("#prev-btn").innerHTML = `${ICON.prev}<span class="lbl"></span>`;
  $("#next-btn").innerHTML = `<span class="lbl"></span>${ICON.next}`;
  $("#prev-btn").onclick = prev;
  $("#next-btn").onclick = next;

  window.addEventListener("keydown", e => {
    if (e.target.tagName === "INPUT") return;
    if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); next(); }
    else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); prev(); }
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(SLIDES.length - 1);
  });

  let tsx = 0, tsy = 0;
  window.addEventListener("touchstart", e => { const a = e.touches[0]; tsx = a.clientX; tsy = a.clientY; }, { passive: true });
  window.addEventListener("touchend", e => {
    const b = e.changedTouches[0]; const dx = b.clientX - tsx, dy = b.clientY - tsy;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) { dx < 0 ? next() : prev(); }
  }, { passive: true });

  /* loader → first slide */
  function hideLoader() {
    const l = $("#loader"); if (!l || l.classList.contains("gone")) return;
    l.style.opacity = "0"; setTimeout(() => l.classList.add("gone"), 900);
  }
  globe.on("ready", () => setTimeout(hideLoader, 250));
  setTimeout(hideLoader, 9000);

  renderAll();
  applyFocus(SLIDES[index].focus, true);
  const lt = $("#loader .loader-text"); if (lt) lt.textContent = t(DATA.brand.loading);

  /* ------------------------------------------------------------- audio */
  (function setupAudio() {
    const A = window.JourneyAudio;
    if (!A) return;
    const btn = $("#sound-btn");
    const panel = $("#sound-panel");
    const wrap = $("#sound-wrap");
    const ICON_ON =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M4 9v6h4l5 4V5L8 9H4z"/>' +
      '<path class="wave" d="M16.5 8.5a5 5 0 0 1 0 7"/>' +
      '<path class="wave" d="M19 6a8.5 8.5 0 0 1 0 12"/>' +
      '<path class="slash" d="M3 3l18 18"/></svg>';
    btn.innerHTML = ICON_ON;

    const LBL = {
      title: { en: "Soundtrack", pt: "Trilha sonora" },
      own:   { en: "Use my own music…", pt: "Usar minha música…" },
      mute:  { en: "Mute", pt: "Mudo" },
      custom:{ en: "My music", pt: "Minha música" },
    };
    const EQ = '<span class="sp-eq"><i></i><i></i><i></i></span>';
    const FILE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>';

    function buildPanel() {
      const styles = A.getStyles();
      const cur = A.getStyle();
      let html = `<div class="sp-head">${t(LBL.title)}</div>`;
      styles.forEach(s => {
        html += `<button class="sp-item${cur === s.id ? " on" : ""}" data-style="${s.id}">` +
                `<span class="sp-dot"></span><span>${s.name[lang] || s.name.en}</span>${EQ}</button>`;
      });
      if (A.hasCustomTrack()) {
        html += `<button class="sp-item${cur === "custom" ? " on" : ""}" data-style="custom">` +
                `<span class="sp-dot"></span><span>${t(LBL.custom)}</span>${EQ}</button>`;
      }
      html += `<div class="sp-sep"></div>`;
      html += `<button class="sp-file" id="sp-file-btn">${FILE_ICON}<span>${t(LBL.own)}</span></button>`;
      html += `<input type="file" id="sp-file-input" accept="audio/*" style="display:none">`;
      html += `<button class="sp-mute${A.isMuted() ? " on" : ""}" id="sp-mute">${t(LBL.mute)}</button>`;
      panel.innerHTML = html;

      panel.querySelectorAll(".sp-item").forEach(it => {
        it.onclick = () => { A.setStyle(it.dataset.style); buildPanel(); };
      });
      $("#sp-file-btn").onclick = () => $("#sp-file-input").click();
      $("#sp-file-input").onchange = e => {
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        const r = new FileReader();
        r.onload = () => { A.setCustomTrack(r.result); buildPanel(); };
        r.readAsDataURL(f);
      };
      $("#sp-mute").onclick = () => { A.toggleMuted(); buildPanel(); };
    }

    let open = false;
    function setOpen(o) { open = o; panel.classList.toggle("gone", !o); if (o) { A.start(); buildPanel(); btn.classList.remove("hint"); } }
    btn.onclick = e => { e.stopPropagation(); setOpen(!open); };
    document.addEventListener("click", e => { if (open && !wrap.contains(e.target)) setOpen(false); });

    A.onMuteChange(m => { btn.classList.toggle("muted", m); });
    A.onStyleChange(() => {});

    function kick() {
      A.start();
      window.removeEventListener("pointerdown", kick);
      window.removeEventListener("keydown", kick);
    }
    window.addEventListener("pointerdown", kick);
    window.addEventListener("keydown", kick);

    if (!A.isMuted()) setTimeout(() => btn.classList.add("hint"), 1200);
  })();

  window.JOURNEY = { go, next, prev, setLang, globe, get index() { return index; }, get lang() { return lang; } };
})();
