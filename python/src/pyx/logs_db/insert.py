# -*- coding: utf-8 -*-
"""

from .insert import insert_lemma

"""
from .db_mysql import db_commit, init_db

from . import wd_data_table
# wd_data_table.insert_wd_id(wd_id="", wd_id_category="", lemma="")
# wd_data_table.insert_multi_wd_data_P11038(data=[{"wd_data_id":"wd_data_id", "value":"value"}])


def insert_lemma(lemma_id=0, lemma="", pos="", pos_cat="", sama_lemma_id=0, sama_lemma="", wd_id="", wd_id_category=""):
    # ---
    query = """
        INSERT INTO lemmas_p11038
            (lemma_id, lemma, pos, pos_cat, sama_lemma_id, sama_lemma, wd_id, wd_id_category)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
            pos = COALESCE(NULLIF(VALUES(pos), ''), pos),
            pos_cat = COALESCE(NULLIF(VALUES(pos_cat), ''), pos_cat),
            sama_lemma_id = COALESCE(NULLIF(VALUES(sama_lemma_id), ''), sama_lemma_id),
            sama_lemma = COALESCE(NULLIF(VALUES(sama_lemma), ''), sama_lemma),
            wd_id = COALESCE(NULLIF(VALUES(wd_id), ''), wd_id),
            wd_id_category = COALESCE(NULLIF(VALUES(wd_id_category), ''), wd_id_category)
    """
    # ---
    if lemma.strip() == sama_lemma.strip():
        print(f"lemma.strip() == sama_lemma.strip(): {lemma.strip()} == {sama_lemma.strip()}")
    # ---
    params = (lemma_id, lemma, pos, pos_cat, sama_lemma_id, sama_lemma, wd_id, wd_id_category)
    # ---
    result = db_commit(query, params)
    # ---
    if result is not True:
        print(f"Error logging request: {result}")
        if "no such table" in str(result):
            init_db()
    # ---
    return result


def insert_multi_lemmas(data):
    # ---
    query = """
        INSERT INTO lemmas_p11038
            (lemma_id, lemma, pos, pos_cat, sama_lemma_id, sama_lemma)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
            pos = COALESCE(NULLIF(VALUES(pos), ''), pos),
            pos_cat = COALESCE(NULLIF(VALUES(pos_cat), ''), pos_cat),
            sama_lemma_id = COALESCE(NULLIF(VALUES(sama_lemma_id), ''), sama_lemma_id),
            sama_lemma = COALESCE(NULLIF(VALUES(sama_lemma), ''), sama_lemma)
    """
    # ---
    params = [(
        x['lemma_id'],
        x['lemma'],
        x['pos'],
        x['pos_cat'],
        x['sama_lemma_id'],
        x['sama_lemma'],
        x['wd_id'],
        x['wd_id_category']
    ) for x in data]
    # ---
    result = db_commit(query, params, many=True)
    # ---
    if result is not True:
        print(f"Error logging request: {result}")
        if "no such table" in str(result):
            init_db()
    # ---
    params2 = [
        (x['wd_id'], x['wd_id_category'], x['lemma']) for x in data
    ]
    # ---
    wd_data_table.insert_multi_wd_id(params2)  # (wd_id, wd_id_category, lemma)
    # ---
    # [{"wd_data_id":"wd_data_id", "value":"value"}]
    params3 = [
        {"wd_data_id": x['wd_id'], "value": x['lemma_id']} for x in data
    ]
    # ---
    wd_data_table.insert_multi_wd_data_P11038(data=params3)
    # ---
    return result
