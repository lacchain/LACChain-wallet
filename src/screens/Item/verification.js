import React, { useState } from "react";
import cn from "classnames";
import styles from "./Item.module.sass";
import { issuers } from "../../mocks/issuers";
import {
	fromCborQR,
	getRootOfTrust,
	verifyCredential,
	verifyRootOfTrust,
	verifySignature
} from "../../utils/verification";
import Checkout from "./Control/Checkout";
import Modal from "../../components/Modal";
import Icon from "../../components/Icon";
import { credentials } from "../../mocks/credentials";

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
	const [verifying, setIsVerifying] = useState( false );
	const [verification, setVerification] = useState( {} );
	const [vp, setVP] = useState( {} );
	const [cbor, setCBOR] = useState( "" );

	return (
		<>
			<div>
				<div className={cn( "container", styles.container )}>
					<input type="file" onChange={event => {
						const file = URL.createObjectURL(event.target.files[0])
						setVisibleModalVerification( true );
						setIsVerifying( true );
						fromCborQR( file ).then( async ({vc, cbor}) => {
							setVP( vc );
							setCBOR( cbor );
							const credential = credentials.find( c => c.id === vc.id );
							const result = await verifyFullCredential( credential );
							const rot = await verifyRootOfTrust( await getRootOfTrust( credential ), credential.issuer );
							result.verification.isTrusted = rot[rot.length - 1];
							setVerification( result.verification );
							setIsVerifying( false );
						} );
					}}/>
					<Modal
						visible={visibleModalVerification}
						onClose={() => setVisibleModalVerification( false )}
					>
						<Checkout results={verification || {}} loading={verifying}/>
					</Modal>
				</div>
				<h5>CBOR</h5><br/>
				<pre>
						{cbor}
					</pre><br/>
				<h5>Credential</h5><br/>
				<pre>
						{JSON.stringify( vp, null, 2 )}
					</pre>
			</div>
		</>
	);
};

export default Item;
