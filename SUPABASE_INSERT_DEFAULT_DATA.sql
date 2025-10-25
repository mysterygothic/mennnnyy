-- ===== إدخال البيانات الافتراضية للمنيو =====
-- نسخ والصق هذا الكود في SQL Editor في Supabase

-- 1. زرب
INSERT INTO menu_items (name, description, base_price, category, image, meat_options, quantity_options, meat_quantity_options)
VALUES (
  'زرب',
  'زرب مع الأرز البسمتي والبهارات الخاصة',
  5,
  'sudor',
  'picturesfood/zarbjaj.jpg',
  '[
    {"type": "دجاج", "image": "picturesfood/zarbjaj.jpg", "priceMultiplier": 1},
    {"type": "لحم", "image": "picturesfood/zarblaham.jpg", "priceMultiplier": 1.5}
  ]'::jsonb,
  '[
    {"label": "سدر نصف دجاجة", "value": "سدر نصف دجاجة", "price": 5},
    {"label": "سدر دجاجة", "value": "سدر دجاجة", "price": 8},
    {"label": "دجاجة ونص", "value": "دجاجة ونص", "price": 12},
    {"label": "دجاجتين", "value": "دجاجتين", "price": 15},
    {"label": "دجاجتين ونص", "value": "دجاجتين ونص", "price": 18},
    {"label": "ثلاث دجاجات", "value": "ثلاث دجاجات", "price": 22}
  ]'::jsonb,
  '[
    {"label": "نصف كيلو", "value": "نصف كيلو", "price": 8},
    {"label": "1 كيلو", "value": "1 كيلو", "price": 13},
    {"label": "كيلو ونص", "value": "كيلو ونص", "price": 21},
    {"label": "2 كيلو", "value": "2 كيلو", "price": 25},
    {"label": "2 كيلو ونص", "value": "2 كيلو ونص", "price": 28},
    {"label": "3 كيلو", "value": "3 كيلو", "price": 32}
  ]'::jsonb
);

-- 2. منسف
INSERT INTO menu_items (name, description, base_price, category, image, meat_options, quantity_options, meat_quantity_options)
VALUES (
  'منسف',
  'منسف مع الأرز واللبن واللوز',
  5,
  'sudor',
  'picturesfood/mansaf.jpg',
  '[
    {"type": "دجاج", "image": "picturesfood/mansaf.jpg", "priceMultiplier": 1},
    {"type": "لحم", "image": "picturesfood/mansaf.jpg", "priceMultiplier": 1.5}
  ]'::jsonb,
  '[
    {"label": "سدر دجاجة", "value": "سدر دجاجة", "price": 8},
    {"label": "دجاجة ونص", "value": "دجاجة ونص", "price": 12},
    {"label": "دجاجتين", "value": "دجاجتين", "price": 15},
    {"label": "دجاجتين ونص", "value": "دجاجتين ونص", "price": 18},
    {"label": "ثلاث دجاجات", "value": "ثلاث دجاجات", "price": 22}
  ]'::jsonb,
  '[
    {"label": "1 كيلو", "value": "1 كيلو", "price": 13},
    {"label": "كيلو ونص", "value": "كيلو ونص", "price": 21},
    {"label": "2 كيلو", "value": "2 كيلو", "price": 25},
    {"label": "2 كيلو ونص", "value": "2 كيلو ونص", "price": 28},
    {"label": "3 كيلو", "value": "3 كيلو", "price": 32}
  ]'::jsonb
);

-- 3. مندي
INSERT INTO menu_items (name, description, base_price, category, image, meat_options, quantity_options, meat_quantity_options)
VALUES (
  'مندي',
  'مندي مع الأرز البسمتي والبهارات',
  5,
  'sudor',
  'picturesfood/mande.jpg',
  '[
    {"type": "دجاج", "image": "picturesfood/mande.jpg", "priceMultiplier": 1},
    {"type": "لحم", "image": "picturesfood/mande.jpg", "priceMultiplier": 1.5}
  ]'::jsonb,
  '[
    {"label": "سدر دجاجة", "value": "سدر دجاجة", "price": 8},
    {"label": "دجاجة ونص", "value": "دجاجة ونص", "price": 12},
    {"label": "دجاجتين", "value": "دجاجتين", "price": 15},
    {"label": "دجاجتين ونص", "value": "دجاجتين ونص", "price": 18},
    {"label": "ثلاث دجاجات", "value": "ثلاث دجاجات", "price": 22}
  ]'::jsonb,
  '[
    {"label": "1 كيلو", "value": "1 كيلو", "price": 13},
    {"label": "كيلو ونص", "value": "كيلو ونص", "price": 21},
    {"label": "2 كيلو", "value": "2 كيلو", "price": 25},
    {"label": "2 كيلو ونص", "value": "2 كيلو ونص", "price": 28},
    {"label": "3 كيلو", "value": "3 كيلو", "price": 32}
  ]'::jsonb
);

