export const formatDID = user => user ? `${user.did.substring( 0, 19 )} ... ${user.did.substring( 51 )}` : '';
export const formatUser = user => {
	if( user && user.credentials ) {
		const identity = user.credentials.find( vc => vc.type?.find( type => type === 'IdentityCard' ) );
		if( !identity ) return "Unknown User";
		const subject = identity.credentialSubject;
		return `${subject.givenName} ${subject.familyName} ${subject.lastName}`;
	}

	return "Unknown User";
}