-- Migration: 012 - Add device tracking for conditional 2FA
-- Purpose: Track trusted devices to avoid repeated 2FA on same device
-- Create user_devices table to track logged-in devices
CREATE TABLE IF NOT EXISTS user_devices (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- Device identification
  device_fingerprint VARCHAR(255) NOT NULL,
  -- Hash of User-Agent + IP
  device_name VARCHAR(255),
  -- Browser/Device name (e.g., "Chrome on Windows")
  ip_address INET,
  -- IP address
  user_agent TEXT,
  -- Full User-Agent string
  -- Trust management
  is_trusted BOOLEAN DEFAULT FALSE,
  trusted_at TIMESTAMP WITH TIME ZONE,
  trust_expires_at TIMESTAMP WITH TIME ZONE,
  -- Auto-expire after 30 days
  -- Activity tracking
  last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Constraints
  UNIQUE(user_id, device_fingerprint)
);
-- Create indexes for faster lookups
CREATE INDEX idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX idx_user_devices_fingerprint ON user_devices(device_fingerprint);
CREATE INDEX idx_user_devices_trusted ON user_devices(user_id, is_trusted);
-- Add device_id to login history (optional, for audit trail)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_device_fingerprint VARCHAR(255);