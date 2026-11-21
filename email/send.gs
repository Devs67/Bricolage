/*
  Sends the Bricolage launch email exactly as designed.

  Why: pasting the email into Gmail's compose box throws away its layout (the 600px width,
  the columns), so it stretches across the screen. Sending the HTML from a script keeps it intact.

  This is a separate script. It does not touch the site or the submission script.

  How to use:
  1. Go to script.google.com, click "New project", delete what's there and paste in this whole file.
  2. Pick "sendTest" in the function menu at the top and click Run. Allow the permissions it asks for.
     It emails the launch email to you only. Open it on your laptop and your phone.
  3. When it looks right, put the addresses in TO below (grade group addresses, or students),
     then pick "sendToStudents" and click Run.

  Each address in TO gets its own email. Google allows about 1,500 recipients a day from a
  school account (about 100 from a personal one); a group address counts as one.
*/

// The email lives on the site, so any change pushed there is what gets sent.
const PAGE = "https://devs67.github.io/Bricolage/email/launch.html";
const SUBJECT = "Your project belongs on the wall.";
const FROM_NAME = "Bricolage · SIS Design";

const TO = [
  // "myp1@yourschool.edu",
  // "myp2@yourschool.edu",
];

function emailHtml_() {
  const res = UrlFetchApp.fetch(PAGE + "?v=" + Date.now(), { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) throw new Error("Couldn't load the email from " + PAGE);
  return res.getContentText();
}

// Shown only by mail apps that can't display the designed version
const PLAIN =
  "Bricolage is SIS's new student design showcase, from MYP 1 to DP 2.\n" +
  "Made it in your Design SA or on your own? Put it on the wall: https://devs67.github.io/Bricolage/submit.html\n" +
  "See the projects: https://devs67.github.io/Bricolage/";

function sendTest() {
  const me = Session.getActiveUser().getEmail();
  MailApp.sendEmail({ to: me, subject: "[TEST] " + SUBJECT, body: PLAIN, htmlBody: emailHtml_(), name: FROM_NAME });
  Logger.log("Test sent to " + me);
}

function sendToStudents() {
  if (!TO.length) throw new Error("Add the addresses to TO at the top first.");
  const html = emailHtml_();
  TO.forEach((to) => MailApp.sendEmail({ to: to, subject: SUBJECT, body: PLAIN, htmlBody: html, name: FROM_NAME }));
  Logger.log("Sent to " + TO.length + " address(es). Emails left today: " + MailApp.getRemainingDailyQuota());
}
