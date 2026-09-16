import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { InvalidSignatureError, WebhookVerifier } from "../src/index.js";

const vectors = JSON.parse(
  readFileSync(new URL("./fixtures/webhook-signatures.json", import.meta.url), "utf8"),
) as {
  body: string;
  secret: string;
  signature: string;
  jsonObject: boolean;
}[];

describe("accountant X-Signature (Base64 HMAC over raw bytes)", () => {
  for (const vector of vectors) {
    it(`verifies the shared raw-body vector: ${JSON.stringify(vector.body)}`, async () => {
      const { body, secret, signature, jsonObject } = vector;
      expect(createHmac("sha256", secret).update(body).digest("base64")).toBe(signature);
      for (const raw of [
        body,
        new TextEncoder().encode(body),
        new TextEncoder().encode(body).buffer,
      ]) {
        expect(await WebhookVerifier.verify(raw, signature, secret)).toBe(true);
        await WebhookVerifier.verifyOrThrow(raw, signature, secret);
      }
      expect(await WebhookVerifier.verify(`${body} `, signature, secret)).toBe(false);
      expect(await WebhookVerifier.verify(body, signature, "wrong")).toBe(false);
      if (jsonObject) {
        expect(await WebhookVerifier.decodeVerifiedJson(body, signature, secret)).toEqual(
          JSON.parse(body),
        );
      } else {
        await expect(
          WebhookVerifier.decodeVerifiedJson(body, signature, secret),
        ).rejects.toBeInstanceOf(TypeError);
      }
    });
  }
  it("rejects malformed, noncanonical, wrong-length and empty signatures before decoding", async () => {
    const vector = vectors[0];
    if (vector === undefined) throw new Error("Missing webhook fixture");
    for (const signature of [
      "",
      " ",
      vector.signature.trimEnd().slice(0, -1),
      `${vector.signature}\n`,
      vector.signature.replace("8=", "9="),
      "A".repeat(44),
      "A".repeat(64),
    ]) {
      expect(await WebhookVerifier.verify(vector.body, signature, vector.secret)).toBe(false);
      await expect(
        WebhookVerifier.decodeVerifiedJson("not json", signature, vector.secret),
      ).rejects.toBeInstanceOf(InvalidSignatureError);
    }
    expect(await WebhookVerifier.verify(vector.body, vector.signature, "")).toBe(false);
  });
});
