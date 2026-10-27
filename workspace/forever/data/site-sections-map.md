# نقشهٔ بخش‌های سایت برای پشتیبانی Forever (سهم z-ai-utility)

> تحویل‌پذیرِ tasks/forever-wow-data.json — وضعیت: **اسکلت**؛ پرکردن هر ردیف فقط با منبع در جلسه‌های بعد.
> منبع ساختار: tasks/forever-wow-data.json + announcements/2026-10-27-forever-workspace.md (دسترسی: ۲۰۲۶-۱۰-۲۷)

## جدول بخش‌ها

| # | بخش سایت | نیاز Forever | وابستگی داده | یادداشت تعارض (طبق تسک) | وضعیت بررسی |
|---|---|---|---|---|---|
| 1 | صفحهٔ تلنت‌ها | انتخابگر build: live / ptr / forever | دادهٔ تلنت build Forever (سهم apprentice: wowfa/data/forever/) | — | ⏳ |
| 2 | راهنماهای Retail | پوشش محتوای Forever | برچسب/دستهٔ تازه اخبار-راهنما | wow-retail مالک راهنماها | ⏳ |
| 3 | آیتم‌ها | آیتم‌های Forever | دادهٔ آیتم build تازه | item مالک آیتم‌ها | ⏳ |
| 4 | کوئست‌های ناحیه‌های تازه | کوئست‌های زون‌های Forever | فهرست زون‌ها + کوئست‌ها | quests-addon = harandar، flex = voidstorm | ⏳ |
| 5 | اخبار | برچسب خبری Forever | فید اخبار — نمونه‌های ثبت‌شده در background تسک: پچ 12.1.7 PTR، بتای Forever، تنظیمات نژادی (wowheadFA) | — | ⏳ |
| 6 | افزونهٔ WoWFA | جداسازی دادهٔ Forever از live | ساختار Data/ و Shape.lua | — | ⏳ |

## روش

- هر ردیف فقط با منبع پر شود (URL + تاریخ دسترسی)؛ منبعِ نیافتنی مستند شود، دادهٔ حدسی ممنوع (قانون تسک).
- کار موازی با apprentice روی یک فایل ممنوع — این فایل سهم من است؛ دادهٔ خام کلاس/تلنت سهم او.
- خروجی نهایی: سند docs/FOREVER_PLAN.md در wow یا wowfa (فقط شاخهٔ جدا + PR) + دادهٔ JSON/CSV در همین پوشه.

## به‌روزرسانی بیداری ۲۲:۳۸+08 (تکمیل با منابع تأییدشده)

- **زمینهٔ build تأیید شد** (منبع: اسنپ‌شات ویکیِ شریک — warcraft.wiki.gg، دسترسی ۲۰۲۶-۱۰-۲۷): Forever = خط Classic+ 1.x، build `1.60.1.70630` محصول `wowf` در wago.tools، انتشار جهانی **۲۰۲۶-۱۱-۰۴**، کدنام Camelot → ردیف ۱ (تلنت‌ها) انتخابگر سه‌گانهٔ live/ptr/forever لازم دارد و دادهٔ forever از سهم apprentice (wowfa/data/forever/) می‌آید.
- **ردیف ۵ (اخبار) — حقایق تأییدشده برای برچسب Forever:** تاریخ انتشار ۲۰۲۶-۱۱-۰۴ · نژاد جدید Skyborne (هر دو فرکشن) با Druid/Hunter/Rogue/Warrior + Mage/Alliance + Shaman/Horde · کمبوهای جدید نژاد-کلاس (Dwarf+Shaman، Human+Hunter، Gnome+Priest، Orc+Mage، Troll+Warlock، Undead+Paladin) · سیستم‌های Camping و Tradeskills · carryoverهای SoD.
- **ردیف ۴ (کوئست‌ها) — محتوای زون تازهٔ اعلام‌شده:** به‌روزرسانی ۱۹:۱۰ تهران با پارس کامل شریک — **۳۳ دنجن (۹ NEW) + ۳ رید (۲ NEW) + battleground Darkspear Islands** در forever-zones-dungeons.csv (ستون‌های type/name/location/level_range/is_new/source/access_date). دنجن‌های NEW: Hall of Thanes، Ruins of Lordaeron، Excavation Site Wetlands، City of Dalaran، The Drowned City، Krol'dok Stronghold، Alcaz Prison، Blackmaw Hold، Shaper's Terrace؛ ریدهای NEW: Barrow Deeps، Hyjal Summit (+ Onyxia's Lair قدیمی). رینج لول ریدها در منبع خالی — حدسی ممنوع. صفحات کوئست این ناحیه‌ها در سایت نیاز به دستهٔ Forever دارند.
- **ردیف ۶ (WoWFA):** تحلیل انجام شد — wowfa-compat.md نسخهٔ ۰.۲ (ساختار Data/، Shape.lua در واقع ری‌شیپر متن است نه داده، TOC تک‌Interface 120105، بدون GetBuildInfo). طرح جداسازی ۵ نکته‌ای آمادهٔ PR.
- ~~جدول زون‌ها/رید: بخش «December 9: Raids» در ویکی‌تکست شریک هنوز پارس نشده~~ ✅ شریک پارس کرد (dungeons-raids-parsed.json — ۳ رید) و CSV من به‌روز شد.
