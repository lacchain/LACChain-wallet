import React from 'react';
import cn from 'classnames';
import styles from './LoaderCircle.module.sass';

function Loader({ className }) {
  return <div className={cn(styles.loader, className)} />;
}

export default Loader;
