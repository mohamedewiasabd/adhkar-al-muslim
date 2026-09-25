# Arch / Manjaro — AUR

حزمتان محتملتان:
- `PKGBUILD` (هذا الملف): بناء من المصدر (Node + Rust) باسم `adhkar-al-muslim`.
- `adhkar-bin/` اختياري: يستخرج AppImage الرسمي من GitHub Releases (أسفل نفس المجلد لاحقاً).

## النشر (بديل):
- من حسابك على AUR: أضف الحزمة عبر
  `https://aur.archlinux.org/` → «Submit package». الرفع يتم عبر SSH:
```bash
# أنشئ مجلد الحزمة ثم:
makepkg --printsrcinfo > .SRCINFO
git init; git add .; git commit -m "adhkar-al-muslim 1.9.16"
git push aur master
```

## تثبيت المستخدم:
```bash
yay -S adhkar-al-muslim
# (أو من المصدر:)
makepkg -si
```

> «قاعدة توستُن»: البارات المحلية فوق المكتبة موافقة — يُفضَّل `-bin` للمستخدمين العاديين.