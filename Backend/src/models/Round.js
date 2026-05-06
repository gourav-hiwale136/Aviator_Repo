import mongoose from "mongoose";

const roundSchema = new mongoose.Schema(
  {
    crashPoint: {
      type: Number,
      default: null
    },

    status: {
      type: String,
      enum: ["BETTING", "RUNNING", "CRASHED"],
      default: "BETTING"
    },

    startTime: {
      type: Date,
      default: null
    },

    endTime: {
      type: Date,
      default: null
    },

    roundNumber: {
      type: Number,
      default: 1
    }
  },
  { timestamps: true }
);

const Round = mongoose.model("Round", roundSchema);

export default Round;