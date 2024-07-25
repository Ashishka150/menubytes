
const { generateAlphanumericUUID } = require("../utils");
const createDbConnection = require("../db");
const connection = createDbConnection();

const Customer = {
  create: (customerData, callback) => {
    const id = generateAlphanumericUUID();
    const query =
      "INSERT INTO customers (id, name, email, total_points, UserID) VALUES (?, ?, ?, ?, ?)";
    connection.query(
      query,
      [
        id,
        customerData.name,
        customerData.email,
        customerData.total_points,
        customerData.UserID,
      ],
      callback
    );
  },
};


exports.createCustomer = (req, res) => {
  const TokenUserId = req.userr.UserID; // Assuming req.userr is set by the auth middleware
  const { name, email, UserID } = req.body;
  const total_points = 0
  // Check if all required fields are present
  if (!name || !email || total_points === undefined || !UserID) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check if the TokenUserId matches the UserID from the request body
  if (TokenUserId !== UserID) {
    return res.status(403).json({ message: "User ID mismatch" });
  }

  const customerData = { name, email, total_points, UserID };

  Customer.create(customerData, (err, result) => {
    if (err) {
      console.error("Error creating customer:", err);
      // Handle duplicate entry error
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Email already exists" });
      }
      return res.status(500).json({ message: "Internal Server Error" });
    }
    res.status(201).json({
      message: "Customer created successfully",
      customerId: result.insertId,
    });
  });
};




// exports.getAllCustomers = async (req, res) => {
//   const { userId } = req.params;
//   const { page = 1, pageSize = 10, search = "" } = req.query;

//   const offset = (page - 1) * pageSize;

//   try {
//     // Use promise-based query
//     const query = `
//       SELECT * FROM customers
//       WHERE UserID = ? AND (name LIKE ? OR email LIKE ?)
//       ORDER BY created_at DESC
//       LIMIT ? OFFSET ?
//     `;
//     const searchQuery = `%${search}%`;

//     const [customers] = await connection
//       .promise()
//       .query(query, [
//         userId,
//         searchQuery,
//         searchQuery,
//         parseInt(pageSize, 10),
//         offset,
//       ]);

//     // Get the total number of customers matching the search criteria
//     const countQuery = `
//       SELECT COUNT(*) AS total FROM customers
//       WHERE UserID = ? AND (name LIKE ? OR email LIKE ?)
//     `;
//     const [[{ total: customerCount }]] = await connection
//       .promise()
//       .query(countQuery, [userId, searchQuery, searchQuery]);

//     res.json({
//       success: true,
//       customer_count: customerCount,
//       data: customers,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };



exports.getAllCustomers = async (req, res) => {
  const { userId } = req.params;
  const { page = 1, pageSize = 10 } = req.query;

  const offset = (page - 1) * pageSize;

  try {
    // Use promise-based query with pagination
    const [customers] = await connection
      .promise()
      .query(
        "SELECT * FROM customers WHERE UserID = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
        [userId, parseInt(pageSize), parseInt(offset)]
      );

    // Get the total count of customers for the given user
    const [[{ total }]] = await connection
      .promise()
      .query("SELECT COUNT(*) as total FROM customers WHERE UserID = ?", [
        userId,
      ]);

    res.json({
      success: true,
      customer_count: total,
      data: customers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


exports.deleteCustomer = async (req, res) => {
  const { id } = req.params;

  try {
    // Use promise-based query to delete the customer
    const [result] = await connection
      .promise()
      .query("DELETE FROM customers WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    res.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


