import Round from "../models/Round.js";
import Bet from "../models/Bet.js";

class GameService {
  constructor(io) {
    this.io = io;

    this.roundId = null;
    this.multiplier = 1;
    this.crashPoint = null;
    this.interval = null;

    this.hasCrashed = false;
    this.status = "BETTING";

    this.activeBets = new Map(); // key = userId (string)

    this.isRoundActive = false;
  }

  getMultiplier() {
    return Number(this.multiplier.toFixed(2));
  }

  getRoundId() {
    return this.roundId;
  }

  getStatus() {
    return this.status;
  }

  
  generateCrashPoint() {
    const r = Math.random();

    if (r < 0.4) return 1.5 + Math.random() * 1.5;
    if (r < 0.7) return 2.5 + Math.random() * 2.5;
    if (r < 0.9) return 5 + Math.random() * 5;

    return 10 + Math.random() * 20;
  }

  
  async resetRound() {
    this.multiplier = 1;
    this.hasCrashed = false;
    this.status = "BETTING";
    this.crashPoint = Number(this.generateCrashPoint().toFixed(2));

    this.activeBets.clear();

    const round = await Round.create({
      status: "BETTING",
      startTime: new Date(),
      crashPoint: this.crashPoint,
    });

    this.roundId = round._id;

    console.log("NEW ROUND | Crash:", this.crashPoint);

    this.io.emit("round:betting", {
      roundId: this.roundId,
      multiplier: this.multiplier, 
    });
  }

  
  async lockBetting() {
    this.status = "RUNNING";

    const round = await Round.findById(this.roundId);
    if (round) {
      round.status = "RUNNING";
      await round.save();
    }

    console.log("BETTING LOCKED");

    this.io.emit("round:running", {
      roundId: this.roundId,
    });
  }

  
  async startRound() {
    if (this.isRoundActive) return;

    this.isRoundActive = true;

    if (this.interval) clearInterval(this.interval);

    await this.resetRound();

    setTimeout(() => {
      this.lockBetting();
      this.runGame();
    }, 8000); // betting time
  }

  
async runGame() {
  const ROUND_DURATION = 20000; // 20 seconds total
  const startTime = Date.now();

  const intervalMs = 50;

  this.interval = setInterval(async () => {
    const elapsed = Date.now() - startTime;

    
    if (elapsed >= ROUND_DURATION) {
      clearInterval(this.interval);
      this.interval = null;

      // force crash if not already crashed
      if (!this.hasCrashed) {
        this.crashPoint = this.multiplier;
        await this.settleRound();
      }
      return;
    }

    const seconds = elapsed / 1000;

    
    this.multiplier = Number(
      (Math.exp(0.22 * seconds)).toFixed(2)
    );

    this.io.emit("multiplier:update", {
      roundId: this.roundId,
      multiplier: this.multiplier,
    });

    // crash condition (still allowed before 20s)
    if (!this.hasCrashed && this.multiplier >= this.crashPoint) {
      clearInterval(this.interval);
      this.interval = null;
      await this.settleRound();
      return;
    }

  }, intervalMs);
}
  // Crash + settle
  async settleRound() {
    this.hasCrashed = true;
    this.status = "CRASHED";

    const round = await Round.findById(this.roundId);
    if (round) {
      round.status = "CRASHED";
      round.endTime = new Date();
      await round.save();
    }

    console.log("CRASHED AT:", this.crashPoint);

    this.io.emit("round:crash", {
      roundId: this.roundId,
      crashPoint: this.crashPoint,
    });

    // mark all remaining bets as LOST
    for (const [userId, betData] of this.activeBets.entries()) {
      const bet = await Bet.findByIdAndUpdate(
        betData.betId,
        { status: "LOST" },
        { returnDocument: "after" }
      );

      this.io.emit("bet:lost", {
        userId: userId.toString(),
        roundId: this.roundId,
        amount: bet?.amount || 0,
      });
    }

    this.activeBets.clear();

    this.isRoundActive = false;

    //  next round
    setTimeout(() => {
      this.startRound();
    }, 3000);
  }
}

export default GameService;