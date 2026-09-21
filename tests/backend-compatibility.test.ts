import { readFile } from "node:fs/promises";
import { describe, expect, expectTypeOf, it } from "vitest";
import { ProxyRequestClient } from "../src/index.js";
import type {
  Invoice,
  InvoiceCreateRequestRequest,
  InvoiceGatewayEnum,
  InvoiceShort,
  OTPChallenge,
  TokenPairResponse,
  User,
} from "../src/models.js";

const fixtures = JSON.parse(
  await readFile(new URL("./fixtures/backend-responses.json", import.meta.url), "utf8"),
);
const analytics = JSON.parse(
  await readFile(new URL("./fixtures/analytics-responses.json", import.meta.url), "utf8"),
);
const challenge = { status: "otp_required", challenge: "synthetic-challenge", expires_in: 300 };
const tokens = { token: "synthetic-access", refresh: "synthetic-refresh" };

function mocked(responses: Response[]) {
  const requests: Request[] = [];
  const client = ProxyRequestClient.anonymous({
    fetch: async (input, init) => {
      requests.push(new Request(input, init));
      const response = responses.shift();
      if (!response) throw new Error("Unexpected request");
      return response;
    },
  });
  return { client, requests };
}

describe("backend compatibility", () => {
  it.each(["feed", "domains"] as const)(
    "decodes backend analytics/%s responses",
    async (endpoint) => {
      for (const variant of ["first", "last", "empty"]) {
        const payload = analytics[`${endpoint}_${variant}`];
        const { client, requests } = mocked([Response.json(payload)]);
        const page = await (endpoint === "feed"
          ? client.analytics.listFeed({ limit: 1 })
          : client.analytics.listDomains({ limit: 1 }));
        expect(page).toEqual(
          endpoint === "feed"
            ? {
                ...payload,
                results: payload.results.map((row: { id: number }) => ({
                  ...row,
                  id: String(row.id),
                })),
              }
            : payload,
        );
        expect(page.start).toBe("2026-09-20T12:00:00+03:00");
        if (endpoint === "domains") expect(page).not.toHaveProperty("count");
        expect(new URL(requests[0]?.url ?? "").pathname).toBe(`/api/v1/analytics/${endpoint}`);
      }
    },
  );

  it.each(["feed", "domains"] as const)(
    "paginates backend analytics/%s responses",
    async (endpoint) => {
      const payloads = [analytics[`${endpoint}_first`], analytics[`${endpoint}_last`]];
      const { client, requests } = mocked(payloads.map((payload) => Response.json(payload)));
      const pages =
        endpoint === "feed"
          ? client.paginate((params) => client.analytics.listFeed(params), { limit: 1 })
          : client.paginate((params) => client.analytics.listDomains(params), { limit: 1 });
      const records = [];
      for await (const item of pages) records.push(item);
      expect(records).toEqual(
        payloads
          .flatMap((page) => page.results)
          .map((row) => (endpoint === "feed" ? { ...row, id: String(row.id) } : row)),
      );
      expect(requests.map((request) => new URL(request.url).searchParams.get("offset"))).toEqual([
        "0",
        "1",
      ]);
    },
  );

  it.each([false, true])("completes OTP login (Google: %s)", async (google) => {
    const { client, requests } = mocked([
      Response.json(challenge, { status: 202 }),
      Response.json(tokens),
    ]);
    const login = await (google
      ? client.authorization.loginWithGoogle({ body: { credential: "synthetic" } })
      : client.authorization.login({ body: { email: "sdk@example.com", password: "synthetic" } }));
    expectTypeOf(login).toEqualTypeOf<TokenPairResponse | OTPChallenge>();
    expect(login).toEqual(challenge);
    if (!("challenge" in login)) throw new Error("Expected OTP challenge");
    const verified = await client.authorization.verifyOtp({
      body: { challenge: login.challenge, code: "123456" },
    });
    expect(verified).toEqual(tokens);
    expect(requests[1]?.url).toContain("/login/otp");
    expect(await requests[1]?.json()).toEqual({ challenge: challenge.challenge, code: "123456" });
  });

  it("sends primary-factor data for MFA setup and disable", async () => {
    const { client, requests } = mocked([
      Response.json({ secret: "synthetic", otpauth_url: "otpauth://totp/sdk" }),
      Response.json({ enabled: false }),
    ]);
    await client.profile.setupTwoFactor({ body: { password: "synthetic", code: "123456" } });
    await client.profile.disableTwoFactor({
      body: { credential: "synthetic-google", code: "123456" },
    });
    expect(await requests[0]?.json()).toEqual({ password: "synthetic", code: "123456" });
    expect(await requests[1]?.json()).toEqual({ credential: "synthetic-google", code: "123456" });
  });

  it("supports nullable invoices, configuration variants and new payment fields", async () => {
    const full: Invoice = fixtures.invoice_full;
    const short: InvoiceShort = fixtures.invoice_short;
    const user: User = fixtures.user_package;
    const gateway: InvoiceGatewayEnum = "future-provider";
    expectTypeOf<Invoice["package"]>().toBeNullable();
    expectTypeOf<User["data"]>().toBeNullable();
    const { client, requests } = mocked([
      Response.json({ ...full, gateway }, { status: 201 }),
      Response.json(short),
      Response.json(user),
    ]);
    const body: InvoiceCreateRequestRequest = {
      gateway: "whitepay",
      amount: 500,
      payment_currency: "UAH",
      status: "paid",
    };
    const created = await client.invoices.create({ body });
    expect(created.package).toBeNull();
    expect(created.payment_amount).toBe(500);
    expect(created.gateway).toBe(gateway);
    expect(await requests[0]?.json()).toMatchObject(body);
    if (!short.id) throw new Error("Fixture invoice must have an id");
    expect(await client.invoices.get({ id: short.id })).toEqual(short);
    expect((await client.profile.get()).orders).toEqual([]);
    expect(client).not.toHaveProperty("sessions");
  });
});
