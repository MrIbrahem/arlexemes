# -*- coding: utf-8 -*-
"""

python3 I:/milion/arlexemes/python/src/insert_sparql.py

"""
import json
import re
import tqdm
import sys
from pathlib import Path


from logs_db import get_all, update_lemma
from bots import sparql_bot


def lemma_update(lemma_id, data):
    # ---
    if "no" in sys.argv:
        print("lemma_update:")
        print(lemma_id)
        print(data)
        return
    # ---
    return update_lemma(lemma_id, data)


def in_sql():
    # {'id': 2, 'lemma_id': 0, 'lemma': '', 'pos': '', 'pos_cat': '', 'wd_id': '', 'wd_id_category': '', 'sama_lemma_id': 0, 'sama_lemma': ''}
    # ---
    result = get_all(table_name="p11038_lemmas")
    # ---
    Lid_not_null = {str(x['lemma_id']) : x for x in result if x['wd_id']}
    # ---
    Lid_not_null_sama = {str(x['sama_lemma_id']) : x for x in result if x['wd_id'] and x['sama_lemma_id']}
    # ---
    print(f"in_sql: Lid_not_null: {len(Lid_not_null)}")
    # ---
    insql_lemma = {str(x['lemma_id']) : x for x in result if not x['wd_id']}
    # ---
    insql_sama = {str(x['sama_lemma_id']) : x for x in result if x['sama_lemma_id'] and not x['wd_id']}
    # ---
    print(f"in_sql: result: {len(result)}, insql_lemma: {len(insql_lemma)}, insql_sama: {len(insql_sama)}")
    # ---
    return insql_lemma, insql_sama, Lid_not_null, Lid_not_null_sama


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
            tab_P11038[x['item']] = x
        else:
            if P11038 not in tab_P11038[item]['P11038_list']:
                tab_P11038[item]['P11038_list'].append(P11038)
    # ---
    print(f"\t sparql_bot: result: {len(result)}, tab_P11038: {len(tab_P11038)}")
    # ---
    return tab_P11038


def get_has_data(y, insql_lemma, insql_sama, Lid_not_null, Lid_not_null_sama):
    # { "lemma": "تَحْصِيل", "item": "L1257609", "category": "Q1084", "categoryLabel": "اسم", "P11038": "390024780", "P11038_list": [ "390024780" ] }
    # ---
    has_data_set = []
    has_data = []
    # ---
    P11038_list = y.get("P11038_list", [])
    # ---
    for P11038 in P11038_list:
        data = insql_lemma.get(P11038) or insql_sama.get(P11038) or Lid_not_null.get(P11038) or Lid_not_null_sama.get(P11038)
        # ---
        if not data:
            continue
        # ---
        has_data.append(data)
        # ---
        if data not in has_data_set:
            has_data_set.append(data)
    # ---
    return has_data_set


def is_same_ids(data, P11038_list):
    # ---
    if len(P11038_list) < 2:
        return None
    # ---
    sama_lemma_id = data.get("sama_lemma_id", "")
    lemma_id = data.get("lemma_id", "")
    # ---
    if not sama_lemma_id or not lemma_id:
        return None
    # ---
    same_ids = False
    # ---
    if sama_lemma_id in P11038_list and lemma_id in P11038_list:
        same_ids = True
    # ---
    return same_ids


