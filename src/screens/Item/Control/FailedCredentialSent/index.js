import React from "react";
import cn from "classnames";
import styles from "./FailedCredentialSent.module.sass";

const FailedCredentialSent = ( { className, error, onAccept } ) => {
	const message = error === 'edPk cannot be null or undefined' ?
		'Unable to find receiver encryption key (keyAgreement)' :
		error;
	return (
		<div className={cn( className, styles.wrap )}>
			<div style={{ transform: 'scale(0.6)' }}>
				<div className={styles.failed_mark}>
					<div className={styles.failed_icon}>
						<span className={cn(styles.icon_line, styles.left)}> </span>
						<span className={cn(styles.icon_line, styles.right)}> </span>
					</div>
				</div>
			</div>
			<div className={cn( "h4", styles.title )}>
				Failed to Send Credential{" "}
			</div>
			<div className={styles.info}>
				{message}
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

export default FailedCredentialSent;
