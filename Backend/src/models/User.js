import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  balance: {
    type: Number,
    default: 1000
  }
  

}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;