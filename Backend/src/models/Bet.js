import mongoose from "mongoose";

const betSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  roundId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Round",
    required: true
  },

  amount: {
    type: Number,
    required: true,
    min: 1
  },

  cashoutMultiplier: {
    type: Number,
    default: null
  },

  winAmount: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    enum: ["PENDING", "WON", "LOST"],
    default: "PENDING"
  }

}, { timestamps: true });


betSchema.index({ userId: 1, roundId: 1 }, { unique: true });

const Bet =  mongoose.model("Bet", betSchema);

export default Bet;