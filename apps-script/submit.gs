/*
  Bricolage — submission form mailer (Google Apps Script).
  The form on submit.html sends each submission here; this emails it to you
  with the photos attached. Nothing is saved to Google Drive.

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

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
