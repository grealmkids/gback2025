-- Update production database schema with missing tables
-- Run this script in your production database's SQL query runner (e.g. phpMyAdmin)

USE greatmcj_grealm;

-- 5. Categories table
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `type` VARCHAR(255) NULL COMMENT 'e.g., VIDEO, PDF, COLLECTION, BOOK',
  `icon` VARCHAR(255) NULL,
  `displayOrder` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. HomepageServices table
CREATE TABLE IF NOT EXISTS `HomepageServices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `icon` VARCHAR(255) NOT NULL,
  `cardClass` VARCHAR(255) NOT NULL,
  `text` TEXT NOT NULL,
  `displayOrder` INT DEFAULT 0,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Videos table
CREATE TABLE IF NOT EXISTS `videos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `price` INT DEFAULT 0,
  `fileUrl` VARCHAR(255) NULL,
  `previewUrl` VARCHAR(255) NULL,
  `thumbnail` VARCHAR(255) NULL,
  `categoryId` INT NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_video_category` (`categoryId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Books table
CREATE TABLE IF NOT EXISTS `books` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `price` INT DEFAULT 0,
  `fileUrl` VARCHAR(255) NULL COMMENT 'PDF Link',
  `coverImage` VARCHAR(255) NULL,
  `categoryId` INT NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_book_category` (`categoryId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. African Stories table
CREATE TABLE IF NOT EXISTS `african_stories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `price` DECIMAL(10, 2) DEFAULT 0.00,
  `thumbnail` VARCHAR(255) NULL,
  `videoUrl` VARCHAR(255) NULL,
  `storyBookUrl` VARCHAR(255) NULL COMMENT 'Colored Story Book PDF',
  `coloringBookUrl` VARCHAR(255) NULL COMMENT 'Coloring Book Version PDF',
  `flashcardsUrl` VARCHAR(255) NULL COMMENT 'Flashcards PDF',
  `audioUrl` VARCHAR(255) NULL,
  `categoryId` INT NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_african_story_category` (`categoryId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Categories (Basic structure)
INSERT INTO `categories` (`name`, `type`, `icon`, `displayOrder`) VALUES 
('Kindergarten Albums', 'COLLECTION', 'fas fa-music', 1),
('African Stories', 'collection', 'fas fa-book-open', 2),
('Movies/Animations', 'VIDEO', 'fas fa-video', 3),
('Story Books', 'PDF', 'fas fa-book', 4),
('Memory Verses', 'VIDEO', 'fas fa-bible', 5);

-- Seed Homepage Services
INSERT INTO `HomepageServices` (`icon`, `cardClass`, `text`, `displayOrder`) VALUES
('bi bi-film', 'card-blue', 'Film & Animation Production', 1),
('bi bi-music-note-beamed', 'card-purple', 'Audio & Music Production', 2),
('bi bi-cpu', 'card-pink', 'AI Content Generation', 3),
('bi bi-globe', 'card-cyan', 'Web & App Development', 4);
