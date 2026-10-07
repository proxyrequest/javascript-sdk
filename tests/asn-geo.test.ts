import { expect, expectTypeOf, it } from "vitest";
import { ProxyRequestClient } from "../src/index.js";
import type { LocationASNRecord } from "../src/models.js";

it.each([undefined, false, true])(
  "requests ASN geography only when includeGeo=%s",
  async (includeGeo) => {
    const requests: Request[] = [];
    const client = ProxyRequestClient.anonymous({
      fetch: async (input, init) => {
        const request = new Request(input, init);
        requests.push(request);
        const geo =
          new URL(request.url).searchParams.get("include_geo") === "true"
            ? [{ country: { code: "us", name: "United States" } }]
            : [];
        return Response.json({
          count: 1,
          next: null,
          previous: null,
          results: [{ code: "7922", name: "Example ASN", country_codes: ["us"], geo }],
        });
      },
    });

    const page = await client.locations.listAsns({
      packageId: "550e8400-e29b-41d4-a716-446655440002",
      ...(includeGeo === undefined ? {} : { includeGeo }),
    });
    expect(requests).toHaveLength(1);
    expect(
      new URL(requests[0]?.url ?? "https://missing.invalid").searchParams.get("include_geo"),
    ).toBe(includeGeo === undefined ? null : String(includeGeo));
    expect(page.results[0]?.country_codes).toEqual(["us"]);
    expect(page.results[0]?.geo).toHaveLength(includeGeo ? 1 : 0);
    expectTypeOf<LocationASNRecord["country_codes"]>().toEqualTypeOf<string[]>();
  },
);
