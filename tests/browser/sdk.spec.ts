import { createHmac } from "node:crypto";
import { expect, test } from "@playwright/test";

test("the ESM package works in a real browser", async ({ page }) => {
  await page.route("https://api.proxyrequest.com/api/v1/users**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ count: 0, next: null, previous: null, results: [] }),
    });
  });
  await page.goto("/");
  await expect(page.locator("#status")).toHaveText("ready");

  const body = '{"event":"browser.test"}';
  const timestamp = 1_700_000_000;
  const secret = "browser-webhook-secret";
  const digest = createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
  const result = await page.evaluate(
    async ({ body, digest, secret, timestamp }) => {
      const sdk = globalThis.ProxyRequestSDK;
      const client = sdk.ProxyRequestClient.withBearerToken("browser-token");
      const users = await client.users.list({ limit: 5 });
      const webhook = await sdk.WebhookVerifier.verify(
        body,
        `t=${timestamp},v1=${digest}`,
        secret,
        { now: timestamp },
      );
      return { users: users.results.length, webhook };
    },
    { body, digest, secret, timestamp },
  );

  expect(result).toEqual({ users: 0, webhook: true });
});

declare global {
  var ProxyRequestSDK: typeof import("../../src/index.js");
}
