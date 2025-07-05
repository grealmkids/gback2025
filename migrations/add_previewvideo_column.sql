-- Migration to add previewvideo column to album table
-- Run this in MySQL Workbench to add the new column

ALTER TABLE grealm.album 
ADD COLUMN previewvideo VARCHAR(255) NULL 
COMMENT 'URL or path to preview video for the album cover'
AFTER downloadUrl;

-- Update existing albums with sample preview videos (optional)
UPDATE grealm.album SET previewvideo = CONCAT('/assets/previews/', LOWER(REPLACE(title, ' ', '-')), '-preview.mp4') WHERE id > 0;

-- Or set specific preview videos for existing albums
-- UPDATE grealm.album SET previewvideo = '/assets/previews/domestic-animals-preview.mp4' WHERE title = 'Domestic Animals';
-- UPDATE grealm.album SET previewvideo = '/assets/previews/wild-animals-preview.mp4' WHERE title = 'Wild Animals';

-- Verify the changes
SELECT id, title, image, previewvideo FROM grealm.album;
