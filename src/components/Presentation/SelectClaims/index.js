import React  from "react";
import cn from "classnames";
import styles from "./Claims.module.sass";

const SelectClaims = ( { className, claims, selected, setSelected } ) => {
	const claimNames = Object.keys( claims || {} );
	return (
		<div className={cn( styles.users, className )}>
			<div className={styles.list}>
				{claimNames.map( ( name, index ) => (
					<div className={styles.item} key={index}>
						<div className={styles.details}>
							<input type="checkbox" className={styles.left} checked={!!selected.find(c => c === name)}
							onChange={event => {
								if(!event.target.checked){
									setSelected( selected.filter(c => c !== name) );
								} else {
									setSelected( [...selected, name] );
								}
							}}/>
							<div className={styles.name}>{name}</div>
						</div>
					</div>
				) )}
			</div>
		</div>
	);
};

export default SelectClaims;
