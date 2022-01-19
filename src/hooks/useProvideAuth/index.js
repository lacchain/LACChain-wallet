import React, { useEffect, useState } from 'react'
import * as ethUtil from "ethereumjs-util";
import * as sigUtil from "eth-sig-util";

function useProvideAuth() {
	const provider = window.ethereum ? window.ethereum : null;

	const [account, setAccount] = useState( null );
	const [user, setUser] = useState( null );
	const [updated, setUpdated] = useState( new Date().getTime() );
	const [authorizing, setAuthorizing] = useState( !!provider );

	useEffect( () => {
		if( provider && account ) login();
	}, [account] );

	const getEncryptionKey = async() => {
		return provider.request( {
			method: 'eth_getEncryptionPublicKey',
			params: [account]
		} );
	}

	const encrypt = async data => {
		const encryptionKey = await getEncryptionKey();

		return ethUtil.bufferToHex( Buffer.from(
			JSON.stringify(
				sigUtil.encrypt( encryptionKey, { data }, 'x25519-xsalsa20-poly1305' )
			), 'utf8'
		) );
	}

	const decrypt = async encrypted => {
		const decrypted = await provider.request( {
			method: 'eth_decrypt',
			params: [encrypted, account]
		} );
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
		}
	}, [] );

	async function signin( user ){
		setUser( user );
		const encrypted = await encrypt( JSON.stringify( user ) );
		localStorage.setItem( account, encrypted );
	}

	async function update( user ){
		await signin( user );
		setUpdated( new Date().getTime() );
	}

	async function login() {
		const encrypted = localStorage.getItem( account );
		if( !encrypted ) {
			setUser( null );
			setAuthorizing( false );
		} else {
			setUser( await decrypt( encrypted ) );
			setAuthorizing( false );
		}
	}

	function logout() {
		setAccount( null );
		setUser( null );
	}

	return {
		authorizing,
		account,
		provider,
		user,
		updated,
		encrypt,
		decrypt,
		signin,
		login,
		logout,
		update
	}
}

export default useProvideAuth
