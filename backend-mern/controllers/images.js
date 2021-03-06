import createError from "http-errors";
import mongoose from "mongoose";
import { gfsImage } from "../helpers/mongodb.js";

export const uploadImage = async (req, res, next) => {
  try {
    const { file } = req;
    const { id } = file;

    if (file.size > 5000000) {
      await deleteImage(id);
      throw new createError.BadRequest("File may not exceed 5mb");
    }
    return res.send(file.id);
  } catch (err) {
    next(err);
  }
};

export const getImage = async ({ params: { id } }, res, next) => {
  try {
    if (!id || id === "undefined")
      throw new createError.BadRequest("No image id");
    const _id = new mongoose.Types.ObjectId(id);
    gfsImage.find({ _id }).toArray((err, files) => {
      try {
        if (!files || files.length === 0)
          throw new createError.BadRequest("No files exist");
        gfsImage.openDownloadStream(_id).pipe(res);
      } catch (err) {
        next(err);
      }
    });
  } catch (err) {
    next(err);
  }
};

export const deleteImage = (id) => {
  if (!id || id === "undefined ")
    throw new createError.BadRequest("No image id");
  const _id = new mongoose.Types.ObjectId(id);
  gfsImage.delete(_id, (err) => {
    console.log(err);
  });
};
