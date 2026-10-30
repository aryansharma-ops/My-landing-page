/**
 * Generates the real, downloadable reader's guide:
 *   public/downloads/seven-questions-reader-guide.pdf
 * Run: node scripts/generate-guide.mjs
 */
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const W = 612; // US Letter
const H = 792;
const M = 64;

const NAVY = rgb(0x17 / 255, 0x24 / 255, 0x3a / 255);
const GOLD = rgb(0xb8 / 255, 0x9a / 255, 0x5a / 255);
const CHARCOAL = rgb(0x20 / 255, 0x21 / 255, 0x24 / 255);
const IVORY = rgb(0xf7 / 255, 0xf5 / 255, 0xf0 / 255);
const GREY = rgb(0x41 / 255, 0x41 / 255, 0x41 / 255);

const QUESTIONS = [
  {
    n: "01",
    title: "The Trigger Audit",
    lead: "Every habit has a starting pistol. Before judging the behaviour, find what fires it: a time of day, a place, a feeling, a person, a notification.",
    prompts: ["What happened in the ten minutes before the behaviour?", "What were you feeling — bored, anxious, tired, celebratory?", "Describe one recent example in plain detail."],
  },
  {
    n: "02",
    title: "The Reward Map",
    lead: "Habits persist because they pay. Name the payoff honestly — relief, stimulation, avoidance, belonging — or you will keep repurchasing it.",
    prompts: ["What does this habit give you immediately?", "What discomfort does it help you postpone?", "Is there a cheaper way to buy the same reward?"],
  },
  {
    n: "03",
    title: "The Energy Question",
    lead: "Willpower is a budget, not a virtue. Discipline that ignores your daily energy curve is scheduled to fail.",
    prompts: ["When in the day are you reliably strongest?", "When are you reliably weakest — and what do you do then?", "What single habit belongs in your strongest hour?"],
  },
  {
    n: "04",
    title: "The Friction Scan",
    lead: "Environments beat intentions. Every step between you and a behaviour is a vote for or against it.",
    prompts: ["List three points of friction around a habit you want to build.", "List three things your environment currently makes too easy.", "What one change removes a step tomorrow morning?"],
  },
  {
    n: "05",
    title: "The Identity Line",
    lead: "We follow through on what fits the story we tell about ourselves. Behaviours that contradict it get quietly sabotaged.",
    prompts: ["Finish honestly: “I am the kind of person who…”", "Does the habit you want belong to that person?", "Rewrite the sentence so the habit deserves to exist."],
  },
  {
    n: "06",
    title: "The Restart Rule",
    lead: "Streaks end; systems resume. The difference between a lapse and a collapse is a script written in advance.",
    prompts: ["Define the smallest version of the habit that still counts.", "Write the exact first step you will take after any missed day.", "Who or what notices if you quietly stop?"],
  },
  {
    n: "07",
    title: "The Review Ritual",
    lead: "What gets reviewed gets kept. Ten quiet minutes a week turn scattered intentions into a personal system.",
    prompts: ["Which day and hour will you review your week?", "What two numbers tell you the truth about the week?", "What will you stop doing, starting next week?"],
  },
];

function wrap(text, font, size, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) > maxWidth) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

const doc = await PDFDocument.create();
doc.setTitle("7 Questions That Help You Understand Your Habits and Behaviour");
doc.setAuthor("Meridian Press");
doc.setSubject("A free reader's guide from Meridian Press");
doc.setKeywords(["habits", "self-discipline", "journal", "Meridian Press"]);

const serif = await doc.embedFont(StandardFonts.TimesRoman);
const serifBold = await doc.embedFont(StandardFonts.TimesRomanBold);
const serifItalic = await doc.embedFont(StandardFonts.TimesRomanItalic);
const sans = await doc.embedFont(StandardFonts.Helvetica);

// ---------- cover ----------
{
  const page = doc.addPage([W, H]);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: NAVY });
  page.drawRectangle({ x: 26, y: 26, width: W - 52, height: H - 52, borderColor: GOLD, borderWidth: 1.2 });
  const brand = "M E R I D I A N   P R E S S";
  const bw = sans.widthOfTextAtSize(brand, 11);
  page.drawText(brand, { x: (W - bw) / 2, y: H - 100, size: 11, font: sans, color: GOLD });
  page.drawLine({ start: { x: W / 2 - 40, y: H - 130 }, end: { x: W / 2 + 40, y: H - 130 }, thickness: 1, color: GOLD });

  const t1 = "SEVEN";
  const t2 = "QUESTIONS";
  page.drawText(t1, { x: (W - serifBold.widthOfTextAtSize(t1, 52)) / 2, y: H / 2 + 60, size: 52, font: serifBold, color: IVORY });
  page.drawText(t2, { x: (W - serifBold.widthOfTextAtSize(t2, 52)) / 2, y: H / 2, size: 52, font: serifBold, color: IVORY });

  const sub = "that help you understand your habits and behaviour";
  page.drawText(sub, { x: (W - serifItalic.widthOfTextAtSize(sub, 15)) / 2, y: H / 2 - 44, size: 15, font: serifItalic, color: GOLD });

  const note = "A free reader's guide · Volume 1";
  page.drawText(note, { x: (W - serif.widthOfTextAtSize(note, 12)) / 2, y: 92, size: 12, font: serif, color: IVORY });
}

