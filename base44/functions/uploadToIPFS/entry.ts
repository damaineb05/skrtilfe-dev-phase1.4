import { contractHandler } from '../../shared/apiContract.js';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(contractHandler(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const metadata = formData.get('metadata') ? JSON.parse(formData.get('metadata')) : null;

    const PINATA_API_KEY = Deno.env.get('PINATA_API_KEY');
    const PINATA_SECRET_KEY = Deno.env.get('PINATA_SECRET_KEY');

    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      return Response.json({ error: 'IPFS credentials not configured' }, { status: 500 });
    }

    let assetCID, metadataCID;

    // Upload asset file if provided
    if (file) {
      const assetFormData = new FormData();
      assetFormData.append('file', file);
      
      const assetResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY,
        },
        body: assetFormData,
      });

      if (!assetResponse.ok) {
        throw new Error('Failed to upload asset to IPFS');
      }

      const assetData = await assetResponse.json();
      assetCID = assetData.IpfsHash;
    }

    // Upload metadata if provided
    if (metadata) {
      const metadataToUpload = {
        ...metadata,
        image: assetCID ? `ipfs://${assetCID}` : metadata.image,
        created_at: new Date().toISOString(),
        creator: user.email,
      };

      const metadataResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY,
        },
        body: JSON.stringify({
          pinataContent: metadataToUpload,
          pinataMetadata: {
            name: metadata.name || 'NFT Metadata',
          },
        }),
      });

      if (!metadataResponse.ok) {
        throw new Error('Failed to upload metadata to IPFS');
      }

      const metadataData = await metadataResponse.json();
      metadataCID = metadataData.IpfsHash;
    }

    return Response.json({
      success: true,
      assetCID,
      metadataCID,
      assetURL: assetCID ? `https://gateway.pinata.cloud/ipfs/${assetCID}` : null,
      metadataURL: metadataCID ? `https://gateway.pinata.cloud/ipfs/${metadataCID}` : null,
    });

  } catch (error) {
    console.error('IPFS upload failed:', error);
    return Response.json({
      error: 'Failed to upload to IPFS',
      details: error.message
    }, { status: 500 });
  }
}));