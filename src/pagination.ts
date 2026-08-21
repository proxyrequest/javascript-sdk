import { PaginationError } from "./errors.js";

export interface PageParameters {
  limit: number;
  offset: number;
}

export interface PaginatedPage<Item> {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results: Item[];
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
  maxPages?: number;
}

export async function* paginate<Item>(
  pageFetcher: (parameters: PageParameters) => Promise<PaginatedPage<Item>>,
  options: PaginationOptions = {},
): AsyncGenerator<Item, void, undefined> {
  const limit = options.limit ?? 100;
  let offset = options.offset ?? 0;
  const maxPages = options.maxPages ?? 10_000;
  if (limit <= 0 || offset < 0 || maxPages <= 0) {
    throw new RangeError("limit and maxPages must be positive; offset must not be negative.");
  }

  const visited = new Set<string>();
  for (let pageNumber = 0; pageNumber < maxPages; pageNumber += 1) {
    const page = await pageFetcher({ limit, offset });
    if (!Array.isArray(page.results)) {
      throw new PaginationError("A page object must expose an array in results.");
    }
    yield* page.results;
    if (page.next === null || page.next === undefined) return;
    if (visited.has(page.next)) {
      throw new PaginationError("Pagination stopped because the API returned a repeated next URL.");
    }
    visited.add(page.next);
    const nextOffset = offsetFromUrl(page.next);
    offset = nextOffset ?? offset + page.results.length;
    if (page.results.length === 0 && nextOffset === undefined) {
      throw new PaginationError("Pagination cannot advance from an empty page.");
    }
  }
  throw new PaginationError("Pagination stopped after the configured maximum number of pages.");
}

function offsetFromUrl(url: string): number | undefined {
  try {
    const value = new URL(url, "https://api.proxyrequest.com").searchParams.get("offset");
    if (value === null) return undefined;
    const offset = Number(value);
    return Number.isInteger(offset) && offset >= 0 ? offset : undefined;
  } catch {
    return undefined;
  }
}
