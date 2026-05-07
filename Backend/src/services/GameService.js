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

    this.activeBets = new Map();

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
    }, 8000);
  }

  
  async runGame() {
    const startTime = Date.now();

    this.interval = setInterval(async () => {
      const elapsed = Date.now() - startTime;

      // smoother growth
      this.multiplier = Number((this.multiplier + 0.01).toFixed(2));

      this.io.emit("multiplier:update", {
        roundId: this.roundId,
        multiplier: this.multiplier,
      });

      // crash logic
      if (
        !this.hasCrashed &&
        elapsed >= 5000 &&
        this.multiplier >= this.crashPoint
      ) {
        clearInterval(this.interval);
        await this.settleRound();
      }
    }, 100);
  }

  
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

  
    for (const [userId, betData] of this.activeBets.entries()) {
      await Bet.findByIdAndUpdate(betData.betId, {
        status: "LOST",
      });

      this.io.emit("bet:lost", {
        userId,
      });
    }

    this.activeBets.clear();

    this.isRoundActive = false;

    setTimeout(() => {
      this.startRound();
    }, 3000);
  }
}

export default GameService;