import React from 'react'
import { authContext } from '../../contexts/authContext'
import useProvideAuth from '../../hooks/useProvideAuth'

function WithAuthContextProvider( { children } ) {
	const {
		authorizing,
		account,
		user,
		updated,
		encrypt,
		decrypt,
		provider,
		signin,
		login,
		logout,
		update
	} = useProvideAuth()

	return (
		<authContext.Provider value={{
			authorizing,
			account,
			user,
			updated,
			encrypt,
			decrypt,
			provider,
			signin,
			login,
			logout,
			update
		}}
		>
			{children}
		</authContext.Provider>
	)
}

export default WithAuthContextProvider
