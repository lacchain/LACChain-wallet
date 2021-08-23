import React, { useState } from "react";
import cn from "classnames";
import styles from "./Burn.module.sass";
import SelectClaims from "./SelectClaims";
import { toCborQR } from "../../utils/verification";

const Burn = ( { className, credential } ) => {
    const claimNames = Object.keys( credential.credentialSubject || {} );
    const [qr, setQRCode] = useState( "" );
    const [selected, setSelected] = useState( claimNames );
	return (
		<div className={cn( className, styles.transfer )}>
			<div className={cn( "h4", styles.title )}>Presentation</div>
			<div className={styles.text}>
				To generate a Verifiable Presentation with Selective Disclosure (Zero-Knowledge Proof), please select
				the fields to include:
                <p style={{marginTop: '15px'}}>
                    {!qr && <SelectClaims claims={credential.credentialSubject} selected={selected} setSelected={setSelected}/> }
                    {qr && <img src={qr} alt="QR Code" width="100%"/> }
                </p>
			</div>
			<div className={styles.btns}>
                {!qr && <button className={cn( "button-pink", styles.button )} onClick={() => {
				    const vc = {
				        ...credential,
                        credentialSubject: selected.reduce( (a, i) =>
                            ({...a, [i]: credential.credentialSubject[i]}), {})
				    }
                    toCborQR( vc ).then( qr => {
                        setQRCode( qr );
                    });
                }}>Continue</button> }
			</div>
		</div>
	);
};

export default Burn;
