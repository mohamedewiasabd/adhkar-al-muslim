# أذكار المسلم — تعليمات العمل الإلزامية (AGENTS.md)

> هذا الملف إلزامي. **كل تعديل** على أي ملف في هذا المشروع يجب أن يمرّ ببروتوكول الإصدارات الكامل في البند ٤ دون استثناء، ولا يجوز إنهاء الجلسة قبل إتمام الخطوات كلها والرفع إلى GitHub.

## ١) هوية المشروع

- تطبيق «أذكار المسلم - الورد اليومي» — Capacitor 8 + React 19 + Vite 6 + Tailwind 4 (CSS) + TypeScript + Tauri 2 (سطح المكتب).
- المستودع (خاص): `https://github.com/mohamedewiasabd/adhkar-al-muslim` — الفرع `main`.
- المعرّف: `com.muslim.adhkar.wird` — اسم التطبيق: «أذكار المسلم - الورد اليومي».
- **تصعيد الإصدار تلقائي وإجباري مع كل إصدار** — الخطوة 0 في `script/release-all.sh` ترفع `versionCode` بـ +1 وتصعّد `versionName` (patch افتراضيًا) في ملفات: `android/app/build.gradle`، `src-tauri/tauri.conf.json`، و`ios/App/App.xcodeproj/project.pbxproj` (MARKETING_VERSION). أسماء ملفات النواتج تتبع الرقم تلقائيًا (مثل `أذكار-المسلم-v1.9.15-release.apk` و`adhkar-al-muslim_1.9.15_amd64.deb`). أسباب عدم التصعيد المشروعة فقط: خطاف `post-commit` (`ADHKAR_RELEASE=1`)، `ADHKAR_SKIP_BUMP=1`، أو وضع `ADHKAR_FETCH_ONLY=1`.
- الويب: مخرجات `dist/` قابلة للنشر على أي استضافة ساكنة (Vercel/Netlify/GitHub Pages).

## ٢) مصفوفة المنصات والحالة الفعلية

| المنصة | الحالة | المخرجات الثابتة |
| --- | --- | --- |
| Web | متاحة ✅ | `dist/` |
| Android (Release مُوقَّع) | متاحة ✅ | `release/apk/أذكار-المسلم-v{VERSION}-release.apk` |
| Android (AAB بلاي ستور) | متاحة ✅ | `release/play/أذكار-المسلم-v{VERSION}-release.aab` |
| Android (Debug) | متاحة ✅ | `release/apk/أذكار-المسلم-v{VERSION}-debug.apk` |
| Windows سطح المكتب | عبر CI ✅ | `release/desktop/windows/` — `adhkar-al-muslim_{VERSION}_x64-setup.exe` + `.msi` (CI `desktop.yml`) |
| Linux سطح المكتب | عبر CI ✅ | `release/desktop/linux/` — `.deb` + `.AppImage` (CI، أو محليًا عند توفّر مكتبات webkit2gtk) |
| macOS سطح المكتب | عبر CI ✅ | `release/desktop/macos/` — `_aarch64.dmg` (Apple Silicon) + `_x64.dmg` (Intel) (CI `desktop.yml`) |
| iOS (ايفون/ايباد) | البناء ينجح عبر CI ✅ (منتج `.app` غير مُوقَّع) | `release/ipa/` — **IPA مُوقَّع** يتطلب أسرار Apple (انظر بند ٣) |

> أسماء ملفات النواتج **تتبع رقم الإصدار تلقائيًا** مع كل تشغيل — الأسماء أعلاه للنسخة الحالية (1.9.14).

- **Windows/macOS/iOS تُبني عبر GitHub Actions** (سطور العمل `desktop.yml` و`ios.yml`) لأن بيئة العمل هذه بنظام Linux لا تملك مكتبات webkit2gtk (تتطلب sudo) ولا Xcode.
- الـ Linux محليًا يتطلب أولًا: `sudo apt install libwebkit2gtk-4.1-dev build-essential libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev` ثم `npm run desktop:build:linux`.
- الحصول على **IPA نهائي** يحتاج توقيع Apple (Certificate + Provisioning Profile) من حساب المطوّر.
- عند طلب جلسة بناء: إن تعذّر البناء محليًا لمنصة (مكتبات نظام/ماك/أزمة GitHub Actions)، يُذكر ذلك بوضوح مع مرجع سطر العمل المُنفِّذ بدلًا من اختلاق ملفات.

## ٣) متطلبات البناء

1. **Node 22** (النظام فيه Node 18 أصلاً — لا يعمل مع Capacitor 8):
   `export PATH="$HOME/.nvm/versions/node/v22.22.1/bin:$PATH"`
