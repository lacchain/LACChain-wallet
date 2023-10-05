import React, { useEffect, useState } from "react";
import cn from "classnames";
import { Link } from "react-router-dom";
import styles from "./CredentialCard.module.sass";
import { types } from "../../mocks/types";
import { useAuthContext } from "../../contexts/authContext";
import { getBalance } from "../../utils/erc20";
import { getBalance as getTokenizedBalance } from "../../utils/tokenized";
import Icon from "../Icon";
import { getBalance as getNFTBalance } from "../../utils/erc721";

const Card = ( { className, item, onRemove } ) => {
	const { user } = useAuthContext();
	const credential = item.type === 'VerifiablePresentation' ? item.verifiableCredential[0] : item;

	const context = credential['@context'];
	const type = ( !Array.isArray(context) ? types[context] : types[context[context.length - 1]] ) ||
		types['https://www.w3.org/2018/credentials/v1'];

	const [balance, setBalance] = useState( 0 );

	useEffect( () => {
		if( type.kind === 'token' ) {
			switch( type.title ){
				case 'ERC-20 Token':
					getBalance( credential.address, user.did.replace(/.*:/, '') )
						.then( balance => {
							const amount = balance.toNumber() / 10**credential.decimals;
							setBalance( amount );
						} );
					break;
				case 'NFT Token':
					getNFTBalance( credential.address, user.did.replace(/.*:/, ''), credential.tokenId )
						.then( balance => setBalance( balance ) );
					break;
				case 'Tokenized Money':
					getTokenizedBalance( credential.address ).then( balance => setBalance( balance ) );
					break;
				default:
					console.log('unsupported token type: ' + type.kind);
			}
		}
	}, [] );
	return (
		<div className={cn( styles.card, className )}>type
			<Link className={styles.link} to={`/item/${credential.id}`}>
				<div className={styles.preview}>
					<img srcSet={`${type.image2x} 2x`} src={type.image} alt="Card"/>
					<div className={styles.control}>
						<Link to="#" className={styles.close} onClick={onRemove}>
							<Icon name="close" size="14"/>
						</Link>
						<div className={styles.topLeft}>{type.topLeft( credential )}</div>
						<div className={styles.topRight}>{type.topRight( {...credential, balance} )}</div>
						<div className={styles.title}>{type.claim( credential )}</div>
						{type.icon(credential) && <div className={styles.image}>{type.icon(credential)}</div> }
						<div className={styles.claim}>{type.title}</div>
						<div className={styles.bottom}>{type.bottom( credential )}</div>
					</div>
				</div>
			</Link>
		</div>
	);
};

export default Card;
