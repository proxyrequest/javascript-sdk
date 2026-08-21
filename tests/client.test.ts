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

  it("keeps Telegram service auth explicit and isolated", async () => {
    let request: Request | undefined;
    const client = ProxyRequestClient.anonymous({
      fetch: async (input, init) => {
        request = new Request(input, init);
        return Response.json({
          access: "token",
          expires_in: 60,
          locale: "en",
          timezone: "UTC",
          user: {},
        });
      },
    });

    await client.telegramService.createSession({
      serviceSecret: "telegram-secret",
      body: { chat_id: 10, telegram_user_id: 20 },
    });

    expect(request?.headers.get("x-proxyrequest-telegram-secret")).toBe("telegram-secret");
    expect(request?.headers.get("authorization")).toBeNull();
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
});
