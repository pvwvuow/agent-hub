#!/usr/bin/env node
/* صندوق اعلامیه‌ها (inbox) — سیستم پیام عمومی/خصوصی با رسید خواندن، سبک تلگرام
   ساختار:
     announcements/inbox/_general.json        ← پیام‌های عمومی (to: "all")
     announcements/inbox/<agent-id>.json      ← پیام‌های خصوصی هر ایجنت
     announcements/inbox/.read-state/<id>.json ← نشانگر «آخرین خوانده» هر ایجنت
   فرمان‌ها:
     node scripts/inbox.js post --to all|<agent-id> --from <id> --subject "..." --body "..." [--priority normal|high|critical]
     node scripts/inbox.js check --agent <id> [--full]   ← پیام‌های نخوانده؛ ۰ = ALL-READ
     node scripts/inbox.js ack   --agent <id>            ← ثبت رسید خواندن (الان)
     node scripts/inbox.js status                        ← نمای مدیر: نخواندهٔ هر ایجنت
   بدون وابستگی خارجی — Node 20+ */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const INBOX_DIR = path.join(ROOT, "announcements", "inbox");
const STATE_DIR = path.join(INBOX_DIR, ".read-state");

const faNum = (n) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);

function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; }
}
function writeJson(p, v) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(v, null, 2) + "\n", "utf8");
}
function loadBox(file) {
  const v = readJson(path.join(INBOX_DIR, file));
  return Array.isArray(v?.messages) ? v.messages : [];
}
function agentFile(id) { return path.join(ROOT, "agents", `${id}.json`); }
function agentExists(id) { return fs.existsSync(agentFile(id)); }

function unreadFor(id) {
  const st = readJson(path.join(STATE_DIR, `${id}.json`));
  const lastRead = st?.last_read_at ? Date.parse(st.last_read_at) : 0;
  const all = [
    ...loadBox("_general.json").map((m) => ({ ...m, __box: "general" })),
    ...loadBox(`${id}.json`).map((m) => ({ ...m, __box: "private" })),
  ].filter((m) => Date.parse(m.at || 0) > lastRead);
  all.sort((a, b) => Date.parse(a.at || 0) - Date.parse(b.at || 0));
  return all;
}

function relTime(iso) {
  const t = Date.parse(iso || "");
  if (isNaN(t)) return "—";
  const mins = Math.max(0, Math.round((Date.now() - t) / 60000));
  if (mins < 1) return "همین حالا";
  if (mins < 60) return `${faNum(mins)} دقیقه پیش`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${faNum(h)} ساعت پیش`;
  return `${faNum(Math.round(h / 24))} روز پیش`;
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) out[argv[i].slice(2)] = (argv[i + 1] && !argv[i + 1].startsWith("--")) ? argv[++i] : true;
  }
  return out;
}

const [cmd] = process.argv.slice(2);
const args = parseArgs(process.argv.slice(3));

if (cmd === "post") {
  const to = String(args.to || "all");
  const from = String(args.from || "z-ai-main");
  const subject = String(args.subject || "(بدون عنوان)");
  const body = String(args.body || "");
  const priority = ["normal", "high", "critical"].includes(args.priority) ? args.priority : "normal";
  if (to !== "all" && !agentExists(to)) {
    console.error(`ERR: agent not found: ${to}`);
    process.exit(1);
  }
  const file = to === "all" ? "_general.json" : `${to}.json`;
  const box = readJson(path.join(INBOX_DIR, file)) || { messages: [] };
  if (!Array.isArray(box.messages)) box.messages = [];
  const now = new Date().toISOString();
  box.messages.push({
    id: `m${Date.now()}`,
    from,
    to,
    subject,
    body,
    priority,
    at: now,
  });
  /* حداکثر ۵۰ پیام در هر صندوق — قدیمی‌ها حذف */
  if (box.messages.length > 50) box.messages = box.messages.slice(-50);
  writeJson(path.join(INBOX_DIR, file), box);
  console.log(`posted → ${file} | ${priority} | ${subject}`);
  process.exit(0);
}

if (cmd === "check") {
  const id = String(args.agent || "");
  if (!id) { console.error("ERR: --agent required"); process.exit(1); }
  const unread = unreadFor(id);
  if (!unread.length) {
    console.log("ALL-READ — پیام جدیدی نیست، صندوق لازم نیست باز شود.");
    process.exit(0);
  }
  const full = Boolean(args.full);
  for (const m of unread) {
    const tag = m.__box === "private" ? "خصوصی" : "عمومی";
    console.log(`📩 [${tag}·${m.priority}] ${m.subject} — ${relTime(m.at)} — از ${m.from}`);
    console.log(full || m.priority === "critical" ? m.body : m.body.slice(0, 300) + (m.body.length > 300 ? " …" : ""));
  }
  console.log(`UNREAD: ${faNum(unread.length)}`);
  process.exit(0);
}

if (cmd === "ack") {
  const id = String(args.agent || "");
  if (!id) { console.error("ERR: --agent required"); process.exit(1); }
  const prev = readJson(path.join(STATE_DIR, `${id}.json`)) || {};
  writeJson(path.join(STATE_DIR, `${id}.json`), { agent: id, last_read_at: new Date().toISOString(), prev_last_read_at: prev.last_read_at || null });
  console.log(`acked — ${id} همهٔ پیام‌های تا الان خوانده شد.`);
  process.exit(0);
}

if (cmd === "read") {
  // دستور نظارتی مدیر ارشد (به فرمان ادمین): خواندن کل صندوق هر ایجنت بدون تغییر رسید خواندن
  const id = String(args.agent || "");
  if (!id) { console.error("ERR: --agent required"); process.exit(1); }
  const n = parseInt(String(args.n || "10"), 10) || 10;
  const lines = [];
  for (const boxName of ["_general.json", `${id}.json`]) {
    const fp = path.join(INBOX_DIR, boxName);
    if (!fs.existsSync(fp)) continue;
    const box = readJson(fp) || { messages: [] };
    const tag = boxName === "_general.json" ? "عمومی" : "خصوصی";
    const state = readJson(path.join(STATE_DIR, `${id}.json`));
    const lastRead = state && state.last_read_at ? state.last_read_at : null;
    for (const m of (box.messages || []).slice(-n)) {
      const seen = lastRead && m.at <= lastRead;
      lines.push(`${seen ? "✅" : "📩"} [${tag}·${m.priority}] ${m.subject} — از ${m.from} — ${relTime(m.at)}`);
      lines.push(`   ${m.body.slice(0, 200)}${m.body.length > 200 ? " …" : ""}`);
    }
  }
  if (!lines.length) console.log(`صندوق ${id} خالی است.`);
  else console.log(lines.join("\n"));
  process.exit(0);
}

if (cmd === "status") {
  const files = fs.readdirSync(path.join(ROOT, "agents")).filter((f) => f.endsWith(".json") && !f.startsWith("_"));
  let total = 0;
  for (const f of files) {
    const id = f.replace(/\.json$/, "");
    const n = unreadFor(id).length;
    total += n;
    if (n) console.log(`${id}: ${faNum(n)} نخوانده`);
  }
  console.log(`TOTAL-UNREAD: ${faNum(total)}`);
  process.exit(0);
}

console.error("usage: inbox.js post|check|ack|status|read ...\n  read --agent <id> [--n N]  ← نمای نظارتی مدیر ارشد: کل صندوق هر ایجنت بدون تغییر رسید");
process.exit(1);
