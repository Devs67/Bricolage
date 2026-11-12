(async () => {
  await window.SHOWCASE_READY;
  const data = window.SHOWCASE || { projects: [], facilitators: [] };
  const projects = [...data.projects].sort((a, b) => (b.best ? 1 : 0) - (a.best ? 1 : 0));
  const bestProjects = projects.filter((p) => p.best);
  const GRADES = ["MYP 1", "MYP 2", "MYP 3", "MYP 4", "MYP 5", "DP 1", "DP 2"];

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = matchMedia("(hover: hover)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.1 });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  const scrollToEl = (el) =>
    lenis ? lenis.scrollTo(el) : el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });

  $$('a[href^="#"]:not(.skip)').forEach((a) =>
    a.addEventListener("click", (e) => {
      const target = $(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      scrollToEl(target);
    })
  );

  /* Menu: each letter sketches in and prints like the DESIGN letters.
     --i = order across the whole menu (load), --j = order within its word (hover). */
  const menu = $(".menu");
  if (menu) {
    let i = 0;
    $$(".menu a").forEach((a) => {
      const word = a.textContent.trim();
      a.setAttribute("aria-label", word);
      a.innerHTML = [...word]
        .map((ch, j) => (ch === " " ? " " :
          `<span class="ml" data-l="${ch}" style="--i:${i++};--j:${j}" aria-hidden="true">${ch}</span>`))
        .join("");
    });
    setTimeout(() => menu.classList.add("menu--ready"), 0.6e3 + i * 50 + 500);
  }

  /* ---------- Cutting-mat ruler numbers ---------- */
  const rulerTop = $(".mat__ruler--top");
  const rulerLeft = $(".mat__ruler--left");
  for (let x = 0, n = 0; x < 3000; x += 120, n++) {
    const s = document.createElement("span");
    s.textContent = n * 5;
    s.style.left = x + "px";
    rulerTop.append(s);
  }
  for (let y = 120, n = 1; y < 1600; y += 120, n++) {
    const s = document.createElement("span");
    s.textContent = n * 5;
    s.style.top = y + "px";
    rulerLeft.append(s);
  }

  /* ---------- Roller: a ruler-style scrollbar on the left, numbered like the mat.
     The green fill shows how far you've come. The handle is a scale needle on a hub:
     it slides down the ruler and spins fast as you scroll.
     Drag it (or click the ruler) to move the page. ---------- */
  const roller = document.createElement("div");
  roller.className = "roller";
  roller.setAttribute("aria-hidden", "true");
  roller.innerHTML = `<span class="roller__nums"></span><span class="roller__channel"><span class="roller__fill"></span></span>
    <svg class="roller__knob" viewBox="0 0 100 100">
      <g class="roller__needle"><g transform="rotate(90 50 50)">
        <path d="M47.6 50 L49.2 6 H50.8 L52.4 50 Z"/>
        <path d="M47 50 H53 V66 H47 Z"/>
        <circle cx="50" cy="70" r="7"/>
      </g></g>
      <circle class="roller__hub" cx="50" cy="50" r="11"/>
      <circle class="roller__pivot" cx="50" cy="50" r="3.5"/>
    </svg>`;
  document.body.append(roller);
  document.documentElement.classList.add("has-roller");
  const KNOB = 24;
  const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;
  const needle = $(".roller__needle", roller);

  // The needle rests horizontal, pointing at the page. It spins while you scroll,
  // then springs back to horizontal (the nearest full turn) once you stop.
  let settle = 0;
  const moveRoller = () => {
    const p = maxScroll() > 0 ? Math.min(1, window.scrollY / maxScroll()) : 0;
    roller.style.setProperty("--y", `${KNOB / 2 + p * (window.innerHeight - KNOB)}px`);
    const turn = (window.scrollY / 120) * 360; // fast: one full turn every 120px
    needle.style.transition = "transform 0.12s linear";
    needle.style.transform = `rotate(${turn}deg)`;
    clearTimeout(settle);
    settle = setTimeout(() => {
      needle.style.transition = "";
      needle.style.transform = `rotate(${Math.round(turn / 360) * 360}deg)`;
    }, 180);
  };
  // numbers every 120px, like the cutting mat's printed scale
  const numberRoller = () => {
    let html = "";
    for (let y = 120, n = 1; y < window.innerHeight; y += 120, n++) html += `<span style="top:${y}px">${n * 5}</span>`;
    $(".roller__nums", roller).innerHTML = html;
  };
  numberRoller();
  window.addEventListener("scroll", moveRoller, { passive: true });
  window.addEventListener("resize", () => { numberRoller(); moveRoller(); });
  new ResizeObserver(moveRoller).observe(document.body);

  let rolling = false;
  const rollTo = (clientY) => {
    const p = Math.min(1, Math.max(0, (clientY - KNOB / 2) / (window.innerHeight - KNOB)));
    if (lenis) lenis.scrollTo(p * maxScroll(), { immediate: true });
    else window.scrollTo(0, p * maxScroll());
    moveRoller();
  };
  roller.addEventListener("pointerdown", (e) => {
    rolling = true;
    roller.setPointerCapture(e.pointerId);
    roller.classList.add("is-rolling");
    rollTo(e.clientY);
    e.preventDefault();
  });
  roller.addEventListener("pointermove", (e) => { if (rolling) rollTo(e.clientY); });
  const stopRoll = () => { rolling = false; roller.classList.remove("is-rolling"); };
  roller.addEventListener("pointerup", stopRoll);
  roller.addEventListener("pointercancel", stopRoll);

  /* ---------- Hero letters stretch toward the cursor ---------- */
  const letters = $$(".l");
  const mat = $(".mat");
  if (!reduce && canHover) {
    let px = null;
    let frame = 0;
    const stretch = () => {
      frame = 0;
      const reach = window.innerWidth * 0.22;
      letters.forEach((l) => {
        let w = 100;
        if (px !== null) {
          const r = l.getBoundingClientRect();
          const d = Math.abs(px - (r.left + r.width / 2));
          w = 85 + 60 * Math.max(0, 1 - d / reach);
        }
        l.style.fontVariationSettings = `"wdth" ${w.toFixed(1)}, "wght" 800`;
      });
    };
    mat.addEventListener("pointermove", (e) => {
      px = e.clientX;
      if (!frame) frame = requestAnimationFrame(stretch);
    });
    mat.addEventListener("pointerleave", () => {
      px = null;
      requestAnimationFrame(stretch);
    });
  }

  /* ---------- Scroll reveals ---------- */
  $$(".explore__row").forEach((el, i) => (el.style.transitionDelay = `${i * 0.08}s`));
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        io.unobserve(e.target);
      }),
    { threshold: 0.15 }
  );
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------- Gallery ---------- */
  const state = { mode: "grade", value: "all" };
  const chipsEl = $("#chips");
  const grid = $("#grid");
  const countEl = $("#count");
  const emptyEl = $("#empty");

  const matches = (p) => {
    if (state.mode === "led") return p.studentLed && (state.value === "all" || p.grade === state.value);
    if (state.value === "all") return true;
    if (state.mode === "grade") return p.grade === state.value;
    if (state.mode === "facilitator") return p.facilitator === state.value;
    const [kind, v] = state.value.split(":");
    return kind === "type" ? p.type === v : p.category === v;
  };

  const chip = (label, value, count, extra = "") =>
    `<button class="chip ${extra}" data-value="${esc(value)}" aria-pressed="${state.value === value}"${count === 0 ? " disabled" : ""}>` +
    `${esc(label)}${count != null ? `<sup>${count}</sup>` : ""}</button>`;

  const countBy = (key, v) => projects.filter((p) => p[key] === v).length;

  function renderChips() {
    chipsEl.classList.toggle("chips--ruler", state.mode === "grade");
    let html = chip("All", "all", projects.length);

    if (state.mode === "led") {
      const led = projects.filter((p) => p.studentLed);
      html = chip("All student-led", "all", led.length);
      html += GRADES.map((g) => chip(g, g, led.filter((p) => p.grade === g).length)).join("");
    } else if (state.mode === "grade") {
      html += GRADES.map((g) => chip(g, g, countBy("grade", g))).join("");
    } else if (state.mode === "category") {
      ["Digital", "Physical"].forEach((type) => {
        const cats = [...new Set(projects.filter((p) => p.type === type).map((p) => p.category))].sort();
        html += `<span class="chips__group" aria-hidden="true">${type}:</span>`;
        html += chip(`All ${type.toLowerCase()}`, `type:${type}`, countBy("type", type));
        html += cats.map((c) => chip(c, `cat:${c}`, countBy("category", c))).join("");
      });
    } else {
      const names = data.facilitators.length ? data.facilitators : [...new Set(projects.map((p) => p.facilitator).filter(Boolean))];
      html += names.map((n) => chip(n, n, countBy("facilitator", n))).join("");
    }
    chipsEl.innerHTML = html;
  }

  const placeholder = (p) =>
    `<span class="ph ph--${esc(String(p.type).toLowerCase())}">` +
    `<span class="ph__word">${esc(p.category)}</span>` +
    `<span class="ph__label">Photo coming soon</span></span>`;

  // Grade plus the student's section, e.g. "MYP 2A"
  const gradeOf = (p) => esc(p.grade) + esc(p.section || "");

  const cardHTML = (p) => {
    const media = p.images && p.images.length
      ? `<img src="${esc(p.images[0])}" alt="" loading="lazy">`
      : placeholder(p);
    return `<li class="card" style="view-transition-name: c-${esc(p.id)}">
      <button class="card__btn js-open" data-id="${esc(p.id)}">
        <span class="card__media">${media}
          <span class="card__note" aria-hidden="true">open it →</span>
        </span>
        <span class="card__badges">
          <span class="card__badge">${esc(p.category)}</span>
          ${p.studentLed ? `<span class="card__badge card__badge--led">Student-led</span>` : ""}
        </span>
        ${p.best ? `<span class="best-tag">★ Best project</span>` : ""}
        <span class="card__sticky">
          <span class="card__title">${esc(p.title)}</span>
          <span class="card__meta"><b class="card__student student">${esc(p.student)}</b> · <span class="card__grade">${gradeOf(p)}</span></span>
        </span>
      </button>
    </li>`;
  };

  function renderGrid() {
    const list = projects.filter(matches);
    grid.innerHTML = list.map(cardHTML).join("");
    countEl.textContent = `${list.length} project${list.length === 1 ? "" : "s"}`;
    emptyEl.hidden = list.length > 0;
  }

  function render() {
    const run = () => { renderChips(); renderGrid(); };
    if (document.startViewTransition && !reduce) document.startViewTransition(run);
    else run();
  }

  function setMode(mode) {
    state.mode = mode;
    state.value = "all";
    $$(".tab").forEach((t) => t.setAttribute("aria-selected", String(t.dataset.mode === mode)));
    render();
  }

  $$(".tab").forEach((t) => t.addEventListener("click", () => setMode(t.dataset.mode)));

  if (chipsEl) {
    chipsEl.addEventListener("click", (e) => {
      const b = e.target.closest(".chip");
      if (!b || b.disabled) return;
      state.value = b.dataset.value;
      render();
    });
  }

  /* ---------- Best projects ---------- */
  const strengthsHTML = (p) =>
    `<span class="strengths">${(p.strengths || []).map((s) => `<span>${esc(s)}</span>`).join("")}</span>`;

  // Best and student-led projects get a row each: big photo print, title,
  // the student's name signed in marker and the grade circled (the same ring as MYP / DP in the hero).
  const ring = `<svg viewBox="0 0 120 70" preserveAspectRatio="none" aria-hidden="true"><path d="M14,30 C18,12 52,5 82,8 C108,11 118,28 112,45 C105,62 62,68 34,62 C12,57 4,44 12,28 C18,17 34,11 54,9"/></svg>`;
  const featHTML = (p, led = false) => {
    const media = p.images && p.images.length
      ? `<img src="${esc(p.images[0])}" alt="" loading="lazy">`
      : placeholder(p);
    const kind = [p.category, p.type].filter(Boolean).map(esc).join(" · ");
    const line = led ? p.problem : p.why || p.problem;
    return `<li class="feat reveal">
      <button class="feat__btn js-open" data-id="${esc(p.id)}">
        <span class="feat__print"><span class="feat__photo">${media}</span></span>
        <span class="feat__text">
          <span class="feat__kind">${kind}</span>
          <span class="feat__title">${esc(p.title)}</span>
          <span class="feat__by"><span class="feat__name">by ${esc(p.student)}</span><span class="feat__grade">${gradeOf(p)}${ring}</span></span>
          ${line ? `<span class="feat__desc">${esc(line)}</span>` : ""}
          ${p.strengths && p.strengths.length ? strengthsHTML(p) : ""}
          <span class="feat__open" aria-hidden="true">Open project →</span>
        </span>
      </button>
    </li>`;
  };

  const showReveals = (root) => $$(".reveal", root).forEach((el) => io.observe(el));

  // Home page: first 3 best projects
  const spotlight = $("#spotlight");
  if (spotlight) {
    spotlight.innerHTML = bestProjects.slice(0, 3).map((p) => featHTML(p)).join("");
    showReveals(spotlight);
  }

  /* ---------- Student-led projects (same rows as the best projects) ---------- */
  const ledList = $("#led-list");
  if (ledList) {
    ledList.innerHTML = projects.filter((p) => p.studentLed).slice(0, 3).map((p) => featHTML(p, true)).join("");
    showReveals(ledList);
  }
  $$(".js-led").forEach((a) => a.addEventListener("click", () => setMode("led")));

  // Best projects page: criteria + every best project, filterable by strength
  const criteriaEl = $("#criteria");
  if (criteriaEl) {
    criteriaEl.innerHTML = (data.criteria || [])
      .map((c) => `<li class="reveal"><span class="criteria__name">${esc(c.name)}</span><span class="criteria__desc">${esc(c.description)}</span></li>`)
      .join("");
    showReveals(criteriaEl);
  }

  const bestGrid = $("#best-grid");
  const bestChips = $("#best-chips");
  if (bestGrid && bestChips) {
    let strength = "all";
    const renderBest = () => {
      const list = strength === "all" ? bestProjects : bestProjects.filter((p) => (p.strengths || []).includes(strength));
      const count = (name) => bestProjects.filter((p) => (p.strengths || []).includes(name)).length;
      // only strengths that some project has; with none (sheet not filled in yet) the filter bar stays hidden
      const used = (data.criteria || []).filter((c) => count(c.name) > 0);
      bestChips.hidden = used.length === 0;
      bestChips.innerHTML =
        `<button class="chip" data-value="all" aria-pressed="${strength === "all"}">All<sup>${bestProjects.length}</sup></button>` +
        used
          .map((c) => `<button class="chip" data-value="${esc(c.name)}" aria-pressed="${strength === c.name}">${esc(c.name)}<sup>${count(c.name)}</sup></button>`)
          .join("");
      bestGrid.innerHTML = list.map((p) => featHTML(p)).join("");
      $("#best-count").textContent = `${list.length} project${list.length === 1 ? "" : "s"}`;
      $$(".reveal", bestGrid).forEach((el) => el.classList.add("in"));
    };
    bestChips.addEventListener("click", (e) => {
      const b = e.target.closest(".chip");
      if (!b || b.disabled) return;
      strength = b.dataset.value;
      if (document.startViewTransition && !reduce) document.startViewTransition(renderBest);
      else renderBest();
    });
    renderBest();
  }

  $$(".explore__row").forEach((row) =>
    row.addEventListener("click", () => {
      setMode(row.dataset.mode);
      scrollToEl($("#projects"));
    })
  );

  /* ---------- Project sheet ---------- */
  const sheet = $("#sheet");
  const sheetBody = $("#sheet-body");
  const sheetInner = $(".sheet__inner");

  function sheetHTML(p) {
    const imgs = p.images || [];
    const media = imgs.length
      ? `<img src="${esc(imgs[0])}" alt="${esc(p.title)}, photo 1" id="sheet-img">`
      : placeholder(p);
    const thumbs = imgs.length > 1
      ? `<div class="sheet__thumbs">${imgs
          .map((src, i) => `<button data-src="${esc(src)}" data-n="${i + 1}" aria-label="Show photo ${i + 1}" aria-current="${i === 0}"><img src="${esc(src)}" alt=""></button>`)
          .join("")}</div>`
      : "";
    const links = (p.links || []).length
      ? `<div class="sheet__links">${p.links
          .map((l) => `<a class="btn" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`)
          .join("")}</div>`
      : "";

    return `
      <div class="sheet__media">${media}</div>${thumbs}
      <div class="sheet__grid">
        <div>
          <p class="sheet__kicker">${gradeOf(p)} · ${esc(p.type)} · ${esc(p.category)}${p.studentLed ? " · Student-led" : ""}</p>
          <h2 class="sheet__title" id="sheet-title">${esc(p.title)}</h2>
          <p class="sheet__by">by <strong class="student">${esc(p.student)}</strong>${p.classOf ? ` · Class of ${esc(p.classOf)}` : ""}</p>
          <p class="sheet__problem">${esc(p.problem)}</p>
          ${links}
          ${(p.steps || []).length ? `<div class="sheet__steps">
            <p class="sheet__best-label">How it works</p>
            <ol>${p.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
          </div>` : ""}
          ${p.best ? `<div class="sheet__best">
            <p class="sheet__best-label">★ Best project${p.why || (p.strengths || []).length ? " — why it stands out" : ""}</p>
            ${p.why ? `<p class="sheet__best-why">${esc(p.why)}</p>` : ""}
            ${(p.strengths || []).length ? strengthsHTML(p) : ""}
          </div>` : ""}
        </div>
        <div>
          <dl class="spec">
            <div><dt>Designed for</dt><dd>${esc(p.designedFor)}</dd></div>
            <div><dt>Made with</dt><dd class="tools">${(p.tools || []).map((t) => `<span>${esc(t)}</span>`).join("")}</dd></div>
            ${p.facilitator ? `<div><dt>${p.studentLed ? "Mentor" : "Facilitator"}</dt><dd>${esc(p.facilitator)}</dd></div>` : ""}
            ${p.year ? `<div><dt>Year</dt><dd>${esc(p.year)}</dd></div>` : ""}
          </dl>
          ${p.unit ? `<details class="educators"><summary>For educators</summary><p><strong>Unit / brief:</strong> ${esc(p.unit)}</p></details>` : ""}
        </div>
      </div>`;
  }

  function openProject(id) {
    const p = projects.find((x) => x.id === id);
    if (!p) return;
    sheetBody.innerHTML = sheetHTML(p);
    if (!sheet.open) sheet.showModal();
    sheetInner.scrollTop = 0;
    if (lenis) lenis.stop();
    history.replaceState(null, "", `#project/${id}`);
  }

  document.addEventListener("click", (e) => {
    const b = e.target.closest(".js-open");
    if (b) openProject(b.dataset.id);
  });

  sheetBody.addEventListener("click", (e) => {
    const t = e.target.closest(".sheet__thumbs button");
    if (!t) return;
    const img = $("#sheet-img");
    img.src = t.dataset.src;
    img.alt = img.alt.replace(/photo \d+$/, `photo ${t.dataset.n}`);
    $$(".sheet__thumbs button", sheetBody).forEach((b) => b.setAttribute("aria-current", String(b === t)));
  });

  $("#sheet-close").addEventListener("click", () => sheet.close());
  sheet.addEventListener("click", (e) => { if (e.target === sheet) sheet.close(); });
  sheet.addEventListener("close", () => {
    if (lenis) lenis.start();
    if (location.hash.startsWith("#project/")) history.replaceState(null, "", location.pathname + location.search);
  });

  /* ---------- Start ---------- */
  if (grid) {
    renderChips();
    renderGrid();
  }
  if (location.hash.startsWith("#project/")) openProject(decodeURIComponent(location.hash.slice(9)));

  /* ---------- Visitor counters (free counter service: abacus.jasoncameron.dev) ----------
     Two counters: every visit so far, and visits today (a separate counter per day).
     Each visit counts once, however many pages are opened. A counter stays hidden if the service can't be reached. */
  const visits = $("#visits");
  if (visits) {
    const key = location.hostname.endsWith("github.io") ? "visits" : "visits-test";
    // "today" is the date in India for every visitor, so the daily count starts again at midnight at school
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    const seen = (name) => { try { return sessionStorage.getItem(name); } catch { return null; } };
    // el = the footer line to fill, counter = its name at the service, mark/value = how this tab remembers it has been counted
    const count = (el, counter, digits, mark, value) =>
      fetch(`https://abacus.jasoncameron.dev/${seen(mark) === value ? "get" : "hit"}/bricolage-sis-design/${counter}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((data) => {
          try { sessionStorage.setItem(mark, value); } catch {}
          $(".site-footer__digits", el).innerHTML = String(data.value).padStart(digits, "0").split("").map((d) => `<span>${d}</span>`).join("");
          el.hidden = false;
        })
        .catch(() => {});
    count(visits, key, 5, "bricolage-counted", "1");
    count($("#visits-today"), `${key}-${today}`, 3, "bricolage-counted-day", today);
  }
})();
