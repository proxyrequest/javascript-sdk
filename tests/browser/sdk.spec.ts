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
  const secret = "browser-webhook-secret";
  const base64 = createHmac("sha256", secret).update(body).digest("base64");
  const result = await page.evaluate(
    async ({ body, secret, base64 }) => {
      const sdk = globalThis.ProxyRequestSDK;
      const client = sdk.ProxyRequestClient.withBearerToken("browser-token");
      const users = await client.users.list({ limit: 5 });
      const webhook = await sdk.WebhookVerifier.verify(body, base64, secret);
      const modified = await sdk.WebhookVerifier.verify(`${body} `, base64, secret);
      return { users: users.results.length, webhook, modified };
    },
    { body, secret, base64 },
  );

  expect(result).toEqual({ users: 0, webhook: true, modified: false });
});

declare global {
  var ProxyRequestSDK: typeof import("../../src/index.js");
}
