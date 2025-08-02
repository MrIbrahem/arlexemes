# -*- coding: utf-8 -*-
"""

from logs_db import wd_data_P11038
# all_result = wd_data_P11038.get_P11038_lemmas(limit=limit, offset=offset, order=order, order_by=order_by, filter_data=filter_data)
# counts = wd_data_P11038.count_all()

"""
from .db import fetch_all
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


def count_all():
    # ---
    query = """
        SELECT
            COUNT(*) AS total_rows,
            COUNT(CASE WHEN w.vi_value IS NOT NULL AND w.vi_value != '' THEN 1 END) AS count_has_value,
            COUNT(CASE WHEN w.vi_value IS NULL OR w.vi_value = '' THEN 1 END) AS count_no_value
        FROM P11038_lemmas AS l
        LEFT JOIN wd_data_both AS w
            ON l.lemma_id = w.vi_value
                OR l.sama_lemma_id = w.vi_value;

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
        "all": result["total_rows"],
        "with": result["count_has_value"],
        "without": result["count_no_value"],
    }
    # ---
    return data


def get_P11038_lemmas(limit=0, offset=0, order="DESC", order_by="id", filter_data="all"):
    # ---
    query = """
    SELECT * FROM P11038_lemmas AS l JOIN wd_data_P11038 AS w ON l.lemma_id = w.value OR l.sama_lemma_id = w.value WHERE w.value != ""
    """
    # ---
    # { "id": 116837, "lemma_id": 2023255974, "lemma": "صَالٍ", "pos": "صفة", "pos_cat": "اسم", "sama_lemma_id": "", "sama_lemma": "", "vi_wd_id": "L1475214", "vi_wd_id_category": "صفة", "vi_lemma": "صَالٍ", "vi_value": "2023255974" }
    # ---
    query = """
        SELECT
            id, lemma_id, lemma, pos, pos_cat, sama_lemma_id, sama_lemma
            vi_wd_id, vi_wd_id_category, vi_lemma, vi_value
        FROM P11038_lemmas AS l
        LEFT JOIN wd_data_both AS w
            ON l.lemma_id = w.vi_value
                OR l.sama_lemma_id = w.vi_value

    """
    # ---
    if filter_data == "with":
        query += " WHERE (w.vi_value IS NOT NULL AND w.vi_value != '') "
    elif filter_data == "without":
        query += " WHERE (w.vi_value IS NULL OR w.vi_value = '') "
    # ---
    params = []
    # ---
    query, params = add_order_limit_offset(query, params, order_by, order, limit, offset)
    # ---
    logs = fetch_all(query, params)
    # ---
    return logs
