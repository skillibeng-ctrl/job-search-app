// Generates the four resume templates as real Word files in ./template-files
// Run with:  npm run templates
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import {
  AlignmentType, BorderStyle, Document, HeadingLevel, HeightRule, ImageRun, LevelFormat, LineRuleType, Packer,
  Paragraph, ShadingType, Table, TableCell, TableRow, Tab, TabStopType, TextRun, VerticalAlign, WidthType,
} from "docx";

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(here, "template-files");
fs.mkdirSync(OUT, { recursive: true });

const FONT = "Calibri";
const PAGE = { width: 11906, height: 16838 }; // A4

/* ---------- placeholder content: clearly bracketed, never fake claims ---------- */
const T = {
  name: "[Your Name]",
  title: "[Job title you're aiming for]",
  contact: "[Phone] · [Email] · [City, Country] · [LinkedIn or portfolio link]",
  summary: "[Two or three sentences: who you are, what you do best, and the kind of role you want.]",
  role: "[Job title]",
  dates: "[Month Year] – [Month Year]",
  company: "[Company], [City]",
  bullets: [
    "[What you did, how you did it, and the result. Use a number if you can.]",
    "[Another achievement that fits the job you're applying for.]",
    "[A third, shorter point if it's relevant.]",
  ],
  skills: ["[Skill one]", "[Skill two]", "[Skill three]", "[Skill four]"],
  languages: ["[Language one]", "[Language two]"],
  degree: "[Degree or qualification], [School]",
  year: "[Year]",
};

/* ---------- a photo placeholder, drawn in code (replace it in Word: right-click > Change Picture) ---------- */
const CRC = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = (b) => { let c = 0xffffffff; for (const x of b) c = CRC[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};
const rgb = (h) => [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
function photoPng(size, bgHex, fgHex) {
  const bg = rgb(bgHex), fg = rgb(fgHex), SS = 3, stride = size * 4 + 1;
  const raw = Buffer.alloc(stride * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let n = 0, r = 0, g = 0, b = 0;
      for (let i = 0; i < SS; i++) for (let j = 0; j < SS; j++) {
        const px = (x + (i + 0.5) / SS) / size, py = (y + (j + 0.5) / SS) / size;
        if ((px - 0.5) ** 2 + (py - 0.5) ** 2 > 0.25) continue; // outside the circle
        const person = (px - 0.5) ** 2 + (py - 0.38) ** 2 <= 0.17 ** 2 || ((px - 0.5) / 0.36) ** 2 + ((py - 0.97) / 0.34) ** 2 <= 1;
        const c = person ? fg : bg;
        r += c[0]; g += c[1]; b += c[2]; n++;
      }
      const o = y * stride + 1 + x * 4;
      if (n) { raw[o] = r / n; raw[o + 1] = g / n; raw[o + 2] = b / n; raw[o + 3] = Math.round((n / (SS * SS)) * 255); }
    }
  }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}
const photo = (bg, fg, px) =>
  new ImageRun({ type: "png", data: photoPng(240, bg, fg), transformation: { width: px, height: px }, altText: { title: "Photo placeholder", description: "Replace with your photo, or delete it", name: "photo" } });

/* ---------- small builders ---------- */
const r = (text, o = {}) => new TextRun({ text, font: FONT, ...o });
const para = (children, o = {}) => new Paragraph({ children: Array.isArray(children) ? children : [children], ...o });
const SHADE = (fill) => ({ type: ShadingType.CLEAR, fill, color: "auto" });
const LINE = (color, size = 6, space = 2) => ({ style: BorderStyle.SINGLE, size, color, space });
const NONE = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const NO_BORDERS = { top: NONE, bottom: NONE, left: NONE, right: NONE };
const TABLE_NO_LINES = { ...NO_BORDERS, insideHorizontal: NONE, insideVertical: NONE };
const gap = (h = 60) => para([], { spacing: { before: 0, after: 0, line: h, lineRule: LineRuleType.EXACT } }); // separates two tables
const bullet = (t, ind) => new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 40 }, ...(ind ? { indent: { left: ind + 360, hanging: 220 } } : {}), children: [r(t)] });
const ind = (n) => (n ? { indent: { left: n } } : {});

