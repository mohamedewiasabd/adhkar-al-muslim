#!/usr/bin/env bash
# ============================================================
#  سكربت إصدار النسخ: يرفع رقم الإصدار في كل تعديل تلقائياً
#  الاستعمال:
#    ./release.sh            → يصدر نسخة جديدة (patch +1) مثل 1.1.0 → 1.1.1
#    ./release.sh 1.2.0      → يصدر نسخة برقم محدد
# ============================================================
set -euo pipefail

cd "$(dirname "$0")"
GRADLE="android/app/build.gradle"

# قراءة الإصدار الحالي من build.gradle
CUR_NAME="$(grep -oP 'versionName "\K[^"]+' "$GRADLE")"
CUR_CODE="$(grep -oP 'versionCode \K[0-9]+' "$GRADLE")"

NEW_NAME="${1:-}"
if [ -z "$NEW_NAME" ]; then
  # زيادة تلقائية للرقم الأخير (patch): 1.0.1 → 1.0.2
  BASE="${CUR_NAME%.*}"
  PATCH="${CUR_NAME##*.}"
  NEW_PATCH=$((PATCH + 1))
  NEW_NAME="$BASE.$NEW_PATCH"
fi
NEW_CODE=$((CUR_CODE + 1))

echo "→ الإصدار الجديد: ${CUR_NAME} (code ${CUR_CODE}) ➜ ${NEW_NAME} (code ${NEW_CODE})"

# 1) ترقية حقول الإصدار في build.gradle
sed -i "s/versionCode ${CUR_CODE}/versionCode ${NEW_CODE}/" "$GRADLE"
sed -i "s/versionName \"${CUR_NAME}\"/versionName \"${NEW_NAME}\"/" "$GRADLE"

# 2) بناء الويب ثم مزامنة المشروع الأصلي (يشغّل حقن إعدادات AdMob تلقائياً)
echo "→ بناء الويب + cap sync ..."
npm run build >/dev/null 2>&1
npx cap sync android >/dev/null 2>&1

# 3) بناء الإصدارات الموقّعة
echo "→ بناء APK و AAB موقّعين ..."
(
  cd android
  ./gradlew assembleRelease bundleRelease --no-daemon
)

# 4) نسخ المخرجات إلى مجلد release بأسماء موقّعة بالإصدار
APK="android/app/build/outputs/apk/release/app-release.apk"
AAB="android/app/build/outputs/bundle/release/app-release.aab"
mkdir -p release
DEST_APK="release/أذكار-المسلم-v${NEW_NAME}-release.apk"
DEST_AAB="release/أذكار-المسلم-v${NEW_NAME}-release.aab"
cp -f "$APK" "$DEST_APK"
cp -f "$AAB" "$DEST_AAB"

# 5) تحديث ملف المجاميع لكل الإصدارات الموجودة
rm -f release/checksums.txt
(cd release && sha256sum أذكار-المسلم-v*-release.apk أذكار-المسلم-v*-release.aab > checksums.txt)

echo ""
echo "✔ تم الإصدار v${NEW_NAME} (versionCode ${NEW_CODE})"
echo "   → ${DEST_APK}"
echo "   → ${DEST_AAB}"
echo "   → release/checksums.txt محدّث"