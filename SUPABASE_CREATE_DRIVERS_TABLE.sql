-- ===== إنشاء جدول السائقين =====

-- 1. إنشاء جدول drivers
CREATE TABLE IF NOT EXISTS drivers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  vehicle_type TEXT,
  vehicle_plate TEXT,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. تفعيل Row Level Security
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;

-- 3. السماح بالقراءة للجميع
CREATE POLICY "Allow public read access on drivers" 
ON drivers 
FOR SELECT 
USING (true);

-- 4. السماح بالكتابة للجميع (محمي من خلال Admin Dashboard)
CREATE POLICY "Allow all operations on drivers" 
ON drivers 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 5. إدخال سائق تجريبي
INSERT INTO drivers (name, phone_number, vehicle_type, vehicle_plate, status, notes)
VALUES (
  'محمد أحمد',
  '0791234567',
  'سيارة',
  'ABC-123',
  'active',
  'سائق متميز'
);

-- تأكيد النجاح
SELECT 
  'تم إنشاء جدول السائقين بنجاح! ✅' as status,
  COUNT(*) as total_drivers
FROM drivers;

