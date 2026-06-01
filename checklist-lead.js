async function getChecklistPayload(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  if (typeof req.body === 'string') {
    const trimmedBody = req.body.trim();
    return trimmedBody ? JSON.parse(trimmedBody) : null;
  }

  const chunks = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const rawBody = Buffer.concat(chunks).toString('utf8').trim();
  return rawBody ? JSON.parse(rawBody) : null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false });
  }

  try {
    const payload = await getChecklistPayload(req);

    if (!payload) {
      console.error('Checklist API error: empty request body');
      return res.status(400).json({ ok: false });
    }

    console.log('API received body:', payload);

    const zapierUrl = 'https://hooks.zapier.com/hooks/catch/27783095/4bm0xaj/';

    const response = await fetch(zapierUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const zapierText = await response.text();
    console.log('Zapier response:', zapierText);

    if (!response.ok) {
      console.error('Zapier error:', zapierText);
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Checklist API error:', error);
    return res.status(200).json({ ok: false });
  }
}