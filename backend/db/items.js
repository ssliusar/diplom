module.exports = (sequelize, DataTypes) => {
    const items = sequelize.define('items', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        category_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'categories',
                key: 'id'
            }
        },
        user_owner_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        user_booked_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: undefined,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        image: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true,
            defaultValue: ['https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/800px-Placeholder_view_vector.svg.png','https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/800px-Placeholder_view_vector.svg.png','https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/800px-Placeholder_view_vector.svg.png']
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        booked_end_date: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue:null
        },
        condition: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 5
        },
        points: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 5
        },
        archive: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
    });

    items.associate = function (models) {
        items.belongsTo(models.users, { foreignKey: 'user_owner_id', as: 'Owner' });
        items.belongsTo(models.users, { foreignKey: 'user_booked_id', as: 'Booker' });
        items.belongsTo(models.categories, {foreignKey: 'category_id'});
    };

    return items;
};








