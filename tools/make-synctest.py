#!/usr/bin/env python3
"""Write build/synctest.html: the built game wired to tools/mock-firebase.js instead of the real Firebase project.

Use it to test family-account flows (parent login, link codes, sync, combine, unlink) without touching real data.
In the page, each "device" is a localStorage snapshot and the mock "server" lives in sessionStorage, so one tab can
play several devices by swapping localStorage and reloading. `window.__mock` exposes the server documents.
Run `python3 build.py` first.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

html = (ROOT / "index.html").read_text(encoding="utf-8")
html, n = re.subn(r"const PMLM_FIREBASE = (\{.*?\}|null);", 'const PMLM_FIREBASE = { projectId: "mock" };', html, count=1, flags=re.S)
assert n == 1, "Firebase config not found in index.html"
mock = (ROOT / "tools" / "mock-firebase.js").read_text(encoding="utf-8")
html = html.replace("<script>/* config.js */", f"<script>{mock}</script>\n<script>/* config.js */", 1)
(ROOT / "build").mkdir(exist_ok=True)
(ROOT / "build" / "synctest.html").write_text(html, encoding="utf-8")
print("Wrote build/synctest.html (mock Firebase backend)")
