import express from "express";
import { placeBet, cashout } from "../controllers/betController.js";

const betRouter = express.Router();

betRouter.post("/place", placeBet);
betRouter.post("/cashout", cashout);

export default betRouter;