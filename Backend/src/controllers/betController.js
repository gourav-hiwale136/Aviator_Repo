import Bet from "../models/Bet.js";
import User from "../models/userModel.js";
import { getGame } from "../services/gameInstance.js";
import asyncHandler from "../utils/asyncHandler.js";

export const placeBet = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  const userId = req.user._id;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid bet amount" });
  }

  const game = getGame();

  if (!game) {
    return res.status(500).json({ message: "Game not initialized" });
  }

  if (game.getStatus() !== "BETTING") {
    return res.status(400).json({ message: "Betting is closed" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  //  single bet per round check 
  const existingBet = game.activeBets.get(userId.toString());
  if (existingBet) {
    return res.status(400).json({ message: "You already placed a bet this round" });
  }

  if (user.balance < amount) {
    return res.status(400).json({ message: "Insufficient balance" });
  }

  // deduct balance first
  user.balance -= amount;
  await user.save();

  const bet = await Bet.create({
    userId,
    roundId: game.getRoundId(),
    amount,
    status: "PENDING",
  });

  // store active bet in memory
  game.activeBets.set(userId.toString(), {
    betId: bet._id,
    amount,
    cashedOut: false,
  });

  game.io.emit("bet:placed", {
    userId,
    amount,
  });

  return res.json({
    message: "Bet placed successfully",
    bet,
    balance: user.balance,
  });
});


export const cashout = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const game = getGame();

  if (!game) {
    return res.status(500).json({ message: "Game not initialized" });
  }

  if (game.getStatus() !== "RUNNING") {
    return res.status(400).json({ message: "Game is not running" });
  }

  if (game.hasCrashed) {
    return res.status(400).json({ message: "Round already crashed" });
  }

  const activeBet = game.activeBets.get(userId.toString());

  if (!activeBet) {
    return res.status(400).json({ message: "No active bet found" });
  }

  if (activeBet.cashedOut) {
    return res.status(400).json({ message: "Already cashed out" });
  }

  const bet = await Bet.findById(activeBet.betId);
  if (!bet) {
    return res.status(404).json({ message: "Bet not found" });
  }

  const multiplier = game.getMultiplier();

  const winAmount = Number((bet.amount * multiplier).toFixed(2));

  //  mark as cashed out FIRST (prevents double spend)
  activeBet.cashedOut = true;
  game.activeBets.set(userId.toString(), activeBet);

  // remove from active pool
  game.activeBets.delete(userId.toString());

  // update bet record
  bet.status = "WON";
  bet.cashoutMultiplier = multiplier;
  bet.winAmount = winAmount;
  await bet.save();

  // update user balance
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.balance = Number((user.balance + winAmount).toFixed(2));
  await user.save();

  game.io.emit("bet:cashedout", {
    userId,
    multiplier,
    winAmount,
  });

  return res.json({
    message: "Cashed out successfully",
    multiplier,
    winAmount,
    balance: user.balance,
  });
});