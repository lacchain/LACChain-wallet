import React, { useState } from "react";
import cn from "classnames";
import styles from "./User.module.sass";
import Icon from "../../../components/Icon";
import Report from "../../../components/Report";
import Modal from "../../../components/Modal";
import { FacebookShareButton, TwitterShareButton } from "react-share";
import { useAuthContext } from "../../../contexts/authContext";
import { formatDID, formatUser } from "../../../utils/format";
import { MAILBOX_SERVICE } from "../../../constants/env";

const shareUrlFacebook = "https://ui8.net";
const shareUrlTwitter = "https://ui8.net";

const User = ( { className } ) => {
	const [visibleShare, setVisibleShare] = useState( false );
	const [visibleModalReport, setVisibleModalReport] = useState( false );

	const { user } = useAuthContext();

	return (
		<>
			<div className={cn( styles.user, className )}>
				<div className={styles.avatar}>
					<img src="/images/content/avatar-user.jpg" alt="Avatar"/>
				</div>
				<div className={styles.name}>{formatUser( user )}</div>
				<div className={styles.code}>
					<div className={styles.number}>{formatDID( user )}</div>
					<button className={styles.copy} onClick={() => navigator.clipboard.writeText( user.did )}>
						<Icon name="copy" size="16"/>
					</button>
				</div>
				<div className={styles.info}>
					The exchange credential service of this DID is pointed to
				</div>
				<a
					className={styles.site}
					href={MAILBOX_SERVICE}
					target="_blank"
					rel="noopener noreferrer"
				>
					<Icon name="globe" size="16"/>
					<span>{MAILBOX_SERVICE}</span>
				</a>

				<div className={styles.control}>
					<div className={styles.btns}>
					</div>
					<div className={cn( styles.box, { [styles.active]: visibleShare } )}>
						<div className={styles.stage}>Share link to this page</div>
						<div className={styles.share}>
							<TwitterShareButton
								className={styles.direction}
								url={shareUrlTwitter}
							>
                <span>
                  <Icon name="twitter" size="20"/>
                </span>
							</TwitterShareButton>
							<FacebookShareButton
								className={styles.direction}
								url={shareUrlFacebook}
							>
                <span>
                  <Icon name="facebook" size="20"/>
                </span>
							</FacebookShareButton>
						</div>
					</div>
				</div>
				<div className={styles.note}>
				</div>
			</div>
			<Modal
				visible={visibleModalReport}
				onClose={() => setVisibleModalReport( false )}
			>
				<Report/>
			</Modal>
		</>
	);
};

export default User;
