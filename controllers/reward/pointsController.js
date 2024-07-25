const createDbConnection = require("../db");
const connection = createDbConnection();
const { sendEmailNotification } = require("../email/sendEmailNotification");



// Helper function to find points configuration for a given UserID
const findPointsConfigByUserID = (UserID, callback) => {
  const query = "SELECT * FROM points_config WHERE UserID = ?";
  connection.query(query, [UserID], callback);
};


const updateCustomerPoints = (email, pointsToAdd, userID, callback) => {
  const updateQuery = `
    UPDATE customers
    SET total_points = total_points + ?
    WHERE email = ? AND UserID = ?
  `;
  connection.query(
    updateQuery,
    [pointsToAdd, email, userID],
    (err, results) => {
      if (err) {
        return callback(err, null);
      }

      // If the update is successful, fetch the updated customer record
      const selectQuery =
        "SELECT * FROM customers WHERE email = ? AND UserID = ?";
      connection.query(selectQuery, [email, userID], (err, updatedResults) => {
        if (err) {
          return callback(err, null);
        }
        callback(null, updatedResults[0]);
      });
    }
  );
};



const findCustomerByEmail = (email, callback) => {
  const query = "SELECT * FROM customers WHERE email = ?";
  connection.query(query, [email], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results[0]);
  });
};


exports.addPoints = (req, res) => {
  const tokenUserId = req.userr.UserID;
  const restaurantName = req.userr.Name;
  const { amount_spent, email, UserID } = req.body;

  // Validate request body
  if (amount_spent === undefined || !email || !UserID) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check if the UserID from the request body matches the tokenUserId
  if (tokenUserId !== UserID) {
    return res.status(403).json({ message: "User ID mismatch" });
  }

  // Check if the customer email exists
  findCustomerByEmail(email, (err, customer) => {
    if (err) {
      console.error("Error retrieving customer:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Check if the UserID of the customer matches
    if (customer.UserID !== UserID) {
      return res.status(403).json({ message: "Customer User ID mismatch" });
    }

    // Find points configuration for the UserID
    findPointsConfigByUserID(UserID, (err, results) => {
      if (err) {
        console.error("Error retrieving points configuration:", err);
        return res.status(500).json({ message: "Internal Server Error" });
      }

      if (results.length === 0) {
        return res
          .status(404)
          .json({ message: "Points configuration not found" });
      }

      const config = results[0];
      const pointsPerAmount = config.points_per_amount;
      const amountThreshold = config.amount_threshold;

      // Calculate points to add
      const pointsToAdd =
        Math.floor(amount_spent / amountThreshold) * pointsPerAmount;

      // Update customer's total points
      updateCustomerPoints(email, pointsToAdd, UserID, (err, updatedCustomer) => {
        if (err) {
          console.error("Error updating customer points:", err);
          return res.status(500).json({ message: "Internal Server Error" });
        }

        // Send email notification
        sendEmailNotification(
          email,
          restaurantName,
          amount_spent,
          pointsToAdd,
          updatedCustomer.total_points, // Ensure total_points is passed correctly
          (err, info) => {
            if (err) {
              console.error("Error sending email:", err);
              // Send a response indicating that the email couldn't be sent but points were updated
              return res.status(200).json({
                message:
                  "Points added successfully, but there was an error sending the email.",
                pointsAdded: pointsToAdd,
              });
            }

            res.status(200).json({
              message: "Points added successfully and email sent.",
              pointsAdded: pointsToAdd,
            });
          }
        );
      });
    });
  });
};
