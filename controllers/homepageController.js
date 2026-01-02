const HomepageProduction = require('../models/HomepageProduction');
const HomepageService = require('../models/HomepageService');

exports.getProductions = async (req, res) => {
    try {
        const productions = await HomepageProduction.findAll({
            order: [['displayOrder', 'ASC']]
        });
        res.json(productions);
    } catch (error) {
        console.error('Error fetching productions:', error);
        res.status(500).json({ message: 'Error fetching productions' });
    }
};

exports.getServices = async (req, res) => {
    try {
        const services = await HomepageService.findAll({
            order: [['displayOrder', 'ASC']]
        });
        res.json(services);
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ message: 'Error fetching services' });
    }
};
