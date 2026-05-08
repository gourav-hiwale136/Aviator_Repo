import { socket } from "../../api/socket.js";
import { useState, useEffect, useRef, useCallback } from "react";
import SolarSystem from "./components/SolarSystem/SolarSystem";
import Rocket from "./components/Rocket/Rocket";
import styles from "./Game.module.scss";
import Tabs from "./components/Tabs/Tabs";
import api from "../../api/axios";
const BET_AMOUNTS = [10, 50, 100, 500, 1000];
const CRASH_MESSAGES = ["BURST!", "CRASHED!", "BOOM!", "EXPLODED!"];

const AviatorGame = () => {
  const [balance, setBalance] = useState(5000);
  const [bet, setBet] = useState(100);
  const [phase, setPhase] = useState("idle"); // idle | flying | crashed | won
  const [multiplier, setMultiplier] = useState(1.0);
  const [rocketPos, setRocketPos] = useState({ x: 80, y: 320 });
  const [cashedOut, setCashedOut] = useState(null);
  const [history, setHistory] = useState([]);
  const [crashMsg] = useState(
    () => CRASH_MESSAGES[Math.floor(Math.random() * CRASH_MESSAGES.length)],
  );
  const [trail, setTrail] = useState([]);
  const [countdown, setCountdown] = useState(null);

  const animRef = useRef(null);
  const startTimeRef = useRef(null);
  const crashPointRef = useRef(null);
  const multiplierRef = useRef(1.0);

  const generateCrashPoint = () => {
    // Weighted: often crashes between 1.0-3.0, sometimes higher
    const r = Math.random();
    if (r < 0.35) return 1.0 + Math.random() * 0.5;
    if (r < 0.65) return 1.5 + Math.random() * 1.5;
    if (r < 0.85) return 3.0 + Math.random() * 4;
    return 7.0 + Math.random() * 13;
  };

  const stopGame = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
  }, []);

  const startGame = useCallback(async() => {
    if (balance < bet) return;
    //  const userId = "69f98337e7741b090089ea73"
    const userId = localStorage.getItem("userId");

  api.post("/bet/place", {
    // userId,
    amount: bet
  }).catch(err => console.error(err));
    setBalance((b) => b - bet);
    setCashedOut(null);
    setTrail([]);
    crashPointRef.current = generateCrashPoint();
    multiplierRef.current = 1.0;
    setMultiplier(1.0);
    setRocketPos({ x: 80, y: 320 });
    setPhase("flying");
    startTimeRef.current = null;

    const animate = (ts) => {
      if (!startTimeRef.current) startTimeRef.current = ts;
      const elapsed = (ts - startTimeRef.current) / 1000;

      // Multiplier grows exponentially
      const newMult = Math.pow(1.065, elapsed * 8);
      multiplierRef.current = newMult;
      setMultiplier(newMult);

      // Rocket path: curve upward and right
      const progress = Math.min(elapsed / 8, 1);
      const nx = 80 + progress * 560;
      const ny = 320 - Math.pow(progress, 0.6) * 290;
      setRocketPos({ x: nx, y: ny });
      setTrail((prev) => {
        const next = [...prev, { x: nx, y: ny }];
        return next.slice(-60);
      });

      if (newMult >= crashPointRef.current) {
        setPhase("crashed");
        setTrail([]);
        setHistory((h) => [
          { mult: newMult.toFixed(2), crashed: true },
          ...h.slice(0, 9),
        ]);
        stopGame();
        return;
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
  }, [balance, bet, stopGame]);

    const cashOut = useCallback(async() => { 
      if (phase !== "flying") {
    return;
  }
  // const userId = "69f98337e7741b090089ea73"
  const userId = localStorage.getItem("userId");

  api.post("/bet/cashout", {
    // userId,
    // amount: bet
  }).catch(err => console.error(err));

  const winnings = Math.floor(bet * multiplierRef.current);  

      setCashedOut(winnings); setBalance((b) => b + winnings); 
      setPhase("won"); setTrail([]); 
      setHistory((h) => [ { mult: multiplierRef.current.toFixed(2), 
        crashed: false, win: winnings }, 
        ...h.slice(0, 9), ]);
         // stopGame(); 
         }, 
         [phase, bet]);

  // Countdown before next game
  useEffect(() => {
    if (phase === "crashed") {
      let c = 3;
      setCountdown(c);
      const interval = setInterval(() => {
        c--;
        if (c <= 0) {
          setCountdown(null);
          setPhase("idle");
          clearInterval(interval);
        } else setCountdown(c);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phase]);

//   useEffect(() => {
//   console.log("Socket instance:", socket);
// }, []);

  useEffect(() => {
  const existingUser = localStorage.getItem("userId");

  if (!existingUser) {
    api.post("/user/create", {
      name: "Player" // or anything
    })
    .then((res) => {
      console.log("CREATE USER RESPONSE:", res.data); 
      const userId = res.data._id;
      localStorage.setItem("userId", userId);
      console.log("User created:", userId);
    })
    .catch((err) => {
      console.error("Create user error:", err);
    });
  }
}, []);

  useEffect(() => () => stopGame(), [stopGame]);

  const canBet = phase === "idle";
  const isFlying = phase === "flying";

  const multColor =
    multiplierRef.current < 2
      ? "#69f0ae"
      : multiplierRef.current < 5
        ? "#ffab40"
        : "#ff5252";
  const rocketAngle =
    trail.length > 1
      ? (() => {
          const p1 = trail[trail.length - 2];
          const p2 = trail[trail.length - 1];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          return (Math.atan2(dy, dx) * 180) / Math.PI;
        })()
      : 0;
  // console.log('trail', trail)
  return (
    // <div style={{ fontFamily: "'Orbitron', monospace", minHeight: "100vh", position: "relative", color: "#fff" }}>
    //   <SolarSystem />

    //   <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", padding: "16px", minHeight: "100vh" }}>

    //     {/* Header */}
    //     <div style={{ textAlign: "center", marginBottom: "12px" }}>
    //       <h1 style={{ margin: 0, fontSize: "2.2rem", fontWeight: 900, letterSpacing: "0.15em", background: "linear-gradient(135deg, #ffdd00, #ff8800, #ff4444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
    //         🚀 AVIATOR
    //       </h1>
    //       <p style={{ margin: "2px 0 0", fontSize: "0.7rem", color: "#9e9e9e", letterSpacing: "0.2em", fontFamily: "'Rajdhani', sans-serif" }}>SOLAR ODYSSEY</p>
    //     </div>

    //     {/* Balance */}
    //     <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "12px", padding: "8px 28px", marginBottom: "14px", backdropFilter: "blur(12px)" }}>
    //       <span style={{ fontSize: "0.65rem", color: "#9e9e9e", letterSpacing: "0.2em" }}>BALANCE</span>
    //       <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#69f0ae" }}>₹{balance.toLocaleString()}</div>
    //     </div>

    //     {/* History bar */}
    //     <div style={{ display: "flex", gap: "6px", marginBottom: "14px", flexWrap: "wrap", justifyContent: "center" }}>
    //       {history.map((h, i) => (
    //         <div key={i} style={{
    //           padding: "3px 10px", borderRadius: "20px", fontSize: "0.7rem", fontWeight: 700,
    //           background: h.crashed ? "rgba(255,82,82,0.2)" : "rgba(105,240,174,0.2)",
    //           border: `1px solid ${h.crashed ? "rgba(255,82,82,0.5)" : "rgba(105,240,174,0.5)"}`,
    //           color: h.crashed ? "#ff5252" : "#69f0ae"
    //         }}>{h.mult}x</div>
    //       ))}
    //       {history.length === 0 && <div style={{ fontSize: "0.65rem", color: "#616161", letterSpacing: "0.15em" }}>NO HISTORY YET</div>}
    //     </div>

    //     {/* Game Canvas */}
    //     <div style={{
    //       width: "700px", maxWidth: "95vw", height: "380px",
    //       background: "rgba(0,0,10,0.65)",
    //       border: "1px solid rgba(255,255,255,0.1)",
    //       borderRadius: "20px",
    //       backdropFilter: "blur(16px)",
    //       position: "relative",
    //       overflow: "hidden",
    //       marginBottom: "16px",
    //       boxShadow: "0 8px 40px rgba(0,0,0,0.5)"
    //     }}>
    //       <svg width="100%" height="100%" viewBox="0 0 700 380">
    //         {/* Grid lines */}
    //         {[1, 2, 3, 5, 10].map(v => {
    //           const progress = Math.log(v) / Math.log(10) * 0.5;
    //           const y = 340 - progress * 290;
    //           return (
    //             <g key={v}>
    //               <line x1="60" y1={y} x2="690" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4,8" />
    //               <text x="50" y={y + 4} textAnchor="end" fill="rgba(255,255,255,0.25)" fontSize="11" fontFamily="Orbitron">{v}x</text>
    //             </g>
    //           );
    //         })}
    //         {/* Axes */}
    //         <line x1="60" y1="10" x2="60" y2="350" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
    //         <line x1="60" y1="350" x2="690" y2="350" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

    //         {/* Trail */}
    //         {trail.length > 1 && (
    //           <polyline
    //             points={trail.map(p => `${p.x},${p.y}`).join(" ")}
    //             fill="none"
    //             stroke={phase === "crashed" ? "#ff5252" : "#42a5f5"}
    //             strokeWidth="2.5"
    //             strokeLinecap="round"
    //             opacity="0.7"
    //           />
    //         )}

    //         {/* Rocket */}
    //         {(phase === "flying" || phase === "crashed" || phase === "won") && (
    //           <Rocket x={rocketPos.x} y={rocketPos.y} crashed={phase === "crashed"} />
    //         )}

    //         {/* Idle state */}
    //         {phase === "idle" && (
    //           <text x="350" y="200" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="16" fontFamily="Orbitron" letterSpacing="4">
    //             PLACE BET & LAUNCH
    //           </text>
    //         )}

    //         {/* Multiplier display */}
    //         {(phase === "flying" || phase === "crashed" || phase === "won") && (
    //           <>
    //             <text x="350" y="170" textAnchor="middle" fill={phase === "crashed" ? "#ff5252" : phase === "won" ? "#69f0ae" : multColor}
    //               fontSize="52" fontWeight="900" fontFamily="Orbitron" opacity="0.95">
    //               {phase === "crashed" ? crashMsg : `${multiplier.toFixed(2)}x`}
    //             </text>
    //             {phase === "won" && cashedOut && (
    //               <text x="350" y="220" textAnchor="middle" fill="#69f0ae" fontSize="20" fontFamily="Orbitron">
    //                 +₹{cashedOut.toLocaleString()}
    //               </text>
    //             )}
    //           </>
    //         )}

    //         {/* Countdown */}
    //         {countdown !== null && (
    //           <text x="350" y="260" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="14" fontFamily="Rajdhani" letterSpacing="4">
    //             NEXT ROUND IN {countdown}s
    //           </text>
    //         )}
    //       </svg>
    //     </div>

    //     {/* Controls */}
    //     <div style={{
    //       background: "rgba(0,0,10,0.7)",
    //       border: "1px solid rgba(255,255,255,0.1)",
    //       borderRadius: "20px",
    //       padding: "20px 28px",
    //       backdropFilter: "blur(16px)",
    //       width: "700px", maxWidth: "95vw",
    //       boxShadow: "0 4px 30px rgba(0,0,0,0.4)"
    //     }}>
    //       {/* Bet selector */}
    //       <div style={{ marginBottom: "16px" }}>
    //         <div style={{ fontSize: "0.65rem", color: "#9e9e9e", letterSpacing: "0.2em", marginBottom: "8px" }}>BET AMOUNT</div>
    //         <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
    //           {BET_AMOUNTS.map(amt => (
    //             <button key={amt} onClick={() => canBet && setBet(amt)}
    //               disabled={!canBet}
    //               style={{
    //                 padding: "8px 16px", borderRadius: "8px", border: "none", cursor: canBet ? "pointer" : "not-allowed",
    //                 fontFamily: "Orbitron", fontSize: "0.75rem", fontWeight: 700,
    //                 background: bet === amt ? "linear-gradient(135deg,#ffab40,#ff6d00)" : "rgba(255,255,255,0.08)",
    //                 color: bet === amt ? "#fff" : "#9e9e9e",
    //                 boxShadow: bet === amt ? "0 0 12px rgba(255,150,0,0.4)" : "none",
    //                 transition: "all 0.2s",
    //                 transform: bet === amt ? "scale(1.05)" : "scale(1)"
    //               }}>₹{amt}</button>
    //           ))}
    //         </div>
    //       </div>

    //       {/* Custom bet */}
    //       <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
    //         <div style={{ fontSize: "0.65rem", color: "#9e9e9e", letterSpacing: "0.2em" }}>CUSTOM</div>
    //         <input type="number" value={bet} min={1} max={balance}
    //           onChange={e => canBet && setBet(Math.max(1, parseInt(e.target.value) || 1))}
    //           disabled={!canBet}
    //           style={{
    //             background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)",
    //             borderRadius: "8px", padding: "8px 12px", color: "#fff",
    //             fontFamily: "Orbitron", fontSize: "0.85rem", width: "120px",
    //             outline: "none"
    //           }} />
    //       </div>

    //       {/* Action buttons */}
    //       <div style={{ display: "flex", gap: "12px" }}>
    //         <button
    //           onClick={startGame}
    //           disabled={!canBet || balance < bet}
    //           style={{
    //             flex: 1, padding: "14px", borderRadius: "12px", border: "none",
    //             cursor: canBet && balance >= bet ? "pointer" : "not-allowed",
    //             fontFamily: "Orbitron", fontSize: "0.9rem", fontWeight: 700, letterSpacing: "0.1em",
    //             background: canBet && balance >= bet
    //               ? "linear-gradient(135deg, #1565c0, #0288d1)"
    //               : "rgba(255,255,255,0.05)",
    //             color: canBet && balance >= bet ? "#fff" : "#424242",
    //             boxShadow: canBet && balance >= bet ? "0 4px 20px rgba(2,136,209,0.4)" : "none",
    //             transition: "all 0.2s",
    //           }}>
    //           🚀 LAUNCH (₹{bet})
    //         </button>

    //         <button
    //           onClick={cashOut}
    //           disabled={!isFlying}
    //           style={{
    //             flex: 1, padding: "14px", borderRadius: "12px", border: "none",
    //             cursor: isFlying ? "pointer" : "not-allowed",
    //             fontFamily: "Orbitron", fontSize: "0.9rem", fontWeight: 700, letterSpacing: "0.1em",
    //             background: isFlying
    //               ? "linear-gradient(135deg, #2e7d32, #66bb6a)"
    //               : "rgba(255,255,255,0.05)",
    //             color: isFlying ? "#fff" : "#424242",
    //             boxShadow: isFlying ? "0 4px 20px rgba(102,187,106,0.5)" : "none",
    //             animation: isFlying ? "pulseCashout 1s ease-in-out infinite" : "none",
    //             transition: "all 0.2s",
    //           }}>
    //           💰 CASH OUT ({isFlying ? `₹${Math.floor(bet * multiplier)}` : "—"})
    //         </button>
    //       </div>

    //       <style>{`
    //         @keyframes pulseCashout {
    //           0%, 100% { box-shadow: 0 4px 20px rgba(102,187,106,0.5); }
    //           50% { box-shadow: 0 4px 30px rgba(102,187,106,0.9), 0 0 40px rgba(102,187,106,0.4); }
    //         }
    //       `}</style>
    //     </div>

    //     {/* Instructions */}
    //     <div style={{ marginTop: "14px", fontSize: "0.65rem", color: "rgba(255, 255, 255, 0.5)", letterSpacing: "0.1em", textAlign: "center", fontFamily: "Rajdhani, sans-serif" }}>
    //       PLACE BET → LAUNCH ROCKET → CASH OUT BEFORE IT BURSTS
    //     </div>
    //   </div>
    // </div>

    <div className={styles.appContainer}>
      <SolarSystem />
      <div className={styles.mainContent}>
        {/* Header */}

        {/* Balance */}
        <div className={styles.balanceContainer}>
          <span className={styles.balanceLabel}>BALANCE</span>
          <div className={styles.balance}>₹{balance.toLocaleString()}</div>
        </div>

        {/* History bar */}
        <div className={styles.historyBar}>
          {history.map((h, i) => (
            <div
              key={i}
              className={`${styles.historyItem} ${h.crashed ? styles.crashed : styles.normal}`}
            >
              {h.mult}x
            </div>
          ))}
          {history.length === 0 && (
            <div className={styles.noHistory}>NO HISTORY YET</div>
          )}
        </div>

        <div className={styles.tab_game_section}>
          <div className={styles.game_controls_main_div}>
            {/* Game Canvas */}
            <div className={styles.gameCanvas}>
              <svg width="100%" height="100%" viewBox="0 0 700 380">
                {/* Grid lines */}
                {[1, 2, 3, 5, 10, 15, 20].map((v, index, arr) => {
                  const top = 50;
                  const bottom = 340;
                  const step = (bottom - top) / (arr.length - 1);
                  const y = bottom - index * step;

                  return (
                    <g key={v}>
                      <line
                        x1="60"
                        y1={y}
                        x2="690"
                        y2={y}
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="1"
                        strokeDasharray="4,8"
                      />
                      <text
                        x="50"
                        y={y + 4}
                        textAnchor="end"
                        fill="rgba(255,255,255,0.25)"
                        fontSize="11"
                        fontFamily="Orbitron"
                      >
                        {v}x
                      </text>
                    </g>
                  );
                })}
                {/* Axes */}
                <line
                  x1="60"
                  y1="10"
                  x2="60"
                  y2="350"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="1"
                />
                <line
                  x1="60"
                  y1="350"
                  x2="690"
                  y2="350"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="1"
                />

                {/* Trail */}
                {trail.length > 1 && (
                  <>
                    <path
                      d={`
        M 60 350
        ${trail.map((p) => `L ${p.x} ${p.y}`).join(" ")}
        L ${trail[trail.length - 1].x} 350
        L 60 350
      `}
                      fill="rgba(255, 0, 60, 0.28)"
                    />

                    <polyline
                      points={trail.map((p) => `${p.x},${p.y}`).join(" ")}
                      fill="none"
                      stroke="#ff003c"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <polyline
                      points={trail.map((p) => `${p.x},${p.y}`).join(" ")}
                      fill="none"
                      stroke="rgba(255,80,120,0.35)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </>
                )}

                {/* Rocket */}
                {(phase === "flying" ||
                  phase === "crashed" ||
                  phase === "won") && (
                  <Rocket
                    x={rocketPos.x}
                    y={rocketPos.y}
                    crashed={phase === "crashed"}
                    angle={rocketAngle}
                  />
                )}

                {/* Idle state */}
                {phase === "idle" && (
                  <text
                    x="350"
                    y="200"
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.3)"
                    fontSize="16"
                    fontFamily="Orbitron"
                    letterSpacing="4"
                  >
                    PLACE BET & LAUNCH
                  </text>
                )}

                {/* Multiplier display */}
                {(phase === "flying" ||
                  phase === "crashed" ||
                  phase === "won") && (
                  <>
                    <text
                      x="350"
                      y="170"
                      textAnchor="middle"
                      fill={
                        phase === "crashed"
                          ? "#ff5252"
                          : phase === "won"
                            ? "#69f0ae"
                            : multColor
                      }
                      fontSize="52"
                      fontWeight="900"
                      fontFamily="Orbitron"
                      opacity="0.95"
                    >
                      {phase === "crashed"
                        ? crashMsg
                        : `${multiplier.toFixed(2)}x`}
                    </text>
                    {phase === "won" && cashedOut && (
                      <text
                        x="350"
                        y="220"
                        textAnchor="middle"
                        fill="#69f0ae"
                        fontSize="20"
                        fontFamily="Orbitron"
                      >
                        +₹{cashedOut.toLocaleString()}
                      </text>
                    )}
                  </>
                )}

                {/* Countdown */}
                {countdown !== null && (
                  <text
                    x="350"
                    y="260"
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.4)"
                    fontSize="14"
                    fontFamily="Rajdhani"
                    letterSpacing="4"
                  >
                    NEXT ROUND IN {countdown}s
                  </text>
                )}
              </svg>
            </div>

            {/* Controls */}
            <div className={styles.controls}>
              {/* Bet selector */}
              <div className={styles.betSelector}>
                <div className={styles.betLabel}>BET AMOUNT</div>
                <div className={styles.betOptions}>
                  {BET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => canBet && setBet(amt)}
                      disabled={!canBet}
                      className={
                        bet === amt ? styles.selectedBet : styles.betButton
                      }
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom bet */}
              <div className={styles.customBet}>
                <div className={styles.customBetLabel}>CUSTOM</div>
                <input
                  type="number"
                  value={bet}
                  min={1}
                  max={balance}
                  onChange={(e) =>
                    canBet && setBet(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  disabled={!canBet}
                  className={styles.customBetInput}
                />
              </div>

              {/* Action buttons */}
              <div className={styles.actionButtons}>
                <button
                  onClick={startGame}
                  disabled={!canBet || balance < bet}
                  className={
                    canBet && balance >= bet
                      ? styles.startButton
                      : styles.disabledButton
                  }
                >
                  🚀 LAUNCH (₹{bet})
                </button>

                <button
                  onClick={cashOut}
                  disabled={!isFlying}
                  className={
                    isFlying ? styles.cashOutButton : styles.disabledButton
                  }
                >
                  💰 CASH OUT (
                  {isFlying ? `₹${Math.floor(bet * multiplier)}` : "—"})
                </button>
              </div>
            </div>
          </div>
          <Tabs />
        </div>
        {/* Instructions */}
        <div className={styles.instructions}>
          PLACE BET → LAUNCH ROCKET → CASH OUT BEFORE IT BURSTS
        </div>
      </div>
    </div>
  );
};
export default AviatorGame;