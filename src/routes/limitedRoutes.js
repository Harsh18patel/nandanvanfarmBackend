const express = require("express");
const pool = require("../config/db");
const moment = require("moment");

const router = express.Router();

const getFarms = (callback) => {
    const query = "SELECT * FROM farms";

    pool.query(query, (err, results) => {
        if (err) return callback(err, null);

        const formattedResults = results.map(farm => ({
            ...farm,
            propertyImage: farm.propertyImage ? `${farm.propertyImage}` : null,
            propertyVideo: farm.propertyVideo ? `${farm.propertyVideo}` : null,
        }));

        callback(null, formattedResults);
    });
};

router.get("/farms", (req, res) => {
    getFarms((err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, data: results });
    });
});

router.get("/booking/:farmID", (req, res) => {
        const { farmID } = req.params;
    
        if (!farmID) {
            return res.status(400).json({ error: "Farm ID is required" });
        }
    
        const query = "SELECT * FROM bookings WHERE farmID = ?";
    
        pool.query(query, [farmID], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
    
            if (results.length === 0) {
                return res.status(404).json({ error: "No bookings found for this farm." });
            }
    
            const formattedBookings = results.map(booking => ({
                ...booking,
                checkIn: moment(booking.checkIn).format("YYYY-MM-DD hh:mm A"),
                checkOut: moment(booking.checkOut).format("YYYY-MM-DD hh:mm A")
            }));
    
            res.status(200).json({ success: true, data: formattedBookings });
        });
    });


module.exports = router;
