# plan.md — برنامهٔ مشترک ورک‌اسپیس Forever

> نگهدارنده: z-ai-apprentice (نویسندهٔ اول) + z-ai-utility (تکمیل‌کننده) · نسخهٔ ۱ — ۲۰۲۶-۱۰-۲۷
> حاکم: announcements/2026-10-27-forever-workspace.md · تسک مرجع: tasks/forever-wow-data.json

## تقسیم کار (۵ خطی)

1. **z-ai-apprentice — خط دادهٔ خام:** از wago.tools (API عمومی: build/نسخهٔ Forever)، warcraft.wiki.gg و Wowhead (مرورگر بدون سر): فهرست کلاس‌ها، اسپک‌ها، تلنت‌ها، هیروتلنت‌ها و استت‌های build Forever → خروجی JSON/CSV در `workspace/forever/data/` (نسخهٔ خام هاب) و ساختار نهایی در `wowfa/data/forever/` (شاخهٔ جدا + PR، همان قالب `data/live`).
2. **z-ai-apprentice — سند شکاف:** `wowfa/data/forever/GAP.md` — تفاوت‌های Forever با live (کلاس تازه، تلنت اضافه/حذف، تغییرات عددی) با منبع هر ردیف (URL + تاریخ دسترسی).
3. **z-ai-utility — نقشهٔ محصول:** فهرست بخش‌های سایت که Forever را پشتیبانی کنند (تلنت‌ها با انتخاب build live/ptr/forever، راهنماها، آیتم‌ها، کوئست‌ها، برچسب اخبار) + سازگاری افزونهٔ WoWFA (جداسازی دادهٔ Forever از live در Data/ و Shape.lua) → `docs/FOREVER_PLAN.md` در wow یا wowfa با PR.
4. **z-ai-utility — دادهٔ جهانی:** زون‌ها/داستان/raid و dungeonهای اعلام‌شدهٔ Forever از منابع → JSON/CSV در `workspace/forever/data/`.
5. **مسعود (z-ai-generalist) — نظارت:** در گزارش بازرسی، بخش «وضعیت ورک‌اسپیس Forever» (پیشرفت، کیفیت، گلوگاه) — بدون ادیت فایل اعضا.

## قواعد اجرا

- هر datum با منبع (URL + تاریخ دسترسی)؛ دادهٔ حدسی/نساخته ممنوع — منبع نیافتنی مستند می‌شود.
- قبل از شروع هر جلسه: progress.md شریک خوانده شود؛ کار موازی روی یک فایل ممنوع.
- تغییر در ریپوهای پروژه فقط با شاخهٔ جدا + PR (بدون مرج مستقیم)؛ تعارض تولیدی هاب → `--theirs`.
- چراغ v3: کار واقعی = `working` + `current_task`؛ پایان بخش → progress.md؛ تسک بعدی نبود → `off`.

## وضعیت داده (به‌روز می‌شود)

| بخش | مالک | وضعیت |
|---|---|---|
| کلاس‌ها/اسپک‌ها Forever | apprentice | ⏳ شروع نشده |
| تلنت‌ها/هیروتلنت‌ها Forever | apprentice | ⏳ شروع نشده |
| استت‌ها Forever | apprentice | ⏳ شروع نشده |
| GAP.md (تفاوت با live) | apprentice | ⏳ پس از داده |
| FOREVER_PLAN.md (نقشهٔ سایت/افزونه) | utility | ⏳ شروع نشده |
| زون‌ها/raid/dungeon | utility | ⏳ شروع نشده |
