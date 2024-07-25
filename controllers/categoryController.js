const createDbConnection = require("./db");
const { generateAlphanumericUUID } = require("./utils");
const connection = createDbConnection();

// exports.addCategory = (req, res) => {
//   const { title } = req.body;
//   const user = req.userr;
//   console.log(user);

//   // Check if title exists
//   if (!title) {
//     return res.status(400).json({ error: "Title is required" });
//   }

//   // Insert new category into database
//   connection.query(
//     "INSERT INTO FoodCategory (Title,UserID) VALUES (?,?)",
//     [title, user.UserID],
//     (err, result) => {
//       if (err) {
//         if (err.code === "ER_DUP_ENTRY") {
//           return res
//             .status(400)
//             .json({ error: "Category title must be unique" });
//         }
//         console.error("Error adding category:", err);
//         return res.status(500).json({ error: "Failed to add category" });
//       }

//       return res.status(201).json({ id: result.insertId, title: title });
//     }
//   );
// };

exports.addCategory = (req, res) => {
  const { title } = req.body;
  const user = req.userr;
  console.log(user);

  // Check if title exists
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  // Generate unique CategoryID
  let uniqueCategoryID;
  let idExists = true;

  (async function generateUniqueID() {
    while (idExists) {
      uniqueCategoryID = generateAlphanumericUUID();
      const checkIDQuery =
        "SELECT CategoryID FROM FoodCategory WHERE CategoryID = ?";
      const [idResults] = await connection
        .promise()
        .query(checkIDQuery, [uniqueCategoryID]);

      if (idResults.length === 0) {
        idExists = false;
      }
    }

    // Insert new category into database
    connection.query(
      "INSERT INTO FoodCategory (CategoryID, Title, UserID) VALUES (?, ?, ?)",
      [uniqueCategoryID, title, user.UserID],
      (err, result) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            return res
              .status(400)
              .json({ error: "Category title must be unique" });
          }
          console.error("Error adding category:", err);
          return res.status(500).json({ error: "Failed to add category" });
        }

        return res.status(201).json({ id: uniqueCategoryID, title: title });
      }
    );
  })();
};



exports.updateFoodCategory = async (req, res) => {
  const { title } = req.params;
  const { newTitle } = req.body;

  // Check if newTitle exists
  if (!newTitle) {
    return res.status(400).json({ error: "New title is required" });
  }

  // Check if category with the given title exists
  connection.query(
    "SELECT * FROM FoodCategory WHERE CategoryID = ?",
    [title],
    async (err, results) => {
      if (err) {
        console.error("Error finding category:", err);
        return res.status(500).json({ error: "Failed to find category" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Category not found" });
      }

      const UserID = await results[0].UserID;
      if (UserID !== req.userr.UserID) {
        return res.status(404).json({ error: "Access Denied" });
      }

      // Update the category in the database
      connection.query(
        "UPDATE FoodCategory SET Title = ? WHERE CategoryID = ?",
        [newTitle, title],
        (err, result) => {
          if (err) {
            if (err.code === "ER_DUP_ENTRY") {
              return res
                .status(400)
                .json({ error: "New title must be unique" });
            }
            console.error("Error updating category:", err);
            return res.status(500).json({ error: "Failed to update category" });
          }

          return res.status(200).json({
            message: "Category updated successfully",
            newTitle: newTitle,
          });
        }
      );
    }
  );
};

exports.deleteCategory = (req, res) => {
  const { id } = req.params;
  connection.query(
    "SELECT * FROM FoodCategory WHERE CategoryID = ?",
    [id],
    async (err, results) => {
      if (err) {
        console.error("Error finding category:", err);
        return res.status(500).json({ error: "Failed to find category" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Category not found" });
      }

      const UserID = await results[0].UserID;
      if (UserID !== req.userr.UserID) {
        return res.status(404).json({ error: "Access Denied" });
      }

      connection.query(
        "DELETE FROM FoodCategory WHERE CategoryID = ?",
        [id],
        async (err, result) => {
          if (err) {
            console.error("Error deleting category:", err);
            return res.status(500).json({ error: "Failed to delete category" });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Category not found" });
          }

          return res.status(204).end();
        }
      );
    }
  );
};
