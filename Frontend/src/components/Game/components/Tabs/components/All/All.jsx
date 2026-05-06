import React from "react";
import styles from "./All.module.scss";

const players = [
  { id: 1, avatar: "🚗", name: "d***6", bet: "8,000.00", multiplier: "", win: "0.00", color: "red" },
  { id: 2, avatar: "🚗", name: "d***6", bet: "8,000.00", multiplier: "", win: "0.00", color: "red" },
  { id: 3, avatar: "🍀", name: "d***9", bet: "8,000.00", multiplier: "", win: "0.00", color: "green" },
  { id: 4, avatar: "🍀", name: "d***9", bet: "8,000.00", multiplier: "", win: "0.00", color: "green" },
  { id: 5, avatar: "🪙", name: "d***8", bet: "8,000.00", multiplier: "", win: "0.00", color: "silver" },
  { id: 6, avatar: "🪙", name: "d***8", bet: "8,000.00", multiplier: "", win: "0.00", color: "silver" },
  { id: 7, avatar: "🟠", name: "d***8", bet: "8,000.00", multiplier: "", win: "0.00", color: "orange" },
  { id: 8, avatar: "🟠", name: "d***8", bet: "8,000.00", multiplier: "", win: "0.00", color: "orange" },
  { id: 9, avatar: "🪐", name: "d***1", bet: "8,000.00", multiplier: "", win: "0.00", color: "purple" },
  { id: 10, avatar: "🪐", name: "d***1", bet: "8,000.00", multiplier: "", win: "0.00", color: "purple" },
];

function All() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.resultCard}>
        <div className={styles.resultLabel}>Round Result</div>
        <div className={styles.resultValue}>1.03x</div>
      </div>

      <div className={styles.tableHeader}>
        <div>Player</div>
        <div>Bet INR</div>
        <div>X</div>
        <div>Win INR</div>
      </div>

      <div className={styles.rows}>
        {players.map((player) => (
          <div key={player.id} className={styles.row}>
            <div className={styles.playerCell}>
              <div className={`${styles.avatar} ${styles[player.color]}`}>
                <span>{player.avatar}</span>
              </div>
              <span className={styles.playerName}>{player.name}</span>
            </div>

            <div className={styles.betCell}>{player.bet}</div>
            <div className={styles.multiplierCell}>{player.multiplier || ""}</div>
            <div className={styles.winCell}>{player.win}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default All;