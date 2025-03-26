const express = require("express");
const router = express.Router();
const farmController = require("../controllers/farm");
const upload = require("../middleware/upload")

router.post("/",
    upload.fields([
      { name: "propertyImage", maxCount: 5 }, 
      { name: "propertyVideo", maxCount: 1 } 
    ]), farmController.createFarm
  );
    
    router.put("/farms/:farmID", upload.fields([{ name: "propertyImage" }, { name: "propertyVideo" }]), farmController.updateFarm);
    
    router.get("/farms", farmController.getFarms);
    router.delete("/farms/:farmID", farmController.deleteFarm);


module.exports = router;
