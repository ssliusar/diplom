const { users } = require('../db');

module.exports = async function managerMiddleware(req, res, next) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Необхідно авторизуватися'
            });
        }

        const user = await users.findByPk(req.user.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Користувача не знайдено'
            });
        }

        if (user.type !== 'manager') {
            return res.status(403).json({
                success: false,
                message: 'Недостатньо прав для виконання операції. Тільки менеджери мають доступ до цієї функції.'
            });
        }

        next();
    } catch (error) {
        console.error('Помилка перевірки прав менеджера:', error);
        return res.status(500).json({
            success: false,
            message: 'Помилка сервера при перевірці прав доступу'
        });
    }
};