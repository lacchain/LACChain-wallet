import React from 'react';
import cn from 'classnames';
import styles from './AlertFailed.module.sass';

export function AlertFailed({
  className, title, children, onAccept,
}) {
  return (
    <div className={cn(className, styles.wrap)}>
      <div style={{ transform: 'scale(0.6)' }}>
        <div className={styles.failed_mark}>
          <div className={styles.failed_icon}>
            <span className={cn(styles.icon_line, styles.left)}> </span>
            <span className={cn(styles.icon_line, styles.right)}> </span>
          </div>
        </div>
      </div>
      <div className={cn('h4', styles.title)}>
        {title}
      </div>
      <div className={styles.info}>
        {children}
      </div>
      <div className={styles.btns}>
        <button className={cn('button-small', styles.button)} onClick={() => onAccept()}>
          Accept
        </button>
      </div>
    </div>
  );
}
