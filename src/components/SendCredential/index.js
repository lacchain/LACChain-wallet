import React, { useState } from "react";
import cn from "classnames";
import styles from "./SendCredential.module.sass";
import { sendVC } from "../../utils/mailbox";
import { useAuthContext } from "../../contexts/authContext";
import Loader from "../Loader";
import SuccessfullyCredentialSent from "../../screens/Item/Control/SuccessfullyCredentialSent";
import FailedCredentialSent from "../../screens/Item/Control/FailedCredentialSent";

const SendCredential = ( { className, credential, onFinish } ) => {
	const [status, setStatus] = useState( 0 );
	const [sending, setSending] = useState( false );
	const [receiver, setReceiver] = useState( "" );
	const [error, setError] = useState( null );
	const { user } = useAuthContext();

	const send = async() => {
		setSending( true );
		sendVC( user, receiver, credential ).then( () => {
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
				<div className={cn( "h4", styles.title )}>Send Credential</div>
				<div className={styles.text}>
					You can send the credential from your wallet to another DID using the Mailbox service
				</div>
				<div className={styles.field}>
					<input
						className={styles.input}
						onChange={e => setReceiver( e.target.value )}
						type="text"
						name="address"
						placeholder="Receiver DID"
					/>
				</div>
				<div className={styles.btns}>
					<button
						className={cn( "button-small", styles.button )}
						onClick={() => send()}
					>
						{sending ?
							<Loader className={styles.loader} color="white"/>
							:
							"Send"
						}
					</button>
				</div>

			</div>
			}
			{status === 1 &&
			<SuccessfullyCredentialSent credential={credential} receiver={receiver} onAccept={onFinish}/>
			}
			{status === 2 &&
			<FailedCredentialSent error={error} onAccept={onFinish}/>
			}
		</>
	);
};

export default SendCredential;
