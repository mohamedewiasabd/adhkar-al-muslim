# openSUSE / SLES — OBS

`adhkar-al-muslim.spec` + `_service` (سحب المصدر تلقائياً من GitHub عند الوسم).

## النشر (يتطلب حساب build.opensuse.org):
```bash
# 1) مشروع جديد على https://build.opensuse.org (مثل home:<user>:adhkar)
# 2) الرفع عبر osc:
osc checkout home:<user>:adhkar
cd home:<user>:adhkar
cp <حيث تكون> adhkar-al-muslim.spec _service .
osc add adhkar-al-muslim.spec _service
osc service run
osc commit -m "adhkar-al-muslim 1.9.16"
# 3) تفعيل المستودعات المطلوبة (openSUSE Tumbleweed / Leap) من صفحة المشروع
```

## تعليمات المستخدم النهائي (بعد إضافة repo_url):
```bash
sudo zypper addrepo https://download.opensuse.org/repositories/home:<user>/adhkar openSUSE:adhkar
sudo zypper refresh
sudo zypper install adhkar-al-muslim
```

> بديل Debian-based عبر OBS: يُضف `dsc` من مجلد `ubuntu-ppa/debian` داخل نفس المشروع إن أردت.