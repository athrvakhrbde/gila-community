import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import filter from "../util/filter.js";

const CommentSchema = new Schema(
  {
    commenter: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "post",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "comment",
    },
    children: [
      {
        type: Schema.Types.ObjectId,
        ref: "comment",
      },
    ],
    edited: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

CommentSchema.pre("save", function () {
  if (this.content && this.content.length > 0) {
    this.content = filter.clean(this.content);
  }
});

export type CommentDocument = InferSchemaType<typeof CommentSchema> & {
  _id: mongoose.Types.ObjectId;
};

type CommentModel = Model<CommentDocument>;

async function deleteCommentTree(
  model: CommentModel,
  commentId: mongoose.Types.ObjectId
) {
  const children = await model.find({ parent: commentId });
  for (const child of children) {
    await deleteCommentTree(model, child._id);
    await model.deleteOne({ _id: child._id });
  }
}

CommentSchema.pre("findOneAndDelete", async function () {
  const doc = await this.model.findOne(this.getFilter());
  if (doc) {
    await deleteCommentTree(this.model as CommentModel, doc._id);
  }
});

const Comment = mongoose.model<CommentDocument>("comment", CommentSchema);

export default Comment;
