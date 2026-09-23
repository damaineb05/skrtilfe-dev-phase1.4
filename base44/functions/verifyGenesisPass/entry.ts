import { contractHandler } from '../../shared/apiContract.js';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { ethers } from 'npm:ethers@6.9.0';

const GENESIS_PASS_ABI = [
  "function balanceOf(address owner) public view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)"
];

Deno.serve(contractHandler(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { walletAddress } = await req.json();

    if (!walletAddress) {
      return Response.json({ error: 'Wallet address required' }, { status: 400 });
    }

    const contractAddress = Deno.env.get('GENESIS_CONTRACT_ADDRESS');

    if (!contractAddress) {
      return Response.json({ 
        hasGenesisPass: false,
        message: 'Genesis Pass contract not configured'
      });
    }

    const provider = new ethers.JsonRpcProvider('https://mainnet.infura.io/v3/YOUR_INFURA_KEY');
    const contract = new ethers.Contract(contractAddress, GENESIS_PASS_ABI, provider);

    const balance = await contract.balanceOf(walletAddress);
    const hasGenesisPass = balance > 0n;

    let tokens = [];
    if (hasGenesisPass) {
      for (let i = 0; i < Number(balance); i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(walletAddress, i);
        const tokenURI = await contract.tokenURI(tokenId);
        tokens.push({
          tokenId: tokenId.toString(),
          tokenURI
        });
      }
    }

    return Response.json({
      hasGenesisPass,
      balance: balance.toString(),
      tokens,
      walletAddress
    });

  } catch (error) {
    console.error('Genesis Pass verification failed:', error);
    return Response.json({
      hasGenesisPass: false,
      error: 'Failed to verify Genesis Pass',
      details: error.message
    }, { status: 500 });
  }
}));