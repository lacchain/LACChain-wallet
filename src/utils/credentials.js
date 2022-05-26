import crypto from "crypto";
import { ethers } from "ethers";
import { fetchVC } from "./mailbox";
import ClaimsVerifier from "./ClaimsVerifier";

import web3Abi from "web3-eth-abi";
import web3Utils from "web3-utils";
import * as ethUtil from "ethereumjs-util";
import moment from "moment";

const CLAIMS_VERIFIER_CONTRACT_ADDRESS = '0x1A1a5e43B3a29cD8C0A1631d31CfBA595646074C';

const VERIFIABLE_CREDENTIAL_TYPEHASH = web3Utils.soliditySha3( "VerifiableCredential(address issuer,address subject,bytes32 data,uint256 validFrom,uint256 validTo)" );
const EIP712DOMAIN_TYPEHASH = web3Utils.soliditySha3( "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)" );

function sha256( data ) {
	const hashFn = crypto.createHash( 'sha256' );
	hashFn.update( data );
	return hashFn.digest( 'hex' );
}

function getCredentialHash( vc, issuerAddress ) {
	const hashDiplomaHex = `0x${sha256( JSON.stringify( vc.credentialSubject ) )}`;

	const encodeEIP712Domain = web3Abi.encodeParameters(
		['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
		[EIP712DOMAIN_TYPEHASH, web3Utils.sha3( "EIP712Domain" ), web3Utils.sha3( "1" ), 648529, CLAIMS_VERIFIER_CONTRACT_ADDRESS]
	);
	const hashEIP712Domain = web3Utils.soliditySha3( encodeEIP712Domain );

	const validFrom = new Date( vc.issuanceDate ).getTime();
	const validTo = new Date( vc.expirationDate ).getTime();
	const subjectAddress = vc.credentialSubject.id.split( ':' ).slice( -1 )[0];
	const encodeHashCredential = web3Abi.encodeParameters(
		['bytes32', 'address', 'address', 'bytes32', 'uint256', 'uint256'],
		[VERIFIABLE_CREDENTIAL_TYPEHASH, issuerAddress, subjectAddress, hashDiplomaHex, Math.round( validFrom / 1000 ), Math.round( validTo / 1000 )]
	);
	const hashCredential = web3Utils.soliditySha3( encodeHashCredential );

	const encodedCredentialHash = web3Abi.encodeParameters( ['bytes32', 'bytes32'], [hashEIP712Domain, hashCredential.toString( 16 )] );
	return web3Utils.soliditySha3( '0x1901'.toString( 16 ) + encodedCredentialHash.substring( 2, 131 ) );
}

function signCredential( credentialHash, issuerPrivateKey ) {
	const rsv = ethUtil.ecsign(
		Buffer.from( credentialHash.substring( 2, 67 ), 'hex' ),
		Buffer.from( issuerPrivateKey, 'hex' )
	);
	return ethUtil.toRpcSig( rsv.v, rsv.r, rsv.s );
}

export async function syncCredentials( user, update ) {
	console.log( 'syncing' );
	const credentials = user.credentials || [];
	const vcs = (await fetchVC( user )).map( vc => JSON.parse( vc.message ) );
	user.credentials = credentials.concat( vcs.reduce( ( a, i ) => {
		if( !credentials.find( c => c.id === i.id ) && i.id ) a.push( i );
		return a;
	}, [] ) );
	update( user );
	return user.credentials;
}

export async function registerCredential( vc ) {
	const issuer = {
		address: '0x2Da061c6cFA5C23828e9D8dfbe295a22e8779712',
		privateKey: '60090a13d72f682c03db585bf6c3a296600b5d50598a9ceef3291534dede6bea'
	};
	const subjectAddress = vc.credentialSubject.id.replace('did:lac:main:', '');
	const claimsVerifier = new ethers.Contract( CLAIMS_VERIFIER_CONTRACT_ADDRESS, ClaimsVerifier.abi,
		new ethers.Wallet( '0x' + issuer.privateKey, new ethers.providers.JsonRpcProvider( "https://writer.lacchain.net" ) ) );

	const credentialHash = getCredentialHash( vc, issuer.address );
	const signature = signCredential( credentialHash, issuer.privateKey );

	const tx = await claimsVerifier.registerCredential( subjectAddress, credentialHash,
		Math.round( moment( vc.issuanceDate ).valueOf() / 1000 ),
		Math.round( moment( vc.expirationDate ).valueOf() / 1000 ),
		signature, { from: issuer.address } );

	vc.proof = [{
		id: `did:lac:main:${issuer.address}`,
		type: "EcdsaSecp256k1Signature2019",
		proofPurpose: "assertionMethod",
		verificationMethod: `${vc.issuer}#vm-0`,
		domain: CLAIMS_VERIFIER_CONTRACT_ADDRESS,
		proofValue: signature
	}];

	return { tx, vc };
}

export function presentCredential( vc, user ) {
	const hash = sha256( JSON.stringify( vc ) );
	const signature = signCredential( `0x${hash}`, user.mainKeyPair.privateKey );

	const vp = {
		"@context": [
			"https://www.w3.org/2018/credentials/v1",
		],
		type: "VerifiablePresentation",
		verifiableCredential: [vc],
		proof: [{
			type: "EcdsaSecp256k1Signature2019",
			created: moment().toISOString(),
			proofPurpose: "assertionMethod",
			verificationMethod: `${user.did}#vm-0`,
			proofValue: signature
		}]
	};

	return vp;
}