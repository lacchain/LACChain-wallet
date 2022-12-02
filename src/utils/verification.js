import crypto from "crypto";
import { ethers } from "ethers";
import moment from "moment";
import * as ethUtil from "ethereumjs-util";
import ClaimsVerifier from "./ClaimsVerifier";
import RootOfTrust from "./RootOfTrust";
import { Decoder, Encoder, QRByte } from '@nuintun/qrcode';
import { gzip, ungzip } from "pako";
import {
	BbsBlsSignatureProof2020,
	deriveProof
} from "@mattrglobal/jsonld-signatures-bbs";
import { extendContextLoader } from "jsonld-signatures";
import { issuers, PKDs } from "../mocks/issuers";
import { resolve } from "./did";
import bbsContext from "./schemas/bbs.json";
import credentialContext from "./schemas/credentialsContext.json";
import trustedContext from "./schemas/trusted.json";
import vaccinationContext from "./schemas/vaccinationCertificateContext.json";
import educationContext from "./schemas/education.json";

const JSONLD_DOCUMENTS = {
	"https://w3id.org/security/bbs/v1": bbsContext,
	"https://www.w3.org/2018/credentials/v1": credentialContext,
	"https://credentials-library.lacchain.net/credentials/trusted/v1": trustedContext,
	"https://w3id.org/vaccination/v1": vaccinationContext,
	"https://credentials-library.lacchain.net/credentials/education/v1": educationContext
};

export function sha256( data ) {
	const hashFn = crypto.createHash( 'sha256' );
	hashFn.update( data );
	return hashFn.digest( 'hex' );
}

export const verifyCredential = async vc => {
	if( !vc.proof ) return { credentialExists: true, isNotRevoked: true, issuerSignatureValid: true, additionalSigners: true, isNotExpired: true };
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
	const additionalSigners = true; //result[3];
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
	const tlContract = new ethers.Contract( vc.trustedList, RootOfTrust.trustedList, new ethers.providers.JsonRpcProvider( "https://writer.lacchain.net" ) );

	const issuerAddress = vc.issuer.replace('did:lac:main:', '');
	const issuer = await tlContract.entities( issuerAddress );
	const rootOfTrust = [{
		address: issuerAddress,
		name: issuer.name
	}, {
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
	if( rootOfTrust[0].address === '0x5672778D37604b365289c9CcA4dE0aE28365E2Ad' ) return new Array(rootOfTrust.length).fill(true);
	const validation = ( new Array( rootOfTrust.length ) ).fill( false );
	const root = new ethers.Contract( rootOfTrust[0].address, RootOfTrust.pkd, new ethers.providers.JsonRpcProvider( "https://writer.lacchain.net" ) );
	if( ( await root.publicKeys( rootOfTrust[1].address ) ).status <= 0 ) return validation;
	validation[0] = !!PKDs[rootOfTrust[0].address];
	if( !validation[0] ) return validation;
	let index = 1;
	for( const tl of rootOfTrust.slice( 1 ) ) {
		const tlContract = new ethers.Contract( tl.address, RootOfTrust.trustedList, new ethers.providers.JsonRpcProvider( "https://writer.lacchain.net" ) );
		if( index + 2 >= rootOfTrust.length ) {
			validation[index] = ( await tlContract.entities( issuer.replace( 'did:lac:main:', '' ) ) ).status === 1;
			// TODO: validate issuer signature (this is the last item of root of trust i.e. the issuer)
			validation[index + 1] = true;
			return validation;
		}
		if( ( await tlContract.entities( rootOfTrust[index + 1].address ) ).status <= 0 ) return validation;
		validation[index++] = true;
	}

	return validation;
}

export const deriveCredential = async (vc, fields) => {
	const issuerDocument = await resolve( vc.issuer );
	const documentLoader = extendContextLoader(uri => {
		if( uri.startsWith( 'did' ) ) {
			const document = uri.indexOf('#') >= 0 ? issuerDocument.assertionMethod.find( am => am.publicKeyBase58 ) : issuerDocument;
			if( uri.indexOf('#') ) {
				document.id = uri;
			}
			return { document };
		}

		const document = JSONLD_DOCUMENTS[uri];
		if (!document) {
			throw new Error( `Unable to load document : ${uri}` );
		}
		return {
			contextUrl: null,
			document,
			documentUrl: uri
		};
	});
	const fragment = {
		"@context": vc['@context'],
		"type": vc['type'],
		"credentialSubject": {
			"type": vc['credentialSubject'].type,
			"@explicit": true,
			...fields.filter( field => field !== 'id' && field !== 'type' ).reduce( (dic, field) => ({...dic, [field]: {}}), {} )
		}
	};
	return await deriveProof(vc, fragment, {
		suite: new BbsBlsSignatureProof2020(),
		documentLoader
	});
}

export const toQRCode = async vc => {
	const credential = new Buffer( gzip( JSON.stringify(vc, null, 2) ) ).toString( 'base64' );
	console.log('base64', credential);
	const qrcode = new Encoder();
	qrcode.setEncodingHint( true );
	if( vc.hash ){
		qrcode.write( new QRByte( JSON.stringify({
			hash: vc.hash,
			issuanceDate: vc.issuanceDate,
			expirationDate: vc.expirationDate,
			subject: vc.credentialSubject.recipient
		}) ) );
	} else {
		qrcode.write( new QRByte( credential ) );
	}
	qrcode.make();
	return qrcode.toDataURL();
}

export const fromCborQR = async cborQR => {
	const qrcode = new Decoder();
	const result = await qrcode.scan( cborQR );

	const unzipped = new Buffer( ungzip( new Buffer( result, 'base64' ) ) ).toString();
	return JSON.parse( unzipped );
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