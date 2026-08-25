import { describe, expect, it, vi } from "vitest";
import { ApiError, FileDownload, ProxyRequestClient } from "../src/index.js";

describe("ProxyRequestClient", () => {
  it("applies Static auth, language, path parameters and query parameters", async () => {
    const requests: Request[] = [];
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = new Request(input, init);
      requests.push(request);
      return Response.json({ count: 0, next: null, previous: null, results: [] });
    });
    const client = ProxyRequestClient.withApiKey("static-secret", {
      fetch: fetchMock,
      language: "uk",
    });

    await client.users.list({ limit: 25, packageId: "78b4ccde-49a7-4e1d-99ce-b56b875d8a11" });

    expect(fetchMock).toHaveBeenCalledOnce();
    const request = requests[0];
    expect(request?.url).toContain("/api/v1/users");
    expect(request?.url).toContain("limit=25");
    expect(request?.url).toContain("package__id=78b4ccde-49a7-4e1d-99ce-b56b875d8a11");
    expect(request?.headers.get("authorization")).toBe("Static static-secret");
    expect(request?.headers.get("accept-language")).toBe("uk");
  });

  it("supports Bearer and anonymous clients without leaking credentials", async () => {
    const authorizations: Array<string | null> = [];
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = new Request(input, init);
      authorizations.push(request.headers.get("authorization"));
      return Response.json({ ok: true });
    });

    await ProxyRequestClient.withBearerToken("access-token", { fetch: fetchMock }).settings.get();
    await ProxyRequestClient.anonymous({ fetch: fetchMock }).settings.get();

    expect(authorizations).toEqual(["Bearer access-token", null]);
  });

  it("returns invoice downloads as a universal FileDownload", async () => {
    const client = ProxyRequestClient.withApiKey("secret", {
      fetch: async () =>
        new Response(new TextEncoder().encode("pdf"), {
          headers: {
            "content-type": "application/pdf",
            "content-disposition": "attachment; filename=invoice-42.pdf",
          },
        }),
    });

    const download = await client.downloadInvoicePdf("42");

    expect(download).toBeInstanceOf(FileDownload);
    expect(download.filename).toBe("invoice-42.pdf");
    expect(download.contentType).toBe("application/pdf");
    expect(download.text()).toBe("pdf");
  });

  it("normalizes API and transport failures", async () => {
    const apiClient = ProxyRequestClient.withApiKey("secret", {
      fetch: async () =>
        Response.json(
          { detail: "Slow down", limit: ["Too many requests"] },
          {
            status: 429,
            headers: {
              "retry-after": "12",
              "x-request-id": "request-123",
              "content-language": "en",
            },
          },
        ),
    });

    await expect(apiClient.users.list()).rejects.toMatchObject({
      name: "ApiError",
      kind: "rate_limit",
      statusCode: 429,
      detail: "Slow down",
      retryAfter: 12,
      requestId: "request-123",
      fieldErrors: { limit: ["Too many requests"] },
    });

    const networkClient = ProxyRequestClient.anonymous({
      fetch: async () => {
        throw new TypeError("offline");
      },
    });
    await expect(networkClient.settings.get()).rejects.toBeInstanceOf(ApiError);
    await expect(networkClient.settings.get()).rejects.toMatchObject({ kind: "network" });
  });

  it("provides a raw request escape hatch with the configured transport", async () => {
    let request: Request | undefined;
    const client = ProxyRequestClient.withApiKey("secret", {
      fetch: async (input, init) => {
        request = new Request(input, init);
        return Response.json({ accepted: true });
      },
    });

    const response = await client.request("POST", "/custom/action", {
      query: { include: ["one", "two"] },
      body: { hello_world: true },
    });

    expect(await response.json()).toEqual({ accepted: true });
    expect(request?.url).toContain("include=one&include=two");
    expect(request?.headers.get("authorization")).toBe("Static secret");
    expect(await request?.json()).toEqual({ hello_world: true });
  });

  it("validates base URLs and timeout values", () => {
    expect(() => new ProxyRequestClient({ baseUrl: "ftp://example.com" })).toThrow(
      /http or https/u,
    );
    expect(() => new ProxyRequestClient({ timeoutMs: -1 })).toThrow(RangeError);
  });

  it("adds idempotency keys only to supported mutations by default", async () => {
    const requests: Request[] = [];
    const client = ProxyRequestClient.withApiKey("secret", {
      fetch: async (input, init) => {
        requests.push(new Request(input, init));
        return Response.json({});
      },
    });

    await client.invoices.create({ body: { gateway: "manual" } });
    await client.apiKeys.create();
    await client.settings.get();

    expect(requests[0]?.headers.get("idempotency-key")).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u,
    );
    expect(requests[1]?.headers.get("idempotency-key")).toBeNull();
    expect(requests[2]?.headers.get("idempotency-key")).toBeNull();
  });

  it("reuses one key for ambiguous retries and returns response metadata", async () => {
    const keys: Array<string | null> = [];
    let attempt = 0;
    const client = ProxyRequestClient.withApiKey("secret", {
      fetch: async (input, init) => {
        const request = new Request(input, init);
        keys.push(request.headers.get("idempotency-key"));
        attempt += 1;
        if (attempt === 1) throw new TypeError("connection reset");
        if (attempt === 2) {
          return Response.json(
            { detail: "Still in progress." },
            { status: 409, headers: { "Retry-After": "0" } },
          );
        }
        return Response.json(
          { id: "invoice-1" },
          {
            status: 201,
            headers: { ETag: '"invoice-v1"', "Idempotency-Replayed": "true" },
          },
        );
      },
    });

    const response = await client.invoices.createWithResponse({
      body: { gateway: "manual" },
      idempotencyKey: "invoice-checkout-1",
    });

    expect(keys).toEqual(["invoice-checkout-1", "invoice-checkout-1", "invoice-checkout-1"]);
    expect(response.statusCode).toBe(201);
    expect(response.etag).toBe('"invoice-v1"');
    expect(response.idempotencyReplayed).toBe(true);
  });

  it("does not retry ordinary server errors", async () => {
    let attempts = 0;
    const client = ProxyRequestClient.withApiKey("secret", {
      fetch: async () => {
        attempts += 1;
        return Response.json({ detail: "Unavailable" }, { status: 500 });
      },
    });

    await expect(
      client.invoices.create({
        body: { gateway: "manual" },
        idempotencyKey: "invoice-no-retry",
      }),
    ).rejects.toMatchObject({
      kind: "server",
      idempotencyKey: "invoice-no-retry",
    });
    expect(attempts).toBe(1);
  });

  it("can disable automatic keys while preserving explicit keys", async () => {
    const keys: Array<string | null> = [];
    const client = ProxyRequestClient.withApiKey("secret", {
      idempotency: false,
      fetch: async (input, init) => {
        const request = new Request(input, init);
        keys.push(request.headers.get("idempotency-key"));
        return Response.json({}, { status: 201 });
      },
    });

    await client.invoices.create({ body: { gateway: "manual" } });
    await client.invoices.create({
      body: { gateway: "manual" },
      idempotencyKey: "manual-key",
    });

    expect(keys).toEqual([null, "manual-key"]);
  });

  it("sends If-Match and classifies 412 responses", async () => {
    let ifMatch: string | null = null;
    const client = ProxyRequestClient.withApiKey("secret", {
      fetch: async (input, init) => {
        ifMatch = new Request(input, init).headers.get("if-match");
        return Response.json(
          { detail: "The resource changed." },
          { status: 412, headers: { ETag: '"user-v2"' } },
        );
      },
    });

    await expect(
      client.users.update({
        id: "00000000-0000-4000-8000-000000000001",
        ifMatch: '"user-v1"',
        body: { first_name: "Ada" },
      }),
    ).rejects.toMatchObject({ kind: "precondition", currentEtag: '"user-v2"' });
    expect(ifMatch).toBe('"user-v1"');
  });
});
