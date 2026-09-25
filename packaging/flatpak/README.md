# Flathub — حزمة Flatpak (نسخة مرآة للمستودع الرسمي)

هذا المجلد يمرّ بتكوين النشر على **Flathub** بصيغة مرآة للمستودع المنفصل:
[`github.com/mohamedewiasabd/com.muslim.adhkar.wird`](https://github.com/mohamedewiasabd/com.muslim.adhkar.wird)

| الملف | الوصف |
| --- | --- |
| `com.muslim.adhkar.wird.json` | Manifest Flatpak (يُبنى من AppImage الرسمي في GitHub Releases) |
| `com.muslim.adhkar.wird.metainfo.xml` | بيانات AppStream (وصف + لقطات + OARS + سجل النشر) |
| `com.muslim.adhkar.wird.desktop` | إدخال سطح المكتب |
| `icons/` | أيقونات 128 و 512 باسم المعرّف |

> **المصدر المعتمد واجب التحديث:** ملف manifest في المستودع المنفصل هو الذي يقرأه
> Flathub — ارفع أي تعديل إلى `com.muslim.adhkar.wird` أولاً ثم انسخه هنا ليبقى المرجع متّحداً.
> قيمة `sha256` تُحدَّث بعد كل إصدار (يرفعها external-data-checker تلقائياً في البناء).