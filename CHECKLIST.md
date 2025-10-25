# ✅ Checklist - تحقق من كل خطوة

## 📋 قبل البدء

- [ ] الكمبيوتر متصل بالإنترنت
- [ ] عندك حساب GitHub
- [ ] المتصفح مفتوح

---

## 🚀 الخطوات (5 دقائق)

### ☑️ الخطوة 1: إنشاء حساب Supabase
- [ ] فتحت https://supabase.com
- [ ] ضغطت "Start your project"
- [ ] سجلت دخول بـ GitHub
- [ ] وصلت لـ Dashboard

### ☑️ الخطوة 2: إنشاء Project
- [ ] ضغطت "New Project"
- [ ] اسم Project: `mataam-shiekh`
- [ ] اخترت Password قوي
- [ ] حفظت Password في مكان آمن
- [ ] اخترت Region (Frankfurt/Bahrain)
- [ ] اخترت Free Plan
- [ ] ضغطت "Create new project"
- [ ] انتظرت 1-2 دقيقة

### ☑️ الخطوة 3: نسخ API Keys
- [ ] فتحت Settings → API
- [ ] نسخت Project URL
- [ ] نسخت anon public key (وليس service_role)
- [ ] حفظتهم في ملف نصي

### ☑️ الخطوة 4: إنشاء الجداول
- [ ] فتحت SQL Editor
- [ ] ضغطت "New query"
- [ ] نسخت والصقت SQL من الدليل
- [ ] ضغطت "Run"
- [ ] شفت رسالة Success ✅
- [ ] تأكدت من Table Editor (3 جداول)

### ☑️ الخطوة 5: تحديث الكود
- [ ] فتحت `supabase-config.js`
- [ ] حطيت Project URL
- [ ] حطيت anon key
- [ ] حفظت الملف (Ctrl+S)

### ☑️ الخطوة 6: رفع لـ GitHub
- [ ] فتحت Terminal
- [ ] نفذت: `git add supabase-config.js supabase-db.js`
- [ ] نفذت: `git add admin-secure.js ramadan.js food-menu.js`
- [ ] نفذت: `git add admin-dashboard.html admin-ramadan.html`
- [ ] نفذت: `git commit -m "✨ Add Supabase database"`
- [ ] نفذت: `git push origin main`

### ☑️ الخطوة 7: انتظار النشر
- [ ] فتحت GitHub → Actions
- [ ] شفت workflow ✅ أخضر
- [ ] انتظرت 1-2 دقيقة

### ☑️ الخطوة 8: اختبار الموقع
- [ ] فتحت الموقع
- [ ] ضغطت F12 (Console)
- [ ] شفت: ✅ Supabase connected successfully!

### ☑️ الخطوة 9: اختبار الوظائف
- [ ] أضفت صنف جديد للمنيو
- [ ] فتحت من جهاز آخر - ظهر الصنف ✅
- [ ] أضفت طلب رمضان
- [ ] شفته في Supabase Dashboard ✅

---

## 🎉 انتهيت!

إذا كل الصناديق معلمة ✅ = **مبروك! نجحت!** 🎊

---

## 📝 ملاحظات (اكتب هنا):

**Project URL:**
```
_________________________________
```

**Password:**
```
_________________________________
```

**تاريخ الإنشاء:**
```
_________________________________
```

---

## 🆘 إذا واجهت مشكلة

راجع:
- [ ] `STEP_BY_STEP_VISUAL.md` - الدليل المفصل
- [ ] `README_ARABIC.md` - الملخص الكامل
- [ ] Console (F12) - شوف الأخطاء