// level dots like ●●●●○ (edit the text in Word to change a level)
const dots = (n, on, off, total = 5) => [r("●".repeat(n), { color: on, size: 15 }), r("●".repeat(total - n), { color: off, size: 15 })];
const ratedRow = (label, n, { on, off, color, size = 19, tab }) =>
  para([r(label, { color, size }), new TextRun({ children: [new Tab()], font: FONT }), ...dots(n, on, off)], { tabStops: [{ type: TabStopType.RIGHT, position: tab }], spacing: { after: 50 } });
// skill "chips": shaded text that wraps naturally
const chips = (list, fill, color, o = {}) =>
  para(list.flatMap((s) => [new TextRun({ text: `\u00A0${s}\u00A0`, font: FONT, size: 19, color, shading: SHADE(fill) }), r("  ")]), { spacing: { line: 380 }, ...o });

function makeDoc({ children, accent, margin, headingRun = {}, headingParagraph = {} }) {
  return new Document({
    creator: "JobFlow",
    title: "Resume template",
    styles: {
      default: {
        document: { run: { font: FONT, size: 21, color: "1F2937" } },
        heading1: {
          run: { font: FONT, size: 22, bold: true, color: accent, ...headingRun },
          paragraph: { spacing: { before: 240, after: 80 }, keepNext: true, ...headingParagraph },
        },
      },
    },
    numbering: {
      config: [{
        reference: "bullets",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 220 } } } }],
      }],
    },
    sections: [{ properties: { page: { size: PAGE, margin } }, children }],
  });
}
const heading = (text, extra = {}, run = {}) => new Paragraph({ heading: HeadingLevel.HEADING_1, ...extra, children: [r(text, run)] });

// "Job title ........ dates" with a real right-aligned tab
const entryHead = (width, roleColor = "111827", i) => [
  para([r(T.role, { bold: true, size: 22, color: roleColor }), new TextRun({ children: [new Tab(), T.dates], font: FONT, color: "4B5563" })], { tabStops: [{ type: TabStopType.RIGHT, position: width }], keepNext: true, spacing: { before: 140 }, ...ind(i) }),
  para(r(T.company, { italics: true, color: "4B5563" }), { keepNext: true, spacing: { after: 60 }, ...ind(i) }),
];
const entry = (width, roleColor, i) => [...entryHead(width, roleColor, i), ...T.bullets.map((b) => bullet(b, i))];
const educationLine = (width, i) =>
  para([r(T.degree, { bold: true }), new TextRun({ children: [new Tab(), T.year], font: FONT, color: "4B5563" })], { tabStops: [{ type: TabStopType.RIGHT, position: width }], ...ind(i) });

/* ============ 1. Modern Tech: soft tinted header, skill chips (single column) ============ */
function modernTech() {
  const accent = "047857", margin = 600, total = PAGE.width - 2 * margin, pad = 400, body = total - pad;
  const side = { indent: { left: pad, right: pad } };
  const band = new Table({
    width: { size: total, type: WidthType.DXA }, columnWidths: [total], borders: TABLE_NO_LINES,
    rows: [new TableRow({ children: [new TableCell({
      width: { size: total, type: WidthType.DXA },
      borders: { ...NO_BORDERS, left: { style: BorderStyle.SINGLE, size: 48, color: accent } },
      shading: SHADE("ECFDF5"), margins: { top: 380, bottom: 320, left: 520, right: 400 },
      children: [
        para(r(T.name, { bold: true, size: 60, color: accent }), { spacing: { after: 40 } }),
        para(r(T.title, { size: 26, color: "374151" }), { spacing: { after: 100 } }),
        para(r(T.contact, { size: 19, color: "4B5563" })),
      ],
    })] })],
  });
  const h = (t) => heading(t, { ...side, border: { bottom: LINE("A7F3D0", 8, 3) } });
  return makeDoc({
    accent, margin: { top: margin, bottom: margin, left: margin, right: margin },
    children: [
      band,
      h("Summary"), para(r(T.summary), side),
      h("Experience"), ...entry(body, accent, pad), ...entry(body, accent, pad),
      h("Skills"), chips(T.skills, "D1FAE5", "065F46", side),
      h("Education"), educationLine(body, pad),
    ],
  });
}

