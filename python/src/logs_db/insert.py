# -*- coding: utf-8 -*-
"""

from .insert import insert_lemma

"""
from .db import db_commit, init_db
"""
try:
    from .db import db_commit, init_db
except ImportError:
    from db import db_commit, init_db
"""


def insert_lemma(lemma_id=0, lemma="", pos="", pos_cat="", sama_lemma_id=0, sama_lemma="", wd_id="", wd_id_category=""):
    # ---
    query = """
        INSERT INTO P11038_lemmas (lemma_id, lemma, pos, pos_cat, sama_lemma_id, sama_lemma, wd_id, wd_id_category)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(lemma_id, lemma) DO UPDATE SET
            pos = COALESCE(NULLIF(excluded.pos, ''), P11038_lemmas.pos),
            pos_cat = COALESCE(NULLIF(excluded.pos_cat, ''), P11038_lemmas.pos_cat),
            sama_lemma_id = COALESCE(NULLIF(excluded.sama_lemma_id, ''), P11038_lemmas.sama_lemma_id),
            sama_lemma = COALESCE(NULLIF(excluded.sama_lemma, ''), P11038_lemmas.sama_lemma),
            wd_id = COALESCE(NULLIF(excluded.wd_id, ''), P11038_lemmas.wd_id),
            wd_id_category = COALESCE(NULLIF(excluded.wd_id_category, ''), P11038_lemmas.wd_id_category)
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
        INSERT INTO P11038_lemmas (lemma_id, lemma, pos, pos_cat, sama_lemma_id, sama_lemma, wd_id, wd_id_category)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(lemma_id, lemma) DO UPDATE SET
            pos = COALESCE(NULLIF(excluded.pos, ''), P11038_lemmas.pos),
            pos_cat = COALESCE(NULLIF(excluded.pos_cat, ''), P11038_lemmas.pos_cat),
            sama_lemma_id = COALESCE(NULLIF(excluded.sama_lemma_id, ''), P11038_lemmas.sama_lemma_id),
            sama_lemma = COALESCE(NULLIF(excluded.sama_lemma, ''), P11038_lemmas.sama_lemma),
            wd_id = COALESCE(NULLIF(excluded.wd_id, ''), P11038_lemmas.wd_id),
            wd_id_category = COALESCE(NULLIF(excluded.wd_id_category, ''), P11038_lemmas.wd_id_category)
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
    return result


def update_lemma(lemma_id, data):
    # ---
    set_query = []
    params = []
    # ---
    for key, value in data.items():
        if value != "":
            set_query.append(f"{key} = ?")
            params.append(value)
    # ---
    set_query_str = ", ".join(set_query)
    # ---
    query = f"""
        UPDATE P11038_lemmas
        SET {set_query_str}
        WHERE id = ?
    """
    # ---
    params.append(lemma_id)
    # ---
    result = db_commit(query, params)
    # ---
    return result
