#!/usr/bin/env node
/* هاب ایجنت‌های wowfarsi — سازندهٔ صفحه
   از agents/*.json و tasks/*.json می‌سازد:
     1) بخش خودکار README.md (بین نشانگرهای HUB:AUTO)
     2) hub.json (نسخهٔ ماشین‌خوان برای پنل و بازرس)
     3) docs/index.html (داشبورد RTL فارسی برای GitHub Pages)
   بدون وابستگی خارجی — Node 20+ */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const AGENTS_DIR = path.join(ROOT, "agents");
const TASKS_DIR = path.join(ROOT, "tasks");
const ROLES_DIR = path.join(ROOT, "roles");
const DOCS_DIR = path.join(ROOT, "docs");

const STALE_MS = 24 * 60 * 60 * 1000; // بدون last_seen تازه = بی‌نشانه
const FRESH_MS = 35 * 60 * 1000; // چراغ روشن = last_seen تازه‌تر از ۳۵ دقیقه (شیفت ۱۰ دقیقه‌ای + حاشیه رندر)

function readJsonFiles(dir) {
  const out = [];
  let files = [];
  try {
    files = fs.readdirSync(dir).filter((f) => f.endsWith(".json") && !f.startsWith("_"));
  } catch {
    return out;
  }
  for (const f of files) {
    try {
      const v = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
      v.__file = f;
      out.push(v);
    } catch (e) {
      out.push({ __file: f, __broken: String(e.message || e) });
    }
  }
  return out;
}

function faNum(n) {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
}

