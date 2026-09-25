#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
#  البروتوكول الإلزامي الكامل — أمر واحد: كل النسخ + التحقق + الرفع
#  التشغيل:  ./script/release-all.sh   أو   npm run release
#  يعمل تلقائياً أيضاً بعد كل التزام عبر الخطاف .git/hooks/post-commit
#  ─────────────────────────────────────────────────────────────────────
#  إصدارات المفاتيح:
#    ADHKAR_SKIP_BUMP=1  → إصدار بلا تصعيد (لا يمس رقم الإصدار)
#    ADHKAR_VERSION_BUMP=minor|patch|major  → نوع التصعيد (الافتراضي patch)
#    ADHKAR_FETCH_ONLY=1 → جلب نواتج CI للالتزام الحالي فقط ثم خروج
#    ADHKAR_FETCH_CI=0   → من دون انتظار/جلب نواتج CI
#  الخطاف post-commit يؤمَّن من العودية عبر ADHKAR_RELEASE=1 (يتخطى التصعيد)
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$(pwd)"
REPO="mohamedewiasabd/adhkar-al-muslim"

export PATH="$HOME/.nvm/versions/node/v22.22.1/bin:$PATH"

JS_GRADLE="android/app/build/outputs"
APK="$ROOT/release/apk"
PLAY="$ROOT/release/play"
SCRIPT="$ROOT/script"

log(){ printf '\n\033[1;36m▶ %s\033[0m\n' "$*"; }
ok(){ printf '\033[1;32m✓ %s\033[0m\n' "$*"; }

mkdir -p "$APK" "$PLAY"

# ── الخطوة 0: تصعيد رقم الإصدار تلقائياً (إجباري) ─────────────────────
VERSION_NAME="$(sed -nE 's/^[[:space:]]*versionName[[:space:]]+"([^"]+)".*/\1/p' android/app/build.gradle | head -1 | tr -d '[:space:]')"
VERSION_CODE="$(sed -nE 's/^[[:space:]]*versionCode[[:space:]]+([0-9]+).*/\1/p' android/app/build.gradle | head -1 | tr -d '[:space:]')"
VERSION="${VERSION_NAME:-1.9.14}"
VCODE="${VERSION_CODE:-39}"

skip_bump=0
[ "${ADHKAR_RELEASE:-0}" = "1" ] && skip_bump=1        # خطاف post-commit (بلا عودية)
[ "${ADHKAR_SKIP_BUMP:-0}" = "1" ] && skip_bump=1      # طلب صريح بلا تصعيد
[ "${ADHKAR_FETCH_ONLY:-0}" = "1" ] && skip_bump=1     # وضع الجلب فقط

if [ "$skip_bump" = "0" ]; then
  BUMP_TYPE="${ADHKAR_VERSION_BUMP:-patch}"
  IFS='.' read -r -a parts <<< "$VERSION"
  case "$BUMP_TYPE" in
    patch) parts[2]=$(( ${parts[2]:-0} + 1 )) ;;
    major) parts[0]=$(( parts[0] + 1 )); parts[1]=0; parts[2]=0 ;;
    *)     parts[1]=$(( ${parts[1]:-0} + 1 )); parts[2]=0 ;;
  esac
  NEW_VERSION="${parts[0]}.${parts[1]:-0}.${parts[2]:-0}"
  VERSION="$NEW_VERSION"
  VCODE=$(( VCODE + 1 ))
  log "الخطوة 0 — تصعيد الإصدار تلقائياً (إجباري) ${VERSION_NAME:-1.9.14} → ${VERSION}"
  printf '  ✓ versionCode %s → %s\n' "$VERSION_CODE" "$VCODE"
  sed -i -E "s/(^[[:space:]]*versionCode[[:space:]]+)[0-9]+/\1${VCODE}/" android/app/build.gradle
  sed -i -E 's/(^[[:space:]]*versionName[[:space:]]+)"[^"]*"/\1"'"${VERSION}"'"/' android/app/build.gradle
  sed -i -E 's/"version"[[:space:]]*:[[:space:]]*"[^"]*"/"version": "'"${VERSION}"'"/' src-tauri/tauri.conf.json
  if [ -f ios/App/App.xcodeproj/project.pbxproj ]; then
    sed -i -E "s/MARKETING_VERSION = [^;]+;/MARKETING_VERSION = ${VERSION};/g" ios/App/App.xcodeproj/project.pbxproj
  fi
  ok "Sync: android + src-tauri/tauri.conf.json + ios pbxproj → ${VERSION}"
else
  log "الخطوة 0 — تصعيد الإصدار متخطَّى (ADHKAR_RELEASE/ADHKAR_SKIP_BUMP/ADHKAR_FETCH_ONLY) — نسخة ثابتة ${VERSION}"
fi

