/*
  Loads the projects from the Google Sheet (link: `sheetCSV` in data/projects.js).
  One row = one project. Only rows with Show = "Yes" appear on the site.
  If the sheet can't be reached, the projects in data/projects.js are shown instead.
*/
window.SHOWCASE_READY = (async () => {
  const data = window.SHOWCASE;
  if (!data || !data.sheetCSV) return;
  try {
    const res = await fetch(data.sheetCSV, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const projects = fromRows(parseCSV(await res.text()));
    if (projects.length) {
      data.projects = projects;
      data.facilitators = []; // teacher filter is built from the sheet's Teacher column
    }
  } catch (e) {
    console.warn("Could not load the Google Sheet, showing data/projects.js instead.", e);
  }

  function parseCSV(text) {
    const rows = [];
    let row = [], cell = "", quoted = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (quoted) {
        if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (c === '"') quoted = false;
        else cell += c;
      } else if (c === '"') quoted = true;
      else if (c === ",") { row.push(cell); cell = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(cell); rows.push(row); row = []; cell = "";
      } else cell += c;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows;
  }

  function fromRows([header, ...rows]) {
    const GRADES = ["MYP 1", "MYP 2", "MYP 3", "MYP 4", "MYP 5", "DP 1", "DP 2"];
    const names = header.map((h) => h.trim().toLowerCase());
    const col = (row, start) => (row[names.findIndex((n) => n.startsWith(start))] || "").trim();
    const yes = (v) => v.toLowerCase() === "yes";
    const list = (v, sep = /,/) => v.split(sep).map((s) => s.trim()).filter(Boolean);
    const used = new Set();

    return rows
      .filter((r) => yes(col(r, "show")) && col(r, "project name"))
      .map((r) => {
        const title = col(r, "project name");
        let id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        for (let n = 2; used.has(id); n++) id = id.replace(/-\d+$/, "") + "-" + n;
        used.add(id);

        const grade = col(r, "grade");
        const year = col(r, "year");
        const start = parseInt(year, 10);
        const g = GRADES.indexOf(grade);
        const link = col(r, "app");

        return {
          id,
          title,
          student: col(r, "student name"),
          grade,
          year,
          classOf: start && g >= 0 ? start + 1 + (GRADES.length - 1 - g) : "",
          type: col(r, "type"),
          category: col(r, "category"),
          facilitator: col(r, "teacher"),
          problem: col(r, "description"),
          designedFor: col(r, "designed for"),
          tools: list(col(r, "made with")),
          images: list(col(r, "images"), /[,\n]/).map(driveImage),
          links: link ? [{ label: col(r, "button text") || "Open it", url: link }] : [],
          studentLed: yes(col(r, "student-led")),
          steps: list(col(r, "how it works"), /\n/),
          best: yes(col(r, "best project")),
          strengths: list(col(r, "strengths")),
          why: col(r, "why chosen"),
          unit: col(r, "unit"),
        };
      });
  }

  // A Google Drive share link becomes a resized image the page can show.
  function driveImage(src) {
    const m = src.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]+)/);
    return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w1600` : src;
  }
})();
