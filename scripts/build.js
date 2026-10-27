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

const STATUS_FA = { active: "فعال", paused: "مکث‌شده", retired: "بازنشسته" };
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
for (const a of agents) a.__stale = !a.last_seen || isNaN(Date.parse(a.last_seen)) || Date.now() - Date.parse(a.last_seen) > STALE_MS;

const validAgents = agents.filter((a) => !a.__broken);
const validRoles = roles.filter((r) => !r.__broken);
const counts = {
  agents: validAgents.length,
  active: validAgents.filter((a) => a.status === "active" && !a.__stale).length,
  stale: validAgents.filter((a) => a.__stale).length,
  tasks: tasks.filter((t) => !t.__broken).length,
  openTasks: tasks.filter((t) => !t.__broken && ["open", "assigned", "in-progress"].includes(t.status)).length,
  roles: validRoles.length,
  vacantRoles: validRoles.filter((r) => ["vacant", "applied"].includes(r.status)).length,
  generatedAt: now,
};

/* ── README ────────────────────────────────────────────────────── */
let md = "";
md += `> ساخته‌شده در: ${jalaliNow()} (تهران) — اکشن خودکار render-hub\n\n`;
md += `## 🤖 ایجنت‌های ثبت‌شده (${faNum(counts.agents)}) — ${dot("active")} فعال: ${faNum(counts.active)} · بی‌نشانه: ${faNum(counts.stale)}\n\n`;
if (validAgents.length) {
  md += "| ایجنت | نقش | پلتفرم | وضعیت | فعالیت اخیر | تسک‌های زمان‌دار |\n|---|---|---|---|---|---|\n";
  for (const a of validAgents) {
    const name = a.name || a.id || a.__file;
    const role = ROLE_FA[a.role] || a.role || "—";
    const st = `${dot(a.status)} ${STATUS_FA[a.status] || a.status || "—"}${a.__stale ? " ⚠️ بی‌نشانه" : ""}`;
    const seen = a.last_seen ? relTime(a.last_seen) : "—";
    const tl = Array.isArray(a.tasks) && a.tasks.length
      ? a.tasks.map((t) => `${t?.name || "؟"} — ${humanSchedule(t?.schedule)}`).join("، ")
      : "—";
    md += `| **${name}** | ${role} | ${a.platform || "—"} | ${st} | ${seen} | ${tl} |\n`;
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
md += `\n_شرح کامل نقش‌ها: [roles/](roles/) · مسیر پیوستن: [JOINING.md](JOINING.md) · نقشهٔ کار: [WORKFLOW.md](WORKFLOW.md)_\n`;

const openTasks = tasks.filter((t) => !t.__broken);
md += `\n## 📋 تسک‌ها (${faNum(counts.tasks)}) — باز: ${faNum(counts.openTasks)}\n\n`;
if (openTasks.length) {
  md += "| تسک | شدت | وضعیت | مسئول | شواهد/برنامه |\n|---|---|---|---|---|\n";
  for (const t of openTasks) {
    const title = t.title || t.id || t.__file;
    const sev = SEV_FA[t.severity] ? `${t.severity === "critical" ? "🔴" : t.severity === "warning" ? "🟠" : "🔵"} ${SEV_FA[t.severity]}` : "—";
    const st = TASK_STATUS_FA[t.status] || t.status || "—";
    md += `| **${title}** | ${sev} | ${st} | ${t.assignee || "—"} | ${String(t.evidence || "").slice(0, 180)} |\n`;
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
    lastSeen: a.last_seen || null,
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
  const stCls = a.status === "active" && !a.stale ? "st-active" : a.status === "paused" ? "st-paused" : "st-off";
  const stTxt = `${STATUS_FA[a.status] || a.status || "نامشخص"}${a.stale ? " · بی‌نشانه ⚠️" : ""}`;
  const tasksHtml = (a.tasks || []).map((t) => `
      <li><span class="t-name">${esc(t.name)}</span><span class="t-sched">${esc(t.scheduleText || "")}</span>${t.description ? `<span class="t-desc">${esc(t.description)}</span>` : ""}</li>`).join("");
  return `
    <div class="card agent">
      <div class="row"><span class="dot ${stCls}"></span>
        <h3>${esc(a.name)}${a.role === "manager" ? ' <span class="badge mgr">👑 مدیر ارشد</span>' : ""}</h3>
        <span class="badge">${esc(a.id || "—")}</span>
        <span class="badge">${esc(a.platform || "—")}</span>
        <span class="badge ${stCls}">${esc(stTxt)}</span></div>
      ${a.description ? `<p class="desc">${esc(a.description)}</p>` : ""}
      <ul class="tasks">${tasksHtml || '<li class="t-desc">تسک زمان‌داری ثبت نشده</li>'}</ul>
      <div class="meta">فعالیت اخیر: ${esc(a.lastSeen ? relTime(a.lastSeen) : "—")} · مالک: ${esc(a.owner || "—")}</div>
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
  return `
    <tr>
      <td><b>${esc(t.title)}</b>${t.evidence ? `<div class="t-desc">${esc(String(t.evidence).slice(0, 240))}</div>` : ""}</td>
      <td><span class="badge ${sevCls}">${esc(SEV_FA[t.severity] || t.severity || "—")}</span></td>
      <td><span class="badge">${esc(TASK_STATUS_FA[t.status] || t.status || "—")}</span></td>
      <td>${esc(t.assignee || "—")}</td>
    </tr>`;
}

const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>هاب ایجنت‌های wowfarsi</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css">
<style>
  :root { --bg:#0b0906; --card:#151009; --line:#c8aa6e26; --gold:#c8aa6e; --txt:#f0e6d2; --dim:#9c8f70; }
  * { box-sizing:border-box; }
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
  .st-paused { background:#facc15; }
  .st-off { background:#6b7280; }
  .badge.st-active, .badge.st-paused, .badge.st-off { color:var(--txt); background:none; border:1px solid var(--line); }
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
  <p class="sub">ثبت‌نام و معرفی ایجنت‌های خودکار پروژهٔ wowfarsi.ir — این صفحه از فایل‌های <code>agents/</code> و <code>roles/</code> و <code>tasks/</code> خودکار ساخته می‌شود · <a href="https://github.com/pvwvuow/agent-hub/blob/main/JOINING.md">راهنمای پیوستن ایجنت‌ها ↗</a> · <a href="https://github.com/pvwvuow/agent-hub">ریپو ↗</a></p>

  <div class="stats">
    <div class="stat"><b>${faNum(counts.active)}</b><span>فعال</span></div>
    <div class="stat"><b>${faNum(counts.stale)}</b><span>بی‌نشانه (۲۴ ساعت+)</span></div>
    <div class="stat"><b>${faNum(counts.openTasks)}</b><span>تسک باز</span></div>
    <div class="stat"><b>${faNum(counts.tasks)}</b><span>کل تسک‌ها</span></div>
  </div>

  <h2>🤖 ایجنت‌ها</h2>
  <div class="grid">${hub.agents.map(agentCard).join("") || '<div class="card desc">هنوز ایجنتی ثبت نشده است.</div>'}</div>

  <h2>🏗️ نقش‌های سازمانی — <a href="https://github.com/pvwvuow/agent-hub/blob/main/WORKFLOW.md">نقشهٔ ورک‌فلو ↗</a></h2>
  <div class="grid">${hub.roles.map(roleCard).join("") || '<div class="card desc">نقشی تعریف نشده است.</div>'}</div>

  <h2>📋 تسک‌ها</h2>
  ${hub.tasks.length ? `<table><thead><tr><th>تسک</th><th>شدت</th><th>وضعیت</th><th>مسئول</th></tr></thead><tbody>${hub.tasks.map(taskRow).join("")}</tbody></table>` : '<div class="card desc">تسکی ثبت نشده است.</div>'}

  <footer>مدیر ارشد ایجنت‌ها: ز-ای اورکستراتور (z.ai) · پروژه: <a href="https://wowfarsi.ir">wowfarsi.ir</a> · <a href="https://github.com/pvwvuow/agent-hub">github.com/pvwvuow/agent-hub</a></footer>
</div>
</body>
</html>`;

fs.mkdirSync(DOCS_DIR, { recursive: true });
fs.writeFileSync(path.join(DOCS_DIR, "index.html"), html, "utf8");

console.log(`render ok — agents=${hub.agents.length} tasks=${hub.tasks.length} broken=${hub.broken.length}`);
