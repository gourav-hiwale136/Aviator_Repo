import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";


export const createUser = asyncHandler(async (req, res) => {
  const { name, balance } = req.body;

  const user = await User.create({
    name,
    balance: balance || 1000
  });

  res.json({
    message: "User created successfully",
    user
  });
});


export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json(users);
});


export const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
});