require("dotenv").config();
const express = require("express");
const cors = require("cors");
const viewRoutes = require("./routes/viewRoutes");
const userRoutes = require("./routes/userRoutes");
const customerRoutes = require("./routes/customerRoutes");
const rewardRoutes = require("./routes/rewardRoutes");
const port = process.env.PORT || 3000;
const cookieParser = require("cookie-parser");
const path = require("path");
const app = express();
const mysql = require("mysql2");
const cron = require("node-cron");

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "dist")));

const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  port: process.env.SQL_PORT,
});

app.use((req, res, next) => {
  req.requestTime = new Date().toTimeString();
  console.log(req.headers);
  next();
});

app.get("/", (req, res) => {
  res.status(200).json("success");
});

//  api routes
app.use("/api", viewRoutes);
app.use("/api", userRoutes);
app.use("/api", customerRoutes);
app.use("/api", rewardRoutes);


app.get("/server", (req, res) => {
  res.send("server is running");
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// cron.schedule("* * * * *", () => {
//   axios
//     .get(`https://menubytes.onrender.com/server`)
//     .then((response) => console.log(response.data))
//     .catch((error) => console.error(error));
// });

connection.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err);
  } else {
    console.log("database connection successful");

    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  }
});
