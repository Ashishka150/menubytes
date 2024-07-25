const createDbConnection = require("./db");
const connection = createDbConnection();
const { bucket } = require("../controllers/firebase/firebaseConfig");
const multer = require("multer");
// const { getStorage, ref } = require("firebase/storage");

exports.upload = multer({
  storage: multer.memoryStorage(),
});

exports.getUserProfile = async (req, res) => {
  const user = req.userr;
  console.log("user" + req.userr);
  const findUserQuery = "SELECT * FROM Users WHERE UserID = ?";
  connection.query(findUserQuery, [user.UserID], (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ error: "Failed to fetch users" });
    }
    res.json(results);
  });
};

exports.updateUserProfile = async (req, res) => {
  const { id } = req.params;
  const {
    Name,
    PhoneNumber,
    Password,
    RestaurantName,
    Address,
    SocialMediaLinkX,
    SocialMediaLinkInsta,
    SocialMediaLinkFacebook,
  } = req.body;
  const file = req.file;

  // Check if at least one field is being updated
  if (
    !Name &&
    !PhoneNumber &&
    !Password &&
    !RestaurantName &&
    !file &&
    !Address &&
    !SocialMediaLinkX &&
    !SocialMediaLinkInsta &&
    !SocialMediaLinkFacebook
  ) {
    return res.status(400).json({
      error:
        "At least one field (Name, PhoneNumber, Password, RestaurantName, ProfilePhoto, Address, SocialMediaLinkX, SocialMediaLinkInsta, SocialMediaLinkFacebook) must be provided for update",
    });
  }

  try {
    // Check if the user exists
    const findUserSql = "SELECT * FROM Users WHERE UserID = ?";
    const user = await new Promise((resolve, reject) => {
      connection.query(findUserSql, [id], (err, results) => {
        if (err) {
          console.error("Error finding user:", err);
          return reject(new Error("Failed to find user"));
        }
        resolve(results);
      });
    });

    if (user.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user has the correct permissions
    if (user[0].UserID !== req.userr.UserID) {
      return res.status(403).json({ error: "Access Denied" });
    }

    // If there's a file, upload it to Firebase Storage
    let profilePhotoUrl = user[0].ProfilePhoto; // Default to existing photo URL

    if (file) {
      const blob = bucket.file(
        `profile_photos/${Date.now()}_${file.originalname}`
      );
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
            profilePhotoUrl = signedUrl;
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
    let sql = "UPDATE Users SET";
    const values = [];

    if (Name) {
      sql += " Name = ?,";
      values.push(Name);
    }
    if (PhoneNumber) {
      sql += " PhoneNumber = ?,";
      values.push(PhoneNumber);
    }
    if (Password) {
      sql += " Password = ?,";
      values.push(Password);
    }
    if (RestaurantName) {
      sql += " RestaurantName = ?,";
      values.push(RestaurantName);
    }
    if (profilePhotoUrl) {
      sql += " ProfilePhoto = ?,";
      values.push(profilePhotoUrl);
    }
    if (Address) {
      sql += " Address = ?,";
      values.push(Address);
    }
    if (SocialMediaLinkX) {
      sql += " SocialMediaLinkX = ?,";
      values.push(SocialMediaLinkX);
    }
    if (SocialMediaLinkInsta) {
      sql += " SocialMediaLinkInsta = ?,";
      values.push(SocialMediaLinkInsta);
    }
    if (SocialMediaLinkFacebook) {
      sql += " SocialMediaLinkFacebook = ?,";
      values.push(SocialMediaLinkFacebook);
    }

    // Remove trailing comma from the SQL query
    sql = sql.slice(0, -1);

    // Add WHERE clause to specify the user to update
    sql += " WHERE UserID = ?";
    values.push(id);

    // Execute the update query
    await new Promise((resolve, reject) => {
      connection.query(sql, values, (err, result) => {
        if (err) {
          console.error("Error updating user:", err);
          return reject(new Error("Failed to update user"));
        }

        if (result.affectedRows === 0) {
          return reject(new Error("User not found"));
        }

        resolve(result);
      });
    });

    return res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ error: "Failed to update user" });
  }
};
