import React from 'react';
import cn from 'classnames';
import styles from './Users.module.sass';
import LoaderCircle from '../../../components/LoaderCircle';

function RootOfTrust({ className, items, loading }) {
  return (
    <div className={cn(styles.users, className)}>
      {loading ? (
        <div className={styles.icon}>
          <LoaderCircle className={styles.loader} />
        </div>
      ) : ''}
      <div className={styles.list}>
        {items.map((x, index) => (
          <div className={styles.item} style={{ paddingLeft: `${index * 40}px` }} key={index}>
            <div className={styles.avatar}>
              <img src={`/images/content/${index > 0 ? 'tl' : 'pkd'}.svg`} alt="Avatar" />
              <div className={styles.reward}>
                <img src={`/images/content/${x.valid ? 'valid' : 'invalid'}.svg`} width={20} />
              </div>
            </div>
            <div className={styles.details}>
              <div className={styles.position}>{index === items.length - 1 ? 'Issuer' : index > 0 ? 'Trusted List' : 'Root'}</div>
              <div className={styles.name}>{x.name}</div>
              <div>{x.address}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RootOfTrust;
