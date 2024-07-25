const createDbConnection = require("./db");
const connection = createDbConnection();
const { bucket } = require("../controllers/firebase/firebaseConfig");
const multer = require("multer");
// const { getStorage, ref } = require("firebase/storage");
const { generateAlphanumericUUID } = require("./utils");

exports.upload = multer({
  storage: multer.memoryStorage(),
});



// exports.addMenuItem = async (req, res) => {
//   const { Name, Description, Price, CategoryID, FoodType } = req.body;
//   const file = req.file;

//   // Check if all required fields are present
//   if (!Name || !Price || !CategoryID) {
//     return res.status(400).json({
//       error: "Name, Price, CategoryID, are required fields",
//     });
//   }

//   try {
//     // Query to check if CategoryID exists in FoodCategory table
//     const checkCategorySql = "SELECT * FROM FoodCategory WHERE CategoryID = ?";
//     const results = await new Promise((resolve, reject) => {
//       connection.query(checkCategorySql, [CategoryID], (err, results) => {
//         if (err) {
//           console.error("Error checking category:", err);
//           return reject(new Error("Failed to check category"));
//         }
//         resolve(results);
//       });
//     });

//     if (results.length === 0) {
//       return res.status(400).json({ error: "Invalid CategoryID" });
//     }

//     if (results[0].UserID !== req.userr.UserID) {
//       return res.status(400).json({ error: "Access Denied" });
//     }

//     // Upload file to Firebase Storage
//     if (file) {
//       const blob = bucket.file(`images/${Date.now()}_${file.originalname}`);
//       const blobStream = blob.createWriteStream({
//         metadata: {
//           contentType: file.mimetype,
//         },
//       });

//       blobStream.on("error", (err) => {
//         console.error("Error uploading to Firebase:", err);
//         return res.status(500).json({ error: "Failed to upload image" });
//       });

//       blobStream.on("finish", async () => {
//         try {
//           // Generate a signed URL for the uploaded file with an expiration of 5 years
//           const signedUrl = await blob.getSignedUrl({
//             action: "read",
//             expires: Date.now() + 5 * 365 * 24 * 60 * 60 * 1000, // 5 years
//           });

//           // Insert new menu item into database
//           const sql =
//             "INSERT INTO MenuItem (Name, Description, Price, Photo, CategoryID, FoodType, UserID) VALUES (?,?,?,?,?,?,?)";
//           const values = [
//             Name,
//             Description,
//             Price,
//             signedUrl[0],
//             CategoryID,
//             FoodType,
//             req.userr.UserID,
//           ];

//           const result = await new Promise((resolve, reject) => {
//             connection.query(sql, values, (err, result) => {
//               if (err) {
//                 console.error("Error adding menu item:", err);
//                 return reject(new Error("Failed to add menu item"));
//               }
//               resolve(result);
//             });
//           });

//           return res.status(201).json({
//             id: result.insertId,
//             message: "Menu item added successfully",
//           });
//         } catch (error) {
//           console.error("Error generating signed URL:", error);
//           return res
//             .status(500)
//             .json({ error: "Failed to generate signed URL" });
//         }
//       });

//       blobStream.end(file.buffer);
//     } else {
//       // Insert new menu item without photo into database
//       const sql =
//         "INSERT INTO MenuItem (Name, Description, Price, Photo, CategoryID, FoodType, UserID) VALUES (?,?,?,?,?,?,?)";
//       const values = [
//         Name,
//         Description,
//         Price,
//         null, // No photo
//         CategoryID,
//         FoodType,
//         req.userr.UserID,
//       ];

//       const result = await new Promise((resolve, reject) => {
//         connection.query(sql, values, (err, result) => {
//           if (err) {
//             console.error("Error adding menu item:", err);
//             return reject(new Error("Failed to add menu item"));
//           }
//           resolve(result);
//         });
//       });

//       return res.status(201).json({
//         id: result.insertId,
//         message: "Menu item added successfully",
//       });
//     }
//   } catch (error) {
//     console.error("Error adding menu item:", error);
//     return res.status(500).json({ error: "Failed to add menu item" });
//   }
// };



// exports.updateMenuItem = (req, res) => {
//   const { id } = req.params;
//   const { Name, Description, Price, Photo, CategoryID, FoodType } = req.body;

