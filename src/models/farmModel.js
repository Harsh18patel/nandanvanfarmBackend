const pool = require("../config/db");

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



// const createFarm = (farmData, callback) => {
//     pool.query("SELECT farmID FROM farms ORDER BY id DESC LIMIT 1", (err, results) => {
//         if (err) return callback(err, null);

//         let nextFarmID = "FARM001";

//             if (results.length > 0 && results[0].farmID) {
//                 let maxNum = Math.max(
//                     ...results.map(row => parseInt(row.farmID.replace("FARM", ""), 10))
//                 );

//                 nextFarmID = "FARM" + (maxNum + 1).toString().padStart(3, "0");
//             }


//         const query = `
//             INSERT INTO farms 
//             (farmID, farmName, farmType, address, city, maxPerson, nightCapacity, dayCapacity, 
//             weekday_12hr, weekday_24hr, weekend_12hr, weekend_24hr, perGuestPrice, phoneNumber, 
//             ownerName, ownerPhoneNumber, caretakerName, caretakerAvailability, caretakerPhoneNumber, 
//             bedrooms, discount, youtubeVideoLink, locationLink, farmDetails, amenities, services, 
//             nearbyAttraction, rulesAndRegulation, propertyImage, propertyVideo) 
//             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//         `;

//         const values = [
//             nextFarmID,
//             farmData.farmName,
//             farmData.farmType,
//             farmData.address,
//             farmData.city,
//             farmData.maxPerson,
//             farmData.nightCapacity,
//             farmData.dayCapacity,
//             farmData.weekday_12hr,
//             farmData.weekday_24hr,
//             farmData.weekend_12hr,
//             farmData.weekend_24hr,
//             farmData.perGuestPrice,
//             farmData.phoneNumber,
//             farmData.ownerName,
//             farmData.ownerPhoneNumber,
//             farmData.caretakerName,
//             farmData.caretakerAvailability,
//             farmData.caretakerPhoneNumber,
//             farmData.bedrooms,
//             farmData.discount,
//             farmData.youtubeVideoLink,
//             farmData.locationLink,
//             farmData.farmDetails,
//             farmData.amenities,
//             farmData.services,
//             farmData.nearbyAttraction,
//             farmData.rulesAndRegulation,
//             farmData.propertyImage,
//             farmData.propertyVideo 
//         ];

//         pool.query(query, values, (err, results) => {
//             if (err) return callback(err, null);
//             callback(null, { id: results.insertId, farmID: nextFarmID, ...farmData });
//         });
//     });
// };

const createFarm = (farmData, callback) => {
    pool.query("SELECT farmID FROM farms ORDER BY id DESC LIMIT 1", (err, results) => {
        if (err) return callback(err, null);

        let nextFarmID = "FARM001";

        if (results.length > 0 && results[0].farmID) {
            let maxNum = Math.max(
                ...results.map(row => parseInt(row.farmID.replace("FARM", ""), 10))
            );
            nextFarmID = "FARM" + (maxNum + 1).toString().padStart(3, "0");
        }

        const propertyImages = farmData.propertyImages 
            ? JSON.stringify(farmData.propertyImages) 
            : null;

        const query = `
            INSERT INTO farms 
            (farmID, farmName, farmType, address, city, maxPerson, nightCapacity, dayCapacity, 
            weekday_12hr, weekday_24hr, weekend_12hr, weekend_24hr, perGuestPrice, phoneNumber, 
            ownerName, ownerPhoneNumber, caretakerName, caretakerAvailability, caretakerPhoneNumber, 
            bedrooms, discount, youtubeVideoLink, locationLink, farmDetails, amenities, services, 
            nearbyAttraction, rulesAndRegulation, propertyImage, propertyVideo) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            nextFarmID,
            farmData.farmName,
            farmData.farmType,
            farmData.address,
            farmData.city,
            farmData.maxPerson,
            farmData.nightCapacity,
            farmData.dayCapacity,
            farmData.weekday_12hr,
            farmData.weekday_24hr,
            farmData.weekend_12hr,
            farmData.weekend_24hr,
            farmData.perGuestPrice,
            farmData.phoneNumber,
            farmData.ownerName,
            farmData.ownerPhoneNumber,
            farmData.caretakerName,
            farmData.caretakerAvailability,
            farmData.caretakerPhoneNumber,
            farmData.bedrooms,
            farmData.discount,
            farmData.youtubeVideoLink,
            farmData.locationLink,
            farmData.farmDetails,
            farmData.amenities,
            farmData.services,
            farmData.nearbyAttraction,
            farmData.rulesAndRegulation,
            propertyImages,
            farmData.propertyVideo
        ];

        pool.query(query, values, (err, results) => {
            if (err) return callback(err, null);
            callback(null, { id: results.insertId, farmID: nextFarmID, ...farmData });
        });
    });
};


module.exports = { getFarms, createFarm };
