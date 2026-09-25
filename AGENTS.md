# أذكار المسلم — تعليمات العمل الإلزامية (AGENTS.md)

> هذا الملف إلزامي. **كل تعديل** على أي ملف في هذا المشروع يجب أن يمرّ ببروتوكول الإصدارات الكامل في البند ٤ دون استثناء. يقع هذا المشروع افتراضياً تحت نهج «شغّل `./release.sh` تلقائياً في نهاية كل تعديل» بعد إتمام الفحص والبناء.

## ١) هوية المشروع

- تطبيق «أذكار المسلم - الورد اليومي» — أذكار، أدعية، مصحف كامل، مسبحة إلكترونية، ورد تلاوة وحفظ، تصدير الآيات صورًا/فيديو، وتنبيهات تلقائية.
- البنية: **Capacitor 8 + React 19 + Vite 6 + Tailwind 4 (CSS) + TypeScript**.
- المعرّف: `com.muslim.adhkar.wird` — اسم التطبيق: «أذكار المسلم - الورد اليومي».
- الإصدار يُدار في ملف واحد فقط: `android/app/build.gradle` (`versionCode` / `versionName`)، ويقرأه `release.sh` ويصعّده تلقائياً مع كل إصدار؛ لا تُعدّل رقم الإصدار يدوياً.
- **تصعيد الإصدار إجباري وتلقائي** في `./release.sh`: يرفع `versionCode` بـ `+1` ويزيد رقم `versionName` الأخير (patch)، أو يقبل رقمًا محددًا كوسيط (مثل `./release.sh 2.0.0`). أسماء ملفات النواتج تتبع الرقم تلقائياً (مثل `أذكار-المسلم-v1.9.14-release.apk`).

## ٢) مصفوفة المنصات والحالة الفعلية

| المنصة | الحالة | المخرجات الثابتة |
| --- | --- | --- |
| Web | متاحة ✅ | `dist/` قابلة للنشر على أي استضافة ساكنة |
| Android (Release مُوقَّع) | متاحة ✅ | `release/أذكار-المسلم-v1.9.14-release.apk` + `.aab` |
| Android (Debug) | متاحة ✅ | بالبناء اليدوي ثم النسخ إلى `release/` |
| iOS (ايفون/ايباد) | البنية جاهزة ✅، **البناء على Mac فقط** | يبنيه المستخدم على macOS عبر Xcode |

- **لا توجد بنية Tauri/سطح مكتب** في هذا المشروع (Windows/Linux/macOS غير مدعومة) — أهملت من ملفات البناء.
- **لا يوجد CI** (لا مجلد `.github/workflows`) — كل البناء محلي، ورفع النواتج إلى بلاي ستور/متجر يدوي.
- **iOS**: هيكل `ios/` مولّد ومزامن (بنية SPM عبر `CapApp-SPM`). لا يمكن توليد `ipa` على Linux؛ يلزم macOS + Xcode.

## ٣) متطلبات البناء

1. **Node 22** (نظام الجهاز فيه Node 18 أحياناً — لا يعمل مع Capacitor 8 CLI):
   `export PATH="$HOME/.nvm/versions/node/v22.22.1/bin:$PATH"`
2. فحص ثم بناء الويب بأمرين إجباريين بعد أي تعديل:
   `npm run lint` (يساوي `tsc --noEmit`) ثم `npm run build` (يساوي `vite build`) — **صفر أخطاء**.
3. مزامنة أندرويد (تشغّل تلقائياً حقن إعدادات AdMob عبر `capacitor:sync:after`):
   `npx cap sync android`
4. التوقيع: `android/key.properties` (معلومات المفتاح) + `android/keystore/adhkar-release.keystore` — **أسرار، لا تُرفع أبداً**. `android/local.properties` (مسار SDK) لا يُرفع أيضاً.
5. الإعلانات: معرّفات AdMob الحقيقية في `package.json` (`admob.androidAppId` / `iosAppId` / `enableNativeAds`). لا توجد بيئة `VITE_ADS_TEST_MODE` في هذا المشروع.
6. اختبار محلي: `adb` من `$HOME/Android/Sdk/platform-tools`، المحاكي AVD `Medium_Phone_API_36` (تحقّق من `sys.boot_completed`). تثبيت نسخة Debug فوق أخرى Release يتطلّب `adb uninstall` أولاً (توقيعان مختلفان). فحص التوقيع: `$HOME/Android/Sdk/build-tools/35.0.1/apksigner verify --print-certs`.
7. **iOS**: مكوّنات SPM المستخدمة: `@capacitor/app`، `filesystem`، `local-notifications`، `share` + المجتمعي `capacitor-admob-nextgen` (يعدّل Info.plist تلقائياً: App ID + ATT + SKAdNetwork). بعض المزايا **Android-only** ومحمية بـ `src/utils/platform.ts` (`isAndroidPlatform`) — لا تُكسِر هذه الحماية.

