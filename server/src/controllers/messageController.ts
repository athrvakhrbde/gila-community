import type { Request, Response } from "express";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { param } from "../util/params.js";
import { PUBLIC_USER_POPULATE } from "../util/publicUser.js";

export async function sendMessage(req: Request, res: Response) {
  try {
    const recipientId = param(req, "id");
    const userId = req.user?.userId;
    const { content } = req.body as { content?: string };

    if (!userId) throw new Error("Unauthorized");
    if (!content?.trim()) throw new Error("Message content required");

    const recipient = await User.findById(recipientId);
    if (!recipient) throw new Error("Recipient not found");

    let conversation = await Conversation.findOne({
      recipients: { $all: [userId, recipientId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        recipients: [userId, recipientId],
      });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: userId,
      content: content.trim(),
    });

    conversation.lastMessageAt = new Date();
    await conversation.save();

    await message.populate("sender", PUBLIC_USER_POPULATE);

    return res.json({ success: true, message, conversationId: conversation._id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Send failed";
    return res.status(400).json({ error: message });
  }
}

export async function getMessages(req: Request, res: Response) {
  try {
    const conversationId = param(req, "id");
    const userId = req.user?.userId;
    if (!userId) throw new Error("Unauthorized");

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) throw new Error("Conversation not found");

    const isParticipant = conversation.recipients.some(
      (id) => String(id) === userId
    );
    if (!isParticipant) throw new Error("Not authorized");

    const messages = await Message.find({ conversation: conversation._id })
      .populate("sender", PUBLIC_USER_POPULATE)
      .sort("-createdAt")
      .limit(50)
      .lean();

    return res.json(messages);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch messages";
    return res.status(400).json({ error: message });
  }
}

export async function getConversations(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new Error("Unauthorized");

    const conversations = await Conversation.find({
      recipients: { $in: [userId] },
    })
      .populate("recipients", PUBLIC_USER_POPULATE)
      .sort("-lastMessageAt")
      .lean();

    const enriched = conversations.map((conversation) => {
      const recipients = conversation.recipients as unknown as Array<{
        _id: unknown;
        username: string;
      }>;
      const recipient = recipients.find((r) => String(r._id) !== userId);
      return { ...conversation, recipient };
    });

    return res.json(enriched);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch conversations";
    return res.status(400).json({ error: message });
  }
}
