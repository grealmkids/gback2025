-- Create all tables for the Grealm backend application
-- Run this script in phpMyAdmin to create the database structure

-- Use the existing database (should already be created in cPanel)
USE greatmcj_grealm;

-- 1. Users table
CREATE TABLE IF NOT EXISTS `user` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(255) NOT NULL DEFAULT 'client',
  `accountStatus` VARCHAR(255) NOT NULL DEFAULT 'unverified',
  `verification_code` VARCHAR(255) NULL,
  `phone` VARCHAR(255) NULL UNIQUE,
  `firstname` VARCHAR(255) NULL,
  `lastname` VARCHAR(255) NULL,
  `country` VARCHAR(255) NULL,
  INDEX `idx_email` (`email`),
  INDEX `idx_phone` (`phone`),
  INDEX `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Albums table
CREATE TABLE IF NOT EXISTS `album` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `image` VARCHAR(255) NOT NULL,
  `songs` INT NOT NULL,
  `video` INT NOT NULL,
  `audio` INT NOT NULL,
  `coloringPics` INT NOT NULL,
  `coloredPics` INT NOT NULL,
  `ugx` VARCHAR(255) NOT NULL,
  `usd` FLOAT NOT NULL,
  `contents` JSON NOT NULL,
  `downloadUrl` VARCHAR(255) NULL,
  `previewvideo` VARCHAR(255) NULL COMMENT 'URL or path to preview video for the album cover',
  `description` TEXT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'completed',
  `youtubeUrl` VARCHAR(255) NULL,
  `s3Url` VARCHAR(255) NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_title` (`title`),
  INDEX `idx_usd` (`usd`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Client-Album relationship table
CREATE TABLE IF NOT EXISTS `client_album` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `albumId` INT NOT NULL,
  FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`albumId`) REFERENCES `album`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY `unique_user_album` (`userId`, `albumId`),
  INDEX `idx_userId` (`userId`),
  INDEX `idx_albumId` (`albumId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Billing Addresses table
CREATE TABLE IF NOT EXISTS `billing_addresses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `branch` VARCHAR(255) NOT NULL,
  `email_address` VARCHAR(255) NOT NULL,
  `phone_number` VARCHAR(255) NOT NULL,
  `country_code` VARCHAR(255) NOT NULL DEFAULT 'KE',
  `first_name` VARCHAR(255) NOT NULL,
  `middle_name` VARCHAR(255) NULL,
  `last_name` VARCHAR(255) NOT NULL,
  `line_1` TEXT NOT NULL,
  `line_2` TEXT NULL,
  `city` VARCHAR(255) NULL,
  `state` VARCHAR(255) NULL,
  `postal_code` VARCHAR(255) NULL,
  `zip_code` VARCHAR(255) NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY `unique_user_billing` (`userId`),
  INDEX `idx_userId_billing` (`userId`),
  INDEX `idx_email_address` (`email_address`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data

-- Sample Users
INSERT INTO `user` (`email`, `password`, `role`, `accountStatus`, `phone`, `firstname`, `lastname`, `country`) VALUES
('admin@grealm.com', '$2b$10$hashedpassword', 'admin', 'verified', NULL, 'Admin', 'User', 'Uganda'),
('ochalfie@gmail.com', '', 'client', 'unverified', '256773913902', 'Alfred', 'Ochwo', 'Uganda'),
('grealmkids@gmail.com', '', 'client', 'unverified', '256701234567', 'Grealm', 'Kids', 'Uganda');

-- Sample Albums
INSERT INTO `album` (`title`, `image`, `songs`, `video`, `audio`, `coloringPics`, `coloredPics`, `ugx`, `usd`, `contents`, `downloadUrl`, `previewvideo`, `description`, `status`, `youtubeUrl`, `s3Url`, `createdAt`, `updatedAt`) VALUES
('Domestic Animals', '/assets/domesticanimals.jpg', 4, 4, 4, 15, 15, '10,000', 4.00, 
 '[\"Domestic Animal Names\", \"Domestic Animal Sounds\", \"Domestic Animal Homes\", \"Domestic Animal Young Ones\", \"11 Domestic Animals\"]', 
 'http://example.com/domestic-animals', '/assets/previews/domestic-animals-preview.mp4', 'A fun collection of domestic animals for kids', 'completed', NULL, NULL, NOW(), NOW()),

('Wild Animals', '/assets/wildanimals.jpg', 6, 5, 6, 20, 20, '12,000', 5.00, 
 '[\"Wild Animal Names\", \"Wild Animal Sounds\", \"Animal Habitats\", \"Predators and Prey\", \"Safari Adventure\", \"Jungle Sounds\"]', 
 'http://example.com/wild-animals', '/assets/previews/wild-animals-preview.mp4', 'Exciting wild animal adventures', 'completed', NULL, NULL, NOW(), NOW()),

('Ocean Life', '/assets/oceanlife.jpg', 5, 4, 5, 18, 18, '11,000', 4.50, 
 '[\"Sea Creatures\", \"Ocean Sounds\", \"Underwater Adventure\", \"Fish and Dolphins\", \"Deep Sea Exploration\"]', 
 'http://example.com/ocean-life', '/assets/previews/ocean-life-preview.mp4', 'Explore ocean life and creatures', 'completed', NULL, NULL, NOW(), NOW()),

('Farm Animals', '/assets/farmanimals.jpg', 7, 6, 7, 25, 25, '9,000', 3.50, 
 '[\"Farm Animal Names\", \"Farm Sounds\", \"Life on the Farm\", \"Baby Farm Animals\", \"Farming Activities\", \"Barn Life\", \"Farm Vehicles\"]', 
 'http://example.com/farm-animals', '/assets/previews/farm-animals-preview.mp4', 'A kids friendly farm adventure', 'completed', NULL, NULL, NOW(), NOW()),

('Birds of the Sky', '/assets/birds.jpg', 5, 4, 5, 16, 16, '10,500', 4.25, 
 '[\"Bird Songs\", \"Flying High\", \"Nest Building\", \"Bird Migration\", \"Colorful Feathers\"]', 
 'http://example.com/birds-sky', '/assets/previews/birds-preview.mp4', 'Songs and stories about birds', 'completed', NULL, NULL, NOW(), NOW());

-- Sample Client-Album relationships
INSERT INTO `client_album` (`userId`, `albumId`) VALUES
(2, 1), -- ochalfie@gmail.com owns Domestic Animals
(2, 2), -- ochalfie@gmail.com owns Wild Animals
(3, 1); -- grealmkids@gmail.com owns Domestic Animals

-- Verify the tables were created successfully
SHOW TABLES;

-- Check table structures
DESCRIBE `user`;
DESCRIBE `album`;
DESCRIBE `client_album`;
DESCRIBE `billing_addresses`;

-- Check sample data
SELECT COUNT(*) as user_count FROM `user`;
SELECT COUNT(*) as album_count FROM `album`;
SELECT COUNT(*) as client_album_count FROM `client_album`;
SELECT COUNT(*) as billing_address_count FROM `billing_addresses`;
