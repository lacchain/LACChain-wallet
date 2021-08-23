import React from "react";
import cn from "classnames";
import styles from "./Options.module.sass";
import Icon from "../../../components/Icon";
import Actions from "../../../components/Actions";

const Options = ({ className, credential }) => {
  return (
    <div className={cn(styles.options, className)}>
      <Actions className={styles.actions} credential={credential}/>
    </div>
  );
};

export default Options;
