const router = require('express').Router();
const { users } = require('../db');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require("../middleware/auth.middleware");

router.post("/login",  async (req, res) => {
    try {

        const { email, password } = req.body;

        const CurrentUser = await users.findOne({ where: { email } });

        if (!CurrentUser) {
            return res.status(400).json({ message: 'Ви вказали невірний логін або пароль' });
        }

        const checkUserPassword = await bcrypt.compare(password, CurrentUser.password);
        if (!checkUserPassword) {
            return res.status(400).json({ message: 'Ви вказали невірний логін або пароль' });
        }

        const token = jwt.sign(
            { id: CurrentUser.id, type: CurrentUser.type, points: CurrentUser?.points },
            process.env.SECRET_KEY,
            { expiresIn: '6h' }
        );

        res.json({
            token,
            user: {
                id: CurrentUser.id,
                points: CurrentUser?.points,
                type: CurrentUser.type
            }
        });

    } catch (e) {
        console.error(e)
        res.status(500).send();
    }
})

router.post("/register",  async (req, res) => {
    try {

        const { email, username, phoneNumber, password } = req.body;

        const findCurrentEmail = await users.findOne({ where: { email } });
        if (findCurrentEmail) {
            return res.status(400).json({ message: 'Користувач з такою електронною поштою вже зареєстрований' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const createdUser = await users.create({
            email,
            username,
            phoneNumber,
            password: hashedPassword,
            ban:false
        });

        const token = jwt.sign(
            { id: createdUser.id, email: createdUser.email, type: createdUser.type, points: createdUser?.points },
            process.env.SECRET_KEY,
            { expiresIn: '6h' }
        );

        res.status(201).json({
            message: 'Ви успішно зареєстровані',
            token,
            currentUser: {
                id: createdUser.id,
                points: createdUser?.points,
                type: createdUser.type,
            }
        });

    } catch (e) {
        console.error(e)
        res.status(500).send();
    }
})

router.get('/user_verify', authMiddleware,  async (req, res) => {
    try {

        const CurrentUser = await users.findOne({where: {id: req.user.id}});

        return res.status(200).json({
            isValid: true,
            id: req.user.id,
            points: CurrentUser?.points,
            type: CurrentUser?.type
        });
    } catch (e) {
        console.error(e)
        res.status(500).send();
    }
})

module.exports = router;
