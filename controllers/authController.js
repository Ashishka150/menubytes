const { promisify } = require("util");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const createDbConnection = require("./db");
const connection = createDbConnection();
const { generateAlphanumericUUID } = require("./utils");


const signToken = (id) => {
  return jwt.sign({ id }, "WE-MUST-ALL-SUFFER-ONE-OF-TWO-THINGS", {
    expiresIn: "90d",
  });
};

const createSendToken = (user, statusCode, res) => {
  console.log("create send token" + JSON.stringify(user))
  let token = signToken(user.UserID);
  const cookieOption = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: "none",
  };
  cookieOption.secure = true;
  res.cookie("jwt", token, cookieOption);
  user.Password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user: user,
    },
  });
};

exports.loginWithPassword = async (req, res) => {
  const { Email, Password } = req.body;
  try {
    if (!Email || !Password) {
      return res.status(401).json({
        status: "failed",
        message: "Please provide Email and Password",
      });
    }

    // Find the user by phone number
    const findUserQuery = "SELECT * FROM Users WHERE Email = ? LIMIT 1";
    connection.query(findUserQuery, [Email], async (error, results) => {
      if (error) {
        return res.status(500).json({
          status: "error",
          message: "Database error. Please try again later.",
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          status: "failed",
          message: "User not found. Please provide a valid Email Id.",
        });
      }

      const user = results[0];

      if (Password !== user.Password) {
        return res.status(401).json({
          status: "failed",
          message: "Incorrect Email or Password",
        });
      }
      createSendToken(user, 200, res);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};

// exports.signupp = async (req, res) => {
//   try {
//     const { Name, Password, Email, PhoneNumber } = req.body;
//     const RestaurantName = "null";
//     const findUserQuery = "SELECT * FROM Users WHERE Email = ?";
//     connection.query(findUserQuery, [Email], async (error, results) => {
//       if (error) {
//         console.log(error);
//         return res.status(500).json({
//           status: "error",
//           message: "Database error. Please try again later.",
//         });
//       }

//       if (results.length > 0) {
//         return res.status(400).json({
//           status: "failed",
//           message: "Email already exists. Please login.",
//         });
//       }

//       // Check if any of the required variables are missing
//       if (!Name || !PhoneNumber || !Password || !RestaurantName || !Email) {
//         return res.status(403).json({
//           status: "failed",
//           message:
//             "Missing required signup data. Please provide all the necessary information.",
//         });
//       }

//       if (Password.length < 8) {
//         return res.status(400).json({
//           status: "failed",
//           message: "Password must be at least 8 characters long.",
//         });
//       }

//       if (PhoneNumber.length !== 10) {
//         return res.status(400).json({
//           status: "failed",
//           message: "Phone number must be 10 digits.",
//         });
//       }

//       // Insert a new user into the MySQL database
//       const createUserQuery =
//         "INSERT INTO Users (Name, PhoneNumber, Password,RestaurantName,Email) VALUES (?, ?, ?,?,?)";
//       connection.query(
//         createUserQuery,
//         [Name, PhoneNumber, Password, RestaurantName, Email],
//         async (error, results) => {
//           console.log(results)
//           if (error) {
//             console.log(error);
//             // Handle the MySQL query error
//             return res.status(500).json({
//               status: "error",
//               message: "Database error. Please try again later.",
//             });
//           }
//           createSendToken({UserID: results.insertId }, 200, res);
//         }
//       );
//     });
//   } catch (err) {
//     res.status(400).json({
//       error: err,
//       message: "Something went wrong. Try again later.",
//     });
//     console.log(err);
//   }
// };

exports.signupp = async (req, res) => {
  try {
    const { Name, Password, Email, PhoneNumber } = req.body;
    const RestaurantName = "null";
    const findUserQuery = "SELECT * FROM Users WHERE Email = ?";
    const existingUser = await new Promise((resolve, reject) => {
      connection.query(findUserQuery, [Email], (error, results) => {
        if (error) {
          console.error("Error checking user:", error);
          return reject(new Error("Database error. Please try again later."));
        }
        resolve(results);
      });
    });

    if (existingUser.length > 0) {
      return res.status(400).json({
        status: "failed",
        message: "Email already exists. Please login.",
      });
    }

    // Check if any of the required variables are missing
    if (!Name || !PhoneNumber || !Password || !RestaurantName || !Email) {
      return res.status(403).json({
        status: "failed",
        message:
          "Missing required signup data. Please provide all the necessary information.",
      });
    }

    if (Password.length < 8) {
      return res.status(400).json({
        status: "failed",
        message: "Password must be at least 8 characters long.",
      });
    }

    if (PhoneNumber.length !== 10) {
      return res.status(400).json({
        status: "failed",
        message: "Phone number must be 10 digits.",
      });
    }

    // Generate unique UserID
    let uniqueUserID;
    let idExists = true;

    while (idExists) {
      uniqueUserID = generateAlphanumericUUID();
      const checkIDQuery = "SELECT UserID FROM Users WHERE UserID = ?";
      const [idResults] = await connection
        .promise()
        .query(checkIDQuery, [uniqueUserID]);

      if (idResults.length === 0) {
        idExists = false;
      }
    }

    // Insert a new user into the MySQL database
    const createUserQuery =
      "INSERT INTO Users (UserID, Name, PhoneNumber, Password, RestaurantName, Email) VALUES (?, ?, ?, ?, ?, ?)";
    const values = [
      uniqueUserID,
      Name,
      PhoneNumber,
      Password,
      RestaurantName,
      Email,
    ];

    connection.query(createUserQuery, values, (error, results) => {
      if (error) {
        console.error("Error adding user:", error);
        return res.status(500).json({
          status: "error",
          message: "Database error. Please try again later.",
        });
      }
      createSendToken({ UserID: uniqueUserID }, 200, res);
    });
  } catch (err) {
    console.error("Error signing up user:", err);
    return res.status(500).json({
      error: err,
      message: "Something went wrong. Try again later.",
    });
  }
};


exports.protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({
        status: "failed",
        message: "User does not exist by this ID or login with the correct ID",
      });
    }

    // Verify and decode the token
    const decoded = await promisify(jwt.verify)(
      token,
      "WE-MUST-ALL-SUFFER-ONE-OF-TWO-THINGS"
    );

    console.log(decoded);
    // Fetch user data from MySQL based on the user's ID
    const findUserQuery = "SELECT * FROM Users WHERE UserID = ?";
    connection.query(findUserQuery, [decoded.id], async (error, results) => {
      if (error) {
        // Handle the MySQL query error
        console.log(error);
        return res.status(500).json({
          status: "error",
          message: "Database error. Please try again later.",
        });
      }

      if (results.length === 0) {
        return res.status(401).json({
          status: "failed",
          message: "The user belonging to this token does not exist.",
        });
      }

      const freshUser = results[0];

      // if (await freshUser.changePasswordAfter(decoded.iat)) {
      //   return res.status(401).json({
      //     status: 'failed',
      //     message: 'User recently changed their password. Please login again!',
      //   });
      // }

      // Grant access to protected route
      req.userr = freshUser;
      next();
    });
  } catch (err) {
    // Handle JWT errors
    if (err.name === "JsonWebTokenError" && err.message === "jwt malformed") {
      return res.status(401).json({
        status: "fail",
        message: "Invalid token",
      });
    }

    // Handle other errors
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};



