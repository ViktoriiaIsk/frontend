import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path = [] } = req.query;
  const targetPath = Array.isArray(path) ? path.join('/') : path;
  const url = `http://13.37.117.93/${targetPath}`;

  try {
    const headers: Record<string, string> = {};
    
    // Copy relevant headers, excluding problematic ones
    const excludeHeaders = ['host', 'connection', 'content-length', 'transfer-encoding'];
    Object.entries(req.headers).forEach(([key, value]) => {
      if (!excludeHeaders.includes(key.toLowerCase()) && value) {
        if (typeof value === 'string') {
          headers[key] = value;
        } else if (Array.isArray(value)) {
          headers[key] = value.join(', ');
        }
      }
    });

    // Ensure proper content-type for JSON requests
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      if (!headers['content-type']) {
        headers['content-type'] = 'application/json';
      }
    }

    // Add CORS headers for the backend
    headers['Access-Control-Allow-Origin'] = '*';
    headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';

    console.log(`Proxy request: ${req.method} ${url}`);
    console.log('Headers:', headers);

    let body = null;
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method!)) {
      if (req.body) {
        // If body is already a string, use it as is, otherwise stringify
        body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      }
    }

    const proxyRes = await fetch(url, {
      method: req.method,
      headers,
      body,
    });

    console.log(`Proxy response: ${proxyRes.status} ${proxyRes.statusText}`);

    // Copy response headers
    const responseHeaders: Record<string, string> = {};
    proxyRes.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    // Set CORS headers for the client
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Set content type
    const contentType = proxyRes.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    // Handle different content types appropriately
    if (contentType?.includes('application/json')) {
      const text = await proxyRes.text();
      res.status(proxyRes.status).send(text);
    } else if (contentType?.startsWith('image/')) {
      const buffer = await proxyRes.arrayBuffer();
      res.status(proxyRes.status).send(Buffer.from(buffer));
    } else {
      const text = await proxyRes.text();
      res.status(proxyRes.status).send(text);
    }
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Proxy request failed', 
      details: (error as any).message,
      url: url
    });
  }
} 