#!/usr/bin/env python3
"""מריץ את כל הבדיקות ונותן פסק דין אחד.

    python run_tests.py
"""

import os
import sys
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)


def main():
    loader = unittest.TestLoader()
    suite = loader.discover(os.path.join(HERE, "tests"), top_level_dir=HERE)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    ok = result.wasSuccessful()
    print()
    print("=" * 60)
    print("  %d בדיקות · %d כשלים · %d שגיאות · %s"
          % (result.testsRun, len(result.failures), len(result.errors),
             "עבר" if ok else "נפל"))
    print("=" * 60)
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
