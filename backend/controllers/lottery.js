const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const { lottery, users, lotteryticket, sequelize } = require('../db');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require("../middleware/auth.middleware");
const {Op} = require("sequelize");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/lottery');

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const fileExt = path.extname(file.originalname);
        const fileName = `${uuidv4()}${fileExt}`;
        cb(null, fileName);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file format'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 2 }, // 2MB
    fileFilter: fileFilter
}).single('image');

router.post("/create", authMiddleware,  async (req, res) => {

    console.log(req.user.type )
    if (req.user.type !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Тільки адмін може створювати розіграші'
        });
    }

    upload(req, res, async function (err) {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Будь ласка, завантажте зображення'
            });
        }

        try {

            const imagePath = `/uploads/lottery/${req.file.filename}`;

            const newLottery = await lottery.create({
                title: req.body.title,
                description: req.body.description,
                date: new Date(req.body.date),
                price: parseInt(req.body.price),
                image: imagePath,
                give: false,
                archive: false
            });

            return res.status(201).json({
                success: true,
                message: 'Розіграш успішно створено',
                data: newLottery
            });
        } catch (error) {
            console.error('Error creating lottery:', error);

            if (req.file) {
                fs.unlinkSync(req.file.path);
            }

            return res.status(500).json({
                success: false,
                message: 'Помилка при створенні розіграшу',
                error: error.message
            });
        }
    });
});

router.get("/all", authMiddleware,  async (req, res) => {

    try {
        const lotteries = await lottery.findAll({
            include: [
                {
                    model: users,
                    attributes: ['id', 'username', 'phoneNumber', 'email']
                }
            ],
            order: [['date', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            data: lotteries
        });
    } catch (error) {
        console.error('Error fetching lotteries:', error);
        return res.status(500).json({
            success: false,
            message: 'Помилка при отриманні списку розіграшів',
            error: error.message
        });
    }
});

router.put("/update-lottery-status/:id", authMiddleware,  async (req, res) => {
    if (req.user.type !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Тільки адмін може оновлювати статус призу'
        });
    }

    try {
        const { id } = req.params;
        const { give, archive } = req.body;

        const lotteryData = await lottery.findByPk(id);
        if (!lotteryData) {
            return res.status(404).json({
                success: false,
                message: 'Розіграш не знайдено'
            });
        }

        if (!lotteryData.winner_user_id) {
            return res.status(400).json({
                success: false,
                message: 'Неможливо оновити статус призу, оскільки переможця ще не визначено'
            });
        }

        await lotteryData.update({
            give: give || false,
            archive: archive || false
        });

        return res.status(200).json({
            success: true,
            message: give ? 'Статус оновлено: приз отримано' : 'Статус оновлено: приз не отримано',
            data: lotteryData
        });
    } catch (error) {
        console.error('Error updating prize status:', error);
        return res.status(500).json({
            success: false,
            message: 'Помилка при оновленні статусу призу',
            error: error.message
        });
    }
});

router.get("/getWaitLottery", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const currentDate = new Date();

        const lotteries = await lottery.findAll({
            where: {
                archive: false,
                give: false,
                winner_user_id: null,
                date: {
                    [Op.gt]: currentDate
                }
            },
            order: [['date', 'ASC']],
            include: [
                {
                    model: lotteryticket,
                    as: 'LotteryTicket',
                    attributes: ['id']
                }
            ]
        });

        const lotteriesWithTicketCounts = await Promise.all(lotteries.map(async (lotteryItem) => {
            const userTicketCount = await lotteryticket.count({
                where: {
                    lottery_id: lotteryItem.id,
                    user_id: userId
                }
            });

            const totalTickets = lotteryItem.LotteryTicket.length;

            return {
                ...lotteryItem.toJSON(),
                userTicketCount,
                totalTickets,
                LotteryTicket: undefined
            };
        }));

        return res.status(200).json({
            success: true,
            data: lotteriesWithTicketCounts
        });
    } catch (error) {
        console.error('Error fetching active lotteries:', error);
        return res.status(500).json({
            success: false,
            message: 'Помилка при отриманні списку активних розіграшів',
            error: error.message
        });
    }
});


