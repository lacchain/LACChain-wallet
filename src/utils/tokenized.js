import axios from "axios";

const endpoint = "http://104.154.147.42:8080";
const accounts = {
	'0xF465631192E8c0060bDa40B1B236d6C4c084F4D4': 0,
	'0xeB080924aE8872360E4B9D569344FDe9420041f3': 1
}

export async function getInfo( address ) {
	const institutions = [{
		"name": "Institution 1",
		"symbol": "IN1",
		"tokenAddress": "0xF465631192E8c0060bDa40B1B236d6C4c084F4D4",
		"tornadoAddress": "0x8af76cCB7eB3cd775bc3F357174bEfc1585D0E1f",
		"totalSupply": 16
	}, {
		"name": "Institution 2",
		"symbol": "IN2",
		"tokenAddress": "0xeB080924aE8872360E4B9D569344FDe9420041f3",
		"tornadoAddress": "0x962B42c430461F026Acf6Da38BAbBA5Bfb8CF5de",
		"totalSupply": 5
	}];
	return institutions[accounts[address]];
}

export async function getBalance( address ) {
	return await axios.post( `${endpoint}/balance`, {
		"institutionIndex": accounts[address]
	} ).then( result => result.data.balance ).catch( () => 0 );
}

export async function sendTokens( from, to, amount ) {
	return await axios.post( `${endpoint}/deposit`, {
		"indexFrom": accounts[from],
		"indexTo": accounts[to],
		"amount": amount
	} ).then( result => result.data );
}