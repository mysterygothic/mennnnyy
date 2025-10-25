# 🎯 دليل إعداد Supabase - خطوة بخطوة

## ما هو Supabase؟
Supabase هي قاعدة بيانات سحابية مجانية وسهلة، بديل ممتاز لـ Firebase

---

## 📝 الخطوة 1: إنشاء حساب Supabase

1. **اذهب إلى:** https://supabase.com
2. **اضغط على:** "Start your project"
3. **سجل دخول بـ GitHub** (أو إنشاء حساب جديد)
4. **مجاني 100%** - لا تحتاج بطاقة ائتمان!

---

## 🏗️ الخطوة 2: إنشاء Project جديد

1. بعد تسجيل الدخول، اضغط **"New Project"**
2. **اختار المعلومات:**
   - **Organization**: أنشئ واحدة جديدة (مثلاً: My Restaurant)
   - **Project Name**: `mataam-shiekh` أو أي اسم تريده
   - **Database Password**: **احفظ هذا الباسورد في مكان آمن!**
   - **Region**: اختار أقرب منطقة (مثل: Frankfurt أو Bahrain)
   - **Pricing Plan**: **Free** (مجاني)

3. اضغط **"Create new project"**
4. انتظر 1-2 دقيقة حتى ينتهي الـ setup

---

## 🔑 الخطوة 3: نسخ API Keys

1. بعد ما ينتهي الـ setup، اذهب لـ:
   - **Settings** (من القائمة اليسرى)
   - **API** (تحت Settings)

2. **انسخ هذه المعلومات** (مهمة جدًا):
   ```
   Project URL: https://xxxxxxx.supabase.co
   anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **احفظهم في ملف نصي مؤقت** - رح نحتاجهم!

---

## 📊 الخطوة 4: إنشاء الجداول (Tables)

### 4.1 إنشاء جدول المنيو (menu_items)

1. اذهب إلى **Table Editor** (من القائمة اليسرى)
2. اضغط **"Create a new table"**
3. اكتب الإعدادات التالية:

```
Name: menu_items
Description: Food menu items

Columns:
✅ id (int8) - Primary Key - Auto-increment
✅ name (text) - Name of dish
✅ description (text) - Description
✅ base_price (float8) - Base price
✅ category (text) - Category value (sudor, etc.)
✅ image (text) - Image path
✅ meat_options (jsonb) - Meat type options
✅ quantity_options (jsonb) - Chicken quantity options
✅ meat_quantity_options (jsonb) - Meat quantity options
✅ created_at (timestamptz) - Auto-generated
✅ updated_at (timestamptz) - Auto-generated
```

4. اضغط **"Save"**

---

### 4.2 إنشاء جدول الفئات (categories)

1. اضغط **"Create a new table"** مرة أخرى
2. اكتب:

```
Name: categories
Description: Food categories

Columns:
✅ id (int8) - Primary Key - Auto-increment
✅ name (text) - Arabic name (سدور)
✅ value (text) - English value (sudor)
✅ created_at (timestamptz) - Auto-generated
```

3. اضغط **"Save"**

---

### 4.3 إنشاء جدول طلبات رمضان (ramadan_orders)

1. اضغط **"Create a new table"** مرة أخرى
2. اكتب:

```
Name: ramadan_orders
Description: Ramadan orders

