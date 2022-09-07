import React from 'react'
import { authContext } from '../../contexts/authContext'
import useProvideAuth from '../../hooks/useProvideAuth'

function WithAuthContextProvider( { children } ) {
	const {
		authorizing,
		account,
		user,
		updated,
		provider,
		login,
		decrypt,
		showLogin,
		setShowLogin,
		logout,
		update
	} = useProvideAuth()

	return (
		<authContext.Provider value={{
			authorizing,
			account,
			user,
			updated,
			provider,
			login,
			decrypt,
			showLogin,
			setShowLogin,
			logout,
			update
		}}
		>
			{children}
		</authContext.Provider>
	)
}

export default WithAuthContextProvider
