const express = require("express");
const cors = require("cors");
const multer = require("multer");
const bodyParser = require("body-parser");
require("dotenv").config();
const limitedRoutes = require("./src/routes/limitedRoutes");
const errorHandler = require("./src/middleware/errorHandler");
require("./src/middleware/cronjob");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(errorHandler);


app.use("/uploads", express.static("uploads"));

app.use("/limited", limitedRoutes);


const PORT = process.env.LIMITEDPORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});