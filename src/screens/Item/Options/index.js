import React from 'react';
import cn from 'classnames';
import styles from './Options.module.sass';
import Actions from '../../../components/Actions';
import ActionsToken from '../../../components/Actions/token';

function Options({
  className, item, type, attachment,
}) {
  return (
    <div className={cn(styles.options, className)}>
      {type.kind === 'token'
        ? <ActionsToken className={styles.actions} token={item} />
        : <Actions className={styles.actions} item={item} attachment={attachment} />}
    </div>
  );
}

export default Options;
