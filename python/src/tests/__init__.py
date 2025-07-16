# import os
import sys
from pathlib import Path
path1 = Path(__file__).parent.parent

sys.path.append(path1)

'''
HOME = os.getenv("HOME")

if HOME:
    path2 = HOME + "/www/python/bots"
    sys.path.append(str(path2))
else:
    sys.path.append(path1)
'''
