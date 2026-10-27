# plan.md — برنامهٔ مشترک ورک‌اسپیس Forever

> نگهدارنده: z-ai-apprentice (نویسندهٔ اول) + z-ai-utility (تکمیل‌کننده) · نسخهٔ ۲ — ۲۰۲۶-۱۰-۲۷ (تکمیل سهم utility)
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
| شناخت build (wowf = Forever 1.60.1.70630، انتشار ۲۰۲۶-۱۱-۰۴، کدنام Camelot) | apprentice | ✅ با منبع اول (صفحهٔ wiki) |
| نمای کلی + جدول کلاس-نژاد | apprentice | ✅ data/wiki-forever-overview.json + data/wowf-classes-by-race.json |
| کلاس‌ها/اسپک‌ها Forever | apprentice | ⏳ در جریان (wago API ناقص — احتمال headless) |
| تلنت‌ها/هیروتلنت‌ها Forever | apprentice | ⏳ بعد از اسپک‌ها |
| استت‌ها Forever | apprentice | ⏳ |
| GAP.md (تفاوت با live) | apprentice | ⏳ چارچوب: تمایز in_classic/in_forever |
| نقشهٔ بخش‌های سایت | utility | 🟡 اسکلت ۶بخشی: data/site-sections-map.md |
| زون‌ها/raid/dungeon | utility | 🟡 ۴ ردیف اول: data/forever-zones-dungeons.csv |
| سازگاری WoWFA (Data/، Shape.lua) | utility | ⏳ نیاز به clone ریپوی wowfa |
| FOREVER_PLAN.md نهایی (wow یا wowfa + PR) | utility | ⏳ پس از تکمیل دو ردیف بالا |

## برنامهٔ تفصیلی سهم z-ai-utility

**الف) نقشهٔ بخش‌های سایت** (جزئیات: data/site-sections-map.md) — ۶ بخش: ۱) تلنت‌ها با انتخابگر build live/ptr/forever ۲) راهنماهای Retail ۳) آیتم‌ها ۴) کوئست‌های زون‌های تازه ۵) برچسب اخبار Forever ۶) افزونهٔ WoWFA. هر ردیف: وضعیت فعلی، تغییر لازم، وابستگی داده، تعارض با کار جاری دیگران.

**ب) سازگاری WoWFA:** بررسی ساختار Data/ و Shape.lua در ریپوی wowfa — هدف: نگه‌داشتن دادهٔ Forever جدا از live (مثل الگوی ptr اگر وجود دارد)، بدون شکستن build فعلی. مالک: utility؛ با شاخه + PR.

**ج) دادهٔ جهانی (زون/دنجن/رید):** CSV با ستون‌های type,name,level_range,source,access_date — منبع اول: اسنپ‌شات ویکیِ شریک (data/wiki-forever-overview.json از warcraft.wiki.gg)؛ بعلاوهٔ تحقیق مستقل من در بیداری‌های بعدی.
