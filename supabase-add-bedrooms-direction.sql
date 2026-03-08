-- Thêm 2 cột: Số phòng ngủ (bedrooms), Hướng nhà (direction) vào bảng properties
-- Chạy trong Supabase SQL Editor

ALTER TABLE properties
ADD COLUMN IF NOT EXISTS bedrooms integer,
ADD COLUMN IF NOT EXISTS direction text;

COMMENT ON COLUMN properties.bedrooms IS 'Số phòng ngủ';
COMMENT ON COLUMN properties.direction IS 'Hướng nhà (Đông, Tây, Nam, Bắc, Đông Bắc, Đông Nam, Tây Bắc, Tây Nam)';