/* ============ 2. Minimalist: dates in the margin, refined type ============ */
function minimalist() {
  const accent = "1D4ED8", margin = 1100, W = PAGE.width - 2 * margin, D = 2500;
  const timeline = (dateTxt, main, sub) => [
    para([r(dateTxt, { size: 19, color: "6B7280" }), new TextRun({ children: [new Tab(), main], font: FONT, bold: true, size: 22, color: "111827" })], { tabStops: [{ type: TabStopType.LEFT, position: D }], indent: { left: D, hanging: D }, keepNext: true, spacing: { before: 140 } }),
    ...(sub ? [para(r(sub, { italics: true, color: "4B5563" }), { indent: { left: D }, spacing: { after: 60 }, keepNext: true })] : []),
  ];
  const h = (t) => heading(t, { border: { bottom: LINE("D1D5DB", 4, 3) } });
  return makeDoc({
    accent: "374151", margin: { top: 1000, bottom: 900, left: margin, right: margin },
    headingRun: { size: 19, allCaps: true, characterSpacing: 60 },
    children: [
      para(r(T.name.toUpperCase(), { bold: true, size: 56, color: "111827", characterSpacing: 40 }), { alignment: AlignmentType.CENTER, spacing: { after: 60 } }),
      para(r(T.title, { size: 24, color: accent }), { alignment: AlignmentType.CENTER, spacing: { after: 80 } }),
      para(r(T.contact, { size: 19, color: "4B5563" }), { alignment: AlignmentType.CENTER, spacing: { after: 200 }, border: { top: LINE(accent, 8, 8), bottom: LINE(accent, 8, 8) } }),
      h("Summary"), para(r(T.summary)),
      h("Experience"),
      ...timeline(T.dates, T.role, T.company), ...T.bullets.map((b) => bullet(b, D)),
      ...timeline(T.dates, T.role, T.company), ...T.bullets.map((b) => bullet(b, D)),
      h("Education"), ...timeline(T.year, T.degree),
      h("Skills"), para(r(T.skills.join("   ·   "))),
    ],
  });
}

/* ============ 3. Executive (Pro): navy sidebar, photo, level dots, gold accents ============ */
function executive() {
  const navy = "0F172A", gold = "B45309", goldOn = "FBBF24", muted = "94A3B8", white = "FFFFFF";
  const left = 3500, right = PAGE.width - left, sideInner = left - 760, mainInner = right - 1020;
  const label = (t, first) => para(r(t, { bold: true, size: 18, color: goldOn, characterSpacing: 40 }), { spacing: { before: first ? 0 : 320, after: 80 }, border: { bottom: LINE("334155", 6, 4) } });
  const line = (labelTxt, val) => para([r(labelTxt + "  ", { size: 17, color: muted }), r(val, { size: 19, color: white })], { spacing: { after: 50 } });
  const lvl = { on: goldOn, off: "475569", color: white, tab: sideInner };
  const side = [
    para(photo("1E293B", "64748B", 118), { alignment: AlignmentType.CENTER, spacing: { after: 280 } }),
    label("CONTACT", true), line("Phone", "[Phone]"), line("Email", "[Email]"), line("Place", "[City, Country]"), line("Web", "[LinkedIn or portfolio]"),
    label("SKILLS"), ...T.skills.map((s, i) => ratedRow(s, [5, 4, 4, 3][i], lvl)),
    label("LANGUAGES"), ...T.languages.map((s, i) => ratedRow(s, [5, 3][i], lvl)),
    label("EDUCATION"), para(r("[Degree or qualification]", { size: 19, color: white, bold: true })), para(r("[School], [Year]", { size: 19, color: muted })),
  ];
  const main = [
    para(r(T.name, { bold: true, size: 60, color: navy }), { spacing: { after: 40 } }),
    para(r(T.title.toUpperCase(), { size: 22, color: gold, characterSpacing: 40, bold: true }), { spacing: { after: 160 }, border: { bottom: LINE(gold, 12, 8) } }),
    heading("Profile", { border: { left: LINE(gold, 30, 6) }, indent: { left: 120 } }), para(r(T.summary)),
    heading("Experience", { border: { left: LINE(gold, 30, 6) }, indent: { left: 120 } }), ...entry(mainInner, navy), ...entry(mainInner, navy),
  ];
  const cell = (w, children, fill, margins) => new TableCell({ width: { size: w, type: WidthType.DXA }, borders: NO_BORDERS, margins, children, ...(fill ? { shading: SHADE(fill) } : {}) });
  return makeDoc({
    accent: navy, margin: { top: 0, bottom: 0, left: 0, right: 0 },
    children: [
      new Table({
        width: { size: PAGE.width, type: WidthType.DXA }, columnWidths: [left, right], borders: TABLE_NO_LINES,
        rows: [new TableRow({ height: { value: 16300, rule: HeightRule.AT_LEAST }, children: [
          cell(left, side, navy, { top: 640, bottom: 300, left: 380, right: 380 }),
          cell(right, main, null, { top: 760, bottom: 300, left: 560, right: 460 }),
        ] })],
      }),
      gap(20),
    ],
  });
}

