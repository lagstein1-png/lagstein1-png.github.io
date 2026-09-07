#!/usr/bin/env python3
"""הרצת מעבדת הסוכנים.

    python run.py                 # 127.0.0.1:8123, בסיס נתונים ב-data/agentlab.db
    python run.py --port 9000
    python run.py --db C:\\temp\\lab.db

ספרייה סטנדרטית בלבד. אין pip, אין npm, אין רשת.
"""

import argparse
import os
import sys
import webbrowser

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from agentlab import MODE_LABEL_HE, VERSION, db, server  # noqa: E402

DEFAULT_DB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "agentlab.db")


def main(argv=None):
    p = argparse.ArgumentParser(description="מעבדת סוכנים — מצב הדמיה")
    p.add_argument("--host", default="127.0.0.1")
    p.add_argument("--port", type=int, default=8123)
    p.add_argument("--db", default=DEFAULT_DB)
    p.add_argument("--open", action="store_true", help="לפתוח דפדפן")
    args = p.parse_args(argv)

    conn = db.connect(args.db)
    httpd = server.make_server(conn, args.host, args.port)
    url = "http://%s:%d/" % (args.host, args.port)

    print("=" * 60)
    print("  מעבדת סוכנים " + VERSION)
    print("  " + MODE_LABEL_HE)
    print("  כתובת: " + url)
    print("  בסיס נתונים: " + os.path.abspath(args.db))
    print("  לעצירה: Ctrl+C")
    print("=" * 60)

    if args.open:
        webbrowser.open(url)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nנעצר.")
    finally:
        httpd.server_close()
        conn.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
