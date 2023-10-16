import React from 'react';
import cn from 'classnames';
import styles from './AlertSuccess.module.sass';

export function AlertSuccess({
  className, title, children, onAccept,
}) {
  return (
    <div className={cn(className, styles.wrap)}>
      <div className={styles.success_checkmark}>
        <div className={styles.check_icon}>
          <span className={cn(styles.icon_line, styles.line_tip)}> </span>
          <span className={cn(styles.icon_line, styles.line_long)}> </span>
          <div className={styles.icon_circle}> </div>
          <div className={styles.icon_fix}> </div>
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
