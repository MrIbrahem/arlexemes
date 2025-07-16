# -*- coding: utf-8 -*-
"""

from .insert import insert_lemma

"""

try:
    from .db import db_commit, init_db
except ImportError:
    from db import db_commit, init_db


def insert_lemma(lemma_id=0, lemma="", pos="", pos_cat="", Lid="", sama_lemma_id=0, sama_lemma=""):
    # ---
    query = """
        INSERT INTO P11038_lemmas (lemma_id, lemma, pos, pos_cat, sama_lemma_id, sama_lemma, Lid)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(lemma_id, lemma) DO UPDATE SET pos = excluded.pos, Lid = excluded.Lid
    """
    # ---
    params = (lemma_id, lemma, pos, pos_cat, sama_lemma_id, sama_lemma, Lid)
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
        INSERT INTO P11038_lemmas (lemma_id, lemma, pos, pos_cat, sama_lemma_id, sama_lemma, Lid)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(lemma_id, lemma) DO UPDATE SET
            pos = excluded.pos,
            pos_cat = excluded.pos_cat,
            sama_lemma_id = excluded.sama_lemma_id,
            sama_lemma = excluded.sama_lemma,
            Lid = excluded.Lid
    """
    # ---
    params = [(x['lemma_id'], x['lemma'], x['pos'], x['pos_cat'], x['sama_lemma_id'], x['sama_lemma'], x['Lid']) for x in data]
    # ---
    result = db_commit(query, params)
    # ---
    if result is not True:
        print(f"Error logging request: {result}")
        if "no such table" in str(result):
            init_db()
    # ---
    return result