## ٤) البروتوكول الإلزامي بعد كل تعديل (بالترتيب)

> **القاعدة الجارية:** في نهاية كل تعديل، بعد نجاح الفحص، نشغّل تلقائياً: `./release.sh` (خطوة ٠→٢) مع التحقق والتقرير (خطوتا ٤ و٦). نسخة Debug تُبنى عند طلبها فقط (خطوة ٣).

### الخطوة 0 — تصعيد رقم الإصدار (إجباري وتلقائي)
`./release.sh` بلا وسيط يقرأ `versionCode`/`versionName` من `android/app/build.gradle` ويرفع `versionCode` +1 ويزيد patch في `versionName`، ثم يبني ويصدّر بنفس الرقم الجديد. لتحديد رقم: `./release.sh 2.0.0`.

### الخطوة 1 — الفحص والويب
```bash
npm run lint
npm run build
```

### الخطوة 2 — إصدار Android (النسخة الموقّعة + ملف البلاي)
```bash
./release.sh
```
وهذا السكربت ينفّذ: بناء الويب ← `npx cap sync android` ← `./gradlew assembleRelease bundleRelease` ← نسخ النواتج إلى:
- `release/أذكار-المسلم-v{VERSION}-release.apk`
- `release/أذكار-المسلم-v{VERSION}-release.aab`
- تحديث `release/checksums.txt` (SHA-256 لكل الإصدارات).

### الخطوة 3 — نسخة التطوير (Debug) — عند الطلب فقط
```bash
cd android && ./gradlew assembleDebug
cd ..
cp android/app/build/outputs/apk/debug/app-debug.apk release/أذكار-المسلم-v{VERSION}-debug.apk
```

### الخطوة 4 — التحقق من النواتج (إجباري)
```bash
$HOME/Android/Sdk/build-tools/35.0.1/apksigner verify --print-certs release/*-release.apk
cd release && sha256sum -c checksums.txt
```

### الخطوة 5 — الرفع والنشر
- هذا المشروع **ليس مستودع git** حاليّاً؛ تسليم النسخ إلى المتجر (بلاي ستور/متجر آبل) يدوي. إن أُضيف git لاحقاً، يُلتزم بالقاعدة: لا تُرفع الأسرار أبداً (`key.properties`، `keystore/`، `local.properties`، `.env`، رموز).
- **هام:** حين تنشر على بلاي ستور تأكد أن `versionCode`/`versionName` تصاعد (الخطوة 0 تولّيك ذلك)؛ النشر بنفس `versionCode` يُرفض.

### الخطوة 6 — تقرير للمستخدم (بالعربية)
قائمة بكل ملف ناتج: الاسم + الحجم + SHA-256، تأكيد نجاح الفحص (lint/build)، وتوضيح ما الذي تغيّر في الإصدار.

## ٥) حدود حمراء (ممنوع نهائيًا)
- **أبدًا** لا تُرفع أو تُشارك: `android/key.properties`، `android/keystore/`، `android/local.properties`، ملفات `.env`، رموز/Passwords/Tokens/مفاتيح AdMob خاصة.
- لا تتجاوز خطوات البند ٤ (بما فيها **الخطوة 0 تصعيد الإصدار**)، ولا تُنهِ الجلسة قبل الإصدار والتقرير.

## ٦) مواضع الملفات
- تُرفع: `src/`، `android/` (عدا الأسرار)، `ios/`، `index.html`، إعدادات البناء (`capacitor.config.ts`، `package.json`، `vite.config.ts`، `tsconfig.json`)، `release/checksums.txt`، `release/play-assets/` (صور ومستندات المتجر).
- لا تُرفع (أسرار أو نواتج ضخمة): `android/key.properties`، `android/local.properties`، `android/keystore/`، ملفات `.env`، و`node_modules/` و`dist/` إن أُضيف git.