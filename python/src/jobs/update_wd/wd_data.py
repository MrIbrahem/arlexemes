# -*- coding: utf-8 -*-
"""

python3 I:/milion/arlexemes/python/src/jobs/update_wd/wd_data.py
python3 www/python/src/jobs/update_wd/wd_data.py

"""
import tqdm
import sys
from pathlib import Path

path_1 = Path(__file__).parent.parent.parent
sys.path.append(str(path_1))

from pyx.sparql_bots.render import render_sparql_P11038_grouped
from pyx.logs_db import wd_data_table

# wd_data_table.count_all()
# wd_data_table.get_all()
# wd_data_table.insert_wd_id(wd_id="", wd_id_category="", lemma="")
# wd_data_table.insert_multi_wd_data_P11038(data=[{"wd_data_id":"wd_data_id", "value":"value"}])


def insert_new_items(in_wd_data, in_db):
    # ---
    in_wd_data_new = {a: b for a, b in in_wd_data.items() if a not in in_db}
    # ---
    for _, y in tqdm.tqdm(in_wd_data_new.items(), desc="in_wd_data_new: "):
        # ?item ?lemma ?category ?categoryLabel
        # ---
        item = y.get("item", "") or ""
        wd_id_category = y.get("categoryLabel", "") or ""
        lemma = y.get("lemma", "") or ""
        # ---
        wd_data_table.insert_wd_id(wd_id=item, wd_id_category=wd_id_category, lemma=lemma)
    # ---
    print(f"in_wd_data_new: {in_wd_data_new}")


def update_wd():
    # ---
    in_db = {z['wd_id'] : z for z in wd_data_table.get_all()}
    # ---
    print(f"in_db: {len(in_db)}")
    # ---
    in_wd_data, exec_time = render_sparql_P11038_grouped()
    # ---
    print(f"in_wd_data: {len(in_wd_data)}")
    # ---
    P11038_data = {}
    P11038_by_id = {}
    # ---
    insert_new_items(in_wd_data, in_db)
    # ---
    for _, y in tqdm.tqdm(in_wd_data.items(), desc="in_wd_data: "):
        # ?item ?lemma ?category ?categoryLabel ?P11038_values
        # ---
        item = y.get("item", "") or ""
        # ---
        P11038_values = y.get("P11038_values", [])
        # ---
        if P11038_values:
            P11038_data.setdefault(item, [])
            P11038_data[item].extend(y.get("P11038_values", []))
        # ---
        for P11038 in y.get("P11038_values", []):
            # ---
            P11038_by_id.setdefault(P11038, [])
            # ---
            P11038_by_id[P11038].append(item)
    # ---
    P11038_data = {h: list(set(o)) for h, o in P11038_data.items()}
    # ---
    dup_P11038_by_id = {e : r for e, r in P11038_by_id.items() if len(r) > 1}
    # ---
    print(f"dup_P11038_by_id: {len(dup_P11038_by_id)}")
    # ---
    wd_data_table.insert_multi_wd_data_P11038(data=P11038_data)


if __name__ == "__main__":
    update_wd()
