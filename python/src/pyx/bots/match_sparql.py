# -*- coding: utf-8 -*-
"""
from bots.match_sparql import get_wd_not_in_sql
"""
import tqdm

from ..logs_db import get_all
from . import sparql_bot


def in_sql():
    # {'id': 2, 'lemma_id': 0, 'lemma': '', 'pos': '', 'pos_cat': '', 'sama_lemma_id': 0, 'sama_lemma': ''}
    # ---
    result = get_all(table_name="lemmas_p11038")
    # ---
    insql_lemma = {str(x['lemma_id']) : x for x in result}
    # ---
    insql_sama = {str(x['sama_lemma_id']) : x for x in result if x['sama_lemma_id']}
    # ---
    print(f"in_sql: result: {len(result)}, insql_lemma: {len(insql_lemma)}, insql_sama: {len(insql_sama)}")
    # ---
    return insql_lemma, insql_sama


def get_sparql_data():
    print("sparql_bot.start all_arabic_with_P11038..")
    # ---
    # ?lemma ?item ?category ?categoryLabel ?P11038
    result = sparql_bot.all_arabic_with_P11038(10000)
    # ---
    tab_P11038 = {}  # str(x['P11038']) : x for x in result
    # ---
    for x in result:
        item = x.get("item", "")
        P11038 = x.get("P11038", "")
        # ---
        if not item or not P11038:
            continue
        # ---
        x['P11038_list'] = [P11038]
        # ---
        if item not in tab_P11038:
            del x['P11038']
            tab_P11038[x['item']] = x
        else:
            if P11038 not in tab_P11038[item]['P11038_list']:
                tab_P11038[item]['P11038_list'].append(P11038)
    # ---
    print(f"\t sparql_bot: result: {len(result)}, tab_P11038: {len(tab_P11038)}")
    # ---
    return tab_P11038


def get_wd_not_in_sql():
    insql_lemma, insql_sama = in_sql()
    # ---
    tab_P11038 = get_sparql_data()
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
        P11038_list = y.get("P11038_list", [])
        # ---
        for P11038 in P11038_list:
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
    return no_data_tab
