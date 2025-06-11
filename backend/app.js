require('dotenv').config();
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const express = require('express');
const service = express();
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const path = require("path");

service.use(express.json({ limit: '100kb' }));
service.use(helmet());

service.use(xss());

service.use(hpp());
service.use(bodyParser.json());
service.use(bodyParser.urlencoded({
    extended: true
}));
service.use(cookieParser());

service.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

service.use('/uploads', (req, res, next) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
}, express.static(path.join(__dirname, 'uploads')));

service.use('/auth/', require('./controllers/authorization'));
service.use('/question/', require('./controllers/question'));
service.use('/catalog/', require('./controllers/catalog'));
service.use('/booking/', require('./controllers/booking'));
service.use('/user/', require('./controllers/profile'));
service.use('/lottery/', require('./controllers/lottery'));

service.use('*', (request, response) => response.status(404).json({ message: 'resource unavailable' }));

module.exports = service;