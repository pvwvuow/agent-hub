# GAP.md — تفاوت‌های WoW Forever نسبت به Classic (نسخهٔ اولیه)

> تولید خودکار از داده‌های جمع‌آوری‌شده · آخرین تولید: 2026-10-27 15:00 UTC
> منابع: warcraft.wiki.gg (صفحات abilities/talents هر ۹ کلاس + صفحهٔ اصلی Forever + Template:Forever_class_by_race) — تاریخ دسترسی داخل فایل‌های JSON
> Build مرجع: wowf **1.60.1.70630** (wago.tools) — بازی: World of Warcraft: Forever (Classic+، کدنام Camelot، انتشار جهانی ۲۰۲۶-۱۱-۰۴)

## ۱) خلاصهٔ آماری abilities/talents (۹ کلاس)

| کلاس | اسپک‌ها | Abilities | از آن mark=Forever | Talents | از آن mark=Forever |
|---|---|---|---|---|---|
| druid | 3 | 51 | 35 | 52 | 35 |
| hunter | 4 | 50 | 28 | 50 | 29 |
| mage | 4 | 50 | 20 | 55 | 46 |
| paladin | 4 | 49 | 33 | 50 | 33 |
| priest | 4 | 44 | 27 | 52 | 41 |
| rogue | 5 | 49 | 28 | 53 | 40 |
| shaman | 4 | 50 | 31 | 50 | 35 |
| warlock | 3 | 44 | 28 | 52 | 33 |
| warrior | 4 | 36 | 23 | 53 | 38 |
| **جمع** | — | **423** | **253** | **467** | **330** |

**تفسیر mark:** `Forever` = قابلیت/تلنت جدید یا آپدیت‌شدهٔ نسبت به Classic؛ `Classic` = بدون تغییر. لیست کامل با جزئیات (سطح، منبع، tier، rank) در `abilities-parsed.json`.

**نکتهٔ اسپک‌ها:** نام‌گذاری اسپک در Forever از جدول‌های وکی — druid: Balance / Feral Combat / Restoration؛ hunter: Beast Mastery / Marksmanship / Survival / (چهارم؟) — نام‌های دقیق در abilities-parsed.json. rogue ۵ اسپک و warlock ۳ اسپک دارد (برخلاف live) — برای صفحهٔ تلنت‌های سایت باید نقشهٔ اسپک Forever جدا از live رندر شود.

## ۲) کمبوی جدید نژاد-کلاس (فقط در Forever)

| نژاد (فراکشن) | کلاس‌های جدید ⚠️=محدود فراکشن |
|---|---|
| Dwarf (Alliance) | Shaman |
| Gnome (Alliance) | Priest |
| Human (Alliance) | Hunter |
| Skyborne (Both) | Druid, Hunter, Mage ⚠️Alliance, Rogue, Shaman ⚠️Horde, Warrior |
| Orc (Horde) | Mage |
| Troll (Horde) | Warlock |
| Undead (Horde) | Paladin |

+ نژاد جدید **Skyborne (هر دو فراکشن)** با Druid/Hunter/Rogue/Warrior + Mage (Alliance) + Shaman (Horde) — همه فقط-Forever.
منبع: Template:Forever_class_by_race — ساختار کامل در `wowf-classes-by-race.json`.

## ۳) دنجن‌های NEW (از صفحهٔ اصلی Forever)

- Krol'dok Stronghold

## ۴) سیستم‌های جدید اعلام‌شده (خلاصهٔ صفحهٔ اصلی)

- **Camping** (اردوگاه) و **Tradeskills** بازطراحی‌شده
- **Dual Talent Specialization** از سطح ۴۰ (۱۰ قطعه) + هزینهٔ respec کاهش‌یابنده
- carryoverهای Season of Discovery (Cozy Sleeping Bag، Chronoboon Displacer، Library books، Comprehension scrolls)
- Race/class combinationهای جدید (بخش ۲)

## ۵) کار باقی‌مانده (TODO)

- [ ] استت‌ها — منبع: صفحات زره وکی یا wago (endpoint نامعلوم؛ headless browser محتمل)
- [ ] cross-check عددی تلنت‌ها با wago.tools (اگر endpoint پیدا شد)
- [ ] hero talents — اگر در Forever وجود داشته باشد (تا الان در صفحات وکی دیده نشد؛ «نیافتنی» موقتاً ثبت می‌شود)
- [ ] شاخهٔ `forever` در wowfa + ساختار data/forever + PR اول
- [ ] تحویل نهایی: نسخهٔ نهایی این سند در wowfa/data/forever/GAP.md با PR

> ⚠️ دادهٔ حدسی ممنوع است (قانون تسک) — هر ردیف به منبع JSON مربوطه ارجاع دارد.
