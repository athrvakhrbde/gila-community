import mongoose, { Schema, type InferSchemaType } from "mongoose";
import validator from "validator";
import filter from "../util/filter.js";

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: [6, "Must be at least 6 characters long"],
      maxlength: [30, "Must be no more than 30 characters long"],
      validate: {
        validator: (val: string) => !validator.contains(val, " "),
        message: "Must contain no spaces",
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (val: string) => validator.isEmail(val),
        message: "Must be valid email address",
      },
    },
    password: {
      type: String,
      required: true,
      minlength: [8, "Must be at least 8 characters long"],
    },
    biography: {
      type: String,
      default: "",
      maxlength: [250, "Must be at most 250 characters long"],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", function () {
  if (filter.isProfane(this.username)) {
    throw new Error("Username cannot contain profanity");
  }

  if (this.biography && this.biography.length > 0) {
    this.biography = filter.clean(this.biography);
  }
});

export type UserDocument = InferSchemaType<typeof UserSchema> & {
  _id: mongoose.Types.ObjectId;
};

export default mongoose.model("user", UserSchema);
