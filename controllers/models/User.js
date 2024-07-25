const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "User",
    {
      UserID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      Name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      PhoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      RestaurantName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ProfilePhoto: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      Address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      SocialMediaLinkX: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      SocialMediaLinkInsta: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      SocialMediaLinkFacebook: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "Users",
      timestamps: false,
    }
  );
};
