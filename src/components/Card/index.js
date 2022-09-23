import React, { useEffect, useState } from "react";
import cn from "classnames";
import { Link } from "react-router-dom";
import styles from "./Card.module.sass";
import { types } from "../../mocks/types";
import { useAuthContext } from "../../contexts/authContext";
import { getBalance } from "../../utils/erc20";
import { getBalance as getTokenizedBalance } from "../../utils/tokenized";
import Icon from "../Icon";
import { getBalance as getNFTBalance } from "../../utils/erc721";

const Card = ( { className, item, onRemove } ) => {
	const { user } = useAuthContext();

	const context = item['@context'];
	const type = ( !Array.isArray(context) ? types[context] : types[context[context.length - 1]] ) ||
		types['https://www.w3.org/2018/credentials/v1'];

	const [balance, setBalance] = useState( 0 );

	useEffect( () => {
		if( type.kind === 'token' ) {
			switch( type.title ){
				case 'ERC-20 Token':
					getBalance( item.address, user.did.replace('did:lac:main:', '') )
						.then( balance => {
							const amount = balance.toNumber() / 10**item.decimals;
							setBalance( amount );
						} );
					break;
				case 'NFT Token':
					getNFTBalance( item.address, user.did.replace('did:lac:main:', ''), item.tokenId )
						.then( balance => setBalance( balance ) );
					break;
				case 'Tokenized Money':
					getTokenizedBalance( item.address ).then( balance => setBalance( balance ) );
			}

		}
	}, [] );
	/*if( type.kind === 'vc' ){
		console.log( item );
	}*/
	let image = type.image2x;
	if( type.claim( item ) === 'Yellow fever (J07BL01)' ) image = '/images/cards/vc-token-nft.png'
	let url = `/item/${item.id}`;
	if( type.title === 'My Immunization Records' ||
			type.title === 'Tuberculosis test result' ||
			type.title === 'Hepatitis B test result' ||
			type.title === 'Digital Health Summary' ) url = '#';
	return (
		<div className={cn( styles.card, className )}>
			<Link className={styles.link} to={url}>
				<div className={styles.preview}>
					<img srcSet={`${image} 2x`} src={image} alt="Card"/>
					<div className={styles.control}>
						<Link to="#" className={styles.close} onClick={onRemove}>
							<Icon name="close" size="14"/>
						</Link>
						<div className={styles.topLeft}>{type.topLeft( item )}</div>
						<div className={styles.topRight}>{type.topRight( {...item, balance} )}</div>
						<div className={styles.title}>{type.claim( item )}</div>
						{type.icon(item) && <div className={styles.image}>{type.icon(item)}</div> }
						<div className={styles.claim}>{type.title}</div>
						<div className={styles.bottom}>{type.bottom( item )}</div>
					</div>
				</div>
			</Link>
		</div>
	);
};

export default Card;
