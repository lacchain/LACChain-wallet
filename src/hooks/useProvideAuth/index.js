import React, { useEffect, useState } from 'react'
import * as ethUtil from "ethereumjs-util";
import * as sigUtil from "eth-sig-util";
import { encrypt, decrypt as passwordDecrypt } from "../../utils/crypt";

function useProvideAuth() {
	const provider = window.ethereum ? window.ethereum : null;

	const [password, setPassword] = useState( "" );
	const [account, setAccount] = useState( null );
	const [user, setUser] = useState( null );
	const [updated, setUpdated] = useState( new Date().getTime() );
	const [encryptionKey, setEncryptionKey] = useState( null );
	const [authorizing, setAuthorizing] = useState( !!provider );
	const [showLogin, setShowLogin] = useState( false );

	useEffect( () => {
		if( provider && account ) loginWithMetamask();
	}, [account] );

	const getEncryptionKey = async() => {
		const key = await provider.request( {
			method: 'eth_getEncryptionPublicKey',
			params: [account]
		} );
		setEncryptionKey( key );
		return key;
	}

	const encryptWithPassword = ( data, _password ) => {
		return encrypt( data, _password );
	}

	const encryptWithMetamask = async data => {
		const key = encryptionKey || await getEncryptionKey();

		return ethUtil.bufferToHex( Buffer.from(
			JSON.stringify(
				sigUtil.encrypt( key, { data }, 'x25519-xsalsa20-poly1305' )
			), 'utf8'
		) );
	}

	const decryptWithMetamask = async encrypted => {
		const decrypted = await provider.request( {
			method: 'eth_decrypt',
			params: [encrypted, account]
		} );
		return JSON.parse( decrypted );
	}

	const decryptWithPassword = async( encrypted, password ) => {
		const decrypted = passwordDecrypt( encrypted, password );
		return JSON.parse( decrypted );
	}

	useEffect( () => {
		if( provider ) {
			provider.request( { method: 'eth_requestAccounts' } )
				.then( accounts => accounts.length > 0 ? setAccount( accounts[0] ) : null );

			provider.on( 'accountsChanged', async accounts => {
				if( accounts.length <= 0 ) return logout();
				setAccount( accounts[0] );
				window.location = '/';
			} )
		} else {
			setShowLogin( true );
		}
	}, [] );

	async function signinWithMetamask( user ) {
		const encrypted = await encryptWithMetamask( JSON.stringify( user ) );
		localStorage.setItem( account, encrypted );
	}

	async function signinWithPassword( user, email, password ) {
		const encrypted = encryptWithPassword( JSON.stringify( user ), password );
		setAccount( email );
		setPassword( password );
		localStorage.setItem( email, encrypted );
	}

	async function signin( user, email, password ) {
		setUser( user );
		if( !provider )
			await signinWithPassword( user, email, password )
		else
			await signinWithMetamask( user );
	}

	async function update( user ) {
		setUser( user );
		if( provider )
			await signinWithMetamask( user );
		else
			await signinWithPassword( user, account, password );

		setUpdated( new Date().getTime() );
	}

	async function loginWithMetamask() {
		const encrypted = localStorage.getItem( account );
		if( !encrypted ) {
			setUser( null );
			setAuthorizing( false );
			return false;
		} else {
			setUser( await decryptWithMetamask( encrypted ) );
			setAuthorizing( false );
			return true;
		}
	}

	async function loginWithPassword( email, password ) {
		const encrypted = localStorage.getItem( email );
		if( !encrypted ) {
			setUser( null );
			setAuthorizing( false );
			return false;
		} else {
			try {
				setUser( await decryptWithPassword( encrypted, password ) );
				setAccount( email );
				setPassword( password );
				setAuthorizing( false );
				return true;
			} catch( error ) {
				return false;
			}
		}
	}

	async function decrypt( data, _password ) {
		if( provider ) return await decryptWithMetamask( data );
		else if( _password ) return await decryptWithPassword( data, _password );
		return await decryptWithPassword( data, password );
	}

	async function login( _email, _password ) {
		if( provider ) return await loginWithMetamask();
		else
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
		provider,
		user,
		updated,
		decrypt,
		signin,
		login,
		logout,
		update
	}
}

export default useProvideAuth
