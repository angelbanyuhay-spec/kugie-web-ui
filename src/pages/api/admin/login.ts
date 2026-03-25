type LoginBody = { password: string };

function setCookie(response: Response, name: string, value: string, options: { httpOnly: boolean; sameSite: 'lax' | 'strict' | 'none'; path: string; maxAgeSeconds?: number }) {
  const secure = import.meta.env.PROD === true;
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    `Path=${options.path}`,
    `HttpOnly=${options.httpOnly ? 'true' : 'false'}`,
    `SameSite=${options.sameSite[0].toUpperCase()}${options.sameSite.slice(1)}`,
    secure ? 'Secure=true' : undefined,
    options.maxAgeSeconds ? `Max-Age=${options.maxAgeSeconds}` : undefined,
  ].filter(Boolean);

  response.headers.append('Set-Cookie', parts.join('; '));
}

export async function POST({ request }: { request: Request }) {
  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return new Response(JSON.stringify({ error: { message: 'Invalid JSON body.' } }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Dev fallback: the appointments admin used a hardcoded password.
  // For production, set ADMIN_PASSWORD and ADMIN_COOKIE_TOKEN in `.env`.
  const adminPassword = import.meta.env.ADMIN_PASSWORD ?? 'Kugiebites@Admin2026';
  const adminCookieToken = import.meta.env.ADMIN_COOKIE_TOKEN ?? 'dev-admin-cookie-token';

  if (!adminPassword || !adminCookieToken) {
    return new Response(JSON.stringify({ error: { message: 'Admin env vars missing (ADMIN_PASSWORD / ADMIN_COOKIE_TOKEN).' } }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!body?.password || body.password !== adminPassword) {
    return new Response(JSON.stringify({ error: { message: 'Incorrect password.' } }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const res = new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

  setCookie(res, 'admin_auth', adminCookieToken, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAgeSeconds: 60 * 60 * 8, // 8 hours
  });

  return res;
}

