import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  message: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
});

export default mongoose.model(
  "Conversation",
  conversationSchema
);
