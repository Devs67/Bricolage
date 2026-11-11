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
*/

const SUBJECT = "Bricolage submission";

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
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  }
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
