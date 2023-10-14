import { ethers } from "ethers";
import axios from "axios";
import { LEGACY_PROVIDER_PRC_URL } from "../constants/env";

const abi = [
	// Read-Only Functions
	"function balanceOf(address owner) view returns (uint256)",
	"function ownerOf(uint256 tokenId) view returns (address)",
	"function tokenURI(uint256 tokenId) view returns (string)",
	"function totalSupply() view returns (uint256)",
	"function symbol() view returns (string)",
	"function name() view returns (string)",

	// Authenticated Functions
	"function transferFrom(address from, address to, uint256 tokenId) public",
];

export async function getInfo( address, id ) {
	const token = new ethers.Contract( address, abi, new ethers.providers.JsonRpcProvider( LEGACY_PROVIDER_PRC_URL ) );
	const totalSupply = await token.totalSupply().catch( () => 0 )
	const uri = await token.tokenURI( id );
	const resource = await axios.get( uri ).then( result => result.data );

	return {
		name: await token.name(),
		symbol: await token.symbol(),
		totalSupply: totalSupply.toString(),
		uri,
		image: resource.image || '',
		owner: await token.ownerOf( id )
	};
}

export async function getBalance( address, account, tokenId ) {
	const token = new ethers.Contract( address, abi, new ethers.providers.JsonRpcProvider( LEGACY_PROVIDER_PRC_URL ) );
	const owner = await token.ownerOf( tokenId );
	return owner.toLowerCase() === account.toLowerCase() ? 1 : 0;
}

export async function sendTokens( address, from, privateKey, receiver, tokenId ) {
	const token = new ethers.Contract( address, abi, new ethers.Wallet( privateKey, new ethers.providers.JsonRpcProvider( LEGACY_PROVIDER_PRC_URL ) ) );
	return await token.transferFrom( from.replace(/.*:/, ''), receiver.replace(/.*:/, ''), tokenId );
}