import React, { useState } from "react";
import styles from "./VerificationMethods.module.sass";
import Icon from "../../../components/Icon";
import cn from "classnames";

const VerificationMethods = ( { className, user } ) => {
	const [visiblePK1, setVisiblePK1] = useState( false );
	const [visiblePK2, setVisiblePK2] = useState( false );
	const [visiblePK3, setVisiblePK3] = useState( false );

	return (
		<div className={( className, styles.cards )}>
			<div className={styles.card}>
				<div className={cn(styles.plus, { [styles.visible]: !visiblePK1 })}
					 style={{ backgroundColor: '#4BC9F0' }} onClick={() => setVisiblePK1(!visiblePK1)}>
					<Icon name="plus" size="24" />
				</div>
				<div className={styles.subtitle}>
					<b>Main KeyPair</b>
					<span className="status-grey"><strong>Public Key:</strong> {user.did}</span>
					{visiblePK1 &&
					<span
						className={cn( 'status-pink', styles.secret )}><strong>Private Key:</strong> {user.mainKeyPair.privateKey}</span>
					}
				</div>
			</div>
			<div className={styles.card}>
				<div className={cn(styles.plus, { [styles.visible]: !visiblePK2 })}
					 style={{ backgroundColor: '#EF466F' }} onClick={() => setVisiblePK2(!visiblePK2)}>
					<Icon name="plus" size="24"/>
				</div>
				<div className={styles.subtitle}>
					<b>Controller KeyPair</b>
					<span className="status-grey"><strong>Public Key:</strong> {user.controllerKeyPair.publicKey}</span>
					{visiblePK2 &&
					<span
						className={cn( 'status-pink', styles.secret )}><strong>Private Key:</strong> {user.controllerKeyPair.privateKey}</span>
					}
				</div>
			</div>
			<div className={styles.card}>
				<div className={cn(styles.plus, { [styles.visible]: !visiblePK3 })}
					 style={{ backgroundColor: '#9757D7' }} onClick={() => setVisiblePK3(!visiblePK3)}>
					<Icon name="plus" size="24"/>
				</div>
				<div className={styles.subtitle}>
					<b>Encryption KeyPair (keyAgreement)</b>
					<span className="status-grey"><strong>Public Key:</strong> {user.encryptionKeyPair.publicKey}</span>
					{visiblePK3 &&
					<span
						className={cn( 'status-pink', styles.secret )}><strong>Private Key:</strong> {user.encryptionKeyPair.privateKey}</span>
					}
				</div>
			</div>
		</div>
	);
};

export default VerificationMethods;
