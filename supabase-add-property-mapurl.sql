-- Thêm cột lưu link Google Maps cho bất động sản
-- Chạy file này trong Supabase SQL editor

ALTER TABLE properties
ADD COLUMN IF NOT EXISTS mapurl text;

