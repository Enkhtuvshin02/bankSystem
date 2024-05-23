import mongoose from "mongoose";

const bankSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
});

const Bank = mongoose.model("Bank", bankSchema);
export default Bank;
