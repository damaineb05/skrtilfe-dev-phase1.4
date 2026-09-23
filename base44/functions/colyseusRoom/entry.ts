import { contractHandler } from '../../shared/apiContract.js';
/**
 * colyseusRoom — MULTIPLAYER PLACEHOLDER
 * Colyseus multiplayer is not yet deployed.
 * This stub prevents deployment/runtime errors.
 * The frontend useColyseus hook handles this gracefully.
 * Re-enable when a Colyseus server is provisioned.
 */

Deno.serve(contractHandler(async (_req) => {
  return new Response(
    JSON.stringify({ error: "Multiplayer not yet deployed" }),
    { status: 503, headers: { "Content-Type": "application/json" } }
  );
}));