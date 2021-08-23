import React, { useState } from "react";
import cn from "classnames";
import styles from "./Search01.module.sass";
import { getTrackBackground, Range } from "react-range";
import Icon from "../../components/Icon";
import Card from "../../components/Card";
import Dropdown from "../../components/Dropdown";

// data
import { credentials } from "../../mocks/credentials";

const navLinks = [{
	label: "All",
	context: '*'
}, {
	label: "Health",
	context: 'http://id.lacchain.net/credentials/health/vaccination/v1'
}, {
	label: "Education",
	context: 'http://id.lacchain.net/credentials/education/lacchain-academy/v1'
}, {
	label: "Identity",
	context: 'http://id.lacchain.net/credentials/identity/v1'
}, {
	label: "Other",
	context: 'https://id.lacchain.net/credentials/other/v1'
}];

const dateOptions = ["Newest", "Oldest"];
//const likesOptions = ["Most liked", "Least liked"];
//const colorOptions = ["All colors", "Black", "Green", "Pink", "Purple"];
//const creatorOptions = ["Verified only", "All", "Most liked"];

const Search = () => {
	const [results, setResults] = useState( credentials );
	const [activeIndex, setActiveIndex] = useState( 0 );
	const [date, setDate] = useState( dateOptions[0] );
	//const [likes, setLikes] = useState( likesOptions[0] );
	//const [color, setColor] = useState( colorOptions[0] );
	//const [creator, setCreator] = useState( creatorOptions[0] );
	const [visible, setVisible] = useState( false );

	const [search, setSearch] = useState( "" );

	//const [values, setValues] = useState( [5] );

	const handleSubmit = ( e ) => {
		alert();
	};

	const STEP = 0.1;
	const MIN = 0.01;
	const MAX = 10;

	return (
		<div className={cn( "", styles.section )}>
			<div className={cn( "container", styles.container )}>
				<div className={styles.top}>
                    <div className={styles.nav}>
                        {navLinks.map( ( x, index ) => (
                            <button
                                className={cn( styles.link, {
                                    [styles.active]: index === activeIndex,
                                } )}
                                onClick={() => {
                                	setActiveIndex( index );
									setResults( credentials.filter( c => {
										const context = c['@context'].slice(-1)[0];
										return context === x.context || x.context === '*';
									} ) );
								}}
                                key={index}
                            >
                                {x.label}
                            </button>
                        ) )}
                    </div>
                    <button
                        className={cn( styles.filter, { [styles.active]: visible } )}
                        onClick={() => setVisible( !visible )}
                    >
                        <div className={styles.text}>Filter</div>
                        <div className={styles.toggle}>
                            <Icon name="filter" size="18"/>
                            <Icon name="close" size="10"/>
                        </div>
                    </button>
				</div>
				<div className={styles.row}>
					<div className={cn(styles.filters, { [styles.active]: visible })}>
                        <div className={styles.sorting}>
                            <form
                                className={styles.search}
                                action=""
                                onSubmit={() => handleSubmit()}
                            >
                                <input
                                    className={styles.input}
                                    type="text"
                                    value={search}
                                    onChange={( e ) => setSearch( e.target.value )}
                                    name="search"
                                    placeholder="Search ..."
                                    required
                                />
                                <button className={styles.result}>
                                    <Icon name="search" size="16"/>
                                </button>
                            </form>
                        </div>
                        <div className={styles.sorting}>
                            <div className={styles.dropdown}>
								<div className={styles.label}>Sort by</div>
                                <Dropdown
                                    className={styles.dropdown}
                                    value={date}
                                    setValue={setDate}
                                    options={dateOptions}
                                />
                            </div>
                        </div>
						{/*
						<div className={styles.range}>
							<div className={styles.label}>Price range</div>
							<Range
								values={values}
								step={STEP}
								min={MIN}
								max={MAX}
								onChange={( values ) => setValues( values )}
								renderTrack={( { props, children } ) => (
									<div
										onMouseDown={props.onMouseDown}
										onTouchStart={props.onTouchStart}
										style={{
											...props.style,
											height: "36px",
											display: "flex",
											width: "100%",
										}}
									>
										<div
											ref={props.ref}
											style={{
												height: "8px",
												width: "100%",
												borderRadius: "4px",
												background: getTrackBackground( {
													values,
													colors: ["#3772FF", "#E6E8EC"],
													min: MIN,
													max: MAX,
												} ),
												alignSelf: "center",
											}}
										>
											{children}
										</div>
									</div>
								)}
								renderThumb={( { props, isDragged } ) => (
									<div
										{...props}
										style={{
											...props.style,
											height: "24px",
											width: "24px",
											borderRadius: "50%",
											backgroundColor: "#3772FF",
											border: "4px solid #FCFCFD",
											display: "flex",
											justifyContent: "center",
											alignItems: "center",
										}}
									>
										<div
											style={{
												position: "absolute",
												top: "-33px",
												color: "#fff",
												fontWeight: "600",
												fontSize: "14px",
												lineHeight: "18px",
												fontFamily: "Poppins",
												padding: "4px 8px",
												borderRadius: "8px",
												backgroundColor: "#141416",
											}}
										>
											{values[0].toFixed( 1 )}
										</div>
									</div>
								)}
							/>
							<div className={styles.scale}>
								<div className={styles.number}>0.01 ETH</div>
								<div className={styles.number}>10 ETH</div>
							</div>
						</div>
						<div className={styles.group}>
							<div className={styles.item}>
								<div className={styles.label}>Price</div>
								<Dropdown
									className={styles.dropdown}
									value={likes}
									setValue={setLikes}
									options={likesOptions}
								/>
							</div>
							<div className={styles.item}>
								<div className={styles.label}>Color</div>
								<Dropdown
									className={styles.dropdown}
									value={color}
									setValue={setColor}
									options={colorOptions}
								/>
							</div>
							<div className={styles.item}>
								<div className={styles.label}>Creator</div>
								<Dropdown
									className={styles.dropdown}
									value={creator}
									setValue={setCreator}
									options={creatorOptions}
								/>
							</div>
						</div>
						<div className={styles.reset}>
							<Icon name="close-circle-fill" size="24"/>
							<span>Reset filter</span>
						</div>
						*/}
					</div>
					<div className={styles.wrapper}>
						<div className={styles.list}>
							{results.map( ( x, index ) => (
								<Card className={styles.card} item={x} key={index}/>
							) )}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Search;