//   // Check if at least one field is being updated
//   if (!Name && !Description && !Price && !Photo && !CategoryID && !FoodType) {
//     return res.status(400).json({
//       error:
//         "At least one field (Name, Description, Price, Photo, CategoryID, FoodType) must be provided for update",
//     });
//   }

//   // Construct SQL query dynamically based on provided fields
//   let sql = "UPDATE MenuItem SET";
//   const values = [];

//   if (Name) {
//     sql += " Name = ?,";
//     values.push(Name);
//   }
//   if (Description) {
//     sql += " Description = ?,";
//     values.push(Description);
//   }
//   if (Price) {
//     sql += " Price = ?,";
//     values.push(Price);
//   }
//   if (Photo) {
//     sql += " Photo = ?,";
//     values.push(Photo);
//   }
//   if (CategoryID) {
//     sql += " CategoryID = ?,";
//     values.push(CategoryID);
//   }
//   if (FoodType) {
//     sql += " FoodType = ?,";
//     values.push(FoodType);
//   }

//   // Remove trailing comma from the SQL query
//   sql = sql.slice(0, -1);

//   // Add WHERE clause to specify the menu item to update
//   sql += " WHERE MenuItemID = ?";
//   values.push(id);

//   // Execute the update query
//   connection.query(
//     "SELECT * FROM MenuItem WHERE MenuItemID  = ?",
//     [id],
//     async (err, results) => {
//       if (err) {
//         console.error("Error finding Menu Item:", err);
//         return res.status(500).json({ error: "Failed to find Menu Item" });
//       }

//       if (results.length === 0) {
//         return res.status(404).json({ error: "Menu Item not found" });
//       }

//       const UserID = await results[0].UserID;
//       if (UserID !== req.userr.UserID) {
//         return res.status(404).json({ error: "Access Denied" });
//       }

//       connection.query(sql, values, async (err, result) => {
//           if (err) {
//             console.error("Error updating menu item:", err);
//             return res
//               .status(500)
//               .json({ error: "Failed to update menu item" });
//           }

//           if (result.affectedRows === 0) {
//             return res.status(404).json({ error: "Menu item not found" });
//           }

//           return res
//             .status(200)
//             .json({ message: "Menu item updated successfully" });
//         });
//     }
//   );
// };

exports.addMenuItem = async (req, res) => {
  const { Name, Description, Price, CategoryID, FoodType } = req.body;
  const file = req.file;

  // Check if all required fields are present
  if (!Name || !Price || !CategoryID) {
    return res.status(400).json({
      error: "Name, Price, CategoryID, are required fields",
    });
  }

  try {
    // Query to check if CategoryID exists in FoodCategory table
    const checkCategorySql = "SELECT * FROM FoodCategory WHERE CategoryID = ?";
    const results = await new Promise((resolve, reject) => {
      connection.query(checkCategorySql, [CategoryID], (err, results) => {
        if (err) {
          console.error("Error checking category:", err);
          return reject(new Error("Failed to check category"));
        }
        resolve(results);
      });
    });

    if (results.length === 0) {
      return res.status(400).json({ error: "Invalid CategoryID" });
    }

    if (results[0].UserID !== req.userr.UserID) {
      return res.status(400).json({ error: "Access Denied" });
    }

    // Generate unique MenuItemID
    let uniqueMenuItemID;
    let idExists = true;

    (async function generateUniqueID() {
      while (idExists) {
        uniqueMenuItemID = generateAlphanumericUUID();
        const checkIDQuery =
          "SELECT MenuItemID FROM MenuItem WHERE MenuItemID = ?";
        const [idResults] = await connection
          .promise()
          .query(checkIDQuery, [uniqueMenuItemID]);

        if (idResults.length === 0) {
          idExists = false;
        }
      }

      // Upload file to Firebase Storage
      if (file) {
        const blob = bucket.file(`images/${Date.now()}_${file.originalname}`);
        const blobStream = blob.createWriteStream({
          metadata: {
            contentType: file.mimetype,
          },
        });

        blobStream.on("error", (err) => {
          console.error("Error uploading to Firebase:", err);
          return res.status(500).json({ error: "Failed to upload image" });
        });

        blobStream.on("finish", async () => {
          try {
            // Generate a signed URL for the uploaded file with an expiration of 5 years
            const signedUrl = await blob.getSignedUrl({
              action: "read",
              expires: Date.now() + 5 * 365 * 24 * 60 * 60 * 1000, // 5 years
            });

            // Insert new menu item into database
            const sql =
              "INSERT INTO MenuItem (MenuItemID, Name, Description, Price, Photo, CategoryID, FoodType, UserID) VALUES (?,?,?,?,?,?,?,?)";
            const values = [
              uniqueMenuItemID,
              Name,
              Description,
              Price,
              signedUrl[0],
              CategoryID,
              FoodType,
              req.userr.UserID,
            ];

            const result = await new Promise((resolve, reject) => {
              connection.query(sql, values, (err, result) => {
                if (err) {
                  console.error("Error adding menu item:", err);
                  return reject(new Error("Failed to add menu item"));
                }
                resolve(result);
              });
            });

            return res.status(201).json({
              id: uniqueMenuItemID,
              message: "Menu item added successfully",
            });
          } catch (error) {
            console.error("Error generating signed URL:", error);
            return res
              .status(500)
              .json({ error: "Failed to generate signed URL" });
          }
        });

        blobStream.end(file.buffer);
      } else {
        // Insert new menu item without photo into database
        const sql =
          "INSERT INTO MenuItem (MenuItemID, Name, Description, Price, Photo, CategoryID, FoodType, UserID) VALUES (?,?,?,?,?,?,?,?)";
        const values = [
          uniqueMenuItemID,
          Name,
          Description,
          Price,
          null, // No photo
          CategoryID,
          FoodType,
          req.userr.UserID,
        ];

        const result = await new Promise((resolve, reject) => {
          connection.query(sql, values, (err, result) => {
            if (err) {
              console.error("Error adding menu item:", err);
              return reject(new Error("Failed to add menu item"));
            }
            resolve(result);
          });
        });

        return res.status(201).json({
          id: uniqueMenuItemID,
          message: "Menu item added successfully",
        });
      }
    })();
  } catch (error) {
    console.error("Error adding menu item:", error);
    return res.status(500).json({ error: "Failed to add menu item" });
  }
};


