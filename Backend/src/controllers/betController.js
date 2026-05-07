import Bet from "../models/Bet.js";
import User from "../models/User.js";
import { getGame } from "../services/gameInstance.js";
import asyncHandler from "../utils/asyncHandler.js";


export const placeBet = asyncHandler(async (req, res) => {
  const { userId, amount } = req.body;

  
  if (!userId || userId === "undefined") {
    return res.status(400).json({ message: "Invalid userId" });
  }

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  const game = getGame();

  if (!game || game.getStatus() !== "BETTING") {
    return res.status(400).json({ message: "Betting closed" });
  }

  const roundId = game.getRoundId();

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // prevent double bet
  const existing = game.activeBets.get(userId.toString());
  if (existing) {
    return res.status(400).json({ message: "Already placed bet" });
  }

  if (user.balance < amount) {
    return res.status(400).json({ message: "Insufficient balance" });
  }

  user.balance -= amount;
  await user.save();

  const bet = await Bet.create({
    userId,
    roundId,
    amount,
    status: "PENDING",
  });

  
  game.activeBets.set(userId.toString(), {
    betId: bet._id,
    amount,
  });

  
  game.io.emit("bet:placed", {
    userId,
    amount,
  });

  res.json({
    message: "Bet placed",
    bet,
  });
});


export const cashout = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId || userId === "undefined") {
    return res.status(400).json({ message: "Invalid userId" });
  }

  const game = getGame();

  if (!game || game.getStatus() !== "RUNNING") {
    return res.status(400).json({ message: "Game not running" });
  }

  if (game.hasCrashed) {
    return res.status(400).json({
      message: "Too late, game already crashed",
    });
  }

  const activeBet = game.activeBets.get(userId.toString());

  if (!activeBet) {
    return res.status(400).json({
      message: "No active bet or already cashed out",
    });
  }

  
  game.activeBets.delete(userId.toString());

  const multiplier = game.getMultiplier();

  const bet = await Bet.findById(activeBet.betId);

  if (!bet) {
    return res.status(404).json({ message: "Bet not found" });
  }

  bet.status = "WON";
  bet.cashoutMultiplier = multiplier;
  bet.winAmount = Number((bet.amount * multiplier).toFixed(2));

  await bet.save();

  const user = await User.findById(userId);
  user.balance += bet.winAmount;
  await user.save();

  game.io.emit("bet:cashedout", {
    userId,
    multiplier,
    winAmount: bet.winAmount,
  });

  res.json({
    message: "Cashed out successfully",
    multiplier,
    winAmount: bet.winAmount,
  });
});