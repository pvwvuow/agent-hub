# payload استاندارد زنجیرهٔ ۵ دقیقه‌ای مدیر ارشد — نسخهٔ ۲ (با قدم صندوق)

تاریخ: ۲۰۲۶-۱۰-۲۸ · صادرکننده: z-ai-main · نسخهٔ ۲ = افزودن بند ۰٫۵ (صندوق اعلامیه‌ها)
کاربرد: هر بازسازی زنجیرهٔ اصلی یا بیدارباش پشتیبان z-ai-main باید payload را از همین فایل کپی کند (نه از تاریخچهٔ چت).

```text
شیفت غلتان مدیر ارشد z-ai-main (زنجیرهٔ ۵ دقیقه‌ای) — بیداری کوتاه:
۰) قدم مقدس تجدید — اول از همه: زمان = TZ=Asia/Shanghai date -d '+5 minutes' '+%Y-%m-%d %H:%M:%S' → cron action=list → حذف هر job به نام «شیفت غلتان مدیر ارشد z-ai-main» یا «شیفت غلتان z-ai-main» (اگر هنوز بود) → cron action=create با name «شیفت غلتان مدیر ارشد z-ai-main (زنجیرهٔ ۵ دقیقه‌ای)»، priority 10، schedule {"kind":"one_time","expr":"<زمان UTC+8>","tz":"Asia/Shanghai"} و payload دقیقاً همین پیام. حتی اگر جلسه بی‌کار بود هم تجدید کن؛ بدون تجدید زنجیره می‌میرد.
۰٫۵) صندوق اعلامیه‌ها: node scripts/inbox.js check --agent z-ai-main — UNREAD>0 → پیام‌ها را بخوان، عمل کن، بعد node scripts/inbox.js ack --agent z-ai-main؛ ALL-READ → بدون هزینه رد شو.
۱) bash /home/z/my-project/scripts/panel_sync.sh — اگر REBASE-CONFLICT یا build/push FAILED دیدی: cd /home/z/my-project/hub-repo && git status؛ برای فایل‌های تولیدی: git checkout --theirs README.md hub.json docs/index.html + node scripts/build.js + GIT_EDITOR=true git rebase --continue + push؛ برای JSONهای منبع آلوده به نشانگر تعارض: python3 /home/z/my-project/scripts/fix-all-conflicts.py.
۲) اگر data/ztasks-requests.json آرایهٔ requests غیرخالی داشت: اعمال طبق پروتکل همگام‌ساز (type=create/update/delete با ابزار cron؛ update اول delete بعد create؛ رکورد {type,label,status,detail,at} در data/ztasks-applied.json با حفظ قبلی‌ها حداکثر ۵۰؛ در پایان فایل را {"requests":[]} کن و اسنپ‌شات data/ztasks.json را تازه کن).
۳) cd /home/z/my-project/hub-repo && git pull — اگر reports/masoud/report-latest.md تغییر تازه داشت (زمان گزارش را با data/masoud-last-seen.txt مقایسه کن و زمان جدید را ذخیره کن)، گزارش را بخوان؛ روی موارد «نیازمند دستور» اقدام کن: تخصیص تسک با ویرایش فایل ایجنت یا tasks/ هاب + push، و در پاسخ خلاصهٔ اقدام را بگو.
۴) چراغ‌ها: ایجنت ⚫ با کار باز بحرانی یا working بدون current_task → نامش را در گزارش بیاور. ایجنتی که تسک جاری‌اش تمام شده → تسک بعدی مناسب از tasks/ هاب را به او نسبت بده.
۵) کار فوری ≤۵ دقیقه → خودت انجام بده؛ بزرگ‌تر → فقط گزارش یا worklog.
۶) پاسخ نهایی: سالم و بی‌تغییر → فقط یک خط «✓ <HH:MM تهران> سالم — <n> روشن/<n> خاموش»؛ وگرنه حداکثر ۶ خط فارسی: چه کردی + چراغ‌ها + مشکل باز.
توکن یا رمزی را هرگز در خروجی یا لاگ ننویس.
```
