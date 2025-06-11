const router = require('express').Router();
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/auth.middleware");
const managerMiddleware = require("../middleware/manager.middlewares")
const { items, users, categories } = require('../db');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const {Op} = require("sequelize");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const fileExt = path.extname(file.originalname);
        const fileName = `${uuidv4()}${fileExt}`;
        cb(null, fileName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Дозволені лише зображення'), false);
        }
        cb(null, true);
    }
});

router.post('/bookings/by-phone', authMiddleware, managerMiddleware, async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: 'Номер телефону не вказаний'
            });
        }

        const user = await users.findOne({
            where: { phoneNumber: phone }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Користувача з вказаним номером телефону не знайдено'
            });
        }

        const bookedItems = await items.findAll({
            where: {
                user_booked_id: user.id,
                archive: false
            },
            include: [
                {
                    model: categories,
                    attributes: ['title']
                },
                {
                    model: users,
                    as: 'Booker',
                    attributes: ['id', 'username', 'phoneNumber']
                },
                {
                    model: users,
                    as: 'Owner',
                    attributes: ['id', 'username', 'phoneNumber']
                }
            ]
        });

        return res.status(200).json({
            success: true,
            user: {
                id: user.id,
                name: user.username,
                phone: user.phoneNumber
            },
            items: bookedItems.map(item => ({
                id: item.id,
                name: item.username,
                description: item.description,
                image: item.image,
                category: item.category?.title,
                points: item.points,
                condition: item.condition,
                booked_end_date: item.booked_end_date,
                owner: item.Owner
            }))
        });
    } catch (error) {
        console.error('Помилка при отриманні заброньованих речей:', error);
        return res.status(500).json({
            success: false,
            message: 'Помилка сервера при отриманні заброньованих речей'
        });
    }
});

router.post('/bookings/confirm', authMiddleware, managerMiddleware, async (req, res) => {
    try {
        const { itemId } = req.body;

        if (!itemId) {
            return res.status(400).json({
                success: false,
                message: 'ID речі не вказаний'
            });
        }

        const item = await items.findOne({
            where: {
                id: itemId,
                archive: false,
                user_booked_id: { [Op.ne]: null }
            }
        });

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Заброньовану річ не знайдено'
            });
        }

        const owner = await users.findByPk(item.user_owner_id);

        if (!owner) {
            return res.status(404).json({
                success: false,
                message: 'Власника речі не знайдено'
            });
        }

        await owner.update({
            points: owner.points + item.points
        });

        await item.update({
            archive: true,
            booked_end_date: null
        });

        return res.status(200).json({
            success: true,
            message: 'Передачу підтверджено, бали зараховано власнику',
            pointsAdded: item.points,
            ownerId: owner.id
        });
    } catch (error) {
        console.error('Помилка при підтвердженні передачі:', error);
        return res.status(500).json({
            success: false,
            message: 'Помилка сервера при підтвердженні передачі'
        });
    }
});

router.post('/bookings/cancel-by-manager', authMiddleware, managerMiddleware, async (req, res) => {
    try {
        const { itemId } = req.body;

        if (!itemId) {
            return res.status(400).json({
                success: false,
                message: 'ID речі не вказаний'
            });
        }

        const item = await items.findOne({
            where: {
                id: itemId,
                archive: false,
                user_booked_id: { [Op.ne]: null }
            }
        });

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Заброньовану річ не знайдено'
            });
        }

        await item.update({
            user_booked_id: null,
            booked_end_date: null
        });

        return res.status(200).json({
            success: true,
            message: 'Бронювання скасовано менеджером'
        });
    } catch (error) {
        console.error('Помилка при скасуванні бронювання:', error);
        return res.status(500).json({
            success: false,
            message: 'Помилка сервера при скасуванні бронювання'
        });
    }
});

router.post('/upload/images', authMiddleware, managerMiddleware, upload.array('images', 3), async (req, res) => {
    try {
        const urls = req.files.map(file => `/uploads/${file.filename}`);

        return res.status(200).json({
            success: true,
            message: 'Зображення успішно завантажені',
            urls
        });
    } catch (error) {
        console.error('Помилка при завантаженні зображень:', error);
        return res.status(500).json({
            success: false,
            message: 'Помилка при завантаженні зображень'
        });
    }
});

