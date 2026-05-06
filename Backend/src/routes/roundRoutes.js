import express from "express";
import { deleteAllRounds } from "../controllers/roundController.js";

const roundRouter = express.Router();

roundRouter.delete("/delete-all", deleteAllRounds);

export default roundRouter;