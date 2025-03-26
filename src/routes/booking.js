const express = require("express");
const multer = require("multer");
const { createBooking, getBookings, getBookingByID, updateBooking, deleteBooking } = require("../controllers/booking");

const router = express.Router();

const upload = multer();

router.post("/bookings", upload.none(), createBooking);
router.get("/getbooking", getBookings);

router.get("/booking/:farmID", getBookingByID);
router.put("/book/:bookingID", upload.none(), updateBooking);

router.delete("/delete/:bookingID", deleteBooking);

module.exports = router;
