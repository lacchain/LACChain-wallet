import React from "react";
import cn from "classnames";
import { Link } from "react-router-dom";
import styles from "./Card.module.sass";
import Icon from "../Icon";
import { types } from "../../mocks/types";
import { issuers } from "../../mocks/issuers";

const Card = ({ className, item }) => {
  const context = item['@context'];
  const type = (!context.length ? types[context] : types[context[context.length - 1]]) || types['https://www.w3.org/2018/credentials/v1'];
  const issuer = issuers[item.issuer] || issuers.unknown;
  return (
    <div className={cn(styles.card, className)}>
      <div className={styles.preview}>
        <img srcSet={`${type.image2x} 2x`} src={type.image} alt="Card" />
        <div className={styles.control}>
          <div
            className={cn(
              { "status-green": item.status === "green" },
              styles.category
            )}
          >
            {item.statusText}
          </div>
          <button className={cn("button-small", styles.button)}>
            <span>Show QR code</span>
            <Icon name="share" size="16" />
          </button>
        </div>
      </div>
      <Link className={styles.link} to={`/item/${item.id}`}>
        <div className={styles.body}>
          <div className={styles.line}>
            <div className={styles.title}>{type.title}</div>
          </div>
          <div className={styles.description}>
            {type.description}
          </div>
          <div className={styles.line}>

          </div>
        </div>
        <div className={styles.foot}>
          <div className={styles.users}>
            <div className={!issuers[item.issuer] ? styles.unknown : styles.price}>
              <div className={styles.avatar}>
                <img src={issuer.avatar} alt="Issuer" />
              </div>
              {issuer.name}
            </div>
          </div>
          <div className={styles.counter}>{item.proof.length} Signatures</div>
        </div>
      </Link>
    </div>
  );
};

export default Card;
