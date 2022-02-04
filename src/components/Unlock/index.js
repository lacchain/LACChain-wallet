import React, { useState } from "react";
import cn from "classnames";
import styles from "./Unlock.module.sass";
import { useAuthContext } from "../../contexts/authContext";
import Loader from "../Loader";

const Unlock = ( { className, data, onFinish } ) => {
	const [decrypting, setDecrypting] = useState( false );
	const [password, setPassword] = useState( "" );
	const [error, setError] = useState( null );
	const { decrypt } = useAuthContext();

	const unlock = async() => {
		setDecrypting( true );
		decrypt( data, password ).then( result => {
			setDecrypting( false );
			onFinish( result );
		} ).catch( error => {
			setDecrypting( false );
			setError( 'Invalid Encryption Key' );
		} );
	}

	return (
		<>
			<div className={cn( className, styles.transfer )}>
				<div className={cn( "h4", styles.title )}>Unlock</div>
				<div className={styles.text}>
					To unlock data, you need to specify the Encryption Key
				</div>
				{error &&
					<span className="status-pink" style={{width: '100%', marginBottom: 10}}>{error}</span>
				}
				<div className={styles.field}>
					<input
						className={styles.input}
						onChange={e => setPassword( e.target.value )}
						type="password"
						name="password"
						placeholder="Encryption Key"
					/>
				</div>
				<div className={styles.btns}>
					<button
						className={cn( "button-small", styles.button )}
						onClick={() => unlock()}
					>
						{decrypting ?
							<Loader className={styles.loader} color="white"/>
							:
							"Decrypt"
						}
					</button>
				</div>

			</div>

		</>
	);
};

export default Unlock;
