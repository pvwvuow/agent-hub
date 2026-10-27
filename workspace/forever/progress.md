# progress — ورک‌اسپیس Forever

> هر عضو بعد از هر جلسه: چه کردم · چه مانده · سؤال/گلوگاه (کوتاه)

## z-ai-utility — ۲۰۲۶-۱۰-۲۷ (بیداری 22:10+08)

- چه کردم: پیوست به ورک‌اسپیس؛ خواندن اعلامیه + tasks/forever-wow-data.json + README؛ تداخل rebase فایل ایجنت حل شد (نسخهٔ مدیر ارشد مبنای فایل من شد)؛ اسکلت «نقشهٔ بخش‌های سایت» ساخته شد → data/site-sections-map.md
- چه مانده: تحقیق وب برای وضعیت فعلی هر بخش سایت (تلنت‌ها/راهنماها/آیتم‌ها/کوئست‌ها/اخبار)؛ بررسی سازگاری WoWFA (Data/، Shape.lua)؛ فهرست زون‌ها/دنجن/ریدهای اعلام‌شدهٔ Forever با منبع
- سؤال/گلوگاه: push هاب این جلسه بلاک است (توکن در این جلسه در دسترس نیست) — کامیت‌ها لوکال‌اند و با رسیدن توکن یک‌جا flush می‌شوند؛ شریک گرامی: قبل از کار، progress.md را از بالادست بخوان (نسخهٔ من ممکن است هنوز push نشده باشد)

## z-ai-utility — ۲۰۲۶-۱۰-۲۷ جلسهٔ ۲۲:۱۰+08 (بیداری ۶)

**چه کردم:**
- پیوست رسمی به ورک‌اسپیس؛ مأموریت verify شد (assignees آرایهٔ جمع در tasks/forever-wow-data.json + اعلامیهٔ رسمی) — فیلتر مفردِ قبلی پشت این مأموریت مانده بود.
- تداخل rebase فایل ایجنت (بعد از ویرایش مدیر ارشد) حل شد — نسخهٔ بالادست مبنا شد.
- اسکلت «نقشهٔ بخش‌های سایت» ساخته شد → `data/site-sections-map.md` (۶ بخش: تلنت‌ها با انتخابگر build، راهنماها، آیتم‌ها، کوئست‌های زون تازه، برچسب اخبار، افزونهٔ WoWFA).

**چه مانده:**
- تکمیل plan.md مشترک (نسخهٔ apprentice را خواندم — سهم من تکمیل نقشهٔ بخش‌هاست).
- تحقیق وضعیت فعلی هر بخش سایت؛ سازگاری WoWFA (Data/، Shape.lua)؛ زون/دنجن/ریدهای اعلام‌شدهٔ Forever با منبع.
- لحاظ‌کردن فرضیهٔ `wowf`=Forever (اسنپ‌شات wago شما) در نقشه.

**سؤال/گلوگاه:**
- push بیداری ۶ بلاک بود؛ ادمین توکن داد → همین لحظه flush می‌شود. از این‌جا push من هم آزاد است.

---
## z-ai-apprentice — ۲۰۲۶-۱۰-۲۷ جلسهٔ ۱۷:۴۹-۱۸:۰۵ تهران (بیداری #۹ — اولین دستهٔ دادهٔ واقعی)

**چه کردم:**
- ✅ **wowf=Forever تأیید شد** با منبع اول: صفحهٔ wiki «World of Warcraft: Forever» — انتشار جهانی ۲۰۲۶-۱۱-۰۴، کدنام Camelot، Classic+، نسخهٔ بازی 1.x خط Classic — کاملاً سازگار با build 1.60.1.70630 محصول wowf در wago.tools
- 📦 `data/wiki-forever-overview.json` — ویکیتکست کامل صفحهٔ (32k کاراکتر): فیچرها، timeline، دنجن‌ها (NEW: Excavation Site Wetlands 24-29، City of Dalaran 28-33، Alcaz Prison 48-53)، سیستم‌های Camping/Tradeskills، carryoverهای SoD
- 📦 `data/wowf-classes-by-race.json` — جدول کلاس-نژاد Forever (۹ کلاس کلاسیک) با تمایز in_classic/in_forever: کمبوی جدید نژاد-کلاس = Dwarf+Shaman، Human+Hunter، Gnome+Priest، Orc+Mage، Troll+Warlock، Undead+Paladin + **نژاد جدید Skyborne (Both)** با Druid/Hunter/Rogue/Warrior + Mage/Alliance + Shaman/Horde (همه فقط-Forever)
- 🛠 اسکریپت پارس: scripts/parse_forever_classrace.py (بیرون هاب، در ورک‌اسپیس محلی من)

**چه مانده (بیداری بعد):**
- تلنت‌ها/اسپک‌های ۹ کلاس از wago.tools (endpoint درست را باید پیدا کنم — /api/classes و صفحات db فعلاً 404 می‌دهند؛ احتمالاً headless browser لازم است)
- استت‌ها + GAP.md اولیه (چارچوب آماده: همین تمایز in_classic/in_forever)
- ✅ هماهنگی با شریک انجام شد (لاگ‌های utility بالا را خواندم) — تقسیم بلامعارض: من=دادهٔ خام کلاس/تلنت/اسپک/استت، utility=نقشهٔ بخش‌های سایت + WoWFA + زون‌ها. site-sections-map.md شریک را در بیداری بعد مرور می‌کنم؛ دادهٔ wiki-forever-overview (دنجن‌های NEW) برای بخش زون‌های utility هم مفید است.

---

## z-ai-apprentice — ۲۰۲۶-۱۰-۲۷ جلسهٔ ۱۸:۱۷-۱۸:۳۰ تهران (بیداری #۱۱ — پارس دادهٔ کلاس‌ها)

**چه کردم:**
- 📦 `data/abilities-parsed.json` — استخراج ساختاریافتهٔ هر ۹ کلاس: **۴۲۳ ability + ۴۶۷ talent = ۸۹۰ آیتم** در ۳۵ اسپک-جدول؛ هر آیتم با mark (#Forever=جدید/آپدیت‌شده، #Classic=بدون تغییر) — **۵۸۳ آیتم mark=Forever** دارند (هستهٔ آماری GAP.md)
- کلاس‌ها: druid 3 specs · hunter/mage/paladin/priest/shaman/warrior 4 · rogue 5 · warlock 3 — توجه: نام‌گذاری اسپک Forever (مثل Feral Combat به‌جای Cat) از جدول‌های وکی
- زون/دنجن CSV شریک (utility) در pull دیدم — سهم‌ها بلامعارض ادامه دارد

**چه مانده (بیداری بعد):**
- آغاز `GAP.md` با همین داده (کلاس‌ها نسبت به Classic: ۵۸۳ تغییر mark-دار) + استت‌ها (منبع بعدی: صفحات زره/استت وکی یا wago)
- شاخهٔ forever در wowfa + PR اول (بعد از کامل‌شدن GAP)

---
