import { readFile } from "node:fs/promises";
import { describe, expect, expectTypeOf, it } from "vitest";
import { ApiError, ProxyRequestClient } from "../src/index.js";
import type { FeedRecord } from "../src/models.js";

const rawFeed = await readFile(
  new URL("./fixtures/analytics-large-ids.json", import.meta.url),
  "utf8",
);
const ids = [
  "8225019678087993781",
  "8582995425791120069",
  "11786186255824559223",
  "11955258968888601365",
  "10676923133690694393",
  "10740450019316915015",
  "0",
  "9007199254740991",
  "9007199254740992",
  "9223372036854775807",
  "9223372036854775808",
  "18446744073709551615",
];
const dates = [
  "2026-07-01T00:00:00Z",
  "2026-07-01T03:04:59.123+03:00",
  "2026-07-01T00:00:00",
  "2026-07-01 00:00:00",
  "01-07-2026 00:00:00",
  "2026-07-01",
  "01-07-2026",
  "1782864000",
  "1782864000.5",
  1782864000,
  1782864000.5,
  0,
];

function mocked(body = rawFeed) {
  const requests: Request[] = [];
  const client = ProxyRequestClient.anonymous({
    fetch: async (input, init) => {
      requests.push(new Request(input, init));
      return new Response(body, {
        headers: { "Content-Type": "application/json", "X-Request-ID": "analytics" },
      });
    },
  });
  return { client, requests };
}

describe("analytics compatibility", () => {
  it.each([false, true])("preserves raw UInt64 IDs (metadata: %s)", async (metadata) => {
    const { client } = mocked();
    const response = await client.analytics.listFeedWithResponse();
    const page = metadata ? response.data : await client.analytics.listFeed();
    expectTypeOf<FeedRecord["id"]>().toEqualTypeOf<string>();
    expect(page.results.map((row) => row.id)).toEqual(ids);
    expect(JSON.parse(JSON.stringify(page)).results.map((row: FeedRecord) => row.id)).toEqual(ids);
    expect(response.statusCode).toBe(200);
    expect(response.headers["x-request-id"]).toBe("analytics");
    expect(typeof page.count).toBe("number");
    expect(typeof page.results[0]?.data).toBe("number");
  });

  it("preserves IDs through pagination", async () => {
    const { client } = mocked();
    const records = [];
    for await (const row of client.paginate((params) => client.analytics.listFeed(params)))
      records.push(row.id);
    expect(records).toEqual(ids);
  });

  it.each(dates)("passes date input %s through every analytics operation", async (value) => {
    const { client, requests } = mocked();
    const options = { start: value, end: value, timezone: "Europe/Kiev" };
    await client.analytics.listFeed(options);
    await client.analytics.listDomains(options);
    await client.analytics.listLogs(options);
    await client.analytics.getOverall(options);
    await client.analytics.getTransactions({ id: "customer", ...options });
    for (const request of requests) {
      const params = new URL(request.url).searchParams;
      expect(params.get("start")).toBe(String(value));
      expect(params.get("end")).toBe(String(value));
      expect(params.get("timezone")).toBe("Europe/Kiev");
    }
  });

  it("preserves omitted dates, legacy hostname and boolean filters", async () => {
    const { client, requests } = mocked();
    await client.analytics.listLogs({ hostname: "example.com" });
    const params = new URL(requests[0]?.url ?? "").searchParams;
    expect(params.get("hostname")).toBe("example.com");
    expect(params.has("start")).toBe(false);
    expect(params.has("end")).toBe(false);
    const hostname = "https://example.com:443/path,192.0.2.1,[2001:db8::1]:80";
    for (const include of [false, true]) {
      await client.analytics.listDomains({ hostname, includeSubUsers: include });
      const query = new URL(requests.at(-1)?.url ?? "").searchParams;
      expect(query.get("hostname")).toBe(hostname);
      expect(query.get("include_sub_users")).toBe(String(include));
    }
  });

  it("does not invent a domain timestamp", async () => {
    const { client } = mocked(
      '{"next":null,"previous":null,"timezone":"UTC","start":"2026-07-01T00:00:00Z","end":"2026-07-02T00:00:00Z","results":[{"hostname":"example.com","requests":1,"data":10}]}',
    );
    expect((await client.analytics.listDomains()).results[0]).toEqual({
      hostname: "example.com",
      requests: 1,
      data: 10,
    });
  });

  it.each(['{"results":', '{"results":[{"id":18446744073709551616}]}'])(
    "reports invalid feed data without retrying",
    async (body) => {
      const { client, requests } = mocked(body);
      await expect(client.analytics.listFeed()).rejects.toBeInstanceOf(ApiError);
      expect(requests).toHaveLength(1);
    },
  );
});
