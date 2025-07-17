# -*- coding: utf-8 -*-

from logs_db import init_db, count_all, get_logs


def test():
    init_db()
    # ---
    print("count_all", count_all())
    # ---
    print("get_logs", get_logs())
