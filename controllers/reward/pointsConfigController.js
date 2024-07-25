const { generateAlphanumericUUID } = require("../utils");
const createDbConnection = require("../db");
const connection = createDbConnection();

// Upsert endpoint for points configuration
exports.points_config = (req, res) => {
  const TokenUserId = req.userr.UserID;
  const { amount_threshold, points_per_amount, UserID } = req.body;
  if (
    amount_threshold === undefined ||
    points_per_amount === undefined ||
    !UserID
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check if the TokenUserId matches the UserID from the request body
  if (TokenUserId !== UserID) {
    return res.status(403).json({ message: "User ID mismatch" });
  }

  // Function to find points configuration by UserID
  const findPointsConfigByUserID = (UserID, callback) => {
    const query = "SELECT * FROM points_config WHERE UserID = ?";
    connection.query(query, [UserID], callback);
  };

  // Function to update points configuration
  const updatePointsConfig = (UserID, data, callback) => {
    const query = `
      UPDATE points_config
      SET amount_threshold = ?, points_per_amount = ?, updated_at = CURRENT_TIMESTAMP
      WHERE UserID = ?
    `;
    connection.query(
      query,
      [data.amount_threshold, data.points_per_amount, UserID],
      callback
    );
  };

  // Function to create a new points configuration
  const createPointsConfig = (data, callback) => {
    const query = `
      INSERT INTO points_config (amount_threshold, points_per_amount, UserID)
      VALUES (?, ?, ?)
    `;
    connection.query(
      query,
      [data.amount_threshold, data.points_per_amount, data.UserID],
      callback
    );
  };

  // Check if configuration exists
  findPointsConfigByUserID(UserID, (err, results) => {
    if (err) {
      console.error("Error checking points configuration:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (results.length > 0) {
      // Configuration exists, update it
      updatePointsConfig(
        UserID,
        { amount_threshold, points_per_amount },
        (err, result) => {
          if (err) {
            console.error("Error updating points configuration:", err);
            return res.status(500).json({ message: "Internal Server Error" });
          }
          res
            .status(200)
            .json({ message: "Points configuration updated successfully" });
        }
      );
    } else {
      // Configuration does not exist, create it
      createPointsConfig(
        { amount_threshold, points_per_amount, UserID },
        (err, result) => {
          if (err) {
            console.error("Error creating points configuration:", err);
            return res.status(500).json({ message: "Internal Server Error" });
          }
          res.status(201).json({
            message: "Points configuration created successfully",
            configId: result.insertId,
          });
        }
      );
    }
  });
};

exports.fetchConfigData = async (req, res) => {
  const userID = req.params.userId;

  // Create database connection
  const connection = createDbConnection();

  // Query to fetch points configuration and redeem configuration
  const query = `
    SELECT
      p.amount_threshold,
      p.points_per_amount,
      r.points_needed,
      r.discount_amount
    FROM points_config p
    LEFT JOIN redeem_config r ON p.UserID = r.UserID
    WHERE p.UserID = ?
  `;

  // Execute the query
  connection.query(query, [userID], (err, results) => {
    if (err) {
      console.error("Error fetching configurations:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    console.log("Query results:", results); // Log the query results

    if (results.length === 0) {
      return res.status(404).json({ message: "No configurations found" });
    }

    // Return the result
    // res.status(200).json(results[0]);
    const result = results[0];
    res.status(200).json({
      amount_threshold: parseFloat(result.amount_threshold),
      points_per_amount: parseFloat(result.points_per_amount),
      points_needed: parseInt(result.points_needed, 10),
      discount_amount: parseFloat(result.discount_amount),
    });
  });

  // Close the connection
  connection.end();
};
