"""

python3 I:/milion/arlexemes/python/src/test.py sparql

"""
import sys

from tests import test_db
from tests import test_log
from tests import sparql

bots = {
    "test_db": test_db,
    "test_log": test_log,
    "sparql": sparql,
}

for arg in sys.argv:
    if arg in bots:
        bots = {arg: bots[arg]}

for bot, module in bots.items():
    print("-----------------------")
    print(f"test: bot: {bot}")
    module.test()
