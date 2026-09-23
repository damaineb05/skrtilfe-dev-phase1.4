import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // ── Authenticate the caller ──────────────────────────────────────────
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Identity is derived from the authenticated session. Client-supplied
    // userId / userName are ignored to prevent impersonation.
    const userId = user.id;
    const userName = user.full_name || user.email || 'Member';

    const clientId = Deno.env.get("STREAMOJI_CLIENT_ID");
    const clientSecret = Deno.env.get("STREAMOJI_CLIENT_SECRET");

    if (!clientId || !clientSecret) {
      return Response.json({ error: 'Streamoji credentials not configured' }, { status: 500 });
    }

    const response = await fetch(
      "https://us-central1-streamoji-265f4.cloudfunctions.net/getAuthToken",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Client-Secret": clientSecret,
          "Client-Id": clientId,
        },
        body: JSON.stringify({ userId, userName }),
      }
    );

    const data = await response.json();

    if (!data.success) {
      console.error('Streamoji auth error:', data);
      return Response.json({ error: data.error || 'Auth failed' }, { status: 400 });
    }

    return Response.json({ authToken: data.authToken });
  } catch (error) {
    console.error('streamojiAuth error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});