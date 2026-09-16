import { expect, it } from "vitest";
import { ProxyRequestClient } from "../src/index.js";

it("resets a package without an amount and reuses the key on retry", async () => {
  const requests: Request[] = [];
  const client = ProxyRequestClient.withApiKey("secret", {
    fetch: async (input, init) => {
      requests.push(new Request(input, init));
      if (requests.length === 1) throw new TypeError("connection reset");
      return Response.json({ data_remaining: 0 }, { status: 202 });
    },
  });
  const response = await client.users.resetDataWithResponse({
    id: "customer",
    body: { package_id: "78b4ccde-49a7-4e1d-99ce-b56b875d8a11" },
  });
  expect(response.statusCode).toBe(202);
  expect(response.data.data_remaining).toBe(0);
  expect(requests).toHaveLength(2);
  const key = requests[0]?.headers.get("Idempotency-Key");
  expect(key).toBeTruthy();
  for (const request of requests) {
    expect(request.method).toBe("POST");
    expect(new URL(request.url).pathname).toBe("/api/v1/users/customer/data/reset");
    expect(await request.json()).toEqual({ package_id: "78b4ccde-49a7-4e1d-99ce-b56b875d8a11" });
    expect(request.headers.get("Idempotency-Key")).toBe(key);
  }
});
