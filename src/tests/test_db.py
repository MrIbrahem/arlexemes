# -*- coding: utf-8 -*-

from pyx.logs_db.bot import count_all
from pyx.logs_db.db_mysql import init_db


def test():
    print("test init_db: ")
    # ---
    init_db()
    # ---
    print("count_all", count_all())
