module.exports = (sequelize, DataTypes) => {
    const lottery = sequelize.define('lottery', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        winner_user_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        image: {
            type: DataTypes.STRING,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        give: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        archive: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
    });

    lottery.associate = function (models) {
        lottery.hasMany(models.lotteryticket, { foreignKey: 'lottery_id', as: 'LotteryTicket' });
        lottery.belongsTo(models.users, { foreignKey: 'winner_user_id' });

    };

    return lottery;
};