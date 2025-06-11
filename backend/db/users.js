module.exports = (sequelize, DataTypes) => {
    const users = sequelize.define('users', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: false
        },
        ban: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        password: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'user'
        },
        points: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
        }
    });

    users.associate = function(models) {
        users.hasMany(models.items, { foreignKey: 'user_owner_id', as: 'Owner' });
        users.hasMany(models.items, { foreignKey: 'user_booked_id', as: 'Booker' });
        users.hasMany(models.lotteryticket, { foreignKey: 'user_id', as: 'UserTicket' });
        users.hasMany(models.lottery, { foreignKey: 'winner_user_id' });
    };

    return users;
};