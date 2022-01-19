import React, { useState } from "react";
import cn from "classnames";
import styles from "./Item.module.sass";
import Options from "./Options";
import { credentials } from "../../mocks/credentials";
import { token_types } from "../../mocks/types";

const navLinks = ["General Information"];

const Token = ( { match } ) => {
	const [activeIndex, setActiveIndex] = useState( 0 );
	const token = credentials.find( c => c.id === match.params.id || c.address === match.params.id );
	const type = token_types[token.type];

	return (
		<>
			<div>
				<div className={cn( "container", styles.container )}>
					<div className={styles.bg}>
						<div className={styles.preview}>
							<img src="/images/content/erc20.svg" alt="Token" />
						</div>
						<Options className={styles.options} credential={token}/>
					</div>
					<div className={styles.details}>
						<h1 className={cn( "h5", styles.title )}>{token.name}</h1>
						<div className={styles.cost}>
							<div className={styles.categories}>
								<div className={cn(
									{ "status-pink": !true },
									{ "status-green": true },
									styles.category
								)}>
									{token.ticker}
								</div>
							</div>
							<div className={styles.counter}>Decimals: {token.decimals}</div>
						</div>
						<div className={styles.info}>
							{type.description}
						</div>
						<div className={styles.nav}>
							{navLinks.map( ( x, index ) => (
								<button
									className={cn(
										{ [styles.active]: index === activeIndex },
										styles.link
									)}
									onClick={() => setActiveIndex( index )}
									key={index}
								>
									{x}
								</button>
							) )}
						</div>
						{activeIndex === 0 &&
						<div>
							<b>Address:</b> {token.address} <br />
							<b>Max Supply:</b> {token.maxSupply}
						</div>
						}
					</div>
				</div>
			</div>
		</>
	);
};

export default Token;