VFILE="v${VERSION}"
APK_RELEASE="أذكار-المسلم-${VFILE}-release.apk"
AAB_PLAY="أذكار-المسلم-${VFILE}-release.aab"
APK_DEBUG="أذكار-المسلم-${VFILE}-debug.apk"

# ── وضع الجلب فقط ──────────────────────────────────────────────────────
fetch_ci_artifacts() {
  local TOKEN SHA API TMP deadline id st art_id art_name d src
  TOKEN="$(sed -nE 's_https://[^/@]*:([^/@]+)@github\.com.*_\1_p' ~/.git-credentials 2>/dev/null | head -1)"
  [ -z "$TOKEN" ] && { printf '  ⚠ لا يوجد توكن — تخطي جلب نواتج CI\n'; return 1; }
  SHA="$(git rev-parse HEAD)"
  API="https://api.github.com/repos/$REPO"
  TMP="$(mktemp -d)"
  cd "$ROOT"
  printf '  → انتظار إتمام خطوط العمل (desktop.yml + ios.yml) للالتزام %s…\n' "$SHA"
  deadline=$(( $(date +%s) + 1500 ))
  while :; do
    local pending=0
    while read -r id st; do
      [ -z "$id" ] && continue
      [ "$st" = "completed" ] || pending=$((pending + 1))
    done < <(curl -s -H "Authorization: Bearer $TOKEN" \
              "$API/actions/runs?head_sha=$SHA&per_page=20" \
            | jq -r '.workflow_runs[] | [.id,.status] | @tsv')
    if [ "$pending" -eq 0 ]; then break; fi
    if [ "$(date +%s)" -ge "$deadline" ]; then
      printf '  ⚠ انتهت مهلة الانتظار — أكمل لاحقاً عبر: npm run release\n'
      rm -rf "$TMP"; return 1
    fi
    sleep 20
  done
  while read -r id; do
    [ -z "$id" ] && continue
    while read -r art_id art_name; do
      [ -z "$art_id" ] && continue
      curl -sL -H "Authorization: Bearer $TOKEN" "$API/actions/runs/$id/artifacts" 2>/dev/null >/dev/null
      curl -sL -H "Authorization: Bearer $TOKEN" "$API/actions/artifacts/$art_id/zip" -o "$TMP/a.zip" || continue
      unzip -oq "$TMP/a.zip" -d "$TMP/$art_name" || true
      rm -f "$TMP/a.zip"
    done < <(curl -s -H "Authorization: Bearer $TOKEN" "$API/actions/runs/$id/artifacts" | jq -r '.artifacts[] | "\(.id) \(.name)"')
  done < <(curl -s -H "Authorization: Bearer $TOKEN" "$API/actions/runs?head_sha=$SHA&per_page=20" | jq -r '.workflow_runs[].id')

  for d in "$TMP"/adhkar-desktop-*; do
    [ -d "$d" ] || continue
    case "$(basename "$d")" in
      *ubuntu-22.04*) src="$ROOT/release/desktop/linux"   ;;
      *windows*)      src="$ROOT/release/desktop/windows" ;;
      *macos*)        src="$ROOT/release/desktop/macos"   ;;
      *)              continue ;;
    esac
    mkdir -p "$src"
    find "$d" -type f \( -name '*.dmg' -o -name '*.exe' -o -name '*.msi' -o -name '*.deb' -o -name '*.AppImage' \) -exec cp {} "$src/" \; 2>/dev/null || true
  done
  for d in "$TMP"/adhkar-ios-*; do
    [ -d "$d" ] || continue
    mkdir -p "$ROOT/release/ipa"
    find "$d" -type f -name '*.ipa' -exec cp {} "$ROOT/release/ipa/" \; 2>/dev/null || true
    find "$d" -type d \( -name '*.app' -o -name '*.dSYM' \) -exec cp -R {} "$ROOT/release/ipa/" \; 2>/dev/null || true
  done
  rm -rf "$TMP"
  printf '  ✓ نواتج CI جُلبت → release/desktop/{linux,windows,macos} + release/ipa\n'
  find "$ROOT"/release/desktop/ "$ROOT"/release/ipa/ -type f -exec sha256sum {} + 2>/dev/null || true
}

if [ "${ADHKAR_FETCH_ONLY:-0}" = "1" ]; then
  log "وضع الجلب فقط — سحب نواتج CI للالتزام الحالي"
  fetch_ci_artifacts || true
  printf '\n\033[1;32m═══ انتهى الجلب فقط ═══\033[0m\n'
  exit 0
fi

# ── الخطوة 1: الفحص والويب ──────────────────────────────────────────────
log "الخطوة 1 — الفحص وبناء الويب (lint + build)"
npm run lint
npm run build
ok "الويب بني"

