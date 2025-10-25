-- ===== إنشاء جدول المستخدمين الإداريين =====

-- 1. إنشاء جدول admin_users
CREATE TABLE IF NOT EXISTS admin_users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. تفعيل Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 3. السماح بالقراءة للجميع (للتحقق من تسجيل الدخول)
CREATE POLICY "Allow public read access on admin_users" 
ON admin_users 
FOR SELECT 
USING (true);

-- 4. السماح بالكتابة للجميع (محمي من خلال Admin Dashboard)
CREATE POLICY "Allow all operations on admin_users" 
ON admin_users 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 5. إنشاء index لتسريع البحث بالـ username
CREATE INDEX IF NOT EXISTS idx_admin_users_username 
ON admin_users(username);

-- 6. إضافة مستخدم افتراضي (admin/admin123)
-- ملاحظة: يجب تغيير كلمة المرور بعد أول تسجيل دخول!
INSERT INTO admin_users (username, password_hash, full_name, role)
VALUES (
  'admin',
  'admin123', -- يُنصح بتغييرها فوراً!
  'المدير العام',
  'super_admin'
)
ON CONFLICT (username) DO NOTHING;

-- تأكيد النجاح
SELECT 
  '✅ تم إنشاء جدول المستخدمين الإداريين بنجاح!' as status,
  COUNT(*) as total_users
FROM admin_users;

-- عرض المستخدمين الحاليين
SELECT id, username, full_name, role, is_active, created_at
FROM admin_users
ORDER BY created_at DESC;

