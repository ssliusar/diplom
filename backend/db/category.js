module.exports = (sequelize, DataTypes) => {
    const categories = sequelize.define('categories', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    categories.associate = function(models) {
        categories.hasMany(models.items, { foreignKey: 'category_id' });
    };

    return categories;
};