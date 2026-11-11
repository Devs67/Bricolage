/*
  ============================================================
  DESIGN PROJECTS — CONTENT FILE
  ============================================================
  Projects now come from the Google Sheet "Bricolage — Projects"
  (link below in `sheetCSV`). Add or change projects THERE — one row each,
  Show = "Yes" to put it on the site. No code or pushing needed.

  The projects list in this file is only a BACKUP, shown if the sheet
  can't be reached. The notes below still describe what each column means.

  To add a project here instead (old way):
    1. Copy one { ... } block below (including the comma after it).
    2. Paste it at the top of the `projects` list.
    3. Change the values. Keep the quotes.
    4. Put the images in  assets/projects/  and list their file names.

  Field guide:
    id          short unique name, no spaces       "smart-plant-monitor"
    title       project name                       "Smart Plant Monitor"
    student     first name + initial               "Aanya S."
    grade       one of: "MYP 1" "MYP 2" "MYP 3" "MYP 4" "MYP 5" "DP 1" "DP 2"
    section     the student's class section, e.g. "A" — optional
    year        academic year                      "2025–26"
    classOf     graduating year                    2030
    type        "Digital" or "Physical"
    category    e.g. "App", "Website", "Game", "Electronics", "Product", "Packaging"
    facilitator teacher's name, must match a name in `facilitators`
    problem     one sentence: what problem it solves
    designedFor who it was designed for
    tools       list of tools / materials
    unit        (for educators) unit name or brief — optional
    images      list of image paths — leave [] to show a placeholder
    links       optional buttons, e.g. Figma prototype or video

  BEST PROJECTS — only for projects chosen by the design team:
    best        true
    strengths   the criteria it stands out in — use names from `criteria` below
                e.g. ["Problem solving", "Real-world impact"]
    why         one or two sentences: why it was chosen
    Best projects appear in the order they are listed here.
    The first 3 are shown on the home page.

  STUDENT-LED PROJECTS — made out of the student's own interest, not set as classwork:
    studentLed  true
    facilitator leave as "" if no teacher was involved, or put a mentor's name
    unit        leave as "" (not needed)
    steps       optional list explaining how it works, shown as numbered steps
    The first 3 student-led projects are shown on the home page.

  ============================================================
*/

window.SHOWCASE = {
  // The Google Sheet the site reads. The sheet must be shared as
  // "Anyone with the link — Viewer" for this to work.
  sheetCSV: "https://docs.google.com/spreadsheets/d/1nfndCiDsoo7IYA96H_1E5rf7iFPwzxvn5BN9xu2u8PI/gviz/tq?tqx=out:csv&sheet=Projects",

  facilitators: [],

  // How best projects are judged. Shown on the Best Projects page.
  criteria: [
    { name: "Problem solving",   description: "Found a real problem and solved it in a clever, well-tested way." },
    { name: "Real-world impact", description: "Made a difference for real people, beyond the classroom." },
    { name: "Technology used",   description: "Used tools, materials or code with skill and ambition for their grade." },
    { name: "Creativity",        description: "An original idea, or an unexpected way of solving the problem." },
    { name: "User focus",        description: "Designed with the people it was for, and tested with them." },
    { name: "Sustainability",    description: "Thoughtful about materials, waste and the planet." }
  ],

  projects: [
    {
      id: "cardboard-air-fryer",
      title: "Cardboard Air Fryer Prototype",
      student: "Vihaan C.",
      grade: "MYP 2",
      year: "2025–26",
      classOf: 2031,
      type: "Physical",
      category: "Product",
      facilitator: "",
      problem: "A full-size cardboard model to test the size, layout and controls of an air fryer before making it for real.",
      designedFor: "Home cooks",
      tools: ["Cardboard", "Plastic sheet"],
      unit: "",
      images: ["assets/projects/cardboard-air-fryer-1.jpg"],
      links: []
    }
  ]
};