-- 4. برياني
INSERT INTO menu_items (name, description, base_price, category, image, meat_options, quantity_options, meat_quantity_options)
VALUES (
  'برياني',
  'برياني حار بالفلفل الحار والخلطة العدنية السرية لمطعم الشيخ',
  5,
  'sudor',
  'picturesfood/breane.jpg',
  '[
    {"type": "دجاج", "image": "picturesfood/breane.jpg", "priceMultiplier": 1},
    {"type": "لحم", "image": "picturesfood/breane.jpg", "priceMultiplier": 1.5}
  ]'::jsonb,
  '[
    {"label": "سدر دجاجة", "value": "سدر دجاجة", "price": 8},
    {"label": "دجاجة ونص", "value": "دجاجة ونص", "price": 12},
    {"label": "دجاجتين", "value": "دجاجتين", "price": 15},
    {"label": "دجاجتين ونص", "value": "دجاجتين ونص", "price": 18},
    {"label": "ثلاث دجاجات", "value": "ثلاث دجاجات", "price": 22}
  ]'::jsonb,
  '[
    {"label": "1 كيلو", "value": "1 كيلو", "price": 13},
    {"label": "كيلو ونص", "value": "كيلو ونص", "price": 21},
    {"label": "2 كيلو", "value": "2 كيلو", "price": 25},
    {"label": "2 كيلو ونص", "value": "2 كيلو ونص", "price": 28},
    {"label": "3 كيلو", "value": "3 كيلو", "price": 32}
  ]'::jsonb
);

-- 5. كبسة
INSERT INTO menu_items (name, description, base_price, category, image, meat_options, quantity_options, meat_quantity_options)
VALUES (
  'كبسة',
  'كبسة سعودية خاصة بمطعم الشيخ عيش تجربة الكبسة السعودية وأطلب كبسة ..',
  5,
  'sudor',
  'picturesfood/kabsa.jpg',
  '[
    {"type": "دجاج", "image": "picturesfood/kabsa.jpg", "priceMultiplier": 1},
    {"type": "لحم", "image": "picturesfood/kabsa.jpg", "priceMultiplier": 1.5}
  ]'::jsonb,
  '[
    {"label": "سدر دجاجة", "value": "سدر دجاجة", "price": 8},
    {"label": "دجاجة ونص", "value": "دجاجة ونص", "price": 12},
    {"label": "دجاجتين", "value": "دجاجتين", "price": 15},
    {"label": "دجاجتين ونص", "value": "دجاجتين ونص", "price": 18},
    {"label": "ثلاث دجاجات", "value": "ثلاث دجاجات", "price": 22}
  ]'::jsonb,
  '[
    {"label": "1 كيلو", "value": "1 كيلو", "price": 13},
    {"label": "كيلو ونص", "value": "كيلو ونص", "price": 21},
    {"label": "2 كيلو", "value": "2 كيلو", "price": 25},
    {"label": "2 كيلو ونص", "value": "2 كيلو ونص", "price": 28},
    {"label": "3 كيلو", "value": "3 كيلو", "price": 32}
  ]'::jsonb
);

-- 6. قدرة
INSERT INTO menu_items (name, description, base_price, category, image, meat_options, quantity_options, meat_quantity_options)
VALUES (
  'قدرة',
  'القدرة الخليلية على أصولها من عند مطعم الشيخ باللحم والدجاج',
  5,
  'sudor',
  'picturesfood/qedra.jpg',
  '[
    {"type": "دجاج", "image": "picturesfood/qedra.jpg", "priceMultiplier": 1},
    {"type": "لحم", "image": "picturesfood/qedra.jpg", "priceMultiplier": 1.5}
  ]'::jsonb,
  '[
    {"label": "سدر دجاجة", "value": "سدر دجاجة", "price": 8},
    {"label": "دجاجة ونص", "value": "دجاجة ونص", "price": 12},
    {"label": "دجاجتين", "value": "دجاجتين", "price": 15},
    {"label": "دجاجتين ونص", "value": "دجاجتين ونص", "price": 18},
    {"label": "ثلاث دجاجات", "value": "ثلاث دجاجات", "price": 22}
  ]'::jsonb,
  '[
    {"label": "1 كيلو", "value": "1 كيلو", "price": 13},
    {"label": "كيلو ونص", "value": "كيلو ونص", "price": 21},
    {"label": "2 كيلو", "value": "2 كيلو", "price": 25},
    {"label": "2 كيلو ونص", "value": "2 كيلو ونص", "price": 28},
    {"label": "3 كيلو", "value": "3 كيلو", "price": 32}
  ]'::jsonb
);

-- 7. فريكة
INSERT INTO menu_items (name, description, base_price, category, image, meat_options, quantity_options, meat_quantity_options)
VALUES (
  'فريكة',
  'فريكة جنين الشهية من مطعم الشيخ بالدجاج واللحم',
  5,
  'sudor',
  'picturesfood/freke.jpg',
  '[
    {"type": "دجاج", "image": "picturesfood/freke.jpg", "priceMultiplier": 1},
    {"type": "لحم", "image": "picturesfood/freke.jpg", "priceMultiplier": 1.5}
  ]'::jsonb,
  '[
    {"label": "سدر دجاجة", "value": "سدر دجاجة", "price": 8},
    {"label": "دجاجة ونص", "value": "دجاجة ونص", "price": 12},
    {"label": "دجاجتين", "value": "دجاجتين", "price": 15},
    {"label": "دجاجتين ونص", "value": "دجاجتين ونص", "price": 18},
    {"label": "ثلاث دجاجات", "value": "ثلاث دجاجات", "price": 22}
  ]'::jsonb,
  '[
    {"label": "1 كيلو", "value": "1 كيلو", "price": 13},
    {"label": "كيلو ونص", "value": "كيلو ونص", "price": 21},
    {"label": "2 كيلو", "value": "2 كيلو", "price": 25},
    {"label": "2 كيلو ونص", "value": "2 كيلو ونص", "price": 28},
    {"label": "3 كيلو", "value": "3 كيلو", "price": 32}
  ]'::jsonb
);

-- تأكيد النجاح
SELECT 
  'تم إدخال البيانات بنجاح! ✅' as status,
  COUNT(*) as total_items
FROM menu_items;

