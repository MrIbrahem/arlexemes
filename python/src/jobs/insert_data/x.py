"""

python I:/milion/arlexemes/python/src/insert_data/x.py

"""
from pathlib import Path
import json

text_path = Path(__file__).parent / "ar-Q13955-P11038-nopos.txt"
text = text_path.read_text(encoding="utf-8")

text_data_1 = [x.split("\t")[0].strip() for x in text.splitlines()]
text_data = [x.strip() for x in text_data_1 if x]
print(f"text_data: {len(text_data)}, text_data_1: {len(text_data_1)}")

Qabas_path = Path(__file__).parent / "Qabas-dataset_with_SAMA.json"
Qabas = json.loads(Qabas_path.read_text(encoding="utf-8"))

lemma_id = [str(x["lemma_id"]) for x in Qabas if x["lemma_id"]]
lemma_id_set = set(lemma_id)
print(f"lemma_id_set: {len(lemma_id_set)}")

sama_lemma_id = [str(x["sama_lemma_id"]) for x in Qabas if x["sama_lemma_id"]]
sama_lemma_id_set = set(sama_lemma_id)
print(f"sama_lemma_id_set: {len(sama_lemma_id_set)}")

print("---------------------")

text_data_in_lemma = [x for x in text_data if x in lemma_id_set]
print(f"text_data_in_lemma: {len(text_data_in_lemma)}")

text_data_in_sama = [x for x in text_data if x in sama_lemma_id_set]
print(f"text_data_in_sama: {len(text_data_in_sama)}")

new_sama = [x for x in text_data if x not in sama_lemma_id_set and x not in lemma_id_set]
print(f"new_sama: {len(new_sama)}")


all_keys = set(text_data_in_lemma + text_data_in_sama + new_sama)
print(f"all_keys: {len(all_keys)}")
