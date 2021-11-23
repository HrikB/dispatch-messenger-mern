import createError from "createError";
import mongoose from "mongoose";
import { gfsAudio } from "../helpers/mongodb";

export const getVoiceMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || id === "undefined")
      throw new createError.BadRequest("No audio file id");
    const _id = mongoose.Types.ObjectId(id);
    gfsAudio.find({ _id }).toArray((err, files) => {
      try {
        if (!files || files.length === 0)
          throw new createError.BadRequest("No files exists");
        gfsAudio.openDownloadStream(_id).pipe(res);
      } catch (err) {
        next(err);
      }
    });
  } catch (err) {
    next(err);
  }
};
