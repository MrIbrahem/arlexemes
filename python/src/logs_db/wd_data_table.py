# -*- coding: utf-8 -*-
"""

from .logs_db import wd_data_table
# wd_data_table.count_all()
# wd_data_table.get_all()
# wd_data_table.get_all_by_value()  # [value,wd_id,wd_id_category,lemma]
# wd_data_table.insert_wd_id(wd_id="", wd_id_category="", lemma="")
# wd_data_table.insert_multi_wd_data_P11038(data=[{"wd_data_id":"wd_data_id", "value":"value"}])

"""
from .db import fetch_all, init_db, db_commit


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
            COUNT(*) AS total_items,
            COUNT(CASE WHEN has_data > 0 THEN 1 END) AS with_P11038,
            COUNT(CASE WHEN has_data = 0 THEN 1 END) AS without_P11038
        FROM (
            SELECT d.wd_id, COUNT(p.id) AS has_data
            FROM wd_data d
            LEFT JOIN wd_data_P11038 p ON d.wd_id = p.wd_data_id
            GROUP BY d.wd_id
        );
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
        "all": result["total_items"],
        "with": result["with_P11038"],
        "without": result["without_P11038"],
    }
    # ---
    return data


def get_all():
    # ---
    query = """
        SELECT
            d.wd_id,
            d.wd_id_category,
            d.lemma,
            GROUP_CONCAT(p.value, ', ') AS P11038_values
        FROM wd_data d
        LEFT JOIN wd_data_P11038 p ON d.wd_id = p.wd_data_id
        GROUP BY d.wd_id, d.wd_id_category, d.lemma
    """
    # ---
    params = []
    # ---
    logs = fetch_all(query, params)
    # ---
    new_logs = []
    # ---
    for x in logs:
        P11038_values = []
        # ---
        if x and x.get("P11038_values", ""):
            P11038_values = [o.strip() for o in x.get("P11038_values", "").split(",")]
        # ---
        x["P11038_values"] = P11038_values
        # ---
        new_logs.append(x)
    # ---
    return new_logs


def get_all_by_value():
    # ---
    query = """
        SELECT DISTINCT
            p.value,
            d.wd_id,
            d.wd_id_category,
            d.lemma
        FROM wd_data d
        LEFT JOIN wd_data_P11038 p ON d.wd_id = p.wd_data_id
    """
    # ---
    params = []
    # ---
    logs = fetch_all(query, params)
    # ---
    return logs


def insert_wd_id(wd_id="", wd_id_category="", lemma=""):
    # ---
    query = """
        INSERT INTO wd_data (wd_id, wd_id_category, lemma)
        VALUES (?, ?, ?)
        ON CONFLICT(wd_id) DO NOTHING
    """
    # ---
    params = (wd_id, wd_id_category, lemma)
    # ---
    result = db_commit(query, params)
    # ---
    if result is not True:
        print(f"Error logging request: {result}")
        if "no such table" in str(result):
            init_db()
    # ---
    return result


def insert_multi_wd_data_P11038(data):
    # ---
    # UNIQUE	wd_data_id, value
    query = """
        INSERT INTO wd_data_P11038 (wd_data_id, value)
            VALUES (?, ?)
        ON CONFLICT(wd_data_id, value) DO NOTHING
    """
    # ---
    data_new = []
    # ---
    for lid, values in data.items():
        for value in values:
            data_new.append({"wd_data_id": lid, "value": value})
    # ---
    print(f"insert_multi_wd_data_P11038: {len(data_new)}")
    # ---
    params = [(
        x['wd_data_id'],
        x['value'],
    ) for x in data_new]
    # ---
    result = db_commit(query, params, many=True)
    # ---
    if result is not True:
        print(f"Error logging request: {result}")
        if "no such table" in str(result):
            init_db()
    # ---
    return result
