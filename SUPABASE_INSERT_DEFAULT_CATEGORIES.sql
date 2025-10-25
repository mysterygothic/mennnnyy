-- ===== إدخال الفئات الافتراضية =====

-- حذف الفئات الموجودة (إذا كنت تريد البداية من الصفر)
-- TRUNCATE TABLE categories RESTART IDENTITY CASCADE;

-- إدراج فئة سدور
INSERT INTO categories (name, value)
VALUES ('سدور', 'sudor')
ON CONFLICT DO NOTHING;

-- إدراج فئات إضافية (يمكنك إضافة المزيد)
INSERT INTO categories (name, value)
VALUES 
  ('مشويات', 'grills'),
  ('مقبلات', 'appetizers'),
  ('حلويات', 'desserts'),
  ('مشروبات', 'drinks')
ON CONFLICT DO NOTHING;

-- تأكيد النجاح
SELECT 
  'تم إدخال الفئات بنجاح! ✅' as status,
  COUNT(*) as total_categories
FROM categories;

-- عرض جميع الفئات
SELECT * FROM categories ORDER BY id;

