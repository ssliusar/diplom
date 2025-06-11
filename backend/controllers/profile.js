const router = require('express').Router();
const { users, items } = require('../db');
const authMiddleware = require('../middleware/auth.middleware');
const bcrypt = require("bcrypt");


router.get("/profile", authMiddleware, async (req, res) => {
    try {

        const userId = req.user.id;

        const user = await users.findOne({
            where: { id: userId },
            attributes: ['id', 'username', 'email', 'phoneNumber']
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Користувача не знайдено'
            });
        }

        return res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        console.error('Помилка при отриманні профілю користувача:', error);
        return res.status(500).json({
            success: false,
            message: 'Помилка сервера при отриманні профілю користувача'
        });
    }
});

router.put("/profile", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { username, email, phoneNumber, password } = req.body;

        const user = await users.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Користувача не знайдено'
            });
        }

        const updateData = {};
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (phoneNumber) updateData.phoneNumber = phoneNumber;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        await user.update(updateData);

        return res.status(200).json({
            success: true,
            message: 'Профіль успішно оновлено'
        });

    } catch (error) {
        console.error('Помилка при оновленні профілю користувача:', error);
        return res.status(500).json({
            success: false,
            message: 'Помилка сервера при оновленні профілю користувача'
        });
    }
});

router.get("/my-items", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const userItems = await items.findAll({
            where: {
                user_owner_id: userId,
                archive: false
            }
        });

        return res.status(200).json(userItems);

    } catch (error) {
        console.error('Помилка при отриманні речей користувача:', error);
        return res.status(500).json({
            success: false,
            message: 'Помилка сервера при отриманні речей користувача'
        });
    }
});

router.get("/user-bookings", authMiddleware,  async (req, res) => {
    try {
        const userId = req.user.id;

        const userBookings = await items.findAll({
            where: {
                user_booked_id: userId,
                archive: false
            },
            include: [
                {
                    model: users,
                    as: 'Owner',
                    attributes: ['id', 'username', 'email', 'phoneNumber']
                }
            ]
        });

        return res.status(200).json(userBookings);

    } catch (error) {
        console.error('Помилка при отриманні списку заброньованих товарів:', error);
        return res.status(500).json({
            success: false,
            message: 'Помилка сервера при отриманні списку заброньованих товарів'
        });
    }
});

module.exports = router;