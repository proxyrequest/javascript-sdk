import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { InvalidSignatureError, WebhookVerifier } from "../src/index.js";

describe("WebhookVerifier", () => {
  const body = '{"event":"proxy.updated"}';
  const secret = "webhook-secret";
  const timestamp = 1_700_000_000;
  const digest = createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");

  it("verifies the exact body, timestamp header and any valid v1 signature", async () => {
    await expect(
      WebhookVerifier.verify(body, `t=${timestamp},v1=${"0".repeat(64)},v1=${digest}`, secret, {
        timestampHeader: String(timestamp),
        now: timestamp + 10,
      }),
    ).resolves.toBe(true);
  });

  it("rejects tampering and expired signatures", async () => {
    await expect(
      WebhookVerifier.verify(`${body} `, `t=${timestamp},v1=${digest}`, secret, { now: timestamp }),
    ).resolves.toBe(false);
    await expect(
      WebhookVerifier.verify(body, `t=${timestamp},v1=${digest}`, secret, { now: timestamp + 301 }),
    ).resolves.toBe(false);
  });

  it("verifies before decoding JSON", async () => {
    await expect(
      WebhookVerifier.decodeVerifiedJson<{ event: string }>(
        body,
        `t=${timestamp},v1=${digest}`,
        secret,
        { now: timestamp },
      ),
    ).resolves.toEqual({ event: "proxy.updated" });
    await expect(
      WebhookVerifier.verifyOrThrow(body, `t=${timestamp},v1=${"1".repeat(64)}`, secret, {
        now: timestamp,
      }),
    ).rejects.toBeInstanceOf(InvalidSignatureError);
  });
});
