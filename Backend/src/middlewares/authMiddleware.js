import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/userModel.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token failed" });
  }
});