import crypto from "crypto";
import axios from "axios";
import { decode, encode } from '@digitalbazaar/cborld';
import { ethers } from "ethers";
import moment from "moment";
import * as ethUtil from "ethereumjs-util";
import ClaimsVerifier from "./ClaimsVerifier";
import RootOfTrust from "./RootOfTrust";
import base32Encode from 'base32-encode';
import base32Decode from 'base32-decode';
import { Decoder, Encoder, QRAlphanumeric, } from '@nuintun/qrcode';
import { issuers, PKDs } from "../mocks/issuers";

export function sha256( data ) {
	const hashFn = crypto.createHash( 'sha256' );
	hashFn.update( data );
	return hashFn.digest( 'hex' );
}

export const verifyCredential = async vc => {
	if( !vc.proof[0].domain ) return {
		credentialExists: false,
		isNotRevoked: false,
		issuerSignatureValid: false,
		additionalSigners: false,
		isNotExpired: false
	}
	const contract = new ethers.Contract( vc.proof[0].domain, ClaimsVerifier.abi, new ethers.providers.JsonRpcProvider( "https://writer.lacchain.net" ) );

	const data = `0x${sha256( JSON.stringify( vc.credentialSubject ) )}`;
	const rsv = ethUtil.fromRpcSig( vc.proof[0].proofValue );
	const result = await contract.verifyCredential( [
		vc.issuer.replace( 'did:lac:main:', '' ),
		vc.credentialSubject.id.replace( 'did:lac:main:', '' ),
		data,
		Math.round( moment( vc.issuanceDate ).valueOf() / 1000 ),
		Math.round( moment( vc.expirationDate ).valueOf() / 1000 )
	], rsv.v, rsv.r, rsv.s );

	const credentialExists = result[0];
	const isNotRevoked = result[1];
	const issuerSignatureValid = result[2];
	const additionalSigners = result[3];
	const isNotExpired = result[4];

	return { credentialExists, isNotRevoked, issuerSignatureValid, additionalSigners, isNotExpired };
}

export const verifySignature = async( vc, signature ) => {
	const contract = new ethers.Contract( vc.proof[0].domain, ClaimsVerifier.abi, new ethers.providers.JsonRpcProvider( "https://writer.lacchain.net" ) );

	const data = `0x${sha256( JSON.stringify( vc.credentialSubject ) )}`;

	return await contract.verifySigner( [
		vc.issuer.replace( 'did:lac:main:', '' ),
		vc.credentialSubject.id.replace( 'did:lac:main:', '' ),
		data,
		Math.round( moment( vc.issuanceDate ).valueOf() / 1000 ),
		Math.round( moment( vc.expirationDate ).valueOf() / 1000 )
	], signature );
}

export const getRootOfTrust = async vc => {
	if( !vc.trustedList ) return [];
	let tlContract = new ethers.Contract( vc.trustedList, RootOfTrust.trustedList, new ethers.providers.JsonRpcProvider( "https://writer.lacchain.net" ) );

	const rootOfTrust = [{
		address: vc.trustedList,
		name: await tlContract.name()
	}];
	let parent = await tlContract.parent();
	for( const index of [1, 2, 3, 4, 5, 6] ) {
		const contract = new ethers.Contract( parent, RootOfTrust.trustedList, new ethers.providers.JsonRpcProvider( "https://writer.lacchain.net" ) );
		try {
			rootOfTrust.push( {
				address: parent,
				name: await contract.name()
			} );
			parent = await contract.parent();
		} catch( e ) {
			rootOfTrust.push( {
				address: parent,
				name: 'Public Key Directory'
			} );
			break;
		}
	}

	return rootOfTrust.reverse();
}

export const verifyRootOfTrust = async( rootOfTrust, issuer ) => {
	if( rootOfTrust.length <= 0 ) return [];
	const validation = ( new Array( rootOfTrust.length ) ).fill( false );
	const root = new ethers.Contract( rootOfTrust[0].address, RootOfTrust.pkd, new ethers.providers.JsonRpcProvider( "https://writer.lacchain.net" ) );
	if( ( await root.publicKeys( rootOfTrust[1].address ) ).status <= 0 ) return validation;
	validation[0] = !!PKDs[rootOfTrust[0].address];
	if( !validation[0] ) return validation;
	let index = 1;
	for( const tl of rootOfTrust.slice( 1 ) ) {
		const tlContract = new ethers.Contract( tl.address, RootOfTrust.trustedList, new ethers.providers.JsonRpcProvider( "https://writer.lacchain.net" ) );
		if( index + 1 >= rootOfTrust.length ) {
			validation[index] = ( await tlContract.entities( issuer.replace( 'did:lac:main:', '' ) ) ).status === 1;
			return validation;
		}
		if( ( await tlContract.entities( rootOfTrust[index + 1].address ) ).status <= 0 ) return validation;
		validation[index++] = true;
	}

	return validation;
}

const documentLoader = async url => {
	const document = await axios.get( url ).then( result => result.data );
	return {
		contextUrl: null,
		document,
		documentUrl: url
	};
};

export const toCborQR = async jsonldDocument => {
	const cborldBytes = await encode( { jsonldDocument, documentLoader } );
	const encoded = base32Encode( cborldBytes, 'RFC4648', { padding: false } );
	const qrcode = new Encoder();
	qrcode.setEncodingHint( true );
	qrcode.write( new QRAlphanumeric( encoded ) );
	qrcode.make();
	return qrcode.toDataURL();
}

export const fromCborQR = async cborQR => {
	const qrcode = new Decoder();
	const result = await qrcode.scan( cborQR );
	const cborldArrayBuffer = base32Decode( result.data, 'RFC4648' );
	const cborldBytes = new Uint8Array( cborldArrayBuffer );

	function buf2hex( buffer ) { // buffer is an ArrayBuffer
		return [...new Uint8Array( buffer )]
			.map( x => x.toString( 16 ).padStart( 2, '0' ) )
			.join( ' ' );
	}

	return {
		vc: await decode( {
			cborldBytes,
			documentLoader
		} ),
		cbor: buf2hex( cborldArrayBuffer )
	}
};

export const toEUCertificate = vc => {
	const { name, birthDate, vaccine: { dose, vaccinationDate } } = vc.credentialSubject;
	const gn = name.substring( 0, name.indexOf( ' ' ) );
	const fn = name.substring( name.indexOf( ' ' ) + 1 );
	return {
		"ver": "1.3.0",
		"nam": {
			"fn": fn,
			"fnt": fn.replace( ' ', '<' ).replace( 'ó', 'o' ).toUpperCase(),
			"gn": gn,
			"gnt": gn.replace( ' ', '<' ).toUpperCase()
		},
		"dob": moment( birthDate, 'DD-MM-YYYY' ).format( 'YYYY-MM-DD' ),
		"v": [
			{
				"tg": "840539006",
				"vp": "1119349007",
				"mp": "EU/1/20/1507",
				"ma": "ORG-100031184",
				"dn": dose,
				"sd": 2,
				"dt": moment( vaccinationDate ).format( 'YYYY-MM-DD' ),
				"co": "CL",
				"is": issuers[vc.issuer].name,
				"ci": "URN:UVCI:01:CL:DADFCC47C7334E45A906DB12FD859FB7#1"
			}
		]
	}
}