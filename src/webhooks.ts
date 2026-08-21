import { InvalidSignatureError } from "./errors.js";

const encoder = new TextEncoder();

export interface WebhookVerificationOptions {
  timestampHeader?: string;
  tolerance?: number | null;
  now?: number;
}

export class WebhookVerifier {
  static async verify(
    rawBody: string | Uint8Array | ArrayBuffer,
    signature: string,
    secret: string,
    options: WebhookVerificationOptions = {},
  ): Promise<boolean> {
    const tolerance = options.tolerance === undefined ? 300 : options.tolerance;
    if (!signature || !secret || (tolerance !== null && tolerance < 0)) return false;
    const parsed = parseSignature(signature);
    if (parsed === undefined) return false;
    if (options.timestampHeader !== undefined) {
      const timestampHeader = options.timestampHeader.trim();
      if (!/^\d+$/u.test(timestampHeader) || Number(timestampHeader) !== parsed.timestamp) {
        return false;
      }
    }
    const now = options.now ?? Math.floor(Date.now() / 1000);
    if (tolerance !== null && Math.abs(now - parsed.timestamp) > tolerance) return false;

    const body = bodyBytes(rawBody);
    const payload = concatBytes(encoder.encode(`${parsed.timestamp}.`), body);
    try {
      const key = await globalThis.crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );
      const expected = new Uint8Array(
        await globalThis.crypto.subtle.sign("HMAC", key, payload.slice().buffer),
      );
      return parsed.signatures.some((candidate) => constantTimeHexEqual(expected, candidate));
    } catch {
      return false;
    }
  }

  static async verifyOrThrow(
    rawBody: string | Uint8Array | ArrayBuffer,
    signature: string,
    secret: string,
    options: WebhookVerificationOptions = {},
  ): Promise<void> {
    if (!(await WebhookVerifier.verify(rawBody, signature, secret, options))) {
      throw new InvalidSignatureError("The ProxyRequest webhook signature is invalid or expired.");
    }
  }

  static async decodeVerifiedJson<Payload = Record<string, unknown>>(
    rawBody: string | Uint8Array | ArrayBuffer,
    signature: string,
    secret: string,
    options: WebhookVerificationOptions = {},
  ): Promise<Payload> {
    await WebhookVerifier.verifyOrThrow(rawBody, signature, secret, options);
    const text =
      typeof rawBody === "string" ? rawBody : new TextDecoder().decode(bodyBytes(rawBody));
    try {
      const payload: unknown = JSON.parse(text);
      if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
        throw new TypeError("The verified webhook payload must be a JSON object.");
      }
      return payload as Payload;
    } catch (error) {
      if (error instanceof TypeError) throw error;
      throw new TypeError("The verified webhook body is not valid JSON.", { cause: error });
    }
  }
}

function parseSignature(
  signature: string,
): { timestamp: number; signatures: string[] } | undefined {
  let timestamp: number | undefined;
  const signatures: string[] = [];
  for (const part of signature.split(",")) {
    const [key, value] = part.trim().split("=", 2);
    if (key === "t" && value !== undefined && /^\d+$/u.test(value)) timestamp = Number(value);
    if (key === "v1" && value !== undefined && /^[a-f\d]{64}$/iu.test(value)) {
      signatures.push(value.toLowerCase());
    }
  }
  if (timestamp === undefined || !Number.isSafeInteger(timestamp) || signatures.length === 0) {
    return undefined;
  }
  return { timestamp, signatures };
}

function bodyBytes(value: string | Uint8Array | ArrayBuffer): Uint8Array {
  if (typeof value === "string") return encoder.encode(value);
  return value instanceof Uint8Array ? value : new Uint8Array(value);
}

function concatBytes(left: Uint8Array, right: Uint8Array): Uint8Array {
  const result = new Uint8Array(left.byteLength + right.byteLength);
  result.set(left, 0);
  result.set(right, left.byteLength);
  return result;
}

function constantTimeHexEqual(expected: Uint8Array, candidate: string): boolean {
  if (!/^[a-f\d]+$/iu.test(candidate) || candidate.length !== expected.byteLength * 2) return false;
  let difference = 0;
  for (let index = 0; index < expected.byteLength; index += 1) {
    const byte = Number.parseInt(candidate.slice(index * 2, index * 2 + 2), 16);
    difference |= (expected[index] ?? 0) ^ byte;
  }
  return difference === 0;
}
