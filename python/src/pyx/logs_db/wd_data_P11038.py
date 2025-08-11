# -*- coding: utf-8 -*-
"""

from logs_db import wd_data_P11038
# all_result = wd_data_P11038.get_lemmas(limit=limit, offset=offset, order=order, order_by=order_by, filter_data=filter_data)
# counts = wd_data_P11038.count_all()

"""
from .db_mysql import fetch_all


def add_order_limit_offset(query, params, order_by, order, limit, offset):
    # ---
    if order not in ["ASC", "DESC"]:
        order = "DESC"
    # ---
    if order_by:
        query += f" ORDER BY {order_by} {order}"
    # ---
    if limit > 0:
        query += " LIMIT %s"
        params.extend([limit])
    # ---
    if offset > 0:
        query += " OFFSET %s"
        params.extend([offset])
    # ---
    return query, params


def count_all():
    # ---
    query = """
        SELECT
            SUM(total_rows) AS total_rows,
            SUM(count_has_value) AS count_has_value
        FROM (
            SELECT
                COUNT(*) AS total_rows,
                COUNT(CASE WHEN wdp.value IS NOT NULL AND wdp.value != '' THEN 1 END) AS count_has_value
            FROM lemmas_p11038 AS l
            LEFT JOIN wd_data_p11038 AS wdp
                ON l.lemma_id = wdp.value

            UNION ALL

            SELECT
                COUNT(*) AS total_rows,
                COUNT(CASE WHEN wdp.value IS NOT NULL AND wdp.value != '' THEN 1 END) AS count_has_value
            FROM lemmas_p11038 AS l
            LEFT JOIN wd_data_p11038 AS wdp
                ON l.sama_lemma_id = wdp.value
        ) AS combined
    """
    # ---
    result = fetch_all(query, [], fetch_one=True)
    # ---
    if not result:
        return {}
    # ---
    if isinstance(result, list):
        result = result[0]
    # ---
    total_rows = int(result["total_rows"]) // 2
    # ---
    data = {
        "all": total_rows,
        "with": int(result["count_has_value"]),
        "without": total_rows - int(result["count_has_value"]),
    }
    # ---
    print(data)
    # ---
    return data


def get_lemmas(limit=0, offset=0, order="DESC", order_by="id", filter_data="with"):
    # ---
    query = """
        SELECT
            l.id, l.lemma_id, l.lemma, l.pos, l.pos_cat, l.sama_lemma_id, l.sama_lemma,
            w.wd_id as vi_wd_id, w.wd_id_category as vi_wd_id_category, w.lemma as vi_lemma, wdp.value as vi_value

        FROM lemmas_p11038 AS l
         JOIN wd_data_p11038 AS wdp
        ON l.lemma_id = wdp.value
         JOIN wd_data AS w ON wdp.wd_data_id = w.wd_id

            UNION ALL

        SELECT
            l.id, l.lemma_id, l.lemma, l.pos, l.pos_cat, l.sama_lemma_id, l.sama_lemma,
            w.wd_id as vi_wd_id, w.wd_id_category as vi_wd_id_category, w.lemma as vi_lemma, wdp.value as vi_value

        FROM lemmas_p11038 AS l
         JOIN wd_data_p11038 AS wdp
        ON l.sama_lemma_id = wdp.value
         JOIN wd_data AS w ON wdp.wd_data_id = w.wd_id

    """
    # ---
    query_without = """
    SELECT
        l.id, l.lemma_id, l.lemma, l.pos, l.pos_cat, l.sama_lemma_id, l.sama_lemma

        FROM lemmas_p11038 AS l
        where l.sama_lemma_id not in (select value from wd_data_p11038)
        and l.lemma_id not in (select value from wd_data_p11038)
    """
    # ---
    if filter_data == "without":
        query = query_without
    # ---
    params = []
    # ---
    query, params = add_order_limit_offset(query, params, order_by, order, limit, offset)
    # ---
    logs = fetch_all(query, params)
    # ---
    return logs
