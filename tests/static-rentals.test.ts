import { expect, expectTypeOf, it } from "vitest";
import { ProxyRequestClient } from "../src/index.js";

const orderId = "21040a7e-82de-4c46-80df-d3eb7c62b746";
const offerId = "ad416ba3-2913-4c84-8432-1468a67765b2";

it("reads a plain-text endpoint export with its order and protocol filters", async () => {
  const text = "socks5://test:example@192.0.2.1:1080";
  const client = ProxyRequestClient.withApiKey("synthetic", {
    fetch: async (input, init) => {
      const request = new Request(input, init);
      const url = new URL(request.url);
      expect(url.pathname).toBe("/api/v1/static/export");
      expect(url.searchParams.get("order_id")).toBe(orderId);
      expect(url.searchParams.get("protocol")).toBe("socks5");
      return new Response(text, { headers: { "Content-Type": "text/plain" } });
    },
  });
  const result = await client.staticProxies.exportUrls({ orderId, protocol: "socks5" });
  expectTypeOf(result).toEqualTypeOf<string>();
  expect(result).toBe(text);
});

it("reuses a legacy purchase key for the header and preserves the error code", async () => {
  const requestBody = { offer_id: offerId, idempotency_key: "automation-test" };
  const client = ProxyRequestClient.withApiKey("synthetic", {
    fetch: async (input, init) => {
      const request = new Request(input, init);
      expect(request.headers.get("Idempotency-Key")).toBe(requestBody.idempotency_key);
      expect(await request.json()).toEqual(requestBody);
      return Response.json({ code: "idempotency_conflict" }, { status: 409 });
    },
  });
  await expect(client.orders.reserve({ body: requestBody })).rejects.toMatchObject({
    code: "idempotency_conflict",
    idempotencyKey: requestBody.idempotency_key,
  });
});

it.each([200, 202])("returns HTTP %i for shared and provider password resets", async (status) => {
  const endpointId = status === 202 ? "78b4ccde-49a7-4e1d-99ce-b56b875d8a11" : undefined;
  const client = ProxyRequestClient.withApiKey("synthetic", {
    fetch: async (input, init) => {
      const request = new Request(input, init);
      const url = new URL(request.url);
      expect(request.method).toBe("POST");
      expect(url.pathname).toBe(`/api/v1/orders/${orderId}/proxy-password/reset`);
      expect(url.searchParams.get("endpoint_id")).toBe(endpointId ?? null);
      return Response.json({ success: true, message: "ok" }, { status });
    },
  });
  const response = await client.orders.resetProxyPasswordWithResponse({
    id: orderId,
    ...(endpointId ? { endpointId } : {}),
  });
  expect(response.statusCode).toBe(status);
  expect(response.data.success).toBe(true);
});
