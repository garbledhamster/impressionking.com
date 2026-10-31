#!/usr/bin/env python3
"""Append verified public creator-widget records; never claim full history sync."""
import argparse
from copy import deepcopy
from datetime import datetime, timezone
from html import unescape
import json
from pathlib import Path
import re
import sys
import urllib.request
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
STATE_ID = "__FRONTITY_CONNECT_STATE__"


def parse_widget(html, handle):
    match = re.search(r'<script\b[^>]*\bid=["\']' + STATE_ID + r'["\'][^>]*>(.*?)</script>', html, re.S)
    if not match:
        raise ValueError("Public widget data unavailable; no catalog changes made")
    state = json.loads(match.group(1))
    page = state.get("source", {}).get("data", {}).get("/embed/@" + handle, {})
    user = page.get("userInfo", {})
    if user.get("uniqueId", "").lower() != handle.lower() or user.get("privateAccount") or user.get("code") != 200:
        raise ValueError("Public widget identity/availability check failed")
    videos = page.get("videoList")
    if not isinstance(videos, list) or not videos:
        raise ValueError("Public widget returned no posts; existing catalog retained")
    clean = []
    for video in videos:
        if (not isinstance(video, dict)
                or video.get("authorUniqueId", "").lower() != handle.lower()
                or video.get("privateItem")
                or not re.fullmatch(r"\d{18,20}", str(video.get("id", "")))
                or not isinstance(video.get("desc"), str)):
            raise ValueError("Public widget contains an invalid or different-author post")
        # Preserve public evidence only. Do not store cookies, visitor IDs or media URLs.
        clean.append({key: video[key] for key in ("id", "desc", "authorUniqueId", "height", "width", "playCount") if key in video})
    return clean


def normalized_record(video, handle, checked):
    caption = video["desc"]
    readable = unescape(caption).replace("\u200b", "").strip()
    prefix = readable.split("#", 1)[0].strip()
    tags = re.findall(r"#([\w]+)", readable)
    title = prefix or (tags[0] if tags else "TikTok " + video["id"])
    tokens = " ".join([prefix, *tags]).lower()
    music = bool(re.search(r"beatmaker|beatmaking|typebeat|chiptunebeats|sampledbeats|gamingproducer", tokens))
    voice = bool(re.search(r"voiceimpression|voiceacting|voiceover|voiceactor|voiceimpressions", tokens))
    kind = "music" if music else "voice" if voice else "unknown"
    return {
        "id": str(video["id"]), "title": title, "character": "", "franchise": "",
        "categories": ["Music"] if music else ["Uncategorized"],
        "description": caption, "thumbnail_url": None, "duration": None,
        "source_url": f"https://www.tiktok.com/@{handle}/video/{video['id']}",
        "media_kind": kind,
        "provenance": {"source": f"https://www.tiktok.com/embed/@{handle}",
                       "checked": checked, "classification": "caption-keywords-v1",
                       "classification_evidence": tags},
    }


def merge_catalog(catalog, videos, handle, checked):
    result = deepcopy(catalog)
    current = result.get("videos")
    if not isinstance(current, list):
        raise ValueError("Existing catalog must contain a videos array")
    known = {str(video["id"]) for video in current}
    if len(known) != len(current):
        raise ValueError("Existing catalog has duplicate IDs; reconcile before importing")
    added = 0
    for video in videos:
        if str(video["id"]) in known:
            continue
        current.append(normalized_record(video, handle, checked))
        known.add(str(video["id"]))
        added += 1
    result.update({"curation": "mixed", "last_checked": checked, "complete_repertoire": False})
    result["collection"] = {"source": f"https://www.tiktok.com/embed/@{handle}",
                            "method": "public-creator-widget", "coverage": "recent-window-plus-retained-posts",
                            "returned_posts": len({v["id"] for v in videos}), "last_checked": checked}
    return result, added


def atomic_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")
    temporary.replace(path)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--handle", default="impressionking30")
    parser.add_argument("--catalog", type=Path, default=ROOT / "data/catalog.json")
    parser.add_argument("--input", type=Path, help="Read a previously saved widget HTML for an offline dry run")
    parser.add_argument("--input-json", type=Path, help="Import a previously captured sanitized widget evidence file")
    parser.add_argument("--write", action="store_true", help="Save merged catalog and sanitized public evidence")
    args = parser.parse_args()
    if not re.fullmatch(r"[A-Za-z0-9._]{1,24}", args.handle):
        raise ValueError("Invalid TikTok handle")
    url = f"https://www.tiktok.com/embed/@{args.handle}"
    captured = None
    if args.input and args.input_json:
        raise ValueError("Choose one captured input format")
    if args.input_json:
        captured = json.loads(args.input_json.read_text())
        if captured.get("source_url") != url:
            raise ValueError("Captured source URL does not match this creator")
        page = {"userInfo": {"uniqueId": args.handle, "code": 200, "privateAccount": False}, "videoList": captured.get("videos")}
        html = '<script id="' + STATE_ID + '">' + json.dumps({"source": {"data": {"/embed/@" + args.handle: page}}}) + '</script>'
    elif args.input:
        html = args.input.read_text()
    else:
        # One ordinary public request; no cookies, credentials, proxies or retries.
        with urllib.request.urlopen(url, timeout=20) as response:
            if response.status != 200 or response.geturl().split("?", 1)[0].rstrip("/") != url:
                raise ValueError("Public widget redirected or failed")
            body = response.read(2_000_001)
            if len(body) > 2_000_000:
                raise ValueError("Public widget response exceeded size limit")
            html = body.decode("utf-8")
    videos = parse_widget(html, args.handle)
    now = datetime.fromisoformat(captured["retrieved_at"]) if captured else datetime.now(timezone.utc)
    checked = now.astimezone(ZoneInfo("America/Chicago")).date().isoformat()
    catalog = json.loads(args.catalog.read_text())
    result, added = merge_catalog(catalog, videos, args.handle, checked)
    if args.write:
        # Parsing/validation/merge all finish before either saved output is touched.
        evidence = {"source_url": url, "retrieved_at": now.isoformat(),
                    "coverage": "public widget recent window; not full account history",
                    "videos": videos}
        if captured and captured.get("capture_note"):
            evidence["capture_note"] = captured["capture_note"]
        atomic_json(args.catalog.with_name("catalog-source.json"), evidence)
        atomic_json(args.catalog, result)
    print(json.dumps({"mode": "saved" if args.write else "dry-run", "source": url,
                      "returned": len(videos), "added": added, "total": len(result["videos"]),
                      "complete_repertoire": False}))


if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError, KeyError, TypeError) as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
