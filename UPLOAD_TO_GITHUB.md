# 🚀 تعليمات رفع الموقع على GitHub Pages

## الخطوات السريعة

### 1. إنشاء مستودع جديد
```bash
# اذهب إلى GitHub.com
# اضغط "New repository"
# اسم المستودع: sheikh-restaurant (أو أي اسم تريده)
# اختر Public
# لا تضع README أو .gitignore
```

### 2. رفع الملفات
```bash
# في مجلد menumenu
git init
git add .
git commit -m "Initial commit - Sheikh Restaurant Website"
git branch -M main
git remote add origin https://github.com/USERNAME/REPOSITORY-NAME.git
git push -u origin main
```

### 3. تفعيل GitHub Pages
1. اذهب إلى إعدادات المستودع (Settings)
2. انتقل إلى "Pages" في القائمة الجانبية
3. اختر "Deploy from a branch"
4. اختر "main" branch
5. اضغط "Save"
6. انتظر 1-2 دقيقة

### 4. الوصول للموقع
- الموقع سيكون متاح على: `https://USERNAME.github.io/REPOSITORY-NAME`
- مثال: `https://zaid.github.io/sheikh-restaurant`

## الملفات المرفوعة

✅ **الصفحات الرئيسية (10 ملفات)**
- index.html, menu.html, food-menu.html
- order.html, location.html, review.html
- admin.html, admin-dashboard.html
- admin-ramadan.html, admin-delivery.html

✅ **ملفات JavaScript (6 ملفات)**
- script.js, food-menu.js, admin-secure.js
- ramadan.js, delivery.js, calculator.js

✅ **ملفات CSS (3 ملفات)**
- styles.css, food-menu.css, admin.css

✅ **الصور والملفات المساعدة**
- 7 صور رئيسية + 10 صور طعام
- CNAME, _redirects, sitemap.xml, robots.txt

## المميزات الجديدة المضافة

🆕 **نظام كشف التكرار**
- علامات حمراء للهواتف المكررة
- إحصائيات التكرار

🆕 **حاسبة مدمجة**
- عمليات حسابية كاملة
- دعم لوحة المفاتيح
- متاحة في جميع صفحات الأدمن

🆕 **إدارة التوصيل**
- تعيين السائقين
- ملخص النقد المطلوب
- تصدير Excel للسائقين

## ملاحظات مهمة

⚠️ **لا ترفع هذه الملفات:**
- cloudflare-worker-*.js (تحتوي على مفاتيح سرية)
- أي ملفات .txt أو .md غير هذا الملف
- مجلد /menu (يحتوي على ملفات سرية)

✅ **الموقع جاهز للعمل فور الرفع!**
