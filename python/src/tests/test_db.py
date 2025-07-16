# -*- coding: utf-8 -*-

from logs_db import init_db, count_all, get_logs


def test():
    init_db()
    # ---
    print("count_all", count_all(status="no_result"))
    # ---
    # print("get_response_status", get_response_status())
    # ---
    print("get_logs", get_logs(status=""))
    print("get_logs", get_logs(status="no_result"))
