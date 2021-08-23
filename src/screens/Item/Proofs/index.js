import React from "react";
import cn from "classnames";
import styles from "./Users.module.sass";

const Proofs = ( { className, items }) => {
  return (
    <div className={cn(styles.users, className)}>
      <div className={styles.list}>
        {items.map((x, index) => (
          <div className={styles.item} key={index}>
            <div className={styles.avatar}>
              <img src={x.avatar} alt="Avatar" />
                <div className={styles.reward}>
                    <img src={`/images/content/${x.valid ? 'valid': 'invalid'}.svg`} width={20} />
                </div>
            </div>
            <div className={styles.details}>
              <div className={styles.position}>{x.position}</div>
              <div className={styles.name}>{x.name}</div>
              <div>{x.did}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Proofs;