def start():
    # ---
    insql_lemma, insql_sama, Lid_not_null, Lid_not_null_sama = in_sql()
    # ---
    tab_P11038 = get_sparql_data()
    # ---
    sql_data_wd = {
        x['wd_id'] : [str(x["lemma_id"]), str(x["sama_lemma_id"])] if x.get("sama_lemma_id") else [str(x["lemma_id"])]
        for k, x in Lid_not_null.items() if x.get("wd_id")
    }
    # ---
    print(f"sql_data_wd: {len(sql_data_wd)}")
    # ---
    _tab_P11038 = {
        "L1257609" : {
            "lemma": "تَحْصِيل",
            "item": "L1257609",
            "category": "Q1084",
            "categoryLabel": "اسم",
            "P11038": "390024780",
            "P11038_list": [
                "390024780"
            ]
        }
    }
    # ---
    no_data_tab = []
    wd_ids_done = {}
    # ---
    already_in_sql_data_wd = 0
    in_sql_data_wd_same_p11038 = 0
    in_sql_data_wd_diff_p11038 = {}
    # ---
    with_data = 0
    no_data = 0
    not_same_ids = 0
    with_same_ids = 0
    to_update = 0
    # ---
    for _n, (lid, y) in tqdm.tqdm(enumerate(tab_P11038.items(), start=1), total=len(tab_P11038)):
        # ---
        # if n == 50:
        # if with_data == 50: break
        # ---
        P11038_list = y.get("P11038_list", [])
        # ---
        P11038 = y.get("P11038", "") or ""
        # ---
        if not P11038:
            continue
        # ---
        if lid in sql_data_wd:
            already_in_sql_data_wd += 1
            # ----
            if str(P11038) in sql_data_wd[lid]:
                in_sql_data_wd_same_p11038 += 1
            else:
                in_sql_data_wd_diff_p11038.setdefault(lid, [])
                in_sql_data_wd_diff_p11038[lid].append(P11038)
            # ----
            continue
        # ---
        # data = insql_lemma.get(P11038) or insql_sama.get(P11038)
        data_list = get_has_data(y, insql_lemma, insql_sama, Lid_not_null, Lid_not_null_sama)
        # ---
        if not data_list:
            no_data += 1
            no_data_tab.append(y)
            continue
        # ---
        data = data_list[0]
        # ---
        with_data += 1
        # ---
        same_ids = is_same_ids(data, P11038_list)
        # ---
        if same_ids is True:
            with_same_ids += 1
        # ---
        if same_ids is False:
            not_same_ids += 1
            continue
        # ---
        # ?lemma ?item ?category ?categoryLabel ?P11038
        item = y.get("item", "") or ""
        # ---
        categoryLabel = y.get("categoryLabel", "") or ""
        # ---
        if item in wd_ids_done:
            wd_ids_done[item].append(P11038)
        else:
            wd_ids_done[item] = [P11038]
            # ---
            to_update += 1
            # ---
            print(data)
            # ---
            lemma_update(data['id'], {"wd_id": item, "wd_id_category": categoryLabel})
        # ---
        # ty = "lemma" if insql_lemma.get(P11038) else "sama"
        # print(f"\t\t lemma_update: {data['id']}, wd_id: {item}, ty: {ty}")
        # ---
        # break
    # ---
    wd_ids_done = {str(k) : list(set(v)) for k, v in wd_ids_done.items() if len(list(set(v))) > 1}
    # ---
    print(f"wd_ids_duplicate: {len(wd_ids_done)}")
    # ---
    for k, v in wd_ids_done.items():
        print(f"\t k: {k}, v: {v}")
    # ---
    print(f"no_data: {no_data}")
    print(f"with_data: {with_data}")
    # ---
    print(f"not_same_ids: {not_same_ids}")
    print(f"with_same_ids: {with_same_ids}")
    # ---
    print(f"to_update: {to_update}")
    # ---
    print("--------------------")
    print(f"already_in_sql_data_wd: {already_in_sql_data_wd}")
    print(f"\t with same p11038: {in_sql_data_wd_same_p11038}")
    print(f"\t with diff p11038: {len(in_sql_data_wd_diff_p11038)}")
    # ---
    # if in_sql_data_wd_diff_p11038: print(in_sql_data_wd_diff_p11038)
    # ---
    print("--------------------")
    # ---
    if no_data_tab:
        file = Path(__file__).parent / "no_data_tab.json"
        print(f"no_data_tab: {len(no_data_tab)} to file: {file}")
        with open(file, "w", encoding="utf-8") as f:
            json.dump(no_data_tab, f, ensure_ascii=False, indent=4)


if __name__ == "__main__":
    start()
