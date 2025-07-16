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


def add_status(query, params, status="", like="", day=""):
    # ---
    if not isinstance(params, list):
        params = list(params)
    # ---
    added = []
    # ---
    if status:
        if status == "Category":
            added.append("response_status like 'تصنيف%'")
        else:
            added.append("response_status = ?")
            params.append(status)
    elif like:
        added.append("response_status like ?")
        params.append(like)
    # ---
    # 2025-04-23
    pattern = r"\d{4}-\d{2}-\d{2}"
    # ---
    if day and re.match(pattern, day):
        added.append("date_only = ?")
        params.append(day)
    # ---
    if added:
        query += " WHERE " + " AND ".join(added)
    # ---
    # params = tuple(params)
    # ---
    return query, params


def get_response_status(table_name="P11038_lemmas"):
    # ---
    query = f"select response_status, count(response_status) as numbers from {table_name} group by response_status having count(*) > 2"
    # ---
    result = fetch_all(query, ())
    # ---
    result = [row['response_status'] for row in result]
    # ---
    return result


def count_all(status="", table_name="P11038_lemmas", like=""):
    # ---
    query = f"SELECT COUNT(*) FROM {table_name}"
    # ---
    params = []
    # ---
    query, params = add_status(query, params, status=status, like=like)
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
    query, params = add_status(query, params, status=status, like=like, day=day)
    # ---
    query += f"ORDER BY {order_by} {order} LIMIT ? OFFSET ?"
    # ---
    # {'id': 1, 'endpoint': 'api', 'request_data': 'Category:1934-35 in Bulgarian football', 'response_status': 'true', 'response_time': 123123.0, 'response_count': 6, 'timestamp': '2025-04-10 01:08:58'}
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
    # query, params = add_status(query, params, status=status)
    # ---
    query += f"ORDER BY {order_by} {order} LIMIT ? OFFSET ?"
    # ---
    params.extend([per_page, offset])
    # ---
    logs = fetch_all(query, params)
    # ---
    if not logs:
        insert_lemma(lemma_id=202000713, lemma="آخَرُ", pos="صفة", pos_cat="اسم", Lid="L13303", sama_lemma_id=390010035, sama_lemma="آخَر")
    # ---
    return logs
