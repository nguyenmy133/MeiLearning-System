-- =============================================================================
-- MeiLearning System — Database Migration Script
-- Idempotent: an toàn khi chạy nhiều lần (IF NOT EXISTS, DO $$ ... END $$)
-- =============================================================================

-- v2: Multi-device refresh token support
-- Thêm các cột mới vào bảng refresh_tokens
ALTER TABLE refresh_tokens
  ADD COLUMN IF NOT EXISTS remember_me  BOOLEAN                   NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS device_id    VARCHAR(128);

-- Backfill updated_at cho các rows cũ chưa có giá trị
UPDATE refresh_tokens
  SET updated_at = created_at
  WHERE updated_at IS NULL;

-- Đặt NOT NULL constraint sau khi đã có data
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name  = 'refresh_tokens'
      AND column_name = 'updated_at'
      AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE refresh_tokens ALTER COLUMN updated_at SET NOT NULL;
  END IF;
END $$;

-- Xoá token cũ có format không hợp lệ (UUID = 36 ký tự, token JWT cũ sẽ dài hơn)
DELETE FROM refresh_tokens WHERE length(token) != 36;