// ---------- how to use ----------
{
  const page = doc.addPage([W, H]);
  page.drawText("MERIDIAN PRESS", { x: M, y: H - 70, size: 10, font: sans, color: GOLD, characterSpacing: 2 });
  page.drawLine({ start: { x: M, y: H - 84 }, end: { x: W - M, y: H - 84 }, thickness: 0.8, color: GOLD });
  page.drawText("How to use this guide", { x: M, y: H - 130, size: 30, font: serifBold, color: NAVY });

  const paras = [
    "This guide contains seven questions. Each one targets a different mechanism that keeps habits alive or lets them die — triggers, rewards, energy, friction, identity, restarts, and review.",
    "Work through one question per sitting. Ten honest minutes beats an hour of polite answers. Write in full sentences if you can; fragments if you must. Print these pages, or answer in your own notebook.",
    "Revisit question seven every week. It is the hinge the other six hang on.",
  ];
  let y = H - 180;
  for (const p of paras) {
    for (const line of wrap(p, serif, 13, W - 2 * M)) {
      page.drawText(line, { x: M, y, size: 13, font: serif, color: CHARCOAL });
      y -= 20;
    }
    y -= 12;
  }
  y -= 8;
  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.5, color: GREY });
  y -= 34;
  const small = [
    "Meridian Press is an independent publishing brand creating practical books on",
    "psychology, strategy, habits, and communication. This guide is free to keep;",
    "please share the link, not the file.",
  ];
  for (const line of small) {
    page.drawText(line, { x: M, y, size: 10.5, font: serifItalic, color: GREY });
    y -= 16;
  }
}

// ---------- question pages ----------
QUESTIONS.forEach((q, idx) => {
  const page = doc.addPage([W, H]);
  page.drawText("MERIDIAN PRESS · SEVEN QUESTIONS", { x: M, y: H - 66, size: 9, font: sans, color: GOLD, characterSpacing: 1.6 });
  page.drawLine({ start: { x: M, y: H - 80 }, end: { x: W - M, y: H - 80 }, thickness: 0.8, color: GOLD });

  page.drawText(q.n, { x: M, y: H - 150, size: 44, font: serifBold, color: GOLD });
  page.drawText(q.title, { x: M + 62, y: H - 142, size: 26, font: serifBold, color: NAVY });

  let y = H - 190;
  for (const line of wrap(q.lead, serifItalic, 12.5, W - 2 * M)) {
    page.drawText(line, { x: M, y, size: 12.5, font: serifItalic, color: GREY });
    y -= 18;
  }
  y -= 26;

  q.prompts.forEach((p) => {
    page.drawCircle({ x: M + 4, y: y + 4, size: 2.2, color: GOLD });
    for (const line of wrap(p, serif, 12.5, W - 2 * M - 18)) {
      page.drawText(line, { x: M + 18, y, size: 12.5, font: serif, color: CHARCOAL });
      y -= 17;
    }
    y -= 30;
    for (let i = 0; i < 4; i++) {
      page.drawLine({ start: { x: M + 18, y }, end: { x: W - M, y }, thickness: 0.4, color: rgb(0.75, 0.72, 0.65) });
      y -= 22;
    }
    y -= 14;
  });

  const footer = `Question ${idx + 1} of 7 · seven-questions-reader-guide`;
  page.drawText(footer, { x: M, y: 44, size: 9, font: sans, color: GREY });
  page.drawText(String(idx + 3), { x: W - M, y: 44, size: 9, font: sans, color: GREY });
});

// ---------- back page ----------
{
  const page = doc.addPage([W, H]);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: NAVY });
  const a = "Keep going.";
  page.drawText(a, { x: (W - serifBold.widthOfTextAtSize(a, 34)) / 2, y: H / 2 + 60, size: 34, font: serifBold, color: IVORY });
  const lines = [
    "The books this guide belongs to are being written now —",
    "shaped by reader research, not guesswork.",
    "Tell us what to write first at the Meridian Press website.",
  ];
  let y = H / 2 + 10;
  for (const line of lines) {
    page.drawText(line, { x: (W - serif.widthOfTextAtSize(line, 12.5)) / 2, y, size: 12.5, font: serif, color: GOLD });
    y -= 19;
  }
  const brand = "M E R I D I A N   P R E S S";
  page.drawText(brand, { x: (W - sans.widthOfTextAtSize(brand, 10)) / 2, y: 80, size: 10, font: sans, color: IVORY, characterSpacing: 1.5 });
}

const out = path.join(process.cwd(), "public", "downloads");
await mkdir(out, { recursive: true });
const bytes = await doc.save();
await writeFile(path.join(out, "seven-questions-reader-guide.pdf"), bytes);
console.log("Guide written:", path.join(out, "seven-questions-reader-guide.pdf"), `${(bytes.length / 1024).toFixed(0)} KB`);
