import { GridFsStorage } from "multer-gridfs-storage";
import { promise } from "../helpers/mongodb.js";
import multer from "multer";
import crypto from "crypto";
import dotenv from " dotenv";
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
          bucketName: "voice_messages",
        };
        resolve(fileInfo);
      });
    });
  },
});

const store = mutler({
  storage: storage,
  limit: { fileSize: 200000000 },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
});

const checkFileType = (file, cb) => {
  const mimeType = file.mimeType.match(/\.(?:wav|mp3)$/i);
  if (mimeType) return cb(null, true);

  cb("filetype");
};
