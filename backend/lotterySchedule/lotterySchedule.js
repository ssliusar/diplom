const cron = require('node-cron');
const { Sequelize } = require('../db');
const { lottery, lotteryticket, users, items } = require('../db');
const { Op } = Sequelize;

const selectRandomWinner = async (lotteryId) => {
    try {

        const tickets = await lotteryticket.findAll({
            where: { lottery_id: lotteryId },
            include: [{ model: users }],
        });

        if (!tickets || tickets.length === 0) {
            return null;
        }

        const randomIndex = Math.floor(Math.random() * tickets.length);
        const winningTicket = tickets[randomIndex];

        const winnerId = winningTicket.user_id;

        return winnerId;
    } catch (error) {
        console.error(`Помилка при виборі переможця розіграшу ID:${lotteryId}:`, error);
        return null;
    }
};

const updateLotteryWithWinner = async (lotteryId, winnerId) => {
    try {
        await lottery.update(
            {
                winner_user_id: winnerId,
                give: false,
                archive: false
            },
            { where: { id: lotteryId } }
        );

        return true;
    } catch (error) {
        console.error(`Помилка при оновленні розіграшу ID:${lotteryId}:`, error);
        return false;
    }
};

const checkFinishedLotteries = async () => {
    try {

        const finishedLotteries = await lottery.findAll({
            where: {
                date: { [Op.lt]: new Date() },
                winner_user_id: null,
                archive: false
            }
        });

        for (const lotteryItem of finishedLotteries) {
            const winnerId = await selectRandomWinner(lotteryItem.id);

            if (winnerId) {
                await updateLotteryWithWinner(lotteryItem.id, winnerId);
            }
        }
    } catch (error) {
        console.error('Помилка при перевірці завершених розіграшів:', error);
    }
};

const checkFinishedReserved = async () => {
    try {

        await items.update(
            { user_booked_id: null, booked_end_date: null },
            {
                where: {
                    booked_end_date: { [Op.lt]: new Date() }
                }
            }
        );

    } catch (error) {
        console.error('Помилка при перевірці завершених розіграшів:', error);
    }
};

cron.schedule('*/30 * * * * *', () => {
    checkFinishedLotteries();
    checkFinishedReserved();
});

checkFinishedLotteries();