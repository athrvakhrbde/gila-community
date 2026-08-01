import mongoose, { Schema } from "mongoose";

const PostLikeSchema = new Schema(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "post",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

PostLikeSchema.index({ postId: 1, userId: 1 }, { unique: true });

export default mongoose.model("postLike", PostLikeSchema);
