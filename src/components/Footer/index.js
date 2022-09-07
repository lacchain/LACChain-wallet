import React from "react";
import cn from "classnames";
import styles from "./Footer.module.sass";

const Footers = () => {

  return (
    <footer className={styles.footer}>
      <div className={cn("container", styles.container)}>
        <div className={styles.foot}>
          <div className={styles.copyright}>
            Copyright © 2022 LACChain. All rights reserved
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footers;
