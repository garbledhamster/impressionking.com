# Public catalog refresh

Run from the repository with Python 3.9 or later:

```sh
python3 tools/import_catalog.py
python3 tools/import_catalog.py --write
```

The first command previews additions. The second appends new records and saves sanitized public metadata in `data/catalog-source.json`. It makes one ordinary request to TikTok’s public creator widget, with a 20-second timeout, no login, cookies, proxies or challenge handling. HTTP errors, missing/empty data and author mismatches stop the import before changing the catalog. Do not loop on rate limits.

The widget exposes a limited recent selection, sometimes including a pinned post. Its internal HTML data format can change. This is a best-effort recent-post importer, not TikTok’s Display API or a full-history catalog service. Previously saved records and curated labels survive partial feeds and reruns. Missing posts are never automatically deleted. Caption keywords identify music/voice format; character and franchise remain unknown for newly imported records. Exact captions and classification evidence are retained.

Recheck captured evidence without a network request:

```sh
python3 tools/import_catalog.py --input-json data/catalog-source.json
python3 -m unittest discover -s tests -p '*_test.py'
```

October 30, 2026: the successful public widget response supplied 11 posts, seven new to the 15-record catalog. The saved catalog has 22 unique records. A subsequent live preview received HTTP 429 and stopped; the import used sanitized metadata captured from the earlier successful response. This capture did not establish full-history coverage; the scheduled refresh below was added afterward. Public-source existence does not independently verify playback in every region.

Source: https://www.tiktok.com/embed/@impressionking30

The `Refresh public TikTok catalog` GitHub Actions workflow attempts one public-widget import daily and can also be run manually. It commits only when new post IDs were found, then explicitly requests the existing Pages build (Actions-token pushes do not trigger one themselves). A rate limit or changed response fails that run and leaves the published catalog intact; it does not retry. GitHub authenticates its own repository update with the standard Actions token; Jacob never connects a TikTok account. The scheduled job’s first execution still needs verification after installation.
