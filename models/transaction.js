import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
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
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  transactionDate: { type: Date, default: Date.now },
  senderUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});
const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
