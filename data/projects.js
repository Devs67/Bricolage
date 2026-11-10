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

  NOTE: Everything below is SAMPLE content so the site has something
  to show. Replace it with real student work.
  ============================================================
*/

window.SHOWCASE = {
  // The Google Sheet the site reads. The sheet must be shared as
  // "Anyone with the link — Viewer" for this to work.
  sheetCSV: "https://docs.google.com/spreadsheets/d/1nfndCiDsoo7IYA96H_1E5rf7iFPwzxvn5BN9xu2u8PI/gviz/tq?tqx=out:csv&sheet=Projects",

  facilitators: ["Ms. Iyer", "Mr. Fernandes", "Ms. Okafor"],

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
    },
    {
      id: "assistive-cutlery-grip",
      title: "Assistive Cutlery Grip",
      student: "Meera K.",
      grade: "DP 2",
      year: "2025–26",
      classOf: 2026,
      type: "Physical",
      category: "Product",
      facilitator: "Ms. Okafor",
      problem: "People with arthritis struggle to hold thin cutlery handles for a full meal.",
      designedFor: "Residents of a local care home",
      tools: ["Fusion 360", "TPU 3D printing", "User testing"],
      unit: "DP Design Technology — internal assessment product",
      images: [],
      links: [],
      best: true,
      strengths: ["Real-world impact", "User focus", "Technology used"],
      why: "Tested five versions with care-home residents. The final grip is now used at every meal there."
    },
    {
      id: "smart-plant-monitor",
      title: "Smart Plant Monitor",
      student: "Aanya S.",
      grade: "MYP 2",
      year: "2025–26",
      classOf: 2031,
      type: "Physical",
      category: "Electronics",
      facilitator: "Ms. Okafor",
      problem: "Class plants die over long weekends because nobody remembers to water them.",
      designedFor: "Grade 6 classroom",
      tools: ["Arduino", "DHT22 sensor", "Wokwi", "Laser-cut acrylic"],
      unit: "Junior engineers — community wellbeing",
      images: [],
      links: [{ label: "Open simulation", url: "#" }],
      best: true,
      strengths: ["Problem solving", "Technology used"],
      why: "A Grade 6 student simulated, wired and built a working sensor system that the whole grade now relies on."
    },
    {
      id: "flat-pack-stool",
      title: "Flat-Pack Stool",
      student: "Arjun P.",
      grade: "DP 1",
      year: "2025–26",
      classOf: 2027,
      type: "Physical",
      category: "Furniture",
      facilitator: "Mr. Fernandes",
      problem: "Classroom stools take up too much storage space when not in use.",
      designedFor: "Art studio classrooms",
      tools: ["Birch plywood", "Laser cutter", "Finger joints"],
      unit: "Design for manufacture",
      images: [],
      links: [],
      best: true,
      strengths: ["Creativity", "Sustainability"],
      why: "No screws or glue — it slots together from one sheet of plywood with almost no offcut waste."
    },
    {
      id: "mood-journal-app",
      title: "Mood Journal App",
      student: "Sara M.",
      grade: "MYP 5",
      year: "2025–26",
      classOf: 2028,
      type: "Digital",
      category: "App",
      facilitator: "Ms. Iyer",
      problem: "Teens find long journaling apps tiring and stop using them after a week.",
      designedFor: "Students aged 13–16",
      tools: ["Figma", "Interactive prototype", "Usability testing"],
      unit: "Personal project link — digital wellbeing",
      images: [],
      links: [{ label: "Open prototype", url: "#" }],
      best: true,
      strengths: ["User focus", "Creativity"],
      why: "Interviewed 30 classmates first, then cut journaling down to one tap a day. Testers kept using it."
    },
    {
      id: "upcycled-tote",
      title: "Upcycled Uniform Tote",
      student: "Ananya T.",
      grade: "MYP 4",
      year: "2025–26",
      classOf: 2029,
      type: "Physical",
      category: "Textiles",
      facilitator: "Mr. Fernandes",
      problem: "Outgrown school uniforms end up in the bin every year.",
      designedFor: "Students carrying sports kit",
      tools: ["Pattern cutting", "Sewing machine", "Old uniforms"],
      unit: "Sustainable design",
      images: [],
      links: [],
      best: true,
      strengths: ["Sustainability", "Real-world impact"],
      why: "Turned 40 old uniforms into bags and set up a uniform-collection drive with the PTA."
    },
    {
      // REAL PROJECT — replace the student name and add the live link
      id: "bakery-ordering-site",
      title: "Bakery Ordering Website",
      student: "Student name",
      grade: "MYP 3",
      year: "2025–26",
      classOf: 2030,
      type: "Digital",
      category: "Website",
      facilitator: "",
      problem: "Customers had to call or text the bakery to order, and orders got lost in long chats.",
      designedFor: "A local bakery and its customers",
      tools: ["HTML", "CSS", "JavaScript", "WhatsApp click-to-chat", "Order dashboard"],
      unit: "",
      images: [],
      links: [{ label: "Visit live site", url: "#" }],
      studentLed: true,
      steps: [
        "Customers pick what they want on the website.",
        "Tapping “Order on WhatsApp” opens WhatsApp with the order message already written.",
        "The customer just presses send.",
        "The order appears in the student's order dashboard."
      ]
    },
    {
      id: "cricket-score-app",
      title: "Gully Cricket Scorer",
      student: "Vihaan J.",
      grade: "MYP 4",
      year: "2025–26",
      classOf: 2029,
      type: "Digital",
      category: "App",
      facilitator: "",
      problem: "Friends playing weekend cricket kept arguing about the score.",
      designedFor: "Neighbourhood cricket games",
      tools: ["Flutter", "Firebase"],
      unit: "",
      images: [],
      links: [{ label: "Try the app", url: "#" }],
      studentLed: true
    },
    {
      id: "custom-keychain-shop",
      title: "Custom Keychain Shop",
      student: "Tara L.",
      grade: "DP 1",
      year: "2025–26",
      classOf: 2027,
      type: "Physical",
      category: "Product",
      facilitator: "Mr. Fernandes",
      problem: "Students wanted personalised bag tags for school events but nobody sold them locally.",
      designedFor: "Students and school clubs",
      tools: ["Fusion 360", "3D printing", "Instagram shop"],
      unit: "",
      images: [],
      links: [],
      studentLed: true
    },
    {
      id: "phone-stand-seniors",
      title: "Phone Stand for Video Calls",
      student: "Daniel R.",
      grade: "MYP 5",
      year: "2025–26",
      classOf: 2028,
      type: "Physical",
      category: "Product",
      facilitator: "Ms. Okafor",
      problem: "Grandparents struggle to keep the phone steady during long video calls.",
      designedFor: "Older adults living alone",
      tools: ["Tinkercad", "PLA 3D printing", "Anthropometric data"],
      unit: "Ergonomics and inclusive design",
      images: [],
      links: []
    },
    {
      id: "bus-tracker",
      title: "School Bus Tracker",
      student: "Kabir N.",
      grade: "MYP 4",
      year: "2025–26",
      classOf: 2029,
      type: "Digital",
      category: "App",
      facilitator: "Ms. Iyer",
      problem: "Parents wait at bus stops without knowing if the bus is late.",
      designedFor: "Parents of primary students",
      tools: ["Figma", "User journey maps", "Wireframes"],
      unit: "Designing digital services",
      images: [],
      links: [{ label: "Open prototype", url: "#" }]
    },
    {
      id: "book-swap-site",
      title: "Library Book Swap",
      student: "Leo F.",
      grade: "MYP 3",
      year: "2025–26",
      classOf: 2030,
      type: "Digital",
      category: "Website",
      facilitator: "Ms. Iyer",
      problem: "Students own books they have finished but have no easy way to swap them.",
      designedFor: "Middle school readers",
      tools: ["HTML", "CSS", "Google Forms"],
      unit: "Websites with purpose",
      images: [],
      links: [{ label: "Visit site", url: "#" }]
    },
    {
      id: "desk-organiser",
      title: "Reclaimed Wood Desk Organiser",
      student: "Zara H.",
      grade: "MYP 3",
      year: "2025–26",
      classOf: 2030,
      type: "Physical",
      category: "Product",
      facilitator: "Mr. Fernandes",
      problem: "Shared desks get cluttered with stationery that has no home.",
      designedFor: "Grade 8 classroom",
      tools: ["Pallet wood", "Hand tools", "Orthographic drawing"],
      unit: "Working with timber",
      images: [],
      links: []
    },
    {
      id: "recycling-sorter-game",
      title: "Recycling Sorter Game",
      student: "Omar B.",
      grade: "MYP 2",
      year: "2025–26",
      classOf: 2031,
      type: "Digital",
      category: "Game",
      facilitator: "Ms. Iyer",
      problem: "Younger students put recyclables in the wrong bins.",
      designedFor: "Grade 3 students",
      tools: ["Scratch", "Playtesting"],
      unit: "Games that teach",
      images: [],
      links: [{ label: "Play the game", url: "#" }]
    },
    {
      id: "snack-box-game",
      title: "Snack Box Board Game",
      student: "Ishaan V.",
      grade: "MYP 1",
      year: "2025–26",
      classOf: 2032,
      type: "Physical",
      category: "Packaging",
      facilitator: "Mr. Fernandes",
      problem: "Snack packaging is thrown away seconds after it is opened.",
      designedFor: "Kids on long car journeys",
      tools: ["Card nets", "Hand sketching", "Prototyping"],
      unit: "Packaging with a second life",
      images: [],
      links: []
    },
    {
      id: "stop-motion-ad",
      title: "Road Safety Stop-Motion Ad",
      student: "Priya D.",
      grade: "MYP 1",
      year: "2025–26",
      classOf: 2032,
      type: "Digital",
      category: "Digital Media",
      facilitator: "Ms. Okafor",
      problem: "Primary students rush across the school car park at pick-up time.",
      designedFor: "Grade 1–3 students",
      tools: ["Stop Motion Studio", "Clay figures", "Storyboarding"],
      unit: "Communicating a message",
      images: [],
      links: [{ label: "Watch video", url: "#" }]
    }
  ]
};
