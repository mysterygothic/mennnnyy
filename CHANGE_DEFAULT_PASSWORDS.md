# 🔐 تغيير كلمات المرور الافتراضية

## ⚠️ مهم جداً!

**يجب تغيير كلمات المرور الافتراضية قبل النشر للإنتاج!**

---

## 📍 الخطوة 1: تغيير كلمات المرور في Cloudflare Worker

### افتح ملف `cloudflare-worker.js`

ابحث عن هذا الجزء (السطر 7-16):

```javascript
const ADMIN_USERS = {
  // Default hardcoded users (fallback)
  'admin': {
    password: 'admin123',  // ⚠️ غيّر هذا
    role: 'super_admin'
  },
  'zaid': {
    password: 'zaid2025',  // ⚠️ غيّر هذا
    role: 'super_admin'
  }
};
```

### غيّر إلى:

```javascript
const ADMIN_USERS = {
  'admin': {
    password: 'كلمة_مرور_قوية_جداً_123!@#',
    role: 'super_admin'
  },
  'zaid': {
    password: 'كلمة_مرور_أخرى_قوية_456!@#',
    role: 'super_admin'
  }
};
```

---

## 📍 الخطوة 2: إعادة نشر Worker

بعد التعديل:

1. احفظ الملف
2. اذهب إلى Cloudflare Dashboard
3. افتح Worker الخاص بك
4. الصق الكود المحدث
5. انقر **Save and Deploy**

---

## 📍 الخطوة 3: تحديث المستخدمين في Supabase

إذا كنت تستخدم Supabase:

### في Supabase SQL Editor:

```sql
-- تحديث كلمة مرور admin
UPDATE admin_users 
SET password_hash = 'كلمة_مرور_قوية_جداً_123!@#'
WHERE username = 'admin';

-- تحديث كلمة مرور zaid
UPDATE admin_users 
SET password_hash = 'كلمة_مرور_أخرى_قوية_456!@#'
WHERE username = 'zaid';
```

---

## 💡 نصائح لكلمات مرور قوية

### ✅ استخدم:
- حروف كبيرة وصغيرة (A-Z, a-z)
- أرقام (0-9)
- رموز خاصة (!@#$%^&*)
- طول 12 حرف على الأقل

### ❌ تجنب:
- كلمات مرور بسيطة (123456, password)
- معلومات شخصية (اسمك، تاريخ ميلادك)
- كلمات مرور مكررة

### 🔒 أمثلة على كلمات مرور قوية:

```
M@tb3k_Sh3!kh_2025!
Z@!d_S3cur3_P@ssw0rd!
Adm!n_Str0ng_K3y_99!
```

---

## 🛡️ أمان إضافي (اختياري)

### استخدام تشفير bcrypt

في المستقبل، يمكنك استخدام bcrypt لتشفير كلمات المرور:

```javascript
// مثال (يتطلب مكتبة bcrypt)
const bcrypt = require('bcrypt');
const hashedPassword = await bcrypt.hash('كلمة_المرور', 10);
```

---

## ✅ التحقق من التغيير

بعد التحديث:

1. افتح `admin.html`
2. حاول تسجيل الدخول بكلمة المرور **القديمة** ← يجب أن يفشل ❌
3. حاول تسجيل الدخول بكلمة المرور **الجديدة** ← يجب أن ينجح ✅

---

## 📝 احتفظ بكلمات المرور

**مهم**: احفظ كلمات المرور الجديدة في مكان آمن:
- مدير كلمات مرور (1Password, LastPass, Bitwarden)
- ملف مشفر
- خزنة آمنة

**لا تحفظها في**:
- ملفات نصية عادية
- رسائل بريد إلكتروني
- ملاحظات غير مشفرة

---

## 🚨 في حالة نسيان كلمة المرور

### إذا نسيت كلمة مرور Worker:

1. افتح `cloudflare-worker.js`
2. غيّر كلمة المرور في الكود
3. أعد نشر Worker

### إذا نسيت كلمة مرور Supabase:

```sql
-- في Supabase SQL Editor
UPDATE admin_users 
SET password_hash = 'كلمة_مرور_جديدة'
WHERE username = 'اسم_المستخدم';
```

---

## ✅ قائمة التحقق

- [ ] غيّرت كلمات المرور في `cloudflare-worker.js`
- [ ] أعدت نشر Worker
- [ ] حدّثت كلمات المرور في Supabase (إن وُجد)
- [ ] اختبرت تسجيل الدخول بكلمات المرور الجديدة
- [ ] حفظت كلمات المرور في مكان آمن
- [ ] حذفت كلمات المرور من أي ملفات مؤقتة

---

**الأمان أولاً! 🔒**
