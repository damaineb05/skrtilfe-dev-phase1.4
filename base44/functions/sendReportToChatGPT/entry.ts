import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse incoming log payload from the frontend
    const body = await req.json().catch(() => ({}));
    const rawLogs = body.logs || [];

    // Format logs into structured report
    const timestamp = new Date().toISOString();
    const errors   = rawLogs.filter(l => l.level === 'error').map(l => l.message || l);
    const warnings = rawLogs.filter(l => l.level === 'warn').map(l => l.message || l);
    const recentEvents = rawLogs.slice(-20).map(l => l.message || l);

    const report = { timestamp, errors, warnings, recentEvents };

    // Attempt to send to OpenAI
    const apiKey = Deno.env.get('OPENAI_API_KEY');

    if (!apiKey) {
      // No key set — return the formatted report locally
      return Response.json({
        status: 'local_fallback',
        reason: 'OPENAI_API_KEY not set',
        report,
      });
    }

    const prompt = `You are a senior software engineer. Analyze the following runtime log report from a web application and provide a concise summary of issues, root causes, and recommended fixes.\n\nReport:\n${JSON.stringify(report, null, 2)}`;

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1024,
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      // API failed — return logs locally instead of crashing
      return Response.json({
        status: 'local_fallback',
        reason: `OpenAI API error ${openaiRes.status}: ${errText}`,
        report,
      });
    }

    const openaiData = await openaiRes.json();
    const analysis = openaiData.choices?.[0]?.message?.content || 'No analysis returned.';

    return Response.json({ status: 'success', report, analysis });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});