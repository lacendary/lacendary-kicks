import nextEnv from "@next/env";
import { createHash, createHmac, randomUUID } from "node:crypto";

nextEnv.loadEnvConfig(process.cwd());
const base = `${process.env.NEXT_PUBLIC_WORDPRESS_URL?.replace(/\/$/, "")}/wp-json/lacendary-market/v1`;
const secret = process.env.LACENDARY_MARKET_API_SECRET?.trim();
if (!secret) throw new Error("LACENDARY_MARKET_API_SECRET is required");
const path = "/products/6d3e52de-9537-42d5-812d-e7871ff57b4b";

function signedHeaders(method: string, route: string, body = "", timestamp = Math.floor(Date.now() / 1000).toString(), requestId = randomUUID(), key = secret!) {
  const canonical = [method, `/wp-json/lacendary-market/v1${route}`, timestamp, requestId, createHash("sha256").update(body).digest("hex")].join("\n");
  return {
    "X-Lacendary-Timestamp": timestamp,
    "X-Lacendary-Request-Id": requestId,
    "X-Lacendary-Signature": createHmac("sha256", key).update(canonical).digest("hex"),
  };
}

const results: Record<string, number> = {};
results.missingSignature = (await fetch(`${base}${path}`, { method: "POST" })).status;
results.invalidSignature = (await fetch(`${base}${path}`, { method: "POST", headers: signedHeaders("POST", path, "", undefined, undefined, "invalid-secret-that-is-long-enough") })).status;
results.expiredTimestamp = (await fetch(`${base}${path}`, { method: "POST", headers: signedHeaders("POST", path, "", "1") })).status;
const malformed = JSON.stringify({ unsupported: true });
results.validSignedRequest = (await fetch(`${base}${path}`, { method: "POST", headers: signedHeaders("POST", path) })).status;
const replayHeaders = { "Content-Type": "application/json", ...signedHeaders("POST", "/refresh", malformed) };
results.replayFirstRequest = (await fetch(`${base}/refresh`, { method: "POST", headers: replayHeaders, body: malformed })).status;
results.replayedRequest = (await fetch(`${base}/refresh`, { method: "POST", headers: replayHeaders, body: malformed })).status;
results.malformedPayload = (await fetch(`${base}/refresh`, { method: "POST", headers: { "Content-Type": "application/json", ...signedHeaders("POST", "/refresh", malformed) }, body: malformed })).status;
console.log(JSON.stringify(results, null, 2));
