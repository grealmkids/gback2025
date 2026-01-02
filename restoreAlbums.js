require('dotenv').config();
const sequelize = require('./config/database');
const Album = require('./models/album');

const albumsData = [
    {
        title: 'Domestic Animals',
        image: '/assets/domesticanimals.jpg',
        songs: 4,
        video: 4,
        audio: 4,
        coloringPics: 15,
        coloredPics: 15,
        ugx: '10,000',
        usd: 4.00,
        contents: [
            'Domestic Animal Names',
            'Domestic Animal Sounds',
            'Domestic Animal Homes',
            'Domestic Animal Young Ones',
            '11 Domestic Animals'
        ],
        downloadUrl: 'http://example.com/domestic-animals',
        previewvideo: '/assets/previews/domestic-animals-preview.mp4',
        status: 'completed'
    },
    {
        title: 'Wild Animals',
        image: '/assets/wildanimals.jpg',
        songs: 6,
        video: 5,
        audio: 6,
        coloringPics: 20,
        coloredPics: 20,
        ugx: '12,000',
        usd: 5.00,
        contents: [
            'Wild Animal Names',
            'Wild Animal Sounds',
            'Animal Habitats',
            'Predators and Prey',
            'Safari Adventure',
            'Jungle Sounds'
        ],
        downloadUrl: 'http://example.com/wild-animals',
        previewvideo: '/assets/previews/wild-animals-preview.mp4',
        status: 'completed'
    },
    {
        title: 'Ocean Life',
        image: '/assets/oceanlife.jpg',
        songs: 5,
        video: 4,
        audio: 5,
        coloringPics: 18,
        coloredPics: 18,
        ugx: '11,000',
        usd: 4.50,
        contents: [
            'Sea Creatures',
            'Ocean Sounds',
            'Underwater Adventure',
            'Fish and Dolphins',
            'Deep Sea Exploration'
        ],
        downloadUrl: 'http://example.com/ocean-life',
        previewvideo: '/assets/previews/ocean-life-preview.mp4',
        status: 'completed'
    },
    {
        title: 'Farm Animals',
        image: '/assets/farmanimals.jpg',
        songs: 7,
        video: 6,
        audio: 7,
        coloringPics: 25,
        coloredPics: 25,
        ugx: '9,000',
        usd: 3.50,
        contents: [
            'Farm Animal Names',
            'Farm Sounds',
            'Life on the Farm',
            'Baby Farm Animals',
            'Farming Activities',
            'Barn Life',
            'Farm Vehicles'
        ],
        downloadUrl: 'http://example.com/farm-animals',
        previewvideo: '/assets/previews/farm-animals-preview.mp4',
        status: 'completed'
    },
    {
        title: 'Birds of the Sky',
        image: '/assets/birds.jpg',
        songs: 5,
        video: 4,
        audio: 5,
        coloringPics: 16,
        coloredPics: 16,
        ugx: '10,500',
        usd: 4.25,
        contents: [
            'Bird Songs',
            'Flying High',
            'Nest Building',
            'Bird Migration',
            'Colorful Feathers'
        ],
        downloadUrl: 'http://example.com/birds-sky',
        previewvideo: '/assets/previews/birds-preview.mp4',
        status: 'completed'
    }
];

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // ensure table exists and is clean
        await Album.sync({ force: true });
        console.log('Created/Reset Album table.');

        // Insert restored data
        await Album.bulkCreate(albumsData);
        console.log(`Successfully restored ${albumsData.length} albums from backup.`);

    } catch (error) {
        console.error('Error restoring albums:', error);
    } finally {
        await sequelize.close();
    }
})();
