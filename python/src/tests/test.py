"""

python3 I:/milion/arlexemes/python/src/tests/test.py sparql


source "$HOME/www/python/venv/bin/activate"
python3 www/python/src/test.py

"""
import sys
from pathlib import Path

path_1 = Path(__file__).parent.parent

sys.path.append(str(path_1))

import test_db
import test_log
import sparql

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
