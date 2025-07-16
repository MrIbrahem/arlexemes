# -*- coding: utf-8 -*-
"""
python3 I:/milion/arlexemes/python/src/insert_all.py
"""
import json
import re
import tqdm
from pathlib import Path

from logs_db import get_all, insert_lemma, insert_multi_lemmas

json_file = Path(__file__).parent / "insert_data/Qabas-dataset_with_SAMA.json"


def in_sql():
    # {'id': 2, 'lemma_id': 0, 'lemma': '', 'pos': '', 'pos_cat': '', 'Lid': '', 'sama_lemma_id': 0, 'sama_lemma': ''}
    # ---
    result = get_all(table_name="P11038_lemmas")
    # ---
    tab = {x['lemma_id'] : x for x in result}
    # ---
    print(f"len(result): {len(result)}, len(tab): {len(tab)}")
    # ---
    return tab


def get_data():

    json_data = json.load(open(json_file, encoding="utf-8"))

    tab = {x['lemma_id'] : x for x in json_data}
    # ---
    print(f"len(json_data): {len(json_data)}, len(tab): {len(tab)}")
    # ---
    insql = in_sql()
    # ---
    to_add = {x : y for x, y in tab.items() if x not in insql}
    # ---
    # sort to_add by sama_lemma_id
    to_add = {x : y for x, y in sorted(to_add.items(), key=lambda item: (item[1]['sama_lemma'] or ""), reverse=True)}
    # ---
    print(f"len to_add: {len(to_add)}")
    # ---
    # not y['sama_lemma'] and y['sama_lemma_id']: 138
    # no_sama_lemma = {x : y for x, y in to_add.items() if not y['sama_lemma'] and y['sama_lemma_id']}
    # print(f"len no_sama_lemma: {len(no_sama_lemma)}")
    # ---
    return to_add


def start():
    to_add = get_data()
    # ---
    for n, (x, y) in tqdm.tqdm(enumerate(to_add.items(), start=1), total=len(to_add)):
        # { "lemma_id": 2023254709, "lemma": "سَلَاقِيٌّ", "pos_cat": "اسم", "pos": "اسم", "sama_lemma_id": 390039226, "sama_lemma": "سَلاقِيّ 1" }
        # ---
        if n == 50:
            break
        # ---
        sama_lemma = y.get("sama_lemma", "")
        # ---
        if sama_lemma:
            sama_lemma = sama_lemma.strip()
            # remove space and numbers from end
            sama_lemma = re.sub(r'(\s+|\d+)$', '', sama_lemma)
        # ---
        if not sama_lemma or not y['sama_lemma_id']:
            continue
        # ---
        params = {
            "lemma_id": y['lemma_id'],
            "lemma": y['lemma'],

            "pos_cat": y['pos_cat'] or "",
            "pos": y['pos'] or "",

            "sama_lemma_id": y['sama_lemma_id'] or "",
            "sama_lemma": sama_lemma,

            "Lid": "",
        }
        # ---
        insert_lemma(**params)


if __name__ == "__main__":
    start()
