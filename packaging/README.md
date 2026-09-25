# حزم وتوزيع «أذكار المسلم» على مستودعات التوزيعات

هنا تُحضَّر الحزم الخاصة بمستودعات التوزيعات المختلفة. **النشر الفعلي يتطلب حساب
مطوّر على كل منصة** (Launchpad / COPR / AUR / OBS) — جميع الخطوات النهائية أدناه
تَنفَّذها من حسابات المستخدم، والملفات هنا جاهزة للتعديل والرفع.

| المجلد | المنصة | الملف الأساسي | خطوة الطرف |
| --- | --- | --- | --- |
| [`ubuntu-ppa/`](ubuntu-ppa/) | Ubuntu / Debian (Launchpad PPA) | `debian/rules` | `debuild -S` ثم `dput ppa:...` |
| [`fedora-copr/`](fedora-copr/) | Fedora / RHEL (COPR) | `adhkar-al-muslim.spec` | `copr-cli build` أو push لـ git سطر العمل |
| [`arch-aur/`](arch-aur/) | Arch / Manjaro (AUR) | `PKGBUILD` | رفع عبر SSH إلى `aur.archlinux.org` |
| [`opensuse-obs/`](opensuse-obs/) | openSUSE / SLES (OBS) | `adhkar-al-muslim.spec` + `_service` | `osc`/دخول build.opensuse.org |
| [`flatpak/`](flatpak/) | كل التوزيعات (Flathub) | manifest + metainfo + أيقونات | تسجيل عبر flathub.org/apps/add |

## ملاحظات عامة
- **الإصدار المرجعي في الحزم:** `1.9.16` — قف في كل ملف عند كل إصدار جديد.
- كل الحزم تبني التطبيق من **المصدر** (Node 22 + Rust) لأن Flathub/COPR/OBS تفرض
  البناء من المصدر لضمان التوافق الأمني.
- أسماء الملفات الثنائية من سطر العمل `desktop.yml`:
  `adhkar-al-muslim_{VERSION}_amd64.deb` و `..._amd64.AppImage`.
- مصدر البناء المرجعي: `https://github.com/mohamedewiasabd/adhkar-al-muslim` عند الوسم `v{VERSION}`.