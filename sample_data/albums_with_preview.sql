-- Sample INSERT statements with previewvideo column
-- Use these for adding new albums to your database

INSERT INTO grealm.album (title, image, songs, video, audio, coloringPics, coloredPics, ugx, usd, contents, downloadUrl, previewvideo, createdAt, updatedAt) VALUES
('Domestic Animals', '/assets/domesticanimals.jpg', 4, 4, 4, 15, 15, '10,000', 4.00, 
 JSON_ARRAY('Domestic Animal Names', 'Domestic Animal Sounds', 'Domestic Animal Homes', 'Domestic Animal Young Ones', '11 Domestic Animals'), 
 'http://example.com/domestic-animals', '/assets/previews/domestic-animals-preview.mp4', NOW(), NOW()),

('Wild Animals', '/assets/wildanimals.jpg', 6, 5, 6, 20, 20, '12,000', 5.00, 
 JSON_ARRAY('Wild Animal Names', 'Wild Animal Sounds', 'Animal Habitats', 'Predators and Prey', 'Safari Adventure', 'Jungle Sounds'), 
 'http://example.com/wild-animals', '/assets/previews/wild-animals-preview.mp4', NOW(), NOW()),

('Ocean Life', '/assets/oceanlife.jpg', 5, 4, 5, 18, 18, '11,000', 4.50, 
 JSON_ARRAY('Sea Creatures', 'Ocean Sounds', 'Underwater Adventure', 'Fish and Dolphins', 'Deep Sea Exploration'), 
 'http://example.com/ocean-life', '/assets/previews/ocean-life-preview.mp4', NOW(), NOW()),

('Farm Animals', '/assets/farmanimals.jpg', 7, 6, 7, 25, 25, '9,000', 3.50, 
 JSON_ARRAY('Farm Animal Names', 'Farm Sounds', 'Life on the Farm', 'Baby Farm Animals', 'Farming Activities', 'Barn Life', 'Farm Vehicles'), 
 'http://example.com/farm-animals', '/assets/previews/farm-animals-preview.mp4', NOW(), NOW()),

('Birds of the Sky', '/assets/birds.jpg', 5, 4, 5, 16, 16, '10,500', 4.25, 
 JSON_ARRAY('Bird Songs', 'Flying High', 'Nest Building', 'Bird Migration', 'Colorful Feathers'), 
 'http://example.com/birds-sky', '/assets/previews/birds-preview.mp4', NOW(), NOW());
