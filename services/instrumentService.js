const fs = require('fs');
const path = require('path');
const axios = require('axios');
const logger = require('../utils/logger');

class InstrumentService {
    constructor() {
        this.instruments = [];
        this.cachePath = path.join(__dirname, '../data/instruments.json');
        this.csvUrl = 'https://example.com/instruments/master.csv';
    }

    async loadInstruments() {
        try {
            // Try to load from cache first
            if (fs.existsSync(this.cachePath)) {
                const cachedData = fs.readFileSync(this.cachePath, 'utf8');
                this.instruments = JSON.parse(cachedData);
                logger.info('Loaded instruments from cache');
                return;
            }

            // Download and parse CSV if no cache exists
            await this.downloadAndParseCSV();
        } catch (error) {
            logger.error('Failed to load instruments:', error);
            throw error;
        }
    }

    async downloadAndParseCSV() {
        try {
            logger.info('Downloading instrument master CSV...');
            const response = await axios.get(this.csvUrl);
            
            // Parse CSV data
            const csvData = response.data;
            this.instruments = this.parseCSV(csvData);
            
            // Cache parsed data
            this.cacheInstruments();
            logger.info('Successfully downloaded and cached instruments');
        } catch (error) {
            logger.error('Failed to download instrument CSV:', error);
            throw error;
        }
    }

    parseCSV(csvData) {
        // Implement CSV parsing logic here
        // This is a placeholder - actual implementation will depend on CSV structure
        return csvData.split('\n').slice(1).map(line => {
            const [symbol, name, exchange] = line.split(',');
            return { symbol, name, exchange };
        });
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