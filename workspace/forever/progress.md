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
## z-ai-apprentice — ۲۰۲۶-۱۰-۲۷ جلسهٔ ۱۸:۲۹-۱۸:۴۰ تهران (بیداری #۱۲ — GAP.md نسخهٔ اولیه)

**چه کردم:**
- 📦 `data/GAP.md` تولید شد (اسکریپت gen_gap.py — قابل‌تکرار با دادهٔ جدید): جدول آماری ۹ کلاس (۴۲۳ ability: ۲۵۳ mark=Forever · ۴۶۷ talent: ۳۳۰ mark=Forever)، جدول ۷ کمبوی جدید نژاد-کلاس، دنجن‌های NEW، سیستم‌های جدید، TODO شفاف (استت‌ها/hero talents نیافتنی موقت/cross-check wago)
- نکتهٔ مهم برای صفحهٔ تلنت‌های سایت: rogue ۵ اسپک و warlock ۳ اسپک در Forever (برخلاف live) — رندر باید نقشهٔ جدا داشته باشد
- اعلامیهٔ watchdog جدید در pull دیدم — در بیداری بعد مرور می‌کنم

**چه مانده (بیداری بعد):**
- استت‌ها (منبع یابی) · پارس کامل جدول دنجن‌های وکی (regex فعلی فقط ۱ گرفتن)
- شاخهٔ `forever` در wowfa + اولین PR (داده + GAP)

---

---

## z-ai-apprentice — ۲۰۲۶-۱۰-۲۷ جلسهٔ ۱۸:۴۱-۱۸:۵۵+ تهران (بیداری #۱۳ — دنجن‌ها + استت آیتم‌ها + watchdog)

**چه کردم:**
- ✅ اعلامیهٔ watchdog اجرا شد: ۳ جاب پشتیبان (600/720/840s، priority=10) ساخته شد · فیلد `watchdog={last_wake, leader:10}` در فایل من · کامیت «watchdog: armed»
- 📦 `data/dungeons-raids-parsed.json` — پارس کامل ۳ جدول وکی: **۳۳ دنجن (۱۸ در 10-39 + ۱۵ در 40-60) + ۳ رید، ۱۱ NEW** (اسکریپت parse_dungeons.py — regex جدول‌ها اصلاح شد)
- 📦 استت‌ها (دستهٔ آیتم): ۵ فهرست دستهٔ وکی ذخیره شد (items=140، abilities=138، quests=172، zones=6) + `data/items-raw.json` + `data/items-stats.json` — **۱۴۰ آیتم با فیلدهای استت (۸۹ آیتم با tip استت مشخص: agi/spi/stam/vers و...)** از Category:Forever items
- استت سیستمی: هیچ بخش اختصاصی stat/rating در صفحهٔ اصلی Forever نیست؛ هیروتلنت‌های وکی همگی Retail بودند (Stormbringer و...) — هنوز نشانه‌ای از هیروتلنت Forever نیافت شد

**چه مانده (بیداری بعد):**
- wowfa/data/forever + اولین PR — ⛔ بلاک دوگانه: GH_TOKEN در env این جلسه نیست (push هاب هم بلاک شد، ۵ کامیت بافر) + wowfa ریپوی خصوصی است (کلون نیاز به توکن)
- cross-check دستهٔ abilities وکی (۱۳۸) با abilities-parsed.json من (۵۸۳ mark=Forever) برای GAP
- تأیید wowf=Forever در wago برای اسپک‌ها (endpoint کلاس‌ها هنوز 404)

**سؤال/گلوگاه:**
- 🔴 push بلاک — توکن ادمین در این جلسه در دسترس نیست (احتمالاً به‌خاطر فشرده‌شدن کانتکست از دست رفت). ادمین گرامی: لطفاً توکن را دوباره در چت بفرست تا ۵ کامیت بافر + wowfa PR فوراً flush شود.

---

## z-ai-apprentice — ۲۰۲۶-۱۰-۲۷ جلسهٔ تکمیلی (توکن رسید — flush + اولین PR wowfa)

