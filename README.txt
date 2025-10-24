🔒 الملفات الآمنة للرفع اليدوي
================================

✅ هذا المجلد يحتوي على جميع الملفات الآمنة فقط
================================

📁 محتويات المجلد:
-------------------

📄 HTML (9 ملفات):
- index.html
- menu.html
- food-menu.html
- order.html
- location.html
- review.html
- admin.html
- admin-dashboard.html
- admin-ramadan.html

🎨 CSS (3 ملفات):
- styles.css
- food-menu.css
- admin.css

⚙️ JavaScript (5 ملفات - آمنة):
- script.js
- food-menu.js
- admin-secure.js ⭐ (آمن - يستخدم Worker)
- ramadan.js
- cloudflare-worker.js

🖼️ الصور (7 ملفات):
- logo.png
- whatsapp.png
- instagram.png
- facebook.png
- 1.webp
- 2.webp
- 3.webp

📁 مجلد الصور:
- picturesfood/ (جميع صور الأطباق)

⚙️ ملفات التكوين (5 ملفات):
- _redirects
- CNAME
- robots.txt
- sitemap.xml
- .gitignore

================================

🚀 طريقة الرفع اليدوي:
-----------------------

1. افتح GitHub Desktop أو Git GUI
2. انتقل إلى repository الخاص بك
3. انسخ جميع الملفات من هذا المجلد
4. الصقها في مجلد repository
5. Commit التغييرات:
   الرسالة: "Updated with secure admin system"
6. Push إلى GitHub

أو من الـ Terminal:
-------------------

cd /path/to/your/repo
cp -r /home/zaid/Desktop/secret/menu/menumenu/* .
git add .
git commit -m "Updated with secure admin system"
git push origin main

================================

⚠️ مهم جداً قبل الرفع:
-----------------------

✅ تأكد أن admin.html يستخدم admin-secure.js
   افتح admin.html وتأكد من:
   <script src="admin-secure.js"></script>

✅ تأكد أن admin-dashboard.html يستخدم admin-secure.js
   <script src="admin-secure.js"></script>

✅ تأكد أن admin-ramadan.html يستخدم admin-secure.js
   <script src="admin-secure.js"></script>

================================

🔐 الأمان:
-----------

✅ لا توجد كلمات مرور في هذه الملفات
✅ لا توجد Bot Tokens في هذه الملفات
✅ جميع الأسرار في Cloudflare Workers فقط
✅ admin-secure.js آمن (يستخدم Worker للمصادقة)

================================

🎯 بعد الرفع:
-------------

1. انتظر 1-2 دقيقة (GitHub Pages يحتاج وقت)
2. افتح: https://sheikh-resturant.com/admin.html
3. سجّل دخول بكلمة المرور من Auth Worker
4. جرّب الإدخال السريع
5. جرّب التليجرام (رفع/تحميل)

================================

✅ كل شي جاهز للرفع بأمان!
رمضان كريم! 🌙

================================

