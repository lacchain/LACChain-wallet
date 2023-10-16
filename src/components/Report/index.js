import React from 'react';
import cn from 'classnames';
import styles from './Report.module.sass';

function Report({ className, qr }) {
  return (
    <div className={cn(className, styles.transfer)}>
      <div className={cn('h4', styles.title)}>QR Code</div>
      <img src={qr} alt="QR Code" width="100%" />
    </div>
  );
}

export default Report;