# ── الخطوة 2: إصدارات Android (الحقيقية + AAB + Debug) ────────────────
log "الخطوة 2أ — النسخة الحقيقية"
npm run build >/dev/null
npx cap sync android >/dev/null
( cd android && ./gradlew assembleRelease --console=plain -q )
cp "$JS_GRADLE/apk/release/app-release.apk" "$APK/$APK_RELEASE"
ok "release $VFILE"

log "الخطوة 2ب — ملف البلاي (AAB)"
( cd android && ./gradlew bundleRelease --console=plain -q )
cp "$JS_GRADLE/bundle/release/app-release.aab" "$PLAY/$AAB_PLAY"
ok "AAB $VFILE"

log "الخطوة 2ج — نسخة التطوير (Debug)"
( cd android && ./gradlew assembleDebug --console=plain -q )
cp "$JS_GRADLE/apk/debug/app-debug.apk" "$APK/$APK_DEBUG"
ok "debug"

# ── الخطوة 3: سطح المكتب / ايفون (اختيارية محلياً — يعتمد على CI) ──────
log "الخطوة 3 — سطح المكتب (Tauri) + مزامنة iOS"
export PATH="$HOME/.cargo/bin:$PATH"
if pkg-config --exists webkit2gtk-4.1 2>/dev/null; then
  printf '  ✓ مكتبات webkit2gtk متوفرة — بناء لينكس محلياً\n'
  npm run desktop:build:linux >/dev/null 2>&1 || true
  LINUX_DEST="$ROOT/release/desktop/linux"
  mkdir -p "$LINUX_DEST"
  find "$ROOT/src-tauri/target/release/bundle" -type f \( -name '*.deb' -o -name '*.AppImage' \) -exec cp {} "$LINUX_DEST/" \; 2>/dev/null || true
  ok "لينكس desktop (حسب توفّر المكتبات)"
else
  printf '  ⚠ مكتبات webkit2gtk غير متوفرة محلياً (تتطلب sudo) — نسخ سطح المكتب و ايفون تأتي من GitHub Actions\n'
fi
if [ -d ios/App ]; then
  npx cap sync ios >/dev/null 2>&1 || true
  ok "ios/ متزامنة"
fi

# ── الخطوة 4: التحقق من النواتج ─────────────────────────────────────────
log "الخطوة 4 — التحقق من التوقيع + المجاميع (SHA-256)"
APKSIGNER="$(ls -1 "$HOME"/Android/Sdk/build-tools/*/apksigner 2>/dev/null | sort -V | tail -1 || true)"
if [ -n "$APKSIGNER" ]; then
  for f in "$APK"/*.apk; do
    "$APKSIGNER" verify --print-certs "$f" >/dev/null && printf '  ✓ توقيع صحيح: %s\n' "$(basename "$f")"
  done
  "$APKSIGNER" verify --print-certs "$APK/$APK_RELEASE" | grep -E "Signer #1 certificate DN" | sed 's/^/  /'
else
  printf '  ⚠ apksigner غير موجود — يتم التخطي\n'
fi
rm -f "$ROOT/release/checksums.txt"
( cd "$ROOT/release" && sha256sum apk/*.apk play/*.aab 2>/dev/null | tee checksums.txt )
ok "checksums.txt محدَّث"

# ── الخطوة 5: الالتزام والرفع ───────────────────────────────────────────
log "الخطوة 5 — الالتزام والرفع إلى GitHub"
if git diff --cached --quiet && git diff --quiet; then
  printf '  (لا تغييرات إضافية للالتزام)\n'
else
  git add -A
  LEAK="$(git diff --cached --name-only | grep -Ei 'key\.properties\.|keystore|ghp_|local\.properties|keystore/' || true)"
  if [ -n "$LEAK" ]; then
    printf '\n\033[1;31m✗ ملفات محظورة في المسرح — إلغاء الالتزام:\n%s\033[0m\n' "$LEAK"
    exit 1
  fi
  git commit -m "تحديث تلقائي (البروتوكول الإلزامي) — ${VFILE}"
  printf '  ✓ التزام تلقائي\n'
fi
git push origin main
ok "رفع مكتمل → github.com/$REPO"

# ── الخطوة 6: جلب نواتج CI (ويندوز/لينكس/ماك/ايفون) ────────────────────
if [ "${ADHKAR_FETCH_CI:-1}" = "1" ]; then
  log "الخطوة 6 — جلب نسخ ويندوز/لينكس/ماك/ايفون من CI"
  fetch_ci_artifacts || true
else
  log "الخطوة 6 — الجلب متخطَّى (ADHKAR_FETCH_CI=0)"
fi

printf '\n\033[1;32m═══ إتمام البروتوكول الإلزامي بالكامل — الإصدار %s (versionCode %s) ═══\033[0m\n' "$VERSION" "$VCODE"