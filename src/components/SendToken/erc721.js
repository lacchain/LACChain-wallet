import React, { useState } from "react";
import cn from "classnames";
import styles from "./Burn.module.sass";
import TextInput from "../TextInput";
import { sendTokens } from "../../utils/erc721";
import Loader from "../Loader";
import { useAuthContext } from "../../contexts/authContext";
import FailedTokenSent from "../../screens/Item/Control/FailedTokenSent";
import SuccessfullyTokenTransfer from "../../screens/Item/Control/SuccessfullyTokenTransfer";

export const ERC721 = ( { className, token, onFinish } ) => {
	const [status, setStatus] = useState( 0 );
	const [receiver, setReceiver] = useState( "" );
	const [sending, setSending] = useState( false );
	const [error, setError] = useState( null );

	const { user } = useAuthContext();

	const transfer = () => {
		setSending( true );
		sendTokens( token.address, user.did, user.mainKeyPair.privateKey, receiver, token.tokenId ).then( result => {
			console.log( result );
			setSending( false );
			setStatus( 1 );
		} ).catch( error => {
			setError( error.message || 'Unknown error' );
			setSending( false );
			setStatus( 2 );
		} );
	}

	return (
		<>
			{status === 0 &&
			<div className={cn( className, styles.transfer )}>
				<div className={cn( "h4", styles.title )}>Transfer Token</div>
				<div className={styles.text}>
					To transfer the ownership of NFT (ERC-721) token, please type the receiver DID
					<p style={{ marginTop: '15px' }}>
						<div className={styles.fieldset}>
							<TextInput
								className={styles.field}
								label="receiver"
								onChange={( e ) => setReceiver( e.target.value )}
								name="receiver"
								type="text"
								placeholder="Enter the receiver DID"
								required
							/>
						</div>
					</p>
				</div>
				<div className={styles.btns}>
					<button className={cn( "button-pink", { 'disabled': sending }, styles.button )} onClick={() => transfer()}>
						{!sending ?
							"Transfer" :
							<Loader className={styles.loader} color="white"/>
						}
					</button>
				</div>
			</div>
			}
			{status === 1 &&
			<SuccessfullyTokenTransfer token={token} receiver={receiver} onAccept={onFinish}/>
			}
			{status === 2 &&
			<FailedTokenSent token={token} error={error} onAccept={onFinish}/>
			}
		</>
	);
};