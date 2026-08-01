import { Schema, model } from "mongoose";

const ConversationSchema = new Schema(
  {
    recipients: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    lastMessageAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default model("conversation", ConversationSchema);
