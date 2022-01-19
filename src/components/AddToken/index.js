import React, { useState } from "react";
import cn from "classnames";
import styles from "./AddToken.module.sass";
import TextInput from "../TextInput";
import Loader from "../Loader";
import Dropdown from "../Dropdown";
import { useAuthContext } from "../../contexts/authContext";
import moment from "moment";
import { getInfo as getERC20Info } from "../../utils/erc20";
import { getInfo as getERC721Info } from "../../utils/erc721";
import { getInfo as getTokenizedInfo } from "../../utils/tokenized";

const types = ["ERC-20", "ERC-721", "TokenizedMoney"];

const AddToken = ( { className, onAdded } ) => {
	const { user, update } = useAuthContext();

	const [address, setAddress] = useState( "" );
	const [type, setType] = useState( "ERC-20" );
	const [tokenId, setTokenId] = useState( "" );
	const [adding, setAdding] = useState( false );

	const getItem = async id => {
		let token;
		switch( type ) {
			case 'ERC-20':
				token = await getERC20Info( address );
				return {
					'@context': `token://${type}`,
					id,
					type: [type],
					address,
					name: token.name,
					symbol: token.symbol,
					totalSupply: token.totalSupply,
					decimals: token.decimals,
					addedDate: moment().toISOString()
				}
			case 'ERC-721':
				token = await getERC721Info( address, tokenId );
				return {
					'@context': `token://${type}`,
					id,
					type: [type],
					address,
					name: token.name,
					symbol: token.symbol,
					totalSupply: token.totalSupply,
					uri: token.uri,
					tokenId,
					owner: token.owner,
					addedDate: moment().toISOString()
				}
			case 'TokenizedMoney':
				token = await getTokenizedInfo( address );
				return {
					'@context': `token://${type}`,
					id,
					type: [type],
					address,
					name: token.name,
					symbol: token.symbol,
					totalSupply: token.totalSupply,
					tornado: token.tornadoAddress,
					addedDate: moment().toISOString()
				}
		}
	}

	return (
		<div className={cn( className, styles.transfer )}>
			<div className={cn( "h4", styles.title )}>Add Token</div>
			<div className={styles.text}>
				To visualize a new token in your wallet, please select the type and address of the token
                <p style={{marginTop: '15px'}}>
					<div className={styles.fieldset}>
						<div className={styles.label}>Type</div>
						<Dropdown
							className={styles.dropdown}
							value={type}
							setValue={setType}
							options={types}
						/>
					</div>
                </p>
				<p style={{marginTop: '15px'}}>
					<div className={styles.fieldset}>
						<TextInput
							className={styles.field}
							label="address"
							onChange={(e) => setAddress(e.target.value)}
							name="address"
							type="text"
							placeholder="Enter the token address"
							required
						/>
					</div>
				</p>
				{type === 'ERC-721' &&
				<p style={{ marginTop: '15px' }}>
					<div className={styles.fieldset}>
						<TextInput
							className={styles.field}
							label="token id"
							onChange={( e ) => setTokenId( e.target.value )}
							name="tokenid"
							type="text"
							placeholder="Enter the token id"
							required
						/>
					</div>
				</p>
				}
			</div>
			<div className={styles.btns}>
                <button className={cn( "button-pink", styles.button )} onClick={async () => {
					setAdding( true );
					const id = type === 'ERC-721' ? `${type}:${address}:${tokenId}` : `${type}:${address}`;
					if( !user.credentials.find( c => c.id === id ) ) {
						const item = await getItem( id );
						user.credentials.push( item );
						await update( user );
					}
					setAdding( false );
					onAdded();
                }}>
					{!adding ?
						"Add Token" :
						<Loader className={styles.loader} color="white"/>
					}
                </button>
			</div>
		</div>
	);
};

export default AddToken;
