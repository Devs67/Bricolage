/*
  Submission form (submit.html).
  Photos are shrunk in the browser, then everything is sent to the Google Apps Script
  in apps-script/submit.gs, which emails it to the design team. Nothing is saved anywhere else.
*/

// Paste the Apps Script "Web app" URL here (it ends in /exec).
const SUBMIT_URL = "https://script.google.com/macros/s/AKfycbxXl2Wk31XvgT2H4AsqqtmYTbNVsz2iVX9F7Pt5xjaEbhGKn9CmbL6LHpPEP340_zGN/exec";

(() => {
  const MAX_PHOTOS = 6;
  const MAX_SIDE = 1600; // px, longest side of each photo after shrinking

  const form = document.getElementById("submit-form");
  const photos = document.getElementById("photos");
  const thumbs = document.getElementById("thumbs");
  const status = document.getElementById("status");
  const send = document.getElementById("send");

  const say = (msg, isError = false) => {
    status.textContent = msg;
    status.classList.toggle("form__status--error", isError);
  };

  photos.addEventListener("change", () => {
    thumbs.innerHTML = "";
    [...photos.files].slice(0, MAX_PHOTOS).forEach((f) => {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(f);
      img.alt = "";
      thumbs.append(img);
    });
    say(photos.files.length > MAX_PHOTOS ? `Only the first ${MAX_PHOTOS} photos will be sent.` : "");
  });

  // Resize to MAX_SIDE and re-save as JPEG, so emails stay small.
  async function shrink(file) {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    const s = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * s);
    canvas.height = Math.round(bmp.height * s);
    canvas.getContext("2d").drawImage(bmp, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.82).split(",")[1];
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return say("Please fill in the fields marked *.", true);
    }
    if (!SUBMIT_URL) return say("The form isn't switched on yet — please talk to your design facilitator.", true);

    send.disabled = true;
    say("Sending…");
    try {
      const data = {};
      new FormData(form).forEach((v, k) => { if (k !== "photos") data[k] = String(v).trim(); });
      data.studentLed = data.studentLed ? "Yes" : "No";

      const files = [...photos.files].slice(0, MAX_PHOTOS);
      try {
        data.photos = await Promise.all(files.map(shrink));
      } catch {
        throw new Error("One of the photos couldn't be read. Please use JPG or PNG photos.");
      }

      // A plain-text body keeps this a "simple" request, which Apps Script accepts from any site.
      const res = await fetch(SUBMIT_URL, { method: "POST", body: JSON.stringify(data) });
      const out = await res.json();
      if (!out.ok) throw new Error(out.error || "The form couldn't be sent.");

      form.reset();
      thumbs.innerHTML = "";
      say("Sent! The design team will check it, and it will appear on the site once it's approved.");
    } catch (err) {
      say(err.message.startsWith("One of") ? err.message : "Something went wrong — please try again in a minute.", true);
    } finally {
      send.disabled = false;
    }
  });
})();
