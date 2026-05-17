import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createReadStream, existsSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(fileURLToPath(new URL('..', import.meta.url)));
const browserDir = join(rootDir, 'dist', 'south-africa-fuel-app', 'browser');
const publicDir = join(rootDir, 'public');
const apiOnly = process.argv.includes('--api-only');
const port = Number(process.env['PORT'] ?? (apiOnly ? 8787 : 8080));

const routes = {
  '/api/fuel-prices': {
    upstreamUrl: process.env['FUEL_PRICES_API_URL'],
    apiKey: process.env['FUEL_PRICES_API_KEY'],
    apiKeyHeader: process.env['FUEL_PRICES_API_KEY_HEADER'] ?? 'x-api-key',
    fallbackFile: join(publicDir, 'data', 'fuel-prices.json'),
  },
};

createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', `http://${request.headers.host}`);

    if (request.method === 'OPTIONS') {
      sendEmpty(response, 204);
      return;
    }

    if (request.method !== 'GET') {
      sendJson(response, 405, { error: 'Method not allowed' });
      return;
    }

    if (url.pathname === '/api/health') {
      sendJson(response, 200, {
        ok: true,
        fuelPricesConfigured: Boolean(routes['/api/fuel-prices'].upstreamUrl),
      });
      return;
    }

    if (url.pathname in routes) {
      await sendApiResponse(response, routes[url.pathname]);
      return;
    }

    if (apiOnly) {
      sendJson(response, 404, { error: 'Not found' });
      return;
    }

    await sendStaticAsset(response, url.pathname);
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { error: 'Unexpected server error' });
  }
}).listen(port, () => {
  const mode = apiOnly ? 'API proxy' : 'Angular app + API proxy';
  console.log(`${mode} listening on http://127.0.0.1:${port}`);
});

async function sendApiResponse(response, route) {
  const payload = route.upstreamUrl
    ? await fetchUpstream(route).catch(() => readJsonFile(route.fallbackFile))
    : await readJsonFile(route.fallbackFile);

  sendJson(response, 200, payload, {
    'Cache-Control': route.upstreamUrl
      ? 'public, max-age=300, stale-while-revalidate=900'
      : 'public, max-age=60',
  });
}

async function fetchUpstream(route) {
  const headers = {
    Accept: 'application/json',
  };

  if (route.apiKey) {
    headers[route.apiKeyHeader] = route.apiKey;
  }

  const response = await fetch(route.upstreamUrl, { headers });

  if (!response.ok) {
    throw new Error(`Upstream returned ${response.status}`);
  }

  return response.json();
}

async function readJsonFile(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function sendStaticAsset(response, pathname) {
  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  const safePath = normalize(decodeURIComponent(requestedPath)).replace(/^(\.\.[/\\])+/, '');
  const filePath = resolve(join(browserDir, safePath));

  if (!filePath.startsWith(browserDir)) {
    sendJson(response, 403, { error: 'Forbidden' });
    return;
  }

  if (!existsSync(filePath)) {
    streamFile(response, join(browserDir, 'index.html'), 'text/html; charset=utf-8');
    return;
  }

  streamFile(response, filePath, contentType(filePath));
}

function streamFile(response, filePath, type) {
  response.writeHead(200, {
    ...securityHeaders(),
    'Content-Type': type,
  });
  createReadStream(filePath).pipe(response);
}

function sendJson(response, status, payload, headers = {}) {
  response.writeHead(status, {
    ...securityHeaders(),
    ...headers,
    'Content-Type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(payload));
}

function sendEmpty(response, status) {
  response.writeHead(status, securityHeaders());
  response.end();
}

function securityHeaders() {
  return {
    'Access-Control-Allow-Origin': process.env['CORS_ORIGIN'] ?? '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Content-Type-Options': 'nosniff',
  };
}

function contentType(filePath) {
  const types = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.ico': 'image/x-icon',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.txt': 'text/plain; charset=utf-8',
  };

  return types[extname(filePath).toLowerCase()] ?? 'application/octet-stream';
}
