import React, { useEffect, useState } from 'react'
import User from '../../mocks/health'

function useProvideAuth() {
	const [password] = useState( "demo" );
	const [account, setAccount] = useState( "demo@lacchain.net" );
	const [user, setUser] = useState( User );
	const [authorizing] = useState( false );
	const [showLogin, setShowLogin] = useState( false );

	useEffect( () => {
			setShowLogin( true );
	}, [] );

	async function loginWithPassword() {
			return true;
	}

	async function login( _email, _password ) {
			return _email && _password ?
				await loginWithPassword( _email, _password ) :
				await loginWithPassword( account, password );
	}

	function logout() {
		setAccount( null );
		setUser( null );
	}

	return {
		authorizing,
		account,
		showLogin,
		setShowLogin,
		user,
		login,
		logout
	}
}

export default useProvideAuth
