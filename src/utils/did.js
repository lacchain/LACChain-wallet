import axios from "axios";
import DIDComm from "DIDComm-js";
import sodium from "libsodium-wrappers";

export async function resolve( did ) {
	return await axios.get( `https://resolver.lacchain.net/${did}` ).then( result => result.data );
}

export const generateKeyPair = async() => {
	const didcomm = new DIDComm.DIDComm();
	await didcomm.ready;
	const keyPair = await didcomm.generateKeyPair();
	return {
		publicKey: new Buffer( keyPair.publicKey ).toString( 'hex' ),
		privateKey: new Buffer( keyPair.privateKey ).toString( 'hex' )
	}
}

export function findKeyAgreement( doc, algorithm ) {
	const key = doc.keyAgreement.find( ka => ka.type === algorithm );
	if( !key ) return null;
	if( key.publicKeyHex ) return sodium.from_hex( key.publicKeyHex );
	if( key.publicKeyBase64 ) return sodium.from_base64( key.publicKeyBase64 );
	return null;
}

// TODO: improve error handling
export function findDelegationKeys( doc, algorithm) {
	const keys = doc.capabilityDelegation.filter( k => k.type === algorithm)
	.map(key => {
		if (key.blockchainAccountId) return sodium.from_hex(key.blockchainAccountId.replace('0x', ''));
		if( key.publicKeyHex ) return sodium.from_hex( key.publicKeyHex );
		if( key.publicKeyBase64 ) return sodium.from_base64( key.publicKeyBase64 );
		return null;
	}).filter(k => k !== null);
	return keys;
}
