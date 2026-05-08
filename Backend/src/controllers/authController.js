import User from "../models/userModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";



export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name: name.trim(),
    email,
    password: hashedPassword,
  });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    balance: user.balance,
    token: generateToken(user._id),
  });
});



export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      balance: user.balance,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
});



export const getProfile = asyncHandler(async (req, res) => {
  res.json(req.user);
});





// import User from "../models/userModel.js";
// import asyncHandler from "../utils/asyncHandler.js";
// import mongoose from "mongoose";

// export const createUser = asyncHandler(async (req, res) => {
//   const { name, balance } = req.body;

//   if (!name || name.trim() === "") {
//     return res.status(400).json({ message: "Name is required" });
//   }

//   if (balance && balance < 0) {
//     return res.status(400).json({ message: "Balance cannot be negative" });
//   }

//   const user = await User.create({
//     name: name.trim(),
//     balance: balance ?? 1000,
//   });

//   res.status(201).json({
//     message: "User created successfully",
//     user,
//   });
// });

// export const getUsers = asyncHandler(async (req, res) => {
//   const users = await User.find().sort({ createdAt: -1 });

//   res.json(users);
// });

// export const getUser = asyncHandler(async (req, res) => {
//   const { id } = req.params;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return res.status(400).json({ message: "Invalid user ID" });
//   }

//   const user = await User.findById(id);

//   if (!user) {
//     return res.status(404).json({ message: "User not found" });
//   }

//   res.json(user);
// });




