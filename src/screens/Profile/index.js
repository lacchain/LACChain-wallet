import React, { useState } from "react";
import cn from "classnames";
import styles from "./Profile.module.sass";
import Icon from "../../components/Icon";
import User from "./User";

// data
import { useAuthContext } from "../../contexts/authContext";
import VerificationMethods from "./VerificationMethods";
import BackupAndRestore from "./BackupAndRestore";

const navLinks = [
	"Public Keys",
	"Backup & Restore",
];

const Profile = () => {
	const [activeIndex, setActiveIndex] = useState( 0 );
	const [visible, setVisible] = useState( false );

	const { user } = useAuthContext();

	return (
		<div className={styles.profile}>
			<div
				className={cn( styles.head, { [styles.active]: visible } )}
				style={{
					backgroundImage: "url(/images/content/profile-background.png)",
				}}
			>
				<div className={cn( "container", styles.container )}>
					<div className={styles.file}>
						<input type="file"/>
						<div className={styles.wrap}>
							<Icon name="upload-file" size="48"/>
							<div className={styles.info}>Drag and drop your photo here</div>
							<div className={styles.text}>or click to browse</div>
						</div>
						<button
							className={cn( "button-small", styles.button )}
							onClick={() => setVisible( false )}
						>
							Save photo
						</button>
					</div>
				</div>
			</div>
			<div className={styles.body}>
				<div className={cn( "container", styles.container )}>
					<User className={styles.user}/>
					<div className={styles.wrapper}>
						<div className={styles.nav}>
							{navLinks.map( ( x, index ) => (
								<button
									className={cn( styles.link, {
										[styles.active]: index === activeIndex,
									} )}
									key={index}
									onClick={() => setActiveIndex( index )}
								>
									{x}
								</button>
							) )}
						</div>
						<div className={styles.group}>
							<div className={styles.item}>
								{activeIndex === 0 && (
									<VerificationMethods user={user}/>
								)}
								{activeIndex === 1 && (
									<BackupAndRestore />
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Profile;
