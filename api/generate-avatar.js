const GOOGLE_IMAGE_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict';
const MAX_PROMPT_LENGTH = 2000;
const UPSTREAM_TIMEOUT_MS = 20000;

function json(res, statusCode, payload) {
  res.status(statusCode).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.send(JSON.stringify(payload));
}

function isRetryableStatus(status) {
  return status === 408 || status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'Method Not Allowed', detail: 'Use POST /api/generate-avatar' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[generate-avatar] Missing GEMINI_API_KEY');
    return json(res, 500, { error: 'Server Misconfigured', detail: 'Missing GEMINI_API_KEY' });
  }

  const parsedBody = typeof req.body === 'string'
    ? (() => {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    })()
    : (req.body || {});

  const prompt = typeof parsedBody?.prompt === 'string' ? parsedBody.prompt.trim() : '';
  if (!prompt) {
    return json(res, 400, { error: 'Invalid Request', detail: 'prompt is required' });
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return json(res, 400, { error: 'Invalid Request', detail: `prompt is too long (max ${MAX_PROMPT_LENGTH})` });
  }

  const rawSampleCount = parsedBody?.sampleCount;
  const sampleCount = Number.isInteger(rawSampleCount) ? rawSampleCount : 1;
  if (sampleCount < 1 || sampleCount > 4) {
    return json(res, 400, { error: 'Invalid Request', detail: 'sampleCount must be an integer between 1 and 4' });
  }

  const payload = {
    instances: [{ prompt }],
    parameters: { sampleCount },
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, UPSTREAM_TIMEOUT_MS);

    let response;
    try {
      response = await fetch(`${GOOGLE_IMAGE_API_URL}?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify(payload),
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const data = await response.json().catch(() => ({}));
    const imageBase64 = data?.predictions?.[0]?.bytesBase64Encoded;

    if (!response.ok || !imageBase64) {
      console.error('[generate-avatar] Upstream failed', {
        status: response.status,
        statusText: response.statusText,
        errorData: data,
      });

      const detail = response.ok
        ? 'Invalid upstream response format'
        : `Upstream HTTP ${response.status}: ${JSON.stringify(data)}`;
      const statusCode = response.ok
        ? 502
        : (response.status >= 400 && response.status < 500 ? 400 : 502);
      const retryable = response.ok ? true : isRetryableStatus(response.status);

      return json(res, statusCode, {
        error: 'Image Generation Failed',
        detail,
        retryable,
      });
    }

    return json(res, 200, { imageBase64 });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.error('[generate-avatar] Upstream request timed out');
      return json(res, 504, { error: 'Image Generation Failed', detail: 'Upstream request timeout', retryable: true });
    }

    console.error('[generate-avatar] Request error', error);
    return json(res, 500, { error: 'Image Generation Failed', detail: 'Network or upstream error', retryable: true });
  }
}