exports.updateMenuItem = async (req, res) => {
  const { id } = req.params;
  const { Name, Description, Price, CategoryID, FoodType } = req.body;
  const file = req.file;

  // Check if at least one field is being updated
  if (!Name && !Description && !Price && !file && !CategoryID && !FoodType) {
    return res.status(400).json({
      error:
        "At least one field (Name, Description, Price, Photo, CategoryID, FoodType) must be provided for update",
    });
  }

  try {
    // Check if the menu item exists and belongs to the user
    const findMenuItemSql = "SELECT * FROM MenuItem WHERE MenuItemID = ?";
    const menuItem = await new Promise((resolve, reject) => {
      connection.query(findMenuItemSql, [id], (err, results) => {
        if (err) {
          console.error("Error finding Menu Item:", err);
          return reject(new Error("Failed to find Menu Item"));
        }
        resolve(results);
      });
    });

    if (menuItem.length === 0) {
      return res.status(404).json({ error: "Menu Item not found" });
    }

    if (menuItem[0].UserID !== req.userr.UserID) {
      return res.status(403).json({ error: "Access Denied" });
    }

    // If there's a file, upload it to Firebase Storage
    let photoUrl = menuItem[0].Photo; // Default to existing photo URL

    if (file) {
      const blob = bucket.file(`images/${Date.now()}_${file.originalname}`);
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      await new Promise((resolve, reject) => {
        blobStream.on("error", (err) => {
          console.error("Error uploading to Firebase:", err);
          reject(new Error("Failed to upload image"));
        });

        blobStream.on("finish", async () => {
          try {
            const [signedUrl] = await blob.getSignedUrl({
              action: "read",
              expires: Date.now() + 5 * 365 * 24 * 60 * 60 * 1000, // 5 years
            });
            photoUrl = signedUrl;
            resolve();
          } catch (error) {
            console.error("Error generating signed URL:", error);
            reject(new Error("Failed to generate signed URL"));
          }
        });

        blobStream.end(file.buffer);
      });
    }

    // Construct SQL query dynamically based on provided fields
    let sql = "UPDATE MenuItem SET";
    const values = [];

    if (Name) {
      sql += " Name = ?,";
      values.push(Name);
    }
    if (Description) {
      sql += " Description = ?,";
      values.push(Description);
    }
    if (Price) {
      sql += " Price = ?,";
      values.push(Price);
    }
    if (photoUrl) {
      sql += " Photo = ?,";
      values.push(photoUrl);
    }
    if (CategoryID) {
      sql += " CategoryID = ?,";
      values.push(CategoryID);
    }
    if (FoodType) {
      sql += " FoodType = ?,";
      values.push(FoodType);
    }

    // Remove trailing comma from the SQL query
    sql = sql.slice(0, -1);

    // Add WHERE clause to specify the menu item to update
    sql += " WHERE MenuItemID = ?";
    values.push(id);

    // Execute the update query
    await new Promise((resolve, reject) => {
      connection.query(sql, values, (err, result) => {
        if (err) {
          console.error("Error updating menu item:", err);
          return reject(new Error("Failed to update menu item"));
        }

        if (result.affectedRows === 0) {
          return reject(new Error("Menu item not found"));
        }

        resolve(result);
      });
    });

    return res.status(200).json({ message: "Menu item updated successfully" });
  } catch (error) {
    console.error("Error updating menu item:", error);
    return res.status(500).json({ error: "Failed to update menu item" });
  }
};

