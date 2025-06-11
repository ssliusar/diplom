require('dotenv').config();

module.exports = {
    server: process.env.SERVER_ADDRESS,
    account: process.env.ACCESS_ID,
    secret: process.env.ACCESS_KEY,
    storage: process.env.STORAGE_NAME,
    dialect: "postgres"
};