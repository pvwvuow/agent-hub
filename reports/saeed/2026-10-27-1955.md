# گزارش بازرسی — سعید (z-ai-generalist) — ۲۰۲۶-۱۰-۲۷ ۱۹:۵۵ تهران

> بیدارباش پشتیبان ۱۰ دقیقه‌ای مؤثر شد (زنجیرهٔ one_time چت قبلی سه بار شکسته بود) — takeover به‌عنوان leader=10، کامیت `d5926e9`. زنجیرهٔ اصلی نو: fixed_rate 600s (job 478024). اولین شیفت با وظایف QA جدید (announcements/2026-10-28-qa-workflow.md).

## چراغ‌ها (هنگام بازرسی ~۱۶:۲۰ UTC)

| ایجنت | چراغ | آخرین دیده‌شدن | تسک جاری |
|---|---|---|---|
| z-ai-main | 🟢 on | 16:12 (watchdog) | زنجیرهٔ ۵ دقیقه‌ای زنده — بیدارباش‌های ۱۲/۱۴ دقیقه‌اش زائد |
| z-ai-flex | ⚫ off | 16:15 | — (طبق v2 سالم) |
| z-ai-utility | ⚫ off | 16:10 | — |
| z-ai-apprentice | 🟠 working | 15:40 | forever-wow-data — last_seen ~۴۵ دقیقه کهنه |
| z-ai-quests-addon | 🟢 working | 16:02 | wowfa-wave-quest-backfill-2 |
| z-ai-item (غلام) | ⚫ off | 16:03 | — |
| z-ai-wow-retail | ⚫ off | 16:18 | دو شاخهٔ site/* تحویل داد و خاموش شد |
| سعید (من) | 🟠 working → ⚫ | 16:25 | این شیفت |

⚠️ `z-ai-apprentice`: working با last_seen کهنه — اگر در بیداری بعدی هم همین بود، مدیر ارشد بررسی کند.

## بازبینی QA — ۵ تسک done در ۲۴ ساعت اخیر

| تسک | مجری | حکم |
|---|---|---|
| item-lang-wave1 | z-ai-item | ✅ اسکنر exit 0؛ strict فقط 3 یافته = همان 1 مورد موجه مستند (#268248) |
| quest-backfill-harandar | z-ai-quests-addon | ✅ ۱۸ ردیف desc در هیچ منبعی متن ندارند — not found مستند با fetch تازه؛ PR موضوعیت نداشت |
| quest-backfill-voidstorm | z-ai-flex | ✅ راستی‌آزمایی مستقل روی main=108b6b2: 307/307 done، ready=0 |
| sitemap-guides-dropped-by-news-rebuild | — | ✅ PR #56 merged؛ خروجی build بایت‌به‌بایت با sitemap فعلی یکسان |
| review-held-news-21 | z-ai-flex (تخصیص مجدد) | ✅ طبق ثبت مدیر ارشد — من برگشتم ولی کار معلق نمانده؛ در تخصیص بعدی لحاظ شود |

هیچ تسکی نیازمند فیکس نبود → پیام فیکس به کسی نمی‌دهم.

## PRها و مخازن

- **wow / PR #57 (open)** — فیکس ریشهٔ regression نقشهٔ سایت: مسیر `data/seo/keywords.json` (ناموجود) → `data/retail/seo/keywords.json` (۴۰ کلید). راستی‌آزمایی من: مسیر قدیمی نیست، مسیر جدید ۴۰ راهنما دارد، index ۱۳ هاب دارد → ۵۳ URL کامل. **تأیید فنی: سعید — آمادهٔ merge (تصمیم با مدیر ارشد).** پیام inbox high شد.
- regression واقعاً تکرار شد: rebuild اخبار `f28359f9` (16:09) باز ۴۰ اسپک را انداخت؛ بات دوبار دستی ترمیم کرد (16:00، 16:16). تا merge شدن #57 هر rebuild دست‌خورده می‌ماند.
- **wow / شاخه‌های site/*** — `site/nav-status-cleanup` (پاکسازی ناوبری، ادغام کوئست‌ها در status، لوگوهای اکسپنشن) و `site/class-menu-addon` (ناوبری مشترک BASE-aware) از z-ai-wow-retail؛ هنوز PR باز نکرده‌اند → بعد از PR بازبینی فنی می‌کنم.
- **wowheadFA** — فقط چرخهٔ منظم بات (fetch/auto-publish/rebuild تا 16:08). نکتهٔ ساختاری نیست.
- **wowfa** — شاخهٔ `forever` خیلی فعال: دیتاست‌های کانونیک ریشه + abilities cross-check (91/128) + db2 sync با wago CSV + GAP TODO. تسک `forever-wow-data` هنوز open → **هنوز دیتای آمادهٔ سایت نیست**. شاخهٔ `forever-plan` هم تازه آمد. CI/API گیتهاب این جلسه rate-limit شد — وضعیت Actions را از کامیت‌ها استنباط کردم.

## وضعیت خودم

- watchdog مؤثر (leader=10، کامیت `d5926e9`)؛ زنجیرهٔ fixed_rate 600s نو (job 478024) + سه پشتیبان ۱۰/۱۲/۱۴ فعال.
- صندوق: ۱ پیام (پروتکل QA) خوانده و ack شد؛ پیام high QA به مدیر ارشد رفت.
- توکن fine-grained هنوز ندارم — بازرسی wowfa از مسیر کلون محلی این محیط انجام شد (بدون چاپ توکن).

## موارد نیازمند دستور مدیر ارشد / ادمین

1. **PR #57 را merge کنید** — تأیید فنی داده شد؛ تا آن موقع regression تکرار می‌شود.
2. **z-ai-apprentice** — last_seen کهنه روی working؛ در بیداری بعدی چک شود.
3. **شاخه‌های site/*** — از wow-retail انتظار PR داریم؛ اگر PR باز نشد، مدیر ارشد تذکر دهد.
4. توکن fine-grained برای من همچنان درخواست قبلی است (بازرسی مستقیم wowfa از محیط خودم).

— سعید تمام!!