exports.deleteMenuItem = (req, res) => {
  const { id } = req.params;

  // Execute the delete query
  connection.query(
    "SELECT * FROM MenuItem WHERE MenuItemID  = ?",
    [id],
    async (err, results) => {
      if (err) {
        console.error("Error finding Menu Item:", err);
        return res.status(500).json({ error: "Failed to find Menu Item" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Menu Item not found" });
      }

      const UserID = await results[0].UserID;
      if (UserID !== req.userr.UserID) {
        return res.status(404).json({ error: "Access Denied" });
      }

      connection.query(
        "DELETE FROM MenuItem WHERE MenuItemID = ?",
        [id],
        async (err, result) => {
          if (err) {
            console.error("Error deleting menu item:", err);
            return res
              .status(500)
              .json({ error: "Failed to delete menu item" });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Menu item not found" });
          }

          return res
            .status(204)
            .json({ message: "Menu item deleted successfully" });
        }
      );
    }
  );
};

exports.getMenuItems = (req, res) => {
  const { categoryTitle, name, foodType, sort, order } = req.query;

  // Construct the SQL query dynamically based on the provided search filters and sorting options
  let sql = `
        SELECT 
            fc.Title AS CategoryTitle, 
            mi.MenuItemID, 
            mi.Name, 
            mi.Description, 
            mi.Price, 
            mi.Photo, 
            mi.FoodType
        FROM 
            FoodCategory fc
        LEFT JOIN 
            MenuItem mi ON fc.Title = mi.CategoryTitle
    `;

  const whereClauses = [];
  const values = [];

  if (categoryTitle) {
    whereClauses.push("fc.Title = ?");
    values.push(categoryTitle);
  }
  if (name) {
    whereClauses.push("mi.Name LIKE ?");
    values.push(`%${name}%`);
  }
  if (foodType && (foodType === "Veg" || foodType === "NonVeg")) {
    whereClauses.push("mi.FoodType = ?");
    values.push(foodType);
  }

  if (whereClauses.length > 0) {
    sql += " WHERE " + whereClauses.join(" AND ");
  }

  // Sorting options
  if (sort === "price") {
    sql += " ORDER BY mi.Price";
    if (order === "desc") {
      sql += " DESC";
    }
  }

  // Execute the SQL query
  connection.query(sql, values, (err, results) => {
    if (err) {
      console.error("Error fetching menu items:", err);
      return res.status(500).json({ error: "Failed to fetch menu items" });
    }

    // Organize menu items by category title
    const menuItemsByCategory = {};
    results.forEach((item) => {
      if (!menuItemsByCategory[item.CategoryTitle]) {
        menuItemsByCategory[item.CategoryTitle] = [];
      }
      if (item.MenuItemID) {
        menuItemsByCategory[item.CategoryTitle].push({
          MenuItemID: item.MenuItemID,
          Name: item.Name,
          Description: item.Description,
          Price: item.Price,
          Photo: item.Photo,
          FoodType: item.FoodType,
        });
      }
    });

    // Prepare response object
    const response = Object.keys(menuItemsByCategory).map((categoryTitle) => ({
      categoryTitle: categoryTitle,
      menuItems: menuItemsByCategory[categoryTitle],
    }));

    return res.status(200).json(response);
  });
};
