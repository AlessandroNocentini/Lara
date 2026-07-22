/**
 * Minimal client-side wrapper around the GitHub Contents API, used by the
 * /admin page to read and write content/siteContent.json (and uploaded
 * photos) directly from the browser using a personal access token.
 *
 * No server, no OAuth app, no broker — the token itself is the credential.
 * It's kept in this browser's localStorage only and never sent anywhere
 * except api.github.com.
 */

const OWNER = "AlessandroNocentini";
const REPO = "Lara";
const BRANCH = "main";
const TOKEN_KEY = "lara_admin_gh_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token.trim());
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export class GitHubApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "GitHubApiError";
  }
}

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken();
  if (!token) throw new GitHubApiError("Not logged in.", 401);

  let response: Response;
  try {
    response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        ...(init.headers ?? {}),
      },
    });
  } catch {
    // The browser blocked the request before any HTTP response came back —
    // GitHub itself never saw it. Usually an ad-blocker/privacy extension,
    // no network access, or a restrictive firewall/VPN blocking api.github.com.
    throw new GitHubApiError(
      "Couldn't reach api.github.com. Check your internet connection, and disable any ad blocker or privacy extension for this page, then try again.",
      0
    );
  }

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) detail = body.message;
    } catch {
      // response had no JSON body — fall back to statusText
    }
    throw new GitHubApiError(detail, response.status);
  }

  return response;
}

/** UTF-8 safe: plain atob/btoa mishandle non-Latin1 characters (e.g. 🍹). */
export function utf8ToBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary);
}

export function base64ToUtf8(base64: string): string {
  const binary = atob(base64.replace(/\n/g, ""));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export interface RepoFile {
  content: string;
  sha: string;
}

/** Fetches a text file (e.g. content/siteContent.json) and decodes it. */
export async function getTextFile(path: string): Promise<RepoFile> {
  const response = await request(`contents/${path}?ref=${BRANCH}`);
  const data = (await response.json()) as { content: string; sha: string };
  return { content: base64ToUtf8(data.content), sha: data.sha };
}

/**
 * Commits a file straight to the live branch (direct publish — no PR review
 * step, matching the site's editing model). `contentBase64` must already be
 * base64-encoded (use utf8ToBase64 for text, or an already-base64 data URL
 * body for binary uploads).
 */
export async function putFile(
  path: string,
  contentBase64: string,
  message: string,
  sha?: string | null
): Promise<void> {
  await request(`contents/${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      content: contentBase64,
      branch: BRANCH,
      ...(sha ? { sha } : {}),
    }),
  });
}

/** Confirms the token can actually read this repo, for a clear login error instead of a silent failure. */
export async function verifyAccess(): Promise<void> {
  await request("");
}
