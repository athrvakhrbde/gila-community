import mongoose, { Schema, type InferSchemaType } from "mongoose";
import filter from "../util/filter.js";
import PostLike from "./PostLike.js";

const PostSchema = new Schema(
  {
    poster: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: [80, "Must be no more than 80 characters"],
    },
    content: {
      type: String,
      required: true,
      maxlength: [8000, "Must be no more than 8000 characters"],
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    edited: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

PostSchema.pre("save", function () {
  if (this.title && this.title.length > 0) {
    this.title = filter.clean(this.title);
  }
  if (this.content && this.content.length > 0) {
    this.content = filter.clean(this.content);
  }
});

PostSchema.pre("findOneAndDelete", async function () {
  const doc = await this.model.findOne(this.getFilter()).lean();
  if (doc && "_id" in doc) {
    await PostLike.deleteMany({ postId: doc._id });
  }
});

export type PostDocument = InferSchemaType<typeof PostSchema> & {
  _id: mongoose.Types.ObjectId;
  liked?: boolean;
  userLikePreview?: unknown[];
};

export default mongoose.model("post", PostSchema);
