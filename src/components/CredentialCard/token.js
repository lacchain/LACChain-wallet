import React from "react";
import cn from "classnames";
import { Link } from "react-router-dom";
import styles from "./Card.module.sass";

const Token = ( { className, item }) => {
  return (
    <div className={cn(styles.card, className)}>
      <div className={styles.preview}>
        <img srcSet={`/images/content/erc20.svg 2x`} src="/images/content/erc20.svg" alt="ERC20" />
      </div>
      <Link className={styles.link} to={`/token/${item.address}`}>
        <div className={styles.body}>
          <div className={styles.line}>
            <div className={styles.title}>{item.ticker}</div>
          </div>
          <div className={styles.description}>
            {item.name}
          </div>
          <div className={styles.line}>
          </div>
        </div>
        <div className={styles.foot}>
          <div className={styles.users}>
            <div className={styles.price}>
              {item.maxSupply}
            </div>
          </div>
          <div className={styles.counter}>{item.decimals} decimals</div>
        </div>
      </Link>
    </div>
  );
};

export default Token;
