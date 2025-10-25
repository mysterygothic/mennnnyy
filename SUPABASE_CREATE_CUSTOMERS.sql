-- ===== إنشاء جدول الزبائن (قاعدة بيانات دائمة) =====

-- 1. إنشاء جدول customers
CREATE TABLE IF NOT EXISTS customers (
  id BIGSERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  delivery_address TEXT,
  order_count INTEGER DEFAULT 1,
  total_spent NUMERIC(10,2) DEFAULT 0,
  last_order_date TIMESTAMPTZ DEFAULT NOW(),
  first_order_date TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(phone_number)
);

-- 2. تفعيل Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- 3. السماح بالقراءة للجميع
CREATE POLICY "Allow public read access on customers" 
ON customers 
FOR SELECT 
USING (true);

-- 4. السماح بالكتابة للجميع (محمي من خلال Admin Dashboard)
CREATE POLICY "Allow all operations on customers" 
ON customers 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 5. إنشاء indexes لتسريع البحث
CREATE INDEX IF NOT EXISTS idx_customers_phone 
ON customers(phone_number);

CREATE INDEX IF NOT EXISTS idx_customers_name 
ON customers(customer_name);

CREATE INDEX IF NOT EXISTS idx_customers_last_order 
ON customers(last_order_date DESC);

-- 6. إضافة زبون تجريبي
INSERT INTO customers (customer_name, phone_number, delivery_address, order_count, total_spent)
VALUES (
  'أحمد محمد',
  '0791234567',
  'شارع الملك حسين، الزرقاء',
  1,
  25.50
)
ON CONFLICT (phone_number) DO NOTHING;

-- تأكيد النجاح
SELECT 
  '✅ تم إنشاء جدول الزبائن بنجاح!' as status,
  COUNT(*) as total_customers
FROM customers;

-- عرض الزبائن الحاليين
SELECT 
  id, 
  customer_name, 
  phone_number, 
  delivery_address,
  order_count,
  total_spent,
  last_order_date
FROM customers
ORDER BY last_order_date DESC;

