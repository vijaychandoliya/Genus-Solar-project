/**
 * Where the access token lives.
 *
 * In memory by default, NOT localStorage. A token in localStorage is readable by
 * any script that ends up on the page, which makes one XSS into a stolen session
 * that outlives the tab. In-memory loses the session on refresh, which is the
 * correct trade until the backend issues an httpOnly refresh cookie — at which
 * point this module is the only thing that changes.
 */
let accessToken: string | null = null;

export const setAccessToken = (token: string | null): void => { accessToken = token; };
export const getAccessToken = (): string | null => accessToken;

export function authHeader(): Record<string, string> {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}
