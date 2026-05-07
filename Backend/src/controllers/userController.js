import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";


export const createUser = asyncHandler(async (req, res) => {
  const { name, balance } = req.body;


  if (!name || name.trim() === "") {
    return res.status(400).json({ message: "Name is required" });
  }

  if (balance && balance < 0) {
    return res.status(400).json({ message: "Balance cannot be negative" });
  }

  const user = await User.create({
    name: name.trim(),
    balance: balance ?? 1000,
  });

  res.status(201).json({
    message: "User created successfully",
    user,
  });
});


export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });

  res.json(users);
});


export const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
});