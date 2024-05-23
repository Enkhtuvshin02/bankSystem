
import mongoose from "mongoose";
const templateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  templateName: { type: String, required: true },
  senderAccount: {
    type: String,
    required: true,
  },
  recipientName: { type: String, required: true },
  recipientBank: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bank",
    required: true,
  },
  recipientAccount: {
    type: String,
    required: true,
  },
  currency: { type: String, required: true },
  receiverUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});
const Template = mongoose.model("Template", templateSchema);
export default Template;
