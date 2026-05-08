import express from "express";
import { signup, login, getProfile } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.get("/profile", protect, getProfile);

export default userRouter;


// import express from "express";
// import { createUser, getUsers, getUser } from "../controllers/authController.js";

// const userRouter = express.Router();

// userRouter.post("/create", createUser);
// userRouter.get("/", getUsers);
// userRouter.get("/:id", getUser);

// export default userRouter;