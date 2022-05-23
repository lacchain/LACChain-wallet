import React, { useEffect, useState } from "react";
import cn from "classnames";
import styles from "./Item.module.sass";
import Proofs from "./Proofs";
import Claims from "./Claims";
import Options from "./Options";
import { types } from "../../mocks/types";
import { issuers } from "../../mocks/issuers";
import Raw from "./Raw";
import {
	getRootOfTrust,
	toEUCertificate,
	verifyCredential,
	verifyRootOfTrust,
	verifySignature
} from "../../utils/verification";
import RootOfTrust from "./RootOfTrust";
import { useAuthContext } from "../../contexts/authContext";
import { getBalance as getERC20Balance } from "../../utils/erc20";
import { getBalance as getNFTBalance } from "../../utils/erc721";
import { getBalance as getTokenizedBalance } from "../../utils/tokenized";

const navLinks = ["Claims", "Proofs", "Root of Trust", "Raw", "EU"];

const keyType = {
	'EcdsaSecp256k1Signature2019': 'Ethereum SECP256K Signature',
	'RsaSignature2018': 'RSA X.509 Signature',
	'BbsBlsSignature2020': 'ZKP BBS+ Signature'
};
async function verifyFullCredential( credential ) {
	const proofs = [];
	const verification = await verifyCredential( credential );
	for( const proof of credential.proof ) {
		const vm = proof.verificationMethod;
		const did = vm.substring( 0, vm.indexOf('#') );
		proofs.push( {
			position: did.toLocaleLowerCase() === credential.issuer.toLowerCase() ? 'Issuer' : 'Signer',
			type: keyType[proof.type],
			did,
			...( issuers[did] || issuers.unknown ),
			valid: did === credential.issuer ? verification.issuerSignatureValid : await verifySignature( credential, proof.proofValue )
		} );
	}
	return { proofs, verification };
}

const Item = ( { match } ) => {
	const { user } = useAuthContext();

	const [activeIndex, setActiveIndex] = useState( 0 );
	const [verifying, setIsVerifying] = useState( true );
	const [balance, setBalance] = useState( 0 );
	const [rootOfTrust, setRootOfTrust] = useState( [] );
	const credential = user.credentials.find( c => c.id === match.params.id );
	const context = credential['@context'];
	const type = ( !Array.isArray( context ) ? types[context] : types[context[context.length - 1]] ) || types['https://www.w3.org/2018/credentials/v1'];
	const [proofs, setProofs] = useState( [] );

	useEffect( () => {
		if( type.kind === 'vc' ) {
			verifyFullCredential( credential ).then( async result => {
				setProofs( result.proofs );
				const rootOfTrust = await getRootOfTrust( credential );
				const validation = await verifyRootOfTrust( rootOfTrust, credential.issuer );
				setRootOfTrust( rootOfTrust.map( ( rot, i ) => ( { ...rot, valid: validation[i] } ) ) );
				setIsVerifying( false );
			} );
		} else {
			switch( type.title ){
				case 'ERC-20 Token':
					getERC20Balance( credential.address, user.did.replace('did:lac:main:', '') )
						.then( balance => {
							const amount = balance.toNumber() / 10**credential.decimals;
							setBalance( amount );
						} );
					break;
				case 'NFT Token':
					getNFTBalance( credential.address, user.did.replace('did:lac:main:', ''), credential.tokenId )
						.then( balance => setBalance( balance ) );
					break;
				case 'Tokenized Money':
					getTokenizedBalance( credential.address ).then( balance => setBalance( balance ) );
			}
		}
	}, [] );

	return (
		<>
			<div>
				<div className={cn( "container", styles.container )}>
					<div className={styles.card_wrapper}>
						<div className={styles.card}>
							<div className={styles.preview}>
								<img srcSet={`${type.image2x} 2x`} src={type.image} alt="Card"/>
								<div className={styles.control}>
									<div className={styles.topLeft}>{type.topLeft( credential )}</div>
									<div className={styles.topRight}>{type.topRight( { ...credential, balance } )}</div>
									<div className={styles.title}>{type.claim( credential )}</div>
									{type.icon(credential) && <div className={styles.image}>{type.icon(credential)}</div> }
									<div className={styles.claim}>{type.title}</div>
									<div className={styles.bottom}>{type.bottom( credential )}</div>
								</div>
							</div>
						</div>
						{type.kind === 'token' && type.title === 'NFT Token' && balance === 0 ? <></> :
						<Options className={styles.options} item={credential} type={type}/> }
					</div>
					<div className={styles.details}>
						<h1 className={cn( "h5", styles.title2 )}>{type.kind === 'vc' ? type.title : type.claim( credential )}</h1>
						<div className={styles.cost}>
							<div className={styles.categories}>
								{type.kind === 'token' &&
								<div className={cn( { "category-token": true }, styles.category )}>
									Token
								</div>
								}
								{credential.type.map( ct =>
									<div key={ct} className={cn(
										{ "category-vc": ct === 'VerifiableCredential' },
										{ "category-vc-id": ct === 'IdentityCard' },
										{ "category-vc-trusted": ct === 'TrustedCredential' },
										{ "category-vc-health": ct === 'VaccinationCertificate' },
										{ "category-erc20": ct === 'ERC-20' || ct === 'ERC20' },
										{ "category-erc721": ct === 'ERC-721' },
										{ "category-tokenized": ct === 'TokenizedMoney' },
										{ "category-generic": ct !== '' },
										styles.category
									)}>
										{ct}
									</div>
								)}
							</div>
						</div>
						<div className={styles.info}>
							{type.description}
						</div>
						{type.kind === 'vc' ?
							<>
								<div className={styles.nav}>
									{navLinks.filter( link => link !== 'EU' || type.title === 'Vaccination Certificate' ).map( ( x, index ) => (
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
								<Raw className={styles.users} credential={toEUCertificate( credential )}/>
								}
							</> :
							<>
								<div className={styles.amount}>
									<span className={styles.text}>{balance} {credential.symbol}</span>
								</div>
								<div className={styles.token}>
									<span className={styles.label}>Name: </span>
									<span className={styles.text}>{credential.name}</span>
								</div>
								<div className={styles.token}>
									<span className={styles.label}>Symbol: </span>
									<span className={styles.text}>{credential.symbol}</span>
								</div>
								<div className={styles.token}>
									<span className={styles.label}>Address: </span>
									<span className={styles.text}>{credential.address}</span>
								</div>
								{type.title === 'ERC-20 Token' &&
								<div className={styles.token}>
									<span className={styles.label}>Decimals: </span>
									<span className={styles.text}>{credential.decimals}</span>
								</div>
								}
								{type.title === 'ERC-20 Token' &&
								<div className={styles.token}>
									<span className={styles.label}>Total Supply: </span>
									<span className={styles.text}>
										{credential.totalSupply ? credential.totalSupply / 10 ** credential.decimals : 0}
									</span>
								</div>
								}
								{type.title === 'NFT Token' &&
								<>
									<div className={styles.token}>
										<span className={styles.label}>Token ID: </span>
										<span className={styles.text}>{credential.tokenId}</span>
									</div>
									<div className={styles.token}>
										<span className={styles.label}>Token URI: </span>
										<span className={styles.text}>{credential.uri}</span>
									</div>
									<div className={styles.token}>
										<span className={styles.label}>Owner: </span>
										<span className={styles.text}>{credential.owner}</span>
									</div>
								</>
								}
							</>
						}
					</div>
				</div>
			</div>
		</>
	);
};

export default Item;
