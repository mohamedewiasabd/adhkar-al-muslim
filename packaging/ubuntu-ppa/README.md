# Ubuntu / Debian — حزمة PPA

حزمة مصدرية جاهزة لـ **Launchpad PPA** تبني التطبيق من المصدر
(Node + Rust → ثنائي Tauri) وتثبّته مع الأيقونة وإدخال سطح المكتب وبيانات AppStream.

## التحضير المحلي (يتطلب حساب Launchpad مُسجَّلاً)
```bash
# 1) أدوات التحزيم
sudo apt install devscripts debhelper
# 2) إنشاء الحزمة المصدرية داخل مجلد الحزمة (داخل نسخة من المستودع عند وسم v1.9.16)
dh_make -p adhkar-al-muslim_1.9.16 -f ../adhkar-al-muslim-v1.9.16.tar.gz || true
debuild -S -d
# 3) الرفع إلى الـ PPA:
dput ppa:<your-launchpad-user>/adhkar-muslim adhkar-al-muslim_1.9.16-1_source.changes
```

## تعليمات المستخدم النهائي
```bash
sudo add-apt-repository ppa:<user>/adhkar-muslim
sudo apt update
sudo apt install adhkar-al-muslim
```

> عند توفُّر حساب، استبدل `<user>` و`Maintainer` في `debian/control` بـ Launchpad اسمك.