# -*- coding: utf-8 -*-
"""

from .logs_db.bot import fetch_all
from logs_db.bot import get_P11038_lemmas

"""
from .db_mysql import fetch_all
# from .insert import insert_lemma


def add_order_limit_offset(query, params, order_by, order, limit, offset):
    # ---
    if order not in ["ASC", "DESC"]:
        order = "DESC"
    # ---
    if order_by:
        query += f" ORDER BY {order_by} {order}"
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


def count_all(table_name="P11038_lemmas"):
    # ---
    query = f"""
    SELECT
        COUNT(*) AS total,
        COUNT(CASE WHEN wd_id IS NOT NULL AND wd_id != '' THEN 1 END) AS with_lid,
        COUNT(CASE WHEN wd_id IS NULL OR wd_id = '' THEN 1 END) AS without_lid
    FROM {table_name}
    """
    # ---
    result = fetch_all(query, [], fetch_one=True)
    # ---
    if not result:
        return 0
    # ---
    if isinstance(result, list):
        result = result[0]
    # ---
    data = {
        "all": result["total"],
        "with": result["with_lid"],
        "without": result["without_lid"],
    }
    # ---
    return data


def get_logs(per_page=0, offset=0, order="DESC", order_by="timestamp", table_name="P11038_lemmas"):
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


def get_all(per_page=0, offset=0, order="DESC", order_by="id", table_name="P11038_lemmas", filter_data="all"):
    # ---
    query = f"SELECT * FROM {table_name} "
    # ---
    if filter_data == "with":
        query += " WHERE (wd_id IS NOT NULL AND wd_id != '') "
    elif filter_data == "without":
        query += " WHERE (wd_id IS NULL OR wd_id = '') "
    # ---
    params = []
    # ---
    query, params = add_order_limit_offset(query, params, order_by, order, per_page, offset)
    # ---
    logs = fetch_all(query, params)
    # ---
    return logs


def select(data={}, table_name="P11038_lemmas", limit=0, offset=0, order="DESC", order_by="id"):
    # ---
    query = f"SELECT * FROM {table_name} WHERE "
    # ---
    types = [
        "id",
        "lemma_id",
        "lemma",
        "pos",
        "pos_cat",
        "wd_id",
        "sama_lemma_id",
        "sama_lemma",
    ]
    # ---
    params = []
    # ---
    expend_query = []
    # ---
    for key, value in data.items():
        if key in types:
            line = f"{key} = ?"
            # ---
            if value == "null":
                line = f"({key} IS NULL OR {key} = '')"
            elif value == "not null":
                line = f"({key} IS NOT NULL AND {key} != '')"
            elif value != "":
                line = f"({key} = ?)"
                params.append(value)
            # ---
            expend_query.append(line)
    # ---
    query = query + " AND ".join(expend_query)
    # ---
    query, params = add_order_limit_offset(query, params, order_by, order, limit, offset)
    # ---
    logs = fetch_all(query, params)
    # ---
    return logs
