const pool = require("../config/db");
const cron = require("node-cron");

cron.schedule("*/10 * * * *", () => {
    const deleteExpiredBookingsQuery = `DELETE FROM bookings WHERE checkOut < NOW()`;

    pool.query(deleteExpiredBookingsQuery, (err, result) => {
        if (err) {
            console.error("Error deleting expired bookings:", err.message);
        } else {
            console.log(`🗑️ Deleted ${result.affectedRows} expired bookings.`);
        }
    });
});

console.log("🔄 Scheduled job started: Auto-delete expired bookings every 10 minutes.");
