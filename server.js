const express = require("express");
const cors = require("cors");
const multer = require("multer");
const bodyParser = require("body-parser");
require("dotenv").config();
const farmRoutes = require("./src/routes/farm");
const bookingRoutes = require("./src/routes/booking");
const limitedRoutes = require("./src/routes/limitedRoutes");
const errorHandler = require("./src/middleware/errorHandler");
require("./src/middleware/cronjob");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(errorHandler);


app.use("/api", farmRoutes);
app.use("/api", bookingRoutes);
app.use("/uploads", express.static("uploads"));

app.use("/limited", limitedRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});