router.post("/buy/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        const userId = req.user.id;

        if (!quantity || quantity < 1 || !Number.isInteger(Number(quantity))) {
            return res.status(400).json({
                success: false,
                message: 'Будь ласка, вкажіть правильну кількість білетів'
            });
        }

        const lotteryData = await lottery.findByPk(id);
        if (!lotteryData) {
            return res.status(404).json({
                success: false,
                message: 'Розіграш не знайдено'
            });
        }

        const currentDate = new Date();
        if (new Date(lotteryData.date) < currentDate) {
            return res.status(400).json({
                success: false,
                message: 'Розіграш вже закінчився'
            });
        }

        if (lotteryData.winner_user_id) {
            return res.status(400).json({
                success: false,
                message: 'Переможця для цього розіграшу вже визначено'
            });
        }

        if (lotteryData.archive) {
            return res.status(400).json({
                success: false,
                message: 'Цей розіграш знаходиться в архіві'
            });
        }

        const totalCost = lotteryData.price * quantity;

        const user = await users.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Користувача не знайдено'
            });
        }

        if (user.points < totalCost) {
            return res.status(400).json({
                success: false,
                message: 'Недостатньо балів для покупки білетів'
            });
        }

        const t = await sequelize.transaction();

        try {
            await user.update({
                points: user.points - totalCost
            }, { transaction: t });

            const ticketPromises = [];
            for (let i = 0; i < quantity; i++) {
                ticketPromises.push(
                    lotteryticket.create({
                        lottery_id: lotteryData.id,
                        user_id: userId
                    }, { transaction: t })
                );
            }

            await Promise.all(ticketPromises);
            await t.commit();

            const userTicketCount = await lotteryticket.count({
                where: {
                    lottery_id: lotteryData.id,
                    user_id: userId
                }
            });

            return res.status(200).json({
                success: true,
                message: `Ви успішно придбали ${quantity} білетів на розіграш`,
                data: {
                    ticketsBought: quantity,
                    totalTicketsOwned: userTicketCount,
                    remainingPoints: user.points - totalCost
                }
            });
        } catch (error) {
            await t.rollback();
            throw error;
        }
    } catch (error) {
        console.error('Error buying lottery tickets:', error);
        return res.status(500).json({
            success: false,
            message: 'Помилка при покупці білетів',
            error: error.message
        });
    }
});

router.get("/my-tickets/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const lotteryExists = await lottery.findByPk(id);
        if (!lotteryExists) {
            return res.status(404).json({
                success: false,
                message: 'Розіграш не знайдено'
            });
        }

        const tickets = await lotteryticket.count({
            where: {
                lottery_id: id,
                user_id: userId
            }
        });

        return res.status(200).json({
            success: true,
            data: {
                lotteryId: id,
                ticketCount: tickets
            }
        });
    } catch (error) {
        console.error('Error fetching user tickets:', error);
        return res.status(500).json({
            success: false,
            message: 'Помилка при отриманні інформації про білети',
            error: error.message
        });
    }
});

router.get("/:id", authMiddleware,  async (req, res) => {
    try {
        const { id } = req.params;

        const lotteryData = await lottery.findByPk(id, {
            include: [
                {
                    model: users,
                    as: 'winner',
                    attributes: ['id', 'username', 'phoneNumber', 'email']
                }
            ]
        });

        if (!lotteryData) {
            return res.status(404).json({
                success: false,
                message: 'Розіграш не знайдено'
            });
        }

        return res.status(200).json({
            success: true,
            data: lotteryData
        });
    } catch (error) {
        console.error('Error fetching lottery:', error);
        return res.status(500).json({
            success: false,
            message: 'Помилка при отриманні інформації про розіграш',
            error: error.message
        });
    }
});

module.exports = router;