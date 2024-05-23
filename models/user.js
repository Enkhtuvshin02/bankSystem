import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  loginName: { type: String, required: true, unique: true },
  salt: { type: String, required: true },
  password: { type: String, required: true },
  transactionPassword: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);
export default User;
