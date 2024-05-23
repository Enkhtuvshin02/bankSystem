import mongoose from "mongoose";
const accountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  accountNumber: { type: String, required: true, unique: true },
  accountType: { type: String, required: true },
  balance: { type: Number, required: true },
  bankId: { type: mongoose.Schema.Types.ObjectId, ref: "Bank", required: true },
});
const Account = mongoose.model("Account", accountSchema);
export default Account;
