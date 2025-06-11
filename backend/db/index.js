const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const connectionSettings = require('./dbSetting.js');

const sequelize = new Sequelize(connectionSettings.storage, connectionSettings.account, connectionSettings.secret, {
    host: connectionSettings.server,
    dialect: "postgres",
    port: 5432,
    pool:  {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    dialectOptions: {
        ssl: false
    },
    logging: false,
});

const db = {};

fs.readdirSync(__dirname)
    .filter(file => file.indexOf('.') !== 0 && file !== 'index.js' && file !== 'dbSetting.js')
    .forEach(file => {
        const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;