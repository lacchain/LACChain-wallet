import React from 'react';
import cn from 'classnames';
import styles from './Claims.module.sass';

function Claims({ className, claims }) {
  const claimNames = Object.keys(claims || {});
  return (
    <div className={cn(styles.users, className)}>
      <div className={styles.list}>
        {claimNames.map((name, index) => (
				  typeof claims[name] === 'object' ? <Claims key={index} className={className} claims={claims[name]} />
            : (
              <div className={styles.item} key={index}>
                <div className={styles.details}>
                  <div className={styles.name}>{name}</div>
                  <div className={styles.value}>{claims[name]}</div>
                </div>
              </div>
            )
        ))}
      </div>
    </div>
  );
}

export default Claims;
