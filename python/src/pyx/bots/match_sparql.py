# -*- coding: utf-8 -*-
"""
from pyx.bots.match_sparql import in_sql, get_wd_not_insql
"""
import tqdm

from ..logs_db import get_all


def in_sql():
    # {'id': 2, 'lemma_id': 0, 'lemma': '', 'pos': '', 'pos_cat': '', 'sama_lemma_id': 0, 'sama_lemma': ''}
    # ---
    result = get_all(table_name="lemmas_p11038")
    # ---
    insql_lemma = {str(x['lemma_id']) : x for x in result if x.get('lemma_id', "")}
    # ---
    insql_sama = {str(x['sama_lemma_id']) : x for x in result if x['sama_lemma_id']}
    # ---
    print(f"in_sql: result: {len(result)}, insql_lemma: {len(insql_lemma)}, insql_sama: {len(insql_sama)}")
    # ---
    return insql_lemma, insql_sama


def get_wd_not_insql(tab_P11038):
    # ---
    if not tab_P11038:
        return []
    # ---
    insql_lemma, insql_sama = in_sql()
    # ---
    no_data_tab = []
    # ---
    has_data_multi = 0
    # ---
    for _x, y in tqdm.tqdm(tab_P11038.items(), total=len(tab_P11038)):
        # ---
        has_data_set = []
        has_data = []
        # ---
        P11038_values = y.get("P11038_values", [])
        # ---
        for P11038 in P11038_values:
            data = insql_lemma.get(P11038) or insql_sama.get(P11038)
            # ---
            if not data:
                continue
            # ---
            has_data.append(data)
            # ---
            if data not in has_data_set:
                has_data_set.append(data)
        # ---
        if not has_data:
            no_data_tab.append(y)
        else:
            if len(has_data_set) > 1:
                # print(f"has_data_set: {len(has_data_set)}")
                has_data_multi += 1
    # ---
    print(f"no_data_tab: {len(no_data_tab)}")
    print(f"has_data_multi: {has_data_multi}")
    # ---
    # sort result by len of P11038_values
    no_data_tab = sorted(no_data_tab, key=lambda x: len(x['P11038_values']), reverse=True)
    # ---
    return no_data_tab