2. **Rust stable** لسطح المكتب (Tauri): `export PATH="$HOME/.cargo/bin:$PATH"` (rustc >= 1.77). إن لم يكن مثبتًا: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable --profile minimal`.
3. فحص ثم بناء الويب بأمرين إجباريين بعد أي تعديل:
   `npm run lint` (يساوي `tsc --noEmit`) ثم `npm run build` (يساوي `vite build`) — **صفر أخطاء**.
4. التوقيع: `android/key.properties` + `android/keystore/adhkar-release.keystore` — **أسرار، لا تُرفع أبدًا**. (توقيع Apple لـ iOS يتم عبر CI عند توفّر الأسرار)
5. الإعلانات: معرّفات AdMob الحقيقية في `package.json` (`admob.androidAppId` / `iosAppId` / `enableNativeAds`). لا توجد بيئة `VITE_ADS_TEST_MODE` في هذا المشروع.
6. بنية سطح المكتب متاحة في `src-tauri/` (Tauri v2) ومنصة ايفون في `ios/` (Capacitor 8 مع SPM عبر `CapApp-SPM`) — كلاهما يعتمد نفس ويب `dist/`.
7. **iOS في Capacitor 8.5+**: حزمة `capacitor-swift-pm` الثنائية مبنية مع العلم التجريبي `NonescapableTypes`؛ سطر العمل `ios.yml` يضم خطوة "Patch plugins Swift API" تُحقن هذا العلم في `Package.swift` لمكونات: `app`، `filesystem`، `share`، `local-notifications` (المسار `ios/Sources/LocalNotificationsPlugin`) و`capacitor-admob-nextgen` (المسار `ios/Sources/AdMobNextGenPlugin` — يُستبدل بصيغة `, swiftSettings: ...` قبل معامل `resources`) — لا تُلغِ هذه الخطوة.
8. **Desktop CI**: لا يُستخدم `tauri-apps/tauri-action` — البناء المباشر عبر `npm run tauri -- build [--target X]`، ورفع الأرتيفاكتات من `src-tauri/target/*/release/bundle/**` (مسار يغطي الرؤوس المتقاطعة على Mac).

## ٤) البروتوكول الإلزامي بعد كل تعديل (بالترتيب)

> **الأمر الواحد الإلزامي:** `npm run release` (= `bash script/release-all.sh`) يَنفّذ الخطوات ٠→٦ كلها (تصعيد الإصدار + بناء النسخ + التحقق + الالتزام + الرفع + جلب نواتج CI) بنفس الترتيب أدناه.

### الخطوة 0 — تصعيد رقم الإصدار (إجباري وتلقائي)
الخطوة 0 في `script/release-all.sh` تنفّذ تلقائيًا مع كل تشغيل:
- تقرأ `versionCode`/`versionName` من `android/app/build.gradle` وترفع `versionCode` **+1** وتصعّد `versionName` (patch افتراضيًا؛ يمكن تغييره عبر `ADHKAR_VERSION_BUMP=minor|major`).
- توازن `"version"` في `src-tauri/tauri.conf.json` و `MARKETING_VERSION` في `ios/App/App.xcodeproj/project.pbxproj`.
- كل أسماء النواتج (APK/AAB/نواتج CI/سطح المكتب) تتبع الرقم الجديد تلقائيًا.
- **هام:** دون تصعيد لن يكتشف المستخدمون أو بلاي ستور التحديث (نفس `versionCode`). أسباب إيقاف التصعيد المشروعة فقط: `ADHKAR_RELEASE=1` (من الخطاف)، `ADHKAR_SKIP_BUMP=1`، أو `ADHKAR_FETCH_ONLY=1`. للجلب فقط دون بناء: `ADHKAR_FETCH_ONLY=1 npm run release`.

### الخطوة 1 — الفحص والويب
```bash
npm run lint
npm run build
```

### الخطوة 2 — إصدارات Android
```bash
npm run build
npx cap sync android
cd android && ./gradlew assembleRelease bundleRelease assembleDebug
cd ..
cp android/app/build/outputs/apk/release/app-release.apk release/apk/أذكار-المسلم-v{VERSION}-release.apk
cp android/app/build/outputs/bundle/release/app-release.aab release/play/أذكار-المسلم-v{VERSION}-release.aab
cp android/app/build/outputs/apk/debug/app-debug.apk release/apk/أذكار-المسلم-v{VERSION}-debug.apk
```
(الـ Android Release يعتمد التوقيع من `android/key.properties` — يشغّل `capacitor:sync:after` حقن إعدادات AdMob تلقائيًا.)

### الخطوة 3 — الويندوز / لينكس / ماك / ايفون
سطح المكتب (Tauri) — إن كان الجهاز محليًا يملك المتطلبات:
```bash
npm run desktop:build                       # كل أهداف النظام الحالي
npm run desktop:build:linux                 # لينكس: deb + AppImage فقط
```
النسخ الناتجة تُوضع في `src-tauri/target/release/bundle/` وتُنقل إلى `release/desktop/{windows,linux,macos}/` حسب النظام. إن كان البناء يعتمد على CI فهذه هي سطور العمل المنفِّذة:
`.github/workflows/desktop.yml` (Windows/Linux/macOS) و`.github/workflows/ios.yml` (ايفون/ايباد). لتشغيلها يدويًا دون دفع: من تبويب Actions → Run workflow.

ايفون (Capacitor):
```bash
npx cap sync ios                            # مزامنة الويب مع بنية ios/ (تعمل على أي نظام)
```
بناء Xcode الفعلي وإنتاج IPA يحتاج macOS (يتوفر عبر `ios.yml` مع توقيع Apple).
للحصول على **IPA مُوقَّع** أضف هذه الأسرار في إعدادات المستودع (Settings → Secrets and variables → Actions) — بدونها يبني السطر `.app` غير مُوقَّع فقط:
`APPLE_CERT_P12` (شهادة المطوّر بصيغة base64)، `APPLE_CERT_PASSWORD`، `APPLE_PROFILE_MOBILEPROVISION` (ملف Provisioning بالـ base64)، `APPLE_TEAM_ID`.

عند التعذّر محليًا (مكتبات نظام/ماك) أو فشل GitHub Actions أزمة خارجية: اذكر ذلك بوضوح مع مرجع السطر بدلًا من اختلاق ملفات.

### الخطوة 6 — جلب نواتج سطح المكتب/ايفون من CI (تلقائي)
بعد الرفع، ينتظر `release-all.sh` إتمام سطرَي العمل `desktop.yml` (مصفوفة: Ubuntu→لينكس، Windows، macOS intel/aarch64) و`ios.yml` ثم ينزّل الأرتيفاكتات عبر GitHub API (التوكن من `~/.git-credentials`) ويفكّها:
- `adhkar-desktop-{ubuntu-22.04,windows-latest,macos-15-intel,macos-26}` → `release/desktop/{linux,windows,macos}/`
- `adhkar-ios-{app-unsigned,ipa-signed}` → `release/ipa/`
مع طباعة SHA-256 لكل ملف. المهلة 25 دقيقة؛ إن انتهت فالتشغيل القادم يكمل. لإيقاف الانتظار مؤقتًا: `ADHKAR_FETCH_CI=0`. للجلب لاحقًا منفردًا (دون البناء أو تصعيد الإصدار): `ADHKAR_FETCH_ONLY=1 npm run release`.

### الخطوة 4 — التحقق من النواتج
```bash
$HOME/Android/Sdk/build-tools/35.0.1/apksigner verify --print-certs release/apk/*.apk
(cd release && sha256sum apk/*.apk play/*.aab > checksums.txt)
```
التحقق إجباري لكل ملف ناتج قبل الرفع (توقيع + SHA-256).

### الخطوة 5 — الالتزام والرفع (إلزامي)
```bash
git add -A
git diff --cached --name-only | grep -Ei "key\.properties|keystore|local\.properties|\.env"   # يجب أن يكون فارغًا
git commit -m "وصف واضح بالعربية للتعديل"
git push origin main
```

### الخطوة 6 — تقرير للمستخدم (بالعربية)
قائمة بكل ملف ناتج: الاسم + الحجم + SHA-256، وتأكيد إتمام الرفع مع رابط المستودع.

## ٥) حدود حمراء (ممنوع نهائيًا)
- **أبدًا** لا تُرفع: مفتاح التوقيع (`android/keystore/`)، `android/key.properties`، `android/local.properties`، ملفات `.env` الحقيقية، رموز/Passwords/Tokens/مفاتيح AdMob خاصة.
- لا تتجاوز أيًّا من خطوات البند ٤ (بما فيها **الخطوة 0 تصعيد الإصدار**)، ولا تنهي الجلسة قبل الرفع.
- عند كل إصدار يتصاعد الرقم تلقائيًا (الخطوة 0) — أسماء الملفات في البند ٢ تتبع الرقم الجديد، وأبلغ المستخدم بالإصدار الجديد وقيمة `versionCode` قبل الإرسال إلى بلاي ستور.

## ٦) مواضع الملفات
- تُرفع: `src/`، `android/` (عدا الأسرار)، `src-tauri/`، `ios/`، `.github/workflows/`، `index.html`، إعدادات البناء (`capacitor.config.ts`، `package.json`، `vite.config.ts`، `tsconfig.json`)، `script/`، `release/checksums.txt`، `release/play-assets/` (صور ومستندات المتجر).
- لا تُرفع (محجوبة في `.gitignore`): `android/key.properties`، `android/local.properties`، `android/keystore/`، ملفات `.env`، `node_modules/` و`dist/`، و`release/apk/`، `release/play/`، `release/desktop/`، `release/ipa/`.