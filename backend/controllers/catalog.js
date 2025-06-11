const router = require('express').Router();
const { items, categories, users } = require('../db');
const { Op } = require('sequelize');


router.get("/getCatalog",  async (req, res) => {
    try {
        const {
            search = '',
            categoryId = null,
            limit = 10,
            offset = 0,
            includeBooked = false
        } = req.query;

        const parsedLimit = parseInt(limit, 10);
        const parsedOffset = parseInt(offset, 10);
        const parsedCategoryId = categoryId ? parseInt(categoryId, 10) : null;

        const whereConditions = {
            archive: false
        };

        if (includeBooked === 'false' || !includeBooked) {
            whereConditions.user_booked_id = null;
        }

        if (search && search.trim() !== '') {
            whereConditions[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
            ];
        }

        if (parsedCategoryId) {
            whereConditions.category_id = parsedCategoryId;
        }

        const total = await items.count({ where: whereConditions });

        const catalogItems = await items.findAll({
            where: whereConditions,
            include: [
                {
                    model: categories,
                    attributes: ['id', 'title'],
                    required: true
                },
                {
                    model: users,
                    as: 'Owner',
                    attributes: ['id', 'username'],
                    required: true
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parsedLimit,
            offset: parsedOffset
        });

        const formattedItems = catalogItems.map(item => ({
            id: item.id,
            title: item.name,
            category: item.category.title,
            categoryId: item.category_id,
            image: item.image,
            condition: item.condition,
            description: item.description,
            ownerId: item.user_owner_id,
            ownerName: item.Owner.username
        }));

        const hasMore = parsedOffset + formattedItems.length < total;

        return res.status(200).json({
            items: formattedItems,
            total,
            hasMore
        });

    } catch (e) {
        console.error('Помилка при отриманні каталогу:', e);
        res.status(500).json({ message: 'Помилка сервера' });
    }
});

router.get("/getCategories",  async (req, res) => {

    try {
        const categoryList = await categories.findAll({
            attributes: ['id', 'title'],
            order: [['title', 'ASC']]
        });

        return res.status(200).json(categoryList);
    } catch (e) {
        console.error('Помилка при отриманні категорій:', e);
        res.status(500).json({ message: 'Помилка сервера' });
    }
});

router.get("/getItem/:id",  async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({ message: 'Невірний ID товару' });
        }

        const item = await items.findOne({
            where: {
                id: id,
                archive: false
            },
            include: [
                {
                    model: categories,
                    attributes: ['id', 'title'],
                    required: true
                },
                {
                    model: users,
                    as: 'Owner',
                    attributes: ['id', 'username', 'email', 'phoneNumber'],
                    required: true
                },
                {
                    model: users,
                    as: 'Booker',
                    attributes: ['id', 'username'],
                    required: false
                }
            ]
        });

        if (!item) {
            return res.status(404).json({ message: 'Товар не знайдено' });
        }

        const formattedItem = {
            id: item.id,
            title: item.name,
            description: item.description,
            categoryId: item.category_id,
            categoryName: item.category.title,
            images: item.image,
            ownerId: item.user_owner_id,
            ownerName: item.Owner.username,
            ownerContact: {
                email: item.Owner.email,
                phone: item.Owner.phoneNumber
            },
            isBooked: !!item.user_booked_id,
            bookedUntil: item.booked_end_date,
            bookedBy: item.Booker ? item.Booker.username : null
        };

        return res.status(200).json(formattedItem);

    } catch (e) {
        console.error('Помилка при отриманні товару:', e);
        res.status(500).json({ message: 'Помилка сервера' });
    }
});

module.exports = router;