Columns:
✅ id (int8) - Primary Key - Auto-increment
✅ serial_number (int4) - Order serial number
✅ customer_name (text) - Customer name
✅ phone_number (text) - Phone number
✅ delivery_type (text) - توصيل or استلام
✅ delivery_address (text) - Delivery address (nullable)
✅ other_details (text) - Other details (nullable)
✅ items (jsonb) - Order items array
✅ total_amount (float8) - Total price
✅ order_date (timestamptz) - Order date - Default: now()
✅ created_at (timestamptz) - Auto-generated
```

3. اضغط **"Save"**

---

## 🔐 الخطوة 5: تفعيل Row Level Security (RLS)

### ⚠️ **مهم جدًا للأمان!**

نحتاج نسمح للقراءة للجميع، لكن الكتابة للـ Admin فقط:

#### 5.1 للمنيو والفئات:
1. اذهب لـ **Table Editor**
2. اختار `menu_items`
3. اضغط **"View Policies"** (أعلى الجدول)
4. اضغط **"Enable RLS"**
5. اضغط **"New Policy"**
6. اختار **"Create policy from scratch"**

**Policy 1: Read (للجميع)**
```
Policy name: Enable read for all users
SELECT: ✅ Enabled
Check: true
```
اضغط **"Save Policy"**

**Policy 2: Write (للـ Admin فقط)**
```
Policy name: Enable insert/update/delete for authenticated users
INSERT: ✅ Enabled
UPDATE: ✅ Enabled
DELETE: ✅ Enabled
Check: (auth.role() = 'authenticated')
```
اضغط **"Save Policy"**

#### 5.2 كرر نفس الخطوات لـ:
- `categories` table
- `ramadan_orders` table

---

## ✅ الخطوة 6: ملء البيانات الأساسية (Optional)

### إضافة فئة "سدور" الافتراضية:

1. اذهب لـ **Table Editor**
2. اختار `categories`
3. اضغط **"Insert" → "Insert row"**
4. املأ:
   ```
   name: سدور
   value: sudor
   ```
5. اضغط **"Save"**

---

## 🔗 الخطوة 7: تحديث الكود

### افتح ملف `supabase-config.js` في المشروع

```javascript
// supabase-config.js
const SUPABASE_URL = 'YOUR_PROJECT_URL_HERE';  // ضع الـ URL هنا
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE'; // ضع الـ Key هنا
```

**استبدل:**
- `YOUR_PROJECT_URL_HERE` بالـ URL اللي نسخته
- `YOUR_ANON_KEY_HERE` بالـ Key اللي نسخته

---

## 📤 الخطوة 8: رفع الملفات للموقع

1. **افتح Supabase Dashboard**
2. **ارفع كل الملفات الجديدة لـ GitHub:**
   - `supabase-config.js` ⭐ (مهم!)
   - `supabase-db.js` ⭐ (مهم!)
   - الملفات المعدلة:
     - `admin-secure.js`
     - `food-menu.js`
     - `ramadan.js`
     - `admin-dashboard.html`
     - `admin-ramadan.html`

3. **Commit وانشر التغييرات**

---

## 🧪 الخطوة 9: اختبار النظام

### اختبار 1: المنيو
1. سجل دخول للـ Admin Dashboard
2. أضف صنف جديد
3. افتح من جهاز/متصفح آخر
4. ✅ يجب أن يظهر الصنف الجديد!

### اختبار 2: طلبات رمضان
1. افتح صفحة طلبات رمضان
2. أضف طلب جديد
3. افتح من جهاز آخر
4. ✅ يجب أن يظهر الطلب!

### اختبار 3: التعديلات المباشرة
1. عدّل على صنف من جهاز
2. افتح الموقع من أي مكان
3. ✅ التعديلات تظهر للجميع!

---

## 🎉 تم! النظام يشتغل الآن

### ✅ الفوائد:
- 🌐 البيانات على السحابة - مش على جهازك
- 🔄 التعديلات تظهر مباشرة للجميع
- 📱 افتح من أي جهاز - نفس البيانات
- 💾 Backup تلقائي - ما تخاف تضيع
- 🚀 سريع وآمن
- 💰 مجاني 100%!

---

## ❓ الأسئلة الشائعة

### س: هل Supabase آمن؟
✅ **نعم!** استخدمنا Row Level Security (RLS) - أحد أفضل أنظمة الحماية

### س: كم يكلف؟
✅ **مجاني!** حتى 500 MB storage و 50,000 rows - أكثر من كافي!

### س: لو حذفت الـ Project بالغلط؟
✅ Supabase عنده Backup تلقائي - ممكن تسترجع البيانات

### س: الـ Telegram بقى يشتغل؟
✅ **نعم!** كل خيارات Telegram موجودة زي ما هي

### س: ممكن أحتفظ بالـ localStorage كنسخة احتياطية؟
✅ **نعم!** الكود يحاول localStorage أولاً كـ cache

---

## 🆘 المساعدة

لو واجهت أي مشكلة:
1. تأكد إنك حطيت الـ URL والـ Key صح في `supabase-config.js`
2. تأكد إن الـ RLS Policies شغالة
3. افتح Console في المتصفح (F12) - شوف الأخطاء
4. راجع الخطوات مرة ثانية

---

## 🎯 الخلاصة

الآن عندك:
✅ قاعدة بيانات سحابية (Supabase)
✅ التعديلات تظهر للجميع مباشرة
✅ تقدر تفتح من أي جهاز
✅ الطلبات محفوظة على السحابة
✅ نظام آمن ومحمي
✅ مجاني ومفتوح المصدر

**مبروك! موقعك صار Professional 🎉**

