import React, { useState } from "react";
import cn from "classnames";
import OutsideClickHandler from "react-outside-click-handler";
import styles from "./Actions.module.sass";
import SendCredential from "../SendCredential";
import RemoveSale from "../RemoveSale";
import Burn from "../Burn";
import Report from "../Report";
import Icon from "../Icon";
import Modal from "../../components/Modal";
import {
	getRootOfTrust,
	toCborQR,
	verifyCredential, verifyRootOfTrust
} from "../../utils/verification";
import CredentialVerfication from "../../screens/Item/Control/CredentialVerfication";

const Actions = ( { className, item } ) => {
	const [visible, setVisible] = useState( false );
	const [visibleModalTransfer, setVisibleModalTransfer] = useState( false );
	const [visibleModalRemoveSale, setVisibleModalRemoveSale] = useState( false );
	const [visibleModalBurn, setVisibleModalBurn] = useState( false );
	const [visibleModalReport, setVisibleModalReport] = useState( false );

	const [visibleModalVerification, setVisibleModalVerification] = useState( false );
	const [verification, setVerification] = useState( {} );
	const [verifying, setVerifying] = useState( false );

	const [qrCode, setQRCode] = useState( "" );

	const items = [
		{
			title: "Send Credential",
			icon: "share",
			action: () => setVisibleModalTransfer( true ),
		},
		{
			title: "Verify Credential",
			icon: "check",
			action: async () => {
				setVerifying( true );
				setVisibleModalVerification( true );
				const verification = await verifyCredential( item );
				const rootOfTrust = await getRootOfTrust( item );
				const validation = await verifyRootOfTrust( rootOfTrust, item.issuer );
				setVerification( { ...verification, isTrusted: validation[validation.length - 1] } );
				setVerifying( false );
			},
		},
		{
			title: "Show QR Code",
			icon: "report",
			action: () => {
				toCborQR( item ).then( qr => {
					setQRCode( qr );
					setVisibleModalReport( true );
				} );
			},
		},
		{
			title: "Create Presentation",
			icon: "edit",
			action: () => setVisibleModalBurn( true ),
		},
	];

	return (
		<>
			<OutsideClickHandler onOutsideClick={ () => console.log('out') }>
				<div
					className={cn( styles.actions, className, {
						[styles.active]: true,
					} )}
				>
					<div className={styles.body}>
						<div className={styles.item} onClick={() => setVisible(!visible)}>
							<span>{visible ? 'Hide' : 'Show'} options</span>
						</div>
						{visible && items.map( ( x, index ) => (
							<div className={styles.item} key={index} onClick={x.action}>
								<Icon name={x.icon} size="20"/>
								<span>{x.title}</span>
							</div>
						) )}
					</div>
				</div>
			</OutsideClickHandler>
			<Modal
				visible={visibleModalTransfer}
				onClose={() => setVisibleModalTransfer( false )}
			>
				<SendCredential credential={item} onFinish={ () => setVisibleModalTransfer( false ) } />
			</Modal>
			<Modal
				visible={visibleModalRemoveSale}
				onClose={() => setVisibleModalRemoveSale( false )}
			>
				<RemoveSale/>
			</Modal>
			<Modal
				visible={visibleModalBurn}
				onClose={() => setVisibleModalBurn( false )}
			>
				<Burn credential={item}/>
			</Modal>
			<Modal
				visible={visibleModalReport}
				onClose={() => setVisibleModalReport( false )}
			>
				<Report qr={qrCode}/>
			</Modal>
			<Modal
				visible={visibleModalVerification}
				onClose={() => setVisibleModalVerification( false )}
			>
				<CredentialVerfication results={verification || {}} loading={verifying}/>
			</Modal>
		</>
	);
};

export default Actions;
