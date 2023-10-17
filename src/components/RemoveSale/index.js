import React from 'react';
import cn from 'classnames';
import styles from './RemoveSale.module.sass';

function RemoveSale({ className, onAccept }) {
  return (
    <div className={cn(className, styles.transfer)}>
      <div className={cn('h4', styles.title)}>Remove item</div>
      <div className={styles.text}>
        Do you really want to remove your item from wallet? You can add the token
        anytime or synchronize the credentials with the mailbox
      </div>
      <div className={styles.btns}>
        <button className={cn('button-pink', styles.button)} onClick={onAccept}>Remove now</button>
      </div>
    </div>
  );
}

export default RemoveSale;
