import React from "react";
import cn from "classnames";
import styles from "./Footer.module.sass";

function Footers() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerimage}>
        <img src="/images/content/footer-PAHO-IDB.png" alt="IDB-PAHO" />
      </div>
      <div className={cn("container", styles.container)}>
        <div className={styles.foot}>
          <div className={styles.copyright}>
            Copyright © 2021 LACChain. All rights reserved
          </div>
          <div className={styles.note}>
            We use cookies for better service. <a href="/#">Accept</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footers;