function relTime(iso) {
  const t = Date.parse(iso);
  if (isNaN(t)) return "—";
  const mins = Math.max(0, Math.round((Date.now() - t) / 60000));
  if (mins < 1) return "همین حالا";
  if (mins < 60) return `${faNum(mins)} دقیقه پیش`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${faNum(h)} ساعت پیش`;
  const d = Math.round(h / 24);
  return `${faNum(d)} روز پیش`;
}

function jalaliNow() {
  try {
    return new Intl.DateTimeFormat("fa-IR", { dateStyle: "full", timeStyle: "short", timeZone: "Asia/Tehran" }).format(new Date());
  } catch {
    return new Date().toISOString();
  }
}

function tehranHM(ms) {
  try {
    return new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tehran" }).format(new Date(ms));
  } catch {
    return null;
  }
}

function relFromMs(ms) {
  const diff = ms - Date.now();
  if (diff <= 0) return `گذشته از ${faNum(Math.max(1, Math.round(-diff / 60000)))} دقیقه`;
  if (diff < 3600000) return `تا ${faNum(Math.max(1, Math.round(diff / 60000)))} دقیقه دیگر`;
  return `تا ${faNum(Math.round(diff / 3600000))} ساعت دیگر`;
}

/* next_wake — بیداری بعدی ایجنت به وقت ایران
   اگر ایجنت next_wake اعلام کرده باشد همان (دقیق)؛ وگرنه تخمین خودکار: last_seen + فاصلهٔ شیفت
   (shift_interval_minutes، پیش‌فرض ۱۰ دقیقه — مدیر ارشد ۵ دقیقه)
   فرمت‌های پذیرفته: "HH:MM" (امروز تهران) · "YYYY-MM-DD HH:MM[:SS]" (به وقت تهران) · ISO با Z (UTC) */
function nextWakeInfo(a) {
  const raw = a.next_wake || a.nextWake;
  const intervalMin = Number(a.shift_interval_minutes || a.shiftIntervalMinutes) > 0 ? Number(a.shift_interval_minutes || a.shiftIntervalMinutes) : 10;
  const s = raw ? String(raw).trim() : "";
  let ms = null;
  if (s) {
    if (/^\d{2}:\d{2}$/.test(s)) {
      const [h, m] = s.split(":").map(Number);
      const nowTehran = new Date(Date.now() + 3.5 * 3600000);
      nowTehran.setUTCHours(h, m, 0, 0);
      ms = nowTehran.getTime() - 3.5 * 3600000;
      if (ms < Date.now() - 5 * 60000) ms += 24 * 3600000; // اگر گذشته، فردا
    } else if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/.test(s) && !/[Z+]/.test(s)) {
      ms = Date.parse(s.replace(" ", "T") + (s.length === 16 ? ":00" : "") + "+03:30");
    } else {
      ms = Date.parse(s);
    }
    /* اعلامِ بیش از ۱۰ دقیقه گذشته = کهنه (ایجنت به‌روز نکرده) → رد و تخمین */
    if (ms !== null && !isNaN(ms) && ms < Date.now() - 10 * 60000) ms = null;
  }
  if (ms === null || isNaN(ms)) {
    if (s) return { has: true, raw: s, text: s, rel: null, est: false }; /* اعلام نامفهوم — همان خام نشان بده */
    const base = Date.parse(a.last_seen || a.lastSeen || ""); /* هر دو فرمت: آبجکت خام و آبجکت hub (camelCase) */
    if (isNaN(base)) return { has: false };
    ms = base + intervalMin * 60000;
    let guard = 0;
    while (ms < Date.now() - 60000 && guard < 288) { ms += intervalMin * 60000; guard++; }
    if (guard >= 288) return { has: false };
    const hm = tehranHM(ms);
    return { has: true, est: true, text: hm ? `${hm} تهران` : null, rel: relFromMs(ms) };
  }
  const hm = tehranHM(ms);
  return { has: true, est: false, text: hm ? `${hm} تهران` : s, rel: relFromMs(ms) };
}

function humanSchedule(s) {
  if (!s) return "—";
  if (typeof s === "string") return s;
  if (s.kind === "one_time") return `یک‌بار — ${s.expr || ""}`.trim();
  if (s.kind === "fixed_rate") {
    const n = parseInt(s.expr, 10);
    if (!isNaN(n)) {
      if (n < 60) return `هر ${faNum(n)} ثانیه`;
      if (n < 3600) return `هر ${faNum(Math.round(n / 60))} دقیقه`;
      return `هر ${faNum(Math.round(n / 3600))} ساعت`;
    }
    return `هر ${s.expr} ثانیه`;
  }
  const expr = String(s.expr || "").trim();
  const f = expr.split(/\s+/);
  if (f.length >= 6) {
    const [, min, hour] = f;
    const mInt = min.match(/^\*\/(\d+)$/);
    const hInt = hour.match(/^\*\/(\d+)$/);
    if (hInt && /^\d+$/.test(min)) return `هر ${faNum(+hInt[1])} ساعت (دقیقهٔ ${faNum(+min)})`;
    if (mInt && hour === "*") return `هر ${faNum(+mInt[1])} دقیقه`;
    if (/^\d+$/.test(hour) && /^\d+$/.test(min)) return `روزانه ساعت ${faNum(+hour)}:${faNum(min.padStart(2, "0"))}`;
  }
  return `کرون: ${expr}`;
}

const STATUS_FA = { active: "فعال", paused: "مکث‌شده", retired: "بازنشسته", on: "روشن", working: "در حال کار", off: "خاموش" };

/* چراغ وضعیت — طبق PROTOCOL.md
   🟠 working: status=working و last_seen تازه — مشغول؛ کار جدید در صف
   🟢 on: last_seen تازه (شیفت ۱۰ دقیقه‌ای زنده است)
   ⚫ off: last_seen کهنه یا status=off */
function lightOf(a) {
  const t = Date.parse(a.last_seen || "");
  const fresh = !isNaN(t) && Date.now() - t <= FRESH_MS;
  if (a.status === "off") return { key: "off", fresh };
  if (a.status === "working") return { key: fresh ? "working" : "off", fresh };
  return { key: fresh ? "on" : "off", fresh };
}
const LIGHT_FA = { on: "🟢 روشن", working: "🟠 در حال کار", off: "⚫ خاموش" };
const LIGHT_CLS = { on: "st-active", working: "st-working", off: "st-off" };
const ROLE_FA = { manager: "مدیر ارشد", worker: "کارگر" };
const SEV_FA = { critical: "بحرانی", warning: "هشدار", info: "اطلاع" };
const TASK_STATUS_FA = { open: "باز", assigned: "پذیرفته‌شده", "in-progress": "در حال اجرا", done: "انجام‌شده", rejected: "رد‌شده" };

function dot(status) {
  if (status === "active") return "🟢";
  if (status === "paused") return "🟡";
  return "⚪";
}

/* ── جمع‌آوری داده ─────────────────────────────────────────────── */
const agents = readJsonFiles(AGENTS_DIR);
const tasks = readJsonFiles(TASKS_DIR);
const roles = readJsonFiles(ROLES_DIR);
roles.sort((a, b) => String(a.id || a.__file).localeCompare(String(b.id || b.__file)));

const roleRank = (a) => (a.role === "manager" ? 0 : 1);
agents.sort((a, b) => roleRank(a) - roleRank(b) || String(a.id || a.__file).localeCompare(String(b.id || b.__file)));
const sevRank = { critical: 0, warning: 1, info: 2 };
const taskStRank = { open: 0, assigned: 1, "in-progress": 2, done: 3, rejected: 4 };
tasks.sort((a, b) => (sevRank[a.severity] ?? 3) - (sevRank[b.severity] ?? 3) || (taskStRank[a.status] ?? 9) - (taskStRank[b.status] ?? 9));

const now = new Date().toISOString();
for (const a of agents) {
  a.__stale = !a.last_seen || isNaN(Date.parse(a.last_seen)) || Date.now() - Date.parse(a.last_seen) > STALE_MS;
  a.__light = lightOf(a);
}

const validAgents = agents.filter((a) => !a.__broken);
const validRoles = roles.filter((r) => !r.__broken);

/* نقشهٔ تسک ← ایجنت — هر تسک چه کسی را مسئول می‌داند */
const agentById = new Map(validAgents.map((a) => [a.id || a.__file.replace(/\.json$/, ""), a]));
function assigneesOf(t) {
  const raw = [];
  if (Array.isArray(t.assignees)) raw.push(...t.assignees);
  else if (t.assignee) raw.push(t.assignee);
  return [...new Set(raw.map(String).map((x) => x.trim()).filter(Boolean))];
}
function assigneeName(id) {
  const ag = agentById.get(String(id));
  return ag ? ag.name || id : id;
}
for (const t of tasks) {
  if (t.__broken) continue;
  t.__assignees = assigneesOf(t);
}
const OPEN_ST = ["open", "assigned", "in-progress"];
const openTasksByAgent = {};
const unassignedOpen = [];
for (const t of tasks) {
  if (t.__broken || !OPEN_ST.includes(t.status)) continue;
  if (!t.__assignees.length) unassignedOpen.push(t);
  for (const id of t.__assignees) (openTasksByAgent[id] ||= []).push(t);
}
const counts = {
  agents: validAgents.length,
  active: validAgents.filter((a) => a.status === "active" && !a.__stale).length,
  stale: validAgents.filter((a) => a.__stale).length,
  tasks: tasks.filter((t) => !t.__broken).length,
  openTasks: tasks.filter((t) => !t.__broken && ["open", "assigned", "in-progress"].includes(t.status)).length,
  lights: {
    on: validAgents.filter((a) => a.__light.key === "on").length,
    working: validAgents.filter((a) => a.__light.key === "working").length,
    off: validAgents.filter((a) => a.__light.key === "off").length,
  },
  announcedWakes: validAgents.filter((a) => nextWakeInfo(a).has).length,
  wakeExact: validAgents.filter((a) => { const w = nextWakeInfo(a); return w.has && !w.est; }).length,
  wakeKnown: validAgents.filter((a) => nextWakeInfo(a).has).length,
  roles: validRoles.length,
  vacantRoles: validRoles.filter((r) => ["vacant", "applied"].includes(r.status)).length,
  generatedAt: now,
};

/* ── README ────────────────────────────────────────────────────── */
let md = "";
md += `> ساخته‌شده در: ${jalaliNow()} (تهران) — اکشن خودکار render-hub\n\n`;
md += `## 🤖 ایجنت‌های ثبت‌شده (${faNum(counts.agents)}) — ${dot("active")} فعال: ${faNum(counts.active)} · بی‌نشانه: ${faNum(counts.stale)}\n\n`;
if (validAgents.length) {
  md += `| ایجنت | چراغ | نقش | پلتفرم | فعالیت اخیر | بیداری بعدی (تهران) | تسک‌های زمان‌دار |\n|---|---|---|---|---|---|---|\n`;
  for (const a of validAgents) {
    const name = a.name || a.id || a.__file;
    const role = ROLE_FA[a.role] || a.role || "—";
    const st = LIGHT_FA[a.__light.key];
    const seen = a.last_seen ? relTime(a.last_seen) : "—";
    const wk = nextWakeInfo(a);
    const wkTxt = wk.has ? `${wk.est ? "~" : ""}${wk.text}${wk.rel ? ` (${wk.rel})` : ""}${wk.est ? " (تخمینی)" : ""}` : "— نامعلوم";
    const tl = Array.isArray(a.tasks) && a.tasks.length
      ? a.tasks.map((t) => `${t?.name || "؟"} — ${humanSchedule(t?.schedule)}`).join("، ")
      : "—";
    md += `| **${name}** | ${st} | ${role} | ${a.platform || "—"} | ${seen} | ${wkTxt} | ${tl} |\n`;
  }
} else {
  md += "_هنوز ایجنتی ثبت نشده است — اولین نفر باش! (راهنما بالای همین صفحه)_\n";
}

md += `\n## 🏗️ نقش‌های سازمانی (${faNum(counts.roles)}) — خالی: ${faNum(counts.vacantRoles)}\n\n`;
md += "| نقش | بخش | وضعیت | مسئول | مأموریت |\n|---|---|---|---|---|\n";
const ROLE_ST = { vacant: "🔘 خالی", applied: "📨 درخواست داده", filled: "✅ پرشده", retired: "⚪ بازنشسته" };
for (const r of validRoles) {
  md += `| **${r.title || r.id || r.__file}** | ${r.section || "—"} | ${ROLE_ST[r.status] || r.status || "—"} | ${r.filled_by || "—"} | ${r.mission || ""} |\n`;
}
md += `\n_شرح کامل نقش‌ها: [roles/](roles/) · مسیر پیوستن: [JOINING.md](JOINING.md) · نقشهٔ کار: [WORKFLOW.md](WORKFLOW.md) · شیفت و چراغ‌ها: [PROTOCOL.md](PROTOCOL.md)_\n`;

const openTasks = tasks.filter((t) => !t.__broken);
md += `\n## 📋 تسک‌ها (${faNum(counts.tasks)}) — باز: ${faNum(counts.openTasks)}\n\n`;
if (openTasks.length) {
  md += "| تسک | شدت | وضعیت | مسئول | شواهد/برنامه |\n|---|---|---|---|---|\n";
  for (const t of openTasks) {
    const title = t.title || t.id || t.__file;
    const sev = SEV_FA[t.severity] ? `${t.severity === "critical" ? "🔴" : t.severity === "warning" ? "🟠" : "🔵"} ${SEV_FA[t.severity]}` : "—";
    const st = TASK_STATUS_FA[t.status] || t.status || "—";
    const asg = t.__assignees.length ? t.__assignees.map(assigneeName).join("، ") : "— بی‌صاحب";
    md += `| **${title}** | ${sev} | ${st} | ${asg} | ${String(t.evidence || "").slice(0, 180)} |\n`;
  }
} else {
  md += "_تسکی ثبت نشده است._\n";
}

const README = path.join(ROOT, "README.md");
let readme = "";
try {
  readme = fs.readFileSync(README, "utf8");
} catch {}
const S = "<!-- HUB:AUTO:START -->";
const E = "<!-- HUB:AUTO:END -->";
if (readme.includes(S) && readme.includes(E)) {
  readme = readme.slice(0, readme.indexOf(S)) + S + "\n" + md + E + readme.slice(readme.indexOf(E) + E.length);
} else {
  readme += `\n${S}\n${md}\n${E}\n`;
}
fs.writeFileSync(README, readme, "utf8");

/* ── hub.json ──────────────────────────────────────────────────── */
const hub = {
  generatedAt: now,
  counts,
  roles: validRoles.map((r) => ({
    id: r.id || r.__file.replace(/\.json$/, ""),
    title: r.title || r.id || r.__file,
    section: r.section || null,
    status: r.status || "vacant",
    filledBy: r.filled_by || null,
    approvedBy: r.approved_by || null,
    approvedAt: r.approved_at || null,
    note: r.note || null,
    mission: r.mission || null,
    responsibilities: Array.isArray(r.responsibilities) ? r.responsibilities : [],
    supervises: Array.isArray(r.supervises) ? r.supervises : [],
    requires: Array.isArray(r.requires) ? r.requires : [],
    cadence: r.cadence || null,
    kpis: Array.isArray(r.kpis) ? r.kpis : [],
  })),
  agents: validAgents.map((a) => ({
    id: a.id || a.__file.replace(/\.json$/, ""),
    name: a.name || a.id || a.__file,
    platform: a.platform || null,
    role: a.role || "worker",
    owner: a.owner || null,
    description: a.description || null,
    status: a.status || "unknown",
    light: a.__light.key,
    lastSeen: a.last_seen || null,
    currentTask: a.current_task || null,
    nextWake: a.next_wake || a.nextWake || null,
    shiftIntervalMinutes: Number(a.shift_interval_minutes) > 0 ? Number(a.shift_interval_minutes) : null,
    stale: a.__stale,
    session: a.session || null,
    contact: a.contact || null,
    tasks: (Array.isArray(a.tasks) ? a.tasks : []).map((t) => ({
      name: t?.name || "؟",
      schedule: t?.schedule ?? null,
      scheduleText: humanSchedule(t?.schedule),
      description: t?.description || null,
      status: t?.status || "active",
    })),
  })),
  tasks: tasks.filter((t) => !t.__broken).map((t) => ({
    id: t.id || t.__file.replace(/\.json$/, ""),
    title: t.title || t.id || t.__file,
    severity: t.severity || "info",
    status: t.status || "open",
    assignee: t.assignee || null,
    assignees: t.__assignees || [],
    createdBy: t.created_by || null,
    createdAt: t.created_at || null,
    updatedAt: t.updated_at || null,
    evidence: t.evidence || null,
    plan: Array.isArray(t.plan) ? t.plan : [],
    notes: Array.isArray(t.notes) ? t.notes : [],
  })),
  broken: agents.filter((a) => a.__broken).map((a) => ({ file: a.__file, error: a.__broken })),
};
fs.writeFileSync(path.join(ROOT, "hub.json"), JSON.stringify(hub, null, 2), "utf8");

/* ── docs/index.html ───────────────────────────────────────────── */
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function agentCard(a) {
  const stCls = LIGHT_CLS[a.__light?.key] || "st-off";
  const stTxt = LIGHT_FA[a.__light?.key] || "⚫ خاموش";
  const curTask = a.current_task ? ` <span class="badge cur">📌 تسک جاری: ${esc(a.current_task)}</span>` : "";
  const wk = nextWakeInfo(a);
  const wkHtml = wk.has
    ? `<span class="badge wk${wk.est ? " wk-est" : ""}" title="${wk.est ? "بیداری بعدی — تخمین خودکار از آخرین فعالیت + فاصلهٔ شیفت" : "بیداری بعدی به وقت ایران (اعلام خود ایجنت)"}">⏰ بیداری بعدی: ${wk.est ? "~" : ""}${esc(wk.text)}${wk.rel ? ` · ${esc(wk.rel)}` : ""}${wk.est ? " (تخمینی)" : ""}</span>`
    : `<span class="badge wk-none" title="شیفت زنده نیست یا بیداری بعدی قابل محاسبه نیست">⏰ بیداری بعدی: نامعلوم</span>`;
  const mine = (openTasksByAgent[a.id || a.__file.replace(/\.json$/, "")] || []).slice(0, 4);
  const mineHtml = mine.length
    ? `<div class="hub-tasks"><span class="ht-label">تسک‌های هاب من:</span>${mine.map((t) => `<span class="badge tbadge ${t.severity === "critical" ? "sev-c" : t.severity === "warning" ? "sev-w" : "sev-i"}" title="${esc(t.title)}">${esc(t.id || t.__file.replace(/\.json$/, ""))}</span>`).join("")}${mine.length >= 4 && (openTasksByAgent[a.id] || []).length > 4 ? `<span class="badge">+${faNum((openTasksByAgent[a.id] || []).length - 4)}</span>` : ""}</div>`
    : "";
  const tasksHtml = (a.tasks || []).map((t) => `
      <li><span class="t-name">${esc(t.name)}</span><span class="t-sched">${esc(t.scheduleText || "")}</span>${t.description ? `<span class="t-desc">${esc(t.description)}</span>` : ""}</li>`).join("");
  return `
    <div class="card agent ${a.__light?.key === "working" ? "is-working" : ""}" id="ag-${esc(a.id || "")}" data-light="${esc(a.__light?.key || "off")}">
      <div class="row"><span class="dot ${stCls}" role="img" aria-label="${esc(stTxt)}"></span>
        <h3>${esc(a.name)}${a.role === "manager" ? ' <span class="badge mgr">👑 مدیر ارشد</span>' : ""}</h3>
        <span class="badge">${esc(a.id || "—")}</span>
        <span class="badge">${esc(a.platform || "—")}</span>
        <span class="badge ${stCls}">${esc(stTxt)}</span>${curTask}</div>
      ${a.description ? `<p class="desc">${esc(a.description)}</p>` : ""}
      <div class="wkline">${wkHtml}<span class="badge">فعالیت: ${esc(a.lastSeen ? relTime(a.lastSeen) : "—")}</span></div>
      ${mineHtml}
      <ul class="tasks">${tasksHtml || '<li class="t-desc">تسک زمان‌داری ثبت نشده</li>'}</ul>
      <div class="meta">مالک: ${esc(a.owner || "—")}</div>
    </div>`;
}

/* کارت نقشهٔ کار — کدام تسک مال کدام ایجنت */
function workMapCard(a) {
  const id = a.id || a.__file.replace(/\.json$/, "");
  const mine = openTasksByAgent[id] || [];
  const stCls = LIGHT_CLS[a.__light?.key] || "st-off";
  if (!mine.length && !a.current_task) return "";
  const wk = nextWakeInfo(a);
  const items = mine.map((t) => `
    <li><span class="dot ${t.severity === "critical" ? "sev-c-dot" : t.severity === "warning" ? "sev-w-dot" : "sev-i-dot"}" aria-hidden="true"></span><b>${esc(t.title)}</b> <span class="badge">${esc(TASK_STATUS_FA[t.status] || t.status)}</span></li>`).join("");
  return `
    <div class="card mapcard">
      <div class="row"><span class="dot ${stCls}"></span><h3>${esc(a.name)}</h3>
        <span class="badge wk${wk.has && wk.est ? " wk-est" : ""}">⏰ ${wk.has ? `${wk.est ? "~" : ""}${esc(wk.text)}${wk.est ? " (تخمینی)" : ""}` : "نامعلوم"}</span></div>
      ${a.current_task ? `<div class="curline">📌 در دست اجرا: <b>${esc(a.current_task)}</b></div>` : ""}
      ${mine.length ? `<ul class="duties">${items}</ul>` : '<div class="t-desc">تسک بازی در هاب ندارد</div>'}
    </div>`;
}

function roleCard(r) {
  const filled = r.status === "filled";
  const applied = r.status === "applied";
  const badge = filled ? '<span class="badge filled">✅ پرشده' + esc(r.filledBy ? " · " + r.filledBy : "") + "</span>"
    : applied ? '<span class="badge applied">📨 درخواست داده' + esc(r.filledBy ? " · " + r.filledBy : "") + "</span>"
    : '<span class="badge vacant">🔘 خالی</span>';
  return `
    <div class="card role ${filled ? "" : "vacant-card"}">
      <div class="row"><h3>${esc(r.title)}</h3>${badge}<span class="badge">${esc(r.section || "—")}</span></div>
      ${r.mission ? `<p class="desc">${esc(r.mission)}</p>` : ""}
      ${(r.responsibilities || []).length ? `<ul class="duties">${r.responsibilities.slice(0, 3).map((x) => `<li>${esc(x)}</li>`).join("")}${(r.responsibilities || []).length > 3 ? '<li class="more">… شرح کامل در roles/</li>' : ""}</ul>` : ""}
      ${(r.supervises || []).length ? `<div class="meta">نظارت بر: ${esc(r.supervises.join(" · "))}</div>` : ""}
    </div>`;
}

function taskRow(t) {
  const sevCls = t.severity === "critical" ? "sev-c" : t.severity === "warning" ? "sev-w" : "sev-i";
  const asg = t.__assignees?.length
    ? t.__assignees.map((id) => {
        const ag = agentById.get(id);
        const light = ag ? LIGHT_CLS[ag.__light?.key] || "st-off" : "st-off";
        return `<span class="asg"><span class="dot ${light}"></span>${esc(assigneeName(id))}</span>`;
      }).join(" ")
    : ["done", "rejected"].includes(t.status)
      ? '<span class="unassigned">— پایان یافته</span>'
      : '<span class="unassigned">— بی‌صاحب (در انتظار تخصیص)</span>';
  const doneCls = ["done", "rejected"].includes(t.status) ? " done-row" : "";
  return `
    <tr data-st="${["open", "assigned", "in-progress"].includes(t.status) ? "open" : "done"}" class="${doneCls.trim()}">
      <td><b>${esc(t.title)}</b>${t.evidence ? `<div class="t-desc">${esc(String(t.evidence).slice(0, 240))}</div>` : ""}</td>
      <td><span class="badge ${sevCls}">${esc(SEV_FA[t.severity] || t.severity || "—")}</span></td>
      <td><span class="badge">${esc(TASK_STATUS_FA[t.status] || t.status || "—")}</span></td>
      <td>${asg}</td>
    </tr>`;
}

/* اعلامیه‌ها و گزارش بازرس — از فایل‌های مارک‌داون */
function readMdSlice(rel, maxLines = 50) {
  try {
    return fs.readFileSync(path.join(ROOT, rel), "utf8").split("\n").slice(0, maxLines).join("\n");
  } catch {
    return null;
  }
}
function listAnnouncements() {
  try {
    return fs.readdirSync(path.join(ROOT, "announcements")).filter((f) => f.endsWith(".md")).sort().reverse();
  } catch {
    return [];
  }
}
const ANN_FILES = listAnnouncements();
const ANN_LATEST = ANN_FILES.length ? readMdSlice(`announcements/${ANN_FILES[0]}`, 40) : null;
const MASOUD_REPORT = readMdSlice("reports/masoud/report-latest.md", 50);

const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="refresh" content="90">
<title>هاب ایجنت‌های wowfarsi</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css">
<style>
  :root { --bg:#0b0906; --card:#151009; --line:#c8aa6e26; --gold:#c8aa6e; --txt:#f0e6d2; --dim:#a89b7e; }
  * { box-sizing:border-box; }
  html { scroll-behavior:smooth; }
  h2 { scroll-margin-top:16px; }
  body { margin:0; padding:24px 16px 48px; background:var(--bg); color:var(--txt);
         font-family:Vazirmatn,Tahoma,sans-serif; }
  .wrap { max-width:1100px; margin:0 auto; }
  header.top { display:flex; flex-wrap:wrap; align-items:center; gap:12px; margin-bottom:8px; }
  h1 { font-size:22px; margin:0; color:var(--gold); }
  .sub { color:var(--dim); font-size:13px; margin:0 0 20px; }
  .stats { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:24px; }
  .stat { background:var(--card); border:1px solid var(--line); border-radius:12px; padding:10px 18px; text-align:center; }
  .stat b { display:block; font-size:22px; color:var(--gold); }
  .stat span { font-size:12px; color:var(--dim); }
  h2 { font-size:16px; color:var(--gold); margin:28px 0 12px; border-bottom:1px solid var(--line); padding-bottom:8px; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:14px; }
  .card { background:var(--card); border:1px solid var(--line); border-radius:14px; padding:16px; }
  .card .row { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .card h3 { font-size:15px; margin:0; }
  .dot { width:10px; height:10px; border-radius:50%; flex:none; }
  .st-active { background:#4ade80; }
  .st-working { background:#fb923c; }
  .st-paused { background:#facc15; }
  .st-off { background:#6b7280; }
  .badge.st-active, .badge.st-working, .badge.st-paused, .badge.st-off { color:var(--txt); background:none; border:1px solid var(--line); }
  .badge { font-size:11px; border:1px solid var(--line); border-radius:99px; padding:2px 10px; color:var(--dim); }
  .badge.mgr { color:#1a1409; background:var(--gold); border-color:var(--gold); font-weight:700; }
  .badge.filled { color:#4ade80; border-color:#4ade8066; }
  .badge.applied { color:#93c5fd; border-color:#93c5fd66; }
  .badge.vacant { color:var(--dim); border-style:dashed; }
  .card.vacant-card { border-style:dashed; opacity:.85; }
  ul.duties { list-style:none; margin:10px 0 0; padding:0; }
  ul.duties li { font-size:11.5px; color:var(--dim); line-height:1.9; position:relative; padding-right:14px; }
  ul.duties li::before { content:"‌•"; color:var(--gold); position:absolute; right:0; }
  ul.duties li.more { color:#6d6050; }
  .badge.sev-c { color:#fca5a5; border-color:#fca5a566; }
  .badge.sev-w { color:#fcd34d; border-color:#fcd34d66; }
  .badge.sev-i { color:#93c5fd; border-color:#93c5fd66; }
  .desc { color:var(--dim); font-size:12.5px; line-height:1.9; margin:10px 0 0; }
  ul.tasks { list-style:none; margin:12px 0 0; padding:0; }
  ul.tasks li { border-top:1px dashed var(--line); padding:8px 0; }
  .t-name { font-weight:700; font-size:13px; display:block; }
  .t-sched { font-size:11.5px; color:var(--gold); }
  .t-desc { font-size:11.5px; color:var(--dim); line-height:1.8; display:block; margin-top:2px; }
  .meta { margin-top:12px; font-size:11.5px; color:var(--dim); }
  table { width:100%; border-collapse:collapse; background:var(--card); border:1px solid var(--line); border-radius:14px; overflow:hidden; }
  th, td { padding:10px 12px; text-align:right; font-size:13px; border-bottom:1px solid var(--line); vertical-align:top; }
  th { color:var(--gold); font-size:12px; background:#1a1409; }
  footer { margin-top:36px; color:var(--dim); font-size:12px; text-align:center; line-height:2; }
  a { color:var(--gold); text-decoration:none; }
  a:focus-visible, button:focus-visible { outline:2px solid var(--gold); outline-offset:2px; border-radius:4px; }
  nav.jump { display:flex; gap:8px; flex-wrap:wrap; margin:0 0 16px; }
  nav.jump a { font-size:12.5px; border:1px solid var(--line); border-radius:99px; padding:4px 14px; }
  nav.jump a:hover { background:#c8aa6e14; }
  .badge.wk { color:#e7c780; border-color:#c8aa6e66; background:#c8aa6e0d; font-weight:600; }
  .badge.wk-none { color:var(--dim); border-style:dashed; }
  .badge.cur { color:#fdba74; border-color:#fdba7455; }
  .wkline { display:flex; gap:6px; flex-wrap:wrap; margin-top:10px; }
  .card.is-working { border-color:#fb923c55; box-shadow:0 0 0 1px #fb923c22, 0 4px 18px #fb923c0d; }
  .hub-tasks { margin-top:8px; display:flex; gap:5px; flex-wrap:wrap; align-items:center; }
  .ht-label { font-size:11px; color:var(--dim); }
  .badge.tbadge { cursor:help; }
  .asg { display:inline-flex; align-items:center; gap:5px; font-size:12.5px; }
  .asg .dot { width:8px; height:8px; }
  .unassigned { color:#8b7d63; font-style:italic; }
  .mapcard { border-right:3px solid var(--gold); }
  .curline { margin-top:8px; font-size:12.5px; color:var(--txt); }
  .sev-c-dot { background:#f87171; }
  .sev-w-dot { background:#fbbf24; }
  .sev-i-dot { background:#60a5fa; }
  .duties li b { color:var(--txt); font-weight:600; font-size:12px; }
  .filterbar { display:flex; gap:6px; margin:10px 0; }
  .fbtn { background:var(--card); color:var(--dim); border:1px solid var(--line); border-radius:99px; padding:7px 18px; font-family:inherit; font-size:12.5px; cursor:pointer; }
  .fbtn:hover { background:#c8aa6e14; }
  .fbtn.on { color:#1a1409; background:var(--gold); border-color:var(--gold); font-weight:700; }
  #agsearch { background:#0e0b06; color:var(--txt); border:1px solid var(--line); border-radius:99px; padding:7px 16px; font-family:inherit; font-size:12.5px; min-width:200px; flex:1; max-width:320px; }
  #agsearch::placeholder { color:#7d7059; }
  #agsearch:focus { outline:2px solid var(--gold); outline-offset:1px; }
  .badge.wk-est { border-style:dashed; color:#cbbb93; }
  tr.done-row { opacity:.45; }
  .mdbox { background:#0e0b06; border:1px solid var(--line); border-radius:12px; padding:14px 16px; white-space:pre-wrap; word-wrap:break-word; font-size:12px; line-height:2; color:#d8cbb0; font-family:inherit; max-height:420px; overflow:auto; margin:0; }
  .annhead { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:8px; }
  @media (prefers-reduced-motion: no-preference) { .dot { transition:background .3s; } }
</style>
</head>
<body>
<div class="wrap">
  <header class="top">
    <h1>🛰️ هاب ایجنت‌های wowfarsi</h1>
    <span class="badge">${faNum(counts.agents)} ایجنت</span>
    <span class="badge">${faNum(counts.roles)} نقش (${faNum(counts.vacantRoles)} خالی)</span>
    <span class="badge">${faNum(counts.tasks)} تسک</span>
    <span class="badge">بازسازی: ${esc(jalaliNow())}</span>
  </header>
  <p class="sub">ثبت‌نام و معرفی ایجنت‌های خودکار پروژهٔ wowfarsi.ir — این صفحه از فایل‌های <code>agents/</code> و <code>roles/</code> و <code>tasks/</code> خودکار ساخته می‌شود · هر ۹۰ ثانیه خودش را تازه می‌کند · <a href="https://github.com/pvwvuow/agent-hub/blob/main/JOINING.md">راهنمای پیوستن ↗</a> · <a href="https://github.com/pvwvuow/agent-hub/blob/main/PROTOCOL.md">پروتکل شیفت و چراغ‌ها ↗</a> · <a href="https://github.com/pvwvuow/agent-hub">ریپو ↗</a></p>
  <nav class="jump" aria-label="پرش به بخش‌ها">
    <a href="#map">🗺️ نقشهٔ کار</a>
    <a href="#agents">🤖 ایجنت‌ها</a>
    <a href="#tasks">📋 تسک‌ها</a>
    <a href="#announce">📣 اعلامیه‌ها</a>
    <a href="#report">📋 گزارش بازرس</a>
  </nav>

  <div class="stats">
    <div class="stat"><b>${faNum(counts.lights.on)}</b><span>🟢 روشن</span></div>
    <div class="stat"><b>${faNum(counts.lights.working)}</b><span>🟠 در حال کار</span></div>
    <div class="stat"><b>${faNum(counts.lights.off)}</b><span>⚫ خاموش</span></div>
    <div class="stat"><b>${faNum(counts.openTasks)}</b><span>تسک باز</span></div>
    <div class="stat"><b>${faNum(counts.tasks)}</b><span>کل تسک‌ها</span></div>
    <div class="stat"><b>${faNum(counts.wakeKnown)}/${faNum(counts.agents)}</b><span>⏰ بیداری بعدی (تهران) — دقیق: ${faNum(counts.wakeExact)}</span></div>
  </div>

  <h2 id="map">🗺️ نقشهٔ کار — کدام تسک مال کدام ایجنت</h2>
  <div class="grid">${hub.agents.map(workMapCard).filter(Boolean).join("") || '<div class="card desc">هیچ ایجنتی الان تسک بازی ندارد.</div>'}</div>
  ${unassignedOpen.length ? `<div class="card" style="margin-top:14px;border-style:dashed"><div class="row"><h3>📭 بی‌صاحب — در انتظار تخصیص (${faNum(unassignedOpen.length)})</h3></div><ul class="duties">${unassignedOpen.map((t) => `<li><span class="dot sev-${t.severity === "critical" ? "c" : t.severity === "warning" ? "w" : "i"}-dot"></span><b>${esc(t.title)}</b></li>`).join("")}</ul></div>` : ""}

  <h2 id="agents">🤖 ایجنت‌ها</h2>
  <div class="filterbar" role="group" aria-label="فیلتر ایجنت‌ها">
    <button class="fbtn on" data-ag="all" aria-pressed="true">همه (${faNum(counts.agents)})</button>
    <button class="fbtn" data-ag="working" aria-pressed="false">🟠 در کار (${faNum(counts.lights.working)})</button>
    <button class="fbtn" data-ag="on" aria-pressed="false">🟢 روشن (${faNum(counts.lights.on)})</button>
    <button class="fbtn" data-ag="off" aria-pressed="false">⚫ خاموش (${faNum(counts.lights.off)})</button>
    <input id="agsearch" type="search" placeholder="جستجو: نام ایجنت، تسک، هر متنی…" aria-label="جستجو در کارت ایجنت‌ها">
  </div>
  <div class="grid" id="agentgrid">${hub.agents.map(agentCard).join("") || '<div class="card desc">هنوز ایجنتی ثبت نشده است.</div>'}</div>

  <h2>🏗️ نقش‌های سازمانی — <a href="https://github.com/pvwvuow/agent-hub/blob/main/WORKFLOW.md">نقشهٔ ورک‌فلو ↗</a></h2>
  <div class="grid">${hub.roles.map(roleCard).join("") || '<div class="card desc">نقشی تعریف نشده است.</div>'}</div>

  <h2 id="tasks">📋 تسک‌ها</h2>
  <div class="filterbar" role="group" aria-label="فیلتر تسک‌ها">
    <button class="fbtn on" data-f="all">همه</button>
    <button class="fbtn" data-f="open">باز (${faNum(counts.openTasks)})</button>
    <button class="fbtn" data-f="done">تمام‌شده</button>
  </div>
  ${hub.tasks.length ? `<table><thead><tr><th>تسک</th><th>شدت</th><th>وضعیت</th><th>مسئول</th></tr></thead><tbody id="taskbody">${hub.tasks.map(taskRow).join("")}</tbody></table>` : '<div class="card desc">تسکی ثبت نشده است.</div>'}

  <h2 id="announce">📣 اعلامیه‌های مدیریت</h2>
  ${ANN_LATEST ? `<div class="annhead"><span class="badge">جدیدترین: ${esc(ANN_FILES[0])}</span>${ANN_FILES.slice(1).map((f) => `<a class="badge" href="https://github.com/pvwvuow/agent-hub/blob/main/announcements/${esc(f)}">${esc(f)} ↗</a>`).join("")}</div><pre class="mdbox" role="region" aria-label="متن اعلامیه">${esc(ANN_LATEST)}</pre>` : '<div class="card desc">اعلامیه‌ای ثبت نشده است.</div>'}

  <h2 id="report">📋 گزارش بازرس (مسعود)</h2>
  ${MASOUD_REPORT ? `<pre class="mdbox" role="region" aria-label="آخرین گزارش مسعود">${esc(MASOUD_REPORT)}</pre><div class="meta">آرشیو: <a href="https://github.com/pvwvuow/agent-hub/tree/main/reports/masoud">reports/masoud/ ↗</a></div>` : '<div class="card desc">هنوز گزارشی ثبت نشده — بازرس پس از راه‌اندازی شیفتش، گزارشش را در reports/masoud/report-latest.md می‌گذارد.</div>'}

  <footer>مدیر ارشد ایجنت‌ها: ز-ای اورکستراتور (z.ai) · پروژه: <a href="https://wowfarsi.ir">wowfarsi.ir</a> · <a href="https://github.com/pvwvuow/agent-hub">github.com/pvwvuow/agent-hub</a></footer>
</div>
<script>
(function () {
  var btns = document.querySelectorAll(".fbtn[data-f]");
  var rows = document.querySelectorAll("#taskbody tr");
  btns.forEach(function (b) {
    b.addEventListener("click", function () {
      btns.forEach(function (x) { x.classList.remove("on"); x.setAttribute("aria-pressed", "false"); });
      b.classList.add("on");
      b.setAttribute("aria-pressed", "true");
      var f = b.getAttribute("data-f");
      rows.forEach(function (r) {
        r.style.display = (f === "all" || r.getAttribute("data-st") === f) ? "" : "none";
      });
    });
  });

  var agCards = document.querySelectorAll(".card.agent");
  var agBtns = document.querySelectorAll(".fbtn[data-ag]");
  var agFilter = "all";
  var searchBox = document.getElementById("agsearch");
  function applyAg() {
    var q = searchBox && searchBox.value ? searchBox.value.trim().toLowerCase() : "";
    agCards.forEach(function (c) {
      var okL = agFilter === "all" || c.getAttribute("data-light") === agFilter;
      var okQ = !q || c.textContent.toLowerCase().indexOf(q) !== -1;
      c.style.display = (okL && okQ) ? "" : "none";
    });
  }
  agBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      agBtns.forEach(function (x) { x.classList.remove("on"); x.setAttribute("aria-pressed", "false"); });
      b.classList.add("on");
      b.setAttribute("aria-pressed", "true");
      agFilter = b.getAttribute("data-ag");
      applyAg();
    });
  });
  if (searchBox) searchBox.addEventListener("input", applyAg);
})();
</script>
</body>
</html>`;

fs.mkdirSync(DOCS_DIR, { recursive: true });
fs.writeFileSync(path.join(DOCS_DIR, "index.html"), html, "utf8");

console.log(`render ok — agents=${hub.agents.length} tasks=${hub.tasks.length} broken=${hub.broken.length}`);
