const skipApiKeyValidation = (req, res, next) => {
    // Skip API key validation for all portfolio routes
    next();
};

module.exports = {
    skipApiKeyValidation
};
