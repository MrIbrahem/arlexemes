# -*- coding: utf-8 -*-
"""

python3 I:/milion/arlexemes/python/src/jobs/insert_data/insert_all.py

"""
import json
import re
import tqdm
import sys
from pathlib import Path
path_1 = Path(__file__).parent.parent.parent

sys.path.append(str(path_1))

from pyx.logs_db.bot import get_all
from pyx.logs_db.insert import insert_multi_lemmas

json_file = Path(__file__).parent / "Qabas-dataset_with_SAMA.json"
json_file2 = Path(__file__).parent / "Qabas_data_2.json"


def instert_multi(data):
    # ---
    if "no" in sys.argv:
        return
    # ---
    return insert_multi_lemmas(data)


def in_sql():
    # {'id': 2, 'lemma_id': 0, 'lemma': '', 'pos': '', 'pos_cat': '', 'sama_lemma_id': 0, 'sama_lemma': ''}
    # ---
    result = get_all(table_name="lemmas_p11038")
    # ---
    tab = {x.get('lemma_id', "") : x for x in result if x.get('lemma_id', "")}
    # ---
    print(f"len(result): {len(result)}, len(tab): {len(tab)}")
    # ---
    return tab


def get_data():

    json_data = json.load(open(json_file, encoding="utf-8"))
    json_data.extend(json.load(open(json_file2, encoding="utf-8")))
    # ---
    tab = {x.get('lemma_id', "") : x for x in json_data if x.get('lemma_id', "")}
    # ---
    print(f"len(json_data): {len(json_data)}, len(tab): {len(tab)}")
    # ---
    insql = in_sql()
    # ---
    to_add = {lemma_id : y for lemma_id, y in tab.items() if lemma_id not in insql}
    # ---
    # sort to_add by sama_lemma_id
    to_add = {x : y for x, y in sorted(to_add.items(), key=lambda item: (item[1].get('sama_lemma', "") or ""), reverse=True)}
    # ---
    print(f"len to_add: {len(to_add)}")
    # ---
    # not y['sama_lemma'] and y.get('sama_lemma_id', ''): 138
    # no_sama_lemma = {x : y for x, y in to_add.items() if not y['sama_lemma'] and y.get('sama_lemma_id', '')}
    # print(f"len no_sama_lemma: {len(no_sama_lemma)}")
    # ---
    return to_add


def start():
    to_add = get_data()
    # ---
    if "sama" in sys.argv:
        old_len = len(to_add)
        to_add = {x : y for x, y in to_add.items() if y.get('sama_lemma_id') and y.get('sama_lemma')}
        print(f"len to_add with sama: {len(to_add)}, diff: {old_len - len(to_add)}")
    # ---
    lemma_equal_sama = 0
    total_sent = 0
    to_send = []
    # ---
    for n, (x, y) in tqdm.tqdm(enumerate(to_add.items(), start=1), total=len(to_add)):
        # { "lemma_id": 2023254709, "lemma": "سَلَاقِيٌّ", "pos_cat": "اسم", "pos": "اسم", "sama_lemma_id": 390039226, "sama_lemma": "سَلاقِيّ 1" }
        # ---
        # if n == 50: break
        # ---
        sama_lemma = y.get("sama_lemma", "") or ""
        # ---
        if sama_lemma:
            sama_lemma = sama_lemma.strip()
            # remove space and numbers from end
            sama_lemma = re.sub(r'(\s+|\d+)$', '', sama_lemma)
        # ---
        if y.get('lemma', '').strip() == sama_lemma.strip():
            # print(f"lemma.strip() == sama_lemma.strip(): {y.get('lemma', '').strip()} == {sama_lemma.strip()}")
            lemma_equal_sama += 1
        # ---
        params = {
            "lemma_id": y.get('lemma_id', ''),
            "lemma": y.get('lemma', ''),

            "pos_cat": y.get('pos_cat', '') or "",
            "pos": y.get('pos', '') or "",

            "sama_lemma_id": y.get('sama_lemma_id', '') or "",
            "sama_lemma": sama_lemma,
        }
        # ---
        to_send.append(params)
        # ---
        if len(to_send) == 100:
            total_sent += len(to_send)
            # ---
            print(f"Send 100 lemmas, total sent: {total_sent}")
            # ---
            print(f"lemma_equal_sama: {lemma_equal_sama}")
            # ---
            instert_multi(to_send)
            to_send = []
    # ---
    if to_send:
        instert_multi(to_send)
    # ---
    print(f"lemma_equal_sama: {lemma_equal_sama}")
    print(f"total_sent: {total_sent}")


if __name__ == "__main__":
    start()
