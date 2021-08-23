import React, { useEffect, useState } from "react";
import cn from "classnames";
import styles from "./Item.module.sass";
import Proofs from "./Proofs";
import Claims from "./Claims";
import Options from "./Options";
import { credentials } from "../../mocks/credentials";
import { types } from "../../mocks/types";
import { issuers } from "../../mocks/issuers";
import Raw from "./Raw";
import {
	getRootOfTrust, toEUCertificate,
	verifyCredential,
	verifyRootOfTrust,
	verifySignature
} from "../../utils/verification";
import Checkout from "./Control/Checkout";
import Modal from "../../components/Modal";
import moment from "moment";
import Icon from "../../components/Icon";
import RootOfTrust from "./RootOfTrust";

const navLinks = ["Claims", "Proofs", "Root of Trust", "Raw", "EU"];

async function verifyFullCredential( credential ) {
	const proofs = [];
	const verification = await verifyCredential( credential );
	for( const proof of credential.proof ) {
		proofs.push( {
			position: 'Issuer',
			did: proof.id,
			...( issuers[proof.id] || issuers.unknown ),
			valid: proof.id === credential.issuer ? verification.issuerSignatureValid : await verifySignature( credential, proof.proofValue )
		} );
	}
	return { proofs, verification };
}

const Item = ( { match } ) => {
	const [visibleModalVerification, setVisibleModalVerification] = useState( false );
	const [activeIndex, setActiveIndex] = useState( 0 );
	const [verifying, setIsVerifying] = useState( true );
	const [verification, setVerification] = useState( {} );
	const [rootOfTrust, setRootOfTrust] = useState( [] );
	const credential = credentials.find( c => c.id === match.params.id );
	const context = credential['@context'];
	const type = ( !context.length ? types[context] : types[context[context.length - 1]] ) || types['https://www.w3.org/2018/credentials/v1'];
	const issuer = issuers[credential.issuer] || issuers.unknown;
	const [proofs, setProofs] = useState( [] );

	useEffect( () => {
		verifyFullCredential( credential ).then( async result => {
			setProofs( result.proofs );
			const rootOfTrust = await getRootOfTrust( credential );
			const validation = await verifyRootOfTrust( rootOfTrust, credential.issuer );
			setVerification( {...result.verification, isTrusted: validation[validation.length - 1]} );
			setRootOfTrust( rootOfTrust.map( (rot, i) => ({ ...rot, valid: validation[i] }) ) );
			setIsVerifying( false );
		} );
	}, [] );

	return (
		<>
			<div>
				<div className={cn( "container", styles.container )}>
					<div className={styles.bg}>
						<div className={styles.preview}>
							<img
								src={type.image}
								alt="Item"
							/>
						</div>
						<Options className={styles.options} credential={credential}/>
						<button className={cn( "button-small", true )} style={{ width: '100%' }}
								onClick={() => {
									setVisibleModalVerification( true );
								}}>
							<span>Verify Credential</span>
							<Icon name="check" size="16"/>
						</button>
					</div>
					<div className={styles.details}>
						<h1 className={cn( "h5", styles.title )}>{type.title}</h1>
						<div className={styles.cost}>
							<div className={styles.categories}>
								<div className={cn(
									{ "status-pink": !issuers[credential.issuer] },
									{ "status-green": issuers[credential.issuer] },
									styles.category
								)}>
									<div className={styles.avatar}>
										<img src={issuer.avatar} alt="Issuer"/>
									</div>
									{issuer.name}
								</div>
								{moment( credential.expirationDate ).isBefore( moment() ) &&
								<div className={cn( { "status-yellow": true }, styles.category )}>
									Expired
								</div>
								}
							</div>
							<div className={styles.counter}>{credential.proof.length} Signers</div>
						</div>
						<div className={styles.info}>
							{type.description}
						</div>
						<div className={styles.nav}>
							{navLinks.map( ( x, index ) => (
								<button
									className={cn(
										{ [styles.active]: index === activeIndex },
										styles.link
									)}
									onClick={() => setActiveIndex( index )}
									key={index}
								>
									{x}
								</button>
							) )}
						</div>
						{activeIndex === 0 &&
						<Claims className={styles.users} claims={credential.credentialSubject}/>
						}
						{activeIndex === 1 &&
						<Proofs className={styles.users} items={proofs}/>
						}
						{activeIndex === 2 &&
						<RootOfTrust className={styles.users} items={rootOfTrust} loading={verifying}/>
						}
						{activeIndex === 3 &&
						<Raw className={styles.users} credential={credential}/>
						}
						{activeIndex === 4 &&
						<Raw className={styles.users} credential={toEUCertificate(credential)}/>
						}
					</div>
				</div>
				<Modal
					visible={visibleModalVerification}
					onClose={() => setVisibleModalVerification( false )}
				>
					<Checkout results={verification || {}} loading={verifying}/>
				</Modal>
			</div>
		</>
	);
};

export default Item;
