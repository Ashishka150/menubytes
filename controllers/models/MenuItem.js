const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "MenuItem",
    {
      MenuItemID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      Name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      Price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      Photo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      CategoryID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      FoodType: {
        type: DataTypes.ENUM("Veg", "NonVeg"),
        allowNull: false,
      },
    },
    {
      tableName: "MenuItem",
      timestamps: false,
    }
  );
};
