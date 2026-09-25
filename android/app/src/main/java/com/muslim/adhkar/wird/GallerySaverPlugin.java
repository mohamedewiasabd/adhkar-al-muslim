package com.muslim.adhkar.wird;

import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Build;
import android.provider.MediaStore;
import android.provider.Settings;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

/**
 * يوفر «الحفظ الحقيقي» في معرض الوسائط عبر MediaStore:
 *  - الصور تذهب لمجلد Pictures/أذكار المسلم
 *  - الفيديوهات لمجلد Movies/أذكار المسلم
 *  - بقية الملفات لمجلد Download/أذكار المسلم
 *
 * السبب في وجوده: WebView أندرويد يتجاهل تنزيلات data: URL تماماً،
 * فلا طريقة لحفظ الصور/الفيديوهات المصدرة سوى عبر MediaStore.
 */
@CapacitorPlugin(
        name = "GallerySaver",
        permissions = {
                @Permission(
                        alias = "storage",
                        strings = {"android.permission.WRITE_EXTERNAL_STORAGE"}
                )
        }
)
public class GallerySaverPlugin extends Plugin {

    private static final String FOLDER_NAME = "Athkar";

    @PluginMethod
    public void saveMedia(PluginCall call) {
        String base64 = call.getString("data");
        String name = call.getString("name");
        String mime = call.getString("mime");
        if (base64 == null || name == null) {
            call.reject("data and name are required");
            return;
        }
        saveMediaInternal(base64, name, mime, call, false);
    }

    private void saveMediaInternal(String base64, String name, String mime, PluginCall call, boolean retried) {
        try {
            byte[] bytes = decode(base64);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                saveModern(bytes, name, mime);
                resolveSaved(call);
                return;
            }
            // أندرويد 9 فما دون: يحتاج إذن التخزين
            if (!hasStoragePermission()) {
                if (!retried) {
                    requestPermissionForAlias("storage", call, "permissionCallback");
                } else {
                    call.reject("storage permission denied", "PERMISSION_DENIED");
                }
                return;
            }
            saveLegacy(getContext(), bytes, name, mime);
            resolveSaved(call);
        } catch (SecurityException e) {
            call.reject("storage permission denied", "PERMISSION_DENIED", e);
        } catch (Exception e) {
            call.reject("save failed: " + e.getMessage(), e);
        }
    }

    @PermissionCallback
    private void permissionCallback(PluginCall call) {
        if (hasStoragePermission()) {
            saveMediaInternal(call.getString("data"), call.getString("name"), call.getString("mime"), call, true);
        } else {
            call.reject("storage permission denied", "PERMISSION_DENIED");
        }
    }

    private boolean hasStoragePermission() {
        // أندرويد 10+ (تقسيم التخزين): الحفظ في MediaStore لا يحتاج أي إذن
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            return true;
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            return getContext().checkSelfPermission("android.permission.WRITE_EXTERNAL_STORAGE") == android.content.pm.PackageManager.PERMISSION_GRANTED;
        }
        return true;
    }

    /** معلومات الحالة: تساعد JavaScript على معرفة متى تدل المستخدم إلى الإعدادات. */
    @PluginMethod
    public void getStatus(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("needsStoragePermission", Build.VERSION.SDK_INT < Build.VERSION_CODES.Q);
        ret.put("hasStoragePermission", hasStoragePermission());
        call.resolve(ret);
    }

    /** يفتح صفحة إعدادات التطبيق ليُفعّل المستخدم إذن التخزين (أندرويد 9 فما دون). */
    @PluginMethod
    public void openSettings(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                    Uri.parse("package:" + getContext().getPackageName()));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            JSObject ret = new JSObject();
            ret.put("opened", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("cannot open settings", e);
        }
    }

    private void resolveSaved(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("saved", true);
        call.resolve(ret);
    }

    private byte[] decode(String base64) {
        byte[] bytes;
        try {
            bytes = java.util.Base64.getDecoder().decode(base64);
        } catch (Exception e) {
            // تجربة بدون padding
            bytes = java.util.Base64.getDecoder().decode(base64 + "==");
        }
        return bytes;
    }

    /** أندرويد 10+: إدراج مباشر في MediaStore دون إذن. */
    private void saveModern(byte[] bytes, String name, String mime) throws Exception {
        Context ctx = getContext();
        ContentValues values = new ContentValues();
        values.put(MediaStore.MediaColumns.DISPLAY_NAME, name);
        values.put(MediaStore.MediaColumns.MIME_TYPE, mime);

        Uri collection;
        if (mime != null && mime.startsWith("video/")) {
            values.put(MediaStore.MediaColumns.RELATIVE_PATH, "Movies/" + FOLDER_NAME);
            collection = MediaStore.Video.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY);
        } else if (mime != null && (mime.startsWith("image/"))) {
            values.put(MediaStore.MediaColumns.RELATIVE_PATH, "Pictures/" + FOLDER_NAME);
            collection = MediaStore.Images.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY);
        } else {
            values.put(MediaStore.MediaColumns.RELATIVE_PATH, "Download/" + FOLDER_NAME);
            collection = MediaStore.Downloads.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY);
        }

        values.put(MediaStore.MediaColumns.IS_PENDING, 1);
        Uri item = ctx.getContentResolver().insert(collection, values);
        if (item == null) throw new Exception("MediaStore insert failed");
        try (OutputStream out = ctx.getContentResolver().openOutputStream(item)) {
            if (out == null) throw new Exception("cannot open output stream");
            out.write(bytes);
        }
        values.clear();
        values.put(MediaStore.MediaColumns.IS_PENDING, 0);
        ctx.getContentResolver().update(item, values, null, null);
    }

    /** أندرويد 9 فما دون: الحفظ في المجلدات العامة ثم فحص الوسائط. */
    private void saveLegacy(Context ctx, byte[] bytes, String name, String mime) throws Exception {
        File base;
        if (mime != null && mime.startsWith("video/")) {
            base = android.os.Environment.getExternalStoragePublicDirectory(android.os.Environment.DIRECTORY_MOVIES);
        } else if (mime != null && mime.startsWith("image/")) {
            base = android.os.Environment.getExternalStoragePublicDirectory(android.os.Environment.DIRECTORY_PICTURES);
        } else {
            base = android.os.Environment.getExternalStoragePublicDirectory(android.os.Environment.DIRECTORY_DOWNLOADS);
        }
        File dir = new File(base, FOLDER_NAME);
        if (!dir.exists() && !dir.mkdirs()) throw new Exception("cannot create folder");
        File file = new File(dir, name);
        try (FileOutputStream out = new FileOutputStream(file)) {
            out.write(bytes);
        }
        final String path = file.getAbsolutePath();
        MediaScannerConnection.scanFile(ctx, new String[]{path}, new String[]{mime},
                (str, uri) -> { /* تم الفحص */ });
    }
}