router.post('/users/check-phone', authMiddleware, managerMiddleware, async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: 'Номер телефону не вказаний'
            });
        }

        const user = await users.findOne({
            where: { phoneNumber:phone }
        });

        return res.status(200).json({
            success: true,
            exists: !!user,
            user_id: user ? user.id : null
        });
    } catch (error) {
        console.error('Помилка при перевірці користувача:', error);
        return res.status(500).json({
            success: false,
            message: 'Помилка при перевірці користувача'
        });
    }
});

router.post('/items/create', authMiddleware, managerMiddleware, async (req, res) => {
    try {
        const { name, description, category_id, condition, points, phone, image } = req.body;

        if (!name || !description || !category_id || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Не всі обов\'язкові поля заповнені'
            });
        }

        const userOwner = await users.findOne({
            where: { phoneNumber: phone }
        });

        if (!userOwner) {
            return res.status(404).json({
                success: false,
                message: 'Користувача з вказаним номером телефону не знайдено'
            });
        }

        const categoryExists = await categories.findByPk(category_id);

        if (!categoryExists) {
            return res.status(404).json({
                success: false,
                message: 'Вказана категорія не існує'
            });
        }

        const newItem = await items.create({
                category_id,
                user_owner_id: userOwner.id,
                user_booked_id: null,
                image: image || undefined,
                name,
                description,
                booked_end_date: null,
                condition: condition || 5,
                points: points || 5,
                archive: false
        });

        return res.status(201).json({
            success: true,
            message: 'Річ успішно створено',
            item: {
                id: newItem.id,
                name: newItem.name,
                description: newItem.description,
                category_id: newItem.category_id,
                condition: newItem.condition,
                points: newItem.points,
                user_owner_id: newItem.user_owner_id
            }
        });
    } catch (error) {
        console.error('Помилка при створенні речі:', error);
        return res.status(500).json({
            success: false,
            message: 'Помилка сервера при створенні речі'
        });
    }
});

router.get('/categories', async (req, res) => {
    try {
        const allCategories = await categories.findAll({
            attributes: ['id', 'title']
        });

        return res.status(200).json(allCategories);
    } catch (error) {
        console.error('Помилка при отриманні категорій:', error);
        return res.status(500).json({
            success: false,
            message: 'Помилка сервера при отриманні категорій'
        });
    }
});

router.post("/book",  async (req, res) => {
    try {
        const {id} = req.body
        const token = req.header('Authorization').replace('Bearer ', '');

        if(token){
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            req.user = decoded;

            const userId = req.user.id;

            const item = await items.findOne({
                where: {
                    id,
                    archive: false,
                    user_booked_id: null
                }
            });

            if (!item) {
                return res.status(404).json({
                    success: false,
                    message: 'Товар не знайдено або він вже заброньований'
                });
            }

            if (item.user_owner_id === userId) {
                return res.status(400).json({
                    success: false,
                    message: 'Ви не можете забронювати власний товар'
                });
            }

            const userBookedItemsCount = await items.count({
                where: {
                    user_booked_id: userId,
                    archive: false
                }
            });

            if (userBookedItemsCount >= 3) {
                return res.status(400).json({
                    success: false,
                    message: 'Ви вже забронювали максимальну кількість товарів (3)'
                });
            }

            const bookingEndDate = new Date();
            bookingEndDate.setDate(bookingEndDate.getDate() + 3);

            await item.update({
                user_booked_id: userId,
                booked_end_date: bookingEndDate
            });

            return res.status(200).json({
                success: true,
                message: 'Товар успішно заброньовано',
                bookingEndDate
            });
        } else{
            return res.status(500).json({
                success: false,
                message: 'Помилка сервера при бронюванні товару'
            });
        }


    } catch (error) {
        console.error('Помилка при бронюванні товару:', error);
        return res.status(500).json({
            success: false,
            message: 'Помилка сервера при бронюванні товару'
        });
    }
});

router.post("/cancel", authMiddleware,  async (req, res) => {
    try {
        const { id } = req.body;
        const userId = req.user.id;

        console.log(id,userId)

        const item = await items.findOne({
            where: {
                id,
                user_booked_id: userId
            }
        });

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Бронювання не знайдено або ви не маєте прав для його скасування'
            });
        }

        await item.update({
            user_booked_id: null,
            booked_end_date: null
        });

        return res.status(200).json({
            success: true,
            message: 'Бронювання успішно скасовано'
        });

    } catch (error) {
        console.error('Помилка при скасуванні бронювання:', error);
        return res.status(500).json({
            success: false,
            message: 'Помилка сервера при скасуванні бронювання'
        });
    }
});

module.exports = router;

