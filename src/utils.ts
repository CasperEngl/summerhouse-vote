import { randomBytes } from "crypto";

// Generate a random session ID
export function generateSessionId(): string {
  return randomBytes(32).toString("hex");
}

// Get session ID from cookies
export function getSessionId(request: Request): string | null {
  const cookie = request.headers.get("cookie");
  if (!cookie) return null;

  const sessionCookie = cookie
    .split(";")
    .find((c) => c.trim().startsWith("session_id="));
  if (!sessionCookie) return null;

  return sessionCookie.split("=")[1]?.trim() ?? null;
}

// Create a response with session cookie
export function createResponseWithSession(
  data: any,
  sessionId: string,
): Response {
  const response = Response.json(data);
  response.headers.set(
    "Set-Cookie",
    `session_id=${sessionId}; HttpOnly; Path=/; SameSite=Strict; Max-Age=86400`,
  );
  return response;
}
