const serviceHandler = require("./app.js");
require("dotenv").config();
const { APP_PORT } = process.env
const serviceGateway = APP_PORT || 5050;
const dataStructures = require("./db");
const lotterySchedule = require('./lotterySchedule/lotterySchedule')

dataStructures.sequelize.sync({ force: false, alter: true }).then( () => {
    console.log('Ресурс успішно підключено.')
    serviceHandler.listen(serviceGateway, () => console.log(`Сервер запущено на порті: ${serviceGateway}`))
}).catch(error => console.error('Помилка підключення до бази даних:', error));
