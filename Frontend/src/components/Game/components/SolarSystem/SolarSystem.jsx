import React from "react";
import styles from "./SolarSystem.module.scss";

const SolarSystem = () =>  {
  return (
    <div className={styles.container}>
      <div className={styles.stars} />
      <div className={styles.sun} />
      <div className={styles.orbitWrapper}>
        <div className={`${styles.orbit} ${styles.mercuryOrbit}`} />
        <div className={`${styles.planet} ${styles.mercury}`} />
        <div className={`${styles.orbit} ${styles.venusOrbit}`} />
        <div className={`${styles.planet} ${styles.venus}`} />
        <div className={`${styles.orbit} ${styles.earthOrbit}`} />
        <div className={`${styles.planet} ${styles.earth}`} />
        <div className={`${styles.orbit} ${styles.marsOrbit}`} />
        <div className={`${styles.planet} ${styles.mars}`} />
        <div className={`${styles.orbit} ${styles.jupiterOrbit}`} />
        <div className={`${styles.planet} ${styles.jupiter}`} />
        <div className={`${styles.orbit} ${styles.saturnOrbit}`} />
        <div className={`${styles.planet} ${styles.saturn}`} />
      </div>
    </div>
  );
}

export default SolarSystem;