/* ============ 4. Creative (Pro): colour header with photo, tinted side column, bar headings ============ */
function creative() {
  const accent = "7E22CE", deep = "581C87", tint = "F5F3FF", margin = 600, total = PAGE.width - 2 * margin;
  const photoW = 2300, mainW = 7000, sideW = total - mainW, mainInner = mainW - 760, sideInner = sideW - 620;
  const hd = (t, fill) => new Paragraph({ heading: HeadingLevel.HEADING_1, shading: SHADE(fill), spacing: { before: 220, after: 100 }, children: [r(`\u00A0\u00A0${t.toUpperCase()}`, { bold: true, size: 19, color: "FFFFFF", characterSpacing: 40 })] });
  const cellOf = (w, children, o = {}) => new TableCell({ width: { size: w, type: WidthType.DXA }, borders: NO_BORDERS, children, ...o });

  const header = new Table({
    width: { size: total, type: WidthType.DXA }, columnWidths: [total - photoW, photoW], borders: TABLE_NO_LINES,
    rows: [new TableRow({ height: { value: 2500, rule: HeightRule.AT_LEAST }, children: [
      cellOf(total - photoW, [
        para(r(T.name, { bold: true, size: 60, color: "FFFFFF" }), { spacing: { after: 40 } }),
        para(r(T.title, { size: 26, color: "E9D5FF" }), { spacing: { after: 100 } }),
        para(r(T.contact, { size: 18, color: "F3E8FF" })),
      ], { shading: SHADE(accent), margins: { top: 380, bottom: 300, left: 560, right: 200 }, verticalAlign: VerticalAlign.CENTER }),
      cellOf(photoW, [para(photo("EDE9FE", "A78BFA", 104), { alignment: AlignmentType.CENTER })], { shading: SHADE(accent), margins: { top: 300, bottom: 300, left: 100, right: 300 }, verticalAlign: VerticalAlign.CENTER }),
    ] })],
  });

  const lvl = { on: accent, off: "DDD6FE", color: "1F2937", tab: sideInner };
  const body = new Table({
    width: { size: total, type: WidthType.DXA }, columnWidths: [mainW, sideW], borders: TABLE_NO_LINES,
    rows: [new TableRow({ height: { value: 12600, rule: HeightRule.AT_LEAST }, children: [
      cellOf(mainW, [
        hd("About me", accent), para(r(T.summary)),
        hd("Experience", accent), ...entry(mainInner, accent), ...entry(mainInner, accent),
        hd("Selected projects", accent),
        para([r("[Project name]", { bold: true }), r(" · [what it was and the result]")], { spacing: { after: 60 } }),
        para([r("[Project name]", { bold: true }), r(" · [what it was and the result]")]),
      ], { margins: { top: 80, bottom: 300, left: 420, right: 340 } }),
      cellOf(sideW, [
        hd("Skills", deep), ...T.skills.map((s, i) => ratedRow(s, [5, 4, 4, 3][i], lvl)),
        hd("Languages", deep), ...T.languages.map((s, i) => ratedRow(s, [5, 3][i], lvl)),
        hd("Education", deep), para(r("[Degree or qualification]", { bold: true, size: 19 })), para(r("[School], [Year]", { size: 19, color: "4B5563" })),
      ], { shading: SHADE(tint), margins: { top: 80, bottom: 300, left: 300, right: 320 } }),
    ] })],
  });
  return makeDoc({ accent, margin: { top: margin, bottom: margin, left: margin, right: margin }, children: [header, gap(), body, gap(20)] });
}

const FILES = { "modern-tech.docx": modernTech, "minimalist.docx": minimalist, "executive.docx": executive, "creative.docx": creative };
for (const [name, build] of Object.entries(FILES)) {
  fs.writeFileSync(path.join(OUT, name), await Packer.toBuffer(build()));
  console.log("created template-files/" + name);
}