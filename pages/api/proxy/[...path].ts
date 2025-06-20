import type { NextApiRequest, NextApiResponse } from 'next';

// Disable body parsing to handle raw request body
export const config = {
  api: {
    bodyParser: false,
  },
};

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

    // Important: Set the correct origin for Laravel Sanctum
    headers['Origin'] = 'http://13.37.117.93';
    headers['Referer'] = 'http://13.37.117.93';
    
    // Ensure these headers are set for Laravel
    headers['X-Requested-With'] = 'XMLHttpRequest';
    headers['Accept'] = 'application/json';

    let body = null;
    
    // Handle different content types
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const contentType = req.headers['content-type'];
      
      if (contentType && contentType.includes('multipart/form-data')) {
        // For multipart/form-data, we need to pass the raw body
        const chunks: Buffer[] = [];
        
        await new Promise((resolve, reject) => {
          req.on('data', (chunk: Buffer) => {
            chunks.push(chunk);
          });
          
          req.on('end', () => {
            resolve(undefined);
          });
          
          req.on('error', (err) => {
            reject(err);
          });
        });
        
        body = Buffer.concat(chunks);
      } else {
        // For other content types, read the raw body first
        const chunks: Buffer[] = [];
        
        await new Promise((resolve, reject) => {
          req.on('data', (chunk: Buffer) => {
            chunks.push(chunk);
          });
          
          req.on('end', () => {
            resolve(undefined);
          });
          
          req.on('error', (err) => {
            reject(err);
          });
        });
        
        const rawBody = Buffer.concat(chunks);
        
        if (rawBody.length > 0) {
          if (contentType && contentType.includes('application/json')) {
            // For JSON, we can pass the raw buffer
            body = rawBody;
            headers['content-type'] = 'application/json';
          } else {
            // For other types, convert to string
            body = rawBody.toString();
          }
        }
      }
    }



    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
      body,
      // Don't use credentials: 'include' here as it can cause CORS issues
      // Instead, manually handle cookies
    };

    const response = await fetch(url, fetchOptions);



    // Forward all cookies from backend to client
    const setCookieHeaders = response.headers.getSetCookie ? 
      response.headers.getSetCookie() : 
      response.headers.get('set-cookie')?.split(/,(?=\s*\w+\s*=)/) || [];
    
    if (setCookieHeaders.length > 0) {
      setCookieHeaders.forEach(cookie => {
        // Modify cookie settings for local development
        let modifiedCookie = cookie.trim();
        
        // For development, remove Secure flag and modify SameSite
        if (process.env.NODE_ENV === 'development') {
          modifiedCookie = modifiedCookie
            .replace(/; Secure/gi, '')
            .replace(/; SameSite=None/gi, '; SameSite=Lax');
        }
        
        res.appendHeader('Set-Cookie', modifiedCookie);
      });
    }

    // Copy other response headers
    response.headers.forEach((value, key) => {
      // Skip problematic headers and cookies (already handled above)
      if (!['content-encoding', 'transfer-encoding', 'connection', 'set-cookie'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    // Set status code
    res.status(response.status);

    // Handle response body
    const responseText = await response.text();
    
    try {
      // Try to parse as JSON
      const jsonData = JSON.parse(responseText);
      res.json(jsonData);
    } catch {
      // If not JSON, send as text
      res.send(responseText);
    }

  } catch (error) {
    res.status(500).json({ 
      error: 'Proxy error', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
} 