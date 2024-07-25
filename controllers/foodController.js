const { Op } = require("sequelize");
const { sequelize, FoodCategory, MenuItem, User } = require("./models");

exports.allFoodCategoryV2 = async (req, res) => {
  const { userID } = req.params;
  const { categoryTitle, menuItemName, foodType, sortByPrice } = req.query;

  try {
    // Fetch user data
    const user = await User.findOne({
      where: { UserID: userID },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prepare filters for categories and menu items
    let categoryFilter = { UserID: userID };

    if (categoryTitle) {
      categoryFilter.Title = { [Op.like]: `%${categoryTitle}%` };
    }

    let menuItemFilter = {};
    if (menuItemName) {
      menuItemFilter.Name = { [Op.like]: `%${menuItemName}%` };
    }

    if (foodType) {
      menuItemFilter.FoodType = foodType;
    }

    // Fetch categories and their associated menu items
    const categories = await FoodCategory.findAll({
      where: categoryFilter,
      include: {
        model: MenuItem,
        where: menuItemFilter,
        required: false,
      },
      order: sortByPrice
        ? [[MenuItem, "Price", sortByPrice.toUpperCase()]]
        : [],
    });

    const categoriesLength = await FoodCategory.findAll({
      where: { UserID: userID },
    });

    // Structure the response
    const response = {
      user: {
        UserID: user.UserID,
        Name: user.Name,
        PhoneNumber: user.PhoneNumber,
        RestaurantName: user.RestaurantName,
        ProfilePhoto: user.ProfilePhoto,
        Address: user.Address,
        SocialMediaLinkX: user.SocialMediaLinkX,
        SocialMediaLinkInsta: user.SocialMediaLinkInsta,
        SocialMediaLinkFacebook: user.SocialMediaLinkFacebook,
      },
      categories: categories,
      categoryLength: categoriesLength.length,
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.allFoodCategory = async (req, res) => {
  const { userID } = req.params;
  const { categoryTitle, menuItemName, foodType, sortByPrice } = req.query;

  try {
    // Fetch user data
    const user = await User.findOne({
      where: { UserID: userID },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prepare filters for categories and menu items
    let categoryFilter = { UserID: userID };

    if (categoryTitle) {
      categoryFilter.Title = { [Op.like]: `%${categoryTitle}%` };
    }

    let menuItemFilter = {};
    if (menuItemName) {
      menuItemFilter.Name = { [Op.like]: `%${menuItemName}%` };
    }

    if (foodType) {
      menuItemFilter.FoodType = foodType;
    }

    // Fetch categories and their associated menu items
    const categories = await FoodCategory.findAll({
      where: categoryFilter,
      include: {
        model: MenuItem,
        where: menuItemFilter,
        required: true,
      },
      order: sortByPrice
        ? [[MenuItem, "Price", sortByPrice.toUpperCase()]]
        : [],
    });

    // Filter out categories without any menu items
    const filteredCategories = categories.filter(
      (category) => category.MenuItems && category.MenuItems.length > 0
    );

    // Structure the response
    const response = {
      user: {
        UserID: user.UserID,
        Name: user.Name,
        PhoneNumber: user.PhoneNumber,
        RestaurantName: user.RestaurantName,
        ProfilePhoto: user.ProfilePhoto,
        Address: user.Address,
        SocialMediaLinkX: user.SocialMediaLinkX,
        SocialMediaLinkInsta: user.SocialMediaLinkInsta,
        SocialMediaLinkFacebook: user.SocialMediaLinkFacebook,
      },
      categories: filteredCategories,
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
