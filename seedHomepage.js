const HomepageProduction = require('./models/HomepageProduction');
const HomepageService = require('./models/HomepageService');

async function seedHomepageData() {
    try {
        // Check if data exists
        const productionCount = await HomepageProduction.count();
        if (productionCount === 0) {
            await HomepageProduction.bulkCreate([
                {
                    status: 'Completed',
                    statusClass: 'status-green',
                    title: 'Kindergarten Album',
                    subtitle: 'VOLUME 1',
                    details: '36 SONGS',
                    barColor: '#00ff41',
                    displayOrder: 1
                },
                {
                    status: 'Ongoing',
                    statusClass: 'status-blue',
                    title: 'Reading - Sounds',
                    subtitle: 'VOLUME 2',
                    details: '24 SONGS',
                    barColor: '#00aaff',
                    displayOrder: 2
                },
                {
                    status: 'Upcoming',
                    statusClass: 'status-orange',
                    title: 'Babu & the Goose',
                    subtitle: 'FULL MOVIE',
                    details: '1 MOVIE',
                    barColor: '#ffaa00',
                    displayOrder: 3
                },
                {
                    status: 'Completed',
                    statusClass: 'status-green',
                    title: 'Worship Hymns',
                    subtitle: 'SPIRITUAL VOL 1',
                    details: '12 SONGS',
                    barColor: '#00ff41',
                    displayOrder: 4
                },
                {
                    status: 'Ongoing',
                    statusClass: 'status-blue',
                    title: 'Math Adventures',
                    subtitle: 'EDUCATIONAL',
                    details: '10 EPISODES',
                    barColor: '#00aaff',
                    displayOrder: 5
                },
                {
                    status: 'Upcoming',
                    statusClass: 'status-orange',
                    title: 'The Lost Lamb',
                    subtitle: 'SHORT FILM',
                    details: 'ANIMATION',
                    barColor: '#ffaa00',
                    displayOrder: 6
                },
                {
                    status: 'Completed',
                    statusClass: 'status-green',
                    title: 'African Tales',
                    subtitle: 'STORYBOOK',
                    details: '5 STORIES',
                    barColor: '#00ff41',
                    displayOrder: 7
                },
                {
                    status: 'Ongoing',
                    statusClass: 'status-blue',
                    title: 'Science Kids',
                    subtitle: 'SEASON 1',
                    details: '8 EPISODES',
                    barColor: '#00aaff',
                    displayOrder: 8
                }
            ]);
            console.log('Dummy Homepage Production data inserted.');
        }

        const serviceCount = await HomepageService.count();
        if (serviceCount === 0) {
            await HomepageService.bulkCreate([
                {
                    icon: 'fa-cube',
                    cardClass: 'card-pink',
                    text: 'Original & Lively animations bringing stories to life.',
                    displayOrder: 1
                },
                {
                    icon: 'fa-camera',
                    cardClass: 'card-green',
                    text: 'Cutting-edge Filmmaking and Movie Production.',
                    displayOrder: 2
                },
                {
                    icon: 'fa-music',
                    cardClass: 'card-purple',
                    text: 'Captivating Afro-beat and gospel music production.',
                    displayOrder: 3
                }
            ]);
            console.log('Dummy Homepage Service data inserted.');
        }

    } catch (error) {
        console.error('Error seeding homepage data:', error);
    }
}

module.exports = seedHomepageData;
