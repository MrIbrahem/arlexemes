# -*- coding: utf-8 -*-

from pyx.logs_db.db_mysql import init_db
from pyx.logs_db.bot import count_all


def test():
    print("test init_db: ")
    # ---
    init_db()
    # ---
    print("count_all", count_all())
