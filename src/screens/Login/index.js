import React, { useState } from "react";
import cn from "classnames";
import styles from "./Login.module.sass";
import Control from "../../components/Control";
import TextInput from "../../components/TextInput";
import Icon from "../../components/Icon";
import Loader from "../../components/Loader";
import { useAuthContext } from "../../contexts/authContext";
import { Link } from "react-router-dom";

const breadcrumbs = [
	{
		title: "Register",
		url: "/register",
	},
	{
		title: "Login",
	},
];

const Login = () => {
	const [email, setEmail] = useState( "" );
	const [password, setPassword] = useState( "" );
	const [loading, setLoading] = useState( false );
	const [error, setError] = useState( null );

	const { login } = useAuthContext();

	const handleSubmit = async() => {
		setLoading( true );
		await login( email, password ).then( result => !result ? setError( 'Invalid credentials' ) : null );
		setLoading( false );
	}

	return (
		<div className={styles.page}>
			<Control className={styles.control} item={breadcrumbs}/>
			<div className={cn( "section-pb", styles.section )}>
				<div className={cn( "container", styles.container )}>
					<div className={styles.top}>
						<h3 className={cn( "h4", styles.title )}>Login</h3>
						<div className={styles.info}>
							You need to provide your email and password to unlock the account. {" "} If you don't have
							any account {" "}
							<Link to="/register"><strong>register</strong></Link> first.
						</div>
						{error &&
							<div className={styles.error}>
								{error}
							</div>}
					</div>
					<div className={styles.row}>
						<div className={styles.col}>
							<div className={styles.list}>
								<div className={styles.item}>
									<div className={styles.category}>Account data</div>
									<div className={styles.fieldset}>
										<TextInput
											className={styles.field}
											value={email}
											onChange={e => setEmail( e.target.value )}
											label="Email"
											name="User email"
											type="email"
											placeholder="Enter your email"
											required
										/>
									</div>
									<div className={styles.fieldset2}>
										<TextInput
											className={styles.field}
											value={password}
											onChange={e => setPassword( e.target.value )}
											label="password"
											name="Password"
											type="password"
											placeholder="Enter your password"
											required
										/>
									</div>
								</div>
							</div>
							<div className={styles.btns}>
								<button className={cn( "button", { 'disabled': loading }, styles.button )} onClick={handleSubmit}>
									{!loading ?
										"Login" :
										<Loader className={styles.loader} color="white"/>
									}
								</button>
								<button className={styles.clear}>
									<Icon name="circle-close" size="24"/>
									Cancel
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;
