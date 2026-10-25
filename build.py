#!/usr/bin/env python3
"""Inline src/ into one self-contained page.

Writes:
  index.html            full document, works offline; GitHub Pages serves it
  stats.html            the family-test dashboard (src/stats.html with the Firebase config inlined)
  build/artifact.html   page content only, for publishing as a claude.ai Artifact

Options:
  --preview   build the preview copy into build/preview/ instead: settings from src/config.preview.js (the
              staging Firebase project and its own storage keys on the device) and a PREVIEW ribbon.
              tools/deploy-preview.sh publishes it.
  --check     build in memory and fail if index.html or stats.html are not up to date with src/
              (the build stamp is ignored). The tests run this.
"""
import json
import re
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
ORDER = ["config.js", "util.js", "registry.js", "validate.js",
         *[f"grade{g}.js" for g in range(1, 10)],
         "visuals.js", "fx.js", "board.js", "reminders.js", "online.js", "engine.js"]
STAMP = re.compile(r"\d{4}-\d{2}-\d{2} \d{2}:\d{2} UTC")  # the build time, ignored by --check
APP_HEAD = """<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="theme-color" content="#0b1026">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="{title}">"""
RIBBON_CSS = ("<style>.envribbon{position:fixed;z-index:90;top:calc(env(safe-area-inset-top,0px) + 6px);left:50%;"
              "transform:translateX(-50%);padding:2px 12px;border-radius:99px;background:#e5484d;color:#fff;"
              "font:800 .75rem/1.4 system-ui,sans-serif;letter-spacing:.12em;pointer-events:none}</style>")
MANIFEST = {
    "name": "Play More Learn More", "short_name": "Play More", "description": "Cambridge maths practice, Grades 1 to 9",
    "start_url": "./", "scope": "./", "display": "standalone", "orientation": "portrait",
    "background_color": "#0b1026", "theme_color": "#0b1026",
    "icons": [
        {"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png"},
        {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png"},
        {"src": "icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
    ],
}


def scripts(config_name, build):
    out = []
    for name in ORDER:
        path = SRC / (config_name if name == "config.js" else name)
        if not path.exists():
            print(f"  (skipping missing {name})")
            continue
        code = path.read_text(encoding="utf-8").replace("</script", "<\\/script").replace("__BUILD__", build)
        out.append(f"<script>/* {name} */\n{code}\n</script>")
    return "\n".join(out)


def pages(preview, build):
    """Returns {relative path: text} for one copy of the game."""
    config_name = "config.preview.js" if preview else "config.js"
    shell = (SRC / "shell.html").read_text(encoding="utf-8")
    head, body = shell.split("<!--BODY-->")
    body = body.replace("<!--SCRIPTS-->", scripts(config_name, build))
    title = "PMLM Preview" if preview else "Play More"
    app_head = APP_HEAD.format(title=title)
    if preview:
        head = head.replace("<title>Play More Learn More</title>", "<title>Play More Learn More (preview)</title>") + "\n" + RIBBON_CSS
        body = '<div class="envribbon" aria-hidden="true">PREVIEW</div>\n' + body.strip()
    full = (
        '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
        "<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}"
        "[hidden]{display:none!important}</style>\n"
        f"{app_head}\n{head.strip()}\n</head>\n<body>\n{body.strip()}\n</body>\n</html>\n"
    )
    config = (SRC / config_name).read_text(encoding="utf-8")
    stats = (SRC / "stats.html").read_text(encoding="utf-8").replace("<!--CONFIG-->", f"<script>\n{config}</script>").replace("__BUILD__", build)
    out = {"index.html": full, "stats.html": stats}
    if not preview:
        out["build/artifact.html"] = head.strip() + "\n" + body.strip() + "\n"
    return out


def manifest(preview):
    m = dict(MANIFEST)
    if preview:
        m.update(name="Play More Learn More (preview)", short_name="PMLM Preview")
    return json.dumps(m, indent=2) + "\n"


def main():
    args = sys.argv[1:]
    build = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    if "--check" in args:
        stale = []
        for rel, text in pages(False, build).items():
            path = ROOT / rel
            if rel.startswith("build/"):
                continue
            if not path.exists() or STAMP.sub("", path.read_text(encoding="utf-8")) != STAMP.sub("", text):
                stale.append(rel)
        mpath = ROOT / "manifest.webmanifest"
        if not mpath.exists() or mpath.read_text(encoding="utf-8") != manifest(False):
            stale.append("manifest.webmanifest")
        if stale:
            print("Not up to date with src/: " + ", ".join(stale) + ". Run python3 build.py and commit the result.")
            sys.exit(1)
        print("index.html, stats.html and manifest.webmanifest are up to date with src/")
        return

    if "--preview" in args:
        out_dir = ROOT / "build" / "preview"
        if out_dir.exists():
            shutil.rmtree(out_dir)
        out_dir.mkdir(parents=True)
        for rel, text in pages(True, build).items():
            (out_dir / rel).write_text(text, encoding="utf-8")
        (out_dir / "manifest.webmanifest").write_text(manifest(True), encoding="utf-8")
        shutil.copy(ROOT / "sw.js", out_dir / "sw.js")
        shutil.copytree(ROOT / "icons", out_dir / "icons")
        (out_dir / ".nojekyll").write_text("", encoding="utf-8")
        if "const PMLM_FIREBASE = null" in (SRC / "config.preview.js").read_text(encoding="utf-8"):
            print("  Note: src/config.preview.js has no staging Firebase project yet, so the preview has no online features.")
        print(f"Built the preview copy in {out_dir.relative_to(ROOT)}/")
        return

    (ROOT / "build").mkdir(exist_ok=True)
    for rel, text in pages(False, build).items():
        (ROOT / rel).write_text(text, encoding="utf-8")
    (ROOT / "manifest.webmanifest").write_text(manifest(False), encoding="utf-8")
    size = (ROOT / "index.html").stat().st_size // 1024
    print(f"Built index.html ({size} KB), stats.html, manifest.webmanifest and build/artifact.html")


if __name__ == "__main__":
    main()
