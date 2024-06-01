import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  senderAccount: {
    type: String,
    required: true,
  },
  recipientAccount: {
    type: String,
    required: true,
  },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  transactionDate: { type: Date, default: Date.now },
});
const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
