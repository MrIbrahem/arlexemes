# -*- coding: utf-8 -*-
"""
python3 I:/milion/arlexemes/python/src/jobs/insert_data/insert_all.py

This script inserts lemma data from JSON files into the database.
"""
import json
import re
import tqdm
import sys
from pathlib import Path
from typing import List, Dict, Any
path_1 = Path(__file__).parent.parent.parent

sys.path.append(str(path_1))

from pyx.logs_db.insert import insert_multi_lemmas
from pyx.bots.match_sparql import in_sql

json_file = Path(__file__).parent / "Qabas-dataset_with_SAMA.json"
json_file2 = Path(__file__).parent / "Qabas_data_2.json"


def insert_batch(data: List[Dict[str, Any]]) -> None:
    """
    Inserts a batch of lemmas into the database.
    Skips insertion if 'no' is in sys.argv.
    """
    if "no" in sys.argv:
        return
    insert_multi_lemmas(data)


def get_data() -> Dict[str, Dict[str, Any]]:
    """
    Loads lemma data from JSON files, filters out existing lemmas,
    and returns a dictionary of new lemmas to be added.
    """
    with open(json_file, "r", encoding="utf-8") as f:
        json_data1 = json.load(f)
    with open(json_file2, "r", encoding="utf-8") as f:
        json_data2 = json.load(f)

    all_lemma_data = json_data1 + json_data2

    lemma_data_map = {
        item.get('lemma_id'): item
        for item in all_lemma_data
        if item.get('lemma_id')
    }
    print(f"Total lemmas from JSON files: {len(all_lemma_data)}, Unique lemma IDs: {len(lemma_data_map)}")

    existing_lemma_ids, _, _ = in_sql()

    new_lemmas_list = [
        data
        for lemma_id, data in lemma_data_map.items()
        if str(lemma_id) not in existing_lemma_ids
    ]

    # Sort by sama_lemma to process lemmas with SAMA data first
    new_lemmas_list.sort(key=lambda item: (item.get('sama_lemma', "") or ""), reverse=True)

    new_lemmas_map = {item.get('lemma_id'): item for item in new_lemmas_list}

    print(f"Found {len(new_lemmas_map)} new lemmas to add.")

    return new_lemmas_map


def start() -> None:
    """
    Main function to process and insert lemma data.
    """
    lemmas_to_add = get_data()
    # ---
    if "sama" in sys.argv:
        original_lemma_count = len(lemmas_to_add)
        lemmas_to_add = {
            lemma_id: lemma_data
            for lemma_id, lemma_data in lemmas_to_add.items()
            if lemma_data.get('sama_lemma_id') and lemma_data.get('sama_lemma')
        }
        print(f"Filtered to lemmas with SAMA data. New count: {len(lemmas_to_add)}, "
              f"diff: {original_lemma_count - len(lemmas_to_add)}")
    # ---
    lemma_sama_match_count = 0
    total_lemmas_sent = 0
    lemma_batch = []
    batch_size = 100
    # ---
    for lemma_id, lemma_data in tqdm.tqdm(lemmas_to_add.items(), total=len(lemmas_to_add)):
        # ---
        sama_lemma = lemma_data.get("sama_lemma", "") or ""
        # ---
        if sama_lemma:
            sama_lemma = sama_lemma.strip()
            # remove space and numbers from end
            sama_lemma = re.sub(r'(\s+|\d+)$', '', sama_lemma)
        # ---
        if lemma_data.get('lemma', '').strip() == sama_lemma.strip():
            lemma_sama_match_count += 1
        # ---
        params = {
            "lemma_id": lemma_data.get('lemma_id', ''),
            "lemma": lemma_data.get('lemma', ''),
            "pos_cat": lemma_data.get('pos_cat', '') or "",
            "pos": lemma_data.get('pos', '') or "",
            "sama_lemma_id": lemma_data.get('sama_lemma_id', '') or "",
            "sama_lemma": sama_lemma,
        }
        # ---
        lemma_batch.append(params)
        # ---
        if len(lemma_batch) == batch_size:
            total_lemmas_sent += len(lemma_batch)
            # ---
            print(f"Sending {batch_size} lemmas, total sent: {total_lemmas_sent}")
            # ---
            print(f"Lemmas with matching SAMA: {lemma_sama_match_count}")
            # ---
            insert_batch(lemma_batch)
            lemma_batch = []
    # ---
    if lemma_batch:
        total_lemmas_sent += len(lemma_batch)
        insert_batch(lemma_batch)
    # ---
    print(f"Final count of lemmas with matching SAMA: {lemma_sama_match_count}")
    print(f"Total lemmas sent to DB: {total_lemmas_sent}")


if __name__ == "__main__":
    start()
