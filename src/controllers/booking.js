const pool = require("../config/db");
const moment = require("moment");

const createBooking = (req, res) => {
    const {
        guestName,
        guestPhoneNumber,
        farmID,
        farmName,
        bookingAmount,
        totalNumberOfGuest,
        checkIn,
        checkOut,
        hoursTime
    } = req.body;

    if (!guestName || !guestPhoneNumber || !farmID || !farmName || !bookingAmount || !totalNumberOfGuest || !checkIn || !checkOut || !hoursTime) {
        return res.status(400).json({ error: "All fields are required, including hoursTime" });
    }

    if (!["12", "24"].includes(hoursTime)) {
        return res.status(400).json({ error: "Invalid hoursTime. Must be '12' or '24'" });
    }

    const formattedCheckIn = moment(checkIn, ["YYYY-MM-DD hh:mm A", "YYYY-MM-DD HH:mm"]).format("YYYY-MM-DD HH:mm:ss");
    const formattedCheckOut = moment(checkOut, ["YYYY-MM-DD hh:mm A", "YYYY-MM-DD HH:mm"]).format("YYYY-MM-DD HH:mm:ss");

    if (moment(formattedCheckIn).isBefore(moment())) {
        return res.status(400).json({ error: "Check-in time cannot be in the past." });
    }

    const deleteExpiredBookingsQuery = `DELETE FROM bookings WHERE checkOut < NOW()`;
    pool.query(deleteExpiredBookingsQuery, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        const checkAvailabilityQuery = `
            SELECT * FROM bookings 
            WHERE farmID = ? AND 
            ((checkIn BETWEEN ? AND ?) OR (checkOut BETWEEN ? AND ?))
        `;

        pool.query(checkAvailabilityQuery, [farmID, formattedCheckIn, formattedCheckOut, formattedCheckIn, formattedCheckOut], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });

            if (results.length > 0) {
                return res.status(400).json({ error: "This farm is already booked for the selected time." });
            }

            const idQuery = "SELECT bookingID FROM bookings ORDER BY bookingID DESC LIMIT 1";

            pool.query(idQuery, (err, results) => {
                if (err) return res.status(500).json({ error: err.message });

                let nextBookingID = "BOOKING001";
                if (results.length > 0) {
                    let maxNum = Math.max(
                        ...results.map(row => parseInt(row.bookingID.replace("BOOKING", ""), 10))
                    );
                    nextBookingID = "BOOKING" + (maxNum + 1).toString().padStart(3, "0");
                }

                const insertQuery = `
                    INSERT INTO bookings (bookingID, guestName, guestPhoneNumber, farmID, farmName, bookingAmount, totalNumberOfGuest, checkIn, checkOut, hoursTime)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                pool.query(insertQuery, [nextBookingID, guestName, guestPhoneNumber, farmID, farmName, bookingAmount, totalNumberOfGuest, formattedCheckIn, formattedCheckOut, hoursTime], (err, result) => {
                    if (err) return res.status(500).json({ error: err.message });

                    res.status(201).json({ 
                        success: true, 
                        message: "Booking created successfully", 
                        data: { 
                            bookingID: nextBookingID, 
                            guestName, 
                            guestPhoneNumber, 
                            farmID, 
                            farmName, 
                            bookingAmount, 
                            totalNumberOfGuest, 
                            checkIn: moment(formattedCheckIn).format("YYYY-MM-DD hh:mm A"), 
                            checkOut: moment(formattedCheckOut).format("YYYY-MM-DD hh:mm A"),
                            hoursTime
                        } 
                    });
                });
            });
        });
    });
};


const getBookings = (req, res) => {
    const query = "SELECT * FROM bookings ORDER BY checkIn DESC";

    pool.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        const formattedResults = results.map(booking => ({
            ...booking,
            checkIn: moment(booking.checkIn).format("YYYY-MM-DD hh:mm A"),
            checkOut: moment(booking.checkOut).format("YYYY-MM-DD hh:mm A")
        }));

        res.status(200).json({ success: true, data: formattedResults });
    });
};



const getBookingByID = (req, res) => {
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
};


const updateBooking = (req, res) => {
    const { bookingID } = req.params;
    console.log("🚀 ~ updateBooking ~ req.params:", req.params)
    const updateFields = req.body;
    console.log("🚀 ~ updateBooking ~ updateFields:", updateFields)

    if (!bookingID) {
        return res.status(400).json({ error: "Booking ID is required" });
    }

    if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ error: "At least one field is required for update" });
    }

    if (updateFields.hoursTime && !["12", "24"].includes(updateFields.hoursTime)) {
        return res.status(400).json({ error: "Invalid hoursTime. Must be '12' or '24'" });
    }

    const updateKeys = Object.keys(updateFields);
    const updateValues = updateKeys.map(key => updateFields[key]);

    const setClause = updateKeys.map(key => `${key} = ?`).join(", ");
    const updateQuery = `UPDATE bookings SET ${setClause} WHERE bookingID = ?`;

    updateValues.push(bookingID);

    pool.query(updateQuery, updateValues, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Booking not found" });
        }

        if (updateFields.checkIn) {
            updateFields.checkIn = moment(updateFields.checkIn).format("YYYY-MM-DD hh:mm A");
        }
        if (updateFields.checkOut) {
            updateFields.checkOut = moment(updateFields.checkOut).format("YYYY-MM-DD hh:mm A");
        }

        res.status(200).json({ 
            success: true, 
            message: "Booking updated successfully", 
            data: { bookingID, ...updateFields } 
        });
    });
};



const deleteBooking = (req, res) => {
    const { bookingID } = req.params;

    if (!bookingID) {
        return res.status(400).json({ error: "Booking ID is required" });
    }

    const deleteQuery = "DELETE FROM bookings WHERE bookingID = ?";

    pool.query(deleteQuery, [bookingID], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Booking not found" });
        }

        res.status(200).json({ success: true, message: "Booking deleted successfully" });
    });
};



module.exports = { createBooking ,getBookings,getBookingByID, updateBooking, deleteBooking};
