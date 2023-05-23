import React from "react";
import cn from "classnames";
import styles from "./SuccessfullyCredentialSent.module.sass";

const SuccessfullyCredentialSent = ( { className, credential, receiver, onAccept } ) => {
	const type = credential.type ? credential.type[credential.type.length - 1] : 'Unknown Type';
	return (
		<div className={cn( className, styles.wrap )}>
			<div className={styles.success_checkmark}>
				<div className={styles.check_icon}>
					<span className={cn( styles.icon_line, styles.line_tip )}> </span>
					<span className={cn( styles.icon_line, styles.line_long )}> </span>
					<div className={styles.icon_circle}></div>
					<div className={styles.icon_fix}></div>
				</div>
			</div>
			<div className={cn( "h4", styles.title )}>
				Credential Successfully Sent{" "}
			</div>
			<div className={styles.info}>
				You successfully sent the <span>{type}</span> to {receiver}
			</div>
			{/*<div className={styles.table}>
        <div className={styles.row}>
          <div className={styles.col}>Credential ID</div>
          <div className={styles.col}>12cf1390-4bc5-4438-bf62-229d5ca493d9</div>
        </div>
        <div className={styles.row}>
          <div className={styles.col}>Receiver</div>
          <div className={styles.col}>did:lac:openprotest:0x836930...87r398</div>
        </div>
        <div className={styles.row}>
          <div className={styles.col}>Timestamp</div>
          <div className={styles.col}>25/01/1989 14:50:33</div>
        </div>
      </div>*/}
			<div className={styles.btns}>
				<button className={cn( "button-small", styles.button )} onClick={() => onAccept()}>
					Accept
				</button>
			</div>
		</div>
	);
};

export default SuccessfullyCredentialSent;
