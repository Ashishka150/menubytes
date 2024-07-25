const { generateAlphanumericUUID } = require("../utils");
const createDbConnection = require("../db");
const connection = createDbConnection();




// Upsert endpoint for redeem configuration
exports.redeemConfig = (req, res) => {
  const tokenUserId = req.userr.UserID;
  const { points_needed, discount_amount, UserID } = req.body;

  // Validate request body
  if (points_needed === undefined || discount_amount === undefined || !UserID) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check if the tokenUserId matches the UserID from the request body
  if (tokenUserId !== UserID) {
    return res.status(403).json({ message: "User ID mismatch" });
  }

  // Function to find redeem configuration by UserID
  const findRedeemConfigByUserID = (UserID, callback) => {
    const query = "SELECT * FROM redeem_config WHERE UserID = ?";
    connection.query(query, [UserID], callback);
  };

  // Function to update redeem configuration
  const updateRedeemConfig = (UserID, data, callback) => {
    const query = `
      UPDATE redeem_config
      SET points_needed = ?, discount_amount = ?, updated_at = CURRENT_TIMESTAMP
      WHERE UserID = ?
    `;
    connection.query(
      query,
      [data.points_needed, data.discount_amount, UserID],
      callback
    );
  };

  // Function to create a new redeem configuration
  const createRedeemConfig = (data, callback) => {
    const query = `
      INSERT INTO redeem_config (points_needed, discount_amount, UserID)
      VALUES (?, ?, ?)
    `;
    connection.query(
      query,
      [data.points_needed, data.discount_amount, data.UserID],
      callback
    );
  };

  // Check if configuration exists
  findRedeemConfigByUserID(UserID, (err, results) => {
    if (err) {
      console.error("Error checking redeem configuration:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (results.length > 0) {
      // Configuration exists, update it
      updateRedeemConfig(
        UserID,
        { points_needed, discount_amount },
        (err, result) => {
          if (err) {
            console.error("Error updating redeem configuration:", err);
            return res.status(500).json({ message: "Internal Server Error" });
          }
          res
            .status(200)
            .json({ message: "Redeem configuration updated successfully" });
        }
      );
    } else {
      // Configuration does not exist, create it
      createRedeemConfig(
        { points_needed, discount_amount, UserID },
        (err, result) => {
          if (err) {
            console.error("Error creating redeem configuration:", err);
            return res.status(500).json({ message: "Internal Server Error" });
          }
          res.status(201).json({
            message: "Redeem configuration created successfully",
            configId: result.insertId,
          });
        }
      );
    }
  });
};
