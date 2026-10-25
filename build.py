#!/usr/bin/env python3
"""Inline src/ into one self-contained page.

Writes:
  index.html            full document, works offline; GitHub Pages serves it
  build/artifact.html   page content only, for publishing as a claude.ai Artifact
"""
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
ORDER = ["config.js", "util.js", "registry.js", "validate.js",
         *[f"grade{g}.js" for g in range(1, 10)],
         "visuals.js", "fx.js", "engine.js"]


def main():
    shell = (SRC / "shell.html").read_text(encoding="utf-8")
    head, body = shell.split("<!--BODY-->")
    build = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    scripts = []
    for name in ORDER:
        path = SRC / name
        if not path.exists():
            print(f"  (skipping missing {name})")
            continue
        code = path.read_text(encoding="utf-8").replace("</script", "<\\/script").replace("__BUILD__", build)
        scripts.append(f"<script>/* {name} */\n{code}\n</script>")
    body = body.replace("<!--SCRIPTS-->", "\n".join(scripts))

    content = head.strip() + "\n" + body.strip() + "\n"
    (ROOT / "build").mkdir(exist_ok=True)
    (ROOT / "build" / "artifact.html").write_text(content, encoding="utf-8")

    full = (
        '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
        "<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}"
        "[hidden]{display:none!important}</style>\n"
        f"{head.strip()}\n</head>\n<body>\n{body.strip()}\n</body>\n</html>\n"
    )
    out = ROOT / "index.html"
    out.write_text(full, encoding="utf-8")
    print(f"Built {out.name} ({out.stat().st_size // 1024} KB) and build/artifact.html")


if __name__ == "__main__":
    main()
