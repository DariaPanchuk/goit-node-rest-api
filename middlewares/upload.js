import multer from "multer";
import path from "path";

import HttpError from "../helpers/HttpError.js";

const tempDir = path.join("tmp");

const config = multer.diskStorage({
    destination: tempDir,
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const filter = (req, file, cbk) => {
    if (file.mimetype.startsWith("image/")) {
        cbk(null, true);
    } else {
        cbk(HttpError(400, "Please, upload images only!"), false);
    }
};

const upload = multer({
    storage: config,
    fileFilter: filter,
    limits: {
        fieldSize: 2 * 1024 * 1024,
    },
});

export default upload;