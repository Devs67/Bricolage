/*
  Bricolage — submission form mailer (Google Apps Script).
  The form on submit.html sends each submission here; this emails it to you
  with the photos attached. Submissions aren't saved to Google Drive.
  It also counts QR code scans (see logScan below) in a "Bricolage QR scans" sheet,
  and saves likes, comments, nominations and follows (see "Likes, comments…" below).

  Set up once:
    1. Go to https://script.google.com and click "New project".
    2. Delete what's there, paste this whole file, and click Save.
    3. Click Deploy → New deployment → the gear icon → "Web app".
         Execute as:     Me
         Who has access: Anyone
       Click Deploy, allow the permissions Google asks for, and copy the Web app URL.
    4. Paste that URL into SUBMIT_URL at the top of js/submit.js.

  If you change this file later: Deploy → Manage deployments → edit (pencil) →
  Version: "New version" → Deploy. The URL stays the same.

  Once, for the daily Claude review: pick "setup" in the function menu at the top
  and click Run. It prints a photo key in the log — give that key to Claude.
*/

const SUBJECT = "Bricolage submission";
const NEW_LABEL = "Bricolage/To review";

// Form field → label in the email. Labels match the column names in the sheet.
const FIELDS = [
  ["project", "Project name"],
  ["student", "Student name"],
  ["grade", "Grade"],
  ["section", "Section"],
  ["type", "Type"],
  ["category", "Category"],
  ["teacher", "Teacher"],
  ["description", "Description (problem it solves)"],
  ["designedFor", "Designed for"],
  ["madeWith", "Made with"],
  ["link", "App / website / video link"],
  ["studentLed", "Student-led"],
  ["steps", "How it works (one step per line)"],
  ["unit", "Unit (optional)"],
];
const REQUIRED = ["project", "student", "grade", "type", "category", "description"];

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.scan) return reply(logScan(d.scan));
    if (d.action) return reply(social(d));
    if (d.website) return reply({ ok: true }); // hidden field only bots fill in

    const get = (k, max = 1500) => String(d[k] || "").trim().slice(0, max);
    const missing = REQUIRED.filter((k) => !get(k));
    if (missing.length) return reply({ ok: false, error: "Missing: " + missing.join(", ") });

    const photos = (d.photos || []).slice(0, 6).map((b64, i) =>
      Utilities.newBlob(Utilities.base64Decode(b64), "image/jpeg", `photo-${i + 1}.jpg`));
    if (!photos.length) return reply({ ok: false, error: "No photos" });

    const subject = `${SUBJECT}: ${get("project", 120)} — ${get("student", 80)}, ${get("grade", 10)}${get("section", 2)}`;
    const body = FIELDS.map(([k, label]) => `${label}:\n${get(k) || "—"}`).join("\n\n") +
      `\n\nPhotos: ${photos.length} attached`;

    MailApp.sendEmail({
      to: Session.getEffectiveUser().getEmail(),
      subject,
      body,
      attachments: photos,
      name: "Bricolage website",
    });
    fileSubmissions();
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  }
}

// QR code scans: qr.html on the site sends one of these per scan. Each scan adds a row
// to the "Bricolage QR scans" sheet in your Drive, which is made the first time.
// Run this once by hand after pasting the new code: it asks for the Sheets permission,
// makes the sheet, and adds a "test" row you can delete.
function logScan(source = "test") {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty("SCAN_SHEET_ID");
  if (!id) {
    const ss = SpreadsheetApp.create("Bricolage QR scans");
    ss.getSheets()[0].getRange("A1:D1").setValues([["Time", "Source", "Total scans", "=COUNTA(A2:A)"]]);
    id = ss.getId();
    props.setProperty("SCAN_SHEET_ID", id);
  }
  SpreadsheetApp.openById(id).getSheets()[0].appendRow([new Date(), String(source).slice(0, 40)]);
  return { ok: true };
}

// Moves submission emails out of the inbox and under the "Bricolage/To review" label.
// Gmail can take a moment to find a new email, so anything missed is caught next time
// (and by the daily Claude review).
function fileSubmissions() {
  try {
    Utilities.sleep(2000);
    const label = GmailApp.getUserLabelByName(NEW_LABEL) || GmailApp.createLabel(NEW_LABEL);
    GmailApp.search(`subject:"${SUBJECT}" in:inbox`, 0, 50).forEach((t) => {
      t.addLabel(label);
      t.moveToArchive();
    });
  } catch (err) {
    console.warn(err); // never block a submission over this
  }
}

