# Analytics response fixtures

`analytics-responses.json` contains synthetic HTTP response bodies produced on
2026-09-21 by the local `papaproxy/api` checkout at commit
`78dae2e` (the analytics source files had no local changes).

The bodies use the real `AnalyticsViewSet.feed` / `domains` actions,
`parse_date_range`, pagination builders, `ClickhouseService._format_feed_results`
and `_format_top_domains_results`, and `OrjsonRenderer`. Account permission checks
and ClickHouse I/O were replaced with synthetic inputs; no production account or
database was accessed. The first/last/empty cases substitute the page-reader
results after using the actual row formatters. `feed_reported_window` additionally
runs `get_feed_page` and its query builder with a fake ClickHouse `execute` result.

- `feed_first`: null timestamp, empty optional identifier/location strings,
  IPv4-mapped IPv6 normalization, IPv6 server address, next page.
- `feed_last`: timestamp, sticky session, previous page.
- `feed_empty`: empty results with a total and previous page.
- `domains_first`, `domains_last`, `domains_empty`: lookahead pagination with no
  total count.
- `feed_reported_window`: the reported query's `2026-09-21T02:20:06Z` through
  `2026-09-21T14:20:06Z`, `Europe/Kiev`, limit 20, offset 0. The API rounds the
  window boundaries to minutes and returns the +03:00 offset.

The same fixture is used by the Python, TypeScript, and PHP SDK compatibility
suites. These are backend-generated contract fixtures, not captured production
responses; they cannot identify a failing integrator payload without its decode
exception or response body.

## Large feed identifiers

`analytics-large-ids.json` reuses a synthetic feed row with the six numeric IDs from the reported decoding failure, plus zero and the JavaScript, PHP and UInt64 boundaries. Load the file as raw HTTP response text; parsing it through JavaScript numbers first would invalidate the regression. All identity and network fields are synthetic.
