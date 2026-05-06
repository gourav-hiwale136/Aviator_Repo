import express from "express";
import { createUser, getUsers, getUser } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/create", createUser);
userRouter.get("/", getUsers);
userRouter.get("/:id", getUser);

export default userRouter;