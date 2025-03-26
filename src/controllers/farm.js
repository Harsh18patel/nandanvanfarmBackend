const Farm = require("../models/farmModel");
const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

const getFarms = (req, res) => {
    Farm.getFarms((err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, data: results });
    });
};


const createFarm = (req, res) => {
  const farmData = req.body;

  if (!farmData.farmName || !farmData.farmType || !farmData.address || !farmData.city || !farmData.maxPerson) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const saveFile = (file, folder) => {
    const uploadPath = path.join(__dirname, "..", "..", "uploads", folder);
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

    const fileName = `${Date.now()}_${file.originalname}`;
    const filePath = path.join(uploadPath, fileName);
    fs.writeFileSync(filePath, file.buffer);

    return `/uploads/${folder}/${fileName}`; 
  };

  farmData.propertyImages = req.files["propertyImage"]
    ? req.files["propertyImage"].map(file => saveFile(file, "images"))
    : [];

  farmData.propertyVideo = req.files["propertyVideo"] 
    ? saveFile(req.files["propertyVideo"][0], "videos") 
    : null;

  Farm.createFarm(farmData, (err, farm) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ 
      message: "Farm added successfully", 
      success: true, 
      data: { ...farm, propertyImages: farmData.propertyImages }
    });
  });
};





const updateFarm = (req, res) => {
    const farmID = req.params.farmID;
    const farmData = req.body;
    let updateFields = [];
    let values = [];

    for (let key in farmData) {
        if (farmData[key] !== undefined) {
            updateFields.push(`${key} = ?`);
            values.push(farmData[key]);
        }
    }

    if (req.files) {
        if (req.files.propertyImage) {
            const imagePath = `uploads/images/${Date.now()}_${req.files.propertyImage[0].originalname}`;
            
            fs.writeFileSync(imagePath, req.files.propertyImage[0].buffer);

            farmData.propertyImage = `/${imagePath}`;
            updateFields.push("propertyImage = ?");
            values.push(farmData.propertyImage);
        }
        if (req.files.propertyVideo) {
            const videoPath = `uploads/videos/${Date.now()}_${req.files.propertyVideo[0].originalname}`;
            
            fs.writeFileSync(videoPath, req.files.propertyVideo[0].buffer);

            farmData.propertyVideo = `/${videoPath}`;
            updateFields.push("propertyVideo = ?");
            values.push(farmData.propertyVideo);
        }
    }

    values.push(farmID);
    const query = `UPDATE farms SET ${updateFields.join(", ")} WHERE farmID = ?`;

    pool.query(query, values, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Farm not found or no changes made" });
        }

        res.json({ success: true, data: farmData, message: "Farm updated successfully!" });
    });
};


const deleteFarm = (req, res) => {
  const farmID = req.params.farmID;
  console.log("🚀 ~ deleteFarm ~ farmID:", farmID);

  const selectQuery = "SELECT propertyImage, propertyVideo FROM farms WHERE farmID = ?";

  pool.query(selectQuery, [farmID], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: "Farm not found" });

    let { propertyImage, propertyVideo } = results[0];

    propertyImage = propertyImage ? propertyImage.toString() : "";
    propertyVideo = propertyVideo ? propertyVideo.toString() : "";

    const deleteQuery = "DELETE FROM farms WHERE farmID = ?";
    pool.query(deleteQuery, [farmID], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      const deleteFile = (filePath) => {
        if (typeof filePath === "string" && filePath.trim() !== "" && filePath.startsWith("uploads/")) {
          const fullPath = path.join(__dirname, "..", "..", filePath);
          if (fs.existsSync(fullPath)) {
            try {
              fs.unlinkSync(fullPath);
              console.log(`Deleted: ${fullPath}`);
            } catch (err) {
              console.error(`Error deleting file: ${fullPath}`, err);
            }
          }
        }
      };

      deleteFile(propertyImage);
      deleteFile(propertyVideo);

      res.json({ success: true, message: "Farm deleted successfully!" });
    });
  });
};

module.exports = { getFarms, createFarm,updateFarm,deleteFarm };
