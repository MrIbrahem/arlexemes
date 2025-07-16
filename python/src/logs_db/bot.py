# -*- coding: utf-8 -*-
"""

from .logs_db.bot import change_db_path, fetch_all

"""
import re

from .db import change_db_path as _change_db_path, fetch_all
from .insert import insert_lemma

"""

try:
    from .db import change_db_path as _change_db_path, fetch_all
except ImportError:
    from db import change_db_path as _change_db_path, fetch_all
"""


def change_db_path(file):
    return _change_db_path(file)


def add_order_limit_offset(query, params, order_by, order, limit, offset):
    # ---
    if order not in ["ASC", "DESC"]:
        order = "DESC"
    # ---
    if order_by:
        query += f"ORDER BY {order_by} {order}"
    # ---
    if limit > 0:
        query += " LIMIT ?"
        params.extend([limit])
    # ---
    if offset > 0:
        query += " OFFSET ?"
        params.extend([offset])
    # ---
    return query, params


def count_all(status="", table_name="P11038_lemmas", like=""):
    # ---
    query = f"SELECT COUNT(*) FROM {table_name}"
    # ---
    params = []
    # ---
    result = fetch_all(query, params, fetch_one=True)
    # ---
    if not result:
        return 0
    # ---
    if isinstance(result, list):
        result = result[0]
    # ---
    total_logs = result["COUNT(*)"]
    # ---
    return total_logs


def get_logs(per_page=10, offset=0, order="DESC", order_by="timestamp", status="", table_name="P11038_lemmas", like="", day=""):
    # ---
    if order not in ["ASC", "DESC"]:
        order = "DESC"
    # ---
    query = f"SELECT * FROM {table_name} "
    # ---
    params = []
    # ---
    query, params = add_order_limit_offset(query, params, order_by, order, per_page, offset)
    # ---
    params.extend([per_page, offset])
    # ---
    logs = fetch_all(query, params)
    # ---
    return logs


def get_all(per_page=10, offset=0, order="DESC", order_by="id", status="", table_name="P11038_lemmas"):
    # ---
    if order not in ["ASC", "DESC"]:
        order = "DESC"
    # ---
    query = f"SELECT * FROM {table_name} "
    # ---
    params = []
    # ---
    query, params = add_order_limit_offset(query, params, order_by, order, per_page, offset)
    # ---
    logs = fetch_all(query, params)
    # ---
    return logs


def select(table_name="P11038_lemmas", limit=0, offset=0, order="DESC", order_by="id", **kwargs):
    # ---
    query = f"SELECT * FROM {table_name} "
    # ---
    params = []
    # ---
    query, params = add_order_limit_offset(query, params, order_by, order, limit, offset)
    # ---
    logs = fetch_all(query, params)
    # ---
    return logs
