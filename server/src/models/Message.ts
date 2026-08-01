import { Schema, model } from "mongoose";

const MessageSchema = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "conversation",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default model("message", MessageSchema);