// The daily Claude review fetches a submission's photos here, using the key from setup().
// It only ever returns photos from "Bricolage submission" emails, or from emails
// you have labelled "Bricolage/Approved" yourself (e.g. a student who emailed you directly).
const APPROVED_LABEL = "Bricolage/Approved";

function doGet(e) {
  const p = e.parameter;
  const key = PropertiesService.getScriptProperties().getProperty("PHOTO_KEY");
  if (!key || p.key !== key) return reply({ ok: false, error: "Not allowed" });
  const msg = GmailApp.getMessageById(p.id);
  const approved = msg && msg.getThread().getLabels().some((l) => l.getName() === APPROVED_LABEL);
  if (!msg || (msg.getSubject().indexOf(SUBJECT) !== 0 && !approved)) return reply({ ok: false, error: "Not a submission" });
  return reply({ ok: true, photos: msg.getAttachments().map((a) => Utilities.base64Encode(a.getBytes())) });
}

// Run once by hand: makes the photo key and prints it in the log.
function setup() {
  const key = Utilities.getUuid();
  PropertiesService.getScriptProperties().setProperty("PHOTO_KEY", key);
  console.log("Photo key for Claude: " + key);
}

/* ===== Likes, comments, nominations and follows =====
  The project pop-up on the site (js/social.js) sends these. Students sign in with their
  school Google account; only accounts on SCHOOL_DOMAIN are accepted.
  Everything is saved in the "Bricolage likes, comments & follows" sheet in your Drive, one tab each.
  Comments and follow requests stay hidden until you tick their "Approved" box in that sheet
  (you get an email for each one). Untick it to hide it again; delete the row to remove it.

  Set up once:
    1. Fill in CLIENT_ID and SCHOOL_DOMAIN below (CLIENT_ID is the same one as in js/social.js).
    2. Pick "setupSocial" in the function menu at the top and click Run. Allow the permissions
       Google asks for: it makes the sheet and prints its link in the log.
    3. Deploy → Manage deployments → edit (pencil) → Version: "New version" → Deploy.
*/
const CLIENT_ID = "133690369218-jthoqki5lhiprkklo2mauedr2ik14gon.apps.googleusercontent.com";  // Google sign-in client ID, same as in js/social.js
const SCHOOL_DOMAIN = "sis.edu.in";  // the part after @ in school email addresses, e.g. "school.edu.in"

const TABS = {
  Likes: ["Time", "Project", "Email", "Name"],
  Nominations: ["Time", "Project", "Email", "Name"],
  Comments: ["Time", "Project", "Email", "Name", "Comment", "Approved"],
  Follows: ["Time", "Student", "Email", "Name", "Approved"],
};

function setupSocial() {
  console.log("Likes, comments & follows sheet: " + socialSheet().getUrl());
}

function social(d) {
  const user = d.token ? signedIn(d.token) : null;
  const ss = socialSheet();
  if (d.action !== "load") {
    if (!user) return { ok: false, error: "Please sign in with your school Google account." };
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const err = change(ss, d, user);
      if (err) return { ok: false, error: err };
    } finally {
      lock.releaseLock();
    }
  }
  return Object.assign({ ok: true }, summary(ss, user));
}

// One change from a signed-in student. Returns an error message, or nothing if it worked.
function change(ss, d, user) {
  const project = plain(String(d.project || "").slice(0, 100));
  const student = plain(String(d.student || "").trim().slice(0, 80));
  if (d.action === "like" || d.action === "nominate") {
    if (!project) return "Missing project";
    toggle(ss.getSheetByName(d.action === "like" ? "Likes" : "Nominations"), project, user);
    return;
  }
  if (d.action === "follow") {
    if (!student) return "Missing student";
    const added = toggle(ss.getSheetByName("Follows"), student, user, [false]);
    if (added) notify("follow request", `${user.name} (${user.email}) wants to follow ${student}.`);
    return;
  }
  if (d.action === "comment") {
    const text = plain(String(d.text || "").trim().slice(0, 500));
    if (!project || !text) return "Write a comment first.";
    const sheet = ss.getSheetByName("Comments");
    sheet.appendRow([new Date(), project, user.email, user.name, text, false]);
    sheet.getRange(sheet.getLastRow(), 6).insertCheckboxes();
    notify("new comment", `${user.name} (${user.email}) commented on "${project}":\n\n${text}`);
    return;
  }
  return "Unknown action";
}

