import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export function verifyWorkerRequest(request: Request, rawBody: string, secret: string, nowSeconds = Math.floor(Date.now() / 1000)) {
  const timestamp = request.headers.get("x-lacendary-timestamp") ?? "";
  const requestId = request.headers.get("x-lacendary-request-id") ?? "";
  const signature = request.headers.get("x-lacendary-signature") ?? "";
  if (!/^\d+$/.test(timestamp) || Math.abs(nowSeconds - Number(timestamp)) > 300) return { ok: false as const, status: 401, reason: "expired_or_invalid_timestamp" };
  if (!/^[a-f0-9-]{16,64}$/i.test(requestId) || !/^[a-f0-9]{64}$/i.test(signature)) return { ok: false as const, status: 401, reason: "invalid_auth_headers" };
  const path = new URL(request.url).pathname;
  const canonical = [request.method.toUpperCase(), path, timestamp, requestId, createHash("sha256").update(rawBody).digest("hex")].join("\n");
  const expected = createHmac("sha256", secret).update(canonical).digest("hex");
  const valid = timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(signature, "hex"));
  return valid ? { ok: true as const, requestId } : { ok: false as const, status: 401, reason: "invalid_signature" };
}
