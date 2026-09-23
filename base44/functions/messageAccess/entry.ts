import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { contractHandler } from '../../shared/apiContract.js';
import { accessMessages } from '../../shared/messageContract.js';
Deno.serve(contractHandler(async req => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({error:'Authentication required'},{status:401});
  return Response.json(await accessMessages({user,entities:base44.asServiceRole.entities,input:await req.json()}));
}));
