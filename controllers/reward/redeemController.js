const createDbConnection = require("../db");
const connection = createDbConnection();
const { sendRedeemNotification } = require("../email/sendEmailNotification");

const findRedeemConfigByUserID = (UserID, callback) => {
  const query = "SELECT * FROM redeem_config WHERE UserID = ?";
  connection.query(query, [UserID], callback);
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

const updateCustomerPointsForRedeem = (
  email,
  pointsToRedeem,
  userID,
  callback
) => {
  const updateQuery = `
    UPDATE customers
    SET total_points = total_points - ?
    WHERE email = ? AND UserID = ?
  `;
  connection.query(
    updateQuery,
    [pointsToRedeem, email, userID],
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

exports.redeemPoints = (req, res) => {
  const tokenUserId = req.userr.UserID;
  const restaurantName = req.userr.Name;
  const { points_to_redeem, email, UserID } = req.body;

  // Validate request body
  if (points_to_redeem === undefined || !email || !UserID) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check if the UserID from the request body matches the tokenUserId
  if (tokenUserId !== UserID) {
    return res.status(403).json({ message: "User ID mismatch" });
  }

  // Find customer by email
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

    // Check if the customer has enough points to redeem
    if (customer.total_points < points_to_redeem) {
      return res.status(400).json({ message: "Insufficient points" });
    }

    // Find redeem configuration for the UserID
    findRedeemConfigByUserID(UserID, (err, results) => {
      if (err) {
        console.error("Error retrieving redeem configuration:", err);
        return res.status(500).json({ message: "Internal Server Error" });
      }

      if (results.length === 0) {
        return res
          .status(404)
          .json({ message: "Redeem configuration not found" });
      }

      const config = results[0];
      const pointsNeeded = config.points_needed;
      const discountAmount = config.discount_amount;

      // Check if points_to_redeem is equal to points_needed (exact match required)
      if (points_to_redeem < pointsNeeded) {
        return res.status(400).json({ message: "Not enough points to redeem" });
      }

      // Update customer's total points
      updateCustomerPointsForRedeem(
        email,
        points_to_redeem,
        UserID,
        (err, updatedCustomer) => {
          if (err) {
            console.error("Error updating customer points:", err);
            return res.status(500).json({ message: "Internal Server Error" });
          }

          // Send email notification
          sendRedeemNotification(
            email,
            restaurantName,
            points_to_redeem,
            discountAmount,
            updatedCustomer.total_points, // Ensure total_points is passed correctly
            (err, info) => {
              if (err) {
                console.error("Error sending email:", err);
                // Send a response indicating that the email couldn't be sent but points were updated
                return res.status(200).json({
                  message:
                    "Points redeemed successfully, but there was an error sending the email.",
                  pointsRedeemed: points_to_redeem,
                });
              }

              res.status(200).json({
                message: "Points redeemed successfully and email sent.",
                pointsRedeemed: points_to_redeem,
              });
            }
          );
        }
      );
    });
  });
};
