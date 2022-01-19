import React, { useEffect, useState } from "react";
import cn from "classnames";
import { Link } from "react-router-dom";
import styles from "./Card.module.sass";
import { types } from "../../mocks/types";
import { useAuthContext } from "../../contexts/authContext";
import { getBalance } from "../../utils/erc20";
import { getBalance as getTokenizedBalance } from "../../utils/tokenized";
import Icon from "../Icon";

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
				case 'NFT Token':
					getBalance( item.address, user.did.replace('did:lac:main:', '') )
						.then( balance => {
							const amount = balance.toNumber() / 10**item.decimals;
							setBalance( amount );
						} );
					break;
				case 'Tokenized Money':
					getTokenizedBalance( item.address ).then( balance => setBalance( balance ) );
			}

		}
	}, [] );
	/*if( type.kind === 'vc' ){
		console.log( item );
	}*/
	return (
		<div className={cn( styles.card, className )}>
			<Link className={styles.link} to={`/item/${item.id}`}>
				<div className={styles.preview}>
					<img srcSet={`${type.image2x} 2x`} src={type.image} alt="Card"/>
					<div className={styles.control}>
						<Link className={styles.close} onClick={onRemove}>
							<Icon name="close" size="14"/>
						</Link>
						<div className={styles.topLeft}>{type.topLeft( item )}</div>
						<div className={styles.topRight}>{type.topRight( {...item, balance} )}</div>
						<div className={styles.title}>{type.title}</div>
						<div className={styles.claim}>{type.claim( item )}</div>
						<div className={styles.bottom}>{type.bottom( item )}</div>
					</div>
				</div>
			</Link>
		</div>
	);
};

export default Card;