// Adds the student's row for this key, or removes it if it's already there (like / unlike).
// Returns true if a row was added. `extra` = more columns, an "Approved" checkbox last.
function toggle(sheet, key, user, extra) {
  const values = sheet.getDataRange().getValues();
  for (let i = values.length - 1; i >= 1; i--) {
    if (String(values[i][1]) === key && values[i][2] === user.email) { sheet.deleteRow(i + 1); return false; }
  }
  sheet.appendRow([new Date(), key, user.email, user.name].concat(extra || []));
  if (extra) sheet.getRange(sheet.getLastRow(), 4 + extra.length).insertCheckboxes();
  return true;
}

// Counts for every project, approved comments, and what the signed-in student has done.
function summary(ss, user) {
  const rows = (name) => ss.getSheetByName(name).getDataRange().getValues().slice(1);
  const me = (email) => user && email === user.email;
  const out = { likes: {}, nominations: {}, comments: {}, followers: {},
    user: user ? { name: user.name } : null, mine: { likes: [], nominations: [], follows: {} } };

  ["Likes", "Nominations"].forEach((tab) => {
    const key = tab.toLowerCase();
    rows(tab).forEach(([, project, email]) => {
      out[key][project] = (out[key][project] || 0) + 1;
      if (me(email)) out.mine[key].push(project);
    });
  });
  // Students see their own comments while they wait for approval; nobody else does.
  rows("Comments").forEach(([time, project, email, name, text, approved]) => {
    if (approved !== true && !me(email)) return;
    (out.comments[project] = out.comments[project] || [])
      .push({ name, text, time: new Date(time).getTime(), pending: approved !== true });
  });
  rows("Follows").forEach(([, student, email, , approved]) => {
    if (approved === true) out.followers[student] = (out.followers[student] || 0) + 1;
    if (me(email)) out.mine.follows[student] = approved === true ? "following" : "requested";
  });
  return out;
}

// Checks the Google sign-in token with Google. Returns { email, name } for a school account, else null.
function signedIn(token) {
  if (!CLIENT_ID || !SCHOOL_DOMAIN) return null;
  const cache = CacheService.getScriptCache();
  const key = "t" + Utilities.base64EncodeWebSafe(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(token)));
  const hit = cache.get(key);
  if (hit) return JSON.parse(hit);

  const res = UrlFetchApp.fetch("https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(token),
    { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) return null; // expired or not a real Google token
  const t = JSON.parse(res.getContentText());
  if (t.aud !== CLIENT_ID || String(t.email_verified) !== "true" || t.hd !== SCHOOL_DOMAIN) return null;

  // Shown on the site as first name + initial, like the students' names on projects.
  const first = t.given_name || String(t.name || "Student").split(" ")[0];
  const user = { email: t.email.toLowerCase(), name: first + (t.family_name ? " " + t.family_name[0] + "." : "") };
  const seconds = Math.floor(Number(t.exp) - Date.now() / 1000);
  if (seconds > 0) cache.put(key, JSON.stringify(user), Math.min(seconds, 21600));
  return user;
}

function socialSheet() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty("SOCIAL_SHEET_ID");
  if (id) return SpreadsheetApp.openById(id);
  const ss = SpreadsheetApp.create("Bricolage likes, comments & follows");
  Object.keys(TABS).forEach((name, i) => {
    const sheet = i === 0 ? ss.getSheets()[0].setName(name) : ss.insertSheet(name);
    sheet.getRange(1, 1, 1, TABS[name].length).setValues([TABS[name]]).setFontWeight("bold");
    sheet.setFrozenRows(1);
  });
  props.setProperty("SOCIAL_SHEET_ID", ss.getId());
  return ss;
}

// Text starting with = + - @ would turn into a formula in the sheet; a leading ' keeps it plain text.
function plain(s) {
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function notify(what, text) {
  try {
    MailApp.sendEmail({
      to: Session.getEffectiveUser().getEmail(),
      subject: `Bricolage: ${what} to approve`,
      body: `${text}\n\nTo approve it, tick its "Approved" box in the sheet:\n${socialSheet().getUrl()}`,
      name: "Bricolage website",
    });
  } catch (err) {
    console.warn(err); // never block a comment or follow over this
  }
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
