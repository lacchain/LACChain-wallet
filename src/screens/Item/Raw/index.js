import React from "react";
import cn from "classnames";
import styles from "./Raw.module.sass";

const Raw = ( { className, credential } ) => {
	return (
		<div className={cn( styles.users, className )}>
			<pre className={styles.code}>
				{JSON.stringify( credential, null, 2 )}
			</pre>
		</div>
	);
};

export default Raw;
