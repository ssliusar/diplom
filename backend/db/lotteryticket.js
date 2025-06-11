module.exports = (sequelize, DataTypes) => {
    const lotteryticket = sequelize.define('lotteryticket', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        lottery_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'lotteries',
                key: 'id'
            }
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        }
    });

    lotteryticket.associate = function (models) {
        lotteryticket.belongsTo(models.users, {foreignKey: 'user_id'});
        lotteryticket.belongsTo(models.lottery, {foreignKey: 'lottery_id'});

    };

    return lotteryticket;
};