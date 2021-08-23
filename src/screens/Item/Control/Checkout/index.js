import React from "react";
import cn from "classnames";
import styles from "./Checkout.module.sass";
import Icon from "../../../../components/Icon";
import LoaderCircle from "../../../../components/LoaderCircle";

const VERIFICATION_STEPS = [{
	key: 'credentialExists',
	successTitle: 'Credential registered',
	successSubtitle: 'The credential is registered in the registry',
	failedTitle: 'Credential is not registered',
	failedSubtitle: 'The credential is not registered in the registry',
}, {
	key: 'isNotRevoked',
	successTitle: 'Credential is not revoked',
	successSubtitle: 'The credential has not been revoked',
	failedTitle: 'Credential is revoked',
	failedSubtitle: 'The credential has been revoked',
}, {
	key: 'issuerSignatureValid',
	successTitle: 'Issuer signature valid',
	successSubtitle: 'The issuer proof is valid',
	failedTitle: 'Issuer signature invalid',
	failedSubtitle: 'The issuer proof is not valid',
}, {
	key: 'additionalSigners',
	successTitle: 'Additional signatures',
	successSubtitle: 'The additional signatures are present and valid',
	failedTitle: 'Missing signatures',
	failedSubtitle: 'The additional signatures are not present or they are invalid',
}, {
	key: 'isNotExpired',
	successTitle: 'Is not expired',
	successSubtitle: 'The credential is within the validity period',
	failedTitle: 'Expired',
	failedSubtitle: 'The credential has been expired',
}, {
	key: 'isTrusted',
	successTitle: 'The issuer is trusted',
	successSubtitle: 'The issuer Root of Trust is valid',
	failedTitle: 'The issuer is not trusted',
	failedSubtitle: 'The issuer Root of Trust is not valid',
}];

const Checkout = ( { className, results, loading } ) => {
	return (
		<div className={cn( className, styles.checkout )}>
			<div className={cn( "h4", styles.title )}>Verification</div>
			{loading ?
				<div className={styles.line}>
					<div className={styles.icon}>
						<LoaderCircle className={styles.loader} />
					</div>
					<div className={styles.details}>
						<div className={styles.subtitle}>Verifying</div>
						<div className={styles.text}>
							The credential is being verified
						</div>
					</div>
				</div> :
				VERIFICATION_STEPS.map( step =>
					<div className={results[step.key] ? styles.correct : styles.attention} key={step.key}>
						<div className={styles.preview}>
							{results[step.key] ? <Icon name="check" size="32"/> : <Icon name="info-circle" size="32"/>}
						</div>
						<div className={styles.details}>
							<div className={styles.subtitle}>
								{results[step.key] ? step.successTitle : step.failedTitle}
							</div>
							<div className={styles.text}>
								{results[step.key] ? step.successSubtitle : step.failedSubtitle}
							</div>
						</div>
					</div> )
			}
		</div>
	);
};

export default Checkout;
