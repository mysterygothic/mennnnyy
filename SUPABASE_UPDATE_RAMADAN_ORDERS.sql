-- ===== تحديث جدول طلبات رمضان لإضافة السائق والمبلغ النقدي =====

-- إضافة حقل driver_id (معرّف السائق المُعيّن للطلب)
ALTER TABLE ramadan_orders 
ADD COLUMN IF NOT EXISTS driver_id BIGINT REFERENCES drivers(id) ON DELETE SET NULL;

-- إضافة حقل driver_name (اسم السائق - للعرض السريع)
ALTER TABLE ramadan_orders 
ADD COLUMN IF NOT EXISTS driver_name TEXT;

-- إضافة حقل cash_amount (المبلغ النقدي المطلوب من السائق)
ALTER TABLE ramadan_orders 
ADD COLUMN IF NOT EXISTS cash_amount NUMERIC(10,2) DEFAULT 0;

-- إضافة حقل delivery_status (حالة التوصيل)
ALTER TABLE ramadan_orders 
ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'pending';

-- إضافة حقل delivery_notes (ملاحظات التوصيل)
ALTER TABLE ramadan_orders 
ADD COLUMN IF NOT EXISTS delivery_notes TEXT;

-- إضافة index لتسريع البحث بالسائق
CREATE INDEX IF NOT EXISTS idx_ramadan_orders_driver_id 
ON ramadan_orders(driver_id);

-- إضافة index لتسريع البحث بحالة التوصيل
CREATE INDEX IF NOT EXISTS idx_ramadan_orders_delivery_status 
ON ramadan_orders(delivery_status);

-- تأكيد النجاح
SELECT 
  'تم تحديث جدول طلبات رمضان بنجاح! ✅' as status,
  COUNT(*) as total_orders
FROM ramadan_orders;

-- عرض البنية الجديدة للجدول
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'ramadan_orders'
ORDER BY ordinal_position;

