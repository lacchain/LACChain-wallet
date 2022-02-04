import moment from "moment";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeartbeat, faSchool, faUser, faIdCard, faMoneyCheck } from '@fortawesome/free-solid-svg-icons'
import { faEthereum } from '@fortawesome/free-brands-svg-icons'

export const types = {
	'https://credentials-library.lacchain.net/credentials/health/vaccination/v1': {
		kind: 'vc',
		title: "Vaccination Certificate",
		topLeft: ( { issuanceDate } ) => `Issued ${moment( issuanceDate ).format( 'DD/MM/YYYY' )}`,
		topRight: ( { expirationDate } ) => `Expires ${moment( expirationDate ).format( 'DD/MM/YYYY' )}`,
		claim: ( { credentialSubject } ) => `${credentialSubject.vaccine.manufacturer} (${credentialSubject.vaccine.vaccine})`,
		bottom: ( { issuer } ) => `Issuer ${issuer.substr( 0, 15 )} ... ${issuer.substr( issuer.length - 13 )}`,
		icon: () => <FontAwesomeIcon icon={faHeartbeat} size="2x" />,
		description: "COVID-19 Vaccination Credential that certifies that you have received the vaccination against the new coronavirus (COVID-19)",
		image: "/images/cards/vc-health.png",
		image2x: "/images/cards/vc-health.png"
	},
	'https://credentials-library.lacchain.net/credentials/education/lacchain-academy/v1': {
		kind: 'vc',
		title: "Academy Certificate",
		topLeft: ( { issuanceDate } ) => `Issued ${moment( issuanceDate ).format( 'DD/MM/YYYY' )}`,
		topRight: ( { expirationDate } ) => `Expires ${moment( expirationDate ).format( 'DD/MM/YYYY' )}`,
		claim: ( { credentialSubject } ) => `${credentialSubject.givenName} ${credentialSubject.familyName}`,
		bottom: ( { issuer } ) => `Issuer ${issuer.substr( 0, 15 )} ... ${issuer.substr( issuer.length - 13 )}`,
		icon: () => <FontAwesomeIcon icon={faSchool} size="2x" />,
		description: "Introductory course of node deployment in LACChain Besu for developers, issued by LACChain Academy",
		signatures: 3,
		image: "/images/cards/vc-academy.png",
		image2x: "/images/cards/vc-academy.png"
	},
	'https://credentials-library.lacchain.net/credentials/identity/v1': {
		kind: 'vc',
		title: "LACChain ID Credential",
		topLeft: ( { issuanceDate } ) => `Issued ${moment( issuanceDate ).format( 'DD/MM/YYYY' )}`,
		topRight: ( { expirationDate } ) => `Expires ${moment( expirationDate ).format( 'DD/MM/YYYY' )}`,
		claim: ( { credentialSubject } ) => `${credentialSubject.givenName} ${credentialSubject.familyName} ${credentialSubject.lastName}`,
		bottom: ( { issuer } ) => `Issuer ${issuer.substr( 0, 15 )} ... ${issuer.substr( issuer.length - 13 )}`,
		icon: () => <FontAwesomeIcon icon={faUser} size="2x" />,
		description: "This is an auto-issued LACChain ID credential",
		image: "/images/cards/vc-id.png",
		image2x: "/images/cards/vc-id.png"
	},
	'https://www.w3.org/2018/credentials/v1': {
		kind: 'vc',
		title: "Verifiable Credential",
		topLeft: ( { issuanceDate } ) => `Issued ${moment( issuanceDate ).format( 'DD/MM/YYYY' )}`,
		topRight: ( { expirationDate } ) => `Expires ${moment( expirationDate ).format( 'DD/MM/YYYY' )}`,
		claim: item => `${item.type[item.type.length - 1]}`,
		bottom: ( { issuer } ) => `Issuer ${issuer.substr( 0, 15 )} ... ${issuer.substr( issuer.length - 13 )}`,
		icon: () => <FontAwesomeIcon icon={faIdCard} size="2x" />,
		description: "This is a generic Verifiable Credential",
		image: "/images/cards/vc.png",
		image2x: "/images/cards/vc.png"
	},
	'token://ERC-20': {
		kind: 'token',
		title: "ERC-20 Token",
		topLeft: () => '-',
		topRight: item => `Amount ${item.balance || 0}`,
		claim: ( { name, symbol } ) => `${name} (${symbol})`,
		bottom: ( { address } ) => `Address ${address.substr( 0, 13 )} ... ${address.substr( address.length - 11 )}`,
		icon: () => <FontAwesomeIcon icon={faEthereum} size="2x" />,
		description: "This is an ERC-20 Token",
		image: "/images/cards/vc-token-erc20.png",
		image2x: "/images/cards/vc-token-erc20.png"
	},
	'token://ERC20': {
		kind: 'token',
		title: "ERC-20 Token",
		topLeft: () => '-',
		topRight: item => `Amount ${item.balance || 0}`,
		claim: ( { name, symbol } ) => `${name} (${symbol})`,
		bottom: ( { address } ) => `Address ${address.substr( 0, 13 )} ... ${address.substr( address.length - 11 )}`,
		icon: () => <FontAwesomeIcon icon={faEthereum} size="2x" />,
		description: "This is an ERC-20 Token",
		image: "/images/cards/vc-token-erc20.png",
		image2x: "/images/cards/vc-token-erc20.png"
	},
	'token://ERC-721': {
		kind: 'token',
		title: "NFT Token",
		topLeft: ( { tokenId } ) => `Token ID ${tokenId}`,
		topRight: ( { balance } ) => balance > 0 ? 'Owned' : 'Not Owned' ,
		claim: ( { name, symbol } ) => `${name} (${symbol})`,
		icon: ( token ) => token.image ? <img src={token.image}  alt="" /> : null,
		bottom: ( { uri } ) => `URI ${uri ? uri.substr( 0, 15 ) : ''} ... ${uri ? uri.substr( uri.length - 13 ) : ''}`,
		description: "This is an ERC-721 NFT Token",
		image: "/images/cards/vc-token-nft.png",
		image2x: "/images/cards/vc-token-nft.png"
	},
	'token://TokenizedMoney': {
		kind: 'token',
		title: "Tokenized Money",
		topLeft: ( { tornado } ) => `Tornado ${tornado.substr( 0, 13 )} ... ${tornado.substr( tornado.length - 11 )}`,
		topRight: item => `Amount ${item.balance || 0}`,
		claim: ( { name, symbol } ) => `${name} (${symbol})`,
		bottom: ( { address } ) => `Address ${address.substr( 0, 13 )} ... ${address.substr( address.length - 11 )}`,
		icon: () => <FontAwesomeIcon icon={faMoneyCheck} size="2x" />,
		description: "This is an ERC-20 TokenizedMoney",
		image: "/images/cards/vc-token-tm.png",
		image2x: "/images/cards/vc-token-tm.png"
	}
};

export const token_types = {
	ERC20: 'ERC-20',
	ERC721: 'NFT',
	TS: 'TS'
};