import moment from "moment";
import axios from "axios";
import { createJWT, ES256KSigner } from "did-jwt";
import DIDCommService from "./didcomm";
import { ec as EC } from 'elliptic'

const didCommService = new DIDCommService();
const MAILBOX_DID = "did:lac:main:0x5c3968542ca976bec977270d3fe980dd4742865e";

export async function fetchVC( user ) {
	const secp256k1 = new EC('secp256k1')
	const keyPair = secp256k1.keyFromPrivate(user.mainKeyPair.privateKey);
	console.log(keyPair);
	console.log(keyPair.getPublic().getX().toString(16));
	console.log(keyPair.getPublic().getY().toString(16));

	const token = await createJWT(
		{ sub: user.did, aud: MAILBOX_DID, exp: 1681956219 },
		{ issuer: user.did, signer: ES256KSigner( user.mainKeyPair.privateKey ) },
		{ alg: 'ES256K' }
	);

	console.log(user.encryptionKeyPair);

	const result = await axios.get( 'https://mailbox.lacchain.net/vc', { headers: { token } } );
	const credentials = await Promise.all( result.data.map( vc => didCommService.decrypt( vc, user.encryptionKeyPair ) ) );
	console.log(credentials.map( c => JSON.parse(c.message) ));
	return credentials.filter( c => c.message );
}

export async function sendVC( user, recipient, message ) {
	const token = await createJWT(
		{ sub: user.did, aud: MAILBOX_DID, exp: moment().add( 1, 'days' ).valueOf() },
		{ issuer: user.did, signer: ES256KSigner( user.mainKeyPair.privateKey ) },
		{ alg: 'ES256K' }
	);

	const encryptedToBob = await didCommService.encrypt( message, user.encryptionKeyPair, recipient, false );

	const envelope = {
		"type": "https://didcomm.org/routing/2.0/forward",
		"to": [MAILBOX_DID],
		"expires_time": 1516385931,
		"body": {
			"next": recipient,
			"payloads~attach": [
				encryptedToBob
			]
		}
	}
	const encryptedToMailbox = await didCommService.encrypt( envelope, user.encryptionKeyPair, MAILBOX_DID, false );
	return await axios.post( 'https://mailbox.lacchain.net/vc', encryptedToMailbox, { headers: { token } } );
}