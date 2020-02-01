const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
const port = process.env.PORT || 8080;

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Define Routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/posts", require("./routes/api/posts"));

// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*"),
//     res.setHeader(
//       "Access-Control-Allow-Header",
//       "Origin,X-Requested-With,Content-Type,Accept"
//     );
//   res.setHeader("Access-Control-Allow-Method", "GET,POST,DELETE");
//   next();
// });
app.use(cors());

let value = null;

let descriptor = req.body;

app.get('/get', (req, res) => {
  console.log(value);
  res.send(value);
});

app.post('/user', (req, res) => {
  console.log(req.body)
})

app.listen(port, () => {
  console.log('server start');
});

