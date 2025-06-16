const redis = require('redis');
const { promisify } = require('util');

const client = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
});

client.on('error', (err) => {
    console.error('Redis error:', err);
});

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

const cache = {
    async get(key) {
        const data = await getAsync(key);
        return data ? JSON.parse(data) : null;
    },

    async set(key, value, expiration = 3600) {
        await setAsync(key, JSON.stringify(value), 'EX', expiration);
    },

    async del(key) {
        await client.del(key);
    },
};

module.exports = cache;