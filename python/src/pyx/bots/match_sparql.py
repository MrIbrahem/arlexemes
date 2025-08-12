# -*- coding: utf-8 -*-
"""
from pyx.bots.match_sparql import in_sql
"""

from ..logs_db.bot import get_all


def in_sql():
    # {'id': 2, 'lemma_id': 0, 'lemma': '', 'pos': '', 'pos_cat': '', 'sama_lemma_id': 0, 'sama_lemma': ''}
    # ---
    result, db_exec_time = get_all(table_name="lemmas_p11038")
    # ---
    insql_lemma = {str(x['lemma_id']) : x for x in result if x.get('lemma_id', "")}
    # ---
    insql_sama = {str(x['sama_lemma_id']) : x for x in result if x['sama_lemma_id']}
    # ---
    print(f"in_sql: result: {len(result)}, insql_lemma: {len(insql_lemma)}, insql_sama: {len(insql_sama)}")
    # ---
    return insql_lemma, insql_sama, db_exec_time
