import { isLosslessNumber, parse } from "lossless-json";

/** Decode feed IDs before a native JSON parser can round their UInt64 values. */
export function parseFeedResponse(raw: string): unknown {
  const page = parse(raw, undefined, { onDuplicateKey: ({ newValue }) => newValue });
  if (!isObject(page) || !Array.isArray(page.results)) {
    throw new TypeError("Expected a feed response with a results array.");
  }
  for (const record of page.results) {
    if (!isObject(record)) throw new TypeError("Expected a feed record.");
    const id = isLosslessNumber(record.id) ? record.id.value : record.id;
    if (
      typeof id !== "string" ||
      !/^(0|[1-9]\d*)$/u.test(id) ||
      id.length > 20 ||
      (id.length === 20 && id > "18446744073709551615")
    ) {
      throw new TypeError("Expected a decimal UInt64 feed ID.");
    }
    record.id = id;
  }
  return nativeValues(page);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function nativeValues(value: unknown): unknown {
  if (isLosslessNumber(value)) return Number(value.value);
  if (Array.isArray(value)) return value.map(nativeValues);
  if (isObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, nativeValues(item)]),
    );
  }
  return value;
}
