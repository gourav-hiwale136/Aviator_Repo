import React, { useState } from "react";
import styles from "./Tabs.module.scss";
import All from "./components/All/All";
const Tabs = () => {
    const [active,setActive] = useState("All")
  return (
    <section className={styles.tab_main_section}>
      <div className={styles.tab_main_div}>
        <div className={`${styles.single_div} ${active === "All" ? styles?.active : ""}`} onClick={() => setActive("All")}>
          <p>All Bets</p>
        </div>
        <div className={`${styles.single_div} ${active === "Previous" ? styles?.active : ""}`} onClick={() => setActive("Previous")}>
          <p>Previous</p>
        </div>
        <div className={`${styles.single_div} ${active === "Top" ? styles?.active : ""}`} onClick={() => setActive("Top")}>
          <p>Top</p>
        </div>
      </div>

      <All/>
    </section>
  );
};

export default Tabs;
