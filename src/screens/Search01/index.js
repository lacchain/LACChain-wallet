import React, { useEffect, useState } from "react";
import cn from "classnames";
import styles from "./Search01.module.sass";
import Icon from "../../components/Icon";
import Card from "../../components/Card";
import Dropdown from "../../components/Dropdown";
import { useAuthContext } from '../../contexts/authContext'
import Modal from "../../components/Modal";
import RemoveSale from "../../components/RemoveSale";

// data
// import Token from "../../components/Card/token";

const navLinks = [{
	label: "All",
	context: '*'
}, {
	label: "Credentials",
	context: 'https://'
}, {
	label: "Tokens",
	context: 'token://'
}, {
	label: "Other",
	context: 'other://'
}];

const dateOptions = ["Newest", "Oldest"];

const Search = () => {
	const { user, update, updated } = useAuthContext();

	const localCredentials = user.credentials || '[]';

	const [results, setResults] = useState( localCredentials );
	const [filtered, setFiltered] = useState( results );
	const [activeIndex, setActiveIndex] = useState( 0 );
	const [selectedItem, setSelectedItem] = useState( -1 );
	const [date, setDate] = useState( dateOptions[0] );
	const [visible, setVisible] = useState( false );
	const [visibleModalRemove, setVisibleModalRemove] = useState( false );

	const [search, setSearch] = useState( "" );

	useEffect( () => {
		setResults( user.credentials );
		setFiltered( user.credentials );
	}, [updated] );


	const handleRemove = async () => {
		const credentials = user.credentials.filter( c => c.id !== selectedItem );
		await update( { ...user, credentials } );
		setVisibleModalRemove( false );
	};

	const handleSubmit = e => {
		alert();
	};

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
									setFiltered( results.filter( c => {
										const context = Array.isArray(c['@context']) ? c['@context']?.slice(-1)[0] : c['@context'];
										return context?.startsWith(x.context) || x.context === '*';
									} ) );
								}}
                                key={index}
                            >
                                {x.label}
                            </button>
                        ) )}
                    </div>
					{/* <button
                        className={cn( styles.filter, { [styles.active]: visible } )}
                        onClick={() => setVisible( !visible )}
                    >
                        <div className={styles.text}>Filter</div>
                        <div className={styles.toggle}>
                            <Icon name="filter" size="18"/>
                            <Icon name="close" size="10"/>
                        </div>
                    </button> */ }
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
					</div>
					<div className={styles.wrapper}>
						<div className={styles.list}>
							{filtered.filter( x => x.id ).map( ( x, index ) => (
								<Card className={styles.card} item={x} key={index} onRemove={() => {
									setVisibleModalRemove( true );
									setSelectedItem( x.id );
								}} />
							) )}
						</div>
						<Modal
							visible={visibleModalRemove}
							onClose={() => setVisibleModalRemove( false )}
						>
							<RemoveSale onAccept={ () => handleRemove() }/>
						</Modal>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Search;
