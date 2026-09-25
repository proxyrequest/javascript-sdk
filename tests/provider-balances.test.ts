import { readFile } from "node:fs/promises";
import { describe, expect, expectTypeOf, it } from "vitest";
import { ApiError, ProxyRequestClient } from "../src/index.js";
import type { PaginatedProviderDataBalanceList, ProviderDataBalance } from "../src/models.js";

const fixtures: Record<string, PaginatedProviderDataBalanceList> = JSON.parse(
  await readFile(new URL("./fixtures/provider-balances.json", import.meta.url), "utf8"),
);

describe("provider balances", () => {
  it.each(["fresh", "stale", "unavailable", "empty"])(
    "preserves the %s response",
    async (variant) => {
      const payload = fixtures[variant];
      const client = ProxyRequestClient.anonymous({ fetch: async () => Response.json(payload) });
      const response = await client.providers.listDataBalancesWithResponse();
      expect(response.statusCode).toBe(200);
      expect(response.data).toEqual(payload);
      expect(await client.providers.listDataBalances()).toEqual(payload);
      expectTypeOf<ProviderDataBalance["available_bytes"]>().toEqualTypeOf<string>();
      expectTypeOf<ProviderDataBalance["remaining_bytes"]>().toEqualTypeOf<string | null>();
      expect(JSON.parse(JSON.stringify(response.data))).toEqual(payload);
    },
  );

  it.each(["Static", "Bearer"])(
    "applies %s authentication and pagination parameters",
    async (scheme) => {
      const requests: Request[] = [];
      const options = {
        fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
          requests.push(new Request(input, init));
          return Response.json(fixtures.empty);
        },
      };
      const client =
        scheme === "Static"
          ? ProxyRequestClient.withApiKey("superuser-key", options)
          : ProxyRequestClient.withBearerToken("superuser-key", options);
      await client.providers.listDataBalances({ limit: 5, offset: 10 });
      const request = requests[0];
      expect(request?.url).toBe(
        "https://api.proxyrequest.com/api/v1/providers/data-balances?limit=5&offset=10",
      );
      expect(request?.headers.get("authorization")).toBe(`${scheme} superuser-key`);
    },
  );

  it("paginates providers without flattening checkpoint history", async () => {
    const offsets: string[] = [];
    const client = ProxyRequestClient.anonymous({
      fetch: async (input, init) => {
        const offset = new URL(new Request(input, init).url).searchParams.get("offset") ?? "0";
        offsets.push(offset);
        return Response.json({
          ...fixtures.fresh,
          count: 2,
          next:
            offset === "0"
              ? "https://api.proxyrequest.com/api/v1/providers/data-balances?limit=1&offset=1"
              : null,
        });
      },
    });
    const rows = [];
    for await (const row of client.paginate((params) => client.providers.listDataBalances(params), {
      limit: 1,
    }))
      rows.push(row);
    expect(offsets).toEqual(["0", "1"]);
    expect(rows).toHaveLength(2);
    expect(rows[0]?.history).toHaveLength(2);
  });

  it.each([401, 403])("normalizes HTTP %s", async (status) => {
    const client = ProxyRequestClient.anonymous({
      fetch: async () => Response.json({ detail: "Access denied" }, { status }),
    });
    await expect(client.providers.listDataBalances()).rejects.toMatchObject({ statusCode: status });
    await expect(client.providers.listDataBalances()).rejects.toBeInstanceOf(ApiError);
  });
});

it.each([undefined, false, true])(
  "serializes include_asns=%s for all six location methods",
  async (includeAsns) => {
    const requests: Request[] = [];
    const client = ProxyRequestClient.anonymous({
      fetch: async (input, init) => {
        requests.push(new Request(input, init));
        return Response.json({});
      },
    });
    for (const method of [
      "listCities",
      "listCountries",
      "listRegions",
      "getCity",
      "getCountry",
      "getRegion",
    ] as const) {
      await client.locations[method]({
        packageId: "package",
        id: "location",
        ...(includeAsns === undefined ? {} : { includeAsns }),
      });
    }
    expect(requests).toHaveLength(6);
    for (const request of requests) {
      expect(new URL(request.url).searchParams.get("include_asns")).toBe(
        includeAsns === undefined ? null : String(includeAsns),
      );
    }
  },
);
