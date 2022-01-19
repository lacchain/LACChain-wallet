import { ethers } from "ethers";

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
	const token = new ethers.Contract( address, abi, new ethers.providers.JsonRpcProvider( "https://writer.lacchain.net" ) );
	const totalSupply = await token.totalSupply()
	return {
		name: await token.name(),
		symbol: await token.symbol(),
		totalSupply: totalSupply.toString(),
		uri: await token.tokenURI( id ),
		owner: await token.ownerOf( id )
	};
}

export async function getBalance( address, account ) {
	const token = new ethers.Contract( address, abi, new ethers.providers.JsonRpcProvider( "https://writer.lacchain.net" ) );
	return await token.balanceOf( account );
}

export async function sendTokens( address, privateKey, receiver ) {
	const token = new ethers.Contract( address, abi, new ethers.Wallet( privateKey, new ethers.providers.JsonRpcProvider( "https://writer.lacchain.net" ) ) );
	return await token.transfer( receiver.replace('did:lac:main:', ''), 1 );
}