#!/usr/bin/env python
#
# Preview emails like `python -m http.server --directory DIR --port PORT`
# but with reversed sort order, so newest emails are shown first.
#
# Usage: python preview-emails.py [DIR] [PORT]   (defaults: `.temp`, port `4000`)

import functools
import html
import http.server
import io
import os
import sys
from pathlib import Path

default_debug_email_dir = Path(__file__).resolve().parent.parent / ".temp"
default_port = 4000


class H(http.server.SimpleHTTPRequestHandler):
    def list_directory(self, path):
        rows = ""
        for n in sorted(os.listdir(path), reverse=True):
            name = n + ("/" if os.path.isdir(os.path.join(path, n)) else "")
            rows += f'<li><a href="{html.escape(name)}">{html.escape(name)}</a></li>\n'
        body = (
            f'<!DOCTYPE HTML><html><head><meta charset="utf-8">'
            f"<style>:root{{color-scheme:light dark}}</style>"
            f"<title>Directory listing for {html.escape(self.path)}</title></head>"
            f"<body><h1>Directory listing for {html.escape(self.path)}</h1><hr>"
            f"<ul>{rows}</ul><hr></body></html>"
        )
        data = body.encode("utf-8", "surrogateescape")
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        return io.BytesIO(data)


if __name__ == "__main__":
    directory = sys.argv[1] if len(sys.argv) > 1 else default_debug_email_dir
    port = int(sys.argv[2]) if len(sys.argv) > 2 else default_port

    with http.server.ThreadingHTTPServer(
        ("", port), functools.partial(H, directory=directory)
    ) as srv:
        print(f"\nEmail preview server: http://localhost:{port}\n")
        try:
            srv.serve_forever()
        except KeyboardInterrupt:
            pass
