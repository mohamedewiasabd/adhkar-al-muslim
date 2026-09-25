# Fedora / RHEL — COPR

ملف `adhkar-al-muslim.spec` جاهز للبناء في **COPR** (يُبني من المصدر Node+Rust).

## النشر (يتطلب حساب Fedora + COPR)
```bash
# 1) إنشاء مشروع على https://copr.fedorainfracloud.org (مثل: adhkar-muslim)
# 2) تجهيز المصدر (tar طبق اسم Source0) ورفعه:
dkms ...          # بديل: rm -rf لا
# الأسهل: مشروع COPR بنمط "git" — ضع spec في جذر مستودع git واربطه:
git clone https://github.com/mohamedewiasabd/adhkar-al-muslim copr-src
# ضع adhkar-al-muslim.spec في جذره ثم:
copr-cli build adhkar-muslim https://github.com/mohamedewiasabd/adhkar-al-muslim/archive/refs/tags/v1.9.16.tar.gz
```

## تعليمات المستخدم النهائي
```bash
sudo dnf copr enable <user>/adhkar-muslim
sudo dnf install adhkar-al-muslim
```

> COPR يبني من الـ spec مباشرة؛ تتطلب `Version` مطابقة للوسم المرفوع.