import test from "node:test";
import assert from "node:assert/strict";
import { createHash, createHmac } from "node:crypto";
import { verifyWorkerRequest } from "../app/lib/market-worker-auth.ts";

const secret = "test-secret-that-is-at-least-thirty-two-bytes";
const body = JSON.stringify({ action: "full", runType: "manual_full" });
const timestamp = "1787800000";
const requestId = "12345678-1234-1234-1234-123456789abc";

function request(overrides: Record<string, string> = {}) {
  const path = "/api/market/refresh";
  const signature = createHmac("sha256", secret).update([
    "POST", path, timestamp, requestId, createHash("sha256").update(body).digest("hex"),
  ].join("\n")).digest("hex");
  return new Request(`https://example.test${path}`, { method: "POST", headers: {
    "x-lacendary-timestamp": timestamp,
    "x-lacendary-request-id": requestId,
    "x-lacendary-signature": signature,
    ...overrides,
  }, body });
}

test("accepts a valid signed worker request", () => {
  assert.deepEqual(verifyWorkerRequest(request(), body, secret, Number(timestamp)), { ok: true, requestId });
});

test("rejects missing or invalid signatures", () => {
  const result = verifyWorkerRequest(request({ "x-lacendary-signature": "0".repeat(64) }), body, secret, Number(timestamp));
  assert.equal(result.ok, false);
  assert.equal(result.reason, "invalid_signature");
});

test("rejects expired timestamps and body tampering", () => {
  assert.equal(verifyWorkerRequest(request(), body, secret, Number(timestamp) + 301).reason, "expired_or_invalid_timestamp");
  assert.equal(verifyWorkerRequest(request(), `${body} `, secret, Number(timestamp)).reason, "invalid_signature");
});
