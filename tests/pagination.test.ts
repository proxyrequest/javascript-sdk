import { describe, expect, it } from "vitest";
import { PaginationError, paginate } from "../src/index.js";

describe("paginate", () => {
  it("is lazy and follows API offsets", async () => {
    const calls: number[] = [];
    const iterator = paginate(
      async ({ offset }) => {
        calls.push(offset);
        return offset === 0
          ? { results: [1, 2], next: "https://api.proxyrequest.com/users?offset=2" }
          : { results: [3], next: null };
      },
      { limit: 2 },
    );

    expect(calls).toEqual([]);
    const values: number[] = [];
    for await (const value of iterator) values.push(value);
    expect(values).toEqual([1, 2, 3]);
    expect(calls).toEqual([0, 2]);
  });

  it("rejects repeated next URLs and invalid limits", async () => {
    const iterator = paginate(async () => ({ results: [1], next: "/users?offset=1" }));
    await expect(async () => {
      for await (const _value of iterator) {
        // Drain the iterator.
      }
    }).rejects.toBeInstanceOf(PaginationError);

    const invalid = paginate(async () => ({ results: [], next: null }), { limit: 0 });
    await expect(invalid.next()).rejects.toBeInstanceOf(RangeError);
  });
});
