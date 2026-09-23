import { contractHandler } from '../../shared/apiContract.js';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { ethers } from 'npm:ethers@6.9.0';

const GENESIS_PASS_ABI = [
  "function mint(address to, string memory tokenURI) public returns (uint256)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)"
];

function isAuthorizedAdmin(user) {
  return user && (user.role === 'admin' || user.role === 'superadmin');
}

Deno.serve(contractHandler(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // ── Authorization: admin/superadmin OR valid internal secret ──────────
    // Internal invocations (e.g. from another backend function via the
    // service role) do not require a user session.
    let callerIsAuthorized = false;
    let invokingUser = null;

    const internalSecret = Deno.env.get('INTERNAL_FUNCTION_SECRET');
    if (internalSecret && body.internalSecret === internalSecret) {
      callerIsAuthorized = true;
    } else {
      try {
        invokingUser = await base44.auth.me();
        if (isAuthorizedAdmin(invokingUser)) {
          callerIsAuthorized = true;
        }
      } catch {
        // unauthenticated — not authorized
      }
    }

    if (!callerIsAuthorized) {
      console.error(`Unauthorized mint attempt by ${invokingUser?.email || 'unknown'}`);
      return Response.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const { recipientAddress, metadata } = body;

    if (!recipientAddress) {
      return Response.json({ error: 'Recipient address required' }, { status: 400 });
    }

    // Validate recipient as an Ethereum address
    if (!ethers.isAddress(recipientAddress)) {
      return Response.json(
        { error: 'Invalid recipient address: must be a valid Ethereum address' },
        { status: 400 }
      );
    }

    // Upload metadata to IPFS first
    const metadataResponse = await fetch(`${Deno.env.get('BASE44_FUNCTION_URL')}/uploadToIPFS`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metadata: {
          name: metadata?.name || 'SKRTLIFE Genesis Pass',
          description: metadata?.description || 'Exclusive access to the SKRTLIFE digital society',
          image: metadata?.image || 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bc2773ba0ba8d2da222a27/ca9d3b1ed_IMG_9553.jpg',
          attributes: metadata?.attributes || [
            { trait_type: 'Type', value: 'Genesis Pass' },
            { trait_type: 'Access Level', value: 'Lifetime' },
            { trait_type: 'Benefits', value: 'All Features' }
          ],
          external_url: 'https://skrtlife.com',
        }
      })
    });

    const { metadataCID, metadataURL } = await metadataResponse.json();

    if (!metadataCID) {
      throw new Error('Failed to upload metadata to IPFS');
    }

    // Connect to blockchain
    const provider = new ethers.JsonRpcProvider('https://mainnet.infura.io/v3/YOUR_INFURA_KEY');
    const privateKey = Deno.env.get('GENESIS_PRIVATE_KEY');
    const contractAddress = Deno.env.get('GENESIS_CONTRACT_ADDRESS');

    if (!privateKey || !contractAddress) {
      return Response.json({ 
        error: 'Genesis Pass contract not configured',
        message: 'Please configure GENESIS_PRIVATE_KEY and GENESIS_CONTRACT_ADDRESS'
      }, { status: 500 });
    }

    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, GENESIS_PASS_ABI, wallet);

    // Mint the NFT
    const tokenURI = `ipfs://${metadataCID}`;
    const tx = await contract.mint(recipientAddress, tokenURI);
    const receipt = await tx.wait();

    // Create Transaction record
    await base44.asServiceRole.entities.Transaction.create({
      tx_hash: receipt.hash,
      chain_id: 1, // Ethereum mainnet
      from_address: wallet.address,
      to_address: recipientAddress,
      amount: '0',
      currency: 'ETH',
      tx_type: 'mint',
      status: 'confirmed',
      block_number: receipt.blockNumber,
      user_email: invokingUser?.email || 'internal',
      metadata: {
        nft_type: 'Genesis Pass',
        token_uri: tokenURI,
        ipfs_cid: metadataCID
      }
    });

    return Response.json({
      success: true,
      transactionHash: receipt.hash,
      tokenURI,
      metadataURL,
      blockNumber: receipt.blockNumber
    });

  } catch (error) {
    console.error('Genesis Pass minting failed:', error);
    return Response.json({
      error: 'Failed to mint Genesis Pass',
      details: error.message
    }, { status: 500 });
  }
}));