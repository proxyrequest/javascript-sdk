import { InvalidSignatureError } from "./errors.js";

const encoder = new TextEncoder();

export class WebhookVerifier {
  /** Verify X-Signature against the exact raw request body. */
  static async verify(
    rawBody: string | Uint8Array | ArrayBuffer,
    signature: string,
    secret: string,
  ): Promise<boolean> {
    if (!signature || !secret) return false;
    const candidate = parseBase64Signature(signature);
    if (candidate === undefined) return false;

    try {
      const key = await globalThis.crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"],
      );
      return globalThis.crypto.subtle.verify(
        "HMAC",
        key,
        candidate.slice().buffer,
        bodyBytes(rawBody).slice().buffer,
      );
    } catch {
      return false;
    }
  }

  static async verifyOrThrow(
    rawBody: string | Uint8Array | ArrayBuffer,
    signature: string,
    secret: string,
  ): Promise<void> {
    if (!(await WebhookVerifier.verify(rawBody, signature, secret))) {
      throw new InvalidSignatureError("The ProxyRequest webhook signature is invalid.");
    }
  }

  static async decodeVerifiedJson<Payload = Record<string, unknown>>(
    rawBody: string | Uint8Array | ArrayBuffer,
    signature: string,
    secret: string,
  ): Promise<Payload> {
    await WebhookVerifier.verifyOrThrow(rawBody, signature, secret);
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

function bodyBytes(value: string | Uint8Array | ArrayBuffer): Uint8Array {
  if (typeof value === "string") return encoder.encode(value);
  return value instanceof Uint8Array ? value : new Uint8Array(value);
}

function parseBase64Signature(signature: string): Uint8Array | undefined {
  if (!/^[A-Za-z0-9+/]{43}=$/u.test(signature)) return undefined;
  const decoded = atob(signature);
  if (decoded.length !== 32 || btoa(decoded) !== signature) return undefined;
  return Uint8Array.from(decoded, (character) => character.charCodeAt(0));
}
