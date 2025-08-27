"""

python3 I:/milion/arlexemes/python/src/tests/testx.py

"""
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from pyx.sparql_bots.render import render_duplicate_by_category

data, sparql_exec_time = render_duplicate_by_category(500)

for cat, tab in data.items():
    print("-"*25)
    print(f"{cat=}")
    for lemma, tab2 in tab["lemmas"].items():
        print(f"{lemma=} len: ", len(tab2))

print(sparql_exec_time)
