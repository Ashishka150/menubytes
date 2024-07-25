require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.USER,
  process.env.PASSWORD,
  {
    host: process.env.HOST,
    dialect: "mysql",
    port: process.env.SQL_PORT,
  }
);

const User = require("./User")(sequelize);
const FoodCategory = require("./FoodCategory")(sequelize);
const MenuItem = require("./MenuItem")(sequelize);

User.hasMany(FoodCategory, { foreignKey: "UserID" });
FoodCategory.belongsTo(User, { foreignKey: "UserID" });

FoodCategory.hasMany(MenuItem, { foreignKey: "CategoryID" });
MenuItem.belongsTo(FoodCategory, { foreignKey: "CategoryID" });

sequelize.sync();

module.exports = {
  sequelize,
  User,
  FoodCategory,
  MenuItem,
};
