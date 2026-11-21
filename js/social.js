/*
  Likes, comments, "nominate as best" and follows, inside each project's pop-up.
  Students sign in with their school Google account. Everything is saved by the
  Apps Script in apps-script/submit.gs, in the "Bricolage likes, comments & follows" sheet.
  Comments and follow requests only appear once you tick "Approved" in that sheet.

  Until GOOGLE_CLIENT_ID is filled in, none of this shows on the site.
*/

// Same Web app URL as in js/submit.js.
const SOCIAL_URL = "https://script.google.com/macros/s/AKfycbxXl2Wk31XvgT2H4AsqqtmYTbNVsz2iVX9F7Pt5xjaEbhGKn9CmbL6LHpPEP340_zGN/exec";
// Google sign-in: the OAuth client ID (ends in .apps.googleusercontent.com), and the school's
// email domain so the sign-in only offers school accounts. Both must match apps-script/submit.gs.
const GOOGLE_CLIENT_ID = "";
const SCHOOL_DOMAIN = "";

window.SOCIAL = (() => {
  if (!GOOGLE_CLIENT_ID) return null;

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const TOKEN = "bricolage-google-token";

  // The sign-in token lasts about an hour; after that the student signs in again.
  const expired = (t) => {
    try { return JSON.parse(atob(t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).exp * 1000 < Date.now() + 60e3; }
    catch { return true; }
  };
  let token = null;
  try { token = localStorage.getItem(TOKEN); } catch {}
  if (token && expired(token)) token = null;
  const keep = (t) => { token = t; try { t ? localStorage.setItem(TOKEN, t) : localStorage.removeItem(TOKEN); } catch {} };

  let data = null;     // the latest answer from the script: counts, comments, and what this student has done
  let current = null;  // { el, p } — the project pop-up that's open
  let note = "";       // a message under the buttons
  let busy = false;
  let draft = "";      // a comment being written, kept while it's sent (and if sending fails)

  async function call(body) {
    const res = await fetch(SOCIAL_URL, { method: "POST", body: JSON.stringify({ ...body, token }) });
    const out = await res.json();
    if (!out.ok) throw new Error(out.error || "Something went wrong — please try again.");
    if (token && !out.user) {
      keep(null);
      note = `Please sign in with your school account${SCHOOL_DOMAIN ? ` (…@${SCHOOL_DOMAIN})` : ""}.`;
    }
    data = out;
    return out;
  }

  const ready = call({ action: "load" }).catch(() => { note = "Likes and comments couldn't be loaded right now."; });

  // Google's sign-in script, loaded only when this is switched on.
  const google = new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = () => {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        hd: SCHOOL_DOMAIN || undefined,
        callback: async (r) => {
          keep(r.credential);
          note = "";
          busy = true; render();
          try { await call({ action: "load" }); } catch (e) { note = e.message; }
          busy = false; render();
        },
      });
      resolve(window.google.accounts.id);
    };
    document.head.append(s);
  });

  const when = (t) => new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

  function render() {
    if (!current) return;
    const { el, p } = current;
    if (!data) {
      el.innerHTML = `<p class="social__who">${esc(note || "Loading likes and comments…")}</p>`;
      return;
    }
    const mine = data.mine || { likes: [], nominations: [], follows: {} };
    const liked = mine.likes.includes(p.id);
    const nominated = mine.nominations.includes(p.id);
    const follow = mine.follows[p.student] || "";
    const likes = data.likes[p.id] || 0;
    const noms = data.nominations[p.id] || 0;
    const followers = data.followers[p.student] || 0;
    const comments = (data.comments[p.id] || []).slice().sort((a, b) => a.time - b.time);
    const first = esc(String(p.student).split(" ")[0]);
    const followLabel = follow === "following" ? `Following ${first} ✓`
      : follow === "requested" ? "Follow requested — waiting for approval"
      : `Follow ${first}`;
    const dis = busy ? " disabled" : "";

    el.innerHTML = `
      <div class="social__bar">
        <button class="social__btn" data-do="like" aria-pressed="${liked}"${dis}>
          <span aria-hidden="true">${liked ? "♥" : "♡"}</span> ${liked ? "Liked" : "Like"} <b>${likes}</b></button>
        <button class="social__btn" data-do="nominate" aria-pressed="${nominated}"${dis}>
          <span aria-hidden="true">★</span> ${nominated ? "Nominated as best" : "Nominate as best"} <b>${noms}</b></button>
        ${p.student ? `<button class="social__btn" data-do="follow" data-follow="${follow || "none"}" aria-pressed="${follow === "following"}"${dis}>
          ${followLabel} <b>${plural(followers, "follower")}</b></button>` : ""}
      </div>
      <p class="social__note${note && !busy ? " social__note--error" : ""}" aria-live="polite">${busy ? "Saving…" : esc(note)}</p>
      ${data.user
        ? `<p class="social__who">Signed in as ${esc(data.user.name)} · <button type="button" data-do="signout">Sign out</button></p>`
        : `<div class="social__signin"><p>Sign in with your school Google account to like, nominate, follow or comment.</p><div class="social__gbtn"></div></div>`}

      <p class="sheet__best-label social__title">Comments${comments.length ? ` (${comments.length})` : ""}</p>
      ${comments.length
        ? `<ol class="social__comments">${comments.map((c) => `
            <li${c.pending ? ' class="is-pending"' : ""}>
              <span class="social__meta"><b>${esc(c.name)}</b> · ${when(c.time)}${c.pending ? " · waiting for approval, only you can see it" : ""}</span>
              <p>${esc(c.text)}</p>
            </li>`).join("")}</ol>`
        : `<p class="social__who">No comments yet.</p>`}
      ${data.user ? `<form class="social__form">
          <textarea name="text" maxlength="500" rows="3" required aria-label="Your comment" placeholder="Say something kind and useful about this project…">${esc(draft)}</textarea>
          <button class="btn" type="submit"${dis}>Post comment</button>
          <small>Comments appear once the design team approves them.</small>
        </form>` : ""}`;

    const gbtn = el.querySelector(".social__gbtn");
    if (gbtn) google.then((id) => id.renderButton(gbtn, { theme: "outline", size: "large", text: "signin_with" }));
  }

  async function act(body) {
    if (data && data.user && (!token || expired(token))) {
      keep(null);
      data = { ...data, user: null };
      note = "Your sign-in ran out — please sign in again.";
      render();
      return;
    }
    if (!data || !data.user) {
      note = "Sign in first — use the Google button below.";
      render();
      return;
    }
    busy = true; note = ""; render();
    try {
      await call(body);
      if (body.action === "comment") draft = "";
    } catch (e) { note = e.message; }
    busy = false; render();
  }

  document.addEventListener("click", (e) => {
    const b = current && e.target.closest(".social [data-do]");
    if (!b || b.disabled) return;
    const { p } = current;
    const what = b.dataset.do;
    if (what === "signout") {
      keep(null);
      window.google?.accounts.id.disableAutoSelect();
      data = { ...data, user: null, mine: null };
      note = "";
      render();
      call({ action: "load" }).then(render, () => {});
    } else if (what === "follow") act({ action: "follow", student: p.student });
    else act({ action: what, project: p.id });
  });

  document.addEventListener("input", (e) => {
    if (e.target.closest(".social__form")) draft = e.target.value;
  });

  document.addEventListener("submit", (e) => {
    const form = current && e.target.closest(".social__form");
    if (!form) return;
    e.preventDefault();
    draft = form.text.value.trim();
    if (draft) act({ action: "comment", project: current.p.id, text: draft });
  });

  return {
    // main.js calls this when a project's pop-up opens
    show(el, p) {
      current = { el, p };
      note = "";
      draft = "";
      render();
      ready.then(() => { if (current && current.el === el) render(); });
    },
  };
})();
