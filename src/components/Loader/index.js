import React from 'react';
import cn from 'classnames';
import styles from './Loader.module.sass';

function Loader({ className, color }) {
  return (
    <div
      className={cn(styles.loader, className, {
        [styles.loaderWhite]: color === 'white',
      })}
    />
  );
}

export default Loader;
