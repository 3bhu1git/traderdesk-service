const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class InstrumentService {
    constructor() {
        this.instruments = [];
        this.cachePath = path.join(__dirname, '../data/instruments.json');
    }

    async loadInstruments() {
        try {
            // Only load from cache, do not download
            if (fs.existsSync(this.cachePath)) {
                const cachedData = fs.readFileSync(this.cachePath, 'utf8');
                this.instruments = JSON.parse(cachedData);
                logger.info('Loaded instruments from cache');
                return;
            }
            // If no cache, leave instruments empty
            logger.warn('No instrument cache found, instruments list is empty');
        } catch (error) {
            logger.error('Failed to load instruments:', error);
            throw error;
        }
    }

    cacheInstruments() {
        try {
            // Ensure data directory exists
            const dataDir = path.dirname(this.cachePath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            // Write to cache file
            fs.writeFileSync(this.cachePath, JSON.stringify(this.instruments));
        } catch (error) {
            logger.error('Failed to cache instruments:', error);
            throw error;
        }
    }

    searchInstruments(query) {
        if (!this.instruments.length) {
            throw new Error('Instruments not loaded');
        }
        // Simple case-insensitive search
        return this.instruments.filter(instrument => {
            return instrument.symbol.toLowerCase().includes(query.toLowerCase()) ||
                   instrument.name.toLowerCase().includes(query.toLowerCase());
        });
    }
}

module.exports = new InstrumentService();