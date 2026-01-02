-- Migration: Add project-related columns to album table
-- Adds: description, status, youtubeUrl, s3Url

ALTER TABLE `album`
  ADD COLUMN `description` TEXT NULL AFTER `previewvideo`,
  ADD COLUMN `status` VARCHAR(50) NOT NULL DEFAULT 'completed' AFTER `description`,
  ADD COLUMN `youtubeUrl` VARCHAR(255) NULL AFTER `status`,
  ADD COLUMN `s3Url` VARCHAR(255) NULL AFTER `youtubeUrl`;

-- Add index for faster lookups by status
CREATE INDEX IF NOT EXISTS `idx_status` ON `album` (`status`);