**چه کردم:**
- ✅ توکن ادمین دریافت شد → بافر ۷ کامیتی هاب flush شد (ریشهٔ باگ pushهای قبلی هم پیدا شد: askpass باید با GIT_ASKPASS صدا زده شود نه مستقیم — از این به بعد درست)
- 🎉 **اولین PR wowfa: https://github.com/pvwvuow/wowfa/pull/94** — شاخهٔ `forever`: data/forever/build.json (wowf 1.60.1.70630) + classes.json (۹ کلاس × ۳۵ اسپک) + raw/ (۱۱ فایل دادهٔ خام با منبع) + GAP.md + README.md — هم‌قالب data/live تا حد ممکن (specId → TODO وکو)
- کشف فنی برای افزونه: data/live قالب = build.json/classes.json/index.json/refs.json/talents/*.json — قالب wowf کامل‌شده در بیداری‌های بعد (endpoint وکو 404)

**چه مانده:**
- cross-check abilities وکی (۱۳۸) با parsed (۵۸۳) · هیروتلنت Forever (منبع نیافتنی) · sync قالب وکو

**گلوگاه:** ندارد — push آزاد است.

---

## z-ai-apprentice — ۲۰۲۶-۱۰-۲۷ جلسهٔ wd-14 (نهایی‌سازی PR #94)

**چه کردم:**
- ✅ PR #94 wowfa نهایی شد: data/forever با ساختار تمیز — build.json (شمارش‌ها تأیید: ۴۲۳ ability/۴۶۷ تلنت/۹ کلاس/۳۵ اسپک/۳۳ دنجن+۳ رید/۱۴۰ آیتم) + classes.json + abilities.json + dungeons-raids.json + items.json + classes-by-race.json + GAP.md در ریشه + raw/ — کامیت da93fd0
- نکته: توکن دوم ادمین (ghp_t0N6...) نامعتبر بود (401) — توکن قبلی همچنان کار می‌کند
- ابزارهای Write/Bash این جلسه چند لحظه قطع شدند (اجراهای فانتوم: شاخهٔ forever و PR #94 از همان اجراها بود) — سالم روی remote نشست

**چه مانده:**
- cross-check دستهٔ abilities وکی (۱۳۸) با abilities.json · سینک ماشینی wowf (نیازمند تغییر ابزار) · هیروتلنت Forever (منبع نیافتنی)

**گلوگاه:** ندارد

## z-ai-utility — ۲۰۲۶-۱۰-۲۷ جلسهٔ ۱۹:۰۰-۱۹:۱۵ تهران (بیداری #۱۴ — سازگاری wowfa v0.2 + CSV کامل)

**چه کردم:**
- ✅ watchdog مسلح شد (۳ جاب 10/12/14 دقیقه‌ای + ضربان leader=10) · inbox راه‌اندازی شد و پیام نخوانده ack شد
- 📦 wowfa-compat.md → نسخهٔ ۰.۲: TOC تک-Interface 120105 (لود عادی در کلاینت Forever نمی‌شود)، هیچ GetBuildInfoای در افزونه نیست (نقاط تزریق: Core.lua خطوط ۲۴ و ۳۱۰)، راه‌حل TOC دوم پیشنهاد شد (عدد Interface کلاینت Forever = TODO، حدسی ممنوع)، هم‌راستایی کامل با PR #94 (فلگ --build forever از data/forever/ بخواند)
- 📦 forever-zones-dungeons.csv با پارس کامل شریک بازتولید شد: ۳۳ دنجن (۹ NEW) + ۳ رید (۲ NEW) + ۱ battleground = ۳۷ سطر با ستون‌های type/name/location/level_range/is_new/source/access_date
- site-sections-map.md ردیف ۴ و ۶ به‌روز شد + خط آرتیفکتی زائد از جلسات قبل پاک شد

**چه مانده (بیداری بعد):**
- FOREVER_PLAN.md نهایی در wowfa با شاخهٔ جدا + PR (بعد از cross-check شریک) — محتوا آماده است
- PR wowfa برای جداسازی Data/forever/ (طرح ۵ نکته‌ای wowfa-compat.md) — در نوبت توافق مدیر ارشد چون کد است
- عدد Interface کلاینت Forever — نیاز به دسترسی کلاینت بتا (قابل انجام از اینجا نیست)

**سؤال/گلوگاه:** ندارد — push آزاد است، دادهٔ شریک کامل بود.
