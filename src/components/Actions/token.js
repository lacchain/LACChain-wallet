import React, { useState } from "react";
import cn from "classnames";
import OutsideClickHandler from "react-outside-click-handler";
import styles from "./Actions.module.sass";
import Icon from "../Icon";
import Modal from "../../components/Modal";
import { ERC20, ERC721, TokenizedMoney } from "../SendToken";

const ActionsToken = ( { className, token } ) => {
	const [visibleModalSend, setVisibleModalSend] = useState( false );
	const [visibleModalSendTokenized, setVisibleModalSendTokenized] = useState( false );
	const [visibleModalTransfer, setVisibleModalTransfer] = useState( false );

	const items = [
		{
			type: "token://ERC-20",
			title: "Send Tokens",
			icon: "share",
			action: () => setVisibleModalSend( true ),
		},
		{
			type: "token://ERC-721",
			title: "Transfer Token",
			icon: "share",
			action: () => setVisibleModalTransfer( true ),
		},
		{
			type: "token://TokenizedMoney",
			title: "Send Tokens",
			icon: "share",
			action: () => setVisibleModalSendTokenized( true ),
		},
	];

	return (
		<>
			<OutsideClickHandler onOutsideClick={() => {
			}}>
				<div
					className={cn( styles.actions, className, {
						[styles.active]: true,
					} )}
				>
					<div className={styles.body}>
						{items.filter( item => item.type === token['@context'] ).map( ( x, index ) => (
							<div className={styles.item} key={index} onClick={x.action}>
								<Icon name={x.icon} size="20"/>
								<span>{x.title}</span>
							</div>
						) )}
					</div>
				</div>
			</OutsideClickHandler>
			<Modal
				visible={visibleModalSend}
				onClose={() => setVisibleModalSend( false )}
			>
				<ERC20 token={token} onFinish={ () => setVisibleModalSend( false ) }/>
			</Modal>
			<Modal
				visible={visibleModalTransfer}
				onClose={() => setVisibleModalTransfer( false )}
			>
				<ERC721 token={token} onFinish={ () => setVisibleModalTransfer( false ) }/>
			</Modal>
			<Modal
				visible={visibleModalSendTokenized}
				onClose={() => setVisibleModalSendTokenized( false )}
			>
				<TokenizedMoney token={token} onFinish={ () => setVisibleModalSendTokenized( false ) }/>
			</Modal>
		</>
	);
};

export default ActionsToken;
