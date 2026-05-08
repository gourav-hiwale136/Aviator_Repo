import express from "express";
import { placeBet, cashout } from "../controllers/betController.js";
import { protect } from "../middlewares/authMiddleware.js"; 

const betRouter = express.Router();


betRouter.post("/place", protect, placeBet);
betRouter.post("/cashout", protect, cashout);

export default betRouter;