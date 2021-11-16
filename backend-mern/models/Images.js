import { GridFsStorage } from "multer-gridfs-storage";
import { promise } from "../helpers/mongodb.js";
import multer from "multer";
import crypto from "crypto";
import dotenv from "dotenv";
import path from "path";
import createError from "http-errors";
dotenv.config();

const storage = new GridFsStorage({
  db: promise,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) return reject(err);

        const fileName = buf.toString("hex" + path.extname(file.originalname));
        const fileInfo = {
          fileName,
          bucketName: "profile_pictures",
        };
        resolve(fileInfo);
      });
    });
  },
});

const store = multer({
  storage: storage,
  limit: { fileSize: 20000000 },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
});

const checkFileType = (file, cb) => {
  const mimeType = file.mimetype.match(/^image/);
  if (mimeType) return cb(null, true);

  cb("filetype");
};

export const uploadMiddleware = (req, res, next) => {
  const upload = store.single("image");
  try {
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        throw new createError.BadRequest();
      } else if (err) {
        console.log("err", err);
        if (err === "filetype")
          throw new createError.BadRequest("Image files only");

        throw new createError.InternalServerError();
      }
      next();
    });
  } catch (err) {
    next(err);
  }
};
