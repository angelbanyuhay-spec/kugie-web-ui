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

export async function POST() {
  const res = new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

  // Clear cookie by setting Max-Age=0.
  setCookie(res, 'admin_auth', '', { httpOnly: true, sameSite: 'lax', path: '/', maxAgeSeconds: 0 });
  return res;
}

