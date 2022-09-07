import React, { useState } from "react";
import cn from "classnames";
import OutsideClickHandler from "react-outside-click-handler";
import styles from "./Actions.module.sass";
import Modal from "../../components/Modal";
import Presentation from "../Presentation";

const Actions = ( { className, item } ) => {
	const [visibleModalBurn, setVisibleModalBurn] = useState( false );

	return (
		<>
			<OutsideClickHandler onOutsideClick={ () => {} }>
				<div
					className={cn( styles.actions, className, {
						[styles.active]: true,
					} )}
				>
					<div className={styles.body}>
						<div className={styles.item} onClick={() => setVisibleModalBurn( true )}>
							<span>Show QR Code</span>
						</div>
					</div>
				</div>
			</OutsideClickHandler>
			<Modal
				visible={visibleModalBurn}
				onClose={() => setVisibleModalBurn( false )}
			>
				<Presentation credential={item}/>
			</Modal>
		</>
	);
};

export default Actions;
