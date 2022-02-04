import React, { useState } from "react";
import cn from "classnames";
import styles from "./Burn.module.sass";
import TextInput from "../TextInput";
import { sendTokens } from "../../utils/tokenized";
import Loader from "../Loader";
import SuccessfullyTokenSent from "../../screens/Item/Control/SuccessfullyTokenSent";
import FailedTokenSent from "../../screens/Item/Control/FailedTokenSent";

export const TokenizedMoney = ( { className, token, onFinish } ) => {
	const [status, setStatus] = useState( 0 );
	const [receiver, setReceiver] = useState( "" );
	const [amount, setAmount] = useState( 1 );
	const [sending, setSending] = useState( false );
	const [error, setError] = useState( null );

	const send = () => {
		setSending( true );
		sendTokens( token.address, receiver, amount ).then( result => {
			console.log( result );
			setSending( false );
			setStatus( 1 );
		} ).catch( error => {
			setError( error.response?.data || 'Unknown error' );
			setSending( false );
			setStatus( 2 );
		} );
	}

	return (
		<>
			{status === 0 &&
			<div className={cn( className, styles.transfer )}>
				<div className={cn( "h4", styles.title )}>Send Tokenized Money</div>
				<div className={styles.text}>
					To send the ERC-20 Tokenized Money, please type the receiver DID
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
					<p style={{ marginTop: '15px' }}>
						<div className={styles.fieldset}>
							<TextInput
								className={styles.field}
								label="Amount"
								onChange={e => setAmount( e.target.value )}
								name="amount"
								type="text"
								placeholder="Enter the amount of tokens"
								required
							/>
						</div>
					</p>
				</div>
				<div className={styles.btns}>
					<button className={cn( "button-pink", { 'disabled': sending }, styles.button )} onClick={() => send()}>
						{!sending ?
							"Send" :
							<Loader className={styles.loader} color="white"/>
						}
					</button>
				</div>
			</div>
			}
			{status === 1 &&
			<SuccessfullyTokenSent token={token} amount={amount} receiver={receiver} onAccept={onFinish}/>
			}
			{status === 2 &&
			<FailedTokenSent token={token} error={error} onAccept={onFinish}/>
			}
		</>
	);
};