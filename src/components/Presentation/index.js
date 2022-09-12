import React, { useState } from "react";
import cn from "classnames";
import styles from "./Burn.module.sass";
import { deriveCredential, toQRCode } from "../../utils/verification";
import { presentCredential } from "../../utils/credentials";
import { useAuthContext } from "../../contexts/authContext";
import Switch from "../Switch";

const Presentation = ( { className, credential } ) => {
	const claimNames = Object.keys( credential.credentialSubject || {} );
	const [qr, setQRCode] = useState( "" );
	const [hidePersonalData, setHidePersonalData] = useState( true );
	const { user } = useAuthContext();

	return (
		<div className={cn( className, styles.transfer )}>
			<div className={cn( "h4", styles.title )}>Show QR Code</div>
			<div className={styles.text} style={{ textAlign: 'center' }}>
				{!qr && "Do you want to hide personal data?" }
                <p style={{marginTop: '15px'}}>
                    {!qr &&
											<div className={styles.option} style={{ textAlign: 'center' }}>
												<Switch value={hidePersonalData} setValue={setHidePersonalData} />
											</div>
										}
                    {qr && <img src={qr} alt="QR Code" width="100%"/> }
                </p>
			</div>
			<div className={styles.btns}>
                {!qr && <button className={cn( "button-pink", styles.button )} onClick={() => {
									if( hidePersonalData ) {
										const claims = ["id", "type", "batchNumber", "administeringCentre", "healthProfessional", "countryOfVaccination", "order", "vaccine"];
										deriveCredential( credential, claims ).then( async zkp => {
											const vp = presentCredential( zkp, user );
											const qr = await toQRCode( vp );
											setQRCode( qr );
										} );
									} else {
										toQRCode( credential ).then( qr => {
											setQRCode( qr );
										} );

									}
                }}>Continue</button> }
			</div>
		</div>
	);
};

export default Presentation;
