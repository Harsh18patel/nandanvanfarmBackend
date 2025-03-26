const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/") && !file.mimetype.startsWith("video/")) {
            return cb(new Error("Only images and videos are allowed!"), false);
        }
        cb(null, true);
    },
});

module.exports = upload;
